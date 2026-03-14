"""
Reminder Service - Core business logic for medication reminders
"""
from datetime import datetime, time, timedelta
from app.time_utils import utc_now
from typing import List, Optional, Dict, Any, Tuple
from sqlalchemy.orm import Session
from sqlalchemy import func, and_, or_
import pytz

from app.models.medication import (
    Medication, MedicationSchedule, AdherenceLog, DrugInteraction,
    UserMedicationPreference, FrequencyType, MedicationTiming, AdherenceStatus
)
from app.models.user import User
from app.medication_schemas.medication_schemas import MedicationCreate, MedicationUpdate


class ReminderService:
    """Service for medication reminder management"""
    
    # Default schedule times based on frequency
    DEFAULT_TIMES = {
        FrequencyType.ONCE_DAILY: ["09:00"],
        FrequencyType.TWICE_DAILY: ["08:00", "20:00"],
        FrequencyType.THREE_TIMES_DAILY: ["08:00", "14:00", "20:00"],
        FrequencyType.FOUR_TIMES_DAILY: ["08:00", "12:00", "17:00", "22:00"],
    }
    
    # Timing adjustments
    TIMING_LABELS = {
        MedicationTiming.BEFORE_FOOD: "30 minutes before meals",
        MedicationTiming.WITH_FOOD: "with meals",
        MedicationTiming.AFTER_FOOD: "after meals",
        MedicationTiming.EMPTY_STOMACH: "on an empty stomach",
        MedicationTiming.ANY_TIME: "at any time",
        MedicationTiming.BEDTIME: "before bed"
    }
    
    def __init__(self, db: Session):
        self.db = db
    
    # ============ Medication CRUD ============
    
    def create_medication(
        self,
        user_id: int,
        data: MedicationCreate
    ) -> Medication:
        """Create a new medication with schedules"""
        
        # Create medication record
        medication = Medication(
            user_id=user_id,
            name=data.name,
            generic_name=data.generic_name,
            dosage=data.dosage,
            dosage_unit=data.dosage_unit,
            form=data.form,
            frequency=data.frequency,
            frequency_hours=data.frequency_hours,
            timing=data.timing,
            start_date=data.start_date or utc_now(),
            end_date=data.end_date,
            duration_days=data.duration_days,
            is_ongoing=data.is_ongoing,
            purpose=data.purpose,
            prescribing_doctor=data.prescribing_doctor,
            pharmacy=data.pharmacy,
            quantity=data.quantity,
            refill_reminder_days=data.refill_reminder_days,
            instructions=data.instructions,
            warnings=data.warnings,
            is_critical=data.is_critical,
            requires_food=data.requires_food,
            avoid_alcohol=data.avoid_alcohol
        )
        
        # Calculate end date from duration if provided
        if data.duration_days and not data.end_date:
            medication.end_date = medication.start_date + timedelta(days=data.duration_days)
        
        self.db.add(medication)
        self.db.flush()  # Get the medication ID
        
        # Create schedules
        schedule_times = data.schedule_times or self._calculate_optimal_times(data.frequency, data.timing)
        timezone = data.timezone or "Asia/Kolkata"
        
        for i, time_str in enumerate(schedule_times):
            schedule = self._create_schedule(
                medication_id=medication.id,
                time_str=time_str,
                timezone=timezone,
                label=self._get_time_label(time_str),
                is_critical=data.is_critical
            )
            self.db.add(schedule)
        
        self.db.commit()
        self.db.refresh(medication)
        
        return medication
    
    def get_medication(self, medication_id: int, user_id: int) -> Optional[Medication]:
        """Get a single medication"""
        return self.db.query(Medication).filter(
            Medication.id == medication_id,
            Medication.user_id == user_id
        ).first()
    
    def list_medications(
        self,
        user_id: int,
        active_only: bool = True,
        limit: int = 50,
        offset: int = 0
    ) -> Tuple[List[Medication], int, int]:
        """List user's medications"""
        query = self.db.query(Medication).filter(Medication.user_id == user_id)
        
        if active_only:
            query = query.filter(Medication.is_active == True)
        
        total = query.count()
        active_count = query.filter(Medication.is_active == True).count() if not active_only else total
        
        medications = query.order_by(Medication.created_at.desc()).offset(offset).limit(limit).all()
        
        return medications, total, active_count
    
    def update_medication(
        self,
        medication_id: int,
        user_id: int,
        data: MedicationUpdate
    ) -> Optional[Medication]:
        """Update a medication"""
        medication = self.get_medication(medication_id, user_id)
        if not medication:
            return None
        
        update_data = data.model_dump(exclude_unset=True)
        for field, value in update_data.items():
            setattr(medication, field, value)
        
        medication.updated_at = utc_now()
        self.db.commit()
        self.db.refresh(medication)
        
        return medication
    
    def delete_medication(self, medication_id: int, user_id: int) -> bool:
        """Delete a medication (soft delete by marking inactive)"""
        medication = self.get_medication(medication_id, user_id)
        if not medication:
            return False
        
        medication.is_active = False
        medication.updated_at = utc_now()
        self.db.commit()
        
        return True
    
    def hard_delete_medication(self, medication_id: int, user_id: int) -> bool:
        """Permanently delete a medication"""
        medication = self.get_medication(medication_id, user_id)
        if not medication:
            return False
        
        self.db.delete(medication)
        self.db.commit()
        
        return True
    
    # ============ Adherence Tracking ============
    
    def mark_taken(
        self,
        medication_id: int,
        user_id: int,
        schedule_id: Optional[int] = None,
        taken_at: Optional[datetime] = None,
        notes: Optional[str] = None
    ) -> AdherenceLog:
        """Mark a medication dose as taken"""
        now = taken_at or utc_now()
        
        # Find the scheduled time
        scheduled_datetime = self._find_scheduled_time(medication_id, schedule_id)
        
        # Calculate delay
        delay_minutes = None
        if scheduled_datetime:
            delay = (now - scheduled_datetime).total_seconds() / 60
            delay_minutes = int(delay) if delay > 0 else 0
        
        log = AdherenceLog(
            medication_id=medication_id,
            schedule_id=schedule_id,
            user_id=user_id,
            scheduled_datetime=scheduled_datetime or now,
            actual_datetime=now,
            status=AdherenceStatus.TAKEN,
            delay_minutes=delay_minutes,
            notes=notes
        )
        
        self.db.add(log)
        
        # Update streak
        self._update_streak(user_id)
        
        self.db.commit()
        self.db.refresh(log)
        
        return log
    
    def mark_skipped(
        self,
        medication_id: int,
        user_id: int,
        skip_reason: str,
        schedule_id: Optional[int] = None,
        notes: Optional[str] = None
    ) -> AdherenceLog:
        """Mark a medication dose as skipped"""
        scheduled_datetime = self._find_scheduled_time(medication_id, schedule_id)
        
        log = AdherenceLog(
            medication_id=medication_id,
            schedule_id=schedule_id,
            user_id=user_id,
            scheduled_datetime=scheduled_datetime or utc_now(),
            status=AdherenceStatus.SKIPPED,
            skip_reason=skip_reason,
            notes=notes
        )
        
        self.db.add(log)
        self.db.commit()
        self.db.refresh(log)
        
        return log
    
    def snooze_reminder(
        self,
        medication_id: int,
        schedule_id: int,
        user_id: int,
        snooze_minutes: int = 15
    ) -> Dict[str, Any]:
        """Snooze a reminder"""
        schedule = self.db.query(MedicationSchedule).filter(
            MedicationSchedule.id == schedule_id,
            MedicationSchedule.medication_id == medication_id
        ).first()
        
        if not schedule:
            return {"success": False, "error": "Schedule not found"}
        
        if schedule.snooze_count >= schedule.max_snooze_count:
            return {"success": False, "error": "Maximum snooze limit reached"}
        
        schedule.snooze_count += 1
        
        # Create a snoozed log entry
        log = AdherenceLog(
            medication_id=medication_id,
            schedule_id=schedule_id,
            user_id=user_id,
            scheduled_datetime=utc_now(),
            status=AdherenceStatus.SNOOZED,
            notes=f"Snoozed for {snooze_minutes} minutes"
        )
        
        self.db.add(log)
        self.db.commit()
        
        new_reminder_time = utc_now() + timedelta(minutes=snooze_minutes)
        
        return {
            "success": True,
            "snooze_count": schedule.snooze_count,
            "max_snooze_count": schedule.max_snooze_count,
            "next_reminder": new_reminder_time.isoformat()
        }
    
    def get_adherence_score(
        self,
        user_id: int,
        period_days: int = 30
    ) -> Dict[str, Any]:
        """Calculate adherence analytics"""
        start_date = utc_now() - timedelta(days=period_days)
        
        # Get all logs in period
        logs = self.db.query(AdherenceLog).filter(
            AdherenceLog.user_id == user_id,
            AdherenceLog.created_at >= start_date
        ).all()
        
        total_scheduled = len(logs)
        total_taken = sum(1 for l in logs if l.status == AdherenceStatus.TAKEN)
        total_missed = sum(1 for l in logs if l.status == AdherenceStatus.MISSED)
        total_skipped = sum(1 for l in logs if l.status == AdherenceStatus.SKIPPED)
        
        # Calculate rates
        adherence_rate = (total_taken / total_scheduled * 100) if total_scheduled > 0 else 100.0
        on_time_count = sum(1 for l in logs if l.status == AdherenceStatus.TAKEN and (l.delay_minutes or 0) <= 30)
        on_time_rate = (on_time_count / total_taken * 100) if total_taken > 0 else 100.0
        
        # Get preferences for streak
        prefs = self.db.query(UserMedicationPreference).filter(
            UserMedicationPreference.user_id == user_id
        ).first()
        
        current_streak = (prefs.streak_count or 0) if prefs else 0
        longest_streak = (prefs.longest_streak or 0) if prefs else 0
        
        # By medication analysis
        by_medication = self._get_adherence_by_medication(user_id, start_date)
        
        # Risk assessment
        risk_level, risk_factors, suggestions = self._assess_non_adherence_risk(
            adherence_rate, by_medication, logs
        )
        
        return {
            "user_id": user_id,
            "period_days": period_days,
            "total_scheduled": total_scheduled,
            "total_taken": total_taken,
            "total_missed": total_missed,
            "total_skipped": total_skipped,
            "adherence_rate": round(adherence_rate, 1),
            "on_time_rate": round(on_time_rate, 1),
            "current_streak": current_streak,
            "longest_streak": longest_streak,
            "by_medication": by_medication,
            "non_adherence_risk": risk_level,
            "risk_factors": risk_factors,
            "suggestions": suggestions,
            "best_time_slot": self._find_best_time_slot(logs),
            "worst_time_slot": self._find_worst_time_slot(logs)
        }
    
    # ============ Drug Interactions ============
    
    def check_interactions(
        self,
        user_id: int,
        medication_ids: Optional[List[int]] = None,
        medication_names: Optional[List[str]] = None,
        new_medication: Optional[str] = None
    ) -> Dict[str, Any]:
        """Check for drug interactions"""
        
        # Get medication names to check
        meds_to_check = []
        
        if medication_ids:
            medications = self.db.query(Medication).filter(
                Medication.id.in_(medication_ids),
                Medication.user_id == user_id
            ).all()
            meds_to_check.extend([m.name.lower() for m in medications])
            meds_to_check.extend([m.generic_name.lower() for m in medications if m.generic_name])
        
        if medication_names:
            meds_to_check.extend([n.lower() for n in medication_names])
        
        if new_medication:
            meds_to_check.append(new_medication.lower())
        
        # Remove duplicates
        meds_to_check = list(set(meds_to_check))
        
        # Check interactions
        interactions = []
        for i, drug_a in enumerate(meds_to_check):
            for drug_b in meds_to_check[i+1:]:
                interaction = self._check_interaction_pair(drug_a, drug_b)
                if interaction:
                    interactions.append(interaction)
        
        severe = sum(1 for i in interactions if i["severity"] == "severe")
        moderate = sum(1 for i in interactions if i["severity"] == "moderate")
        mild = sum(1 for i in interactions if i["severity"] == "mild")
        
        recommendation = self._generate_interaction_recommendation(interactions)
        
        return {
            "has_interactions": len(interactions) > 0,
            "interaction_count": len(interactions),
            "medications_checked": meds_to_check,
            "interactions": interactions,
            "severe_count": severe,
            "moderate_count": moderate,
            "mild_count": mild,
            "recommendation": recommendation
        }
    
    def _check_interaction_pair(self, drug_a: str, drug_b: str) -> Optional[Dict[str, Any]]:
        """Check interaction between two drugs"""
        interaction = self.db.query(DrugInteraction).filter(
            or_(
                and_(
                    func.lower(DrugInteraction.drug_a) == drug_a,
                    func.lower(DrugInteraction.drug_b) == drug_b
                ),
                and_(
                    func.lower(DrugInteraction.drug_a) == drug_b,
                    func.lower(DrugInteraction.drug_b) == drug_a
                )
            )
        ).first()
        
        if interaction:
            return {
                "drug_a": drug_a,
                "drug_b": drug_b,
                "severity": interaction.severity,
                "description": interaction.description,
                "recommendation": interaction.recommendation
            }
        
        return None
    
    # ============ Upcoming Reminders ============
    
    def get_upcoming_reminders(
        self,
        user_id: int,
        hours_ahead: int = 24
    ) -> List[Dict[str, Any]]:
        """Get upcoming medication reminders"""
        now = utc_now()
        cutoff = now + timedelta(hours=hours_ahead)
        
        # Get active medications with their schedules
        medications = self.db.query(Medication).filter(
            Medication.user_id == user_id,
            Medication.is_active == True
        ).all()
        
        reminders = []
        
        for med in medications:
            for schedule in med.schedules:
                if not schedule.is_active or not schedule.reminder_enabled:
                    continue
                
                # Calculate next reminder time
                next_time = self._calculate_next_reminder_time(schedule, now)
                
                if next_time and next_time <= cutoff:
                    reminders.append({
                        "medication_id": med.id,
                        "medication_name": med.name,
                        "schedule_id": schedule.id,
                        "scheduled_time": next_time,
                        "dosage": f"{med.dosage} {med.dosage_unit}",
                        "timing": self.TIMING_LABELS.get(med.timing, "any time"),
                        "instructions": med.instructions,
                        "is_critical": med.is_critical
                    })
        
        # Sort by time
        reminders.sort(key=lambda x: x["scheduled_time"])
        
        return reminders
    
    # ============ Helper Methods ============
    
    def _calculate_optimal_times(
        self,
        frequency: FrequencyType,
        timing: MedicationTiming
    ) -> List[str]:
        """Calculate optimal reminder times based on frequency and timing"""
        
        # Get base times for frequency
        base_times = self.DEFAULT_TIMES.get(frequency, ["09:00"])
        
        if frequency == FrequencyType.AS_NEEDED:
            return []  # No scheduled times for as-needed medications
        
        # Adjust based on timing
        if timing == MedicationTiming.BEFORE_FOOD:
            # Set to 30 minutes before typical meal times
            adjusted = []
            for t in base_times:
                hour = int(t.split(":")[0])
                adjusted.append(f"{hour:02d}:30" if hour < 12 else t)
            return adjusted
        
        elif timing == MedicationTiming.BEDTIME:
            return ["22:00"]
        
        elif timing == MedicationTiming.EMPTY_STOMACH:
            # Early morning is best
            if len(base_times) == 1:
                return ["06:00"]
            return base_times
        
        return base_times
    
    def _create_schedule(
        self,
        medication_id: int,
        time_str: str,
        timezone: str,
        label: Optional[str] = None,
        is_critical: bool = False
    ) -> MedicationSchedule:
        """Create a medication schedule"""
        hour, minute = map(int, time_str.split(":"))
        scheduled_time = time(hour=hour, minute=minute)
        
        return MedicationSchedule(
            medication_id=medication_id,
            scheduled_time=scheduled_time,
            timezone=timezone,
            label=label,
            notify_voice_call=is_critical  # Voice calls for critical meds
        )
    
    def _get_time_label(self, time_str: str) -> str:
        """Get a label for a time"""
        hour = int(time_str.split(":")[0])
        
        if 5 <= hour < 12:
            return "Morning"
        elif 12 <= hour < 17:
            return "Afternoon"
        elif 17 <= hour < 21:
            return "Evening"
        else:
            return "Night"
    
    def _find_scheduled_time(
        self,
        medication_id: int,
        schedule_id: Optional[int] = None
    ) -> Optional[datetime]:
        """Find the nearest scheduled time for a medication"""
        now = utc_now()
        
        if schedule_id:
            schedule = self.db.query(MedicationSchedule).filter(
                MedicationSchedule.id == schedule_id
            ).first()
            if schedule:
                return datetime.combine(now.date(), schedule.scheduled_time)
        
        # Find nearest schedule
        schedules = self.db.query(MedicationSchedule).filter(
            MedicationSchedule.medication_id == medication_id,
            MedicationSchedule.is_active == True
        ).all()
        
        if not schedules:
            return None
        
        # Find the closest schedule time to now
        closest = None
        min_diff = float('inf')
        
        for s in schedules:
            scheduled = datetime.combine(now.date(), s.scheduled_time)
            diff = abs((scheduled - now).total_seconds())
            if diff < min_diff:
                min_diff = diff
                closest = scheduled
        
        return closest
    
    def _update_streak(self, user_id: int):
        """Update user's adherence streak"""
        prefs = self.db.query(UserMedicationPreference).filter(
            UserMedicationPreference.user_id == user_id
        ).first()
        
        if not prefs:
            prefs = UserMedicationPreference(user_id=user_id)
            self.db.add(prefs)
        
        prefs.streak_count = (prefs.streak_count or 0) + 1
        prefs.total_doses_taken = (prefs.total_doses_taken or 0) + 1
        prefs.total_doses_scheduled = (prefs.total_doses_scheduled or 0) + 1
        
        if prefs.streak_count > (prefs.longest_streak or 0):
            prefs.longest_streak = prefs.streak_count
    
    def _get_adherence_by_medication(
        self,
        user_id: int,
        start_date: datetime
    ) -> List[Dict[str, Any]]:
        """Get adherence stats by medication"""
        medications = self.db.query(Medication).filter(
            Medication.user_id == user_id,
            Medication.is_active == True
        ).all()
        
        result = []
        for med in medications:
            logs = self.db.query(AdherenceLog).filter(
                AdherenceLog.medication_id == med.id,
                AdherenceLog.created_at >= start_date
            ).all()
            
            total = len(logs)
            taken = sum(1 for l in logs if l.status == AdherenceStatus.TAKEN)
            rate = (taken / total * 100) if total > 0 else 100.0
            
            result.append({
                "medication_id": med.id,
                "medication_name": med.name,
                "total_scheduled": total,
                "total_taken": taken,
                "adherence_rate": round(rate, 1)
            })
        
        return result
    
    def _assess_non_adherence_risk(
        self,
        overall_rate: float,
        by_medication: List[Dict],
        logs: List[AdherenceLog]
    ) -> Tuple[str, List[str], List[str]]:
        """Assess non-adherence risk and generate suggestions"""
        risk_factors = []
        suggestions = []
        
        # Check overall rate
        if overall_rate < 50:
            risk_factors.append("Very low overall adherence rate")
            suggestions.append("Consider setting multiple reminder types (SMS + push)")
        elif overall_rate < 80:
            risk_factors.append("Below optimal adherence rate")
            suggestions.append("Try adjusting reminder times to match your routine")
        
        # Check for consistently missed medications
        for med in by_medication:
            if med["adherence_rate"] < 60:
                risk_factors.append(f"Low adherence for {med['medication_name']}")
                suggestions.append(f"Review if {med['medication_name']} schedule works for you")
        
        # Check for patterns
        missed_times = [l.scheduled_datetime.hour for l in logs if l.status == AdherenceStatus.MISSED]
        if missed_times:
            common_missed_hour = max(set(missed_times), key=missed_times.count)
            risk_factors.append(f"Frequently miss doses around {common_missed_hour}:00")
            suggestions.append(f"Consider rescheduling medications around {common_missed_hour}:00")
        
        # Determine risk level
        if overall_rate >= 80 and len(risk_factors) == 0:
            risk_level = "low"
        elif overall_rate >= 60:
            risk_level = "medium"
        else:
            risk_level = "high"
        
        return risk_level, risk_factors, suggestions
    
    def _find_best_time_slot(self, logs: List[AdherenceLog]) -> Optional[str]:
        """Find time slot with best adherence"""
        if not logs:
            return None
        
        taken_by_hour = {}
        for log in logs:
            if log.status == AdherenceStatus.TAKEN:
                hour = log.scheduled_datetime.hour
                slot = self._get_time_label(f"{hour:02d}:00")
                taken_by_hour[slot] = taken_by_hour.get(slot, 0) + 1
        
        if taken_by_hour:
            return max(taken_by_hour, key=taken_by_hour.get)
        return None
    
    def _find_worst_time_slot(self, logs: List[AdherenceLog]) -> Optional[str]:
        """Find time slot with worst adherence"""
        if not logs:
            return None
        
        missed_by_hour = {}
        for log in logs:
            if log.status == AdherenceStatus.MISSED:
                hour = log.scheduled_datetime.hour
                slot = self._get_time_label(f"{hour:02d}:00")
                missed_by_hour[slot] = missed_by_hour.get(slot, 0) + 1
        
        if missed_by_hour:
            return max(missed_by_hour, key=missed_by_hour.get)
        return None
    
    def _generate_interaction_recommendation(
        self,
        interactions: List[Dict[str, Any]]
    ) -> str:
        """Generate overall recommendation based on interactions"""
        if not interactions:
            return "No drug interactions detected. Your medications appear safe to take together."
        
        severe = any(i["severity"] == "severe" for i in interactions)
        contraindicated = any(i["severity"] == "contraindicated" for i in interactions)
        
        if contraindicated:
            return "âš ï¸ CRITICAL: Some medications should NOT be taken together. Consult your doctor immediately."
        elif severe:
            return "âš ï¸ WARNING: Severe interactions detected. Please consult your healthcare provider before continuing."
        else:
            return "Some interactions found. Review the details and consult your pharmacist if concerned."
    
    def _calculate_next_reminder_time(
        self,
        schedule: MedicationSchedule,
        now: datetime
    ) -> Optional[datetime]:
        """Calculate the next reminder time for a schedule"""
        today = now.date()
        scheduled_datetime = datetime.combine(today, schedule.scheduled_time)
        
        # If time has passed today, check tomorrow
        if scheduled_datetime <= now:
            scheduled_datetime += timedelta(days=1)
        
        # Check if the day is enabled
        day_name = scheduled_datetime.strftime("%A").lower()
        day_enabled = getattr(schedule, day_name, True)
        
        # Find next enabled day
        attempts = 0
        while not day_enabled and attempts < 7:
            scheduled_datetime += timedelta(days=1)
            day_name = scheduled_datetime.strftime("%A").lower()
            day_enabled = getattr(schedule, day_name, True)
            attempts += 1
        
        return scheduled_datetime if day_enabled else None


# Singleton instance
reminder_service = None


def get_reminder_service(db: Session) -> ReminderService:
    """Get or create reminder service instance"""
    return ReminderService(db)




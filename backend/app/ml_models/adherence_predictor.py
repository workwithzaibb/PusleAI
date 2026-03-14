"""
Adherence Predictor - ML model for predicting medication non-adherence risk
Uses historical patterns to identify users at risk of missing doses
"""
from datetime import timedelta
from app.time_utils import utc_now
from typing import List, Dict, Any, Optional, Tuple
from dataclasses import dataclass
import numpy as np
from collections import Counter


@dataclass
class AdherenceFeatures:
    """Features extracted for adherence prediction"""
    # Historical adherence
    adherence_rate_7d: float
    adherence_rate_30d: float
    adherence_rate_all: float
    
    # Patterns
    missed_morning_pct: float
    missed_evening_pct: float
    missed_weekend_pct: float
    
    # Streaks
    current_streak: int
    longest_streak: int
    avg_streak_length: float
    
    # Timing
    avg_delay_minutes: float
    late_dose_pct: float
    
    # Medication complexity
    total_medications: int
    doses_per_day: int
    has_critical_meds: bool
    
    # Recent behavior
    missed_last_3_days: int
    snooze_count_7d: int


class AdherencePredictor:
    """
    Predicts medication non-adherence risk using rule-based scoring
    with optional ML model enhancement.
    
    The predictor uses a weighted scoring system based on:
    - Historical adherence patterns
    - Time-of-day patterns
    - Medication complexity
    - Recent behavior trends
    """
    
    # Feature weights for risk scoring
    WEIGHTS = {
        "adherence_rate": 0.25,
        "recent_trend": 0.20,
        "time_patterns": 0.15,
        "complexity": 0.15,
        "streak": 0.10,
        "timing": 0.10,
        "snooze": 0.05
    }
    
    # Risk thresholds
    LOW_RISK_THRESHOLD = 30
    MEDIUM_RISK_THRESHOLD = 60
    
    def __init__(self):
        self.model = None  # Placeholder for trained ML model
    
    def predict_risk(self, features: AdherenceFeatures) -> Dict[str, Any]:
        """
        Predict non-adherence risk for a user
        
        Returns:
            Dict with risk_score (0-100), risk_level, factors, and suggestions
        """
        scores = self._calculate_component_scores(features)
        total_score = self._weighted_average(scores)
        
        risk_level = self._get_risk_level(total_score)
        risk_factors = self._identify_risk_factors(features, scores)
        suggestions = self._generate_suggestions(features, risk_factors)
        
        return {
            "risk_score": round(total_score, 1),
            "risk_level": risk_level,
            "component_scores": scores,
            "risk_factors": risk_factors,
            "suggestions": suggestions,
            "confidence": self._calculate_confidence(features)
        }
    
    def extract_features(
        self,
        adherence_logs: List[Dict[str, Any]],
        medications: List[Dict[str, Any]],
        preferences: Optional[Dict[str, Any]] = None
    ) -> AdherenceFeatures:
        """Extract features from raw data for prediction"""
        
        now = utc_now()
        
        # Filter logs by time period
        logs_7d = [l for l in adherence_logs if l["created_at"] > now - timedelta(days=7)]
        logs_30d = [l for l in adherence_logs if l["created_at"] > now - timedelta(days=30)]
        
        # Calculate adherence rates
        adherence_7d = self._calc_adherence_rate(logs_7d)
        adherence_30d = self._calc_adherence_rate(logs_30d)
        adherence_all = self._calc_adherence_rate(adherence_logs)
        
        # Time pattern analysis
        missed_morning = self._calc_missed_by_time(adherence_logs, 6, 12)
        missed_evening = self._calc_missed_by_time(adherence_logs, 18, 24)
        missed_weekend = self._calc_missed_weekend(adherence_logs)
        
        # Streak analysis
        streaks = self._analyze_streaks(adherence_logs)
        
        # Timing analysis
        delays = [l.get("delay_minutes", 0) for l in adherence_logs if l.get("status") == "taken"]
        avg_delay = np.mean(delays) if delays else 0
        late_pct = sum(1 for d in delays if d > 30) / len(delays) * 100 if delays else 0
        
        # Medication complexity
        total_meds = len(medications)
        doses_per_day = sum(self._get_daily_doses(m) for m in medications)
        has_critical = any(m.get("is_critical", False) for m in medications)
        
        # Recent behavior
        missed_recent = sum(1 for l in logs_7d[-3:] if l.get("status") == "missed")
        snooze_count = sum(1 for l in logs_7d if l.get("status") == "snoozed")
        
        return AdherenceFeatures(
            adherence_rate_7d=adherence_7d,
            adherence_rate_30d=adherence_30d,
            adherence_rate_all=adherence_all,
            missed_morning_pct=missed_morning,
            missed_evening_pct=missed_evening,
            missed_weekend_pct=missed_weekend,
            current_streak=streaks["current"],
            longest_streak=streaks["longest"],
            avg_streak_length=streaks["average"],
            avg_delay_minutes=avg_delay,
            late_dose_pct=late_pct,
            total_medications=total_meds,
            doses_per_day=doses_per_day,
            has_critical_meds=has_critical,
            missed_last_3_days=missed_recent,
            snooze_count_7d=snooze_count
        )
    
    def _calculate_component_scores(self, features: AdherenceFeatures) -> Dict[str, float]:
        """Calculate individual component risk scores (0-100, higher = more risk)"""
        
        # Adherence rate score (inverted - lower adherence = higher risk)
        adherence_score = 100 - features.adherence_rate_30d
        
        # Recent trend score (comparing 7d to 30d)
        if features.adherence_rate_30d > 0:
            trend_ratio = features.adherence_rate_7d / features.adherence_rate_30d
            trend_score = max(0, min(100, (1 - trend_ratio) * 100 + 50))
        else:
            trend_score = 50
        
        # Time pattern score
        time_pattern_score = (
            features.missed_morning_pct * 0.4 +
            features.missed_evening_pct * 0.4 +
            features.missed_weekend_pct * 0.2
        )
        
        # Complexity score
        complexity_score = min(100, (
            features.total_medications * 10 +
            features.doses_per_day * 5 +
            (30 if features.has_critical_meds else 0)
        ))
        
        # Streak score (inverted - longer streak = lower risk)
        streak_score = max(0, 100 - features.current_streak * 5)
        
        # Timing score
        timing_score = min(100, (
            features.avg_delay_minutes * 0.5 +
            features.late_dose_pct
        ))
        
        # Snooze score
        snooze_score = min(100, features.snooze_count_7d * 15)
        
        return {
            "adherence_rate": adherence_score,
            "recent_trend": trend_score,
            "time_patterns": time_pattern_score,
            "complexity": complexity_score,
            "streak": streak_score,
            "timing": timing_score,
            "snooze": snooze_score
        }
    
    def _weighted_average(self, scores: Dict[str, float]) -> float:
        """Calculate weighted average of component scores"""
        total = sum(scores[k] * self.WEIGHTS[k] for k in scores)
        return total
    
    def _get_risk_level(self, score: float) -> str:
        """Determine risk level from score"""
        if score < self.LOW_RISK_THRESHOLD:
            return "low"
        elif score < self.MEDIUM_RISK_THRESHOLD:
            return "medium"
        else:
            return "high"
    
    def _identify_risk_factors(
        self,
        features: AdherenceFeatures,
        scores: Dict[str, float]
    ) -> List[str]:
        """Identify specific risk factors"""
        factors = []
        
        if features.adherence_rate_7d < 70:
            factors.append("Low adherence rate in the past week")
        
        if features.adherence_rate_7d < features.adherence_rate_30d - 10:
            factors.append("Declining adherence trend")
        
        if features.missed_morning_pct > 30:
            factors.append("Frequently missing morning doses")
        
        if features.missed_evening_pct > 30:
            factors.append("Frequently missing evening doses")
        
        if features.missed_weekend_pct > 40:
            factors.append("Weekend adherence drops significantly")
        
        if features.avg_delay_minutes > 60:
            factors.append("Often takes medication late")
        
        if features.doses_per_day > 6:
            factors.append("Complex medication regimen")
        
        if features.snooze_count_7d > 5:
            factors.append("Frequently snoozes reminders")
        
        if features.missed_last_3_days >= 2:
            factors.append("Multiple missed doses in last 3 days")
        
        if features.current_streak == 0 and features.longest_streak > 7:
            factors.append("Lost a good adherence streak")
        
        return factors
    
    def _generate_suggestions(
        self,
        features: AdherenceFeatures,
        risk_factors: List[str]
    ) -> List[str]:
        """Generate personalized suggestions based on risk factors"""
        suggestions = []
        
        # Adherence suggestions
        if features.adherence_rate_7d < 70:
            suggestions.append("Set up multiple reminder types (SMS + push notification)")
            suggestions.append("Consider enabling caregiver notifications")
        
        # Time-based suggestions
        if features.missed_morning_pct > 30:
            suggestions.append("Try linking morning medication to breakfast routine")
            suggestions.append("Set reminder 30 minutes before usual wake time")
        
        if features.missed_evening_pct > 30:
            suggestions.append("Associate evening medication with dinner or bedtime")
            suggestions.append("Keep medications visible near your toothbrush")
        
        if features.missed_weekend_pct > 40:
            suggestions.append("Set additional weekend reminders")
            suggestions.append("Create a weekend medication routine")
        
        # Complexity suggestions
        if features.doses_per_day > 6:
            suggestions.append("Ask your doctor about consolidating medications")
            suggestions.append("Use a pill organizer with day/time compartments")
        
        # Timing suggestions
        if features.avg_delay_minutes > 60:
            suggestions.append("Adjust reminder times to better match your schedule")
        
        # Snooze suggestions
        if features.snooze_count_7d > 5:
            suggestions.append("Reduce snooze time to build better habits")
            suggestions.append("Set reminders when you're typically available")
        
        # Streak motivation
        if features.current_streak < 3 and features.longest_streak > 7:
            suggestions.append(f"You had a {features.longest_streak}-day streak before! You can do it again")
        
        # Limit suggestions
        return suggestions[:5]
    
    def _calculate_confidence(self, features: AdherenceFeatures) -> str:
        """Calculate prediction confidence based on data availability"""
        # More historical data = higher confidence
        if features.adherence_rate_all > 0:
            return "high"
        elif features.adherence_rate_30d > 0:
            return "medium"
        else:
            return "low"
    
    # Helper methods
    
    def _calc_adherence_rate(self, logs: List[Dict[str, Any]]) -> float:
        """Calculate adherence rate from logs"""
        if not logs:
            return 100.0
        taken = sum(1 for l in logs if l.get("status") == "taken")
        return (taken / len(logs)) * 100
    
    def _calc_missed_by_time(
        self,
        logs: List[Dict[str, Any]],
        start_hour: int,
        end_hour: int
    ) -> float:
        """Calculate percentage of missed doses in time range"""
        in_range = [l for l in logs if start_hour <= l.get("scheduled_datetime", utc_now()).hour < end_hour]
        if not in_range:
            return 0.0
        missed = sum(1 for l in in_range if l.get("status") == "missed")
        return (missed / len(in_range)) * 100
    
    def _calc_missed_weekend(self, logs: List[Dict[str, Any]]) -> float:
        """Calculate percentage of missed doses on weekends"""
        weekend_logs = [l for l in logs if l.get("scheduled_datetime", utc_now()).weekday() >= 5]
        if not weekend_logs:
            return 0.0
        missed = sum(1 for l in weekend_logs if l.get("status") == "missed")
        return (missed / len(weekend_logs)) * 100
    
    def _analyze_streaks(self, logs: List[Dict[str, Any]]) -> Dict[str, Any]:
        """Analyze adherence streaks"""
        if not logs:
            return {"current": 0, "longest": 0, "average": 0}
        
        # Sort by date
        sorted_logs = sorted(logs, key=lambda x: x.get("scheduled_datetime", utc_now()))
        
        streaks = []
        current = 0
        
        for log in sorted_logs:
            if log.get("status") == "taken":
                current += 1
            else:
                if current > 0:
                    streaks.append(current)
                current = 0
        
        if current > 0:
            streaks.append(current)
        
        return {
            "current": current,
            "longest": max(streaks) if streaks else 0,
            "average": np.mean(streaks) if streaks else 0
        }
    
    def _get_daily_doses(self, medication: Dict[str, Any]) -> int:
        """Get number of daily doses for a medication"""
        frequency = medication.get("frequency", "once_daily")
        
        freq_map = {
            "once_daily": 1,
            "twice_daily": 2,
            "three_times_daily": 3,
            "four_times_daily": 4,
            "every_x_hours": 24 // medication.get("frequency_hours", 8),
            "as_needed": 0,
            "weekly": 0.14,
            "custom": 1
        }
        
        return freq_map.get(frequency, 1)


# Singleton instance
adherence_predictor = AdherencePredictor()




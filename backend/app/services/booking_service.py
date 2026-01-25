"""
Booking Service
Handles appointment scheduling, slot generation, and conflict validation.
"""
from sqlalchemy.orm import Session
from datetime import datetime, date, timedelta, time
from typing import List, Optional

from app.models.doctor import Appointment, DoctorProfile, Availability, AppointmentStatus
from app.doctor_schemas.doctor_schemas import AppointmentBookRequest, TimeSlot, DayAvailability


class BookingService:
    def __init__(self, db: Session):
        self.db = db
        self.slot_duration = 30 # minutes

    def get_available_slots(self, doctor_id: int, start_date: date, days: int = 7) -> List[DayAvailability]:
        """Generate available slots for the next N days based on availability rules"""
        result = []
        
        # Get doctor's availability rules
        availabilities = self.db.query(Availability).filter(Availability.doctor_id == doctor_id).all()
        recurring_rules = {a.day_of_week: [] for a in availabilities if a.day_of_week is not None}
        for a in availabilities:
            if a.day_of_week is not None:
                recurring_rules[a.day_of_week].append(a)
        
        # Get existing appointments to check conflicts
        end_date = start_date + timedelta(days=days)
        existing_appts = self.db.query(Appointment).filter(
            Appointment.doctor_id == doctor_id,
            Appointment.appointment_date >= start_date,
            Appointment.appointment_date < end_date,
            Appointment.status.in_([AppointmentStatus.PENDING, AppointmentStatus.CONFIRMED])
        ).all()
        
        # Map existing appts by date+time
        booked_slots = set()
        for appt in existing_appts:
            booked_slots.add((appt.appointment_date, appt.start_time))

        # Generate slots day by day
        for i in range(days):
            current_date = start_date + timedelta(days=i)
            day_of_week = current_date.weekday() # 0=Monday
            
            day_slots = []
            
            # Check if there are rules for this day
            if day_of_week in recurring_rules:
                for rule in recurring_rules[day_of_week]:
                    # Generate 30 min chunks from rule.start to rule.end
                    current_time = datetime.combine(current_date, rule.start_time)
                    end_time = datetime.combine(current_date, rule.end_time)
                    
                    while current_time + timedelta(minutes=self.slot_duration) <= end_time:
                        slot_start = current_time.time()
                        slot_end = (current_time + timedelta(minutes=self.slot_duration)).time()
                        
                        is_booked = (current_date, slot_start) in booked_slots
                        
                        day_slots.append(TimeSlot(
                            start_time=slot_start.strftime("%H:%M"),
                            end_time=slot_end.strftime("%H:%M"),
                            is_available=not is_booked
                        ))
                        
                        current_time += timedelta(minutes=self.slot_duration)
            
            result.append(DayAvailability(
                date=current_date,
                day_of_week=current_date.strftime("%A"),
                slots=day_slots
            ))
            
        return result

    def book_appointment(self, patient_id: int, data: AppointmentBookRequest) -> Appointment:
        """Book an appointment provided the slot is free"""
        # Validate slot
        start_time_obj = datetime.strptime(data.start_time, "%H:%M").time()
        end_time_obj = (datetime.combine(date.today(), start_time_obj) + timedelta(minutes=self.slot_duration)).time()
        
        # Check conflict
        conflict = self.db.query(Appointment).filter(
            Appointment.doctor_id == data.doctor_id,
            Appointment.appointment_date == data.appointment_date,
            Appointment.start_time == start_time_obj,
            Appointment.status.in_([AppointmentStatus.PENDING, AppointmentStatus.CONFIRMED])
        ).first()
        
        if conflict:
            raise ValueError("Slot already booked")
            
        appt = Appointment(
            patient_id=patient_id,
            doctor_id=data.doctor_id,
            appointment_date=data.appointment_date,
            start_time=start_time_obj,
            end_time=end_time_obj,
            status=AppointmentStatus.PENDING,  # Default to confirmed for demo simplicity? No, pending.
            reason=data.reason,
            symptoms=data.symptoms,
            meeting_link=f"https://meet.jit.si/pulseai-{data.doctor_id}-{patient_id}-{data.appointment_date}" # Auto-generate unique link
        )
        self.db.add(appt)
        self.db.commit()
        self.db.refresh(appt)
        return appt

    def update_status(self, appointment_id: int, status: AppointmentStatus) -> Appointment:
        appt = self.db.query(Appointment).filter(Appointment.id == appointment_id).first()
        if appt:
            appt.status = status
            self.db.commit()
            self.db.refresh(appt)
        return appt

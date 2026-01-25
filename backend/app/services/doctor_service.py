"""
Doctor Service
Handles profile management and searching.
"""
from sqlalchemy.orm import Session
from sqlalchemy import or_
from typing import List, Optional

from app.models.doctor import DoctorProfile, Availability
from app.models.user import User, UserRole
from app.doctor_schemas.doctor_schemas import DoctorProfileCreate, DoctorProfileUpdate, AvailabilityCreate
from datetime import datetime, time

class DoctorService:
    def __init__(self, db: Session):
        self.db = db

    def get_profile(self, user_id: int) -> Optional[DoctorProfile]:
        """Get doctor profile by user ID"""
        return self.db.query(DoctorProfile).filter(DoctorProfile.user_id == user_id).first()

    def create_profile(self, user_id: int, data: DoctorProfileCreate) -> DoctorProfile:
        """Create a new doctor profile"""
        # Ensure user role is updated to DOCTOR
        user = self.db.query(User).filter(User.id == user_id).first()
        if user and user.role != UserRole.DOCTOR:
            user.role = UserRole.DOCTOR
            self.db.add(user)
        
        profile = DoctorProfile(
            user_id=user_id,
            specialty=data.specialty,
            license_number=data.license_number,
            bio=data.bio,
            experience_years=data.experience_years,
            consultation_fee=data.consultation_fee,
            currency=data.currency,
            languages=data.languages,
            clinic_name=data.clinic_name,
            clinic_address=data.clinic_address,
            clinic_phone=data.clinic_phone
        )
        self.db.add(profile)
        self.db.commit()
        self.db.refresh(profile)
        return profile

    def update_profile(self, user_id: int, data: DoctorProfileUpdate) -> DoctorProfile:
        """Update existing doctor profile"""
        profile = self.get_profile(user_id)
        if not profile:
            return None
            
        for key, value in data.dict(exclude_unset=True).items():
            setattr(profile, key, value)
            
        self.db.commit()
        self.db.refresh(profile)
        return profile

    def search_doctors(self, query: str = None, specialty: str = None) -> List[DoctorProfile]:
        """Search doctors by name, specialty, or bio"""
        q = self.db.query(DoctorProfile).join(User)
        
        if specialty:
            q = q.filter(DoctorProfile.specialty.ilike(f"%{specialty}%"))
            
        if query:
            search = f"%{query}%"
            q = q.filter(or_(
                User.full_name.ilike(search),
                DoctorProfile.bio.ilike(search),
                DoctorProfile.clinic_name.ilike(search)
            ))
            
        return q.all()

    def set_availability(self, doctor_id: int, slots: List[AvailabilityCreate]):
        """Set availability slots for a doctor"""
        # Clear existing availability (simple implementation: replace all)
        self.db.query(Availability).filter(Availability.doctor_id == doctor_id).delete()
        
        for slot in slots:
            start = datetime.strptime(slot.start_time, "%H:%M").time()
            end = datetime.strptime(slot.end_time, "%H:%M").time()
            
            avail = Availability(
                doctor_id=doctor_id,
                day_of_week=slot.day_of_week,
                specific_date=slot.specific_date,
                start_time=start,
                end_time=end,
                is_available=True
            )
            self.db.add(avail)
            
        self.db.commit()

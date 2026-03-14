"""
Doctor Module Models
Handles doctor profiles, availability, appointments, and prescriptions.
"""
from sqlalchemy import Column, Integer, String, Text, DateTime, ForeignKey, Boolean, Float, Enum, JSON, Time, Date
from sqlalchemy.orm import relationship
from app.time_utils import utc_now
import enum

from app.base import Base


class AppointmentStatus(str, enum.Enum):
    PENDING = "pending"
    CONFIRMED = "confirmed"
    COMPLETED = "completed"
    CANCELLED = "cancelled"
    NO_SHOW = "no_show"


class DoctorProfile(Base):
    __tablename__ = "doctor_profiles"
    
    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False, unique=True, index=True)
    
    specialty = Column(String(100), nullable=False)  # e.g., Cardiologist, General Physician
    license_number = Column(String(50), nullable=False, unique=True)
    bio = Column(Text, nullable=True)
    experience_years = Column(Integer, default=0)
    consultation_fee = Column(Float, default=0.0)
    currency = Column(String(10), default="USD")
    languages = Column(JSON, default=list)  # ["English", "Hindi"]
    
    # Clinic Info
    clinic_name = Column(String(200), nullable=True)
    clinic_address = Column(Text, nullable=True)
    clinic_phone = Column(String(20), nullable=True)
    
    # Ratings
    rating_average = Column(Float, default=0.0)
    rating_count = Column(Integer, default=0)
    
    is_verified = Column(Boolean, default=False)
    created_at = Column(DateTime, default=utc_now)
    
    user = relationship("User", backref="doctor_profile")


class Availability(Base):
    """
    Defines working hours for a doctor.
    Can be recurring (weekly) or specific dates overridden.
    """
    __tablename__ = "doctor_availability"
    
    id = Column(Integer, primary_key=True, index=True)
    doctor_id = Column(Integer, ForeignKey("doctor_profiles.id"), nullable=False, index=True)
    
    day_of_week = Column(Integer, nullable=True)  # 0=Monday, 6=Sunday (for recurring)
    specific_date = Column(Date, nullable=True)   # For specific date overrides
    
    start_time = Column(Time, nullable=False)
    end_time = Column(Time, nullable=False)
    
    is_available = Column(Boolean, default=True)
    
    doctor = relationship("DoctorProfile", backref="availabilities")


class Appointment(Base):
    __tablename__ = "appointments"
    
    id = Column(Integer, primary_key=True, index=True)
    patient_id = Column(Integer, ForeignKey("users.id"), nullable=False, index=True)
    doctor_id = Column(Integer, ForeignKey("doctor_profiles.id"), nullable=False, index=True)
    
    appointment_date = Column(Date, nullable=False)
    start_time = Column(Time, nullable=False)
    end_time = Column(Time, nullable=False)
    
    status = Column(Enum(AppointmentStatus), default=AppointmentStatus.PENDING)
    reason = Column(Text, nullable=True)
    symptoms = Column(JSON, nullable=True)  # List of symptoms from AI check
    notes = Column(Text, nullable=True)     # Internal notes by doctor
    meeting_link = Column(String(500), nullable=True) # Video call link
    
    created_at = Column(DateTime, default=utc_now)
    updated_at = Column(DateTime, default=utc_now, onupdate=utc_now)
    
    patient = relationship("User", foreign_keys=[patient_id], backref="appointments")
    doctor = relationship("DoctorProfile", backref="appointments")


class Prescription(Base):
    __tablename__ = "prescriptions"
    
    id = Column(Integer, primary_key=True, index=True)
    appointment_id = Column(Integer, ForeignKey("appointments.id"), nullable=False, index=True)
    patient_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    doctor_id = Column(Integer, ForeignKey("doctor_profiles.id"), nullable=False)
    
    diagnosis = Column(Text, nullable=False)
    medications = Column(JSON, nullable=False)  # List of meds: [{name, dosage, freq}]
    instructions = Column(Text, nullable=True)
    
    issued_date = Column(DateTime, default=utc_now)
    
    appointment = relationship("Appointment", backref="prescription")




"""
Doctor Appointment Schemas
"""
from pydantic import BaseModel, Field
from typing import List, Optional
from datetime import datetime, date, time
from enum import Enum


class AppointmentStatus(str, Enum):
    PENDING = "pending"
    CONFIRMED = "confirmed"
    COMPLETED = "completed"
    CANCELLED = "cancelled"
    NO_SHOW = "no_show"


# ============ Doctor Profile Schemas ============

class DoctorProfileBase(BaseModel):
    specialty: str = Field(..., min_length=2)
    license_number: str = Field(..., min_length=2)
    bio: Optional[str] = None
    experience_years: int = 0
    consultation_fee: float = 0.0
    currency: str = "USD"
    languages: List[str] = []
    clinic_name: Optional[str] = None
    clinic_address: Optional[str] = None
    clinic_phone: Optional[str] = None


class DoctorProfileCreate(DoctorProfileBase):
    pass


class DoctorProfileUpdate(BaseModel):
    specialty: Optional[str] = None
    bio: Optional[str] = None
    experience_years: Optional[int] = None
    consultation_fee: Optional[float] = None
    languages: Optional[List[str]] = None
    clinic_name: Optional[str] = None
    clinic_address: Optional[str] = None
    clinic_phone: Optional[str] = None


class DoctorProfileResponse(DoctorProfileBase):
    id: int
    user_id: int
    full_name: str
    is_verified: bool
    rating_average: float
    rating_count: int
    
    class Config:
        from_attributes = True


# ============ Availability Schemas ============

class AvailabilityCreate(BaseModel):
    day_of_week: Optional[int] = Field(None, ge=0, le=6, description="0=Monday, 6=Sunday")
    specific_date: Optional[date] = None
    start_time: str = Field(..., description="HH:MM format") # Input as string for easier parsing
    end_time: str = Field(..., description="HH:MM format")


class TimeSlot(BaseModel):
    start_time: str
    end_time: str
    is_available: bool


class DayAvailability(BaseModel):
    date: date
    day_of_week: str
    slots: List[TimeSlot]


# ============ Appointment Schemas ============

class AppointmentBookRequest(BaseModel):
    doctor_id: int
    appointment_date: date
    start_time: str  # HH:MM
    reason: Optional[str] = None
    symptoms: Optional[List[str]] = []


class AppointmentResponse(BaseModel):
    id: int
    doctor_id: int
    doctor_name: str
    patient_id: int
    patient_name: str
    appointment_date: date
    start_time: time
    end_time: time
    status: AppointmentStatus
    meeting_link: Optional[str]
    reason: Optional[str]
    
    class Config:
        from_attributes = True


# ============ Prescription Schemas ============

class MedicationItem(BaseModel):
    metric: str # Tablet, Syrup etc
    name: str
    dosage: str
    frequency: str
    duration: str


class PrescriptionCreate(BaseModel):
    appointment_id: int
    diagnosis: str
    medications: List[MedicationItem]
    instructions: Optional[str] = None


class PrescriptionResponse(BaseModel):
    id: int
    appointment_id: int
    doctor_name: str
    patient_name: str
    diagnosis: str
    medications: List[MedicationItem]
    instructions: Optional[str]
    issued_date: datetime

    class Config:
        from_attributes = True

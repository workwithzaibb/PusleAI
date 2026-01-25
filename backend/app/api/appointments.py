"""
Appointments API Router
Handles Booking, Rescheduling, and Cancellation.
"""
from fastapi import APIRouter, Depends, HTTPException, status, Query
from sqlalchemy.orm import Session
from typing import List, Optional
from datetime import date

from app.database import get_db
from app.models.user import User, UserRole
from app.models.doctor import AppointmentStatus, DoctorProfile
from app.api.auth import get_current_user
from app.services.booking_service import BookingService
from app.services.doctor_service import DoctorService
from app.doctor_schemas.doctor_schemas import (
    AppointmentBookRequest,
    AppointmentResponse,
    DayAvailability
)


router = APIRouter()


def get_booking_service(db: Session = Depends(get_db)):
    return BookingService(db)


@router.get("/slots/{doctor_id}", response_model=List[DayAvailability])
async def get_slots(
    doctor_id: int,
    start_date: date = Query(default_factory=date.today),
    days: int = 7,
    db: Session = Depends(get_db),
    service: BookingService = Depends(get_booking_service)
):
    """Get available appointment slots for a doctor"""
    return service.get_available_slots(doctor_id, start_date, days)


@router.post("/book", response_model=AppointmentResponse)
async def book_appointment(
    data: AppointmentBookRequest,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
    service: BookingService = Depends(get_booking_service)
):
    """Book a new appointment slot"""
    try:
        appt = service.book_appointment(current_user.id, data)
        
        # Enrich for response
        doctor = db.query(DoctorProfile).filter(DoctorProfile.id == appt.doctor_id).first()
        appt.doctor_name = doctor.user.full_name if doctor else "Unknown"
        appt.patient_name = current_user.full_name
        
        return appt
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))


@router.get("/my-appointments", response_model=List[AppointmentResponse])
async def list_my_appointments(
    role: Optional[str] = "patient", # "patient" or "doctor"
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """List appointments for the current user (as patient or doctor)"""
    from app.models.doctor import Appointment
    
    q = db.query(Appointment)
    
    if role == "doctor":
        # Ensure user is actually a doctor
        profile = db.query(DoctorProfile).filter(DoctorProfile.user_id == current_user.id).first()
        if not profile:
            raise HTTPException(status_code=403, detail="User is not a doctor")
        q = q.filter(Appointment.doctor_id == profile.id)
    else:
        q = q.filter(Appointment.patient_id == current_user.id)
        
    appts = q.order_by(Appointment.appointment_date.desc()).all()
    
    # Enrich details
    result = []
    for a in appts:
        a.doctor_name = a.doctor.user.full_name if a.doctor else "Unknown"
        a.patient_name = a.patient.full_name if a.patient else "Unknown"
        result.append(a)
        
    return result


@router.post("/{appointment_id}/cancel")
async def cancel_appointment(
    appointment_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
    service: BookingService = Depends(get_booking_service)
):
    """Cancel an appointment"""
    from app.models.doctor import Appointment
    
    appt = db.query(Appointment).filter(Appointment.id == appointment_id).first()
    if not appt:
        raise HTTPException(status_code=404, detail="Appointment not found")
        
    # Permission check: Only patient or doctor can cancel
    is_doctor = False
    if appt.patient_id != current_user.id:
        profile = db.query(DoctorProfile).filter(DoctorProfile.user_id == current_user.id).first()
        if not profile or profile.id != appt.doctor_id:
            raise HTTPException(status_code=403, detail="Not authorized to cancel this appointment")
            
    service.update_status(appointment_id, AppointmentStatus.CANCELLED)
    return {"message": "Appointment cancelled successfully"}

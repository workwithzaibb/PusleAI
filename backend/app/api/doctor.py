"""
Doctor API Router
Handles doctor profile management and search.
"""
from fastapi import APIRouter, Depends, HTTPException, status, Query
from sqlalchemy.orm import Session
from typing import List, Optional

from app.database import get_db
from app.models.user import User, UserRole
from app.api.auth import get_current_user
from app.services.doctor_service import DoctorService
from app.doctor_schemas.doctor_schemas import (
    DoctorProfileCreate,
    DoctorProfileUpdate,
    DoctorProfileResponse,
    AvailabilityCreate
)


router = APIRouter()


def get_doctor_service(db: Session = Depends(get_db)):
    return DoctorService(db)


@router.post("/profile", response_model=DoctorProfileResponse)
async def create_doctor_profile(
    data: DoctorProfileCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
    service: DoctorService = Depends(get_doctor_service)
):
    """
    Create a doctor profile. 
    This action upgrades the current user to DOCTOR role.
    """
    # Check if profile already exists
    existing = service.get_profile(current_user.id)
    if existing:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Profile already exists. Use PUT to update."
        )
        
    return service.create_profile(current_user.id, data)


@router.put("/profile", response_model=DoctorProfileResponse)
async def update_doctor_profile(
    data: DoctorProfileUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
    service: DoctorService = Depends(get_doctor_service)
):
    """Update doctor profile details"""
    profile = service.update_profile(current_user.id, data)
    if not profile:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Doctor profile not found"
        )
    return profile


@router.get("/me", response_model=DoctorProfileResponse)
async def get_my_profile(
    current_user: User = Depends(get_current_user),
    service: DoctorService = Depends(get_doctor_service)
):
    """Get current logged-in doctor's profile"""
    profile = service.get_profile(current_user.id)
    if not profile:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Doctor profile not found"
        )
    return profile


@router.get("/search", response_model=List[DoctorProfileResponse])
async def search_doctors(
    query: Optional[str] = None,
    specialty: Optional[str] = None,
    db: Session = Depends(get_db),
    service: DoctorService = Depends(get_doctor_service)
):
    """
    Search for doctors by name, bio, or clinic.
    Filter by specialty.
    """
    profiles = service.search_doctors(query, specialty)
    # Enrich with basic user info
    result = []
    for p in profiles:
        # Pydantic model will grab fields from relationship if configured
        p.full_name = p.user.full_name
        result.append(p)
    return result


@router.post("/availability")
async def set_availability(
    slots: List[AvailabilityCreate],
    current_user: User = Depends(get_current_user),
    service: DoctorService = Depends(get_doctor_service)
):
    """Set doctor availability hours"""
    profile = service.get_profile(current_user.id)
    if not profile:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Only doctors can set availability"
        )
    
    service.set_availability(profile.id, slots)
    return {"message": "Availability updated successfully"}

"""
Users Router - User profile management
"""
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List

from app.database import get_db
from app.models.user import User
from app.schemas import UserResponse, UserUpdate
from app.api.auth import get_current_user

router = APIRouter()


@router.get("/profile", response_model=UserResponse)
async def get_profile(current_user: User = Depends(get_current_user)):
    """Get current user's profile"""
    return UserResponse.model_validate(current_user)


@router.put("/profile", response_model=UserResponse)
async def update_profile(
    user_update: UserUpdate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Update user profile"""
    update_data = user_update.model_dump(exclude_unset=True)
    
    for field, value in update_data.items():
        setattr(current_user, field, value)
    
    db.commit()
    db.refresh(current_user)
    
    return UserResponse.model_validate(current_user)


@router.get("/languages")
async def get_supported_languages():
    """Get list of supported languages"""
    return {
        "languages": [
            {"code": "en", "name": "English", "native_name": "English"},
            {"code": "hi", "name": "Hindi", "native_name": "हिंदी"},
            {"code": "ta", "name": "Tamil", "native_name": "தமிழ்"},
            {"code": "te", "name": "Telugu", "native_name": "తెలుగు"}
        ]
    }


@router.put("/language/{language_code}")
async def set_language(
    language_code: str,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Set user's preferred language"""
    supported = ["en", "hi", "ta", "te"]
    if language_code not in supported:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Language '{language_code}' not supported. Supported: {supported}"
        )
    
    current_user.preferred_language = language_code
    db.commit()
    
    return {"message": f"Language updated to {language_code}"}


@router.put("/voice/{voice_type}")
async def set_voice_preference(
    voice_type: str,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Set voice preference (male/female)"""
    if voice_type not in ["male", "female"]:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Voice type must be 'male' or 'female'"
        )
    
    current_user.voice_preference = voice_type
    db.commit()
    
    return {"message": f"Voice preference updated to {voice_type}"}

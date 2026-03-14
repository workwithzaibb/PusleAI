"""
Pydantic Schemas for API Request/Response validation
"""
from pydantic import BaseModel, Field, EmailStr, ConfigDict
from typing import Optional, List, Dict, Any
from datetime import datetime
from enum import Enum


# ============ User Schemas ============

class UserRole(str, Enum):
    PATIENT = "patient"
    DOCTOR = "doctor"
    ADMIN = "admin"


class UserBase(BaseModel):
    phone_number: str = Field(..., min_length=10, max_length=15)
    full_name: str = Field(..., min_length=2, max_length=100)
    email: Optional[EmailStr] = None
    preferred_language: str = "en"
    voice_preference: str = "female"


class UserCreate(UserBase):
    password: str = Field(..., min_length=6)


class UserLogin(BaseModel):
    phone_number: str
    password: str


class UserUpdate(BaseModel):
    full_name: Optional[str] = None
    email: Optional[EmailStr] = None
    preferred_language: Optional[str] = None
    voice_preference: Optional[str] = None
    age: Optional[int] = None
    gender: Optional[str] = None
    blood_group: Optional[str] = None
    village: Optional[str] = None
    district: Optional[str] = None
    state: Optional[str] = None
    pincode: Optional[str] = None


class UserResponse(UserBase):
    id: int
    is_active: bool
    is_verified: bool
    role: str
    created_at: datetime
    
    model_config = ConfigDict(from_attributes=True)


class Token(BaseModel):
    access_token: str
    token_type: str = "bearer"
    user: UserResponse


# ============ Consultation Schemas ============

class ConsultationStart(BaseModel):
    language: str = "en"
    family_member_id: Optional[int] = None


class ConsultationMessage(BaseModel):
    message: str
    session_id: str
    language: Optional[str] = None


class VoiceMessage(BaseModel):
    session_id: str
    audio_base64: str
    language: Optional[str] = None


class SymptomInput(BaseModel):
    description: str
    language: str = "en"
    duration: Optional[str] = None
    severity: Optional[str] = None


class ConditionResult(BaseModel):
    name: str
    confidence: float
    severity: str
    advice: str
    warning_signs: List[str]
    home_care: List[str]


class ConsultationResponse(BaseModel):
    session_id: str
    message: str
    symptoms_detected: List[Dict[str, Any]]
    conditions: List[ConditionResult]
    confidence_score: float
    severity: str
    is_emergency: bool
    emergency_action: Optional[str] = None
    advice: str
    home_care: List[str]
    warning_signs: List[str]
    should_see_doctor: bool
    follow_up_hours: Optional[int] = None
    emotional_support: Optional[str] = None
    language: str
    reasoning: str


# ============ Emergency Schemas ============

class EmergencyCheck(BaseModel):
    text: str
    language: str = "en"


class EmergencyResponse(BaseModel):
    is_emergency: bool
    severity: str
    detected_keywords: List[str]
    recommended_action: str
    call_emergency: bool
    emergency_contacts: Dict[str, str]


# ============ Medicine Schemas ============

class MedicineLookup(BaseModel):
    medicine_name: str


class MedicineInteractionCheck(BaseModel):
    medicines: List[str]


class MedicineResponse(BaseModel):
    name: str
    found: bool
    category: str
    common_uses: List[str]
    side_effects: List[str]
    warnings: List[str]
    max_daily_dose: str
    safe_for_children: bool
    safe_during_pregnancy: bool
    requires_prescription: bool


class InteractionResponse(BaseModel):
    has_interactions: bool
    warnings: List[Dict[str, str]]


# ============ Family Schemas ============

class FamilyMemberCreate(BaseModel):
    name: str
    relationship: str
    age: Optional[int] = None
    gender: Optional[str] = None
    blood_group: Optional[str] = None
    chronic_conditions: Optional[str] = None
    allergies: Optional[str] = None
    current_medications: Optional[str] = None
    preferred_language: str = "en"


class FamilyMemberResponse(FamilyMemberCreate):
    id: int
    primary_user_id: int
    created_at: datetime
    
    model_config = ConfigDict(from_attributes=True)


# ============ Follow-up Schemas ============

class FollowUpCreate(BaseModel):
    consultation_id: int
    scheduled_hours: int = 24


class FollowUpResponse(BaseModel):
    patient_response: str
    symptoms_improved: Optional[bool] = None
    new_symptoms: Optional[str] = None


class FollowUpStatus(BaseModel):
    id: int
    status: str
    scheduled_at: datetime
    symptoms_improved: Optional[bool] = None
    requires_escalation: bool


# ============ TTS/STT Schemas ============

class TTSRequest(BaseModel):
    text: str
    language: str = "en"
    slow: bool = False


class TTSResponse(BaseModel):
    audio_base64: str
    format: str = "mp3"


class STTResponse(BaseModel):
    transcription: str
    detected_language: str
    confidence: float

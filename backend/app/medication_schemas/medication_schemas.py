"""
Pydantic Schemas for Medication Reminder System
"""
from pydantic import BaseModel, Field, ConfigDict, field_validator
from typing import Optional, List, Dict, Any
from datetime import datetime, time, date
from enum import Enum


# ============ Enums ============

class FrequencyType(str, Enum):
    ONCE_DAILY = "once_daily"
    TWICE_DAILY = "twice_daily"
    THREE_TIMES_DAILY = "three_times_daily"
    FOUR_TIMES_DAILY = "four_times_daily"
    EVERY_X_HOURS = "every_x_hours"
    AS_NEEDED = "as_needed"
    WEEKLY = "weekly"
    CUSTOM = "custom"


class MedicationTiming(str, Enum):
    BEFORE_FOOD = "before_food"
    WITH_FOOD = "with_food"
    AFTER_FOOD = "after_food"
    EMPTY_STOMACH = "empty_stomach"
    ANY_TIME = "any_time"
    BEDTIME = "bedtime"


class AdherenceStatus(str, Enum):
    PENDING = "pending"
    TAKEN = "taken"
    MISSED = "missed"
    SKIPPED = "skipped"
    SNOOZED = "snoozed"


# ============ Medication Schemas ============

class MedicationCreate(BaseModel):
    """Create a new medication"""
    name: str = Field(..., min_length=1, max_length=200)
    generic_name: Optional[str] = None
    dosage: str = Field(..., min_length=1, max_length=100)  # e.g., "500mg"
    dosage_unit: str = Field(default="mg", max_length=50)
    form: Optional[str] = None  # tablet, capsule, syrup
    
    # Frequency
    frequency: FrequencyType = FrequencyType.ONCE_DAILY
    frequency_hours: Optional[int] = Field(None, ge=1, le=24)  # For every X hours
    timing: MedicationTiming = MedicationTiming.ANY_TIME
    
    # Duration
    start_date: Optional[datetime] = None
    end_date: Optional[datetime] = None
    duration_days: Optional[int] = Field(None, ge=1)
    is_ongoing: bool = False
    
    # Additional Info
    purpose: Optional[str] = None
    prescribing_doctor: Optional[str] = None
    pharmacy: Optional[str] = None
    quantity: Optional[int] = Field(None, ge=0)
    refill_reminder_days: int = Field(default=7, ge=1, le=30)
    
    # Instructions
    instructions: Optional[str] = None
    warnings: Optional[str] = None
    
    # Flags
    is_critical: bool = False
    requires_food: bool = False
    avoid_alcohol: bool = False
    
    # Schedule times (optional - auto-calculated if not provided)
    schedule_times: Optional[List[str]] = None  # ["08:00", "20:00"]
    timezone: str = Field(default="Asia/Kolkata", max_length=50)
    
    model_config = ConfigDict(
        json_schema_extra={
            "example": {
                "name": "Metformin",
                "generic_name": "Metformin Hydrochloride",
                "dosage": "500",
                "dosage_unit": "mg",
                "form": "tablet",
                "frequency": "twice_daily",
                "timing": "with_food",
                "is_ongoing": True,
                "purpose": "Type 2 Diabetes management",
                "instructions": "Take with breakfast and dinner",
                "schedule_times": ["08:00", "20:00"]
            }
        }
    )


class MedicationUpdate(BaseModel):
    """Update an existing medication"""
    name: Optional[str] = Field(None, max_length=200)
    generic_name: Optional[str] = None
    dosage: Optional[str] = Field(None, max_length=100)
    dosage_unit: Optional[str] = None
    form: Optional[str] = None
    
    frequency: Optional[FrequencyType] = None
    frequency_hours: Optional[int] = Field(None, ge=1, le=24)
    timing: Optional[MedicationTiming] = None
    
    end_date: Optional[datetime] = None
    duration_days: Optional[int] = Field(None, ge=1)
    is_ongoing: Optional[bool] = None
    
    purpose: Optional[str] = None
    prescribing_doctor: Optional[str] = None
    pharmacy: Optional[str] = None
    quantity: Optional[int] = Field(None, ge=0)
    
    instructions: Optional[str] = None
    warnings: Optional[str] = None
    
    is_critical: Optional[bool] = None
    is_active: Optional[bool] = None


class ScheduleResponse(BaseModel):
    """Medication schedule response"""
    id: int
    scheduled_time: str
    timezone: str
    label: Optional[str] = None
    reminder_enabled: bool
    is_active: bool
    
    model_config = ConfigDict(from_attributes=True)


class MedicationResponse(BaseModel):
    """Medication response"""
    id: int
    name: str
    generic_name: Optional[str] = None
    dosage: str
    dosage_unit: str
    form: Optional[str] = None
    
    frequency: str
    timing: str
    
    start_date: datetime
    end_date: Optional[datetime] = None
    is_ongoing: bool
    
    purpose: Optional[str] = None
    instructions: Optional[str] = None
    
    is_critical: bool
    is_active: bool
    
    schedules: List[ScheduleResponse] = []
    
    # Adherence stats (calculated)
    adherence_rate: Optional[float] = None
    streak_days: Optional[int] = None
    
    created_at: datetime
    
    model_config = ConfigDict(from_attributes=True)


class MedicationListResponse(BaseModel):
    """List of medications response"""
    medications: List[MedicationResponse]
    total: int
    active_count: int
    
    
# ============ Adherence Schemas ============

class MarkTakenRequest(BaseModel):
    """Mark a medication dose as taken"""
    medication_id: int
    schedule_id: Optional[int] = None
    taken_at: Optional[datetime] = None  # Defaults to now
    notes: Optional[str] = None


class MarkSkippedRequest(BaseModel):
    """Mark a medication dose as skipped"""
    medication_id: int
    schedule_id: Optional[int] = None
    skip_reason: str = Field(..., min_length=1, max_length=255)
    notes: Optional[str] = None


class SnoozeRequest(BaseModel):
    """Snooze a medication reminder"""
    snooze_minutes: int = Field(default=15, ge=5, le=120)


class AdherenceLogResponse(BaseModel):
    """Adherence log entry response"""
    id: int
    medication_id: int
    medication_name: str
    scheduled_datetime: datetime
    actual_datetime: Optional[datetime] = None
    status: str
    delay_minutes: Optional[int] = None
    skip_reason: Optional[str] = None
    
    model_config = ConfigDict(from_attributes=True)


class AdherenceScoreResponse(BaseModel):
    """Adherence analytics response"""
    user_id: int
    period_days: int
    
    # Overall Stats
    total_scheduled: int
    total_taken: int
    total_missed: int
    total_skipped: int
    
    # Percentages
    adherence_rate: float  # 0-100
    on_time_rate: float  # Taken within 30 mins of scheduled
    
    # Streaks
    current_streak: int
    longest_streak: int
    
    # By Medication
    by_medication: List[Dict[str, Any]]
    
    # Risk Assessment
    non_adherence_risk: str  # "low", "medium", "high"
    risk_factors: List[str]
    suggestions: List[str]
    
    # Time Analysis
    best_time_slot: Optional[str] = None  # When user is most adherent
    worst_time_slot: Optional[str] = None


# ============ Pill Identification Schemas ============

class PillIdentifyRequest(BaseModel):
    """Request to identify a pill from image"""
    image_base64: str
    link_to_medication_id: Optional[int] = None


class PillIdentifyResponse(BaseModel):
    """Pill identification response"""
    is_identified: bool
    confidence_score: Optional[float] = None
    identified_name: Optional[str] = None
    generic_name: Optional[str] = None
    possible_matches: List[Dict[str, Any]] = []
    warnings: List[str] = []
    
    # If linked to medication
    medication_id: Optional[int] = None
    matches_medication: Optional[bool] = None


# ============ Drug Interaction Schemas ============

class InteractionCheckRequest(BaseModel):
    """Check for drug interactions"""
    medication_ids: Optional[List[int]] = None  # Check user's medications
    medication_names: Optional[List[str]] = None  # Check by name
    new_medication: Optional[str] = None  # Check new med against existing
    
    @field_validator("medication_names", "medication_ids", mode="before")
    @classmethod
    def at_least_one_required(cls, v):
        # At least some input required
        return v


class InteractionResult(BaseModel):
    """Single drug interaction"""
    drug_a: str
    drug_b: str
    severity: str  # mild, moderate, severe, contraindicated
    description: str
    recommendation: Optional[str] = None


class InteractionCheckResponse(BaseModel):
    """Drug interaction check response"""
    has_interactions: bool
    interaction_count: int
    medications_checked: List[str]
    
    interactions: List[InteractionResult]
    
    # Summary
    severe_count: int
    moderate_count: int
    mild_count: int
    
    # Overall recommendation
    recommendation: str


# ============ Reminder Schemas ============

class ReminderResponse(BaseModel):
    """Upcoming reminder"""
    medication_id: int
    medication_name: str
    schedule_id: int
    scheduled_time: datetime
    dosage: str
    timing: str
    instructions: Optional[str] = None
    is_critical: bool


class UpcomingRemindersResponse(BaseModel):
    """List of upcoming reminders"""
    reminders: List[ReminderResponse]
    count: int


# ============ Preference Schemas ============

class MedicationPreferencesUpdate(BaseModel):
    """Update user medication preferences"""
    timezone: Optional[str] = None
    
    default_notify_whatsapp: Optional[bool] = None
    default_notify_sms: Optional[bool] = None
    default_notify_email: Optional[bool] = None
    default_notify_push: Optional[bool] = None
    
    caregiver_phone: Optional[str] = None
    caregiver_email: Optional[str] = None
    notify_caregiver_after_minutes: Optional[int] = Field(None, ge=15, le=240)


class MedicationPreferencesResponse(BaseModel):
    """User medication preferences"""
    timezone: str
    default_notify_whatsapp: bool
    default_notify_sms: bool
    default_notify_email: bool
    default_notify_push: bool
    caregiver_phone: Optional[str] = None
    caregiver_email: Optional[str] = None
    notify_caregiver_after_minutes: int
    
    # Gamification
    streak_count: int
    longest_streak: int
    total_doses_taken: int
    adherence_rate: float
    
    model_config = ConfigDict(from_attributes=True)

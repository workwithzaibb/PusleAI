"""
Medication Reminder API Router
Endpoints for medication management, adherence tracking, and reminders
"""
from fastapi import APIRouter, Depends, HTTPException, status, Query, UploadFile, File
from sqlalchemy.orm import Session
from typing import List, Optional
from datetime import datetime

from app.database import get_db
from app.models.user import User
from app.models.medication import Medication, AdherenceLog
from app.api.auth import get_current_user
from app.services.reminder_service import get_reminder_service
from app.services.pill_identification import get_pill_identification_service
from app.config import settings
from app.medication_schemas.medication_schemas import (
    MedicationCreate,
    MedicationUpdate,
    MedicationResponse,
    MedicationListResponse,
    ScheduleResponse,
    MarkTakenRequest,
    MarkSkippedRequest,
    SnoozeRequest,
    AdherenceLogResponse,
    AdherenceScoreResponse,
    PillIdentifyRequest,
    PillIdentifyResponse,
    InteractionCheckRequest,
    InteractionCheckResponse,
    UpcomingRemindersResponse,
    ReminderResponse,
    MedicationPreferencesUpdate,
    MedicationPreferencesResponse
)


router = APIRouter()


def check_feature_enabled():
    """Check if medication feature is enabled"""
    if hasattr(settings, 'MEDICATION_FEATURE_ENABLED') and not settings.MEDICATION_FEATURE_ENABLED:
        raise HTTPException(
            status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
            detail="Medication reminder feature is currently disabled"
        )


# ============ Medication CRUD ============

@router.post("/add", response_model=MedicationResponse, status_code=status.HTTP_201_CREATED)
async def add_medication(
    data: MedicationCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """
    Add a new medication with automatic schedule generation.
    
    **Schedule times** are automatically calculated based on frequency and timing:
    - once_daily → 09:00
    - twice_daily → 08:00, 20:00
    - three_times_daily → 08:00, 14:00, 20:00
    
    Or provide custom `schedule_times` array.
    """
    check_feature_enabled()
    
    service = get_reminder_service(db)
    medication = service.create_medication(current_user.id, data)
    
    # Build response with schedules
    schedules = [
        ScheduleResponse(
            id=s.id,
            scheduled_time=s.scheduled_time.strftime("%H:%M"),
            timezone=s.timezone,
            label=s.label,
            reminder_enabled=s.reminder_enabled,
            is_active=s.is_active
        )
        for s in medication.schedules
    ]
    
    return MedicationResponse(
        id=medication.id,
        name=medication.name,
        generic_name=medication.generic_name,
        dosage=medication.dosage,
        dosage_unit=medication.dosage_unit,
        form=medication.form,
        frequency=medication.frequency.value,
        timing=medication.timing.value,
        start_date=medication.start_date,
        end_date=medication.end_date,
        is_ongoing=medication.is_ongoing,
        purpose=medication.purpose,
        instructions=medication.instructions,
        is_critical=medication.is_critical,
        is_active=medication.is_active,
        schedules=schedules,
        created_at=medication.created_at
    )


@router.get("/list", response_model=MedicationListResponse)
async def list_medications(
    active_only: bool = Query(True, description="Only show active medications"),
    limit: int = Query(50, ge=1, le=100),
    offset: int = Query(0, ge=0),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """List all medications for the current user"""
    check_feature_enabled()
    
    service = get_reminder_service(db)
    medications, total, active_count = service.list_medications(
        current_user.id, active_only, limit, offset
    )
    
    medication_responses = []
    for med in medications:
        schedules = [
            ScheduleResponse(
                id=s.id,
                scheduled_time=s.scheduled_time.strftime("%H:%M"),
                timezone=s.timezone,
                label=s.label,
                reminder_enabled=s.reminder_enabled,
                is_active=s.is_active
            )
            for s in med.schedules
        ]
        
        medication_responses.append(MedicationResponse(
            id=med.id,
            name=med.name,
            generic_name=med.generic_name,
            dosage=med.dosage,
            dosage_unit=med.dosage_unit,
            form=med.form,
            frequency=med.frequency.value,
            timing=med.timing.value,
            start_date=med.start_date,
            end_date=med.end_date,
            is_ongoing=med.is_ongoing,
            purpose=med.purpose,
            instructions=med.instructions,
            is_critical=med.is_critical,
            is_active=med.is_active,
            schedules=schedules,
            created_at=med.created_at
        ))
    
    return MedicationListResponse(
        medications=medication_responses,
        total=total,
        active_count=active_count
    )


@router.get("/{medication_id}", response_model=MedicationResponse)
async def get_medication(
    medication_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Get a specific medication by ID"""
    check_feature_enabled()
    
    service = get_reminder_service(db)
    medication = service.get_medication(medication_id, current_user.id)
    
    if not medication:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Medication not found"
        )
    
    schedules = [
        ScheduleResponse(
            id=s.id,
            scheduled_time=s.scheduled_time.strftime("%H:%M"),
            timezone=s.timezone,
            label=s.label,
            reminder_enabled=s.reminder_enabled,
            is_active=s.is_active
        )
        for s in medication.schedules
    ]
    
    return MedicationResponse(
        id=medication.id,
        name=medication.name,
        generic_name=medication.generic_name,
        dosage=medication.dosage,
        dosage_unit=medication.dosage_unit,
        form=medication.form,
        frequency=medication.frequency.value,
        timing=medication.timing.value,
        start_date=medication.start_date,
        end_date=medication.end_date,
        is_ongoing=medication.is_ongoing,
        purpose=medication.purpose,
        instructions=medication.instructions,
        is_critical=medication.is_critical,
        is_active=medication.is_active,
        schedules=schedules,
        created_at=medication.created_at
    )


@router.put("/{medication_id}/update", response_model=MedicationResponse)
async def update_medication(
    medication_id: int,
    data: MedicationUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Update a medication"""
    check_feature_enabled()
    
    service = get_reminder_service(db)
    medication = service.update_medication(medication_id, current_user.id, data)
    
    if not medication:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Medication not found"
        )
    
    schedules = [
        ScheduleResponse(
            id=s.id,
            scheduled_time=s.scheduled_time.strftime("%H:%M"),
            timezone=s.timezone,
            label=s.label,
            reminder_enabled=s.reminder_enabled,
            is_active=s.is_active
        )
        for s in medication.schedules
    ]
    
    return MedicationResponse(
        id=medication.id,
        name=medication.name,
        generic_name=medication.generic_name,
        dosage=medication.dosage,
        dosage_unit=medication.dosage_unit,
        form=medication.form,
        frequency=medication.frequency.value,
        timing=medication.timing.value,
        start_date=medication.start_date,
        end_date=medication.end_date,
        is_ongoing=medication.is_ongoing,
        purpose=medication.purpose,
        instructions=medication.instructions,
        is_critical=medication.is_critical,
        is_active=medication.is_active,
        schedules=schedules,
        created_at=medication.created_at
    )


@router.delete("/{medication_id}/delete")
async def delete_medication(
    medication_id: int,
    permanent: bool = Query(False, description="Permanently delete instead of soft delete"),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """
    Delete a medication.
    
    By default, performs a soft delete (marks as inactive).
    Set `permanent=true` to permanently delete.
    """
    check_feature_enabled()
    
    service = get_reminder_service(db)
    
    if permanent:
        success = service.hard_delete_medication(medication_id, current_user.id)
    else:
        success = service.delete_medication(medication_id, current_user.id)
    
    if not success:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Medication not found"
        )
    
    return {
        "success": True,
        "message": "Medication deleted permanently" if permanent else "Medication deactivated"
    }


# ============ Adherence Tracking ============

@router.post("/mark-taken")
async def mark_medication_taken(
    data: MarkTakenRequest,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """
    Mark a medication dose as taken.
    
    Optionally specify when it was taken (defaults to now).
    This updates adherence stats and streak tracking.
    """
    check_feature_enabled()
    
    service = get_reminder_service(db)
    
    # Verify medication belongs to user
    medication = service.get_medication(data.medication_id, current_user.id)
    if not medication:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Medication not found"
        )
    
    log = service.mark_taken(
        medication_id=data.medication_id,
        user_id=current_user.id,
        schedule_id=data.schedule_id,
        taken_at=data.taken_at,
        notes=data.notes
    )
    
    return {
        "success": True,
        "log_id": log.id,
        "status": log.status.value,
        "delay_minutes": log.delay_minutes,
        "message": "Dose marked as taken! 💊"
    }


@router.post("/mark-skipped")
async def mark_medication_skipped(
    data: MarkSkippedRequest,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Mark a medication dose as intentionally skipped with a reason"""
    check_feature_enabled()
    
    service = get_reminder_service(db)
    
    medication = service.get_medication(data.medication_id, current_user.id)
    if not medication:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Medication not found"
        )
    
    log = service.mark_skipped(
        medication_id=data.medication_id,
        user_id=current_user.id,
        skip_reason=data.skip_reason,
        schedule_id=data.schedule_id,
        notes=data.notes
    )
    
    return {
        "success": True,
        "log_id": log.id,
        "status": log.status.value,
        "message": "Dose marked as skipped"
    }


@router.post("/snooze/{schedule_id}")
async def snooze_reminder(
    schedule_id: int,
    medication_id: int,
    data: SnoozeRequest,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """
    Snooze a medication reminder.
    
    Default snooze is 15 minutes. Maximum 3 snoozes per dose.
    """
    check_feature_enabled()
    
    service = get_reminder_service(db)
    
    result = service.snooze_reminder(
        medication_id=medication_id,
        schedule_id=schedule_id,
        user_id=current_user.id,
        snooze_minutes=data.snooze_minutes
    )
    
    if not result["success"]:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=result["error"]
        )
    
    return result


@router.get("/adherence-score", response_model=AdherenceScoreResponse)
async def get_adherence_score(
    period_days: int = Query(30, ge=7, le=365, description="Analysis period in days"),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """
    Get adherence analytics and score.
    
    Returns:
    - Overall adherence rate
    - Streak information
    - Per-medication breakdown
    - Non-adherence risk assessment
    - Personalized suggestions
    """
    check_feature_enabled()
    
    service = get_reminder_service(db)
    score = service.get_adherence_score(current_user.id, period_days)
    
    return AdherenceScoreResponse(**score)


@router.get("/reminders/upcoming", response_model=UpcomingRemindersResponse)
async def get_upcoming_reminders(
    hours: int = Query(24, ge=1, le=168, description="Hours to look ahead"),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Get upcoming medication reminders for the next N hours"""
    check_feature_enabled()
    
    service = get_reminder_service(db)
    reminders = service.get_upcoming_reminders(current_user.id, hours)
    
    reminder_responses = [
        ReminderResponse(
            medication_id=r["medication_id"],
            medication_name=r["medication_name"],
            schedule_id=r["schedule_id"],
            scheduled_time=r["scheduled_time"],
            dosage=r["dosage"],
            timing=r["timing"],
            instructions=r["instructions"],
            is_critical=r["is_critical"]
        )
        for r in reminders
    ]
    
    return UpcomingRemindersResponse(
        reminders=reminder_responses,
        count=len(reminder_responses)
    )


# ============ Pill Identification ============

@router.post("/identify-pill", response_model=PillIdentifyResponse)
async def identify_pill(
    data: PillIdentifyRequest,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """
    Identify a pill from an image.
    
    Send a base64-encoded image of the pill.
    Optionally link to a medication ID to verify it matches.
    
    **Note**: This is a stub implementation. For production,
    integrate with a pill identification API or trained ML model.
    """
    check_feature_enabled()
    
    service = get_pill_identification_service(db)
    
    result = service.identify_pill(
        image_base64=data.image_base64,
        user_id=current_user.id,
        link_to_medication_id=data.link_to_medication_id
    )
    
    return PillIdentifyResponse(**result)


# ============ Drug Interactions ============

@router.post("/check-interactions", response_model=InteractionCheckResponse)
async def check_drug_interactions(
    data: InteractionCheckRequest,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """
    Check for drug interactions.
    
    Options:
    - `medication_ids`: Check interactions between your medications by ID
    - `medication_names`: Check by medication names
    - `new_medication`: Check if a new medication interacts with existing ones
    """
    check_feature_enabled()
    
    if not any([data.medication_ids, data.medication_names, data.new_medication]):
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="At least one of medication_ids, medication_names, or new_medication is required"
        )
    
    service = get_reminder_service(db)
    
    result = service.check_interactions(
        user_id=current_user.id,
        medication_ids=data.medication_ids,
        medication_names=data.medication_names,
        new_medication=data.new_medication
    )
    
    return InteractionCheckResponse(
        has_interactions=result["has_interactions"],
        interaction_count=result["interaction_count"],
        medications_checked=result["medications_checked"],
        interactions=[],  # Will be populated from result
        severe_count=result["severe_count"],
        moderate_count=result["moderate_count"],
        mild_count=result["mild_count"],
        recommendation=result["recommendation"]
    )


# ============ Adherence History ============

@router.get("/history")
async def get_adherence_history(
    medication_id: Optional[int] = Query(None, description="Filter by medication"),
    days: int = Query(30, ge=1, le=365),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Get adherence history logs"""
    check_feature_enabled()
    
    from datetime import timedelta
    start_date = datetime.utcnow() - timedelta(days=days)
    
    query = db.query(AdherenceLog).filter(
        AdherenceLog.user_id == current_user.id,
        AdherenceLog.created_at >= start_date
    )
    
    if medication_id:
        query = query.filter(AdherenceLog.medication_id == medication_id)
    
    logs = query.order_by(AdherenceLog.scheduled_datetime.desc()).limit(100).all()
    
    return {
        "logs": [
            {
                "id": log.id,
                "medication_id": log.medication_id,
                "scheduled_datetime": log.scheduled_datetime.isoformat() if log.scheduled_datetime else None,
                "actual_datetime": log.actual_datetime.isoformat() if log.actual_datetime else None,
                "status": log.status.value,
                "delay_minutes": log.delay_minutes,
                "skip_reason": log.skip_reason
            }
            for log in logs
        ],
        "count": len(logs)
    }

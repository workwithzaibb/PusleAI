"""
Mental Health API Router
Endpoints for mood tracking, journaling, AI therapy, and crisis support.
"""
from fastapi import APIRouter, Depends, HTTPException, status, Query
from sqlalchemy.orm import Session
from typing import List, Optional

from app.database import get_db
from app.models.user import User
from app.api.auth import get_current_user
from app.config import settings
from app.services.mood_analyzer import MoodAnalyzerService
from app.services.therapy_bot import TherapyBotService
from app.mental_health_schemas.mental_health_schemas import (
    MoodCheckinRequest,
    MoodEntryResponse,
    JournalRequest,
    JournalResponse,
    ChatRequest,
    ChatResponse,
    MentalHealthInsightsResponse,
    CrisisReportRequest,
    CrisisResponse
)


router = APIRouter()


def check_feature_enabled():
    """Check if mental health feature is enabled"""
    if hasattr(settings, 'MENTAL_HEALTH_FEATURE_ENABLED') and not settings.MENTAL_HEALTH_FEATURE_ENABLED:
        raise HTTPException(
            status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
            detail="Mental health feature is currently disabled"
        )


def get_mood_service(db: Session = Depends(get_db)):
    return MoodAnalyzerService(db)


def get_therapy_service(db: Session = Depends(get_db)):
    return TherapyBotService(db)


# ============ Mood Tracking ============

@router.post("/mood-checkin", response_model=MoodEntryResponse)
async def log_mood(
    data: MoodCheckinRequest,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
    service: MoodAnalyzerService = Depends(get_mood_service)
):
    """Log a daily mood check-in"""
    check_feature_enabled()
    return service.log_mood(current_user.id, data)


@router.get("/mood-history", response_model=List[MoodEntryResponse])
async def get_mood_history(
    days: int = Query(30, ge=1, le=365),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
    service: MoodAnalyzerService = Depends(get_mood_service)
):
    """Get mood history for the last N days"""
    check_feature_enabled()
    return service.get_mood_history(current_user.id, days)


@router.get("/insights", response_model=MentalHealthInsightsResponse)
async def get_insights(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
    service: MoodAnalyzerService = Depends(get_mood_service)
):
    """Get personalized mental health insights and trends"""
    check_feature_enabled()
    return service.get_insights(current_user.id)


# ============ Journaling ============

@router.post("/journal", response_model=JournalResponse)
async def create_journal(
    data: JournalRequest,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
    service: MoodAnalyzerService = Depends(get_mood_service)
):
    """Create a text or voice journal entry (transcript)"""
    check_feature_enabled()
    return service.create_journal(current_user.id, data)


# ============ AI Therapy Chat ============

@router.post("/chat", response_model=ChatResponse)
async def chat_with_companion(
    data: ChatRequest,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
    service: TherapyBotService = Depends(get_therapy_service)
):
    """
    Chat with the AI Mental Health Companion.
    Uses CBT principles and sentiment analysis.
    Auto-detects crisis keywords.
    """
    check_feature_enabled()
    
    result = service.process_message(
        user_id=current_user.id,
        message=data.message,
        session_id=data.session_id
    )
    
    return ChatResponse(**result)


# ============ Crisis Support ============

@router.post("/crisis", response_model=CrisisResponse)
async def report_crisis(
    data: CrisisReportRequest,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """
    Explicitly report a crisis situation.
    Returns immediate helpline resources and safety plan.
    """
    check_feature_enabled()
    
    # In a real app, this would trigger instant alerts to emergency contacts
    # and potentially integrate with external services.
    
    helplines = [
        {"name": "National Crisis Hotline", "number": "988"},
        {"name": "Emergency Services", "number": "911"},
        {"name": "Crisis Text Line", "number": "Text HOME to 741741"}
    ]
    
    safety_plan = """
    1. Take a deep breath. You are safe right now.
    2. Call a friend or family member: [Emergency Contact]
    3. Go to a safe place (bedroom, living room).
    4. Remove any dangerous items from your vicinity.
    5. Call 988 if you feel you cannot stay safe.
    """
    
    return CrisisResponse(
        risk_level="high",
        requires_immediate_help=True,
        helpline_numbers=helplines,
        safety_plan=safety_plan
    )

"""
Consultation Router - Main AI Doctor consultation endpoint
"""
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import Optional
from app.time_utils import utc_now
import uuid

from app.database import get_db
from app.models.user import User
from app.models.consultation import Consultation, ConsultationStatus
from app.models.consultation_message import ConsultationMessage as ConsultationMessageModel, MessageType
from app.schemas import (
    ConsultationStart, 
    ConsultationMessage, 
    ConsultationResponse,
    ConditionResult
)
from app.api.auth import get_current_user
from app.services.ai_doctor import ai_doctor
from app.knowledge.translations import get_translation

router = APIRouter()


@router.post("/start")
async def start_consultation(
    data: ConsultationStart,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Start a new consultation session"""
    session_id = str(uuid.uuid4())[:12]
    
    # Create consultation record
    consultation = Consultation(
        user_id=current_user.id,
        family_member_id=data.family_member_id,
        session_id=session_id,
        language=data.language,
        status=ConsultationStatus.ACTIVE
    )
    
    db.add(consultation)
    db.commit()
    db.refresh(consultation)
    
    # Get greeting in user's language
    greeting = get_translation("greeting", data.language)
    disclaimer = ai_doctor.get_disclaimer(data.language)
    
    return {
        "session_id": session_id,
        "message": f"{greeting}\n\n{disclaimer}",
        "consultation_id": consultation.id,
        "language": data.language
    }


@router.post("/message", response_model=ConsultationResponse)
async def send_message(
    data: ConsultationMessage,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Send a message to AI Doctor and get response"""
    # Find consultation
    consultation = db.query(Consultation).filter(
        Consultation.session_id == data.session_id,
        Consultation.user_id == current_user.id
    ).first()
    
    if not consultation:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Consultation session not found"
        )
    
    if consultation.status != ConsultationStatus.ACTIVE:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Consultation session is not active"
        )
    
    # Save user message
    user_msg = ConsultationMessageModel(
        consultation_id=consultation.id,
        message_type=MessageType.USER_TEXT,
        content=data.message,
        language=data.language or consultation.language
    )
    db.add(user_msg)
    
    # Get AI response
    response = await ai_doctor.consult(
        user_input=data.message,
        language=data.language or consultation.language,
        session_id=data.session_id
    )
    
    # Save AI response
    ai_msg = ConsultationMessageModel(
        consultation_id=consultation.id,
        message_type=MessageType.AI_RESPONSE,
        content=response.message,
        language=response.language,
        ai_confidence=response.confidence_score,
        detected_symptoms=response.symptoms_detected,
        reasoning=response.reasoning
    )
    db.add(ai_msg)
    
    # Update consultation with analysis
    consultation.primary_symptoms = response.symptoms_detected
    consultation.detected_conditions = [c["name"] for c in response.conditions]
    consultation.ai_confidence_score = response.confidence_score
    consultation.severity_level = response.severity
    consultation.is_emergency = response.is_emergency
    consultation.advice_summary = response.advice
    consultation.home_care_tips = response.home_care
    consultation.warning_signs = response.warning_signs
    
    if response.is_emergency:
        consultation.status = ConsultationStatus.EMERGENCY
    
    db.commit()
    
    # Convert conditions to response model
    condition_results = [
        ConditionResult(
            name=c["name"],
            confidence=c["confidence"],
            severity=c["severity"],
            advice=c["advice"],
            warning_signs=c.get("warning_signs", []),
            home_care=c.get("home_care", [])
        )
        for c in response.conditions
    ]
    
    return ConsultationResponse(
        session_id=response.session_id,
        message=response.message,
        symptoms_detected=response.symptoms_detected,
        conditions=condition_results,
        confidence_score=response.confidence_score,
        severity=response.severity,
        is_emergency=response.is_emergency,
        emergency_action=response.emergency_action,
        advice=response.advice,
        home_care=response.home_care,
        warning_signs=response.warning_signs,
        should_see_doctor=response.should_see_doctor,
        follow_up_hours=response.follow_up_hours,
        emotional_support=response.emotional_support,
        language=response.language,
        reasoning=response.reasoning
    )


@router.post("/end/{session_id}")
async def end_consultation(
    session_id: str,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """End a consultation session"""
    consultation = db.query(Consultation).filter(
        Consultation.session_id == session_id,
        Consultation.user_id == current_user.id
    ).first()
    
    if not consultation:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Consultation not found"
        )
    
    consultation.status = ConsultationStatus.COMPLETED
    consultation.ended_at = utc_now()
    db.commit()
    
    thank_you = get_translation("thank_you", consultation.language)
    
    return {
        "message": thank_you,
        "summary": {
            "symptoms": consultation.primary_symptoms,
            "conditions": consultation.detected_conditions,
            "confidence": consultation.ai_confidence_score,
            "advice": consultation.advice_summary
        }
    }


@router.get("/history")
async def get_consultation_history(
    limit: int = 10,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Get user's consultation history"""
    consultations = db.query(Consultation).filter(
        Consultation.user_id == current_user.id
    ).order_by(Consultation.started_at.desc()).limit(limit).all()
    
    return [
        {
            "id": c.id,
            "session_id": c.session_id,
            "status": c.status.value,
            "symptoms": c.primary_symptoms,
            "conditions": c.detected_conditions,
            "severity": c.severity_level,
            "started_at": c.started_at,
            "ended_at": c.ended_at
        }
        for c in consultations
    ]


@router.get("/{session_id}")
async def get_consultation_details(
    session_id: str,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Get detailed consultation by session ID"""
    consultation = db.query(Consultation).filter(
        Consultation.session_id == session_id,
        Consultation.user_id == current_user.id
    ).first()
    
    if not consultation:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Consultation not found"
        )
    
    messages = db.query(ConsultationMessageModel).filter(
        ConsultationMessageModel.consultation_id == consultation.id
    ).order_by(ConsultationMessageModel.created_at).all()
    
    return {
        "consultation": {
            "id": consultation.id,
            "session_id": consultation.session_id,
            "status": consultation.status.value,
            "language": consultation.language,
            "symptoms": consultation.primary_symptoms,
            "conditions": consultation.detected_conditions,
            "confidence": consultation.ai_confidence_score,
            "severity": consultation.severity_level,
            "is_emergency": consultation.is_emergency,
            "advice": consultation.advice_summary,
            "home_care": consultation.home_care_tips,
            "warning_signs": consultation.warning_signs,
            "started_at": consultation.started_at,
            "ended_at": consultation.ended_at
        },
        "messages": [
            {
                "type": m.message_type.value,
                "content": m.content,
                "timestamp": m.created_at
            }
            for m in messages
        ]
    }




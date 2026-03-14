"""
Follow-up Router - Automated patient follow-ups
"""
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from datetime import timedelta
from app.time_utils import utc_now
from app.database import get_db
from app.models.user import User
from app.models.followup import FollowUp, FollowUpStatus
from app.models.consultation import Consultation
from app.schemas import FollowUpCreate, FollowUpResponse
from app.api.auth import get_current_user

router = APIRouter()


@router.post("/schedule")
async def schedule_followup(
    data: FollowUpCreate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Schedule a follow-up for a consultation"""
    # Verify consultation exists
    consultation = db.query(Consultation).filter(
        Consultation.id == data.consultation_id,
        Consultation.user_id == current_user.id
    ).first()
    
    if not consultation:
        raise HTTPException(status_code=404, detail="Consultation not found")
    
    # Create follow-up
    scheduled_time = utc_now() + timedelta(hours=data.scheduled_hours)
    
    followup = FollowUp(
        user_id=current_user.id,
        consultation_id=data.consultation_id,
        scheduled_at=scheduled_time,
        follow_up_questions='["How are you feeling?", "Have symptoms improved?", "Any new symptoms?"]'
    )
    
    db.add(followup)
    db.commit()
    db.refresh(followup)
    
    return {
        "id": followup.id,
        "scheduled_at": followup.scheduled_at,
        "message": f"Follow-up scheduled for {data.scheduled_hours} hours from now"
    }


@router.post("/{followup_id}/respond")
async def respond_to_followup(
    followup_id: int,
    response: FollowUpResponse,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Respond to a follow-up"""
    followup = db.query(FollowUp).filter(
        FollowUp.id == followup_id,
        FollowUp.user_id == current_user.id
    ).first()
    
    if not followup:
        raise HTTPException(status_code=404, detail="Follow-up not found")
    
    # Update follow-up with response
    followup.status = FollowUpStatus.RESPONDED
    followup.responded_at = utc_now()
    followup.patient_response = response.patient_response
    followup.symptoms_improved = response.symptoms_improved
    followup.new_symptoms = response.new_symptoms
    
    # Check if escalation needed
    if response.symptoms_improved == False or response.new_symptoms:
        followup.requires_escalation = True
        followup.escalation_reason = "Symptoms worsened or new symptoms appeared"
    
    db.commit()
    
    # Generate response message
    if followup.requires_escalation:
        message = "Based on your response, we recommend consulting a doctor. Would you like to schedule a consultation?"
    elif response.symptoms_improved:
        message = "Great to hear you're feeling better! Continue with the prescribed care."
    else:
        message = "Thank you for your response. Continue monitoring your symptoms."
    
    return {
        "status": followup.status.value,
        "requires_escalation": followup.requires_escalation,
        "message": message
    }


@router.get("/pending")
async def get_pending_followups(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Get pending follow-ups for current user"""
    pending = db.query(FollowUp).filter(
        FollowUp.user_id == current_user.id,
        FollowUp.status.in_([FollowUpStatus.SCHEDULED, FollowUpStatus.SENT])
    ).order_by(FollowUp.scheduled_at).all()
    
    return [
        {
            "id": f.id,
            "consultation_id": f.consultation_id,
            "status": f.status.value,
            "scheduled_at": f.scheduled_at,
            "questions": f.follow_up_questions
        }
        for f in pending
    ]


@router.get("/history")
async def get_followup_history(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Get follow-up history"""
    followups = db.query(FollowUp).filter(
        FollowUp.user_id == current_user.id
    ).order_by(FollowUp.created_at.desc()).limit(20).all()
    
    return [
        {
            "id": f.id,
            "consultation_id": f.consultation_id,
            "status": f.status.value,
            "scheduled_at": f.scheduled_at,
            "responded_at": f.responded_at,
            "symptoms_improved": f.symptoms_improved,
            "requires_escalation": f.requires_escalation
        }
        for f in followups
    ]




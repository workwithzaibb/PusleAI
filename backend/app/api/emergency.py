"""
Emergency Router - Emergency detection and escalation
"""
from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from app.database import get_db
from app.models.user import User
from app.schemas import EmergencyCheck, EmergencyResponse
from app.api.auth import get_current_user
from app.services.emergency_detector import emergency_detector

router = APIRouter()


@router.post("/check", response_model=EmergencyResponse)
async def check_emergency(
    data: EmergencyCheck,
    current_user: User = Depends(get_current_user)
):
    """Check text for emergency indicators"""
    result = emergency_detector.detect(data.text, data.language)
    contacts = emergency_detector.get_emergency_contacts()
    
    return EmergencyResponse(
        is_emergency=result.is_emergency,
        severity=result.severity,
        detected_keywords=result.detected_keywords,
        recommended_action=result.recommended_action,
        call_emergency=result.call_emergency,
        emergency_contacts=contacts
    )


@router.get("/contacts")
async def get_emergency_contacts(location: str = "IN"):
    """Get emergency contact numbers"""
    contacts = emergency_detector.get_emergency_contacts(location)
    
    return {
        "location": location,
        "contacts": contacts,
        "instructions": {
            "en": "In case of emergency, call these numbers immediately.",
            "hi": "आपातकाल में, तुरंत इन नंबरों पर कॉल करें।"
        }
    }


@router.post("/panic")
async def panic_button(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    Panic button - immediate emergency alert
    In production, this would:
    1. Send SMS to emergency contacts
    2. Share location if available
    3. Alert nearby hospitals
    4. Create emergency consultation record
    """
    contacts = emergency_detector.get_emergency_contacts()
    
    # In production: Send alerts, share location, etc.
    
    return {
        "status": "alert_triggered",
        "message": "Emergency alert activated!",
        "emergency_number": contacts["emergency"],
        "ambulance": contacts["ambulance"],
        "instructions": [
            "Stay calm",
            "Call the emergency number shown",
            "If possible, share your location",
            "Stay on the line with emergency services"
        ]
    }


@router.post("/escalate/{consultation_id}")
async def escalate_to_doctor(
    consultation_id: int,
    reason: str = None,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Escalate consultation to real doctor"""
    from app.models.consultation import Consultation, ConsultationStatus
    
    consultation = db.query(Consultation).filter(
        Consultation.id == consultation_id,
        Consultation.user_id == current_user.id
    ).first()
    
    if not consultation:
        return {"error": "Consultation not found"}
    
    consultation.status = ConsultationStatus.ESCALATED
    consultation.escalated_to_doctor = True
    consultation.escalation_reason = reason or "Patient requested doctor consultation"
    db.commit()
    
    # In production: Notify available doctors, create appointment, etc.
    
    return {
        "status": "escalated",
        "message": "Your case has been escalated to a doctor.",
        "consultation_id": consultation_id,
        "next_steps": [
            "A doctor will review your case",
            "You will receive a callback within 30 minutes",
            "Keep your phone accessible"
        ]
    }

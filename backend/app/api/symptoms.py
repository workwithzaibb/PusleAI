"""
Symptoms Router - Symptom analysis without full consultation
"""
from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from app.database import get_db
from app.models.user import User
from app.schemas import SymptomInput
from app.api.auth import get_current_user
from app.services.symptom_analyzer import symptom_analyzer
from app.services.emergency_detector import emergency_detector

router = APIRouter()


@router.post("/analyze")
async def analyze_symptoms(
    data: SymptomInput,
    current_user: User = Depends(get_current_user)
):
    """Analyze symptoms and get possible conditions"""
    # Check for emergency first
    emergency = emergency_detector.detect(data.description, data.language)
    
    if emergency.is_emergency and emergency.severity == "critical":
        return {
            "is_emergency": True,
            "severity": "critical",
            "message": emergency.recommended_action,
            "emergency_contacts": emergency_detector.get_emergency_contacts()
        }
    
    # Analyze symptoms
    analysis = symptom_analyzer.analyze(data.description, data.language)
    
    return {
        "is_emergency": emergency.is_emergency,
        "symptoms": analysis["symptoms"],
        "conditions": analysis["conditions"],
        "confidence": analysis["overall_confidence"],
        "severity": analysis["overall_severity"],
        "requires_doctor": analysis["requires_doctor"]
    }


@router.get("/list")
async def list_common_symptoms():
    """Get list of common symptoms for UI selection"""
    categories = {
        "general": ["fever", "fatigue", "body_ache", "chills", "weight_loss"],
        "respiratory": ["cough", "shortness_of_breath", "runny_nose", "congestion", "throat_pain"],
        "gastrointestinal": ["nausea", "vomiting", "diarrhea", "abdominal_pain", "acidity"],
        "pain": ["headache", "chest_pain", "back_pain", "joint_pain"],
        "skin": ["rash", "itching"],
        "neurological": ["dizziness", "severe_headache"]
    }
    
    return {"symptom_categories": categories}


@router.get("/info/{symptom}")
async def get_symptom_info(symptom: str):
    """Get detailed information about a specific symptom"""
    from app.knowledge.symptoms_db import SYMPTOM_DATABASE
    
    symptom_data = SYMPTOM_DATABASE.get(symptom)
    
    if not symptom_data:
        return {"found": False, "message": "Symptom not found in database"}
    
    return {
        "found": True,
        "symptom": symptom,
        "category": symptom_data.get("category"),
        "severity": symptom_data.get("severity"),
        "keywords": symptom_data.get("keywords", [])
    }

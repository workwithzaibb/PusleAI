"""
AI Doctor Service - Main orchestrator for virtual doctor interactions
Combines all services for comprehensive health consultation
"""
from typing import Dict, List, Optional
from dataclasses import dataclass
from datetime import datetime
import uuid

from app.services.symptom_analyzer import symptom_analyzer, SymptomAnalyzer
from app.services.emergency_detector import emergency_detector, EmergencyDetector
from app.services.emotion_detector import emotion_detector, EmotionDetector
from app.services.language_detection import lang_detector, LanguageDetectionService
from app.config import settings


@dataclass
class DoctorResponse:
    """Complete AI Doctor response"""
    session_id: str
    message: str
    symptoms_detected: List[Dict]
    conditions: List[Dict]
    confidence_score: float
    severity: str
    is_emergency: bool
    emergency_action: Optional[str]
    advice: str
    home_care: List[str]
    warning_signs: List[str]
    should_see_doctor: bool
    follow_up_hours: Optional[int]
    emotional_support: Optional[str]
    language: str
    reasoning: str  # Explainable AI


class AIDoctorService:
    """
    Main AI Doctor service that orchestrates all health analysis
    """
    
    def __init__(self):
        self.symptom_analyzer = symptom_analyzer
        self.emergency_detector = emergency_detector
        self.emotion_detector = emotion_detector
        self.lang_detector = lang_detector
    
    async def consult(
        self,
        user_input: str,
        language: Optional[str] = None,
        user_history: Optional[Dict] = None,
        session_id: Optional[str] = None
    ) -> DoctorResponse:
        """
        Main consultation method
        
        Args:
            user_input: User's symptom description
            language: Language code (auto-detect if None)
            user_history: Previous medical history
            session_id: Existing session ID or None for new
            
        Returns:
            Complete DoctorResponse
        """
        # Generate session ID if new consultation
        if not session_id:
            session_id = str(uuid.uuid4())[:8]
        
        # Detect language if not specified
        if not language:
            language, _ = self.lang_detector.detect(user_input)
        
        # Check for emergency FIRST
        emergency = self.emergency_detector.detect(user_input, language)
        
        if emergency.is_emergency and emergency.severity == "critical":
            return self._create_emergency_response(
                session_id, emergency, language
            )
        
        # Analyze emotions
        emotion = self.emotion_detector.analyze_text(user_input)
        emotional_prefix = ""
        if emotion.requires_calm_response:
            emotional_prefix = self.emotion_detector.get_empathetic_prefix(emotion, language)
        
        # Analyze symptoms
        analysis = self.symptom_analyzer.analyze(user_input, language)
        
        # Generate response
        response = self._generate_response(
            session_id=session_id,
            analysis=analysis,
            emergency=emergency,
            emotion=emotion,
            emotional_prefix=emotional_prefix,
            language=language,
            user_input=user_input
        )
        
        return response
    
    def _create_emergency_response(
        self,
        session_id: str,
        emergency,
        language: str
    ) -> DoctorResponse:
        """Create emergency response"""
        contacts = self.emergency_detector.get_emergency_contacts()
        
        emergency_messages = {
            "en": f"⚠️ EMERGENCY DETECTED!\n\n{emergency.recommended_action}\n\nEmergency: {contacts['emergency']}\nAmbulance: {contacts['ambulance']}\n\nStay calm and seek help immediately.",
            "hi": f"⚠️ आपातकाल!\n\n{emergency.recommended_action}\n\nआपातकालीन: {contacts['emergency']}\nएम्बुलेंस: {contacts['ambulance']}\n\nशांत रहें और तुरंत मदद लें।"
        }
        
        return DoctorResponse(
            session_id=session_id,
            message=emergency_messages.get(language, emergency_messages["en"]),
            symptoms_detected=[],
            conditions=[],
            confidence_score=0.95,
            severity="critical",
            is_emergency=True,
            emergency_action=emergency.recommended_action,
            advice="Seek immediate medical attention",
            home_care=[],
            warning_signs=emergency.detected_keywords,
            should_see_doctor=True,
            follow_up_hours=None,
            emotional_support="Stay calm. Help is on the way.",
            language=language,
            reasoning=f"Emergency keywords detected: {', '.join(emergency.detected_keywords)}"
        )
    
    def _generate_response(
        self,
        session_id: str,
        analysis: Dict,
        emergency,
        emotion,
        emotional_prefix: str,
        language: str,
        user_input: str
    ) -> DoctorResponse:
        """Generate comprehensive response"""
        
        conditions = analysis.get("conditions", [])
        symptoms = analysis.get("symptoms", [])
        confidence = analysis.get("overall_confidence", 0.5)
        severity = analysis.get("overall_severity", "low")
        
        # Build advice message
        message_parts = []
        
        # Add emotional support if needed
        if emotional_prefix:
            message_parts.append(emotional_prefix)
        
        # Add main response
        if conditions:
            top_condition = conditions[0]
            if language == "en":
                message_parts.append(
                    f"Based on your symptoms, this could be related to {top_condition['name']}. "
                    f"{top_condition['advice']}"
                )
            elif language == "hi":
                message_parts.append(
                    f"आपके लक्षणों के आधार पर, यह {top_condition['name']} से संबंधित हो सकता है। "
                )
        else:
            if language == "en":
                message_parts.append(
                    "I've noted your symptoms. Please provide more details for better analysis."
                )
            elif language == "hi":
                message_parts.append(
                    "मैंने आपके लक्षण नोट कर लिए हैं। बेहतर विश्लेषण के लिए कृपया अधिक जानकारी दें।"
                )
        
        # Add confidence disclaimer
        if confidence < settings.CONFIDENCE_THRESHOLD_MEDIUM:
            if language == "en":
                message_parts.append(
                    f"\n\n⚠️ AI Confidence: {int(confidence * 100)}% - "
                    "I recommend consulting a doctor for accurate diagnosis."
                )
            elif language == "hi":
                message_parts.append(
                    f"\n\n⚠️ AI विश्वास: {int(confidence * 100)}% - "
                    "सटीक निदान के लिए डॉक्टर से परामर्श करें।"
                )
        
        # Collect home care tips
        home_care = []
        warning_signs = []
        for cond in conditions:
            home_care.extend(cond.get("home_care", []))
            warning_signs.extend(cond.get("warning_signs", []))
        
        # Determine follow-up
        follow_up_hours = None
        if severity in ["medium", "high"]:
            follow_up_hours = 24
        elif symptoms:
            follow_up_hours = 48
        
        # Build reasoning (Explainable AI)
        reasoning = self._build_reasoning(symptoms, conditions, confidence)
        
        return DoctorResponse(
            session_id=session_id,
            message="\n".join(message_parts),
            symptoms_detected=symptoms,
            conditions=conditions,
            confidence_score=confidence,
            severity=severity,
            is_emergency=emergency.is_emergency if emergency else False,
            emergency_action=emergency.recommended_action if emergency and emergency.is_emergency else None,
            advice=conditions[0]["advice"] if conditions else "Monitor your symptoms",
            home_care=list(set(home_care))[:5],
            warning_signs=list(set(warning_signs))[:5],
            should_see_doctor=analysis.get("requires_doctor", False),
            follow_up_hours=follow_up_hours,
            emotional_support=emotional_prefix if emotion.requires_calm_response else None,
            language=language,
            reasoning=reasoning
        )
    
    def _build_reasoning(
        self,
        symptoms: List,
        conditions: List,
        confidence: float
    ) -> str:
        """Build explainable AI reasoning"""
        parts = []
        
        if symptoms:
            symptom_names = [s["name"] for s in symptoms]
            parts.append(f"Detected symptoms: {', '.join(symptom_names)}")
        
        if conditions:
            parts.append(f"Top match: {conditions[0]['name']} ({int(conditions[0]['confidence']*100)}% match)")
            if len(conditions) > 1:
                other = [c["name"] for c in conditions[1:3]]
                parts.append(f"Other possibilities: {', '.join(other)}")
        
        parts.append(f"Overall confidence: {int(confidence * 100)}%")
        
        if confidence < 0.6:
            parts.append("Low confidence - more information needed or doctor consultation recommended")
        
        return " | ".join(parts)
    
    def get_disclaimer(self, language: str = "en") -> str:
        """Get medical disclaimer"""
        disclaimers = {
            "en": (
                "⚕️ Medical Disclaimer: This AI assistant provides general health information only. "
                "It does not replace professional medical advice, diagnosis, or treatment. "
                "Always consult a qualified healthcare provider for medical concerns."
            ),
            "hi": (
                "⚕️ चिकित्सा अस्वीकरण: यह AI सहायक केवल सामान्य स्वास्थ्य जानकारी प्रदान करता है। "
                "यह पेशेवर चिकित्सा सलाह का विकल्प नहीं है। "
                "चिकित्सा संबंधी चिंताओं के लिए हमेशा डॉक्टर से परामर्श करें।"
            )
        }
        return disclaimers.get(language, disclaimers["en"])


# Singleton instance
ai_doctor = AIDoctorService()

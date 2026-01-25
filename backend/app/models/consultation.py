"""
Consultation Model - Handles AI doctor consultation sessions
"""
from sqlalchemy import Column, Integer, String, Float, Text, DateTime, ForeignKey, Enum, JSON, Boolean
from sqlalchemy.orm import relationship
from datetime import datetime
import enum

from app.base import Base


class ConsultationStatus(str, enum.Enum):
    ACTIVE = "active"
    COMPLETED = "completed"
    ESCALATED = "escalated"
    EMERGENCY = "emergency"


class MessageType(str, enum.Enum):
    USER_TEXT = "user_text"
    USER_VOICE = "user_voice"
    AI_RESPONSE = "ai_response"
    SYSTEM = "system"


class Consultation(Base):
    """Main consultation session model"""
    __tablename__ = "consultations"
    
    id = Column(Integer, primary_key=True, index=True)
    
    # User reference
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    family_member_id = Column(Integer, ForeignKey("family_members.id"), nullable=True)
    session_id = Column(String(20), unique=True, index=True)
    language = Column(String(5), default="en")
    status = Column(Enum(ConsultationStatus), default=ConsultationStatus.ACTIVE)
    
    # Symptom analysis
    primary_symptoms = Column(JSON, default=list)  # List of symptoms
    detected_conditions = Column(JSON, default=list)  # Possible conditions
    
    # AI Analysis
    ai_confidence_score = Column(Float, default=0.0)
    severity_level = Column(String(20), default="low")  # low, medium, high, critical
    is_emergency = Column(Boolean, default=False)
    
    # Advice given
    advice_summary = Column(Text, nullable=True)
    home_care_tips = Column(JSON, default=list)
    warning_signs = Column(JSON, default=list)
    
    # Doctor escalation
    escalated_to_doctor = Column(Boolean, default=False)
    doctor_id = Column(Integer, ForeignKey("users.id"), nullable=True)
    escalation_reason = Column(Text, nullable=True)
    
    # Emotion detection
    detected_emotion = Column(String(20), nullable=True)
    stress_level = Column(Float, nullable=True)
    
    # Timestamps
    started_at = Column(DateTime, default=datetime.utcnow)
    ended_at = Column(DateTime, nullable=True)
    
    # Relationships
    user = relationship("User", back_populates="consultations", foreign_keys=[user_id])
    doctor = relationship("User", foreign_keys=[doctor_id], overlaps="doctor_consultations")
    messages = relationship("ConsultationMessage", back_populates="consultation")
    
    def __repr__(self):
        return f"<Consultation(id={self.id}, user_id={self.user_id}, status={self.status})>"

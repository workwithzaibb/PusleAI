"""
Follow-up Model - Handles automated patient follow-ups
"""
from sqlalchemy import Column, Integer, String, Text, DateTime, ForeignKey, Enum, Boolean
from sqlalchemy.orm import relationship
from datetime import datetime
import enum

from app.base import Base


class FollowUpStatus(str, enum.Enum):
    SCHEDULED = "scheduled"
    SENT = "sent"
    RESPONDED = "responded"
    ESCALATED = "escalated"
    COMPLETED = "completed"
    MISSED = "missed"


class FollowUp(Base):
    """Automated follow-up tracking"""
    __tablename__ = "follow_ups"
    
    id = Column(Integer, primary_key=True, index=True)
    
    # References
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    consultation_id = Column(Integer, ForeignKey("consultations.id"), nullable=False)
    
    # Follow-up details
    status = Column(Enum(FollowUpStatus), default=FollowUpStatus.SCHEDULED)
    scheduled_at = Column(DateTime, nullable=False)
    sent_at = Column(DateTime, nullable=True)
    responded_at = Column(DateTime, nullable=True)
    
    # Questions and responses
    follow_up_questions = Column(Text, nullable=True)  # JSON string
    patient_response = Column(Text, nullable=True)
    
    # AI Analysis of response
    symptoms_improved = Column(Boolean, nullable=True)
    symptoms_worsened = Column(Boolean, nullable=True)
    new_symptoms = Column(String(500), nullable=True)
    
    # Escalation
    requires_escalation = Column(Boolean, default=False)
    escalation_reason = Column(Text, nullable=True)
    
    # Notification
    notification_method = Column(String(20), default="sms")  # sms, voice, app
    notification_sent = Column(Boolean, default=False)
    
    # Timestamps
    created_at = Column(DateTime, default=datetime.utcnow)
    
    # Relationships
    user = relationship("User", back_populates="follow_ups")
    
    def __repr__(self):
        return f"<FollowUp(id={self.id}, status={self.status}, scheduled={self.scheduled_at})>"

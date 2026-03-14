"""
ConsultationMessage Model - Handles individual messages in a consultation
"""
from sqlalchemy import Column, Integer, String, Float, Text, DateTime, ForeignKey, Enum as SAEnum, JSON
from sqlalchemy.orm import relationship
from app.time_utils import utc_now
import enum

from app.base import Base

class MessageType(str, enum.Enum):
    USER_TEXT = "user_text"
    USER_VOICE = "user_voice"
    AI_RESPONSE = "ai_response"
    SYSTEM = "system"

class ConsultationMessage(Base):
    """Individual messages within a consultation"""
    __tablename__ = "consultation_messages"
    id = Column(Integer, primary_key=True, index=True)
    # Consultation reference
    consultation_id = Column(Integer, ForeignKey("consultations.id"), nullable=False)
    # Message details
    message_type = Column(SAEnum(MessageType), nullable=False)
    content = Column(Text, nullable=False)
    language = Column(String(5), default="en")
    # For voice messages
    audio_file_path = Column(String(255), nullable=True)
    transcription = Column(Text, nullable=True)
    # AI metadata
    ai_confidence = Column(Float, nullable=True)
    detected_symptoms = Column(JSON, default=list)
    detected_entities = Column(JSON, default=dict)  # medicines, body parts, etc.
    # Explainable AI
    reasoning = Column(Text, nullable=True)  # Why AI gave this response
    # Timestamp
    created_at = Column(DateTime, default=utc_now)
    # Relationships
    consultation = relationship("Consultation", back_populates="messages")
    def __repr__(self):
        return f"<Message(id={self.id}, type={self.message_type})>"




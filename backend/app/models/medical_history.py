"""
Medical History Model - Tracks patient medical records
"""
from sqlalchemy import Column, Integer, String, Text, DateTime, ForeignKey, JSON
from sqlalchemy.orm import relationship
from app.time_utils import utc_now
from app.base import Base


class MedicalHistory(Base):
    """Patient medical history and records"""
    __tablename__ = "medical_history"
    
    id = Column(Integer, primary_key=True, index=True)
    
    # User reference
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    family_member_id = Column(Integer, ForeignKey("family_members.id"), nullable=True)
    
    # Health conditions
    chronic_conditions = Column(JSON, default=list)  # Diabetes, Hypertension, etc.
    allergies = Column(JSON, default=list)  # Drug/food allergies
    past_surgeries = Column(JSON, default=list)
    
    # Current medications
    current_medications = Column(JSON, default=list)  # [{name, dosage, frequency}]
    
    # Vital records (from wearables or manual entry)
    recent_vitals = Column(JSON, default=dict)  # {bp, heart_rate, temperature, etc.}
    
    # Immunization records
    immunizations = Column(JSON, default=list)
    
    # Previous consultations summary
    consultation_summary = Column(Text, nullable=True)
    
    # Lifestyle factors
    smoking_status = Column(String(20), nullable=True)
    alcohol_consumption = Column(String(20), nullable=True)
    exercise_frequency = Column(String(50), nullable=True)
    diet_type = Column(String(50), nullable=True)
    
    # Timestamps
    created_at = Column(DateTime, default=utc_now)
    updated_at = Column(DateTime, default=utc_now, onupdate=utc_now)
    
    # Relationships
    user = relationship("User", back_populates="medical_history")
    
    def __repr__(self):
        return f"<MedicalHistory(id={self.id}, user_id={self.user_id})>"




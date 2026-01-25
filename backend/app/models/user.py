"""
User Model - Handles user accounts and authentication
"""
from sqlalchemy import Column, Integer, String, Boolean, DateTime, Enum
from sqlalchemy.orm import relationship
from datetime import datetime
import enum

from app.base import Base


class UserRole(str, enum.Enum):
    PATIENT = "patient"
    DOCTOR = "doctor"
    ADMIN = "admin"


class User(Base):
    """User account model for patients and doctors"""
    __tablename__ = "users"
    
    id = Column(Integer, primary_key=True, index=True)
    
    # Basic Info
    phone_number = Column(String(15), unique=True, index=True, nullable=False)
    email = Column(String(100), unique=True, index=True, nullable=True)
    full_name = Column(String(100), nullable=False)
    
    # Authentication
    hashed_password = Column(String(255), nullable=False)
    is_active = Column(Boolean, default=True)
    is_verified = Column(Boolean, default=False)
    
    # Role
    role = Column(Enum(UserRole), default=UserRole.PATIENT)
    
    # Preferences
    preferred_language = Column(String(5), default="en")
    voice_preference = Column(String(10), default="female")  # male/female
    
    # Profile
    age = Column(Integer, nullable=True)
    gender = Column(String(10), nullable=True)
    blood_group = Column(String(5), nullable=True)
    
    # Location (for rural areas)
    village = Column(String(100), nullable=True)
    district = Column(String(100), nullable=True)
    state = Column(String(100), nullable=True)
    pincode = Column(String(10), nullable=True)
    
    # Timestamps
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    last_login = Column(DateTime, nullable=True)
    
    # Relationships
    consultations = relationship(
        "Consultation",
        back_populates="user",
        foreign_keys="Consultation.user_id"
    )
    doctor_consultations = relationship(
        "Consultation",
        foreign_keys="Consultation.doctor_id",
        overlaps="doctor"
    )
    family_members = relationship("FamilyMember", back_populates="primary_user")
    follow_ups = relationship("FollowUp", back_populates="user")
    medical_history = relationship("MedicalHistory", back_populates="user")
    
    def __repr__(self):
        return f"<User(id={self.id}, phone={self.phone_number}, name={self.full_name})>"

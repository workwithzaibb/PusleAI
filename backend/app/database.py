"""
Database configuration and initialization
"""
from sqlalchemy import create_engine
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import sessionmaker
from typing import Generator

from app.config import settings

# Import all models to ensure they are registered with SQLAlchemy
from app.models.user import User
from app.models.consultation import Consultation
from app.models.consultation_message import ConsultationMessage
from app.models.family import FamilyMember
from app.models.followup import FollowUp
from app.models.medical_history import MedicalHistory
from app.models.medication import (
    Medication, MedicationSchedule, AdherenceLog, PillImage, DrugInteraction, UserMedicationPreference
)
from app.models.mental_health import (
    MoodEntry, JournalEntry, MentalHealthAssessment, TherapySession, TherapyMessage, CrisisEvent, CopingStrategy
)
from app.models.doctor import (
    DoctorProfile, Availability, Appointment, Prescription
)

# For SQLite (development)
SQLALCHEMY_DATABASE_URL = settings.DATABASE_URL

# Create engine
if "sqlite" in SQLALCHEMY_DATABASE_URL:
    engine = create_engine(
        SQLALCHEMY_DATABASE_URL,
        connect_args={"check_same_thread": False}
    )
else:
    engine = create_engine(SQLALCHEMY_DATABASE_URL)

# Session factory
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

from app.base import Base


async def init_db():
    """Initialize database and create tables"""
    Base.metadata.create_all(bind=engine)


def get_db():
    """Dependency to get database session"""
    try:
        db = SessionLocal()
        try:
            yield db
        finally:
            db.close()
    except Exception as e:
        print(f"DATABASE DEPENDENCY ERROR: {e}")
        import traceback
        traceback.print_exc()
        raise e

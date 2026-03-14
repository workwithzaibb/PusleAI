"""
Mental Health Models
"""
from sqlalchemy import Column, Integer, String, Text, DateTime, ForeignKey, Boolean, Float, Enum, JSON
from sqlalchemy.orm import relationship
from app.time_utils import utc_now
import enum

from app.base import Base


class MoodType(str, enum.Enum):
    HAPPY = "happy"
    EXCITED = "excited"
    GRATEFUL = "grateful"
    RELAXED = "relaxed"
    NEUTRAL = "neutral"
    TIRED = "tired"
    SAD = "sad"
    ANXIOUS = "anxious"
    ANGRY = "angry"
    STRESSED = "stressed"
    OVERWHELMED = "overwhelmed"


class CrisisLevel(str, enum.Enum):
    NONE = "none"
    LOW = "low"
    MODERATE = "moderate"
    HIGH = "high"
    CRITICAL = "critical"


class AssessmentType(str, enum.Enum):
    PHQ9 = "phq9"  # Depression
    GAD7 = "gad7"  # Anxiety
    STRESS = "stress"  # Perceived Stress Scale
    CUSTOM = "custom"


class MoodEntry(Base):
    __tablename__ = "mood_entries"
    
    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False, index=True)
    mood = Column(Enum(MoodType), nullable=False)
    valence = Column(Float, nullable=False)  # -1.0 (negative) to 1.0 (positive)
    arousal = Column(Float, nullable=False)  # 0.0 (low energy) to 1.0 (high energy)
    notes = Column(Text, nullable=True)
    activities = Column(JSON, nullable=True)  # List of activities: ["work", "exercise"]
    factors = Column(JSON, nullable=True)     # List of factors: ["sleep", "relationships"]
    created_at = Column(DateTime, default=utc_now)
    
    user = relationship("User", backref="mood_entries")


class JournalEntry(Base):
    __tablename__ = "journal_entries"
    
    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False, index=True)
    title = Column(String(200), nullable=True)
    content = Column(Text, nullable=False)
    entry_type = Column(String(50), default="text")  # text, voice, prompted
    sentiment_score = Column(Float, nullable=True)   # -1.0 to 1.0
    sentiment_magnitude = Column(Float, nullable=True)
    emotion_tags = Column(JSON, nullable=True)  # ["hopeful", "reflective"]
    is_private = Column(Boolean, default=True)
    created_at = Column(DateTime, default=utc_now)
    updated_at = Column(DateTime, default=utc_now, onupdate=utc_now)
    
    user = relationship("User", backref="journal_entries")


class MentalHealthAssessment(Base):
    __tablename__ = "mental_health_assessments"
    
    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False, index=True)
    assessment_type = Column(Enum(AssessmentType), nullable=False)
    score = Column(Integer, nullable=False)
    severity_label = Column(String(50), nullable=True)  # Mild, Moderate, Severe
    answers = Column(JSON, nullable=False)  # Full QA storage
    recommendations = Column(JSON, nullable=True)
    created_at = Column(DateTime, default=utc_now)
    
    user = relationship("User", backref="assessments")


class TherapySession(Base):
    __tablename__ = "therapy_sessions"
    
    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False, index=True)
    session_type = Column(String(50), default="general")  # cbt, ventilation, problem-solving
    start_time = Column(DateTime, default=utc_now)
    end_time = Column(DateTime, nullable=True)
    summary = Column(Text, nullable=True)
    key_insights = Column(JSON, nullable=True)
    sentiment_trend = Column(String(50), nullable=True)  # improving, worsening, stable
    
    messages = relationship("TherapyMessage", back_populates="session", cascade="all, delete-orphan")
    user = relationship("User", backref="therapy_sessions")


class TherapyMessage(Base):
    __tablename__ = "therapy_messages"
    
    id = Column(Integer, primary_key=True, index=True)
    session_id = Column(Integer, ForeignKey("therapy_sessions.id"), nullable=False, index=True)
    sender = Column(String(20), nullable=False)  # user, bot
    content = Column(Text, nullable=False)
    timestamp = Column(DateTime, default=utc_now)
    sentiment_score = Column(Float, nullable=True)
    
    session = relationship("TherapySession", back_populates="messages")


class CrisisEvent(Base):
    __tablename__ = "crisis_events"
    
    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False, index=True)
    risk_level = Column(Enum(CrisisLevel), nullable=False)
    trigger_source = Column(String(50), nullable=False)  # chat, journal, mood
    trigger_content = Column(Text, nullable=True)        # The text that triggered it
    action_taken = Column(String(100), nullable=True)    # notified_emergency, helpline_shown
    resolved = Column(Boolean, default=False)
    resolution_notes = Column(Text, nullable=True)
    created_at = Column(DateTime, default=utc_now)
    
    user = relationship("User", backref="crisis_events")


class CopingStrategy(Base):
    __tablename__ = "coping_strategies"
    
    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False, index=True)
    title = Column(String(200), nullable=False)
    category = Column(String(50), nullable=False)  # breathing, grounding, distraction
    content = Column(Text, nullable=True)
    effectiveness_rating = Column(Integer, default=0)  # 1-5 rating by user
    usage_count = Column(Integer, default=0)
    is_favorite = Column(Boolean, default=False)
    
    user = relationship("User", backref="coping_strategies")




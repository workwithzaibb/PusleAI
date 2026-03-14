"""
Mental Health Schemas
"""
from pydantic import BaseModel, Field, ConfigDict
from typing import List, Optional, Dict, Any
from datetime import datetime
from enum import Enum


class MoodType(str, Enum):
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


# ============ Mood Schemas ============

class MoodCheckinRequest(BaseModel):
    mood: MoodType
    valence: float = Field(..., ge=-1.0, le=1.0, description="Positivity: -1.0 to 1.0")
    arousal: float = Field(..., ge=0.0, le=1.0, description="Energy: 0.0 to 1.0")
    notes: Optional[str] = None
    activities: Optional[List[str]] = []
    factors: Optional[List[str]] = []


class MoodEntryResponse(BaseModel):
    id: int
    mood: MoodType
    valence: float
    arousal: float
    notes: Optional[str]
    activities: Optional[List[str]]
    factors: Optional[List[str]]
    created_at: datetime

    model_config = ConfigDict(from_attributes=True)


# ============ Journal Schemas ============

class JournalRequest(BaseModel):
    title: Optional[str] = None
    content: str = Field(..., min_length=1)
    entry_type: str = "text"
    is_private: bool = True
    emotion_tags: Optional[List[str]] = []


class JournalResponse(BaseModel):
    id: int
    title: Optional[str]
    content: str
    entry_type: str
    sentiment_score: Optional[float]
    emotion_tags: Optional[List[str]]
    created_at: datetime
    
    model_config = ConfigDict(from_attributes=True)


# ============ Chat/Therapy Schemas ============

class ChatRequest(BaseModel):
    message: str = Field(..., min_length=1)
    session_id: Optional[int] = None
    context: Optional[Dict[str, Any]] = None


class ChatResponse(BaseModel):
    response: str
    session_id: int
    sentiment_detected: Optional[str]
    suggested_actions: Optional[List[Dict[str, str]]] = []
    crisis_detected: bool = False


# ============ Assessment Schemas ============

class AssessmentAnswer(BaseModel):
    question_id: str
    score: int
    text: Optional[str] = None


class AssessmentRequest(BaseModel):
    assessment_type: str  # phq9, gad7
    answers: List[AssessmentAnswer]


class AssessmentResponse(BaseModel):
    id: int
    assessment_type: str
    total_score: int
    severity: str
    recommendations: List[str]
    created_at: datetime

    model_config = ConfigDict(from_attributes=True)


# ============ Crisis Schemas ============

class CrisisReportRequest(BaseModel):
    source: str
    content: str


class CrisisResponse(BaseModel):
    risk_level: str
    requires_immediate_help: bool
    helpline_numbers: List[Dict[str, str]]
    safety_plan: Optional[str]


# ============ Insights Schemas ============

class InsightMetric(BaseModel):
    label: str
    value: Any
    trend: str  # up, down, stable
    description: str


class MentalHealthInsightsResponse(BaseModel):
    weekly_mood_average: float
    mood_stability_score: float
    top_triggers: List[str]
    positive_activities: List[str]
    journal_sentiment_trend: List[float]
    metrics: List[InsightMetric]
    suggestions: List[str]

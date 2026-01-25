"""
Configuration settings for Pulse AI Backend
"""
from pydantic_settings import BaseSettings
from typing import Optional
from functools import lru_cache


class Settings(BaseSettings):
    """Application settings loaded from environment variables"""
    
    # Application Settings
    APP_NAME: str = "Pulse AI"
    APP_VERSION: str = "1.0.0"
    DEBUG: bool = True
    API_PREFIX: str = "/api/v1"
    
    # Server Settings
    HOST: str = "0.0.0.0"
    PORT: int = 8000
    
    # Database Settings
    DATABASE_URL: str = "sqlite:///./healthtrack.db"
    MONGODB_URL: Optional[str] = None
    
    # JWT Settings
    SECRET_KEY: str = "your-secret-key-change-in-production"
    ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 30
    
    # AI/ML Settings
    WHISPER_MODEL: str = "base"  # tiny, base, small, medium, large
    OPENAI_API_KEY: Optional[str] = None
    GEMINI_API_KEY: Optional[str] = None  # Google Gemini API Key
    
    # Language Settings
    SUPPORTED_LANGUAGES: list = ["en", "hi", "ta", "te"]
    DEFAULT_LANGUAGE: str = "en"
    
    # Medical AI Settings
    CONFIDENCE_THRESHOLD_LOW: float = 0.4
    CONFIDENCE_THRESHOLD_MEDIUM: float = 0.7
    EMERGENCY_KEYWORDS: list = [
        "chest pain", "difficulty breathing", "severe bleeding",
        "unconscious", "heart attack", "stroke", "seizure"
    ]
    
    # Follow-up Settings
    FOLLOW_UP_HOURS: list = [24, 48, 72]
    
    # TTS Settings
    TTS_ENGINE: str = "gtts"  # gtts or elevenlabs
    
    # ElevenLabs Voice Cloning Settings
    ELEVENLABS_API_KEY: Optional[str] = None
    ELEVENLABS_VOICE_ID: Optional[str] = None  # Your cloned voice ID
    
    # Medication Reminder Settings
    MEDICATION_FEATURE_ENABLED: bool = True
    REMINDER_SNOOZE_MINUTES: int = 15
    DEFAULT_REMINDER_ADVANCE_MINUTES: int = 5
    CAREGIVER_NOTIFY_AFTER_MINUTES: int = 60
    
    # Twilio Settings (for SMS/WhatsApp/Voice)
    TWILIO_ACCOUNT_SID: Optional[str] = None
    TWILIO_AUTH_TOKEN: Optional[str] = None
    TWILIO_PHONE_NUMBER: Optional[str] = None
    TWILIO_WHATSAPP_NUMBER: Optional[str] = None
    
    # Mental Health Feature
    MENTAL_HEALTH_FEATURE_ENABLED: bool = True
    CRISIS_HELPLINE_NUMBER: str = "988"
    
    class Config:
        env_file = ".env"
        case_sensitive = True


@lru_cache()
def get_settings() -> Settings:
    """Get cached settings instance"""
    return Settings()


settings = get_settings()

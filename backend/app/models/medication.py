"""
Medication Models - Handles medication reminders, schedules, and adherence tracking
"""
from sqlalchemy import Column, Integer, String, Boolean, DateTime, Float, ForeignKey, Text, Enum, Time
from sqlalchemy.orm import relationship
from datetime import datetime
import enum

from app.base import Base


class FrequencyType(str, enum.Enum):
    """Medication frequency options"""
    ONCE_DAILY = "once_daily"
    TWICE_DAILY = "twice_daily"
    THREE_TIMES_DAILY = "three_times_daily"
    FOUR_TIMES_DAILY = "four_times_daily"
    EVERY_X_HOURS = "every_x_hours"
    AS_NEEDED = "as_needed"
    WEEKLY = "weekly"
    CUSTOM = "custom"


class MedicationTiming(str, enum.Enum):
    """When to take medication relative to meals"""
    BEFORE_FOOD = "before_food"
    WITH_FOOD = "with_food"
    AFTER_FOOD = "after_food"
    EMPTY_STOMACH = "empty_stomach"
    ANY_TIME = "any_time"
    BEDTIME = "bedtime"


class AdherenceStatus(str, enum.Enum):
    """Status of medication dose"""
    PENDING = "pending"
    TAKEN = "taken"
    MISSED = "missed"
    SKIPPED = "skipped"
    SNOOZED = "snoozed"


class Medication(Base):
    """User medication with dosage and schedule information"""
    __tablename__ = "medications"
    
    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False, index=True)
    
    # Medication Details
    name = Column(String(200), nullable=False)
    generic_name = Column(String(200), nullable=True)
    dosage = Column(String(100), nullable=False)  # e.g., "500mg", "2 tablets"
    dosage_unit = Column(String(50), default="mg")  # mg, ml, tablets, capsules
    form = Column(String(50), nullable=True)  # tablet, capsule, syrup, injection
    
    # Frequency & Timing
    frequency = Column(Enum(FrequencyType), default=FrequencyType.ONCE_DAILY)
    frequency_hours = Column(Integer, nullable=True)  # For "every X hours" type
    timing = Column(Enum(MedicationTiming), default=MedicationTiming.ANY_TIME)
    
    # Duration
    start_date = Column(DateTime, default=datetime.utcnow)
    end_date = Column(DateTime, nullable=True)
    duration_days = Column(Integer, nullable=True)
    is_ongoing = Column(Boolean, default=False)  # For chronic conditions
    
    # Additional Info
    purpose = Column(String(255), nullable=True)  # What condition is it for
    prescribing_doctor = Column(String(100), nullable=True)
    pharmacy = Column(String(100), nullable=True)
    refill_reminder_days = Column(Integer, default=7)  # Days before end to remind
    quantity = Column(Integer, nullable=True)  # Pills remaining
    
    # Special Instructions
    instructions = Column(Text, nullable=True)
    warnings = Column(Text, nullable=True)
    
    # Allergies & Interactions
    is_critical = Column(Boolean, default=False)  # Life-saving medication
    requires_food = Column(Boolean, default=False)
    avoid_alcohol = Column(Boolean, default=False)
    
    # Status
    is_active = Column(Boolean, default=True)
    
    # Timestamps
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    
    # Relationships
    user = relationship("User", backref="medications")
    schedules = relationship("MedicationSchedule", back_populates="medication", cascade="all, delete-orphan")
    adherence_logs = relationship("AdherenceLog", back_populates="medication", cascade="all, delete-orphan")
    pill_images = relationship("PillImage", back_populates="medication", cascade="all, delete-orphan")
    
    def __repr__(self):
        return f"<Medication(id={self.id}, name={self.name}, user_id={self.user_id})>"


class MedicationSchedule(Base):
    """Scheduled reminder times for medications"""
    __tablename__ = "medication_schedules"
    
    id = Column(Integer, primary_key=True, index=True)
    medication_id = Column(Integer, ForeignKey("medications.id"), nullable=False, index=True)
    
    # Schedule Time
    scheduled_time = Column(Time, nullable=False)  # Time of day (e.g., 08:00)
    timezone = Column(String(50), default="UTC")
    
    # Days of week (for weekly schedules)
    monday = Column(Boolean, default=True)
    tuesday = Column(Boolean, default=True)
    wednesday = Column(Boolean, default=True)
    thursday = Column(Boolean, default=True)
    friday = Column(Boolean, default=True)
    saturday = Column(Boolean, default=True)
    sunday = Column(Boolean, default=True)
    
    # Reminder Settings
    reminder_enabled = Column(Boolean, default=True)
    reminder_advance_minutes = Column(Integer, default=5)  # Remind X minutes before
    
    # Notification Preferences
    notify_whatsapp = Column(Boolean, default=True)
    notify_sms = Column(Boolean, default=False)
    notify_email = Column(Boolean, default=False)
    notify_push = Column(Boolean, default=True)
    notify_voice_call = Column(Boolean, default=False)  # For critical meds
    
    # Snooze Settings
    snooze_count = Column(Integer, default=0)  # Times snoozed today
    max_snooze_count = Column(Integer, default=3)
    snooze_minutes = Column(Integer, default=15)
    
    # Labels
    label = Column(String(50), nullable=True)  # "Morning", "Afternoon", "Evening", "Night"
    
    # Status
    is_active = Column(Boolean, default=True)
    
    # Timestamps
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    
    # Relationship
    medication = relationship("Medication", back_populates="schedules")
    
    def __repr__(self):
        return f"<MedicationSchedule(id={self.id}, time={self.scheduled_time}, med_id={self.medication_id})>"


class AdherenceLog(Base):
    """Log of medication doses - taken, missed, or skipped"""
    __tablename__ = "adherence_logs"
    
    id = Column(Integer, primary_key=True, index=True)
    medication_id = Column(Integer, ForeignKey("medications.id"), nullable=False, index=True)
    schedule_id = Column(Integer, ForeignKey("medication_schedules.id"), nullable=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False, index=True)
    
    # Scheduled vs Actual Time
    scheduled_datetime = Column(DateTime, nullable=False)
    actual_datetime = Column(DateTime, nullable=True)  # When actually taken
    
    # Status
    status = Column(Enum(AdherenceStatus), default=AdherenceStatus.PENDING)
    
    # Delay
    delay_minutes = Column(Integer, nullable=True)  # How late was the dose
    
    # Skip Reason
    skip_reason = Column(String(255), nullable=True)
    notes = Column(Text, nullable=True)
    
    # Caregiver Notification
    caregiver_notified = Column(Boolean, default=False)
    caregiver_notified_at = Column(DateTime, nullable=True)
    
    # Timestamps
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    
    # Relationships
    medication = relationship("Medication", back_populates="adherence_logs")
    user = relationship("User", backref="adherence_logs")
    
    def __repr__(self):
        return f"<AdherenceLog(id={self.id}, status={self.status}, med_id={self.medication_id})>"


class PillImage(Base):
    """Stored pill images for medication identification"""
    __tablename__ = "pill_images"
    
    id = Column(Integer, primary_key=True, index=True)
    medication_id = Column(Integer, ForeignKey("medications.id"), nullable=True)  # Null if unidentified
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    
    # Image Data
    image_path = Column(String(500), nullable=False)
    image_hash = Column(String(64), nullable=True)  # For deduplication
    
    # Identification Results
    is_identified = Column(Boolean, default=False)
    identified_name = Column(String(200), nullable=True)
    confidence_score = Column(Float, nullable=True)
    identification_method = Column(String(50), nullable=True)  # "ml_model", "barcode", "manual"
    
    # Metadata
    captured_at = Column(DateTime, default=datetime.utcnow)
    
    # Relationships
    medication = relationship("Medication", back_populates="pill_images")
    user = relationship("User", backref="pill_images")
    
    def __repr__(self):
        return f"<PillImage(id={self.id}, identified={self.is_identified})>"


class DrugInteraction(Base):
    """Known drug interactions database"""
    __tablename__ = "drug_interactions"
    
    id = Column(Integer, primary_key=True, index=True)
    
    # Drug Names (generic names for matching)
    drug_a = Column(String(200), nullable=False, index=True)
    drug_b = Column(String(200), nullable=False, index=True)
    
    # Interaction Details
    severity = Column(String(20), nullable=False)  # "mild", "moderate", "severe", "contraindicated"
    description = Column(Text, nullable=False)
    recommendation = Column(Text, nullable=True)
    
    # Category
    interaction_type = Column(String(50), nullable=True)  # "pharmacokinetic", "pharmacodynamic"
    
    # Source
    source = Column(String(200), nullable=True)  # Reference source
    
    # Status
    is_verified = Column(Boolean, default=True)
    
    # Timestamps
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    
    def __repr__(self):
        return f"<DrugInteraction(drug_a={self.drug_a}, drug_b={self.drug_b}, severity={self.severity})>"


class UserMedicationPreference(Base):
    """User preferences for medication reminders"""
    __tablename__ = "user_medication_preferences"
    
    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False, unique=True)
    
    # Default Notification Settings
    default_notify_whatsapp = Column(Boolean, default=True)
    default_notify_sms = Column(Boolean, default=False)
    default_notify_email = Column(Boolean, default=False)
    default_notify_push = Column(Boolean, default=True)
    
    # Timezone
    timezone = Column(String(50), default="Asia/Kolkata")
    
    # Reminder Window
    morning_start = Column(Time, nullable=True)  # e.g., 06:00
    morning_end = Column(Time, nullable=True)  # e.g., 10:00
    evening_start = Column(Time, nullable=True)
    evening_end = Column(Time, nullable=True)
    
    # Caregiver Settings
    caregiver_phone = Column(String(15), nullable=True)
    caregiver_email = Column(String(100), nullable=True)
    notify_caregiver_after_minutes = Column(Integer, default=60)  # Notify if missed for X minutes
    
    # Gamification
    streak_count = Column(Integer, default=0)
    longest_streak = Column(Integer, default=0)
    total_doses_taken = Column(Integer, default=0)
    total_doses_scheduled = Column(Integer, default=0)
    
    # Timestamps
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    
    # Relationship
    user = relationship("User", backref="medication_preferences", uselist=False)
    
    def __repr__(self):
        return f"<UserMedicationPreference(user_id={self.user_id})>"

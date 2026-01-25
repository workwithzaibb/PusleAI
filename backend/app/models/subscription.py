"""
Subscription Models for Doctor Registration
Handles subscription plans, purchases, and doctor premium features.
"""
from sqlalchemy import Column, Integer, String, Text, DateTime, ForeignKey, Boolean, Float, Enum, JSON
from sqlalchemy.orm import relationship
from datetime import datetime, timedelta
import enum

from app.base import Base


class PlanTier(str, enum.Enum):
    STARTER = "starter"
    PROFESSIONAL = "professional"
    ENTERPRISE = "enterprise"


class PaymentStatus(str, enum.Enum):
    PENDING = "pending"
    COMPLETED = "completed"
    FAILED = "failed"
    REFUNDED = "refunded"


class SubscriptionStatus(str, enum.Enum):
    ACTIVE = "active"
    EXPIRED = "expired"
    CANCELLED = "cancelled"
    PENDING = "pending"


class SubscriptionPlan(Base):
    """
    Defines available subscription plans for doctors.
    """
    __tablename__ = "subscription_plans"
    
    id = Column(Integer, primary_key=True, index=True)
    name = Column(String(100), nullable=False)  # "Starter", "Professional", "Enterprise"
    tier = Column(Enum(PlanTier), nullable=False, unique=True)
    
    # Pricing
    price = Column(Float, nullable=False)  # Monthly price
    currency = Column(String(10), default="USD")
    billing_period_days = Column(Integer, default=30)  # 30 for monthly, 365 for yearly
    
    # Features
    description = Column(Text, nullable=True)
    features = Column(JSON, default=list)  # List of feature strings
    max_appointments_per_month = Column(Integer, default=50)
    priority_listing = Column(Boolean, default=False)
    video_consultation = Column(Boolean, default=False)
    ai_assistant = Column(Boolean, default=False)
    analytics_dashboard = Column(Boolean, default=False)
    custom_branding = Column(Boolean, default=False)
    
    # Display
    is_popular = Column(Boolean, default=False)
    is_active = Column(Boolean, default=True)
    display_order = Column(Integer, default=0)
    
    created_at = Column(DateTime, default=datetime.utcnow)


class DoctorSubscription(Base):
    """
    Tracks a doctor's active subscription.
    """
    __tablename__ = "doctor_subscriptions"
    
    id = Column(Integer, primary_key=True, index=True)
    doctor_id = Column(Integer, ForeignKey("doctor_profiles.id"), nullable=False, index=True)
    plan_id = Column(Integer, ForeignKey("subscription_plans.id"), nullable=False)
    
    status = Column(Enum(SubscriptionStatus), default=SubscriptionStatus.PENDING)
    
    start_date = Column(DateTime, nullable=True)
    end_date = Column(DateTime, nullable=True)
    
    # Auto-renewal
    auto_renew = Column(Boolean, default=True)
    
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    
    doctor = relationship("DoctorProfile", backref="subscriptions")
    plan = relationship("SubscriptionPlan", backref="subscriptions")


class Payment(Base):
    """
    Records payment transactions for subscriptions.
    """
    __tablename__ = "payments"
    
    id = Column(Integer, primary_key=True, index=True)
    subscription_id = Column(Integer, ForeignKey("doctor_subscriptions.id"), nullable=False, index=True)
    
    amount = Column(Float, nullable=False)
    currency = Column(String(10), default="USD")
    
    status = Column(Enum(PaymentStatus), default=PaymentStatus.PENDING)
    
    # Payment provider info
    payment_method = Column(String(50), nullable=True)  # "card", "paypal", "upi"
    transaction_id = Column(String(200), nullable=True)  # From payment gateway
    payment_gateway = Column(String(50), nullable=True)  # "stripe", "razorpay", etc.
    
    # Card details (masked)
    card_last_four = Column(String(4), nullable=True)
    card_brand = Column(String(20), nullable=True)  # "visa", "mastercard"
    
    # Timestamps
    paid_at = Column(DateTime, nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow)
    
    subscription = relationship("DoctorSubscription", backref="payments")


class DoctorPerk(Base):
    """
    Additional one-time perks doctors can purchase.
    """
    __tablename__ = "doctor_perks"
    
    id = Column(Integer, primary_key=True, index=True)
    name = Column(String(100), nullable=False)
    description = Column(Text, nullable=True)
    price = Column(Float, nullable=False)
    currency = Column(String(10), default="USD")
    
    # Perk type
    perk_type = Column(String(50), nullable=False)  # "profile_boost", "featured_listing", "badge"
    duration_days = Column(Integer, nullable=True)  # How long the perk lasts (null = permanent)
    
    icon = Column(String(50), nullable=True)  # Icon name for frontend
    is_active = Column(Boolean, default=True)
    
    created_at = Column(DateTime, default=datetime.utcnow)


class DoctorPerkPurchase(Base):
    """
    Tracks perks purchased by doctors.
    """
    __tablename__ = "doctor_perk_purchases"
    
    id = Column(Integer, primary_key=True, index=True)
    doctor_id = Column(Integer, ForeignKey("doctor_profiles.id"), nullable=False, index=True)
    perk_id = Column(Integer, ForeignKey("doctor_perks.id"), nullable=False)
    
    purchase_date = Column(DateTime, default=datetime.utcnow)
    expiry_date = Column(DateTime, nullable=True)
    
    is_active = Column(Boolean, default=True)
    
    # Payment reference
    payment_transaction_id = Column(String(200), nullable=True)
    amount_paid = Column(Float, nullable=False)
    
    doctor = relationship("DoctorProfile", backref="purchased_perks")
    perk = relationship("DoctorPerk", backref="purchases")

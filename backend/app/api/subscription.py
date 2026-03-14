"""
Subscription API Endpoints
Handles subscription plans, doctor registration with payment, and perk purchases.
"""
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from sqlalchemy import select
from typing import List, Optional
from datetime import datetime, timedelta
from app.time_utils import utc_now
from pydantic import BaseModel, Field, ConfigDict

from app.database import get_db
from app.models.subscription import (
    SubscriptionPlan, DoctorSubscription, Payment, DoctorPerk, DoctorPerkPurchase,
    PlanTier, PaymentStatus, SubscriptionStatus
)
from app.models.doctor import DoctorProfile
from app.models.user import User
from app.api.auth import get_current_user

router = APIRouter(prefix="/subscriptions", tags=["Subscriptions"])


# ============== Pydantic Schemas ==============

class PlanFeature(BaseModel):
    name: str
    included: bool


class SubscriptionPlanResponse(BaseModel):
    id: int
    name: str
    tier: PlanTier
    price: float
    currency: str
    billing_period_days: int
    description: Optional[str]
    features: List[str]
    max_appointments_per_month: int
    priority_listing: bool
    video_consultation: bool
    ai_assistant: bool
    analytics_dashboard: bool
    custom_branding: bool
    is_popular: bool
    
    model_config = ConfigDict(from_attributes=True)


class DoctorRegistrationRequest(BaseModel):
    # Doctor profile info
    specialty: str = Field(..., min_length=2, max_length=100)
    license_number: str = Field(..., min_length=5, max_length=50)
    bio: Optional[str] = None
    experience_years: int = Field(default=0, ge=0)
    consultation_fee: float = Field(default=0.0, ge=0)
    languages: List[str] = ["English"]
    clinic_name: Optional[str] = None
    clinic_address: Optional[str] = None
    clinic_phone: Optional[str] = None
    
    # Subscription
    plan_id: int
    
    # Payment info (mock for now)
    payment_method: str = "card"
    card_number: Optional[str] = None  # Will be masked
    card_expiry: Optional[str] = None
    card_cvv: Optional[str] = None


class DoctorRegistrationResponse(BaseModel):
    message: str
    doctor_id: int
    subscription_id: int
    payment_id: int
    plan_name: str
    subscription_end_date: datetime


class PerkResponse(BaseModel):
    id: int
    name: str
    description: Optional[str]
    price: float
    currency: str
    perk_type: str
    duration_days: Optional[int]
    icon: Optional[str]
    
    model_config = ConfigDict(from_attributes=True)


class PurchasePerkRequest(BaseModel):
    perk_id: int
    payment_method: str = "card"


class SubscriptionStatusResponse(BaseModel):
    has_subscription: bool
    is_active: bool
    plan_name: Optional[str]
    plan_tier: Optional[PlanTier]
    end_date: Optional[datetime]
    days_remaining: Optional[int]
    features: List[str]


# ============== API Endpoints ==============

@router.get("/plans", response_model=List[SubscriptionPlanResponse])
async def get_subscription_plans(db: Session = Depends(get_db)):
    """
    Get all available subscription plans for doctors.
    """
    result = db.execute(
        select(SubscriptionPlan)
        .where(SubscriptionPlan.is_active == True)
        .order_by(SubscriptionPlan.display_order)
    )
    plans = result.scalars().all()
    
    # If no plans exist, create default ones
    if not plans:
        plans = await create_default_plans(db)
    
    return plans


async def create_default_plans(db: Session) -> List[SubscriptionPlan]:
    """Create default subscription plans if none exist."""
    default_plans = [
        SubscriptionPlan(
            name="Starter",
            tier=PlanTier.STARTER,
            price=1999,
            currency="INR",
            billing_period_days=30,
            description="Perfect for new doctors starting their practice",
            features=[
                "Up to 50 appointments/month",
                "Basic profile listing",
                "Email & WhatsApp support",
                "Patient messaging",
                "Appointment scheduling"
            ],
            max_appointments_per_month=50,
            priority_listing=False,
            video_consultation=False,
            ai_assistant=False,
            analytics_dashboard=False,
            custom_branding=False,
            is_popular=False,
            display_order=1
        ),
        SubscriptionPlan(
            name="Professional",
            tier=PlanTier.PROFESSIONAL,
            price=4999,
            currency="INR",
            billing_period_days=30,
            description="For established doctors who want to grow",
            features=[
                "Unlimited appointments",
                "Priority profile listing",
                "Video consultations",
                "AI diagnostic assistant",
                "Analytics dashboard",
                "Priority WhatsApp support",
                "Patient reviews highlight"
            ],
            max_appointments_per_month=999999,
            priority_listing=True,
            video_consultation=True,
            ai_assistant=True,
            analytics_dashboard=True,
            custom_branding=False,
            is_popular=True,
            display_order=2
        ),
        SubscriptionPlan(
            name="Enterprise",
            tier=PlanTier.ENTERPRISE,
            price=14999,
            currency="INR",
            billing_period_days=30,
            description="For clinics and hospital chains",
            features=[
                "Everything in Professional",
                "Custom branding",
                "Multi-doctor support",
                "API access",
                "Dedicated account manager",
                "White-label options",
                "Advanced analytics",
                "Priority feature requests"
            ],
            max_appointments_per_month=999999,
            priority_listing=True,
            video_consultation=True,
            ai_assistant=True,
            analytics_dashboard=True,
            custom_branding=True,
            is_popular=False,
            display_order=3
        )
    ]
    
    for plan in default_plans:
        db.add(plan)
    db.commit()
    
    for plan in default_plans:
        db.refresh(plan)
    
    return default_plans


@router.post("/register-doctor", response_model=DoctorRegistrationResponse)
async def register_as_doctor(
    request: DoctorRegistrationRequest,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    Register as a doctor with a subscription plan.
    Requires payment for the selected plan.
    """
    # Check if user is already a doctor
    existing_doctor = db.execute(
        select(DoctorProfile).where(DoctorProfile.user_id == current_user.id)
    ).scalar_one_or_none()
    
    if existing_doctor:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="You are already registered as a doctor"
        )
    
    # Check if license number is unique
    existing_license = db.execute(
        select(DoctorProfile).where(DoctorProfile.license_number == request.license_number)
    ).scalar_one_or_none()
    
    if existing_license:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="This license number is already registered"
        )
    
    # Get the selected plan
    plan = db.execute(
        select(SubscriptionPlan).where(SubscriptionPlan.id == request.plan_id)
    ).scalar_one_or_none()
    
    if not plan:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Selected subscription plan not found"
        )
    
    # Create doctor profile
    doctor = DoctorProfile(
        user_id=current_user.id,
        specialty=request.specialty,
        license_number=request.license_number,
        bio=request.bio,
        experience_years=request.experience_years,
        consultation_fee=request.consultation_fee,
        languages=request.languages,
        clinic_name=request.clinic_name,
        clinic_address=request.clinic_address,
        clinic_phone=request.clinic_phone,
        is_verified=False  # Needs admin verification
    )
    db.add(doctor)
    db.flush()  # Get doctor.id
    
    # Create subscription
    start_date = utc_now()
    end_date = start_date + timedelta(days=plan.billing_period_days)
    
    subscription = DoctorSubscription(
        doctor_id=doctor.id,
        plan_id=plan.id,
        status=SubscriptionStatus.ACTIVE,
        start_date=start_date,
        end_date=end_date,
        auto_renew=True
    )
    db.add(subscription)
    db.flush()
    
    # Process payment (mock payment processing)
    payment = Payment(
        subscription_id=subscription.id,
        amount=plan.price,
        currency=plan.currency,
        status=PaymentStatus.COMPLETED,  # Mock: auto-complete
        payment_method=request.payment_method,
        transaction_id=f"TXN_{utc_now().strftime('%Y%m%d%H%M%S')}_{subscription.id}",
        payment_gateway="mock_gateway",
        card_last_four=request.card_number[-4:] if request.card_number else None,
        paid_at=utc_now()
    )
    db.add(payment)
    
    db.commit()
    db.refresh(doctor)
    db.refresh(subscription)
    db.refresh(payment)
    
    return DoctorRegistrationResponse(
        message="Successfully registered as a doctor!",
        doctor_id=doctor.id,
        subscription_id=subscription.id,
        payment_id=payment.id,
        plan_name=plan.name,
        subscription_end_date=end_date
    )


@router.get("/my-subscription", response_model=SubscriptionStatusResponse)
async def get_my_subscription(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    Get current user's doctor subscription status.
    """
    # Get doctor profile
    doctor = db.execute(
        select(DoctorProfile).where(DoctorProfile.user_id == current_user.id)
    ).scalar_one_or_none()
    
    if not doctor:
        return SubscriptionStatusResponse(
            has_subscription=False,
            is_active=False,
            plan_name=None,
            plan_tier=None,
            end_date=None,
            days_remaining=None,
            features=[]
        )
    
    # Get active subscription
    subscription = db.execute(
        select(DoctorSubscription)
        .where(DoctorSubscription.doctor_id == doctor.id)
        .where(DoctorSubscription.status == SubscriptionStatus.ACTIVE)
        .order_by(DoctorSubscription.end_date.desc())
    ).scalar_one_or_none()
    
    if not subscription:
        return SubscriptionStatusResponse(
            has_subscription=False,
            is_active=False,
            plan_name=None,
            plan_tier=None,
            end_date=None,
            days_remaining=None,
            features=[]
        )
    
    plan = subscription.plan
    days_remaining = (subscription.end_date - utc_now()).days if subscription.end_date else 0
    
    return SubscriptionStatusResponse(
        has_subscription=True,
        is_active=subscription.status == SubscriptionStatus.ACTIVE and days_remaining > 0,
        plan_name=plan.name,
        plan_tier=plan.tier,
        end_date=subscription.end_date,
        days_remaining=max(0, days_remaining),
        features=plan.features or []
    )


@router.get("/perks", response_model=List[PerkResponse])
async def get_available_perks(db: Session = Depends(get_db)):
    """
    Get all available perks for purchase.
    """
    result = db.execute(
        select(DoctorPerk).where(DoctorPerk.is_active == True)
    )
    perks = result.scalars().all()
    
    # Create default perks if none exist
    if not perks:
        perks = await create_default_perks(db)
    
    return perks


async def create_default_perks(db: Session) -> List[DoctorPerk]:
    """Create default perks if none exist."""
    default_perks = [
        DoctorPerk(
            name="Profile Boost",
            description="Get featured at the top of search results for 7 days",
            price=999,
            currency="INR",
            perk_type="profile_boost",
            duration_days=7,
            icon="rocket"
        ),
        DoctorPerk(
            name="Verified Badge",
            description="Get a verified badge on your profile (permanent)",
            price=2499,
            currency="INR",
            perk_type="badge",
            duration_days=None,  # Permanent
            icon="badge-check"
        ),
        DoctorPerk(
            name="Featured Listing",
            description="Appear in the featured doctors section for 30 days",
            price=4999,
            currency="INR",
            perk_type="featured_listing",
            duration_days=30,
            icon="star"
        ),
        DoctorPerk(
            name="Priority Support",
            description="Get priority WhatsApp & call support for 30 days",
            price=1499,
            currency="INR",
            perk_type="priority_support",
            duration_days=30,
            icon="headphones"
        )
    ]
    
    for perk in default_perks:
        db.add(perk)
    db.commit()
    
    for perk in default_perks:
        db.refresh(perk)
    
    return default_perks


@router.post("/purchase-perk")
async def purchase_perk(
    request: PurchasePerkRequest,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    Purchase a perk for the doctor profile.
    """
    # Get doctor profile
    doctor = db.execute(
        select(DoctorProfile).where(DoctorProfile.user_id == current_user.id)
    ).scalar_one_or_none()
    
    if not doctor:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="You must be registered as a doctor to purchase perks"
        )
    
    # Get the perk
    perk = db.execute(
        select(DoctorPerk).where(DoctorPerk.id == request.perk_id)
    ).scalar_one_or_none()
    
    if not perk:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Perk not found"
        )
    
    # Calculate expiry date
    expiry_date = None
    if perk.duration_days:
        expiry_date = utc_now() + timedelta(days=perk.duration_days)
    
    # Create purchase record
    purchase = DoctorPerkPurchase(
        doctor_id=doctor.id,
        perk_id=perk.id,
        purchase_date=utc_now(),
        expiry_date=expiry_date,
        is_active=True,
        payment_transaction_id=f"PERK_{utc_now().strftime('%Y%m%d%H%M%S')}_{perk.id}",
        amount_paid=perk.price
    )
    db.add(purchase)
    db.commit()
    db.refresh(purchase)
    
    return {
        "message": f"Successfully purchased {perk.name}!",
        "purchase_id": purchase.id,
        "perk_name": perk.name,
        "expiry_date": expiry_date,
        "amount_paid": perk.price
    }




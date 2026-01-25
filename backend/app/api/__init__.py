# API Routers
from app.api.auth import router as auth_router
from app.api.users import router as users_router
from app.api.consultation import router as consultation_router
from app.api.symptoms import router as symptoms_router
from app.api.emergency import router as emergency_router
from app.api.tts import router as tts_router
from app.api.stt import router as stt_router
from app.api.medicine import router as medicine_router
from app.api.followup import router as followup_router
from app.api.family import router as family_router
from app.api.medication_reminder import router as medication_reminder_router
from app.api.mental_health import router as mental_health_router
from app.api.doctor import router as doctor_router
from app.api.appointments import router as appointments_router
from app.api.subscription import router as subscription_router
from app.api.prescription import router as prescription_router
from app.api.elevenlabs import router as elevenlabs_router

__all__ = [
    "auth_router",
    "users_router",
    "consultation_router",
    "symptoms_router",
    "emergency_router",
    "tts_router",
    "stt_router",
    "medicine_router",
    "followup_router",
    "family_router",
    "medication_reminder_router",
    "mental_health_router",
    "doctor_router",
    "appointments_router",
    "subscription_router",
    "prescription_router",
    "elevenlabs_router"
]




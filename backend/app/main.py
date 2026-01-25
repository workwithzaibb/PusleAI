"""
Pulse AI - Main Application Entry Point
Multilingual Virtual Doctor for Underprivileged Communities
"""
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from contextlib import asynccontextmanager
from fastapi.responses import PlainTextResponse
from fastapi.requests import Request
import traceback

from app.config import settings
from app.database import init_db
from app.api import (
    auth_router,
    users_router,
    consultation_router,
    symptoms_router,
    emergency_router,
    tts_router,
    stt_router,
    medicine_router,
    followup_router,
    family_router,
    medication_reminder_router,
    mental_health_router,
    doctor_router,
    appointments_router,
    subscription_router,
    prescription_router,
    elevenlabs_router
)


@asynccontextmanager
async def lifespan(app: FastAPI):
    """Lifecycle manager for startup and shutdown events"""
    # Startup
    print(f"🏥 Starting {settings.APP_NAME} v{settings.APP_VERSION}")
    await init_db()
    print("✅ Database initialized")
    print(f"🌐 Supported languages: {', '.join(settings.SUPPORTED_LANGUAGES)}")
    yield
    # Shutdown
    print("👋 Shutting down Pulse AI...")


# Create FastAPI application
app = FastAPI(
    title=settings.APP_NAME,
    description="""
    ## Pulse AI - Multilingual Virtual Doctor
    
    An AI-powered healthcare assistance platform designed to provide basic medical 
    guidance to underprivileged and rural populations through a multilingual virtual doctor.
    
    ### Features:
    - 🎤 Voice-based AI Doctor interaction
    - 🌍 Multilingual Support (English, Hindi, Tamil, Telugu)
    - 🩺 Smart Symptom Checker with AI Confidence Score
    - 🚨 Emergency & Triage Detection
    - 👨‍⚕️ Doctor Escalation System
    - 💊 Medicine Safety Checker
    - 👨‍👩‍👧‍👦 Family Health Accounts
    - 📅 Automated Follow-up System
    - 💊 Medication Reminder System with Smart Scheduling
    - 🧠 Mental Health Companion with Mood Tracking
    - 👨‍⚕️ Doctor Dashboard & Appointment Booking
    """,
    version=settings.APP_VERSION,
    lifespan=lifespan
)

# Global exception handler for debugging
@app.exception_handler(Exception)
async def global_exception_handler(request: Request, exc: Exception):
    tb = traceback.format_exc()
    print(f"[GLOBAL ERROR] {exc}\n{tb}")
    return PlainTextResponse(f"Internal server error: {exc}\n{tb}", status_code=500)

# Configure CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Open for now, change to frontend URL in production
    allow_credentials=False,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include API routers
app.include_router(auth_router, prefix=f"{settings.API_PREFIX}/auth", tags=["Authentication"])
app.include_router(users_router, prefix=f"{settings.API_PREFIX}/users", tags=["Users"])
app.include_router(consultation_router, prefix=f"{settings.API_PREFIX}/consultation", tags=["Consultation"])
app.include_router(symptoms_router, prefix=f"{settings.API_PREFIX}/symptoms", tags=["Symptom Checker"])
app.include_router(emergency_router, prefix=f"{settings.API_PREFIX}/emergency", tags=["Emergency"])
app.include_router(tts_router, prefix=f"{settings.API_PREFIX}/tts", tags=["Text-to-Speech"])
app.include_router(stt_router, prefix=f"{settings.API_PREFIX}/stt", tags=["Speech-to-Text"])
app.include_router(medicine_router, prefix=f"{settings.API_PREFIX}/medicine", tags=["Medicine Safety"])
app.include_router(followup_router, prefix=f"{settings.API_PREFIX}/followup", tags=["Follow-up"])
app.include_router(family_router, prefix=f"{settings.API_PREFIX}/family", tags=["Family Health"])
app.include_router(medication_reminder_router, prefix=f"{settings.API_PREFIX}/medication", tags=["Medication Reminders"])
app.include_router(mental_health_router, prefix=f"{settings.API_PREFIX}/mental-health", tags=["Mental Health"])
app.include_router(doctor_router, prefix=f"{settings.API_PREFIX}/doctor", tags=["Doctors"])
app.include_router(appointments_router, prefix=f"{settings.API_PREFIX}/appointments", tags=["Appointments"])
app.include_router(subscription_router, prefix=f"{settings.API_PREFIX}", tags=["Subscriptions"])

app.include_router(prescription_router, prefix=f"{settings.API_PREFIX}", tags=["Prescription Scanner"])
app.include_router(elevenlabs_router, prefix=f"{settings.API_PREFIX}/elevenlabs", tags=["ElevenLabs"])


@app.get("/", tags=["Health Check"])
async def root():
    """Root endpoint - Health check"""
    return {
        "status": "healthy",
        "app": settings.APP_NAME,
        "version": settings.APP_VERSION,
        "message": "Pulse AI is running! 🏥"
    }


@app.get("/health", tags=["Health Check"])
async def health_check():
    """Detailed health check endpoint"""
    return {
        "status": "healthy",
        "database": "connected",
        "ai_services": {
            "stt": "ready",
            "tts": "ready",
            "symptom_checker": "ready",
            "emergency_detection": "ready"
        },
        "supported_languages": settings.SUPPORTED_LANGUAGES
    }


if __name__ == "__main__":
    import uvicorn
    uvicorn.run(
        "app.main:app",
        host=settings.HOST,
        port=settings.PORT,
        reload=settings.DEBUG
    )

"""
Speech-to-Text Router
"""
from fastapi import APIRouter, Depends, HTTPException, UploadFile, File
import base64

from app.models.user import User
from app.schemas import STTResponse
from app.api.auth import get_current_user
from app.services.speech_to_text import stt_service

router = APIRouter()


@router.post("/transcribe", response_model=STTResponse)
async def transcribe_audio(
    file: UploadFile = File(...),
    language: str = None,
    current_user: User = Depends(get_current_user)
):
    """Transcribe uploaded audio file to text"""
    try:
        # Read audio data
        audio_data = await file.read()
        
        # Transcribe
        transcription, detected_lang, confidence = await stt_service.transcribe(
            audio_data=audio_data,
            language=language
        )
        
        return STTResponse(
            transcription=transcription,
            detected_language=detected_lang,
            confidence=confidence
        )
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"STT error: {str(e)}")


@router.post("/transcribe/base64", response_model=STTResponse)
async def transcribe_base64(
    audio_base64: str,
    language: str = None,
    current_user: User = Depends(get_current_user)
):
    """Transcribe base64 encoded audio to text"""
    try:
        # Decode base64
        audio_data = base64.b64decode(audio_base64)
        
        # Transcribe
        transcription, detected_lang, confidence = await stt_service.transcribe(
            audio_data=audio_data,
            language=language
        )
        
        return STTResponse(
            transcription=transcription,
            detected_language=detected_lang,
            confidence=confidence
        )
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"STT error: {str(e)}")


@router.get("/models")
async def get_available_models():
    """Get available STT models"""
    return {
        "models": ["tiny", "base", "small", "medium", "large"],
        "current": "base",
        "note": "Larger models are more accurate but slower"
    }

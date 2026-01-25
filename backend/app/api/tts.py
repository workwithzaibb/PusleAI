"""
Text-to-Speech Router
"""
from fastapi import APIRouter, Depends, HTTPException, Header
from fastapi.responses import Response
from typing import Optional
import base64

from app.models.user import User
from app.schemas import TTSRequest, TTSResponse
from app.api.auth import get_current_user_optional
from app.services.text_to_speech import tts_service

router = APIRouter()


@router.post("/synthesize", response_model=TTSResponse)
async def synthesize_speech(
    data: TTSRequest,
    current_user: Optional[User] = Depends(get_current_user_optional)
):
    """Convert text to speech and return as base64 (auth optional for TTS)"""
    try:
        audio_base64 = await tts_service.synthesize_base64(
            text=data.text,
            language=data.language,
            slow=data.slow
        )
        
        return TTSResponse(audio_base64=audio_base64)
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"TTS error: {str(e)}")


@router.post("/synthesize/audio")
async def synthesize_audio_file(
    data: TTSRequest,
    current_user: Optional[User] = Depends(get_current_user_optional)
):
    """Convert text to speech and return as audio file"""
    try:
        audio_data = await tts_service.synthesize(
            text=data.text,
            language=data.language,
            slow=data.slow
        )
        
        return Response(
            content=audio_data,
            media_type="audio/mpeg",
            headers={"Content-Disposition": "attachment; filename=response.mp3"}
        )
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"TTS error: {str(e)}")


@router.get("/languages")
async def get_tts_languages():
    """Get supported TTS languages"""
    return {
        "languages": tts_service.get_supported_languages(),
        "default": "en"
    }

"""
Groq AI Voice Agent API
Provides STT (Whisper) and TTS (Orpheus) endpoints via Groq's OpenAI-compatible API.
"""
import os
import httpx
import traceback
from fastapi import APIRouter, HTTPException, UploadFile, File, Form
from fastapi.responses import Response, JSONResponse
from pydantic import BaseModel
from typing import Optional
from app.services.text_to_speech import tts_service

router = APIRouter(tags=["Groq AI Agent"])

GROQ_API_KEY = os.getenv("GROQ_API_KEY", "")
GROQ_BASE_URL = "https://api.groq.com/openai/v1"

# --- TTS Models & Voices ---
# Orpheus TTS (current as of Jan 2026)
TTS_MODEL = "playai-tts"
TTS_VOICES = [
    "Arista-PlayAI", "Atlas-PlayAI", "Basil-PlayAI", "Briggs-PlayAI",
    "Calista-PlayAI", "Celeste-PlayAI", "Cheyenne-PlayAI", "Chip-PlayAI",
    "Cillian-PlayAI", "Deedee-PlayAI", "Eleanor-PlayAI", "Fritz-PlayAI",
    "Gail-PlayAI", "Indigo-PlayAI", "Mamaw-PlayAI", "Mason-PlayAI",
    "Mikail-PlayAI", "Mitch-PlayAI", "Nia-PlayAI", "Quinn-PlayAI",
    "Thunder-PlayAI", "Wagner-PlayAI"
]
DEFAULT_VOICE = "Celeste-PlayAI"  # Female voice for Dr. Maya

# --- STT Models ---
STT_MODEL = "whisper-large-v3-turbo"


class TTSRequest(BaseModel):
    text: str
    voice: Optional[str] = DEFAULT_VOICE
    speed: Optional[float] = 1.0
    response_format: Optional[str] = "mp3"
    language: Optional[str] = "en"


class ChatRequest(BaseModel):
    message: str
    session_id: Optional[str] = None
    language: str = "en"
    history: Optional[list] = None


def _get_headers():
    """Get authorization headers for Groq API."""
    if not GROQ_API_KEY:
        raise HTTPException(
            status_code=500,
            detail="GROQ_API_KEY not configured. Set it in your .env file."
        )
    return {
        "Authorization": f"Bearer {GROQ_API_KEY}",
        "Content-Type": "application/json"
    }


@router.post("/tts")
async def groq_tts(req: TTSRequest):
    """
    Convert text to speech based on language.
    Uses Groq TTS for English, falls back to gTTS for other languages.
    """
    try:
        # Use our centralized TTS service that handles language routing
        audio_bytes = await tts_service.synthesize(req.text, req.language)
        
        if not audio_bytes:
            raise HTTPException(status_code=500, detail="Failed to synthesize audio")
            
        content_type_map = {
            "wav": "audio/wav",
            "mp3": "audio/mpeg",
            "flac": "audio/flac",
            "ogg": "audio/ogg",
        }
        content_type = content_type_map.get(
            req.response_format, "audio/mpeg"
        )

        return Response(
            content=audio_bytes,
            media_type=content_type,
            headers={"Content-Disposition": f"inline; filename=speech.{req.response_format or 'mp3'}"}
        )

    except HTTPException:
        raise
    except Exception as e:
        print(f"[GROQ TTS ERROR] Exception: {e}\n{traceback.format_exc()}")
        raise HTTPException(status_code=500, detail=str(e))


@router.post("/stt")
async def groq_stt(
    file: UploadFile = File(...),
    model: str = Form(default=STT_MODEL),
    language: str = Form(default="en"),
    prompt: str = Form(default="")
):
    """
    Convert speech to text using Groq's Whisper STT API.
    Accepts audio file upload and returns transcription.
    """
    try:
        if not GROQ_API_KEY:
            raise HTTPException(
                status_code=500,
                detail="GROQ_API_KEY not configured."
            )

        audio_data = await file.read()
        
        print(f"[GROQ STT] Transcribing {file.filename} ({len(audio_data)} bytes), lang={language}")

        # Groq STT uses multipart form data
        headers = {
            "Authorization": f"Bearer {GROQ_API_KEY}"
        }

        form_data = {
            "model": (None, model),
            "language": (None, language),
        }
        if prompt:
            form_data["prompt"] = (None, prompt)

        files_data = {
            "file": (file.filename or "audio.webm", audio_data, file.content_type or "audio/webm")
        }

        async with httpx.AsyncClient(timeout=30.0) as client:
            response = await client.post(
                f"{GROQ_BASE_URL}/audio/transcriptions",
                headers=headers,
                data={k: v[1] if isinstance(v, tuple) else v for k, v in form_data.items()},
                files=files_data
            )

            if response.status_code != 200:
                error_text = response.text
                print(f"[GROQ STT ERROR] {response.status_code}: {error_text}")
                return JSONResponse(
                    status_code=response.status_code,
                    content={"error": error_text}
                )

            result = response.json()
            print(f"[GROQ STT] Result: {result.get('text', '')[:100]}")
            return result

    except HTTPException:
        raise
    except Exception as e:
        print(f"[GROQ STT ERROR] Exception: {e}\n{traceback.format_exc()}")
        raise HTTPException(status_code=500, detail=str(e))


@router.get("/voices")
async def list_voices():
    """List available TTS voices."""
    return {
        "voices": TTS_VOICES,
        "default": DEFAULT_VOICE,
        "model": TTS_MODEL
    }


@router.get("/status")
async def groq_status():
    """Check Groq API configuration status."""
    configured = bool(GROQ_API_KEY)
    return {
        "configured": configured,
        "tts_model": TTS_MODEL,
        "stt_model": STT_MODEL,
        "default_voice": DEFAULT_VOICE,
        "message": "Groq AI is ready!" if configured else "GROQ_API_KEY not set. Add it to your .env file."
    }

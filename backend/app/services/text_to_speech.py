"""
Text-to-Speech Service for multilingual voice responses
Supports Groq TTS (Orpheus) and Google TTS as fallback
"""
import os
import tempfile
from typing import Optional
from gtts import gTTS
import base64
import httpx

from app.config import settings


# Language code mapping for gTTS
LANGUAGE_MAP = {
    "en": "en",
    "hi": "hi", 
    "ta": "ta",
    "te": "te"
}

# Groq TTS configuration
GROQ_TTS_MODEL = "playai-tts"
GROQ_TTS_VOICE = "Celeste-PlayAI"  # Female voice for Dr. Maya
GROQ_BASE_URL = "https://api.groq.com/openai/v1"


class TextToSpeechService:
    """Handles text-to-speech conversion"""
    
    def __init__(self):
        self.engine = settings.TTS_ENGINE
        self.groq_api_key = getattr(settings, 'GROQ_API_KEY', None)
        
    async def synthesize_groq(
        self,
        text: str,
        voice: str = None
    ) -> bytes:
        """
        Convert text to speech using Groq's TTS API (Orpheus model)
        
        Args:
            text: Text to convert
            voice: Groq voice name (uses default if not provided)
            
        Returns:
            Audio data as bytes
        """
        voice = voice or GROQ_TTS_VOICE
        
        if not self.groq_api_key:
            print("Groq not configured, falling back to gTTS")
            return await self.synthesize_gtts(text)
        
        try:
            headers = {
                "Authorization": f"Bearer {self.groq_api_key}",
                "Content-Type": "application/json"
            }
            
            data = {
                "model": GROQ_TTS_MODEL,
                "input": text,
                "voice": voice,
                "response_format": "mp3",
                "speed": 1.0
            }
            
            async with httpx.AsyncClient() as client:
                response = await client.post(
                    f"{GROQ_BASE_URL}/audio/speech",
                    json=data,
                    headers=headers,
                    timeout=30.0
                )
                
                if response.status_code == 200:
                    return response.content
                else:
                    print(f"Groq TTS error: {response.status_code} - {response.text}")
                    return await self.synthesize_gtts(text)
                    
        except Exception as e:
            print(f"Groq TTS error: {e}")
            return await self.synthesize_gtts(text)
    
    async def synthesize_gtts(
        self,
        text: str,
        language: str = "en",
        slow: bool = False
    ) -> bytes:
        """Convert text to speech using Google TTS"""
        try:
            lang_code = LANGUAGE_MAP.get(language, "en")
            tts = gTTS(text=text, lang=lang_code, slow=slow)
            
            with tempfile.NamedTemporaryFile(suffix=".mp3", delete=False) as f:
                tts.save(f.name)
                temp_path = f.name
            
            with open(temp_path, "rb") as f:
                audio_data = f.read()
            
            os.unlink(temp_path)
            return audio_data
            
        except Exception as e:
            print(f"gTTS error: {e}")
            return b""
        
    async def synthesize(
        self,
        text: str,
        language: str = "en",
        slow: bool = False
    ) -> bytes:
        """
        Convert text to speech audio
        
        Args:
            text: Text to convert
            language: Language code
            slow: Whether to speak slowly (accessibility feature)
            
        Returns:
            Audio data as bytes
        """
        # Use Groq TTS if configured (currently supports English)
        if self.groq_api_key and language == "en":
            return await self.synthesize_groq(text)
        
        # Fallback to gTTS for other languages or if Groq not configured
        return await self.synthesize_gtts(text, language, slow)
    
    async def synthesize_base64(
        self,
        text: str,
        language: str = "en",
        slow: bool = False
    ) -> str:
        """Convert text to speech and return as base64 string"""
        audio_data = await self.synthesize(text, language, slow)
        return base64.b64encode(audio_data).decode("utf-8")
    
    def get_supported_languages(self) -> list:
        """Get list of supported languages"""
        return list(LANGUAGE_MAP.keys())


# Singleton instance
tts_service = TextToSpeechService()

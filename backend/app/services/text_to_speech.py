"""
Text-to-Speech Service for multilingual voice responses
Supports Google TTS and ElevenLabs for voice cloning
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


class TextToSpeechService:
    """Handles text-to-speech conversion"""
    
    def __init__(self):
        self.engine = settings.TTS_ENGINE
        self.elevenlabs_api_key = getattr(settings, 'ELEVENLABS_API_KEY', None)
        self.elevenlabs_voice_id = getattr(settings, 'ELEVENLABS_VOICE_ID', None)
        
    async def synthesize_elevenlabs(
        self,
        text: str,
        voice_id: str = None
    ) -> bytes:
        """
        Convert text to speech using ElevenLabs API
        
        Args:
            text: Text to convert
            voice_id: ElevenLabs voice ID (uses default if not provided)
            
        Returns:
            Audio data as bytes
        """
        voice_id = voice_id or self.elevenlabs_voice_id
        
        if not self.elevenlabs_api_key or not voice_id:
            print("ElevenLabs not configured, falling back to gTTS")
            return await self.synthesize_gtts(text)
        
        try:
            url = f"https://api.elevenlabs.io/v1/text-to-speech/{voice_id}"
            
            headers = {
                "Accept": "audio/mpeg",
                "Content-Type": "application/json",
                "xi-api-key": self.elevenlabs_api_key
            }
            
            data = {
                "text": text,
                "model_id": "eleven_monolingual_v1",
                "voice_settings": {
                    "stability": 0.5,
                    "similarity_boost": 0.75
                }
            }
            
            async with httpx.AsyncClient() as client:
                response = await client.post(url, json=data, headers=headers, timeout=30.0)
                
                if response.status_code == 200:
                    return response.content
                else:
                    print(f"ElevenLabs error: {response.status_code} - {response.text}")
                    return await self.synthesize_gtts(text)
                    
        except Exception as e:
            print(f"ElevenLabs error: {e}")
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
        # Use ElevenLabs if configured and language is English
        if self.elevenlabs_api_key and self.elevenlabs_voice_id and language == "en":
            return await self.synthesize_elevenlabs(text)
        
        # Fallback to gTTS for other languages or if ElevenLabs not configured
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

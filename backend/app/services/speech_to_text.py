"""
Speech-to-Text Service using OpenAI Whisper
"""
import os
import tempfile
from typing import Optional, Tuple
import numpy as np

from app.config import settings

# Try to import whisper, but make it optional
try:
    import whisper  # type: ignore
    WHISPER_AVAILABLE = True
except ImportError:
    whisper = None  # type: ignore
    WHISPER_AVAILABLE = False
    print("⚠️ Whisper not installed. STT features will be limited.")


class SpeechToTextService:
    """Handles speech-to-text conversion using Whisper"""
    
    _instance = None
    _model = None
    
    def __new__(cls):
        if cls._instance is None:
            cls._instance = super().__new__(cls)
        return cls._instance
    
    def __init__(self):
        if self._model is None and WHISPER_AVAILABLE:
            self._load_model()
    
    def _load_model(self):
        """Load Whisper model"""
        if not WHISPER_AVAILABLE:
            print("⚠️ Whisper not available, STT disabled")
            return
        try:
            self._model = whisper.load_model(settings.WHISPER_MODEL)
            print(f"✅ Whisper model '{settings.WHISPER_MODEL}' loaded successfully")
        except Exception as e:
            print(f"❌ Failed to load Whisper model: {e}")
            self._model = None
    
    async def transcribe(
        self, 
        audio_data: bytes,
        language: Optional[str] = None
    ) -> Tuple[str, str, float]:
        """
        Transcribe audio to text
        
        Args:
            audio_data: Raw audio bytes
            language: Optional language code (auto-detect if None)
            
        Returns:
            Tuple of (transcription, detected_language, confidence)
        """
        if self._model is None:
            return "", "en", 0.0
        
        try:
            # Save audio to temp file
            with tempfile.NamedTemporaryFile(suffix=".wav", delete=False) as f:
                f.write(audio_data)
                temp_path = f.name
            
            # Transcribe
            options = {"language": language} if language else {}
            result = self._model.transcribe(temp_path, **options)
            
            # Clean up
            os.unlink(temp_path)
            
            transcription = result.get("text", "").strip()
            detected_lang = result.get("language", "en")
            
            # Calculate confidence from segments
            segments = result.get("segments", [])
            if segments:
                avg_confidence = np.mean([s.get("no_speech_prob", 0) for s in segments])
                confidence = 1 - avg_confidence
            else:
                confidence = 0.8
            
            return transcription, detected_lang, confidence
            
        except Exception as e:
            print(f"Transcription error: {e}")
            return "", "en", 0.0
    
    async def transcribe_file(self, file_path: str, language: Optional[str] = None) -> Tuple[str, str, float]:
        """Transcribe audio from file path"""
        with open(file_path, "rb") as f:
            audio_data = f.read()
        return await self.transcribe(audio_data, language)


# Singleton instance
stt_service = SpeechToTextService()

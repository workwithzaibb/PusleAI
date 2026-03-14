"""
Language Detection Service for multilingual support
"""
from typing import Tuple, Optional
from langdetect import detect, detect_langs, LangDetectException

from app.config import settings


# Mapping of detected language codes to our supported codes
LANG_CODE_MAP = {
    "en": "en",
    "hi": "hi",
    "ta": "ta",
    "te": "te",
    "mr": "mr",
    "bn": "hi",  # Bengali fallback to Hindi
    "gu": "hi",  # Gujarati fallback to Hindi
}


class LanguageDetectionService:
    """Handles automatic language detection"""
    
    def __init__(self):
        self.supported_languages = settings.SUPPORTED_LANGUAGES
        self.default_language = settings.DEFAULT_LANGUAGE
    
    def detect(self, text: str) -> Tuple[str, float]:
        """
        Detect language of given text
        
        Args:
            text: Input text
            
        Returns:
            Tuple of (language_code, confidence)
        """
        if not text or len(text.strip()) < 3:
            return self.default_language, 0.5
        
        try:
            # Get language probabilities
            langs = detect_langs(text)
            
            if not langs:
                return self.default_language, 0.5
            
            # Get highest probability language
            detected = langs[0]
            lang_code = str(detected.lang)
            confidence = detected.prob
            
            # Map to supported language
            mapped_lang = LANG_CODE_MAP.get(lang_code, self.default_language)
            
            # If detected language is not supported, use default
            if mapped_lang not in self.supported_languages:
                return self.default_language, confidence * 0.5
            
            return mapped_lang, confidence
            
        except LangDetectException:
            return self.default_language, 0.3
        except Exception as e:
            print(f"Language detection error: {e}")
            return self.default_language, 0.3
    
    def detect_simple(self, text: str) -> str:
        """Simple detection returning just the language code"""
        lang, _ = self.detect(text)
        return lang
    
    def is_supported(self, language: str) -> bool:
        """Check if a language is supported"""
        return language in self.supported_languages


# Singleton instance
lang_detector = LanguageDetectionService()

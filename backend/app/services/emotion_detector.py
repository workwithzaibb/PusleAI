"""
Emotion & Stress Detection Service
Basic voice/text sentiment analysis for empathetic responses
"""
from typing import Dict, Tuple, Optional
from dataclasses import dataclass
import re


@dataclass
class EmotionResult:
    """Emotion detection result"""
    primary_emotion: str
    confidence: float
    stress_level: float  # 0-1
    sentiment: str  # positive, negative, neutral
    requires_calm_response: bool


# Emotion keywords
EMOTION_PATTERNS = {
    "anxiety": [
        "worried", "anxious", "nervous", "scared", "fear", "panic",
        "can't sleep", "restless", "uneasy", "tense", "stressed"
    ],
    "sadness": [
        "sad", "depressed", "hopeless", "crying", "lonely", "grief",
        "lost", "empty", "worthless", "tired of life"
    ],
    "anger": [
        "angry", "frustrated", "irritated", "annoyed", "furious",
        "upset", "mad", "hate"
    ],
    "fear": [
        "afraid", "terrified", "frightened", "scared", "phobia",
        "panic attack", "dread"
    ],
    "confusion": [
        "confused", "don't understand", "lost", "overwhelmed",
        "don't know what to do"
    ],
    "pain": [
        "hurting", "suffering", "agony", "unbearable", "severe pain",
        "can't take it"
    ]
}

# Stress indicators
STRESS_INDICATORS = [
    "can't cope", "too much", "overwhelmed", "breaking down",
    "at my limit", "exhausted", "burned out", "no energy",
    "can't handle", "falling apart"
]

# Crisis keywords (need immediate gentle response)
CRISIS_KEYWORDS = [
    "suicide", "kill myself", "end it", "don't want to live",
    "no reason to live", "better off dead", "self harm", "hurt myself"
]


class EmotionDetector:
    """Detects emotions and stress from text/voice input"""
    
    def __init__(self):
        self.emotion_patterns = EMOTION_PATTERNS
        self.stress_indicators = STRESS_INDICATORS
        self.crisis_keywords = CRISIS_KEYWORDS
    
    def analyze_text(self, text: str) -> EmotionResult:
        """
        Analyze text for emotional content
        
        Args:
            text: User input text
            
        Returns:
            EmotionResult with detected emotion
        """
        text_lower = text.lower()
        
        # Check for crisis first
        if self._check_crisis(text_lower):
            return EmotionResult(
                primary_emotion="crisis",
                confidence=0.95,
                stress_level=1.0,
                sentiment="negative",
                requires_calm_response=True
            )
        
        # Detect emotions
        emotion_scores = {}
        for emotion, keywords in self.emotion_patterns.items():
            score = sum(1 for kw in keywords if kw in text_lower)
            if score > 0:
                emotion_scores[emotion] = score
        
        # Calculate stress level
        stress_score = sum(1 for ind in self.stress_indicators if ind in text_lower)
        stress_level = min(stress_score / 3, 1.0)
        
        # Determine primary emotion
        if emotion_scores:
            primary_emotion = max(emotion_scores, key=emotion_scores.get)
            confidence = min(emotion_scores[primary_emotion] / 3, 0.9)
        else:
            primary_emotion = "neutral"
            confidence = 0.6
        
        # Determine sentiment
        negative_emotions = ["anxiety", "sadness", "anger", "fear", "pain"]
        if primary_emotion in negative_emotions:
            sentiment = "negative"
        elif primary_emotion == "neutral":
            sentiment = "neutral"
        else:
            sentiment = "positive"
        
        # Determine if calm response needed
        requires_calm = (
            stress_level > 0.5 or 
            primary_emotion in ["anxiety", "fear", "sadness", "pain"]
        )
        
        return EmotionResult(
            primary_emotion=primary_emotion,
            confidence=confidence,
            stress_level=stress_level,
            sentiment=sentiment,
            requires_calm_response=requires_calm
        )
    
    def _check_crisis(self, text: str) -> bool:
        """Check for mental health crisis indicators"""
        return any(kw in text for kw in self.crisis_keywords)
    
    def get_empathetic_prefix(self, emotion: EmotionResult, language: str = "en") -> str:
        """Get appropriate empathetic response prefix based on emotion"""
        prefixes = {
            "en": {
                "crisis": "I hear you, and I want you to know that help is available. Please call a helpline: ",
                "anxiety": "I understand you're feeling anxious. Let me help you. ",
                "sadness": "I'm sorry you're going through this. ",
                "fear": "It's okay to feel scared. Let's work through this together. ",
                "pain": "I'm sorry you're in pain. Let me help you find relief. ",
                "anger": "I understand your frustration. ",
                "neutral": ""
            },
            "hi": {
                "crisis": "मैं समझता/समझती हूं। कृपया हेल्पलाइन पर कॉल करें: ",
                "anxiety": "मैं समझता हूं कि आप चिंतित हैं। ",
                "sadness": "मुझे खेद है कि आप इससे गुजर रहे हैं। ",
                "pain": "मुझे दुख है कि आपको दर्द है। ",
                "neutral": ""
            },
            "mr": {
                "crisis": "मी तुमचे म्हणणे समजतो/समजते. कृपया हेल्पलाइनवर कॉल करा: ",
                "anxiety": "तुम्ही चिंतित आहात हे मला समजते. ",
                "sadness": "तुम्ही कठीण वेळेतून जात आहात याची मला खंत आहे. ",
                "pain": "तुम्हाला वेदना होत आहेत याबद्दल मला वाईट वाटते. ",
                "neutral": ""
            }
        }
        
        lang_prefixes = prefixes.get(language, prefixes["en"])
        return lang_prefixes.get(emotion.primary_emotion, "")
    
    def get_crisis_resources(self) -> Dict:
        """Get mental health crisis resources"""
        return {
            "india": {
                "iCall": "9152987821",
                "Vandrevala Foundation": "1860-2662-345",
                "NIMHANS": "080-46110007",
                "description": "Free, confidential mental health support"
            }
        }


# Singleton instance
emotion_detector = EmotionDetector()

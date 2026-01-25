"""
Sentiment Analyzer and Emotion Detector
Uses TextBlob for basic sentiment and rule-based systems for emotion detection.
Designed to be swappable with BERT/RoBERTa in future iterations.
"""
from typing import Dict, List, Tuple, Any
import re

try:
    from textblob import TextBlob
except ImportError:
    # Fallback if TextBlob is not installed
    class TextBlob:
        def __init__(self, text):
            self.sentiment = getattr(self, "sentiment", None)
            self._text = text
            
        @property
        def sentiment(self):
            class Sentiment:
                polarity = 0.0
                subjectivity = 0.0
            return Sentiment()


class SentimentAnalyzer:
    """
    Analyzes text for sentiment (polarity) and emotional content.
    """
    
    def __init__(self):
        # Keyword-based emotion mapping (simple baseline)
        self.emotion_keywords = {
            "joy": ["happy", "excited", "great", "wonderful", "love", "joy", "awesome", "good", "grateful"],
            "sadness": ["sad", "depressed", "unhappy", "cry", "grief", "lonely", "down", "blue", "bad"],
            "anger": ["angry", "mad", "furious", "hate", "irritated", "annoyed", "rage"],
            "fear": ["scared", "afraid", "terrified", "anxious", "nervous", "worry", "panic"],
            "surprise": ["wow", "shocked", "amazed", "unbelievable", "unexpected"],
            "neutral": ["okay", "fine", "normal", "average", "standard"]
        }
        
        # Crisis keywords for safety mechanism
        self.crisis_keywords = [
            "suicide", "kill myself", "end it all", "want to die", 
            "better off dead", "hurt myself", "cutting myself", 
            "overdose", "take all the pills", "no way out",
            "hopeless", "worthless"
        ]

    def analyze_text(self, text: str) -> Dict[str, Any]:
        """
        Analyze text for sentiment, emotion, and crisis indicators.
        """
        blob = TextBlob(text)
        
        # Sentiment Polarity: -1.0 (negative) to 1.0 (positive)
        polarity = blob.sentiment.polarity
        
        # Subjectivity: 0.0 (objective) to 1.0 (subjective)
        subjectivity = blob.sentiment.subjectivity
        
        # Detect emotions
        emotions = self._detect_emotions(text.lower())
        
        # Detect crisis
        crisis_detected, crisis_keywords = self._detect_crisis(text.lower())
        
        return {
            "score": polarity,
            "magnitude": abs(polarity),
            "label": self._get_sentiment_label(polarity),
            "subjectivity": subjectivity,
            "dominant_emotion": emotions[0] if emotions else "neutral",
            "emotions": emotions,
            "crisis_detected": crisis_detected,
            "crisis_keywords": crisis_keywords
        }

    def _get_sentiment_label(self, score: float) -> str:
        if score > 0.3:
            return "positive"
        elif score < -0.3:
            return "negative"
        else:
            return "neutral"

    def _detect_emotions(self, text: str) -> List[str]:
        detected = []
        counts = {emotion: 0 for emotion in self.emotion_keywords}
        
        for emotion, keywords in self.emotion_keywords.items():
            for keyword in keywords:
                if keyword in text:
                    counts[emotion] += 1
        
        # Sort emotions by count
        sorted_emotions = sorted(counts.items(), key=lambda x: x[1], reverse=True)
        
        # Return emotions with at least 1 match
        detected = [e for e, count in sorted_emotions if count > 0]
        
        return detected if detected else ["neutral"]

    def _detect_crisis(self, text: str) -> Tuple[bool, List[str]]:
        found_keywords = []
        for keyword in self.crisis_keywords:
            if keyword in text:
                found_keywords.append(keyword)
        
        return len(found_keywords) > 0, found_keywords


# Singleton instance
sentiment_analyzer = SentimentAnalyzer()

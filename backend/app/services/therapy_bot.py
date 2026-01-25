"""
Therapy Bot Service
Implements a rule-based + AI companion for mental health support.
Uses CBT (Cognitive Behavioral Therapy) principles.
"""
from sqlalchemy.orm import Session
from datetime import datetime
from typing import Dict, Any, List

from app.models.mental_health import TherapySession, TherapyMessage, CrisisEvent, CrisisLevel
from app.ml_models.sentiment_analyzer import sentiment_analyzer


class TherapyBotService:
    def __init__(self, db: Session):
        self.db = db
        
        # Simple rule-based patterns for immediate response
        self.patterns = {
            "hello": "Hello! I'm your mental health companion. How are you feeling today?",
            "hi": "Hi there! I'm here to listen. What's on your mind?",
            "sad": "I'm sorry to hear you're feeling down. Can you tell me more about what's making you feel this way?",
            "good": "I'm glad to hear that! What's going well for you?",
            "anxious": "Anxiety can be tough. Would you like to try a quick breathing exercise?",
            "stressed": "Stress implies you care about something. Let's break down what's overwhelming you.",
            "thanks": "You're welcome. Remember, I'm always here for you."
        }
        
        # CBT Techniques prompts
        self.cbt_prompts = [
            "What evidence do you have for this thought?",
            "Is there another way to look at this situation?",
            "What would you tell a friend in this situation?",
            "Are you predicting the future without evidence?"
        ]

    def process_message(self, user_id: int, message: str, session_id: int = None) -> Dict[str, Any]:
        """
        Process a user message and generate a therapeutic response.
        """
        # 1. Analyze Sentiment & Crisis
        analysis = sentiment_analyzer.analyze_text(message)
        
        # 2. Check for Crisis
        if analysis["crisis_detected"]:
            return self._handle_crisis(user_id, message, analysis)
        
        # 3. Get or Create Session
        if not session_id:
            session = self._create_session(user_id)
            session_id = session.id
        else:
            session = self.db.query(TherapySession).filter(TherapySession.id == session_id).first()
            if not session:
                session = self._create_session(user_id)
                session_id = session.id
        
        # 4. Save User Message
        self._save_message(session_id, "user", message, analysis["score"])
        
        # 5. Generate Response
        response_text, suggestions = self._generate_response(message, analysis)
        
        # 6. Save Bot Response
        self._save_message(session_id, "bot", response_text, None)
        
        return {
            "response": response_text,
            "session_id": session_id,
            "sentiment": analysis,
            "suggested_actions": suggestions,
            "crisis_detected": False
        }

    def _create_session(self, user_id: int) -> TherapySession:
        session = TherapySession(user_id=user_id)
        self.db.add(session)
        self.db.commit()
        self.db.refresh(session)
        return session

    def _save_message(self, session_id: int, sender: str, content: str, sentiment: float = None):
        msg = TherapyMessage(
            session_id=session_id,
            sender=sender,
            content=content,
            sentiment_score=sentiment
        )
        self.db.add(msg)
        self.db.commit()

    def _generate_response(self, message: str, analysis: Dict[str, Any]) -> tuple:
        """
        Generate a response based on keywords, sentiment, and CBT principles.
        For production, this would be an LLM call.
        """
        message_lower = message.lower()
        suggestions = []
        
        # 1. Rule-based match
        for key, reply in self.patterns.items():
            if key in message_lower:
                return reply, suggestions

        # 2. Sentiment-based response
        if analysis["label"] == "negative":
            if "dominant_emotion" in analysis and analysis["dominant_emotion"] == "anxiety":
                return "It sounds like you're feeling anxious. Shall we try a grounding exercise? Name 5 things you can see right now.", [{"label": "Start Breathing Exercise", "action": "exercise_breathing"}]
            
            return "I hear that you're going through a tough time. It takes strength to talk about it. How long have you been feeling this way?", []
            
        elif analysis["label"] == "positive":
            return "It's great to see your positive energy! What's contributed to this good mood?", []
        
        # 3. Default fallback (ELIZA-style reflection)
        return "I'm listening. Tell me more about that.", []

    def _handle_crisis(self, user_id: int, message: str, analysis: Dict[str, Any]) -> Dict[str, Any]:
        """
        Handle detected crisis situation.
        """
        # Log crisis event
        event = CrisisEvent(
            user_id=user_id,
            risk_level=CrisisLevel.HIGH,
            trigger_source="chat",
            trigger_content=message
        )
        self.db.add(event)
        self.db.commit()
        
        response_text = (
            "I'm concerned about your safety based on what you just shared. "
            "Please remember you are not alone. There are people who want to help you right now."
        )
        
        return {
            "response": response_text,
            "session_id": None,
            "sentiment": analysis,
            "crisis_detected": True,
            "suggested_actions": [
                {"label": "Call Crisis Helpline (988)", "action": "call_988", "urgent": True},
                {"label": "Text Crisis Line", "action": "text_crisis", "urgent": True}
            ]
        }

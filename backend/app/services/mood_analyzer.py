"""
Mood Analyzer Service
Handles mood tracking, journaling, and analytics.
"""
from sqlalchemy.orm import Session
from sqlalchemy import func
from datetime import datetime, timedelta
from typing import List, Dict, Any

from app.models.mental_health import MoodEntry, JournalEntry, MoodType
from app.mental_health_schemas.mental_health_schemas import MoodCheckinRequest, JournalRequest
from app.ml_models.sentiment_analyzer import sentiment_analyzer


class MoodAnalyzerService:
    def __init__(self, db: Session):
        self.db = db

    def log_mood(self, user_id: int, data: MoodCheckinRequest) -> MoodEntry:
        """Log a new mood entry"""
        entry = MoodEntry(
            user_id=user_id,
            mood=data.mood,
            valence=data.valence,
            arousal=data.arousal,
            notes=data.notes,
            activities=data.activities,
            factors=data.factors
        )
        self.db.add(entry)
        self.db.commit()
        self.db.refresh(entry)
        return entry

    def create_journal(self, user_id: int, data: JournalRequest) -> JournalEntry:
        """Create a journal entry with auto-sentiment analysis"""
        # Analyze sentiment
        analysis = sentiment_analyzer.analyze_text(data.content)
        
        entry = JournalEntry(
            user_id=user_id,
            title=data.title,
            content=data.content,
            entry_type=data.entry_type,
            is_private=data.is_private,
            sentiment_score=analysis["score"],
            sentiment_magnitude=analysis["magnitude"],
            emotion_tags=data.emotion_tags if data.emotion_tags else analysis["emotions"]
        )
        self.db.add(entry)
        self.db.commit()
        self.db.refresh(entry)
        return entry

    def get_mood_history(self, user_id: int, days: int = 30) -> List[MoodEntry]:
        """Get mood history for the last N days"""
        start_date = datetime.utcnow() - timedelta(days=days)
        return self.db.query(MoodEntry).filter(
            MoodEntry.user_id == user_id,
            MoodEntry.created_at >= start_date
        ).order_by(MoodEntry.created_at.desc()).all()

    def get_insights(self, user_id: int) -> Dict[str, Any]:
        """Generate insights based on mood and journal history"""
        # 1. Calculate Average Weekly Mood
        last_7_days = datetime.utcnow() - timedelta(days=7)
        recent_moods = self.db.query(MoodEntry).filter(
            MoodEntry.user_id == user_id,
            MoodEntry.created_at >= last_7_days
        ).all()
        
        avg_valence = 0
        if recent_moods:
            avg_valence = sum(m.valence for m in recent_moods) / len(recent_moods)
        
        # 2. Identify Top Triggers (Activities associated with negative mood)
        negative_moods = [m for m in recent_moods if m.valence < -0.2]
        triggers = {}
        for m in negative_moods:
            if m.activities:
                for activity in m.activities:
                    triggers[activity] = triggers.get(activity, 0) + 1
        
        top_triggers = sorted(triggers.items(), key=lambda x: x[1], reverse=True)[:3]
        
        # 3. Positive Activities
        positive_moods = [m for m in recent_moods if m.valence > 0.2]
        boosters = {}
        for m in positive_moods:
            if m.activities:
                for activity in m.activities:
                    boosters[activity] = boosters.get(activity, 0) + 1
                    
        top_boosters = sorted(boosters.items(), key=lambda x: x[1], reverse=True)[:3]
        
        return {
            "weekly_mood_average": avg_valence,
            "mood_stability_score": self._calculate_stability(recent_moods),
            "top_triggers": [t[0] for t in top_triggers],
            "positive_activities": [b[0] for b in top_boosters],
            "metrics": [
                {
                    "label": "Weekly Average",
                    "value": f"{avg_valence:.2f}",
                    "trend": "stable",
                    "description": "Average mood positivity for the last 7 days"
                },
                {
                    "label": "Log Streak",
                    "value": len(recent_moods),
                    "trend": "up",
                    "description": "Number of check-ins this week"
                }
            ],
            "suggestions": self._generate_suggestions(avg_valence)
        }

    def _calculate_stability(self, moods: List[MoodEntry]) -> float:
        """Calculate mood stability (0.0 to 1.0) based on variance"""
        if len(moods) < 2:
            return 1.0
        
        valences = [m.valence for m in moods]
        import statistics
        variance = statistics.variance(valences)
        
        # Normalize: Lower variance = Higher score
        # Assuming variance rarely exceeds 1.0 for -1 to 1 range
        score = max(0.0, 1.0 - variance)
        return score

    def _generate_suggestions(self, avg_valence: float) -> List[str]:
        if avg_valence > 0.5:
            return ["You're doing great! Keep up with your positive routines."]
        elif avg_valence < -0.3:
            return [
                "You've had a tough week. Consider scheduling some downtime.",
                "Try reaching out to a friend or using the chat companion."
            ]
        else:
            return ["Consistency is key. Try to log your mood at the same time daily."]

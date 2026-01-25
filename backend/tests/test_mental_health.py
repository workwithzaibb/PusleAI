"""
Tests for Mental Health Feature
"""
import pytest
from datetime import datetime
from fastapi.testclient import TestClient
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker
from sqlalchemy.pool import StaticPool

from app.main import app
from app.database import Base, get_db
from app.models.user import User
from app.models.mental_health import (
    MoodEntry, JournalEntry, TherapySession, MoodType
)
from app.services.mood_analyzer import MoodAnalyzerService


# Test database setup
SQLALCHEMY_DATABASE_URL = "sqlite:///:memory:"

engine = create_engine(
    SQLALCHEMY_DATABASE_URL,
    connect_args={"check_same_thread": False},
    poolclass=StaticPool,
)
TestingSessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)


def override_get_db():
    try:
        db = TestingSessionLocal()
        yield db
    finally:
        db.close()


@pytest.fixture(scope="module")
def test_db():
    Base.metadata.create_all(bind=engine)
    yield
    Base.metadata.drop_all(bind=engine)


@pytest.fixture
def client(test_db):
    app.dependency_overrides[get_db] = override_get_db
    with TestClient(app) as c:
        yield c
    app.dependency_overrides.clear()


@pytest.fixture
def test_user(test_db):
    db = TestingSessionLocal()
    user = User(
        phone_number="1234567890",
        full_name="Test User",
        hashed_password="hashed_password",
        is_active=True
    )
    db.add(user)
    db.commit()
    db.refresh(user)
    yield user
    db.close()


@pytest.fixture
def auth_headers(client, test_user):
    return {"Authorization": "Bearer test_token"}


# ============ Service Tests ============

class TestMoodAnalyzerService:
    def test_log_mood(self, test_db, test_user):
        db = TestingSessionLocal()
        service = MoodAnalyzerService(db)
        
        from app.mental_health_schemas.mental_health_schemas import MoodCheckinRequest
        data = MoodCheckinRequest(
            mood=MoodType.HAPPY,
            valence=0.8,
            arousal=0.6,
            notes="Feeling good",
            activities=["exercise"]
        )
        
        entry = service.log_mood(test_user.id, data)
        assert entry.mood == MoodType.HAPPY
        assert entry.valence == 0.8
        db.close()

    def test_get_insights(self, test_db, test_user):
        db = TestingSessionLocal()
        service = MoodAnalyzerService(db)
        
        insights = service.get_insights(test_user.id)
        assert "weekly_mood_average" in insights
        assert "suggestions" in insights
        db.close()


class TestTherapyBotService:
    def test_process_message_simple(self, test_db, test_user):
        from app.services.therapy_bot import TherapyBotService
        db = TestingSessionLocal()
        service = TherapyBotService(db)
        
        result = service.process_message(test_user.id, "Hello, I feel sad today")
        
        assert "response" in result
        assert result["session_id"] is not None
        assert result["sentiment"]["label"] == "negative"
        db.close()

    def test_crisis_detection(self, test_db, test_user):
        from app.services.therapy_bot import TherapyBotService
        db = TestingSessionLocal()
        service = TherapyBotService(db)
        
        # Using a keyword that implies crisis (from our list)
        result = service.process_message(test_user.id, "I want to end it all")
        
        assert result["crisis_detected"] == True
        assert len(result["suggested_actions"]) > 0
        assert result["suggested_actions"][0]["urgent"] == True
        db.close()


# ============ API Tests ============

class TestMentalHealthEndpoints:
    @pytest.mark.skip(reason="Auth mock needed")
    def test_mood_checkin(self, client, auth_headers):
        response = client.post(
            "/api/v1/mental-health/mood-checkin",
            json={
                "mood": "happy",
                "valence": 0.8,
                "arousal": 0.5,
                "notes": "Great day"
            },
            headers=auth_headers
        )
        assert response.status_code == 200
        assert response.json()["mood"] == "happy"

    @pytest.mark.skip(reason="Auth mock needed")
    def test_chat(self, client, auth_headers):
        response = client.post(
            "/api/v1/mental-health/chat",
            json={"message": "I'm feeling anxious"},
            headers=auth_headers
        )
        assert response.status_code == 200
        data = response.json()
        assert "response" in data
        assert "grounding" in data["response"] or "anxiety" in data["response"].lower()

if __name__ == "__main__":
    pytest.main([__file__, "-v"])

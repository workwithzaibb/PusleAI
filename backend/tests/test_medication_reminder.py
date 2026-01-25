"""
Tests for Medication Reminder System
"""
import pytest
from datetime import datetime, timedelta
from fastapi.testclient import TestClient
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker
from sqlalchemy.pool import StaticPool

from app.main import app
from app.database import Base, get_db
from app.models.user import User
from app.models.medication import (
    Medication, MedicationSchedule, AdherenceLog,
    FrequencyType, MedicationTiming, AdherenceStatus
)


# Test database setup
SQLALCHEMY_DATABASE_URL = "sqlite:///:memory:"

engine = create_engine(
    SQLALCHEMY_DATABASE_URL,
    connect_args={"check_same_thread": False},
    poolclass=StaticPool,
)
TestingSessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)


def override_get_db():
    """Override database dependency for testing"""
    try:
        db = TestingSessionLocal()
        yield db
    finally:
        db.close()


@pytest.fixture(scope="module")
def test_db():
    """Create test database"""
    Base.metadata.create_all(bind=engine)
    yield
    Base.metadata.drop_all(bind=engine)


@pytest.fixture
def client(test_db):
    """Create test client"""
    app.dependency_overrides[get_db] = override_get_db
    with TestClient(app) as c:
        yield c
    app.dependency_overrides.clear()


@pytest.fixture
def test_user(test_db):
    """Create a test user"""
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
    """Get auth headers for test user"""
    # For testing, we'll mock authentication
    # In production, this would actually authenticate
    return {"Authorization": "Bearer test_token"}


# ============ Model Tests ============

class TestMedicationModel:
    """Test Medication SQLAlchemy model"""
    
    def test_create_medication(self, test_db, test_user):
        db = TestingSessionLocal()
        
        medication = Medication(
            user_id=test_user.id,
            name="Metformin",
            generic_name="Metformin Hydrochloride",
            dosage="500",
            dosage_unit="mg",
            form="tablet",
            frequency=FrequencyType.TWICE_DAILY,
            timing=MedicationTiming.WITH_FOOD,
            is_ongoing=True,
            purpose="Type 2 Diabetes"
        )
        
        db.add(medication)
        db.commit()
        db.refresh(medication)
        
        assert medication.id is not None
        assert medication.name == "Metformin"
        assert medication.frequency == FrequencyType.TWICE_DAILY
        assert medication.is_active == True
        
        db.close()
    
    def test_medication_schedule_relationship(self, test_db, test_user):
        db = TestingSessionLocal()
        
        medication = Medication(
            user_id=test_user.id,
            name="Aspirin",
            dosage="100",
            dosage_unit="mg",
            frequency=FrequencyType.ONCE_DAILY
        )
        db.add(medication)
        db.flush()
        
        from datetime import time
        schedule = MedicationSchedule(
            medication_id=medication.id,
            scheduled_time=time(8, 0),
            timezone="Asia/Kolkata",
            label="Morning"
        )
        db.add(schedule)
        db.commit()
        
        # Refresh to load relationships
        db.refresh(medication)
        
        assert len(medication.schedules) == 1
        assert medication.schedules[0].label == "Morning"
        
        db.close()


class TestAdherenceLog:
    """Test AdherenceLog model"""
    
    def test_log_taken_dose(self, test_db, test_user):
        db = TestingSessionLocal()
        
        # Create medication
        medication = Medication(
            user_id=test_user.id,
            name="Vitamin D",
            dosage="1000",
            dosage_unit="IU",
            frequency=FrequencyType.ONCE_DAILY
        )
        db.add(medication)
        db.flush()
        
        # Log taken dose
        log = AdherenceLog(
            medication_id=medication.id,
            user_id=test_user.id,
            scheduled_datetime=datetime.utcnow(),
            actual_datetime=datetime.utcnow(),
            status=AdherenceStatus.TAKEN,
            delay_minutes=5
        )
        db.add(log)
        db.commit()
        
        assert log.id is not None
        assert log.status == AdherenceStatus.TAKEN
        assert log.delay_minutes == 5
        
        db.close()
    
    def test_log_skipped_dose(self, test_db, test_user):
        db = TestingSessionLocal()
        
        medication = Medication(
            user_id=test_user.id,
            name="Ibuprofen",
            dosage="400",
            dosage_unit="mg",
            frequency=FrequencyType.AS_NEEDED
        )
        db.add(medication)
        db.flush()
        
        log = AdherenceLog(
            medication_id=medication.id,
            user_id=test_user.id,
            scheduled_datetime=datetime.utcnow(),
            status=AdherenceStatus.SKIPPED,
            skip_reason="Feeling better, no pain"
        )
        db.add(log)
        db.commit()
        
        assert log.status == AdherenceStatus.SKIPPED
        assert "no pain" in log.skip_reason
        
        db.close()


# ============ Service Tests ============

class TestReminderService:
    """Test ReminderService"""
    
    def test_calculate_optimal_times_twice_daily(self, test_db):
        from app.services.reminder_service import ReminderService
        
        db = TestingSessionLocal()
        service = ReminderService(db)
        
        times = service._calculate_optimal_times(
            FrequencyType.TWICE_DAILY,
            MedicationTiming.WITH_FOOD
        )
        
        assert len(times) == 2
        assert "08:00" in times
        assert "20:00" in times
        
        db.close()
    
    def test_calculate_optimal_times_bedtime(self, test_db):
        from app.services.reminder_service import ReminderService
        
        db = TestingSessionLocal()
        service = ReminderService(db)
        
        times = service._calculate_optimal_times(
            FrequencyType.ONCE_DAILY,
            MedicationTiming.BEDTIME
        )
        
        assert times == ["22:00"]
        
        db.close()
    
    def test_get_time_label(self, test_db):
        from app.services.reminder_service import ReminderService
        
        db = TestingSessionLocal()
        service = ReminderService(db)
        
        assert service._get_time_label("07:00") == "Morning"
        assert service._get_time_label("13:00") == "Afternoon"
        assert service._get_time_label("18:00") == "Evening"
        assert service._get_time_label("23:00") == "Night"
        
        db.close()


# ============ API Tests ============

class TestMedicationEndpoints:
    """Test medication API endpoints"""
    
    @pytest.mark.skip(reason="Requires authentication setup")
    def test_add_medication(self, client, auth_headers):
        response = client.post(
            "/api/v1/medication/add",
            json={
                "name": "Paracetamol",
                "dosage": "500",
                "dosage_unit": "mg",
                "frequency": "as_needed",
                "purpose": "Pain relief"
            },
            headers=auth_headers
        )
        
        assert response.status_code == 201
        data = response.json()
        assert data["name"] == "Paracetamol"
    
    @pytest.mark.skip(reason="Requires authentication setup")
    def test_list_medications(self, client, auth_headers):
        response = client.get(
            "/api/v1/medication/list",
            headers=auth_headers
        )
        
        assert response.status_code == 200
        data = response.json()
        assert "medications" in data
        assert "total" in data


# ============ Adherence Predictor Tests ============

class TestAdherencePredictor:
    """Test AdherencePredictor ML model"""
    
    def test_predict_low_risk(self):
        from app.ml_models.adherence_predictor import AdherencePredictor, AdherenceFeatures
        
        predictor = AdherencePredictor()
        
        features = AdherenceFeatures(
            adherence_rate_7d=95.0,
            adherence_rate_30d=92.0,
            adherence_rate_all=90.0,
            missed_morning_pct=5.0,
            missed_evening_pct=8.0,
            missed_weekend_pct=10.0,
            current_streak=14,
            longest_streak=30,
            avg_streak_length=10.0,
            avg_delay_minutes=5.0,
            late_dose_pct=10.0,
            total_medications=2,
            doses_per_day=3,
            has_critical_meds=False,
            missed_last_3_days=0,
            snooze_count_7d=1
        )
        
        result = predictor.predict_risk(features)
        
        assert result["risk_level"] == "low"
        assert result["risk_score"] < 30
    
    def test_predict_high_risk(self):
        from app.ml_models.adherence_predictor import AdherencePredictor, AdherenceFeatures
        
        predictor = AdherencePredictor()
        
        features = AdherenceFeatures(
            adherence_rate_7d=40.0,
            adherence_rate_30d=50.0,
            adherence_rate_all=55.0,
            missed_morning_pct=60.0,
            missed_evening_pct=50.0,
            missed_weekend_pct=70.0,
            current_streak=0,
            longest_streak=5,
            avg_streak_length=2.0,
            avg_delay_minutes=90.0,
            late_dose_pct=60.0,
            total_medications=8,
            doses_per_day=12,
            has_critical_meds=True,
            missed_last_3_days=3,
            snooze_count_7d=10
        )
        
        result = predictor.predict_risk(features)
        
        assert result["risk_level"] == "high"
        assert result["risk_score"] > 60
        assert len(result["risk_factors"]) > 0
        assert len(result["suggestions"]) > 0


# ============ Integration Tests ============

class TestIntegration:
    """Integration tests for the full flow"""
    
    def test_medication_lifecycle(self, test_db, test_user):
        """Test full medication lifecycle: add -> schedule -> take -> score"""
        from app.services.reminder_service import ReminderService
        from app.schemas.medication_schemas import MedicationCreate
        
        db = TestingSessionLocal()
        service = ReminderService(db)
        
        # 1. Create medication
        med_data = MedicationCreate(
            name="Lisinopril",
            dosage="10",
            dosage_unit="mg",
            frequency=FrequencyType.ONCE_DAILY,
            timing=MedicationTiming.ANY_TIME,
            purpose="Blood pressure control",
            is_ongoing=True,
            schedule_times=["09:00"]
        )
        
        medication = service.create_medication(test_user.id, med_data)
        assert medication.id is not None
        assert len(medication.schedules) == 1
        
        # 2. Mark dose as taken
        log = service.mark_taken(
            medication_id=medication.id,
            user_id=test_user.id,
            notes="Taken with breakfast"
        )
        assert log.status == AdherenceStatus.TAKEN
        
        # 3. Get adherence score
        score = service.get_adherence_score(test_user.id, period_days=7)
        assert "adherence_rate" in score
        assert score["total_taken"] >= 1
        
        db.close()


if __name__ == "__main__":
    pytest.main([__file__, "-v"])

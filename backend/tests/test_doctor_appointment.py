"""
Tests for Doctor and Appointment Features
"""
import pytest
from datetime import date, datetime, timedelta, time
from fastapi.testclient import TestClient
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker
from sqlalchemy.pool import StaticPool

from app.main import app
from app.database import Base, get_db
from app.models.user import User, UserRole
from app.models.doctor import DoctorProfile, Availability

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
def doctor_user(test_db):
    db = TestingSessionLocal()
    user = User(
        phone_number="9999999999",
        full_name="Dr. Test",
        hashed_password="password",
        role=UserRole.DOCTOR
    )
    db.add(user)
    db.commit()
    db.refresh(user)
    
    # Enable profile
    profile = DoctorProfile(
        user_id=user.id,
        specialty="General",
        license_number="DOC123",
        consultation_fee=50.0
    )
    db.add(profile)
    db.commit()
    db.refresh(profile)
    
    yield user
    db.close()


@pytest.fixture
def patient_user(test_db):
    db = TestingSessionLocal()
    user = User(
        phone_number="8888888888",
        full_name="Patient Test",
        hashed_password="password",
        role=UserRole.PATIENT
    )
    db.add(user)
    db.commit()
    db.refresh(user)
    yield user
    db.close()


class TestDoctorService:
    def test_search_doctor(self, test_db, doctor_user):
        from app.services.doctor_service import DoctorService
        db = TestingSessionLocal()
        service = DoctorService(db)
        
        results = service.search_doctors(query="Dr. Test")
        assert len(results) > 0
        assert results[0].user_id == doctor_user.id
        db.close()

    def test_set_availability(self, test_db, doctor_user):
        from app.services.doctor_service import DoctorService
        from app.doctor_schemas.doctor_schemas import AvailabilityCreate
        db = TestingSessionLocal()
        service = DoctorService(db)
        
        profile = service.get_profile(doctor_user.id)
        
        slots = [
            AvailabilityCreate(
                day_of_week=0, # Monday
                start_time="09:00",
                end_time="17:00"
            )
        ]
        
        service.set_availability(profile.id, slots)
        
        avail = db.query(Availability).filter(Availability.doctor_id == profile.id).first()
        assert avail is not None
        assert avail.start_time == time(9, 0)
        db.close()


class TestBookingService:
    def test_get_slots(self, test_db, doctor_user):
        from app.services.booking_service import BookingService
        db = TestingSessionLocal()
        service = BookingService(db)
        
        # Ensure availability is set
        from app.services.doctor_service import DoctorService
        from app.doctor_schemas.doctor_schemas import AvailabilityCreate
        doc_service = DoctorService(db)
        profile = doc_service.get_profile(doctor_user.id)
        
        # Determine next Monday
        today = date.today()
        slots_data = [
            AvailabilityCreate(day_of_week=today.weekday(), start_time="09:00", end_time="10:00")
        ]
        doc_service.set_availability(profile.id, slots_data)
        
        slots = service.get_available_slots(profile.id, today, days=1)
        # Should have 2 slots: 9:00-9:30, 9:30-10:00
        # unless current time is past 9:00 (not checking time past logic in simplified service yet)
        
        assert len(slots) > 0
        assert len(slots[0].slots) > 0
        assert slots[0].slots[0].start_time == "09:00"
        
        db.close()

    def test_book_appointment(self, test_db, doctor_user, patient_user):
        from app.services.booking_service import BookingService
        from app.doctor_schemas.doctor_schemas import AppointmentBookRequest
        db = TestingSessionLocal()
        service = BookingService(db)
        
        profile = db.query(DoctorProfile).filter(DoctorProfile.user_id == doctor_user.id).first()
        
        book_date = date.today() + timedelta(days=1)
        
        req = AppointmentBookRequest(
            doctor_id=profile.id,
            appointment_date=book_date,
            start_time="09:00",
            reason="Test checkup"
        )
        
        appt = service.book_appointment(patient_user.id, req)
        assert appt.id is not None
        assert appt.status == "pending"
        db.close()

if __name__ == "__main__":
    pytest.main([__file__, "-v"])

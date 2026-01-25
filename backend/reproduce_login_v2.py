import sys
from app.database import SessionLocal, init_db, engine, Base

def test_auth_flow():
    print("Starting Auth Flow Diagnosis V2...")
    
    print("Importing models individually...")
    from app.models.user import User
    from app.models.doctor import DoctorProfile, Availability, Appointment, Prescription
    from app.models.consultation import Consultation
from app.models.consultation_message import ConsultationMessage
    from app.models.family import FamilyMember
    from app.models.followup import FollowUp
    from app.models.medical_history import MedicalHistory
    from app.models.medication import Medication
    from app.models.mental_health import MoodEntry
    
    print(f"Registered tables: {len(Base.metadata.tables)} tables.")
    
    print("Creating tables...")
    try:
        Base.metadata.create_all(bind=engine)
        print("Tables created.")
    except Exception as e:
        print(f"CREATE ERROR: {e}")
        return

    db = SessionLocal()
    try:
        from app.api.auth import get_password_hash, verify_password
        
        # Create user
        phone = "5555555555"
        password = "testpassword"
        print(f"Creating user {phone}...")
        
        # Check if exists
        existing = db.query(User).filter(User.phone_number == phone).first()
        if existing:
            db.delete(existing)
            db.commit()

        hashed = get_password_hash(password)
        user = User(
            phone_number=phone,
            full_name="Test User V2",
            hashed_password=hashed
        )
        db.add(user)
        db.commit()
        print("User created successfully.")
        
        # Verify login
        fetched_user = db.query(User).filter(User.phone_number == phone).first()
        if fetched_user:
            is_valid = verify_password(password, fetched_user.hashed_password)
            print(f"Password verification: {is_valid}")
        else:
            print("User not found.")
            
    except Exception as e:
        print(f"RUNTIME ERROR: {e}")
        import traceback
        traceback.print_exc()
    finally:
        db.close()

if __name__ == "__main__":
    test_auth_flow()

import sys
from app.database import Base, engine

def check_tables(label):
    tables = sorted(list(Base.metadata.tables.keys()))
    print(f"AFTER {label}: {len(tables)} tables -> {tables}")

try:
    print("Importing User...")
    from app.models.user import User
    check_tables("User")
    
    print("Importing Consultation...")
    from app.models.consultation import Consultation
    check_tables("Consultation")
    
    print("Importing Family...")
    from app.models.family import FamilyMember
    check_tables("Family")
    
    print("Importing FollowUp...")
    from app.models.followup import FollowUp
    check_tables("FollowUp")
    
    print("Importing MedicalHistory...")
    from app.models.medical_history import MedicalHistory
    check_tables("MedicalHistory")
    
    print("Importing Medication...")
    from app.models.medication import Medication
    check_tables("Medication")
    
    print("Importing MentalHealth...")
    from app.models.mental_health import MoodEntry
    check_tables("MentalHealth")
    
    print("Importing Doctor...")
    from app.models.doctor import DoctorProfile
    check_tables("Doctor")

    print("Creating All Tables...")
    Base.metadata.create_all(bind=engine)
    print("SUCCESS")
    
except Exception as e:
    print(f"FAILURE: {e}")
    # import traceback
    # traceback.print_exc()

import sys
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker

print("Starting full model diagnosis...")

try:
    print("Importing app.database...")
    from app.database import Base, engine
    print("OK: app.database")
except Exception as e:
    print(f"FAIL: app.database - {e}")
    sys.exit(1)

models_to_check = [
    "app.models.user",
    "app.models.consultation",
    "app.models.family",
    "app.models.followup",
    "app.models.medical_history",
    "app.models.medication",
    "app.models.mental_health",
    "app.models.doctor"
]

for module in models_to_check:
    try:
        print(f"Importing {module}...")
        __import__(module)
        print(f"OK: {module}")
    except Exception as e:
        print(f"FAIL: {module} - {e}")

print("Attempting to create all tables...")
try:
    Base.metadata.create_all(bind=engine)
    print("OK: create_all")
except Exception as e:
    print(f"FAIL: create_all - {e}")

print("Diagnosis complete.")

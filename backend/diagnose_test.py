import sys
print("Starting diagnosis...")

try:
    print("Importing app.main...")
    from app.main import app
    print("OK: app.main")
except Exception as e:
    print(f"FAIL: app.main - {e}")

try:
    print("Importing app.models.doctor...")
    from app.models.doctor import DoctorProfile, Availability
    print("OK: app.models.doctor")
except Exception as e:
    print(f"FAIL: app.models.doctor - {e}")

try:
    print("Importing app.services.doctor_service...")
    from app.services.doctor_service import DoctorService
    print("OK: app.services.doctor_service")
except Exception as e:
    print(f"FAIL: app.services.doctor_service - {e}")

try:
    print("Importing app.doctor_schemas.doctor_schemas...")
    from app.doctor_schemas.doctor_schemas import AvailabilityCreate
    print("OK: app.doctor_schemas.doctor_schemas")
except Exception as e:
    print(f"FAIL: app.doctor_schemas.doctor_schemas - {e}")

print("Diagnosis complete.")

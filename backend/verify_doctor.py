
import sys
import os

# Add current dir to path
sys.path.append(os.getcwd())

try:
    print("Importing doctor models...")
    from app.models.doctor import DoctorProfile, Availability, Appointment, Prescription
    print("Doctor models imported successfully.")

    print("Importing doctor schemas...")
    from app.doctor_schemas.doctor_schemas import DoctorProfileCreate, AppointmentBookRequest
    print("Doctor schemas imported successfully.")

    print("Importing doctor services...")
    from app.services.doctor_service import DoctorService
    from app.services.booking_service import BookingService
    print("Doctor services imported successfully.")

    print("Importing API routers...")
    from app.api.doctor import router as doctor_router
    from app.api.appointments import router as appointments_router
    print("API routers imported successfully.")

    print("All imports SUCCESS!")

except Exception as e:
    import traceback
    traceback.print_exc()

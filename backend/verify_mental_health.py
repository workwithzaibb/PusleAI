
import sys
import os

# Add current dir to path
sys.path.append(os.getcwd())

try:
    print("Importing models...")
    from app.models.mental_health import MoodEntry, JournalEntry, CrisisEvent
    print("Models imported successfully.")

    print("Importing schemas...")
    from app.mental_health_schemas.mental_health_schemas import MoodCheckinRequest
    print("Schemas imported successfully.")

    print("Importing services...")
    from app.services.mood_analyzer import MoodAnalyzerService
    print("Services imported successfully.")

    print("Importing API...")
    from app.api.mental_health import router
    print("API imported successfully.")

    print("All imports SUCCESS!")

except Exception as e:
    import traceback
    traceback.print_exc()

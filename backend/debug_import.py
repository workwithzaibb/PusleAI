import traceback
try:
    from app.api import medication_reminder_router
    print('Import successful!')
except Exception as e:
    traceback.print_exc()

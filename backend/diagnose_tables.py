import sys
from app.database import Base
try:
    from app.models import user, consultation, family, followup, medical_history, medication, mental_health, doctor
    print("Imports successful.")
except ImportError as e:
    print(f"IMPORT ERROR: {e}")
    sys.exit(1)

import json
print("REGISTERED TABLES JSON:", json.dumps(sorted(list(Base.metadata.tables.keys()))))

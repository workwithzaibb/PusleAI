import subprocess
import sys

with open("test_output.txt", "w") as f:
    try:
        subprocess.run([sys.executable, "-m", "pytest", "-v", "tests/test_doctor_appointment.py"], stdout=f, stderr=subprocess.STDOUT)
    except Exception as e:
        f.write(str(e))

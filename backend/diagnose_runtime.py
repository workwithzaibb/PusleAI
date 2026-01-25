import sys
from app.database import SessionLocal, init_db, engine, Base
from app.models.user import User
from app.api.auth import get_password_hash, verify_password

# Synchronous DB init
# Import all models from the package to ensure metadata is populated in correct order
import app.models
print("Registered tables:", Base.metadata.tables.keys())
try:
    Base.metadata.create_all(bind=engine)
except Exception as e:
    print(f"CREATE_ALL ERROR: {e}")
    sys.exit(1)

def test_auth_flow():
    print("Starting Auth Flow Diagnosis...")
    db = SessionLocal()
    try:
        # Create user
        phone = "9998887777"
        password = "password123"
        print(f"Creating user {phone}...")
        
        # Check if exists
        existing = db.query(User).filter(User.phone_number == phone).first()
        if existing:
            db.delete(existing)
            db.commit()
            print("Deleted existing test user.")

        hashed = get_password_hash(password)
        print(f"Hashed password: {hashed[:10]}...")
        
        user = User(
            phone_number=phone,
            full_name="Test User",
            hashed_password=hashed
        )
        db.add(user)
        db.commit()
        print("User created successfully.")
        
        # Verify login
        fetched_user = db.query(User).filter(User.phone_number == phone).first()
        if not fetched_user:
            print("FAIL: User not found after commit!")
            return
            
        is_valid = verify_password(password, fetched_user.hashed_password)
        print(f"Password verification: {is_valid}")
        
        # Test Serialization
        print("Testing Token serialization...")
        from app.schemas import Token, UserResponse
        try:
            token = Token(
                access_token="test_token",
                user=UserResponse.model_validate(fetched_user)
            )
            print("SUCCESS: Token serialization works!")
            print(f"Serialized Token: {token.model_dump_json()}")
        except Exception as ser_err:
            print(f"FAIL: Token serialization failed: {ser_err}")
            import traceback
            traceback.print_exc()
            
    except Exception as e:
        print(f"CRITICAL FAILURE: {e}")
        import traceback
        traceback.print_exc()
    finally:
        db.close()

if __name__ == "__main__":
    test_auth_flow()

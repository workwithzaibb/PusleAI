from app.database import Base, engine
try:
    from app.models.consultation import Consultation
    print(f"Class: {Consultation}")
    print(f"Tablename: {Consultation.__tablename__}")
    print(f"In Metadata: {'consultations' in Base.metadata.tables}")
    
    from app.models.followup import FollowUp
    print(f"FollowUp imported. In Metadata: {'follow_ups' in Base.metadata.tables}")
    
    print("Creating specific tables...")
    Base.metadata.create_all(bind=engine)
    print("Tables created.")
    
except Exception as e:
    print(f"ERROR: {e}")

"""
Family Member Model - Handles family health accounts
"""
from sqlalchemy import Column, Integer, String, DateTime, ForeignKey, Enum
from sqlalchemy.orm import relationship as db_relationship
from app.time_utils import utc_now
import enum

from app.base import Base


class RelationshipType(str, enum.Enum):
    SELF = "self"
    SPOUSE = "spouse"
    CHILD = "child"
    PARENT = "parent"
    GRANDPARENT = "grandparent"
    SIBLING = "sibling"
    OTHER = "other"


class FamilyMember(Base):
    """Family member profiles under a single account"""
    __tablename__ = "family_members"
    
    id = Column(Integer, primary_key=True, index=True)
    
    # Primary user reference
    primary_user_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    
    # Member details
    name = Column(String(100), nullable=False)
    relationship_type = Column(Enum(RelationshipType), default=RelationshipType.OTHER)
    
    # Health profile
    age = Column(Integer, nullable=True)
    gender = Column(String(10), nullable=True)
    blood_group = Column(String(5), nullable=True)
    
    # Known conditions
    chronic_conditions = Column(String(500), nullable=True)  # Comma-separated
    allergies = Column(String(500), nullable=True)  # Comma-separated
    current_medications = Column(String(500), nullable=True)  # Comma-separated
    
    # Preferences
    preferred_language = Column(String(5), default="en")
    
    # Timestamps
    created_at = Column(DateTime, default=utc_now)
    updated_at = Column(DateTime, default=utc_now, onupdate=utc_now)
    
    # Relationships
    primary_user = db_relationship("User", back_populates="family_members")
    
    def __repr__(self):
        return f"<FamilyMember(id={self.id}, name={self.name}, relation={self.relationship_type})>"




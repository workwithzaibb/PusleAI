"""
Family Health Router - Manage family member profiles
"""
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List

from app.database import get_db
from app.models.user import User
from app.models.family import FamilyMember, RelationshipType
from app.schemas import FamilyMemberCreate, FamilyMemberResponse
from app.api.auth import get_current_user

router = APIRouter()


@router.post("/members", response_model=FamilyMemberResponse, status_code=status.HTTP_201_CREATED)
async def add_family_member(
    data: FamilyMemberCreate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Add a new family member to user's account"""
    # Validate relationship
    try:
        rel_type = RelationshipType(data.relationship)
    except ValueError:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Invalid relationship. Must be one of: {[r.value for r in RelationshipType]}"
        )
    
    member = FamilyMember(
        primary_user_id=current_user.id,
        name=data.name,
        relationship_type=rel_type,
        age=data.age,
        gender=data.gender,
        blood_group=data.blood_group,
        chronic_conditions=data.chronic_conditions,
        allergies=data.allergies,
        current_medications=data.current_medications,
        preferred_language=data.preferred_language
    )
    
    db.add(member)
    db.commit()
    db.refresh(member)
    
    return FamilyMemberResponse.model_validate(member)


@router.get("/members", response_model=List[FamilyMemberResponse])
async def get_family_members(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Get all family members for current user"""
    members = db.query(FamilyMember).filter(
        FamilyMember.primary_user_id == current_user.id
    ).all()
    
    return [FamilyMemberResponse.model_validate(m) for m in members]


@router.get("/members/{member_id}", response_model=FamilyMemberResponse)
async def get_family_member(
    member_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Get a specific family member"""
    member = db.query(FamilyMember).filter(
        FamilyMember.id == member_id,
        FamilyMember.primary_user_id == current_user.id
    ).first()
    
    if not member:
        raise HTTPException(status_code=404, detail="Family member not found")
    
    return FamilyMemberResponse.model_validate(member)


@router.put("/members/{member_id}", response_model=FamilyMemberResponse)
async def update_family_member(
    member_id: int,
    data: FamilyMemberCreate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Update a family member's information"""
    member = db.query(FamilyMember).filter(
        FamilyMember.id == member_id,
        FamilyMember.primary_user_id == current_user.id
    ).first()
    
    if not member:
        raise HTTPException(status_code=404, detail="Family member not found")
    
    # Update fields
    for field, value in data.model_dump().items():
        if field == "relationship":
            setattr(member, "relationship_type", RelationshipType(value))
        else:
            setattr(member, field, value)
    
    db.commit()
    db.refresh(member)
    
    return FamilyMemberResponse.model_validate(member)


@router.delete("/members/{member_id}")
async def delete_family_member(
    member_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Delete a family member"""
    member = db.query(FamilyMember).filter(
        FamilyMember.id == member_id,
        FamilyMember.primary_user_id == current_user.id
    ).first()
    
    if not member:
        raise HTTPException(status_code=404, detail="Family member not found")
    
    db.delete(member)
    db.commit()
    
    return {"message": "Family member removed successfully"}


@router.get("/relationships")
async def get_relationship_types():
    """Get available relationship types"""
    return {
        "relationships": [r.value for r in RelationshipType]
    }

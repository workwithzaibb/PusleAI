"""
Medicine Safety Router
"""
from fastapi import APIRouter, Depends
from typing import List

from app.models.user import User
from app.schemas import MedicineLookup, MedicineInteractionCheck, MedicineResponse, InteractionResponse
from app.api.auth import get_current_user
from app.services.medicine_checker import medicine_checker

router = APIRouter()


@router.post("/lookup", response_model=MedicineResponse)
async def lookup_medicine(
    data: MedicineLookup,
    current_user: User = Depends(get_current_user)
):
    """Look up medicine information"""
    info = medicine_checker.lookup(data.medicine_name)
    
    return MedicineResponse(
        name=info.name,
        found=info.found,
        category=info.category,
        common_uses=info.common_uses,
        side_effects=info.side_effects,
        warnings=info.warnings,
        max_daily_dose=info.max_daily_dose,
        safe_for_children=info.safe_for_children,
        safe_during_pregnancy=info.safe_during_pregnancy,
        requires_prescription=info.requires_prescription
    )


@router.post("/interactions")
async def check_interactions(
    data: MedicineInteractionCheck,
    current_user: User = Depends(get_current_user)
):
    """Check for drug interactions between multiple medicines"""
    warnings = medicine_checker.check_interactions(data.medicines)
    
    return {
        "medicines_checked": data.medicines,
        "has_interactions": len(warnings) > 0,
        "warnings": [
            {
                "medicine1": w.medicine1,
                "medicine2": w.medicine2,
                "severity": w.severity,
                "description": w.description
            }
            for w in warnings
        ]
    }


@router.get("/check-overuse")
async def check_overuse(
    medicine: str,
    doses_per_day: int,
    current_user: User = Depends(get_current_user)
):
    """Check if medicine is being overused"""
    result = medicine_checker.check_overuse(medicine, doses_per_day)
    return result


@router.get("/alternatives")
async def get_alternatives(
    medicine: str,
    condition: str = "",
    current_user: User = Depends(get_current_user)
):
    """Get safer alternatives for a medicine"""
    alternatives = medicine_checker.get_safe_alternatives(medicine, condition)
    return {
        "medicine": medicine,
        "alternatives": alternatives
    }


@router.get("/search")
async def search_medicines(
    query: str,
    current_user: User = Depends(get_current_user)
):
    """Search medicines by name"""
    from app.knowledge.medicine_db import MEDICINE_DATABASE
    
    query_lower = query.lower()
    results = []
    
    for med_name, med_data in MEDICINE_DATABASE.items():
        aliases = [med_name.lower()] + [a.lower() for a in med_data.get("aliases", [])]
        if any(query_lower in alias for alias in aliases):
            results.append({
                "name": med_name,
                "category": med_data.get("category"),
                "prescription_required": med_data.get("prescription", True)
            })
    
    return {"query": query, "results": results}

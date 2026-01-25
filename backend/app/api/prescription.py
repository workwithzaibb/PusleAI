"""
Prescription Scanner API
Upload prescriptions and get medicine alternatives with cost savings.
"""
from fastapi import APIRouter, UploadFile, File, HTTPException, Depends, Form
from typing import List, Optional
from pydantic import BaseModel
import base64

from app.services.prescription_scanner import (
    analyze_prescription,
    get_medicine_alternatives,
    simulate_ocr,
    extract_medicines_from_text,
    MEDICINE_DATABASE
)

router = APIRouter(prefix="/prescription", tags=["Prescription Scanner"])


class MedicineAlternativeResponse(BaseModel):
    original_medicine: str
    generic_name: str
    category: str
    brand_price: str
    alternatives: List[dict]
    best_generic: Optional[dict]
    potential_savings: Optional[str]


class PrescriptionScanResponse(BaseModel):
    success: bool
    extracted_text: Optional[str]
    medicines_found: List[MedicineAlternativeResponse]
    total_potential_savings: int
    recommendations: List[str]
    message: str


class ManualMedicineRequest(BaseModel):
    medicine_names: List[str]


@router.post("/scan", response_model=PrescriptionScanResponse)
async def scan_prescription(
    file: UploadFile = File(None),
    text: str = Form(None)
):
    """
    Scan a prescription image or analyze prescription text.
    Returns medicine names with generic alternatives and potential savings.
    
    - Upload an image file (JPG, PNG, PDF) OR
    - Provide prescription text directly
    """
    extracted_text = ""
    
    if file:
        # Validate file type
        allowed_types = ["image/jpeg", "image/png", "image/jpg", "application/pdf"]
        if file.content_type not in allowed_types:
            raise HTTPException(
                status_code=400,
                detail=f"File type not supported. Allowed: {', '.join(allowed_types)}"
            )
        
        # Read file content
        content = await file.read()
        
        # In production, use actual OCR service
        # For now, simulate OCR
        extracted_text = simulate_ocr(content)
        
    elif text:
        extracted_text = text
    else:
        raise HTTPException(
            status_code=400,
            detail="Please provide either an image file or prescription text"
        )
    
    # Analyze the prescription
    analysis = analyze_prescription(extracted_text)
    
    return PrescriptionScanResponse(
        success=True,
        extracted_text=extracted_text,
        medicines_found=analysis["medicines_found"],
        total_potential_savings=analysis["total_potential_savings"],
        recommendations=analysis["recommendations"],
        message=f"Found {len(analysis['medicines_found'])} medicines with alternatives"
    )


@router.post("/analyze-text", response_model=PrescriptionScanResponse)
async def analyze_prescription_text(text: str = Form(...)):
    """
    Analyze prescription text directly without image upload.
    Useful for manual entry or copy-pasted prescriptions.
    """
    if not text or len(text.strip()) < 5:
        raise HTTPException(
            status_code=400,
            detail="Please provide valid prescription text"
        )
    
    analysis = analyze_prescription(text)
    
    return PrescriptionScanResponse(
        success=True,
        extracted_text=text,
        medicines_found=analysis["medicines_found"],
        total_potential_savings=analysis["total_potential_savings"],
        recommendations=analysis["recommendations"],
        message=f"Found {len(analysis['medicines_found'])} medicines with alternatives"
    )


@router.post("/check-medicines")
async def check_medicines(request: ManualMedicineRequest):
    """
    Check alternatives for a list of medicine names.
    Useful when you know the exact medicine names.
    """
    results = []
    
    for medicine_name in request.medicine_names:
        alternatives = get_medicine_alternatives(medicine_name)
        if alternatives:
            results.append(alternatives)
        else:
            results.append({
                "original_medicine": medicine_name,
                "generic_name": "Not found in database",
                "category": "Unknown",
                "brand_price": "N/A",
                "alternatives": [],
                "message": "Medicine not found. Try a different spelling or brand name."
            })
    
    total_with_alternatives = len([r for r in results if r.get("alternatives")])
    
    return {
        "success": True,
        "medicines_checked": len(request.medicine_names),
        "medicines_with_alternatives": total_with_alternatives,
        "results": results
    }


@router.get("/search/{medicine_name}")
async def search_medicine(medicine_name: str):
    """
    Search for a specific medicine and get its alternatives.
    """
    alternatives = get_medicine_alternatives(medicine_name)
    
    if not alternatives:
        # Try fuzzy matching
        medicine_lower = medicine_name.lower()
        partial_matches = []
        
        for key, data in MEDICINE_DATABASE.items():
            if medicine_lower in key or key in medicine_lower:
                partial_matches.append({
                    "medicine": key.title(),
                    "generic": data["generic"],
                    "category": data["category"]
                })
        
        if partial_matches:
            return {
                "success": False,
                "message": f"Exact match not found for '{medicine_name}'",
                "suggestions": partial_matches
            }
        
        return {
            "success": False,
            "message": f"Medicine '{medicine_name}' not found in our database",
            "suggestions": []
        }
    
    return {
        "success": True,
        **alternatives
    }


@router.get("/categories")
async def get_medicine_categories():
    """
    Get all available medicine categories in the database.
    """
    categories = {}
    
    for medicine, data in MEDICINE_DATABASE.items():
        category = data["category"]
        if category not in categories:
            categories[category] = []
        categories[category].append({
            "brand": medicine.title(),
            "generic": data["generic"]
        })
    
    return {
        "success": True,
        "categories": categories,
        "total_medicines": len(MEDICINE_DATABASE)
    }


@router.get("/jan-aushadhi-info")
async def get_jan_aushadhi_info():
    """
    Get information about Jan Aushadhi Kendras - Government generic medicine stores.
    """
    return {
        "success": True,
        "title": "Pradhan Mantri Bhartiya Janaushadhi Pariyojana (PMBJP)",
        "description": "A government initiative to provide quality generic medicines at affordable prices",
        "benefits": [
            "Up to 50-90% cheaper than branded medicines",
            "Same quality as branded medicines (WHO-GMP certified)",
            "Over 1800+ medicines and 280+ surgical items available",
            "10,000+ stores across India"
        ],
        "how_to_find": [
            "Visit: https://janaushadhi.gov.in/",
            "Call: 1800-180-8080 (Toll Free)",
            "Search 'Jan Aushadhi' on Google Maps",
            "Download 'Janaushadhi Sugam' app"
        ],
        "documents_needed": [
            "Valid prescription from registered doctor",
            "No additional documents required for purchase"
        ],
        "website": "https://janaushadhi.gov.in/"
    }

"""
Prescription Scanner Service
Extracts medicine names from prescription images and suggests generic/cheaper alternatives.
"""
import re
from typing import List, Dict, Optional
from dataclasses import dataclass


@dataclass
class Medicine:
    name: str
    generic_name: str
    category: str
    price_range: str  # Price in INR
    manufacturer: str


@dataclass
class MedicineAlternative:
    original: str
    generic_name: str
    alternatives: List[Dict]
    savings_percentage: Optional[int]


# Indian Medicine Database with Generic Alternatives
MEDICINE_DATABASE = {
    # Pain & Fever
    "crocin": {
        "generic": "Paracetamol",
        "category": "Analgesic/Antipyretic",
        "brand_price": "₹30-50",
        "alternatives": [
            {"name": "Dolo 650", "price": "₹30", "manufacturer": "Micro Labs"},
            {"name": "Calpol", "price": "₹35", "manufacturer": "GSK"},
            {"name": "Paracetamol IP (Generic)", "price": "₹10-15", "manufacturer": "Various", "savings": 70},
        ]
    },
    "dolo": {
        "generic": "Paracetamol",
        "category": "Analgesic/Antipyretic",
        "brand_price": "₹30",
        "alternatives": [
            {"name": "Paracetamol IP (Generic)", "price": "₹10-15", "manufacturer": "Various", "savings": 60},
            {"name": "Crocin", "price": "₹30", "manufacturer": "GSK"},
        ]
    },
    "combiflam": {
        "generic": "Ibuprofen + Paracetamol",
        "category": "Analgesic/Anti-inflammatory",
        "brand_price": "₹40-60",
        "alternatives": [
            {"name": "Ibugesic Plus", "price": "₹35", "manufacturer": "Cipla"},
            {"name": "Brufen Plus", "price": "₹45", "manufacturer": "Abbott"},
            {"name": "Ibuprofen + Paracetamol (Generic)", "price": "₹15-20", "manufacturer": "Various", "savings": 65},
        ]
    },
    "saridon": {
        "generic": "Propyphenazone + Paracetamol + Caffeine",
        "category": "Analgesic",
        "brand_price": "₹25",
        "alternatives": [
            {"name": "Dart", "price": "₹20", "manufacturer": "Micro Labs"},
            {"name": "Paracetamol (Generic)", "price": "₹10", "manufacturer": "Various", "savings": 60},
        ]
    },
    
    # Antibiotics
    "augmentin": {
        "generic": "Amoxicillin + Clavulanic Acid",
        "category": "Antibiotic",
        "brand_price": "₹180-250",
        "alternatives": [
            {"name": "Moxikind-CV", "price": "₹120", "manufacturer": "Mankind"},
            {"name": "Clavam", "price": "₹150", "manufacturer": "Alkem"},
            {"name": "Amoxyclav (Generic)", "price": "₹80-100", "manufacturer": "Various", "savings": 60},
        ]
    },
    "azithral": {
        "generic": "Azithromycin",
        "category": "Antibiotic",
        "brand_price": "₹120-150",
        "alternatives": [
            {"name": "Azee", "price": "₹100", "manufacturer": "Cipla"},
            {"name": "Zithromax", "price": "₹180", "manufacturer": "Pfizer"},
            {"name": "Azithromycin (Generic)", "price": "₹50-70", "manufacturer": "Various", "savings": 55},
        ]
    },
    "cifran": {
        "generic": "Ciprofloxacin",
        "category": "Antibiotic",
        "brand_price": "₹80-120",
        "alternatives": [
            {"name": "Ciplox", "price": "₹70", "manufacturer": "Cipla"},
            {"name": "Ciprofloxacin (Generic)", "price": "₹30-40", "manufacturer": "Various", "savings": 65},
        ]
    },
    "monocef": {
        "generic": "Ceftriaxone",
        "category": "Antibiotic",
        "brand_price": "₹150-200",
        "alternatives": [
            {"name": "Ceftriaxone (Generic)", "price": "₹60-80", "manufacturer": "Various", "savings": 60},
        ]
    },
    
    # Gastric/Antacids
    "pan": {
        "generic": "Pantoprazole",
        "category": "Proton Pump Inhibitor",
        "brand_price": "₹80-120",
        "alternatives": [
            {"name": "Pantocid", "price": "₹90", "manufacturer": "Sun Pharma"},
            {"name": "Pantop", "price": "₹70", "manufacturer": "Aristo"},
            {"name": "Pantoprazole (Generic)", "price": "₹25-35", "manufacturer": "Various", "savings": 70},
        ]
    },
    "omez": {
        "generic": "Omeprazole",
        "category": "Proton Pump Inhibitor",
        "brand_price": "₹60-90",
        "alternatives": [
            {"name": "Omeprazole (Generic)", "price": "₹20-30", "manufacturer": "Various", "savings": 65},
        ]
    },
    "rantac": {
        "generic": "Ranitidine",
        "category": "H2 Blocker",
        "brand_price": "₹30-50",
        "alternatives": [
            {"name": "Zinetac", "price": "₹35", "manufacturer": "GSK"},
            {"name": "Ranitidine (Generic)", "price": "₹10-15", "manufacturer": "Various", "savings": 70},
        ]
    },
    "gelusil": {
        "generic": "Aluminium Hydroxide + Magnesium Hydroxide",
        "category": "Antacid",
        "brand_price": "₹50-80",
        "alternatives": [
            {"name": "Digene", "price": "₹60", "manufacturer": "Abbott"},
            {"name": "Mucaine", "price": "₹70", "manufacturer": "Pfizer"},
        ]
    },
    
    # Diabetes
    "glycomet": {
        "generic": "Metformin",
        "category": "Antidiabetic",
        "brand_price": "₹50-80",
        "alternatives": [
            {"name": "Glucophage", "price": "₹90", "manufacturer": "Merck"},
            {"name": "Metformin (Generic)", "price": "₹20-30", "manufacturer": "Various", "savings": 65},
        ]
    },
    "januvia": {
        "generic": "Sitagliptin",
        "category": "DPP-4 Inhibitor",
        "brand_price": "₹600-800",
        "alternatives": [
            {"name": "Istavel", "price": "₹500", "manufacturer": "Sun Pharma"},
            {"name": "Sitagliptin (Generic)", "price": "₹300-400", "manufacturer": "Various", "savings": 50},
        ]
    },
    
    # Blood Pressure
    "amlodac": {
        "generic": "Amlodipine",
        "category": "Calcium Channel Blocker",
        "brand_price": "₹40-60",
        "alternatives": [
            {"name": "Amlong", "price": "₹35", "manufacturer": "Micro Labs"},
            {"name": "Amlodipine (Generic)", "price": "₹10-15", "manufacturer": "Various", "savings": 75},
        ]
    },
    "telma": {
        "generic": "Telmisartan",
        "category": "ARB Antihypertensive",
        "brand_price": "₹120-180",
        "alternatives": [
            {"name": "Telmikind", "price": "₹80", "manufacturer": "Mankind"},
            {"name": "Telmisartan (Generic)", "price": "₹40-50", "manufacturer": "Various", "savings": 70},
        ]
    },
    "concor": {
        "generic": "Bisoprolol",
        "category": "Beta Blocker",
        "brand_price": "₹80-120",
        "alternatives": [
            {"name": "Bisoprolol (Generic)", "price": "₹30-40", "manufacturer": "Various", "savings": 65},
        ]
    },
    
    # Cholesterol
    "atorva": {
        "generic": "Atorvastatin",
        "category": "Statin",
        "brand_price": "₹150-200",
        "alternatives": [
            {"name": "Lipitor", "price": "₹250", "manufacturer": "Pfizer"},
            {"name": "Atorvastatin (Generic)", "price": "₹50-70", "manufacturer": "Various", "savings": 65},
        ]
    },
    "rozavel": {
        "generic": "Rosuvastatin",
        "category": "Statin",
        "brand_price": "₹200-280",
        "alternatives": [
            {"name": "Crestor", "price": "₹350", "manufacturer": "AstraZeneca"},
            {"name": "Rosuvastatin (Generic)", "price": "₹80-100", "manufacturer": "Various", "savings": 60},
        ]
    },
    
    # Allergies
    "allegra": {
        "generic": "Fexofenadine",
        "category": "Antihistamine",
        "brand_price": "₹120-180",
        "alternatives": [
            {"name": "Fexova", "price": "₹80", "manufacturer": "Sun Pharma"},
            {"name": "Fexofenadine (Generic)", "price": "₹40-50", "manufacturer": "Various", "savings": 70},
        ]
    },
    "cetirizine": {
        "generic": "Cetirizine",
        "category": "Antihistamine",
        "brand_price": "₹30-50",
        "alternatives": [
            {"name": "Cetzine", "price": "₹25", "manufacturer": "Alkem"},
            {"name": "Zyrtec", "price": "₹40", "manufacturer": "GSK"},
            {"name": "Cetirizine (Generic)", "price": "₹10-15", "manufacturer": "Various", "savings": 70},
        ]
    },
    "montair": {
        "generic": "Montelukast",
        "category": "Leukotriene Receptor Antagonist",
        "brand_price": "₹150-200",
        "alternatives": [
            {"name": "Montelukast (Generic)", "price": "₹50-70", "manufacturer": "Various", "savings": 65},
        ]
    },
    
    # Vitamins & Supplements
    "becosules": {
        "generic": "Vitamin B Complex + Vitamin C",
        "category": "Vitamin Supplement",
        "brand_price": "₹50-70",
        "alternatives": [
            {"name": "Supradyn", "price": "₹80", "manufacturer": "Abbott"},
            {"name": "B-Complex (Generic)", "price": "₹20-30", "manufacturer": "Various", "savings": 60},
        ]
    },
    "shelcal": {
        "generic": "Calcium + Vitamin D3",
        "category": "Calcium Supplement",
        "brand_price": "₹180-220",
        "alternatives": [
            {"name": "Calcimax", "price": "₹150", "manufacturer": "Meyer"},
            {"name": "Calcium + D3 (Generic)", "price": "₹80-100", "manufacturer": "Various", "savings": 55},
        ]
    },
    "limcee": {
        "generic": "Vitamin C",
        "category": "Vitamin Supplement",
        "brand_price": "₹25-35",
        "alternatives": [
            {"name": "Celin", "price": "₹20", "manufacturer": "GSK"},
            {"name": "Vitamin C (Generic)", "price": "₹10-15", "manufacturer": "Various", "savings": 60},
        ]
    },
    
    # Cough & Cold
    "benadryl": {
        "generic": "Diphenhydramine",
        "category": "Cough Suppressant",
        "brand_price": "₹80-120",
        "alternatives": [
            {"name": "Phensedyl", "price": "₹90", "manufacturer": "Nicholas"},
            {"name": "Corex", "price": "₹85", "manufacturer": "Pfizer"},
        ]
    },
    "sinarest": {
        "generic": "Paracetamol + Phenylephrine + Chlorpheniramine",
        "category": "Cold & Flu",
        "brand_price": "₹40-60",
        "alternatives": [
            {"name": "Coldact", "price": "₹35", "manufacturer": "Sanofi"},
            {"name": "Cold Relief (Generic)", "price": "₹15-20", "manufacturer": "Various", "savings": 65},
        ]
    },
    
    # Skin
    "betnovate": {
        "generic": "Betamethasone",
        "category": "Corticosteroid",
        "brand_price": "₹60-90",
        "alternatives": [
            {"name": "Betamethasone (Generic)", "price": "₹25-35", "manufacturer": "Various", "savings": 60},
        ]
    },
    "candid": {
        "generic": "Clotrimazole",
        "category": "Antifungal",
        "brand_price": "₹80-120",
        "alternatives": [
            {"name": "Clotrimazole (Generic)", "price": "₹30-40", "manufacturer": "Various", "savings": 65},
        ]
    },
}


def extract_medicines_from_text(text: str) -> List[str]:
    """Extract medicine names from OCR text."""
    # Clean the text
    text = text.lower()
    
    # Common medicine name patterns
    medicines_found = []
    
    # Check against our database
    for medicine_key in MEDICINE_DATABASE.keys():
        if medicine_key in text:
            medicines_found.append(medicine_key)
    
    # Also try to extract words that look like medicine names
    # Medicine names often have specific patterns
    words = re.findall(r'\b[a-zA-Z]{3,15}\b', text)
    
    # Common medicine suffixes
    medicine_suffixes = ['ol', 'in', 'ide', 'ine', 'ate', 'zole', 'pam', 'lol', 'pril', 'sartan', 'statin']
    
    for word in words:
        word_lower = word.lower()
        # Skip common non-medicine words
        if word_lower in ['the', 'and', 'for', 'with', 'take', 'once', 'twice', 'daily', 'tablet', 'tablets', 
                          'capsule', 'capsules', 'morning', 'evening', 'night', 'after', 'before', 'food',
                          'meals', 'doctor', 'patient', 'date', 'name', 'age', 'prescription']:
            continue
        
        # Check if word ends with common medicine suffix
        for suffix in medicine_suffixes:
            if word_lower.endswith(suffix) and word_lower not in medicines_found:
                # Try to match with our database
                for medicine_key in MEDICINE_DATABASE.keys():
                    if medicine_key in word_lower or word_lower in medicine_key:
                        if medicine_key not in medicines_found:
                            medicines_found.append(medicine_key)
                        break
    
    return list(set(medicines_found))


def get_medicine_alternatives(medicine_name: str) -> Optional[Dict]:
    """Get generic alternatives for a medicine."""
    medicine_key = medicine_name.lower().strip()
    
    # Direct match
    if medicine_key in MEDICINE_DATABASE:
        data = MEDICINE_DATABASE[medicine_key]
        return {
            "original_medicine": medicine_name.title(),
            "generic_name": data["generic"],
            "category": data["category"],
            "brand_price": data["brand_price"],
            "alternatives": data["alternatives"]
        }
    
    # Partial match
    for key, data in MEDICINE_DATABASE.items():
        if key in medicine_key or medicine_key in key:
            return {
                "original_medicine": medicine_name.title(),
                "generic_name": data["generic"],
                "category": data["category"],
                "brand_price": data["brand_price"],
                "alternatives": data["alternatives"]
            }
    
    return None


def analyze_prescription(extracted_text: str) -> Dict:
    """Analyze prescription text and return medicine alternatives."""
    medicines = extract_medicines_from_text(extracted_text)
    
    results = {
        "medicines_found": [],
        "total_potential_savings": 0,
        "recommendations": []
    }
    
    for medicine in medicines:
        alternatives = get_medicine_alternatives(medicine)
        if alternatives:
            # Find the best savings
            best_savings = 0
            generic_option = None
            for alt in alternatives["alternatives"]:
                if alt.get("savings", 0) > best_savings:
                    best_savings = alt.get("savings", 0)
                    generic_option = alt
            
            medicine_info = {
                **alternatives,
                "best_generic": generic_option,
                "potential_savings": f"{best_savings}%" if best_savings > 0 else None
            }
            results["medicines_found"].append(medicine_info)
            
            if best_savings > 0:
                results["total_potential_savings"] += best_savings
    
    # Calculate average savings
    if results["medicines_found"]:
        results["total_potential_savings"] = results["total_potential_savings"] // len(results["medicines_found"])
    
    # Add recommendations
    if results["total_potential_savings"] > 50:
        results["recommendations"].append("💡 You can save significantly by switching to generic medicines!")
    if results["total_potential_savings"] > 0:
        results["recommendations"].append("🏥 Consult your doctor before switching to alternatives.")
        results["recommendations"].append("🛒 Generic medicines are available at Jan Aushadhi Kendras at lower prices.")
    
    return results


# Simulated OCR function (in production, use Google Vision API, Tesseract, etc.)
def simulate_ocr(image_content: bytes) -> str:
    """
    Simulate OCR text extraction from prescription image.
    In production, integrate with:
    - Google Cloud Vision API
    - Azure Computer Vision
    - AWS Textract
    - Tesseract OCR
    """
    # For demo purposes, return sample prescription text
    # In real implementation, this would process the actual image
    return """
    Dr. Sharma's Clinic
    Patient: Sample Patient
    Date: 25/01/2026
    
    Rx:
    1. Tab Crocin 650mg - 1-0-1 x 5 days
    2. Tab Augmentin 625mg - 1-1-1 x 7 days  
    3. Tab Pan 40mg - 1-0-0 x 10 days
    4. Syrup Benadryl - 2 tsp TDS x 5 days
    5. Tab Allegra 120mg - 0-0-1 x 5 days
    6. Tab Shelcal 500 - 0-1-0 x 30 days
    
    Advice: Take medicines after food. Drink plenty of water.
    Follow up after 7 days.
    """

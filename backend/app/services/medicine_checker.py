"""
Medicine Safety Checker - Validates medicine safety and interactions
"""
from typing import List, Dict, Optional
from dataclasses import dataclass

from app.knowledge.medicine_db import MEDICINE_DATABASE


@dataclass
class MedicineInfo:
    """Medicine information result"""
    name: str
    found: bool
    category: str
    common_uses: List[str]
    side_effects: List[str]
    warnings: List[str]
    max_daily_dose: str
    interactions: List[str]
    safe_for_children: bool
    safe_during_pregnancy: bool
    requires_prescription: bool


@dataclass
class InteractionWarning:
    """Drug interaction warning"""
    medicine1: str
    medicine2: str
    severity: str  # mild, moderate, severe
    description: str


class MedicineChecker:
    """Checks medicine safety, dosage, and interactions"""
    
    def __init__(self):
        self.medicine_db = MEDICINE_DATABASE
    
    def lookup(self, medicine_name: str) -> MedicineInfo:
        """
        Look up medicine information
        
        Args:
            medicine_name: Name of medicine
            
        Returns:
            MedicineInfo with details
        """
        name_lower = medicine_name.lower().strip()
        
        # Search in database
        for med_key, med_data in self.medicine_db.items():
            aliases = [med_key.lower()] + [a.lower() for a in med_data.get("aliases", [])]
            
            if name_lower in aliases or any(name_lower in a for a in aliases):
                return MedicineInfo(
                    name=med_key,
                    found=True,
                    category=med_data.get("category", "Unknown"),
                    common_uses=med_data.get("uses", []),
                    side_effects=med_data.get("side_effects", []),
                    warnings=med_data.get("warnings", []),
                    max_daily_dose=med_data.get("max_dose", "Consult doctor"),
                    interactions=med_data.get("interactions", []),
                    safe_for_children=med_data.get("safe_children", False),
                    safe_during_pregnancy=med_data.get("safe_pregnancy", False),
                    requires_prescription=med_data.get("prescription", True)
                )
        
        return MedicineInfo(
            name=medicine_name,
            found=False,
            category="Unknown",
            common_uses=[],
            side_effects=[],
            warnings=["Medicine not found in database. Please consult a doctor."],
            max_daily_dose="Unknown",
            interactions=[],
            safe_for_children=False,
            safe_during_pregnancy=False,
            requires_prescription=True
        )
    
    def check_interactions(self, medicines: List[str]) -> List[InteractionWarning]:
        """
        Check for drug interactions between multiple medicines
        
        Args:
            medicines: List of medicine names
            
        Returns:
            List of interaction warnings
        """
        warnings = []
        
        # Known dangerous combinations
        dangerous_combos = {
            ("paracetamol", "alcohol"): ("severe", "Can cause liver damage"),
            ("aspirin", "ibuprofen"): ("moderate", "Increased risk of stomach bleeding"),
            ("aspirin", "warfarin"): ("severe", "Increased risk of bleeding"),
            ("metformin", "alcohol"): ("severe", "Risk of lactic acidosis"),
            ("omeprazole", "clopidogrel"): ("moderate", "Reduced effectiveness of clopidogrel"),
        }
        
        medicines_lower = [m.lower().strip() for m in medicines]
        
        for i, med1 in enumerate(medicines_lower):
            for med2 in medicines_lower[i+1:]:
                # Check both orderings
                key1 = (med1, med2)
                key2 = (med2, med1)
                
                if key1 in dangerous_combos:
                    severity, desc = dangerous_combos[key1]
                    warnings.append(InteractionWarning(med1, med2, severity, desc))
                elif key2 in dangerous_combos:
                    severity, desc = dangerous_combos[key2]
                    warnings.append(InteractionWarning(med1, med2, severity, desc))
        
        return warnings
    
    def check_overuse(self, medicine: str, doses_per_day: int) -> Dict:
        """Check if medicine is being overused"""
        info = self.lookup(medicine)
        
        if not info.found:
            return {"warning": True, "message": "Unknown medicine - consult doctor"}
        
        # Simple dose checking
        max_doses = {
            "paracetamol": 4,
            "ibuprofen": 3,
            "aspirin": 3,
            "cetirizine": 1,
            "omeprazole": 2
        }
        
        med_lower = medicine.lower()
        max_allowed = max_doses.get(med_lower, 3)
        
        if doses_per_day > max_allowed:
            return {
                "warning": True,
                "message": f"Exceeds recommended dose. Maximum {max_allowed} times per day.",
                "risk": "Overuse may cause adverse effects"
            }
        
        return {"warning": False, "message": "Within safe limits"}
    
    def get_safe_alternatives(self, medicine: str, condition: str) -> List[str]:
        """Suggest safer alternatives for sensitive groups"""
        alternatives = {
            "paracetamol": ["For fever/pain - stay hydrated, rest"],
            "ibuprofen": ["Paracetamol for pain", "Cold compress for inflammation"],
            "aspirin": ["Paracetamol if not for heart condition"]
        }
        return alternatives.get(medicine.lower(), ["Consult doctor for alternatives"])


# Singleton instance
medicine_checker = MedicineChecker()

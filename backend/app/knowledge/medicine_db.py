"""
Medicine Database
Common OTC medicines with safety information
"""

import json
import os
import re
from pathlib import Path
from typing import Any, Dict, List

MEDICINE_DATABASE = {
    "paracetamol": {
        "aliases": ["acetaminophen", "crocin", "dolo", "calpol", "tylenol", "पैरासिटामोल"],
        "category": "Analgesic/Antipyretic",
        "uses": ["Fever", "Headache", "Body pain", "Cold symptoms"],
        "side_effects": ["Nausea", "Allergic reaction (rare)", "Liver damage (overdose)"],
        "warnings": [
            "Do not exceed 4g (4000mg) per day",
            "Avoid with alcohol",
            "Check for paracetamol in other medications to avoid double dosing",
            "Consult doctor if liver problems exist"
        ],
        "max_dose": "500-1000mg every 4-6 hours, max 4g/day",
        "interactions": ["alcohol", "warfarin"],
        "safe_children": True,
        "safe_pregnancy": True,  # Generally safe, consult doctor
        "prescription": False
    },
    
    "ibuprofen": {
        "aliases": ["brufen", "advil", "motrin", "आइबुप्रोफेन"],
        "category": "NSAID",
        "uses": ["Pain relief", "Inflammation", "Fever", "Headache", "Menstrual cramps"],
        "side_effects": ["Stomach upset", "Nausea", "Heartburn", "Dizziness"],
        "warnings": [
            "Take with food to reduce stomach irritation",
            "Avoid if history of stomach ulcers",
            "Not recommended for heart patients",
            "Avoid in last trimester of pregnancy"
        ],
        "max_dose": "200-400mg every 4-6 hours, max 1200mg/day (OTC)",
        "interactions": ["aspirin", "warfarin", "blood pressure medications"],
        "safe_children": True,  # With appropriate dosing
        "safe_pregnancy": False,
        "prescription": False
    },
    
    "aspirin": {
        "aliases": ["disprin", "ecosprin", "एस्पिरिन"],
        "category": "NSAID/Blood thinner",
        "uses": ["Pain relief", "Fever", "Heart protection", "Blood thinning"],
        "side_effects": ["Stomach bleeding", "Heartburn", "Nausea", "Bruising"],
        "warnings": [
            "Not for children under 16 (Reye's syndrome risk)",
            "Avoid if bleeding disorder",
            "Stop before surgery",
            "Not for dengue fever"
        ],
        "max_dose": "300-600mg every 4-6 hours, max 4g/day",
        "interactions": ["ibuprofen", "warfarin", "blood thinners"],
        "safe_children": False,
        "safe_pregnancy": False,
        "prescription": False
    },
    
    "cetirizine": {
        "aliases": ["zyrtec", "cetzine", "सेटीरिज़िन", "alerid"],
        "category": "Antihistamine",
        "uses": ["Allergies", "Hay fever", "Hives", "Itching", "Runny nose"],
        "side_effects": ["Drowsiness", "Dry mouth", "Headache", "Fatigue"],
        "warnings": [
            "May cause drowsiness - avoid driving",
            "Avoid alcohol",
            "Use caution in kidney disease"
        ],
        "max_dose": "10mg once daily",
        "interactions": ["alcohol", "sedatives"],
        "safe_children": True,  # 6 months and older with appropriate dose
        "safe_pregnancy": False,  # Consult doctor
        "prescription": False
    },
    
    "omeprazole": {
        "aliases": ["prilosec", "omez", "ओमेप्राज़ोल"],
        "category": "Proton Pump Inhibitor",
        "uses": ["Acidity", "GERD", "Stomach ulcers", "Heartburn"],
        "side_effects": ["Headache", "Nausea", "Diarrhea", "Stomach pain"],
        "warnings": [
            "Not for long-term use without doctor supervision",
            "Take 30-60 minutes before meals",
            "May affect vitamin B12 absorption"
        ],
        "max_dose": "20-40mg once daily",
        "interactions": ["clopidogrel", "methotrexate"],
        "safe_children": True,  # With doctor supervision
        "safe_pregnancy": False,  # Consult doctor
        "prescription": False  # Low dose OTC
    },
    
    "antacid": {
        "aliases": ["digene", "gelusil", "eno", "एंटासिड"],
        "category": "Antacid",
        "uses": ["Acidity", "Heartburn", "Indigestion", "Gas"],
        "side_effects": ["Constipation", "Diarrhea", "Nausea"],
        "warnings": [
            "Do not take for more than 2 weeks continuously",
            "Take 1 hour after meals",
            "May affect absorption of other medicines"
        ],
        "max_dose": "As directed on package",
        "interactions": ["other medications - take separately"],
        "safe_children": True,
        "safe_pregnancy": True,
        "prescription": False
    },
    
    "ors": {
        "aliases": ["oral rehydration solution", "electral", "ओआरएस"],
        "category": "Electrolyte solution",
        "uses": ["Dehydration", "Diarrhea", "Vomiting", "Heat exhaustion"],
        "side_effects": ["None when used properly"],
        "warnings": [
            "Mix with correct amount of clean water",
            "Use within 24 hours of preparation",
            "Do not add sugar or salt"
        ],
        "max_dose": "As needed based on fluid loss",
        "interactions": [],
        "safe_children": True,
        "safe_pregnancy": True,
        "prescription": False
    },
    
    "loperamide": {
        "aliases": ["imodium", "लोपेरामाइड", "eldoper"],
        "category": "Anti-diarrheal",
        "uses": ["Diarrhea", "Loose motions"],
        "side_effects": ["Constipation", "Dizziness", "Nausea", "Stomach cramps"],
        "warnings": [
            "Not for bloody diarrhea or fever",
            "Not for children under 2",
            "Do not use for more than 2 days",
            "Seek medical help if no improvement"
        ],
        "max_dose": "4mg initially, then 2mg after each loose stool, max 16mg/day",
        "interactions": [],
        "safe_children": False,  # Not under 6
        "safe_pregnancy": False,
        "prescription": False
    },
    
    "metformin": {
        "aliases": ["glucophage", "glycomet", "मेटफोर्मिन"],
        "category": "Anti-diabetic",
        "uses": ["Type 2 Diabetes", "Blood sugar control"],
        "side_effects": ["Nausea", "Diarrhea", "Stomach upset", "Metallic taste"],
        "warnings": [
            "PRESCRIPTION REQUIRED",
            "Take with meals",
            "Avoid alcohol",
            "Stop before contrast dye procedures"
        ],
        "max_dose": "As prescribed by doctor",
        "interactions": ["alcohol", "contrast dye"],
        "safe_children": False,
        "safe_pregnancy": False,
        "prescription": True
    },
    
    "amlodipine": {
        "aliases": ["norvasc", "amlong", "एम्लोडिपिन"],
        "category": "Blood Pressure Medication",
        "uses": ["High blood pressure", "Chest pain (angina)"],
        "side_effects": ["Swelling in ankles", "Headache", "Flushing", "Dizziness"],
        "warnings": [
            "PRESCRIPTION REQUIRED",
            "Do not stop suddenly",
            "Monitor blood pressure regularly",
            "Avoid grapefruit"
        ],
        "max_dose": "As prescribed by doctor",
        "interactions": ["grapefruit", "other BP medications"],
        "safe_children": False,
        "safe_pregnancy": False,
        "prescription": True
    },
    
    "azithromycin": {
        "aliases": ["zithromax", "azithral", "अज़िथ्रोमाइसिन"],
        "category": "Antibiotic",
        "uses": ["Bacterial infections", "Respiratory infections", "Skin infections"],
        "side_effects": ["Diarrhea", "Nausea", "Stomach pain", "Headache"],
        "warnings": [
            "PRESCRIPTION REQUIRED",
            "Complete full course",
            "Take on empty stomach or with food",
            "May cause heart rhythm issues in some"
        ],
        "max_dose": "As prescribed by doctor",
        "interactions": ["antacids"],
        "safe_children": True,  # With prescription
        "safe_pregnancy": False,  # Consult doctor
        "prescription": True
    },
    
    "dextromethorphan": {
        "aliases": ["benadryl cough", "cough syrup", "डेक्सट्रोमेथोर्फन"],
        "category": "Cough Suppressant",
        "uses": ["Dry cough", "Cold symptoms"],
        "side_effects": ["Drowsiness", "Dizziness", "Nausea"],
        "warnings": [
            "Not for productive (wet) cough",
            "May cause drowsiness",
            "Check for alcohol content in syrup"
        ],
        "max_dose": "As directed on package",
        "interactions": ["MAO inhibitors", "sedatives"],
        "safe_children": True,  # Age-appropriate dosing
        "safe_pregnancy": False,
        "prescription": False
    }
}


def _is_meaningful(value: Any) -> bool:
    if value is None:
        return False
    if isinstance(value, str):
        text = value.strip().lower()
        return text not in {"", "unknown", "n/a", "na", "not available", "consult doctor"}
    if isinstance(value, list):
        return any(_is_meaningful(item) for item in value)
    return True


def _ensure_list(value: Any) -> List[str]:
    if value is None:
        return []
    if isinstance(value, list):
        return [str(item).strip() for item in value if str(item).strip()]
    text = str(value).strip()
    return [text] if text else []


def _dedupe_keep_order(items: List[str]) -> List[str]:
    unique: List[str] = []
    seen = set()
    for item in items:
        key = item.lower().strip()
        if not key or key in seen:
            continue
        seen.add(key)
        unique.append(item.strip())
    return unique


def _normalize_entry(key: str, entry: Dict[str, Any]) -> Dict[str, Any]:
    aliases = _ensure_list(entry.get("aliases"))
    if key not in [alias.lower() for alias in aliases]:
        aliases.append(key)

    return {
        "aliases": _dedupe_keep_order(aliases),
        "category": str(entry.get("category", "Medicine") or "Medicine"),
        "uses": _dedupe_keep_order(_ensure_list(entry.get("uses"))),
        "side_effects": _dedupe_keep_order(_ensure_list(entry.get("side_effects"))),
        "warnings": _dedupe_keep_order(_ensure_list(entry.get("warnings"))),
        "max_dose": str(entry.get("max_dose", "Consult doctor") or "Consult doctor"),
        "interactions": _dedupe_keep_order(_ensure_list(entry.get("interactions"))),
        "safe_children": bool(entry.get("safe_children", False)),
        "safe_pregnancy": bool(entry.get("safe_pregnancy", False)),
        "prescription": bool(entry.get("prescription", True)),
    }


def _merge_entry(base: Dict[str, Any], extra: Dict[str, Any]) -> Dict[str, Any]:
    merged = dict(base)

    merged["aliases"] = _dedupe_keep_order(_ensure_list(base.get("aliases")) + _ensure_list(extra.get("aliases")))
    merged["uses"] = _dedupe_keep_order(_ensure_list(base.get("uses")) + _ensure_list(extra.get("uses")))
    merged["side_effects"] = _dedupe_keep_order(_ensure_list(base.get("side_effects")) + _ensure_list(extra.get("side_effects")))
    merged["warnings"] = _dedupe_keep_order(_ensure_list(base.get("warnings")) + _ensure_list(extra.get("warnings")))
    merged["interactions"] = _dedupe_keep_order(_ensure_list(base.get("interactions")) + _ensure_list(extra.get("interactions")))

    for scalar_field in ["category", "max_dose"]:
        base_value = merged.get(scalar_field)
        extra_value = extra.get(scalar_field)
        if not _is_meaningful(base_value) and _is_meaningful(extra_value):
            merged[scalar_field] = extra_value

    # Keep conservative safety defaults. If any source marks True, keep True.
    merged["safe_children"] = bool(base.get("safe_children", False) or extra.get("safe_children", False))
    merged["safe_pregnancy"] = bool(base.get("safe_pregnancy", False) or extra.get("safe_pregnancy", False))
    # If either source flags prescription requirement, keep True.
    merged["prescription"] = bool(base.get("prescription", True) or extra.get("prescription", True))

    return _normalize_entry(merged.get("aliases", [""])[0].lower() if merged.get("aliases") else "medicine", merged)


def _sanitize_key(raw_key: str) -> str:
    text = raw_key.strip().lower()
    text = re.sub(r"[^a-z0-9]+", "_", text)
    text = re.sub(r"_+", "_", text).strip("_")
    return text or "medicine"


def _load_external_medicine_database() -> Dict[str, Dict[str, Any]]:
    configured_path = os.getenv("MEDICINE_DB_JSON_PATH", "").strip()
    default_path = Path(__file__).with_name("generated_medicine_db.json")
    candidate_paths = [Path(configured_path)] if configured_path else [default_path]

    for path in candidate_paths:
        if not path.exists():
            continue

        try:
            with path.open("r", encoding="utf-8") as file:
                payload = json.load(file)
        except Exception as exc:
            print(f"Warning: failed loading external medicine DB from {path}: {exc}")
            continue

        if not isinstance(payload, dict):
            print(f"Warning: external medicine DB at {path} must be a JSON object keyed by medicine")
            continue

        normalized: Dict[str, Dict[str, Any]] = {}
        for raw_key, raw_entry in payload.items():
            if not isinstance(raw_entry, dict):
                continue
            key = _sanitize_key(str(raw_key))
            normalized[key] = _normalize_entry(key, raw_entry)
        return normalized

    return {}


def _merge_external_medicine_database() -> None:
    external_db = _load_external_medicine_database()
    if not external_db:
        return

    for key, extra_entry in external_db.items():
        if key in MEDICINE_DATABASE:
            MEDICINE_DATABASE[key] = _merge_entry(MEDICINE_DATABASE[key], extra_entry)
        else:
            MEDICINE_DATABASE[key] = extra_entry


_merge_external_medicine_database()

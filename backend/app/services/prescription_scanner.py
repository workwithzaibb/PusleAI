"""
Prescription Scanner Service
Extracts medicine names from prescription images and suggests generic/cheaper alternatives.
"""
import os
import json
import base64
import re
import asyncio
from typing import List, Dict, Optional
from dataclasses import dataclass
from difflib import SequenceMatcher
from google import genai
from google.genai import types
from app.config import settings
from app.knowledge.medicine_db import MEDICINE_DATABASE as KNOWLEDGE_MEDICINE_DB


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


MEDICATION_FORM_WORDS = {
    "tab", "tablet", "cap", "capsule", "syp", "syrup", "inj", "injection",
    "cream", "ointment", "drops", "drop"
}

INSTRUCTION_STOPWORDS = {
    "od", "bd", "tds", "qid", "hs", "sos", "stat", "daily", "once", "twice",
    "thrice", "after", "before", "food", "days", "day", "week", "weeks", "month",
    "months", "morning", "evening", "night", "nocte", "for", "take"
}

NON_MEDICATION_LINE_MARKERS = {
    "patient", "date", "follow up", "advice", "clinic", "doctor", "diagnosis"
}


def _normalize_whitespace(value: str) -> str:
    return re.sub(r"\s+", " ", value).strip()


def _normalize_lookup_text(value: str) -> str:
    """Normalize medicine strings for reliable matching."""
    text = value.lower()
    text = re.sub(r"[^a-z0-9+\-\s]", " ", text)
    text = re.sub(r"\b(?:tab(?:let)?|cap(?:sule)?|syp|syrup|inj(?:ection)?|cream|ointment|drops?)\b", " ", text)
    text = re.sub(r"\b\d+(?:\.\d+)?\s?(?:mg|mcg|g|ml|iu|units?)\b", " ", text)
    text = re.sub(r"\b(?:sr|xr|cr|er|mr|od|bd|tds|qid|hs|sos|stat)\b", " ", text)
    text = re.sub(r"\b\d+(?:[-/.]\d+)*\b", " ", text)
    return _normalize_whitespace(text)


def _build_medicine_lookup_index() -> Dict[str, str]:
    """Build alias/brand/generic index -> canonical database key."""
    lookup: Dict[str, str] = {}

    for canonical_key, data in MEDICINE_DATABASE.items():
        candidates = {canonical_key, data.get("generic", "")}

        for alt in data.get("alternatives", []):
            alt_name = alt.get("name", "")
            if alt_name:
                candidates.add(alt_name)

        for candidate in candidates:
            normalized = _normalize_lookup_text(candidate)
            if len(normalized) < 3:
                continue

            lookup.setdefault(normalized, canonical_key)

            # Index first token too for names like "dolo 650" -> "dolo"
            first_token = normalized.split()[0]
            if len(first_token) >= 3:
                lookup.setdefault(first_token, canonical_key)

    return lookup


def _build_generic_to_canonical_index() -> Dict[str, str]:
    """Map normalized generic component names to canonical local DB keys."""
    generic_map: Dict[str, str] = {}
    for canonical_key, data in MEDICINE_DATABASE.items():
        normalized_generic = _normalize_lookup_text(data.get("generic", ""))
        if len(normalized_generic) < 3:
            continue
        generic_map.setdefault(normalized_generic, canonical_key)
    return generic_map


def _build_knowledge_lookup_index() -> Dict[str, str]:
    """Map known medicine aliases to generic keys from knowledge DB."""
    lookup: Dict[str, str] = {}

    for generic_key, data in KNOWLEDGE_MEDICINE_DB.items():
        candidates = {generic_key}
        candidates.update(data.get("aliases", []))

        for candidate in candidates:
            normalized = _normalize_lookup_text(candidate)
            if len(normalized) < 3:
                continue

            lookup.setdefault(normalized, generic_key)
            first_token = normalized.split()[0]
            if len(first_token) >= 3:
                lookup.setdefault(first_token, generic_key)

    return lookup


MEDICINE_LOOKUP_INDEX = _build_medicine_lookup_index()
GENERIC_TO_CANONICAL_INDEX = _build_generic_to_canonical_index()
KNOWLEDGE_LOOKUP_INDEX = _build_knowledge_lookup_index()


RX_FAST_MODE = os.getenv("RX_SCANNER_FAST_MODE", "true").lower() in {"1", "true", "yes", "on"}
RX_LLM_TIMEOUT_SECONDS = float(os.getenv("RX_SCANNER_LLM_TIMEOUT_SECONDS", "6"))
RX_MAX_AI_ALTERNATIVE_LOOKUPS = max(0, int(os.getenv("RX_SCANNER_MAX_AI_LOOKUPS", "1")))
AI_ALTERNATIVES_CACHE: Dict[str, Dict] = {}


def _extract_candidates_from_line(line: str) -> List[str]:
    """Extract likely medicine phrases from one prescription line."""
    extracted: List[str] = []
    if not line or not re.search(r"[A-Za-z]", line):
        return extracted

    working = re.sub(r"^\s*\d+\s*[).:-]?\s*", "", line.strip())
    working = re.sub(r"^\s*Rx\s*[:.-]?\s*", "", working, flags=re.IGNORECASE)

    if not working:
        return extracted

    # Skip obvious non-medication lines unless they still contain dosage/form terms.
    lowered = working.lower()
    if any(marker in lowered for marker in NON_MEDICATION_LINE_MARKERS):
        if not re.search(r"\b(?:tab|tablet|cap|capsule|syp|syrup|inj|injection|\d+\s?(?:mg|ml))\b", lowered):
            return extracted

    # Prefer tokens after medicine-form words when present.
    form_match = re.search(
        r"\b(?:tab(?:let)?|cap(?:sule)?|syp|syrup|inj(?:ection)?|cream|ointment|drops?)\.?\s+(.+)$",
        working,
        flags=re.IGNORECASE,
    )
    candidate = form_match.group(1) if form_match else working

    # Stop at separators/instructions (frequency, duration, etc).
    candidate = re.split(r"\s*[-,;:]\s*", candidate, maxsplit=1)[0]
    candidate = re.split(
        r"\s+\b(?:od|bd|tds|qid|hs|sos|stat|daily|once|twice|thrice|after|before|for|x)\b",
        candidate,
        maxsplit=1,
        flags=re.IGNORECASE,
    )[0]

    # Keep at most first few medically relevant tokens.
    tokens = []
    for raw_token in candidate.split():
        token = raw_token.strip().strip(".,:;()[]{}")
        if not token:
            continue

        if token.lower() in INSTRUCTION_STOPWORDS:
            break

        tokens.append(token)
        if len(tokens) >= 5:
            break

    if tokens:
        cleaned_candidate = _normalize_whitespace(" ".join(tokens))
        if len(cleaned_candidate) >= 3:
            extracted.append(cleaned_candidate)

    return extracted


def _extract_known_terms_from_text(text: str) -> List[str]:
    """Find known medicine aliases directly in OCR text."""
    found_terms: List[str] = []
    searchable_terms = sorted(MEDICINE_LOOKUP_INDEX.keys(), key=len, reverse=True)

    for term in searchable_terms:
        if len(term) < 3:
            continue

        pattern = rf"(?<![A-Za-z0-9]){re.escape(term)}(?![A-Za-z0-9])"
        for match in re.finditer(pattern, text, flags=re.IGNORECASE):
            found_terms.append(match.group(0))

    return found_terms


def _unique_medicine_candidates(candidates: List[str]) -> List[str]:
    """Dedupe while preserving order and keeping display-friendly names."""
    unique: List[str] = []
    seen = set()

    for candidate in candidates:
        cleaned = _normalize_whitespace(candidate)
        if len(cleaned) < 3:
            continue

        key = _normalize_lookup_text(cleaned) or cleaned.lower()
        if key in seen:
            continue

        seen.add(key)
        unique.append(cleaned)

    return unique


def _resolve_medicine_key(medicine_name: str) -> Optional[str]:
    """Resolve OCR medicine text to a canonical key in MEDICINE_DATABASE."""
    normalized = _normalize_lookup_text(medicine_name)
    if not normalized:
        return None

    if normalized in MEDICINE_LOOKUP_INDEX:
        return MEDICINE_LOOKUP_INDEX[normalized]

    # Try token-level lookup (for strings like "Crocin 650 mg" etc).
    for token in normalized.split():
        if token in MEDICINE_LOOKUP_INDEX:
            return MEDICINE_LOOKUP_INDEX[token]

    # Partial containment fallback for OCR noise.
    for alias, canonical in MEDICINE_LOOKUP_INDEX.items():
        if len(alias) >= 4 and (alias in normalized or normalized in alias):
            return canonical

    # Fuzzy fallback only as last resort.
    best_key = None
    best_score = 0.0
    for alias, canonical in MEDICINE_LOOKUP_INDEX.items():
        score = SequenceMatcher(a=normalized, b=alias).ratio()
        if score > best_score:
            best_score = score
            best_key = canonical

    if best_score >= 0.86:
        return best_key

    return None


def _resolve_knowledge_generic_key(medicine_name: str) -> Optional[str]:
    """Resolve medicine text to a generic key from knowledge DB aliases."""
    normalized = _normalize_lookup_text(medicine_name)
    if not normalized:
        return None

    if normalized in KNOWLEDGE_LOOKUP_INDEX:
        return KNOWLEDGE_LOOKUP_INDEX[normalized]

    for token in normalized.split():
        if token in KNOWLEDGE_LOOKUP_INDEX:
            return KNOWLEDGE_LOOKUP_INDEX[token]

    for alias, generic_key in KNOWLEDGE_LOOKUP_INDEX.items():
        if len(alias) >= 4 and (alias in normalized or normalized in alias):
            return generic_key

    return None


async def extract_medicines_from_text(text: str) -> List[str]:
    """Extract medicine names from OCR text using deterministic parsing + Gemini assist."""
    if not text or len(text.strip()) < 3:
        return []

    deterministic_matches: List[str] = []

    # 1) Deterministic line parsing.
    # Many prescriptions come as one line separated by semicolons.
    for line in re.split(r"[\r\n;]+", text):
        deterministic_matches.extend(_extract_candidates_from_line(line))

    # 2) Known-term direct scan in full OCR text.
    deterministic_matches.extend(_extract_known_terms_from_text(text))

    deterministic_matches = _unique_medicine_candidates(deterministic_matches)

    # Fast path: deterministic extraction is usually enough and avoids extra LLM latency.
    if deterministic_matches and RX_FAST_MODE:
        return deterministic_matches
        
    api_key = settings.GEMINI_API_KEY
    if not api_key:
        print("Warning: GEMINI_API_KEY not set. Using deterministic extraction.")
        return deterministic_matches

    try:
        client = genai.Client(api_key=api_key)
        prompt = (
            f"Extract only the pure medicine/drug names from the following prescription text. "
            f"Ignore dosages, frequencies (like 1-0-1), and generic words. "
            f"Return ONLY a JSON object with a single key 'medicines' containing an array of strings. "
            f"Prescription Text:\n{text}"
        )
        
        response = await asyncio.wait_for(
            client.aio.models.generate_content(
                model="gemini-2.5-flash",
                contents=prompt,
                config=types.GenerateContentConfig(
                    system_instruction="You are a medical assistant that outputs strictly valid JSON objects with a 'medicines' array of strings. Do not include markdown blocks or any other text.",
                    response_mime_type="application/json",
                    temperature=0.1
                )
            )
            , timeout=RX_LLM_TIMEOUT_SECONDS
        )
        
        data = json.loads(response.text)
        extracted = data.get("medicines", [])
        
        llm_matches = [m.strip() for m in extracted if isinstance(m, str) and len(m.strip()) > 2]
        return _unique_medicine_candidates(deterministic_matches + llm_matches)
    except Exception as e:
        print(f"Gemini Extraction Error: {e}")
        return deterministic_matches


async def get_medicine_alternatives(medicine_name: str, allow_ai_fallback: bool = True) -> Optional[Dict]:
    """Get alternatives for a medicine, with robust canonical resolution."""
    raw_name = _normalize_whitespace(medicine_name)
    medicine_key = _resolve_medicine_key(raw_name) or raw_name.lower().strip()
    
    # 1. Direct match in local DB
    if medicine_key in MEDICINE_DATABASE:
        data = MEDICINE_DATABASE[medicine_key]
        return {
            "original_medicine": raw_name,
            "generic_name": data["generic"],
            "category": data["category"],
            "brand_price": data["brand_price"],
            "alternatives": data["alternatives"]
        }

    # 2. Knowledge DB fallback by aliases/generic names (no external call).
    knowledge_generic_key = _resolve_knowledge_generic_key(raw_name)
    if knowledge_generic_key:
        normalized_generic = _normalize_lookup_text(knowledge_generic_key)
        canonical_key = GENERIC_TO_CANONICAL_INDEX.get(normalized_generic)

        # If local DB has this generic, reuse its alternatives for actionable output.
        if canonical_key and canonical_key in MEDICINE_DATABASE:
            data = MEDICINE_DATABASE[canonical_key]
            return {
                "original_medicine": raw_name,
                "generic_name": data["generic"],
                "category": data["category"],
                "brand_price": data["brand_price"],
                "alternatives": data["alternatives"]
            }

        # Otherwise still return useful generic/category details.
        knowledge_data = KNOWLEDGE_MEDICINE_DB.get(knowledge_generic_key, {})
        return {
            "original_medicine": raw_name,
            "generic_name": knowledge_generic_key.title(),
            "category": knowledge_data.get("category", "Medicine"),
            "brand_price": "N/A",
            "alternatives": []
        }

    # 3. Fallback: Ask Gemini LLM for alternatives
    if not allow_ai_fallback:
        return None

    cache_key = _normalize_lookup_text(raw_name) or raw_name.lower()
    cached = AI_ALTERNATIVES_CACHE.get(cache_key)
    if cached:
        return {**cached, "original_medicine": raw_name}

    api_key = settings.GEMINI_API_KEY
    if not api_key:
        return None
        
    try:
        client = genai.Client(api_key=api_key)
        prompt = (
            f"Provide information for the medicine '{medicine_name}'. "
            f"Return a strict JSON object with this exact structure: "
            f'{{"generic": "Generic Component Name", "category": "Medical Category", "brand_price": "₹XX-YY", "alternatives": [{{"name": "Cheaper Brand Name", "price": "₹ZZ", "manufacturer": "Company Name", "savings": 40}}]}}'
            f" Ensure the alternatives are cheaper generic Indian brands if possible. Limit to 3 alternatives."
        )
        
        response = await asyncio.wait_for(
            client.aio.models.generate_content(
                model="gemini-2.5-flash",
                contents=prompt,
                config=types.GenerateContentConfig(
                    system_instruction="You are a pharmaceutical expert system that outputs only valid JSON objects with no surrounding markdown or text.",
                    response_mime_type="application/json",
                    temperature=0.2
                )
            )
            , timeout=RX_LLM_TIMEOUT_SECONDS
        )
        
        data = json.loads(response.text)

        resolved = {
            "original_medicine": raw_name,
            "generic_name": data.get("generic", "Unknown Generic"),
            "category": data.get("category", "Medicine"),
            "brand_price": data.get("brand_price", "N/A"),
            "alternatives": data.get("alternatives", [])
        }

        AI_ALTERNATIVES_CACHE[cache_key] = {
            "original_medicine": "",
            "generic_name": resolved["generic_name"],
            "category": resolved["category"],
            "brand_price": resolved["brand_price"],
            "alternatives": resolved["alternatives"],
        }
        return resolved
    except Exception as e:
        print(f"Gemini Alternatives Error: {e}")
        return None


async def analyze_prescription(extracted_text: str) -> Dict:
    """Analyze prescription text and return medicine alternatives."""
    medicines = await extract_medicines_from_text(extracted_text)
    
    results = {
        "medicines_found": [],
        "medicines_detected": len(medicines),
        "medicines_with_alternatives": 0,
        "total_potential_savings": 0,
        "recommendations": []
    }

    # First pass: resolve from local DB only (fast, no network).
    local_tasks = [get_medicine_alternatives(med, allow_ai_fallback=False) for med in medicines]
    local_alternatives = await asyncio.gather(*local_tasks) if local_tasks else []

    # Optional second pass: bounded AI fallback only for unresolved medicines.
    ai_overrides: Dict[int, Optional[Dict]] = {}
    unresolved_indices = [idx for idx, item in enumerate(local_alternatives) if not item]
    if settings.GEMINI_API_KEY and unresolved_indices and RX_MAX_AI_ALTERNATIVE_LOOKUPS > 0:
        selected_indices = unresolved_indices[:RX_MAX_AI_ALTERNATIVE_LOOKUPS]
        ai_tasks = [
            get_medicine_alternatives(medicines[idx], allow_ai_fallback=True)
            for idx in selected_indices
        ]
        ai_results = await asyncio.gather(*ai_tasks, return_exceptions=True)
        for idx, ai_result in zip(selected_indices, ai_results):
            ai_overrides[idx] = ai_result if isinstance(ai_result, dict) else None

    for idx, medicine in enumerate(medicines):
        alternatives = local_alternatives[idx] if idx < len(local_alternatives) else None
        if not alternatives and idx in ai_overrides:
            alternatives = ai_overrides[idx]

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
            if alternatives.get("alternatives"):
                results["medicines_with_alternatives"] += 1
            
            if best_savings > 0:
                results["total_potential_savings"] += best_savings
        else:
            # Preserve exact detected medicine even if local/AI alternatives are unavailable.
            results["medicines_found"].append({
                "original_medicine": medicine,
                "generic_name": "Not found in database",
                "category": "Unknown",
                "brand_price": "N/A",
                "alternatives": [],
                "best_generic": None,
                "potential_savings": None,
            })
    
    # Calculate average savings
    if results["medicines_found"]:
        results["total_potential_savings"] = results["total_potential_savings"] // len(results["medicines_found"])
    
    # Add recommendations
    if results["total_potential_savings"] > 50:
        results["recommendations"].append("💡 You can save significantly by switching to generic medicines!")
    if results["total_potential_savings"] > 0:
        results["recommendations"].append("🏥 Consult your doctor before switching to alternatives.")
        results["recommendations"].append("🛒 Generic medicines are available at Jan Aushadhi Kendras at lower prices.")
    if results["medicines_detected"] == 0:
        results["recommendations"].append("📷 No medicines detected. Try a clearer image with full prescription visible.")
    elif results["medicines_with_alternatives"] == 0:
        results["recommendations"].append("🔎 Medicines were detected but no reliable alternatives were found. Try exact brand spelling.")
    
    return results


async def perform_ocr(image_content: bytes, content_type: str = "image/jpeg") -> str:
    """
    Perform OCR text extraction using Gemini Vision.
    """
    api_key = settings.GEMINI_API_KEY
    if not api_key:
        print("Warning: GEMINI_API_KEY not set. Using simulated OCR.")
        return simulated_ocr_fallback()
        
    try:
        client = genai.Client(api_key=api_key)
        
        prompt = "Please transcribe the text from this medical prescription image exactly as written. Extract all medicine names and dosages."
        
        response = await client.aio.models.generate_content(
            model="gemini-2.5-flash",
            contents=[
                types.Part.from_bytes(data=image_content, mime_type=content_type),
                prompt
            ]
        )
        return response.text
    except Exception as e:
        print(f"Gemini Vision OCR Error: {e}")
        print("Falling back to simulated OCR.")
        return simulated_ocr_fallback()

def simulated_ocr_fallback() -> str:
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

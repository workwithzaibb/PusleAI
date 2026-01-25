"""
Medicine Database
Common OTC medicines with safety information
"""

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

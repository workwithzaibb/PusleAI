"""
Symptom and Condition Database
Comprehensive medical knowledge base for symptom analysis
"""

SYMPTOM_DATABASE = {
    # Respiratory Symptoms
    "cough": {
        "keywords": ["cough", "coughing", "khansi", "खांसी"],
        "category": "respiratory",
        "severity": "low",
        "follow_up_questions": ["Is it dry or with phlegm?", "How long have you had it?"]
    },
    "dry_cough": {
        "keywords": ["dry cough", "sukhi khansi", "सूखी खांसी"],
        "category": "respiratory",
        "severity": "low"
    },
    "wet_cough": {
        "keywords": ["wet cough", "phlegm", "mucus", "balgam", "बलगम"],
        "category": "respiratory",
        "severity": "medium"
    },
    "shortness_of_breath": {
        "keywords": ["shortness of breath", "breathless", "difficulty breathing", "saans", "सांस लेने में तकलीफ"],
        "category": "respiratory",
        "severity": "high"
    },
    "wheezing": {
        "keywords": ["wheezing", "whistling sound", "ghurghurahat"],
        "category": "respiratory",
        "severity": "medium"
    },
    
    # Fever & Temperature
    "fever": {
        "keywords": ["fever", "temperature", "bukhar", "बुखार", "taap", "ज्वर"],
        "category": "general",
        "severity": "medium"
    },
    "high_fever": {
        "keywords": ["high fever", "tez bukhar", "तेज बुखार", "103", "104", "105"],
        "category": "general",
        "severity": "high"
    },
    "chills": {
        "keywords": ["chills", "shivering", "thandi", "ठंड लगना", "kaanpna"],
        "category": "general",
        "severity": "medium"
    },
    
    # Pain
    "headache": {
        "keywords": ["headache", "head pain", "sir dard", "सिर दर्द", "sar dard"],
        "category": "neurological",
        "severity": "low"
    },
    "severe_headache": {
        "keywords": ["severe headache", "worst headache", "migraine", "tez sir dard"],
        "category": "neurological",
        "severity": "high"
    },
    "chest_pain": {
        "keywords": ["chest pain", "seene mein dard", "सीने में दर्द", "heart pain"],
        "category": "cardiac",
        "severity": "high"
    },
    "abdominal_pain": {
        "keywords": ["stomach pain", "abdominal pain", "pet dard", "पेट दर्द", "tummy ache"],
        "category": "gastrointestinal",
        "severity": "medium"
    },
    "back_pain": {
        "keywords": ["back pain", "kamar dard", "कमर दर्द", "peeth dard"],
        "category": "musculoskeletal",
        "severity": "low"
    },
    "body_ache": {
        "keywords": ["body ache", "body pain", "badan dard", "बदन दर्द"],
        "category": "general",
        "severity": "low"
    },
    "joint_pain": {
        "keywords": ["joint pain", "jodo mein dard", "जोड़ों में दर्द", "arthritis"],
        "category": "musculoskeletal",
        "severity": "medium"
    },
    "throat_pain": {
        "keywords": ["sore throat", "throat pain", "gale mein dard", "गले में दर्द"],
        "category": "respiratory",
        "severity": "low"
    },
    
    # Gastrointestinal
    "nausea": {
        "keywords": ["nausea", "feeling sick", "ji machlana", "जी मचलाना", "ulti jaisa"],
        "category": "gastrointestinal",
        "severity": "low"
    },
    "vomiting": {
        "keywords": ["vomiting", "ulti", "उल्टी", "throwing up"],
        "category": "gastrointestinal",
        "severity": "medium"
    },
    "diarrhea": {
        "keywords": ["diarrhea", "loose motion", "dast", "दस्त", "loose stool"],
        "category": "gastrointestinal",
        "severity": "medium"
    },
    "constipation": {
        "keywords": ["constipation", "kabz", "कब्ज", "hard stool"],
        "category": "gastrointestinal",
        "severity": "low"
    },
    "acidity": {
        "keywords": ["acidity", "heartburn", "acid reflux", "seene mein jalan", "सीने में जलन"],
        "category": "gastrointestinal",
        "severity": "low"
    },
    "bloating": {
        "keywords": ["bloating", "gas", "pet phulna", "पेट फूलना"],
        "category": "gastrointestinal",
        "severity": "low"
    },
    
    # Skin
    "rash": {
        "keywords": ["rash", "skin rash", "daane", "दाने", "red spots"],
        "category": "dermatological",
        "severity": "medium"
    },
    "itching": {
        "keywords": ["itching", "khujli", "खुजली", "scratching"],
        "category": "dermatological",
        "severity": "low"
    },
    
    # General
    "fatigue": {
        "keywords": ["fatigue", "tired", "weakness", "kamzori", "कमजोरी", "thakan"],
        "category": "general",
        "severity": "low"
    },
    "dizziness": {
        "keywords": ["dizziness", "dizzy", "chakkar", "चक्कर", "lightheaded"],
        "category": "neurological",
        "severity": "medium"
    },
    "loss_of_appetite": {
        "keywords": ["no appetite", "not hungry", "bhook nahi", "भूख नहीं"],
        "category": "general",
        "severity": "low"
    },
    "weight_loss": {
        "keywords": ["weight loss", "losing weight", "vajan kam", "वजन कम"],
        "category": "general",
        "severity": "medium"
    },
    "runny_nose": {
        "keywords": ["runny nose", "naak bahna", "नाक बहना", "cold"],
        "category": "respiratory",
        "severity": "low"
    },
    "congestion": {
        "keywords": ["congestion", "blocked nose", "naak band", "नाक बंद"],
        "category": "respiratory",
        "severity": "low"
    },
    "sneezing": {
        "keywords": ["sneezing", "cheenk", "छींक"],
        "category": "respiratory",
        "severity": "low"
    },
    
    # Eyes
    "red_eyes": {
        "keywords": ["red eyes", "eye redness", "aankh laal", "आंख लाल"],
        "category": "ophthalmological",
        "severity": "low"
    },
    "eye_pain": {
        "keywords": ["eye pain", "aankh mein dard", "आंख में दर्द"],
        "category": "ophthalmological",
        "severity": "medium"
    },
    
    # Urinary
    "painful_urination": {
        "keywords": ["burning urination", "painful urination", "peshab mein jalan"],
        "category": "urological",
        "severity": "medium"
    },
    "frequent_urination": {
        "keywords": ["frequent urination", "baar baar peshab", "बार बार पेशाब"],
        "category": "urological",
        "severity": "low"
    }
}


CONDITION_DATABASE = {
    "common_cold": {
        "symptoms": ["cough", "runny_nose", "congestion", "sneezing", "throat_pain", "fever"],
        "severity": "low",
        "advice": "Rest well, stay hydrated, and take warm fluids. Usually resolves in 7-10 days.",
        "home_care": [
            "Drink warm water with honey and ginger",
            "Steam inhalation 2-3 times daily",
            "Gargle with warm salt water",
            "Get adequate rest",
            "Stay hydrated"
        ],
        "warning_signs": [
            "Fever above 103°F for more than 3 days",
            "Difficulty breathing",
            "Severe headache",
            "Symptoms worsening after 10 days"
        ],
        "duration": "7-10 days"
    },
    
    "flu": {
        "symptoms": ["fever", "high_fever", "body_ache", "fatigue", "cough", "headache", "chills"],
        "severity": "medium",
        "advice": "Rest is essential. Stay hydrated and monitor temperature. Seek medical help if symptoms worsen.",
        "home_care": [
            "Complete bed rest",
            "Drink plenty of fluids",
            "Take paracetamol for fever (as directed)",
            "Eat light, nutritious food",
            "Isolate to prevent spread"
        ],
        "warning_signs": [
            "Difficulty breathing",
            "Persistent chest pain",
            "Confusion or altered consciousness",
            "Severe vomiting",
            "Fever not responding to medication"
        ],
        "duration": "1-2 weeks"
    },
    
    "gastroenteritis": {
        "symptoms": ["vomiting", "diarrhea", "abdominal_pain", "nausea", "fever"],
        "severity": "medium",
        "advice": "Focus on hydration. ORS is essential. Avoid solid food initially.",
        "home_care": [
            "Take ORS solution regularly",
            "Drink coconut water, lemon water",
            "Eat BRAT diet (Banana, Rice, Apple, Toast)",
            "Avoid dairy, spicy, and fried foods",
            "Rest adequately"
        ],
        "warning_signs": [
            "Blood in stool or vomit",
            "Signs of severe dehydration",
            "High fever above 102°F",
            "Symptoms lasting more than 3 days",
            "Severe abdominal pain"
        ],
        "duration": "2-5 days"
    },
    
    "migraine": {
        "symptoms": ["severe_headache", "headache", "nausea", "vomiting", "dizziness"],
        "severity": "medium",
        "advice": "Rest in a dark, quiet room. Take prescribed pain medication early.",
        "home_care": [
            "Rest in dark, quiet room",
            "Apply cold compress to forehead",
            "Stay hydrated",
            "Avoid screen time",
            "Practice relaxation techniques"
        ],
        "warning_signs": [
            "Worst headache of your life",
            "Headache with fever and stiff neck",
            "Vision changes or confusion",
            "Weakness on one side of body",
            "Headache after head injury"
        ],
        "duration": "4-72 hours"
    },
    
    "food_poisoning": {
        "symptoms": ["vomiting", "diarrhea", "abdominal_pain", "nausea", "fever"],
        "severity": "medium",
        "advice": "Stay hydrated with ORS. Symptoms usually resolve within 24-48 hours.",
        "home_care": [
            "Sip ORS or clear fluids frequently",
            "Avoid solid food for 6-8 hours",
            "Start with bland foods when ready",
            "Get plenty of rest",
            "Avoid dairy and caffeine"
        ],
        "warning_signs": [
            "Blood in vomit or stool",
            "Unable to keep fluids down",
            "Fever above 101°F",
            "Signs of dehydration",
            "Symptoms lasting over 48 hours"
        ],
        "duration": "1-2 days"
    },
    
    "allergic_reaction": {
        "symptoms": ["rash", "itching", "sneezing", "runny_nose", "red_eyes", "congestion"],
        "severity": "medium",
        "advice": "Identify and avoid the allergen. Antihistamines can help with symptoms.",
        "home_care": [
            "Take antihistamine (cetirizine/loratadine)",
            "Apply cold compress to rash",
            "Avoid known allergens",
            "Keep windows closed during pollen season",
            "Use air purifier if available"
        ],
        "warning_signs": [
            "Difficulty breathing",
            "Swelling of face, lips, or throat",
            "Rapid heartbeat",
            "Dizziness or fainting",
            "Widespread severe rash"
        ],
        "duration": "Hours to days"
    },
    
    "urinary_tract_infection": {
        "symptoms": ["painful_urination", "frequent_urination", "abdominal_pain", "fever"],
        "severity": "medium",
        "advice": "Drink plenty of water. Medical treatment with antibiotics is usually needed.",
        "home_care": [
            "Drink 8-10 glasses of water daily",
            "Urinate frequently, don't hold",
            "Take cranberry juice (unsweetened)",
            "Maintain good hygiene",
            "Use heating pad for pain"
        ],
        "warning_signs": [
            "Blood in urine",
            "High fever with chills",
            "Severe back pain",
            "Nausea and vomiting",
            "Symptoms not improving in 2 days"
        ],
        "duration": "3-7 days with treatment"
    },
    
    "acidity_gerd": {
        "symptoms": ["acidity", "chest_pain", "nausea", "bloating"],
        "severity": "low",
        "advice": "Avoid spicy and fried foods. Eat smaller meals. Don't lie down after eating.",
        "home_care": [
            "Eat smaller, frequent meals",
            "Avoid spicy, fried, acidic foods",
            "Don't lie down for 2-3 hours after eating",
            "Elevate head while sleeping",
            "Take antacid if needed",
            "Drink cold milk"
        ],
        "warning_signs": [
            "Severe chest pain (could be heart-related)",
            "Difficulty swallowing",
            "Unintentional weight loss",
            "Vomiting blood",
            "Black, tarry stools"
        ],
        "duration": "Chronic, manageable"
    },
    
    "viral_fever": {
        "symptoms": ["fever", "body_ache", "fatigue", "headache", "chills", "loss_of_appetite"],
        "severity": "medium",
        "advice": "Rest and stay hydrated. Fever usually subsides in 3-5 days.",
        "home_care": [
            "Take adequate rest",
            "Drink plenty of fluids",
            "Take paracetamol for fever",
            "Sponge with lukewarm water if fever is high",
            "Eat light, nutritious food"
        ],
        "warning_signs": [
            "Fever above 103°F not responding to medication",
            "Rash appearing with fever",
            "Severe headache or neck stiffness",
            "Difficulty breathing",
            "Confusion or unusual behavior"
        ],
        "duration": "3-7 days"
    },
    
    "dengue_suspected": {
        "symptoms": ["high_fever", "severe_headache", "body_ache", "joint_pain", "rash", "fatigue", "nausea"],
        "severity": "high",
        "advice": "SEEK MEDICAL ATTENTION. Dengue requires monitoring. No aspirin or ibuprofen.",
        "home_care": [
            "Seek medical attention immediately",
            "Take only paracetamol for fever (NO aspirin/ibuprofen)",
            "Stay well hydrated with ORS, coconut water, juices",
            "Complete bed rest",
            "Monitor for warning signs"
        ],
        "warning_signs": [
            "Severe abdominal pain",
            "Persistent vomiting",
            "Bleeding from gums or nose",
            "Blood in vomit or stool",
            "Rapid breathing",
            "Fatigue and restlessness",
            "Decrease in urination"
        ],
        "duration": "5-7 days, needs monitoring"
    },
    
    "conjunctivitis": {
        "symptoms": ["red_eyes", "itching", "eye_pain"],
        "severity": "low",
        "advice": "Maintain eye hygiene. Avoid touching eyes. Usually resolves in 1-2 weeks.",
        "home_care": [
            "Wash hands frequently",
            "Don't touch or rub eyes",
            "Use clean towel for face",
            "Apply cold compress",
            "Clean discharge with clean cotton",
            "Avoid sharing personal items"
        ],
        "warning_signs": [
            "Severe eye pain",
            "Vision changes",
            "Sensitivity to light",
            "Symptoms worsening after 3-4 days",
            "High fever with eye symptoms"
        ],
        "duration": "7-14 days"
    },
    
    "muscle_strain": {
        "symptoms": ["back_pain", "body_ache", "joint_pain"],
        "severity": "low",
        "advice": "Rest the affected area. Apply ice for first 48 hours, then heat.",
        "home_care": [
            "Rest the affected muscle",
            "Apply ice pack for 15-20 minutes",
            "After 48 hours, use heat therapy",
            "Gentle stretching after initial pain subsides",
            "Take pain reliever if needed"
        ],
        "warning_signs": [
            "Unable to move the affected area",
            "Numbness or tingling",
            "Pain not improving after a week",
            "Severe swelling",
            "Pain after an injury"
        ],
        "duration": "Few days to 2 weeks"
    }
}

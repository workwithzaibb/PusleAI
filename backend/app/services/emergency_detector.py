"""
Emergency Detection Service - Identifies critical health situations
"""
from typing import List, Dict, Tuple
from dataclasses import dataclass

from app.config import settings


@dataclass
class EmergencyAlert:
    """Represents an emergency detection result"""
    is_emergency: bool
    severity: str  # critical, high, medium
    detected_keywords: List[str]
    recommended_action: str
    call_emergency: bool


# Emergency keywords in multiple languages
EMERGENCY_PATTERNS = {
    "en": {
        "critical": [
            "heart attack", "cardiac arrest", "not breathing", "unconscious",
            "severe bleeding", "stroke", "seizure", "choking", "suicide",
            "overdose", "poisoning", "drowning", "electric shock"
        ],
        "high": [
            "chest pain", "difficulty breathing", "shortness of breath",
            "severe headache", "high fever", "vomiting blood", "blood in stool",
            "severe abdominal pain", "fainting", "dizziness", "confusion",
            "allergic reaction", "swelling throat", "can't swallow"
        ],
        "medium": [
            "persistent vomiting", "dehydration", "high temperature",
            "severe pain", "injury", "fall", "accident", "burn"
        ]
    },
    "hi": {
        "critical": [
            "दिल का दौरा", "सांस नहीं", "बेहोश", "खून बह रहा",
            "लकवा", "दौरे", "जहर", "आत्महत्या"
        ],
        "high": [
            "सीने में दर्द", "सांस लेने में तकलीफ", "तेज बुखार",
            "खून की उल्टी", "पेट में तेज दर्द", "चक्कर", "बेहोशी"
        ],
        "medium": [
            "उल्टी", "दस्त", "चोट", "जलना", "गिरना"
        ]
    },
    "ta": {
        "critical": [
            "மாரடைப்பு", "சுவாசிக்க முடியவில்லை", "மயக்கம்",
            "கடுமையான இரத்தப்போக்கு"
        ],
        "high": [
            "நெஞ்சு வலி", "மூச்சு திணறல்", "அதிக காய்ச்சல்"
        ]
    },
    "te": {
        "critical": [
            "గుండెపోటు", "ఊపిరి ఆగిపోయింది", "స్పృహ లేదు"
        ],
        "high": [
            "ఛాతీ నొప్పి", "శ్వాస తీసుకోవడం కష్టం", "తీవ్రమైన జ్వరం"
        ]
    }
}


class EmergencyDetector:
    """Detects emergency situations from user input"""
    
    def __init__(self):
        self.patterns = EMERGENCY_PATTERNS
    
    def detect(self, text: str, language: str = "en") -> EmergencyAlert:
        """
        Detect emergency from text
        
        Args:
            text: User input
            language: Language code
            
        Returns:
            EmergencyAlert with detection results
        """
        text_lower = text.lower()
        detected = {"critical": [], "high": [], "medium": []}
        
        # Check in specified language
        lang_patterns = self.patterns.get(language, {})
        self._check_patterns(text_lower, lang_patterns, detected)
        
        # Also check English patterns as fallback
        if language != "en":
            en_patterns = self.patterns.get("en", {})
            self._check_patterns(text_lower, en_patterns, detected)
        
        # Determine severity
        if detected["critical"]:
            return EmergencyAlert(
                is_emergency=True,
                severity="critical",
                detected_keywords=detected["critical"],
                recommended_action="CALL EMERGENCY SERVICES IMMEDIATELY (108/112)",
                call_emergency=True
            )
        elif detected["high"]:
            return EmergencyAlert(
                is_emergency=True,
                severity="high",
                detected_keywords=detected["high"],
                recommended_action="Seek immediate medical attention. Visit nearest hospital.",
                call_emergency=False
            )
        elif detected["medium"]:
            return EmergencyAlert(
                is_emergency=False,
                severity="medium",
                detected_keywords=detected["medium"],
                recommended_action="Monitor symptoms closely. Consult doctor if symptoms worsen.",
                call_emergency=False
            )
        
        return EmergencyAlert(
            is_emergency=False,
            severity="low",
            detected_keywords=[],
            recommended_action="",
            call_emergency=False
        )
    
    def _check_patterns(self, text: str, patterns: Dict, detected: Dict):
        """Check text against patterns"""
        for severity, keywords in patterns.items():
            for keyword in keywords:
                if keyword.lower() in text:
                    if keyword not in detected[severity]:
                        detected[severity].append(keyword)
    
    def get_emergency_contacts(self, location: str = "IN") -> Dict:
        """Get emergency contact numbers by country"""
        contacts = {
            "IN": {
                "ambulance": "108",
                "emergency": "112",
                "police": "100",
                "fire": "101",
                "women_helpline": "1091",
                "child_helpline": "1098"
            }
        }
        return contacts.get(location, contacts["IN"])


# Singleton instance
emergency_detector = EmergencyDetector()

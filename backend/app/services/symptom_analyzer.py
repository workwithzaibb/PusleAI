"""
Symptom Analyzer Service - AI-powered symptom analysis and condition detection
"""
from typing import List, Dict, Tuple, Optional
from dataclasses import dataclass
import re

from app.knowledge.symptoms_db import SYMPTOM_DATABASE, CONDITION_DATABASE
from app.knowledge.translations import translate_symptoms


@dataclass
class SymptomMatch:
    """Represents a matched symptom"""
    symptom: str
    confidence: float
    category: str
    severity: str


@dataclass  
class ConditionMatch:
    """Represents a possible condition"""
    condition: str
    confidence: float
    matched_symptoms: List[str]
    severity: str
    advice: str
    warning_signs: List[str]
    home_care: List[str]


class SymptomAnalyzer:
    """AI-powered symptom analysis engine"""
    
    def __init__(self):
        self.symptom_db = SYMPTOM_DATABASE
        self.condition_db = CONDITION_DATABASE
    
    def extract_symptoms(self, text: str, language: str = "en") -> List[SymptomMatch]:
        """
        Extract symptoms from user text
        
        Args:
            text: User's description
            language: Language code
            
        Returns:
            List of matched symptoms
        """
        text_lower = text.lower()
        matched_symptoms = []
        
        for symptom_key, symptom_data in self.symptom_db.items():
            # Check main keyword
            keywords = symptom_data.get("keywords", [symptom_key])
            
            for keyword in keywords:
                if keyword.lower() in text_lower:
                    matched_symptoms.append(SymptomMatch(
                        symptom=symptom_key,
                        confidence=0.85,
                        category=symptom_data.get("category", "general"),
                        severity=symptom_data.get("severity", "low")
                    ))
                    break
        
        return matched_symptoms
    
    def analyze_conditions(
        self, 
        symptoms: List[SymptomMatch]
    ) -> List[ConditionMatch]:
        """
        Analyze symptoms to find possible conditions
        
        Args:
            symptoms: List of extracted symptoms
            
        Returns:
            List of possible conditions sorted by confidence
        """
        if not symptoms:
            return []
        
        symptom_names = [s.symptom for s in symptoms]
        possible_conditions = []
        
        for condition_key, condition_data in self.condition_db.items():
            required_symptoms = condition_data.get("symptoms", [])
            
            # Calculate match score
            matched = [s for s in required_symptoms if s in symptom_names]
            if not matched:
                continue
            
            match_ratio = len(matched) / len(required_symptoms)
            
            if match_ratio >= 0.3:  # At least 30% symptom match
                confidence = min(match_ratio * 1.2, 0.95)  # Cap at 95%
                
                possible_conditions.append(ConditionMatch(
                    condition=condition_key,
                    confidence=confidence,
                    matched_symptoms=matched,
                    severity=condition_data.get("severity", "low"),
                    advice=condition_data.get("advice", ""),
                    warning_signs=condition_data.get("warning_signs", []),
                    home_care=condition_data.get("home_care", [])
                ))
        
        # Sort by confidence
        possible_conditions.sort(key=lambda x: x.confidence, reverse=True)
        
        return possible_conditions[:5]  # Return top 5
    
    def get_overall_severity(self, conditions: List[ConditionMatch]) -> str:
        """Determine overall severity level"""
        if not conditions:
            return "low"
        
        severity_order = {"critical": 4, "high": 3, "medium": 2, "low": 1}
        max_severity = max(severity_order.get(c.severity, 1) for c in conditions)
        
        for sev, val in severity_order.items():
            if val == max_severity:
                return sev
        return "low"
    
    def get_confidence_score(self, conditions: List[ConditionMatch]) -> float:
        """Calculate overall AI confidence score"""
        if not conditions:
            return 0.3
        
        # Weighted average based on match quality
        top_confidence = conditions[0].confidence if conditions else 0
        
        # Reduce confidence if multiple conditions have similar scores
        if len(conditions) >= 2:
            if abs(conditions[0].confidence - conditions[1].confidence) < 0.1:
                top_confidence *= 0.85  # Reduce if ambiguous
        
        return round(top_confidence, 2)
    
    def analyze(self, text: str, language: str = "en") -> Dict:
        """
        Full symptom analysis pipeline
        
        Returns comprehensive analysis result
        """
        # Extract symptoms
        symptoms = self.extract_symptoms(text, language)
        
        # Find conditions
        conditions = self.analyze_conditions(symptoms)
        
        # Calculate confidence
        confidence = self.get_confidence_score(conditions)
        
        # Get severity
        severity = self.get_overall_severity(conditions)
        
        return {
            "symptoms": [{"name": s.symptom, "severity": s.severity} for s in symptoms],
            "conditions": [
                {
                    "name": c.condition,
                    "confidence": c.confidence,
                    "severity": c.severity,
                    "advice": c.advice,
                    "warning_signs": c.warning_signs,
                    "home_care": c.home_care
                }
                for c in conditions
            ],
            "overall_confidence": confidence,
            "overall_severity": severity,
            "requires_doctor": confidence < 0.6 or severity in ["high", "critical"]
        }


# Singleton instance
symptom_analyzer = SymptomAnalyzer()

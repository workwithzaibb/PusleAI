"""
Pill Identification Service - Stub for pill image recognition
This is a placeholder that can be extended with actual ML models (e.g., TensorFlow, OpenCV)
or external APIs (AWS Rekognition, Google Vision, etc.)
"""
from typing import Dict, Any, List, Optional
import base64
import hashlib
from datetime import datetime
from sqlalchemy.orm import Session

from app.models.medication import PillImage, Medication


# Sample pill database for demo (in production, use actual pill database API)
KNOWN_PILLS = {
    "round_white_small": {
        "name": "Aspirin",
        "generic_name": "Acetylsalicylic acid",
        "description": "Small, round, white tablet",
        "common_dosages": ["75mg", "100mg", "325mg"]
    },
    "oval_blue": {
        "name": "Viagra",
        "generic_name": "Sildenafil",
        "description": "Blue, diamond-shaped tablet",
        "common_dosages": ["25mg", "50mg", "100mg"]
    },
    "round_pink": {
        "name": "Ibuprofen",
        "generic_name": "Ibuprofen",
        "description": "Round, pink tablet",
        "common_dosages": ["200mg", "400mg"]
    },
    "capsule_red_white": {
        "name": "Amoxicillin",
        "generic_name": "Amoxicillin",
        "description": "Red and white capsule",
        "common_dosages": ["250mg", "500mg"]
    },
    "oval_white_large": {
        "name": "Metformin",
        "generic_name": "Metformin Hydrochloride",
        "description": "Large, oval, white tablet",
        "common_dosages": ["500mg", "850mg", "1000mg"]
    }
}


class PillIdentificationService:
    """
    Service for identifying pills from images.
    
    Current implementation is a stub that:
    1. Accepts base64-encoded images
    2. Returns mock results for demonstration
    3. Can be extended with actual ML models
    
    To integrate real pill identification:
    - Option 1: Train a CNN model on NIH Pill Image dataset
    - Option 2: Use Google Cloud Vision API
    - Option 3: Use AWS Rekognition Custom Labels
    - Option 4: Integrate with RxNav API (for imprint lookup)
    """
    
    def __init__(self, db: Session):
        self.db = db
    
    def identify_pill(
        self,
        image_base64: str,
        user_id: int,
        link_to_medication_id: Optional[int] = None
    ) -> Dict[str, Any]:
        """
        Identify a pill from an image.
        
        Args:
            image_base64: Base64-encoded image data
            user_id: User ID for storing the image
            link_to_medication_id: Optional medication ID to link the image to
        
        Returns:
            Dict with identification results
        """
        # Validate and decode image
        try:
            image_data = base64.b64decode(image_base64)
            image_hash = hashlib.sha256(image_data).hexdigest()
        except Exception as e:
            return {
                "is_identified": False,
                "error": f"Invalid image data: {str(e)}",
                "possible_matches": [],
                "warnings": ["Could not process image"]
            }
        
        # Check for existing image (deduplication)
        existing = self.db.query(PillImage).filter(
            PillImage.image_hash == image_hash,
            PillImage.user_id == user_id
        ).first()
        
        if existing and existing.is_identified:
            return {
                "is_identified": True,
                "confidence_score": existing.confidence_score,
                "identified_name": existing.identified_name,
                "generic_name": None,
                "possible_matches": [],
                "warnings": [],
                "medication_id": existing.medication_id,
                "matches_medication": True if existing.medication_id else None
            }
        
        # Perform identification (stub - returns mock results)
        identification_result = self._mock_identify(image_data)
        
        # Store the image
        pill_image = PillImage(
            medication_id=link_to_medication_id,
            user_id=user_id,
            image_path=f"pills/{user_id}/{image_hash}.jpg",  # Storage path
            image_hash=image_hash,
            is_identified=identification_result["is_identified"],
            identified_name=identification_result.get("identified_name"),
            confidence_score=identification_result.get("confidence_score"),
            identification_method="mock_model"  # Change to actual method
        )
        
        self.db.add(pill_image)
        self.db.commit()
        
        # Check if matches linked medication
        matches_medication = None
        if link_to_medication_id and identification_result["is_identified"]:
            medication = self.db.query(Medication).filter(
                Medication.id == link_to_medication_id
            ).first()
            if medication:
                matches_medication = self._check_medication_match(
                    identification_result.get("identified_name", ""),
                    identification_result.get("generic_name", ""),
                    medication
                )
        
        return {
            "is_identified": identification_result["is_identified"],
            "confidence_score": identification_result.get("confidence_score"),
            "identified_name": identification_result.get("identified_name"),
            "generic_name": identification_result.get("generic_name"),
            "possible_matches": identification_result.get("possible_matches", []),
            "warnings": identification_result.get("warnings", []),
            "medication_id": link_to_medication_id,
            "matches_medication": matches_medication
        }
    
    def _mock_identify(self, image_data: bytes) -> Dict[str, Any]:
        """
        Mock pill identification.
        
        In production, replace this with actual ML model inference:
        
        ```python
        # Example with TensorFlow
        import tensorflow as tf
        model = tf.keras.models.load_model('pill_classifier.h5')
        
        # Preprocess image
        img = tf.image.decode_jpeg(image_data)
        img = tf.image.resize(img, [224, 224])
        img = tf.expand_dims(img, 0)
        
        # Predict
        predictions = model.predict(img)
        class_idx = np.argmax(predictions[0])
        confidence = predictions[0][class_idx]
        
        return {
            "is_identified": confidence > 0.7,
            "identified_name": CLASS_NAMES[class_idx],
            "confidence_score": float(confidence)
        }
        ```
        """
        # For demo, return a random match with moderate confidence
        import random
        
        # Simulate some images being unidentifiable
        if random.random() < 0.3:
            return {
                "is_identified": False,
                "possible_matches": [
                    {"name": "Aspirin", "confidence": 0.3},
                    {"name": "Ibuprofen", "confidence": 0.25}
                ],
                "warnings": ["Image quality too low for confident identification",
                            "Please take a clearer photo in good lighting"]
            }
        
        # Return a mock identification
        pill_key = random.choice(list(KNOWN_PILLS.keys()))
        pill_info = KNOWN_PILLS[pill_key]
        confidence = random.uniform(0.75, 0.95)
        
        return {
            "is_identified": True,
            "identified_name": pill_info["name"],
            "generic_name": pill_info["generic_name"],
            "confidence_score": round(confidence, 2),
            "possible_matches": [
                {"name": pill_info["name"], "confidence": confidence},
                {"name": "Generic alternative", "confidence": confidence - 0.2}
            ],
            "warnings": []
        }
    
    def _check_medication_match(
        self,
        identified_name: str,
        generic_name: str,
        medication: Medication
    ) -> bool:
        """Check if identified pill matches the linked medication"""
        med_name_lower = medication.name.lower()
        med_generic_lower = (medication.generic_name or "").lower()
        
        id_name_lower = identified_name.lower()
        id_generic_lower = generic_name.lower()
        
        return (
            id_name_lower in med_name_lower or
            med_name_lower in id_name_lower or
            id_generic_lower in med_generic_lower or
            med_generic_lower in id_generic_lower
        )
    
    def get_pill_images(
        self,
        user_id: int,
        medication_id: Optional[int] = None
    ) -> List[Dict[str, Any]]:
        """Get stored pill images for a user"""
        query = self.db.query(PillImage).filter(PillImage.user_id == user_id)
        
        if medication_id:
            query = query.filter(PillImage.medication_id == medication_id)
        
        images = query.order_by(PillImage.captured_at.desc()).limit(50).all()
        
        return [
            {
                "id": img.id,
                "medication_id": img.medication_id,
                "is_identified": img.is_identified,
                "identified_name": img.identified_name,
                "confidence_score": img.confidence_score,
                "captured_at": img.captured_at.isoformat() if img.captured_at else None
            }
            for img in images
        ]


def get_pill_identification_service(db: Session) -> PillIdentificationService:
    """Factory function to get pill identification service"""
    return PillIdentificationService(db)

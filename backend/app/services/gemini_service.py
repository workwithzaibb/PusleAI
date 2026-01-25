"""
Gemini AI Service - Google's Generative AI for medical consultations
"""
import google.generativeai as genai
from typing import Optional, Dict, List
from app.config import settings

# System prompt for the AI Doctor
DOCTOR_SYSTEM_PROMPT = """You are Dr. Maya, a friendly and empathetic AI medical assistant for PulseAI. 
You provide helpful health information while being warm, caring, and professional.

IMPORTANT GUIDELINES:
1. Always be empathetic and understanding
2. Provide helpful general health information
3. NEVER diagnose conditions definitively - use phrases like "this could be", "it's possible that"
4. ALWAYS recommend consulting a real doctor for serious concerns
5. If symptoms sound serious (chest pain, difficulty breathing, severe pain), urge immediate medical attention
6. Keep responses concise but helpful (2-4 sentences typically)
7. If asked in Hindi, respond in Hindi. If asked in English, respond in English.
8. Use a warm, conversational tone like a caring doctor

RESPONSE FORMAT:
- Start with acknowledgment of their concern
- Provide relevant information or suggestions
- End with encouragement or next steps

DISCLAIMER: Always remind users that you provide general information only and cannot replace professional medical advice."""


class GeminiService:
    """Service for interacting with Google Gemini AI"""
    
    def __init__(self):
        self.model = None
        self.chat = None
        self._initialize()
    
    def _initialize(self):
        """Initialize Gemini with API key"""
        api_key = settings.GEMINI_API_KEY
        if api_key:
            try:
                genai.configure(api_key=api_key)
                self.model = genai.GenerativeModel(
                    model_name='gemini-1.5-flash',
                    system_instruction=DOCTOR_SYSTEM_PROMPT
                )
                print("✅ Gemini AI initialized successfully")
            except Exception as e:
                print(f"⚠️ Failed to initialize Gemini: {e}")
                self.model = None
        else:
            print("⚠️ GEMINI_API_KEY not set - using fallback responses")
    
    def is_available(self) -> bool:
        """Check if Gemini is available"""
        return self.model is not None
    
    async def get_response(
        self,
        user_message: str,
        language: str = "en",
        conversation_history: Optional[List[Dict]] = None
    ) -> str:
        """Get AI response from Gemini"""
        
        if not self.model:
            return self._get_fallback_response(user_message, language)
        
        try:
            # Build the prompt with language context
            lang_instruction = "Respond in Hindi." if language == "hi" else "Respond in English."
            
            prompt = f"{lang_instruction}\n\nPatient says: {user_message}"
            
            # Generate response
            response = self.model.generate_content(prompt)
            
            if response and response.text:
                return response.text.strip()
            else:
                return self._get_fallback_response(user_message, language)
                
        except Exception as e:
            print(f"⚠️ Gemini API error: {e}")
            return self._get_fallback_response(user_message, language)
    
    def _get_fallback_response(self, user_message: str, language: str = "en") -> str:
        """Provide fallback responses when Gemini is unavailable"""
        
        message_lower = user_message.lower()
        
        # Emergency keywords
        emergency_keywords = ["chest pain", "heart attack", "can't breathe", "unconscious", "severe bleeding", "stroke"]
        if any(kw in message_lower for kw in emergency_keywords):
            if language == "hi":
                return "⚠️ यह आपातकालीन स्थिति लगती है! कृपया तुरंत 112 पर कॉल करें या नजदीकी अस्पताल जाएं। आपकी सुरक्षा सबसे पहले है।"
            return "⚠️ This sounds like an emergency! Please call 112 immediately or go to the nearest hospital. Your safety comes first."
        
        # Common symptom responses
        if any(word in message_lower for word in ["headache", "सिर दर्द", "head pain"]):
            if language == "hi":
                return "मैं समझ सकती हूं कि सिर दर्द कितना परेशान करने वाला हो सकता है। कृपया पानी पिएं, आराम करें, और अंधेरे कमरे में रहें। अगर दर्द 24 घंटे से ज्यादा रहे या बहुत तेज हो, तो डॉक्टर से मिलें।"
            return "I understand headaches can be quite bothersome. Please stay hydrated, rest in a quiet dark room, and consider over-the-counter pain relief if appropriate. If it persists beyond 24 hours or is severe, please consult a doctor."
        
        if any(word in message_lower for word in ["fever", "बुखार", "temperature"]):
            if language == "hi":
                return "बुखार होना शरीर की संक्रमण से लड़ने की प्रक्रिया है। पर्याप्त आराम करें, खूब पानी पिएं। अगर बुखार 102°F से ऊपर जाए या 3 दिन से ज्यादा रहे, तो डॉक्टर से संपर्क करें।"
            return "Fever is your body's way of fighting infection. Rest well and stay hydrated. If your temperature goes above 102°F or persists for more than 3 days, please see a doctor."
        
        if any(word in message_lower for word in ["cold", "cough", "सर्दी", "खांसी", "flu"]):
            if language == "hi":
                return "सर्दी-खांसी में गर्म पानी पिएं, भाप लें, और आराम करें। शहद और अदरक वाली चाय फायदेमंद हो सकती है। अगर सांस लेने में तकलीफ हो या 7 दिन बाद भी ठीक न हो, तो डॉक्टर से मिलें।"
            return "For cold and cough, stay warm, drink hot fluids, and get plenty of rest. Honey and ginger tea can help soothe your throat. If you have difficulty breathing or symptoms persist beyond a week, please see a doctor."
        
        if any(word in message_lower for word in ["stomach", "पेट", "digestion", "nausea", "vomit"]):
            if language == "hi":
                return "पेट की समस्या में हल्का भोजन करें, खूब पानी पिएं। अगर उल्टी या दस्त 24 घंटे से ज्यादा हो, या खून आए, तो तुरंत डॉक्टर से मिलें।"
            return "For stomach issues, try eating light foods and staying hydrated. If vomiting or diarrhea persists beyond 24 hours, or if you notice blood, please seek medical attention immediately."
        
        if any(word in message_lower for word in ["stress", "anxiety", "तनाव", "चिंता", "worried", "sad", "depressed"]):
            if language == "hi":
                return "मैं समझ सकती हूं आप कठिन समय से गुजर रहे हैं। गहरी सांस लें, थोड़ा टहलें, और किसी से बात करें। आप अकेले नहीं हैं। अगर बहुत ज्यादा परेशान हों तो मानसिक स्वास्थ्य विशेषज्ञ से मिलें।"
            return "I understand you're going through a difficult time. Take deep breaths, try a short walk, and talk to someone you trust. You're not alone. If feelings persist, please consider speaking with a mental health professional."
        
        if any(word in message_lower for word in ["hello", "hi", "नमस्ते", "hey"]):
            if language == "hi":
                return "नमस्ते! मैं डॉ. माया हूं, आपकी AI स्वास्थ्य सहायक। आज मैं आपकी कैसे मदद कर सकती हूं? अपने लक्षण बताएं।"
            return "Hello! I'm Dr. Maya, your AI health assistant. How can I help you today? Please describe your symptoms or health concerns."
        
        if any(word in message_lower for word in ["thank", "धन्यवाद", "thanks"]):
            if language == "hi":
                return "आपका स्वागत है! अपना ख्याल रखें। अगर कोई और सवाल हो तो बेझिझक पूछें। 🙏"
            return "You're welcome! Take care of yourself. Feel free to ask if you have any more questions. 🙏"
        
        # Default response
        if language == "hi":
            return "मैंने आपकी बात सुनी। कृपया अपने लक्षणों के बारे में थोड़ा और विस्तार से बताएं - कब से है, कितना तीव्र है, और क्या कोई अन्य लक्षण भी हैं? इससे मुझे आपकी बेहतर मदद करने में मदद मिलेगी।"
        return "I hear you. Could you please tell me more about your symptoms - when did they start, how severe are they, and are there any other symptoms? This will help me assist you better."


# Singleton instance
gemini_service = GeminiService()

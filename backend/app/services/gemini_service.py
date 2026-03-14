"""
Gemini AI Service - Google's Generative AI for medical consultations
"""
from google import genai
from google.genai import types
from typing import Optional, Dict, List
from app.config import settings

# System prompt for the AI Doctor
DOCTOR_SYSTEM_PROMPT = """You are Dr. Maya, a friendly and empathetic AI medical assistant for PulseAI.
You should respond with strong analysis quality like a modern LLM while staying medically safe.

CORE BEHAVIOR:
1. First analyze the user's intent from the latest message and recent conversation context.
2. Answer the exact question directly in the first 1-2 lines.
3. Then provide practical, relevant next steps tailored to the user's context.
4. If the message is unclear, make your best effort first, then ask one precise follow-up question.
5. Preserve continuity with prior messages instead of resetting the conversation.

QUESTION COVERAGE:
- Handle symptom reports, follow-up questions, medication/lifestyle questions, prevention, and general health education.
- If the user asks a non-medical general question, provide a concise useful answer, then gently offer to continue with health support.
- Do not ignore direct user questions.

MEDICAL SAFETY:
- Never provide definitive diagnosis.
- Use uncertainty language when needed (e.g., "this could be", "it is possible").
- For red-flag symptoms (chest pain, breathing difficulty, severe bleeding, stroke signs, self-harm risk), urge immediate emergency care.
- Recommend consultation with a licensed clinician when risk is moderate/high or information is insufficient.

STYLE:
- Warm, respectful, and conversational.
- Default to concise but complete responses (about 3-6 sentences); provide more detail when user asks for explanation.
- Avoid generic refusal/filler text unless the input is actually unintelligible.
- Match user language: Hindi to Hindi, Marathi to Marathi, otherwise English.

DISCLAIMER:
Include a brief medical disclaimer naturally when giving health advice with potential clinical impact."""


class GeminiService:
    """Service for interacting with Google Gemini AI"""
    
    def __init__(self):
        self.client = None
        self.model_name = 'gemini-2.0-flash'
        self._initialize()
    
    def _initialize(self):
        """Initialize Gemini with API key"""
        api_key = settings.GEMINI_API_KEY
        if api_key:
            try:
                self.client = genai.Client(api_key=api_key)
                print("✅ Gemini AI initialized successfully")
            except Exception as e:
                print(f"⚠️ Failed to initialize Gemini: {e}")
                self.client = None
        else:
            print("⚠️ GEMINI_API_KEY not set - using fallback responses")
    
    def is_available(self) -> bool:
        """Check if Gemini is available"""
        return self.client is not None
    
    async def get_response(
        self,
        user_message: str,
        language: str = "en",
        conversation_history: Optional[List[Dict]] = None
    ) -> str:
        """Get AI response from Gemini"""
        
        if not self.client:
            return self._get_fallback_response(
                user_message,
                language,
                conversation_history=conversation_history
            )
        
        try:
            # Build the prompt with language context
            if language == "hi":
                lang_instruction = "Respond in Hindi."
            elif language == "mr":
                lang_instruction = "Respond in Marathi."
            else:
                lang_instruction = "Respond in English."

            prompt = self._build_prompt(
                user_message=user_message,
                language_instruction=lang_instruction,
                conversation_history=conversation_history
            )
            
            # Generate response using async API (client.aio.models.generate_content)
            response = await self.client.aio.models.generate_content(
                model=self.model_name,
                contents=prompt,
                config=types.GenerateContentConfig(
                    system_instruction=DOCTOR_SYSTEM_PROMPT
                )
            )
            
            if response and response.text:
                return response.text.strip()
            else:
                return self._get_fallback_response(
                    user_message,
                    language,
                    conversation_history=conversation_history
                )
                
        except Exception as e:
            print(f"⚠️ Gemini API error: {e}")
            return self._get_fallback_response(
                user_message,
                language,
                conversation_history=conversation_history
            )

    def _build_prompt(
        self,
        user_message: str,
        language_instruction: str,
        conversation_history: Optional[List[Dict]] = None
    ) -> str:
        """Build a bounded prompt that preserves recent context for longer chats."""
        context_text = self._format_conversation_history(conversation_history)

        if context_text:
            return (
                f"{language_instruction}\n\n"
                "Follow these response rules:\n"
                "1) Identify the user's exact intent.\n"
                "2) Answer the exact question directly first.\n"
                "3) Use context continuity from previous turns.\n"
                "4) Add practical next steps.\n"
                "5) If unclear, ask one focused clarifying question after your best-effort answer.\n\n"
                "Recent conversation context (oldest to newest):\n"
                f"{context_text}\n\n"
                f"Latest patient message: {user_message}\n\n"
                "Reply as Dr. Maya with continuity from the context above."
            )

        return (
            f"{language_instruction}\n\n"
            "Follow these response rules:\n"
            "1) Identify intent and answer the exact user question first.\n"
            "2) Give practical and safe guidance.\n"
            "3) Ask one focused follow-up question only if needed.\n\n"
            f"Patient says: {user_message}"
        )

    def _format_conversation_history(self, conversation_history: Optional[List[Dict]]) -> str:
        """Normalize and trim conversation history so model context stays stable."""
        if not conversation_history:
            return ""

        max_messages = max(4, settings.GEMINI_CONTEXT_MAX_MESSAGES)
        max_chars = max(1000, settings.GEMINI_CONTEXT_MAX_CHARS)

        normalized: List[str] = []
        for item in conversation_history:
            if not isinstance(item, dict):
                continue

            role = str(item.get("role", "")).lower().strip()
            content = str(item.get("content") or item.get("message") or "").strip()
            if not content:
                continue

            if role in {"user", "patient"}:
                speaker = "Patient"
            elif role in {"assistant", "ai", "doctor", "agent"}:
                speaker = "Dr. Maya"
            else:
                continue

            normalized.append(f"{speaker}: {content}")

        if not normalized:
            return ""

        # Keep only latest turns.
        clipped = normalized[-max_messages:]

        # Then enforce char budget from newest to oldest.
        selected: List[str] = []
        total_chars = 0
        for line in reversed(clipped):
            if total_chars + len(line) > max_chars:
                break
            selected.append(line)
            total_chars += len(line)

        selected.reverse()
        return "\n".join(selected)
    
    def _get_fallback_response(
        self,
        user_message: str,
        language: str = "en",
        conversation_history: Optional[List[Dict]] = None
    ) -> str:
        """Provide fallback responses when Gemini is unavailable"""
        
        message_lower = user_message.lower()
        
        # Emergency keywords
        emergency_keywords = ["chest pain", "heart attack", "can't breathe", "unconscious", "severe bleeding", "stroke"]
        if any(kw in message_lower for kw in emergency_keywords):
            if language == "hi":
                return "⚠️ यह आपातकालीन स्थिति लगती है! कृपया तुरंत 112 पर कॉल करें या नजदीकी अस्पताल जाएं। आपकी सुरक्षा सबसे पहले है।"
            if language == "mr":
                return "⚠️ ही आपत्कालीन स्थिती वाटते! कृपया त्वरित 112 वर कॉल करा किंवा जवळच्या रुग्णालयात जा. तुमची सुरक्षितता सर्वात महत्त्वाची आहे."
            return "⚠️ This sounds like an emergency! Please call 112 immediately or go to the nearest hospital. Your safety comes first."
        
        # Common symptom responses
        if any(word in message_lower for word in ["headache", "सिर दर्द", "head pain"]):
            if language == "hi":
                return "मैं समझ सकती हूं कि सिर दर्द कितना परेशान करने वाला हो सकता है। कृपया पानी पिएं, आराम करें, और अंधेरे कमरे में रहें। अगर दर्द 24 घंटे से ज्यादा रहे या बहुत तेज हो, तो डॉक्टर से मिलें।"
            if language == "mr":
                return "डोकेदुखी त्रासदायक असू शकते हे मला समजते. कृपया पाणी प्या, विश्रांती घ्या आणि शांत, अंधाऱ्या खोलीत बसा. दुखणे 24 तासांपेक्षा जास्त टिकले किंवा खूप तीव्र असेल तर डॉक्टरांचा सल्ला घ्या."
            return "I understand headaches can be quite bothersome. Please stay hydrated, rest in a quiet dark room, and consider over-the-counter pain relief if appropriate. If it persists beyond 24 hours or is severe, please consult a doctor."
        
        if any(word in message_lower for word in ["fever", "बुखार", "temperature"]):
            if language == "hi":
                return "बुखार होना शरीर की संक्रमण से लड़ने की प्रक्रिया है। पर्याप्त आराम करें, खूब पानी पिएं। अगर बुखार 102°F से ऊपर जाए या 3 दिन से ज्यादा रहे, तो डॉक्टर से संपर्क करें।"
            if language == "mr":
                return "ताप येणे ही शरीराची संसर्गाशी लढण्याची प्रक्रिया असते. पुरेशी विश्रांती घ्या आणि भरपूर पाणी प्या. ताप 102°F पेक्षा जास्त झाला किंवा 3 दिवसांपेक्षा जास्त टिकला तर डॉक्टरांचा सल्ला घ्या."
            return "Fever is your body's way of fighting infection. Rest well and stay hydrated. If your temperature goes above 102°F or persists for more than 3 days, please see a doctor."
        
        if any(word in message_lower for word in ["cold", "cough", "सर्दी", "खांसी", "flu"]):
            if language == "hi":
                return "सर्दी-खांसी में गर्म पानी पिएं, भाप लें, और आराम करें। शहद और अदरक वाली चाय फायदेमंद हो सकती है। अगर सांस लेने में तकलीफ हो या 7 दिन बाद भी ठीक न हो, तो डॉक्टर से मिलें।"
            if language == "mr":
                return "सर्दी-खोकल्यात कोमट पाणी प्या, वाफ घ्या आणि विश्रांती घ्या. मध-आल्याचा चहा उपयोगी ठरू शकतो. श्वास घेण्यास त्रास होत असल्यास किंवा लक्षणे 7 दिवसांपेक्षा जास्त टिकल्यास डॉक्टरांना भेटा."
            return "For cold and cough, stay warm, drink hot fluids, and get plenty of rest. Honey and ginger tea can help soothe your throat. If you have difficulty breathing or symptoms persist beyond a week, please see a doctor."
        
        if any(word in message_lower for word in ["stomach", "पेट", "digestion", "nausea", "vomit"]):
            if language == "hi":
                return "पेट की समस्या में हल्का भोजन करें, खूब पानी पिएं। अगर उल्टी या दस्त 24 घंटे से ज्यादा हो, या खून आए, तो तुरंत डॉक्टर से मिलें।"
            if language == "mr":
                return "पोटाच्या तक्रारीत हलका आहार घ्या आणि भरपूर पाणी प्या. उलटी किंवा जुलाब 24 तासांपेक्षा जास्त चालू राहिल्यास किंवा रक्त दिसल्यास त्वरित डॉक्टरांकडे जा."
            return "For stomach issues, try eating light foods and staying hydrated. If vomiting or diarrhea persists beyond 24 hours, or if you notice blood, please seek medical attention immediately."
        
        if any(word in message_lower for word in ["stress", "anxiety", "तनाव", "चिंता", "worried", "sad", "depressed"]):
            if language == "hi":
                return "मैं समझ सकती हूं आप कठिन समय से गुजर रहे हैं। गहरी सांस लें, थोड़ा टहलें, और किसी से बात करें। आप अकेले नहीं हैं। अगर बहुत ज्यादा परेशान हों तो मानसिक स्वास्थ्य विशेषज्ञ से मिलें।"
            if language == "mr":
                return "तुम्ही कठीण काळातून जात आहात हे मला समजते. खोल श्वास घ्या, थोडे चालून या आणि विश्वासू व्यक्तीशी बोला. तुम्ही एकटे नाही आहात. त्रास खूप वाढल्यास मानसिक आरोग्य तज्ज्ञांचा सल्ला घ्या."
            return "I understand you're going through a difficult time. Take deep breaths, try a short walk, and talk to someone you trust. You're not alone. If feelings persist, please consider speaking with a mental health professional."
        
        if any(word in message_lower for word in ["hello", "hi", "नमस्ते", "hey"]):
            if language == "hi":
                return "नमस्ते! मैं डॉ. माया हूं, आपकी AI स्वास्थ्य सहायक। आज मैं आपकी कैसे मदद कर सकती हूं? अपने लक्षण बताएं।"
            if language == "mr":
                return "नमस्कार! मी डॉ. माया, तुमची AI आरोग्य सहाय्यक आहे. आज मी तुम्हाला कशी मदत करू शकते? कृपया तुमची लक्षणे सांगा."
            return "Hello! I'm Dr. Maya, your AI health assistant. How can I help you today? Please describe your symptoms or health concerns."
        
        if any(word in message_lower for word in ["thank", "धन्यवाद", "thanks"]):
            if language == "hi":
                return "आपका स्वागत है! अपना ख्याल रखें। अगर कोई और सवाल हो तो बेझिझक पूछें। 🙏"
            if language == "mr":
                return "तुमचे स्वागत आहे! स्वतःची काळजी घ्या. अजून प्रश्न असतील तर नक्की विचारा. 🙏"
            return "You're welcome! Take care of yourself. Feel free to ask if you have any more questions. 🙏"

        latest_ai = ""
        latest_user = ""
        recent_user_messages: List[str] = []
        if conversation_history:
            for item in reversed(conversation_history):
                if not isinstance(item, dict):
                    continue
                role = str(item.get("role", "")).lower().strip()
                content = str(item.get("content") or item.get("message") or "").strip()
                if not content:
                    continue

                if role in {"assistant", "ai", "doctor", "agent"} and not latest_ai:
                    latest_ai = content
                elif role in {"user", "patient"} and not latest_user:
                    latest_user = content
                if role in {"user", "patient"}:
                    recent_user_messages.append(content)

                if latest_ai and latest_user:
                    break

        is_question_like = (
            "?" in user_message
            or message_lower.startswith((
                "what", "why", "how", "when", "can", "should", "is", "are",
                "explain", "tell", "which", "who"
            ))
        )

        is_step_request = any(
            phrase in message_lower
            for phrase in [
                "what should i do",
                "what should i do first",
                "next step",
                "next steps",
                "simple steps",
                "explain in",
                "what now",
            ]
        )

        if recent_user_messages:
            context_seed = " ".join(reversed(recent_user_messages[:3]))
        else:
            context_seed = latest_user

        context_text = f"{context_seed} {user_message}".lower().strip()
        has_headache_context = any(word in context_text for word in ["headache", "head pain", "सिर दर्द", "डोकेदुखी"])
        has_fever_context = any(word in context_text for word in ["fever", "temperature", "बुखार", "ताप"])

        if is_step_request and (has_headache_context or has_fever_context):
            if language == "hi":
                return (
                    "अभी के लिए सरल 3 कदम अपनाएं: (1) आराम करें और हर 30-45 मिनट में पानी पिएं, "
                    "(2) तापमान/दर्द की तीव्रता नोट करें और जरूरत हो तो सुरक्षित OTC दवा लें, "
                    "(3) अगर लक्षण बढ़ें, 24 घंटे से ज्यादा रहें, या कोई रेड-फ्लैग लक्षण आएं तो तुरंत डॉक्टर से मिलें।"
                )
            if language == "mr":
                return (
                    "सोपे 3 टप्पे घ्या: (1) विश्रांती घ्या आणि दर 30-45 मिनिटांनी पाणी प्या, "
                    "(2) तापमान/दुखण्याची तीव्रता नोंदवा आणि गरज असल्यास सुरक्षित OTC औषध घ्या, "
                    "(3) लक्षणे वाढली, 24 तासांपेक्षा जास्त टिकली किंवा रेड-फ्लॅग दिसले तर त्वरित डॉक्टरांना भेटा."
                )
            return (
                "Here is a simple 3-step plan: (1) Rest and hydrate regularly, "
                "(2) track symptom severity/temperature and use safe OTC relief if appropriate, "
                "(3) seek medical care urgently if symptoms worsen, persist beyond 24 hours, or any red-flag signs appear."
            )

        ai_lower = latest_ai.lower().strip()
        ai_is_meta_prompt = (
            ai_lower.startswith("good question. based on our previous discussion:")
            or ai_lower.startswith("here is a simple 3-step plan:")
            or "please share the exact part you want answered" in ai_lower
            or ai_lower.startswith("i understand your question.")
        )

        if is_question_like and latest_ai and not ai_is_meta_prompt:
            preview = latest_ai[:160]
            if language == "hi":
                return (
                    f"अच्छा सवाल है। हमारी पिछली बातचीत के आधार पर: {preview}... "
                    "कृपया अपना मुख्य प्रश्न थोड़ा और विशिष्ट करें (जैसे दवा, जांच रिपोर्ट, डाइट, या लक्षण), "
                    "ताकि मैं आपको सीधा और सटीक उत्तर दे सकूं।"
                )
            if language == "mr":
                return (
                    f"छान प्रश्न आहे. आपल्या आधीच्या संभाषणानुसार: {preview}... "
                    "कृपया तुमचा मुख्य प्रश्न थोडा अधिक स्पष्ट करा (उदा. औषध, तपासणी अहवाल, आहार किंवा लक्षणे), "
                    "म्हणजे मी थेट आणि अचूक उत्तर देऊ शकेन."
                )
            return (
                f"Good question. Based on our previous discussion: {preview}... "
                "Please share the exact part you want answered (medicine, test report, diet, or symptom), "
                "and I will give a direct, focused response."
            )

        if is_question_like and latest_user:
            if language == "hi":
                return (
                    f"आपके पिछले संदेश (\"{latest_user[:90]}\") के आधार पर, "
                    "मैं सीधा मार्गदर्शन दूंगी: कृपया लक्षण कितनी बार हो रहे हैं, दवा ली है या नहीं, और एक मौजूदा तापमान/दर्द स्कोर बताएं, "
                    "ताकि मैं आपका अगला सटीक कदम तय कर सकूं।"
                )
            if language == "mr":
                return (
                    f"तुमच्या मागील संदेशानुसार (\"{latest_user[:90]}\"), "
                    "मी थेट मार्गदर्शन देते: लक्षणे किती वेळा होतात, औषध घेतले का, आणि सध्याचा तापमान/दुखणे स्कोअर सांगा, "
                    "म्हणजे पुढील अचूक पाऊल ठरवता येईल."
                )
            return (
                f"Based on your earlier message (\"{latest_user[:90]}\"), "
                "here is the direct next step: share current severity, how often symptoms are occurring, and any medicine already taken, "
                "so I can give a precise next action."
            )

        if is_question_like:
            if language == "hi":
                return (
                    "मैं आपका प्रश्न समझ रही हूं। मैं अभी सामान्य स्वास्थ्य मार्गदर्शन दे सकती हूं, "
                    "और यदि आप संदर्भ (उम्र, अवधि, लक्षण, दवाएं/रिपोर्ट) देंगे तो मैं अधिक सटीक उत्तर दूंगी।"
                )
            if language == "mr":
                return (
                    "मी तुमचा प्रश्न समजले. मी आत्ता सामान्य आरोग्य मार्गदर्शन देऊ शकते, "
                    "आणि तुम्ही संदर्भ (वय, कालावधी, लक्षणे, औषधे/रिपोर्ट) दिल्यास अधिक अचूक उत्तर देईन."
                )
            return (
                "I understand your question. I can provide general health guidance now, "
                "and if you share context (age, duration, symptoms, medicines/reports), "
                "I can give a more precise answer."
            )
        
        # Default response
        if language == "hi":
            return "मैंने आपकी बात सुनी। कृपया थोड़ा और संदर्भ दें (मुख्य समस्या, कब से है, गंभीरता, और संबंधित लक्षण/दवा), ताकि मैं बेहतर और सीधा मार्गदर्शन दे सकूं।"
        if language == "mr":
            return "मी तुमचे म्हणणे समजले. कृपया थोडा अधिक संदर्भ द्या (मुख्य तक्रार, कधीपासून आहे, तीव्रता, आणि संबंधित लक्षणे/औषधे), म्हणजे मी अधिक अचूक मार्गदर्शन देऊ शकेन."
        return "I understand. Please share a bit more context (main concern, duration, severity, and related symptoms/medicines) so I can give a direct and useful answer."


# Singleton instance
gemini_service = GeminiService()

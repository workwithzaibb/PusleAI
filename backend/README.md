# Pulse AI Backend

## 🏥 Multilingual Virtual Doctor for Underprivileged Communities

A comprehensive AI-powered healthcare assistance platform backend built with FastAPI.

## Features

- 🎤 **Voice-based AI Doctor** - Speech-to-Text and Text-to-Speech
- 🌍 **Multilingual Support** - English, Hindi, Tamil, Telugu
- 🩺 **Smart Symptom Checker** - AI-powered symptom analysis
- 📊 **AI Confidence Score** - Transparency in AI recommendations
- 🚨 **Emergency Detection** - Automatic triage and escalation
- 💊 **Medicine Safety Checker** - Drug interactions and safety info
- 👨‍👩‍👧‍👦 **Family Health Accounts** - Manage multiple profiles
- 📅 **Automated Follow-ups** - Post-consultation care

## Quick Start

### 1. Setup Virtual Environment

```bash
cd backend
python -m venv venv

# Windows
venv\Scripts\activate

# Linux/Mac
source venv/bin/activate
```

### 2. Install Dependencies

```bash
pip install -r requirements.txt
```

### 3. Configure Environment

```bash
cp .env.example .env
# Edit .env with your settings
```

### 4. Run the Server

```bash
python run.py
```

Or directly with uvicorn:
```bash
uvicorn app.main:app --reload
```

### 5. Access API Documentation

- Swagger UI: http://localhost:8000/docs
- ReDoc: http://localhost:8000/redoc

## API Endpoints

### Authentication
- `POST /api/v1/auth/register` - Register new user
- `POST /api/v1/auth/login` - Login and get token
- `GET /api/v1/auth/me` - Get current user

### Consultation
- `POST /api/v1/consultation/start` - Start new consultation
- `POST /api/v1/consultation/message` - Send message to AI doctor
- `POST /api/v1/consultation/end/{session_id}` - End consultation
- `GET /api/v1/consultation/history` - Get consultation history

### Symptoms
- `POST /api/v1/symptoms/analyze` - Analyze symptoms
- `GET /api/v1/symptoms/list` - Get common symptoms

### Emergency
- `POST /api/v1/emergency/check` - Check for emergency
- `POST /api/v1/emergency/panic` - Trigger panic button
- `GET /api/v1/emergency/contacts` - Get emergency contacts

### Medicine
- `POST /api/v1/medicine/lookup` - Look up medicine info
- `POST /api/v1/medicine/interactions` - Check drug interactions

### Text-to-Speech
- `POST /api/v1/tts/synthesize` - Convert text to speech

### Speech-to-Text
- `POST /api/v1/stt/transcribe` - Transcribe audio to text

### Family
- `POST /api/v1/family/members` - Add family member
- `GET /api/v1/family/members` - List family members

### Follow-up
- `POST /api/v1/followup/schedule` - Schedule follow-up
- `GET /api/v1/followup/pending` - Get pending follow-ups

## Project Structure

```
backend/
├── app/
│   ├── __init__.py
│   ├── main.py              # FastAPI application
│   ├── config.py            # Configuration settings
│   ├── database.py          # Database setup
│   ├── schemas.py           # Pydantic schemas
│   ├── api/                  # API routers
│   │   ├── auth.py
│   │   ├── consultation.py
│   │   ├── symptoms.py
│   │   ├── emergency.py
│   │   ├── medicine.py
│   │   ├── tts.py
│   │   ├── stt.py
│   │   ├── family.py
│   │   └── followup.py
│   ├── models/              # SQLAlchemy models
│   │   ├── user.py
│   │   ├── consultation.py
│   │   ├── family.py
│   │   └── followup.py
│   ├── services/            # AI/ML services
│   │   ├── ai_doctor.py
│   │   ├── symptom_analyzer.py
│   │   ├── emergency_detector.py
│   │   ├── medicine_checker.py
│   │   ├── speech_to_text.py
│   │   ├── text_to_speech.py
│   │   ├── language_detection.py
│   │   └── emotion_detector.py
│   └── knowledge/           # Medical knowledge base
│       ├── symptoms_db.py
│       ├── medicine_db.py
│       └── translations.py
├── requirements.txt
├── run.py
└── .env.example
```

## Technology Stack

- **Framework**: FastAPI
- **Database**: SQLite (dev) / PostgreSQL (prod)
- **Speech-to-Text**: OpenAI Whisper
- **Text-to-Speech**: gTTS
- **Authentication**: JWT with OAuth2

## Safety & Ethics

- ⚠️ AI does not replace professional medical advice
- ⚠️ No prescription of controlled medications
- ⚠️ Emergency detection with automatic escalation
- ⚠️ Medical disclaimers shown to users
- ⚠️ Patient data encryption

## License

MIT License - For educational purposes

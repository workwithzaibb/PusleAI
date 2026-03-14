<p align="center">
  <img src="https://img.shields.io/badge/PulseAI-Healthcare%20Revolution-00D9FF?style=for-the-badge&logo=heartbeat&logoColor=white" alt="PulseAI"/>
</p>

<h1 align="center">
  🏥 PulseAI - Your AI-Powered Health Companion
</h1>

<p align="center">
  <strong>🚀 Revolutionizing Healthcare with Artificial Intelligence</strong>
</p>

<p align="center">
  <img src="https://img.shields.io/badge/React-18.x-61DAFB?style=flat-square&logo=react&logoColor=black" alt="React"/>
  <img src="https://img.shields.io/badge/FastAPI-0.100+-009688?style=flat-square&logo=fastapi&logoColor=white" alt="FastAPI"/>
  <img src="https://img.shields.io/badge/Python-3.11+-3776AB?style=flat-square&logo=python&logoColor=white" alt="Python"/>
  <img src="https://img.shields.io/badge/TailwindCSS-3.x-38B2AC?style=flat-square&logo=tailwind-css&logoColor=white" alt="TailwindCSS"/>
  <img src="https://img.shields.io/badge/Vite-5.x-646CFF?style=flat-square&logo=vite&logoColor=white" alt="Vite"/>
</p>

<p align="center">
  <img src="https://img.shields.io/github/stars/workwithzaibb/PusleAI?style=social" alt="Stars"/>
  <img src="https://img.shields.io/github/forks/workwithzaibb/PusleAI?style=social" alt="Forks"/>
  <img src="https://img.shields.io/github/issues/workwithzaibb/PusleAI?color=red" alt="Issues"/>
  <img src="https://img.shields.io/github/license/workwithzaibb/PusleAI?color=blue" alt="License"/>
</p>

---

<p align="center">
  <img src="frontend/public/dr.mp4" alt="PulseAI Demo" width="800"/>
</p>

---

## 🌟 What is PulseAI?

**PulseAI** is a cutting-edge, AI-powered healthcare platform that brings the future of medicine to your fingertips. Imagine having a **personal AI doctor** available 24/7, understanding your symptoms in **any language**, tracking your mental health, managing medications, and even detecting emergencies — all in one beautiful, intuitive app.

> *"Healthcare should be accessible, intelligent, and personal. PulseAI makes it happen."*

---

## 🎯 Features That Will Blow Your Mind

### 🩺 AI Doctor Consultation
<table>
<tr>
<td width="60%">

- **Real-time Voice Conversations** with AI Doctor
- **Multilingual Support** - Speak in Hindi, English, or any language
- **Intelligent Symptom Analysis** powered by advanced ML
- **Personalized Health Recommendations**
- **Emergency Detection** - Automatically detects critical symptoms

</td>
<td width="40%">

```
🎤 "मुझे सिर दर्द है"
    ↓
🤖 AI analyzes...
    ↓
💊 Personalized advice
```

</td>
</tr>
</table>

---

### 🧠 Mental Health Support
| Feature | Description |
|---------|-------------|
| 🎭 **Mood Tracking** | Track your emotional well-being daily |
| 📊 **Sentiment Analysis** | AI understands your emotional state |
| 📝 **Digital Journal** | Write and reflect with AI insights |
| 💬 **Therapy Chatbot** | 24/7 supportive conversations |
| 📈 **Progress Reports** | Visualize your mental health journey |

---

### 💊 Smart Medication Management

```
┌─────────────────────────────────────────────────────────┐
│  💊 MEDICATION REMINDER SYSTEM                          │
├─────────────────────────────────────────────────────────┤
│                                                         │
│  ⏰ Smart Reminders      → Never miss a dose           │
│  🔍 Drug Interactions    → Stay safe from conflicts    │
│  📸 Pill Identification  → Scan & identify any pill    │
│  📋 Prescription Scanner → Upload & organize easily    │
│  📊 Adherence Tracking   → ML-powered insights         │
│                                                         │
└─────────────────────────────────────────────────────────┘
```

---

### 👨‍⚕️ Find Real Doctors

- 🔍 **Search & Filter** - Find specialists near you
- 📅 **Easy Booking** - Schedule appointments instantly
- ⭐ **Verified Reviews** - Read real patient experiences
- 💳 **Multiple Payment Options** - Pay your way

---

### 🚨 Emergency Features

```diff
+ 🆘 One-Tap Emergency Alert
+ 📍 Auto Location Sharing
+ 👨‍👩‍👧‍👦 Family Emergency Contacts
+ 🏥 Nearest Hospital Finder
+ 📞 Direct Ambulance Connection
```

---

## 🏗️ Architecture

```
                    ┌──────────────────┐
                    │   PulseAI App    │
                    └────────┬─────────┘
                             │
         ┌───────────────────┼───────────────────┐
         │                   │                   │
         ▼                   ▼                   ▼
┌─────────────────┐ ┌─────────────────┐ ┌─────────────────┐
│   React + Vite  │ │   FastAPI       │ │   AI/ML Models  │
│   Frontend      │ │   Backend       │ │   Services      │
└────────┬────────┘ └────────┬────────┘ └────────┬────────┘
         │                   │                   │
         │    ┌──────────────┴──────────────┐    │
         │    │        REST APIs            │    │
         │    └──────────────┬──────────────┘    │
         │                   │                   │
         └───────────────────┼───────────────────┘
                             │
              ┌──────────────┴──────────────┐
              │                             │
              ▼                             ▼
    ┌─────────────────┐          ┌─────────────────┐
    │   PostgreSQL    │          │  External APIs  │
    │   Database      │          │  (Groq, OpenAI,  │
    │                 │          │   etc)          │
    └─────────────────┘          └─────────────────┘
```

---

## 🚀 Quick Start

### Prerequisites

- **Node.js** 18+ 
- **Python** 3.11+
- **Git**

### Installation

```bash
# Clone the repository
git clone https://github.com/workwithzaibb/PusleAI.git
cd PusleAI

# Setup Frontend
cd frontend
npm install
cp .env.example .env  # On Windows PowerShell: Copy-Item .env.example .env
npm run dev

# Setup Backend (new terminal)
cd backend
pip install -r requirements.txt
cp .env.example .env  # On Windows PowerShell: Copy-Item .env.example .env
python run.py
```

### Run Locally (important)

- Frontend and backend must be started from their own folders.
- `npm run dev` from repo root will fail because there is no root `package.json`.

```bash
# Terminal 1: Frontend
cd frontend
npm install
npm run dev
```

```bash
# Terminal 2: Backend
cd backend
pip install -r requirements.txt
python run.py
```

```powershell
# Windows fallback (without activating venv)
Set-Location backend
.\venv\Scripts\python.exe run.py
```

### Environment Variables

Create `.env` files in both `frontend/` and `backend/` directories:

**Frontend (.env)**
```env
VITE_API_URL=http://localhost:8000
# Groq key is handled via backend, no VITE_ key needed locally typically
```

**Backend (.env)**
```env
DATABASE_URL=sqlite:///./pulseai.db
SECRET_KEY=your_super_secret_key
OPENAI_API_KEY=your_openai_key
GROQ_API_KEY=your_groq_key
```

---

## 📱 Screenshots

<table>
<tr>
<td align="center"><b>🏠 Home Dashboard</b></td>
<td align="center"><b>🩺 AI Consultation</b></td>
</tr>
<tr>
<td><img src="https://via.placeholder.com/400x300/00D9FF/FFFFFF?text=Home+Dashboard" alt="Home"/></td>
<td><img src="https://via.placeholder.com/400x300/10B981/FFFFFF?text=AI+Doctor" alt="Consultation"/></td>
</tr>
<tr>
<td align="center"><b>🧠 Mental Health</b></td>
<td align="center"><b>💊 Medications</b></td>
</tr>
<tr>
<td><img src="https://via.placeholder.com/400x300/8B5CF6/FFFFFF?text=Mental+Health" alt="Mental Health"/></td>
<td><img src="https://via.placeholder.com/400x300/F59E0B/FFFFFF?text=Medications" alt="Medications"/></td>
</tr>
</table>

---

## 💰 Pricing Plans

| Plan | Price | Features |
|------|-------|----------|
| 🆓 **Free** | ₹0/month | 5 AI consultations, Basic symptom checker, Medication reminders |
| 💎 **Pro** | ₹199/month | Unlimited consultations, Priority support, Advanced AI features |
| 👨‍👩‍👧‍👦 **Family** | ₹499/month | Up to 6 members, Shared health records, Family emergency alerts |

---

## 🛠️ Tech Stack

<table>
<tr>
<td align="center" width="96">
<img src="https://skillicons.dev/icons?i=react" width="48" height="48" alt="React" />
<br>React
</td>
<td align="center" width="96">
<img src="https://skillicons.dev/icons?i=vite" width="48" height="48" alt="Vite" />
<br>Vite
</td>
<td align="center" width="96">
<img src="https://skillicons.dev/icons?i=tailwind" width="48" height="48" alt="Tailwind" />
<br>Tailwind
</td>
<td align="center" width="96">
<img src="https://skillicons.dev/icons?i=python" width="48" height="48" alt="Python" />
<br>Python
</td>
<td align="center" width="96">
<img src="https://skillicons.dev/icons?i=fastapi" width="48" height="48" alt="FastAPI" />
<br>FastAPI
</td>
<td align="center" width="96">
<img src="https://skillicons.dev/icons?i=postgres" width="48" height="48" alt="PostgreSQL" />
<br>PostgreSQL
</td>
</tr>
</table>

---

## 🤝 Contributing

We love contributions! Here's how you can help:

1. 🍴 Fork the repository
2. 🌿 Create a feature branch (`git checkout -b feature/AmazingFeature`)
3. 💾 Commit your changes (`git commit -m 'Add AmazingFeature'`)
4. 📤 Push to the branch (`git push origin feature/AmazingFeature`)
5. 🔃 Open a Pull Request

---

## 📞 Contact & Support

<p align="center">
  <a href="https://github.com/workwithzaibb">
    <img src="https://img.shields.io/badge/GitHub-100000?style=for-the-badge&logo=github&logoColor=white" alt="GitHub"/>
  </a>
  <a href="mailto:workwithzaibb@gmail.com">
    <img src="https://img.shields.io/badge/Email-D14836?style=for-the-badge&logo=gmail&logoColor=white" alt="Email"/>
  </a>
  <a href="https://linkedin.com/in/workwithzaibb">
    <img src="https://img.shields.io/badge/LinkedIn-0077B5?style=for-the-badge&logo=linkedin&logoColor=white" alt="LinkedIn"/>
  </a>
</p>

---

## ⭐ Star History

[![Star History Chart](https://api.star-history.com/svg?repos=workwithzaibb/PusleAI&type=Date)](https://star-history.com/#workwithzaibb/PusleAI&Date)

---

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

---

<p align="center">
  <img src="https://capsule-render.vercel.app/api?type=waving&color=gradient&customColorList=6,11,20&height=150&section=footer&text=Made%20with%20❤️%20by%20Zaib&fontSize=24&fontColor=fff&animation=twinkling"/>
</p>

<p align="center">
  <b>If PulseAI helps you, please consider giving it a ⭐!</b>
</p>

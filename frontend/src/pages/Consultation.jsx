import { useState, useRef, useEffect, lazy, Suspense } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Send, Bot, User, Globe, Zap } from 'lucide-react';
import { startConsultation, sendMessage, endConsultation } from '../api';
import { useTheme } from '../contexts/ThemeContext';

const GroqAgent = lazy(() => import('../components/GroqAgent'));

const LANGUAGES = [
  { code: 'en', name: 'English', flag: '🇬🇧' },
  { code: 'hi', name: 'हिंदी', flag: '🇮🇳' },
  { code: 'mr', name: 'मराठी', flag: '🇮🇳' },
  { code: 'ta', name: 'தமிழ்', flag: '🇮🇳' },
];

const LANGUAGE_UI = {
  en: {
    fallbackGreeting: 'Hello! I am your AI Health Assistant.',
    placeholder: 'Describe your symptoms...',
    quickSymptoms: ['Headache', 'Fever', 'Cough', 'Stomach pain'],
    emergencyLabel: 'EMERGENCY'
  },
  hi: {
    fallbackGreeting: 'नमस्ते! मैं आपकी AI स्वास्थ्य सहायक हूं।',
    placeholder: 'अपने लक्षण बताएं...',
    quickSymptoms: ['सिर दर्द', 'बुखार', 'खांसी', 'पेट दर्द'],
    emergencyLabel: 'आपातकाल'
  },
  mr: {
    fallbackGreeting: 'नमस्कार! मी तुमची AI आरोग्य सहाय्यक आहे.',
    placeholder: 'तुमची लक्षणे सांगा...',
    quickSymptoms: ['डोकेदुखी', 'ताप', 'खोकला', 'पोटदुखी'],
    emergencyLabel: 'आपत्कालीन'
  }
};

const EMERGENCY_REGEX = /(chest pain|difficulty breathing|can\'t breathe|unconscious|stroke|heart attack|severe pain|suicide|self harm|सीने में दर्द|सांस|बेहोश|आत्महत्या|छाती|छातीत|श्वास|बेशुद्ध|आत्महत्य)/i;

function buildContextualFallback(language, userMessage, chatHistory = []) {
  const lowered = (userMessage || '').toLowerCase();
  const latestAi = [...chatHistory].reverse().find(m => m.type === 'ai')?.content;
  const hasEmergencySignal = EMERGENCY_REGEX.test(lowered);

  if (hasEmergencySignal) {
    if (language === 'hi') {
      return 'आपके संदेश में गंभीर लक्षण दिखाई दे रहे हैं। कृपया तुरंत आपातकालीन सहायता (112) या नजदीकी अस्पताल से संपर्क करें। मैं आपके साथ हूं।';
    }
    if (language === 'mr') {
      return 'तुमच्या संदेशात गंभीर लक्षणे दिसत आहेत. कृपया त्वरित आपत्कालीन मदत (112) किंवा जवळच्या रुग्णालयाशी संपर्क साधा. मी तुमच्यासोबत आहे.';
    }
    return 'Your message suggests serious symptoms. Please contact emergency services (112) or the nearest hospital immediately. I am here with you.';
  }

  if (latestAi) {
    if (language === 'hi') {
      return `हमारी पिछली बातचीत को ध्यान में रखते हुए: ${latestAi.slice(0, 180)}... कृपया बताएं कि अभी आपकी सबसे मुख्य परेशानी क्या है (दर्द, बुखार, खांसी, या कुछ और)।`;
    }
    if (language === 'mr') {
      return `आपल्या आधीच्या संभाषणानुसार: ${latestAi.slice(0, 180)}... कृपया आत्ता तुमची मुख्य तक्रार कोणती आहे ते सांगा (दुखणे, ताप, खोकला किंवा इतर).`;
    }
    return `Based on our previous discussion: ${latestAi.slice(0, 180)}... Please tell me your biggest concern right now (pain, fever, cough, or something else).`;
  }

  if (language === 'hi') {
    return 'मैं आपकी बात समझ रही हूं। कृपया लक्षणों की अवधि, तीव्रता और कोई अन्य संबंधित लक्षण बताएं ताकि मैं बेहतर मार्गदर्शन दे सकूं।';
  }
  if (language === 'mr') {
    return 'मी तुमचे म्हणणे समजले. कृपया लक्षणे किती दिवसांपासून आहेत, किती तीव्र आहेत आणि इतर संबंधित लक्षणे आहेत का ते सांगा.';
  }
  return 'I understand. Please share symptom duration, severity, and any related symptoms so I can guide you better.';
}

export default function Consultation() {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [sessionId, setSessionId] = useState(null);
  const [loading, setLoading] = useState(false);
  const [language, setLanguage] = useState('en');
  const [showLang, setShowLang] = useState(false);
  const messagesEnd = useRef(null);
  const navigate = useNavigate();
  const uiText = LANGUAGE_UI[language] || LANGUAGE_UI.en;

  useEffect(() => { startNew(language); }, []);
  useEffect(() => { messagesEnd.current?.scrollIntoView({ behavior: 'smooth' }); }, [messages]);

  const startNew = async (selectedLanguage = language) => {
    try {
      const res = await startConsultation(selectedLanguage);
      setSessionId(res.data.session_id);
      setMessages([{ type: 'ai', content: res.data.message }]);
    } catch {
      const fallbackText = (LANGUAGE_UI[selectedLanguage] || LANGUAGE_UI.en).fallbackGreeting;
      setMessages([{ type: 'ai', content: fallbackText }]);
    }
  };

  const handleSend = async () => {
    if (!input.trim() || loading) return;
    const msg = input.trim();
    setInput('');
    setMessages(prev => [...prev, { type: 'user', content: msg }]);
    setLoading(true);
    try {
      const res = await sendMessage(sessionId, msg, language);
      setMessages(prev => [...prev, { type: 'ai', content: res.data.message, severity: res.data.severity, isEmergency: res.data.is_emergency }]);
    } catch {
      const fallback = buildContextualFallback(language, msg, messages);
      setMessages(prev => [...prev, { type: 'ai', content: fallback }]);
    }
    setLoading(false);
  };

  const handleEnd = async () => {
    if (sessionId) await endConsultation(sessionId).catch(() => {});
    navigate('/');
  };

  const { theme } = useTheme();

  return (
    <div className={`min-h-screen flex flex-col relative overflow-hidden transition-colors duration-300 ${theme === 'dark' ? 'bg-black text-white' : 'bg-gradient-to-br from-slate-50 via-cyan-50 to-blue-50 text-gray-900'}`}>
      <div className="fixed inset-0 pointer-events-none">
        <div className={`absolute top-1/4 -right-20 w-[400px] h-[400px] rounded-full blur-3xl animate-pulse ${theme === 'dark' ? 'bg-gradient-to-l from-cyan-500/20 to-transparent' : 'bg-gradient-to-l from-cyan-400/30 to-transparent'}`} />
        <div className={`absolute bottom-1/4 -left-20 w-[300px] h-[300px] rounded-full blur-3xl animate-pulse ${theme === 'dark' ? 'bg-gradient-to-r from-blue-500/20 to-transparent' : 'bg-gradient-to-r from-blue-400/30 to-transparent'}`} />
      </div>

      {/* Header */}
      <nav className={`relative z-20 px-4 sm:px-6 py-3 sm:py-4 flex items-center justify-between border-b mobile-header-safe ${theme === 'dark' ? 'border-white/10' : 'border-gray-200 bg-white/70 backdrop-blur-xl'}`}>
        <div className="flex items-center gap-3 sm:gap-4">
          <button onClick={handleEnd} className={`p-2 rounded-full min-w-[44px] min-h-[44px] flex items-center justify-center ${theme === 'dark' ? 'hover:bg-white/10 active:bg-white/20' : 'hover:bg-gray-100 active:bg-gray-200'}`}><ArrowLeft className="w-5 h-5" /></button>
          <div>
            <h1 className="font-black text-lg sm:text-xl tracking-tight flex items-center gap-2">AI DOCTOR <Zap className="w-4 sm:w-5 h-4 sm:h-5 text-cyan-400" /></h1>
            <p className={`text-[10px] tracking-[0.2em] ${theme === 'dark' ? 'text-cyan-300' : 'text-cyan-600'}`}>SESSION #{sessionId?.slice(0, 8) || '...'}</p>
          </div>
        </div>
        <div className="relative">
          <button onClick={() => setShowLang(!showLang)} className={`px-3 py-2 rounded-lg flex items-center gap-2 min-h-[44px] ${theme === 'dark' ? 'bg-gray-800 hover:bg-gray-700 active:bg-gray-600' : 'bg-white border border-gray-200 hover:bg-gray-50 active:bg-gray-100'}`}>
            <Globe className="w-4 h-4" /> {LANGUAGES.find(l => l.code === language)?.flag}
          </button>
          {showLang && (
            <div className={`absolute right-0 top-full mt-2 rounded-xl border overflow-hidden z-30 ${theme === 'dark' ? 'bg-gray-900 border-white/10' : 'bg-white border-gray-200 shadow-lg'}`}>
              {LANGUAGES.map(l => (
                <button key={l.code} onClick={() => {
                  setShowLang(false);
                  if (language === l.code) return;
                  setLanguage(l.code);
                  setMessages([]);
                  setTimeout(() => startNew(l.code), 100);
                }}
                  className={`w-full px-4 py-3 text-left flex items-center gap-3 hover:bg-gray-800 ${language === l.code ? 'bg-cyan-500/20' : ''}`}>
                  <span>{l.flag}</span> <span className="text-sm">{l.name}</span>
                </button>
              ))}
            </div>
          )}
        </div>
      </nav>

      {/* Main */}
      <div className="flex-1 flex flex-col lg:flex-row overflow-hidden relative z-10">
        {/* Video Panel - Collapsible on mobile */}
        <div className="lg:w-[400px] p-3 sm:p-4 border-b lg:border-b-0 lg:border-r border-white/10 bg-gray-900/50 max-h-[35vh] lg:max-h-none overflow-hidden">
          <Suspense fallback={<div className="h-full min-h-[180px] rounded-xl bg-gray-800/70 animate-pulse" />}>
            <GroqAgent language={language} />
          </Suspense>
        </div>

        {/* Chat */}
        <div className="flex-1 flex flex-col min-h-0">
          <div className="flex-1 overflow-y-auto p-3 sm:p-4 space-y-3 sm:space-y-4 touch-action-pan-y">
            {messages.map((msg, i) => (
              <div key={i} className={`flex gap-2 sm:gap-3 ${msg.type === 'user' ? 'justify-end' : ''}`}>
                {msg.type === 'ai' && (
                  <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-full bg-gradient-to-br from-cyan-500 to-blue-600 flex items-center justify-center flex-shrink-0">
                    <Bot className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                  </div>
                )}
                <div className={`max-w-[80%] sm:max-w-[75%] rounded-2xl p-3 sm:p-4 ${msg.type === 'user' ? 'bg-cyan-600' : 'bg-gray-800 border border-white/10'} ${msg.isEmergency ? 'border-red-500 bg-red-900/50' : ''}`}>
                  {msg.isEmergency && <p className="text-red-400 text-xs font-bold mb-2">⚠️ {uiText.emergencyLabel}</p>}
                  <p className="text-sm leading-relaxed">{msg.content}</p>
                </div>
                {msg.type === 'user' && (
                  <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-full bg-gray-700 flex items-center justify-center flex-shrink-0">
                    <User className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                  </div>
                )}
              </div>
            ))}
            {loading && (
              <div className="flex gap-3">
                <div className="w-8 h-8 rounded-full bg-gradient-to-br from-cyan-500 to-blue-600 flex items-center justify-center">
                  <Bot className="w-4 h-4 animate-pulse" />
                </div>
                <div className="bg-gray-800 rounded-2xl p-4 border border-white/10">
                  <div className="flex gap-1"><span className="w-2 h-2 bg-cyan-400 rounded-full animate-bounce" /><span className="w-2 h-2 bg-cyan-400 rounded-full animate-bounce" style={{animationDelay:'0.1s'}} /><span className="w-2 h-2 bg-cyan-400 rounded-full animate-bounce" style={{animationDelay:'0.2s'}} /></div>
                </div>
              </div>
            )}
            <div ref={messagesEnd} />
          </div>

          {/* Input */}
          <div className="p-3 sm:p-4 border-t border-white/10 bg-gray-900/50 mobile-nav-safe">
            <div className="flex gap-2 sm:gap-3">
              <input value={input} onChange={e => setInput(e.target.value)} onKeyDown={e => e.key === 'Enter' && handleSend()}
                placeholder={uiText.placeholder}
                className="flex-1 px-3 sm:px-4 py-3 bg-black border border-white/10 rounded-xl text-white placeholder-gray-600 focus:border-cyan-500 text-base" />
              <button onClick={handleSend} disabled={loading || !input.trim()}
                className="px-4 sm:px-5 py-3 bg-white text-black font-bold rounded-xl hover:bg-cyan-400 active:bg-cyan-500 disabled:opacity-50 min-w-[52px] flex items-center justify-center">
                <Send className="w-5 h-5" />
              </button>
            </div>
            <div className="flex gap-2 mt-2 sm:mt-3 overflow-x-auto pb-1 -mx-1 px-1">
              {uiText.quickSymptoms.map(s => (
                <button key={s} onClick={() => setInput(prev => prev ? `${prev}, ${s}` : s)}
                  className="px-3 py-2 bg-gray-800 text-cyan-300 text-xs rounded-full hover:bg-cyan-500/20 hover:text-cyan-400 active:bg-cyan-500/30 whitespace-nowrap flex-shrink-0">{s}</button>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

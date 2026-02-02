import { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Send, Bot, User, Globe, Zap } from 'lucide-react';
import { startConsultation, sendMessage, endConsultation } from '../api';
import ElevenLabsAgent from '../components/ElevenLabsAgent';
import { useTheme } from '../contexts/ThemeContext';

const LANGUAGES = [
  { code: 'en', name: 'English', flag: '🇬🇧' },
  { code: 'hi', name: 'हिंदी', flag: '🇮🇳' },
  { code: 'ta', name: 'தமிழ்', flag: '🇮🇳' },
];

export default function Consultation() {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [sessionId, setSessionId] = useState(null);
  const [loading, setLoading] = useState(false);
  const [language, setLanguage] = useState('en');
  const [showLang, setShowLang] = useState(false);
  const messagesEnd = useRef(null);
  const navigate = useNavigate();

  useEffect(() => { startNew(); }, []);
  useEffect(() => { messagesEnd.current?.scrollIntoView({ behavior: 'smooth' }); }, [messages]);

  const startNew = async () => {
    try {
      const res = await startConsultation(language);
      setSessionId(res.data.session_id);
      setMessages([{ type: 'ai', content: res.data.message }]);
    } catch {
      setMessages([{ type: 'ai', content: 'Hello! I am your AI Health Assistant.' }]);
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
      setMessages(prev => [...prev, { type: 'ai', content: 'Sorry, please try again.' }]);
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
      <nav className={`relative z-20 px-6 py-4 flex items-center justify-between border-b ${theme === 'dark' ? 'border-white/10' : 'border-gray-200 bg-white/70 backdrop-blur-xl'}`}>
        <div className="flex items-center gap-4">
          <button onClick={handleEnd} className={`p-2 rounded-full ${theme === 'dark' ? 'hover:bg-white/10' : 'hover:bg-gray-100'}`}><ArrowLeft className="w-5 h-5" /></button>
          <div>
            <h1 className="font-black text-xl tracking-tight flex items-center gap-2">AI DOCTOR <Zap className="w-5 h-5 text-cyan-400" /></h1>
            <p className={`text-[10px] tracking-[0.2em] ${theme === 'dark' ? 'text-cyan-300' : 'text-cyan-600'}`}>SESSION #{sessionId?.slice(0, 8) || '...'}</p>
          </div>
        </div>
        <div className="relative">
          <button onClick={() => setShowLang(!showLang)} className={`px-3 py-2 rounded-lg flex items-center gap-2 ${theme === 'dark' ? 'bg-gray-800 hover:bg-gray-700' : 'bg-white border border-gray-200 hover:bg-gray-50'}`}>
            <Globe className="w-4 h-4" /> {LANGUAGES.find(l => l.code === language)?.flag}
          </button>
          {showLang && (
            <div className={`absolute right-0 top-full mt-2 rounded-xl border overflow-hidden z-30 ${theme === 'dark' ? 'bg-gray-900 border-white/10' : 'bg-white border-gray-200 shadow-lg'}`}>
              {LANGUAGES.map(l => (
                <button key={l.code} onClick={() => { setLanguage(l.code); setShowLang(false); setMessages([]); setTimeout(startNew, 100); }}
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
        {/* Video Panel */}
        <div className="lg:w-[400px] p-4 border-b lg:border-b-0 lg:border-r border-white/10 bg-gray-900/50">
          <ElevenLabsAgent language={language} />
        </div>

        {/* Chat */}
        <div className="flex-1 flex flex-col">
          <div className="flex-1 overflow-y-auto p-4 space-y-4">
            {messages.map((msg, i) => (
              <div key={i} className={`flex gap-3 ${msg.type === 'user' ? 'justify-end' : ''}`}>
                {msg.type === 'ai' && (
                  <div className="w-8 h-8 rounded-full bg-gradient-to-br from-cyan-500 to-blue-600 flex items-center justify-center">
                    <Bot className="w-4 h-4" />
                  </div>
                )}
                <div className={`max-w-[75%] rounded-2xl p-4 ${msg.type === 'user' ? 'bg-cyan-600' : 'bg-gray-800 border border-white/10'} ${msg.isEmergency ? 'border-red-500 bg-red-900/50' : ''}`}>
                  {msg.isEmergency && <p className="text-red-400 text-xs font-bold mb-2">⚠️ EMERGENCY</p>}
                  <p className="text-sm">{msg.content}</p>
                </div>
                {msg.type === 'user' && (
                  <div className="w-8 h-8 rounded-full bg-gray-700 flex items-center justify-center">
                    <User className="w-4 h-4" />
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
          <div className="p-4 border-t border-white/10 bg-gray-900/50">
            <div className="flex gap-3">
              <input value={input} onChange={e => setInput(e.target.value)} onKeyDown={e => e.key === 'Enter' && handleSend()}
                placeholder="Describe your symptoms..."
                className="flex-1 px-4 py-3 bg-black border border-white/10 rounded-xl text-white placeholder-gray-600 focus:border-cyan-500" />
              <button onClick={handleSend} disabled={loading || !input.trim()}
                className="px-5 py-3 bg-white text-black font-bold rounded-xl hover:bg-cyan-400 disabled:opacity-50">
                <Send className="w-5 h-5" />
              </button>
            </div>
            <div className="flex gap-2 mt-3">
              {['Headache', 'Fever', 'Cough', 'Stomach pain'].map(s => (
                <button key={s} onClick={() => setInput(prev => prev ? `${prev}, ${s}` : s)}
                  className="px-3 py-1 bg-gray-800 text-cyan-300 text-xs rounded-full hover:bg-cyan-500/20 hover:text-cyan-400">{s}</button>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

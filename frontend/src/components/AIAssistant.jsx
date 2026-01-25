import { useState, useEffect, useRef } from 'react';
import { Volume2, VolumeX, Phone, Video, Mic, MessageCircle } from 'lucide-react';

const LANGUAGES = {
  en: { name: 'English', greeting: 'Hello! I am Dr. Maya, your AI Health Assistant. How can I help you today?', flag: '🇬🇧' },
  hi: { name: 'हिंदी', greeting: 'नमस्ते! मैं डॉ. माया हूं, आपकी AI स्वास्थ्य सहायक। आज मैं आपकी कैसे मदद कर सकती हूं?', flag: '🇮🇳' },
  ta: { name: 'தமிழ்', greeting: 'வணக்கம்! நான் டாக்டர் மாயா, உங்கள் AI சுகாதார உதவியாளர். இன்று நான் உங்களுக்கு எப்படி உதவ முடியும்?', flag: '🇮🇳' },
  te: { name: 'తెలుగు', greeting: 'నమస్కారం! నేను డాక్టర్ మాయా, మీ AI ఆరోగ్య సహాయకుడిని. ఈరోజు నేను మీకు ఎలా సహాయం చేయగలను?', flag: '🇮🇳' },
};

// Doctor video file
const DOCTOR_VIDEO = "/doc.mp4";

export default function AIAssistant({ message, language = 'en', onSpeakEnd, autoSpeak = false }) {
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [muted, setMuted] = useState(false);
  const [showSubtitle, setShowSubtitle] = useState(false);
  const [currentSubtitle, setCurrentSubtitle] = useState('');
  const audioRef = useRef(null);
  const videoRef = useRef(null);

  // Auto-speak when message changes
  useEffect(() => {
    if (autoSpeak && message && !muted) {
      speak(message);
    }
  }, [message, autoSpeak]);

  // Update subtitle when message changes
  useEffect(() => {
    if (message) {
      setCurrentSubtitle(message);
    }
  }, [message]);

  const speak = async (text) => {
    if (muted || !text) return;
    setIsSpeaking(true);
    setShowSubtitle(true);
    setCurrentSubtitle(text);
    
    try {
      const token = localStorage.getItem('token');
      const response = await fetch('/api/v1/tts/synthesize', {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': token ? `Bearer ${token}` : ''
        },
        body: JSON.stringify({ text, language }),
      });
      
      if (response.ok) {
        const data = await response.json();
        if (data.audio_base64) {
          const audio = new Audio(`data:audio/mp3;base64,${data.audio_base64}`);
          audioRef.current = audio;
          
          audio.onended = () => { 
            setIsSpeaking(false);
            setTimeout(() => setShowSubtitle(false), 2000);
            onSpeakEnd?.(); 
          };
          audio.onerror = () => {
            setIsSpeaking(false);
            setShowSubtitle(false);
          };
          
          await audio.play();
        } else {
          setIsSpeaking(false);
        }
      } else {
        setIsSpeaking(false);
      }
    } catch (err) {
      console.error('TTS error:', err);
      setIsSpeaking(false);
    }
  };

  const stopSpeaking = () => {
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current = null;
    }
    setIsSpeaking(false);
    setShowSubtitle(false);
  };

  const toggleMute = () => {
    if (isSpeaking) stopSpeaking();
    setMuted(!muted);
  };

  return (
    <div className="relative">
      {/* Video Call Container */}
      <div className="bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 rounded-2xl shadow-2xl overflow-hidden border border-gray-700">
        
        {/* Header Bar */}
        <div className="bg-black/60 backdrop-blur px-4 py-2.5 flex items-center justify-between border-b border-white/10">
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2">
              <div className={`w-3 h-3 rounded-full ${isSpeaking ? 'bg-green-400 animate-pulse shadow-lg shadow-green-400/50' : 'bg-green-500'}`} />
              <span className="text-white font-medium">Dr. Maya</span>
            </div>
            <span className="text-gray-400 text-sm hidden sm:inline">• AI Health Consultant</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-2xl">{LANGUAGES[language]?.flag}</span>
            <span className="text-gray-300 text-sm hidden sm:inline">{LANGUAGES[language]?.name}</span>
          </div>
        </div>

        {/* Main Video Feed */}
        <div className="relative aspect-[4/3] bg-gray-900 overflow-hidden">
          
          {/* Doctor Video */}
          <div className="absolute inset-0">
            <video
              ref={videoRef}
              src={DOCTOR_VIDEO}
              className="absolute inset-0 w-full h-full object-cover"
              autoPlay
              loop
              muted
              playsInline
            />
            
            {/* Speaking glow effect */}
            {isSpeaking && (
              <div className="absolute inset-0 bg-gradient-to-t from-green-500/20 via-transparent to-blue-500/10 animate-pulse" />
            )}

            {/* Gradient overlays */}
            <div className="absolute inset-0 bg-gradient-to-t from-gray-900/80 via-transparent to-gray-900/30" />
          </div>

          {/* Speaking Indicators */}
          {isSpeaking && (
            <>
              {/* Pulsing border */}
              <div className="absolute inset-0 border-4 border-green-500/40 animate-pulse pointer-events-none" />
              
              {/* Live badge */}
              <div className="absolute top-4 right-4 flex items-center gap-2 bg-red-600 px-3 py-1.5 rounded-lg shadow-lg animate-pulse">
                <div className="w-2 h-2 bg-white rounded-full" />
                <span className="text-white text-xs font-bold">SPEAKING</span>
              </div>

              {/* Audio wave visualizer */}
              <div className="absolute bottom-24 left-1/2 -translate-x-1/2 flex items-end gap-1 bg-black/60 backdrop-blur-sm px-4 py-2 rounded-full">
                {[...Array(7)].map((_, i) => (
                  <div
                    key={i}
                    className="w-1.5 bg-gradient-to-t from-green-500 to-green-300 rounded-full animate-pulse"
                    style={{
                      height: `${12 + Math.sin(Date.now() / 100 + i) * 12}px`,
                      animationDelay: `${i * 0.1}s`
                    }}
                  />
                ))}
              </div>
            </>
          )}
        </div>

        {/* Control Bar */}
        <div className="bg-black/80 backdrop-blur px-4 py-3 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <button
              onClick={toggleMute}
              className={`p-3 rounded-full transition-all ${muted ? 'bg-red-500 hover:bg-red-600' : 'bg-gray-700 hover:bg-gray-600'} text-white`}
              title={muted ? 'Unmute' : 'Mute'}
            >
              {muted ? <VolumeX className="w-5 h-5" /> : <Volume2 className="w-5 h-5" />}
            </button>
            <button className="p-3 rounded-full bg-gray-700 hover:bg-gray-600 text-white transition-all" title="Microphone">
              <Mic className="w-5 h-5" />
            </button>
            <button className="p-3 rounded-full bg-gray-700 hover:bg-gray-600 text-white transition-all" title="Video">
              <Video className="w-5 h-5" />
            </button>
          </div>

          <div className="flex items-center gap-2">
            {isSpeaking ? (
              <button
                onClick={stopSpeaking}
                className="px-5 py-2.5 bg-red-500 hover:bg-red-600 text-white rounded-full text-sm font-semibold transition-all flex items-center gap-2 shadow-lg"
              >
                <div className="w-2 h-2 bg-white rounded-full animate-pulse" />
                Stop
              </button>
            ) : message && !muted ? (
              <button
                onClick={() => speak(message)}
                className="px-5 py-2.5 bg-gradient-to-r from-green-500 to-emerald-500 hover:from-green-600 hover:to-emerald-600 text-white rounded-full text-sm font-semibold transition-all flex items-center gap-2 shadow-lg shadow-green-500/30"
              >
                <Volume2 className="w-4 h-4" />
                Talk to Doctor
              </button>
            ) : null}
          </div>

          <button 
            className="p-3 rounded-full bg-red-500 hover:bg-red-600 text-white transition-all"
            title="End Call"
          >
            <Phone className="w-5 h-5 rotate-[135deg]" />
          </button>
        </div>
      </div>
    </div>
  );
}

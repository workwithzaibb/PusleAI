import { useState, useRef, useEffect, Component } from 'react';
import { Mic, MicOff, Phone, PhoneOff, Volume2, VolumeX, Video, VideoOff, Camera, AlertCircle, MessageCircle, Smile, Frown, Meh, Heart, Angry, AlertTriangle, RefreshCw, Send } from 'lucide-react';
import * as faceapi from 'face-api.js';
import { startConsultation, sendMessage as sendApiMessage } from '../api';

// ============================================================================
// GROQ CONFIGURATION  
// ============================================================================
const API_URL = import.meta.env.VITE_API_URL 
  || 'https://pulseai-production.up.railway.app/api/v1';

const GROQ_TTS_URL = `${API_URL}/groq/tts`;
const GROQ_STT_URL = `${API_URL}/groq/stt`;
const GROQ_STATUS_URL = `${API_URL}/groq/status`;

// Debug mode
const DEBUG_MODE = true;

if (DEBUG_MODE) {
  console.log('🔧 Groq Agent Config:', {
    apiUrl: API_URL,
    ttsUrl: GROQ_TTS_URL,
    sttUrl: GROQ_STT_URL,
  });
}

// Doctor video file
const DOCTOR_VIDEO = "/dr.mp4";

// Mood emoji and color mapping
const MOOD_CONFIG = {
  happy: { emoji: '😊', icon: Smile, color: 'text-yellow-400', bg: 'bg-yellow-500/20', label: 'Happy' },
  sad: { emoji: '😢', icon: Frown, color: 'text-blue-400', bg: 'bg-blue-500/20', label: 'Sad' },
  angry: { emoji: '😠', icon: Angry, color: 'text-red-400', bg: 'bg-red-500/20', label: 'Angry' },
  fearful: { emoji: '😨', icon: AlertTriangle, color: 'text-purple-400', bg: 'bg-purple-500/20', label: 'Anxious' },
  disgusted: { emoji: '🤢', icon: Meh, color: 'text-green-400', bg: 'bg-green-500/20', label: 'Disgusted' },
  surprised: { emoji: '😲', icon: Heart, color: 'text-pink-400', bg: 'bg-pink-500/20', label: 'Surprised' },
  neutral: { emoji: '😐', icon: Meh, color: 'text-slate-300', bg: 'bg-slate-500/20', label: 'Neutral' },
};

// Error Boundary to prevent blank page on crash
class ErrorBoundary extends Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }
  
  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }
  
  componentDidCatch(error, errorInfo) {
    console.error('GroqAgent Error:', error, errorInfo);
  }
  
  render() {
    if (this.state.hasError) {
      return (
        <div className="bg-gray-900 border border-red-500/30 rounded-2xl p-6 text-center min-h-[400px] flex flex-col items-center justify-center">
          <AlertCircle className="w-12 h-12 text-red-400 mx-auto mb-3" />
          <h3 className="font-semibold text-red-400 mb-2">Video Call Unavailable</h3>
          <p className="text-cyan-300 text-sm mb-4 max-w-xs">
            {this.state.error?.message || 'The video call feature encountered an error. You can still use the text chat below.'}
          </p>
          <button 
            onClick={() => {
              this.setState({ hasError: false, error: null });
              window.location.reload();
            }}
            className="px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors"
          >
            Reload & Try Again
          </button>
          <p className="text-cyan-400 text-xs mt-4">
            Use the text chat on the right to continue your consultation
          </p>
        </div>
      );
    }
    return this.props.children;
  }
}

function GroqAgentInner({ language = 'en' }) {
  const [isConnected, setIsConnected] = useState(false);
  const [isConnecting, setIsConnecting] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const [muted, setMuted] = useState(false);
  const [cameraOn, setCameraOn] = useState(false);
  const [cameraReady, setCameraReady] = useState(false);
  const [showCameraPreview, setShowCameraPreview] = useState(false);
  const [error, setError] = useState(null);
  const [transcript, setTranscript] = useState('');
  const [callDuration, setCallDuration] = useState(0);
  const [connectionStatus, setConnectionStatus] = useState('disconnected');
  const [userSpeaking, setUserSpeaking] = useState(false);
  const [audioLevel, setAudioLevel] = useState(0);
  
  // Conversation state for user input and history
  const [userInput, setUserInput] = useState("");
  const [conversationHistory, setConversationHistory] = useState([]);
  const [sessionId, setSessionId] = useState(null);
  const [isProcessing, setIsProcessing] = useState(false);
  
  // Mood detection states
  const [modelsLoaded, setModelsLoaded] = useState(false);
  const [currentMood, setCurrentMood] = useState('neutral');
  const [moodConfidence, setMoodConfidence] = useState(0);
  const [moodHistory, setMoodHistory] = useState([]);
  const [faceDetected, setFaceDetected] = useState(false);
  
  const videoRef = useRef(null);
  const userVideoRef = useRef(null);
  const previewVideoRef = useRef(null);
  const userStreamRef = useRef(null);
  const callTimerRef = useRef(null);
  const audioContextRef = useRef(null);
  const analyserRef = useRef(null);
  const audioMonitorRef = useRef(null);
  const moodDetectionRef = useRef(null);

  // Load face-api.js models on component mount (optional - for mood detection)
  useEffect(() => {
    const loadModels = async () => {
      try {
        if (!faceapi || !faceapi.nets) {
          console.warn('⚠️ face-api.js not available, mood detection disabled');
          return;
        }
        
        console.log('🧠 Loading face detection models...');
        await Promise.all([
          faceapi.nets.tinyFaceDetector.loadFromUri('/models'),
          faceapi.nets.faceExpressionNet.loadFromUri('/models'),
        ]);
        setModelsLoaded(true);
        console.log('✅ Face detection models loaded!');
      } catch (err) {
        console.warn('⚠️ Face detection models not loaded (optional feature):', err.message);
        setModelsLoaded(false);
      }
    };
    
    const timer = setTimeout(loadModels, 1000);
    return () => {
      clearTimeout(timer);
      if (moodDetectionRef.current) {
        cancelAnimationFrame(moodDetectionRef.current);
      }
    };
  }, []);

  // Map language codes to language settings
  const getLanguageConfig = (lang) => {
    const languageMap = {
      'hi': { language: 'hi', firstMessage: 'नमस्ते! मैं डॉ. माया हूं। आज मैं आपकी कैसे मदद कर सकती हूं?' },
      'mr': { language: 'mr', firstMessage: 'नमस्कार! मी डॉ. माया आहे. आज मी तुम्हाला कशी मदत करू शकते?' },
      'en': { language: 'en', firstMessage: 'Hello! I am Dr. Maya, your AI health consultant. How can I help you today?' },
      'ta': { language: 'ta', firstMessage: 'வணக்கம்! நான் டாக்டர் மாயா. இன்று நான் உங்களுக்கு எப்படி உதவ முடியும்?' },
      'te': { language: 'te', firstMessage: 'నమస్కారం! నేను డాక్టర్ మాయా. నేను ఈ రోజు మీకు ఎలా సహాయం చేయగలను?' },
    };
    return languageMap[lang] || languageMap['en'];
  };

  // Get language display name
  const getLanguageName = (lang) => {
    const names = {
      'hi': 'हिंदी (Hindi)',
      'mr': 'मराठी (Marathi)',
      'en': 'English',
      'ta': 'தமிழ் (Tamil)',
      'te': 'తెలుగు (Telugu)',
    };
    return names[lang] || 'English';
  };

  // Format call duration
  const formatDuration = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  // Effect to attach camera stream to video element when both are available
  useEffect(() => {
    if (cameraOn && userStreamRef.current && userVideoRef.current) {
      console.log('📹 Attaching user camera stream to video element');
      userVideoRef.current.srcObject = userStreamRef.current;
      
      if (modelsLoaded) {
        setTimeout(() => {
          startMoodDetection();
        }, 500);
      }
    }
    
    return () => {
      if (!cameraOn) {
        stopMoodDetection();
      }
    };
  }, [cameraOn, isConnected, modelsLoaded]);

  // Start monitoring audio levels to detect when user is speaking
  const startAudioMonitoring = (stream) => {
    try {
      const AudioContext = window.AudioContext || window.webkitAudioContext;
      audioContextRef.current = new AudioContext();
      analyserRef.current = audioContextRef.current.createAnalyser();
      analyserRef.current.fftSize = 256;
      analyserRef.current.smoothingTimeConstant = 0.8;
      
      const source = audioContextRef.current.createMediaStreamSource(stream);
      source.connect(analyserRef.current);
      
      const bufferLength = analyserRef.current.frequencyBinCount;
      const dataArray = new Uint8Array(bufferLength);
      
      let speakingTimeout = null;
      
      const checkAudioLevel = () => {
        if (!analyserRef.current) return;
        
        analyserRef.current.getByteFrequencyData(dataArray);
        const average = dataArray.reduce((a, b) => a + b, 0) / bufferLength;
        const normalizedLevel = Math.min(average / 128, 1);
        
        setAudioLevel(normalizedLevel);
        
        const isSpeaking = normalizedLevel > 0.1;
        
        if (isSpeaking) {
          setUserSpeaking(true);
          if (speakingTimeout) {
            clearTimeout(speakingTimeout);
          }
          speakingTimeout = setTimeout(() => {
            setUserSpeaking(false);
          }, 500);
        }
        
        audioMonitorRef.current = requestAnimationFrame(checkAudioLevel);
      };
      
      checkAudioLevel();
      console.log('🎤 Audio monitoring started');
    } catch (err) {
      console.warn('Could not start audio monitoring:', err);
    }
  };

  // Stop audio monitoring
  const stopAudioMonitoring = () => {
    if (audioMonitorRef.current) {
      cancelAnimationFrame(audioMonitorRef.current);
      audioMonitorRef.current = null;
    }
    if (audioContextRef.current) {
      audioContextRef.current.close().catch(() => {});
      audioContextRef.current = null;
    }
    analyserRef.current = null;
    setAudioLevel(0);
    setUserSpeaking(false);
  };

  // ============ SPEECH SYNTHESIS (Text-to-Speech) ============
  // Try Groq TTS first, fall back to browser SpeechSynthesis
  const speakText = async (text, onComplete) => {
    // Try Groq TTS via backend
    try {
      console.log('🔊 Attempting Groq TTS...');
      const response = await fetch(GROQ_TTS_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          text: text,
          voice: 'Celeste-PlayAI',
          response_format: 'mp3',
          speed: 1.0,
          language: getLanguageConfig(language).language
        })
      });

      if (response.ok) {
        const audioBlob = await response.blob();
        const audioUrl = URL.createObjectURL(audioBlob);
        const audio = new Audio(audioUrl);
        
        setIsSpeaking(true);
        audio.onended = () => {
          setIsSpeaking(false);
          URL.revokeObjectURL(audioUrl);
          onComplete?.();
        };
        audio.onerror = (e) => {
          console.error('Groq TTS audio playback error:', e);
          setIsSpeaking(false);
          URL.revokeObjectURL(audioUrl);
          // Fall back to browser TTS
          speakTextBrowser(text, onComplete);
        };
        
        await audio.play();
        return;
      } else {
        console.warn('Groq TTS returned non-OK, falling back to browser TTS');
      }
    } catch (err) {
      console.warn('Groq TTS unavailable, using browser TTS:', err.message);
    }

    // Fallback: browser SpeechSynthesis
    speakTextBrowser(text, onComplete);
  };

  // Browser-native SpeechSynthesis fallback
  const speakTextBrowser = async (text, onComplete) => {
    if (!('speechSynthesis' in window)) {
      console.warn('Speech synthesis not supported');
      onComplete?.();
      return;
    }
    
    speechSynthesis.cancel();
    
    const getVoices = () => {
      return new Promise((resolve) => {
        let voices = speechSynthesis.getVoices();
        if (voices.length > 0) {
          resolve(voices);
        } else {
          speechSynthesis.onvoiceschanged = () => {
            voices = speechSynthesis.getVoices();
            resolve(voices);
          };
        }
      });
    };
    
    const voices = await getVoices();
    const utterance = new SpeechSynthesisUtterance(text);
    const langConfig = getLanguageConfig(language);
    const isIndicLanguage = ['hi', 'mr'].includes(langConfig.language);
    
    utterance.lang = langConfig.language === 'mr' ? 'mr-IN' : (langConfig.language === 'hi' ? 'hi-IN' : 'en-IN');
    
    let selectedVoice = null;
    
    if (isIndicLanguage) {
      selectedVoice = voices.find(v => 
        (v.lang.includes('hi') || v.lang.includes('mr')) && (v.name.toLowerCase().includes('female') || !v.name.includes('Hemant'))
      ) || voices.find(v => v.lang.includes('hi') || v.lang.includes('mr'));
    }
    
    if (!selectedVoice) {
      selectedVoice = voices.find(v => 
        v.lang.includes('en-IN') && (v.name.toLowerCase().includes('female') || v.name.includes('Heera') || v.name.includes('Priya'))
      ) || voices.find(v => 
        v.name.includes('Zira') || v.name.includes('Samantha') || v.name.includes('Google UK English Female') ||
        v.name.toLowerCase().includes('female') || v.name.includes('Heera')
      ) || voices.find(v => v.lang.includes('en'));
    }
    
    if (selectedVoice) {
      utterance.voice = selectedVoice;
    }
    
    utterance.rate = 0.9;
    utterance.pitch = 1.2;
    utterance.volume = 1.0;
    
    setIsSpeaking(true);
    utterance.onend = () => {
      setIsSpeaking(false);
      onComplete?.();
    };
    utterance.onerror = (e) => {
      console.error('Speech synthesis error:', e);
      setIsSpeaking(false);
      onComplete?.();
    };
    
    speechSynthesis.speak(utterance);
  };

  // ============ MULTILINGUAL SPEECH RECOGNITION (VIA GROQ STT) ============
  const mediaRecorderRef = useRef(null);
  const audioChunksRef = useRef([]);

  const startSpeechRecognition = () => {
    if (!userStreamRef.current) {
      console.warn('Cannot start recognition: No audio stream');
      return;
    }

    try {
      if (mediaRecorderRef.current && mediaRecorderRef.current.state === 'recording') {
        return; // Already recording
      }

      audioChunksRef.current = [];
      
      // Let the browser automatically pick the best supported format
      const mediaRecorder = new MediaRecorder(userStreamRef.current);

      mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          audioChunksRef.current.push(event.data);
        }
      };

      mediaRecorder.onstop = async () => {
        setIsListening(false);
        // Use browser's chosen mimeType if available
        const audioMimeType = mediaRecorder.mimeType || 'audio/wav'; 
        const audioBlob = new Blob(audioChunksRef.current, { type: audioMimeType });
        
        if (audioBlob.size < 1000) {
          // Too small, probably just noise
          if (isConnected && !isSpeaking && !isProcessing) {
             startSpeechRecognition();
          }
          return;
        }

        console.log('🎤 Sending audio to Groq Whisper STT...');
        setIsProcessing(true);
        
        const formData = new FormData();
        const extension = audioMimeType.includes('mp4') ? 'mp4' : (audioMimeType.includes('ogg') ? 'ogg' : 'webm');
        formData.append('file', audioBlob, `recording.${extension}`);
        formData.append('language', getLanguageConfig(language).language);
        
        try {
          const response = await fetch(GROQ_STT_URL, {
            method: 'POST',
            body: formData
          });
          
          if (response.ok) {
            const data = await response.json();
            const text = data.text?.trim();
            
            if (text) {
              console.log('📤 Transcribed:', text);
              setUserInput(text);
              handleUserMessage(text);
              return; // handleUserMessage handles restarting if needed
            }
          } else {
            console.error('Groq STT returned non-OK', await response.text());
          }
        } catch (err) {
          console.error('Error calling Groq STT:', err);
        }

        setIsProcessing(false);
        if (isConnected && !isSpeaking) {
          startSpeechRecognition();
        }
      };

      mediaRecorderRef.current = mediaRecorder;
      mediaRecorder.start();
      console.log('🎤 Groq STT Recording started');
      setIsListening(true);
      
      // Auto-stop after 10 seconds to prevent endless recording
      setTimeout(() => {
        if (mediaRecorderRef.current && mediaRecorderRef.current.state === 'recording') {
          stopSpeechRecognition();
        }
      }, 10000);

    } catch (e) {
      console.error('Failed to start MediaRecorder:', e);
      setError(`Audio recording failed: ${e.message || e.name || 'Unknown hardware error'}. Ensure microphone is unmuted and refresh.`);
    }
  };
  
  const stopSpeechRecognition = () => {
    if (mediaRecorderRef.current && mediaRecorderRef.current.state === 'recording') {
      try {
        mediaRecorderRef.current.stop();
      } catch (e) {
        console.error('Error stopping recorder', e);
      }
    } else {
      setIsListening(false);
    }
  };

  // Modify audio level monitor to handle auto start/stop
  let silenceStartTimer = useRef(null);
  
  // NOTE: This effect replaces the recognition start/stop logic based on VAD
  useEffect(() => {
    if (!isConnected || isSpeaking || isProcessing) {
      stopSpeechRecognition();
      return;
    }

    if (userSpeaking && !isListening) {
      // User started speaking, start recording
      if (silenceStartTimer.current) clearTimeout(silenceStartTimer.current);
      startSpeechRecognition();
    } else if (!userSpeaking && isListening) {
      // User stopped speaking, wait 1.5s then stop recording
      if (!silenceStartTimer.current) {
        silenceStartTimer.current = setTimeout(() => {
          stopSpeechRecognition();
          silenceStartTimer.current = null;
        }, 1500);
      }
    } else if (userSpeaking && isListening) {
      // User is speaking while we are listening, reset silence timer
      if (silenceStartTimer.current) {
        clearTimeout(silenceStartTimer.current);
        silenceStartTimer.current = null;
      }
    }
  }, [userSpeaking, isConnected, isSpeaking, isProcessing, isListening]);

  // ============ HANDLE USER MESSAGE ============
  const handleUserMessage = async (text) => {
    if (!text.trim() || isProcessing || isSpeaking) return;
    
    console.log('💬 Processing user message:', text);
    setIsProcessing(true);
    // Removed as auto validation handles restarting
    
    setConversationHistory(prev => [...prev, { role: 'user', message: text }]);
    setTranscript(text);
    
    try {
      const response = await sendApiMessage(sessionId, text, language);
      const aiMessage = response.data?.message || response.data?.response || "I understand. How can I help you further?";
      
      console.log('🤖 AI Response:', aiMessage);
      
      setConversationHistory(prev => [...prev, { role: 'agent', message: aiMessage }]);
      setTranscript(aiMessage);
      
      await new Promise(resolve => {
        speakText(aiMessage, resolve);
      });
      
    } catch (err) {
      console.error('Error getting AI response:', err);
      const errorMsg = language === 'hi' 
        ? "माफ़ कीजिए, मुझे आपकी बात समझने में कुछ परेशानी हुई। कृपया फिर से बताएं।"
        : "I'm sorry, I had trouble understanding. Could you please repeat that?";
      
      setConversationHistory(prev => [...prev, { role: 'agent', message: errorMsg }]);
      setTranscript(errorMsg);
      
      await new Promise(resolve => {
        speakText(errorMsg, resolve);
      });
    }
    
    setIsProcessing(false);
    setUserInput('');
    // handled by auto validation effect
  };

  // Start mood detection from video feed
  const startMoodDetection = () => {
    if (!modelsLoaded || !userVideoRef.current) {
      console.warn('Cannot start mood detection - models not loaded or video not ready');
      return;
    }
    
    console.log('😊 Starting mood detection...');
    let frameCount = 0;
    
    const detectMood = async () => {
      if (!userVideoRef.current || !cameraOn) {
        moodDetectionRef.current = requestAnimationFrame(detectMood);
        return;
      }
      
      frameCount++;
      if (frameCount % 10 !== 0) {
        moodDetectionRef.current = requestAnimationFrame(detectMood);
        return;
      }
      
      try {
        const detections = await faceapi
          .detectSingleFace(userVideoRef.current, new faceapi.TinyFaceDetectorOptions())
          .withFaceExpressions();
        
        if (detections) {
          setFaceDetected(true);
          const expressions = detections.expressions;
          
          let maxExpression = 'neutral';
          let maxConfidence = 0;
          
          Object.entries(expressions).forEach(([expression, confidence]) => {
            if (confidence > maxConfidence) {
              maxConfidence = confidence;
              maxExpression = expression;
            }
          });
          
          setCurrentMood(maxExpression);
          setMoodConfidence(maxConfidence);
          
          setMoodHistory(prev => {
            const newHistory = [...prev, { mood: maxExpression, confidence: maxConfidence, timestamp: Date.now() }];
            return newHistory.slice(-30);
          });
        } else {
          setFaceDetected(false);
        }
      } catch (err) {
        // Silently handle detection errors
      }
      
      moodDetectionRef.current = requestAnimationFrame(detectMood);
    };
    
    detectMood();
  };

  // Stop mood detection
  const stopMoodDetection = () => {
    if (moodDetectionRef.current) {
      cancelAnimationFrame(moodDetectionRef.current);
      moodDetectionRef.current = null;
    }
    setCurrentMood('neutral');
    setMoodConfidence(0);
    setFaceDetected(false);
  };

  // Request camera and microphone permissions
  const requestCameraAccess = async () => {
    setError(null);
    console.log('📷 Requesting camera and microphone access...');
    
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ 
        video: { 
          width: { ideal: 1280 },
          height: { ideal: 720 },
          facingMode: 'user'
        },
        audio: true
      });
      
      userStreamRef.current = stream;
      setCameraOn(true);
      setCameraReady(true);
      setShowCameraPreview(true);
      
      startAudioMonitoring(stream);
      
      setTimeout(() => {
        if (previewVideoRef.current) {
          previewVideoRef.current.srcObject = stream;
        }
      }, 100);
      
      console.log('✅ Camera and microphone access granted!');
      return true;
    } catch (err) {
      console.error('❌ Permission denied:', err);
      if (err.name === 'NotAllowedError') {
        setError('Camera/Microphone access denied. Please click the camera icon in your browser address bar to allow access.');
      } else if (err.name === 'NotFoundError') {
        setError('No camera or microphone found. Please connect a camera and try again.');
      } else {
        setError(`Could not access camera: ${err.message}`);
      }
      setCameraOn(false);
      setCameraReady(false);
      return false;
    }
  };

  // Cancel camera preview
  const cancelCameraPreview = () => {
    if (userStreamRef.current) {
      userStreamRef.current.getTracks().forEach(track => track.stop());
      userStreamRef.current = null;
    }
    setShowCameraPreview(false);
    setCameraReady(false);
    setCameraOn(false);
  };
  // Start conversation
  const startConversation = async () => {
    setIsConnecting(true);
    setError(null);
    setConnectionStatus('connecting');
    
    // Request microphone permission
    try {
      console.log('🎤 Requesting microphone access...');
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      stream.getTracks().forEach(track => track.stop());
      console.log('✅ Microphone access granted');
    } catch (err) {
      console.error('❌ Microphone access denied:', err);
      setError('Microphone access is required. Please allow microphone access and try again.');
      setIsConnecting(false);
      setConnectionStatus('disconnected');
      return;
    }
    
    // Request camera access (optional)
    if (!userStreamRef.current) {
      console.log('📷 Requesting camera access...');
      const hasAccess = await requestCameraAccess();
      if (!hasAccess) {
        console.log('Continuing without camera...');
      }
    }
    
    // Set up user video element
    if (userStreamRef.current && userVideoRef.current) {
      userVideoRef.current.srcObject = userStreamRef.current;
    }
    
    const langConfig = getLanguageConfig(language);
    
    // Start backend consultation session
    try {
      console.log('🏥 Starting consultation session...');
      const consultationResponse = await startConsultation(language);
      const newSessionId = consultationResponse.data?.session_id;
      
      if (newSessionId) {
        setSessionId(newSessionId);
        console.log('✅ Consultation session started:', newSessionId);
      }
    } catch (err) {
      console.warn('Could not start backend session, continuing with local mode:', err);
    }
    
    // Initialize conversation
    console.log('🎬 Starting AI Conversation (Groq-powered)');
    setIsConnected(true);
    setIsConnecting(false);
    setConnectionStatus('connected');
    setTranscript(langConfig.firstMessage);
    setShowCameraPreview(false);
    callTimerRef.current = setInterval(() => setCallDuration(prev => prev + 1), 1000);
    setConversationHistory([{ role: 'agent', message: langConfig.firstMessage }]);
    
    // Speak the greeting
    await speakText(langConfig.firstMessage);
  };

  // Send user message (for text input)
  const sendUserMessage = async () => {
    if (!userInput.trim() || isProcessing) return;
    handleUserMessage(userInput.trim());
  };

  // End conversation
  const endConversation = async () => {
    stopAudioMonitoring();
    stopMoodDetection();
    stopSpeechRecognition();
    
    if ('speechSynthesis' in window) {
      speechSynthesis.cancel();
    }
    
    if (userStreamRef.current) {
      userStreamRef.current.getTracks().forEach(track => track.stop());
      userStreamRef.current = null;
    }
    
    if (callTimerRef.current) {
      clearInterval(callTimerRef.current);
      callTimerRef.current = null;
    }
    
    setIsConnected(false);
    setIsSpeaking(false);
    setIsListening(false);
    setUserSpeaking(false);
    setAudioLevel(0);
    setTranscript('');
    setCallDuration(0);
    setCameraOn(false);
    setCameraReady(false);
    setShowCameraPreview(false);
  };

  // Toggle camera
  const toggleCamera = () => {
    if (userStreamRef.current) {
      const videoTrack = userStreamRef.current.getVideoTracks()[0];
      if (videoTrack) {
        videoTrack.enabled = !videoTrack.enabled;
        setCameraOn(videoTrack.enabled);
      }
    }
  };

  // Toggle mute
  const toggleMute = () => {
    if (userStreamRef.current) {
      const audioTrack = userStreamRef.current.getAudioTracks()[0];
      if (audioTrack) {
        audioTrack.enabled = !audioTrack.enabled;
        setMuted(!audioTrack.enabled);
      }
    }
  };

  // Play doctor video when connected
  useEffect(() => {
    if (videoRef.current && isConnected) {
      videoRef.current.play().catch(() => {});
    }
  }, [isConnected]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (mediaRecorderRef.current && mediaRecorderRef.current.state === 'recording') {
        mediaRecorderRef.current.stop();
      }
      if ('speechSynthesis' in window) {
        speechSynthesis.cancel();
      }
      if (userStreamRef.current) {
        userStreamRef.current.getTracks().forEach(track => track.stop());
      }
      if (callTimerRef.current) {
        clearInterval(callTimerRef.current);
      }
    };
  }, []);

  // ============ RENDER ============

  // Camera Preview Screen (after allowing camera)
  if (showCameraPreview && cameraReady && !isConnected && !isConnecting) {
    return (
      <div className="relative w-full h-full min-h-[500px] bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 rounded-2xl overflow-hidden flex items-center justify-center p-6">
        <div className="w-full max-w-md">
          {/* Camera Preview Window */}
          <div className="relative rounded-2xl overflow-hidden shadow-2xl mb-6 bg-black aspect-video">
            <video
              ref={previewVideoRef}
              autoPlay
              playsInline
              muted
              className="w-full h-full object-cover"
              style={{ transform: 'scaleX(-1)' }}
            />
            <div className="absolute top-3 left-3 flex items-center gap-2 bg-green-500/90 px-3 py-1.5 rounded-full">
              <div className="w-2 h-2 bg-white rounded-full animate-pulse" />
              <span className="text-white text-xs font-medium">Camera Ready</span>
            </div>
            <div className="absolute bottom-3 left-3 right-3 text-center">
              <span className="text-white text-sm bg-black/60 px-3 py-1 rounded-full">
                You look great! Ready to connect with Dr. Maya
              </span>
            </div>
          </div>
          
          {/* Doctor Info */}
          <div className="text-center mb-4">
            <h2 className="text-xl font-bold text-white mb-1">
              {language === 'hi' ? 'डॉ. माया से बात करें' : 'Connect with Dr. Maya'}
            </h2>
            <p className="text-cyan-300 text-sm">
              AI Health Consultant • 🌐 {getLanguageName(language)}
            </p>
            <p className="text-green-400 text-xs mt-1">
              ⚡ Powered by Groq AI
            </p>
          </div>
          
          {/* Start Call Button */}
          <button
            onClick={startConversation}
            className="w-full px-8 py-4 bg-gradient-to-r from-green-500 to-emerald-500 hover:from-green-600 hover:to-emerald-600 text-white rounded-full text-lg font-semibold transition-all flex items-center justify-center gap-3 shadow-lg shadow-green-500/30 hover:scale-105 active:scale-95"
          >
            <Phone className="w-6 h-6" />
            {language === 'hi' ? 'कॉल शुरू करें' : 'Start Call'}
          </button>
          
          {/* Cancel Button */}
          <button
            onClick={cancelCameraPreview}
            className="w-full mt-3 px-4 py-2 text-cyan-300 hover:text-white transition-colors text-sm"
          >
            Cancel
          </button>
        </div>
      </div>
    );
  }

  // Connecting Screen
  if (isConnecting) {
    return (
      <div className="relative w-full h-full min-h-[500px] bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 rounded-2xl overflow-hidden flex items-center justify-center">
        <div className="text-center">
          <div className="w-20 h-20 border-4 border-white/30 border-t-green-400 rounded-full animate-spin mx-auto mb-6"></div>
          <h2 className="text-xl font-bold text-white mb-2">
            {language === 'hi' ? 'डॉ. माया से जुड़ रहे हैं...' : 'Connecting to Dr. Maya...'}
          </h2>
          <p className="text-cyan-300 text-sm mb-2">Please wait...</p>
          <p className="text-green-400 text-xs">⚡ Groq AI • Status: {connectionStatus}</p>
        </div>
      </div>
    );
  }

  // Connected - Video Call UI
  if (isConnected) {
    return (
      <div className="relative w-full h-full min-h-[500px] bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 rounded-2xl overflow-hidden">
        {/* Doctor Video Background */}
        <video
          ref={videoRef}
          src={DOCTOR_VIDEO}
          className="absolute inset-0 w-full h-full object-cover"
          loop
          muted
          playsInline
          autoPlay
        />
        
        {/* Speaking/Listening Overlay Effects */}
        {isSpeaking && !userSpeaking && (
          <div className="absolute inset-0 bg-gradient-to-t from-green-500/20 via-transparent to-transparent animate-pulse pointer-events-none" />
        )}
        {isListening && (
          <div className="absolute inset-0 bg-gradient-to-t from-blue-500/10 via-transparent to-transparent pointer-events-none" />
        )}

        {/* User's Video - Picture in Picture */}
        <div className={`absolute top-4 right-4 w-36 h-48 rounded-2xl overflow-hidden shadow-2xl border-2 ${userSpeaking ? 'border-green-400 ring-2 ring-green-400/50' : 'border-white/40'} bg-gray-900 transition-all duration-200`}>
          <video
            ref={userVideoRef}
            autoPlay
            playsInline
            muted
            className={`w-full h-full object-cover ${cameraOn ? 'block' : 'hidden'}`}
            style={{ transform: 'scaleX(-1)' }}
          />
          {!cameraOn && (
            <div className="w-full h-full flex flex-col items-center justify-center bg-gray-800">
              <VideoOff className="w-10 h-10 text-cyan-400 mb-2" />
              <span className="text-cyan-300 text-xs">Camera Off</span>
            </div>
          )}
          
          {/* Audio level indicator */}
          {userSpeaking && (
            <div className="absolute inset-0 border-2 border-green-400 rounded-2xl animate-pulse pointer-events-none" />
          )}
          
          {/* Speaking indicator */}
          <div className="absolute top-2 left-2 flex items-center gap-1.5">
            <div className={`w-3 h-3 rounded-full ${userSpeaking ? 'bg-green-400 animate-pulse' : cameraOn ? 'bg-green-500' : 'bg-red-500'}`} />
            {userSpeaking && (
              <span className="text-xs text-green-400 font-medium bg-black/70 px-1.5 py-0.5 rounded">Speaking</span>
            )}
          </div>
          
          {/* Mood indicator */}
          {cameraOn && faceDetected && MOOD_CONFIG[currentMood] && (
            <div className="absolute top-2 right-2">
              <div className={`flex items-center gap-1 px-2 py-1 rounded-full ${MOOD_CONFIG[currentMood].bg} backdrop-blur-sm`}>
                <span className="text-lg">{MOOD_CONFIG[currentMood].emoji}</span>
                <span className={`text-xs font-medium ${MOOD_CONFIG[currentMood].color}`}>
                  {MOOD_CONFIG[currentMood].label}
                </span>
              </div>
            </div>
          )}
          
          {/* Audio level bar */}
          {cameraOn && (
            <div className="absolute bottom-8 left-2 right-2 h-1 bg-gray-700 rounded-full overflow-hidden">
              <div 
                className="h-full bg-green-400 transition-all duration-75"
                style={{ width: `${audioLevel * 100}%` }}
              />
            </div>
          )}
          
          <div className="absolute bottom-2 left-0 right-0 text-center">
            <span className="text-white text-xs font-medium bg-black/70 px-3 py-1 rounded-full">You</span>
          </div>
        </div>

        {/* Top Status Bar */}
        <div className="absolute top-0 left-0 right-0 bg-gradient-to-b from-black/70 to-transparent px-4 py-3 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className={`w-2.5 h-2.5 rounded-full ${isSpeaking ? 'bg-green-400 animate-pulse' : 'bg-green-500'}`} />
            <span className="text-white font-medium">Dr. Maya</span>
            <span className="text-cyan-300 text-xs">
              {isSpeaking ? '• Speaking' : isListening ? '• Listening' : isProcessing ? '• Thinking...' : '• Ready'}
            </span>
            <span className="text-green-400/60 text-xs ml-1">⚡ Groq</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-white font-mono text-sm bg-black/40 px-2 py-1 rounded">
              {formatDuration(callDuration)}
            </span>
            <span className="px-2 py-1 bg-red-500/80 text-white text-xs font-bold rounded-full animate-pulse">● LIVE</span>
          </div>
        </div>

        {/* Status Badge */}
        <div className={`absolute top-16 left-4 flex items-center gap-2 ${isSpeaking ? 'bg-green-600' : isListening ? 'bg-blue-600' : isProcessing ? 'bg-yellow-600' : 'bg-gray-600'} px-3 py-1.5 rounded-lg shadow-lg`}>
          <div className="w-2 h-2 bg-white rounded-full animate-pulse" />
          <span className="text-white text-xs font-bold">
            {isSpeaking ? 'DR. MAYA SPEAKING' : isListening ? 'LISTENING TO YOU' : isProcessing ? 'PROCESSING...' : 'READY'}
          </span>
        </div>

        {/* Audio Visualizer */}
        {(isSpeaking || isListening) && (
          <div className="absolute bottom-28 left-1/2 -translate-x-1/2 flex items-end gap-1 bg-black/50 backdrop-blur-sm px-4 py-2 rounded-full">
            {[...Array(7)].map((_, i) => (
              <div
                key={i}
                className={`w-1.5 rounded-full ${isSpeaking ? 'bg-green-400' : 'bg-blue-400'}`}
                style={{
                  height: `${12 + Math.random() * 16}px`,
                  animation: 'pulse 0.5s ease-in-out infinite',
                  animationDelay: `${i * 0.1}s`
                }}
              />
            ))}
          </div>
        )}

        {/* Transcript Display */}
        {transcript && typeof transcript === 'string' && (
          <div className="absolute bottom-36 left-4 right-4 bg-black/70 backdrop-blur-sm rounded-xl p-3 border border-white/10 max-h-20 overflow-y-auto">
            <div className="flex items-start gap-2">
              <MessageCircle className="w-4 h-4 text-blue-400 flex-shrink-0 mt-0.5" />
              <p className="text-white text-sm leading-relaxed">{String(transcript)}</p>
            </div>
          </div>
        )}
        
        {/* User Input Display (when speaking) */}
        {userInput && (
          <div className="absolute bottom-36 left-4 right-4 bg-blue-900/70 backdrop-blur-sm rounded-xl p-3 border border-blue-400/30">
            <div className="flex items-start gap-2">
              <Mic className="w-4 h-4 text-blue-400 flex-shrink-0 mt-0.5 animate-pulse" />
              <p className="text-white text-sm leading-relaxed italic">{userInput}...</p>
            </div>
          </div>
        )}

        {/* Text Input Bar (alternative to speech) */}
        <div className="absolute bottom-20 left-4 right-4">
          <form onSubmit={(e) => { e.preventDefault(); sendUserMessage(); }} className="flex gap-2">
            <input
              type="text"
              value={userInput}
              onChange={(e) => setUserInput(e.target.value)}
              placeholder={language === 'hi' ? "या यहाँ टाइप करें..." : "Or type your message here..."}
              disabled={isProcessing || isSpeaking}
              className="flex-1 bg-black/60 backdrop-blur-sm border border-white/20 rounded-full px-4 py-2 text-white text-sm placeholder-gray-400 focus:outline-none focus:border-blue-400 disabled:opacity-50"
            />
            <button
              type="submit"
              disabled={!userInput.trim() || isProcessing || isSpeaking}
              className="p-2 bg-blue-500 hover:bg-blue-600 disabled:bg-gray-600 disabled:opacity-50 text-white rounded-full transition-all"
            >
              <Send className="w-5 h-5" />
            </button>
          </form>
        </div>

        {/* Bottom Control Bar */}
        <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 to-transparent px-4 py-4 flex items-center justify-center gap-3">
          {/* Camera Toggle */}
          <button
            onClick={toggleCamera}
            className={`p-3 rounded-full transition-all ${!cameraOn ? 'bg-red-500 hover:bg-red-600' : 'bg-white/20 hover:bg-white/30'} text-white`}
            title={cameraOn ? 'Turn off camera' : 'Turn on camera'}
          >
            {cameraOn ? <Video className="w-5 h-5" /> : <VideoOff className="w-5 h-5" />}
          </button>
          
          {/* Mute Toggle */}
          <button
            onClick={toggleMute}
            className={`p-3 rounded-full transition-all ${muted ? 'bg-red-500 hover:bg-red-600' : 'bg-white/20 hover:bg-white/30'} text-white`}
            title={muted ? 'Unmute' : 'Mute'}
          >
            {muted ? <MicOff className="w-5 h-5" /> : <Mic className="w-5 h-5" />}
          </button>
          
          {/* End Call Button */}
          <button
            onClick={endConversation}
            className="p-4 bg-red-500 hover:bg-red-600 text-white rounded-full transition-all shadow-lg shadow-red-500/30 hover:scale-105"
            title="End Call"
          >
            <PhoneOff className="w-6 h-6" />
          </button>
          
          {/* Listening Indicator */}
          <div className={`p-3 rounded-full ${isListening ? 'bg-blue-500 ring-4 ring-blue-500/30' : isSpeaking ? 'bg-green-500 ring-4 ring-green-500/30' : 'bg-white/20'} text-white`}>
            {isListening ? <Mic className="w-5 h-5 animate-pulse" /> : <Volume2 className="w-5 h-5" />}
          </div>
        </div>

        {/* Mood Detection Panel */}
        {cameraOn && modelsLoaded && (
          <div className="absolute bottom-4 left-4 bg-black/60 backdrop-blur-sm rounded-2xl p-3 min-w-[180px]">
            <div className="flex items-center gap-2 mb-2">
              <Smile className="w-4 h-4 text-white/70" />
              <span className="text-xs text-white/70 font-medium">Mood Detection</span>
            </div>
            
            {faceDetected ? (
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <span className="text-2xl">{MOOD_CONFIG[currentMood]?.emoji || '😐'}</span>
                  <div>
                    <p className={`font-semibold ${MOOD_CONFIG[currentMood]?.color || 'text-slate-300'}`}>
                      {MOOD_CONFIG[currentMood]?.label || 'Unknown'}
                    </p>
                    <p className="text-xs text-white/50">
                      Confidence: {Math.round(moodConfidence * 100)}%
                    </p>
                  </div>
                </div>
                
                {/* Mood confidence bar */}
                <div className="h-1.5 bg-gray-700 rounded-full overflow-hidden">
                  <div 
                    className={`h-full transition-all duration-300 ${
                      currentMood === 'happy' ? 'bg-yellow-400' :
                      currentMood === 'sad' ? 'bg-blue-400' :
                      currentMood === 'angry' ? 'bg-red-400' :
                      currentMood === 'fearful' ? 'bg-purple-400' :
                      currentMood === 'surprised' ? 'bg-pink-400' :
                      'bg-gray-400'
                    }`}
                    style={{ width: `${moodConfidence * 100}%` }}
                  />
                </div>
              </div>
            ) : (
              <div className="flex items-center gap-2 text-yellow-400/70">
                <AlertTriangle className="w-4 h-4" />
                <span className="text-xs">No face detected</span>
              </div>
            )}
          </div>
        )}

        {/* Error Display */}
        {error && (
          <div className="absolute bottom-28 left-4 right-4 bg-red-500/90 backdrop-blur-sm rounded-xl p-3 z-50">
            <p className="text-white text-center text-sm">{typeof error === 'string' ? error : 'An error occurred'}</p>
          </div>
        )}
      </div>
    );
  }

  // Default - Not Connected, show initial screen
  return (
    <div className="relative w-full h-full min-h-[500px] bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 rounded-2xl overflow-hidden flex items-center justify-center p-6">
      <div className="text-center">
        <div className="w-28 h-28 mx-auto mb-6 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center shadow-2xl ring-4 ring-white/20">
          <Phone className="w-14 h-14 text-white" />
        </div>
        <h2 className="text-2xl font-bold text-white mb-2">
          {language === 'hi' ? 'डॉ. माया' : 'Dr. Maya'}
        </h2>
        <p className="text-cyan-300 mb-2">
          {language === 'hi' ? 'AI स्वास्थ्य सलाहकार' : 'AI Health Consultant'}
        </p>
        <p className="text-green-400 text-xs mb-2">
          ⚡ Powered by Groq AI
        </p>
        <p className="text-blue-400 text-sm mb-4">
          🌐 {getLanguageName(language)}
        </p>
        
        {/* Permission info */}
        <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4 mb-6 max-w-xs mx-auto">
          <p className="text-cyan-200 text-sm flex items-center justify-center gap-2 mb-2">
            <Camera className="w-4 h-4" />
            <Mic className="w-4 h-4" />
            Camera & Microphone Required
          </p>
          <p className="text-cyan-300 text-xs">
            Allow access for video consultation
          </p>
        </div>
        
        {/* Allow Camera Button */}
        <button
          onClick={requestCameraAccess}
          className="px-8 py-4 bg-gradient-to-r from-blue-500 to-indigo-500 hover:from-blue-600 hover:to-indigo-600 text-white rounded-full text-lg font-semibold transition-all flex items-center gap-3 shadow-lg shadow-blue-500/30 mx-auto hover:scale-105 active:scale-95 mb-4"
        >
          <Camera className="w-6 h-6" />
          Allow Camera Access
        </button>
        
        {/* Skip Camera Option */}
        <button
          onClick={startConversation}
          className="text-cyan-300 hover:text-white transition-colors text-sm"
        >
          Continue without camera →
        </button>
        
        {/* Tip */}
        <p className="text-cyan-300 text-xs mt-4 max-w-xs mx-auto">
          💡 Make sure your camera and microphone are not being used by another app
        </p>
      </div>
      
      {/* Error Display */}
      {error && (
        <div className="absolute bottom-4 left-4 right-4 bg-red-500/90 backdrop-blur-sm rounded-xl p-4">
          <div className="flex items-start gap-3">
            <AlertCircle className="w-5 h-5 text-white flex-shrink-0 mt-0.5" />
            <div className="flex-1">
              <p className="text-white text-sm font-medium mb-1">{typeof error === 'string' ? error : 'An error occurred'}</p>
              {(error?.includes?.('GROQ') || error?.includes?.('groq') || error?.includes?.('500')) && (
                <p className="text-white/80 text-xs">
                  💡 To fix: Get a Groq API key from console.groq.com and add it to your backend .env file as GROQ_API_KEY
                </p>
              )}
            </div>
            <button 
              onClick={() => setError(null)}
              className="text-white/70 hover:text-white text-xl leading-none"
            >
              ×
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

// Wrap with error boundary to prevent blank page crashes
export default function GroqAgent(props) {
  return (
    <ErrorBoundary>
      <GroqAgentInner {...props} />
    </ErrorBoundary>
  );
}


































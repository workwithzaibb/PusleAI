import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Brain, Heart, BookOpen, MessageCircle, Phone, Zap } from 'lucide-react';
import MoodTracker from '../components/MoodTracker';
import Journal from '../components/Journal';
import TherapyChat from '../components/TherapyChat';
import { reportCrisis } from '../api';
import { useTheme } from '../contexts/ThemeContext';

export default function MentalHealth() {
  const [activeTab, setActiveTab] = useState('mood');
  const [showCrisis, setShowCrisis] = useState(false);
  const navigate = useNavigate();
  const { theme } = useTheme();

  const tabs = [
    { id: 'mood', label: 'MOOD', icon: Heart },
    { id: 'chat', label: 'AI THERAPY', icon: MessageCircle },
    { id: 'journal', label: 'JOURNAL', icon: BookOpen },
  ];

  return (
    <div className={`min-h-screen relative overflow-hidden transition-colors duration-300 ${theme === 'dark' ? 'bg-black text-white' : 'bg-gradient-to-br from-slate-50 via-purple-50 to-pink-50 text-gray-900'}`}>
      <div className="fixed inset-0 pointer-events-none">
        <div className={`absolute top-1/4 -right-20 w-[400px] h-[400px] rounded-full blur-3xl animate-pulse ${theme === 'dark' ? 'bg-gradient-to-l from-purple-500/20 to-transparent' : 'bg-gradient-to-l from-purple-400/30 to-transparent'}`} />
        <div className={`absolute bottom-1/4 -left-20 w-[300px] h-[300px] rounded-full blur-3xl animate-pulse ${theme === 'dark' ? 'bg-gradient-to-r from-pink-500/20 to-transparent' : 'bg-gradient-to-r from-pink-400/30 to-transparent'}`} style={{ animationDelay: '1s' }} />
      </div>

      <nav className={`relative z-20 px-6 py-4 flex items-center justify-between border-b ${theme === 'dark' ? 'border-white/10' : 'border-gray-200 bg-white/70 backdrop-blur-xl'}`}>
        <div className="flex items-center gap-4">
          <button onClick={() => navigate('/')} className={`p-2 rounded-full ${theme === 'dark' ? 'hover:bg-white/10' : 'hover:bg-gray-100'}`}><ArrowLeft className="w-5 h-5" /></button>
          <div>
            <h1 className="font-black text-xl tracking-tight flex items-center gap-2"><Brain className="w-6 h-6 text-purple-400" /> MENTAL HEALTH</h1>
            <p className={`text-[10px] tracking-[0.2em] ${theme === 'dark' ? 'text-purple-300' : 'text-purple-600'}`}>YOUR SAFE SPACE</p>
          </div>
        </div>
        <button onClick={() => setShowCrisis(true)} className="px-4 py-2 bg-red-600 rounded-full font-bold text-sm hover:bg-red-500 flex items-center gap-2 text-white">
          <Phone className="w-4 h-4" /> SOS
        </button>
      </nav>

      {/* Tabs */}
      <div className={`relative z-10 px-6 py-4 flex gap-2 border-b ${theme === 'dark' ? 'border-white/10' : 'border-gray-200'}`}>
        {tabs.map(({ id, label, icon: Icon }) => (
          <button key={id} onClick={() => setActiveTab(id)}
            className={`px-4 py-2 rounded-full font-bold text-xs tracking-wider flex items-center gap-2 transition-all ${activeTab === id ? (theme === 'dark' ? 'bg-white text-black' : 'bg-purple-500 text-white') : (theme === 'dark' ? 'bg-gray-800 text-purple-300 hover:bg-gray-700' : 'bg-white border border-gray-200 text-purple-600 hover:bg-purple-50')}`}>
            <Icon className="w-4 h-4" /> {label}
          </button>
        ))}
      </div>

      <div className="relative z-10 p-6">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2">
            {activeTab === 'mood' && <MoodTracker />}
            {activeTab === 'chat' && <TherapyChat />}
            {activeTab === 'journal' && <Journal />}
          </div>

          <div className="space-y-4">
            <div className="bg-gradient-to-br from-purple-900 to-purple-800 rounded-xl p-6 border border-purple-500/30">
              <Zap className="w-6 h-6 text-purple-300 mb-3" />
              <h3 className="font-black text-sm mb-2">DAILY QUOTE</h3>
              <p className="text-purple-200 text-sm italic">"You don't have to control your thoughts. You just have to stop letting them control you."</p>
            </div>

            <div className="bg-gray-900 rounded-xl p-6 border border-white/10">
              <h3 className="font-black text-sm mb-4 tracking-wider">QUICK TIPS</h3>
              <ul className="space-y-2 text-sm text-purple-300">
                <li>• Take 5 deep breaths</li>
                <li>• Drink water</li>
                <li>• Step outside</li>
                <li>• Write 3 gratitudes</li>
              </ul>
            </div>
          </div>
        </div>
      </div>

      {showCrisis && (
        <div className="fixed inset-0 bg-black/80 flex items-center justify-center p-4 z-50">
          <div className="bg-gray-900 rounded-xl max-w-md w-full p-6 border-l-4 border-red-600">
            <h2 className="font-black text-2xl text-red-400 mb-4">CRISIS SUPPORT</h2>
            <p className="text-cyan-300 mb-6">If you're in crisis, please reach out:</p>
            <div className="space-y-3 mb-6">
              <a href="tel:988" className="block py-3 bg-red-600 text-center rounded-xl font-bold hover:bg-red-500">📞 Crisis Hotline: 988</a>
              <a href="tel:112" className="block py-3 bg-gray-800 text-center rounded-xl font-bold hover:bg-gray-700 border border-white/10">🚨 Emergency: 112</a>
            </div>
            <button onClick={() => setShowCrisis(false)} className="w-full py-3 bg-white text-black font-bold rounded-xl">CLOSE</button>
          </div>
        </div>
      )}
    </div>
  );
}

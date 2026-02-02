import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { 
  Heart, Activity, Shield, Baby, Sparkles, ArrowLeft, 
  Crown, Star, Check, Zap, MessageSquare, ChevronRight, User, Utensils, Calendar
} from 'lucide-react';
import { Card, CardContent } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { useTheme } from '../contexts/ThemeContext';

const QueensHealth = () => {
    const navigate = useNavigate();
    const [mousePos, setMousePos] = useState({ x: -1000, y: -1000 });
    const { theme } = useTheme();

    const [particles] = useState(() => 
        [...Array(30)].map((_, i) => ({
            id: i,
            size: Math.random() * 4 + 2,
            left: Math.random() * 100,
            color: '236, 72, 153',
            opacity: Math.random() * 0.4 + 0.2,
            duration: Math.random() * 10 + 8,
            delay: Math.random() * 8,
        }))
    );

    useEffect(() => {
        const handleMouseMove = (e) => {
            setMousePos({ x: e.clientX, y: e.clientY });
        };
        window.addEventListener('mousemove', handleMouseMove);
        return () => window.removeEventListener('mousemove', handleMouseMove);
    }, []);

    const sections = [
        {
            title: "PCOS/PCOD Management",
            icon: Sparkles,
            desc: "Expert AI-powered lifestyle & hormonal tracking.",
            color: "text-pink-400",
            bg: "bg-pink-500/10",
            glow: "shadow-pink-500/20",
            route: "/queens/pcos"
        },
        {
            title: "Maternal Companion",
            icon: Baby,
            desc: "Pregnancy guidance & emergency red-flag detection.",
            color: "text-purple-400",
            bg: "bg-purple-500/10",
            glow: "shadow-purple-500/20",
            route: "/queens/maternal"
        },
        {
            title: "Anemia & Nutrition",
            icon: Activity,
            desc: "Risk assessment for iron deficiency & local diet plans.",
            color: "text-rose-400",
            bg: "bg-rose-500/10",
            glow: "shadow-rose-500/20",
            route: "/queens/anemia"
        },
        {
            title: "Mental Wellbeing",
            icon: Heart,
            desc: "Support for hormonal mood changes & postnatal care.",
            color: "text-orange-400",
            bg: "bg-orange-500/10",
            glow: "shadow-orange-500/20",
            route: "/queens/mental"
        },
        {
            title: "Diet Planner",
            icon: Utensils,
            desc: "Condition-specific meal plans for PCOS, pregnancy & anemia.",
            color: "text-green-400",
            bg: "bg-green-500/10",
            glow: "shadow-green-500/20",
            route: "/queens/diet"
        },
        {
            title: "Period Tracker",
            icon: Calendar,
            desc: "Precise cycle tracking, predictions & symptom logging.",
            color: "text-red-400",
            bg: "bg-red-500/10",
            glow: "shadow-red-500/20",
            route: "/queens/period"
        }
    ];

    return (
        <div className={`min-h-screen relative overflow-hidden transition-colors duration-300 ${theme === 'dark' ? 'bg-black text-white' : 'bg-gradient-to-br from-slate-50 via-pink-50 to-purple-50 text-gray-900'}`}>
            <div className="fixed inset-0 pointer-events-none">
                <div className={`absolute inset-0 ${theme === 'dark' ? 'bg-gradient-to-br from-black via-gray-900 to-black' : 'bg-transparent'}`} />
                <div className={`absolute w-[500px] h-[500px] -top-20 -right-20 rounded-full blur-3xl animate-pulse ${theme === 'dark' ? 'bg-pink-500/10' : 'bg-pink-400/20'}`} />
                <div className={`absolute w-[500px] h-[500px] -bottom-20 -left-20 rounded-full blur-3xl animate-pulse ${theme === 'dark' ? 'bg-purple-500/10' : 'bg-purple-400/20'}`} style={{ animationDelay: '1s' }} />
                
                {theme === 'dark' && particles.map((particle) => {
                    const particleX = (particle.left / 100) * (typeof window !== 'undefined' ? window.innerWidth : 1920);
                    const dx = mousePos.x - particleX;
                    const dy = mousePos.y - (typeof window !== 'undefined' ? window.innerHeight * 0.5 : 540);
                    const distance = Math.sqrt(dx * dx + dy * dy);
                    const fadeRadius = 200;
                    const fadeFactor = distance < fadeRadius ? (distance / fadeRadius) : 1;
                    
                    return (
                        <div
                            key={particle.id}
                            className="absolute rounded-full animate-antigravity pointer-events-none"
                            style={{
                                width: `${particle.size}px`,
                                height: `${particle.size}px`,
                                left: `${particle.left}%`,
                                bottom: '-20px',
                                background: `rgba(${particle.color}, ${particle.opacity * fadeFactor})`,
                                animationDuration: `${particle.duration}s`,
                                animationDelay: `${particle.delay}s`,
                                zIndex: 1,
                            }}
                        />
                    );
                })}
            </div>

            <header className={`relative z-20 px-6 py-4 flex items-center justify-between border-b backdrop-blur-xl ${theme === 'dark' ? 'border-white/10 bg-black/50' : 'border-gray-200 bg-white/70'}`}>
                <div className="flex items-center gap-4">
                    <button 
                        onClick={() => navigate(-1)} 
                        className={`p-2 border rounded-xl transition-all hover:scale-110 active:scale-95 ${theme === 'dark' ? 'bg-white/5 border-white/10 hover:bg-white/10' : 'bg-white border-gray-200 hover:bg-gray-100 shadow-sm'}`}
                    >
                        <ArrowLeft className="w-5 h-5" />
                    </button>
                    <div className="flex flex-col">
                        <div className="flex items-center gap-2">
                            <Crown className="w-5 h-5 text-pink-400" />
                            <h1 className="text-xl font-black tracking-tight" style={{ textShadow: theme === 'dark' ? '0 0 20px rgba(236, 72, 153, 0.3)' : 'none' }}>
                                FOR <span className="text-pink-400">QUEENS</span>
                            </h1>
                        </div>
                        <span className={`text-xs font-bold tracking-[0.1em] uppercase ${theme === 'dark' ? 'text-pink-300' : 'text-pink-600'}`}>Specialized Women's Healthcare</span>
                    </div>
                </div>
                
                <Link to="/" className={`flex items-center gap-2 transition-opacity ${theme === 'dark' ? 'opacity-50 hover:opacity-100' : 'opacity-70 hover:opacity-100'}`}>
                    <Heart className="w-5 h-5 text-cyan-400" />
                    <span className="text-sm font-black hidden md:block">PULSE<span className="text-cyan-400">AI</span></span>
                </Link>
            </header>

            <main className="relative z-10 p-6 max-w-4xl mx-auto space-y-8 pb-24">
                <Card className={`overflow-hidden group shadow-2xl ${theme === 'dark' ? 'bg-gradient-to-br from-pink-500/25 to-purple-600/25 border-white/20 backdrop-blur-2xl shadow-pink-500/10' : 'bg-gradient-to-br from-pink-100 to-purple-100 border-pink-200 shadow-pink-200/50'}`}>
                    <CardContent className="p-8 relative">
                        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
                            <div className="max-w-md">
                                <div className="flex items-center gap-2 mb-4">
                                    <div className={`px-3 py-1 border rounded-full flex items-center gap-2 ${theme === 'dark' ? 'bg-pink-500/30 border-pink-500/50' : 'bg-pink-200 border-pink-300'}`}>
                                        <Star className="w-3 h-3 text-pink-400 fill-pink-400" />
                                        <span className={`text-xs font-black tracking-widest uppercase ${theme === 'dark' ? 'text-pink-200' : 'text-pink-700'}`}>Premium Feature</span>
                                    </div>
                                </div>
                                <h2 className="text-4xl font-black mb-4 leading-tight uppercase tracking-tighter">
                                    YOUR HEALTH. <br/>
                                    <span className="bg-gradient-to-r from-pink-400 to-purple-400 bg-clip-text text-transparent">YOUR JOURNEY.</span>
                                </h2>
                                <p className={`text-base mb-6 leading-relaxed max-w-sm ${theme === 'dark' ? 'text-pink-100' : 'text-pink-800'}`}>
                                    Our specialized AI is trained to understand the unique healthcare landscape of Indian women, providing culturally relevant clinical insights.
                                </p>
                                <div className="flex flex-wrap gap-3">
                                    <Button 
                                        onClick={() => navigate('/consultation')}
                                        className="bg-pink-500 hover:bg-pink-600 text-white font-bold px-8 py-7 rounded-2xl flex items-center gap-3 transition-all hover:scale-105 shadow-xl shadow-pink-500/40"
                                    >
                                        <MessageSquare className="w-6 h-6" />
                                        <span className="text-lg">Start AI Session</span>
                                    </Button>
                                </div>
                            </div>
                            <div className="relative hidden md:block">
                                <div className={`w-48 h-48 rounded-full blur-3xl animate-pulse ${theme === 'dark' ? 'bg-pink-500/20' : 'bg-pink-300/40'}`} />
                                <Crown className={`absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-32 h-32 group-hover:scale-110 transition-transform duration-500 ${theme === 'dark' ? 'text-pink-500/30' : 'text-pink-400/50'}`} />
                            </div>
                        </div>
                    </CardContent>
                </Card>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {sections.map((section, idx) => (
                        <Card 
                            key={idx} 
                            onClick={() => navigate(section.route)}
                            className={`backdrop-blur-xl transition-all cursor-pointer group hover:scale-[1.02] ${theme === 'dark' ? 'bg-white/5 border-white/10 hover:bg-white/10' : 'bg-white border-gray-200 shadow-md hover:shadow-lg'}`}
                        >
                            <CardContent className="p-6 flex items-start gap-4">
                                <div className={`p-4 rounded-2xl ${section.bg} ${section.glow} group-hover:scale-110 transition-transform`}>
                                    <section.icon className={`w-6 h-6 ${section.color}`} />
                                </div>
                                <div className="flex-1">
                                    <div className="flex items-center justify-between mb-1">
                                        <h3 className={`font-black text-base tracking-tight ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>{section.title}</h3>
                                        <ChevronRight className={`w-5 h-5 group-hover:translate-x-1 transition-all ${theme === 'dark' ? 'text-pink-300 group-hover:text-pink-400' : 'text-pink-500 group-hover:text-pink-600'}`} />
                                    </div>
                                    <p className={`text-sm leading-relaxed font-medium ${theme === 'dark' ? 'text-pink-200' : 'text-pink-700'}`}>
                                        {section.desc}
                                    </p>
                                </div>
                            </CardContent>
                        </Card>
                    ))}
                </div>

                <div className={`border rounded-3xl p-6 flex flex-col md:flex-row items-center gap-6 ${theme === 'dark' ? 'bg-white/5 border-white/10' : 'bg-white border-gray-200 shadow-md'}`}>
                    <div className={`p-4 rounded-2xl ${theme === 'dark' ? 'bg-cyan-500/10 shadow-lg shadow-cyan-500/10' : 'bg-cyan-100 shadow-md'}`}>
                        <Shield className="w-8 h-8 text-cyan-400" />
                    </div>
                    <div className="flex-1 text-center md:text-left">
                        <h4 className={`font-bold text-lg mb-1 ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>Clinic-Grade Privacy</h4>
                        <p className={`text-sm leading-relaxed max-w-xl ${theme === 'dark' ? 'text-cyan-200' : 'text-cyan-700'}`}>
                            Your reproductive and hormonal health data is 100% encrypted. No data is shared with third parties, ensuring total peace of mind for Indian households.
                        </p>
                    </div>
                    <div className="flex gap-4">
                        <div className={`flex items-center gap-2 px-4 py-2 rounded-full border ${theme === 'dark' ? 'bg-white/10 border-white/20' : 'bg-green-50 border-green-200'}`}>
                            <Check className="w-4 h-4 text-green-400" />
                            <span className={`text-xs font-bold uppercase tracking-widest ${theme === 'dark' ? 'text-cyan-200' : 'text-green-700'}`}>End-to-End Encrypted</span>
                        </div>
                    </div>
                </div>
            </main>
            <div className="h-20 md:hidden" />
        </div>
    );
};

export default QueensHealth;

import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { 
  Heart, Activity, Shield, Baby, Sparkles, ArrowLeft, 
  Crown, Star, Check, Zap, MessageSquare, ChevronRight, User
} from 'lucide-react';
import { Card, CardContent } from '../components/ui/card';
import { Button } from '../components/ui/button';

const QueensHealth = () => {
    const navigate = useNavigate();
    const [mousePos, setMousePos] = useState({ x: -1000, y: -1000 });

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
            glow: "shadow-pink-500/20"
        },
        {
            title: "Maternal Companion",
            icon: Baby,
            desc: "Pregnancy guidance & emergency red-flag detection.",
            color: "text-purple-400",
            bg: "bg-purple-500/10",
            glow: "shadow-purple-500/20"
        },
        {
            title: "Anemia & Nutrition",
            icon: Activity,
            desc: "Risk assessment for iron deficiency & local diet plans.",
            color: "text-rose-400",
            bg: "bg-rose-500/10",
            glow: "shadow-rose-500/20"
        },
        {
            title: "Mental Wellbeing",
            icon: Heart,
            desc: "Support for hormonal mood changes & postnatal care.",
            color: "text-orange-400",
            bg: "bg-orange-500/10",
            glow: "shadow-orange-500/20"
        }
    ];

    return (
        <div className="min-h-screen bg-black text-white relative overflow-hidden">
            <div className="fixed inset-0 pointer-events-none">
                <div className="absolute inset-0 bg-gradient-to-br from-black via-gray-900 to-black" />
                <div className="absolute w-[500px] h-[500px] -top-20 -right-20 bg-pink-500/10 rounded-full blur-3xl animate-pulse" />
                <div className="absolute w-[500px] h-[500px] -bottom-20 -left-20 bg-purple-500/10 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '1s' }} />
                
                {particles.map((particle) => {
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

            <header className="relative z-20 px-6 py-4 flex items-center justify-between border-b border-white/10 bg-black/50 backdrop-blur-xl">
                <div className="flex items-center gap-4">
                    <button 
                        onClick={() => navigate(-1)} 
                        className="p-2 bg-white/5 border border-white/10 rounded-xl hover:bg-white/10 transition-all hover:scale-110 active:scale-95"
                    >
                        <ArrowLeft className="w-5 h-5" />
                    </button>
                    <div className="flex flex-col">
                        <div className="flex items-center gap-2">
                            <Crown className="w-5 h-5 text-pink-400" />
                            <h1 className="text-xl font-black tracking-tight">
                                FOR <span className="text-pink-400">QUEENS</span>
                            </h1>
                        </div>
                        <span className="text-[10px] font-bold tracking-[0.2em] text-gray-500 uppercase">Specialized Women''s Healthcare</span>
                    </div>
                </div>
                
                <Link to="/" className="flex items-center gap-2 opacity-50 hover:opacity-100 transition-opacity">
                    <Heart className="w-5 h-5 text-cyan-400" />
                    <span className="text-sm font-black hidden md:block">PULSE<span className="text-cyan-400">AI</span></span>
                </Link>
            </header>

            <main className="relative z-10 p-6 max-w-4xl mx-auto space-y-8 pb-24">
                <Card className="bg-gradient-to-br from-pink-500/20 to-purple-600/20 border-white/10 backdrop-blur-xl overflow-hidden group">
                    <CardContent className="p-8 relative">
                        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
                            <div className="max-w-md">
                                <div className="flex items-center gap-2 mb-4">
                                    <div className="px-3 py-1 bg-pink-500/20 border border-pink-500/30 rounded-full flex items-center gap-2">
                                        <Star className="w-3 h-3 text-pink-400 fill-pink-400" />
                                        <span className="text-[10px] font-black text-pink-400 tracking-widest uppercase">Premium Feature</span>
                                    </div>
                                </div>
                                <h2 className="text-3xl font-black mb-4 leading-tight">
                                    Empowering Your <br/>
                                    <span className="bg-gradient-to-r from-pink-400 to-purple-400 bg-clip-text text-transparent">Health Journey.</span>
                                </h2>
                                <p className="text-gray-400 text-sm mb-6 leading-relaxed">
                                    Our specialized AI is trained to understand the unique healthcare landscape of Indian women, providing culturally relevant clinical insights.
                                </p>
                                <div className="flex flex-wrap gap-3">
                                    <Button 
                                        onClick={() => navigate(''/consultation'')}
                                        className="bg-pink-500 hover:bg-pink-600 text-white font-bold px-6 py-6 rounded-2xl flex items-center gap-3 transition-all hover:scale-105 shadow-lg shadow-pink-500/20"
                                    >
                                        <MessageSquare className="w-5 h-5" />
                                        Start AI Session
                                    </Button>
                                    <div className="flex -space-x-2 items-center px-2">
                                        {[1,2,3].map(i => (
                                            <div key={i} className="w-8 h-8 rounded-full border-2 border-black bg-gray-800 flex items-center justify-center">
                                                <User className="w-4 h-4 text-gray-400" />
                                            </div>
                                        ))}
                                        <span className="ml-4 text-[10px] font-bold text-gray-500 uppercase tracking-tighter">12k+ Active Queens</span>
                                    </div>
                                </div>
                            </div>
                            <div className="relative hidden md:block">
                                <div className="w-48 h-48 bg-pink-500/20 rounded-full blur-3xl animate-pulse" />
                                <Crown className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-32 h-32 text-pink-500/30 group-hover:scale-110 transition-transform duration-500" />
                            </div>
                        </div>
                    </CardContent>
                </Card>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {sections.map((section, idx) => (
                        <Card 
                            key={idx} 
                            className="bg-white/5 border-white/10 backdrop-blur-xl hover:bg-white/10 transition-all cursor-pointer group hover:scale-[1.02]"
                        >
                            <CardContent className="p-6 flex items-start gap-4">
                                <div className={`p-4 rounded-2xl ${section.bg} ${section.glow} group-hover:scale-110 transition-transform`}>
                                    <section.icon className={`w-6 h-6 ${section.color}`} />
                                </div>
                                <div className="flex-1">
                                    <div className="flex items-center justify-between mb-1">
                                        <h3 className="font-black text-sm tracking-tight">{section.title}</h3>
                                        <ChevronRight className="w-4 h-4 text-gray-600 group-hover:text-pink-400 group-hover:translate-x-1 transition-all" />
                                    </div>
                                    <p className="text-xs text-gray-500 leading-relaxed font-medium">
                                        {section.desc}
                                    </p>
                                </div>
                            </CardContent>
                        </Card>
                    ))}
                </div>

                <div className="bg-white/5 border border-white/10 rounded-3xl p-6 flex flex-col md:flex-row items-center gap-6">
                    <div className="p-4 bg-cyan-500/10 rounded-2xl shadow-lg shadow-cyan-500/10">
                        <Shield className="w-8 h-8 text-cyan-400" />
                    </div>
                    <div className="flex-1 text-center md:text-left">
                        <h4 className="font-bold mb-1">Clinic-Grade Privacy</h4>
                        <p className="text-xs text-gray-500 leading-relaxed">
                            Your reproductive and hormonal health data is 100% encrypted. No data is shared with third parties, ensuring total peace of mind for Indian households.
                        </p>
                    </div>
                    <div className="flex gap-4">
                        <div className="flex items-center gap-2 px-4 py-2 bg-white/5 rounded-full border border-white/10">
                            <Check className="w-3 h-3 text-green-400" />
                            <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">End-to-End</span>
                        </div>
                    </div>
                </div>
            </main>
            <div className="h-20 md:hidden" />
        </div>
    );
};

export default QueensHealth;

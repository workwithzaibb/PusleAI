import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { 
    ArrowLeft, Crown, Heart, Brain, Sun, Moon, Smile, Frown,
    Meh, Cloud, CloudRain, Sparkles, MessageSquare, TrendingUp,
    Calendar, Music, BookOpen, Coffee, Bath, Users
} from 'lucide-react';
import { Card, CardContent } from '../../components/ui/card';
import { Button } from '../../components/ui/button';
import { useTheme } from '../../contexts/ThemeContext';

const MentalWellbeing = () => {
    const navigate = useNavigate();
    const { theme } = useTheme();
    const [activeTab, setActiveTab] = useState('check-in');
    const [selectedMood, setSelectedMood] = useState(null);
    const [selectedFactors, setSelectedFactors] = useState([]);

    const moods = [
        { id: 'great', icon: Sparkles, label: 'Great', color: 'text-green-400', bg: 'bg-green-500/20', border: 'border-green-500/50' },
        { id: 'good', icon: Smile, label: 'Good', color: 'text-blue-400', bg: 'bg-blue-500/20', border: 'border-blue-500/50' },
        { id: 'okay', icon: Meh, label: 'Okay', color: 'text-yellow-400', bg: 'bg-yellow-500/20', border: 'border-yellow-500/50' },
        { id: 'low', icon: Cloud, label: 'Low', color: 'text-orange-400', bg: 'bg-orange-500/20', border: 'border-orange-500/50' },
        { id: 'bad', icon: CloudRain, label: 'Struggling', color: 'text-red-400', bg: 'bg-red-500/20', border: 'border-red-500/50' },
    ];

    const factors = [
        { id: 'period', label: 'On Period', icon: Calendar },
        { id: 'pms', label: 'PMS', icon: Moon },
        { id: 'sleep', label: 'Poor Sleep', icon: Moon },
        { id: 'stress', label: 'Work Stress', icon: Brain },
        { id: 'family', label: 'Family Issues', icon: Users },
        { id: 'hormones', label: 'Hormonal Changes', icon: TrendingUp },
    ];

    const selfCareActivities = [
        { icon: Bath, title: '5-Minute Breathing', desc: 'Quick box breathing exercise for instant calm', duration: '5 min', color: 'text-cyan-400', bg: 'bg-cyan-500/10' },
        { icon: Music, title: 'Mood Music', desc: 'Curated playlist for emotional balance', duration: '15 min', color: 'text-purple-400', bg: 'bg-purple-500/10' },
        { icon: BookOpen, title: 'Gratitude Journal', desc: 'Write 3 things you\'re grateful for today', duration: '10 min', color: 'text-pink-400', bg: 'bg-pink-500/10' },
        { icon: Sun, title: 'Morning Sunlight', desc: '10 minutes of natural light exposure', duration: '10 min', color: 'text-yellow-400', bg: 'bg-yellow-500/10' },
        { icon: Coffee, title: 'Mindful Tea Break', desc: 'A moment of presence with warm drink', duration: '15 min', color: 'text-orange-400', bg: 'bg-orange-500/10' },
        { icon: Users, title: 'Connect with Friend', desc: 'Reach out to someone you trust', duration: '20 min', color: 'text-green-400', bg: 'bg-green-500/10' },
    ];

    const hormonalInsights = [
        { phase: 'Menstrual (Day 1-5)', mood: 'Low energy, need rest', tip: 'Be gentle with yourself. Light stretching and warm foods help.' },
        { phase: 'Follicular (Day 6-14)', mood: 'Rising energy, optimistic', tip: 'Great time for new projects and social activities.' },
        { phase: 'Ovulation (Day 14-16)', mood: 'Peak energy, confident', tip: 'Ideal for important conversations and challenges.' },
        { phase: 'Luteal (Day 17-28)', mood: 'Gradually decreasing energy', tip: 'Focus on completing tasks, prioritize self-care.' },
    ];

    const toggleFactor = (factorId) => {
        setSelectedFactors(prev => 
            prev.includes(factorId) 
                ? prev.filter(f => f !== factorId)
                : [...prev, factorId]
        );
    };

    return (
        <div className={`min-h-screen relative overflow-hidden transition-colors duration-300 ${theme === 'dark' ? 'bg-black text-white' : 'bg-gradient-to-br from-slate-50 via-orange-50 to-pink-50 text-gray-900'}`}>
            <div className="fixed inset-0 pointer-events-none">
                <div className={`absolute inset-0 ${theme === 'dark' ? 'bg-gradient-to-br from-black via-gray-900 to-black' : 'bg-transparent'}`} />
                <div className={`absolute w-[500px] h-[500px] -top-20 -right-20 rounded-full blur-3xl animate-pulse ${theme === 'dark' ? 'bg-orange-500/10' : 'bg-orange-400/20'}`} />
                <div className={`absolute w-[500px] h-[500px] -bottom-20 -left-20 rounded-full blur-3xl animate-pulse ${theme === 'dark' ? 'bg-pink-500/10' : 'bg-pink-400/20'}`} style={{ animationDelay: '1s' }} />
            </div>

            <header className={`relative z-20 px-6 py-4 flex items-center justify-between border-b backdrop-blur-xl ${theme === 'dark' ? 'border-white/10 bg-black/50' : 'border-gray-200 bg-white/70'}`}>
                <div className="flex items-center gap-4">
                    <button onClick={() => navigate('/queens')} className={`p-2 border rounded-xl transition-all ${theme === 'dark' ? 'bg-white/5 border-white/10 hover:bg-white/10' : 'bg-white border-gray-200 hover:bg-gray-100 shadow-sm'}`}>
                        <ArrowLeft className="w-5 h-5" />
                    </button>
                    <div className="flex flex-col">
                        <div className="flex items-center gap-2">
                            <Heart className="w-5 h-5 text-orange-400" />
                            <h1 className="text-xl font-black tracking-tight">MENTAL <span className="text-orange-400">WELLBEING</span></h1>
                        </div>
                        <span className={`text-xs font-bold tracking-[0.1em] uppercase ${theme === 'dark' ? 'text-orange-300' : 'text-orange-600'}`}>Emotional Health Support</span>
                    </div>
                </div>
                <Link to="/queens" className={`flex items-center gap-2 transition-opacity ${theme === 'dark' ? 'opacity-50 hover:opacity-100' : 'opacity-70 hover:opacity-100'}`}>
                    <Crown className="w-5 h-5 text-pink-400" />
                    <span className="text-sm font-black hidden md:block">FOR <span className="text-pink-400">QUEENS</span></span>
                </Link>
            </header>

            <main className="relative z-10 p-6 max-w-4xl mx-auto space-y-6 pb-24">
                {/* Tab Navigation */}
                <div className={`flex gap-2 p-1 rounded-2xl border ${theme === 'dark' ? 'bg-white/5 border-white/10' : 'bg-white border-gray-200 shadow-md'}`}>
                    {['check-in', 'self-care', 'hormones'].map(tab => (
                        <button
                            key={tab}
                            onClick={() => setActiveTab(tab)}
                            className={`flex-1 py-3 px-4 rounded-xl font-bold text-sm uppercase tracking-wider transition-all ${
                                activeTab === tab 
                                    ? 'bg-orange-500 text-white shadow-lg shadow-orange-500/30' 
                                    : (theme === 'dark' ? 'text-orange-300 hover:text-white hover:bg-white/5' : 'text-orange-600 hover:text-orange-700 hover:bg-orange-50')
                            }`}
                        >
                            {tab.replace('-', ' ')}
                        </button>
                    ))}
                </div>

                {activeTab === 'check-in' && (
                    <div className="space-y-6">
                        <Card className={`backdrop-blur-xl ${theme === 'dark' ? 'bg-gradient-to-br from-orange-500/20 to-pink-600/20 border-white/20' : 'bg-gradient-to-br from-orange-100 to-pink-100 border-orange-200 shadow-md'}`}>
                            <CardContent className="p-6">
                                <h3 className="text-lg font-black mb-4">How are you feeling today?</h3>
                                <div className="flex justify-between gap-2">
                                    {moods.map(mood => (
                                        <button
                                            key={mood.id}
                                            onClick={() => setSelectedMood(mood.id)}
                                            className={`flex-1 p-4 rounded-2xl border transition-all flex flex-col items-center gap-2 ${
                                                selectedMood === mood.id 
                                                    ? `${mood.bg} ${mood.border}` 
                                                    : 'bg-white/5 border-white/10 hover:bg-white/10'
                                            }`}
                                        >
                                            <mood.icon className={`w-8 h-8 ${selectedMood === mood.id ? mood.color : 'text-orange-300'}`} />
                                            <span className={`text-xs font-bold ${selectedMood === mood.id ? mood.color : 'text-orange-300'}`}>
                                                {mood.label}
                                            </span>
                                        </button>
                                    ))}
                                </div>
                            </CardContent>
                        </Card>

                        {selectedMood && (
                            <Card className="bg-white/5 border-white/10 backdrop-blur-xl">
                                <CardContent className="p-6">
                                    <h3 className="text-lg font-black mb-4">What's affecting your mood?</h3>
                                    <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                                        {factors.map(factor => (
                                            <button
                                                key={factor.id}
                                                onClick={() => toggleFactor(factor.id)}
                                                className={`p-4 rounded-2xl border transition-all flex items-center gap-3 ${
                                                    selectedFactors.includes(factor.id)
                                                        ? 'bg-orange-500/20 border-orange-500/50 text-orange-300'
                                                        : 'bg-white/5 border-white/10 text-orange-300 hover:bg-white/10'
                                                }`}
                                            >
                                                <factor.icon className="w-5 h-5" />
                                                <span className="font-medium text-sm">{factor.label}</span>
                                            </button>
                                        ))}
                                    </div>
                                </CardContent>
                            </Card>
                        )}

                        {selectedMood && (selectedMood === 'low' || selectedMood === 'bad') && (
                            <div className="p-4 bg-orange-500/10 border border-orange-500/30 rounded-2xl">
                                <h4 className="font-bold text-orange-300 mb-2 flex items-center gap-2">
                                    <Heart className="w-5 h-5" />
                                    You're not alone
                                </h4>
                                <p className="text-orange-100 text-sm mb-4">
                                    It's okay to have difficult days. If you've been feeling this way for more than 2 weeks, 
                                    consider speaking with a mental health professional.
                                </p>
                                <Button 
                                    onClick={() => navigate('/consultation')}
                                    className="w-full bg-orange-500 hover:bg-orange-600"
                                >
                                    <MessageSquare className="w-4 h-4 mr-2" />
                                    Talk to AI Companion
                                </Button>
                            </div>
                        )}

                        {selectedMood && selectedFactors.length > 0 && (
                            <Button 
                                className="w-full bg-pink-500 hover:bg-pink-600 py-6 text-lg font-bold"
                                onClick={() => setActiveTab('self-care')}
                            >
                                Get Personalized Self-Care Tips
                            </Button>
                        )}
                    </div>
                )}

                {activeTab === 'self-care' && (
                    <div className="space-y-4">
                        <h3 className="text-lg font-black">Self-Care Activities</h3>
                        <p className="text-orange-300 text-sm mb-4">Small acts of kindness to yourself can make a big difference</p>
                        
                        {selfCareActivities.map((activity, idx) => (
                            <Card key={idx} className="bg-white/5 border-white/10 backdrop-blur-xl hover:bg-white/10 transition-all cursor-pointer group">
                                <CardContent className="p-5 flex items-center gap-4">
                                    <div className={`p-3 rounded-xl ${activity.bg} group-hover:scale-110 transition-transform`}>
                                        <activity.icon className={`w-6 h-6 ${activity.color}`} />
                                    </div>
                                    <div className="flex-1">
                                        <h4 className="font-bold text-white mb-1">{activity.title}</h4>
                                        <p className="text-sm text-orange-300">{activity.desc}</p>
                                    </div>
                                    <div className="text-right">
                                        <span className="text-xs font-bold text-orange-300 uppercase">{activity.duration}</span>
                                    </div>
                                </CardContent>
                            </Card>
                        ))}
                    </div>
                )}

                {activeTab === 'hormones' && (
                    <div className="space-y-6">
                        <Card className="bg-gradient-to-br from-purple-500/20 to-pink-600/20 border-white/20 backdrop-blur-xl">
                            <CardContent className="p-6">
                                <h3 className="text-lg font-black mb-2 flex items-center gap-2">
                                    <TrendingUp className="w-5 h-5 text-purple-400" />
                                    Hormones & Mood
                                </h3>
                                <p className="text-orange-100 text-sm">
                                    Your mood naturally fluctuates with your menstrual cycle. Understanding these patterns 
                                    can help you plan and be kinder to yourself.
                                </p>
                            </CardContent>
                        </Card>

                        {hormonalInsights.map((insight, idx) => (
                            <Card key={idx} className="bg-white/5 border-white/10 backdrop-blur-xl">
                                <CardContent className="p-5">
                                    <div className="flex items-center gap-3 mb-3">
                                        <div className={`w-2 h-2 rounded-full ${
                                            idx === 0 ? 'bg-red-400' : idx === 1 ? 'bg-green-400' : idx === 2 ? 'bg-yellow-400' : 'bg-purple-400'
                                        }`} />
                                        <h4 className="font-bold text-white">{insight.phase}</h4>
                                    </div>
                                    <p className="text-sm text-orange-300 mb-2"><strong className="text-orange-200">Typical mood:</strong> {insight.mood}</p>
                                    <p className="text-sm text-orange-200 p-3 bg-white/5 rounded-xl">💡 {insight.tip}</p>
                                </CardContent>
                            </Card>
                        ))}

                        <Button 
                            onClick={() => navigate('/mental-health')}
                            className="w-full bg-purple-500 hover:bg-purple-600 py-6 text-lg font-bold"
                        >
                            <Brain className="w-5 h-5 mr-2" />
                            Full Mental Health Dashboard
                        </Button>
                    </div>
                )}
            </main>
        </div>
    );
};

export default MentalWellbeing;

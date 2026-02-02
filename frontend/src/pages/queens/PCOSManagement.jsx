import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { 
    ArrowLeft, Crown, Heart, Sparkles, Calendar, TrendingUp, 
    AlertCircle, Check, ChevronRight, Activity, Moon, Sun,
    Droplets, Scale, Brain, Utensils, Dumbbell, Clock
} from 'lucide-react';
import { Card, CardContent } from '../../components/ui/card';
import { Button } from '../../components/ui/button';
import { useTheme } from '../../contexts/ThemeContext';

const PCOSManagement = () => {
    const navigate = useNavigate();
    const { theme } = useTheme();
    const [activeTab, setActiveTab] = useState('tracker');
    const [cycleDay, setCycleDay] = useState(14);
    const [symptoms, setSymptoms] = useState({
        acne: false,
        hairLoss: false,
        weightGain: false,
        fatigue: false,
        moodSwings: false,
        irregularPeriods: true
    });

    const toggleSymptom = (symptom) => {
        setSymptoms(prev => ({ ...prev, [symptom]: !prev[symptom] }));
    };

    const lifestyleTips = [
        { icon: Utensils, title: "Low GI Diet", desc: "Focus on whole grains, legumes & vegetables to manage insulin resistance", color: "text-green-400", bg: "bg-green-500/10" },
        { icon: Dumbbell, title: "Regular Exercise", desc: "30 mins of moderate activity daily helps regulate hormones", color: "text-blue-400", bg: "bg-blue-500/10" },
        { icon: Moon, title: "Sleep Hygiene", desc: "7-8 hours of quality sleep supports hormonal balance", color: "text-purple-400", bg: "bg-purple-500/10" },
        { icon: Brain, title: "Stress Management", desc: "Yoga & meditation reduce cortisol levels", color: "text-pink-400", bg: "bg-pink-500/10" },
    ];

    const symptoms_list = [
        { key: 'acne', label: 'Acne', icon: Droplets },
        { key: 'hairLoss', label: 'Hair Loss', icon: Activity },
        { key: 'weightGain', label: 'Weight Gain', icon: Scale },
        { key: 'fatigue', label: 'Fatigue', icon: Moon },
        { key: 'moodSwings', label: 'Mood Swings', icon: Brain },
        { key: 'irregularPeriods', label: 'Irregular Periods', icon: Calendar },
    ];

    return (
        <div className={`min-h-screen relative overflow-hidden transition-colors duration-300 ${theme === 'dark' ? 'bg-black text-white' : 'bg-gradient-to-br from-slate-50 via-pink-50 to-purple-50 text-gray-900'}`}>
            <div className="fixed inset-0 pointer-events-none">
                <div className={`absolute inset-0 ${theme === 'dark' ? 'bg-gradient-to-br from-black via-gray-900 to-black' : 'bg-transparent'}`} />
                <div className={`absolute w-[500px] h-[500px] -top-20 -right-20 rounded-full blur-3xl animate-pulse ${theme === 'dark' ? 'bg-pink-500/10' : 'bg-pink-400/20'}`} />
                <div className={`absolute w-[500px] h-[500px] -bottom-20 -left-20 rounded-full blur-3xl animate-pulse ${theme === 'dark' ? 'bg-purple-500/10' : 'bg-purple-400/20'}`} style={{ animationDelay: '1s' }} />
            </div>

            <header className={`relative z-20 px-6 py-4 flex items-center justify-between border-b backdrop-blur-xl ${theme === 'dark' ? 'border-white/10 bg-black/50' : 'border-gray-200 bg-white/70'}`}>
                <div className="flex items-center gap-4">
                    <button onClick={() => navigate('/queens')} className={`p-2 border rounded-xl transition-all ${theme === 'dark' ? 'bg-white/5 border-white/10 hover:bg-white/10' : 'bg-white border-gray-200 hover:bg-gray-100 shadow-sm'}`}>
                        <ArrowLeft className="w-5 h-5" />
                    </button>
                    <div className="flex flex-col">
                        <div className="flex items-center gap-2">
                            <Sparkles className="w-5 h-5 text-pink-400" />
                            <h1 className="text-xl font-black tracking-tight">PCOS/PCOD <span className="text-pink-400">MANAGEMENT</span></h1>
                        </div>
                        <span className={`text-xs font-bold tracking-[0.1em] uppercase ${theme === 'dark' ? 'text-pink-300' : 'text-pink-600'}`}>Hormonal Health Tracker</span>
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
                    {['tracker', 'lifestyle', 'insights'].map(tab => (
                        <button
                            key={tab}
                            onClick={() => setActiveTab(tab)}
                            className={`flex-1 py-3 px-4 rounded-xl font-bold text-sm uppercase tracking-wider transition-all ${
                                activeTab === tab 
                                    ? 'bg-pink-500 text-white shadow-lg shadow-pink-500/30' 
                                    : (theme === 'dark' ? 'text-pink-300 hover:text-white hover:bg-white/5' : 'text-pink-600 hover:text-pink-700 hover:bg-pink-50')
                            }`}
                        >
                            {tab}
                        </button>
                    ))}
                </div>

                {activeTab === 'tracker' && (
                    <div className="space-y-6">
                        {/* Cycle Tracker */}
                        <Card className={`backdrop-blur-xl ${theme === 'dark' ? 'bg-gradient-to-br from-pink-500/20 to-purple-600/20 border-white/20' : 'bg-gradient-to-br from-pink-100 to-purple-100 border-pink-200 shadow-md'}`}>
                            <CardContent className="p-6">
                                <h3 className="text-lg font-black mb-4 flex items-center gap-2">
                                    <Calendar className="w-5 h-5 text-pink-400" />
                                    Cycle Tracker
                                </h3>
                                <div className={`flex items-center justify-between mb-4 ${theme === 'dark' ? 'text-pink-200' : 'text-pink-700'}`}>
                                    <span>Day {cycleDay} of cycle</span>
                                    <span className="text-pink-400 font-bold">
                                        {cycleDay <= 5 ? 'Menstrual Phase' : cycleDay <= 13 ? 'Follicular Phase' : cycleDay <= 16 ? 'Ovulation' : 'Luteal Phase'}
                                    </span>
                                </div>
                                <div className="relative h-4 bg-white/10 rounded-full overflow-hidden">
                                    <div 
                                        className="absolute h-full bg-gradient-to-r from-pink-500 to-purple-500 rounded-full transition-all"
                                        style={{ width: `${(cycleDay / 28) * 100}%` }}
                                    />
                                </div>
                                <div className="flex justify-between mt-2 text-xs text-pink-300">
                                    <span>Day 1</span>
                                    <span>Day 14</span>
                                    <span>Day 28</span>
                                </div>
                                <div className="flex gap-2 mt-4">
                                    <Button 
                                        onClick={() => setCycleDay(Math.max(1, cycleDay - 1))}
                                        className="flex-1 bg-white/10 hover:bg-white/20"
                                    >
                                        Previous Day
                                    </Button>
                                    <Button 
                                        onClick={() => setCycleDay(Math.min(28, cycleDay + 1))}
                                        className="flex-1 bg-pink-500 hover:bg-pink-600"
                                    >
                                        Next Day
                                    </Button>
                                </div>
                            </CardContent>
                        </Card>

                        {/* Symptom Tracker */}
                        <Card className="bg-white/5 border-white/10 backdrop-blur-xl">
                            <CardContent className="p-6">
                                <h3 className="text-lg font-black mb-4 flex items-center gap-2">
                                    <Activity className="w-5 h-5 text-purple-400" />
                                    Today's Symptoms
                                </h3>
                                <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                                    {symptoms_list.map(({ key, label, icon: Icon }) => (
                                        <button
                                            key={key}
                                            onClick={() => toggleSymptom(key)}
                                            className={`p-4 rounded-2xl border transition-all flex items-center gap-3 ${
                                                symptoms[key] 
                                                    ? 'bg-pink-500/20 border-pink-500/50 text-pink-300' 
                                                    : 'bg-white/5 border-white/10 text-pink-200 hover:bg-white/10'
                                            }`}
                                        >
                                            <Icon className="w-5 h-5" />
                                            <span className="font-medium text-sm">{label}</span>
                                            {symptoms[key] && <Check className="w-4 h-4 ml-auto" />}
                                        </button>
                                    ))}
                                </div>
                            </CardContent>
                        </Card>
                    </div>
                )}

                {activeTab === 'lifestyle' && (
                    <div className="space-y-4">
                        <h3 className="text-lg font-black mb-2">Lifestyle Recommendations</h3>
                        <p className="text-pink-200 text-sm mb-4">Evidence-based tips to manage PCOS symptoms naturally</p>
                        {lifestyleTips.map((tip, idx) => (
                            <Card key={idx} className="bg-white/5 border-white/10 backdrop-blur-xl hover:bg-white/10 transition-all">
                                <CardContent className="p-5 flex items-start gap-4">
                                    <div className={`p-3 rounded-xl ${tip.bg}`}>
                                        <tip.icon className={`w-6 h-6 ${tip.color}`} />
                                    </div>
                                    <div className="flex-1">
                                        <h4 className="font-bold text-white mb-1">{tip.title}</h4>
                                        <p className="text-sm text-pink-100">{tip.desc}</p>
                                    </div>
                                    <ChevronRight className="w-5 h-5 text-pink-300" />
                                </CardContent>
                            </Card>
                        ))}
                    </div>
                )}

                {activeTab === 'insights' && (
                    <div className="space-y-6">
                        <Card className="bg-gradient-to-br from-purple-500/20 to-pink-600/20 border-white/20 backdrop-blur-xl">
                            <CardContent className="p-6">
                                <h3 className="text-lg font-black mb-4 flex items-center gap-2">
                                    <TrendingUp className="w-5 h-5 text-purple-400" />
                                    Your PCOS Insights
                                </h3>
                                <div className="space-y-4">
                                    <div className="p-4 bg-white/5 rounded-xl">
                                        <div className="flex justify-between items-center mb-2">
                                            <span className="text-pink-200">Symptom Severity</span>
                                            <span className="text-yellow-400 font-bold">Moderate</span>
                                        </div>
                                        <div className="h-2 bg-white/10 rounded-full overflow-hidden">
                                            <div className="h-full w-[60%] bg-gradient-to-r from-green-400 via-yellow-400 to-red-400 rounded-full" />
                                        </div>
                                    </div>
                                    <div className="p-4 bg-white/5 rounded-xl">
                                        <div className="flex justify-between items-center mb-2">
                                            <span className="text-pink-200">Lifestyle Score</span>
                                            <span className="text-green-400 font-bold">Good</span>
                                        </div>
                                        <div className="h-2 bg-white/10 rounded-full overflow-hidden">
                                            <div className="h-full w-[75%] bg-green-500 rounded-full" />
                                        </div>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>

                        <div className="p-4 bg-yellow-500/10 border border-yellow-500/30 rounded-2xl flex items-start gap-3">
                            <AlertCircle className="w-5 h-5 text-yellow-400 mt-0.5" />
                            <div>
                                <h4 className="font-bold text-yellow-300 mb-1">AI Recommendation</h4>
                                <p className="text-sm text-pink-200">
                                    Based on your tracked symptoms, consider consulting an endocrinologist for hormone level testing. 
                                    Your irregular periods combined with fatigue may indicate insulin resistance.
                                </p>
                            </div>
                        </div>

                        <Button 
                            onClick={() => navigate('/consultation')}
                            className="w-full bg-pink-500 hover:bg-pink-600 py-6 text-lg font-bold"
                        >
                            Discuss with AI Doctor
                        </Button>
                    </div>
                )}
            </main>
        </div>
    );
};

export default PCOSManagement;

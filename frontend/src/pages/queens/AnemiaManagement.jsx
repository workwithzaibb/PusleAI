import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { 
    ArrowLeft, Crown, Heart, Activity, AlertCircle, 
    Check, ChevronRight, Droplets, Apple, Leaf, Coffee,
    Fish, Egg, Milk, Beef, CircleDot, TrendingUp
} from 'lucide-react';
import { Card, CardContent } from '../../components/ui/card';
import { Button } from '../../components/ui/button';
import { useTheme } from '../../contexts/ThemeContext';

const AnemiaManagement = () => {
    const navigate = useNavigate();
    const { theme } = useTheme();
    const [activeTab, setActiveTab] = useState('assessment');
    const [answers, setAnswers] = useState({});
    const [showResult, setShowResult] = useState(false);

    const questions = [
        { id: 'fatigue', q: 'Do you experience frequent fatigue or weakness?', weight: 2 },
        { id: 'pale', q: 'Have you noticed pale skin, nails, or inner eyelids?', weight: 3 },
        { id: 'breathless', q: 'Do you feel breathless during normal activities?', weight: 2 },
        { id: 'dizzy', q: 'Do you experience dizziness or lightheadedness?', weight: 2 },
        { id: 'coldHands', q: 'Are your hands and feet often cold?', weight: 1 },
        { id: 'heavyPeriods', q: 'Do you have heavy menstrual bleeding?', weight: 3 },
        { id: 'vegetarian', q: 'Are you vegetarian or vegan?', weight: 1 },
        { id: 'pregnant', q: 'Are you currently pregnant or breastfeeding?', weight: 2 },
    ];

    const ironRichFoods = [
        { name: 'Spinach (Palak)', amount: '100g cooked', iron: '3.6mg', icon: Leaf, color: 'text-green-400', bg: 'bg-green-500/10', veg: true },
        { name: 'Chickpeas (Chana)', amount: '1 cup cooked', iron: '4.7mg', icon: CircleDot, color: 'text-yellow-400', bg: 'bg-yellow-500/10', veg: true },
        { name: 'Lentils (Dal)', amount: '1 cup cooked', iron: '6.6mg', icon: CircleDot, color: 'text-orange-400', bg: 'bg-orange-500/10', veg: true },
        { name: 'Pomegranate (Anar)', amount: '1 medium', iron: '0.3mg', icon: Apple, color: 'text-red-400', bg: 'bg-red-500/10', veg: true },
        { name: 'Jaggery (Gud)', amount: '20g', iron: '2.2mg', icon: CircleDot, color: 'text-amber-400', bg: 'bg-amber-500/10', veg: true },
        { name: 'Chicken Liver', amount: '100g', iron: '9mg', icon: Beef, color: 'text-rose-400', bg: 'bg-rose-500/10', veg: false },
        { name: 'Eggs', amount: '2 whole', iron: '1.2mg', icon: Egg, color: 'text-yellow-300', bg: 'bg-yellow-500/10', veg: false },
        { name: 'Fish (Rohu)', amount: '100g', iron: '0.7mg', icon: Fish, color: 'text-blue-400', bg: 'bg-blue-500/10', veg: false },
    ];

    const tips = [
        { title: 'Vitamin C Pairing', desc: 'Consume iron-rich foods with lemon, amla, or orange juice to boost absorption by 3x', icon: Apple, color: 'text-orange-400' },
        { title: 'Avoid Tea/Coffee with Meals', desc: 'Wait 1 hour after meals before drinking tea or coffee - tannins block iron absorption', icon: Coffee, color: 'text-amber-400' },
        { title: 'Cook in Iron Kadai', desc: 'Traditional iron cookware can increase iron content of food by 16%', icon: CircleDot, color: 'text-rose-300' },
        { title: 'Dairy Timing', desc: 'Separate calcium-rich foods from iron-rich meals by 2 hours', icon: Milk, color: 'text-blue-300' },
    ];

    const calculateRisk = () => {
        const score = Object.entries(answers).reduce((acc, [key, val]) => {
            if (val === 'yes') {
                const q = questions.find(q => q.id === key);
                return acc + (q?.weight || 0);
            }
            return acc;
        }, 0);
        
        if (score >= 10) return { level: 'High', color: 'text-red-400', bg: 'bg-red-500/20', advice: 'Please consult a doctor and get a Complete Blood Count (CBC) test immediately.' };
        if (score >= 6) return { level: 'Moderate', color: 'text-yellow-400', bg: 'bg-yellow-500/20', advice: 'Consider getting tested. Focus on iron-rich foods and vitamin C intake.' };
        return { level: 'Low', color: 'text-green-400', bg: 'bg-green-500/20', advice: 'Your risk appears low. Maintain a balanced diet with iron-rich foods.' };
    };

    const risk = calculateRisk();

    return (
        <div className={`min-h-screen relative overflow-hidden transition-colors duration-300 ${theme === 'dark' ? 'bg-black text-white' : 'bg-gradient-to-br from-slate-50 via-rose-50 to-orange-50 text-gray-900'}`}>
            <div className="fixed inset-0 pointer-events-none">
                <div className={`absolute inset-0 ${theme === 'dark' ? 'bg-gradient-to-br from-black via-gray-900 to-black' : 'bg-transparent'}`} />
                <div className={`absolute w-[500px] h-[500px] -top-20 -right-20 rounded-full blur-3xl animate-pulse ${theme === 'dark' ? 'bg-rose-500/10' : 'bg-rose-400/20'}`} />
                <div className={`absolute w-[500px] h-[500px] -bottom-20 -left-20 rounded-full blur-3xl animate-pulse ${theme === 'dark' ? 'bg-orange-500/10' : 'bg-orange-400/20'}`} style={{ animationDelay: '1s' }} />
            </div>

            <header className={`relative z-20 px-6 py-4 flex items-center justify-between border-b backdrop-blur-xl ${theme === 'dark' ? 'border-white/10 bg-black/50' : 'border-gray-200 bg-white/70'}`}>
                <div className="flex items-center gap-4">
                    <button onClick={() => navigate('/queens')} className={`p-2 border rounded-xl transition-all ${theme === 'dark' ? 'bg-white/5 border-white/10 hover:bg-white/10' : 'bg-white border-gray-200 hover:bg-gray-100 shadow-sm'}`}>
                        <ArrowLeft className="w-5 h-5" />
                    </button>
                    <div className="flex flex-col">
                        <div className="flex items-center gap-2">
                            <Droplets className="w-5 h-5 text-rose-400" />
                            <h1 className="text-xl font-black tracking-tight">ANEMIA & <span className="text-rose-400">NUTRITION</span></h1>
                        </div>
                        <span className={`text-xs font-bold tracking-[0.1em] uppercase ${theme === 'dark' ? 'text-rose-300' : 'text-rose-600'}`}>Iron Deficiency Assessment</span>
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
                    {['assessment', 'foods', 'tips'].map(tab => (
                        <button
                            key={tab}
                            onClick={() => setActiveTab(tab)}
                            className={`flex-1 py-3 px-4 rounded-xl font-bold text-sm uppercase tracking-wider transition-all ${
                                activeTab === tab 
                                    ? 'bg-rose-500 text-white shadow-lg shadow-rose-500/30' 
                                    : (theme === 'dark' ? 'text-rose-300 hover:text-white hover:bg-white/5' : 'text-rose-600 hover:text-rose-700 hover:bg-rose-50')
                            }`}
                        >
                            {tab}
                        </button>
                    ))}
                </div>

                {activeTab === 'assessment' && (
                    <div className="space-y-6">
                        {!showResult ? (
                            <>
                                <Card className={`backdrop-blur-xl ${theme === 'dark' ? 'bg-gradient-to-br from-rose-500/20 to-orange-600/20 border-white/20' : 'bg-gradient-to-br from-rose-100 to-orange-100 border-rose-200 shadow-md'}`}>
                                    <CardContent className="p-6">
                                        <h3 className="text-lg font-black mb-2 flex items-center gap-2">
                                            <Activity className="w-5 h-5 text-rose-400" />
                                            Anemia Risk Assessment
                                        </h3>
                                        <p className={`text-sm ${theme === 'dark' ? 'text-rose-100' : 'text-rose-700'}`}>Answer these questions to assess your risk of iron-deficiency anemia.</p>
                                    </CardContent>
                                </Card>

                                <div className="space-y-3">
                                    {questions.map((q, idx) => (
                                        <Card key={idx} className="bg-white/5 border-white/10 backdrop-blur-xl">
                                            <CardContent className="p-4">
                                                <p className="text-white mb-3">{q.q}</p>
                                                <div className="flex gap-2">
                                                    {['yes', 'no'].map(opt => (
                                                        <button
                                                            key={opt}
                                                            onClick={() => setAnswers(prev => ({ ...prev, [q.id]: opt }))}
                                                            className={`flex-1 py-2 px-4 rounded-xl font-bold text-sm uppercase transition-all ${
                                                                answers[q.id] === opt
                                                                    ? opt === 'yes' 
                                                                        ? 'bg-rose-500 text-white' 
                                                                        : 'bg-green-500 text-white'
                                                                    : 'bg-white/10 text-rose-200 hover:bg-white/20'
                                                            }`}
                                                        >
                                                            {opt}
                                                        </button>
                                                    ))}
                                                </div>
                                            </CardContent>
                                        </Card>
                                    ))}
                                </div>

                                <Button 
                                    onClick={() => setShowResult(true)}
                                    className="w-full bg-rose-500 hover:bg-rose-600 py-6 text-lg font-bold"
                                    disabled={Object.keys(answers).length < questions.length}
                                >
                                    Calculate Risk
                                </Button>
                            </>
                        ) : (
                            <div className="space-y-6">
                                <Card className={`${risk.bg} border-white/20 backdrop-blur-xl`}>
                                    <CardContent className="p-6 text-center">
                                        <div className={`text-5xl font-black ${risk.color} mb-2`}>{risk.level}</div>
                                        <p className="text-rose-100">Anemia Risk Level</p>
                                    </CardContent>
                                </Card>

                                <div className="p-4 bg-white/5 border border-white/10 rounded-2xl">
                                    <h4 className="font-bold text-white mb-2 flex items-center gap-2">
                                        <AlertCircle className="w-5 h-5 text-yellow-400" />
                                        Recommendation
                                    </h4>
                                    <p className="text-rose-100">{risk.advice}</p>
                                </div>

                                <div className="flex gap-3">
                                    <Button 
                                        onClick={() => { setShowResult(false); setAnswers({}); }}
                                        className="flex-1 bg-white/10 hover:bg-white/20"
                                    >
                                        Retake Assessment
                                    </Button>
                                    <Button 
                                        onClick={() => navigate('/consultation')}
                                        className="flex-1 bg-rose-500 hover:bg-rose-600"
                                    >
                                        Consult AI Doctor
                                    </Button>
                                </div>
                            </div>
                        )}
                    </div>
                )}

                {activeTab === 'foods' && (
                    <div className="space-y-4">
                        <Card className="bg-gradient-to-br from-green-500/20 to-emerald-600/20 border-white/20 backdrop-blur-xl">
                            <CardContent className="p-6">
                                <h3 className="text-lg font-black mb-2">Iron-Rich Indian Foods</h3>
                                <p className="text-rose-100 text-sm">Daily iron requirement: 18mg for women, 27mg during pregnancy</p>
                            </CardContent>
                        </Card>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                            {ironRichFoods.map((food, idx) => (
                                <Card key={idx} className="bg-white/5 border-white/10 backdrop-blur-xl hover:bg-white/10 transition-all">
                                    <CardContent className="p-4 flex items-center gap-4">
                                        <div className={`p-3 rounded-xl ${food.bg}`}>
                                            <food.icon className={`w-5 h-5 ${food.color}`} />
                                        </div>
                                        <div className="flex-1">
                                            <div className="flex items-center gap-2">
                                                <h4 className="font-bold text-white">{food.name}</h4>
                                                {food.veg && <Leaf className="w-3 h-3 text-green-400" />}
                                            </div>
                                            <p className="text-xs text-rose-200">{food.amount}</p>
                                        </div>
                                        <div className="text-right">
                                            <span className={`font-bold ${food.color}`}>{food.iron}</span>
                                            <p className="text-xs text-rose-300">iron</p>
                                        </div>
                                    </CardContent>
                                </Card>
                            ))}
                        </div>
                    </div>
                )}

                {activeTab === 'tips' && (
                    <div className="space-y-4">
                        <h3 className="text-lg font-black">Absorption Tips</h3>
                        <p className="text-rose-200 text-sm mb-4">Maximize iron absorption with these evidence-based strategies</p>
                        
                        {tips.map((tip, idx) => (
                            <Card key={idx} className="bg-white/5 border-white/10 backdrop-blur-xl">
                                <CardContent className="p-5 flex items-start gap-4">
                                    <div className="p-3 rounded-xl bg-white/10">
                                        <tip.icon className={`w-6 h-6 ${tip.color}`} />
                                    </div>
                                    <div className="flex-1">
                                        <h4 className="font-bold text-white mb-1">{tip.title}</h4>
                                        <p className="text-sm text-rose-100">{tip.desc}</p>
                                    </div>
                                </CardContent>
                            </Card>
                        ))}

                        <Button 
                            onClick={() => navigate('/queens/diet')}
                            className="w-full bg-green-500 hover:bg-green-600 py-6 text-lg font-bold mt-4"
                        >
                            <Apple className="w-5 h-5 mr-2" />
                            View Personalized Diet Plan
                        </Button>
                    </div>
                )}
            </main>
        </div>
    );
};

export default AnemiaManagement;

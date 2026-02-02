import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { 
    ArrowLeft, Crown, Heart, Baby, Calendar, AlertTriangle, 
    Check, ChevronRight, Activity, Clock, Shield, Stethoscope,
    ThermometerSun, Scale, Droplets, Apple, Bell, Sparkles, Wind, Sun, Moon
} from 'lucide-react';
import { Card, CardContent } from '../../components/ui/card';
import { Button } from '../../components/ui/button';
import { useTheme } from '../../contexts/ThemeContext';

const MaternalHealth = () => {
    const navigate = useNavigate();
    const { theme } = useTheme();
    const [activeTab, setActiveTab] = useState('tracker');
    const [pregnancyWeek, setPregnancyWeek] = useState(16);
    const [todaySymptoms, setTodaySymptoms] = useState([]);

    const toggleSymptom = (symptom) => {
        setTodaySymptoms(prev => 
            prev.includes(symptom) 
                ? prev.filter(s => s !== symptom)
                : [...prev, symptom]
        );
    };

    const trimester = pregnancyWeek <= 12 ? 1 : pregnancyWeek <= 27 ? 2 : 3;
    const trimesterInfo = {
        1: { name: 'First Trimester', color: 'text-green-400', desc: 'Baby is developing vital organs' },
        2: { name: 'Second Trimester', color: 'text-blue-400', desc: 'Baby is growing rapidly, you may feel movements' },
        3: { name: 'Third Trimester', color: 'text-purple-400', desc: 'Baby is preparing for birth' }
    };

    const redFlags = [
        { symptom: 'Severe headache', severity: 'high' },
        { symptom: 'Vaginal bleeding', severity: 'high' },
        { symptom: 'Severe abdominal pain', severity: 'high' },
        { symptom: 'Reduced fetal movement', severity: 'high' },
        { symptom: 'High fever (>101°F)', severity: 'medium' },
        { symptom: 'Swelling in face/hands', severity: 'medium' },
        { symptom: 'Blurred vision', severity: 'high' },
        { symptom: 'Difficulty breathing', severity: 'high' },
    ];

    const weeklyChecklist = [
        { icon: Scale, title: 'Weight Check', desc: 'Track weekly weight gain', done: true },
        { icon: ThermometerSun, title: 'Blood Pressure', desc: 'Monitor BP regularly', done: false },
        { icon: Droplets, title: 'Hydration', desc: '8-10 glasses of water daily', done: true },
        { icon: Apple, title: 'Prenatal Vitamins', desc: 'Folic acid & iron supplements', done: true },
    ];

    const milestones = [
        { week: 8, title: 'First Heartbeat', desc: 'Baby\'s heart starts beating' },
        { week: 12, title: 'First Trimester Ends', desc: 'Risk of miscarriage decreases' },
        { week: 20, title: 'Anatomy Scan', desc: 'Detailed ultrasound checkup' },
        { week: 24, title: 'Viability', desc: 'Baby can survive outside womb' },
        { week: 28, title: 'Third Trimester', desc: 'Final growth phase begins' },
        { week: 37, title: 'Full Term', desc: 'Baby is ready for birth' },
    ];

    const yogaPoses = {
        1: [ // First Trimester
            { name: 'Cat-Cow Stretch', sanskrit: 'Marjaryasana-Bitilasana', duration: '5 mins', benefit: 'Relieves back tension, improves spine flexibility', icon: '🐱', difficulty: 'Easy', instructions: 'On hands and knees, alternate between arching and rounding your back with breath.', image: 'https://images.unsplash.com/photo-1544367567-0f2fcb009e0b?w=400&h=300&fit=crop' },
            { name: 'Butterfly Pose', sanskrit: 'Baddha Konasana', duration: '3 mins', benefit: 'Opens hips, improves circulation to pelvis', icon: '🦋', difficulty: 'Easy', instructions: 'Sit with soles of feet together, gently press knees toward floor.', image: 'https://images.unsplash.com/photo-1506126613408-eca07ce68773?w=400&h=300&fit=crop' },
            { name: 'Standing Side Stretch', sanskrit: 'Parsva Urdhva Hastasana', duration: '2 mins', benefit: 'Stretches sides, creates space for growing baby', icon: '🌙', difficulty: 'Easy', instructions: 'Stand tall, raise arms overhead and gently lean to each side.', image: 'https://images.unsplash.com/photo-1575052814086-f385e2e2ad1b?w=400&h=300&fit=crop' },
            { name: 'Gentle Twist (Seated)', sanskrit: 'Bharadvajasana', duration: '3 mins', benefit: 'Aids digestion, relieves lower back', icon: '🔄', difficulty: 'Easy', instructions: 'Seated twist, keeping belly open and twist from upper back only.', image: 'https://images.unsplash.com/photo-1552196563-55cd4e45efb3?w=400&h=300&fit=crop' },
        ],
        2: [ // Second Trimester
            { name: 'Warrior II', sanskrit: 'Virabhadrasana II', duration: '3 mins', benefit: 'Strengthens legs, opens hips, builds stamina', icon: '⚔️', difficulty: 'Medium', instructions: 'Wide stance, front knee bent, arms extended parallel to floor.', image: 'https://images.unsplash.com/photo-1599901860904-17e6ed7083a0?w=400&h=300&fit=crop' },
            { name: 'Triangle Pose', sanskrit: 'Trikonasana', duration: '2 mins', benefit: 'Stretches sides, strengthens legs, aids digestion', icon: '📐', difficulty: 'Medium', instructions: 'Wide stance, reach forward then down, using block if needed.', image: 'https://images.unsplash.com/photo-1573590330099-d6c7355ec595?w=400&h=300&fit=crop' },
            { name: 'Goddess Pose', sanskrit: 'Utkata Konasana', duration: '2 mins', benefit: 'Opens hips, strengthens thighs for labor', icon: '👑', difficulty: 'Medium', instructions: 'Wide squat with toes turned out, knees tracking over ankles.', image: 'https://images.unsplash.com/photo-1510894347713-fc3ed6fdf539?w=400&h=300&fit=crop' },
            { name: 'Child\'s Pose (Wide)', sanskrit: 'Balasana', duration: '5 mins', benefit: 'Rests body, relieves back pain, calms mind', icon: '🧒', difficulty: 'Easy', instructions: 'Knees wide apart to accommodate belly, arms extended forward.', image: 'https://images.unsplash.com/photo-1544367567-0f2fcb009e0b?w=400&h=300&fit=crop' },
            { name: 'Supported Bridge', sanskrit: 'Setu Bandhasana', duration: '3 mins', benefit: 'Opens chest, strengthens back and glutes', icon: '🌉', difficulty: 'Medium', instructions: 'On back with block under sacrum for support (avoid lying flat too long).', image: 'https://images.unsplash.com/photo-1518611012118-696072aa579a?w=400&h=300&fit=crop' },
        ],
        3: [ // Third Trimester
            { name: 'Squatting Pose', sanskrit: 'Malasana', duration: '3 mins', benefit: 'Opens pelvis, prepares for birth, relieves pressure', icon: '🧘', difficulty: 'Medium', instructions: 'Deep squat with support, heels down or on blanket.', image: 'https://images.unsplash.com/photo-1506126613408-eca07ce68773?w=400&h=300&fit=crop' },
            { name: 'Pelvic Tilts', sanskrit: 'Chakravakasana variation', duration: '5 mins', benefit: 'Relieves back pain, helps baby position', icon: '🔃', difficulty: 'Easy', instructions: 'On hands and knees, tuck and release pelvis rhythmically.', image: 'https://images.unsplash.com/photo-1544367567-0f2fcb009e0b?w=400&h=300&fit=crop' },
            { name: 'Side-Lying Savasana', sanskrit: 'Savasana variation', duration: '10 mins', benefit: 'Deep relaxation, improves circulation', icon: '😴', difficulty: 'Easy', instructions: 'Lie on left side with pillows between knees and under belly.', image: 'https://images.unsplash.com/photo-1552196563-55cd4e45efb3?w=400&h=300&fit=crop' },
            { name: 'Wall Push-Ups', sanskrit: 'Modified Chaturanga', duration: '3 mins', benefit: 'Maintains arm strength, safe for late pregnancy', icon: '🧱', difficulty: 'Easy', instructions: 'Stand arm\'s length from wall, perform push-ups against wall.', image: 'https://images.unsplash.com/photo-1571019614242-c5c5dee9f50b?w=400&h=300&fit=crop' },
            { name: 'Legs Up the Wall', sanskrit: 'Viparita Karani', duration: '5 mins', benefit: 'Reduces swelling, relieves tired legs', icon: '🦵', difficulty: 'Easy', instructions: 'Lie on side near wall, swing legs up, use pillow under hips.', image: 'https://images.unsplash.com/photo-1518611012118-696072aa579a?w=400&h=300&fit=crop' },
        ]
    };

    const breathingExercises = [
        { name: 'Ujjayi Breath', desc: 'Ocean breath for calm and focus during labor', duration: '5 mins', icon: Wind },
        { name: '4-7-8 Breathing', desc: 'Inhale 4s, hold 7s, exhale 8s for deep relaxation', duration: '5 mins', icon: Moon },
        { name: 'Birth Breathing', desc: 'Long exhales to prepare for pushing stage', duration: '5 mins', icon: Sun },
    ];

    const yogaSafetyTips = [
        'Avoid hot yoga and overheating',
        'Don\'t lie flat on back after 20 weeks',
        'Skip deep twists and belly-down poses',
        'Use props (blocks, bolsters) generously',
        'Stay hydrated before, during, and after',
        'Listen to your body - stop if uncomfortable',
    ];

    const hasRedFlag = todaySymptoms.some(s => 
        redFlags.find(rf => rf.symptom === s && rf.severity === 'high')
    );

    return (
        <div className={`min-h-screen relative overflow-hidden transition-colors duration-300 ${theme === 'dark' ? 'bg-black text-white' : 'bg-gradient-to-br from-slate-50 via-purple-50 to-pink-50 text-gray-900'}`}>
            <div className="fixed inset-0 pointer-events-none">
                <div className={`absolute inset-0 ${theme === 'dark' ? 'bg-gradient-to-br from-black via-gray-900 to-black' : 'bg-transparent'}`} />
                <div className={`absolute w-[500px] h-[500px] -top-20 -right-20 rounded-full blur-3xl animate-pulse ${theme === 'dark' ? 'bg-purple-500/10' : 'bg-purple-400/20'}`} />
                <div className={`absolute w-[500px] h-[500px] -bottom-20 -left-20 rounded-full blur-3xl animate-pulse ${theme === 'dark' ? 'bg-pink-500/10' : 'bg-pink-400/20'}`} style={{ animationDelay: '1s' }} />
            </div>

            <header className={`relative z-20 px-6 py-4 flex items-center justify-between border-b backdrop-blur-xl ${theme === 'dark' ? 'border-white/10 bg-black/50' : 'border-gray-200 bg-white/70'}`}>
                <div className="flex items-center gap-4">
                    <button onClick={() => navigate('/queens')} className={`p-2 border rounded-xl transition-all ${theme === 'dark' ? 'bg-white/5 border-white/10 hover:bg-white/10' : 'bg-white border-gray-200 hover:bg-gray-100 shadow-sm'}`}>
                        <ArrowLeft className="w-5 h-5" />
                    </button>
                    <div className="flex flex-col">
                        <div className="flex items-center gap-2">
                            <Baby className="w-5 h-5 text-purple-400" />
                            <h1 className="text-xl font-black tracking-tight">MATERNAL <span className="text-purple-400">COMPANION</span></h1>
                        </div>
                        <span className="text-xs font-bold tracking-[0.1em] text-purple-300 uppercase">Pregnancy Care & Tracking</span>
                    </div>
                </div>
                <Link to="/queens" className="flex items-center gap-2 opacity-50 hover:opacity-100 transition-opacity">
                    <Crown className="w-5 h-5 text-pink-400" />
                    <span className="text-sm font-black hidden md:block">FOR <span className="text-pink-400">QUEENS</span></span>
                </Link>
            </header>

            {hasRedFlag && (
                <div className="relative z-20 mx-6 mt-4 p-4 bg-red-500/20 border border-red-500/50 rounded-2xl flex items-center gap-3 animate-pulse">
                    <AlertTriangle className="w-6 h-6 text-red-400" />
                    <div className="flex-1">
                        <h4 className="font-bold text-red-300">Emergency Alert</h4>
                        <p className="text-sm text-red-200">You've reported a serious symptom. Please seek immediate medical attention.</p>
                    </div>
                    <Button className="bg-red-500 hover:bg-red-600" onClick={() => navigate('/emergency')}>
                        Get Help
                    </Button>
                </div>
            )}

            <main className="relative z-10 p-6 max-w-4xl mx-auto space-y-6 pb-24">
                {/* Week Tracker */}
                <Card className="bg-gradient-to-br from-purple-500/20 to-pink-600/20 border-white/20 backdrop-blur-xl">
                    <CardContent className="p-6">
                        <div className="flex items-center justify-between mb-4">
                            <div>
                                <h3 className="text-2xl font-black">Week {pregnancyWeek}</h3>
                                <p className={`${trimesterInfo[trimester].color} font-bold`}>{trimesterInfo[trimester].name}</p>
                            </div>
                            <div className="text-right">
                                <p className="text-purple-200 text-sm">{40 - pregnancyWeek} weeks to go</p>
                                <p className="text-purple-100 text-sm">{trimesterInfo[trimester].desc}</p>
                            </div>
                        </div>
                        <div className="relative h-4 bg-white/10 rounded-full overflow-hidden mb-4">
                            <div 
                                className="absolute h-full bg-gradient-to-r from-purple-500 to-pink-500 rounded-full transition-all"
                                style={{ width: `${(pregnancyWeek / 40) * 100}%` }}
                            />
                            {milestones.map(m => (
                                <div 
                                    key={m.week}
                                    className={`absolute top-1/2 -translate-y-1/2 w-2 h-2 rounded-full ${pregnancyWeek >= m.week ? 'bg-white' : 'bg-purple-400'}`}
                                    style={{ left: `${(m.week / 40) * 100}%` }}
                                    title={m.title}
                                />
                            ))}
                        </div>
                        <div className="flex gap-2">
                            <Button 
                                onClick={() => setPregnancyWeek(Math.max(1, pregnancyWeek - 1))}
                                className="flex-1 bg-white/10 hover:bg-white/20"
                            >
                                Previous Week
                            </Button>
                            <Button 
                                onClick={() => setPregnancyWeek(Math.min(40, pregnancyWeek + 1))}
                                className="flex-1 bg-purple-500 hover:bg-purple-600"
                            >
                                Next Week
                            </Button>
                        </div>
                    </CardContent>
                </Card>

                {/* Tab Navigation */}
                <div className={`flex gap-2 p-1 rounded-2xl border ${theme === 'dark' ? 'bg-white/5 border-white/10' : 'bg-white border-gray-200 shadow-md'}`}>
                    {['tracker', 'yoga', 'red-flags', 'checklist'].map(tab => (
                        <button
                            key={tab}
                            onClick={() => setActiveTab(tab)}
                            className={`flex-1 py-3 px-4 rounded-xl font-bold text-sm uppercase tracking-wider transition-all ${
                                activeTab === tab 
                                    ? 'bg-purple-500 text-white shadow-lg shadow-purple-500/30' 
                                    : (theme === 'dark' ? 'text-purple-300 hover:text-white hover:bg-white/5' : 'text-purple-600 hover:text-purple-700 hover:bg-purple-50')
                            }`}
                        >
                            {tab.replace('-', ' ')}
                        </button>
                    ))}
                </div>

                {activeTab === 'tracker' && (
                    <div className="space-y-4">
                        <h3 className={`text-lg font-black ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>Upcoming Milestones</h3>
                        {milestones.filter(m => m.week >= pregnancyWeek).slice(0, 3).map((milestone, idx) => (
                            <Card key={idx} className={`backdrop-blur-xl ${theme === 'dark' ? 'bg-white/5 border-white/10' : 'bg-white border-gray-200 shadow-md'}`}>
                                <CardContent className="p-4 flex items-center gap-4">
                                    <div className={`w-12 h-12 rounded-full flex items-center justify-center ${theme === 'dark' ? 'bg-purple-500/20' : 'bg-purple-100'}`}>
                                        <span className="font-black text-purple-400">{milestone.week}</span>
                                    </div>
                                    <div className="flex-1">
                                        <h4 className={`font-bold ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>{milestone.title}</h4>
                                        <p className={`text-sm ${theme === 'dark' ? 'text-purple-200' : 'text-purple-600'}`}>{milestone.desc}</p>
                                    </div>
                                    <span className={`text-xs ${theme === 'dark' ? 'text-purple-300' : 'text-purple-500'}`}>{milestone.week - pregnancyWeek} weeks away</span>
                                </CardContent>
                            </Card>
                        ))}
                    </div>
                )}

                {activeTab === 'yoga' && (
                    <div className="space-y-6">
                        {/* Yoga Header */}
                        <Card className={`backdrop-blur-xl ${theme === 'dark' ? 'bg-gradient-to-br from-purple-500/20 to-pink-600/20 border-white/20' : 'bg-gradient-to-br from-purple-100 to-pink-100 border-purple-200 shadow-md'}`}>
                            <CardContent className="p-6">
                                <div className="flex items-center gap-3 mb-3">
                                    <div className={`p-3 rounded-2xl ${theme === 'dark' ? 'bg-purple-500/30' : 'bg-purple-200'}`}>
                                        <Sparkles className="w-6 h-6 text-purple-400" />
                                    </div>
                                    <div>
                                        <h3 className={`text-xl font-black ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>Prenatal Yoga</h3>
                                        <p className={`text-sm ${theme === 'dark' ? 'text-purple-200' : 'text-purple-600'}`}>Safe poses for {trimesterInfo[trimester].name}</p>
                                    </div>
                                </div>
                                <p className={`text-sm leading-relaxed ${theme === 'dark' ? 'text-purple-100' : 'text-purple-700'}`}>
                                    Yoga during pregnancy helps reduce stress, improve sleep, increase strength and flexibility, and prepare your body for labor.
                                </p>
                            </CardContent>
                        </Card>

                        {/* Safety Tips */}
                        <div className={`p-4 rounded-2xl border ${theme === 'dark' ? 'bg-yellow-500/10 border-yellow-500/30' : 'bg-yellow-50 border-yellow-200'}`}>
                            <h4 className={`font-bold mb-2 flex items-center gap-2 ${theme === 'dark' ? 'text-yellow-300' : 'text-yellow-700'}`}>
                                <AlertTriangle className="w-4 h-4" />
                                Safety Guidelines
                            </h4>
                            <div className="grid grid-cols-2 gap-2">
                                {yogaSafetyTips.map((tip, idx) => (
                                    <div key={idx} className={`flex items-start gap-2 text-xs ${theme === 'dark' ? 'text-yellow-200' : 'text-yellow-700'}`}>
                                        <Check className="w-3 h-3 mt-0.5 flex-shrink-0" />
                                        <span>{tip}</span>
                                    </div>
                                ))}
                            </div>
                        </div>

                        {/* Breathing Exercises */}
                        <div>
                            <h4 className={`font-bold mb-3 flex items-center gap-2 ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                                <Wind className="w-5 h-5 text-cyan-400" />
                                Breathing Exercises
                            </h4>
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                                {breathingExercises.map((exercise, idx) => (
                                    <Card key={idx} className={`backdrop-blur-xl cursor-pointer transition-all hover:scale-[1.02] ${theme === 'dark' ? 'bg-cyan-500/10 border-cyan-500/30 hover:bg-cyan-500/20' : 'bg-cyan-50 border-cyan-200 hover:bg-cyan-100 shadow-sm'}`}>
                                        <CardContent className="p-4">
                                            <div className={`p-2 rounded-xl w-fit mb-2 ${theme === 'dark' ? 'bg-cyan-500/20' : 'bg-cyan-100'}`}>
                                                <exercise.icon className="w-5 h-5 text-cyan-400" />
                                            </div>
                                            <h5 className={`font-bold text-sm ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>{exercise.name}</h5>
                                            <p className={`text-xs mt-1 ${theme === 'dark' ? 'text-cyan-200' : 'text-cyan-700'}`}>{exercise.desc}</p>
                                            <span className={`text-xs font-medium mt-2 inline-block ${theme === 'dark' ? 'text-cyan-300' : 'text-cyan-600'}`}>{exercise.duration}</span>
                                        </CardContent>
                                    </Card>
                                ))}
                            </div>
                        </div>

                        {/* Yoga Poses for Current Trimester */}
                        <div>
                            <h4 className={`font-bold mb-3 flex items-center gap-2 ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                                <span className="text-2xl">🧘‍♀️</span>
                                Recommended Poses for Week {pregnancyWeek}
                            </h4>
                            <div className="space-y-4">
                                {yogaPoses[trimester].map((pose, idx) => (
                                    <Card key={idx} className={`backdrop-blur-xl transition-all overflow-hidden ${theme === 'dark' ? 'bg-white/5 border-white/10 hover:bg-white/10' : 'bg-white border-gray-200 shadow-md hover:shadow-lg'}`}>
                                        <CardContent className="p-0">
                                            <div className="flex flex-col md:flex-row">
                                                {/* Pose Image */}
                                                <div className="md:w-48 h-48 md:h-auto relative overflow-hidden flex-shrink-0">
                                                    <img 
                                                        src={pose.image} 
                                                        alt={pose.name}
                                                        className="w-full h-full object-cover"
                                                        onError={(e) => {
                                                            e.target.onerror = null;
                                                            e.target.src = `https://placehold.co/400x300/7c3aed/white?text=${encodeURIComponent(pose.name)}`;
                                                        }}
                                                    />
                                                    <div className={`absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent`} />
                                                    <div className="absolute bottom-2 left-2 flex items-center gap-2">
                                                        <span className={`text-xs px-2 py-1 rounded-full backdrop-blur-sm ${
                                                            pose.difficulty === 'Easy' 
                                                                ? 'bg-green-500/80 text-white'
                                                                : 'bg-yellow-500/80 text-white'
                                                        }`}>{pose.difficulty}</span>
                                                        <span className="text-xs px-2 py-1 rounded-full bg-white/20 backdrop-blur-sm text-white flex items-center gap-1">
                                                            <Clock className="w-3 h-3" /> {pose.duration}
                                                        </span>
                                                    </div>
                                                </div>
                                                
                                                {/* Pose Details */}
                                                <div className="flex-1 p-4">
                                                    <div className="flex items-start gap-3">
                                                        <div className={`text-2xl p-2 rounded-xl flex-shrink-0 ${theme === 'dark' ? 'bg-purple-500/20' : 'bg-purple-100'}`}>
                                                            {pose.icon}
                                                        </div>
                                                        <div className="flex-1 min-w-0">
                                                            <h5 className={`font-bold text-lg ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>{pose.name}</h5>
                                                            <p className={`text-xs italic ${theme === 'dark' ? 'text-purple-300' : 'text-purple-500'}`}>{pose.sanskrit}</p>
                                                        </div>
                                                    </div>
                                                    
                                                    <p className={`text-sm mt-3 ${theme === 'dark' ? 'text-purple-200' : 'text-purple-700'}`}>
                                                        <span className="font-semibold">Benefits: </span>{pose.benefit}
                                                    </p>
                                                    
                                                    <div className={`mt-3 p-3 rounded-xl text-sm ${theme === 'dark' ? 'bg-white/5 border border-white/10' : 'bg-purple-50 border border-purple-100'}`}>
                                                        <span className={`font-semibold ${theme === 'dark' ? 'text-purple-300' : 'text-purple-600'}`}>📋 Instructions: </span>
                                                        <span className={theme === 'dark' ? 'text-purple-100' : 'text-gray-700'}>{pose.instructions}</span>
                                                    </div>
                                                </div>
                                            </div>
                                        </CardContent>
                                    </Card>
                                ))}
                            </div>
                        </div>

                        {/* Start Session Button */}
                        <Button 
                            className="w-full bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 py-6 text-lg font-bold shadow-lg shadow-purple-500/30"
                        >
                            <Sparkles className="w-5 h-5 mr-2" />
                            Start Guided Yoga Session
                        </Button>
                    </div>
                )}

                {activeTab === 'red-flags' && (
                    <div className="space-y-4">
                        <div className={`p-4 rounded-2xl border ${theme === 'dark' ? 'bg-red-500/10 border-red-500/30' : 'bg-red-50 border-red-200'}`}>
                            <h3 className={`text-lg font-black mb-2 flex items-center gap-2 ${theme === 'dark' ? 'text-red-300' : 'text-red-600'}`}>
                                <AlertTriangle className="w-5 h-5" />
                                Emergency Red Flags
                            </h3>
                            <p className={`text-sm mb-4 ${theme === 'dark' ? 'text-purple-100' : 'text-red-700'}`}>Tap any symptom you're experiencing. High-severity symptoms require immediate medical attention.</p>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                            {redFlags.map((flag, idx) => (
                                <button
                                    key={idx}
                                    onClick={() => toggleSymptom(flag.symptom)}
                                    className={`p-4 rounded-2xl border transition-all flex items-center gap-3 text-left ${
                                        todaySymptoms.includes(flag.symptom)
                                            ? flag.severity === 'high' 
                                                ? 'bg-red-500/20 border-red-500/50 text-red-300'
                                                : 'bg-yellow-500/20 border-yellow-500/50 text-yellow-300'
                                            : (theme === 'dark' ? 'bg-white/5 border-white/10 text-purple-200 hover:bg-white/10' : 'bg-white border-gray-200 text-purple-700 hover:bg-purple-50 shadow-sm')
                                    }`}
                                >
                                    <div className={`w-3 h-3 rounded-full ${flag.severity === 'high' ? 'bg-red-500' : 'bg-yellow-500'}`} />
                                    <span className="font-medium text-sm flex-1">{flag.symptom}</span>
                                    {todaySymptoms.includes(flag.symptom) && <Check className="w-4 h-4" />}
                                </button>
                            ))}
                        </div>
                    </div>
                )}

                {activeTab === 'checklist' && (
                    <div className="space-y-4">
                        <h3 className={`text-lg font-black ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>Weekly Checklist</h3>
                        {weeklyChecklist.map((item, idx) => (
                            <Card key={idx} className={`backdrop-blur-xl transition-all ${item.done ? (theme === 'dark' ? 'bg-green-500/10 border-green-500/30' : 'bg-green-50 border-green-200') : (theme === 'dark' ? 'bg-white/5 border-white/10' : 'bg-white border-gray-200 shadow-md')}`}>
                                <CardContent className="p-4 flex items-center gap-4">
                                    <div className={`p-3 rounded-xl ${item.done ? (theme === 'dark' ? 'bg-green-500/20' : 'bg-green-100') : (theme === 'dark' ? 'bg-white/10' : 'bg-gray-100')}`}>
                                        <item.icon className={`w-5 h-5 ${item.done ? 'text-green-400' : (theme === 'dark' ? 'text-purple-300' : 'text-purple-500')}`} />
                                    </div>
                                    <div className="flex-1">
                                        <h4 className={`font-bold ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>{item.title}</h4>
                                        <p className={`text-sm ${theme === 'dark' ? 'text-purple-200' : 'text-purple-600'}`}>{item.desc}</p>
                                    </div>
                                    {item.done && <Check className="w-5 h-5 text-green-400" />}
                                </CardContent>
                            </Card>
                        ))}
                        
                        <Button 
                            onClick={() => navigate('/consultation')}
                            className="w-full bg-purple-500 hover:bg-purple-600 py-6 text-lg font-bold mt-4"
                        >
                            <Stethoscope className="w-5 h-5 mr-2" />
                            Ask AI Doctor About Pregnancy
                        </Button>
                    </div>
                )}
            </main>
        </div>
    );
};

export default MaternalHealth;

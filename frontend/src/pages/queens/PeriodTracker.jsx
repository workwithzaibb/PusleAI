import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { 
    ArrowLeft, Crown, Calendar, Droplet, Heart, Sun, Moon,
    ChevronLeft, ChevronRight, AlertCircle, Sparkles, Baby,
    TrendingUp, Clock, Plus, X, Check, Flame, CloudRain
} from 'lucide-react';
import { Card, CardContent } from '../../components/ui/card';
import { Button } from '../../components/ui/button';
import { useTheme } from '../../contexts/ThemeContext';

const PeriodTracker = () => {
    const navigate = useNavigate();
    const { theme } = useTheme();
    const [currentDate, setCurrentDate] = useState(new Date());
    const [selectedDate, setSelectedDate] = useState(null);
    const [showLogModal, setShowLogModal] = useState(false);
    const [activeTab, setActiveTab] = useState('calendar');
    
    // Period data stored in localStorage
    const [periodData, setPeriodData] = useState(() => {
        const saved = localStorage.getItem('periodTrackerData');
        return saved ? JSON.parse(saved) : {
            periods: [], // Array of { startDate, endDate, symptoms }
            cycleLength: 28,
            periodLength: 5,
            lastPeriodStart: null
        };
    });

    // Log entry state
    const [logEntry, setLogEntry] = useState({
        flow: null, // 'light', 'medium', 'heavy'
        symptoms: [],
        mood: null,
        notes: ''
    });

    useEffect(() => {
        localStorage.setItem('periodTrackerData', JSON.stringify(periodData));
    }, [periodData]);

    const symptoms = [
        { id: 'cramps', label: 'Cramps', icon: '😣' },
        { id: 'headache', label: 'Headache', icon: '🤕' },
        { id: 'bloating', label: 'Bloating', icon: '🫃' },
        { id: 'fatigue', label: 'Fatigue', icon: '😴' },
        { id: 'backpain', label: 'Back Pain', icon: '🔙' },
        { id: 'acne', label: 'Acne', icon: '😖' },
        { id: 'cravings', label: 'Cravings', icon: '🍫' },
        { id: 'tender', label: 'Breast Tenderness', icon: '💔' },
    ];

    const moods = [
        { id: 'happy', label: 'Happy', icon: '😊', color: 'text-green-400' },
        { id: 'calm', label: 'Calm', icon: '😌', color: 'text-blue-400' },
        { id: 'anxious', label: 'Anxious', icon: '😰', color: 'text-yellow-400' },
        { id: 'irritable', label: 'Irritable', icon: '😤', color: 'text-orange-400' },
        { id: 'sad', label: 'Sad', icon: '😢', color: 'text-purple-400' },
        { id: 'energetic', label: 'Energetic', icon: '⚡', color: 'text-cyan-400' },
    ];

    const flowLevels = [
        { id: 'spotting', label: 'Spotting', color: 'bg-pink-300', drops: 1 },
        { id: 'light', label: 'Light', color: 'bg-pink-400', drops: 2 },
        { id: 'medium', label: 'Medium', color: 'bg-pink-500', drops: 3 },
        { id: 'heavy', label: 'Heavy', color: 'bg-pink-600', drops: 4 },
    ];

    // Calendar helpers
    const getDaysInMonth = (date) => {
        return new Date(date.getFullYear(), date.getMonth() + 1, 0).getDate();
    };

    const getFirstDayOfMonth = (date) => {
        return new Date(date.getFullYear(), date.getMonth(), 1).getDay();
    };

    const formatDate = (date) => {
        return date.toISOString().split('T')[0];
    };

    const parseDate = (dateStr) => {
        return new Date(dateStr + 'T00:00:00');
    };

    // Cycle predictions
    const getNextPeriodDate = () => {
        if (!periodData.lastPeriodStart) return null;
        const lastStart = parseDate(periodData.lastPeriodStart);
        const nextStart = new Date(lastStart);
        nextStart.setDate(nextStart.getDate() + periodData.cycleLength);
        return nextStart;
    };

    const getFertileWindow = () => {
        const nextPeriod = getNextPeriodDate();
        if (!nextPeriod) return null;
        const ovulationDay = new Date(nextPeriod);
        ovulationDay.setDate(ovulationDay.getDate() - 14);
        const fertileStart = new Date(ovulationDay);
        fertileStart.setDate(fertileStart.getDate() - 5);
        const fertileEnd = new Date(ovulationDay);
        fertileEnd.setDate(fertileEnd.getDate() + 1);
        return { start: fertileStart, end: fertileEnd, ovulation: ovulationDay };
    };

    const getCurrentPhase = () => {
        if (!periodData.lastPeriodStart) return null;
        const today = new Date();
        const lastStart = parseDate(periodData.lastPeriodStart);
        const daysSinceStart = Math.floor((today - lastStart) / (1000 * 60 * 60 * 24));
        const cycleDay = (daysSinceStart % periodData.cycleLength) + 1;

        if (cycleDay <= periodData.periodLength) {
            return { name: 'Menstrual', day: cycleDay, color: 'text-red-400', desc: 'Period days - rest and self-care' };
        } else if (cycleDay <= 13) {
            return { name: 'Follicular', day: cycleDay, color: 'text-green-400', desc: 'Energy rising - great for new projects' };
        } else if (cycleDay <= 16) {
            return { name: 'Ovulation', day: cycleDay, color: 'text-yellow-400', desc: 'Peak energy - fertile window' };
        } else {
            return { name: 'Luteal', day: cycleDay, color: 'text-purple-400', desc: 'Winding down - focus on completion' };
        }
    };

    const isDateInPeriod = (date) => {
        const dateStr = formatDate(date);
        return periodData.periods.some(p => {
            const start = parseDate(p.startDate);
            const end = p.endDate ? parseDate(p.endDate) : new Date(start.getTime() + periodData.periodLength * 24 * 60 * 60 * 1000);
            return date >= start && date <= end;
        });
    };

    const isDateInFertileWindow = (date) => {
        const fertile = getFertileWindow();
        if (!fertile) return false;
        return date >= fertile.start && date <= fertile.end;
    };

    const isOvulationDay = (date) => {
        const fertile = getFertileWindow();
        if (!fertile) return false;
        return formatDate(date) === formatDate(fertile.ovulation);
    };

    const isPredictedPeriod = (date) => {
        const nextPeriod = getNextPeriodDate();
        if (!nextPeriod) return false;
        const endPredicted = new Date(nextPeriod);
        endPredicted.setDate(endPredicted.getDate() + periodData.periodLength);
        return date >= nextPeriod && date <= endPredicted;
    };

    const getDayData = (date) => {
        const dateStr = formatDate(date);
        return periodData.periods.find(p => p.startDate === dateStr || 
            (p.logs && p.logs[dateStr]));
    };

    // Actions
    const logPeriodStart = () => {
        if (!selectedDate) return;
        const dateStr = formatDate(selectedDate);
        setPeriodData(prev => ({
            ...prev,
            lastPeriodStart: dateStr,
            periods: [...prev.periods, { 
                startDate: dateStr, 
                endDate: null, 
                logs: { [dateStr]: logEntry }
            }]
        }));
        setShowLogModal(false);
        setLogEntry({ flow: null, symptoms: [], mood: null, notes: '' });
    };

    const logDay = () => {
        if (!selectedDate) return;
        const dateStr = formatDate(selectedDate);
        setPeriodData(prev => {
            const periods = [...prev.periods];
            const currentPeriodIdx = periods.findIndex(p => !p.endDate);
            if (currentPeriodIdx >= 0) {
                periods[currentPeriodIdx].logs = {
                    ...periods[currentPeriodIdx].logs,
                    [dateStr]: logEntry
                };
            }
            return { ...prev, periods };
        });
        setShowLogModal(false);
        setLogEntry({ flow: null, symptoms: [], mood: null, notes: '' });
    };

    const endPeriod = () => {
        if (!selectedDate) return;
        const dateStr = formatDate(selectedDate);
        setPeriodData(prev => {
            const periods = [...prev.periods];
            const currentPeriodIdx = periods.findIndex(p => !p.endDate);
            if (currentPeriodIdx >= 0) {
                periods[currentPeriodIdx].endDate = dateStr;
            }
            return { ...prev, periods };
        });
        setShowLogModal(false);
    };

    const toggleSymptom = (symptomId) => {
        setLogEntry(prev => ({
            ...prev,
            symptoms: prev.symptoms.includes(symptomId)
                ? prev.symptoms.filter(s => s !== symptomId)
                : [...prev.symptoms, symptomId]
        }));
    };

    // Render calendar
    const renderCalendar = () => {
        const daysInMonth = getDaysInMonth(currentDate);
        const firstDay = getFirstDayOfMonth(currentDate);
        const days = [];
        const today = new Date();
        today.setHours(0, 0, 0, 0);

        // Empty cells for days before the first day
        for (let i = 0; i < firstDay; i++) {
            days.push(<div key={`empty-${i}`} className="h-12" />);
        }

        // Days of the month
        for (let day = 1; day <= daysInMonth; day++) {
            const date = new Date(currentDate.getFullYear(), currentDate.getMonth(), day);
            const isToday = formatDate(date) === formatDate(today);
            const isPeriod = isDateInPeriod(date);
            const isFertile = isDateInFertileWindow(date);
            const isOvulation = isOvulationDay(date);
            const isPredicted = isPredictedPeriod(date);
            const isSelected = selectedDate && formatDate(date) === formatDate(selectedDate);

            let bgClass = 'bg-white/5 hover:bg-white/10';
            let textClass = 'text-white';
            let indicator = null;

            if (isPeriod) {
                bgClass = 'bg-pink-500/30 hover:bg-pink-500/40';
                indicator = <Droplet className="w-3 h-3 text-pink-400 absolute bottom-1 right-1" />;
            } else if (isPredicted) {
                bgClass = 'bg-pink-500/10 hover:bg-pink-500/20 border border-dashed border-pink-500/30';
                indicator = <Droplet className="w-3 h-3 text-pink-300 absolute bottom-1 right-1" />;
            } else if (isOvulation) {
                bgClass = 'bg-yellow-500/30 hover:bg-yellow-500/40';
                indicator = <Sparkles className="w-3 h-3 text-yellow-400 absolute bottom-1 right-1" />;
            } else if (isFertile) {
                bgClass = 'bg-green-500/20 hover:bg-green-500/30';
                indicator = <Baby className="w-3 h-3 text-green-400 absolute bottom-1 right-1" />;
            }

            if (isSelected) {
                bgClass += ' ring-2 ring-pink-400';
            }

            days.push(
                <button
                    key={day}
                    onClick={() => {
                        setSelectedDate(date);
                        setShowLogModal(true);
                    }}
                    className={`h-12 rounded-xl ${bgClass} ${textClass} relative transition-all flex items-center justify-center font-medium`}
                >
                    <span className={isToday ? 'bg-pink-500 text-white w-7 h-7 rounded-full flex items-center justify-center' : ''}>
                        {day}
                    </span>
                    {indicator}
                </button>
            );
        }

        return days;
    };

    const phase = getCurrentPhase();
    const nextPeriod = getNextPeriodDate();
    const daysUntilPeriod = nextPeriod ? Math.ceil((nextPeriod - new Date()) / (1000 * 60 * 60 * 24)) : null;

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
                            <Calendar className="w-5 h-5 text-pink-400" />
                            <h1 className="text-xl font-black tracking-tight">PERIOD <span className="text-pink-400">TRACKER</span></h1>
                        </div>
                        <span className={`text-xs font-bold tracking-[0.1em] uppercase ${theme === 'dark' ? 'text-pink-300' : 'text-pink-600'}`}>Cycle Intelligence</span>
                    </div>
                </div>
                <Link to="/queens" className={`flex items-center gap-2 transition-opacity ${theme === 'dark' ? 'opacity-50 hover:opacity-100' : 'opacity-70 hover:opacity-100'}`}>
                    <Crown className="w-5 h-5 text-pink-400" />
                    <span className="text-sm font-black hidden md:block">FOR <span className="text-pink-400">QUEENS</span></span>
                </Link>
            </header>

            <main className="relative z-10 p-6 max-w-4xl mx-auto space-y-6 pb-24">
                {/* Current Phase Card */}
                {phase && (
                    <Card className={`backdrop-blur-xl ${theme === 'dark' ? 'bg-gradient-to-br from-pink-500/20 to-purple-600/20 border-white/20' : 'bg-gradient-to-br from-pink-100 to-purple-100 border-pink-200 shadow-md'}`}>
                        <CardContent className="p-6">
                            <div className="flex items-center justify-between">
                                <div>
                                    <div className="flex items-center gap-2 mb-2">
                                        <Moon className="w-5 h-5 text-pink-400" />
                                        <span className="text-xs font-bold uppercase tracking-widest text-pink-300">Current Phase</span>
                                    </div>
                                    <h3 className={`text-2xl font-black ${phase.color}`}>{phase.name} Phase</h3>
                                    <p className="text-pink-200 text-sm mt-1">{phase.desc}</p>
                                    <p className="text-pink-300 text-xs mt-2">Day {phase.day} of your cycle</p>
                                </div>
                                <div className="text-right">
                                    {daysUntilPeriod !== null && daysUntilPeriod > 0 && (
                                        <div className="bg-pink-500/20 border border-pink-500/30 rounded-2xl p-4">
                                            <p className="text-3xl font-black text-pink-400">{daysUntilPeriod}</p>
                                            <p className="text-xs text-pink-300 uppercase">Days until period</p>
                                        </div>
                                    )}
                                    {daysUntilPeriod !== null && daysUntilPeriod <= 0 && (
                                        <div className="bg-pink-500/30 border border-pink-500/50 rounded-2xl p-4">
                                            <Droplet className="w-8 h-8 text-pink-400 mx-auto mb-1" />
                                            <p className="text-xs text-pink-300 uppercase">Period expected</p>
                                        </div>
                                    )}
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                )}

                {!periodData.lastPeriodStart && (
                    <div className="p-6 bg-pink-500/10 border border-pink-500/30 rounded-2xl text-center">
                        <Droplet className="w-12 h-12 text-pink-400 mx-auto mb-4" />
                        <h3 className="font-bold text-lg mb-2">Start Tracking Your Cycle</h3>
                        <p className="text-pink-300 text-sm mb-4">
                            Tap on the calendar to log your period start date and begin tracking.
                        </p>
                    </div>
                )}

                {/* Tab Navigation */}
                <div className="flex gap-2 p-1 bg-white/5 rounded-2xl border border-white/10">
                    {['calendar', 'insights', 'history'].map(tab => (
                        <button
                            key={tab}
                            onClick={() => setActiveTab(tab)}
                            className={`flex-1 py-3 px-4 rounded-xl font-bold text-sm uppercase tracking-wider transition-all ${
                                activeTab === tab 
                                    ? 'bg-pink-500 text-white shadow-lg shadow-pink-500/30' 
                                    : 'text-pink-300 hover:text-white hover:bg-white/5'
                            }`}
                        >
                            {tab}
                        </button>
                    ))}
                </div>

                {activeTab === 'calendar' && (
                    <Card className="bg-white/5 border-white/10 backdrop-blur-xl">
                        <CardContent className="p-6">
                            {/* Month Navigation */}
                            <div className="flex items-center justify-between mb-6">
                                <button 
                                    onClick={() => setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1))}
                                    className="p-2 hover:bg-white/10 rounded-xl transition-all"
                                >
                                    <ChevronLeft className="w-5 h-5 text-pink-300" />
                                </button>
                                <h3 className="text-lg font-black text-pink-200">
                                    {currentDate.toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}
                                </h3>
                                <button 
                                    onClick={() => setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1))}
                                    className="p-2 hover:bg-white/10 rounded-xl transition-all"
                                >
                                    <ChevronRight className="w-5 h-5 text-pink-300" />
                                </button>
                            </div>

                            {/* Day Headers */}
                            <div className="grid grid-cols-7 gap-2 mb-2">
                                {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(day => (
                                    <div key={day} className="text-center text-xs font-bold text-pink-300 uppercase">
                                        {day}
                                    </div>
                                ))}
                            </div>

                            {/* Calendar Grid */}
                            <div className="grid grid-cols-7 gap-2">
                                {renderCalendar()}
                            </div>

                            {/* Legend */}
                            <div className="flex flex-wrap gap-4 mt-6 pt-4 border-t border-white/10">
                                <div className="flex items-center gap-2">
                                    <div className="w-4 h-4 rounded bg-pink-500/30" />
                                    <span className="text-xs text-pink-300">Period</span>
                                </div>
                                <div className="flex items-center gap-2">
                                    <div className="w-4 h-4 rounded bg-pink-500/10 border border-dashed border-pink-500/30" />
                                    <span className="text-xs text-pink-300">Predicted</span>
                                </div>
                                <div className="flex items-center gap-2">
                                    <div className="w-4 h-4 rounded bg-green-500/20" />
                                    <span className="text-xs text-green-300">Fertile Window</span>
                                </div>
                                <div className="flex items-center gap-2">
                                    <div className="w-4 h-4 rounded bg-yellow-500/30" />
                                    <span className="text-xs text-yellow-300">Ovulation</span>
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                )}

                {activeTab === 'insights' && (
                    <div className="space-y-4">
                        <div className="grid grid-cols-2 gap-4">
                            <Card className="bg-white/5 border-white/10">
                                <CardContent className="p-5 text-center">
                                    <Clock className="w-8 h-8 text-pink-400 mx-auto mb-2" />
                                    <p className="text-2xl font-black text-white">{periodData.cycleLength}</p>
                                    <p className="text-xs text-pink-300 uppercase">Avg Cycle Length</p>
                                </CardContent>
                            </Card>
                            <Card className="bg-white/5 border-white/10">
                                <CardContent className="p-5 text-center">
                                    <Droplet className="w-8 h-8 text-pink-400 mx-auto mb-2" />
                                    <p className="text-2xl font-black text-white">{periodData.periodLength}</p>
                                    <p className="text-xs text-pink-300 uppercase">Avg Period Days</p>
                                </CardContent>
                            </Card>
                        </div>

                        <Card className="bg-white/5 border-white/10">
                            <CardContent className="p-5">
                                <h4 className="font-bold mb-4 flex items-center gap-2">
                                    <TrendingUp className="w-5 h-5 text-cyan-400" />
                                    Adjust Cycle Settings
                                </h4>
                                <div className="space-y-4">
                                    <div>
                                        <label className="text-sm text-pink-300 mb-2 block">Cycle Length (days)</label>
                                        <div className="flex items-center gap-4">
                                            <button 
                                                onClick={() => setPeriodData(prev => ({ ...prev, cycleLength: Math.max(21, prev.cycleLength - 1) }))}
                                                className="p-2 bg-white/10 rounded-xl hover:bg-white/20"
                                            >
                                                <ChevronLeft className="w-5 h-5" />
                                            </button>
                                            <span className="text-2xl font-bold flex-1 text-center">{periodData.cycleLength}</span>
                                            <button 
                                                onClick={() => setPeriodData(prev => ({ ...prev, cycleLength: Math.min(40, prev.cycleLength + 1) }))}
                                                className="p-2 bg-white/10 rounded-xl hover:bg-white/20"
                                            >
                                                <ChevronRight className="w-5 h-5" />
                                            </button>
                                        </div>
                                    </div>
                                    <div>
                                        <label className="text-sm text-pink-300 mb-2 block">Period Length (days)</label>
                                        <div className="flex items-center gap-4">
                                            <button 
                                                onClick={() => setPeriodData(prev => ({ ...prev, periodLength: Math.max(2, prev.periodLength - 1) }))}
                                                className="p-2 bg-white/10 rounded-xl hover:bg-white/20"
                                            >
                                                <ChevronLeft className="w-5 h-5" />
                                            </button>
                                            <span className="text-2xl font-bold flex-1 text-center">{periodData.periodLength}</span>
                                            <button 
                                                onClick={() => setPeriodData(prev => ({ ...prev, periodLength: Math.min(10, prev.periodLength + 1) }))}
                                                className="p-2 bg-white/10 rounded-xl hover:bg-white/20"
                                            >
                                                <ChevronRight className="w-5 h-5" />
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>

                        {getFertileWindow() && (
                            <Card className="bg-green-500/10 border-green-500/20">
                                <CardContent className="p-5">
                                    <h4 className="font-bold mb-2 flex items-center gap-2 text-green-400">
                                        <Baby className="w-5 h-5" />
                                        Fertile Window
                                    </h4>
                                    <p className="text-green-200 text-sm">
                                        {getFertileWindow().start.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })} - {getFertileWindow().end.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                                    </p>
                                    <p className="text-green-300 text-xs mt-2">
                                        Ovulation expected: {getFertileWindow().ovulation.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                                    </p>
                                </CardContent>
                            </Card>
                        )}
                    </div>
                )}

                {activeTab === 'history' && (
                    <div className="space-y-4">
                        {periodData.periods.length === 0 ? (
                            <div className="text-center py-12 text-pink-200">
                                <Calendar className="w-12 h-12 mx-auto mb-4 text-pink-300" />
                                <p>No periods logged yet</p>
                                <p className="text-sm mt-2 text-pink-300">Start by tapping a date on the calendar</p>
                            </div>
                        ) : (
                            periodData.periods.slice().reverse().map((period, idx) => (
                                <Card key={idx} className="bg-white/5 border-white/10">
                                    <CardContent className="p-5">
                                        <div className="flex items-center justify-between">
                                            <div className="flex items-center gap-3">
                                                <div className="p-3 bg-pink-500/20 rounded-xl">
                                                    <Droplet className="w-5 h-5 text-pink-400" />
                                                </div>
                                                <div>
                                                    <p className="font-bold text-white">
                                                        {parseDate(period.startDate).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}
                                                    </p>
                                                    <p className="text-xs text-pink-300">
                                                        {period.endDate 
                                                            ? `${Math.ceil((parseDate(period.endDate) - parseDate(period.startDate)) / (1000 * 60 * 60 * 24)) + 1} days`
                                                            : 'In progress'
                                                        }
                                                    </p>
                                                </div>
                                            </div>
                                            {!period.endDate && (
                                                <span className="px-3 py-1 bg-pink-500/20 text-pink-300 text-xs font-bold rounded-full uppercase">
                                                    Active
                                                </span>
                                            )}
                                        </div>
                                    </CardContent>
                                </Card>
                            ))
                        )}
                    </div>
                )}
            </main>

            {/* Log Modal */}
            {showLogModal && selectedDate && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
                    <Card className="bg-black/95 border-pink-500/30 w-full max-w-md max-h-[90vh] overflow-y-auto">
                        <CardContent className="p-6">
                            <div className="flex items-center justify-between mb-6">
                                <h3 className="text-lg font-black text-white">
                                    Log {selectedDate.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                                </h3>
                                <button 
                                    onClick={() => setShowLogModal(false)}
                                    className="p-2 hover:bg-white/10 rounded-xl text-pink-300"
                                >
                                    <X className="w-5 h-5" />
                                </button>
                            </div>

                            {/* Flow Level */}
                            <div className="mb-6">
                                <label className="text-sm font-bold text-pink-300 mb-3 block uppercase tracking-wider">Flow</label>
                                <div className="grid grid-cols-4 gap-2">
                                    {flowLevels.map(flow => (
                                        <button
                                            key={flow.id}
                                            onClick={() => setLogEntry(prev => ({ ...prev, flow: flow.id }))}
                                            className={`p-3 rounded-xl border transition-all ${
                                                logEntry.flow === flow.id
                                                    ? 'bg-pink-500/20 border-pink-500/50'
                                                    : 'bg-white/5 border-white/10 hover:bg-white/10'
                                            }`}
                                        >
                                            <div className="flex justify-center gap-0.5 mb-2">
                                                {[...Array(flow.drops)].map((_, i) => (
                                                    <Droplet key={i} className={`w-3 h-3 ${flow.color.replace('bg-', 'text-')}`} fill="currentColor" />
                                                ))}
                                            </div>
                                            <span className="text-xs text-pink-100">{flow.label}</span>
                                        </button>
                                    ))}
                                </div>
                            </div>

                            {/* Symptoms */}
                            <div className="mb-6">
                                <label className="text-sm font-bold text-pink-300 mb-3 block uppercase tracking-wider">Symptoms</label>
                                <div className="grid grid-cols-4 gap-2">
                                    {symptoms.map(symptom => (
                                        <button
                                            key={symptom.id}
                                            onClick={() => toggleSymptom(symptom.id)}
                                            className={`p-3 rounded-xl border transition-all ${
                                                logEntry.symptoms.includes(symptom.id)
                                                    ? 'bg-pink-500/20 border-pink-500/50'
                                                    : 'bg-white/5 border-white/10 hover:bg-white/10'
                                            }`}
                                        >
                                            <span className="text-xl mb-1 block">{symptom.icon}</span>
                                            <span className="text-xs text-pink-100">{symptom.label}</span>
                                        </button>
                                    ))}
                                </div>
                            </div>

                            {/* Mood */}
                            <div className="mb-6">
                                <label className="text-sm font-bold text-pink-300 mb-3 block uppercase tracking-wider">Mood</label>
                                <div className="grid grid-cols-3 gap-2">
                                    {moods.map(mood => (
                                        <button
                                            key={mood.id}
                                            onClick={() => setLogEntry(prev => ({ ...prev, mood: mood.id }))}
                                            className={`p-3 rounded-xl border transition-all ${
                                                logEntry.mood === mood.id
                                                    ? 'bg-pink-500/20 border-pink-500/50'
                                                    : 'bg-white/5 border-white/10 hover:bg-white/10'
                                            }`}
                                        >
                                            <span className="text-xl mb-1 block">{mood.icon}</span>
                                            <span className={`text-xs ${mood.color}`}>{mood.label}</span>
                                        </button>
                                    ))}
                                </div>
                            </div>

                            {/* Action Buttons */}
                            <div className="space-y-3">
                                {!isDateInPeriod(selectedDate) && (
                                    <Button 
                                        onClick={logPeriodStart}
                                        className="w-full bg-pink-500 hover:bg-pink-600"
                                    >
                                        <Droplet className="w-4 h-4 mr-2" />
                                        Log Period Start
                                    </Button>
                                )}
                                {isDateInPeriod(selectedDate) && (
                                    <>
                                        <Button 
                                            onClick={logDay}
                                            className="w-full bg-pink-500 hover:bg-pink-600"
                                        >
                                            <Check className="w-4 h-4 mr-2" />
                                            Save Day Log
                                        </Button>
                                        <Button 
                                            onClick={endPeriod}
                                            variant="outline"
                                            className="w-full border-pink-500/30 hover:bg-pink-500/10 text-pink-200"
                                        >
                                            <X className="w-4 h-4 mr-2" />
                                            End Period
                                        </Button>
                                    </>
                                )}
                            </div>
                        </CardContent>
                    </Card>
                </div>
            )}
        </div>
    );
};

export default PeriodTracker;

import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { 
  Heart, Stethoscope, AlertTriangle, Pill, LogOut, User, Brain, 
  ArrowRight, Zap, Shield, Activity, Bell, ChevronRight, Clock,
  TrendingUp, Calendar, Sparkles, Menu, Settings, Home as HomeIcon,
  FileSearch, IndianRupee, Check, Crown, Star, Sun, Moon
} from 'lucide-react';
import { useAuth } from '../AuthContext';
import { useTheme } from '../contexts/ThemeContext';

export default function Home() {
  const { user, logout } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const [currentTime, setCurrentTime] = useState(new Date());
  const [showMenu, setShowMenu] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);
  const [activeCard, setActiveCard] = useState(null);
  const [flippedCard, setFlippedCard] = useState(null);
  const [mousePos, setMousePos] = useState({ x: -1000, y: -1000 });

  // Generate stable particle data once
  const [particles] = useState(() => 
    [...Array(40)].map((_, i) => ({
      id: i,
      size: Math.random() * 4 + 2,
      left: Math.random() * 100,
      color: Math.random() > 0.5 ? '0, 217, 255' : '168, 85, 247',
      opacity: Math.random() * 0.4 + 0.2,
      duration: Math.random() * 10 + 8,
      delay: Math.random() * 8,
    }))
  );

  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
    const handleMouseMove = (e) => {
      setMousePos({ x: e.clientX, y: e.clientY });
    };
    window.addEventListener('mousemove', handleMouseMove);
    return () => window.removeEventListener('mousemove', handleMouseMove);
  }, []);

  const greeting = () => {
    const hour = currentTime.getHours();
    if (hour < 12) return 'Good Morning';
    if (hour < 18) return 'Good Afternoon';
    return 'Good Evening';
  };

  const features = [
    { icon: Brain, title: 'AI DOCTOR', desc: 'Start consultation', path: '/consultation', gradient: 'from-cyan-500 to-blue-600', glow: 'cyan', explanation: 'Get instant medical advice powered by advanced AI - describe symptoms, receive diagnosis suggestions, and personalized health recommendations 24/7.' },
    { icon: Heart, title: 'MENTAL HEALTH', desc: 'Track your mood', path: '/mental-health', gradient: 'from-pink-500 to-rose-600', glow: 'pink', explanation: 'Monitor your emotional wellbeing with mood tracking, guided meditation, and AI-powered therapy sessions tailored to your mental health journey.' },
    { icon: Pill, title: 'MEDICATIONS', desc: 'Manage your meds', path: '/medicine', gradient: 'from-purple-500 to-violet-600', glow: 'purple', explanation: 'Never miss a dose with smart reminders, drug interaction checks, and a complete medication history at your fingertips.' },
    { icon: FileSearch, title: 'RX SCANNER', desc: 'Find generics', path: '/prescription-scanner', gradient: 'from-teal-500 to-cyan-600', glow: 'teal', explanation: 'Scan your prescription to identify medicines and discover affordable generic alternatives. Save up to 90% with Jan Aushadhi recommendations.' },
    { icon: Crown, title: 'FOR QUEENS', desc: "Women's Health", path: '/queens', gradient: 'from-pink-500 to-purple-600', glow: 'pink', explanation: 'Dedicated healthcare features for women - from PCOS management to maternal care and anemia detection.' },
    { icon: Stethoscope, title: 'FIND DOCTOR', desc: 'Book appointments', path: '/find-doctor', gradient: 'from-green-500 to-emerald-600', glow: 'green', explanation: 'Discover verified specialists nearby, read reviews, check availability, and book appointments instantly - all in one place.' },
    { icon: AlertTriangle, title: 'EMERGENCY', desc: 'SOS & Help', path: '/emergency', gradient: 'from-red-500 to-orange-600', glow: 'red', explanation: 'One-tap emergency SOS alerts your contacts and nearby hospitals with your location - because every second counts.' },
    { icon: Activity, title: 'HEALTH STATS', desc: 'View analytics', path: '/consultation', gradient: 'from-yellow-500 to-amber-600', glow: 'yellow', explanation: 'Visualize your health journey with comprehensive analytics, trend insights, and personalized recommendations based on your data.' },
  ];

  const quickStats = [
    { label: 'Heart Rate', value: '72', unit: 'bpm', icon: Heart, trend: '+2%', color: 'text-red-400' },
    { label: 'Sleep', value: '7.5', unit: 'hrs', icon: Clock, trend: '+12%', color: 'text-purple-400' },
    { label: 'Steps', value: '8,432', unit: '', icon: Activity, trend: '+8%', color: 'text-green-400' },
    { label: 'Stress', value: 'Low', unit: '', icon: Shield, trend: '-15%', color: 'text-cyan-400' },
  ];

  const upcomingItems = [
    { title: 'Take Vitamin D', time: '8:00 AM', icon: Pill, color: 'text-purple-400', bg: 'bg-purple-500/10' },
    { title: 'Dr. Sharma Checkup', time: '2:30 PM', icon: Calendar, color: 'text-green-400', bg: 'bg-green-500/10' },
    { title: 'Meditation Session', time: '6:00 PM', icon: Brain, color: 'text-cyan-400', bg: 'bg-cyan-500/10' },
  ];

  return (
    <div className={`min-h-screen relative overflow-hidden transition-colors duration-300 ${theme === 'dark' ? 'bg-black text-white' : 'bg-gradient-to-br from-slate-50 via-blue-50 to-cyan-50 text-gray-900'}`}>
      {/* Animated Background */}
      <div className="fixed inset-0 pointer-events-none">
        <div className={`absolute inset-0 transition-colors duration-300 ${theme === 'dark' ? 'bg-gradient-to-br from-black via-gray-900 to-black' : 'bg-gradient-to-br from-white via-blue-50/50 to-cyan-50/50'}`} />
        <div className={`absolute w-[600px] h-[600px] -top-40 -right-40 rounded-full blur-3xl animate-pulse ${theme === 'dark' ? 'bg-cyan-500/10' : 'bg-cyan-400/20'}`} />
        <div className={`absolute w-[600px] h-[600px] -bottom-40 -left-40 rounded-full blur-3xl animate-pulse ${theme === 'dark' ? 'bg-purple-500/10' : 'bg-purple-400/20'}`} style={{ animationDelay: '1s' }} />
        
        {/* Interactive Antigravity Particles */}
        {particles.map((particle) => {
          const particleX = (particle.left / 100) * (typeof window !== 'undefined' ? window.innerWidth : 1920);
          const dx = mousePos.x - particleX;
          const dy = mousePos.y - (typeof window !== 'undefined' ? window.innerHeight * 0.5 : 540);
          const distance = Math.sqrt(dx * dx + dy * dy);
          const fadeRadius = 200;
          const fadeFactor = distance < fadeRadius ? (distance / fadeRadius) : 1;
          const repelX = distance < fadeRadius && distance > 0 ? -(dx / distance) * (fadeRadius - distance) * 0.5 : 0;
          const repelY = distance < fadeRadius && distance > 0 ? -(dy / distance) * (fadeRadius - distance) * 0.3 : 0;
          
          return (
            <div
              key={particle.id}
              className="absolute rounded-full animate-antigravity pointer-events-none"
              style={{
                width: `${particle.size}px`,
                height: `${particle.size}px`,
                left: `calc(${particle.left}% + ${repelX}px)`,
                bottom: `calc(-20px + ${repelY}px)`,
                background: `rgba(${particle.color}, ${particle.opacity * fadeFactor})`,
                animationDuration: `${particle.duration}s`,
                animationDelay: `${particle.delay}s`,
                transform: `scale(${0.5 + fadeFactor * 0.5})`,
                transition: 'left 0.15s ease-out, bottom 0.15s ease-out, background 0.2s ease, transform 0.2s ease',
                zIndex: 1,
                boxShadow: fadeFactor < 0.8 ? `0 0 ${10 * (1 - fadeFactor)}px rgba(${particle.color}, 0.5)` : 'none',
              }}
            />
          );
        })}
      </div>

      {/* Header */}
      <header className={`relative z-20 px-6 py-4 flex items-center justify-between border-b backdrop-blur-xl transition-colors duration-300 ${theme === 'dark' ? 'border-white/10 bg-black/50' : 'border-gray-200 bg-white/70'}`}>
        <Link to="/" className="flex items-center gap-3">
          <div className="relative">
            <Heart className="w-8 h-8 text-cyan-400" />
            <div className="absolute inset-0 bg-cyan-400/30 blur-xl animate-pulse" />
          </div>
          <span className={`text-2xl font-black tracking-tighter ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>PULSE<span className="text-cyan-400">AI</span></span>
        </Link>
        
        <div className="flex items-center gap-4">
          {/* Theme Toggle */}
          <button
            onClick={toggleTheme}
            className={`relative p-3 border rounded-xl transition-all duration-300 group ${theme === 'dark' ? 'bg-white/5 border-white/10 hover:bg-white/10' : 'bg-gray-100 border-gray-200 hover:bg-gray-200'}`}
            title={theme === 'dark' ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
          >
            <div className="relative w-5 h-5">
              <Sun className={`w-5 h-5 text-yellow-500 absolute inset-0 transition-all duration-300 ${theme === 'dark' ? 'opacity-0 rotate-90 scale-0' : 'opacity-100 rotate-0 scale-100'}`} />
              <Moon className={`w-5 h-5 text-cyan-400 absolute inset-0 transition-all duration-300 ${theme === 'dark' ? 'opacity-100 rotate-0 scale-100' : 'opacity-0 -rotate-90 scale-0'}`} />
            </div>
          </button>
          
          {/* Notification Bell */}
          <div className="relative">
            <button
              className={`relative p-3 border rounded-xl transition-colors ${theme === 'dark' ? 'bg-white/5 border-white/10 hover:bg-white/10' : 'bg-gray-100 border-gray-200 hover:bg-gray-200'}`}
              onClick={() => setShowNotifications((v) => !v)}
            >
              <Bell className={`w-5 h-5 ${theme === 'dark' ? 'text-white' : 'text-gray-700'}`} />
              <span className="absolute top-2 right-2 w-2 h-2 bg-cyan-400 rounded-full animate-pulse" />
            </button>
            {showNotifications && (
              <div className={`absolute right-0 mt-2 w-80 backdrop-blur-xl border rounded-2xl overflow-hidden shadow-2xl z-50 animate-fade-in ${theme === 'dark' ? 'bg-gray-900/95 border-white/10' : 'bg-white border-gray-200'}`}>
                <div className={`p-4 border-b flex items-center gap-2 ${theme === 'dark' ? 'border-white/10' : 'border-gray-200'}`}>
                  <Bell className="w-5 h-5 text-cyan-400" />
                  <span className="font-bold">Notifications</span>
                </div>
                <div className={`p-4 text-sm ${theme === 'dark' ? 'text-cyan-300' : 'text-cyan-600'}`}>
                  No new notifications.
                </div>
              </div>
            )}
          </div>
          <div className="relative">
            <button 
              onClick={() => setShowMenu(!showMenu)}
              className={`flex items-center gap-3 p-2 border rounded-xl transition-colors ${theme === 'dark' ? 'bg-white/5 border-white/10 hover:bg-white/10' : 'bg-gray-100 border-gray-200 hover:bg-gray-200'}`}
            >
              <div className="w-9 h-9 bg-gradient-to-br from-cyan-500 to-blue-500 rounded-lg flex items-center justify-center">
                <User className="w-5 h-5 text-white" />
              </div>
              <span className={`hidden md:block font-bold text-sm ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>{user?.full_name?.split(' ')[0] || 'User'}</span>
              <Menu className={`w-4 h-4 ${theme === 'dark' ? 'text-cyan-300' : 'text-cyan-600'}`} />
            </button>

            {showMenu && (
              <div className={`absolute right-0 mt-2 w-56 backdrop-blur-xl border rounded-2xl overflow-hidden shadow-2xl z-50 ${theme === 'dark' ? 'bg-gray-900/95 border-white/10' : 'bg-white border-gray-200'}`}>
                <div className={`p-4 border-b ${theme === 'dark' ? 'border-white/10' : 'border-gray-200'}`}>
                  <p className="font-bold">{user?.full_name || 'User'}</p>
                  <p className={`text-sm ${theme === 'dark' ? 'text-cyan-300/70' : 'text-cyan-600'}`}>{user?.email || 'user@example.com'}</p>
                </div>
                <div className="p-2">
                  <button className={`w-full flex items-center gap-3 p-3 rounded-xl transition-colors text-left ${theme === 'dark' ? 'hover:bg-white/5' : 'hover:bg-gray-100'}`}>
                    <Settings className={`w-5 h-5 ${theme === 'dark' ? 'text-cyan-300' : 'text-cyan-600'}`} />
                    <span>Settings</span>
                  </button>
                  <button 
                    onClick={logout}
                    className={`w-full flex items-center gap-3 p-3 rounded-xl transition-colors text-left text-red-400 ${theme === 'dark' ? 'hover:bg-white/5' : 'hover:bg-red-50'}`}
                  >
                    <LogOut className="w-5 h-5" />
                    <span>Logout</span>
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="relative z-10 px-6 py-8 max-w-7xl mx-auto pb-24 md:pb-8">
        {/* Welcome Section */}
        <section className="mb-10">
          <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-4">
            <div className="animate-slide-in-left">
              <div className="flex items-center gap-2 mb-2">
                <Sparkles className={`w-4 h-4 animate-spin ${theme === 'dark' ? 'text-cyan-400' : 'text-cyan-500'}`} style={{ animationDuration: '3s' }} />
                <span className={`text-xs font-bold tracking-[0.2em] uppercase ${theme === 'dark' ? 'text-cyan-400' : 'text-cyan-600'}`}>{greeting()}</span>
              </div>
              <h1 className={`text-4xl md:text-5xl font-black tracking-tight leading-tight ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                Welcome back,<br />
                <span className="bg-gradient-to-r from-cyan-400 via-blue-500 to-purple-500 bg-clip-text text-transparent bg-[length:200%_auto] animate-gradient-shift">
                  {user?.full_name?.split(' ')[0] || 'there'}!
                </span>
              </h1>
            </div>
            <div className="text-left md:text-right animate-slide-in-left" style={{ animationDelay: '0.1s' }}>
              <p className={`text-3xl font-bold tabular-nums ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>{currentTime.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</p>
              <p className={`text-sm ${theme === 'dark' ? 'text-cyan-300/70' : 'text-gray-500'}`}>{currentTime.toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })}</p>
            </div>
          </div>
        </section>

        {/* Quick Stats */}
        <section className="mb-10">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            {quickStats.map((stat, index) => (
              <div 
                key={index}
                className={`group relative p-5 rounded-2xl transition-all duration-500 animate-bounce-in hover-lift overflow-hidden ${theme === 'dark' ? 'bg-white/5 border border-white/10 hover:bg-white/10 hover:border-cyan-500/30' : 'bg-white border border-gray-200 shadow-md hover:shadow-lg hover:border-cyan-400'}`}
                style={{ animationDelay: `${index * 0.1}s` }}
              >
                {/* Animated gradient on hover */}
                <div className="absolute inset-0 bg-gradient-to-br from-cyan-500/5 to-purple-500/5 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                
                <div className="relative z-10">
                  <div className="flex items-center justify-between mb-3">
                    <stat.icon className={`w-5 h-5 ${stat.color} group-hover:scale-125 transition-transform duration-300`} />
                    <span className={`text-xs font-bold flex items-center gap-1 ${stat.trend.startsWith('+') ? 'text-green-400' : 'text-cyan-400'}`}>
                      <TrendingUp className="w-3 h-3 group-hover:animate-bounce" />
                      {stat.trend}
                    </span>
                  </div>
                  <div className={`text-2xl font-black group-hover:text-cyan-500 transition-colors ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>{stat.value}<span className={`text-sm ml-1 ${theme === 'dark' ? 'text-cyan-300/70' : 'text-gray-500'}`}>{stat.unit}</span></div>
                  <div className={`text-xs mt-1 transition-colors ${theme === 'dark' ? 'text-cyan-300/70 group-hover:text-cyan-200' : 'text-gray-500 group-hover:text-cyan-600'}`}>{stat.label}</div>
                </div>

                {/* Corner shine effect */}
                <div className="absolute -top-10 -right-10 w-20 h-20 bg-cyan-400/10 rounded-full blur-xl opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
              </div>
            ))}
          </div>
        </section>

        {/* Main Features Grid */}
        <section className="mb-10 relative z-30">
          <div className="flex items-center justify-between mb-5">
            <h2 className={`text-xs font-bold tracking-[0.3em] uppercase ${theme === 'dark' ? 'text-cyan-400/80' : 'text-cyan-600'}`}>Quick Access</h2>
            <Activity className={`w-4 h-4 animate-pulse ${theme === 'dark' ? 'text-cyan-400' : 'text-cyan-500'}`} />
          </div>
          
          <div className="grid grid-cols-2 lg:grid-cols-3 gap-4">
            {features.map((feature, index) => (
              <div
                key={feature.path + index}
                className="group relative h-48"
                onMouseEnter={() => setActiveCard(index)}
                onMouseLeave={() => setActiveCard(null)}
              >
                {/* Show Front or Back based on flippedCard state */}
                {flippedCard !== index ? (
                  /* Front of Card */
                  <div className={`absolute inset-0 p-6 rounded-2xl transition-all duration-300 ${theme === 'dark' ? 'bg-white/5 border border-white/10 hover:border-cyan-500/30' : 'bg-white border border-gray-200 shadow-md hover:shadow-lg hover:border-cyan-400'}`}>
                    <div className="h-full flex flex-col">
                      <Link to={feature.path} className="flex-grow">
                        <div className={`w-12 h-12 bg-gradient-to-br ${feature.gradient} rounded-xl flex items-center justify-center mb-4 group-hover:scale-110 transition-all duration-500 shadow-lg`}>
                          <feature.icon className="w-6 h-6 text-white" />
                        </div>
                        <h3 className={`font-black text-sm tracking-wide mb-1 group-hover:text-cyan-500 transition-colors duration-300 ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>{feature.title}</h3>
                        <p className={`text-xs transition-colors ${theme === 'dark' ? 'text-cyan-200/70 group-hover:text-cyan-100' : 'text-gray-500 group-hover:text-cyan-600'}`}>{feature.desc}</p>
                      </Link>
                      
                      <div className={`mt-auto pt-4 border-t ${theme === 'dark' ? 'border-white/5' : 'border-gray-100'}`}>
                        <button
                          type="button"
                          onClick={() => setFlippedCard(index)}
                          className="w-full text-xs font-bold text-purple-400 hover:text-purple-300 hover:bg-purple-500/10 py-2 px-3 rounded-lg cursor-pointer flex items-center justify-center gap-2 transition-all"
                        >
                          <Sparkles className="w-3 h-3" />
                          Learn More About This Feature
                        </button>
                      </div>
                    </div>

                    {/* Active indicator */}
                    {activeCard === index && (
                      <div className="absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r from-cyan-500 to-purple-500 animate-pulse rounded-b-2xl" />
                    )}
                  </div>
                ) : (
                  /* Back of Card */
                  <div className={`absolute inset-0 p-6 rounded-2xl ${theme === 'dark' ? 'bg-gradient-to-br from-gray-900 to-black border border-cyan-500/30' : 'bg-gradient-to-br from-cyan-50 to-blue-50 border-2 border-cyan-400 shadow-lg'}`}>
                    <div className="h-full flex flex-col">
                      <div className="flex items-center justify-between mb-4">
                        <div className={`w-10 h-10 bg-gradient-to-br ${feature.gradient} rounded-lg flex items-center justify-center shadow-lg`}>
                          <feature.icon className="w-5 h-5 text-white" />
                        </div>
                        <button
                          type="button"
                          onClick={() => setFlippedCard(null)}
                          className="w-8 h-8 bg-white/10 rounded-full flex items-center justify-center hover:bg-white/20 transition-colors cursor-pointer"
                        >
                          <ArrowRight className="w-4 h-4 text-white rotate-180" />
                        </button>
                      </div>
                      
                      <h4 className={`font-black text-sm mb-2 ${theme === 'dark' ? 'text-cyan-400' : 'text-cyan-600'}`}>{feature.title}</h4>
                      <p className={`text-xs leading-relaxed flex-grow ${theme === 'dark' ? 'text-cyan-200' : 'text-gray-700'}`}>{feature.explanation}</p>
                      
                      <Link
                        to={feature.path}
                        className="mt-4 w-full py-2 bg-gradient-to-r from-cyan-500 to-purple-500 rounded-lg text-center text-xs font-bold text-white hover:opacity-90 transition-opacity flex items-center justify-center gap-2"
                      >
                        Get Started
                        <ArrowRight className="w-4 h-4" />
                      </Link>
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        </section>

        {/* Today's Schedule */}
        <section className="mb-10">
          <div className="flex items-center justify-between mb-5">
            <h2 className={`text-xs font-bold tracking-[0.3em] uppercase ${theme === 'dark' ? 'text-cyan-400/80' : 'text-cyan-600'}`}>Today's Schedule</h2>
            <Link to="/medicine" className={`text-xs font-bold hover:underline flex items-center gap-1 group ${theme === 'dark' ? 'text-cyan-400' : 'text-cyan-600'}`}>
              View All
              <ArrowRight className="w-3 h-3 group-hover:translate-x-1 transition-transform" />
            </Link>
          </div>
          
          <div className="space-y-3">
            {upcomingItems.map((item, index) => (
              <div 
                key={index}
                className={`group flex items-center gap-4 p-4 rounded-xl transition-all duration-500 animate-slide-in-left hover-lift ${theme === 'dark' ? 'bg-white/5 border border-white/10 hover:bg-white/10 hover:border-cyan-500/20' : 'bg-white border border-gray-200 shadow-sm hover:shadow-md hover:border-cyan-400'}`}
                style={{ animationDelay: `${0.4 + index * 0.1}s` }}
              >
                <div className={`w-10 h-10 ${item.bg} rounded-xl flex items-center justify-center ${item.color} group-hover:scale-110 transition-transform duration-300`}>
                  <item.icon className="w-5 h-5" />
                </div>
                <div className="flex-1">
                  <h4 className={`font-bold text-sm ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>{item.title}</h4>
                  <p className={`text-xs ${theme === 'dark' ? 'text-cyan-300/70' : 'text-gray-500'}`}>{item.time}</p>
                </div>
                <ChevronRight className={`w-4 h-4 transition-colors ${theme === 'dark' ? 'text-cyan-300/70 group-hover:text-cyan-400' : 'text-gray-400 group-hover:text-cyan-500'}`} />
              </div>
            ))}
          </div>
        </section>

        {/* Quick Actions */}
        <section className="grid md:grid-cols-2 gap-4">
          <Link 
            to="/emergency"
            className={`relative p-6 rounded-2xl overflow-hidden group hover:scale-[1.02] transition-transform duration-300 animate-bounce-in ${theme === 'dark' ? 'bg-gradient-to-br from-red-500/10 to-orange-500/10 border border-red-500/20' : 'bg-gradient-to-br from-red-50 to-orange-50 border-2 border-red-300 shadow-md'}`}
            style={{ animationDelay: '0.6s' }}
          >
            <div className="flex items-center gap-4">
              <div className="w-14 h-14 bg-red-500 rounded-xl flex items-center justify-center animate-pulse">
                <AlertTriangle className="w-7 h-7 text-white" />
              </div>
              <div>
                <h3 className={`font-bold text-lg ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>Emergency SOS</h3>
                <p className={`text-sm ${theme === 'dark' ? 'text-red-300/80' : 'text-red-600'}`}>Immediate assistance</p>
              </div>
            </div>
          </Link>

          <Link 
            to="/consultation"
            className={`relative p-6 rounded-2xl overflow-hidden group hover:scale-[1.02] transition-transform duration-300 animate-bounce-in ${theme === 'dark' ? 'bg-gradient-to-br from-cyan-500/10 to-blue-500/10 border border-cyan-500/20' : 'bg-gradient-to-br from-cyan-50 to-blue-50 border-2 border-cyan-300 shadow-md'}`}
            style={{ animationDelay: '0.65s' }}
          >
            <div className="flex items-center gap-4">
              <div className="w-14 h-14 bg-gradient-to-br from-cyan-500 to-blue-500 rounded-xl flex items-center justify-center">
                <Brain className="w-7 h-7 text-white" />
              </div>
              <div>
                <h3 className={`font-bold text-lg ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>Start Consultation</h3>
                <p className={`text-sm ${theme === 'dark' ? 'text-cyan-300/80' : 'text-cyan-600'}`}>Get instant AI advice</p>
              </div>
            </div>
          </Link>
        </section>

        {/* Pricing / Business Model Section */}
        <section className="mt-12 mb-10">
          <div className="text-center mb-8">
            <h2 className="text-2xl md:text-3xl font-bold mb-2 bg-gradient-to-r from-cyan-400 to-purple-400 bg-clip-text text-transparent">
              Choose Your Plan
            </h2>
            <p className={`text-sm ${theme === 'dark' ? 'text-cyan-300/80' : 'text-gray-600'}`}>Affordable healthcare for everyone</p>
          </div>

          <div className="grid md:grid-cols-3 gap-6">
            {/* Free Plan */}
            <div className={`relative p-6 rounded-2xl transition-all duration-300 group ${theme === 'dark' ? 'bg-white/5 border border-white/10 hover:border-cyan-500/30' : 'bg-white border border-gray-200 shadow-md hover:shadow-lg hover:border-cyan-400'}`}>
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 bg-cyan-500/20 rounded-xl flex items-center justify-center">
                  <Heart className="w-5 h-5 text-cyan-400" />
                </div>
                <div>
                  <h3 className={`font-bold text-lg ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>Free</h3>
                  <p className={`text-xs ${theme === 'dark' ? 'text-cyan-300/70' : 'text-gray-500'}`}>Basic Features</p>
                </div>
              </div>
              
              <div className="flex items-baseline gap-1 mb-6">
                <span className={`text-3xl font-bold ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>₹0</span>
                <span className={`text-sm ${theme === 'dark' ? 'text-cyan-300/70' : 'text-gray-500'}`}>/month</span>
              </div>
              
              <ul className="space-y-3 mb-6">
                <li className={`flex items-center gap-2 text-sm ${theme === 'dark' ? 'text-cyan-200' : 'text-gray-700'}`}>
                  <Check className="w-4 h-4 text-green-400" />
                  <span>3 AI consultations/month</span>
                </li>
                <li className="flex items-center gap-2 text-sm text-cyan-200">
                  <Check className="w-4 h-4 text-green-400" />
                  <span>Basic symptom checker</span>
                </li>
                <li className={`flex items-center gap-2 text-sm ${theme === 'dark' ? 'text-cyan-200' : 'text-gray-700'}`}>
                  <Check className="w-4 h-4 text-green-400" />
                  <span>Medication reminders</span>
                </li>
                <li className={`flex items-center gap-2 text-sm ${theme === 'dark' ? 'text-cyan-200' : 'text-gray-700'}`}>
                  <Check className="w-4 h-4 text-green-400" />
                  <span>Emergency SOS</span>
                </li>
              </ul>
              
              <button className={`w-full py-3 rounded-xl font-semibold transition-all ${theme === 'dark' ? 'bg-white/10 text-white hover:bg-white/20' : 'bg-gray-100 text-gray-700 hover:bg-gray-200 border border-gray-200'}`}>
                Current Plan
              </button>
            </div>

            {/* Pro Plan - Popular */}
            <div className={`relative p-6 border-2 border-cyan-500/50 rounded-2xl transform md:-translate-y-2 shadow-xl ${theme === 'dark' ? 'bg-gradient-to-br from-cyan-500/10 to-purple-500/10 shadow-cyan-500/10' : 'bg-gradient-to-br from-cyan-50 to-purple-50 shadow-cyan-200'}`}>
              <div className="absolute -top-3 left-1/2 -translate-x-1/2 px-4 py-1 bg-gradient-to-r from-cyan-500 to-purple-500 rounded-full text-xs font-bold flex items-center gap-1 text-white">
                <Star className="w-3 h-3" /> MOST POPULAR
              </div>
              
              <div className="flex items-center gap-3 mb-4 mt-2">
                <div className="w-10 h-10 bg-cyan-500/20 rounded-xl flex items-center justify-center">
                  <Zap className="w-5 h-5 text-cyan-400" />
                </div>
                <div>
                  <h3 className={`font-bold text-lg ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>Pro</h3>
                  <p className="text-xs text-cyan-400">For Individuals</p>
                </div>
              </div>
              
              <div className="flex items-baseline gap-1 mb-6">
                <span className={`text-3xl font-bold ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>₹199</span>
                <span className={`text-sm ${theme === 'dark' ? 'text-cyan-300' : 'text-cyan-600'}`}>/month</span>
              </div>
              
              <ul className="space-y-3 mb-6">
                <li className={`flex items-center gap-2 text-sm ${theme === 'dark' ? 'text-cyan-200' : 'text-gray-700'}`}>
                  <Check className="w-4 h-4 text-cyan-400" />
                  <span>Unlimited AI consultations</span>
                </li>
                <li className={`flex items-center gap-2 text-sm ${theme === 'dark' ? 'text-cyan-200' : 'text-gray-700'}`}>
                  <Check className="w-4 h-4 text-cyan-400" />
                  <span>Video call with AI Doctor</span>
                </li>
                <li className={`flex items-center gap-2 text-sm ${theme === 'dark' ? 'text-cyan-200' : 'text-gray-700'}`}>
                  <Check className="w-4 h-4 text-cyan-400" />
                  <span>Mental health tracking</span>
                </li>
                <li className={`flex items-center gap-2 text-sm ${theme === 'dark' ? 'text-cyan-200' : 'text-gray-700'}`}>
                  <Check className="w-4 h-4 text-cyan-400" />
                  <span>Prescription scanner</span>
                </li>
                <li className={`flex items-center gap-2 text-sm ${theme === 'dark' ? 'text-cyan-200' : 'text-gray-700'}`}>
                  <Check className="w-4 h-4 text-cyan-400" />
                  <span>Priority support</span>
                </li>
              </ul>
              
              <Link 
                to="/subscription"
                className="block w-full py-3 bg-gradient-to-r from-cyan-500 to-purple-500 text-white rounded-xl font-semibold text-center hover:opacity-90 transition-all"
              >
                Upgrade to Pro
              </Link>
            </div>

            {/* Family Plan */}
            <div className={`relative p-6 rounded-2xl transition-all duration-300 group ${theme === 'dark' ? 'bg-white/5 border border-white/10 hover:border-purple-500/30' : 'bg-white border border-gray-200 shadow-md hover:shadow-lg hover:border-purple-400'}`}>
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 bg-purple-500/20 rounded-xl flex items-center justify-center">
                  <Crown className="w-5 h-5 text-purple-400" />
                </div>
                <div>
                  <h3 className={`font-bold text-lg ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>Family</h3>
                  <p className="text-xs text-purple-400">Up to 5 members</p>
                </div>
              </div>
              
              <div className="flex items-baseline gap-1 mb-6">
                <span className={`text-3xl font-bold ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>₹499</span>
                <span className={`text-sm ${theme === 'dark' ? 'text-purple-300' : 'text-purple-500'}`}>/month</span>
              </div>
              
              <ul className="space-y-3 mb-6">
                <li className={`flex items-center gap-2 text-sm ${theme === 'dark' ? 'text-purple-200' : 'text-gray-700'}`}>
                  <Check className="w-4 h-4 text-purple-400" />
                  <span>Everything in Pro</span>
                </li>
                <li className={`flex items-center gap-2 text-sm ${theme === 'dark' ? 'text-purple-200' : 'text-gray-700'}`}>
                  <Check className="w-4 h-4 text-purple-400" />
                  <span>5 family member accounts</span>
                </li>
                <li className={`flex items-center gap-2 text-sm ${theme === 'dark' ? 'text-purple-200' : 'text-gray-700'}`}>
                  <Check className="w-4 h-4 text-purple-400" />
                  <span>Shared health dashboard</span>
                </li>
                <li className={`flex items-center gap-2 text-sm ${theme === 'dark' ? 'text-purple-200' : 'text-gray-700'}`}>
                  <Check className="w-4 h-4 text-purple-400" />
                  <span>Doctor appointment booking</span>
                </li>
                <li className={`flex items-center gap-2 text-sm ${theme === 'dark' ? 'text-purple-200' : 'text-gray-700'}`}>
                  <Check className="w-4 h-4 text-purple-400" />
                  <span>24/7 emergency support</span>
                </li>
              </ul>
              
              <Link 
                to="/subscription"
                className="block w-full py-3 bg-purple-500/20 text-purple-400 border border-purple-500/30 rounded-xl font-semibold text-center hover:bg-purple-500/30 transition-all"
              >
                Get Family Plan
              </Link>
            </div>
          </div>

          {/* Business Model Highlights */}
          <div className="mt-8 grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className={`p-4 rounded-xl text-center ${theme === 'dark' ? 'bg-white/5' : 'bg-green-50 border border-green-200'}`}>
              <IndianRupee className="w-6 h-6 text-green-500 mx-auto mb-2" />
              <p className={`text-xs ${theme === 'dark' ? 'text-green-300' : 'text-green-600'}`}>Save up to</p>
              <p className="font-bold text-green-500">90% on Meds</p>
            </div>
            <div className={`p-4 rounded-xl text-center ${theme === 'dark' ? 'bg-white/5' : 'bg-cyan-50 border border-cyan-200'}`}>
              <Shield className="w-6 h-6 text-cyan-500 mx-auto mb-2" />
              <p className={`text-xs ${theme === 'dark' ? 'text-cyan-300' : 'text-cyan-600'}`}>Data</p>
              <p className="font-bold text-cyan-500">100% Secure</p>
            </div>
            <div className={`p-4 rounded-xl text-center ${theme === 'dark' ? 'bg-white/5' : 'bg-purple-50 border border-purple-200'}`}>
              <Clock className="w-6 h-6 text-purple-500 mx-auto mb-2" />
              <p className={`text-xs ${theme === 'dark' ? 'text-purple-300' : 'text-purple-600'}`}>Available</p>
              <p className="font-bold text-purple-500">24/7</p>
            </div>
            <div className={`p-4 rounded-xl text-center ${theme === 'dark' ? 'bg-white/5' : 'bg-pink-50 border border-pink-200'}`}>
              <Activity className="w-6 h-6 text-pink-500 mx-auto mb-2" />
              <p className={`text-xs ${theme === 'dark' ? 'text-pink-300' : 'text-pink-600'}`}>Response</p>
              <p className="font-bold text-pink-500">&lt; 2 Seconds</p>
            </div>
          </div>
        </section>
      </main>

      {/* Bottom Navigation for Mobile */}
      <nav className={`fixed bottom-0 left-0 right-0 z-50 backdrop-blur-xl border-t px-4 py-3 md:hidden ${theme === 'dark' ? 'bg-black/90 border-white/10' : 'bg-white/95 border-gray-200 shadow-lg'}`}>
        <div className="flex items-center justify-around">
          <Link to="/dashboard" className={`flex flex-col items-center gap-1 relative ${theme === 'dark' ? 'text-cyan-400' : 'text-cyan-600'}`}>
            <div className={`absolute -top-1 left-1/2 -translate-x-1/2 w-8 h-1 rounded-full ${theme === 'dark' ? 'bg-cyan-400' : 'bg-cyan-500'}`} />
            <HomeIcon className="w-5 h-5" />
            <span className="text-[10px] font-bold">Home</span>
          </Link>
          <Link to="/consultation" className={`flex flex-col items-center gap-1 transition-all duration-300 hover:scale-110 ${theme === 'dark' ? 'text-cyan-300 hover:text-cyan-400' : 'text-gray-500 hover:text-cyan-600'}`}>
            <Brain className="w-5 h-5" />
            <span className="text-[10px]">AI Doc</span>
          </Link>
          <Link to="/medicine" className={`flex flex-col items-center gap-1 transition-all duration-300 hover:scale-110 ${theme === 'dark' ? 'text-cyan-300 hover:text-cyan-400' : 'text-gray-500 hover:text-cyan-600'}`}>
            <Pill className="w-5 h-5" />
            <span className="text-[10px]">Meds</span>
          </Link>
          <Link to="/mental-health" className={`flex flex-col items-center gap-1 transition-all duration-300 hover:scale-110 ${theme === 'dark' ? 'text-cyan-300 hover:text-cyan-400' : 'text-gray-500 hover:text-cyan-600'}`}>
            <Heart className="w-5 h-5" />
            <span className="text-[10px]">Mental</span>
          </Link>
          <Link to="/emergency" className={`flex flex-col items-center gap-1 transition-all duration-300 hover:scale-110 ${theme === 'dark' ? 'text-cyan-300 hover:text-red-400' : 'text-gray-500 hover:text-red-500'}`}>
            <AlertTriangle className="w-5 h-5" />
            <span className="text-[10px]">SOS</span>
          </Link>
        </div>
      </nav>

      {/* Enhanced Custom Styles */}
      <style>{`
        @keyframes antigravity {
          0% {
            transform: translateY(0) translateX(0) scale(0);
            opacity: 0;
          }
          10% {
            transform: translateY(-10vh) translateX(10px) scale(1);
            opacity: 0.8;
          }
          50% {
            transform: translateY(-50vh) translateX(-15px) scale(1.2);
            opacity: 0.6;
          }
          90% {
            transform: translateY(-95vh) translateX(10px) scale(0.8);
            opacity: 0.3;
          }
          100% {
            transform: translateY(-110vh) translateX(0) scale(0);
            opacity: 0;
          }
        }
        .animate-antigravity {
          animation: antigravity 15s ease-in-out infinite;
        }
        @keyframes slide-in-left {
          from { opacity: 0; transform: translateX(-30px); }
          to { opacity: 1; transform: translateX(0); }
        }
        @keyframes bounce-in {
          0% { opacity: 0; transform: scale(0.8) translateY(10px); }
          60% { transform: scale(1.05) translateY(-5px); }
          100% { opacity: 1; transform: scale(1) translateY(0); }
        }
        @keyframes pulse-glow {
          0%, 100% { box-shadow: 0 0 20px rgba(0, 217, 255, 0.3); }
          50% { box-shadow: 0 0 40px rgba(0, 217, 255, 0.6); }
        }
        @keyframes float-gentle {
          0%, 100% { transform: translateY(0); }
          50% { transform: translateY(-10px); }
        }
        @keyframes gradient-shift {
          0%, 100% { background-position: 0% 50%; }
          50% { background-position: 100% 50%; }
        }
        @keyframes number-pop {
          0% { transform: scale(1); }
          50% { transform: scale(1.1); }
          100% { transform: scale(1); }
        }
        .animate-slide-in-left {
          animation: slide-in-left 0.7s cubic-bezier(0.16, 1, 0.3, 1) forwards;
          opacity: 0;
        }
        .animate-bounce-in {
          animation: bounce-in 0.6s cubic-bezier(0.34, 1.56, 0.64, 1) forwards;
          opacity: 0;
        }
        .animate-pulse-glow {
          animation: pulse-glow 2s ease-in-out infinite;
        }
        .animate-float-gentle {
          animation: float-gentle 4s ease-in-out infinite;
        }
        .animate-gradient-shift {
          background-size: 200% 200%;
          animation: gradient-shift 3s ease infinite;
        }
        .animate-number-pop {
          animation: number-pop 0.5s ease-out;
        }
        .hover-lift {
          transition: transform 0.3s ease, box-shadow 0.3s ease;
        }
        .hover-lift:hover {
          transform: translateY(-4px);
          box-shadow: 0 20px 40px rgba(0, 0, 0, 0.3);
        }
        
        /* Flip Animation */
        @keyframes flip-in {
          0% {
            opacity: 0;
            transform: rotateY(-90deg) scale(0.9);
          }
          100% {
            opacity: 1;
            transform: rotateY(0deg) scale(1);
          }
        }
        .animate-flip-in {
          animation: flip-in 0.4s ease-out forwards;
        }
      \`}</style>
    </div>
  );
}
        }
        .flip-card-back {
          transform: rotateY(180deg);
        }
      `}</style>
    </div>
  );
}

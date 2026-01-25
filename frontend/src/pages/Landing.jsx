import React, { useState, useEffect, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Heart, Brain, Pill, Stethoscope, Phone, Activity, Shield, Zap, ChevronRight, Star, Users, Clock, ArrowRight, Sparkles } from 'lucide-react';
import { useAuth } from '../AuthContext';

const Landing = () => {
  const [scrollY, setScrollY] = useState(0);
  const [isVisible, setIsVisible] = useState({});
  const [mousePos, setMousePos] = useState({ x: -1000, y: -1000 });
  const [typedText, setTypedText] = useState('');
  const heroRef = useRef(null);
  const { isAuthenticated } = useAuth();
  const navigate = useNavigate();

  const fullText = 'REIMAGINED.';

  // Generate stable particle data once
  const [particles] = useState(() => 
    [...Array(40)].map((_, i) => ({
      id: i,
      size: 2 + Math.random() * 6,
      left: Math.random() * 100,
      color: i % 3 === 0 ? '0, 217, 255' : i % 3 === 1 ? '139, 92, 246' : '236, 72, 153',
      opacity: 0.2 + Math.random() * 0.5,
      delay: Math.random() * 10,
      duration: 10 + Math.random() * 15,
    }))
  );

  useEffect(() => {
    if (isAuthenticated) {
      navigate('/dashboard', { replace: true });
    }
  }, [isAuthenticated, navigate]);

  // Typing effect
  useEffect(() => {
    let index = 0;
    const timer = setInterval(() => {
      if (index <= fullText.length) {
        setTypedText(fullText.slice(0, index));
        index++;
      } else {
        clearInterval(timer);
      }
    }, 100);
    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
    const handleScroll = () => setScrollY(window.scrollY);
    const handleMouseMove = (e) => setMousePos({ x: e.clientX, y: e.clientY });
    window.addEventListener('scroll', handleScroll);
    window.addEventListener('mousemove', handleMouseMove);
    return () => {
      window.removeEventListener('scroll', handleScroll);
      window.removeEventListener('mousemove', handleMouseMove);
    };
  }, []);

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          setIsVisible((prev) => ({ ...prev, [entry.target.id]: entry.isIntersecting }));
        });
      },
      { threshold: 0.1 }
    );

    document.querySelectorAll('[data-animate]').forEach((el) => observer.observe(el));
    return () => observer.disconnect();
  }, []);

  const features = [
    { icon: Brain, title: 'AI Consultation', desc: 'Get instant medical advice from our advanced AI doctor', color: 'from-cyan-500 to-blue-500' },
    { icon: Heart, title: 'Mental Health', desc: 'Track your mood and access AI-powered therapy sessions', color: 'from-pink-500 to-rose-500' },
    { icon: Pill, title: 'Medication Manager', desc: 'Never miss a dose with smart reminders', color: 'from-purple-500 to-violet-500' },
    { icon: Stethoscope, title: 'Find Doctors', desc: 'Book appointments with verified specialists', color: 'from-green-500 to-emerald-500' },
    { icon: Phone, title: 'Emergency SOS', desc: '24/7 emergency assistance at your fingertips', color: 'from-red-500 to-orange-500' },
    { icon: Activity, title: 'Health Tracking', desc: 'Monitor vital signs and health metrics', color: 'from-yellow-500 to-amber-500' },
  ];

  const stats = [
    { value: '50K+', label: 'Active Users', icon: Users },
    { value: '24/7', label: 'AI Support', icon: Clock },
    { value: '99.9%', label: 'Accuracy Rate', icon: Shield },
    { value: '1M+', label: 'Consultations', icon: Zap },
  ];

  const testimonials = [
    { name: 'Sarah M.', role: 'Patient', text: 'PulseAI saved my life with its emergency detection feature. Absolutely incredible!', rating: 5 },
    { name: 'Dr. James K.', role: 'Physician', text: 'As a doctor, I recommend PulseAI to all my patients for health monitoring.', rating: 5 },
    { name: 'Michael R.', role: 'Caregiver', text: 'Managing medications for my parents has never been easier. Game changer!', rating: 5 },
  ];

  return (
    <div className="min-h-screen bg-black text-white overflow-x-hidden">
      {/* Animated Background with Mouse Parallax */}
      <div className="fixed inset-0 z-0">
        <div className="absolute inset-0 bg-gradient-to-br from-black via-gray-900 to-black" />
        
        {/* Animated Grid */}
        <div className="absolute inset-0 opacity-20">
          <div className="absolute inset-0" style={{
            backgroundImage: `linear-gradient(rgba(0,217,255,0.1) 1px, transparent 1px), linear-gradient(90deg, rgba(0,217,255,0.1) 1px, transparent 1px)`,
            backgroundSize: '60px 60px',
            transform: `perspective(500px) rotateX(60deg) translateY(${scrollY * 0.5}px)`,
            transformOrigin: 'center top',
          }} />
        </div>

        {/* Floating Orbs with Mouse Parallax */}
        <div 
          className="absolute w-[600px] h-[600px] rounded-full blur-3xl transition-transform duration-1000 ease-out"
          style={{ 
            left: '20%', 
            top: '10%',
            background: 'radial-gradient(circle, rgba(0,217,255,0.15) 0%, transparent 70%)',
            transform: `translate(${mousePos.x * 0.02}px, ${mousePos.y * 0.02 + scrollY * 0.3}px)`,
          }}
        />
        <div 
          className="absolute w-[500px] h-[500px] rounded-full blur-3xl transition-transform duration-1000 ease-out"
          style={{ 
            right: '10%', 
            top: '40%',
            background: 'radial-gradient(circle, rgba(139,92,246,0.15) 0%, transparent 70%)',
            transform: `translate(${mousePos.x * -0.015}px, ${mousePos.y * -0.015 + scrollY * -0.2}px)`,
          }}
        />
        <div 
          className="absolute w-[400px] h-[400px] rounded-full blur-3xl transition-transform duration-1000 ease-out"
          style={{ 
            left: '50%', 
            bottom: '10%',
            background: 'radial-gradient(circle, rgba(236,72,153,0.1) 0%, transparent 70%)',
            transform: `translate(${mousePos.x * 0.01}px, ${mousePos.y * 0.01}px)`,
          }}
        />

        {/* Interactive Antigravity Particles - Fade from cursor */}
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
                left: `calc(${particle.left}% + ${repelX}px)`,
                bottom: `calc(-20px + ${repelY}px)`,
                width: `${particle.size}px`,
                height: `${particle.size}px`,
                background: `rgba(${particle.color}, ${particle.opacity * fadeFactor})`,
                animationDelay: `${particle.delay}s`,
                animationDuration: `${particle.duration}s`,
                transform: `scale(${0.5 + fadeFactor * 0.5})`,
                transition: 'left 0.15s ease-out, bottom 0.15s ease-out, background 0.2s ease, transform 0.2s ease',
                zIndex: 1,
                boxShadow: fadeFactor < 0.8 ? `0 0 ${10 * (1 - fadeFactor)}px rgba(${particle.color}, 0.5)` : 'none',
              }}
            />
          );
        })}
      </div>

      {/* Navigation */}
      <nav className={`fixed top-0 left-0 right-0 z-50 transition-all duration-500 ${scrollY > 50 ? 'bg-black/80 backdrop-blur-xl border-b border-white/10' : ''}`}>
        <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3 group">
            <div className="relative">
              <Heart className="w-10 h-10 text-cyan-400 group-hover:scale-110 transition-transform" />
              <div className="absolute inset-0 w-10 h-10 bg-cyan-400/30 blur-xl animate-pulse" />
              <div className="absolute inset-0 w-10 h-10 animate-ping-slow">
                <Heart className="w-10 h-10 text-cyan-400/30" />
              </div>
            </div>
            <span className="text-2xl font-black tracking-tighter">
              PULSE<span className="text-cyan-400 animate-text-shimmer">AI</span>
            </span>
          </div>
          <div className="hidden md:flex items-center gap-8">
            {['Features', 'Stats', 'Reviews'].map((item, i) => (
              <a 
                key={item}
                href={`#${item.toLowerCase()}`} 
                className="relative text-gray-400 hover:text-white transition-colors group"
              >
                {item}
                <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-cyan-400 group-hover:w-full transition-all duration-300" />
              </a>
            ))}
          </div>
          <Link 
            to="/login"
            className="relative px-6 py-3 bg-white text-black font-bold rounded-full overflow-hidden group"
          >
            <span className="relative z-10">Get Started</span>
            <div className="absolute inset-0 bg-gradient-to-r from-cyan-400 to-purple-400 translate-y-full group-hover:translate-y-0 transition-transform duration-300" />
          </Link>
        </div>
      </nav>

      {/* Hero Section */}
      <section ref={heroRef} className="relative z-10 min-h-screen flex items-center justify-center px-6 pt-20">
        <div className="max-w-6xl mx-auto text-center">
          {/* Animated Badge */}
          <div className="mb-8 inline-flex items-center gap-2 px-4 py-2 bg-white/5 border border-white/10 rounded-full animate-slide-down overflow-hidden group hover:border-cyan-500/50 transition-colors">
            <Sparkles className="w-4 h-4 text-cyan-400 animate-spin-slow" />
            <span className="text-sm text-gray-400">AI-Powered Healthcare Revolution</span>
            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000" />
          </div>
          
          {/* Main Headline with Staggered Animation */}
          <h1 className="text-5xl md:text-7xl lg:text-9xl font-black tracking-tighter mb-8 leading-none">
            <span className="block overflow-hidden">
              <span className="block animate-slide-up" style={{ animationDelay: '0.3s' }}>YOUR HEALTH.</span>
            </span>
            <span className="block overflow-hidden">
              <span className="block animate-slide-up" style={{ animationDelay: '0.5s' }}>
                <span className="bg-gradient-to-r from-cyan-400 via-blue-500 to-purple-500 bg-clip-text text-transparent bg-[length:200%_auto] animate-gradient-x">
                  {typedText}<span className="animate-blink">|</span>
                </span>
              </span>
            </span>
          </h1>
          
          {/* Subtitle with Reveal */}
          <p className="text-xl md:text-2xl text-gray-400 max-w-3xl mx-auto mb-12 animate-fade-in" style={{ animationDelay: '1s' }}>
            Experience the future of healthcare with AI-powered consultations, 
            smart medication management, and 24/7 emergency support.
          </p>

          {/* CTA Buttons */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 animate-fade-in" style={{ animationDelay: '1.2s' }}>
            <Link 
              to="/login"
              className="group relative px-8 py-4 bg-gradient-to-r from-cyan-500 to-blue-500 text-black font-bold rounded-full flex items-center gap-2 overflow-hidden"
            >
              <span className="relative z-10 flex items-center gap-2">
                Start Your Journey
                <ArrowRight className="w-5 h-5 group-hover:translate-x-2 transition-transform" />
              </span>
              <div className="absolute inset-0 bg-gradient-to-r from-purple-500 to-pink-500 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
              <div className="absolute inset-0 scale-x-0 group-hover:scale-x-100 origin-left bg-white/20 transition-transform duration-500" />
            </Link>
            <a 
              href="#features"
              className="group px-8 py-4 border border-white/20 rounded-full font-bold hover:border-cyan-400 transition-all duration-300 relative overflow-hidden"
            >
              <span className="relative z-10">Explore Features</span>
              <div className="absolute inset-0 bg-cyan-400/10 translate-y-full group-hover:translate-y-0 transition-transform duration-300" />
            </a>
          </div>

          {/* Floating 3D Icons */}
          <div className="absolute inset-0 pointer-events-none overflow-hidden">
            <div className="animate-float-3d" style={{ position: 'absolute', left: '5%', top: '20%', animationDelay: '0s' }}>
              <div className="w-16 h-16 bg-gradient-to-br from-cyan-500/20 to-blue-500/20 rounded-2xl backdrop-blur-sm border border-white/10 flex items-center justify-center transform rotate-12 hover:rotate-0 transition-transform">
                <Heart className="w-8 h-8 text-cyan-400" />
              </div>
            </div>
            <div className="animate-float-3d" style={{ position: 'absolute', right: '8%', top: '25%', animationDelay: '1s' }}>
              <div className="w-20 h-20 bg-gradient-to-br from-purple-500/20 to-pink-500/20 rounded-2xl backdrop-blur-sm border border-white/10 flex items-center justify-center transform -rotate-12 hover:rotate-0 transition-transform">
                <Brain className="w-10 h-10 text-purple-400" />
              </div>
            </div>
            <div className="animate-float-3d" style={{ position: 'absolute', left: '12%', bottom: '25%', animationDelay: '2s' }}>
              <div className="w-14 h-14 bg-gradient-to-br from-pink-500/20 to-rose-500/20 rounded-2xl backdrop-blur-sm border border-white/10 flex items-center justify-center transform rotate-6 hover:rotate-0 transition-transform">
                <Pill className="w-7 h-7 text-pink-400" />
              </div>
            </div>
            <div className="animate-float-3d" style={{ position: 'absolute', right: '15%', bottom: '30%', animationDelay: '1.5s' }}>
              <div className="w-16 h-16 bg-gradient-to-br from-green-500/20 to-emerald-500/20 rounded-2xl backdrop-blur-sm border border-white/10 flex items-center justify-center transform -rotate-6 hover:rotate-0 transition-transform">
                <Activity className="w-8 h-8 text-green-400" />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="relative z-10 py-32 px-6" data-animate>
        <div className="max-w-7xl mx-auto">
          <div className={`text-center mb-20 transition-all duration-1000 ${isVisible['features'] ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'}`}>
            <span className="inline-block px-4 py-1 bg-cyan-500/10 border border-cyan-500/30 rounded-full text-cyan-400 font-bold tracking-wider uppercase text-sm mb-4">Features</span>
            <h2 className="text-4xl md:text-6xl font-black tracking-tighter mt-4">
              EVERYTHING YOU <span className="bg-gradient-to-r from-cyan-400 to-purple-400 bg-clip-text text-transparent">NEED</span>
            </h2>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {features.map((feature, index) => (
              <div
                key={index}
                className={`group relative p-8 bg-white/5 border border-white/10 rounded-3xl transition-all duration-700 hover:border-cyan-500/50 overflow-hidden ${isVisible['features'] ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-20'}`}
                style={{ transitionDelay: `${index * 100}ms` }}
              >
                {/* Animated gradient background on hover */}
                <div className="absolute inset-0 bg-gradient-to-br from-cyan-500/10 via-transparent to-purple-500/10 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                
                {/* Shine effect */}
                <div className="absolute inset-0 opacity-0 group-hover:opacity-100">
                  <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/5 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000" />
                </div>

                {/* 3D Transform on hover */}
                <div className="relative z-10 transition-transform duration-500 group-hover:translate-y-[-4px]">
                  <div className={`w-16 h-16 bg-gradient-to-br ${feature.color} rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 group-hover:rotate-3 transition-all duration-500 shadow-lg group-hover:shadow-cyan-500/25`}>
                    <feature.icon className="w-8 h-8 text-white" />
                  </div>
                  <h3 className="text-2xl font-bold mb-3 group-hover:text-cyan-400 transition-colors">{feature.title}</h3>
                  <p className="text-gray-400 group-hover:text-gray-300 transition-colors">{feature.desc}</p>
                  <div className="mt-6 flex items-center gap-2 text-cyan-400 opacity-0 group-hover:opacity-100 transform translate-y-2 group-hover:translate-y-0 transition-all duration-300">
                    <span className="font-bold">Learn more</span>
                    <ChevronRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                  </div>
                </div>

                {/* Corner accent */}
                <div className="absolute top-0 right-0 w-20 h-20 bg-gradient-to-bl from-cyan-500/20 to-transparent rounded-bl-full opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section id="stats" className="relative z-10 py-32 px-6" data-animate>
        <div className="max-w-7xl mx-auto">
          {/* Animated background for stats */}
          <div className="absolute inset-0 bg-gradient-to-r from-cyan-950/30 via-purple-950/30 to-cyan-950/30 rounded-[60px] mx-6" />
          
          <div className="relative grid grid-cols-2 lg:grid-cols-4 gap-8 py-16">
            {stats.map((stat, index) => (
              <div
                key={index}
                className={`text-center p-8 transition-all duration-1000 group ${isVisible['stats'] ? 'opacity-100 scale-100' : 'opacity-0 scale-75'}`}
                style={{ transitionDelay: `${index * 150}ms` }}
              >
                <div className="relative inline-block mb-4">
                  <stat.icon className="w-12 h-12 text-cyan-400 group-hover:scale-110 transition-transform" />
                  <div className="absolute inset-0 bg-cyan-400/30 blur-xl opacity-0 group-hover:opacity-100 transition-opacity" />
                </div>
                <div className="text-5xl md:text-7xl font-black bg-gradient-to-r from-white via-cyan-200 to-white bg-clip-text text-transparent animate-shimmer bg-[length:200%_100%]">
                  {stat.value}
                </div>
                <div className="text-gray-400 mt-2 uppercase tracking-wider text-sm">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section id="testimonials" className="relative z-10 py-32 px-6" data-animate>
        <div className="max-w-7xl mx-auto">
          <div className={`text-center mb-20 transition-all duration-1000 ${isVisible['testimonials'] ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'}`}>
            <span className="inline-block px-4 py-1 bg-purple-500/10 border border-purple-500/30 rounded-full text-purple-400 font-bold tracking-wider uppercase text-sm mb-4">Testimonials</span>
            <h2 className="text-4xl md:text-6xl font-black tracking-tighter mt-4">
              TRUSTED BY <span className="bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent">THOUSANDS</span>
            </h2>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {testimonials.map((testimonial, index) => (
              <div
                key={index}
                className={`group relative p-8 bg-white/5 border border-white/10 rounded-3xl transition-all duration-1000 hover:border-purple-500/50 overflow-hidden ${isVisible['testimonials'] ? 'opacity-100 translate-y-0 rotate-0' : 'opacity-0 translate-y-20 rotate-3'}`}
                style={{ transitionDelay: `${index * 200}ms` }}
              >
                {/* Quote marks */}
                <div className="absolute top-4 right-4 text-6xl text-white/5 font-serif">"</div>
                
                <div className="flex gap-1 mb-6">
                  {[...Array(testimonial.rating)].map((_, i) => (
                    <Star 
                      key={i} 
                      className="w-5 h-5 fill-cyan-400 text-cyan-400 animate-star-pop" 
                      style={{ animationDelay: `${1 + index * 0.2 + i * 0.1}s` }}
                    />
                  ))}
                </div>
                <p className="text-lg text-gray-300 mb-6 relative z-10">"{testimonial.text}"</p>
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 bg-gradient-to-br from-cyan-500 to-purple-500 rounded-full flex items-center justify-center text-white font-bold">
                    {testimonial.name.charAt(0)}
                  </div>
                  <div>
                    <div className="font-bold">{testimonial.name}</div>
                    <div className="text-gray-500 text-sm">{testimonial.role}</div>
                  </div>
                </div>

                {/* Hover glow */}
                <div className="absolute inset-0 bg-gradient-to-t from-purple-500/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="relative z-10 py-32 px-6">
        <div className="max-w-4xl mx-auto text-center">
          <div className="relative p-16 bg-gradient-to-br from-cyan-500/10 via-purple-500/10 to-pink-500/10 border border-white/10 rounded-[40px] overflow-hidden group">
            {/* Animated background orbs */}
            <div className="absolute top-0 left-0 w-40 h-40 bg-cyan-500/20 rounded-full blur-3xl animate-float-slow" />
            <div className="absolute bottom-0 right-0 w-40 h-40 bg-purple-500/20 rounded-full blur-3xl animate-float-slow" style={{ animationDelay: '2s' }} />
            
            <h2 className="relative text-4xl md:text-6xl font-black tracking-tighter mb-6">
              READY TO <span className="bg-gradient-to-r from-cyan-400 via-purple-400 to-pink-400 bg-clip-text text-transparent animate-gradient-x bg-[length:200%_auto]">START</span>?
            </h2>
            <p className="relative text-xl text-gray-400 mb-10">
              Join thousands of users who trust PulseAI for their healthcare needs.
            </p>
            <Link 
              to="/login"
              className="relative inline-flex items-center gap-3 px-10 py-5 bg-white text-black font-bold text-lg rounded-full overflow-hidden group/btn hover:shadow-2xl hover:shadow-cyan-500/25 transition-all duration-300"
            >
              <span className="relative z-10 flex items-center gap-3">
                Get Started Free
                <ArrowRight className="w-6 h-6 group-hover/btn:translate-x-2 transition-transform" />
              </span>
              <div className="absolute inset-0 bg-gradient-to-r from-cyan-400 via-purple-400 to-pink-400 opacity-0 group-hover/btn:opacity-100 transition-opacity duration-300" />
            </Link>
          </div>
        </div>
      </section>

      {/* Doctor CTA Section */}
      <section className="relative z-10 py-12 px-6">
        <div className="max-w-4xl mx-auto">
          <div className="relative p-8 bg-gradient-to-r from-orange-500/10 to-red-500/10 border border-orange-500/20 rounded-3xl overflow-hidden flex flex-col md:flex-row items-center justify-between gap-6">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-gradient-to-r from-orange-500 to-red-500 rounded-xl">
                <Stethoscope className="w-8 h-8 text-white" />
              </div>
              <div>
                <h3 className="text-xl font-bold text-white">Are you a healthcare professional?</h3>
                <p className="text-gray-400">Join PulseAI and expand your practice with AI-powered tools</p>
              </div>
            </div>
            <Link 
              to="/doctor-pricing"
              className="px-6 py-3 bg-gradient-to-r from-orange-500 to-red-500 text-white font-bold rounded-full hover:from-orange-600 hover:to-red-600 transition-all flex items-center gap-2 whitespace-nowrap"
            >
              Join as Doctor
              <ArrowRight className="w-5 h-5" />
            </Link>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="relative z-10 border-t border-white/10 py-12 px-6">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="flex items-center gap-3 group">
            <Heart className="w-8 h-8 text-cyan-400 group-hover:animate-heartbeat" />
            <span className="text-xl font-black">PULSE<span className="text-cyan-400">AI</span></span>
          </div>
          <div className="text-gray-500 text-sm text-center md:text-left">
            © 2026 PulseAI India. All rights reserved. | Made with ❤️ in India
          </div>
        </div>
      </footer>

      {/* Enhanced Custom Styles */}
      <style>{`
        @keyframes fade-in-up {
          from { opacity: 0; transform: translateY(30px); }
          to { opacity: 1; transform: translateY(0); }
        }

        @keyframes slide-up {
          from { opacity: 0; transform: translateY(100%); }
          to { opacity: 1; transform: translateY(0); }
        }

        @keyframes slide-down {
          from { opacity: 0; transform: translateY(-20px); }
          to { opacity: 1; transform: translateY(0); }
        }

        @keyframes fade-in {
          from { opacity: 0; }
          to { opacity: 1; }
        }

        @keyframes float {
          0%, 100% { transform: translateY(0) rotate(0deg); }
          50% { transform: translateY(-20px) rotate(5deg); }
        }

        @keyframes float-3d {
          0%, 100% { transform: translateY(0) translateX(0) rotate3d(1, 1, 0, 0deg); }
          25% { transform: translateY(-15px) translateX(10px) rotate3d(1, 1, 0, 5deg); }
          50% { transform: translateY(-25px) translateX(0) rotate3d(1, 1, 0, 0deg); }
          75% { transform: translateY(-15px) translateX(-10px) rotate3d(1, 1, 0, -5deg); }
        }

        @keyframes float-particle {
          0%, 100% { transform: translateY(0) translateX(0); opacity: 0.3; }
          25% { transform: translateY(-30px) translateX(20px); opacity: 0.6; }
          50% { transform: translateY(-50px) translateX(0); opacity: 0.4; }
          75% { transform: translateY(-30px) translateX(-20px); opacity: 0.6; }
        }

        @keyframes antigravity {
          0% { 
            transform: translateY(0) translateX(0) scale(0);
            opacity: 0;
          }
          10% {
            opacity: 0.6;
            transform: translateY(-10vh) translateX(10px) scale(1);
          }
          50% {
            opacity: 0.4;
            transform: translateY(-50vh) translateX(-15px) scale(0.8);
          }
          90% {
            opacity: 0.2;
            transform: translateY(-95vh) translateX(5px) scale(0.5);
          }
          100% { 
            transform: translateY(-110vh) translateX(0) scale(0);
            opacity: 0;
          }
        }

        @keyframes float-slow {
          0%, 100% { transform: translateY(0) scale(1); }
          50% { transform: translateY(-30px) scale(1.1); }
        }

        @keyframes scroll-down {
          0% { opacity: 1; transform: translateY(0); }
          100% { opacity: 0; transform: translateY(8px); }
        }

        @keyframes gradient-x {
          0%, 100% { background-position: 0% 50%; }
          50% { background-position: 100% 50%; }
        }

        @keyframes shimmer {
          0% { background-position: -200% 0; }
          100% { background-position: 200% 0; }
        }

        @keyframes blink {
          0%, 50% { opacity: 1; }
          51%, 100% { opacity: 0; }
        }

        @keyframes ping-slow {
          0% { transform: scale(1); opacity: 0.5; }
          75%, 100% { transform: scale(1.5); opacity: 0; }
        }

        @keyframes spin-slow {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }

        @keyframes dna {
          0%, 100% { transform: rotateY(0deg); }
          50% { transform: rotateY(180deg); }
        }

        @keyframes ecg-line {
          0% { transform: translateX(-100%); }
          100% { transform: translateX(100%); }
        }

        @keyframes star-pop {
          0% { transform: scale(0) rotate(-180deg); opacity: 0; }
          50% { transform: scale(1.2) rotate(0deg); }
          100% { transform: scale(1) rotate(0deg); opacity: 1; }
        }

        @keyframes heartbeat {
          0%, 100% { transform: scale(1); }
          10% { transform: scale(1.15); }
          20% { transform: scale(1); }
          30% { transform: scale(1.1); }
          40% { transform: scale(1); }
        }

        @keyframes text-shimmer {
          0% { filter: brightness(1); }
          50% { filter: brightness(1.3); }
          100% { filter: brightness(1); }
        }

        .animate-fade-in-up { animation: fade-in-up 1s ease-out forwards; opacity: 0; }
        .animate-slide-up { animation: slide-up 0.8s cubic-bezier(0.16, 1, 0.3, 1) forwards; opacity: 0; }
        .animate-slide-down { animation: slide-down 0.6s ease-out forwards; opacity: 0; }
        .animate-fade-in { animation: fade-in 1s ease-out forwards; opacity: 0; }
        .animate-float { animation: float 6s ease-in-out infinite; }
        .animate-float-3d { animation: float-3d 8s ease-in-out infinite; }
        .animate-float-particle { animation: float-particle 10s ease-in-out infinite; }
        .animate-antigravity { animation: antigravity 15s ease-in-out infinite; }
        .animate-float-slow { animation: float-slow 8s ease-in-out infinite; }
        .animate-scroll-down { animation: scroll-down 1.5s ease-in-out infinite; }
        .animate-gradient-x { animation: gradient-x 3s ease infinite; }
        .animate-shimmer { animation: shimmer 3s linear infinite; }
        .animate-blink { animation: blink 1s step-end infinite; }
        .animate-ping-slow { animation: ping-slow 2s cubic-bezier(0, 0, 0.2, 1) infinite; }
        .animate-spin-slow { animation: spin-slow 8s linear infinite; }
        .animate-dna { animation: dna 4s ease-in-out infinite; }
        .animate-ecg-line { animation: ecg-line 3s linear infinite; }
        .animate-star-pop { animation: star-pop 0.5s ease-out forwards; opacity: 0; }
        .animate-heartbeat { animation: heartbeat 1s ease-in-out infinite; }
        .animate-text-shimmer { animation: text-shimmer 2s ease-in-out infinite; }
      `}</style>
    </div>
  );
};

export default Landing;

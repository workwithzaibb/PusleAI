import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Heart, Activity, Shield, Baby, Sparkles, ArrowLeft } from 'lucide-react';
import { Card, CardContent } from '../components/ui/card';
import { Button } from '../components/ui/button';

const QueensHealth = () => {
    const navigate = useNavigate();

    const sections = [
        {
            title: "PCOS/PCOD Management",
            icon: Sparkles,
            desc: "Track symptoms and get AI-powered lifestyle recommendations.",
            color: "bg-pink-100 text-pink-600"
        },
        {
            title: "Maternal Companion",
            icon: Baby,
            desc: "Pregnancy guidance and emergency 'Red Flag' detection.",
            color: "bg-purple-100 text-purple-600"
        },
        {
            title: "Anemia & Nutrition",
            icon: Activity,
            desc: "Risk assessment for iron deficiency and personalized diet plans.",
            color: "bg-red-100 text-red-600"
        },
        {
            title: "Mental Wellbeing",
            icon: Heart,
            desc: "Support for postpartum and hormonal mood fluctuations.",
            color: "bg-orange-100 text-orange-600"
        }
    ];

    return (
        <div className="min-h-screen bg-slate-50 pb-20">
            {/* Header */}
            <div className="bg-white px-6 py-6 flex items-center gap-4 shadow-sm border-b">
                <button onClick={() => navigate(-1)} className="p-2 hover:bg-slate-100 rounded-full transition-colors">
                    <ArrowLeft className="w-6 h-6 text-slate-600" />
                </button>
                <div>
                    <h1 className="text-2xl font-bold bg-gradient-to-r from-pink-500 to-purple-600 bg-clip-text text-transparent">
                        For Queens 👑
                    </h1>
                    <p className="text-slate-500 text-sm">Empowering Women's Health in India</p>
                </div>
            </div>

            <div className="p-6 space-y-6 max-w-2xl mx-auto">
                {/* Hero Section */}
                <Card className="bg-gradient-to-br from-pink-500 to-purple-600 text-white border-none overflow-hidden">
                    <CardContent className="p-6 relative">
                        <div className="relative z-10">
                            <h2 className="text-xl font-semibold mb-2">Personalized Care for You</h2>
                            <p className="text-pink-100 text-sm mb-4">
                                Our AI is specialized to understand Indian women's health concerns from PCOS to prenatal care.
                            </p>
                            <Button className="bg-white text-pink-600 hover:bg-pink-50 border-none" onClick={() => navigate('/consultation')}>
                                Start AI Consultation
                            </Button>
                        </div>
                        <Shield className="absolute -bottom-4 -right-4 w-32 h-32 opacity-10" />
                    </CardContent>
                </Card>

                {/* Sub-features Grid */}
                <div className="grid grid-cols-1 gap-4">
                    {sections.map((section, idx) => (
                        <Card key={idx} className="hover:shadow-md transition-shadow cursor-pointer border-slate-200">
                            <CardContent className="p-5 flex items-start gap-4">
                                <div className={`p-3 rounded-2xl ${section.color}`}>
                                    <section.icon className="w-6 h-6" />
                                </div>
                                <div className="flex-1">
                                    <h3 className="font-bold text-slate-800">{section.title}</h3>
                                    <p className="text-sm text-slate-500 mt-1">{section.desc}</p>
                                </div>
                            </CardContent>
                        </Card>
                    ))}
                </div>

                {/* Privacy Badge */}
                <div className="bg-blue-50 border border-blue-100 rounded-2xl p-4 flex items-center gap-3">
                    <Shield className="w-5 h-5 text-blue-500" />
                    <p className="text-xs text-blue-700 font-medium">
                        Privacy is our priority. Your data is encrypted and consultations are 100% private.
                    </p>
                </div>
            </div>
        </div>
    );
};

export default QueensHealth;

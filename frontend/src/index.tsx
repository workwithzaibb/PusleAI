import React from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Heart, ArrowRight, Shield, Clock, Users, Sparkles, Bot, Check } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { LanguageSwitcher } from '@/components/LanguageSwitcher';
import { useLanguage } from '@/contexts/LanguageContext';

const Index: React.FC = () => {
  const { t } = useLanguage();
  const navigate = useNavigate();

  const features = [
    {
      icon: Bot,
      title: 'AI-Powered Guidance',
      description: 'Get instant health insights from our intelligent assistant',
    },
    {
      icon: Shield,
      title: 'Secure & Private',
      description: 'Your health data is encrypted and protected',
    },
    {
      icon: Clock,
      title: '24/7 Availability',
      description: 'Access healthcare support anytime, anywhere',
    },
    {
      icon: Users,
      title: 'Family Care',
      description: 'Manage health for your entire family in one place',
    },
  ];

  const benefits = [
    'Symptom analysis in seconds',
    'Medication reminders',
    'Mental health support',
    'Emergency assistance',
    'Multi-language support',
    'Family health tracking',
  ];

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container flex h-16 items-center justify-between">
          <Link to="/" className="flex items-center gap-2 group">
            <div className="w-10 h-10 rounded-xl gradient-primary flex items-center justify-center shadow-glow transition-transform group-hover:scale-105">
              <Heart className="h-5 w-5 text-primary-foreground" />
            </div>
            <span className="text-xl font-bold font-display text-foreground">
              {t('app.name')}
            </span>
          </Link>

          <nav className="flex items-center gap-3">
            <LanguageSwitcher />
            <Button variant="ghost" onClick={() => navigate('/login')}>
              {t('auth.login')}
            </Button>
            <Button variant="hero" onClick={() => navigate('/signup')}>
              {t('auth.signup')}
            </Button>
          </nav>
        </div>
      </header>

      {/* Hero Section */}
      <section className="relative overflow-hidden">
        {/* Background decoration */}
        <div className="absolute inset-0 gradient-hero" />
        <div className="absolute top-20 -right-20 w-96 h-96 bg-primary/5 rounded-full blur-3xl" />
        <div className="absolute bottom-0 -left-20 w-80 h-80 bg-secondary/5 rounded-full blur-3xl" />

        <div className="container relative py-20 md:py-32">
          <div className="max-w-3xl mx-auto text-center space-y-8">
            <div className="inline-flex items-center gap-2 px-4 py-2 bg-primary/10 rounded-full text-primary font-medium">
              <Sparkles className="h-4 w-4" />
              <span>Your Health, Our Priority</span>
            </div>

            <h1 className="text-4xl md:text-6xl font-bold font-display text-foreground leading-tight">
              Your Personal{' '}
              <span className="text-primary inline-block bg-gradient-to-r from-primary via-secondary to-primary bg-clip-text bg-[length:200%_auto] animate-[float_3s_ease-in-out_infinite,gradient-shift_4s_ease_infinite]">
                AI Health
              </span>{' '}
              Companion
            </h1>

            <p className="text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto leading-relaxed">
              Experience healthcare reimagined. Get instant symptom analysis, medication reminders, mental health support, and emergency assistance - all in one trusted platform.
            </p>

            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <Button
                variant="hero"
                size="xl"
                onClick={() => navigate('/signup')}
                className="min-w-[200px]"
              >
                Get Started Free
                <ArrowRight className="h-5 w-5" />
              </Button>
              <Button
                variant="outline"
                size="lg"
                onClick={() => navigate('/login')}
              >
                {t('auth.login')}
              </Button>
            </div>

            {/* Trust indicators */}
            <div className="flex items-center justify-center gap-8 pt-8 text-muted-foreground">
              <div className="flex items-center gap-2">
                <Shield className="h-5 w-5 text-success" />
                <span className="text-sm">HIPAA Compliant</span>
              </div>
              <div className="flex items-center gap-2">
                <Users className="h-5 w-5 text-primary" />
                <span className="text-sm">1M+ Users</span>
              </div>
              <div className="flex items-center gap-2">
                <Clock className="h-5 w-5 text-accent" />
                <span className="text-sm">24/7 Support</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 md:py-28 bg-muted/30">
        <div className="container">
          <div className="text-center max-w-2xl mx-auto mb-16">
            <h2 className="text-3xl md:text-4xl font-bold font-display text-foreground mb-4">
              Everything You Need for Better Health
            </h2>
            <p className="text-lg text-muted-foreground">
              Comprehensive healthcare support designed for you and your family
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {features.map((feature, index) => (
              <Card
                key={index}
                variant="feature"
                className="text-center p-6 animate-fade-in"
                style={{ animationDelay: `${index * 100}ms` }}
              >
                <CardContent className="pt-6 space-y-4">
                  <div className="w-16 h-16 mx-auto rounded-2xl gradient-primary flex items-center justify-center shadow-glow">
                    <feature.icon className="h-8 w-8 text-primary-foreground" />
                  </div>
                  <h3 className="text-xl font-semibold font-display">{feature.title}</h3>
                  <p className="text-muted-foreground">{feature.description}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Benefits Section */}
      <section className="py-20 md:py-28">
        <div className="container">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div className="space-y-8">
              <h2 className="text-3xl md:text-4xl font-bold font-display text-foreground">
                Healthcare That Understands You
              </h2>
              <p className="text-lg text-muted-foreground leading-relaxed">
                Pulse AI adapts to your needs with multilingual support, accessible design, and intuitive features that make managing your health simple and stress-free.
              </p>

              <ul className="grid sm:grid-cols-2 gap-4">
                {benefits.map((benefit, index) => (
                  <li key={index} className="flex items-center gap-3">
                    <div className="w-6 h-6 rounded-full bg-success/10 flex items-center justify-center shrink-0">
                      <Check className="h-4 w-4 text-success" />
                    </div>
                    <span className="text-foreground">{benefit}</span>
                  </li>
                ))}
              </ul>

              <Button variant="hero" size="lg" onClick={() => navigate('/signup')}>
                Start Your Health Journey
                <ArrowRight className="h-5 w-5" />
              </Button>
            </div>

            <div className="relative">
              <div className="aspect-square max-w-md mx-auto bg-gradient-to-br from-primary/10 to-secondary/10 rounded-3xl p-8 flex items-center justify-center">
                <div className="w-full h-full bg-card rounded-2xl shadow-xl p-6 flex flex-col">
                  {/* Mock chat interface */}
                  <div className="flex items-center gap-3 pb-4 border-b">
                    <div className="w-10 h-10 rounded-full gradient-primary flex items-center justify-center">
                      <Bot className="h-5 w-5 text-primary-foreground" />
                    </div>
                    <div>
                      <p className="font-semibold font-display">Pulse AI</p>
                      <p className="text-xs text-success">Online</p>
                    </div>
                  </div>
                  <div className="flex-1 py-4 space-y-3">
                    <div className="bg-muted rounded-2xl rounded-tl-sm p-3 max-w-[80%]">
                      <p className="text-sm">Hello! How can I help you today?</p>
                    </div>
                    <div className="bg-primary text-primary-foreground rounded-2xl rounded-tr-sm p-3 max-w-[80%] ml-auto">
                      <p className="text-sm">I've been having headaches</p>
                    </div>
                    <div className="bg-muted rounded-2xl rounded-tl-sm p-3 max-w-[80%]">
                      <p className="text-sm">I'm here to help. Let me ask you a few questions...</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 md:py-28 gradient-primary">
        <div className="container text-center">
          <div className="max-w-2xl mx-auto space-y-6">
            <h2 className="text-3xl md:text-4xl font-bold font-display text-primary-foreground">
              Ready to Take Control of Your Health?
            </h2>
            <p className="text-lg text-primary-foreground/80">
              Join thousands of users who trust Pulse AI for their healthcare needs.
            </p>
            <Button
              variant="outline"
              size="xl"
              onClick={() => navigate('/signup')}
              className="bg-background text-primary hover:bg-background/90 border-0"
            >
              Get Started Free
              <ArrowRight className="h-5 w-5" />
            </Button>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-12 border-t">
        <div className="container">
          <div className="flex flex-col md:flex-row items-center justify-between gap-6">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg gradient-primary flex items-center justify-center">
                <Heart className="h-4 w-4 text-primary-foreground" />
              </div>
              <span className="font-bold font-display">{t('app.name')}</span>
            </div>
            <p className="text-sm text-muted-foreground">
              © 2024 Pulse AI. All rights reserved. Your health, our priority.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Index;
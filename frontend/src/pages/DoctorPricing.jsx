import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { 
  ArrowLeft, 
  Check, 
  Star, 
  Zap, 
  Crown,
  Sparkles,
  Rocket,
  BadgeCheck,
  Headphones,
  Video,
  BarChart3,
  Calendar,
  MessageSquare,
  Shield
} from 'lucide-react';
import api from '../api';

const DoctorPricing = () => {
  const [plans, setPlans] = useState([]);
  const [perks, setPerks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [billingPeriod, setBillingPeriod] = useState('monthly');
  const navigate = useNavigate();

  // Format currency for Indian Rupees
  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(amount);
  };

  useEffect(() => {
    fetchPlansAndPerks();
  }, []);

  const fetchPlansAndPerks = async () => {
    try {
      const [plansRes, perksRes] = await Promise.all([
        api.get('/subscriptions/plans'),
        api.get('/subscriptions/perks')
      ]);
      setPlans(plansRes.data);
      setPerks(perksRes.data);
    } catch (error) {
      console.error('Error fetching plans:', error);
    } finally {
      setLoading(false);
    }
  };

  const getPlanIcon = (tier) => {
    switch (tier) {
      case 'starter':
        return <Zap className="w-8 h-8" />;
      case 'professional':
        return <Star className="w-8 h-8" />;
      case 'enterprise':
        return <Crown className="w-8 h-8" />;
      default:
        return <Sparkles className="w-8 h-8" />;
    }
  };

  const getPlanGradient = (tier) => {
    switch (tier) {
      case 'starter':
        return 'from-blue-500 to-cyan-500';
      case 'professional':
        return 'from-orange-500 to-red-500';
      case 'enterprise':
        return 'from-purple-500 to-pink-500';
      default:
        return 'from-gray-500 to-gray-600';
    }
  };

  const getPerkIcon = (iconName) => {
    switch (iconName) {
      case 'rocket':
        return <Rocket className="w-6 h-6" />;
      case 'badge-check':
        return <BadgeCheck className="w-6 h-6" />;
      case 'star':
        return <Star className="w-6 h-6" />;
      case 'headphones':
        return <Headphones className="w-6 h-6" />;
      default:
        return <Sparkles className="w-6 h-6" />;
    }
  };

  const handleSelectPlan = (plan) => {
    navigate('/doctor-register', { state: { selectedPlan: plan } });
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-orange-500"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-black text-white overflow-hidden">
      {/* Animated Background */}
      <div className="fixed inset-0 z-0">
        <div className="absolute inset-0 bg-gradient-to-br from-orange-900/20 via-black to-purple-900/20" />
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-orange-500/10 rounded-full blur-3xl animate-pulse" />
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-purple-500/10 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '1s' }} />
      </div>

      <div className="relative z-10">
        {/* Header */}
        <header className="p-6">
          <Link 
            to="/" 
            className="inline-flex items-center gap-2 text-orange-300 hover:text-white transition-colors"
          >
            <ArrowLeft className="w-5 h-5" />
            Back to Home
          </Link>
        </header>

        {/* Hero Section */}
        <div className="text-center py-16 px-4">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-orange-500/10 border border-orange-500/20 mb-6">
            <Sparkles className="w-4 h-4 text-orange-500" />
            <span className="text-orange-500 text-sm font-medium">For Healthcare Professionals</span>
          </div>
          <h1 className="text-4xl md:text-6xl font-black mb-6">
            Join <span className="bg-gradient-to-r from-orange-500 to-red-500 bg-clip-text text-transparent">PulseAI</span> as a Doctor
          </h1>
          <p className="text-xl text-orange-200 max-w-2xl mx-auto mb-8">
            Expand your practice across India, reach more patients, and leverage AI-powered tools to provide better care.
          </p>

          {/* Billing Toggle */}
          <div className="inline-flex items-center gap-4 p-1 bg-white/5 rounded-full mb-12">
            <button
              onClick={() => setBillingPeriod('monthly')}
              className={`px-6 py-2 rounded-full transition-all ${
                billingPeriod === 'monthly'
                  ? 'bg-orange-500 text-white'
                  : 'text-orange-300 hover:text-white'
              }`}
            >
              Monthly
            </button>
            <button
              onClick={() => setBillingPeriod('yearly')}
              className={`px-6 py-2 rounded-full transition-all flex items-center gap-2 ${
                billingPeriod === 'yearly'
                  ? 'bg-orange-500 text-white'
                  : 'text-orange-300 hover:text-white'
              }`}
            >
              Yearly
              <span className="text-xs bg-green-500/20 text-green-400 px-2 py-0.5 rounded-full">Save 20%</span>
            </button>
          </div>
        </div>

        {/* Pricing Cards */}
        <div className="max-w-7xl mx-auto px-4 pb-20">
          <div className="grid md:grid-cols-3 gap-8">
            {plans.map((plan, index) => (
              <div
                key={plan.id}
                className={`relative group ${plan.is_popular ? 'md:-mt-4 md:mb-4' : ''}`}
              >
                {plan.is_popular && (
                  <div className="absolute -top-4 left-1/2 -translate-x-1/2 z-10">
                    <div className="bg-gradient-to-r from-orange-500 to-red-500 text-white text-sm font-bold px-4 py-1 rounded-full">
                      MOST POPULAR
                    </div>
                  </div>
                )}
                <div
                  className={`h-full bg-white/5 backdrop-blur-lg rounded-3xl border transition-all duration-500 
                    ${plan.is_popular 
                      ? 'border-orange-500/50 shadow-2xl shadow-orange-500/20' 
                      : 'border-white/10 hover:border-white/20'
                    }
                    group-hover:scale-[1.02] group-hover:shadow-xl`}
                >
                  <div className="p-8">
                    {/* Plan Icon & Name */}
                    <div className={`inline-flex p-3 rounded-2xl bg-gradient-to-r ${getPlanGradient(plan.tier)} mb-6`}>
                      {getPlanIcon(plan.tier)}
                    </div>
                    <h3 className="text-2xl font-bold mb-2">{plan.name}</h3>
                    <p className="text-orange-200 text-sm mb-6">{plan.description}</p>

                    {/* Price */}
                    <div className="mb-8">
                      <span className="text-4xl font-black">
                        {formatCurrency(billingPeriod === 'yearly' ? Math.round(plan.price * 0.8 * 12) : plan.price)}
                      </span>
                      <span className="text-orange-300">
                        /{billingPeriod === 'yearly' ? 'year' : 'month'}
                      </span>
                      {billingPeriod === 'yearly' && (
                        <div className="text-green-400 text-sm mt-1">
                          Save {formatCurrency(Math.round(plan.price * 0.2 * 12))} per year
                        </div>
                      )}
                    </div>

                    {/* CTA Button */}
                    <button
                      onClick={() => handleSelectPlan(plan)}
                      className={`w-full py-4 rounded-xl font-bold transition-all duration-300 mb-8
                        ${plan.is_popular
                          ? 'bg-gradient-to-r from-orange-500 to-red-500 hover:from-orange-600 hover:to-red-600 text-white shadow-lg shadow-orange-500/30'
                          : 'bg-white/10 hover:bg-white/20 text-white'
                        }`}
                    >
                      Get Started
                    </button>

                    {/* Features */}
                    <div className="space-y-4">
                      <p className="text-sm font-semibold text-orange-300 uppercase tracking-wider">What's included:</p>
                      {plan.features.map((feature, idx) => (
                        <div key={idx} className="flex items-start gap-3">
                          <div className={`mt-0.5 p-1 rounded-full bg-gradient-to-r ${getPlanGradient(plan.tier)}`}>
                            <Check className="w-3 h-3" />
                          </div>
                          <span className="text-orange-100 text-sm">{feature}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Feature Comparison */}
        <div className="max-w-6xl mx-auto px-4 py-20">
          <h2 className="text-3xl font-bold text-center mb-12">Compare Features</h2>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-white/10">
                  <th className="text-left py-4 px-4 text-orange-300 font-medium">Feature</th>
                  {plans.map((plan) => (
                    <th key={plan.id} className="text-center py-4 px-4 font-bold">{plan.name}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                <tr className="border-b border-white/5">
                  <td className="py-4 px-4 flex items-center gap-2">
                    <Calendar className="w-5 h-5 text-orange-500" />
                    Appointments/month
                  </td>
                  {plans.map((plan) => (
                    <td key={plan.id} className="text-center py-4 px-4">
                      {plan.max_appointments_per_month >= 999999 ? 'Unlimited' : plan.max_appointments_per_month}
                    </td>
                  ))}
                </tr>
                <tr className="border-b border-white/5">
                  <td className="py-4 px-4 flex items-center gap-2">
                    <Video className="w-5 h-5 text-orange-500" />
                    Video Consultations
                  </td>
                  {plans.map((plan) => (
                    <td key={plan.id} className="text-center py-4 px-4">
                      {plan.video_consultation ? <Check className="w-5 h-5 text-green-500 mx-auto" /> : <span className="text-orange-300">—</span>}
                    </td>
                  ))}
                </tr>
                <tr className="border-b border-white/5">
                  <td className="py-4 px-4 flex items-center gap-2">
                    <Sparkles className="w-5 h-5 text-orange-500" />
                    AI Assistant
                  </td>
                  {plans.map((plan) => (
                    <td key={plan.id} className="text-center py-4 px-4">
                      {plan.ai_assistant ? <Check className="w-5 h-5 text-green-500 mx-auto" /> : <span className="text-orange-300">—</span>}
                    </td>
                  ))}
                </tr>
                <tr className="border-b border-white/5">
                  <td className="py-4 px-4 flex items-center gap-2">
                    <BarChart3 className="w-5 h-5 text-orange-500" />
                    Analytics Dashboard
                  </td>
                  {plans.map((plan) => (
                    <td key={plan.id} className="text-center py-4 px-4">
                      {plan.analytics_dashboard ? <Check className="w-5 h-5 text-green-500 mx-auto" /> : <span className="text-orange-300">—</span>}
                    </td>
                  ))}
                </tr>
                <tr className="border-b border-white/5">
                  <td className="py-4 px-4 flex items-center gap-2">
                    <Star className="w-5 h-5 text-orange-500" />
                    Priority Listing
                  </td>
                  {plans.map((plan) => (
                    <td key={plan.id} className="text-center py-4 px-4">
                      {plan.priority_listing ? <Check className="w-5 h-5 text-green-500 mx-auto" /> : <span className="text-orange-300">—</span>}
                    </td>
                  ))}
                </tr>
                <tr className="border-b border-white/5">
                  <td className="py-4 px-4 flex items-center gap-2">
                    <Shield className="w-5 h-5 text-orange-500" />
                    Custom Branding
                  </td>
                  {plans.map((plan) => (
                    <td key={plan.id} className="text-center py-4 px-4">
                      {plan.custom_branding ? <Check className="w-5 h-5 text-green-500 mx-auto" /> : <span className="text-orange-300">—</span>}
                    </td>
                  ))}
                </tr>
              </tbody>
            </table>
          </div>
        </div>

        {/* Perks Section */}
        <div className="max-w-6xl mx-auto px-4 py-20">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold mb-4">Boost Your Profile</h2>
            <p className="text-orange-200">Purchase additional perks to stand out from the crowd</p>
          </div>
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {perks.map((perk) => (
              <div
                key={perk.id}
                className="bg-white/5 backdrop-blur-lg rounded-2xl border border-white/10 p-6 hover:border-orange-500/30 transition-all duration-300 hover:scale-105 cursor-pointer group"
              >
                <div className="p-3 rounded-xl bg-gradient-to-r from-orange-500/20 to-red-500/20 w-fit mb-4 group-hover:from-orange-500/30 group-hover:to-red-500/30 transition-all">
                  {getPerkIcon(perk.icon)}
                </div>
                <h3 className="text-lg font-bold mb-2">{perk.name}</h3>
                <p className="text-orange-200 text-sm mb-4">{perk.description}</p>
                <div className="flex items-center justify-between">
                  <span className="text-2xl font-bold">{formatCurrency(perk.price)}</span>
                  {perk.duration_days && (
                    <span className="text-xs text-orange-300">{perk.duration_days} days</span>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* FAQ Section */}
        <div className="max-w-3xl mx-auto px-4 py-20">
          <h2 className="text-3xl font-bold text-center mb-12">Frequently Asked Questions</h2>
          <div className="space-y-4">
            {[
              {
                q: "How do I get verified?",
                a: "After registration, our team will verify your medical license (MCI/State Medical Council) within 24-48 hours. You'll receive an email and WhatsApp notification once approved."
              },
              {
                q: "Can I upgrade my plan later?",
                a: "Yes! You can upgrade or downgrade your plan at any time. The price difference will be prorated."
              },
              {
                q: "What payment methods do you accept?",
                a: "We accept UPI (Google Pay, PhonePe, Paytm), all major credit/debit cards, net banking, and EMI options. All payments are secured with RBI-compliant encryption."
              },
              {
                q: "Is there a free trial?",
                a: "We offer a 14-day money-back guarantee. If you're not satisfied, we'll refund your payment in full to your original payment method."
              },
              {
                q: "Do you provide GST invoices?",
                a: "Yes, we provide GST-compliant invoices for all transactions. You can download them from your dashboard."
              }
            ].map((faq, idx) => (
              <div key={idx} className="bg-white/5 backdrop-blur-lg rounded-xl border border-white/10 p-6">
                <h4 className="font-bold mb-2">{faq.q}</h4>
                <p className="text-orange-200 text-sm">{faq.a}</p>
              </div>
            ))}
          </div>
        </div>

        {/* CTA Section */}
        <div className="max-w-4xl mx-auto px-4 py-20 text-center">
          <div className="bg-gradient-to-r from-orange-500/10 to-red-500/10 rounded-3xl border border-orange-500/20 p-12">
            <h2 className="text-3xl font-bold mb-4">Ready to Transform Your Practice?</h2>
            <p className="text-orange-200 mb-8">Join thousands of doctors across India already on PulseAI</p>
            <button
              onClick={() => plans.length > 0 && handleSelectPlan(plans.find(p => p.is_popular) || plans[1])}
              className="px-8 py-4 bg-gradient-to-r from-orange-500 to-red-500 rounded-xl font-bold hover:from-orange-600 hover:to-red-600 transition-all shadow-lg shadow-orange-500/30"
            >
              Get Started Today
            </button>
          </div>
        </div>

        {/* Footer */}
        <footer className="border-t border-white/10 py-8 px-4">
          <div className="max-w-6xl mx-auto text-center text-orange-300 text-sm">
            © 2026 PulseAI India. All rights reserved. | Made with ❤️ in India
          </div>
        </footer>
      </div>
    </div>
  );
};

export default DoctorPricing;

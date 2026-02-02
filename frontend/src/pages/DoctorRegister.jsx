import { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { 
  ArrowLeft, 
  Check, 
  User,
  Stethoscope,
  Building2,
  CreditCard,
  Shield,
  Sparkles,
  Lock,
  AlertCircle,
  ChevronRight,
  ChevronLeft
} from 'lucide-react';
import api from '../api';
import { useAuth } from '../AuthContext';

const DoctorRegister = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { user, isAuthenticated } = useAuth();
  
  const [currentStep, setCurrentStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  
  const [selectedPlan, setSelectedPlan] = useState(location.state?.selectedPlan || null);
  const [plans, setPlans] = useState([]);
  
  const [formData, setFormData] = useState({
    // Step 1: Professional Info
    specialty: '',
    license_number: '',
    bio: '',
    experience_years: 0,
    consultation_fee: 0,
    languages: ['English', 'Hindi'],
    
    // Step 2: Clinic Info
    clinic_name: '',
    clinic_address: '',
    clinic_city: '',
    clinic_state: '',
    clinic_pincode: '',
    clinic_phone: '',
    
    // Step 3: Payment
    payment_method: 'upi',
    upi_id: '',
    card_number: '',
    card_expiry: '',
    card_cvv: '',
    card_name: ''
  });

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
    if (!isAuthenticated) {
      navigate('/login', { state: { redirectTo: '/doctor-pricing' } });
    }
    fetchPlans();
  }, [isAuthenticated, navigate]);

  const fetchPlans = async () => {
    try {
      const res = await api.get('/subscriptions/plans');
      setPlans(res.data);
      if (!selectedPlan && res.data.length > 0) {
        setSelectedPlan(res.data.find(p => p.is_popular) || res.data[0]);
      }
    } catch (error) {
      console.error('Error fetching plans:', error);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleLanguageToggle = (lang) => {
    setFormData(prev => ({
      ...prev,
      languages: prev.languages.includes(lang)
        ? prev.languages.filter(l => l !== lang)
        : [...prev.languages, lang]
    }));
  };

  const validateStep = (step) => {
    setError('');
    
    switch (step) {
      case 1:
        if (!formData.specialty.trim()) {
          setError('Please enter your specialty');
          return false;
        }
        if (!formData.license_number.trim()) {
          setError('Please enter your license number');
          return false;
        }
        if (formData.license_number.length < 5) {
          setError('License number must be at least 5 characters');
          return false;
        }
        return true;
      case 2:
        // Clinic info is optional
        return true;
      case 3:
        if (!formData.card_number.trim()) {
          setError('Please enter your card number');
          return false;
        }
        if (!formData.card_expiry.trim()) {
          setError('Please enter card expiry date');
          return false;
        }
        if (!formData.card_cvv.trim()) {
          setError('Please enter CVV');
          return false;
        }
        return true;
      default:
        return true;
    }
  };

  const handleNext = () => {
    if (validateStep(currentStep)) {
      setCurrentStep(prev => prev + 1);
    }
  };

  const handlePrev = () => {
    setCurrentStep(prev => prev - 1);
  };

  const handleSubmit = async () => {
    if (!validateStep(3)) return;
    if (!selectedPlan) {
      setError('Please select a subscription plan');
      return;
    }

    setLoading(true);
    setError('');

    try {
      const res = await api.post('/subscriptions/register-doctor', {
        specialty: formData.specialty,
        license_number: formData.license_number,
        bio: formData.bio,
        experience_years: parseInt(formData.experience_years) || 0,
        consultation_fee: parseFloat(formData.consultation_fee) || 0,
        languages: formData.languages,
        clinic_name: formData.clinic_name,
        clinic_address: formData.clinic_address,
        clinic_phone: formData.clinic_phone,
        plan_id: selectedPlan.id,
        payment_method: 'card',
        card_number: formData.card_number,
        card_expiry: formData.card_expiry,
        card_cvv: formData.card_cvv
      });

      setSuccess(true);
      setTimeout(() => {
        navigate('/home');
      }, 3000);
    } catch (error) {
      setError(error.response?.data?.detail || 'Registration failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const specialties = [
    'General Physician', 'Cardiologist', 'Dermatologist', 'Pediatrician',
    'Orthopedician', 'Neurologist', 'Psychiatrist', 'Gynecologist',
    'Ophthalmologist', 'ENT Specialist', 'Dentist', 'Diabetologist',
    'Gastroenterologist', 'Pulmonologist', 'Urologist', 'Nephrologist',
    'Oncologist', 'Rheumatologist', 'Ayurveda', 'Homeopathy', 'Other'
  ];

  const languageOptions = ['English', 'Hindi', 'Tamil', 'Telugu', 'Bengali', 'Marathi', 'Gujarati', 'Kannada', 'Malayalam', 'Punjabi', 'Odia'];

  const indianStates = [
    'Andhra Pradesh', 'Arunachal Pradesh', 'Assam', 'Bihar', 'Chhattisgarh',
    'Delhi', 'Goa', 'Gujarat', 'Haryana', 'Himachal Pradesh', 'Jharkhand',
    'Karnataka', 'Kerala', 'Madhya Pradesh', 'Maharashtra', 'Manipur',
    'Meghalaya', 'Mizoram', 'Nagaland', 'Odisha', 'Punjab', 'Rajasthan',
    'Sikkim', 'Tamil Nadu', 'Telangana', 'Tripura', 'Uttar Pradesh',
    'Uttarakhand', 'West Bengal'
  ];

  const steps = [
    { num: 1, title: 'Professional Info', icon: Stethoscope },
    { num: 2, title: 'Clinic Details', icon: Building2 },
    { num: 3, title: 'Payment', icon: CreditCard },
  ];

  if (success) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center px-4">
        <div className="bg-white/5 backdrop-blur-lg rounded-3xl border border-green-500/30 p-12 text-center max-w-md">
          <div className="w-20 h-20 rounded-full bg-green-500/20 flex items-center justify-center mx-auto mb-6">
            <Check className="w-10 h-10 text-green-500" />
          </div>
          <h2 className="text-2xl font-bold text-white mb-4">Registration Successful!</h2>
          <p className="text-cyan-300 mb-6">
            Welcome to PulseAI! Your doctor profile has been created and your {selectedPlan?.name} subscription is now active.
          </p>
          <p className="text-sm text-cyan-400">Redirecting to dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-black text-white">
      {/* Animated Background */}
      <div className="fixed inset-0 z-0">
        <div className="absolute inset-0 bg-gradient-to-br from-orange-900/20 via-black to-purple-900/20" />
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-orange-500/10 rounded-full blur-3xl animate-pulse" />
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-purple-500/10 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '1s' }} />
      </div>

      <div className="relative z-10 max-w-4xl mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8">
          <Link 
            to="/doctor-pricing" 
            className="inline-flex items-center gap-2 text-cyan-300 hover:text-white transition-colors"
          >
            <ArrowLeft className="w-5 h-5" />
            Back to Plans
          </Link>
        </div>

        {/* Progress Steps */}
        <div className="flex items-center justify-between mb-12">
          {steps.map((step, index) => (
            <div key={step.num} className="flex items-center">
              <div className="flex flex-col items-center">
                <div 
                  className={`w-12 h-12 rounded-full flex items-center justify-center transition-all ${
                    currentStep >= step.num 
                      ? 'bg-gradient-to-r from-orange-500 to-red-500' 
                      : 'bg-white/10'
                  }`}
                >
                  {currentStep > step.num ? (
                    <Check className="w-6 h-6" />
                  ) : (
                    <step.icon className="w-6 h-6" />
                  )}
                </div>
                <span className={`text-sm mt-2 ${currentStep >= step.num ? 'text-white' : 'text-gray-500'}`}>
                  {step.title}
                </span>
              </div>
              {index < steps.length - 1 && (
                <div className={`w-24 md:w-32 h-0.5 mx-4 ${
                  currentStep > step.num ? 'bg-orange-500' : 'bg-white/10'
                }`} />
              )}
            </div>
          ))}
        </div>

        {/* Selected Plan Summary */}
        {selectedPlan && (
          <div className="bg-white/5 backdrop-blur-lg rounded-2xl border border-orange-500/20 p-4 mb-8">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className="p-2 rounded-xl bg-gradient-to-r from-orange-500 to-red-500">
                  <Sparkles className="w-5 h-5" />
                </div>
                <div>
                  <p className="text-sm text-gray-400">Selected Plan</p>
                  <p className="font-bold">{selectedPlan.name}</p>
                </div>
              </div>
              <div className="text-right">
                <p className="text-2xl font-bold">{formatCurrency(selectedPlan.price)}</p>
                <p className="text-sm text-gray-400">/month</p>
              </div>
            </div>
          </div>
        )}

        {/* Form Card */}
        <div className="bg-white/5 backdrop-blur-lg rounded-3xl border border-white/10 p-8">
          {/* Error Message */}
          {error && (
            <div className="bg-red-500/10 border border-red-500/30 rounded-xl p-4 mb-6 flex items-center gap-3">
              <AlertCircle className="w-5 h-5 text-red-500 flex-shrink-0" />
              <p className="text-red-400">{error}</p>
            </div>
          )}

          {/* Step 1: Professional Info */}
          {currentStep === 1 && (
            <div className="space-y-6">
              <h2 className="text-2xl font-bold mb-6">Professional Information</h2>
              
              <div>
                <label className="block text-sm font-medium text-gray-400 mb-2">
                  Specialty *
                </label>
                <select
                  name="specialty"
                  value={formData.specialty}
                  onChange={handleInputChange}
                  className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl focus:border-orange-500 focus:outline-none transition-colors"
                >
                  <option value="">Select your specialty</option>
                  {specialties.map(s => (
                    <option key={s} value={s} className="bg-gray-900">{s}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-400 mb-2">
                  Medical License Number (MCI/State Medical Council) *
                </label>
                <input
                  type="text"
                  name="license_number"
                  value={formData.license_number}
                  onChange={handleInputChange}
                  placeholder="e.g., MCI-12345 or State/Year/Number"
                  className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl focus:border-orange-500 focus:outline-none transition-colors"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-400 mb-2">
                  Years of Experience
                </label>
                <input
                  type="number"
                  name="experience_years"
                  value={formData.experience_years}
                  onChange={handleInputChange}
                  min="0"
                  className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl focus:border-orange-500 focus:outline-none transition-colors"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-400 mb-2">
                  Consultation Fee (₹)
                </label>
                <input
                  type="number"
                  name="consultation_fee"
                  value={formData.consultation_fee}
                  onChange={handleInputChange}
                  min="0"
                  step="50"
                  placeholder="e.g., 500"
                  className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl focus:border-orange-500 focus:outline-none transition-colors"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-400 mb-2">
                  Languages Spoken
                </label>
                <div className="flex flex-wrap gap-2">
                  {languageOptions.map(lang => (
                    <button
                      key={lang}
                      type="button"
                      onClick={() => handleLanguageToggle(lang)}
                      className={`px-4 py-2 rounded-full text-sm transition-all ${
                        formData.languages.includes(lang)
                          ? 'bg-orange-500 text-white'
                          : 'bg-white/5 text-gray-400 hover:bg-white/10'
                      }`}
                    >
                      {lang}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-400 mb-2">
                  Bio (Optional)
                </label>
                <textarea
                  name="bio"
                  value={formData.bio}
                  onChange={handleInputChange}
                  rows={4}
                  placeholder="Tell patients about yourself..."
                  className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl focus:border-orange-500 focus:outline-none transition-colors resize-none"
                />
              </div>
            </div>
          )}

          {/* Step 2: Clinic Details */}
          {currentStep === 2 && (
            <div className="space-y-6">
              <h2 className="text-2xl font-bold mb-6">Clinic Details</h2>
              <p className="text-gray-400 text-sm mb-6">This information is optional but helps patients find your practice.</p>
              
              <div>
                <label className="block text-sm font-medium text-gray-400 mb-2">
                  Clinic/Hospital Name
                </label>
                <input
                  type="text"
                  name="clinic_name"
                  value={formData.clinic_name}
                  onChange={handleInputChange}
                  placeholder="Enter clinic or hospital name"
                  className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl focus:border-orange-500 focus:outline-none transition-colors"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-400 mb-2">
                  Clinic Address
                </label>
                <textarea
                  name="clinic_address"
                  value={formData.clinic_address}
                  onChange={handleInputChange}
                  rows={3}
                  placeholder="Enter full address"
                  className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl focus:border-orange-500 focus:outline-none transition-colors resize-none"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-400 mb-2">
                  Clinic Phone
                </label>
                <input
                  type="tel"
                  name="clinic_phone"
                  value={formData.clinic_phone}
                  onChange={handleInputChange}
                  placeholder="+91 98765 43210"
                  className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl focus:border-orange-500 focus:outline-none transition-colors"
                />
              </div>
            </div>
          )}

          {/* Step 3: Payment */}
          {currentStep === 3 && (
            <div className="space-y-6">
              <h2 className="text-2xl font-bold mb-6">Payment Details</h2>
              
              <div className="bg-orange-500/10 border border-orange-500/20 rounded-xl p-4 mb-6 flex items-center gap-3">
                <Lock className="w-5 h-5 text-orange-500" />
                <p className="text-sm text-gray-400">Your payment information is secured with 256-bit SSL encryption</p>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-400 mb-2">
                  Cardholder Name
                </label>
                <input
                  type="text"
                  name="card_name"
                  value={formData.card_name}
                  onChange={handleInputChange}
                  placeholder="Name on card"
                  className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl focus:border-orange-500 focus:outline-none transition-colors"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-400 mb-2">
                  Card Number *
                </label>
                <div className="relative">
                  <input
                    type="text"
                    name="card_number"
                    value={formData.card_number}
                    onChange={handleInputChange}
                    placeholder="1234 5678 9012 3456"
                    maxLength={19}
                    className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl focus:border-orange-500 focus:outline-none transition-colors"
                  />
                  <CreditCard className="absolute right-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-500" />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-400 mb-2">
                    Expiry Date *
                  </label>
                  <input
                    type="text"
                    name="card_expiry"
                    value={formData.card_expiry}
                    onChange={handleInputChange}
                    placeholder="MM/YY"
                    maxLength={5}
                    className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl focus:border-orange-500 focus:outline-none transition-colors"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-400 mb-2">
                    CVV *
                  </label>
                  <input
                    type="password"
                    name="card_cvv"
                    value={formData.card_cvv}
                    onChange={handleInputChange}
                    placeholder="•••"
                    maxLength={4}
                    className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl focus:border-orange-500 focus:outline-none transition-colors"
                  />
                </div>
              </div>

              {/* Order Summary */}
              <div className="mt-8 pt-6 border-t border-white/10">
                <h3 className="font-bold mb-4">Order Summary</h3>
                <div className="space-y-3">
                  <div className="flex justify-between">
                    <span className="text-gray-400">{selectedPlan?.name} Plan (Monthly)</span>
                    <span>{formatCurrency(selectedPlan?.price)}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-500">Subtotal</span>
                    <span className="text-gray-400">{formatCurrency(selectedPlan?.price)}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-500">GST (18%)</span>
                    <span className="text-gray-400">{formatCurrency(Math.round(selectedPlan?.price * 0.18))}</span>
                  </div>
                  <div className="pt-3 border-t border-white/10 flex justify-between font-bold text-lg">
                    <span>Total</span>
                    <span className="text-orange-500">{formatCurrency(Math.round(selectedPlan?.price * 1.18))}</span>
                  </div>
                </div>
              </div>

              {/* Terms */}
              <p className="text-xs text-gray-500 mt-6">
                By completing this purchase, you agree to our <Link to="/terms" className="text-orange-500 hover:underline">Terms of Service</Link> and <Link to="/privacy" className="text-orange-500 hover:underline">Privacy Policy</Link>. Your subscription will automatically renew each month. You can cancel anytime.
              </p>
            </div>
          )}

          {/* Navigation Buttons */}
          <div className="flex justify-between mt-8 pt-6 border-t border-white/10">
            {currentStep > 1 ? (
              <button
                onClick={handlePrev}
                className="flex items-center gap-2 px-6 py-3 bg-white/5 rounded-xl hover:bg-white/10 transition-colors"
              >
                <ChevronLeft className="w-5 h-5" />
                Previous
              </button>
            ) : (
              <div />
            )}

            {currentStep < 3 ? (
              <button
                onClick={handleNext}
                className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-orange-500 to-red-500 rounded-xl hover:from-orange-600 hover:to-red-600 transition-all font-bold"
              >
                Continue
                <ChevronRight className="w-5 h-5" />
              </button>
            ) : (
              <button
                onClick={handleSubmit}
                disabled={loading}
                className="flex items-center gap-2 px-8 py-3 bg-gradient-to-r from-orange-500 to-red-500 rounded-xl hover:from-orange-600 hover:to-red-600 transition-all font-bold disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? (
                  <>
                    <div className="animate-spin rounded-full h-5 w-5 border-t-2 border-b-2 border-white" />
                    Processing...
                  </>
                ) : (
                  <>
                    <Shield className="w-5 h-5" />
                    Complete Registration
                  </>
                )}
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default DoctorRegister;

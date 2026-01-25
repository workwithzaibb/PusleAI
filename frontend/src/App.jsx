import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './AuthContext';
import Landing from './pages/Landing';
import Login from './pages/Login';
import Home from './pages/Home';
import Consultation from './pages/Consultation';
import Emergency from './pages/Emergency';
import Medicine from './pages/Medicine';
import MentalHealth from './pages/MentalHealth';
import FindDoctor from './pages/FindDoctor';
import DoctorOnboarding from './pages/DoctorOnboarding';
import DoctorPricing from './pages/DoctorPricing';
import DoctorRegister from './pages/DoctorRegister';
import PrescriptionScanner from './pages/PrescriptionScanner';
import QueensHealth from './pages/QueensHealth';
import HealthCursor from './components/HealthCursor';

function ProtectedRoute({ children }) {
  const { isAuthenticated, loading } = useAuth();
  if (loading) return (
    <div className="flex flex-col items-center justify-center h-screen gap-4 relative overflow-hidden">
      {/* Animated background */}
      <div className="absolute inset-0">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-gradient-to-r from-primary-400 to-purple-400 rounded-full mix-blend-multiply filter blur-3xl opacity-30 animate-morph" />
        <div className="absolute top-1/3 right-1/3 w-72 h-72 bg-gradient-to-r from-pink-400 to-yellow-400 rounded-full mix-blend-multiply filter blur-3xl opacity-30 animate-morph" style={{ animationDelay: '-3s' }} />
      </div>
      
      {/* Loader container */}
      <div className="relative z-10 flex flex-col items-center gap-6">
        {/* Animated rings */}
        <div className="relative w-24 h-24">
          <div className="absolute inset-0 rounded-full border-4 border-primary-200 animate-ping opacity-20"></div>
          <div className="absolute inset-0 rounded-full border-4 border-primary-300 animate-pulse"></div>
          <div className="absolute inset-0 rounded-full border-4 border-t-primary-500 border-r-purple-500 border-b-pink-500 border-l-transparent animate-spin"></div>
          <div className="absolute inset-2 rounded-full border-4 border-t-transparent border-r-primary-400 border-b-transparent border-l-purple-400 animate-spin" style={{ animationDirection: 'reverse', animationDuration: '1.5s' }}></div>
          <div className="absolute inset-4 rounded-full bg-gradient-to-br from-primary-500 to-purple-500 flex items-center justify-center animate-breathing-glow">
            <span className="text-white text-xl animate-heartbeat">💗</span>
          </div>
        </div>
        
        {/* Loading text */}
        <div className="text-center">
          <h2 className="text-xl font-bold animate-gradient-text">PulseAI</h2>
          <p className="text-gray-500 text-sm animate-pulse">Loading your health companion...</p>
        </div>
        
        {/* Bouncing dots */}
        <div className="flex gap-2">
          {[0, 1, 2].map(i => (
            <div
              key={i}
              className="w-3 h-3 rounded-full bg-gradient-to-r from-primary-500 to-purple-500 animate-bounce"
              style={{ animationDelay: `${i * 0.15}s` }}
            />
          ))}
        </div>
      </div>
    </div>
  );
  return isAuthenticated ? children : <Navigate to="/login" />;
}

export default function App() {
  return (
    <AuthProvider>
      <BrowserRouter future={{ v7_startTransition: true, v7_relativeSplatPath: true }}>
        <HealthCursor />
        <Routes>
          <Route path="/" element={<Landing />} />
          <Route path="/login" element={<Login />} />
          <Route path="/dashboard" element={<ProtectedRoute><Home /></ProtectedRoute>} />
          <Route path="/consult" element={<ProtectedRoute><Consultation /></ProtectedRoute>} />
          <Route path="/consultation" element={<ProtectedRoute><Consultation /></ProtectedRoute>} />
          <Route path="/emergency" element={<ProtectedRoute><Emergency /></ProtectedRoute>} />
          <Route path="/medicine" element={<ProtectedRoute><Medicine /></ProtectedRoute>} />
          <Route path="/mental-health" element={<ProtectedRoute><MentalHealth /></ProtectedRoute>} />
          <Route path="/doctors" element={<ProtectedRoute><FindDoctor /></ProtectedRoute>} />
          <Route path="/find-doctor" element={<ProtectedRoute><FindDoctor /></ProtectedRoute>} />
          <Route path="/doctor-onboarding" element={<ProtectedRoute><DoctorOnboarding /></ProtectedRoute>} />
          <Route path="/doctor-pricing" element={<DoctorPricing />} />
          <Route path="/doctor-register" element={<ProtectedRoute><DoctorRegister /></ProtectedRoute>} />
          <Route path="/prescription-scanner" element={<ProtectedRoute><PrescriptionScanner /></ProtectedRoute>} />
          <Route path="/queens" element={<ProtectedRoute><QueensHealth /></ProtectedRoute>} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}

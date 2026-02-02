import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Heart, User, Phone, Lock, Eye, EyeOff, ArrowRight, Zap } from 'lucide-react';
import { login, register } from '../api';
import { useAuth } from '../AuthContext';

export default function Login() {
  const [isRegister, setIsRegister] = useState(false);
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [showPass, setShowPass] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { loginUser, isAuthenticated } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (isAuthenticated) navigate('/dashboard', { replace: true });
  }, [isAuthenticated, navigate]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      if (isRegister) {
        const res = await register({ phone_number: phone, password, full_name: name });
        loginUser(res.data.access_token, res.data.user);
      } else {
        const res = await login(phone, password);
        loginUser(res.data.access_token, res.data.user);
      }
    } catch (err) {
      setError(err.response?.data?.detail || 'Something went wrong');
    }
    setLoading(false);
  };

  return (
    <div className="min-h-screen bg-black text-white flex items-center justify-center p-6 relative overflow-hidden">
      <div className="fixed inset-0 pointer-events-none">
        <div className="absolute top-1/4 -right-20 w-[500px] h-[500px] bg-gradient-to-l from-cyan-500/20 to-transparent rounded-full blur-3xl animate-pulse" />
        <div className="absolute bottom-1/4 -left-20 w-[400px] h-[400px] bg-gradient-to-r from-purple-500/20 to-transparent rounded-full blur-3xl animate-pulse" style={{ animationDelay: '1s' }} />
      </div>

      <div className="w-full max-w-md relative z-10">
        <div className="text-center mb-10">
          <div className="inline-flex items-center gap-3 mb-6">
            <Heart className="w-10 h-10 text-white" />
            <span className="text-3xl font-black tracking-tighter">PULSE<span className="text-cyan-400">AI</span></span>
          </div>
          <h1 className="text-4xl font-black">{isRegister ? 'JOIN US' : 'WELCOME'}</h1>
          <p className="text-cyan-300 text-xs tracking-[0.3em] mt-2">YOUR HEALTH. YOUR RULES.</p>
        </div>

        <div className="bg-gray-900 rounded-2xl p-8 border border-white/10">
          <form onSubmit={handleSubmit} className="space-y-4">
            {isRegister && (
              <div className="relative">
                <User className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-cyan-400" />
                <input type="text" placeholder="FULL NAME" value={name} onChange={e => setName(e.target.value)}
                  className="w-full pl-12 pr-4 py-4 bg-black border border-white/10 rounded-xl text-white placeholder-gray-600 focus:border-cyan-500 text-sm tracking-wide" required />
              </div>
            )}
            <div className="relative">
              <Phone className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-cyan-400" />
              <input type="tel" placeholder="PHONE NUMBER" value={phone} onChange={e => setPhone(e.target.value)}
                className="w-full pl-12 pr-4 py-4 bg-black border border-white/10 rounded-xl text-white placeholder-gray-600 focus:border-cyan-500 text-sm tracking-wide" required />
            </div>
            <div className="relative">
              <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-cyan-400" />
              <input type={showPass ? 'text' : 'password'} placeholder="PASSWORD" value={password} onChange={e => setPassword(e.target.value)}
                className="w-full pl-12 pr-14 py-4 bg-black border border-white/10 rounded-xl text-white placeholder-gray-600 focus:border-cyan-500 text-sm tracking-wide" required />
              <button type="button" onClick={() => setShowPass(!showPass)} className="absolute right-4 top-1/2 -translate-y-1/2 text-cyan-400 hover:text-white">
                {showPass ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
              </button>
            </div>
            {error && <p className="text-red-400 text-sm text-center bg-red-500/20 p-2 rounded-lg">{error}</p>}
            <button type="submit" disabled={loading}
              className="w-full py-4 bg-white text-black font-black text-sm tracking-wider rounded-xl hover:bg-cyan-400 transition-all flex items-center justify-center gap-2 disabled:opacity-50">
              {loading ? <div className="w-5 h-5 border-2 border-black border-t-transparent rounded-full animate-spin" /> : <>{isRegister ? 'CREATE ACCOUNT' : 'LOGIN'} <ArrowRight className="w-5 h-5" /></>}
            </button>
          </form>
          <p className="mt-6 text-center text-cyan-300 text-sm">
            {isRegister ? 'Have an account?' : 'No account?'}
            <button onClick={() => setIsRegister(!isRegister)} className="text-cyan-400 font-bold ml-2">{isRegister ? 'LOGIN' : 'REGISTER'}</button>
          </p>
        </div>
      </div>
    </div>
  );
}

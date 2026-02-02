import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, AlertTriangle, Phone, Activity, Thermometer, Siren, Zap } from 'lucide-react';
import { checkEmergency, getEmergencyContacts, panicButton } from '../api';
import { useTheme } from '../contexts/ThemeContext';

export default function Emergency() {
  const [symptoms, setSymptoms] = useState('');
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [contacts, setContacts] = useState({ emergency: "112", ambulance: "102", police: "100" });
  const [panicActive, setPanicActive] = useState(false);
  const navigate = useNavigate();
  const { theme } = useTheme();

  const quickSymptoms = ['Chest pain', 'Difficulty breathing', 'Severe bleeding', 'Unconscious', 'Stroke symptoms', 'Allergic reaction'];

  useEffect(() => {
    getEmergencyContacts().then(res => setContacts(res.data.contacts)).catch(() => {});
  }, []);

  const handleCheck = async () => {
    if (!symptoms.trim()) return;
    setLoading(true);
    try {
      const res = await checkEmergency(symptoms);
      setResult(res.data);
    } catch { setResult({ is_emergency: false, message: 'Unable to check. Call emergency if concerned.' }); }
    setLoading(false);
  };

  const handlePanic = async () => {
    if (!window.confirm("Activate Panic Alert?")) return;
    setPanicActive(true);
    try {
      const res = await panicButton();
      setResult({ is_emergency: true, message: res.data.message || "Emergency Alert Activated!", immediate_actions: res.data.instructions });
    } catch { setResult({ is_emergency: true, message: "CALL 112 IMMEDIATELY." }); }
  };

  return (
    <div className={`min-h-screen relative overflow-hidden transition-colors ${panicActive ? 'bg-red-950 text-white' : (theme === 'dark' ? 'bg-black text-white' : 'bg-gradient-to-br from-slate-50 via-red-50 to-orange-50 text-gray-900')}`}>
      <div className="fixed inset-0 pointer-events-none">
        <div className={`absolute top-1/4 -right-20 w-[400px] h-[400px] rounded-full blur-3xl animate-pulse ${theme === 'dark' ? 'bg-gradient-to-l from-red-500/20 to-transparent' : 'bg-gradient-to-l from-red-400/30 to-transparent'}`} />
      </div>

      <nav className={`relative z-20 px-6 py-4 flex items-center gap-4 border-b ${theme === 'dark' || panicActive ? 'border-white/10' : 'border-gray-200 bg-white/70 backdrop-blur-xl'}`}>
        <button onClick={() => navigate('/')} className={`p-2 rounded-full ${theme === 'dark' ? 'hover:bg-white/10' : 'hover:bg-gray-100'}`}><ArrowLeft className="w-5 h-5" /></button>
        <div>
          <h1 className="font-black text-xl tracking-tight">EMERGENCY</h1>
          <p className={`text-[10px] tracking-[0.2em] ${theme === 'dark' ? 'text-red-300' : 'text-red-600'}`}>CRITICAL CARE ACCESS</p>
        </div>
      </nav>

      <div className="relative z-10 px-6 py-8">
        {/* Panic Button */}
        <div className="flex justify-center mb-10">
          <button onClick={handlePanic}
            className={`w-40 h-40 rounded-full flex flex-col items-center justify-center gap-2 font-black text-xl border-4 ${panicActive ? 'bg-red-600 border-red-400 animate-pulse' : 'bg-gradient-to-br from-red-600 to-red-700 border-red-500 hover:scale-105'} transition-all shadow-2xl`}>
            <Siren className="w-12 h-12" />
            <span>PANIC</span>
          </button>
        </div>

        {/* Emergency Contacts */}
        <div className="grid grid-cols-3 gap-3 mb-8">
          <a href={`tel:${contacts.emergency}`} className="bg-red-600 rounded-xl p-4 text-center hover:bg-red-500 transition-all">
            <Phone className="w-6 h-6 mx-auto mb-2" />
            <p className="font-black text-2xl">{contacts.emergency}</p>
            <p className="text-[10px] tracking-wider opacity-80">EMERGENCY</p>
          </a>
          <a href={`tel:${contacts.ambulance}`} className="bg-gray-800 rounded-xl p-4 text-center hover:bg-gray-700 transition-all border border-white/10">
            <Activity className="w-6 h-6 mx-auto mb-2 text-cyan-400" />
            <p className="font-black text-2xl">{contacts.ambulance}</p>
            <p className="text-[10px] tracking-wider text-cyan-300">AMBULANCE</p>
          </a>
          <a href={`tel:${contacts.police}`} className="bg-gray-800 rounded-xl p-4 text-center hover:bg-gray-700 transition-all border border-white/10">
            <AlertTriangle className="w-6 h-6 mx-auto mb-2 text-yellow-400" />
            <p className="font-black text-2xl">{contacts.police}</p>
            <p className="text-[10px] tracking-wider text-yellow-300">POLICE</p>
          </a>
        </div>

        {result && (
          <div className={`rounded-xl p-6 mb-8 ${result.is_emergency ? 'bg-red-600' : 'bg-gray-800 border border-white/10'}`}>
            <h3 className="font-black text-xl mb-2">{result.is_emergency ? '⚠️ EMERGENCY' : 'ASSESSMENT'}</h3>
            <p className="text-sm opacity-90 mb-4">{result.message}</p>
            {result.is_emergency && <a href={`tel:${contacts.emergency}`} className="block py-3 bg-white text-red-600 font-black text-center rounded-xl">CALL {contacts.emergency} NOW</a>}
          </div>
        )}

        {/* Symptom Check */}
        <div className="bg-gray-900 rounded-xl p-6 border border-white/10">
          <h3 className="font-black text-sm tracking-wider mb-4 flex items-center gap-2"><Thermometer className="w-5 h-5 text-red-400" /> AI SYMPTOM CHECK</h3>
          <textarea value={symptoms} onChange={e => setSymptoms(e.target.value)} placeholder="Describe your emergency..."
            className="w-full p-4 bg-black border border-white/10 rounded-xl h-24 resize-none text-white placeholder-gray-600 focus:border-red-500 text-sm" />
          <div className="flex flex-wrap gap-2 my-4">
            {quickSymptoms.map(s => (
              <button key={s} onClick={() => setSymptoms(prev => prev ? `${prev}, ${s}` : s)}
                className="px-3 py-1 bg-red-500/20 text-red-400 text-xs rounded-full hover:bg-red-500/40 border border-red-500/30">{s}</button>
            ))}
          </div>
          <button onClick={handleCheck} disabled={loading || !symptoms.trim()}
            className="w-full py-4 bg-white text-black font-black rounded-xl hover:bg-red-400 disabled:opacity-50 flex items-center justify-center gap-2">
            {loading ? <div className="w-5 h-5 border-2 border-black border-t-transparent rounded-full animate-spin" /> : <>ANALYZE <Zap className="w-5 h-5" /></>}
          </button>
        </div>
      </div>
    </div>
  );
}

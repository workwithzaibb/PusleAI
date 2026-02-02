import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { ArrowLeft, Search, UserPlus, Calendar, Star, MapPin } from 'lucide-react';
import { searchDoctors } from '../api';
import DoctorCard from '../components/DoctorCard';
import BookingModal from '../components/BookingModal';
import AppointmentList from '../components/AppointmentList';
import { useTheme } from '../contexts/ThemeContext';

export default function FindDoctor() {
  const [doctors, setDoctors] = useState([]);
  const [loading, setLoading] = useState(true);
  const [query, setQuery] = useState('');
  const [specialty, setSpecialty] = useState('');
  const [selectedDoctor, setSelectedDoctor] = useState(null);
  const [activeTab, setActiveTab] = useState('find');
  const navigate = useNavigate();
  const { theme } = useTheme();

  useEffect(() => { handleSearch(); }, []);

  const handleSearch = async () => {
    setLoading(true);
    try {
      const res = await searchDoctors(query, specialty);
      setDoctors(res.data);
    } catch { }
    setLoading(false);
  };

  return (
    <div className={`min-h-screen relative overflow-hidden transition-colors duration-300 ${theme === 'dark' ? 'bg-black text-white' : 'bg-gradient-to-br from-slate-50 via-blue-50 to-cyan-50 text-gray-900'}`}>
      <div className="fixed inset-0 pointer-events-none">
        <div className={`absolute top-1/4 -right-20 w-[400px] h-[400px] rounded-full blur-3xl animate-pulse ${theme === 'dark' ? 'bg-gradient-to-l from-blue-500/20 to-transparent' : 'bg-gradient-to-l from-blue-400/30 to-transparent'}`} />
      </div>

      <nav className={`relative z-20 px-6 py-4 flex items-center justify-between border-b ${theme === 'dark' ? 'border-white/10' : 'border-gray-200 bg-white/70 backdrop-blur-xl'}`}>
        <div className="flex items-center gap-4">
          <button onClick={() => navigate('/')} className={`p-2 rounded-full ${theme === 'dark' ? 'hover:bg-white/10' : 'hover:bg-gray-100'}`}><ArrowLeft className="w-5 h-5" /></button>
          <div>
            <h1 className="font-black text-xl tracking-tight">SPECIALISTS</h1>
            <p className={`text-[10px] tracking-[0.2em] ${theme === 'dark' ? 'text-cyan-300' : 'text-cyan-600'}`}>BOOK TOP DOCTORS</p>
          </div>
        </div>
        <Link to="/doctor-onboarding" className={`text-sm font-bold flex items-center gap-2 ${theme === 'dark' ? 'text-cyan-400 hover:text-white' : 'text-cyan-600 hover:text-cyan-700'}`}>
          <UserPlus className="w-4 h-4" /> JOIN AS DOCTOR
        </Link>
      </nav>

      {/* Tabs */}
      <div className={`relative z-10 px-6 py-4 flex gap-2 border-b ${theme === 'dark' ? 'border-white/10' : 'border-gray-200'}`}>
        <button onClick={() => setActiveTab('find')}
          className={`px-4 py-2 rounded-full font-bold text-xs tracking-wider flex items-center gap-2 transition-all ${activeTab === 'find' ? (theme === 'dark' ? 'bg-white text-black' : 'bg-cyan-500 text-white') : (theme === 'dark' ? 'bg-gray-800 text-cyan-300' : 'bg-white border border-gray-200 text-cyan-600 hover:bg-cyan-50')}`}>
          <Search className="w-4 h-4" /> FIND DOCTOR
        </button>
        <button onClick={() => setActiveTab('appointments')}
          className={`px-4 py-2 rounded-full font-bold text-xs tracking-wider flex items-center gap-2 transition-all ${activeTab === 'appointments' ? (theme === 'dark' ? 'bg-white text-black' : 'bg-cyan-500 text-white') : (theme === 'dark' ? 'bg-gray-800 text-cyan-300' : 'bg-white border border-gray-200 text-cyan-600 hover:bg-cyan-50')}`}>
          <Calendar className="w-4 h-4" /> MY APPOINTMENTS
        </button>
      </div>

      <div className="relative z-10 p-6">
        {activeTab === 'find' ? (
          <>
            {/* Search */}
            <div className={`rounded-xl p-4 mb-6 flex flex-col md:flex-row gap-3 border ${theme === 'dark' ? 'bg-gray-900 border-white/10' : 'bg-white border-gray-200 shadow-md'}`}>
              <div className="flex-1 relative">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-cyan-400" />
                <input type="text" placeholder="SEARCH DOCTORS..." value={query} onChange={e => setQuery(e.target.value)}
                  className={`w-full pl-12 pr-4 py-3 border rounded-xl text-sm tracking-wide ${theme === 'dark' ? 'bg-black border-white/10 text-white placeholder-gray-600' : 'bg-gray-50 border-gray-200 text-gray-900 placeholder-gray-400'}`} />
              </div>
              <select value={specialty} onChange={e => setSpecialty(e.target.value)}
                className={`px-4 py-3 border rounded-xl text-sm ${theme === 'dark' ? 'bg-black border-white/10 text-white' : 'bg-gray-50 border-gray-200 text-gray-900'}`}>
                <option value="">ALL SPECIALTIES</option>
                <option value="Cardiology">Cardiology</option>
                <option value="Dermatology">Dermatology</option>
                <option value="General Medicine">General Medicine</option>
                <option value="Pediatrics">Pediatrics</option>
                <option value="Psychiatry">Psychiatry</option>
              </select>
              <button onClick={handleSearch} className="px-6 py-3 bg-cyan-500 text-white font-bold rounded-xl hover:bg-cyan-600">SEARCH</button>
            </div>

            {/* Results */}
            {loading ? (
              <div className={`text-center py-12 ${theme === 'dark' ? 'text-cyan-300' : 'text-cyan-600'}`}>Loading...</div>
            ) : doctors.length === 0 ? (
              <div className={`text-center py-12 ${theme === 'dark' ? 'text-cyan-300' : 'text-cyan-600'}`}>No doctors found</div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {doctors.map(doc => (
                  <div key={doc.id} onClick={() => setSelectedDoctor(doc)}
                    className={`rounded-xl p-5 border cursor-pointer transition-all group ${theme === 'dark' ? 'bg-gray-900 border-white/10 hover:border-cyan-500/50' : 'bg-white border-gray-200 shadow-md hover:border-cyan-400 hover:shadow-lg'}`}>
                    <div className="flex items-center gap-4 mb-4">
                      <div className="w-14 h-14 bg-gradient-to-br from-cyan-500 to-blue-600 rounded-full flex items-center justify-center font-black text-xl text-white">
                        {doc.full_name?.charAt(0) || 'D'}
                      </div>
                      <div>
                        <h3 className={`font-bold ${theme === 'dark' ? 'group-hover:text-cyan-400' : 'text-gray-900 group-hover:text-cyan-600'}`}>{doc.full_name}</h3>
                        <p className={`text-xs ${theme === 'dark' ? 'text-cyan-300' : 'text-cyan-600'}`}>{doc.specialty}</p>
                      </div>
                    </div>
                    <div className={`flex items-center justify-between text-xs ${theme === 'dark' ? 'text-cyan-300' : 'text-cyan-600'}`}>
                      <span className="flex items-center gap-1"><Star className="w-4 h-4 text-yellow-400" /> {doc.rating || '4.8'}</span>
                      <span className="flex items-center gap-1"><MapPin className="w-4 h-4" /> {doc.city || 'Online'}</span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </>
        ) : (
          <AppointmentList />
        )}
      </div>

      {selectedDoctor && <BookingModal doctor={selectedDoctor} onClose={() => setSelectedDoctor(null)} onSuccess={() => { setSelectedDoctor(null); setActiveTab('appointments'); }} />}
    </div>
  );
}

import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { ArrowLeft, Search, UserPlus, Calendar, Star, MapPin } from 'lucide-react';
import { searchDoctors } from '../api';
import DoctorCard from '../components/DoctorCard';
import BookingModal from '../components/BookingModal';
import AppointmentList from '../components/AppointmentList';

export default function FindDoctor() {
  const [doctors, setDoctors] = useState([]);
  const [loading, setLoading] = useState(true);
  const [query, setQuery] = useState('');
  const [specialty, setSpecialty] = useState('');
  const [selectedDoctor, setSelectedDoctor] = useState(null);
  const [activeTab, setActiveTab] = useState('find');
  const navigate = useNavigate();

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
    <div className="min-h-screen bg-black text-white relative overflow-hidden">
      <div className="fixed inset-0 pointer-events-none">
        <div className="absolute top-1/4 -right-20 w-[400px] h-[400px] bg-gradient-to-l from-blue-500/20 to-transparent rounded-full blur-3xl animate-pulse" />
      </div>

      <nav className="relative z-20 px-6 py-4 flex items-center justify-between border-b border-white/10">
        <div className="flex items-center gap-4">
          <button onClick={() => navigate('/')} className="p-2 hover:bg-white/10 rounded-full"><ArrowLeft className="w-5 h-5" /></button>
          <div>
            <h1 className="font-black text-xl tracking-tight">SPECIALISTS</h1>
            <p className="text-[10px] tracking-[0.2em] text-gray-500">BOOK TOP DOCTORS</p>
          </div>
        </div>
        <Link to="/doctor-onboarding" className="text-cyan-400 text-sm font-bold flex items-center gap-2 hover:text-white">
          <UserPlus className="w-4 h-4" /> JOIN AS DOCTOR
        </Link>
      </nav>

      {/* Tabs */}
      <div className="relative z-10 px-6 py-4 flex gap-2 border-b border-white/10">
        <button onClick={() => setActiveTab('find')}
          className={`px-4 py-2 rounded-full font-bold text-xs tracking-wider flex items-center gap-2 ${activeTab === 'find' ? 'bg-white text-black' : 'bg-gray-800 text-gray-400'}`}>
          <Search className="w-4 h-4" /> FIND DOCTOR
        </button>
        <button onClick={() => setActiveTab('appointments')}
          className={`px-4 py-2 rounded-full font-bold text-xs tracking-wider flex items-center gap-2 ${activeTab === 'appointments' ? 'bg-white text-black' : 'bg-gray-800 text-gray-400'}`}>
          <Calendar className="w-4 h-4" /> MY APPOINTMENTS
        </button>
      </div>

      <div className="relative z-10 p-6">
        {activeTab === 'find' ? (
          <>
            {/* Search */}
            <div className="bg-gray-900 rounded-xl p-4 mb-6 flex flex-col md:flex-row gap-3 border border-white/10">
              <div className="flex-1 relative">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-500" />
                <input type="text" placeholder="SEARCH DOCTORS..." value={query} onChange={e => setQuery(e.target.value)}
                  className="w-full pl-12 pr-4 py-3 bg-black border border-white/10 rounded-xl text-white placeholder-gray-600 text-sm tracking-wide" />
              </div>
              <select value={specialty} onChange={e => setSpecialty(e.target.value)}
                className="px-4 py-3 bg-black border border-white/10 rounded-xl text-white text-sm">
                <option value="">ALL SPECIALTIES</option>
                <option value="Cardiology">Cardiology</option>
                <option value="Dermatology">Dermatology</option>
                <option value="General Medicine">General Medicine</option>
                <option value="Pediatrics">Pediatrics</option>
                <option value="Psychiatry">Psychiatry</option>
              </select>
              <button onClick={handleSearch} className="px-6 py-3 bg-white text-black font-bold rounded-xl hover:bg-cyan-400">SEARCH</button>
            </div>

            {/* Results */}
            {loading ? (
              <div className="text-center py-12 text-gray-500">Loading...</div>
            ) : doctors.length === 0 ? (
              <div className="text-center py-12 text-gray-500">No doctors found</div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {doctors.map(doc => (
                  <div key={doc.id} onClick={() => setSelectedDoctor(doc)}
                    className="bg-gray-900 rounded-xl p-5 border border-white/10 hover:border-cyan-500/50 cursor-pointer transition-all group">
                    <div className="flex items-center gap-4 mb-4">
                      <div className="w-14 h-14 bg-gradient-to-br from-cyan-500 to-blue-600 rounded-full flex items-center justify-center font-black text-xl">
                        {doc.full_name?.charAt(0) || 'D'}
                      </div>
                      <div>
                        <h3 className="font-bold group-hover:text-cyan-400">{doc.full_name}</h3>
                        <p className="text-xs text-gray-500">{doc.specialty}</p>
                      </div>
                    </div>
                    <div className="flex items-center justify-between text-xs text-gray-500">
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

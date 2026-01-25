import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Plus, Pill, Activity, ShieldCheck, Clock } from 'lucide-react';
import { getMedications, deleteMedication } from '../api';
import TodaySchedule from '../components/TodaySchedule';
import MedicationCard from '../components/MedicationCard';
import AddMedicationForm from '../components/AddMedicationForm';
import InteractionChecker from '../components/InteractionChecker';

export default function Medicine() {
  const [activeTab, setActiveTab] = useState('schedule');
  const [medications, setMedications] = useState([]);
  const [showAddModal, setShowAddModal] = useState(false);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => { fetchMedications(); }, []);

  const fetchMedications = async () => {
    try {
      const res = await getMedications();
      setMedications(res.data.medications || []);
    } catch { }
    setLoading(false);
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Remove medication?")) return;
    try { await deleteMedication(id); fetchMedications(); } catch { }
  };

  const tabs = [
    { id: 'schedule', label: 'SCHEDULE', icon: Clock },
    { id: 'list', label: 'MEDICINES', icon: Pill },
    { id: 'safety', label: 'SAFETY', icon: ShieldCheck },
  ];

  return (
    <div className="min-h-screen bg-black text-white relative overflow-hidden">
      <div className="fixed inset-0 pointer-events-none">
        <div className="absolute top-1/4 -right-20 w-[400px] h-[400px] bg-gradient-to-l from-green-500/20 to-transparent rounded-full blur-3xl animate-pulse" />
      </div>

      <nav className="relative z-20 px-6 py-4 flex items-center justify-between border-b border-white/10">
        <div className="flex items-center gap-4">
          <button onClick={() => navigate('/')} className="p-2 hover:bg-white/10 rounded-full"><ArrowLeft className="w-5 h-5" /></button>
          <div>
            <h1 className="font-black text-xl tracking-tight flex items-center gap-2"><Pill className="w-6 h-6 text-green-400" /> MEDICINE</h1>
            <p className="text-[10px] tracking-[0.2em] text-gray-500">YOUR CABINET</p>
          </div>
        </div>
        <button onClick={() => setShowAddModal(true)} className="px-4 py-2 bg-white text-black rounded-full font-bold text-sm flex items-center gap-2 hover:bg-green-400">
          <Plus className="w-4 h-4" /> ADD
        </button>
      </nav>

      {/* Tabs */}
      <div className="relative z-10 px-6 py-4 flex gap-2 border-b border-white/10">
        {tabs.map(({ id, label, icon: Icon }) => (
          <button key={id} onClick={() => setActiveTab(id)}
            className={`px-4 py-2 rounded-full font-bold text-xs tracking-wider flex items-center gap-2 ${activeTab === id ? 'bg-white text-black' : 'bg-gray-800 text-gray-400'}`}>
            <Icon className="w-4 h-4" /> {label}
          </button>
        ))}
      </div>

      <div className="relative z-10 p-6 max-w-4xl mx-auto">
        {activeTab === 'schedule' && (
          <div>
            <div className="flex items-center justify-between mb-4">
              <h2 className="font-black text-sm tracking-wider">TODAY'S TIMELINE</h2>
              <span className="text-xs text-gray-500">{new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'short', day: 'numeric' })}</span>
            </div>
            <TodaySchedule />
          </div>
        )}

        {activeTab === 'list' && (
          <div>
            {loading ? (
              <p className="text-gray-500 text-center py-12">Loading...</p>
            ) : medications.length === 0 ? (
              <div className="text-center py-12">
                <Pill className="w-16 h-16 text-gray-700 mx-auto mb-4" />
                <p className="text-gray-500 mb-4">No medications yet</p>
                <button onClick={() => setShowAddModal(true)} className="px-6 py-3 bg-white text-black font-bold rounded-xl">ADD FIRST MED</button>
              </div>
            ) : (
              <div className="grid gap-4">
                {medications.map(med => <MedicationCard key={med.id} medication={med} onDelete={() => handleDelete(med.id)} />)}
              </div>
            )}
          </div>
        )}

        {activeTab === 'safety' && <InteractionChecker medications={medications} />}
      </div>

      {showAddModal && (
        <div className="fixed inset-0 bg-black/80 flex items-center justify-center p-4 z-50">
          <div className="bg-gray-900 rounded-xl max-w-md w-full p-6 border border-white/10">
            <h2 className="font-black text-xl mb-6">ADD MEDICATION</h2>
            <AddMedicationForm onSuccess={() => { setShowAddModal(false); fetchMedications(); }} onCancel={() => setShowAddModal(false)} />
          </div>
        </div>
      )}
    </div>
  );
}

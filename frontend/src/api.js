import axios from 'axios';

// Use environment variable for API URL, fallback to Railway production URL
const API_URL = import.meta.env.VITE_API_URL 
  || 'https://pulseai-production.up.railway.app/api/v1';

const api = axios.create({
  baseURL: API_URL,
  headers: { 'Content-Type': 'application/json' }
});

// Add auth token to requests
api.interceptors.request.use(config => {
  const token = localStorage.getItem('token');
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

// Auth
export const register = (data) => api.post('/auth/register', data);
export const login = (phone, password) => {
  const formData = new URLSearchParams();
  formData.append('username', phone);
  formData.append('password', password);
  return api.post('/auth/login', formData, {
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' }
  });
};
export const getMe = () => api.get('/auth/me');

// Consultation
export const startConsultation = (language = 'en') =>
  api.post('/consultation/start', { language });
export const sendMessage = (sessionId, message, language = 'en') =>
  api.post('/consultation/message', { session_id: sessionId, message, language });
export const endConsultation = (sessionId) =>
  api.post(`/consultation/end/${sessionId}`);
export const getHistory = () => api.get('/consultation/history');

// Symptoms
export const analyzeSymptoms = (description, language = 'en') =>
  api.post('/symptoms/analyze', { description, language });

// Emergency
export const checkEmergency = (text, language = 'en') =>
  api.post('/emergency/check', { text, language });
export const getEmergencyContacts = () => api.get('/emergency/contacts');
export const panicButton = () => api.post('/emergency/panic');

// Medicine
export const lookupMedicine = (name) =>
  api.post('/medicine/lookup', { medicine_name: name });
export const checkInteractions = (medicines) =>
  api.post('/medicine/interactions', { medicines });

// TTS
export const synthesizeSpeech = (text, language = 'en') =>
  api.post('/tts/synthesize', { text, language });

// Mental Health
// Mood
export const logMood = (data) => api.post('/mental-health/mood-checkin', data);
export const getMoodHistory = (days = 30) => api.get(`/mental-health/mood-history?days=${days}`);
export const getInsights = () => api.get('/mental-health/insights');

// Journal
export const createJournal = (data) => api.post('/mental-health/journal', data);

// Therapy Chat
export const chatWithCompanion = (data) => api.post('/mental-health/chat', data);

// Crisis
export const reportCrisis = (data) => api.post('/mental-health/crisis', data);

// Doctor & Appointments
export const searchDoctors = (query, specialty) => {
  let url = '/doctor/search';
  const params = [];
  if (query) params.push(`query=${query}`);
  if (specialty) params.push(`specialty=${specialty}`);
  if (params.length > 0) url += `?${params.join('&')}`;
  return api.get(url);
};

export const getDoctorSlots = (doctorId, date) =>
  api.get(`/appointments/slots/${doctorId}?start_date=${date}`);

export const bookAppointment = (data) => api.post('/appointments/book', data);

export const getMyAppointments = () => api.get('/appointments/my-appointments');

export const cancelAppointment = (id) => api.post(`/appointments/${id}/cancel`);

export const getDoctorProfile = () => api.get('/doctor/me');
export const createDoctorProfile = (data) => api.post('/doctor/profile', data);
export const setAvailability = (slots) => api.post('/doctor/availability', slots);

// Medication & Adherence
export const getMedications = (activeOnly = true) => api.get(`/medication_reminder/list?active_only=${activeOnly}`);
export const addMedication = (data) => api.post('/medication_reminder/add', data);
export const updateMedication = (id, data) => api.put(`/medication_reminder/${id}/update`, data);
export const deleteMedication = (id) => api.delete(`/medication_reminder/${id}/delete`);

export const getTodaySchedule = (hours = 24) => api.get(`/medication_reminder/reminders/upcoming?hours=${hours}`);
export const markMedicationTaken = (scheduleId, medicationId, takenAt = null) =>
  api.post('/medication_reminder/mark-taken', { schedule_id: scheduleId, medication_id: medicationId, taken_at: takenAt });
export const markMedicationSkipped = (scheduleId, medicationId, reason) =>
  api.post('/medication_reminder/mark-skipped', { schedule_id: scheduleId, medication_id: medicationId, skip_reason: reason });

export const getAdherenceHistory = (days = 30) => api.get(`/medication_reminder/history?days=${days}`);
// Note: checkInteractions might already exist or need updating. 
// Existing api.js has: export const checkInteractions = (medicines) => api.post('/medicine/interactions', { medicines });
// The new backend route in medication_reminder.py is /check-interactions but uses specific request body. 
// I will override the existing one or ensure it matches the new backend structure.
// Backend `api/medication_reminder.py`: `router.post("/check-interactions")` -> `InteractonCheckRequest`.
// Backend `api/medicine.py` (old one?): `router.post("/interactions")`. 
// Let's check `api/medicine.py` briefly to see if it conflicts. I'll stick to using the new `medication_reminder` router if I can, but `api/medicine.py` seems like the one used by the current `Medicine.jsx`.
// For now, I'll add a specific `checkDrugInteractions` that matches the NEW router to be safe, or update the existing one if I replace `Medicine.jsx`.
export const checkDrugInteractions = (data) => api.post('/medication_reminder/check-interactions', data);

export default api;

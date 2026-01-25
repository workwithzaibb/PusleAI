import React, { useState } from 'react';
import { createDoctorProfile } from '../api';
import { useNavigate } from 'react-router-dom';

const DoctorOnboarding = () => {
    const navigate = useNavigate();
    const [loading, setLoading] = useState(false);
    const [formData, setFormData] = useState({
        specialty: '',
        license_number: '',
        bio: '',
        experience_years: 0,
        consultation_fee: 0,
        currency: 'USD',
        languages: [],
        clinic_name: '',
        clinic_address: '',
    });
    const [langInput, setLangInput] = useState('');

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleAddLanguage = () => {
        if (langInput && !formData.languages.includes(langInput)) {
            setFormData({ ...formData, languages: [...formData.languages, langInput] });
            setLangInput('');
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        try {
            await createDoctorProfile(formData);
            alert("Doctor profile created successfully!");
            navigate('/doctors');
        } catch (error) {
            console.error(error);
            alert("Failed to create profile. " + (error.response?.data?.detail || ""));
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="container mx-auto px-4 py-8 max-w-2xl">
            <div className="bg-white rounded-2xl shadow-xl p-8">
                <h1 className="text-2xl font-bold text-blue-900 mb-6 border-b pb-4">Join as a Specialist</h1>

                <form onSubmit={handleSubmit} className="space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Specialty</label>
                            <input
                                type="text"
                                name="specialty"
                                required
                                className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                                onChange={handleChange}
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">License Number</label>
                            <input
                                type="text"
                                name="license_number"
                                required
                                className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                                onChange={handleChange}
                            />
                        </div>
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Bio</label>
                        <textarea
                            name="bio"
                            rows="3"
                            className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                            placeholder="Tell patients about your experience..."
                            onChange={handleChange}
                        />
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Experience (Years)</label>
                            <input
                                type="number"
                                name="experience_years"
                                className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                                onChange={handleChange}
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Fee</label>
                            <input
                                type="number"
                                name="consultation_fee"
                                className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                                onChange={handleChange}
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Currency</label>
                            <select
                                name="currency"
                                className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                                onChange={handleChange}
                            >
                                <option value="USD">USD</option>
                                <option value="INR">INR</option>
                                <option value="EUR">EUR</option>
                            </select>
                        </div>
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Languages</label>
                        <div className="flex gap-2 mb-2">
                            <input
                                type="text"
                                value={langInput}
                                onChange={(e) => setLangInput(e.target.value)}
                                className="flex-1 p-2 border border-gray-300 rounded-lg"
                                placeholder="Add language..."
                            />
                            <button
                                type="button"
                                onClick={handleAddLanguage}
                                className="bg-gray-100 px-4 py-2 rounded-lg hover:bg-gray-200"
                            >
                                Add
                            </button>
                        </div>
                        <div className="flex flex-wrap gap-2">
                            {formData.languages.map(lang => (
                                <span key={lang} className="bg-blue-100 text-blue-800 px-2 py-1 rounded-full text-xs">
                                    {lang}
                                </span>
                            ))}
                        </div>
                    </div>

                    <div className="border-t pt-4">
                        <h3 className="font-medium text-gray-900 mb-3">Clinic Details (Optional)</h3>
                        <div className="grid grid-cols-1 gap-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Clinic Name</label>
                                <input
                                    type="text"
                                    name="clinic_name"
                                    className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                                    onChange={handleChange}
                                />
                            </div>
                        </div>
                    </div>

                    <button
                        type="submit"
                        disabled={loading}
                        className="w-full bg-blue-600 text-white py-3 rounded-xl font-bold hover:bg-blue-700 disabled:opacity-50 shadow-lg transition-transform hover:-translate-y-1"
                    >
                        {loading ? 'Creating Profile...' : 'Create Doctor Profile'}
                    </button>
                </form>
            </div>
        </div>
    );
};

export default DoctorOnboarding;

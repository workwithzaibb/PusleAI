import React, { useState } from 'react';
import { addMedication } from '../api';
import { Pill, Plus, X } from 'lucide-react';

const AddMedicationForm = ({ onClose, onSuccess }) => {
    const [loading, setLoading] = useState(false);
    const [formData, setFormData] = useState({
        name: '',
        dosage: '',
        dosage_unit: 'mg',
        form: 'Tablet',
        frequency: 'once_daily',
        timing: 'after_food',
        instructions: '',
        is_ongoing: true
    });

    const handleChange = (e) => {
        const value = e.target.type === 'checkbox' ? e.target.checked : e.target.value;
        setFormData({ ...formData, [e.target.name]: value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        try {
            await addMedication(formData);
            onSuccess();
            onClose();
        } catch (error) {
            console.error(error);
            alert("Failed to add medication. Please check usage.");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
            <div className="bg-white rounded-2xl w-full max-w-md p-6 relative shadow-2xl">
                <button
                    onClick={onClose}
                    className="absolute top-4 right-4 text-gray-400 hover:text-gray-600"
                >
                    <X className="w-6 h-6" />
                </button>

                <h2 className="text-xl font-bold text-gray-800 mb-6 flex items-center">
                    <div className="bg-blue-100 p-2 rounded-lg mr-3">
                        <Plus className="w-5 h-5 text-blue-600" />
                    </div>
                    Add New Medication
                </h2>

                <form onSubmit={handleSubmit} className="space-y-4">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Medicine Name</label>
                        <input
                            type="text"
                            name="name"
                            required
                            placeholder="e.g. Paracetamol"
                            className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                            onChange={handleChange}
                        />
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Dosage</label>
                            <input
                                type="text"
                                name="dosage"
                                required
                                placeholder="e.g. 500"
                                className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                                onChange={handleChange}
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Unit</label>
                            <select
                                name="dosage_unit"
                                className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                                onChange={handleChange}
                            >
                                <option value="mg">mg</option>
                                <option value="ml">ml</option>
                                <option value="tablet">tablet</option>
                                <option value="capsule">capsule</option>
                            </select>
                        </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Frequency</label>
                            <select
                                name="frequency"
                                className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                                onChange={handleChange}
                            >
                                <option value="once_daily">Once Daily</option>
                                <option value="twice_daily">Twice Daily (BD)</option>
                                <option value="three_times_daily">Three Times (TDS)</option>
                                <option value="four_times_daily">Four Times (QID)</option>
                                <option value="as_needed">As Needed (SOS)</option>
                            </select>
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Timing</label>
                            <select
                                name="timing"
                                className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                                onChange={handleChange}
                            >
                                <option value="after_food">After Food</option>
                                <option value="before_food">Before Food</option>
                                <option value="with_food">With Food</option>
                                <option value="empty_stomach">Empty Stomach</option>
                            </select>
                        </div>
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Instructions (Optional)</label>
                        <textarea
                            name="instructions"
                            rows="2"
                            placeholder="e.g. Take with a full glass of water"
                            className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                            onChange={handleChange}
                        />
                    </div>

                    <button
                        type="submit"
                        disabled={loading}
                        className="w-full bg-blue-600 text-white py-3 rounded-xl font-bold hover:bg-blue-700 disabled:opacity-50 transition-colors"
                    >
                        {loading ? 'Adding...' : 'Add Schedule'}
                    </button>
                </form>
            </div>
        </div>
    );
};

export default AddMedicationForm;

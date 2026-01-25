import React from 'react';
import { Pill, Clock, Edit2, Trash2 } from 'lucide-react';

const MedicationCard = ({ medication, onDelete }) => {
    return (
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4 hover:shadow-md transition-shadow">
            <div className="flex justify-between items-start mb-3">
                <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
                        <Pill className="w-5 h-5 text-green-600" />
                    </div>
                    <div>
                        <h3 className="font-bold text-gray-800">{medication.name}</h3>
                        <p className="text-xs text-gray-500">{medication.dosage} • {medication.frequency}</p>
                    </div>
                </div>
                <div className="flex gap-2">
                    {/* Edit function to be implemented later if needed */}
                    <button
                        onClick={() => onDelete(medication.id)}
                        className="p-1 text-gray-400 hover:text-red-500 transition-colors"
                        title="Delete"
                    >
                        <Trash2 className="w-4 h-4" />
                    </button>
                </div>
            </div>

            <div className="space-y-2">
                <div className="flex items-center text-sm text-gray-600">
                    <Clock className="w-3 h-3 mr-2 text-gray-400" />
                    <span>Next: {medication.schedules && medication.schedules.length > 0 ? medication.schedules[0].scheduled_time : 'No schedule'}</span>
                </div>
                {medication.instructions && (
                    <div className="p-2 bg-gray-50 rounded text-xs text-gray-600 italic">
                        "{medication.instructions}"
                    </div>
                )}
            </div>
        </div>
    );
};

export default MedicationCard;

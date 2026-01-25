import React from 'react';
import { Star, MapPin, Clock } from 'lucide-react';

const DoctorCard = ({ doctor, onBook }) => {
    return (
        <div className="bg-white rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 overflow-hidden border border-gray-100 flex flex-col">
            <div className="p-6 flex-1">
                <div className="flex justify-between items-start mb-4">
                    <div>
                        <h3 className="text-xl font-bold text-gray-800">{doctor.full_name}</h3>
                        <p className="text-blue-600 font-medium">{doctor.specialty}</p>
                    </div>
                    <div className="flex items-center bg-yellow-50 px-2 py-1 rounded-lg">
                        <Star className="w-4 h-4 text-yellow-500 fill-yellow-500 mr-1" />
                        <span className="font-bold text-gray-700">{doctor.rating_average || 'New'}</span>
                        <span className="text-xs text-gray-500 ml-1">({doctor.rating_count})</span>
                    </div>
                </div>

                <div className="space-y-2 text-sm text-gray-600 mb-4">
                    <div className="flex items-center">
                        <MapPin className="w-4 h-4 mr-2 text-gray-400" />
                        <span>{doctor.clinic_name || 'Virtual Clinic'}</span>
                    </div>
                    <p className="line-clamp-2 italic text-gray-500">{doctor.bio}</p>
                </div>

                <div className="flex flex-wrap gap-2 mb-4">
                    {doctor.languages && doctor.languages.map(lang => (
                        <span key={lang} className="px-2 py-1 bg-gray-100 text-gray-600 text-xs rounded-full">{lang}</span>
                    ))}
                </div>
            </div>

            <div className="p-4 bg-gray-50 border-t border-gray-100 flex items-center justify-between">
                <div>
                    <span className="text-xs text-gray-500 uppercase font-semibold">Consultation Fee</span>
                    <div className="font-bold text-gray-900">{doctor.currency} {doctor.consultation_fee}</div>
                </div>
                <button
                    onClick={() => onBook(doctor)}
                    className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-lg font-medium transition-colors shadow-sm"
                >
                    Book Now
                </button>
            </div>
        </div>
    );
};

export default DoctorCard;

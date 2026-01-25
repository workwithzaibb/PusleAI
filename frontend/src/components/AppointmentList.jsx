import React, { useEffect, useState } from 'react';
import { getMyAppointments, cancelAppointment } from '../api';
import { Calendar, Clock, User, Video, XCircle } from 'lucide-react';

const AppointmentList = () => {
    const [appointments, setAppointments] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchAppointments();
    }, []);

    const fetchAppointments = async () => {
        try {
            const response = await getMyAppointments();
            setAppointments(response.data);
        } catch (error) {
            console.error("Failed to fetch appointments", error);
        } finally {
            setLoading(false);
        }
    };

    const handleCancel = async (id) => {
        if (!window.confirm("Are you sure you want to cancel this appointment?")) return;
        try {
            await cancelAppointment(id);
            fetchAppointments(); // Refresh list
        } catch (error) {
            alert("Failed to cancel appointment");
        }
    };

    if (loading) return <div className="p-4 text-center text-gray-500">Loading your appointments...</div>;

    if (appointments.length === 0) {
        return (
            <div className="text-center p-8 bg-gray-50 rounded-xl border border-dashed border-gray-300">
                <Calendar className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                <h3 className="text-lg font-medium text-gray-900">No Appointments</h3>
                <p className="text-gray-500">You haven't booked any consultations yet.</p>
            </div>
        );
    }

    return (
        <div className="space-y-4">
            {appointments.map((appt) => (
                <div key={appt.id} className="bg-white border rounded-xl p-4 flex flex-col md:flex-row gap-4 shadow-sm hover:shadow-md transition-shadow">
                    <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2">
                            <span className={`px-2 py-0.5 rounded text-xs font-bold uppercase ${appt.status === 'confirmed' ? 'bg-green-100 text-green-700' :
                                    appt.status === 'cancelled' ? 'bg-red-100 text-red-700' : 'bg-gray-100 text-gray-700'
                                }`}>
                                {appt.status}
                            </span>
                        </div>
                        <h3 className="font-bold text-lg text-gray-900">{appt.doctor_name}</h3>
                        <div className="flex items-center text-sm text-gray-600 mt-1">
                            <Calendar className="w-4 h-4 mr-1" />
                            <span className="mr-3">{new Date(appt.appointment_date).toLocaleDateString()}</span>
                            <Clock className="w-4 h-4 mr-1" />
                            <span>{appt.start_time} - {appt.end_time}</span>
                        </div>
                        {appt.reason && (
                            <p className="text-sm text-gray-500 mt-2 italic">"{appt.reason}"</p>
                        )}
                    </div>

                    <div className="flex flex-col justify-center gap-2 border-t md:border-t-0 md:border-l pt-3 md:pt-0 md:pl-4">
                        {appt.status === 'confirmed' && (
                            <>
                                <button className="flex items-center justify-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 text-sm font-medium">
                                    <Video className="w-4 h-4 mr-2" />
                                    Join Meeting
                                </button>
                                <button
                                    onClick={() => handleCancel(appt.id)}
                                    className="flex items-center justify-center px-4 py-2 text-red-600 hover:bg-red-50 rounded-lg text-sm font-medium transition-colors"
                                >
                                    <XCircle className="w-4 h-4 mr-2" />
                                    Cancel
                                </button>
                            </>
                        )}
                    </div>
                </div>
            ))}
        </div>
    );
};

export default AppointmentList;

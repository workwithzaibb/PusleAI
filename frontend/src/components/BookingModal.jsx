import React, { useState, useEffect } from 'react';
import { getDoctorSlots, bookAppointment } from '../api';
import { X, Calendar, Clock, AlertCircle } from 'lucide-react';

const BookingModal = ({ doctor, onClose, onSuccess }) => {
    const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);
    const [slots, setSlots] = useState([]);
    const [loading, setLoading] = useState(false);
    const [bookingLoading, setBookingLoading] = useState(false);
    const [selectedSlot, setSelectedSlot] = useState(null);
    const [reason, setReason] = useState('');
    const [error, setError] = useState('');

    useEffect(() => {
        if (doctor && selectedDate) {
            fetchSlots();
        }
    }, [doctor, selectedDate]);

    const fetchSlots = async () => {
        setLoading(true);
        try {
            const response = await getDoctorSlots(doctor.id, selectedDate);
            // Simplify: just grab slots for the selected date from the response list
            const dayData = response.data.find(d => d.date === selectedDate);
            setSlots(dayData ? dayData.slots : []);
        } catch (err) {
            console.error("Failed to fetch slots", err);
            setError("Could not load availability.");
        } finally {
            setLoading(false);
        }
    };

    const handleBook = async () => {
        if (!selectedSlot) return;
        setBookingLoading(true);
        setError('');

        try {
            await bookAppointment({
                doctor_id: doctor.id,
                appointment_date: selectedDate,
                start_time: selectedSlot.start_time,
                reason: reason
            });
            onSuccess();
            onClose();
        } catch (err) {
            console.error(err);
            setError(err.response?.data?.detail || "Booking failed. Please try again.");
        } finally {
            setBookingLoading(false);
        }
    };

    if (!doctor) return null;

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
            <div className="bg-white rounded-2xl w-full max-w-md overflow-hidden shadow-2xl flex flex-col max-h-[90vh]">
                {/* Header */}
                <div className="bg-blue-600 p-4 flex justify-between items-center text-white">
                    <h2 className="text-lg font-bold">Book Appointment</h2>
                    <button onClick={onClose} className="hover:bg-blue-700 p-1 rounded transition-colors">
                        <X className="w-6 h-6" />
                    </button>
                </div>

                <div className="p-6 overflow-y-auto flex-1">
                    <div className="mb-6 flex items-center p-3 bg-blue-50 rounded-lg">
                        <div className="flex-1">
                            <h3 className="font-bold text-gray-800">{doctor.full_name}</h3>
                            <p className="text-sm text-blue-600">{doctor.specialty}</p>
                        </div>
                        <div className="text-right">
                            <span className="text-sm text-gray-500">Fee</span>
                            <p className="font-bold text-gray-800">{doctor.currency} {doctor.consultation_fee}</p>
                        </div>
                    </div>

                    {error && (
                        <div className="mb-4 p-3 bg-red-100 text-red-700 rounded-lg flex items-center text-sm">
                            <AlertCircle className="w-4 h-4 mr-2" />
                            {error}
                        </div>
                    )}

                    {/* Date Selection */}
                    <div className="mb-4">
                        <label className="block text-sm font-medium text-gray-700 mb-1">Select Date</label>
                        <div className="relative">
                            <Calendar className="absolute left-3 top-3 w-5 h-5 text-gray-400" />
                            <input
                                type="date"
                                value={selectedDate}
                                min={new Date().toISOString().split('T')[0]}
                                onChange={(e) => setSelectedDate(e.target.value)}
                                className="w-full pl-10 p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                            />
                        </div>
                    </div>

                    {/* Slots */}
                    <div className="mb-6">
                        <label className="block text-sm font-medium text-gray-700 mb-1">Available Slots</label>
                        {loading ? (
                            <div className="flex justify-center py-4 text-gray-500">Loading slots...</div>
                        ) : slots.length === 0 ? (
                            <div className="text-center py-4 bg-gray-50 rounded-lg text-gray-500 text-sm">No slots available for this date</div>
                        ) : (
                            <div className="grid grid-cols-3 gap-2">
                                {slots.map((slot, idx) => (
                                    <button
                                        key={idx}
                                        onClick={() => slot.is_available && setSelectedSlot(slot)}
                                        disabled={!slot.is_available}
                                        className={`p-2 text-sm rounded border text-center transition-colors ${!slot.is_available
                                                ? 'bg-gray-100 text-gray-400 cursor-not-allowed decoration-slice'
                                                : selectedSlot === slot
                                                    ? 'bg-blue-600 text-white border-blue-600'
                                                    : 'bg-white text-gray-700 hover:border-blue-500'
                                            }`}
                                    >
                                        {slot.start_time}
                                    </button>
                                ))}
                            </div>
                        )}
                    </div>

                    {/* Reason */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Reason for Visit</label>
                        <textarea
                            value={reason}
                            onChange={(e) => setReason(e.target.value)}
                            placeholder="Briefly describe your symptoms..."
                            className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 h-24 resize-none"
                        />
                    </div>
                </div>

                {/* Footer */}
                <div className="p-4 border-t border-gray-100 bg-gray-50 flex justify-end gap-3">
                    <button
                        onClick={onClose}
                        className="px-4 py-2 text-gray-600 hover:bg-gray-200 rounded-lg font-medium"
                    >
                        Cancel
                    </button>
                    <button
                        onClick={handleBook}
                        disabled={!selectedSlot || bookingLoading}
                        className="px-6 py-2 bg-blue-600 text-white rounded-lg font-bold hover:bg-blue-700 disabled:opacity-50 flex items-center"
                    >
                        {bookingLoading ? 'Booking...' : (
                            <>
                                Confirm Booking
                                {selectedSlot && <span className="ml-1 text-xs font-normal opacity-80">({selectedSlot.start_time})</span>}
                            </>
                        )}
                    </button>
                </div>
            </div>
        </div>
    );
};

export default BookingModal;

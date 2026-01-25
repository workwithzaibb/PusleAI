import React, { useEffect, useState } from 'react';
import { getTodaySchedule, markMedicationTaken, markMedicationSkipped } from '../api';
import { Check, X, Clock, AlertTriangle } from 'lucide-react';

const TodaySchedule = () => {
    const [schedule, setSchedule] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchSchedule();
    }, []);

    const fetchSchedule = async () => {
        try {
            const response = await getTodaySchedule();
            // Assume API returns { reminders: [] }
            setSchedule(response.data.reminders || []);
        } catch (error) {
            console.error("Failed to fetch schedule", error);
        } finally {
            setLoading(false);
        }
    };

    const handleTake = async (reminder) => {
        try {
            await markMedicationTaken(reminder.schedule_id, reminder.medication_id);
            // Optimistic update: Remove from list or mark as done locally?
            // Ideally, we move it to a "Completed" section or just refresh
            fetchSchedule();
        } catch (error) {
            alert("Failed to mark as taken");
        }
    };

    const handleSkip = async (reminder) => {
        const reason = prompt("Reason for skipping?");
        if (!reason) return;
        try {
            await markMedicationSkipped(reminder.schedule_id, reminder.medication_id, reason);
            fetchSchedule();
        } catch (error) {
            alert("Failed to mark as skipped");
        }
    };

    if (loading) return <div className="p-4 text-center text-gray-500">Loading today's schedule...</div>;

    if (schedule.length === 0) {
        return (
            <div className="text-center p-8 bg-green-50 rounded-xl border border-green-100">
                <Check className="w-12 h-12 text-green-500 mx-auto mb-3" />
                <h3 className="text-lg font-medium text-green-900">All Caught Up!</h3>
                <p className="text-green-600">You have no pending medications for today.</p>
            </div>
        );
    }

    return (
        <div className="space-y-4">
            {schedule.map((reminder, idx) => (
                <div key={idx} className="bg-white border-l-4 border-blue-500 rounded-lg p-4 shadow-sm flex justify-between items-center transition-transform hover:scale-[1.01]">
                    <div>
                        <div className="flex items-center gap-2 mb-1">
                            <Clock className="w-4 h-4 text-blue-600" />
                            <span className="font-bold text-gray-900">{reminder.scheduled_time}</span>
                            {reminder.is_critical && (
                                <span className="px-2 py-0.5 bg-red-100 text-red-700 text-xs rounded-full font-bold uppercase">Critical</span>
                            )}
                        </div>
                        <h3 className="font-bold text-lg text-gray-800">{reminder.medication_name}</h3>
                        <p className="text-sm text-gray-600">{reminder.dosage} • {reminder.instructions || reminder.timing}</p>
                    </div>

                    <div className="flex gap-2">
                        <button
                            onClick={() => handleSkip(reminder)}
                            className="p-2 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-full transition-colors"
                            title="Skip"
                        >
                            <X className="w-6 h-6" />
                        </button>
                        <button
                            onClick={() => handleTake(reminder)}
                            className="p-2 bg-green-100 text-green-600 hover:bg-green-600 hover:text-white rounded-full transition-colors shadow-sm"
                            title="Take"
                        >
                            <Check className="w-6 h-6" />
                        </button>
                    </div>
                </div>
            ))}
        </div>
    );
};

export default TodaySchedule;

import React, { useState } from 'react';
import { createJournal } from '../api';

const Journal = () => {
    const [entry, setEntry] = useState('');
    const [loading, setLoading] = useState(false);
    const [success, setSuccess] = useState(false);

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!entry.trim()) return;

        setLoading(true);
        setSuccess(false);

        try {
            await createJournal({
                content: entry,
                entry_type: 'text',
                tags: [] // Can be enhanced later to extract tags
            });
            setSuccess(true);
            setEntry('');
            setTimeout(() => setSuccess(false), 3000);
        } catch (error) {
            console.error("Failed to save journal", error);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="bg-white p-6 rounded-lg shadow-md">
            <h2 className="text-2xl font-bold mb-4 text-gray-800">Daily Journal</h2>
            <p className="text-gray-600 mb-4">Write down your thoughts. Writing can help clear your mind.</p>

            {success && (
                <div className="mb-4 p-3 bg-green-50 text-green-700 rounded border border-green-100">
                    Journal entry saved successfully.
                </div>
            )}

            <form onSubmit={handleSubmit}>
                <textarea
                    value={entry}
                    onChange={(e) => setEntry(e.target.value)}
                    className="w-full h-40 p-4 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent resize-none"
                    placeholder="Today I felt..."
                />
                <div className="mt-4 flex justify-between items-center">
                    <span className="text-xs text-gray-500">{entry.length} characters</span>
                    <button
                        type="submit"
                        disabled={loading || !entry.trim()}
                        className="bg-purple-600 text-white px-6 py-2 rounded hover:bg-purple-700 disabled:opacity-50 font-medium transition-colors"
                    >
                        {loading ? 'Saving...' : 'Save Entry'}
                    </button>
                </div>
            </form>
        </div>
    );
};

export default Journal;

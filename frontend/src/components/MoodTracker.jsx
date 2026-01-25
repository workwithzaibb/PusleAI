import React, { useState, useEffect } from 'react';
import { logMood, getMoodHistory } from '../api';

const MoodTracker = () => {
    const [mood, setMood] = useState(3);
    const [tags, setTags] = useState([]);
    const [note, setNote] = useState('');
    const [history, setHistory] = useState([]);
    const [loading, setLoading] = useState(false);
    const [message, setMessage] = useState('');

    const MOOD_EMOJIS = {
        1: '😢', // Terrible
        2: '😕', // Bad
        3: '😐', // Okay
        4: '🙂', // Good
        5: '😄'  // Great
    };

    // Map mood score to backend enum
    const MOOD_MAP = {
        1: 'sad',
        2: 'stressed',
        3: 'neutral',
        4: 'relaxed',
        5: 'happy'
    };

    // Convert mood score (1-5) to valence (-1 to 1)
    const moodToValence = (score) => (score - 3) / 2;
    
    // Convert mood score (1-5) to arousal (0 to 1)
    const moodToArousal = (score) => score >= 3 ? (score - 1) / 4 : 0.3;

    const COMMON_TAGS = ['Work', 'Family', 'Health', 'Sleep', 'Exercise', 'Social', 'Weather'];

    useEffect(() => {
        fetchHistory();
    }, []);

    const fetchHistory = async () => {
        try {
            const response = await getMoodHistory(7);
            setHistory(response.data);
        } catch (error) {
            console.error("Failed to fetch mood history", error);
        }
    };

    const handleTagToggle = (tag) => {
        if (tags.includes(tag)) {
            setTags(tags.filter(t => t !== tag));
        } else {
            setTags([...tags, tag]);
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setMessage('');

        try {
            await logMood({
                mood: MOOD_MAP[mood],
                valence: moodToValence(mood),
                arousal: moodToArousal(mood),
                notes: note || null,
                activities: tags,
                factors: []
            });
            setMessage('Mood logged successfully!');
            setNote('');
            setTags([]);
            fetchHistory();
        } catch (error) {
            console.error(error);
            setMessage('Failed to log mood. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="bg-white p-6 rounded-lg shadow-md">
            <h2 className="text-2xl font-bold mb-4 text-gray-800">Mood Tracker</h2>

            {message && (
                <div className={`p-3 mb-4 rounded ${message.includes('Failed') ? 'bg-red-100 text-red-700' : 'bg-green-100 text-green-700'}`}>
                    {message}
                </div>
            )}

            <form onSubmit={handleSubmit} className="mb-8">
                <label className="block mb-2 font-medium text-gray-700">How are you feeling?</label>
                <div className="flex justify-between mb-4 text-4xl">
                    {[1, 2, 3, 4, 5].map((val) => (
                        <button
                            key={val}
                            type="button"
                            onClick={() => setMood(val)}
                            className={`p-2 rounded-full transition-transform hover:scale-110 ${mood === val ? 'bg-blue-100 scale-110 ring-2 ring-blue-500' : 'grayscale opacity-70 hover:grayscale-0 hover:opacity-100'}`}
                        >
                            {MOOD_EMOJIS[val]}
                        </button>
                    ))}
                </div>

                <label className="block mb-2 font-medium text-gray-700">What's affecting you?</label>
                <div className="flex flex-wrap gap-2 mb-4">
                    {COMMON_TAGS.map(tag => (
                        <button
                            key={tag}
                            type="button"
                            onClick={() => handleTagToggle(tag)}
                            className={`px-3 py-1 rounded-full text-sm border ${tags.includes(tag) ? 'bg-blue-600 text-white border-blue-600' : 'bg-gray-50 text-gray-600 border-gray-200 hover:bg-gray-100'}`}
                        >
                            {tag}
                        </button>
                    ))}
                </div>

                <label className="block mb-2 font-medium text-gray-700">Add a note (optional)</label>
                <textarea
                    value={note}
                    onChange={(e) => setNote(e.target.value)}
                    className="w-full p-2 border border-gray-300 rounded mb-4 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="Anything else on your mind?"
                    rows="3"
                />

                <button
                    type="submit"
                    disabled={loading}
                    className="w-full bg-blue-600 text-white py-2 rounded hover:bg-blue-700 disabled:opacity-50 font-medium"
                >
                    {loading ? 'Logging...' : 'Log Mood'}
                </button>
            </form>

            <h3 className="text-xl font-semibold mb-3 text-gray-800">Recent History</h3>
            <div className="space-y-3">
                {history.length === 0 ? (
                    <p className="text-gray-500 text-center py-4">No mood logs yet.</p>
                ) : (
                    history.map((entry) => {
                        // Map backend mood enum to emoji
                        const moodEmojiMap = {
                            'sad': '😢', 'stressed': '😕', 'neutral': '😐', 'relaxed': '🙂', 'happy': '😄',
                            'anxious': '😰', 'angry': '😠', 'tired': '😴', 'excited': '🤩', 'grateful': '🙏', 'overwhelmed': '😵'
                        };
                        return (
                            <div key={entry.id} className="flex items-center p-3 border rounded hover:bg-gray-50">
                                <span className="text-2xl mr-3">{moodEmojiMap[entry.mood] || '😐'}</span>
                                <div className="flex-1">
                                    <div className="flex justify-between">
                                        <span className="font-medium text-gray-800">{new Date(entry.created_at).toLocaleDateString()}</span>
                                        <span className="text-xs text-gray-500">{new Date(entry.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                                    </div>
                                    {entry.activities && entry.activities.length > 0 && (
                                        <div className="text-sm text-gray-600 mt-1">
                                            {entry.activities.join(', ')}
                                        </div>
                                    )}
                                    {entry.notes && <p className="text-sm text-gray-500 mt-1 italic">"{entry.notes}"</p>}
                                </div>
                            </div>
                        );
                    })
                )}
            </div>
        </div>
    );
};

export default MoodTracker;

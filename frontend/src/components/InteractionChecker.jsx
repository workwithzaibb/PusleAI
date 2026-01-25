import React, { useState } from 'react';
import { checkDrugInteractions } from '../api';
import { Search, AlertTriangle, CheckCircle, Plus, X } from 'lucide-react';

const InteractionChecker = () => {
    const [medicines, setMedicines] = useState([]);
    const [input, setInput] = useState('');
    const [result, setResult] = useState(null);
    const [loading, setLoading] = useState(false);

    const handleAdd = () => {
        if (input && !medicines.includes(input)) {
            setMedicines([...medicines, input]);
            setInput('');
            setResult(null); // Reset result on change
        }
    };

    const handleCheck = async () => {
        if (medicines.length < 2) return;
        setLoading(true);
        try {
            // API expects { medication_names: ["A", "B"] }
            const response = await checkDrugInteractions({ medication_names: medicines });
            setResult(response.data);
        } catch (error) {
            console.error("Check failed", error);
            setResult({ error: true, message: "Could not verify interactions." });
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="bg-white rounded-xl shadow-sm border border-orange-100 p-6">
            <h2 className="text-lg font-bold text-gray-800 mb-4 flex items-center">
                <AlertTriangle className="w-5 h-5 text-orange-500 mr-2" />
                Interaction Checker
            </h2>

            <div className="flex gap-2 mb-4">
                <input
                    type="text"
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && handleAdd()}
                    placeholder="Enter medicine name..."
                    className="flex-1 p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500"
                />
                <button
                    onClick={handleAdd}
                    className="bg-gray-100 hover:bg-gray-200 text-gray-700 p-2 rounded-lg transition-colors"
                >
                    <Plus className="w-5 h-5" />
                </button>
            </div>

            <div className="flex flex-wrap gap-2 mb-6">
                {medicines.map(med => (
                    <span key={med} className="bg-orange-50 text-orange-800 px-3 py-1 rounded-full text-sm flex items-center">
                        {med}
                        <button onClick={() => setMedicines(medicines.filter(m => m !== med))} className="ml-2 text-orange-400 hover:text-orange-900">
                            <X className="w-3 h-3" />
                        </button>
                    </span>
                ))}
                {medicines.length === 0 && <span className="text-gray-400 text-sm italic">Add at least two medicines to check</span>}
            </div>

            <button
                onClick={handleCheck}
                disabled={medicines.length < 2 || loading}
                className="w-full bg-orange-500 text-white py-2 rounded-lg font-bold hover:bg-orange-600 disabled:opacity-50 transition-colors"
            >
                {loading ? 'Analyzing Safety...' : 'Check for Interactions'}
            </button>

            {result && (
                <div className={`mt-6 p-4 rounded-xl border ${result.has_interactions ? 'bg-red-50 border-red-200' : 'bg-green-50 border-green-200'}`}>
                    {result.has_interactions ? (
                        <>
                            <div className="flex items-center text-red-800 font-bold mb-2">
                                <AlertTriangle className="w-5 h-5 mr-2" />
                                {result.interaction_count} Interactions Found
                            </div>
                            <p className="text-sm text-red-700 mb-3">{result.recommendation}</p>
                            {/* Note: Adjust property names based on actual API response structure if needed */}
                            {/* Assuming result.interactions is the list */}
                            <ul className="space-y-2">
                                {(result.interactions || []).map((int, i) => (
                                    <li key={i} className="text-sm bg-white p-2 rounded border border-red-100">
                                        <span className="font-bold text-red-600 block mb-1">{int.severity.toUpperCase()}</span>
                                        {int.description}
                                    </li>
                                ))}
                            </ul>
                        </>
                    ) : (
                        <div className="flex items-center text-green-800">
                            <CheckCircle className="w-5 h-5 mr-2" />
                            <span className="font-bold">Safe to take together</span>
                        </div>
                    )}
                </div>
            )}
        </div>
    );
};

export default InteractionChecker;

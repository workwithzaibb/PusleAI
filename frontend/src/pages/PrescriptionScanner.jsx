import { useState, useRef } from 'react';
import { Link } from 'react-router-dom';
import { 
  ArrowLeft, 
  Upload, 
  Camera, 
  FileText, 
  Pill, 
  IndianRupee,
  TrendingDown,
  AlertCircle,
  CheckCircle,
  Search,
  Sparkles,
  Building2,
  Phone,
  ExternalLink,
  X,
  Image,
  Loader2
} from 'lucide-react';
import api from '../api';
import { useTheme } from '../contexts/ThemeContext';

const PrescriptionScanner = () => {
  const [activeTab, setActiveTab] = useState('upload'); // 'upload' or 'manual'
  const [file, setFile] = useState(null);
  const [preview, setPreview] = useState(null);
  const [manualText, setManualText] = useState('');
  const [loading, setLoading] = useState(false);
  const [results, setResults] = useState(null);
  const [error, setError] = useState('');
  const [searchMedicine, setSearchMedicine] = useState('');
  const [searchResults, setSearchResults] = useState(null);
  const { theme } = useTheme();
  
  const fileInputRef = useRef(null);

  const handleFileChange = (e) => {
    const selectedFile = e.target.files[0];
    if (selectedFile) {
      setFile(selectedFile);
      setError('');
      
      // Create preview for images
      if (selectedFile.type.startsWith('image/')) {
        const reader = new FileReader();
        reader.onload = (e) => setPreview(e.target.result);
        reader.readAsDataURL(selectedFile);
      } else {
        setPreview(null);
      }
    }
  };

  const handleDrop = (e) => {
    e.preventDefault();
    const droppedFile = e.dataTransfer.files[0];
    if (droppedFile) {
      setFile(droppedFile);
      setError('');
      
      if (droppedFile.type.startsWith('image/')) {
        const reader = new FileReader();
        reader.onload = (e) => setPreview(e.target.result);
        reader.readAsDataURL(droppedFile);
      }
    }
  };

  const handleDragOver = (e) => {
    e.preventDefault();
  };

  const analyzePrescription = async () => {
    setLoading(true);
    setError('');
    setResults(null);

    try {
      let response;
      
      if (activeTab === 'upload' && file) {
        const formData = new FormData();
        formData.append('file', file);
        response = await api.post('/prescription/scan', formData, {
          headers: { 'Content-Type': 'multipart/form-data' }
        });
      } else if (activeTab === 'manual' && manualText.trim()) {
        const formData = new FormData();
        formData.append('text', manualText);
        response = await api.post('/prescription/analyze-text', formData);
      } else {
        setError('Please upload a prescription or enter medicine names');
        setLoading(false);
        return;
      }

      setResults(response.data);
    } catch (err) {
      setError(err.response?.data?.detail || 'Failed to analyze prescription. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const searchSingleMedicine = async () => {
    if (!searchMedicine.trim()) return;
    
    setLoading(true);
    try {
      const response = await api.get(`/prescription/search/${searchMedicine}`);
      setSearchResults(response.data);
    } catch (err) {
      setSearchResults({ success: false, message: 'Medicine not found' });
    } finally {
      setLoading(false);
    }
  };

  const clearResults = () => {
    setResults(null);
    setFile(null);
    setPreview(null);
    setManualText('');
  };

  return (
    <div className={`min-h-screen transition-colors duration-300 ${theme === 'dark' ? 'bg-black text-white' : 'bg-gradient-to-br from-slate-50 via-green-50 to-cyan-50 text-gray-900'}`}>
      {/* Animated Background */}
      <div className="fixed inset-0 z-0">
        <div className={`absolute inset-0 ${theme === 'dark' ? 'bg-gradient-to-br from-green-900/20 via-black to-cyan-900/20' : 'bg-transparent'}`} />
        <div className={`absolute top-1/4 left-1/4 w-96 h-96 rounded-full blur-3xl animate-pulse ${theme === 'dark' ? 'bg-green-500/10' : 'bg-green-400/20'}`} />
        <div className={`absolute bottom-1/4 right-1/4 w-96 h-96 rounded-full blur-3xl animate-pulse ${theme === 'dark' ? 'bg-cyan-500/10' : 'bg-cyan-400/20'}`} style={{ animationDelay: '1s' }} />
      </div>

      <div className="relative z-10 max-w-6xl mx-auto px-4 py-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <Link 
            to="/dashboard" 
            className={`inline-flex items-center gap-2 transition-colors ${theme === 'dark' ? 'text-cyan-300 hover:text-white' : 'text-cyan-600 hover:text-cyan-700'}`}
          >
            <ArrowLeft className="w-5 h-5" />
            Back to Dashboard
          </Link>
        </div>

        {/* Hero */}
        <div className="text-center mb-12">
          <div className={`inline-flex items-center gap-2 px-4 py-2 rounded-full border mb-6 ${theme === 'dark' ? 'bg-green-500/10 border-green-500/20' : 'bg-green-100 border-green-200'}`}>
            <Sparkles className="w-4 h-4 text-green-500" />
            <span className={`text-sm font-medium ${theme === 'dark' ? 'text-green-500' : 'text-green-600'}`}>AI-Powered Medicine Analysis</span>
          </div>
          <h1 className="text-4xl md:text-5xl font-black mb-4">
            Prescription <span className="bg-gradient-to-r from-green-500 to-cyan-500 bg-clip-text text-transparent">Scanner</span>
          </h1>
          <p className={`text-xl max-w-2xl mx-auto ${theme === 'dark' ? 'text-cyan-200/80' : 'text-cyan-700'}`}>
            Upload your prescription and discover cheaper generic alternatives. Save up to 70% on medicines!
          </p>
        </div>

        {!results ? (
          <>
            {/* Tab Switcher */}
            <div className="flex justify-center mb-8">
              <div className={`inline-flex p-1 rounded-xl ${theme === 'dark' ? 'bg-white/5' : 'bg-white shadow-md border border-gray-200'}`}>
                <button
                  onClick={() => setActiveTab('upload')}
                  className={`px-6 py-3 rounded-lg font-medium transition-all flex items-center gap-2 ${
                    activeTab === 'upload' 
                      ? 'bg-green-500 text-white' 
                      : (theme === 'dark' ? 'text-green-300 hover:text-white' : 'text-green-600 hover:text-green-700')
                  }`}
                >
                  <Camera className="w-5 h-5" />
                  Upload Image
                </button>
                <button
                  onClick={() => setActiveTab('manual')}
                  className={`px-6 py-3 rounded-lg font-medium transition-all flex items-center gap-2 ${
                    activeTab === 'manual' 
                      ? 'bg-green-500 text-white' 
                      : (theme === 'dark' ? 'text-green-300 hover:text-white' : 'text-green-600 hover:text-green-700')
                  }`}
                >
                  <FileText className="w-5 h-5" />
                  Enter Manually
                </button>
              </div>
            </div>

            {/* Upload Section */}
            {activeTab === 'upload' && (
              <div className="max-w-2xl mx-auto">
                <div
                  onClick={() => fileInputRef.current?.click()}
                  onDrop={handleDrop}
                  onDragOver={handleDragOver}
                  className={`border-2 border-dashed rounded-3xl p-12 text-center cursor-pointer transition-all backdrop-blur-lg ${theme === 'dark' ? 'border-white/20 hover:border-green-500/50 bg-white/5' : 'border-gray-300 hover:border-green-500 bg-white shadow-md'}`}
                >
                  {preview ? (
                    <div className="relative">
                      <img src={preview} alt="Prescription preview" className="max-h-64 mx-auto rounded-xl" />
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          setFile(null);
                          setPreview(null);
                        }}
                        className="absolute top-2 right-2 p-2 bg-red-500 rounded-full hover:bg-red-600 transition-colors"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    </div>
                  ) : (
                    <>
                      <div className="w-20 h-20 mx-auto mb-6 rounded-full bg-green-500/20 flex items-center justify-center">
                        <Upload className="w-10 h-10 text-green-500" />
                      </div>
                      <h3 className="text-xl font-bold mb-2">Upload Prescription</h3>
                      <p className="text-green-300/80 mb-4">
                        Drag & drop your prescription image or click to browse
                      </p>
                      <p className="text-sm text-green-300/70">
                        Supports: JPG, PNG, PDF (Max 10MB)
                      </p>
                    </>
                  )}
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/*,.pdf"
                    onChange={handleFileChange}
                    className="hidden"
                  />
                </div>

                {file && (
                  <div className="mt-4 p-4 bg-white/5 rounded-xl flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <Image className="w-5 h-5 text-green-500" />
                      <span className="text-sm">{file.name}</span>
                    </div>
                    <span className="text-xs text-green-300/70">{(file.size / 1024).toFixed(1)} KB</span>
                  </div>
                )}
              </div>
            )}

            {/* Manual Entry Section */}
            {activeTab === 'manual' && (
              <div className="max-w-2xl mx-auto">
                <div className="bg-white/5 backdrop-blur-lg rounded-3xl p-8 border border-white/10">
                  <h3 className="text-xl font-bold mb-4">Enter Medicine Names</h3>
                  <p className="text-green-300/80 text-sm mb-4">
                    Type or paste your prescription text. Include medicine names as they appear.
                  </p>
                  <textarea
                    value={manualText}
                    onChange={(e) => setManualText(e.target.value)}
                    placeholder="Example:
1. Tab Crocin 650mg - 1-0-1 x 5 days
2. Tab Augmentin 625mg - 1-1-1 x 7 days
3. Tab Pan 40mg - 1-0-0 x 10 days
4. Cap Allegra 120mg - 0-0-1 x 5 days"
                    rows={8}
                    className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl focus:border-green-500 focus:outline-none transition-colors resize-none text-white placeholder-gray-500"
                  />
                </div>
              </div>
            )}

            {/* Error Message */}
            {error && (
              <div className="max-w-2xl mx-auto mt-6">
                <div className="bg-red-500/10 border border-red-500/30 rounded-xl p-4 flex items-center gap-3">
                  <AlertCircle className="w-5 h-5 text-red-500 flex-shrink-0" />
                  <p className="text-red-400">{error}</p>
                </div>
              </div>
            )}

            {/* Analyze Button */}
            <div className="flex justify-center mt-8">
              <button
                onClick={analyzePrescription}
                disabled={loading || (!file && !manualText.trim())}
                className="px-8 py-4 bg-gradient-to-r from-green-500 to-cyan-500 rounded-xl font-bold hover:from-green-600 hover:to-cyan-600 transition-all shadow-lg shadow-green-500/30 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-3"
              >
                {loading ? (
                  <>
                    <Loader2 className="w-5 h-5 animate-spin" />
                    Analyzing...
                  </>
                ) : (
                  <>
                    <Sparkles className="w-5 h-5" />
                    Analyze & Find Alternatives
                  </>
                )}
              </button>
            </div>

            {/* Quick Search */}
            <div className="max-w-xl mx-auto mt-12">
              <div className="bg-white/5 backdrop-blur-lg rounded-2xl p-6 border border-white/10">
                <h3 className="font-bold mb-4 flex items-center gap-2">
                  <Search className="w-5 h-5 text-cyan-500" />
                  Quick Medicine Search
                </h3>
                <div className="flex gap-3">
                  <input
                    type="text"
                    value={searchMedicine}
                    onChange={(e) => setSearchMedicine(e.target.value)}
                    onKeyPress={(e) => e.key === 'Enter' && searchSingleMedicine()}
                    placeholder="Search any medicine (e.g., Crocin, Augmentin)"
                    className="flex-1 px-4 py-3 bg-white/5 border border-white/10 rounded-xl focus:border-cyan-500 focus:outline-none transition-colors"
                  />
                  <button
                    onClick={searchSingleMedicine}
                    className="px-6 py-3 bg-cyan-500 rounded-xl font-bold hover:bg-cyan-600 transition-colors"
                  >
                    Search
                  </button>
                </div>

                {searchResults && (
                  <div className="mt-4 p-4 bg-white/5 rounded-xl">
                    {searchResults.success ? (
                      <div>
                        <div className="flex items-center gap-2 mb-2">
                          <CheckCircle className="w-5 h-5 text-green-500" />
                          <span className="font-bold">{searchResults.original_medicine}</span>
                        </div>
                        <p className="text-sm text-cyan-300 mb-2">Generic: {searchResults.generic_name}</p>
                        <p className="text-sm text-cyan-300 mb-3">Category: {searchResults.category}</p>
                        <p className="text-sm text-cyan-300 mb-2">Brand Price: {searchResults.brand_price}</p>
                        <div className="mt-3">
                          <p className="text-xs text-cyan-400/80 uppercase tracking-wider mb-2">Alternatives:</p>
                          {searchResults.alternatives.map((alt, idx) => (
                            <div key={idx} className="flex items-center justify-between py-2 border-b border-white/5 last:border-0">
                              <span className="text-sm">{alt.name}</span>
                              <div className="flex items-center gap-3">
                                <span className="text-green-400 text-sm">{alt.price}</span>
                                {alt.savings && (
                                  <span className="text-xs bg-green-500/20 text-green-400 px-2 py-0.5 rounded-full">
                                    Save {alt.savings}%
                                  </span>
                                )}
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    ) : (
                      <div className="flex items-center gap-2 text-cyan-300">
                        <AlertCircle className="w-5 h-5" />
                        <span>{searchResults.message}</span>
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>
          </>
        ) : (
          /* Results Section */
          <div className="space-y-8">
            {/* Summary Card */}
            <div className="bg-gradient-to-r from-green-500/10 to-cyan-500/10 rounded-3xl p-8 border border-green-500/20">
              <div className="flex flex-col md:flex-row items-center justify-between gap-6">
                <div>
                  <h2 className="text-2xl font-bold mb-2">Analysis Complete!</h2>
                  <p className="text-cyan-300">
                    Found <span className="text-green-400 font-bold">{results.medicines_found.length}</span> medicines with alternatives
                  </p>
                </div>
                <div className="text-center">
                  <div className="flex items-center gap-2 text-4xl font-black text-green-400">
                    <TrendingDown className="w-10 h-10" />
                    {results.total_potential_savings}%
                  </div>
                  <p className="text-cyan-300 text-sm">Potential Savings</p>
                </div>
              </div>
            </div>

            {/* Recommendations */}
            {results.recommendations.length > 0 && (
              <div className="bg-white/5 backdrop-blur-lg rounded-2xl p-6 border border-white/10">
                <h3 className="font-bold mb-4">💡 Recommendations</h3>
                <div className="space-y-2">
                  {results.recommendations.map((rec, idx) => (
                    <p key={idx} className="text-cyan-200">{rec}</p>
                  ))}
                </div>
              </div>
            )}

            {/* Medicine Cards */}
            <div className="grid md:grid-cols-2 gap-6">
              {results.medicines_found.map((medicine, idx) => (
                <div 
                  key={idx}
                  className="bg-white/5 backdrop-blur-lg rounded-2xl border border-white/10 overflow-hidden hover:border-green-500/30 transition-all"
                >
                  <div className="p-6">
                    {/* Medicine Header */}
                    <div className="flex items-start justify-between mb-4">
                      <div>
                        <div className="flex items-center gap-2 mb-1">
                          <Pill className="w-5 h-5 text-green-500" />
                          <h3 className="text-xl font-bold">{medicine.original_medicine}</h3>
                        </div>
                        <p className="text-sm text-cyan-400">{medicine.generic_name}</p>
                      </div>
                      {medicine.potential_savings && (
                        <div className="px-3 py-1 bg-green-500/20 text-green-400 rounded-full text-sm font-bold">
                          Save {medicine.potential_savings}
                        </div>
                      )}
                    </div>

                    {/* Category & Price */}
                    <div className="flex items-center gap-4 mb-4 text-sm text-cyan-300">
                      <span className="px-2 py-1 bg-white/10 rounded">{medicine.category}</span>
                      <span className="flex items-center gap-1">
                        <IndianRupee className="w-3 h-3" />
                        {medicine.brand_price}
                      </span>
                    </div>

                    {/* Alternatives */}
                    <div className="space-y-3">
                      <p className="text-xs text-cyan-400 uppercase tracking-wider">Cheaper Alternatives:</p>
                      {medicine.alternatives.slice(0, 3).map((alt, altIdx) => (
                        <div 
                          key={altIdx}
                          className={`p-3 rounded-xl ${alt.savings ? 'bg-green-500/10 border border-green-500/20' : 'bg-white/5'}`}
                        >
                          <div className="flex items-center justify-between">
                            <div>
                              <p className="font-medium">{alt.name}</p>
                              <p className="text-xs text-cyan-400">{alt.manufacturer}</p>
                            </div>
                            <div className="text-right">
                              <p className="text-green-400 font-bold">{alt.price}</p>
                              {alt.savings && (
                                <p className="text-xs text-green-400">Save {alt.savings}%</p>
                              )}
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Jan Aushadhi Info */}
            <div className="bg-gradient-to-r from-orange-500/10 to-yellow-500/10 rounded-3xl p-8 border border-orange-500/20">
              <div className="flex items-start gap-4">
                <div className="p-3 bg-orange-500 rounded-xl">
                  <Building2 className="w-8 h-8" />
                </div>
                <div className="flex-1">
                  <h3 className="text-xl font-bold mb-2">🏪 Jan Aushadhi Kendras</h3>
                  <p className="text-cyan-300 mb-4">
                    Get quality generic medicines at 50-90% lower prices from government stores!
                  </p>
                  <div className="grid md:grid-cols-2 gap-4 mb-4">
                    <div className="flex items-center gap-2 text-sm text-cyan-200">
                      <CheckCircle className="w-4 h-4 text-green-500" />
                      10,000+ stores across India
                    </div>
                    <div className="flex items-center gap-2 text-sm text-cyan-200">
                      <CheckCircle className="w-4 h-4 text-green-500" />
                      WHO-GMP certified quality
                    </div>
                    <div className="flex items-center gap-2 text-sm text-cyan-200">
                      <CheckCircle className="w-4 h-4 text-green-500" />
                      1800+ medicines available
                    </div>
                    <div className="flex items-center gap-2 text-sm text-cyan-200">
                      <CheckCircle className="w-4 h-4 text-green-500" />
                      Just need valid prescription
                    </div>
                  </div>
                  <div className="flex flex-wrap gap-3">
                    <a 
                      href="https://janaushadhi.gov.in/" 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-2 px-4 py-2 bg-orange-500 rounded-lg font-medium hover:bg-orange-600 transition-colors"
                    >
                      <ExternalLink className="w-4 h-4" />
                      Find Nearest Store
                    </a>
                    <a 
                      href="tel:18001808080"
                      className="inline-flex items-center gap-2 px-4 py-2 bg-white/10 rounded-lg font-medium hover:bg-white/20 transition-colors"
                    >
                      <Phone className="w-4 h-4" />
                      1800-180-8080 (Toll Free)
                    </a>
                  </div>
                </div>
              </div>
            </div>

            {/* Actions */}
            <div className="flex justify-center gap-4">
              <button
                onClick={clearResults}
                className="px-6 py-3 bg-white/10 rounded-xl font-medium hover:bg-white/20 transition-colors"
              >
                Scan Another Prescription
              </button>
              <button
                onClick={() => window.print()}
                className="px-6 py-3 bg-gradient-to-r from-green-500 to-cyan-500 rounded-xl font-bold hover:from-green-600 hover:to-cyan-600 transition-all"
              >
                Save Results
              </button>
            </div>
          </div>
        )}

        {/* Disclaimer */}
        <div className="mt-12 text-center text-sm text-cyan-300">
          <p>⚠️ Always consult your doctor before switching medicines. This tool is for informational purposes only.</p>
        </div>
      </div>
    </div>
  );
};

export default PrescriptionScanner;

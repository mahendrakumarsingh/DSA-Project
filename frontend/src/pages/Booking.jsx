import React, { useState, useEffect } from 'react';
import axios from 'axios';

function Booking({ apiUrl }) {
  const [searchForm, setSearchForm] = useState({
    from: '',
    to: '',
    date: '',
    class: 'All Classes',
    quota: 'General'
  });

  const [suggestions, setSuggestions] = useState({ from: [], to: [] });
  const [activeInput, setActiveInput] = useState(null);
  const [trains, setTrains] = useState([]);
  const [loading, setLoading] = useState(false);
  const [hasSearched, setHasSearched] = useState(false);
  const [searchError, setSearchError] = useState('');

  // Demo Booking State
  const [bookingModal, setBookingModal] = useState({ open: false, train: null, cls: null });
  const [formData, setFormData] = useState({
    name: '',
    age: '',
    gender: 'Male',
    contact: '',
    email: '',
    isTatkal: false
  });
  const [bookingResult, setBookingResult] = useState(null);
  const [bookingLoading, setBookingLoading] = useState(false);

  // Debounced Auto-Suggest Logic using Backend Trie
  useEffect(() => {
    const fetchSuggestions = async (field, query) => {
      if (query.length < 2) {
        setSuggestions(prev => ({ ...prev, [field]: [] }));
        return;
      }
      try {
        const res = await axios.get(`${apiUrl}/stations/suggest?q=${query}`);
        setSuggestions(prev => ({ ...prev, [field]: res.data }));
      } catch (err) {
        console.error(err);
      }
    };

    const timer = setTimeout(() => {
      if (activeInput) fetchSuggestions(activeInput, searchForm[activeInput]);
    }, 300);
    return () => clearTimeout(timer);
  }, [searchForm.from, searchForm.to, activeInput, apiUrl]);

  const handleSearch = async (e) => {
    e.preventDefault();
    setLoading(true);
    setSearchError('');
    setTrains([]);
    try {
      const res = await axios.get(`${apiUrl}/trains/search`, {
        params: {
          from: searchForm.from,
          to: searchForm.to,
          date: searchForm.date
        }
      });
      setTrains(res.data);
      setHasSearched(true);
    } catch (err) {
      console.error(err);
      setSearchError(err.response?.data?.error || 'Failed to fetch trains');
      setHasSearched(true);
    } finally {
      setLoading(false);
    }
  };

  const handleSelectSuggestion = (field, station) => {
    setSearchForm(prev => ({ ...prev, [field]: `${station.code} - ${station.name}` }));
    setSuggestions(prev => ({ ...prev, [field]: [] }));
    setActiveInput(null);
  };

  const handleBookClick = (train, cls) => {
    setBookingModal({ open: true, train, cls });
    setBookingResult(null);
    setFormData({
      name: '', age: '', gender: 'Male', contact: '', email: '', isTatkal: searchForm.quota === 'Tatkal'
    });
  };

  const handleConfirmBooking = async (e) => {
    e.preventDefault();
    setBookingLoading(true);
    try {
      const payload = {
        trainId: bookingModal.train.trainId,
        journeyDate: searchForm.date || '2026-03-01',
        class: bookingModal.cls.type,
        passengers: [
          {
            name: formData.name,
            age: formData.age,
            gender: formData.gender
          }
        ]
      };
      // We also hit the advanced API in background for internal DSA system
      await axios.post(`${apiUrl}/passengers`, {
        name: formData.name,
        age: formData.age,
        gender: formData.gender,
        contact: formData.contact,
        isTatkal: formData.isTatkal
      });

      const res = await axios.post(`${apiUrl}/book`, payload);
      setBookingResult(res.data);
    } catch (err) {
      console.error("Booking Error", err);
    } finally {
      setBookingLoading(false);
    }
  };

  return (
    <div className="animate-[fadeIn_0.5s_ease-out]">
      <div className="mb-6 flex justify-between items-end">
        <div>
          <h2 className="text-3xl font-bold tracking-tight mb-1 dark:text-ocean-50">Book Your Journey</h2>
          <p className="text-slate-500 dark:text-ocean-400">Real-time seat allocation and smart WL prediction active</p>
        </div>
      </div>

      {/* SEARCH SECTION */}
      <div className="glass-card p-6 mb-8 border-t-2 border-t-ocean-500/50 relative z-20">
        <h3 className="font-bold flex items-center gap-2 mb-4 dark:text-ocean-100"><span className="material-symbols-outlined text-orange-500 text-[20px]">search</span> Search Trains</h3>

        <form onSubmit={handleSearch} className="flex flex-wrap lg:flex-nowrap gap-4 items-end">

          <div className="flex-1 min-w-[200px] relative">
            <label className="block text-xs font-bold text-slate-500 dark:text-ocean-400 uppercase tracking-wider mb-2">From Station</label>
            <div className="relative">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 material-symbols-outlined text-slate-400 text-sm">location_on</span>
              <input
                type="text"
                value={searchForm.from}
                onChange={(e) => setSearchForm({ ...searchForm, from: e.target.value })}
                onFocus={() => setActiveInput('from')}
                placeholder="e.g. NDLS - New Delhi"
                className="w-full pl-9 pr-4 py-3 bg-white dark:bg-ocean-900/60 border border-slate-200 dark:border-ocean-800 rounded-lg text-sm text-slate-700 dark:text-ocean-50 focus:ring-2 focus:ring-ocean-500 focus:outline-none"
              />
            </div>
            {/* Suggestions Overlay */}
            {activeInput === 'from' && suggestions.from.length > 0 && (
              <div className="absolute top-full mt-1 w-full bg-white dark:bg-ocean-900 border border-slate-200 dark:border-ocean-800 rounded-lg shadow-xl z-50 overflow-hidden">
                {suggestions.from.map(s => (
                  <div key={s.code} onClick={() => handleSelectSuggestion('from', s)} className="px-4 py-2 hover:bg-slate-50 dark:hover:bg-ocean-800 cursor-pointer text-sm">
                    <span className="font-bold text-slate-800 dark:text-ocean-50 mr-2">{s.code}</span>
                    <span className="text-slate-500 dark:text-ocean-300">{s.name}</span>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className="h-[46px] w-[46px] flex items-center justify-center shrink-0 mb-0.5 rounded-full border border-slate-200 dark:border-ocean-800 bg-slate-50 dark:bg-ocean-900 text-slate-400 hover:text-ocean-500 cursor-pointer shadow-sm mx-[-10px] z-10 transition-transform hover:rotate-180">
            <span className="material-symbols-outlined text-[18px]">swap_horiz</span>
          </div>

          <div className="flex-1 min-w-[200px] relative">
            <label className="block text-xs font-bold text-slate-500 dark:text-ocean-400 uppercase tracking-wider mb-2">To Station</label>
            <div className="relative">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 material-symbols-outlined text-slate-400 text-sm">near_me</span>
              <input
                type="text"
                value={searchForm.to}
                onChange={(e) => setSearchForm({ ...searchForm, to: e.target.value })}
                onFocus={() => setActiveInput('to')}
                placeholder="e.g. BCT - Mumbai"
                className="w-full pl-9 pr-4 py-3 bg-white dark:bg-ocean-900/60 border border-slate-200 dark:border-ocean-800 rounded-lg text-sm text-slate-700 dark:text-ocean-50 focus:ring-2 focus:ring-ocean-500 focus:outline-none"
              />
            </div>
            {activeInput === 'to' && suggestions.to.length > 0 && (
              <div className="absolute top-full mt-1 w-full bg-white dark:bg-ocean-900 border border-slate-200 dark:border-ocean-800 rounded-lg shadow-xl z-50 overflow-hidden">
                {suggestions.to.map(s => (
                  <div key={s.code} onClick={() => handleSelectSuggestion('to', s)} className="px-4 py-2 hover:bg-slate-50 dark:hover:bg-ocean-800 cursor-pointer text-sm">
                    <span className="font-bold text-slate-800 dark:text-ocean-50 mr-2">{s.code}</span>
                    <span className="text-slate-500 dark:text-ocean-300">{s.name}</span>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className="w-[160px]">
            <label className="block text-xs font-bold text-slate-500 dark:text-ocean-400 uppercase tracking-wider mb-2">Journey Date</label>
            <div className="relative">
              <input type="date" className="w-full px-3 py-3 bg-white dark:bg-ocean-900/60 border border-slate-200 dark:border-ocean-800 rounded-lg text-sm text-slate-700 dark:text-ocean-50 focus:ring-2 focus:ring-ocean-500 focus:outline-none appearance-none" />
            </div>
          </div>

          <div className="w-[180px]">
            <label className="block text-xs font-bold text-slate-500 dark:text-ocean-400 uppercase tracking-wider mb-2">Class & Quota</label>
            <div className="flex bg-white dark:bg-ocean-900/60 border border-slate-200 dark:border-ocean-800 rounded-lg overflow-hidden">
              <select className="w-1/2 px-2 py-3 bg-transparent text-xs font-semibold text-slate-700 dark:text-ocean-50 border-r border-slate-200 dark:border-ocean-800 focus:outline-none appearance-none">
                <option>All Class</option>
                <option>1AC</option>
                <option>2AC</option>
              </select>
              <select className="w-1/2 px-2 py-3 bg-transparent text-xs font-semibold text-slate-700 dark:text-ocean-50 focus:outline-none appearance-none">
                <option>General</option>
                <option>Tatkal</option>
              </select>
            </div>
          </div>

          <button type="submit" className="bg-orange-600 hover:bg-orange-700 text-white font-bold py-3 px-8 rounded-lg shadow-lg shadow-orange-600/20 transition-all flex items-center justify-center gap-2 h-[46px]">
            <span className="material-symbols-outlined text-[20px]">search</span>
            Find Trains
          </button>
        </form>

        <div className="mt-4 pt-3 border-t border-slate-100 dark:border-ocean-800/50 flex items-center gap-2 text-[10px] text-green-600 dark:text-green-500 font-bold uppercase tracking-wider">
          <span className="material-symbols-outlined text-[14px]">verified_user</span>
          Segment-Based Allocation active for high confirmation probability
        </div>
      </div>

      {/* Error Message */}
      {hasSearched && searchError && (
        <div className="mt-6 p-4 rounded-lg bg-red-50 border border-red-200 text-red-800 dark:bg-red-900/30 dark:border-red-800 dark:text-red-400 font-medium flex gap-2">
          <span className="material-symbols-outlined">error</span>
          {searchError}
        </div>
      )}

      {/* RESULTS LISTING */}
      {hasSearched && !loading && !searchError && (
        <div className="space-y-6 relative z-10">
          <div className="flex justify-between items-center mb-2">
            <h3 className="font-bold text-lg dark:text-ocean-50">Available Trains ({trains.length})</h3>
            <div className="flex gap-2">
              <span className="px-3 py-1 bg-slate-100 dark:bg-ocean-900/40 text-xs font-semibold rounded-full dark:text-ocean-300">Sort by: Departure</span>
              <span className="px-3 py-1 bg-slate-100 dark:bg-ocean-900/40 text-xs font-semibold rounded-full dark:text-ocean-300">Filter: Fast Trains</span>
            </div>
          </div>

          {trains.map(train => (
            <div key={train.trainId} className="glass-card p-6 border-l-4 border-l-white dark:border-l-ocean-800 hover:border-l-orange-500 transition-colors animate-[fadeIn_0.5s]">
              {/* Header Info */}
              <div className="flex flex-wrap md:flex-nowrap items-start justify-between mb-6">
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-[10px] bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400 font-bold px-2 py-0.5 rounded uppercase tracking-wider">{train.tag}</span>
                    <h4 className="text-xl font-bold dark:text-white flex items-center gap-2">{train.name}</h4>
                  </div>
                  <div className="text-xs text-slate-500 dark:text-ocean-400 font-medium">
                    Runs Daily: M T W T F S S
                  </div>
                </div>

                {/* Timeline Visualizer */}
                <div className="flex items-center gap-4 mt-4 md:mt-0 px-4 flex-1 max-w-[500px]">
                  <div className="text-center">
                    <div className="font-bold text-lg dark:text-white">{train.depTime}</div>
                    <div className="text-[10px] text-slate-500 dark:text-ocean-400 max-w-[80px] leading-tight mt-1">{train.depStation}</div>
                  </div>
                  <div className="flex-1 flex flex-col items-center">
                    <div className="text-[10px] font-semibold text-slate-400 mb-1">{train.duration}</div>
                    <div className="w-full flex items-center">
                      <div className="h-1.5 w-1.5 rounded-full bg-slate-300 dark:bg-ocean-600"></div>
                      <div className="h-px flex-1 bg-slate-300 dark:bg-ocean-700 relative border-t border-dashed border-slate-300 dark:border-ocean-600">
                        {/* Optional Intermediate stops */}
                      </div>
                      <div className="h-1.5 w-1.5 rounded-full bg-orange-500"></div>
                    </div>
                  </div>
                  <div className="text-center">
                    <div className="font-bold text-lg dark:text-white">{train.arrTime}</div>
                    <div className="text-[10px] text-slate-500 dark:text-ocean-400 max-w-[80px] leading-tight mt-1">{train.arrStation}</div>
                  </div>
                </div>
              </div>

              {/* Class Cards */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {train.classes.map((cls, idx) => (
                  <div key={idx} onClick={() => handleBookClick(train, cls)} className={`p-4 rounded-xl border relative cursor-pointer transition-all hover:-translate-y-1 ${cls.recommended ? 'bg-orange-50/30 border-orange-200 dark:bg-orange-900/10 dark:border-orange-500/50 shadow-md shadow-orange-500/5' : 'bg-white dark:bg-ocean-900/40 border-slate-200 dark:border-ocean-800'}`}>
                    <div className="flex justify-between items-center mb-4">
                      <span className="font-bold text-sm text-slate-700 dark:text-ocean-100">{cls.type}</span>
                      <span className="font-bold text-orange-600 dark:text-orange-400">₹{cls.price.toLocaleString()}</span>
                    </div>

                    <div className={`font-bold text-sm flex items-center gap-1.5 ${cls.color === 'green' ? 'text-green-600 dark:text-green-500' : cls.color === 'orange' ? 'text-orange-500' : 'text-red-500'}`}>
                      <span className="h-2 w-2 rounded-full mb-0.5" style={{ backgroundColor: cls.color === 'green' ? '#10b981' : cls.color === 'orange' ? '#f97316' : '#ef4444' }}></span>
                      {cls.status}
                    </div>

                    {/* Smart Predictor */}
                    {cls.hasPredictor && (
                      <div className="mt-3 p-2 bg-slate-50 dark:bg-ocean-950/50 rounded text-[10px] leading-snug border border-slate-100 dark:border-ocean-800/50">
                        <div className="font-bold text-orange-600 dark:text-orange-400 uppercase tracking-wider mb-0.5">Smart Predictor</div>
                        <div className="text-slate-600 dark:text-ocean-300 font-medium">
                          <span className={`font-bold ${cls.prob > 80 ? 'text-green-600 dark:text-green-500' : cls.prob > 40 ? 'text-orange-500' : 'text-red-500'}`}>{cls.prob}% Confirmation</span> Probability
                        </div>
                      </div>
                    )}

                    {cls.recommended && (
                      <div className="absolute -top-2.5 left-4 px-2 py-0.5 bg-orange-500 text-white text-[9px] font-bold tracking-widest uppercase rounded shadow-sm">
                        Recommended
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          ))}

          {/* Ad / Marketing Banner */}
          <div className="mt-8 bg-gradient-to-r from-slate-900 to-ocean-950 rounded-xl p-6 flex items-center justify-between text-white shadow-xl">
            <div className="flex items-center gap-4">
              <div className="h-12 w-12 rounded-full bg-orange-500/20 text-orange-500 flex items-center justify-center">
                <span className="material-symbols-outlined">verified</span>
              </div>
              <div>
                <h4 className="font-bold text-lg">Why book with IR Connect Pro?</h4>
                <p className="text-sm text-slate-300">We process 400+ segment allocations per minute for the highest seat probability.</p>
              </div>
            </div>
            <div className="flex gap-8 text-center hidden md:flex">
              <div>
                <div className="font-bold text-2xl">98.4%</div>
                <div className="text-[10px] uppercase tracking-widest text-slate-400 font-bold">Prediction Accuracy</div>
              </div>
              <div>
                <div className="font-bold text-2xl">Instant</div>
                <div className="text-[10px] uppercase tracking-widest text-slate-400 font-bold">Refund Processing</div>
              </div>
            </div>
          </div>

        </div>
      )}

      {/* Booking Modal */}
      {bookingModal.open && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white dark:bg-ocean-900 rounded-xl shadow-2xl w-full max-w-xl overflow-hidden flex flex-col max-h-[90vh]">
            <div className="p-5 border-b border-slate-200 dark:border-ocean-800 flex justify-between items-center bg-slate-50 dark:bg-ocean-900/50">
              <h3 className="font-bold text-lg dark:text-ocean-50">Demo Booking System</h3>
              <button onClick={() => setBookingModal({ open: false, train: null, cls: null })} className="text-slate-400 hover:text-red-500">
                <span className="material-symbols-outlined">close</span>
              </button>
            </div>

            <div className="p-6 overflow-y-auto">
              <div className="bg-orange-50 dark:bg-orange-900/20 border-l-4 border-orange-500 p-3 mb-6 rounded text-sm text-orange-800 dark:text-orange-300 font-medium flex gap-2">
                <span className="material-symbols-outlined text-orange-500">warning</span>
                ⚠️ This is a demo booking system. Not affiliated with IRCTC.
              </div>

              {bookingResult ? (
                <div className="text-center py-8 animate-[fadeIn_0.5s]">
                  <div className="h-16 w-16 bg-green-100 text-green-600 rounded-full flex items-center justify-center mx-auto mb-4">
                    <span className="material-symbols-outlined text-3xl">check_circle</span>
                  </div>
                  <h4 className="text-2xl font-bold dark:text-white mb-2">{bookingResult.message}</h4>
                  <div className="inline-block bg-slate-100 dark:bg-ocean-800 rounded-lg p-4 mt-4 text-left">
                    <div className="flex justify-between border-b border-slate-200 dark:border-ocean-700 pb-2 mb-2 gap-8">
                      <span className="text-slate-500 dark:text-ocean-400 text-sm">PNR Number:</span>
                      <span className="font-bold text-ocean-600 dark:text-ocean-300">{bookingResult.pnr}</span>
                    </div>
                    <div className="flex justify-between border-b border-slate-200 dark:border-ocean-700 pb-2 mb-2 gap-8">
                      <span className="text-slate-500 dark:text-ocean-400 text-sm">Status:</span>
                      <span className={`font-bold ${bookingResult.status === 'CONFIRMED' ? 'text-green-600' : 'text-orange-500'}`}>{bookingResult.status}</span>
                    </div>
                    <div className="flex justify-between gap-8">
                      <span className="text-slate-500 dark:text-ocean-400 text-sm">Seat Allocation:</span>
                      <span className="font-bold">{bookingResult.seatNumber}</span>
                    </div>
                  </div>
                  <div className="mt-8">
                    <button onClick={() => setBookingModal({ open: false, train: null, cls: null })} className="bg-ocean-600 hover:bg-ocean-700 text-white px-6 py-2 rounded-lg font-bold">Close</button>
                  </div>
                </div>
              ) : (
                <form onSubmit={handleConfirmBooking} className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Passenger Name *</label>
                      <input required type="text" value={formData.name} onChange={e => setFormData({ ...formData, name: e.target.value })} className="w-full px-3 py-2 border rounded-lg dark:bg-ocean-900 dark:border-ocean-700" placeholder="Full Name" />
                    </div>
                    <div className="grid grid-cols-2 gap-2">
                      <div>
                        <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Age *</label>
                        <input required type="number" value={formData.age} onChange={e => setFormData({ ...formData, age: e.target.value })} className="w-full px-3 py-2 border rounded-lg dark:bg-ocean-900 dark:border-ocean-700" placeholder="Yrs" />
                      </div>
                      <div>
                        <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Gender *</label>
                        <select value={formData.gender} onChange={e => setFormData({ ...formData, gender: e.target.value })} className="w-full px-3 py-2 border rounded-lg dark:bg-ocean-900 dark:border-ocean-700">
                          <option>Male</option>
                          <option>Female</option>
                          <option>Other</option>
                        </select>
                      </div>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Class</label>
                      <input disabled type="text" value={bookingModal.cls.type} className="w-full px-3 py-2 border rounded-lg bg-slate-100 text-slate-500 dark:bg-ocean-800 dark:border-ocean-700" />
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Quota</label>
                      <select value={formData.isTatkal ? 'Tatkal' : 'General'} onChange={e => setFormData({ ...formData, isTatkal: e.target.value === 'Tatkal' })} className="w-full px-3 py-2 border rounded-lg dark:bg-ocean-900 dark:border-ocean-700">
                        <option>General</option>
                        <option>Tatkal</option>
                      </select>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Mobile Number *</label>
                      <input required type="tel" value={formData.contact} onChange={e => setFormData({ ...formData, contact: e.target.value })} className="w-full px-3 py-2 border rounded-lg dark:bg-ocean-900 dark:border-ocean-700" placeholder="10 digits" />
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Email</label>
                      <input type="email" value={formData.email} onChange={e => setFormData({ ...formData, email: e.target.value })} className="w-full px-3 py-2 border rounded-lg dark:bg-ocean-900 dark:border-ocean-700" placeholder="Optional" />
                    </div>
                  </div>

                  <div className="pt-4 border-t border-slate-200 dark:border-ocean-800 mt-6 text-right">
                    <button type="submit" disabled={bookingLoading} className="bg-orange-600 hover:bg-orange-700 text-white font-bold py-3 px-8 rounded-lg shadow-lg flex items-center justify-center gap-2 ml-auto disabled:opacity-50">
                      {bookingLoading ? 'Processing...' : '👉 Confirm Booking'}
                    </button>
                  </div>
                </form>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default Booking;

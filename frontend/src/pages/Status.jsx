import React, { useState } from 'react';
import axios from 'axios';

function Status({ apiUrl }) {
  const [pnr, setPnr] = useState('');
  const [ticketData, setTicketData] = useState(null);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSearch = async (e) => {
    e.preventDefault();
    if (!pnr.trim()) return setError('Please enter a PNR');

    setLoading(true);
    setError('');
    setTicketData(null);

    try {
      const res = await axios.post(`${apiUrl}/pnr-status`, { pnr: pnr.trim() });
      setTicketData(res.data);
    } catch (err) {
      setTicketData(null);
      setError(err.response?.data?.error || 'PNR Not Found');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="animate-[fadeIn_0.5s_ease-out]">
      <div className="mb-6">
        <h2 className="text-3xl font-bold tracking-tight mb-1 dark:text-ocean-50">Check PNR Status</h2>
        <p className="text-slate-500 dark:text-ocean-400">Track your booking status in real-time</p>
      </div>

      <div className="glass-card p-6 mb-8 border-t-2 border-t-ocean-500/50 max-w-2xl">
        <form onSubmit={handleSearch} className="flex gap-4 items-end">
          <div className="flex-1">
            <label className="block text-xs font-bold text-slate-500 dark:text-ocean-400 uppercase tracking-wider mb-2">PNR Number</label>
            <div className="relative">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 material-symbols-outlined text-slate-400 text-sm">confirmation_number</span>
              <input
                type="text"
                value={pnr}
                onChange={(e) => setPnr(e.target.value)}
                placeholder="Enter 10-digit PNR..."
                className="w-full pl-9 pr-4 py-3 bg-white dark:bg-ocean-900/60 border border-slate-200 dark:border-ocean-800 rounded-lg text-sm text-slate-700 dark:text-ocean-50 focus:ring-2 focus:ring-ocean-500 focus:outline-none"
              />
            </div>
          </div>
          <button type="submit" disabled={loading} className="bg-ocean-600 hover:bg-ocean-700 text-white font-bold py-3 px-8 rounded-lg shadow-lg transition-all h-[46px] disabled:opacity-50">
            {loading ? 'Checking...' : 'Check Status'}
          </button>
        </form>

        {error && (
          <div className="mt-6 p-4 rounded-lg bg-red-50 border border-red-200 text-red-800 dark:bg-red-900/30 dark:border-red-800 dark:text-red-400 font-medium flex gap-2">
            <span className="material-symbols-outlined">error</span>
            {error}
          </div>
        )}

        {ticketData && (
          <div className="mt-8 bg-white dark:bg-ocean-900/40 rounded-xl border border-slate-200 dark:border-ocean-800 overflow-hidden animate-[fadeIn_0.5s]">
            <div className="p-4 bg-slate-50 dark:bg-ocean-900/50 border-b border-slate-200 dark:border-ocean-800 flex justify-between items-center">
              <div className="flex items-center gap-2">
                <span className={`px-2 py-0.5 text-[10px] font-bold uppercase rounded ${ticketData.source === 'IRCTC' ? 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400' : 'bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-400'}`}>
                  {ticketData.source} DataSource
                </span>
                <span className="text-sm font-bold text-slate-600 dark:text-ocean-300">PNR: {ticketData.pnr}</span>
              </div>
              <div className={`px-3 py-1 rounded-full text-xs font-bold ${ticketData.status.includes('CONFIRMED') || ticketData.status === 'CNF' ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400 outline outline-1 outline-green-500' : 'bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-400 outline outline-1 outline-orange-500'}`}>
                {ticketData.status.toUpperCase()}
              </div>
            </div>

            <div className="p-6">
              <div className="grid grid-cols-2 gap-6 mb-6">
                <div>
                  <label className="block text-[10px] font-bold text-slate-500 dark:text-ocean-400 uppercase tracking-widest mb-1">Status</label>
                  <div className="text-lg font-bold dark:text-ocean-50">{ticketData.status}</div>
                </div>
                <div>
                  <label className="block text-[10px] font-bold text-slate-500 dark:text-ocean-400 uppercase tracking-widest mb-1">Coach / Seat / Pos</label>
                  <div className="text-lg font-bold dark:text-ocean-50">{ticketData.seatNumber || ticketData.coach || '-'}</div>
                </div>
                <div>
                  <label className="block text-[10px] font-bold text-slate-500 dark:text-ocean-400 uppercase tracking-widest mb-1">Train Info</label>
                  <div className="text-sm font-semibold text-slate-700 dark:text-ocean-100">{ticketData.trainId || ticketData.trainDetails?.trainName || 'N/A'}</div>
                </div>
                <div>
                  <label className="block text-[10px] font-bold text-slate-500 dark:text-ocean-400 uppercase tracking-widest mb-1">Journey Date</label>
                  <div className="text-sm font-semibold text-slate-700 dark:text-ocean-100">{ticketData.journeyDate || ticketData.trainDetails?.dateOfJourney || 'N/A'}</div>
                </div>
              </div>

              <div className="text-[10px] text-slate-400 dark:text-ocean-500 font-mono italic text-right border-t border-slate-100 dark:border-ocean-800/50 pt-3">
                {ticketData.message} • Last Updated: {new Date().toLocaleTimeString()}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default Status;

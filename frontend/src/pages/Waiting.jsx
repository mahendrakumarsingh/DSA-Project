import React, { useEffect, useState } from 'react';
import axios from 'axios';

function Waiting({ apiUrl }) {
  const [passengers, setPassengers] = useState([]);

  const fetchPassengers = async () => {
    try {
      const res = await axios.get(`${apiUrl}/passengers/waiting`);
      setPassengers(res.data);
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    fetchPassengers();
    const interval = setInterval(fetchPassengers, 5000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="animate-[fadeIn_0.4s_ease-out]">
      <header className="mb-8">
        <h2 className="text-3xl font-bold tracking-tight mb-1 dark:text-ocean-50">Smart WL Predictor (Waiting List)</h2>
        <p className="text-slate-500 dark:text-ocean-400 flex items-center gap-2">
          <span className="material-symbols-outlined text-sm">analytics</span>
          Real-time Priority Queue (Max-Heap Algorithm Active)
        </p>
      </header>

      <div className="glass-card p-6 border-t-4 border-t-amber-500 mb-8">
        <div className="flex items-start gap-4">
          <div className="w-12 h-12 rounded-full bg-amber-100 dark:bg-amber-900/40 text-amber-600 flex items-center justify-center shrink-0">
            <span className="material-symbols-outlined text-2xl">hardware</span>
          </div>
          <div>
            <h3 className="font-bold text-lg text-slate-800 dark:text-ocean-50 mb-1">Priority Logic Active</h3>
            <p className="text-sm text-slate-600 dark:text-ocean-300 mb-3">Waitlist positions are evaluated instantly when seats become available via Max-Heap extraction.</p>
            <div className="flex flex-wrap gap-3">
              <span className="px-2.5 py-1 bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400 text-xs font-bold rounded flex items-center gap-1.5"><span className="material-symbols-outlined text-[14px]">star</span> Senior Citizens (60+) First</span>
              <span className="px-2.5 py-1 bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400 text-xs font-bold rounded flex items-center gap-1.5"><span className="material-symbols-outlined text-[14px]">bolt</span> Tatkal Quota Next</span>
              <span className="px-2.5 py-1 bg-slate-100 text-slate-700 dark:bg-ocean-900/40 dark:text-ocean-300 text-xs font-bold rounded flex items-center gap-1.5"><span className="material-symbols-outlined text-[14px]">schedule</span> Standard FIFO Time Finally</span>
            </div>
          </div>
        </div>
      </div>

      <div className="glass-card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50 dark:bg-ocean-900/50 border-b border-slate-200 dark:border-ocean-800">
                <th className="p-4 text-xs font-bold text-slate-500 dark:text-ocean-400 uppercase tracking-wider">WL Pos</th>
                <th className="p-4 text-xs font-bold text-slate-500 dark:text-ocean-400 uppercase tracking-wider">PNR</th>
                <th className="p-4 text-xs font-bold text-slate-500 dark:text-ocean-400 uppercase tracking-wider">Name</th>
                <th className="p-4 text-xs font-bold text-slate-500 dark:text-ocean-400 uppercase tracking-wider">Age</th>
                <th className="p-4 text-xs font-bold text-slate-500 dark:text-ocean-400 uppercase tracking-wider">Gender</th>
                <th className="p-4 text-xs font-bold text-slate-500 dark:text-ocean-400 uppercase tracking-wider">Tags / Priority</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-ocean-900/50">
              {passengers.length > 0 ? (
                passengers.map((p, index) => {
                  const isSenior = p.age >= 60;
                  const isTatkal = p.isTatkal;
                  const isPriority = isSenior || isTatkal;

                  return (
                    <tr key={p.pnr} className={`transition-colors hover:bg-slate-50 dark:hover:bg-ocean-900/20 ${isPriority ? 'bg-amber-50/50 dark:bg-amber-900/10' : ''}`}>
                      <td className="p-4">
                        <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold shadow-sm ${index < 3 ? 'bg-amber-500 text-white dark:bg-amber-600' : 'bg-slate-100 text-slate-600 dark:bg-ocean-900/50 dark:text-ocean-300 border border-slate-200 dark:border-ocean-800'}`}>
                          {index + 1}
                        </div>
                      </td>
                      <td className="p-4 font-mono text-sm text-slate-500 dark:text-ocean-400">{p.pnr}</td>
                      <td className={`p-4 text-sm ${isPriority ? 'font-bold text-slate-800 dark:text-ocean-50' : 'text-slate-700 dark:text-ocean-100'}`}>
                        {p.name}
                      </td>
                      <td className={`p-4 text-sm ${isSenior ? 'text-amber-600 dark:text-amber-400 font-bold' : 'text-slate-600 dark:text-ocean-200'}`}>
                        {p.age}
                      </td>
                      <td className="p-4 text-sm text-slate-600 dark:text-ocean-200">{p.gender}</td>
                      <td className="p-4">
                        <div className="flex gap-2">
                          {isSenior && <span className="text-[10px] px-2 py-0.5 bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400 rounded flex items-center gap-1 font-bold uppercase"><span className="material-symbols-outlined text-[12px]">star</span> Senior</span>}
                          {isTatkal && <span className="text-[10px] px-2 py-0.5 bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400 rounded flex items-center gap-1 font-bold uppercase"><span className="material-symbols-outlined text-[12px]">bolt</span> Tatkal</span>}
                          {!isPriority && <span className="text-[10px] text-slate-400 dark:text-ocean-500 uppercase font-medium">Standard</span>}
                        </div>
                      </td>
                    </tr>
                  );
                })
              ) : (
                <tr>
                  <td colSpan="6" className="p-8 text-center text-slate-500 dark:text-ocean-400 text-sm">
                    Waiting list is empty. Currently serving all confirmed capacities.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

export default Waiting;

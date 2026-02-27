import React, { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import Chart from 'chart.js/auto';

function Home({ apiUrl, onRefresh, stats }) {
  const [capacity, setCapacity] = useState('10');
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(false);
  const chartRef = useRef(null);
  const chartInstance = useRef(null);

  useEffect(() => {
    if (chartRef.current) {
      const ctx = chartRef.current.getContext('2d');
      const gradient = ctx.createLinearGradient(0, 0, 0, 400);
      gradient.addColorStop(0, 'rgba(12, 74, 110, 0.6)');
      gradient.addColorStop(1, 'rgba(12, 74, 110, 0)');

      if (chartInstance.current) {
        chartInstance.current.destroy();
      }

      chartInstance.current = new Chart(ctx, {
        type: 'line',
        data: {
          labels: ['00:00', '03:00', '06:00', '09:00', '12:00', '15:00', '18:00', '21:00'],
          datasets: [{
            label: 'Bookings per Hour',
            data: [120, 80, 450, 920, 1100, 750, 890, 400],
            borderColor: '#0284C7',
            backgroundColor: gradient,
            fill: true,
            tension: 0.4,
            borderWidth: 3,
            pointRadius: 4,
            pointBackgroundColor: '#fff',
            pointBorderColor: '#0284C7',
            pointBorderWidth: 2
          }]
        },
        options: {
          responsive: true,
          maintainAspectRatio: false,
          plugins: {
            legend: {
              display: false
            }
          },
          scales: {
            y: {
              beginAtZero: true,
              grid: {
                color: 'rgba(200, 200, 200, 0.05)'
              },
              ticks: {
                color: '#64748b',
                font: {
                  size: 10,
                  family: 'JetBrains Mono'
                }
              }
            },
            x: {
              grid: {
                display: false
              },
              ticks: {
                color: '#64748b',
                font: {
                  size: 10,
                  family: 'JetBrains Mono'
                }
              }
            }
          }
        }
      });
    }

    return () => {
      if (chartInstance.current) {
        chartInstance.current.destroy();
      }
    };
  }, []);

  const handleSetCapacity = async () => {
    setLoading(true);
    try {
      const res = await axios.put(`${apiUrl}/capacity`, {
        capacity: Number(capacity)
      });
      setMessage(`✅ ${res.data.message} (${res.data.promoted} promoted)`);
      onRefresh();
      setTimeout(() => setMessage(''), 3000);
    } catch (err) {
      setMessage(`❌ ${err.response?.data?.error || 'Error'}`);
    }
    setLoading(false);
  };

  const handleSeedDemo = async () => {
    setLoading(true);
    try {
      const res = await axios.post(`${apiUrl}/seed`);
      setMessage(`✅ ${res.data.count} passengers seeded`);
      onRefresh();
      setTimeout(() => setMessage(''), 3000);
    } catch (err) {
      setMessage(`❌ ${err.response?.data?.error || err.message || 'Error seeding data'}`);
    }
    setLoading(false);
  };

  const handleReset = async () => {
    if (!window.confirm('Are you sure you want to reset all system data?')) return;
    setLoading(true);
    try {
      const res = await axios.post(`${apiUrl}/reset`);
      setMessage(`✅ ${res.data.message}`);
      onRefresh();
      setTimeout(() => setMessage(''), 3000);
    } catch (err) {
      setMessage(`❌ ${err.response?.data?.error || err.message || 'Error resetting data'}`);
    }
    setLoading(false);
  };

  return (
    <>
      <header className="mb-8 flex justify-between items-end">
        <div>
          <h2 className="text-3xl font-bold tracking-tight mb-1 dark:text-ocean-50">Dashboard Overview</h2>
          <p className="text-slate-500 dark:text-ocean-400 flex items-center gap-2">
            <span className="material-symbols-outlined text-sm">rocket_launch</span>
            Smart Railway Engine System Configuration & Health Status
          </p>
        </div>
        <div className="flex gap-2">
          <button className="flex items-center gap-2 px-4 py-2 bg-white dark:bg-ocean-900/50 border border-slate-200 dark:border-ocean-800 rounded-lg text-sm font-medium hover:bg-slate-50 dark:hover:bg-ocean-800 transition-colors">
            <span className="material-symbols-outlined text-sm">cloud_download</span> Export Report
          </button>
          <button onClick={onRefresh} className="flex items-center gap-2 px-4 py-2 bg-ocean-700 text-white rounded-lg text-sm font-medium shadow-lg shadow-ocean-900/20 hover:bg-ocean-600 transition-colors">
            <span className="material-symbols-outlined text-sm">refresh</span> Refresh System
          </button>
        </div>
      </header>

      {message && (
        <div className={`mb-6 p-4 rounded-lg font-medium shadow-sm transition-all border ${message.includes('✅') ? 'bg-teal-50 border-teal-200 text-teal-800 dark:bg-teal-900/30 dark:border-teal-800' : 'bg-red-50 border-red-200 text-red-800 dark:bg-red-900/30 dark:border-red-800'}`}>
          {message}
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <div className="glass-card p-6">
          <div className="flex justify-between items-start mb-4">
            <p className="text-xs font-bold text-slate-500 dark:text-ocean-400 uppercase tracking-widest">Total Capacity</p>
            <span className="material-symbols-outlined text-slate-300 dark:text-ocean-700">event_seat</span>
          </div>
          <div className="flex items-baseline gap-2">
            <h3 className="text-3xl font-bold font-mono dark:text-ocean-50">{stats?.capacity || 0}</h3>
            <span className="text-xs font-semibold text-slate-400 dark:text-ocean-500">Seats</span>
          </div>
        </div>

        <div className="glass-card p-6 border-l-4 border-l-teal-500">
          <div className="flex justify-between items-start mb-4">
            <p className="text-xs font-bold text-slate-500 dark:text-ocean-400 uppercase tracking-widest">Available Seats</p>
            <span className="material-symbols-outlined text-teal-500">check_circle</span>
          </div>
          <div className="flex items-baseline gap-2">
            <h3 className="text-3xl font-bold font-mono text-teal-600 dark:text-teal-400">{stats?.available || 0}</h3>
            <span className="text-xs font-semibold text-teal-600/60 dark:text-teal-400/60">Across Classes</span>
          </div>
        </div>

        <div className="glass-card p-6 border-l-4 border-l-amber-500">
          <div className="flex justify-between items-start mb-4">
            <p className="text-xs font-bold text-slate-500 dark:text-ocean-400 uppercase tracking-widest">Active Waiting List</p>
            <span className="material-symbols-outlined text-amber-500">hourglass_empty</span>
          </div>
          <div className="flex items-baseline gap-2">
            <h3 className="text-3xl font-bold font-mono text-amber-600 dark:text-amber-400">{stats?.waiting || 0}</h3>
            <span className="text-xs font-semibold text-amber-600/60 dark:text-amber-400/60">Pending</span>
          </div>
        </div>

        <div className="glass-card p-6 border-l-4 border-l-ocean-600">
          <div className="flex justify-between items-start mb-4">
            <p className="text-xs font-bold text-slate-500 dark:text-ocean-400 uppercase tracking-widest">Confirmed</p>
            <span className="material-symbols-outlined text-ocean-600">local_activity</span>
          </div>
          <div className="flex items-baseline gap-2">
            <h3 className="text-3xl font-bold font-mono text-ocean-700 dark:text-ocean-400">{stats?.confirmed || 0}</h3>
            <span className="text-xs font-semibold text-ocean-700/60 dark:text-ocean-400/60">Tickets</span>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-8">
        <div className="glass-card lg:col-span-1">
          <div className="p-5 border-b border-slate-200 dark:border-ocean-900 bg-slate-50/50 dark:bg-ocean-900/50 flex justify-between items-center">
            <h4 className="font-semibold flex items-center gap-2 dark:text-ocean-100">
              <span className="material-symbols-outlined text-ocean-500">psychology</span>
              System Config
            </h4>
            <span className="px-2 py-0.5 bg-ocean-100 dark:bg-ocean-800 text-ocean-700 dark:text-ocean-300 text-[10px] font-bold rounded uppercase">Admin</span>
          </div>
          <div className="p-6">
            <div className="mb-6">
              <label className="block text-xs font-bold text-slate-500 dark:text-ocean-400 uppercase tracking-widest mb-2">Train System Capacity</label>
              <div className="flex gap-2">
                <input
                  type="number"
                  value={capacity}
                  onChange={e => setCapacity(e.target.value)}
                  min="1"
                  className="w-full text-sm bg-slate-50 dark:bg-ocean-900/40 border border-slate-200 dark:border-ocean-800 rounded-lg px-3 py-2 text-slate-700 dark:text-ocean-50 focus:outline-none focus:ring-2 focus:ring-ocean-500 transition-shadow"
                />
                <button
                  onClick={handleSetCapacity}
                  disabled={loading}
                  className="px-4 py-2 bg-ocean-600 text-white text-sm font-medium rounded-lg hover:bg-ocean-700 transition-colors disabled:opacity-50"
                >
                  Update
                </button>
              </div>
            </div>

            <div className="space-y-3">
              <button
                onClick={handleSeedDemo}
                disabled={loading}
                className="w-full py-2.5 bg-teal-500/10 text-teal-700 dark:text-teal-400 dark:bg-teal-500/20 border border-teal-200 dark:border-teal-800/50 rounded-lg text-sm font-bold hover:bg-teal-500/20 transition-colors flex items-center justify-center gap-2"
              >
                <span className="material-symbols-outlined text-[18px]">data_array</span>
                Seed Test Data
              </button>
              <button
                onClick={handleReset}
                disabled={loading}
                className="w-full py-2.5 bg-red-500/10 text-red-700 dark:text-red-400 dark:bg-red-500/20 border border-red-200 dark:border-red-800/50 rounded-lg text-sm font-bold hover:bg-red-500/20 transition-colors flex items-center justify-center gap-2"
              >
                <span className="material-symbols-outlined text-[18px]">delete_forever</span>
                Reset System
              </button>
            </div>
          </div>
        </div>

        <div className="glass-card lg:col-span-2">
          <div className="p-5 border-b border-slate-200 dark:border-ocean-900 bg-slate-50/50 dark:bg-ocean-900/50 flex justify-between items-center">
            <h4 className="font-semibold flex items-center gap-2 dark:text-ocean-100">
              <span className="material-symbols-outlined text-ocean-500">grid_on</span>
              Dynamic Seat Allocation Heatmap
            </h4>
            <div className="flex items-center gap-4">
              <select className="text-xs bg-transparent border border-slate-300 dark:border-ocean-700 text-slate-600 dark:text-ocean-300 rounded-md focus:ring-ocean-500 py-1 pl-2 pr-8">
                <option>Coach A1 (AC 2-Tier)</option>
                <option>Coach B1 (AC 3-Tier)</option>
                <option>Coach S1 (Sleeper)</option>
              </select>
            </div>
          </div>
          <div className="p-6">
            <div className="flex gap-4 mb-6 text-[10px] font-bold uppercase tracking-wider text-slate-500 dark:text-ocean-500">
              <div className="flex items-center gap-2"><div className="w-3 h-3 bg-teal-500 rounded-sm"></div> Available</div>
              <div className="flex items-center gap-2"><div className="w-3 h-3 bg-ocean-600 rounded-sm"></div> Booked</div>
              <div className="flex items-center gap-2"><div className="w-3 h-3 bg-amber-500 rounded-sm"></div> Quota</div>
              <div className="flex items-center gap-2"><div className="w-3 h-3 bg-slate-200 dark:bg-ocean-800 rounded-sm"></div> Setup</div>
            </div>

            <div className="overflow-x-auto pb-4">
              <div className="min-w-[500px] flex flex-col gap-2">
                <div className="flex gap-2 justify-center">
                  <div className="flex gap-1 bg-slate-50 dark:bg-ocean-900/30 p-2 rounded border border-slate-100 dark:border-ocean-900/50">
                    <div className="seat bg-ocean-600"></div><div className="seat bg-ocean-600"></div><div className="seat bg-teal-500"></div><div className="seat bg-ocean-600"></div><div className="seat bg-teal-500"></div><div class="seat bg-ocean-600"></div><div className="seat bg-ocean-600"></div><div className="seat bg-ocean-600"></div><div className="seat bg-teal-500"></div><div className="seat bg-ocean-600"></div>
                  </div>
                </div>
                <div className="h-6 flex items-center justify-center text-[10px] text-slate-400 dark:text-ocean-700 font-mono tracking-[1em] py-2">AISLE</div>
                <div className="flex gap-2 justify-center">
                  <div className="flex gap-1 bg-slate-50 dark:bg-ocean-900/30 p-2 rounded border border-slate-100 dark:border-ocean-900/50">
                    <div className="seat bg-amber-500"></div><div className="seat bg-ocean-600"></div><div className="seat bg-ocean-600"></div><div className="seat bg-ocean-600"></div><div className="seat bg-ocean-600"></div><div className="seat bg-teal-500"></div><div className="seat bg-teal-500"></div><div className="seat bg-amber-500"></div><div className="seat bg-ocean-600"></div><div className="seat bg-ocean-600"></div>
                  </div>
                </div>
              </div>
            </div>
            <p className="mt-4 text-[10px] text-slate-400 dark:text-ocean-700 italic font-mono uppercase tracking-widest text-right">Real-time Visualization Core v2.0</p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="glass-card lg:col-span-2">
          <div className="p-5 border-b border-slate-200 dark:border-ocean-900 bg-slate-50/50 dark:bg-ocean-900/50 flex justify-between items-center">
            <h4 className="font-semibold flex items-center gap-2 dark:text-ocean-100">
              <span className="material-symbols-outlined text-ocean-500">trending_up</span>
              Real-time Booking Velocity
            </h4>
            <span className="text-xs text-slate-500 dark:text-ocean-400 font-medium">Last 24 Hours</span>
          </div>
          <div className="p-6 h-[250px] relative">
            <canvas ref={chartRef}></canvas>
          </div>
        </div>

        <div className="glass-card lg:col-span-1">
          <div className="p-5 border-b border-slate-200 dark:border-ocean-900 bg-slate-50/50 dark:bg-ocean-900/50 flex justify-between items-center">
            <h4 className="font-semibold flex items-center gap-2 dark:text-ocean-100">
              <span className="material-symbols-outlined text-ocean-500">settings_suggest</span>
              DSA Engine Status
            </h4>
          </div>
          <div className="p-0">
            <ul className="divide-y divide-slate-100 dark:divide-ocean-900">
              <li className="p-4 flex items-center justify-between hover:bg-slate-50 dark:hover:bg-ocean-900/20 transition-colors">
                <div className="flex items-center gap-3">
                  <div className="bg-ocean-100 dark:bg-ocean-900/50 p-2 rounded-lg text-ocean-700 dark:text-ocean-400">
                    <span className="material-symbols-outlined text-sm">account_tree</span>
                  </div>
                  <div>
                    <p className="text-sm font-semibold dark:text-ocean-100">Max-Heap</p>
                    <p className="text-[10px] text-slate-500 dark:text-ocean-500 font-mono">WL Priority Queue</p>
                  </div>
                </div>
                <span className="px-2 py-0.5 bg-teal-100 dark:bg-teal-900/30 text-teal-700 dark:text-teal-400 text-[10px] font-bold rounded">ACTIVE</span>
              </li>
              <li className="p-4 flex items-center justify-between hover:bg-slate-50 dark:hover:bg-ocean-900/20 transition-colors">
                <div className="flex items-center gap-3">
                  <div className="bg-amber-100 dark:bg-amber-900/20 p-2 rounded-lg text-amber-600">
                    <span className="material-symbols-outlined text-sm">search_check</span>
                  </div>
                  <div>
                    <p className="text-sm font-semibold dark:text-ocean-100">BST</p>
                    <p className="text-[10px] text-slate-500 dark:text-ocean-500 font-mono">PNR Search Index</p>
                  </div>
                </div>
                <span className="px-2 py-0.5 bg-teal-100 dark:bg-teal-900/30 text-teal-700 dark:text-teal-400 text-[10px] font-bold rounded">SYNCED</span>
              </li>
              <li className="p-4 flex items-center justify-between hover:bg-slate-50 dark:hover:bg-ocean-900/20 transition-colors">
                <div className="flex items-center gap-3">
                  <div className="bg-slate-100 dark:bg-ocean-900/30 p-2 rounded-lg text-slate-600 dark:text-ocean-600">
                    <span className="material-symbols-outlined text-sm">history</span>
                  </div>
                  <div>
                    <p className="text-sm font-semibold dark:text-ocean-100">Stack / Undo</p>
                    <p className="text-[10px] text-slate-500 dark:text-ocean-500 font-mono">Rollback History</p>
                  </div>
                </div>
                <span className="px-2 py-0.5 bg-slate-100 dark:bg-ocean-900 text-slate-500 text-[10px] font-bold rounded italic">IDLE</span>
              </li>
            </ul>
          </div>
        </div>
      </div>
    </>
  );
}

export default Home;

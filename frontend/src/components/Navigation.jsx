import React from 'react';

function Navigation({ currentPage, setCurrentPage }) {
  const mainLinks = [
    { id: 'home', label: 'Dashboard', icon: 'dashboard' },
    { id: 'booking', label: 'Book Ticket', icon: 'confirmation_number' },
    { id: 'status', label: 'PNR Status', icon: 'search' },
  ];

  const coreLinks = [
    { id: 'waiting', label: 'Smart WL Predictor', icon: 'analytics' },
    { id: 'dsa', label: 'Dynamic Seat Engine', icon: 'airline_seat_recline_extra' },
    { id: 'confirmed', label: 'Confirmed List', icon: 'local_activity' },
    { id: 'cancellation', label: 'Cancel Ticket', icon: 'cancel' }
  ];

  return (
    <aside className="w-64 border-r border-slate-200 dark:border-ocean-900 bg-white dark:bg-ocean-950 flex flex-col sticky top-0 h-screen shrink-0 z-10 transition-colors duration-300">
      <div className="p-6 flex items-center gap-3">
        <div className="bg-ocean-700 p-1.5 rounded-lg shadow-inner">
          <span className="material-symbols-outlined text-white">train</span>
        </div>
        <div>
          <h1 className="font-bold text-lg leading-tight tracking-tight dark:text-ocean-100">IR Connect</h1>
          <p className="text-[10px] font-mono uppercase tracking-widest text-ocean-600 dark:text-ocean-400">PRO SYSTEM v4.2</p>
        </div>
      </div>

      <nav className="flex-1 px-4 py-2 space-y-1 overflow-y-auto">
        {mainLinks.map(link => (
          <button
            key={link.id}
            onClick={() => setCurrentPage(link.id)}
            className={`w-full flex items-center gap-3 px-3 py-2.5 text-sm font-medium rounded-lg transition-colors ${currentPage === link.id
                ? 'bg-ocean-50 dark:bg-ocean-900/40 text-ocean-700 dark:text-ocean-300 border-r-4 border-ocean-600'
                : 'text-slate-600 dark:text-ocean-400 hover:bg-slate-50 dark:hover:bg-ocean-900/20'
              }`}
          >
            <span className="material-symbols-outlined">{link.icon}</span> {link.label}
          </button>
        ))}

        <div className="pt-4 pb-2 px-3 text-[10px] font-bold text-slate-400 dark:text-ocean-700 uppercase tracking-widest">Core Engine</div>

        {coreLinks.map(link => (
          <button
            key={link.id}
            onClick={() => setCurrentPage(link.id)}
            className={`w-full flex items-center gap-3 px-3 py-2.5 text-sm font-medium rounded-lg transition-colors ${currentPage === link.id
                ? 'bg-ocean-50 dark:bg-ocean-900/40 text-ocean-700 dark:text-ocean-300 border-r-4 border-ocean-600'
                : 'text-slate-600 dark:text-ocean-400 hover:bg-slate-50 dark:hover:bg-ocean-900/20'
              }`}
          >
            <span className="material-symbols-outlined">{link.icon}</span> {link.label}
          </button>
        ))}
      </nav>

      <div className="p-4 border-t border-slate-200 dark:border-ocean-900">
        <div className="flex items-center gap-3 bg-slate-50 dark:bg-ocean-900/30 p-2 rounded-lg border border-transparent dark:border-ocean-800">
          <div className="w-8 h-8 rounded-full bg-ocean-800 flex items-center justify-center text-ocean-300 shrink-0">
            <span className="material-symbols-outlined text-lg">shield_person</span>
          </div>
          <div className="flex-1 min-w-0 text-left">
            <p className="text-xs font-semibold truncate dark:text-ocean-100">Admin Console</p>
            <p className="text-[10px] text-teal-500 font-medium">● Connected</p>
          </div>
          <button className="material-symbols-outlined text-slate-400 dark:text-ocean-600 hover:text-ocean-400 text-sm">settings</button>
        </div>
      </div>
    </aside>
  );
}

export default Navigation;

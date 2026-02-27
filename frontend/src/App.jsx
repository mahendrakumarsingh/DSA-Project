import { useState, useEffect } from 'react';
import axios from 'axios';
import { io } from 'socket.io-client';
import './App.css';
import Navigation from './components/Navigation';
import Home from './pages/Home';
import Booking from './pages/Booking';
import Status from './pages/Status';
import Confirmed from './pages/Confirmed';
import Waiting from './pages/Waiting';
import Cancellation from './pages/Cancellation';
import DSADashboard from './pages/DSADashboard';

const API_URL = '/api';
const socket = io(window.location.origin); // Connect to same-origin backend WebSocket

function App() {
  const [currentPage, setCurrentPage] = useState('home');
  const [stats, setStats] = useState({
    capacity: 0,
    confirmed: 0,
    waiting: 0,
    available: 0
  });
  const [refreshFlag, setRefreshFlag] = useState(0);

  useEffect(() => {
    fetchStats();

    // Realtime UI Engine using WebSockets!
    socket.on('system_update', () => {
      console.log('⚡ Socket event received: system_update');
      fetchStats();
      setRefreshFlag(prev => prev + 1); // Trigger re-renders in children pages seamlessly
    });

    return () => {
      socket.off('system_update');
    };
  }, []);

  const fetchStats = async () => {
    try {
      const res = await axios.get(`${API_URL}/stats`);
      setStats(res.data);
    } catch (err) {
      console.error('Error fetching stats:', err);
    }
  };

  const triggerRefresh = () => {
    fetchStats();
    setRefreshFlag(prev => prev + 1);
  };

  return (
    <div className="flex bg-slate-50 dark:bg-background-dark font-sans text-slate-900 dark:text-ocean-50 min-h-screen">
      {/* Sidebar Navigation */}
      <Navigation currentPage={currentPage} setCurrentPage={setCurrentPage} />

      {/* Main Content Area */}
      <main className="flex-1 overflow-y-auto p-8 transition-colors duration-300 relative">

        {/* Page Content */}
        <div className="fade-in mt-4">
          {currentPage === 'home' && <Home apiUrl={API_URL} onRefresh={triggerRefresh} stats={stats} />}
          {currentPage === 'booking' && <Booking apiUrl={API_URL} onRefresh={triggerRefresh} />}
          {currentPage === 'status' && <Status apiUrl={API_URL} />}
          {currentPage === 'confirmed' && <Confirmed apiUrl={API_URL} />}
          {currentPage === 'waiting' && <Waiting apiUrl={API_URL} />}
          {currentPage === 'cancellation' && <Cancellation apiUrl={API_URL} onRefresh={triggerRefresh} />}
          {currentPage === 'dsa' && <DSADashboard apiUrl={API_URL} />}
        </div>
      </main>
    </div>
  );
}

export default App;

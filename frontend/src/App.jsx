import { useState, useEffect } from 'react';
import axios from 'axios';
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
    const interval = setInterval(fetchStats, 2000);
    return () => clearInterval(interval);
  }, [refreshFlag]);

  const fetchStats = async () => {
    try {
      const res = await axios.get(`${API_URL}/stats`);
      setStats(res.data);
    } catch (err) {
      console.error('Error fetching stats:', err);
    }
  };

  const triggerRefresh = () => {
    setRefreshFlag(prev => prev + 1);
  };

  return (
    <div className="app-container">
      {/* Sidebar Navigation */}
      <Navigation currentPage={currentPage} setCurrentPage={setCurrentPage} />

      {/* Main Content Area */}
      <main className="main-content">
        {/* Top Stats Bar */}
        <div className="stats-grid">
          <div className="stat-card">
            <span className="stat-label">Total Capacity</span>
            <div className="stat-value">{stats.capacity}</div>
          </div>
          <div className="stat-card">
            <span className="stat-label">Available Seats</span>
            <div className="stat-value">{stats.available}</div>
          </div>
          <div className="stat-card">
            <span className="stat-label">Waiting List</span>
            <div className="stat-value">{stats.waiting}</div>
          </div>
          <div className="stat-card">
            <span className="stat-label">Confirmed</span>
            <div className="stat-value">{stats.confirmed}</div>
          </div>
        </div>

        {/* Page Content */}
        <div className="fade-in">
          {currentPage === 'home' && <Home apiUrl={API_URL} onRefresh={triggerRefresh} />}
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

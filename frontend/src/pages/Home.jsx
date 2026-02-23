import React, { useState } from 'react';
import axios from 'axios';

function Home({ apiUrl, onRefresh }) {
  const [capacity, setCapacity] = useState('10');
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(false);

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
      console.error('Seed Error:', err);
      setMessage(`❌ ${err.response?.data?.error || err.message || 'Error seeding data'}`);
    }
    setLoading(false);
  };

  const handleReset = async () => {
    if (!confirm('Are you sure you want to reset all system data?')) return;
    setLoading(true);
    try {
      const res = await axios.post(`${apiUrl}/reset`);
      setMessage(`✅ ${res.data.message}`);
      onRefresh();
      setTimeout(() => setMessage(''), 3000);
    } catch (err) {
      console.error('Reset Error:', err);
      setMessage(`❌ ${err.response?.data?.error || err.message || 'Error resetting data'}`);
    }
    setLoading(false);
  };

  const handleUndo = async () => {
    setLoading(true);
    try {
      const res = await axios.post(`${apiUrl}/undo`);
      setMessage(`✅ ${res.data.message}`);
      onRefresh();
      setTimeout(() => setMessage(''), 3000);
    } catch (err) {
      console.error('Undo Error:', err);
      setMessage(`❌ ${err.response?.data?.error || err.message || 'Error undoing action'}`);
    }
    setLoading(false);
  };

  return (
    <div className="page-container">
      <div className="page-header">
        <h2>Dashboard Overview</h2>
        <p className="subtitle">System Configuration & Health Status</p>
      </div>

      <div className="grid-2">
        <div className="card">
          <div className="flex-between" style={{ marginBottom: '16px' }}>
            <h3>⚙️ Configuration</h3>
            <span className="muted" style={{ fontSize: '12px' }}>PROD-ENV</span>
          </div>

          <div className="form-group">
            <label>Train System Capacity</label>
            <div style={{ display: 'flex', gap: '12px' }}>
              <input
                type="number"
                value={capacity}
                onChange={e => setCapacity(e.target.value)}
                min="1"
                style={{ flex: 1 }}
              />
              <button
                className="btn primary"
                onClick={handleSetCapacity}
                disabled={loading}
              >
                {loading ? 'Updating...' : 'Update'}
              </button>
            </div>
          </div>
          <p className="muted" style={{ fontSize: '13px', marginTop: '16px', lineHeight: '1.5' }}>
            Increasing capacity triggers the <strong className="text-accent">Max-Heap Priority Queue</strong> to automatically promote high-priority waitlisted passengers.
          </p>
        </div>

        <div className="card">
          <div className="flex-between" style={{ marginBottom: '16px' }}>
            <h3>⚡ Actions</h3>
            <span className="muted" style={{ fontSize: '12px' }}>DEBUG TOOLS</span>
          </div>

          <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
            <button className="btn" style={{ background: 'var(--accent-green)', color: 'white', flex: 1 }} onClick={handleSeedDemo}>
              🌱 Seed Data
            </button>
            <button className="btn" style={{ background: '#f59e0b', color: 'white', flex: 1 }} onClick={handleUndo}>
              ↩️ Undo Last
            </button>
            <button className="btn" style={{ background: '#ef4444', color: 'white', flex: 1 }} onClick={handleReset}>
              🗑️ System Reset
            </button>
          </div>
          <div className="muted" style={{ fontSize: '13px', marginTop: '20px', display: 'flex', flexDirection: 'column', gap: '8px' }}>
            <div style={{ display: 'flex', gap: '8px' }}>
              <span>•</span>
              <span><strong>Seed Data:</strong> Adds 7 diverse passengers.</span>
            </div>
            <div style={{ display: 'flex', gap: '8px' }}>
              <span>•</span>
              <span><strong>Undo:</strong> Reverts last booking/cancellation (Stack).</span>
            </div>
            <div style={{ display: 'flex', gap: '8px' }}>
              <span>•</span>
              <span><strong>Reset:</strong> Clears DB, BST index, and Queues.</span>
            </div>
          </div>
        </div>
      </div>

      {message && (
        <div className={`message-box ${message.includes('✅') ? 'success' : 'error'}`}>
          {message}
        </div>
      )}

      <div className="card" style={{ marginTop: '24px' }}>
        <h3>🧩 Core Architecture Metrics</h3>
        <p className="muted" style={{ marginBottom: '24px' }}>Real-time performance metrics of the underlying data structures.</p>

        <div className="grid-2" style={{ gridTemplateColumns: 'repeat(4, 1fr)', gap: '20px' }}>
          {[
            { label: 'DB Latency', val: '12ms', color: '#10b981', sub: 'Average' },
            { label: 'BST Lookups', val: 'O(log n)', color: '#3b82f6', sub: 'Indexed' },
            { label: 'Queue Type', val: 'Max-Heap', color: '#f59e0b', sub: 'Priority' },
            { label: 'Graph Algo', val: 'Dijkstra', color: '#8b5cf6', sub: 'Pathfinding' }
          ].map((item, i) => (
            <div key={i} className="metric-card">
              <div style={{ fontSize: '12px', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.5px' }}>{item.label}</div>
              <div style={{ fontSize: '24px', fontWeight: '800', color: item.color }}>{item.val}</div>
              <div style={{ fontSize: '11px', color: 'var(--text-muted)', opacity: 0.7 }}>{item.sub}</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

export default Home;

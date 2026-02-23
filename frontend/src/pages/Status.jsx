import React, { useState } from 'react';
import axios from 'axios';

function Status({ apiUrl }) {
  const [pnr, setPnr] = useState('');
  const [passenger, setPassenger] = useState(null);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSearch = async (e) => {
    e.preventDefault();
    if (!pnr.trim()) return setError('Please enter a PNR');

    setLoading(true);
    setError('');
    setPassenger(null);

    try {
      const res = await axios.get(`${apiUrl}/passengers/${pnr.trim()}`);
      setPassenger(res.data);
    } catch (err) {
      setPassenger(null);
      setError('PNR not found in system.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="page-container">
      <div className="card" style={{ maxWidth: '600px', margin: '0 auto' }}>
        <h2>Check PNR Status</h2>
        <p className="subtitle">Track your booking status in real-time</p>

        <form onSubmit={handleSearch} style={{ display: 'flex', gap: '12px', marginBottom: '24px' }}>
          <input
            value={pnr}
            onChange={(e) => setPnr(e.target.value)}
            placeholder="Enter PNR Number..."
            style={{ flex: 1 }}
          />
          <button type="submit" className="btn primary" disabled={loading}>
            {loading ? 'Thinking...' : 'Check Status'}
          </button>
        </form>

        {error && <div className="message-box error">❌ {error}</div>}

        {passenger && (
          <div style={{ background: 'var(--bg-dark)', padding: '24px', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-color)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px', paddingBottom: '16px', borderBottom: '1px solid var(--border-color)' }}>
              <div>
                <div className="muted" style={{ marginBottom: '4px', fontSize: '12px' }}>PNR NUMBER</div>
                <div style={{ fontSize: '24px', fontWeight: '700', letterSpacing: '2px', color: 'var(--primary)' }}>{passenger.pnr}</div>
              </div>
              <div
                style={{
                  padding: '6px 16px',
                  borderRadius: '20px',
                  fontSize: '12px',
                  fontWeight: 'bold',
                  background: passenger.status === 'Confirmed' ? 'rgba(16, 185, 129, 0.2)' : 'rgba(245, 158, 11, 0.2)',
                  color: passenger.status === 'Confirmed' ? '#10b981' : '#f59e0b',
                  border: `1px solid ${passenger.status === 'Confirmed' ? '#10b981' : '#f59e0b'}`
                }}
              >
                {passenger.status.toUpperCase()}
              </div>
            </div>

            <div className="grid-2">
              <div>
                <label style={{ display: 'block', fontSize: '12px', color: 'var(--text-muted)', marginBottom: '4px' }}>PASSENGER NAME</label>
                <div style={{ fontSize: '16px', fontWeight: '500' }}>{passenger.name}</div>
              </div>
              <div>
                <label style={{ display: 'block', fontSize: '12px', color: 'var(--text-muted)', marginBottom: '4px' }}>AGE / GENDER</label>
                <div style={{ fontSize: '16px', fontWeight: '500' }}>{passenger.age} / {passenger.gender}</div>
              </div>
              <div>
                <label style={{ display: 'block', fontSize: '12px', color: 'var(--text-muted)', marginBottom: '4px' }}>CONTACT</label>
                <div style={{ fontSize: '16px', fontWeight: '500' }}>{passenger.contact}</div>
              </div>
              <div>
                <label style={{ display: 'block', fontSize: '12px', color: 'var(--text-muted)', marginBottom: '4px' }}>BOOKING DATE</label>
                <div style={{ fontSize: '16px', fontWeight: '500' }}>{new Date(passenger.bookedAt).toLocaleDateString()}</div>
              </div>
            </div>

            {passenger.status === 'Waiting' && (
              <div className="message-box warning" style={{ marginTop: '24px', display: 'flex', alignItems: 'center', gap: '12px' }}>
                <span style={{ fontSize: '24px' }}>⏳</span>
                <div>
                  <strong>Waitlist Position: {passenger.waitingPosition || 'Calculating...'}</strong>
                  <div style={{ fontSize: '12px', marginTop: '4px', opacity: 0.8 }}>System is checking for cancellations...</div>
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

export default Status;

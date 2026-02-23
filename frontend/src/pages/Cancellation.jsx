import React, { useState } from 'react';
import axios from 'axios';

function Cancellation({ apiUrl, onRefresh }) {
  const [pnr, setPnr] = useState('');
  const [result, setResult] = useState(null);
  const [error, setError] = useState('');

  const handleCancel = async (e) => {
    e.preventDefault();
    if (!confirm('Are you sure you want to cancel this ticket?')) return;

    setError('');
    setResult(null);

    try {
      const res = await axios.delete(`${apiUrl}/passengers/${pnr.trim()}`);
      setResult(res.data);
      onRefresh();
    } catch (err) {
      setError(err.response?.status === 404 ? 'PNR Not Found' : 'Cancellation failed');
    }
  };

  return (
    <div className="page-container">
      <div className="card" style={{ maxWidth: '600px', margin: '0 auto', borderLeft: '4px solid #ef4444' }}>
        <h2>Cancel Ticket</h2>
        <p className="subtitle">Enter PNR to cancel your booking</p>

        <form onSubmit={handleCancel}>
          <div className="form-group">
            <label>PNR Number</label>
            <input
              value={pnr}
              onChange={(e) => setPnr(e.target.value)}
              placeholder="Enter PNR to cancel..."
            />
          </div>
          <button type="submit" className="btn" style={{ width: '100%', background: '#ef4444', color: 'white', marginTop: '16px' }}>
            Confirm Cancellation
          </button>
        </form>

        {error && <div className="message-box error">⚠️ {error}</div>}

        {result && (
          <div className="message-box success" style={{ background: 'rgba(239, 68, 68, 0.1)', color: '#fca5a5', border: '1px solid rgba(239, 68, 68, 0.2)' }}>
            <h3>Ticket Cancelled</h3>
            <p>Passenger <strong>{result.cancelled.name}</strong> (PNR: {result.cancelled.pnr}) has been removed.</p>
            {result.promoted && (
              <div style={{ marginTop: '12px', padding: '12px', background: 'rgba(16, 185, 129, 0.1)', borderRadius: '8px', border: '1px solid rgba(16, 185, 129, 0.2)', color: '#34d399' }}>
                🎉 <strong>Auto-Promotion:</strong> Passenger {result.promoted.name} has been moved from Waiting to Confirmed!
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

export default Cancellation;

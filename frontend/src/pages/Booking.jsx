import React, { useState } from 'react';
import axios from 'axios';

function Booking({ apiUrl, onRefresh }) {
  const [formData, setFormData] = useState({
    name: '',
    age: '',
    gender: 'Male',
    contact: '',
    isTatkal: false
  });
  const [result, setBookingResult] = useState(null);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    // Clear previous result when user starts typing again
    if (result) setBookingResult(null);

    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setBookingResult(null);

    // Client-side Validations
    if (!formData.name.trim()) return setError('Please enter passenger name.');
    if (!formData.age || Number(formData.age) < 1 || Number(formData.age) > 120) return setError('Please enter a valid age (1-120).');
    if (!formData.contact || !/^\d{10}$/.test(formData.contact)) return setError('Please enter a valid 10-digit contact number.');

    setLoading(true);
    try {
      const res = await axios.post(`${apiUrl}/passengers`, formData);
      setBookingResult({ ...res.data.passenger, message: res.data.message });
      onRefresh();
      // Reset form but keep tatkal preference if desired, or reset all
      setFormData({ name: '', age: '', gender: 'Male', contact: '', isTatkal: false });
    } catch (err) {
      setError(err.response?.data?.error || 'Booking processing failed.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="page-container">
      <div className="grid-2">
        {/* Booking Form */}
        <div className="card">
          <h2>Book a Ticket</h2>
          <p className="subtitle">Reserve your seat on the train</p>

          <form onSubmit={handleSubmit}>
            <div className="form-group">
              <label>Full Name</label>
              <input name="name" value={formData.name} onChange={handleChange} placeholder="e.g. John Doe" />
            </div>

            <div className="grid-2" style={{ gap: '16px', marginBottom: '8px', gridTemplateColumns: '1fr 1fr' }}>
              <div className="form-group">
                <label>Age {Number(formData.age) >= 60 && <span style={{ color: 'var(--accent-amber)', fontSize: '11px', marginLeft: '6px' }}>⭐ Senior</span>}</label>
                <input name="age" type="number" value={formData.age} onChange={handleChange} placeholder="Age" />
              </div>
              <div className="form-group">
                <label>Gender</label>
                <select name="gender" value={formData.gender} onChange={handleChange}>
                  <option>Male</option>
                  <option>Female</option>
                  <option>Other</option>
                </select>
              </div>
            </div>

            <div className="form-group" style={{ marginBottom: '24px' }}>
              <label>Contact Number (10-digit)</label>
              <input name="contact" value={formData.contact} onChange={handleChange} maxLength="10" placeholder="9876543210" />
            </div>

            <div
              className={`tatkal-option ${formData.isTatkal ? 'active' : ''}`}
              onClick={() => setFormData(p => ({ ...p, isTatkal: !p.isTatkal }))}
            >
              <input
                type="checkbox"
                name="isTatkal"
                checked={formData.isTatkal}
                onChange={handleChange}
                className="tatkal-checkbox"
              />
              <div>
                <div style={{ fontWeight: '600', color: formData.isTatkal ? '#f87171' : 'var(--text-main)' }}>Tatkal Booking</div>
                <div style={{ fontSize: '12px', color: 'var(--text-muted)' }}>Higher priority allocation (Fees apply)</div>
              </div>
            </div>

            <button type="submit" className="btn primary" style={{ width: '100%' }} disabled={loading}>
              {loading ? 'Processing...' : 'Confirm Booking'}
            </button>
          </form>
        </div>

        {/* Result Panel */}
        <div>
          {error && <div className="message-box error">⚠️ {error}</div>}

          {result && (
            <div className="card result-overlay">
              <div style={{ textAlign: 'center', marginBottom: '24px' }}>
                <span className="success-icon">🎉</span>
                <h3 style={{ textTransform: 'uppercase', letterSpacing: '1px', marginTop: '8px' }}>Booking Successful!</h3>
                <p className="muted">{result.message}</p>
              </div>

              <div className="result-detail-box">
                <div className="flex-between" style={{ marginBottom: '16px' }}>
                  <span className="muted">PNR Number:</span>
                  <span className="pnr-display">{result.pnr}</span>
                </div>
                <div className="flex-between" style={{ marginBottom: '12px' }}>
                  <span className="muted">Status:</span>
                  <span className={`status-badge ${result.status === 'Confirmed' ? 'confirmed' : 'waitlist'}`}>
                    {result.status}
                  </span>
                </div>
                <div className="flex-between">
                  <span className="muted">Seat:</span>
                  <span style={{ fontWeight: '700', fontSize: '16px' }}>{result.seatNumber || 'Waitlist'}</span>
                </div>
              </div>

              <button className="btn secondary" style={{ width: '100%', marginTop: '24px', justifyContent: 'center' }} onClick={() => setBookingResult(null)}>
                Book Another Ticket
              </button>
            </div>
          )}

          {/* Info Panel if no result */}
          {!result && (
            <div className="card" style={{ opacity: 0.8, borderStyle: 'dashed' }}>
              <h3>Booking Guidelines</h3>
              <ul className="guidelines-list">
                <li>Ensure all details are accurate as per ID proof.</li>
                <li>Senior citizens (60+) get automatic priority.</li>
                <li>Tatkal bookings have higher probability in waiting list.</li>
                <li>Maximum age allowed is 120 years.</li>
              </ul>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default Booking;

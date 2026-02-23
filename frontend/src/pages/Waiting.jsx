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
    <div className="page-container">
      <div className="card">
        <h2>Waiting List</h2>
        <p className="subtitle">Real-time Priority Queue (Seniors & Tatkal First)</p>

        <div className="message-box warning" style={{ display: 'flex', alignItems: 'center', gap: '16px', marginBottom: '24px' }}>
          <span style={{ fontSize: '24px' }}>⬆️</span>
          <div>
            <strong>Priority Logic Active</strong>
            <div style={{ fontSize: '13px', opacity: 0.9 }}>
              1. 👴 Senior Citizens (60+)<br />
              2. ⚡ Tatkal Bookings<br />
              3. 📅 General Booking Time
            </div>
          </div>
        </div>

        <div className="table-container">
          <table>
            <thead>
              <tr>
                <th>Priority</th>
                <th>PNR</th>
                <th>Name</th>
                <th>Age</th>
                <th>Gender</th>
                <th>Tags</th>
              </tr>
            </thead>
            <tbody>
              {passengers.length > 0 ? (
                passengers.map((p, index) => {
                  const isSenior = p.age >= 60;
                  const isTatkal = p.isTatkal;
                  const isPriority = isSenior || isTatkal;

                  return (
                    <tr key={p.pnr} style={isPriority ? { background: 'rgba(245, 158, 11, 0.05)' } : {}}>
                      <td>
                        <div style={{
                          width: '24px',
                          height: '24px',
                          background: index < 3 ? 'var(--accent-amber)' : 'rgba(255,255,255,0.1)',
                          color: index < 3 ? '#000' : 'var(--text-muted)',
                          borderRadius: '50%',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          fontWeight: 'bold',
                          fontSize: '12px'
                        }}>
                          {index + 1}
                        </div>
                      </td>
                      <td style={{ fontFamily: 'monospace', color: 'var(--text-muted)' }}>{p.pnr}</td>
                      <td style={{ fontWeight: isPriority ? '600' : '400' }}>
                        {p.name}
                      </td>
                      <td style={{ color: isSenior ? 'var(--accent-amber)' : 'inherit', fontWeight: isSenior ? 'bold' : 'normal' }}>
                        {p.age}
                      </td>
                      <td>{p.gender}</td>
                      <td>
                        <div style={{ display: 'flex', gap: '4px' }}>
                          {isSenior && <span style={{ fontSize: '10px', padding: '2px 6px', background: 'rgba(245, 158, 11, 0.2)', color: 'var(--accent-amber)', borderRadius: '4px', fontWeight: 'bold' }}>SENIOR</span>}
                          {isTatkal && <span style={{ fontSize: '10px', padding: '2px 6px', background: 'rgba(239, 68, 68, 0.2)', color: '#f87171', borderRadius: '4px', fontWeight: 'bold' }}>TATKAL</span>}
                          {!isPriority && <span style={{ fontSize: '10px', color: 'var(--text-muted)' }}>-</span>}
                        </div>
                      </td>
                    </tr>
                  );
                })
              ) : (
                <tr>
                  <td colSpan="6" style={{ textAlign: 'center', padding: '40px', color: 'var(--text-muted)' }}>
                    Waiting list is empty.
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

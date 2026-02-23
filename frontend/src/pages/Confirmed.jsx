import React, { useEffect, useState } from 'react';
import axios from 'axios';

function Confirmed({ apiUrl }) {
  const [passengers, setPassengers] = useState([]);
  const [sortBy, setSortBy] = useState('bookedAt');

  const fetchPassengers = async () => {
    try {
      const res = await axios.get(`${apiUrl}/passengers/confirmed?sortBy=${sortBy}`);
      setPassengers(res.data);
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    fetchPassengers();
  }, [sortBy]);

  return (
    <div className="page-container">
      <div className="card">
        <div className="flex-between" style={{ marginBottom: '32px' }}>
          <div>
            <h2>Confirmed Passengers</h2>
            <p className="subtitle">List of passengers with confirmed seats</p>
          </div>
          <div className="flex-gap-4" style={{ alignItems: 'center' }}>
            <span className="muted">Sort by:</span>
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              style={{ width: 'auto', minWidth: '150px' }}
            >
              <option value="bookedAt">Booking Time</option>
              <option value="name">Name</option>
              <option value="age">Age</option>
              <option value="pnr">PNR</option>
            </select>
          </div>
        </div>

        <div className="table-container">
          <table>
            <thead>
              <tr>
                <th>PNR</th>
                <th>Name</th>
                <th>Age</th>
                <th>Gender</th>
                <th>Contact</th>
                <th>Type</th>
              </tr>
            </thead>
            <tbody>
              {passengers.length > 0 ? (
                passengers.map(p => (
                  <tr key={p.pnr}>
                    <td className="monospace text-accent" style={{ fontWeight: '700' }}>{p.pnr}</td>
                    <td style={{ fontWeight: '500' }}>{p.name}</td>
                    <td>{p.age}</td>
                    <td>{p.gender}</td>
                    <td className="monospace">{p.contact}</td>
                    <td>
                      {p.isTatkal ? (
                        <span className="status-badge waitlist" style={{ color: '#f87171', background: 'rgba(239, 68, 68, 0.1)' }}>
                          Tatkal
                        </span>
                      ) : (
                        <span className="status-badge" style={{ color: 'var(--text-muted)', background: 'rgba(255, 255, 255, 0.05)' }}>
                          General
                        </span>
                      )}
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="6" style={{ textAlign: 'center', padding: '60px', color: 'var(--text-muted)' }}>
                    No confirmed passengers found.
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

export default Confirmed;

import React from 'react';

function Navigation({ currentPage, setCurrentPage }) {
  const links = [
    { id: 'home', label: 'Dashboard', icon: '🏠' },
    { id: 'booking', label: 'Book Ticket', icon: '🎫' },
    { id: 'status', label: 'PNR Status', icon: '📋' },
    { id: 'confirmed', label: 'Confirmed List', icon: '✅' },
    { id: 'waiting', label: 'Waiting List', icon: '⏳' },
    { id: 'cancellation', label: 'Cancel Ticket', icon: '❌' },
    { id: 'dsa', label: 'DSA System', icon: '🧩' }
  ];

  return (
    <aside className="sidebar">
      <div className="logo-section">
        <div className="logo-icon">🚄</div>
        <div className="logo-text">
          <h1>IR Connect</h1>
          <p>Pro System</p>
        </div>
      </div>

      <nav className="nav-links">
        {links.map(link => (
          <button
            key={link.id}
            className={`nav-item ${currentPage === link.id ? 'active' : ''}`}
            onClick={() => setCurrentPage(link.id)}
          >
            <span style={{ fontSize: '18px' }}>{link.icon}</span>
            {link.label}
          </button>
        ))}
      </nav>

      <div className="user-profile">
        <div className="user-avatar"></div>
        <div className="user-info">
          <div className="name">Admin User</div>
          <div className="email">admin@ir.gov.in</div>
        </div>
      </div>
    </aside>
  );
}

export default Navigation;

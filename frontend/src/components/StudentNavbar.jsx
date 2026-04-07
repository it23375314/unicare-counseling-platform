import React from 'react';
import { Link } from 'react-router-dom';

export default function StudentNavbar() {
  const handleLogout = () => {
    if (window.confirm("Are you sure you want to log out?")) {
      localStorage.clear();
      window.location.href = '/login';
    }
  };

  return (
    <nav style={navStyles.nav}>
      {/* Branding */}
      <div style={navStyles.brand}>
        <Link to="/wellness-dashboard" style={navStyles.logoLink}>
          <span style={{ color: '#0891b2' }}>Wellness</span>Portal
        </Link>
      </div>

      {/* Navigation Links */}
      <div style={navStyles.linksContainer}>
        <Link to="/wellness-dashboard" style={navStyles.link}>Home</Link>
        <Link to="/resources" style={navStyles.link}>Library</Link>
        <Link to="/wellness" style={navStyles.link}>Goal Tracker</Link>
        <Link to="/saved" style={navStyles.savedLink}>
          <span style={{ fontSize: '14px' }}>❤️</span> Favorites
        </Link>

        {/* Logout Button */}
        <button onClick={handleLogout} style={navStyles.logoutBtn}>
          LOGOUT
        </button>
      </div>
    </nav>
  );
}

const navStyles = {
  nav: {
    height: '80px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: '0 60px',
    backgroundColor: 'rgba(255, 255, 255, 0.9)',
    backdropFilter: 'blur(10px)',
    borderBottom: '1px solid #e2e8f0',
    position: 'sticky',
    top: 0,
    zIndex: 1000,
  },
  brand: {
    fontSize: '24px',
    fontWeight: '900',
    letterSpacing: '-1px',
    textTransform: 'uppercase'
  },
  logoLink: {
    textDecoration: 'none',
    color: '#164e63'
  },
  linksContainer: {
    display: 'flex',
    alignItems: 'center',
    gap: '30px'
  },
  link: {
    textDecoration: 'none',
    color: '#64748b',
    fontSize: '12px',
    fontWeight: '800',
    textTransform: 'uppercase',
    letterSpacing: '1px',
    transition: 'color 0.2s'
  },
  savedLink: {
    textDecoration: 'none',
    color: '#164e63',
    fontSize: '12px',
    fontWeight: '800',
    textTransform: 'uppercase',
    paddingLeft: '30px',
    borderLeft: '1px solid #e2e8f0',
    display: 'flex',
    alignItems: 'center',
    gap: '8px'
  },
  logoutBtn: {
    backgroundColor: '#fff',
    color: '#ef4444',
    border: '1px solid #fee2e2',
    padding: '10px 20px',
    borderRadius: '12px',
    fontSize: '11px',
    fontWeight: '900',
    cursor: 'pointer',
    transition: 'all 0.2s'
  }
};
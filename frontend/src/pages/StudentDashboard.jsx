// src/pages/StudentDashboard.jsx
import React from 'react';
import { useNavigate } from 'react-router-dom';
import '../styles/Dashboard.css';

const StudentDashboard = () => {
  const navigate = useNavigate();

  const handleLogout = () => {
    // Send them back to the login page
    navigate('/');
  };

  return (
    <div className="dashboard-container">
      {/* Left Sidebar */}
      <div className="sidebar">
        <h2>UniCare</h2>
        <ul>
          <li style={{ backgroundColor: '#f0f4ff', color: '#007bff' }}>🏠 Dashboard</li>
          <li>📅 Appointments</li>
          <li>🧘‍♀️ Wellness Resources</li>
          <li>⚙️ Settings</li>
        </ul>
        <ul style={{ flex: 0 }}>
          <li onClick={handleLogout} style={{ color: '#dc3545' }}>🚪 Logout</li>
        </ul>
      </div>

      {/* Main Content Area */}
      <div className="main-content">
        <div className="welcome-card">
          <h1 style={{ color: '#333', marginBottom: '10px' }}>Welcome back, Student! 👋</h1>
          <p style={{ color: '#666' }}>How are you feeling today? Let's take care of your mental well-being.</p>
        </div>
        
        {/* Placeholder cards for future modules */}
        <div style={{ display: 'flex', gap: '20px' }}>
            <div style={{ flex: 1, padding: '20px', background: '#e0f7fa', borderRadius: '10px' }}>
                <h3 style={{ color: '#006064' }}>Upcoming Session</h3>
                <p style={{ marginTop: '10px', color: '#555' }}>No appointments booked yet.</p>
            </div>
            <div style={{ flex: 1, padding: '20px', background: '#fce4ec', borderRadius: '10px' }}>
                <h3 style={{ color: '#880e4f' }}>Daily Wellness</h3>
                <p style={{ marginTop: '10px', color: '#555' }}>"You are stronger than you think."</p>
            </div>
        </div>
      </div>
    </div>
  );
};

export default StudentDashboard;
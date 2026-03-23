// src/pages/CounsellorDashboard.jsx
import React from 'react';
import { useNavigate } from 'react-router-dom';
import '../styles/Dashboard.css'; // Reusing your awesome CSS!

const CounsellorDashboard = () => {
  const navigate = useNavigate();

  const handleLogout = () => {
    navigate('/');
  };

  return (
    <div className="dashboard-container">
      {/* Left Sidebar for Counsellor */}
      <div className="sidebar">
        <h2>UniCare Pro</h2>
        <ul>
          <li style={{ backgroundColor: '#f0f4ff', color: '#007bff' }}>🏠 Overview</li>
          <li>📅 My Schedule</li>
          <li>📁 Student Records</li>
          <li>💬 Messages</li>
        </ul>
        <ul style={{ flex: 0 }}>
          <li onClick={handleLogout} style={{ color: '#dc3545' }}>🚪 Logout</li>
        </ul>
      </div>

      {/* Main Content Area */}
      <div className="main-content">
        <div className="welcome-card">
          <h1 style={{ color: '#333', marginBottom: '10px' }}>Welcome back, Counsellor! 🩺</h1>
          <p style={{ color: '#666' }}>Here is your schedule and student overview for today.</p>
        </div>
        
        <div style={{ display: 'flex', gap: '20px' }}>
            <div style={{ flex: 1, padding: '20px', background: '#e8f5e9', borderRadius: '10px' }}>
                <h3 style={{ color: '#1b5e20' }}>Today's Appointments</h3>
                <p style={{ marginTop: '10px', color: '#555' }}>You have 3 sessions scheduled today.</p>
            </div>
            <div style={{ flex: 1, padding: '20px', background: '#fff3e0', borderRadius: '10px' }}>
                <h3 style={{ color: '#e65100' }}>Pending Requests</h3>
                <p style={{ marginTop: '10px', color: '#555' }}>2 students are requesting a new session.</p>
            </div>
        </div>
      </div>
    </div>
  );
};

export default CounsellorDashboard;
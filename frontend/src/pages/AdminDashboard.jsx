// src/pages/AdminDashboard.jsx
import React from 'react';
import { useNavigate } from 'react-router-dom';
import '../styles/Dashboard.css'; 

const AdminDashboard = () => {
  const navigate = useNavigate();

  const handleLogout = () => {
    navigate('/');
  };

  return (
    <div className="dashboard-container">
      {/* Left Sidebar for Admin */}
      <div className="sidebar">
        <h2 style={{ color: '#333' }}>UniCare Admin</h2>
        <ul>
          <li style={{ backgroundColor: '#f0f4ff', color: '#007bff' }}>📊 System Analytics</li>
          <li>👥 User Management</li>
          <li>📝 Platform Logs</li>
          <li>⚙️ Global Settings</li>
        </ul>
        <ul style={{ flex: 0 }}>
          <li onClick={handleLogout} style={{ color: '#dc3545' }}>🚪 Logout</li>
        </ul>
      </div>

      {/* Main Content Area */}
      <div className="main-content">
        <div className="welcome-card">
          <h1 style={{ color: '#333', marginBottom: '10px' }}>Admin Control Panel 🛡️</h1>
          <p style={{ color: '#666' }}>Monitor platform health and manage user accounts.</p>
        </div>
        
        <div style={{ display: 'flex', gap: '20px' }}>
            <div style={{ flex: 1, padding: '20px', background: '#f3e5f5', borderRadius: '10px' }}>
                <h3 style={{ color: '#4a148c' }}>Total Users</h3>
                <h2 style={{ marginTop: '10px', color: '#333' }}>1,204</h2>
                <p style={{ color: '#777', fontSize: '12px' }}>Students: 1,180 | Counsellors: 24</p>
            </div>
            <div style={{ flex: 1, padding: '20px', background: '#e3f2fd', borderRadius: '10px' }}>
                <h3 style={{ color: '#0d47a1' }}>System Status</h3>
                <h2 style={{ marginTop: '10px', color: '#2e7d32' }}>Online & Healthy</h2>
            </div>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;
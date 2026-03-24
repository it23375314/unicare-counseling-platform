import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import '../styles/Dashboard.css';

const PlatformLogs = () => {
  const navigate = useNavigate();

  // 1. Mock Database of System Logs
  const [logs] = useState([
    { id: 105, type: 'security', message: 'Admin login successful', user: 'Admin User', time: 'Just now' },
    { id: 104, type: 'action', message: 'Approved new counsellor account', user: 'Admin User', target: 'Dr. Sarah Jenkins', time: '10 mins ago' },
    { id: 103, type: 'warning', message: 'Failed login attempt (Incorrect Password)', user: 'Unknown', time: '1 hour ago' },
    { id: 102, type: 'system', message: 'Automated database backup completed', user: 'System', time: '3 hours ago' },
    { id: 101, type: 'action', message: 'Submitted new system feedback', user: 'Emma Wilson', time: '5 hours ago' },
    { id: 100, type: 'security', message: 'Password reset requested', user: 'Liam Brown', time: '1 day ago' }
  ]);

  // State for log filtering
  const [filter, setFilter] = useState('All');

  const handleLogout = () => {
    localStorage.removeItem('isLoggedIn');
    localStorage.removeItem('userRole');
    navigate('/');
  };

  // Helper function to pick colors based on the log type
  const getLogStyles = (type) => {
    switch(type) {
      case 'security': return { border: '#17a2b8', bg: '#e0f7fa', icon: '🔒' };
      case 'action': return { border: '#28a745', bg: '#e8f5e9', icon: '👤' };
      case 'warning': return { border: '#dc3545', bg: '#ffebee', icon: '⚠️' };
      case 'system': return { border: '#6c757d', bg: '#f8f9fa', icon: '⚙️' };
      default: return { border: '#ccc', bg: '#fff', icon: '📄' };
    }
  };

  // Apply the active filter
  const filteredLogs = logs.filter(log => filter === 'All' || log.type === filter.toLowerCase());

  return (
    <div className="dashboard-container">
      {/* Left Sidebar for Admin */}
      <div className="sidebar">
        <h2 style={{ color: '#333' }}>UniCare Admin</h2>
        <ul>
          {/* Active page gets the blue background */}
          <li style={{ backgroundColor: '#f0f4ff', color: '#007bff' }} onClick={() => navigate('/admin-dashboard')}>
            🛡️ Control Panel
          </li>
          <li onClick={() => navigate('/admin-analytics')}>📊 System Analytics</li>
          <li onClick={() => navigate('/admin-users')}>👥 User Management</li>
          <li onClick={() => navigate('/admin-logs')}>📝 Platform Logs</li>
          <li onClick={() => navigate('/system-config')}>⚙️ System Config</li>
          <li onClick={() => navigate('/settings')}>⚙️ Settings</li>
        </ul>
        <ul style={{ flex: 0 }}>
          <li onClick={handleLogout} style={{ color: '#dc3545' }}>🚪 Logout</li>
        </ul>
      </div>

      {/* Main Content Area */}
      <div className="main-content">
        <div className="welcome-card" style={{ borderLeft: '5px solid #17a2b8' }}>
          <h1 style={{ color: '#333', marginBottom: '10px' }}>Platform Logs 📝</h1>
          <p style={{ color: '#666' }}>Review system events, security alerts, and user activity.</p>
        </div>

        {/* Filter Tabs */}
        <div style={{ display: 'flex', gap: '10px', marginBottom: '25px' }}>
          {['All', 'Action', 'Security', 'Warning', 'System'].map(tab => (
            <button
              key={tab}
              onClick={() => setFilter(tab)}
              style={{
                padding: '8px 16px',
                borderRadius: '20px',
                border: 'none',
                cursor: 'pointer',
                fontWeight: 'bold',
                backgroundColor: filter === tab ? '#17a2b8' : '#e9ecef',
                color: filter === tab ? 'white' : '#495057',
                transition: 'all 0.2s'
              }}
            >
              {tab}
            </button>
          ))}
        </div>

        {/* Logs Timeline */}
        <div style={{ background: 'white', padding: '20px', borderRadius: '10px', boxShadow: '0 2px 10px rgba(0,0,0,0.05)' }}>
          {filteredLogs.length > 0 ? (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
              {filteredLogs.map(log => {
                const styles = getLogStyles(log.type);
                return (
                  <div key={log.id} style={{ 
                    display: 'flex', 
                    alignItems: 'center', 
                    padding: '15px', 
                    background: styles.bg, 
                    borderLeft: `4px solid ${styles.border}`, 
                    borderRadius: '0 8px 8px 0' 
                  }}>
                    <div style={{ fontSize: '24px', marginRight: '15px' }}>{styles.icon}</div>
                    <div style={{ flex: 1 }}>
                      <strong style={{ display: 'block', color: '#333', fontSize: '15px' }}>{log.message}</strong>
                      <span style={{ fontSize: '13px', color: '#666' }}>
                        User: <span style={{ fontWeight: 'bold' }}>{log.user}</span> 
                        {log.target && ` → Target: ${log.target}`}
                      </span>
                    </div>
                    <div style={{ fontSize: '12px', color: '#888', whiteSpace: 'nowrap' }}>
                      {log.time}
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <div style={{ textAlign: 'center', padding: '40px', color: '#777' }}>
              <p>No logs found for this filter category.</p>
            </div>
          )}
        </div>

      </div>
    </div>
  );
};

export default PlatformLogs;
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import '../styles/Dashboard.css';

const PlatformLogs = () => {
  const navigate = useNavigate();
  const [logs, setLogs] = useState([]); // Now starts empty
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('All');

  // 1. Fetch REAL logs from your Backend
  const fetchLogs = async () => {
    try {
      setLoading(true);
      const response = await fetch("http://localhost:5000/api/auth/logs");
      const data = await response.json();
      
      if (response.ok) {
        setLogs(data);
      }
      setLoading(false);
    } catch (err) {
      console.error("Error fetching logs:", err);
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLogs();
  }, []);

  const handleLogout = () => {
    localStorage.removeItem('isLoggedIn');
    localStorage.removeItem('userRole');
    navigate('/');
  };

  // Helper function to pick colors based on the log type stored in DB
  const getLogStyles = (type) => {
    const t = type.toLowerCase();
    switch(t) {
      case 'security': return { border: '#17a2b8', bg: '#e0f7fa', icon: '🔒' };
      case 'action': return { border: '#28a745', bg: '#e8f5e9', icon: '👤' };
      case 'warning': return { border: '#dc3545', bg: '#ffebee', icon: '⚠️' };
      case 'system': return { border: '#6c757d', bg: '#f8f9fa', icon: '⚙️' };
      default: return { border: '#ccc', bg: '#fff', icon: '📄' };
    }
  };

  // Filter logic for real data
  const filteredLogs = logs.filter(log => 
    filter === 'All' || log.type.toLowerCase() === filter.toLowerCase()
  );

  return (
    <div className="dashboard-container">
      <div className="sidebar">
        <div className="sidebar-brand">UniCare </div>
        <ul>
          <li onClick={() => navigate('/admin-dashboard')}>🛡️ Control Panel</li>
          <li onClick={() => navigate('/admin-analytics')}>📊 System Analytics</li>
          <li onClick={() => navigate('/admin-users')}>👥 User Management</li>
          <li className="active" style={{ backgroundColor: '#f0f4ff', color: '#007bff' }} onClick={() => navigate('/admin-logs')}>
             📝 Platform Logs
          </li>
          <li onClick={() => navigate('/system-config')}>⚙️ System Config</li>
          <li onClick={() => navigate('/settings')}>⚙️ Settings</li>
        </ul>
        <ul style={{ flex: 0 }}>
          <li onClick={handleLogout} style={{ color: '#dc3545', cursor: 'pointer' }}>🚪 Logout</li>
        </ul>
      </div>

      <div className="main-content">
        <div className="welcome-card" style={{ borderLeft: '5px solid #6366f1' }}>
          <h1 style={{ color: '#333', marginBottom: '10px' }}>Platform Logs 📝</h1>
          <p style={{ color: '#666' }}>Real-time activity tracking from MongoDB Atlas.</p>
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
                backgroundColor: filter === tab ? '#6366f1' : '#e9ecef',
                color: filter === tab ? 'white' : '#495057',
              }}
            >
              {tab}
            </button>
          ))}
        </div>

        <div style={{ background: 'white', padding: '20px', borderRadius: '10px', boxShadow: '0 2px 10px rgba(0,0,0,0.05)' }}>
          {loading ? (
            <div style={{ textAlign: 'center', padding: '20px' }}>Connecting to Cloud Database...</div>
          ) : filteredLogs.length > 0 ? (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
              {filteredLogs.map(log => {
                const styles = getLogStyles(log.type);
                return (
                  <div key={log._id} style={{ 
                    display: 'flex', 
                    alignItems: 'center', 
                    padding: '15px', 
                    background: styles.bg, 
                    borderLeft: `4px solid ${styles.border}`, 
                    borderRadius: '0 8px 8px 0' 
                  }}>
                    <div style={{ fontSize: '24px', marginRight: '15px' }}>{log.icon || styles.icon}</div>
                    <div style={{ flex: 1 }}>
                      <strong style={{ display: 'block', color: '#333' }}>{log.title || log.message}</strong>
                      <span style={{ fontSize: '13px', color: '#666' }}>
                        User: <strong>{log.user}</strong> 
                      </span>
                    </div>
                    <div style={{ fontSize: '12px', color: '#888' }}>
                      {new Date(log.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <div style={{ textAlign: 'center', padding: '40px', color: '#777' }}>
              No real logs recorded yet. Try logging in again!
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default PlatformLogs;
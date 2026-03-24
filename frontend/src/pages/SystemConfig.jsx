import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import '../styles/Dashboard.css';

const SystemConfig = () => {
  const navigate = useNavigate();
  
  // State for form fields
  const [profile, setProfile] = useState({
    name: 'Admin User',
    email: 'admin@unicare.edu',
    role: 'Super Admin'
  });

  const [systemConfig, setSystemConfig] = useState({
    maintenanceMode: false,
    emailNotifications: true,
    publicFeedback: true
  });

  const handleLogout = () => {
    localStorage.removeItem('isLoggedIn');
    localStorage.removeItem('userRole');
    navigate('/');
  };

  const handleSave = () => {
    alert("Settings saved successfully! ✅");
  };

  return (
    <div className="dashboard-container">
      {/* Sidebar - Consistent with other Admin pages */}
      <div className="sidebar">
        <h2 style={{ color: '#333' }}>UniCare Admin</h2>
        <ul>
          <li onClick={() => navigate('/admin-dashboard')}>🛡️ Control Panel</li>
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

      {/* Main Content */}
      <div className="main-content">
        <div className="welcome-card" style={{ borderLeft: '5px solid #6c757d' }}>
          <h1 style={{ color: '#333', marginBottom: '10px' }}>Global Settings ⚙️</h1>
          <p style={{ color: '#666' }}>Manage your account security and platform-wide configurations.</p>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '30px' }}>
          
          {/* Section 1: Admin Profile */}
          <div style={{ background: 'white', padding: '25px', borderRadius: '10px', boxShadow: '0 2px 10px rgba(0,0,0,0.05)' }}>
            <h3 style={{ marginBottom: '20px', color: '#333' }}>👤 Admin Profile</h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
              <div>
                <label style={{ display: 'block', marginBottom: '5px', fontSize: '14px', color: '#666' }}>Full Name</label>
                <input 
                  type="text" 
                  value={profile.name} 
                  onChange={(e) => setProfile({...profile, name: e.target.value})}
                  style={{ width: '100%', padding: '10px', borderRadius: '5px', border: '1px solid #ddd' }}
                />
              </div>
              <div>
                <label style={{ display: 'block', marginBottom: '5px', fontSize: '14px', color: '#666' }}>Email Address</label>
                <input 
                  type="email" 
                  value={profile.email} 
                  style={{ width: '100%', padding: '10px', borderRadius: '5px', border: '1px solid #ddd', backgroundColor: '#f8f9fa' }} 
                  disabled 
                />
              </div>
              <button onClick={handleSave} style={{ padding: '10px', background: '#007bff', color: 'white', border: 'none', borderRadius: '5px', cursor: 'pointer', fontWeight: 'bold' }}>
                Update Profile
              </button>
            </div>
          </div>

          {/* Section 2: System Configuration */}
          <div style={{ background: 'white', padding: '25px', borderRadius: '10px', boxShadow: '0 2px 10px rgba(0,0,0,0.05)' }}>
            <h3 style={{ marginBottom: '20px', color: '#333' }}>🌐 System Configuration</h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
              
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div>
                  <strong style={{ display: 'block' }}>Maintenance Mode</strong>
                  <span style={{ fontSize: '12px', color: '#888' }}>Disable platform for all users</span>
                </div>
                <input 
                  type="checkbox" 
                  checked={systemConfig.maintenanceMode} 
                  onChange={(e) => setSystemConfig({...systemConfig, maintenanceMode: e.target.checked})}
                  style={{ width: '20px', height: '20px' }}
                />
              </div>

              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div>
                  <strong style={{ display: 'block' }}>Email Notifications</strong>
                  <span style={{ fontSize: '12px', color: '#888' }}>Send alerts for new feedback</span>
                </div>
                <input 
                  type="checkbox" 
                  checked={systemConfig.emailNotifications} 
                  onChange={(e) => setSystemConfig({...systemConfig, emailNotifications: e.target.checked})}
                  style={{ width: '20px', height: '20px' }}
                />
              </div>

              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div>
                  <strong style={{ display: 'block' }}>Allow Anonymous Feedback</strong>
                  <span style={{ fontSize: '12px', color: '#888' }}>Enable the anonymous toggle for students</span>
                </div>
                <input 
                  type="checkbox" 
                  checked={systemConfig.publicFeedback} 
                  onChange={(e) => setSystemConfig({...systemConfig, publicFeedback: e.target.checked})}
                  style={{ width: '20px', height: '20px' }}
                />
              </div>

              <button onClick={handleSave} style={{ padding: '10px', background: '#28a745', color: 'white', border: 'none', borderRadius: '5px', cursor: 'pointer', fontWeight: 'bold' }}>
                Save System Config
              </button>
            </div>
          </div>

          {/* Section 3: Danger Zone */}
          <div style={{ background: '#fff5f5', padding: '25px', borderRadius: '10px', boxShadow: '0 2px 10px rgba(0,0,0,0.05)', border: '1px solid #feb2b2', gridColumn: 'span 2' }}>
            <h3 style={{ marginBottom: '10px', color: '#c53030' }}>⚠️ Danger Zone</h3>
            <p style={{ fontSize: '14px', color: '#742a2a', marginBottom: '15px' }}>These actions are irreversible. Please be careful.</p>
            <div style={{ display: 'flex', gap: '15px' }}>
              <button style={{ padding: '10px 20px', background: '#c53030', color: 'white', border: 'none', borderRadius: '5px', cursor: 'pointer' }}>
                Purge All Logs
              </button>
              <button style={{ padding: '10px 20px', background: 'transparent', color: '#c53030', border: '1px solid #c53030', borderRadius: '5px', cursor: 'pointer' }}>
                Reset System Database
              </button>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
};

export default SystemConfig;
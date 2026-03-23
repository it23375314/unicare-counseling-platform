// src/pages/Settings.jsx
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import '../styles/Settings.css';
import '../styles/Auth.css'; // Reusing form input styles

const Settings = () => {
  const navigate = useNavigate();
  const [role, setRole] = useState('User');
  
  // -- New Advanced States --
  const [activeTab, setActiveTab] = useState('profile');
  
  const [hideDetails, setHideDetails] = useState(true); // Your privacy toggle!


  // 1. Initialize state by checking if they previously saved 'dark' in localStorage
  const [isDarkMode, setIsDarkMode] = useState(() => {
    return localStorage.getItem('theme') === 'dark';
  });

  // 2. Create a function to handle the toggle
  const toggleDarkMode = () => {
    const newMode = !isDarkMode;
    setIsDarkMode(newMode);
    
    if (newMode) {
      document.body.classList.add('dark-mode'); // Apply to the whole site
      localStorage.setItem('theme', 'dark');    // Save preference
    } else {
      document.body.classList.remove('dark-mode');
      localStorage.setItem('theme', 'light');
    }
  };

  useEffect(() => {
    const savedRole = localStorage.getItem('userRole');
    if (savedRole) setRole(savedRole.charAt(0).toUpperCase() + savedRole.slice(1));
  }, []);

  const handleBack = () => {
    if (role.toLowerCase() === 'admin') navigate('/admin-dashboard');
    else if (role.toLowerCase() === 'counsellor') navigate('/counsellor-dashboard');
    else navigate('/student-dashboard');
  };

  // 1. PROFILE TAB RENDERER
  const renderProfileTab = () => (
    <div className="tab-pane">
      <h2>Edit Profile</h2>
      <div style={{ display: 'flex', alignItems: 'center', gap: '20px', marginBottom: '30px' }}>
        <div style={{ width: '80px', height: '80px', background: '#e0f7fa', color: '#006064', borderRadius: '50%', display: 'flex', justifyContent: 'center', alignItems: 'center', fontSize: '32px', fontWeight: 'bold' }}>
          {role.charAt(0)}
        </div>
        <div>
          <button className="action-btn" style={{ padding: '8px 16px', fontSize: '14px' }}>Change Avatar</button>
        </div>
      </div>

      <div className="input-group">
        <label>Full Name</label>
        <input type="text" defaultValue="John Doe" />
      </div>

      <div className="input-group">
        <label>
          Email Address 
          {/* Privacy Toggle Button */}
          <button 
            onClick={() => setHideDetails(!hideDetails)} 
            style={{ float: 'right', background: 'none', border: 'none', color: '#007bff', cursor: 'pointer' }}
          >
            {hideDetails ? '👁️ Show' : '🙈 Hide'}
          </button>
        </label>
        <input 
          type="email" 
          value={hideDetails ? 'joh*****@uni.edu' : 'johndoe@uni.edu'} 
          disabled={hideDetails} 
          onChange={() => {}} 
        />
        <small style={{ color: '#888' }}>Your university provided email.</small>
      </div>
      <button className="action-btn" onClick={() => alert('Profile Saved!')}>Save Changes</button>
    </div>
  );

  // 2. SECURITY TAB RENDERER (Password & Devices)
  const renderSecurityTab = () => (
    <div className="tab-pane">
      <h2>Security & Access</h2>
      
      <div style={{ marginBottom: '40px' }}>
        <h3>Change Password</h3>
        <div className="input-group"><input type="password" placeholder="Current Password" /></div>
        <div className="input-group"><input type="password" placeholder="New Password" /></div>
        <button className="action-btn">Update Password</button>
      </div>

      <div>
        <h3>Logged-in Devices</h3>
        <p style={{ color: '#777', fontSize: '14px' }}>These devices are currently logged into your account.</p>
        
        <div className="device-item">
          <div className="device-info">
            <h4>💻 Windows PC - Chrome</h4>
            <p>Colombo, Sri Lanka • Active Now</p>
          </div>
          <button className="danger-btn" disabled style={{ borderColor: '#ccc', color: '#ccc' }}>Current</button>
        </div>

        <div className="device-item">
          <div className="device-info">
            <h4>📱 iPhone 13 - Safari</h4>
            <p>Kandy, Sri Lanka • Last seen 2 hours ago</p>
          </div>
          <button className="danger-btn" onClick={() => alert('Device logged out!')}>Log Out</button>
        </div>
      </div>
    </div>
  );

  // 3. PREFERENCES TAB RENDERER (Dark Mode)
  const renderPreferencesTab = () => (
    <div className="tab-pane">
      <h2>App Preferences</h2>
      
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '20px', background: isDarkMode ? '#2d2d2d' : '#f8f9fa', borderRadius: '8px' }}>
        <div>
          <h4 style={{ margin: '0 0 5px 0' }}>🌙 Dark Mode</h4>
          <p style={{ margin: 0, fontSize: '14px', color: '#777' }}>Switch to a darker theme for night viewing.</p>
        </div>
        <button 
          onClick={toggleDarkMode} /* <-- Change this line! */
          style={{ padding: '10px 20px', borderRadius: '20px', border: 'none', background: isDarkMode ? '#4caf50' : '#ccc', color: 'white', cursor: 'pointer', fontWeight: 'bold' }}
        >
          {isDarkMode ? 'ON' : 'OFF'}
        </button>
      </div>
    </div>
  );

  return (
    // The wrapper dynamically applies the "dark" or "light" class!
    <div className="settings-wrapper">
      <div className="settings-main-card">
        
        {/* Left Sidebar */}
        <div className="settings-sidebar">
          <h3>Settings</h3>
          <div className={`settings-menu-item ${activeTab === 'profile' ? 'active' : ''}`} onClick={() => setActiveTab('profile')}>
            👤 Edit Profile
          </div>
          <div className={`settings-menu-item ${activeTab === 'security' ? 'active' : ''}`} onClick={() => setActiveTab('security')}>
            🔒 Security & Devices
          </div>
          <div className={`settings-menu-item ${activeTab === 'preferences' ? 'active' : ''}`} onClick={() => setActiveTab('preferences')}>
            🎨 Preferences
          </div>
          
          <hr style={{ margin: '20px 0', borderColor: isDarkMode ? '#444' : '#eee' }} />
          
          <div className="settings-menu-item" onClick={handleBack} style={{ color: '#007bff' }}>
            &larr; Back to Dashboard
          </div>
        </div>

        {/* Right Content Area */}
        <div className="settings-content">
          {activeTab === 'profile' && renderProfileTab()}
          {activeTab === 'security' && renderSecurityTab()}
          {activeTab === 'preferences' && renderPreferencesTab()}
        </div>

      </div>
    </div>
  );
};

export default Settings;
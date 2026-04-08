import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import '../styles/Settings.css';
import '../styles/Auth.css'; 

const Settings = () => {
  const navigate = useNavigate();
  const [role, setRole] = useState('User');
  const [activeTab, setActiveTab] = useState('profile');
  const [hideDetails, setHideDetails] = useState(true);
  const [isDarkMode, setIsDarkMode] = useState(() => localStorage.getItem('theme') === 'dark');

  // User Profile State
  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
  });

  // Password State
  const [passwords, setPasswords] = useState({
    current: '',
    new: ''
  });

  // Device Sessions State
  const [sessions, setSessions] = useState([]);

  // 1. Fetch User Data & Sessions from MongoDB
  useEffect(() => {
    const fetchData = async () => {
      const userEmail = localStorage.getItem('userEmail');
      const savedRole = localStorage.getItem('userRole');
      if (savedRole) setRole(savedRole.charAt(0).toUpperCase() + savedRole.slice(1));

      try {
        // Fetch User Info
        const userRes = await fetch('http://localhost:5000/api/auth/users');
        if (userRes.ok) {
          const users = await userRes.json();
          const currentUser = users.find(u => u.email === userEmail);
          if (currentUser) {
            setFormData({
              fullName: currentUser.fullName || '',
              email: currentUser.email || ''
            });
          }
        }

        // Fetch Session Info
        const sessionRes = await fetch(`http://localhost:5000/api/auth/sessions/${userEmail}`);
        if (sessionRes.ok) {
          const sessionData = await sessionRes.json();
          setSessions(sessionData);
        }
      } catch (err) {
        console.error("Error loading data:", err);
      }
    };
    fetchData();
  }, []);

  // 2. Dark Mode Toggle
  const toggleDarkMode = () => {
    const newMode = !isDarkMode;
    setIsDarkMode(newMode);
    if (newMode) {
      document.body.classList.add('dark-mode');
      localStorage.setItem('theme', 'dark');
    } else {
      document.body.classList.remove('dark-mode');
      localStorage.setItem('theme', 'light');
    }
  };

  const handleBack = () => {
    const r = role.toLowerCase();
    if (r === 'admin') navigate('/admin-dashboard');
    else if (r === 'counsellor') navigate('/counsellor-dashboard');
    else navigate('/student-dashboard');
  };

  // 3. Save Profile Changes
  const handleSaveProfile = async () => {
    try {
      const response = await fetch('http://localhost:5000/api/auth/update-profile', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: formData.email,
          name: formData.fullName
        }),
      });

      if (response.ok) {
        alert('Profile saved successfully! ✅');
        localStorage.setItem('userName', formData.fullName);
      } else {
        alert('Failed to save profile. ❌');
      }
    } catch (err) {
      alert('Connection error.');
    }
  };

  // 4. Handle Password Update
  const handleUpdatePassword = async () => {
    if (!passwords.current || !passwords.new) {
      alert("Please fill in both fields.");
      return;
    }

    try {
      const response = await fetch('http://localhost:5000/api/auth/update-password', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: formData.email,
          currentPassword: passwords.current,
          newPassword: passwords.new
        }),
      });

      const data = await response.json();
      if (response.ok) {
        alert("Password updated successfully! 🔒");
        setPasswords({ current: '', new: '' });
      } else {
        alert(data.error || "Update failed.");
      }
    } catch (err) {
      alert("Server error during update.");
    }
  };

  // 5. Handle Remote Logout
  const handleRemoteLogout = async (sessionId) => {
    try {
      const res = await fetch(`http://localhost:5000/api/auth/sessions/${sessionId}`, {
        method: 'DELETE'
      });
      if (res.ok) {
        setSessions(sessions.filter(s => s._id !== sessionId));
        alert("Device logged out successfully! 👋");
      }
    } catch (err) {
      alert("Error during remote logout.");
    }
  };

  // --- TAB RENDERERS ---

  const renderProfileTab = () => (
    <div className="tab-pane">
      <h2>Edit Profile</h2>
      <div style={{ display: 'flex', alignItems: 'center', gap: '20px', marginBottom: '30px' }}>
        <div style={{ width: '80px', height: '80px', background: '#e0f7fa', color: '#006064', borderRadius: '50%', display: 'flex', justifyContent: 'center', alignItems: 'center', fontSize: '32px', fontWeight: 'bold' }}>
          {formData.fullName ? formData.fullName.charAt(0) : '?'}
        </div>
        <button className="action-btn" style={{ padding: '8px 16px', fontSize: '14px' }}>Change Avatar</button>
      </div>

      <div className="input-group">
        <label>Full Name</label>
        <input 
          type="text" 
          value={formData.fullName} 
          onChange={(e) => setFormData({...formData, fullName: e.target.value})} 
        />
      </div>

      <div className="input-group">
        <label>
          Email Address 
          <button onClick={() => setHideDetails(!hideDetails)} style={{ float: 'right', background: 'none', border: 'none', color: '#007bff', cursor: 'pointer' }}>
            {hideDetails ? '👁️ Show' : '🙈 Hide'}
          </button>
        </label>
        <input 
          type="email" 
          value={hideDetails ? formData.email.replace(/(.{3})(.*)(?=@)/, "$1****") : formData.email} 
          disabled 
          style={{ backgroundColor: isDarkMode ? '#1a1a1a' : '#f9f9f9' }}
        />
      </div>
      <button className="action-btn" onClick={handleSaveProfile}>Save Changes</button>
    </div>
  );

  const renderSecurityTab = () => (
    <div className="tab-pane">
      <h2>Security & Access</h2>
      
      <div style={{ marginBottom: '40px' }}>
        <h3>Change Password</h3>
        <div className="input-group">
          <input 
            type="password" 
            placeholder="Current Password" 
            value={passwords.current}
            onChange={(e) => setPasswords({...passwords, current: e.target.value})}
          />
        </div>
        <div className="input-group">
          <input 
            type="password" 
            placeholder="New Password" 
            value={passwords.new}
            onChange={(e) => setPasswords({...passwords, new: e.target.value})}
          />
        </div>
        <button className="action-btn" onClick={handleUpdatePassword}>Update Password</button>
      </div>

      <div>
        <h3>Logged-in Devices</h3>
        <p style={{ color: '#777', fontSize: '14px', marginBottom: '15px' }}>Devices currently accessing your account.</p>
        
        {sessions.length === 0 ? (
          <p style={{ fontStyle: 'italic', color: '#999' }}>No other active sessions detected.</p>
        ) : (
          sessions.map((s) => (
            <div key={s._id} className="device-item" style={{ display: 'flex', justifyContent: 'space-between', padding: '15px', background: isDarkMode ? '#2d2d2d' : '#f8f9fa', borderRadius: '8px', marginBottom: '10px' }}>
              <div className="device-info">
                <h4 style={{ margin: 0 }}>{s.device}</h4>
                <p style={{ margin: 0, fontSize: '12px', color: '#888' }}>{s.location} • Last seen {new Date(s.lastSeen).toLocaleTimeString()}</p>
              </div>
              <button 
                onClick={() => handleRemoteLogout(s._id)}
                style={{ background: 'transparent', color: '#dc3545', border: '1px solid #dc3545', padding: '5px 12px', borderRadius: '5px', cursor: 'pointer' }}
              >
                Log Out
              </button>
            </div>
          ))
        )}
      </div>
    </div>
  );

  const renderPreferencesTab = () => (
    <div className="tab-pane">
      <h2>App Preferences</h2>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '20px', background: isDarkMode ? '#2d2d2d' : '#f8f9fa', borderRadius: '8px' }}>
        <div>
          <h4 style={{ margin: '0 0 5px 0' }}>🌙 Dark Mode</h4>
          <p style={{ margin: 0, fontSize: '14px', color: '#777' }}>Switch to a darker theme for night viewing.</p>
        </div>
        <button 
          onClick={toggleDarkMode}
          style={{ padding: '10px 20px', borderRadius: '20px', border: 'none', background: isDarkMode ? '#4caf50' : '#ccc', color: 'white', cursor: 'pointer', fontWeight: 'bold' }}
        >
          {isDarkMode ? 'ON' : 'OFF'}
        </button>
      </div>
    </div>
  );

  return (
    <div className="settings-wrapper">
      <div className="settings-main-card">
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
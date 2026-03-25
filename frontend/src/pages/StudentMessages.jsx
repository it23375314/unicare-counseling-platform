import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import '../styles/Dashboard.css';

const StudentMessages = () => {
  const navigate = useNavigate();
  const [messageText, setMessageText] = useState('');

  // Mock data for the assigned counsellor
  const counsellor = { name: 'Dr. Sarah Jenkins', online: true };

  const handleLogout = () => {
    localStorage.removeItem('isLoggedIn');
    localStorage.removeItem('userRole');
    navigate('/');
  };

  return (
    <div className="dashboard-container">
      {/* Student Sidebar */}
      <div className="sidebar">
        <h2 style={{ color: '#007bff', marginBottom: '30px', paddingLeft: '20px' }}>UniCare</h2>
        <ul>
          <li onClick={() => navigate('/student-dashboard')}>🏠 Overview</li>
          <li>📅 Appointments</li>
          <li>🧘‍♀️ Wellness Resources</li>
          <li style={{ backgroundColor: '#f0f4ff', color: '#007bff', fontWeight: 'bold' }}>💬 Messages</li>
          <li onClick={() => navigate('/settings')}>⚙️ Settings</li>
        </ul>
        <div style={{ marginTop: 'auto', paddingLeft: '20px', paddingBottom: '20px' }}>
          <li onClick={handleLogout} style={{ color: '#dc3545', listStyle: 'none', cursor: 'pointer' }}>🚪 Logout</li>
        </div>
      </div>

      {/* Main Chat Area */}
      <div className="main-content" style={{ display: 'flex', flexDirection: 'column', height: '100vh', padding: '0' }}>
        
        {/* Chat Header */}
        <div style={{ padding: '20px 30px', background: 'white', borderBottom: '1px solid #eee', display: 'flex', alignItems: 'center', gap: '15px' }}>
          <div style={{ width: '45px', height: '45px', borderRadius: '50%', background: '#007bff', color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 'bold' }}>
            SJ
          </div>
          <div>
            <h3 style={{ margin: 0 }}>{counsellor.name}</h3>
            <span style={{ fontSize: '12px', color: '#28a745' }}>Online</span>
          </div>
        </div>

        {/* Messages Feed */}
        <div style={{ flex: 1, padding: '30px', overflowY: 'auto', background: '#f8f9fa', display: 'flex', flexDirection: 'column', gap: '15px' }}>
          <div style={{ alignSelf: 'flex-start', background: '#007bff', color: 'white', padding: '12px 18px', borderRadius: '15px 15px 15px 0', maxWidth: '70%', fontSize: '14px' }}>
            Hi there! How are you feeling today?
          </div>
          <div style={{ alignSelf: 'flex-end', background: 'white', border: '1px solid #ddd', padding: '12px 18px', borderRadius: '15px 15px 0 15px', maxWidth: '70%', fontSize: '14px' }}>
            I'm feeling a bit better, thanks for checking in!
          </div>
        </div>

        {/* Message Input */}
        <div style={{ padding: '20px 30px', background: 'white', borderTop: '1px solid #eee' }}>
          <div style={{ display: 'flex', gap: '10px' }}>
            <input 
              type="text" 
              placeholder="Type your message to the counsellor..." 
              value={messageText}
              onChange={(e) => setMessageText(e.target.value)}
              style={{ flex: 1, padding: '12px 20px', borderRadius: '25px', border: '1px solid #eee', background: '#f8f9fa' }}
            />
            <button style={{ background: '#007bff', color: 'white', border: 'none', padding: '0 25px', borderRadius: '25px', cursor: 'pointer', fontWeight: 'bold' }}>
              Send
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default StudentMessages;
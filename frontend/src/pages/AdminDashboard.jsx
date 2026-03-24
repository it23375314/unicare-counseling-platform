import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import '../styles/Dashboard.css'; 

const AdminDashboard = () => {
  const navigate = useNavigate();
  
  // 1. State to hold the feedback from our "database"
  const [feedbacks, setFeedbacks] = useState([]);

  // 2. Fetch Feedback when the dashboard loads
  useEffect(() => {
    const savedFeedback = JSON.parse(localStorage.getItem('systemFeedback')) || [];
    // Reverse it so the newest feedback shows at the top!
    setFeedbacks(savedFeedback.reverse());
  }, []);

  const handleLogout = () => {
    // Destroy the wristband!
    localStorage.removeItem('isLoggedIn');
    localStorage.removeItem('userRole');
    
    // Send them back to login
    navigate('/');
  };

  // 3. Delete Feedback function
  const handleDeleteFeedback = (idToRemove) => {
    const updatedFeedback = feedbacks.filter(item => item.id !== idToRemove);
    setFeedbacks(updatedFeedback);
    localStorage.setItem('systemFeedback', JSON.stringify(updatedFeedback));
  };

  return (
    <div className="dashboard-container">
      {/* Left Sidebar for Admin (Kept exactly as yours!) */}
      <div className="sidebar">
        <h2 style={{ color: '#333' }}>UniCare Admin</h2>
        <ul>
          <li style={{ backgroundColor: '#f0f4ff', color: '#007bff' }}>📊 System Analytics</li>
          <li>👥 User Management</li>
          <li>📝 Platform Logs</li>
          <li>⚙️ Global Settings</li>
          <li onClick={() => navigate('/settings')}>⚙️ Settings</li>
        </ul>
        <ul style={{ flex: 0 }}>
          <li onClick={handleLogout} style={{ color: '#dc3545' }}>🚪 Logout</li>
        </ul>
      </div>

      {/* Main Content Area */}
      <div className="main-content">
        <div className="welcome-card">
          <h1 style={{ color: '#333', marginBottom: '10px' }}>Admin Control Panel 🛡️</h1>
          <p style={{ color: '#666' }}>Monitor platform health, manage user accounts, and review feedback.</p>
        </div>
        
        {/* Your Original Stat Boxes */}
        <div style={{ display: 'flex', gap: '20px', marginBottom: '30px' }}>
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

        {/* System Feedback Section with Scrollbar */}
        <div style={{ background: 'white', padding: '25px', borderRadius: '10px', boxShadow: '0 2px 10px rgba(0,0,0,0.05)' }}>
          <h3 style={{ color: '#333', marginBottom: '20px', borderBottom: '2px solid #eee', paddingBottom: '10px' }}>
            📬 Recent System Feedback
          </h3>

          {feedbacks.length > 0 ? (
            <div style={{ 
              display: 'flex', 
              flexDirection: 'column', 
              gap: '15px',
              maxHeight: '400px', /* Limits the height to show ~4-5 items */
              overflowY: 'auto',  /* Adds the vertical scrollbar */
              paddingRight: '10px' /* Adds breathing room for the scrollbar */
            }}>
              {feedbacks.map((item) => (
                <div key={item.id} style={{ padding: '15px', background: '#f8f9fa', borderRadius: '8px', borderLeft: item.sender.includes('Anonymous') ? '4px solid #6c757d' : '4px solid #28a745', position: 'relative' }}>
                  
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
                    <strong style={{ color: item.sender.includes('Anonymous') ? '#6c757d' : '#28a745' }}>
                      {item.sender}
                    </strong>
                    <span style={{ fontSize: '12px', color: '#888' }}>{item.date}</span>
                  </div>
                  
                  <p style={{ margin: 0, color: '#444', lineHeight: '1.5' }}>{item.text}</p>
                  
                  <button 
                    onClick={() => handleDeleteFeedback(item.id)}
                    style={{ position: 'absolute', top: '15px', right: '15px', background: 'transparent', border: 'none', color: '#dc3545', cursor: 'pointer', fontSize: '14px' }}
                    title="Delete Feedback"
                  >
                    🗑️
                  </button>
                </div>
              ))}
            </div>
          ) : (
            <div style={{ textAlign: 'center', padding: '30px', color: '#777', background: '#f8f9fa', borderRadius: '8px' }}>
              <p>No new feedback at the moment. The system is running smoothly! ✨</p>
            </div>
          )}
        </div>

      </div>
    </div>
  );
};

export default AdminDashboard;
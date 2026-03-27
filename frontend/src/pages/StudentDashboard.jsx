import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import '../styles/Dashboard.css'; 
import FeedbackForm from '../components/FeedbackForm'; 

const StudentDashboard = () => {
  const navigate = useNavigate();

  const [quote, setQuote] = useState("You are stronger than you think. Take it one day at a time.");
  const [selectedMood, setSelectedMood] = useState(null);

  // Mock data for our beautiful CSS Bar Chart!
  const [weeklyMoodData] = useState([
    { day: 'Mon', score: 60 },
    { day: 'Tue', score: 80 },
    { day: 'Wed', score: 40 },
    { day: 'Thu', score: 90 },
    { day: 'Fri', score: 70 },
    { day: 'Sat', score: 85 },
    { day: 'Sun', score: 100 },
  ]);

  const handleLogout = () => {
    localStorage.removeItem('isLoggedIn');
    localStorage.removeItem('userRole');
    navigate('/');
  };

  const handleMoodSelect = (mood) => {
    setSelectedMood(mood);
  };

  return (
    <div className="dashboard-container">
      {/* Left Sidebar */}
      <div className="sidebar">
        <div className="sidebar-brand">UniCare</div>
        <ul>
          <li className="active">🏠 Dashboard</li>
          <li onClick={() => navigate('/appointments')}>📅 Appointments</li>
          <li onClick={() => navigate('/resources')}>🧘‍♀️ Wellness Resources</li>
          <li onClick={() => navigate('/student-messages')}>💬 Messages</li>
          <li onClick={() => navigate('/settings')}>⚙️ Settings</li>
        </ul>
        <div className="logout-btn" onClick={handleLogout} style={{ marginTop: 'auto', listStyle: 'none', paddingLeft: '15px' }}>
          <li>🚪 Logout</li>
        </div>
      </div>

      {/* Main Content Area */}
      <div className="main-content">
        
        {/* Welcome Header */}
        <div style={{ marginBottom: '30px' }}>
          <h1 style={{ fontSize: '28px', color: '#111827', margin: '0 0 8px 0' }}>Welcome back, Student! 👋</h1>
          <p style={{ color: '#6b7280', margin: 0 }}>How are you feeling today? Let's take care of your mental well-being.</p>
        </div>
        
        {/* Dynamic Widgets Area */}
        <div style={{ display: 'flex', gap: '24px', alignItems: 'flex-start' }}>
          
          {/* Wellness Progress Graph Widget (Left) */}
          <div className="card" style={{ flex: 1 }}>
            <h3>Your Wellness Journey</h3>
            <p style={{ color: '#6b7280', fontSize: '14px', marginBottom: '24px' }}>Your mood tracking over the last 7 days.</p>
            
            {/* Pure CSS Bar Chart */}
            <div style={{ 
              display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between', 
              height: '160px', paddingBottom: '10px', borderBottom: '1px solid #f3f4f6' 
            }}>
              {weeklyMoodData.map((data, index) => (
                // FIX APPLIED HERE: Added height: '100%' and justifyContent: 'flex-end'
                <div key={index} style={{ display: 'flex', flexDirection: 'column', justifyContent: 'flex-end', alignItems: 'center', width: '100%', height: '100%' }}>
                  {/* The Bar */}
                  <div 
                    title={`Score: ${data.score}%`}
                    style={{
                      height: `${data.score}%`,
                      width: '32px',
                      backgroundColor: data.score >= 80 ? '#2563eb' : (data.score >= 60 ? '#60a5fa' : '#bfdbfe'),
                      borderRadius: '6px 6px 0 0',
                      transition: 'height 0.3s ease'
                    }}
                  ></div>
                </div>
              ))}
            </div>
            
            {/* X-Axis Labels */}
            <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '12px' }}>
              {weeklyMoodData.map((data, index) => (
                <span key={index} style={{ fontSize: '13px', color: '#6b7280', width: '100%', textAlign: 'center', fontWeight: '500' }}>
                  {data.day}
                </span>
              ))}
            </div>
          </div>

          {/* Daily Wellness Widget (Right) */}
          <div className="card" style={{ flex: 1, backgroundColor: '#fdf2f8', border: '1px solid #fbcfe8' }}>
            <h3 style={{ color: '#be185d' }}>Daily Wellness</h3>
            <p style={{ color: '#831843', fontStyle: 'italic', lineHeight: '1.5', fontSize: '15px' }}>
              "{quote}"
            </p>
            
            <div style={{ marginTop: '24px' }}>
              <p style={{ marginBottom: '12px', fontSize: '14px', fontWeight: '600', color: '#9d174d' }}>
                Quick Mood Check:
              </p>
              <div style={{ display: 'flex', gap: '12px' }}>
                <button 
                  onClick={() => handleMoodSelect('sad')}
                  style={{ 
                    fontSize: '24px', background: selectedMood === 'sad' ? '#fbcfe8' : 'white', 
                    border: '1px solid #f9a8d4', borderRadius: '50%', padding: '8px', 
                    cursor: 'pointer', transition: 'all 0.2s', width: '50px', height: '50px'
                  }}
                >😫</button>
                <button 
                  onClick={() => handleMoodSelect('neutral')}
                  style={{ 
                    fontSize: '24px', background: selectedMood === 'neutral' ? '#fbcfe8' : 'white', 
                    border: '1px solid #f9a8d4', borderRadius: '50%', padding: '8px', 
                    cursor: 'pointer', transition: 'all 0.2s', width: '50px', height: '50px'
                  }}
                >😐</button>
                <button 
                  onClick={() => handleMoodSelect('happy')}
                  style={{ 
                    fontSize: '24px', background: selectedMood === 'happy' ? '#fbcfe8' : 'white', 
                    border: '1px solid #f9a8d4', borderRadius: '50%', padding: '8px', 
                    cursor: 'pointer', transition: 'all 0.2s', width: '50px', height: '50px'
                  }}
                >🙂</button>
              </div>
              {selectedMood && (
                 <p style={{ marginTop: '10px', fontSize: '13px', color: '#be185d', fontWeight: 'bold' }}>Thanks for checking in today!</p>
              )}
            </div>
          </div>

        </div>

        {/* FEEDBACK FORM */}
        <div style={{ marginTop: '10px' }}>
          <FeedbackForm />
        </div>
        
      </div>
    </div>
  );
};

export default StudentDashboard;
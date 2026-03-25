import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import '../styles/Dashboard.css';
import FeedbackForm from '../components/FeedbackForm';

const StudentDashboard = () => {
  const navigate = useNavigate();

  // 1. Setup mock data for our widgets! (Later, this will come from a database)
  const [appointments, setAppointments] = useState([
    { id: 1, date: 'Oct 28', time: '10:00 AM', counselor: 'Dr. Sarah Jenkins' }
  ]);

  const [quote, setQuote] = useState("You are stronger than you think. Take it one day at a time.");

  const handleLogout = () => {
    localStorage.removeItem('isLoggedIn');
    localStorage.removeItem('userRole');
    navigate('/');
  };

  return (
    <div className="dashboard-container">
      {/* Left Sidebar */}
      <div className="sidebar">
        <h2>UniCare</h2>
        <ul>
          <li style={{ backgroundColor: '#f0f4ff', color: '#007bff' }}>🏠 Dashboard</li>
          <li>📅 Appointments</li>
          <li>🧘‍♀️ Wellness Resources</li>
          <li onClick={() => navigate('/student-messages')}>💬 Messages</li>
          <li onClick={() => navigate('/settings')}>⚙️ Settings</li>
        </ul>
        <ul style={{ flex: 0 }}>
          <li onClick={handleLogout} style={{ color: '#dc3545' }}>🚪 Logout</li>
        </ul>
      </div>

      {/* Main Content Area */}
      <div className="main-content">
        <div className="welcome-card">
          <h1 style={{ color: '#333', marginBottom: '10px' }}>Welcome back, Student! 👋</h1>
          <p style={{ color: '#666' }}>How are you feeling today? Let's take care of your mental well-being.</p>
        </div>
        
        {/* Dynamic Widgets Area */}
        <div style={{ display: 'flex', gap: '20px' }}>
          
          {/* Upcoming Appointments Widget */}
          <div style={{ flex: 1, padding: '20px', background: '#e0f7fa', borderRadius: '10px' }}>
            <h3 style={{ color: '#006064', marginBottom: '15px' }}>Upcoming Session</h3>
            
            {appointments.length > 0 ? (
              appointments.map((apt) => (
                <div key={apt.id} style={{ backgroundColor: 'rgba(255,255,255,0.5)', padding: '10px', borderRadius: '8px', marginBottom: '10px' }}>
                  <strong>{apt.date} at {apt.time}</strong>
                  <p style={{ margin: '5px 0 0 0', fontSize: '14px' }}>with {apt.counselor}</p>
                </div>
              ))
            ) : (
              <p style={{ color: '#555' }}>No appointments booked yet.</p>
            )}
            
            <button style={{ marginTop: '10px', padding: '8px 16px', backgroundColor: '#007bff', color: 'white', border: 'none', borderRadius: '5px', cursor: 'pointer' }}>
              Book New Session
            </button>
          </div>

          {/* Daily Wellness Widget */}
          <div style={{ flex: 1, padding: '20px', background: '#fce4ec', borderRadius: '10px' }}>
            <h3 style={{ color: '#880e4f', marginBottom: '15px' }}>Daily Wellness</h3>
            <p style={{ color: '#555', fontStyle: 'italic', lineHeight: '1.5' }}>"{quote}"</p>
            
            <div style={{ marginTop: '20px' }}>
              <p style={{ marginBottom: '10px', fontSize: '14px', fontWeight: 'bold' }}>Quick Mood Check:</p>
              <div style={{ display: 'flex', gap: '10px' }}>
                <button style={{ fontSize: '20px', background: 'none', border: 'none', cursor: 'pointer' }}>😫</button>
                <button style={{ fontSize: '20px', background: 'none', border: 'none', cursor: 'pointer' }}>😐</button>
                <button style={{ fontSize: '20px', background: 'none', border: 'none', cursor: 'pointer' }}>🙂</button>
              </div>
            </div>
          </div>

        </div>

        {/* ADD THE FEEDBACK FORM HERE */}
        <div style={{ marginTop: '30px' }}>
          <FeedbackForm />
        </div>
      </div>
    </div>
  );
};

export default StudentDashboard;
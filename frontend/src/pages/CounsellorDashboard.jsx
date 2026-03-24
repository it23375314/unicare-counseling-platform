import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import '../styles/Dashboard.css'; 
import FeedbackForm from '../components/FeedbackForm';

const CounsellorDashboard = () => {
  const navigate = useNavigate();

  // 1. Dynamic State for Appointments
  const [appointments, setAppointments] = useState([
    { id: 1, studentName: 'Alex Johnson', time: '10:00 AM', type: 'Video Call' },
    { id: 2, studentName: 'Maria Garcia', time: '1:30 PM', type: 'In-Person' }
  ]);

  // 2. Dynamic State for Pending Requests
  const [pendingRequests, setPendingRequests] = useState([
    { id: 101, studentName: 'Emma Wilson', topic: 'Anxiety & Midterms', date: 'Oct 29' },
    { id: 102, studentName: 'Liam Brown', topic: 'Career Guidance', date: 'Oct 30' }
  ]);

  // --- ACTION FUNCTIONS ---

  const handleApprove = (requestToApprove) => {
    // 1. Remove the student from the Pending list
    setPendingRequests(pendingRequests.filter(req => req.id !== requestToApprove.id));
    
    // 2. Create a new appointment object
    const newAppointment = {
      id: requestToApprove.id,
      studentName: requestToApprove.studentName,
      time: 'TBD', // In a real app, you'd open a calendar to pick a time here!
      type: 'Video Call'
    };
    
    // 3. Add them to the Appointments list
    setAppointments([...appointments, newAppointment]);
  };

  const handleDecline = (requestId) => {
    // Just remove them from the Pending list without adding to appointments
    setPendingRequests(pendingRequests.filter(req => req.id !== requestId));
  };

  const handleLogout = () => {
    localStorage.removeItem('isLoggedIn');
    localStorage.removeItem('userRole');
    navigate('/');
  };

  return (
    <div className="dashboard-container">
      {/* Left Sidebar */}
      <div className="sidebar">
        <h2>UniCare Pro</h2>
        <ul>
          <li style={{ backgroundColor: '#f0f4ff', color: '#007bff' }}>🏠 Overview</li>
          <li>📅 My Schedule</li>
          <li>📁 Student Records</li>
          <li>💬 Messages</li>
          <li onClick={() => navigate('/settings')}>⚙️ Settings</li>
        </ul>
        <ul style={{ flex: 0 }}>
          <li onClick={handleLogout} style={{ color: '#dc3545' }}>🚪 Logout</li>
        </ul>
      </div>

      {/* Main Content Area */}
      <div className="main-content">
        <div className="welcome-card">
          <h1 style={{ color: '#333', marginBottom: '10px' }}>Welcome back, Counsellor! 🩺</h1>
          <p style={{ color: '#666' }}>Here is your schedule and student overview for today.</p>
        </div>
        
        <div style={{ display: 'flex', gap: '20px', alignItems: 'flex-start' }}>
          
          {/* Today's Appointments Widget */}
          <div style={{ flex: 1, padding: '20px', background: '#e8f5e9', borderRadius: '10px' }}>
            <h3 style={{ color: '#1b5e20', marginBottom: '15px' }}>
              Today's Appointments ({appointments.length})
            </h3>
            
            {appointments.length > 0 ? (
              appointments.map((apt) => (
                <div key={apt.id} style={{ backgroundColor: 'rgba(255,255,255,0.8)', padding: '15px', borderRadius: '8px', marginBottom: '10px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <div>
                    <strong style={{ display: 'block', color: '#333' }}>{apt.time} - {apt.studentName}</strong>
                    <span style={{ fontSize: '13px', color: '#555' }}>{apt.type}</span>
                  </div>
                  <button style={{ padding: '6px 12px', backgroundColor: '#4caf50', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer', fontWeight: 'bold' }}>
                    Join
                  </button>
                </div>
              ))
            ) : (
              <p style={{ color: '#555' }}>No appointments scheduled for today. Take a breather! ☕</p>
            )}
          </div>

          {/* Pending Requests Widget */}
          <div style={{ flex: 1, padding: '20px', background: '#fff3e0', borderRadius: '10px' }}>
            <h3 style={{ color: '#e65100', marginBottom: '15px' }}>
              Pending Requests ({pendingRequests.length})
            </h3>
            
            {pendingRequests.length > 0 ? (
              pendingRequests.map((req) => (
                <div key={req.id} style={{ backgroundColor: 'rgba(255,255,255,0.8)', padding: '15px', borderRadius: '8px', marginBottom: '10px' }}>
                  <strong style={{ display: 'block', color: '#333', fontSize: '16px' }}>{req.studentName}</strong>
                  <p style={{ margin: '5px 0', fontSize: '14px', color: '#555' }}>Topic: {req.topic}</p>
                  
                  <div style={{ display: 'flex', gap: '10px', marginTop: '15px' }}>
                    <button 
                      onClick={() => handleApprove(req)}
                      style={{ flex: 1, padding: '8px', backgroundColor: '#ff9800', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer', fontWeight: 'bold' }}
                    >
                      Approve
                    </button>
                    <button 
                      onClick={() => handleDecline(req.id)}
                      style={{ flex: 1, padding: '8px', backgroundColor: 'transparent', color: '#e65100', border: '1px solid #ff9800', borderRadius: '4px', cursor: 'pointer', fontWeight: 'bold' }}
                    >
                      Decline
                    </button>
                  </div>
                </div>
              ))
            ) : (
              <p style={{ color: '#555' }}>You are all caught up on requests! 🎉</p>
            )}
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

export default CounsellorDashboard;
import React from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend 
} from 'recharts';
import "../styles/Dashboard.css";
import FeedbackForm from '../components/FeedbackForm';

const CounsellorDashboard = () => {
  const navigate = useNavigate();

  // Mock Data for the Graph
  const statsData = [
    { day: 'Mon', sessions: 4, averageAnxietyLevel: 6 },
    { day: 'Tue', sessions: 3, averageAnxietyLevel: 5 },
    { day: 'Wed', sessions: 6, averageAnxietyLevel: 8 },
    { day: 'Thu', sessions: 5, averageAnxietyLevel: 6 },
    { day: 'Fri', sessions: 2, averageAnxietyLevel: 4 },
  ];

  const handleLogout = () => {
    localStorage.removeItem('isLoggedIn');
    localStorage.removeItem('userRole');
    navigate('/');
  };

  return (
    <div className="dashboard-container">
      {/* Left Sidebar */}
      <div className="sidebar">
        <div className="sidebar-brand">UniCare Pro</div>
        <ul>
          <li className="active">🏠 Overview</li>
          <li onClick={() => navigate('/my-schedule')}>📅 My Schedule</li>
          <li onClick={() => navigate('/student-records')}>📋 Student Records</li>
          <li onClick={() => navigate('/messages')}>💬 Messages</li>
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
          <h1 style={{ fontSize: '28px', color: '#111827', margin: '0 0 8px 0' }}>Welcome back, Counsellor! 🩺</h1>
          <p style={{ color: '#6b7280', margin: 0 }}>Here is your overview for today.</p>
        </div>

        {/* Weekly Overview Graph Widget */}
        <div className="card" style={{ marginBottom: '24px', padding: '20px' }}>
          <h3>Weekly Overview: Sessions & Student Anxiety Trends</h3>
          <div style={{ height: '300px', width: '100%', marginTop: '20px' }}>
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={statsData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f3f4f6" />
                <XAxis dataKey="day" stroke="#6b7280" fontSize={12} />
                <YAxis stroke="#6b7280" fontSize={12} />
                <Tooltip 
                  contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px rgba(0,0,0,0.1)' }} 
                />
                <Legend verticalAlign="top" height={36}/>
                <Line 
                  type="monotone" 
                  dataKey="sessions" 
                  name="No. of Sessions" 
                  stroke="#4f46e5" 
                  strokeWidth={3} 
                  activeDot={{ r: 8 }} 
                />
                <Line 
                  type="monotone" 
                  dataKey="averageAnxietyLevel" 
                  name="Avg. Reported Anxiety (1-10)" 
                  stroke="#ef4444" 
                  strokeWidth={3} 
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Feedback Form */}
        <div>
          <FeedbackForm />
        </div>
        
      </div>
    </div>
  );
};

export default CounsellorDashboard;
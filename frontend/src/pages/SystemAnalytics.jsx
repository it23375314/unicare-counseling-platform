import React from 'react';
import { useNavigate } from 'react-router-dom';
import '../styles/Dashboard.css';

const SystemAnalytics = () => {
  const navigate = useNavigate();

  const handleLogout = () => {
    localStorage.removeItem('isLoggedIn');
    localStorage.removeItem('userRole');
    navigate('/');
  };

  // Mock Data for the Bar Chart
  const monthlyData = [
    { month: 'Jan', sessions: 45, height: '40%' },
    { month: 'Feb', sessions: 60, height: '55%' },
    { month: 'Mar', sessions: 85, height: '80%' },
    { month: 'Apr', sessions: 50, height: '45%' },
    { month: 'May', sessions: 110, height: '100%' },
    { month: 'Jun', sessions: 90, height: '85%' },
  ];

  // Mock Data for Issue Categories
  const issueCategories = [
    { name: 'Academic Stress', percentage: 45, color: '#dc3545' },
    { name: 'Career Anxiety', percentage: 30, color: '#ffc107' },
    { name: 'Personal/Relationships', percentage: 15, color: '#17a2b8' },
    { name: 'Other', percentage: 10, color: '#6c757d' }
  ];

  return (
    <div className="dashboard-container">
      {/* Left Sidebar for Admin */}
      <div className="sidebar">
        <h2 style={{ color: '#333' }}>UniCare Admin</h2>
        <ul>
          {/* Active page gets the blue background */}
          <li style={{ backgroundColor: '#f0f4ff', color: '#007bff' }} onClick={() => navigate('/admin-dashboard')}>
            🛡️ Control Panel
          </li>
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

      {/* Main Content Area */}
      <div className="main-content">
        <div className="welcome-card" style={{ borderLeft: '5px solid #ffc107', marginBottom: '30px' }}>
          <h1 style={{ color: '#333', marginBottom: '10px' }}>System Analytics 📊</h1>
          <p style={{ color: '#666' }}>Overview of platform usage, appointment trends, and user demographics.</p>
        </div>

        {/* Top KPI Cards */}
        <div style={{ display: 'flex', gap: '20px', marginBottom: '30px' }}>
          <div style={{ flex: 1, padding: '20px', background: 'white', borderRadius: '10px', boxShadow: '0 2px 10px rgba(0,0,0,0.05)', borderTop: '4px solid #007bff' }}>
            <p style={{ margin: 0, color: '#666', fontSize: '14px', fontWeight: 'bold' }}>Total Sessions</p>
            <h2 style={{ margin: '10px 0 0 0', color: '#333', fontSize: '32px' }}>842</h2>
            <span style={{ color: '#28a745', fontSize: '12px', fontWeight: 'bold' }}>↑ +12% this month</span>
          </div>
          <div style={{ flex: 1, padding: '20px', background: 'white', borderRadius: '10px', boxShadow: '0 2px 10px rgba(0,0,0,0.05)', borderTop: '4px solid #28a745' }}>
            <p style={{ margin: 0, color: '#666', fontSize: '14px', fontWeight: 'bold' }}>Avg. Satisfaction</p>
            <h2 style={{ margin: '10px 0 0 0', color: '#333', fontSize: '32px' }}>4.8<span style={{fontSize: '20px', color: '#aaa'}}>/5</span></h2>
            <span style={{ color: '#28a745', fontSize: '12px', fontWeight: 'bold' }}>↑ +0.2 this month</span>
          </div>
          <div style={{ flex: 1, padding: '20px', background: 'white', borderRadius: '10px', boxShadow: '0 2px 10px rgba(0,0,0,0.05)', borderTop: '4px solid #6f42c1' }}>
            <p style={{ margin: 0, color: '#666', fontSize: '14px', fontWeight: 'bold' }}>Active Counsellors</p>
            <h2 style={{ margin: '10px 0 0 0', color: '#333', fontSize: '32px' }}>24</h2>
            <span style={{ color: '#666', fontSize: '12px' }}>Across 5 departments</span>
          </div>
        </div>

        {/* Charts Row */}
        <div style={{ display: 'flex', gap: '20px' }}>
          
          {/* Custom CSS Bar Chart: Monthly Appointments */}
          <div style={{ flex: 2, background: 'white', padding: '25px', borderRadius: '10px', boxShadow: '0 2px 10px rgba(0,0,0,0.05)' }}>
            <h3 style={{ marginTop: 0, color: '#333', marginBottom: '30px' }}>Monthly Appointments</h3>
            
            {/* Chart Container */}
            <div style={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between', height: '200px', paddingBottom: '10px', borderBottom: '2px solid #eee' }}>
              {monthlyData.map((data, index) => (
                <div key={index} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', width: '12%' }}>
                  <span style={{ fontSize: '12px', color: '#007bff', fontWeight: 'bold', marginBottom: '5px' }}>{data.sessions}</span>
                  <div style={{ 
                    width: '100%', 
                    backgroundColor: '#007bff', 
                    height: data.height, 
                    borderRadius: '4px 4px 0 0',
                    transition: 'height 0.5s ease-in-out'
                  }}></div>
                </div>
              ))}
            </div>
            {/* X-Axis Labels */}
            <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '10px' }}>
              {monthlyData.map((data, index) => (
                <div key={index} style={{ width: '12%', textAlign: 'center', fontSize: '13px', color: '#666', fontWeight: 'bold' }}>
                  {data.month}
                </div>
              ))}
            </div>
          </div>

          {/* Progress Bars: Issue Categories */}
          <div style={{ flex: 1, background: 'white', padding: '25px', borderRadius: '10px', boxShadow: '0 2px 10px rgba(0,0,0,0.05)' }}>
            <h3 style={{ marginTop: 0, color: '#333', marginBottom: '20px' }}>Primary Topics</h3>
            
            <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
              {issueCategories.map((issue, index) => (
                <div key={index}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '5px', fontSize: '14px', fontWeight: 'bold', color: '#444' }}>
                    <span>{issue.name}</span>
                    <span>{issue.percentage}%</span>
                  </div>
                  <div style={{ width: '100%', height: '8px', backgroundColor: '#eee', borderRadius: '4px', overflow: 'hidden' }}>
                    <div style={{ 
                      width: `${issue.percentage}%`, 
                      height: '100%', 
                      backgroundColor: issue.color,
                      borderRadius: '4px'
                    }}></div>
                  </div>
                </div>
              ))}
            </div>
          </div>

        </div>

      </div>
    </div>
  );
};

export default SystemAnalytics;
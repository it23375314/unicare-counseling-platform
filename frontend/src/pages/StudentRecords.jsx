import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import '../styles/Dashboard.css'; // Make sure this path is correct for your folder structure!

const StudentRecords = () => {
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState('');

  // Mock data for student records (Replace this with your actual state/data if you have it)
  const [records] = useState([
    { id: 'STU-001', name: 'Alex Johnson', major: 'Computer Science', lastSession: 'Oct 25, 2026', status: 'Ongoing' },
    { id: 'STU-002', name: 'Maria Garcia', major: 'Psychology', lastSession: 'Oct 20, 2026', status: 'Completed' },
    { id: 'STU-003', name: 'Emma Wilson', major: 'Engineering', lastSession: 'Oct 28, 2026', status: 'Ongoing' },
  ]);

  const handleLogout = () => {
    localStorage.removeItem('isLoggedIn');
    localStorage.removeItem('userRole');
    navigate('/');
  };

  // Filter logic for the search bar
  const filteredRecords = records.filter(record =>
    record.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    record.id.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="dashboard-container">
      {/* Left Sidebar */}
      <div className="sidebar">
        <div className="sidebar-brand">UniCare Pro</div>
        <ul>
          <li onClick={() => navigate('/counsellor-dashboard')}>🏠 Overview</li>
          <li onClick={() => navigate('/my-schedule')}>📅 My Schedule</li>
          {/* Note the "active" class is now on Student Records! */}
          <li className="active">📋 Student Records</li>
          <li onClick={() => navigate('/messages')}>💬 Messages</li>
          <li onClick={() => navigate('/settings')}>⚙️ Settings</li>
        </ul>
        <div className="logout-btn" onClick={handleLogout} style={{ marginTop: 'auto', listStyle: 'none', paddingLeft: '15px' }}>
          <li>🚪 Logout</li>
        </div>
      </div>

      {/* Main Content Area */}
      <div className="main-content">
        
        {/* Page Header */}
        <div style={{ marginBottom: '30px' }}>
          <h1 style={{ fontSize: '28px', color: '#111827', margin: '0 0 8px 0' }}>Student Records 📂</h1>
          <p style={{ color: '#6b7280', margin: 0 }}>View and manage your past and current student session files.</p>
        </div>

        {/* Search Bar & Action Top Bar */}
        <div className="card" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px', padding: '16px 24px' }}>
            <input
              type="text"
              placeholder="Search by name or ID..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              style={{
                padding: '10px 16px',
                borderRadius: '50px', // Pill-shaped to match the leader's buttons
                border: '1px solid #d1d5db',
                width: '300px',
                outline: 'none',
                fontFamily: 'inherit'
              }}
            />
            <button className="btn-primary">+ Add New Record</button>
        </div>

        {/* Records List Card */}
        <div className="card">
          <h3>All Records ({filteredRecords.length})</h3>
          
          {filteredRecords.length > 0 ? (
            filteredRecords.map((record) => (
              <div className="list-item" key={record.id}>
                
                {/* Student Info */}
                <div>
                  <strong style={{ fontSize: '16px' }}>
                    {record.name} <span style={{ color: '#6b7280', fontSize: '13px', fontWeight: 'normal' }}>({record.id})</span>
                  </strong>
                  <div style={{ marginTop: '4px' }}>
                    <span style={{ marginRight: '15px' }}>🎓 {record.major}</span>
                    <span>🗓️ Last Session: {record.lastSession}</span>
                  </div>
                </div>

                {/* Status Badge & Button */}
                <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
                  <span style={{
                    padding: '4px 10px',
                    borderRadius: '50px',
                    fontSize: '12px',
                    fontWeight: '600',
                    backgroundColor: record.status === 'Ongoing' ? '#e0f2fe' : '#dcfce3', // Soft blue or soft green
                    color: record.status === 'Ongoing' ? '#0369a1' : '#166534' // Dark blue or dark green
                  }}>
                    {record.status}
                  </span>
                  <button className="btn-outline">View File</button>
                </div>

              </div>
            ))
          ) : (
            <p style={{ color: '#6b7280', textAlign: 'center', padding: '20px 0' }}>No student records match your search.</p>
          )}
        </div>

      </div>
    </div>
  );
};

export default StudentRecords;
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import '../styles/Dashboard.css';

const StudentRecords = () => {
  const navigate = useNavigate();

  // Mock Data
  const [records] = useState([
    { id: 1, name: 'Emma Wilson', idNo: 'S10234', lastVisit: '2024-03-20', status: 'Ongoing', notes: 'Discussed exam anxiety.' },
    { id: 2, name: 'Liam Brown', idNo: 'S10556', lastVisit: '2024-03-15', status: 'Follow-up', notes: 'Career goals discussed.' },
    { id: 3, name: 'Chloe Smith', idNo: 'S10889', lastVisit: '2024-02-28', status: 'Closed', notes: 'Completed 5 sessions.' },
  ]);

  const handleLogout = () => {
    localStorage.removeItem('isLoggedIn');
    localStorage.removeItem('userRole');
    navigate('/');
  };

  return (
    <div className="dashboard-container">
      {/* Sidebar - Matching UniCare Pro Style */}
      <div className="sidebar">
        <h2 style={{ color: '#007bff', marginBottom: '30px', paddingLeft: '20px' }}>UniCare Pro</h2>
        <ul>
          <li onClick={() => navigate('/counsellor-dashboard')}>🏠 Overview</li>
          <li onClick={() => navigate('/my-schedule')}>📅 My Schedule</li>
          <li style={{ backgroundColor: '#f0f4ff', color: '#007bff', fontWeight: 'bold' }}>📄 Student Records</li>
          <li onClick={() => navigate('/messages')}>💬 Messages</li>
          <li onClick={() => navigate('/settings')}>⚙️ Settings</li>
        </ul>
        <div style={{ marginTop: 'auto', paddingLeft: '20px', paddingBottom: '20px' }}>
          <li onClick={handleLogout} style={{ color: '#dc3545', listStyle: 'none', cursor: 'pointer' }}>🚪 Logout</li>
        </div>
      </div>

      {/* Main Content Area */}
      <div className="main-content">
        {/* Top Header Card */}
        <div className="welcome-card">
          <h1 style={{ color: '#333', fontSize: '28px' }}>Student Records 📋</h1>
          <p style={{ color: '#666' }}>Access clinical histories and manage student case files securely.</p>
        </div>

        {/* Statistics Row - Matching the Admin/Counsellor Cards */}
        <div style={{ display: 'flex', gap: '20px', marginBottom: '30px' }}>
          <div style={{ flex: 1, padding: '20px', background: '#e3f2fd', borderRadius: '12px', borderLeft: '5px solid #007bff' }}>
            <h3 style={{ color: '#0d47a1', margin: 0 }}>Total Files</h3>
            <h2 style={{ fontSize: '32px', margin: '10px 0 0 0' }}>148</h2>
          </div>
          <div style={{ flex: 1, padding: '20px', background: '#e8f5e9', borderRadius: '12px', borderLeft: '5px solid #2e7d32' }}>
            <h3 style={{ color: '#1b5e20', margin: 0 }}>Active Cases</h3>
            <h2 style={{ fontSize: '32px', margin: '10px 0 0 0' }}>12</h2>
          </div>
          <div style={{ flex: 1, padding: '20px', background: '#fff3e0', borderRadius: '12px', borderLeft: '5px solid #ef6c00' }}>
            <h3 style={{ color: '#e65100', margin: 0 }}>Pending Updates</h3>
            <h2 style={{ fontSize: '32px', margin: '10px 0 0 0' }}>5</h2>
          </div>
        </div>

        {/* Main Records Table Card */}
        <div style={{ background: 'white', padding: '25px', borderRadius: '12px', boxShadow: '0 4px 20px rgba(0,0,0,0.08)' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
             <h3 style={{ margin: 0 }}>Patient Directory</h3>
             <input 
               type="text" 
               placeholder="Search by name..." 
               style={{ padding: '8px 15px', borderRadius: '20px', border: '1px solid #ddd', width: '250px' }}
             />
          </div>

          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr style={{ textAlign: 'left', borderBottom: '2px solid #f0f0f0' }}>
                <th style={{ padding: '12px', color: '#888' }}>Student</th>
                <th style={{ padding: '12px', color: '#888' }}>ID</th>
                <th style={{ padding: '12px', color: '#888' }}>Status</th>
                <th style={{ padding: '12px', color: '#888' }}>Last Meeting</th>
                <th style={{ padding: '12px', color: '#888', textAlign: 'right' }}>Action</th>
              </tr>
            </thead>
            <tbody>
              {records.map(record => (
                <tr key={record.id} style={{ borderBottom: '1px solid #f9f9f9' }}>
                  <td style={{ padding: '15px', fontWeight: 'bold' }}>{record.name}</td>
                  <td style={{ padding: '15px', color: '#666' }}>{record.idNo}</td>
                  <td style={{ padding: '15px' }}>
                    <span style={{ 
                      padding: '5px 12px', 
                      borderRadius: '15px', 
                      fontSize: '12px',
                      background: record.status === 'Ongoing' ? '#e3f2fd' : '#f5f5f5',
                      color: record.status === 'Ongoing' ? '#007bff' : '#666'
                    }}>
                      {record.status}
                    </span>
                  </td>
                  <td style={{ padding: '15px', color: '#666' }}>{record.lastVisit}</td>
                  <td style={{ padding: '15px', textAlign: 'right' }}>
                    <button style={{ background: '#007bff', color: 'white', border: 'none', padding: '6px 15px', borderRadius: '6px', cursor: 'pointer' }}>
                      Open File
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default StudentRecords;
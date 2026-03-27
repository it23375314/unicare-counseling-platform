import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import '../styles/Dashboard.css'; 

const UserManagement = () => {
  const navigate = useNavigate();

  // 1. Mock Database of Users
  const [users, setUsers] = useState([
    { id: 1, name: 'Emma Wilson', role: 'Student', email: 'emma@student.edu', status: 'Active' },
    { id: 2, name: 'Dr. Sarah Jenkins', role: 'Counsellor', email: 'sarah.j@staff.edu', status: 'Pending' },
    { id: 3, name: 'Liam Brown', role: 'Student', email: 'liam@student.edu', status: 'Active' },
    { id: 4, name: 'Prof. Mark Davis', role: 'Counsellor', email: 'mark.d@staff.edu', status: 'Active' },
    { id: 5, name: 'Chloe Smith', role: 'Student', email: 'chloe@student.edu', status: 'Suspended' }
  ]);

  // State for our filter tabs
  const [filter, setFilter] = useState('All');

  const handleLogout = () => {
    localStorage.removeItem('isLoggedIn');
    localStorage.removeItem('userRole');
    navigate('/');
  };

  // --- ACTION FUNCTIONS ---
  const handleApprove = (id) => {
    setUsers(users.map(user => user.id === id ? { ...user, status: 'Active' } : user));
  };

  const handleSuspend = (id) => {
    setUsers(users.map(user => user.id === id ? { ...user, status: 'Suspended' } : user));
  };

  const handleDelete = (id) => {
    if (window.confirm("Are you sure you want to delete this user? This cannot be undone.")) {
      setUsers(users.filter(user => user.id !== id));
    }
  };

  // Apply the active filter
  const filteredUsers = users.filter(user => {
    if (filter === 'All') return true;
    if (filter === 'Pending') return user.status === 'Pending';
    return user.role === filter;
  });

  return (
    <div className="dashboard-container">
      {/* Left Sidebar for Admin */}
      <div className="sidebar">
        {/* Applied the class that we centered in CSS */}
        <div className="sidebar-brand">UniCare </div>
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
        <div className="welcome-card" style={{ borderLeft: '5px solid #007bff' }}>
          <h1 style={{ color: '#333', marginBottom: '10px' }}>User Management 👥</h1>
          <p style={{ color: '#666' }}>Approve counsellors, manage students, and moderate platform access.</p>
        </div>

        {/* Filter Tabs */}
        <div style={{ display: 'flex', gap: '10px', marginBottom: '20px' }}>
          {['All', 'Student', 'Counsellor', 'Pending'].map(tab => (
            <button
              key={tab}
              onClick={() => setFilter(tab)}
              style={{
                padding: '8px 16px',
                borderRadius: '20px',
                border: 'none',
                cursor: 'pointer',
                fontWeight: 'bold',
                backgroundColor: filter === tab ? '#007bff' : '#e9ecef',
                color: filter === tab ? 'white' : '#495057'
              }}
            >
              {tab} {tab === 'Pending' && users.filter(u => u.status === 'Pending').length > 0 && `(${users.filter(u => u.status === 'Pending').length})`}
            </button>
          ))}
        </div>

        {/* Data Table */}
        <div style={{ background: 'white', borderRadius: '10px', boxShadow: '0 2px 10px rgba(0,0,0,0.05)', overflow: 'hidden' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
            <thead style={{ backgroundColor: '#f8f9fa', borderBottom: '2px solid #dee2e6' }}>
              <tr>
                <th style={{ padding: '15px', color: '#495057' }}>Name</th>
                <th style={{ padding: '15px', color: '#495057' }}>Role</th>
                <th style={{ padding: '15px', color: '#495057' }}>Status</th>
                <th style={{ padding: '15px', color: '#495057', textAlign: 'right' }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredUsers.length > 0 ? (
                filteredUsers.map(user => (
                  <tr key={user.id} style={{ borderBottom: '1px solid #eee' }}>
                    <td style={{ padding: '15px' }}>
                      <strong style={{ display: 'block', color: '#333' }}>{user.name}</strong>
                      <span style={{ fontSize: '12px', color: '#888' }}>{user.email}</span>
                    </td>
                    <td style={{ padding: '15px' }}>
                      <span style={{ padding: '4px 8px', borderRadius: '4px', fontSize: '12px', backgroundColor: user.role === 'Admin' ? '#f3e5f5' : user.role === 'Counsellor' ? '#e3f2fd' : '#e8f5e9', color: user.role === 'Admin' ? '#4a148c' : user.role === 'Counsellor' ? '#0d47a1' : '#1b5e20' }}>
                        {user.role}
                      </span>
                    </td>
                    <td style={{ padding: '15px' }}>
                      <span style={{ fontWeight: 'bold', color: user.status === 'Active' ? '#28a745' : user.status === 'Pending' ? '#ffc107' : '#dc3545' }}>
                        {user.status}
                      </span>
                    </td>
                    <td style={{ padding: '15px', textAlign: 'right', display: 'flex', gap: '8px', justifyContent: 'flex-end' }}>
                      {user.status === 'Pending' && (
                        <button onClick={() => handleApprove(user.id)} style={{ padding: '6px 10px', background: '#28a745', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer' }}>Approve</button>
                      )}
                      {user.status === 'Active' && (
                        <button onClick={() => handleSuspend(user.id)} style={{ padding: '6px 10px', background: '#ffc107', color: 'black', border: 'none', borderRadius: '4px', cursor: 'pointer' }}>Suspend</button>
                      )}
                      <button onClick={() => handleDelete(user.id)} style={{ padding: '6px 10px', background: 'transparent', color: '#dc3545', border: '1px solid #dc3545', borderRadius: '4px', cursor: 'pointer' }}>Delete</button>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="4" style={{ padding: '30px', textAlign: 'center', color: '#777' }}>No users found for this filter.</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

      </div>
    </div>
  );
};

export default UserManagement;
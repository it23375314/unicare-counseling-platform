import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { Link, useNavigate } from 'react-router-dom';

export default function AdminDashboard() {
  const [users, setUsers] = useState([]);
  const [resources, setResources] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [error, setError] = useState(null);
  
  const navigate = useNavigate();
  const role = localStorage.getItem('userRole');
  const userName = localStorage.getItem('userName');

  useEffect(() => {
    // Ensures no white margins around the background
    document.body.style.margin = "0";
    document.body.style.padding = "0";

    if (role === 'admin') {
      axios.get('http://localhost:5000/api/auth/users')
        .then(res => setUsers(res.data))
        .catch(err => setError("Failed to fetch users."));

      axios.get('http://localhost:5000/api/resources/admin/all')
        .then(res => setResources(res.data))
        .catch(err => console.log("Resources fetch failed"));
    }
  }, [role]);

  // --- SEARCH LOGIC ---
  const filteredUsers = users.filter(user => 
    user.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
    user.email.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const deleteUser = async (id) => {
    if (window.confirm("Are you sure you want to delete this user?")) {
      try {
        await axios.delete(`http://localhost:5000/api/auth/users/${id}`);
        setUsers(users.filter(user => user._id !== id));
      } catch (err) {
        alert("Error deleting user");
      }
    }
  };

  const handleLogout = () => {
    if (window.confirm("End admin session?")) {
      localStorage.clear();
      window.location.href = '/login';
    }
  };

  // Security Guard
  if (role !== 'admin') {
    return (
      <div style={styles.pageWrapper}>
        <div style={{...styles.glassCard, maxWidth: '400px', margin: '100px auto', textAlign: 'center'}}>
          <div style={{fontSize: '60px', marginBottom: '20px'}}>🛑</div>
          <h2 style={{color: '#1e293b', fontWeight: '900', fontSize: '24px'}}>ACCESS DENIED</h2>
          <p style={{color: '#ef4444', fontWeight: 'bold'}}>Administrator Privileges Required.</p>
          <button onClick={() => window.location.href='/login'} style={styles.deniedBtn}>
            Return to Login
          </button>
        </div>
      </div>
    );
  }

  return (
    <>
      {/* Required for the Sidebar Hover Effects */}
      <style>{`
        .sidebar-item {
          padding: 15px;
          margin-bottom: 10px;
          border-radius: 8px;
          cursor: pointer;
          color: #555;
          font-weight: 500;
          transition: all 0.3s ease;
        }
        .sidebar-item:hover {
          background-color: #f0f4ff;
          color: #007bff;
        }
      `}</style>

      <div style={styles.dashboardContainer}>
        
        {/* --- LEFT SIDEBAR FOR ADMIN --- */}
        <div style={styles.sidebar}>
          <h2 style={{ color: '#007bff', marginBottom: '40px', textAlign: 'center', marginTop: 0 }}>
            UniCare Admin
          </h2>
          
          <ul style={{ listStyle: 'none', padding: 0, flex: 1, margin: 0 }}>
            {/* Active page gets the blue background */}
            <li 
              className="sidebar-item" 
              style={{ backgroundColor: '#f0f4ff', color: '#007bff' }} 
              onClick={() => navigate('/admin-dashboard')}
            >
              🛡️ Control Panel
            </li>
            <li className="sidebar-item" onClick={() => navigate('/admin/resources')}>
              📚 Resource Library
            </li>
            <li className="sidebar-item" onClick={() => navigate('/admin-analytics')}>
              📊 System Analytics
            </li>
            <li className="sidebar-item" onClick={() => navigate('/admin-users')}>
              👥 User Management
            </li>
            <li className="sidebar-item" onClick={() => navigate('/admin-logs')}>
              📝 Platform Logs
            </li>
            <li className="sidebar-item" onClick={() => navigate('/system-config')}>
              ⚙️ System Config
            </li>
            <li className="sidebar-item" onClick={() => navigate('/settings')}>
              ⚙️ Settings
            </li>
          </ul>
          
          <ul style={{ listStyle: 'none', padding: 0, flex: 0, margin: 0 }}>
            <li className="sidebar-item" onClick={handleLogout} style={{ color: '#dc3545' }}>
              🚪 Logout
            </li>
          </ul>
        </div>

        {/* --- MAIN CONTENT AREA --- */}
        <div style={styles.mainContent}>
          
          {/* HEADER */}
          <div style={styles.headerSection}>
            <div>
              <h1 style={styles.mainTitle}>System <span style={{color: '#7c3aed'}}>Overview</span></h1>
              <p style={styles.subTitle}>Manage platform users, monitor engagement, and control resources.</p>
            </div>
            
            <div style={styles.searchBox}>
              <span style={styles.searchIcon}>🔍</span>
              <input 
                style={styles.searchInput} 
                placeholder="Search users by name or email..." 
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
          </div>

          {/* STATS ROW */}
          <div style={styles.statsGrid}>
            <div style={styles.glassCard}>
              <div style={{ ...styles.statIconWrap, color: '#1e293b' }}>
                <svg viewBox="0 0 24 24" aria-hidden="true" style={styles.statIconSvg}>
                  <path d="M4 20v-2a4 4 0 0 1 4-4h8a4 4 0 0 1 4 4v2" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
                  <circle cx="12" cy="8" r="4" fill="none" stroke="currentColor" strokeWidth="2" />
                </svg>
              </div>
              <p style={styles.statLabel}>Total Users</p>
              <h2 style={styles.statNumber}>{users.length}</h2>
            </div>
            
            <div style={styles.glassCard}>
              <div style={{ ...styles.statIconWrap, color: '#0284c7' }}>
                <svg viewBox="0 0 24 24" aria-hidden="true" style={styles.statIconSvg}>
                  <path d="M4 6a3 3 0 0 1 3-3h10v18H7a3 3 0 0 1-3-3V6z" fill="none" stroke="currentColor" strokeWidth="2" />
                  <path d="M7 5h10" fill="none" stroke="currentColor" strokeWidth="2" />
                  <path d="M7 9h10" fill="none" stroke="currentColor" strokeWidth="2" />
                </svg>
              </div>
              <p style={styles.statLabel}>Wellness Resources</p>
              <h2 style={{...styles.statNumber, color: '#0284c7'}}>{resources.length}</h2>
            </div>
            
            <div style={styles.glassCard}>
              <div style={{ ...styles.statIconWrap, color: '#10b981' }}>
                <svg viewBox="0 0 24 24" aria-hidden="true" style={styles.statIconSvg}>
                  <path d="M4 12h4l2-4 4 8 2-4h4" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              </div>
              <p style={styles.statLabel}>Total Engagements</p>
              <h2 style={{...styles.statNumber, color: '#10b981'}}>
                {resources.reduce((acc, curr) => acc + (curr.usageCount || 0), 0)}
              </h2>
            </div>
            
            <div style={styles.actionCard}>
              <div style={{fontSize: '30px', marginBottom: '10px'}}>🛠️</div>
              <h3 style={{color: 'white', margin: '0 0 5px 0', fontSize: '16px'}}>Resource Library</h3>
              <Link to="/admin/resources" style={styles.actionLink}>Manage Content ➔</Link>
            </div>
          </div>

          {/* USER TABLE */}
          <div style={styles.tableContainer}>
            <table style={styles.table}>
              <thead style={styles.tableHead}>
                <tr>
                  <th style={styles.th}>User Name</th>
                  <th style={styles.th}>Email Address</th>
                  <th style={styles.th}>Role</th>
                  <th style={{...styles.th, textAlign: 'center'}}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredUsers.map((user) => (
                  <tr key={user._id} style={styles.tr}>
                    <td style={{...styles.td, fontWeight: '900', textTransform: 'uppercase'}}>{user.name}</td>
                    <td style={{...styles.td, color: '#0284c7', fontWeight: '600'}}>{user.email}</td>
                    <td style={styles.td}>
                      {user.role === 'admin' ? (
                        <span style={styles.adminBadge}>Admin</span>
                      ) : (
                        <span style={styles.studentBadge}>Student</span>
                      )}
                    </td>
                    <td style={{...styles.td, textAlign: 'center'}}>
                      <button 
                        onClick={() => deleteUser(user._id)}
                        style={styles.deleteBtn}
                      >
                        Delete
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>

            {filteredUsers.length === 0 && (
              <div style={styles.emptyState}>
                {searchTerm ? `No users found matching "${searchTerm}"` : "No users currently in the system."}
              </div>
            )}
          </div>
        </div>

      </div>
    </>
  );
}

// ==========================================
// PURE CSS-IN-JS FOR GUARANTEED DESIGN
// ==========================================
const styles = {
  // --- LAYOUT ---
  dashboardContainer: {
    display: 'flex',
    minHeight: '100vh',
    width: '100%',
    fontFamily: "'Inter', 'Segoe UI', sans-serif",
    background: 'linear-gradient(135deg, #e0f2fe 0%, #f3e8ff 50%, #fce7f3 100%)',
  },

  // --- NEW SIDEBAR STYLES INTEGRATED ---
  sidebar: {
    width: '250px',
    backgroundColor: '#ffffff',
    padding: '20px',
    boxShadow: '2px 0 10px rgba(0, 0, 0, 0.05)',
    display: 'flex',
    flexDirection: 'column',
    position: 'fixed', // Locks it to the left side of the screen
    top: 0,
    left: 0,
    bottom: 0,
    boxSizing: 'border-box',
    zIndex: 1000
  },

  // --- MAIN CONTENT AREA ---
  mainContent: { 
    flex: 1,
    marginLeft: '250px', // Pushes the content exactly the width of the sidebar
    padding: '50px 40px',
    boxSizing: 'border-box'
  },

  // --- HEADER ---
  headerSection: {
    display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', 
    flexWrap: 'wrap', gap: '20px', marginBottom: '40px'
  },
  mainTitle: { fontSize: '42px', fontWeight: '900', letterSpacing: '-1px', margin: '0 0 5px 0', color: '#1e293b' },
  subTitle: { color: '#64748b', fontSize: '15px', margin: 0, fontWeight: '500' },
  searchBox: { position: 'relative', display: 'flex', alignItems: 'center', width: '100%', maxWidth: '350px' },
  searchIcon: { position: 'absolute', left: '15px', color: '#94a3b8', fontSize: '14px' },
  searchInput: {
    width: '100%', padding: '14px 15px 14px 45px', borderRadius: '30px',
    border: '1px solid rgba(255, 255, 255, 0.8)', backgroundColor: 'rgba(255, 255, 255, 0.7)',
    backdropFilter: 'blur(10px)', outline: 'none', fontSize: '13px', fontWeight: '600',
    color: '#1e293b', boxShadow: '0 4px 15px rgba(0,0,0,0.02)'
  },

  // --- STATS ROW ---
  statsGrid: { 
    display: 'grid', 
    gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', 
    gap: '20px', 
    marginBottom: '40px' 
  },
  glassCard: {
    backgroundColor: 'rgba(255, 255, 255, 0.6)',
    backdropFilter: 'blur(12px)',
    WebkitBackdropFilter: 'blur(12px)',
    borderRadius: '24px',
    border: '1px solid rgba(255, 255, 255, 0.8)',
    boxShadow: '0 10px 30px -10px rgba(126, 34, 206, 0.1)',
    padding: '30px',
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'center'
  },
  statIconWrap: {
    width: '40px',
    height: '40px',
    borderRadius: '12px',
    backgroundColor: 'rgba(255, 255, 255, 0.9)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: '12px',
    border: '1px solid rgba(0, 0, 0, 0.04)'
  },
  statIconSvg: { width: '22px', height: '22px', display: 'block' },
  statLabel: { textTransform: 'uppercase', fontSize: '11px', fontWeight: '900', color: '#64748b', letterSpacing: '1px', margin: '0 0 5px 0' },
  statNumber: { fontSize: '42px', fontWeight: '900', margin: 0, color: '#1e293b', letterSpacing: '-1px' },
  
  actionCard: {
    background: 'linear-gradient(135deg, #7c3aed 0%, #4f46e5 100%)',
    borderRadius: '24px',
    padding: '30px',
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'center',
    boxShadow: '0 15px 30px -10px rgba(124, 58, 237, 0.4)',
  },
  actionLink: { color: '#e0e7ff', textDecoration: 'none', fontSize: '12px', fontWeight: '900', textTransform: 'uppercase', letterSpacing: '1px', marginTop: '10px' },

  // --- TABLE STYLES ---
  tableContainer: {
    backgroundColor: 'rgba(255, 255, 255, 0.7)',
    backdropFilter: 'blur(15px)',
    borderRadius: '30px',
    border: '1px solid rgba(255, 255, 255, 0.9)',
    boxShadow: '0 15px 35px -5px rgba(0, 0, 0, 0.05)',
    overflow: 'hidden', 
  },
  table: { width: '100%', borderCollapse: 'collapse' },
  tableHead: { backgroundColor: 'rgba(255, 255, 255, 0.5)' },
  th: {
    padding: '20px 25px', textAlign: 'left', fontSize: '10px',
    fontWeight: '900', textTransform: 'uppercase', color: '#64748b',
    letterSpacing: '1px', borderBottom: '1px solid rgba(0,0,0,0.05)'
  },
  tr: { transition: 'background-color 0.2s' },
  td: { padding: '20px 25px', fontSize: '13px', borderBottom: '1px solid rgba(0,0,0,0.03)' },
  
  adminBadge: { backgroundColor: '#f3e8ff', color: '#7e22ce', padding: '6px 12px', borderRadius: '12px', fontSize: '10px', fontWeight: '900', textTransform: 'uppercase' },
  studentBadge: { backgroundColor: '#e0f2fe', color: '#0284c7', padding: '6px 12px', borderRadius: '12px', fontSize: '10px', fontWeight: '900', textTransform: 'uppercase' },
  
  deleteBtn: {
    backgroundColor: '#fee2e2', color: '#ef4444', border: 'none', 
    padding: '8px 16px', borderRadius: '12px', fontSize: '10px', 
    fontWeight: '900', textTransform: 'uppercase', letterSpacing: '0.5px', 
    cursor: 'pointer', boxShadow: '0 2px 10px rgba(239, 68, 68, 0.2)'
  },
  
  emptyState: { textAlign: 'center', padding: '60px 20px', color: '#64748b', fontWeight: '800', fontSize: '14px' },
  deniedBtn: { marginTop: '20px', width: '100%', backgroundColor: '#1e293b', color: 'white', padding: '15px', borderRadius: '15px', fontWeight: '900', cursor: 'pointer', border: 'none', textTransform: 'uppercase', letterSpacing: '1px' }
};

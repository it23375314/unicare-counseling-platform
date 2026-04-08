import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import "../styles/Dashboard.css";

const AdminDashboard = () => {
  const navigate = useNavigate();

  // 1. State for Live Stats and Feedback
  const [stats, setStats] = useState({ total: 0, students: 0, counsellors: 0 });
  const [feedbacks, setFeedbacks] = useState([]);
  const [loading, setLoading] = useState(true);

  // 2. Fetch Live Data from MongoDB & LocalStorage
  useEffect(() => {
    const fetchAdminData = async () => {
      try {
        // Fetch Real Users from your Node.js Backend
        const response = await fetch("http://localhost:5000/api/auth/users");
        const allUsers = await response.json();

        if (response.ok) {
          setStats({
            total: allUsers.length,
            students: allUsers.filter((u) => u.role === "student").length,
            counsellors: allUsers.filter((u) => u.role === "counsellor").length,
          });
        }

        // Fetch Feedback from LocalStorage
        const savedFeedback = JSON.parse(localStorage.getItem("systemFeedback")) || [];
        setFeedbacks(savedFeedback.reverse());
        
        setLoading(false);
      } catch (err) {
        console.error("Admin Data Fetch Error:", err);
        setLoading(false);
      }
    };

    fetchAdminData();
  }, []);

  // --- UPDATED LOGOUT LOGIC ---
  const handleLogout = async () => {
    const sessionId = localStorage.getItem('currentSessionId');

    if (sessionId) {
      try {
        // Delete the session from MongoDB
        await fetch(`http://localhost:5000/api/auth/sessions/${sessionId}`, {
          method: 'DELETE',
        });
      } catch (err) {
        console.error("Failed to delete session on logout:", err);
      }
    }

    // Clear everything and redirect
    localStorage.clear();
    navigate("/");
  };

  const handleDeleteFeedback = (idToRemove) => {
    const updatedFeedback = feedbacks.filter((item) => item.id !== idToRemove);
    setFeedbacks(updatedFeedback);
    localStorage.setItem("systemFeedback", JSON.stringify(updatedFeedback));
  };

  return (
    <div className="dashboard-container">
      {/* Sidebar Section */}
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
        <div className="welcome-card">
          <h1>Admin Control Panel</h1>
          <p>Real-time oversight of the UniCare ecosystem and cloud database.</p>
        </div>

        {/* Live Stat Cards */}
        <div style={{ display: "flex", gap: "20px", marginBottom: "30px" }}>
          <div className="stat-card" style={{ background: "#f3e5f5", flex: 1, padding: "20px", borderRadius: "12px" }}>
            <h3 style={{ color: "#4a148c" }}>Total Cloud Users</h3>
            <h2 style={{ fontSize: "32px" }}>{loading ? "..." : stats.total}</h2>
            <p style={{ fontSize: "12px", color: "#666" }}>
              Students: {stats.students} | Counsellors: {stats.counsellors}
            </p>
          </div>

          <div className="stat-card" style={{ background: "#e3f2fd", flex: 1, padding: "20px", borderRadius: "12px" }}>
            <h3 style={{ color: "#0d47a1" }}>Server Status</h3>
            <h2 style={{ color: "#2e7d32" }}>Online</h2>
            <p style={{ fontSize: "12px", color: "#666" }}>Connected to MongoDB Atlas</p>
          </div>
        </div>

        {/* Feedback Section */}
        <div className="feedback-section" style={{ background: "white", padding: "25px", borderRadius: "12px", boxShadow: "0 4px 6px rgba(0,0,0,0.05)" }}>
          <h3 style={{ marginBottom: "20px", borderBottom: "1px solid #eee", paddingBottom: "10px" }}>
            📬 Recent Student Feedback
          </h3>

          <div style={{ maxHeight: "400px", overflowY: "auto" }}>
            {feedbacks.length > 0 ? (
              feedbacks.map((item) => (
                <div key={item.id} className="feedback-item" style={{ padding: "15px", background: "#f8f9fa", borderRadius: "8px", marginBottom: "10px", position: "relative", borderLeft: "4px solid #007bff" }}>
                  <strong>{item.sender}</strong>
                  <p style={{ margin: "5px 0", color: "#444" }}>{item.text}</p>
                  <span style={{ fontSize: "11px", color: "#999" }}>{item.date}</span>
                  <button 
                    onClick={() => handleDeleteFeedback(item.id)}
                    style={{ position: "absolute", right: "15px", top: "15px", background: "none", border: "none", cursor: "pointer" }}
                  >
                    🗑️
                  </button>
                </div>
              ))
            ) : (
              <p style={{ textAlign: "center", color: "#999" }}>No new feedback found.</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;
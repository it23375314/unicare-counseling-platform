import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import "../styles/Dashboard.css";

const AdminUsers = () => {
  const navigate = useNavigate();
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);

  // 1. Fetch Users from MongoDB Atlas
  const fetchUsers = async () => {
    try {
      const response = await fetch("http://localhost:5000/api/auth/users");
      const data = await response.json();
      if (response.ok) {
        setUsers(data);
      }
      setLoading(false);
    } catch (err) {
      console.error("Fetch error:", err);
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  // 2. THE MISSING FUNCTION: handleLogout
  const handleLogout = () => {
    localStorage.removeItem("isLoggedIn");
    localStorage.removeItem("userRole");
    navigate("/");
  };

  // 3. Delete Function
  const handleDelete = async (id) => {
    if (window.confirm("Are you sure you want to delete this user?")) {
      await fetch(`http://localhost:5000/api/auth/users/${id}`, { method: "DELETE" });
      fetchUsers(); // Refresh the list
    }
  };

  // 4. Verify Function
  const handleToggleVerify = async (id) => {
    await fetch(`http://localhost:5000/api/auth/users/verify/${id}`, { method: "PATCH" });
    fetchUsers(); // Refresh the list
  };

  return (
    <div className="dashboard-container">
      {/* Sidebar - Matching your screenshot style */}
      <div className="sidebar">
        <div className="sidebar-brand">UniCare</div>
        <ul>
          <li onClick={() => navigate("/admin-dashboard")}>🛡️ Control Panel</li>
          <li onClick={() => navigate("/admin-analytics")}>📊 System Analytics</li>
          <li className="active" onClick={() => navigate("/admin-users")}>👥 User Management</li>
          <li onClick={() => navigate("/admin-logs")}>📝 Platform Logs</li>
          <li onClick={() => navigate("/system-config")}>⚙️ System Config</li>
          <li onClick={() => navigate("/settings")}>⚙️ Settings</li>
        </ul>
        <ul style={{ marginTop: "auto" }}>
          <li onClick={handleLogout} style={{ color: "#d9534f", cursor: "pointer" }}>🚪 Logout</li>
        </ul>
      </div>

      {/* Content Area */}
      <div className="main-content">
        <div className="welcome-card">
          <h1 style={{ borderLeft: "4px solid #5cb85c", paddingLeft: "15px" }}>User Management 👥</h1>
          <p style={{ color: "#888", marginLeft: "19px" }}>Manage account verification and platform access.</p>
        </div>

        <div style={{ background: "white", padding: "25px", borderRadius: "12px", boxShadow: "0 2px 10px rgba(0,0,0,0.05)" }}>
          {loading ? <p>Loading users...</p> : (
            <table style={{ width: "100%", borderCollapse: "collapse" }}>
              <thead>
                <tr style={{ textAlign: "left", borderBottom: "2px solid #eee" }}>
                  <th style={{ padding: "12px" }}>User Info</th>
                  <th style={{ padding: "12px" }}>Role</th>
                  <th style={{ padding: "12px" }}>Status</th>
                  <th style={{ padding: "12px" }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {users.map((user) => (
                  <tr key={user._id} style={{ borderBottom: "1px solid #f9f9f9" }}>
                    <td style={{ padding: "12px" }}>
                      <strong>{user.fullName}</strong><br/>
                      <small style={{ color: "#888" }}>{user.email}</small>
                    </td>
                    <td style={{ padding: "12px" }}>
                      <span className={`role-badge ${user.role}`}>{user.role.toUpperCase()}</span>
                    </td>
                    <td style={{ padding: "12px" }}>
                      {user.otp ? "⏳ Unverified" : "✅ Verified"}
                    </td>
                    <td style={{ padding: "12px" }}>
                      <button onClick={() => handleToggleVerify(user._id)} style={{ marginRight: "10px", cursor: "pointer" }}>
                        {user.otp ? "Verify" : "Reset"}
                      </button>
                      <button onClick={() => handleDelete(user._id)} style={{ color: "red", cursor: "pointer", border: "none", background: "none" }}>
                        🗑️
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>
    </div>
  );
};

export default AdminUsers;
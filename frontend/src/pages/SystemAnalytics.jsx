import React from "react";
import { useNavigate } from "react-router-dom";
import "../styles/Dashboard.css";

const SystemAnalytics = () => {
  const navigate = useNavigate();

  // Mock data for the review (In a real app, these would come from MongoDB)
  const topics = [
    { label: "Academic Stress", value: 45, color: "#ef4444" },
    { label: "Career Anxiety", value: 30, color: "#f59e0b" },
    { label: "Personal/Relationships", value: 15, color: "#06b6d4" },
    { label: "Other", value: 10, color: "#6b7280" },
  ];

  const handleLogout = () => {
    localStorage.clear();
    navigate("/");
  };

  return (
    <div className="dashboard-container">
      {/* Sidebar - Consistent across all Admin pages */}
      <div className="sidebar">
        <div className="sidebar-brand">UniCare</div>
        <ul>
          <li onClick={() => navigate("/admin-dashboard")}>🛡️ Control Panel</li>
          <li className="active" onClick={() => navigate("/admin-analytics")}>📊 System Analytics</li>
          <li onClick={() => navigate("/admin-users")}>👥 User Management</li>
          <li onClick={() => navigate("/admin-logs")}>📝 Platform Logs</li>
          <li onClick={() => navigate("/system-config")}>⚙️ System Config</li>
          <li onClick={() => navigate("/settings")}>⚙️ Settings</li>
        </ul>
        <ul style={{ marginTop: "auto" }}>
          <li onClick={handleLogout} style={{ color: "#d9534f", cursor: "pointer" }}>🚪 Logout</li>
        </ul>
      </div>

      <div className="main-content">
        <div className="welcome-card">
          <h1 style={{ borderLeft: "4px solid #3b82f6", paddingLeft: "15px" }}>System Analytics 📊</h1>
          <p style={{ color: "#888", marginLeft: "19px" }}>Overview of platform usage and student wellbeing trends.</p>
        </div>

        {/* Top Stat Cards */}
        <div className="stat-grid">
          <div className="stat-card" style={{ borderTop: "4px solid #3b82f6" }}>
            <small>Total Sessions</small>
            <h2>842</h2>
            <span style={{ color: "#22c55e", fontSize: "12px" }}>↑ +12% this month</span>
          </div>
          <div className="stat-card" style={{ borderTop: "4px solid #22c55e" }}>
            <small>Avg. Satisfaction</small>
            <h2>4.8<span style={{ fontSize: "16px", color: "#999" }}>/5</span></h2>
            <span style={{ color: "#22c55e", fontSize: "12px" }}>↑ +0.2 this month</span>
          </div>
          <div className="stat-card" style={{ borderTop: "4px solid #a855f7" }}>
            <small>Active Counsellors</small>
            <h2>24</h2>
            <span style={{ color: "#666", fontSize: "12px" }}>Across 5 departments</span>
          </div>
        </div>

        <div style={{ display: "flex", gap: "25px" }}>
          {/* Monthly Appointments Placeholder */}
          <div style={{ flex: 2, background: "white", padding: "25px", borderRadius: "12px", minHeight: "300px" }}>
            <h3>Monthly Appointments</h3>
            <div style={{ display: "flex", alignItems: "flex-end", justifyContent: "space-between", height: "200px", paddingTop: "20px" }}>
              {[45, 60, 85, 50, 110, 90].map((height, i) => (
                <div key={i} style={{ textAlign: "center", width: "40px" }}>
                  <div style={{ height: `${height}px`, background: "#eef4ff", borderRadius: "4px", marginBottom: "8px", position: "relative" }}>
                    <div style={{ position: "absolute", top: "-20px", width: "100%", fontSize: "12px", color: "#3b82f6" }}>{height}</div>
                  </div>
                  <small style={{ color: "#999" }}>{["Jan", "Feb", "Mar", "Apr", "May", "Jun"][i]}</small>
                </div>
              ))}
            </div>
          </div>

          {/* Primary Topics (The Progress Bars) */}
          <div style={{ flex: 1, background: "white", padding: "25px", borderRadius: "12px" }}>
            <h3 style={{ marginBottom: "20px" }}>Primary Topics</h3>
            {topics.map((topic, index) => (
              <div key={index} style={{ marginBottom: "15px" }}>
                <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "5px" }}>
                  <small style={{ fontWeight: "bold" }}>{topic.label}</small>
                  <small style={{ fontWeight: "bold" }}>{topic.value}%</small>
                </div>
                <div style={{ width: "100%", height: "8px", background: "#f3f4f6", borderRadius: "10px" }}>
                  <div style={{ width: `${topic.value}%`, height: "100%", background: topic.color, borderRadius: "10px" }}></div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default SystemAnalytics;
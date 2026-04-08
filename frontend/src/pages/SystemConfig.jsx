import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import "../styles/Dashboard.css";

const SystemConfig = () => {
  const navigate = useNavigate();

  // State for Admin Profile
  const [profile, setProfile] = useState({
    name: "",
    email: "",
    role: "",
  });

  // State for System Settings
  const [systemConfig, setSystemConfig] = useState({
    maintenanceMode: false,
    emailNotifications: true,
    publicFeedback: true,
  });

  // 1. Load both Config and Admin Profile on mount
  useEffect(() => {
    const fetchInitialData = async () => {
      try {
        // Fetch System Configuration
        const configRes = await fetch("http://localhost:5000/api/auth/config");
        if (configRes.ok) {
          const configData = await configRes.json();
          setSystemConfig({
            maintenanceMode: configData.maintenanceMode ?? false,
            emailNotifications: configData.emailNotifications ?? true,
            publicFeedback: configData.publicFeedback ?? true,
          });
        }

        // Fetch Admin Profile Data
        // We get the email from localStorage (stored during login)
        const adminEmail = localStorage.getItem("userEmail") || "admin@edu.lk";
        const userRes = await fetch("http://localhost:5000/api/auth/users");
        if (userRes.ok) {
          const users = await userRes.json();
          const currentAdmin = users.find((u) => u.email === adminEmail);
          if (currentAdmin) {
            setProfile({
              name: currentAdmin.fullName,
              email: currentAdmin.email,
              role: currentAdmin.role,
            });
          }
        }
      } catch (err) {
        console.error("Initialization error:", err);
      }
    };
    fetchInitialData();
  }, []);

  const handleLogout = () => {
    localStorage.clear();
    navigate("/");
  };

  // 2. Save Admin Profile to Backend
  const handleUpdateProfile = async () => {
    try {
      const response = await fetch("http://localhost:5000/api/auth/update-profile", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: profile.email,
          name: profile.name,
        }),
      });

      if (response.ok) {
        alert("Admin profile updated successfully! 👤");
      } else {
        alert("Failed to update profile. ❌");
      }
    } catch (err) {
      alert("Server error during profile update.");
    }
  };

  // 3. Save System Settings to Backend
  const handleSaveConfig = async () => {
    try {
      const response = await fetch("http://localhost:5000/api/auth/config", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(systemConfig),
      });

      if (response.ok) {
        alert("System settings saved successfully! ✅");
      } else {
        alert("Failed to save settings. ❌");
      }
    } catch (err) {
      alert("Backend connection error.");
    }
  };

  // 4. Purge All Logs (Danger Zone)
  const handlePurgeLogs = async () => {
    if (!window.confirm("⚠️ WARNING: This will delete ALL platform activity logs forever. Proceed?")) return;

    try {
      const response = await fetch("http://localhost:5000/api/auth/logs/purge", {
        method: "DELETE",
      });
      if (response.ok) {
        alert("Logs purged successfully! 🔥");
      }
    } catch (err) {
      alert("Error purging logs.");
    }
  };

  return (
    <div className="dashboard-container">
      {/* Sidebar */}
      <div className="sidebar">
        <div className="sidebar-brand">UniCare</div>
        <ul>
          <li onClick={() => navigate("/admin-dashboard")}>🛡️ Control Panel</li>
          <li onClick={() => navigate("/admin-analytics")}>📊 System Analytics</li>
          <li onClick={() => navigate("/admin-users")}>👥 User Management</li>
          <li onClick={() => navigate("/admin-logs")}>📝 Platform Logs</li>
          <li onClick={() => navigate("/system-config")} className="active">⚙️ System Config</li>
          <li onClick={() => navigate('/settings')}>⚙️ Settings</li>
        </ul>
        <ul style={{ flex: 0 }}>
          <li onClick={handleLogout} style={{ color: "#dc3545" }}>🚪 Logout</li>
        </ul>
      </div>

      {/* Main Content */}
      <div className="main-content">
        <div className="welcome-card" style={{ borderLeft: "5px solid #6c757d" }}>
          <h1 style={{ color: "#333", marginBottom: "10px" }}>Global Settings ⚙️</h1>
          <p style={{ color: "#666" }}>Manage your account security and platform-wide configurations.</p>
        </div>

        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "30px" }}>
          
          {/* Section 1: Admin Profile */}
          <div className="config-section" style={{ background: "white", padding: "25px", borderRadius: "10px", boxShadow: "0 2px 10px rgba(0,0,0,0.05)" }}>
            <h3 style={{ marginBottom: "20px", color: "#333" }}>👤 Admin Profile</h3>
            <div style={{ display: "flex", flexDirection: "column", gap: "15px" }}>
              <div>
                <label style={{ display: "block", marginBottom: "5px", fontSize: "14px", color: "#666" }}>Full Name</label>
                <input
                  type="text"
                  value={profile.name}
                  onChange={(e) => setProfile({ ...profile, name: e.target.value })}
                  style={{ width: "100%", padding: "10px", borderRadius: "5px", border: "1px solid #ddd" }}
                />
              </div>
              <div>
                <label style={{ display: "block", marginBottom: "5px", fontSize: "14px", color: "#666" }}>Email Address</label>
                <input
                  type="email"
                  value={profile.email}
                  style={{ width: "100%", padding: "10px", borderRadius: "5px", border: "1px solid #ddd", backgroundColor: "#f8f9fa" }}
                  disabled
                />
              </div>
              <button
                onClick={handleUpdateProfile}
                style={{ padding: "10px", background: "#007bff", color: "white", border: "none", borderRadius: "5px", cursor: "pointer", fontWeight: "bold" }}
              >
                Update Profile
              </button>
            </div>
          </div>

          {/* Section 2: System Configuration */}
          <div className="config-section" style={{ background: "white", padding: "25px", borderRadius: "10px", boxShadow: "0 2px 10px rgba(0,0,0,0.05)" }}>
            <h3 style={{ marginBottom: "20px", color: "#333" }}>🌐 System Configuration</h3>
            <div style={{ display: "flex", flexDirection: "column", gap: "20px" }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <div>
                  <strong style={{ display: "block" }}>Maintenance Mode</strong>
                  <span style={{ fontSize: "12px", color: "#888" }}>Disable platform for all users</span>
                </div>
                <input
                  type="checkbox"
                  checked={systemConfig.maintenanceMode}
                  onChange={(e) => setSystemConfig({ ...systemConfig, maintenanceMode: e.target.checked })}
                  style={{ width: "20px", height: "20px" }}
                />
              </div>

              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <div>
                  <strong style={{ display: "block" }}>Email Notifications</strong>
                  <span style={{ fontSize: "12px", color: "#888" }}>Send alerts for new feedback</span>
                </div>
                <input
                  type="checkbox"
                  checked={systemConfig.emailNotifications}
                  onChange={(e) => setSystemConfig({ ...systemConfig, emailNotifications: e.target.checked })}
                  style={{ width: "20px", height: "20px" }}
                />
              </div>

              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <div>
                  <strong style={{ display: "block" }}>Allow Anonymous Feedback</strong>
                  <span style={{ fontSize: "12px", color: "#888" }}>Enable the anonymous toggle for students</span>
                </div>
                <input
                  type="checkbox"
                  checked={systemConfig.publicFeedback}
                  onChange={(e) => setSystemConfig({ ...systemConfig, publicFeedback: e.target.checked })}
                  style={{ width: "20px", height: "20px" }}
                />
              </div>

              <button
                onClick={handleSaveConfig}
                style={{ padding: "10px", background: "#28a745", color: "white", border: "none", borderRadius: "5px", cursor: "pointer", fontWeight: "bold" }}
              >
                Save System Config
              </button>
            </div>
          </div>

          {/* Section 3: Danger Zone */}
          <div style={{ background: "#fff5f5", padding: "25px", borderRadius: "10px", boxShadow: "0 2px 10px rgba(0,0,0,0.05)", border: "1px solid #feb2b2", gridColumn: "span 2" }}>
            <h3 style={{ marginBottom: "10px", color: "#c53030" }}>⚠️ Danger Zone</h3>
            <p style={{ fontSize: "14px", color: "#742a2a", marginBottom: "15px" }}>These actions are irreversible. Please be careful.</p>
            <div style={{ display: "flex", gap: "15px" }}>
              <button
                onClick={handlePurgeLogs}
                style={{ padding: "10px 20px", background: "#c53030", color: "white", border: "none", borderRadius: "5px", cursor: "pointer" }}
              >
                Purge All Logs
              </button>
              <button
                onClick={() => alert("Feature coming soon...")}
                style={{ padding: "10px 20px", background: "transparent", color: "#c53030", border: "1px solid #c53030", borderRadius: "5px", cursor: "pointer" }}
              >
                Reset System Database
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SystemConfig;
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import toast from "react-hot-toast";

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5001";

export default function SystemConfig() {
  const navigate = useNavigate();
  const { user, login } = useAuth();
  
  const [profile, setProfile] = useState({ name: "", email: "" });
  const [systemConfig, setSystemConfig] = useState({
    maintenanceMode: false,
    emailNotifications: true,
    publicFeedback: true,
  });

  useEffect(() => {
    if (user) setProfile({ name: user.name || "", email: user.email || "" });
    
    // Fetch system backend config
    const fetchConfig = async () => {
      try {
        const res = await fetch(`${API_URL}/api/auth/config`);
        const json = await res.json();
        if (json.success && json.data) {
          setSystemConfig({
            maintenanceMode: json.data.maintenanceMode ?? false,
            emailNotifications: json.data.emailNotifications ?? true,
            publicFeedback: json.data.publicFeedback ?? true,
          });
        }
      } catch (err) {
        toast.error("Failed to load system configuration");
      }
    };
    fetchConfig();
  }, [user]);

  const handleUpdateProfile = async () => {
    try {
      const res = await fetch(`${API_URL}/api/auth/update-profile`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: profile.email, name: profile.name }),
      });
      const json = await res.json();
      if (json.success) {
        toast.success("Admin profile updated successfully! 👤");
        // Update auth context
        if (user) login({ ...user, name: json.data.name }); 
      } else {
        toast.error(json.msg || "Failed to update profile.");
      }
    } catch (err) {
      toast.error("Server error during profile update.");
    }
  };

  const handleSaveConfig = async () => {
    try {
      const res = await fetch(`${API_URL}/api/auth/config`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(systemConfig),
      });
      const json = await res.json();
      if (json.success) toast.success("System settings saved successfully! ✅");
      else toast.error(json.msg || "Failed to save settings.");
    } catch (err) {
      toast.error("Backend connection error.");
    }
  };

  const handlePurgeLogs = async () => {
    if (!window.confirm("⚠️ WARNING: This will delete ALL platform activity logs forever. Proceed?")) return;
    try {
      const res = await fetch(`${API_URL}/api/auth/logs/purge`, { method: "DELETE" });
      const json = await res.json();
      if (json.success) toast.success("Logs purged successfully! 🔥");
      else toast.error(json.msg || "Error purging logs.");
    } catch (err) {
      toast.error("Server error while purging logs.");
    }
  };

  return (
    <div className="bg-gray-50 min-h-screen pt-12 pb-24">
      <div className="max-w-5xl mx-auto px-6">
        <div className="mb-8">
          <button onClick={() => navigate('/admin-dashboard')} className="text-sm text-blue-600 hover:underline mb-4 flex items-center gap-1">
            ← Back to Admin Dashboard
          </button>
          <div className="border-l-4 border-gray-500 pl-4">
            <h1 className="text-3xl font-extrabold text-gray-900 font-serif mb-1">Global Settings ⚙️</h1>
            <p className="text-gray-500">Manage your account and platform-wide configurations.</p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {/* Admin Profile */}
          <div className="bg-white p-8 rounded-2xl shadow-sm border border-gray-100">
            <h3 className="text-xl font-bold text-gray-800 mb-6 flex items-center gap-2">👤 Admin Profile</h3>
            <div className="space-y-5">
              <div>
                <label className="block text-sm font-semibold text-gray-600 mb-2">Full Name</label>
                <input
                  type="text"
                  value={profile.name}
                  onChange={(e) => setProfile({ ...profile, name: e.target.value })}
                  className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all outline-none"
                />
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-600 mb-2">Email Address</label>
                <input
                  type="email"
                  value={profile.email}
                  disabled
                  className="w-full px-4 py-3 rounded-xl border border-gray-200 bg-gray-50 text-gray-500 outline-none"
                />
              </div>
              <button
                onClick={handleUpdateProfile}
                className="w-full py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-bold shadow-sm transition-all"
              >
                Update Profile
              </button>
            </div>
          </div>

          {/* System Config */}
          <div className="bg-white p-8 rounded-2xl shadow-sm border border-gray-100">
            <h3 className="text-xl font-bold text-gray-800 mb-6 flex items-center gap-2">🌐 Platform Behavior</h3>
            <div className="space-y-6">
              
              <div className="flex items-start justify-between">
                <div>
                  <strong className="block text-gray-800">Maintenance Mode</strong>
                  <span className="text-xs text-gray-500 mt-1 block">Disable platform for all non-admin users</span>
                </div>
                <label className="relative inline-flex items-center cursor-pointer mt-1">
                  <input type="checkbox" className="sr-only peer" checked={systemConfig.maintenanceMode} onChange={(e) => setSystemConfig({...systemConfig, maintenanceMode: e.target.checked})} />
                  <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-emerald-500"></div>
                </label>
              </div>

              <div className="flex items-start justify-between">
                <div>
                  <strong className="block text-gray-800">Email Notifications</strong>
                  <span className="text-xs text-gray-500 mt-1 block">Send email alerts to admins for new feedback</span>
                </div>
                <label className="relative inline-flex items-center cursor-pointer mt-1">
                  <input type="checkbox" className="sr-only peer" checked={systemConfig.emailNotifications} onChange={(e) => setSystemConfig({...systemConfig, emailNotifications: e.target.checked})} />
                  <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-emerald-500"></div>
                </label>
              </div>

              <div className="flex items-start justify-between">
                <div>
                  <strong className="block text-gray-800">Anonymous Feedback</strong>
                  <span className="text-xs text-gray-500 mt-1 block">Allow users to hide identity in feedback forms</span>
                </div>
                <label className="relative inline-flex items-center cursor-pointer mt-1">
                  <input type="checkbox" className="sr-only peer" checked={systemConfig.publicFeedback} onChange={(e) => setSystemConfig({...systemConfig, publicFeedback: e.target.checked})} />
                  <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-emerald-500"></div>
                </label>
              </div>

              <button
                onClick={handleSaveConfig}
                className="w-full mt-4 py-3 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl font-bold shadow-sm transition-all"
              >
                Save Configuration
              </button>
            </div>
          </div>

          {/* Danger Zone */}
          <div className="md:col-span-2 bg-rose-50 p-8 rounded-2xl border border-rose-200">
            <h3 className="text-xl font-bold text-rose-700 mb-2 flex items-center gap-2">⚠️ Danger Zone</h3>
            <p className="text-sm text-rose-600 mb-6 opacity-90">These actions are irreversible and affect production data. Proceed with caution.</p>
            
            <div className="flex flex-wrap gap-4">
              <button
                onClick={handlePurgeLogs}
                className="px-6 py-3 bg-rose-600 hover:bg-rose-700 text-white rounded-xl font-bold shadow-sm transition-all"
              >
                Purge All Activity Logs
              </button>
              <button
                onClick={() => toast("Feature disabled in current environment", { icon: "ℹ️" })}
                className="px-6 py-3 border-2 border-rose-600 text-rose-700 hover:bg-rose-100 rounded-xl font-bold transition-all"
              >
                Factory Reset Database
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

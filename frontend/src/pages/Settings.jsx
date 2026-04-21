import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import toast from 'react-hot-toast';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5001';

export default function Settings() {
  const navigate = useNavigate();
  const { user, login } = useAuth();
  
  const [activeTab, setActiveTab] = useState('profile');
  const [hideEmail, setHideEmail] = useState(true);
  const [profile, setProfile] = useState({ name: '', email: '' });
  const [passwords, setPasswords] = useState({ current: '', new: '' });
  const [sessions, setSessions] = useState([]);

  useEffect(() => {
    if (user) {
      setProfile({ name: user.name || '', email: user.email || '' });
      fetchSessions(user.email);
    }
  }, [user]);

  const fetchSessions = async (email) => {
    if (!email) return;
    try {
      const res = await fetch(`${API_URL}/api/auth/sessions/${email}`);
      const json = await res.json();
      if (json.success) setSessions(json.data);
    } catch {
      console.error('Failed to load sessions');
    }
  };

  const handleUpdateProfile = async () => {
    try {
      const res = await fetch(`${API_URL}/api/auth/update-profile`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: profile.email, name: profile.name }),
      });
      const json = await res.json();
      if (json.success) {
        toast.success('Profile saved successfully! ✅');
        if (user) login({ ...user, name: json.data.name });
      } else {
        toast.error(json.msg || 'Failed to save profile');
      }
    } catch {
      toast.error('Connection error.');
    }
  };

  const handleUpdatePassword = async () => {
    if (!passwords.current || !passwords.new) {
      toast.error('Please fill in both password fields');
      return;
    }
    try {
      const res = await fetch(`${API_URL}/api/auth/update-password`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: profile.email,
          currentPassword: passwords.current,
          newPassword: passwords.new
        }),
      });
      const json = await res.json();
      if (json.success) {
        toast.success('Password updated successfully! 🔒');
        setPasswords({ current: '', new: '' });
      } else {
        toast.error(json.msg || 'Update failed');
      }
    } catch {
      toast.error('Server error during update');
    }
  };

  const handleRemoteLogout = async (sessionId) => {
    try {
      const res = await fetch(`${API_URL}/api/auth/sessions/${sessionId}`, { method: 'DELETE' });
      const json = await res.json();
      if (json.success) {
        setSessions(sessions.filter(s => s._id !== sessionId));
        toast.success('Device logged out successfully! 👋');
      }
    } catch {
      toast.error('Error during remote logout');
    }
  };

  const handleBack = () => {
    if (!user) { navigate('/'); return; }
    if (user.role === 'admin') navigate('/admin-dashboard');
    else if (user.role === 'counsellor') navigate('/counsellor/dashboard');
    else navigate('/dashboard');
  };

  const maskedEmail = profile.email.replace(/(.{3})(.*)(?=@)/,
    (match, p1, p2) => p1 + '*'.repeat(p2.length)
  );

  return (
    <div className="min-h-screen bg-gray-50 flex justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-5xl w-full flex flex-col md:flex-row gap-8">
        
        {/* Sidebar */}
        <div className="w-full md:w-64 shrink-0">
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden sticky top-8">
            <h3 className="px-6 py-5 text-lg font-bold text-gray-900 border-b border-gray-100">Settings</h3>
            <div className="flex flex-col py-2">
              <button onClick={() => setActiveTab('profile')} className={`px-6 py-3 text-left font-medium transition ${activeTab === 'profile' ? 'text-blue-600 bg-blue-50 border-r-4 border-blue-600' : 'text-gray-600 hover:bg-gray-50'}`}>
                👤 Profile Details
              </button>
              <button onClick={() => setActiveTab('security')} className={`px-6 py-3 text-left font-medium transition ${activeTab === 'security' ? 'text-blue-600 bg-blue-50 border-r-4 border-blue-600' : 'text-gray-600 hover:bg-gray-50'}`}>
                🔒 Security & Devices
              </button>
            </div>
            <div className="border-t border-gray-100 p-4">
              <button onClick={handleBack} className="w-full px-4 py-2 text-sm font-semibold text-gray-600 bg-gray-100 hover:bg-gray-200 rounded-lg transition">
                ← Back to Dashboard
              </button>
            </div>
          </div>
        </div>

        {/* Content Area */}
        <div className="flex-1">
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-8 min-h-[500px]">
            
            {activeTab === 'profile' && (
              <div className="animate-fade-in">
                <h2 className="text-2xl font-bold text-gray-900 mb-6">Profile Details</h2>
                
                <div className="flex flex-wrap items-center gap-6 mb-8 bg-blue-50/50 p-6 rounded-xl border border-blue-100">
                  <div className="w-20 h-20 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center text-3xl font-black shrink-0">
                    {profile.name ? profile.name.charAt(0).toUpperCase() : '?'}
                  </div>
                  <div>
                    <h3 className="text-lg font-bold text-gray-900">{profile.name || 'User'}</h3>
                    <p className="text-sm text-gray-500 capitalize">{user?.role || 'Guest'} Account</p>
                  </div>
                </div>

                <div className="space-y-6 max-w-xl">
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">Full Name</label>
                    <input 
                      type="text" 
                      value={profile.name} 
                      onChange={(e) => setProfile({...profile, name: e.target.value})} 
                      className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-blue-500 outline-none transition"
                    />
                  </div>
                  <div>
                    <div className="flex justify-between items-center mb-2">
                       <label className="block text-sm font-semibold text-gray-700">Email Address</label>
                       <button onClick={() => setHideEmail(!hideEmail)} className="text-sm text-blue-600 hover:underline font-medium">
                         {hideEmail ? '👁️ Show' : '🙈 Hide'}
                       </button>
                    </div>
                    <input 
                      type="email" 
                      value={hideEmail ? maskedEmail : profile.email} 
                      disabled 
                      className="w-full px-4 py-3 rounded-xl border border-gray-100 bg-gray-50 text-gray-500 outline-none"
                    />
                    <p className="text-xs text-gray-400 mt-2">Email address cannot be changed directly. Contact support if needed.</p>
                  </div>
                  <div className="pt-4">
                    <button onClick={handleUpdateProfile} className="px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-bold shadow-sm transition">
                      Save Profile Changes
                    </button>
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'security' && (
              <div className="animate-fade-in">
                <h2 className="text-2xl font-bold text-gray-900 mb-8">Security & Access</h2>
                
                <div className="mb-12 max-w-xl">
                  <h3 className="text-lg font-bold text-gray-800 mb-4 flex items-center gap-2"><span>🔑</span> Change Password</h3>
                  <div className="space-y-4">
                    <input 
                      type="password" 
                      placeholder="Current Password" 
                      value={passwords.current}
                      onChange={(e) => setPasswords({...passwords, current: e.target.value})}
                      className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-blue-500 outline-none transition"
                    />
                    <input 
                      type="password" 
                      placeholder="New Password" 
                      value={passwords.new}
                      onChange={(e) => setPasswords({...passwords, new: e.target.value})}
                      className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-blue-500 outline-none transition"
                    />
                    <button onClick={handleUpdatePassword} className="px-6 py-3 bg-gray-900 hover:bg-gray-800 text-white rounded-xl font-bold shadow-sm transition mt-2">
                      Update Password
                    </button>
                  </div>
                </div>

                <div>
                  <h3 className="text-lg font-bold text-gray-800 mb-2 flex items-center gap-2"><span>📱</span> Logged-in Devices</h3>
                  <p className="text-sm text-gray-500 mb-6">Devices currently accessing your account. If you spot an unfamiliar device, log it out immediately.</p>
                  
                  {sessions.length === 0 ? (
                    <div className="p-6 bg-gray-50 rounded-xl text-center text-gray-500 border border-gray-100 border-dashed">
                      No active sessions detected other than your current browser.
                    </div>
                  ) : (
                    <div className="space-y-3">
                      {sessions.map((s) => (
                        <div key={s._id} className="flex flex-col sm:flex-row sm:items-center justify-between p-4 bg-gray-50 rounded-xl border border-gray-100 gap-4">
                          <div>
                            <h4 className="font-bold text-gray-900">{s.device}</h4>
                            <p className="text-xs font-medium text-gray-500 mt-1">
                              {s.location} • Last seen {new Date(s.lastSeen).toLocaleString()}
                            </p>
                          </div>
                          <button 
                            onClick={() => handleRemoteLogout(s._id)}
                            className="px-4 py-2 border border-red-200 text-red-600 hover:bg-red-50 rounded-lg text-sm font-semibold transition shrink-0"
                          >
                            Log Out Device
                          </button>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

              </div>
            )}
          </div>
        </div>
      </div>
      <style>{`
        .animate-fade-in { animation: fadeIn 0.3s ease-out; }
        @keyframes fadeIn { from { opacity: 0; transform: translateY(10px); } to { opacity: 1; transform: translateY(0); } }
      `}</style>
    </div>
  );
}

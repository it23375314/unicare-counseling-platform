import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import toast from 'react-hot-toast';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5001';

export default function UserManagement() {
  const navigate = useNavigate();
  const { user, logout } = useAuth();
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('All');

  const fetchUsers = async () => {
    try {
      setLoading(true);
      const res = await fetch(`${API_URL}/api/auth/users`);
      const json = await res.json();
      if (json.success) setUsers(json.data);
    } catch {
      toast.error('Failed to fetch users');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchUsers(); }, []);

  const handleDelete = async (id, name) => {
    if (!window.confirm(`Delete ${name}? This cannot be undone.`)) return;
    try {
      const res = await fetch(`${API_URL}/api/auth/users/${id}`, { method: 'DELETE' });
      const json = await res.json();
      if (json.success) { toast.success('User deleted'); fetchUsers(); }
      else toast.error(json.msg || 'Delete failed');
    } catch { toast.error('Server error'); }
  };

  const handleApprove = async (id, name) => {
    try {
      const res = await fetch(`${API_URL}/api/auth/users/${id}/approve`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'approve' })
      });
      const json = await res.json();
      if (json.success) { toast.success(json.msg); fetchUsers(); }
      else toast.error(json.msg || 'Approval failed');
    } catch { toast.error('Server error'); }
  };

  const handleReject = async (id, name) => {
    if (!window.confirm(`Reject ${name}'s registration?`)) return;
    try {
      const res = await fetch(`${API_URL}/api/auth/users/${id}/approve`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'reject' })
      });
      const json = await res.json();
      if (json.success) { toast.success(json.msg); fetchUsers(); }
      else toast.error(json.msg || 'Rejection failed');
    } catch { toast.error('Server error'); }
  };

  const filtered = users.filter(u => {
    if (filter === 'All') return true;
    if (filter === 'Pending') return u.approvalStatus === 'pending';
    return u.role === filter.toLowerCase();
  });

  const roleBadge = (role) => {
    const map = {
      admin: 'bg-purple-100 text-purple-700',
      counsellor: 'bg-blue-100 text-blue-700',
      student: 'bg-green-100 text-green-700',
    };
    return map[role] || 'bg-gray-100 text-gray-700';
  };

  const statusColor = (status) => {
    if (status === 'approved') return 'text-emerald-600 font-semibold';
    if (status === 'pending') return 'text-amber-500 font-semibold';
    if (status === 'rejected') return 'text-red-500 font-semibold';
    return 'text-gray-500';
  };

  return (
    <div className="bg-gray-50 min-h-screen pt-12 pb-24">
      <div className="max-w-7xl mx-auto px-6">
        {/* Header */}
        <div className="mb-8">
          <button onClick={() => navigate('/admin-dashboard')} className="text-sm text-blue-600 hover:underline mb-4 flex items-center gap-1">
            ← Back to Admin Dashboard
          </button>
          <h1 className="text-3xl font-extrabold text-gray-900 font-serif mb-1">User Management 👥</h1>
          <p className="text-gray-500">Manage students, counsellors, and platform access.</p>
        </div>

        {/* Filter Tabs */}
        <div className="flex gap-2 mb-6 flex-wrap">
          {['All', 'Student', 'Counsellor', 'Pending'].map(tab => (
            <button
              key={tab}
              onClick={() => setFilter(tab)}
              className={`px-4 py-2 rounded-xl font-semibold text-sm transition-all shadow-sm ${
                filter === tab ? 'bg-blue-600 text-white' : 'bg-white border border-gray-200 text-gray-600 hover:bg-gray-50'
              }`}
            >
              {tab}
              {tab === 'Pending' && users.filter(u => u.approvalStatus === 'pending').length > 0 && (
                <span className="ml-2 bg-amber-500 text-white text-xs font-black rounded-full px-2 py-0.5">
                  {users.filter(u => u.approvalStatus === 'pending').length}
                </span>
              )}
            </button>
          ))}
        </div>

        {/* Table */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
          {loading ? (
            <div className="p-16 text-center">
              <div className="animate-spin w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full mx-auto mb-4" />
              <p className="text-gray-400">Loading users...</p>
            </div>
          ) : (
            <table className="w-full text-left text-sm">
              <thead className="bg-gray-50 border-b border-gray-100 text-gray-500 text-xs uppercase tracking-wider">
                <tr>
                  <th className="px-6 py-4">Name / Email</th>
                  <th className="px-6 py-4">IT Number</th>
                  <th className="px-6 py-4">Role</th>
                  <th className="px-6 py-4">Approval</th>
                  <th className="px-6 py-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {filtered.length === 0 ? (
                  <tr><td colSpan="5" className="px-6 py-12 text-center text-gray-400">No users found for this filter.</td></tr>
                ) : filtered.map(u => (
                  <tr key={u._id} className="hover:bg-gray-50 transition">
                    <td className="px-6 py-4">
                      <p className="font-semibold text-gray-900">{u.name}</p>
                      <p className="text-xs text-gray-400">{u.email}</p>
                    </td>
                    <td className="px-6 py-4 text-gray-500 font-mono text-xs">{u.itNumber}</td>
                    <td className="px-6 py-4">
                      <span className={`px-3 py-1 rounded-full text-xs font-bold uppercase ${roleBadge(u.role)}`}>
                        {u.role}
                      </span>
                    </td>
                    <td className={`px-6 py-4 capitalize ${statusColor(u.approvalStatus)}`}>
                      {u.approvalStatus || 'approved'}
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex justify-end gap-2">
                        {u.approvalStatus === 'pending' && (
                          <>
                            <button onClick={() => handleApprove(u._id, u.name)}
                              className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-xs font-semibold transition">
                              Approve
                            </button>
                            <button onClick={() => handleReject(u._id, u.name)}
                              className="px-3 py-1.5 border border-rose-300 text-rose-600 hover:bg-rose-50 rounded-lg text-xs font-semibold transition">
                              Reject
                            </button>
                          </>
                        )}
                        {u._id !== user?.id && (
                          <button onClick={() => handleDelete(u._id, u.name)}
                            className="px-3 py-1.5 border border-red-200 text-red-500 hover:bg-red-50 rounded-lg text-xs font-semibold transition">
                            Delete
                          </button>
                        )}
                      </div>
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
}

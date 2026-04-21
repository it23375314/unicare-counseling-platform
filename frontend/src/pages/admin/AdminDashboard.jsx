import { useState, useEffect } from "react";
import { useCounsellorContext } from "../../context/CounsellorContext";
import { Plus, Edit2, Trash2, CheckCircle, XCircle, Clock, Users, UserCheck } from "lucide-react";
import toast from "react-hot-toast";

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5001";

export default function AdminDashboard() {
  const { counsellors, addCounsellor, editCounsellor, deleteCounsellor } = useCounsellorContext();
  const [activeTab, setActiveTab] = useState("pending");
  const [showModal, setShowModal] = useState(false);
  const [formData, setFormData] = useState({ id: null, name: "", email: "", specialization: "", experience: "" });
  const [errors, setErrors] = useState({});
  const [pendingCounsellors, setPendingCounsellors] = useState([]);
  const [loadingPending, setLoadingPending] = useState(false);
  const [actionLoading, setActionLoading] = useState({});

  // Fetch pending counsellor registrations
  useEffect(() => {
    if (activeTab === "pending") fetchPending();
  }, [activeTab]);

  const fetchPending = async () => {
    setLoadingPending(true);
    try {
      const res = await fetch(`${API_URL}/api/auth/users?role=counsellor&status=pending`);
      const json = await res.json();
      if (json.success) setPendingCounsellors(json.data);
    } catch (e) {
      toast.error("Failed to fetch pending registrations");
    } finally {
      setLoadingPending(false);
    }
  };

  const handleApprove = async (userId, name) => {
    setActionLoading(prev => ({ ...prev, [userId]: "approving" }));
    try {
      const res = await fetch(`${API_URL}/api/auth/users/${userId}/approve`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "approve" })
      });
      const json = await res.json();
      if (json.success) {
        toast.success(json.msg);
        fetchPending();
      } else {
        toast.error(json.msg || "Approval failed");
      }
    } catch (e) {
      toast.error("Server error during approval");
    } finally {
      setActionLoading(prev => ({ ...prev, [userId]: null }));
    }
  };

  const handleReject = async (userId, name) => {
    if (!window.confirm(`Are you sure you want to reject ${name}'s registration?`)) return;
    setActionLoading(prev => ({ ...prev, [userId]: "rejecting" }));
    try {
      const res = await fetch(`${API_URL}/api/auth/users/${userId}/approve`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "reject" })
      });
      const json = await res.json();
      if (json.success) {
        toast.success(json.msg);
        fetchPending();
      } else {
        toast.error(json.msg || "Rejection failed");
      }
    } catch (e) {
      toast.error("Server error during rejection");
    } finally {
      setActionLoading(prev => ({ ...prev, [userId]: null }));
    }
  };

  const validateForm = () => {
    const newErrors = {};
    const trimmedName = formData.name.trim();
    if (!trimmedName) { newErrors.name = "Full name is required"; }
    else if (/[^a-zA-Z\s]/.test(trimmedName)) { newErrors.name = "Full name must contain letters only"; }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!formData.email) { newErrors.email = "Email is required"; }
    else if (!emailRegex.test(formData.email)) { newErrors.email = "Enter a valid email address"; }
    else {
      const isDuplicate = counsellors.some(c => c.email.toLowerCase() === formData.email.toLowerCase() && c.id !== formData.id);
      if (isDuplicate) newErrors.email = "This email is already registered";
    }

    if (!formData.specialization.trim()) { newErrors.specialization = "Specialization is required"; }
    const expRaw = formData.experience.toString().trim();
    if (!expRaw) { newErrors.experience = "Experience is required"; }
    else if (/[^0-9]/.test(expRaw)) { newErrors.experience = "Experience must be a number only"; }
    else { const years = parseInt(expRaw); if (isNaN(years) || years < 0 || years > 50) newErrors.experience = "Enter valid experience (0–50)"; }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!validateForm()) { toast.error("Please fix the validation errors before saving."); return; }
    const finalData = { ...formData, name: formData.name.trim(), specialization: formData.specialization.trim() };
    try {
      if (formData.id) { editCounsellor(formData.id, finalData); toast.success("Counsellor updated successfully!"); }
      else { addCounsellor(finalData); toast.success("Counsellor added successfully!"); }
      setShowModal(false);
      setErrors({});
    } catch (err) { toast.error(err.message || "An error occurred."); }
  };

  return (
    <div className="bg-gray-50 min-h-screen pt-12 pb-24">
      <div className="max-w-7xl mx-auto px-6 lg:px-8">
        
        {/* Header */}
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-extrabold text-gray-900 font-serif mb-2">Counsellor Management</h1>
            <p className="text-gray-600">Manage counsellor registrations and approved profiles.</p>
          </div>
          {activeTab === "approved" && (
            <button
              onClick={() => { setFormData({ id: null, name: "", email: "", specialization: "", experience: "" }); setErrors({}); setShowModal(true); }}
              className="bg-blue-600 hover:bg-blue-700 text-white px-5 py-2.5 rounded-lg flex items-center gap-2 font-medium transition shadow-sm"
            >
              <Plus size={18} /> Add Counsellor
            </button>
          )}
        </div>

        {/* Tab Navigation */}
        <div className="flex gap-2 mb-6">
          <button
            onClick={() => setActiveTab("pending")}
            className={`flex items-center gap-2 px-5 py-2.5 rounded-xl font-semibold text-sm transition-all ${activeTab === "pending" ? "bg-amber-500 text-white shadow-md" : "bg-white text-gray-600 border border-gray-200 hover:bg-gray-50"}`}
          >
            <Clock size={16} />
            Pending Approvals
            {pendingCounsellors.length > 0 && activeTab !== "pending" && (
              <span className="bg-amber-500 text-white text-xs font-black rounded-full w-5 h-5 flex items-center justify-center">{pendingCounsellors.length}</span>
            )}
          </button>
          <button
            onClick={() => setActiveTab("approved")}
            className={`flex items-center gap-2 px-5 py-2.5 rounded-xl font-semibold text-sm transition-all ${activeTab === "approved" ? "bg-blue-600 text-white shadow-md" : "bg-white text-gray-600 border border-gray-200 hover:bg-gray-50"}`}
          >
            <UserCheck size={16} /> Approved Counsellors
          </button>
        </div>

        {/* ── Pending Tab ── */}
        {activeTab === "pending" && (
          <div>
            {loadingPending ? (
              <div className="bg-white rounded-2xl p-16 text-center border border-gray-100">
                <div className="animate-spin w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full mx-auto mb-4" />
                <p className="text-gray-500">Loading pending registrations...</p>
              </div>
            ) : pendingCounsellors.length === 0 ? (
              <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-16 text-center">
                <CheckCircle className="mx-auto h-14 w-14 text-emerald-300 mb-4" />
                <h3 className="text-lg font-bold text-gray-700 mb-1">All caught up!</h3>
                <p className="text-gray-400 text-sm">No pending counsellor registrations at this time.</p>
              </div>
            ) : (
              <div className="space-y-4">
                {pendingCounsellors.map(c => (
                  <div key={c._id} className="bg-white rounded-2xl border border-amber-100 shadow-sm p-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 rounded-xl bg-amber-100 flex items-center justify-center text-amber-700 font-black text-lg">
                        {c.name?.charAt(0)?.toUpperCase() || "?"}
                      </div>
                      <div>
                        <h3 className="font-bold text-gray-900 text-base">{c.name}</h3>
                        <p className="text-sm text-gray-500">{c.email}</p>
                        {c.specialization && (
                          <span className="text-xs bg-blue-50 text-blue-700 px-2 py-0.5 rounded font-semibold mt-1 inline-block">{c.specialization}</span>
                        )}
                        <p className="text-xs text-gray-400 mt-1">IT: {c.itNumber} · Registered: {new Date(c.createdAt).toLocaleDateString()}</p>
                      </div>
                    </div>
                    <div className="flex gap-3 shrink-0">
                      <button
                        onClick={() => handleApprove(c._id, c.name)}
                        disabled={!!actionLoading[c._id]}
                        className="flex items-center gap-2 px-5 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl font-semibold text-sm transition disabled:opacity-60"
                      >
                        <CheckCircle size={16} />
                        {actionLoading[c._id] === "approving" ? "Approving..." : "Approve"}
                      </button>
                      <button
                        onClick={() => handleReject(c._id, c.name)}
                        disabled={!!actionLoading[c._id]}
                        className="flex items-center gap-2 px-5 py-2.5 bg-white border border-rose-200 text-rose-600 hover:bg-rose-50 rounded-xl font-semibold text-sm transition disabled:opacity-60"
                      >
                        <XCircle size={16} />
                        {actionLoading[c._id] === "rejecting" ? "Rejecting..." : "Reject"}
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* ── Approved Tab ── */}
        {activeTab === "approved" && (
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-gray-50 border-b border-gray-100 text-gray-500 text-sm font-semibold uppercase tracking-wider">
                  <th className="px-6 py-4">Name</th>
                  <th className="px-6 py-4">Email</th>
                  <th className="px-6 py-4">Specialization</th>
                  <th className="px-6 py-4">Experience</th>
                  <th className="px-6 py-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {counsellors.map(c => (
                  <tr key={c.id} className="hover:bg-gray-50 text-sm text-gray-700 transition">
                    <td className="px-6 py-4 font-medium text-gray-900">{c.name}</td>
                    <td className="px-6 py-4">{c.email}</td>
                    <td className="px-6 py-4"><span className="bg-teal-50 text-teal-700 px-2 py-1 rounded text-xs font-semibold">{c.specialization}</span></td>
                    <td className="px-6 py-4">{c.experience} yr{c.experience !== "1" ? "s" : ""}</td>
                    <td className="px-6 py-4 text-right flex items-center justify-end gap-3">
                      <button onClick={() => { setFormData(c); setShowModal(true); }} className="text-blue-600 hover:text-blue-800 p-1 bg-blue-50 rounded"><Edit2 size={16} /></button>
                      <button onClick={() => { if (window.confirm("Are you sure?")) deleteCounsellor(c.id); }} className="text-red-500 hover:text-red-700 p-1 bg-red-50 rounded"><Trash2 size={16} /></button>
                    </td>
                  </tr>
                ))}
                {counsellors.length === 0 && (
                  <tr><td colSpan="5" className="px-6 py-8 text-center text-gray-500">No approved counsellors found. Add one above or approve pending registrations.</td></tr>
                )}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Add/Edit Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl p-6 w-full max-w-md shadow-2xl">
            <h2 className="text-2xl font-bold mb-6 text-gray-900">{formData.id ? "Edit Counsellor" : "Add Counsellor"}</h2>
            <form onSubmit={handleSubmit} className="space-y-4">
              {["name", "email", "specialization"].map(field => (
                <div key={field}>
                  <label className="block text-sm font-medium text-gray-700 mb-1 capitalize">{field} *</label>
                  <input type={field === "email" ? "email" : "text"} value={formData[field]}
                    onChange={e => { setFormData({...formData, [field]: e.target.value}); if(errors[field]) setErrors({...errors, [field]: null}); }}
                    className={`w-full border rounded-lg p-3 text-sm focus:ring-2 focus:ring-blue-600 outline-none transition ${errors[field] ? 'border-red-500 bg-red-50' : 'border-gray-300'}`}
                  />
                  {errors[field] && <p className="text-red-600 text-xs mt-1 font-medium">{errors[field]}</p>}
                </div>
              ))}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Experience (years) *</label>
                <input type="text" placeholder="e.g. 5" value={formData.experience}
                  onChange={e => { const val = e.target.value.replace(/[^0-9]/g, ""); setFormData({...formData, experience: val}); if(errors.experience) setErrors({...errors, experience: null}); }}
                  className={`w-full border rounded-lg p-3 text-sm focus:ring-2 focus:ring-blue-600 outline-none transition ${errors.experience ? 'border-red-500 bg-red-50' : 'border-gray-300'}`}
                />
                {errors.experience && <p className="text-red-600 text-xs mt-1 font-medium">{errors.experience}</p>}
              </div>
              <div className="flex justify-end gap-3 mt-8">
                <button type="button" onClick={() => setShowModal(false)} className="px-5 py-2.5 text-sm font-medium text-gray-700 hover:bg-gray-100 rounded-lg transition">Cancel</button>
                <button type="submit" className="px-5 py-2.5 text-sm font-medium bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition shadow-sm">Save Counsellor</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

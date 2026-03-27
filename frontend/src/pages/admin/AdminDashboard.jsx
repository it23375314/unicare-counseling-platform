import { useState } from "react";
import { useCounsellorContext } from "../../context/CounsellorContext";
import { Plus, Edit2, Trash2 } from "lucide-react";

export default function AdminDashboard() {
  const { counsellors, addCounsellor, editCounsellor, deleteCounsellor } = useCounsellorContext();
  const [showModal, setShowModal] = useState(false);
  const [formData, setFormData] = useState({ id: null, name: "", email: "", specialization: "", experience: "" });

  const handleOpenEdit = (c) => {
    setFormData(c);
    setShowModal(true);
  };

  const handleOpenAdd = () => {
    setFormData({ id: null, name: "", email: "", specialization: "", experience: "" });
    setShowModal(true);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    try {
      if (formData.id) {
        editCounsellor(formData.id, formData);
      } else {
        addCounsellor(formData);
      }
      setShowModal(false);
    } catch (err) {
      alert(err.message);
    }
  };

  return (
    <div className="bg-gray-50 min-h-screen pt-12 pb-24">
      <div className="max-w-7xl mx-auto px-6 lg:px-8">
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-extrabold text-gray-900 font-serif mb-2">Counsellor Management</h1>
            <p className="text-gray-600">Administer counsellors in the UniCare system.</p>
          </div>
          <button onClick={handleOpenAdd} className="bg-blue-600 hover:bg-blue-700 text-white px-5 py-2.5 rounded-lg flex items-center gap-2 font-medium transition shadow-sm">
            <Plus size={18} /> Add Counsellor
          </button>
        </div>

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
                  <td className="px-6 py-4">
                    <span className="bg-teal-50 text-teal-700 px-2 py-1 rounded text-xs font-semibold">{c.specialization}</span>
                  </td>
                  <td className="px-6 py-4">{c.experience}</td>
                  <td className="px-6 py-4 text-right flex items-center justify-end gap-3">
                    <button onClick={() => handleOpenEdit(c)} className="text-blue-600 hover:text-blue-800 p-1 bg-blue-50 rounded"><Edit2 size={16} /></button>
                    <button onClick={() => { if(window.confirm("Are you sure?")) deleteCounsellor(c.id); }} className="text-red-500 hover:text-red-700 p-1 bg-red-50 rounded"><Trash2 size={16} /></button>
                  </td>
                </tr>
              ))}
              {counsellors.length === 0 && (
                <tr><td colSpan="5" className="px-6 py-8 text-center text-gray-500">No counsellors found. Add one to get started.</td></tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {showModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl p-6 w-full max-w-md shadow-2xl">
            <h2 className="text-2xl font-bold mb-6 text-gray-900">{formData.id ? "Edit Counsellor" : "Add Counsellor"}</h2>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Full Name *</label>
                <input required type="text" value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} className="w-full border border-gray-300 rounded-lg p-3 text-sm focus:ring-2 focus:ring-blue-600 focus:border-transparent outline-none" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Email *</label>
                <input required type="email" value={formData.email} onChange={e => setFormData({...formData, email: e.target.value})} className="w-full border border-gray-300 rounded-lg p-3 text-sm focus:ring-2 focus:ring-blue-600 focus:border-transparent outline-none" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Specialization *</label>
                <input required type="text" value={formData.specialization} onChange={e => setFormData({...formData, specialization: e.target.value})} className="w-full border border-gray-300 rounded-lg p-3 text-sm focus:ring-2 focus:ring-blue-600 focus:border-transparent outline-none" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Experience *</label>
                <input required type="text" placeholder="e.g. 5 years" value={formData.experience} onChange={e => setFormData({...formData, experience: e.target.value})} className="w-full border border-gray-300 rounded-lg p-3 text-sm focus:ring-2 focus:ring-blue-600 focus:border-transparent outline-none" />
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

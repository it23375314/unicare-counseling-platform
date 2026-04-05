import { useState } from "react";
import { useCounsellorContext } from "../../context/CounsellorContext";
import { Plus, Edit2, Trash2 } from "lucide-react";
import toast from "react-hot-toast";

export default function AdminDashboard() {
  const { counsellors, addCounsellor, editCounsellor, deleteCounsellor } = useCounsellorContext();
  const [showModal, setShowModal] = useState(false);
  const [formData, setFormData] = useState({ id: null, name: "", email: "", specialization: "", experience: "" });
  const [errors, setErrors] = useState({});

  const validateForm = () => {
    const newErrors = {};
    
    // Full Name
    const trimmedName = formData.name.trim();
    if (!trimmedName) {
      newErrors.name = "Full name is required";
    } else if (/[^a-zA-Z\s]/.test(trimmedName)) {
      newErrors.name = "Full name must contain letters only";
    }

    // Email
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!formData.email) {
      newErrors.email = "Email is required";
    } else if (!emailRegex.test(formData.email)) {
      newErrors.email = "Enter a valid email address";
    } else {
      const isDuplicate = counsellors.some(c => c.email.toLowerCase() === formData.email.toLowerCase() && c.id !== formData.id);
      if (isDuplicate) newErrors.email = "This email is already registered";
    }

    // Specialization
    if (!formData.specialization.trim()) {
      newErrors.specialization = "Specialization is required";
    } else if (/^[0-9!@#$%^&*()_+={}\[\]|\\:;"'<,>.?/]*$/.test(formData.specialization.trim())) {
      newErrors.specialization = "Specialization cannot be only numbers or symbols";
    }

    // Experience
    const expRaw = formData.experience.toString().trim();
    if (!expRaw) {
      newErrors.experience = "Experience is required";
    } else if (/[^0-9]/.test(expRaw)) {
      newErrors.experience = "Experience must be a number only";
    } else {
      const years = parseInt(expRaw);
      if (isNaN(years) || years < 0) {
        newErrors.experience = "Enter valid experience";
      } else if (years > 50) {
        newErrors.experience = "Experience value is not realistic";
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleOpenEdit = (c) => {
    setFormData(c);
    setShowModal(true);
  };

  const handleOpenAdd = () => {
    setFormData({ id: null, name: "", email: "", specialization: "", experience: "" });
    setErrors({});
    setShowModal(true);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!validateForm()) {
      toast.error("Please fix the validation errors before saving.");
      return;
    }

    const finalData = {
      ...formData,
      name: formData.name.trim(),
      specialization: formData.specialization.trim()
    };

    try {
      if (formData.id) {
        editCounsellor(formData.id, finalData);
        toast.success("Counsellor updated successfully!");
      } else {
        addCounsellor(finalData);
        toast.success("Counsellor added successfully!");
      }
      setShowModal(false);
      setErrors({});
    } catch (err) {
      toast.error(err.message || "An error occurred.");
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
                <input 
                  type="text" 
                  value={formData.name} 
                  onChange={e => { 
                    const val = e.target.value.replace(/[^a-zA-Z\s]/g, "");
                    setFormData({...formData, name: val}); 
                    if(errors.name) setErrors({...errors, name: null}); 
                  }} 
                  className={`w-full border rounded-lg p-3 text-sm focus:ring-2 focus:ring-blue-600 focus:border-transparent outline-none transition ${errors.name ? 'border-red-500 bg-red-50' : 'border-gray-300'}`} 
                />
                {errors.name && <p className="text-red-600 text-xs mt-1 font-medium">{errors.name}</p>}
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Email *</label>
                <input 
                  type="email" 
                  value={formData.email} 
                  onChange={e => { setFormData({...formData, email: e.target.value}); if(errors.email) setErrors({...errors, email: null}); }} 
                  className={`w-full border rounded-lg p-3 text-sm focus:ring-2 focus:ring-blue-600 focus:border-transparent outline-none transition ${errors.email ? 'border-red-500 bg-red-50' : 'border-gray-300'}`} 
                />
                {errors.email && <p className="text-red-600 text-xs mt-1 font-medium">{errors.email}</p>}
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Specialization *</label>
                <input 
                  type="text" 
                  value={formData.specialization} 
                  onChange={e => { setFormData({...formData, specialization: e.target.value}); if(errors.specialization) setErrors({...errors, specialization: null}); }} 
                  className={`w-full border rounded-lg p-3 text-sm focus:ring-2 focus:ring-blue-600 focus:border-transparent outline-none transition ${errors.specialization ? 'border-red-500 bg-red-50' : 'border-gray-300'}`} 
                />
                {errors.specialization && <p className="text-red-600 text-xs mt-1 font-medium">{errors.specialization}</p>}
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Experience *</label>
                <input 
                  type="text" 
                  placeholder="e.g. 5" 
                  value={formData.experience} 
                  onChange={e => { 
                    const val = e.target.value.replace(/[^0-9]/g, "");
                    setFormData({...formData, experience: val}); 
                    if(errors.experience) setErrors({...errors, experience: null}); 
                  }} 
                  className={`w-full border rounded-lg p-3 text-sm focus:ring-2 focus:ring-blue-600 focus:border-transparent outline-none transition ${errors.experience ? 'border-red-500 bg-red-50' : 'border-gray-300'}`} 
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

import { useState, useEffect, useRef } from "react";
import { User, Mail, Phone, Award, Brain, Info, Camera, Save, X, Activity, DollarSign, Globe } from "lucide-react";
import { useAuth } from "../../context/AuthContext";
import { useCounsellorContext } from "../../context/CounsellorContext";
import { useToast } from "../../context/ToastContext";

const API_URL = "";

const Profile = () => {
  const { user, updateUser } = useAuth();
  const { getMyProfile, updateMyProfile, uploadProfileImage } = useCounsellorContext();
  const { addToast } = useToast();
  const fileInputRef = useRef(null);

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [imageTimestamp, setImageTimestamp] = useState(Date.now());
  const [profileData, setProfileData] = useState({
    name: "",
    displayName: "",
    email: "",
    phoneNumber: "",
    specialization: "",
    experience: "",
    bio: "",
    status: "online",
    counsellingType: "both",
    price: 40,
    profileImage: ""
  });

  useEffect(() => {
    if (user?.email) {
      fetchProfile();
    }
  }, [user]);

  const fetchProfile = async () => {
    setLoading(true);
    try {
      const data = await getMyProfile(user.email);
      if (data) {
        setProfileData({
          name: data.name || "",
          displayName: data.displayName || "",
          email: data.email || "",
          phoneNumber: data.phoneNumber || "",
          specialization: data.specialization || "",
          experience: data.experience || "",
          bio: data.bio || "",
          status: data.status || "online",
          counsellingType: data.counsellingType || "both",
          price: data.price || 40,
          profileImage: data.profileImage || data.image || ""
        });
      }
    } catch (err) {
      addToast("Failed to load profile details", "error");
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setProfileData(prev => ({ ...prev, [name]: value }));
  };

  const handleImageClick = () => {
    fileInputRef.current?.click();
  };

  const handleImageChange = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      const imagePath = await uploadProfileImage(user.email, file);
      setProfileData(prev => ({ ...prev, profileImage: imagePath }));
      setImageTimestamp(Date.now()); // bust browser cache
      updateUser({ profileImage: imagePath });
    } catch (err) {
      // Toast handled in context
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!profileData.name || !profileData.email) {
      return addToast("Full Name and Email are required", "error");
    }

    setSaving(true);
    try {
      const updated = await updateMyProfile(user.email, profileData);
      if (updated) {
        updateUser({
          name: updated.name,
          email: updated.email
        });
      }
    } catch (err) {
      // Toast handled in context
    } finally {
      setSaving(false);
    }
  };

  const getInitials = (name) => {
    if (!name) return "CP";
    return name.split(" ").map(n => n[0]).join("").toUpperCase().substring(0, 2);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-slate-50">
        <div className="animate-spin rounded-full h-12 w-12 border-b-4 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50/50 pb-20 animate-fade-in">

      {/* Blue Gradient Header Strip */}
      <div className="h-48 bg-gradient-to-r from-blue-700 to-indigo-600 w-full" />

      <div className="max-w-4xl mx-auto px-4 -mt-24">
        <form onSubmit={handleSubmit} className="space-y-8">

          {/* Top Profile Card */}
          <div className="bg-white rounded-3xl shadow-xl shadow-slate-200/50 p-8 flex flex-col items-center">

            {/* Avatar / Profile Picture */}
            <div className="relative group cursor-pointer h-40 w-40" onClick={handleImageClick}>
              {profileData.profileImage ? (
                <img
                  src={`${API_URL}${profileData.profileImage}?t=${imageTimestamp}`}
                  alt="Profile"
                  className="h-full w-full rounded-full object-cover border-4 border-white shadow-lg ring-1 ring-slate-100 ring-offset-2 group-hover:opacity-90 transition-all"
                  onError={(e) => { e.target.style.display = 'none'; e.target.nextSibling.style.display = 'flex'; }}
                />
              ) : null}
              <div
                className={`h-full w-full rounded-full bg-blue-100 items-center justify-center text-blue-600 text-4xl font-black border-4 border-white shadow-lg ring-1 ring-slate-100 ring-offset-2 group-hover:bg-blue-200 transition-all ${profileData.profileImage ? 'hidden' : 'flex'}`}
              >
                {getInitials(profileData.name)}
              </div>
              <div className="absolute inset-0 rounded-full bg-black/20 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                <Camera className="text-white" size={32} />
              </div>
              <input
                type="file"
                ref={fileInputRef}
                className="hidden"
                accept="image/*"
                onChange={handleImageChange}
              />
            </div>

            <h1 className="mt-6 text-2xl font-black text-slate-800 tracking-tight">
              {profileData.name || "Counsellor Profile"}
            </h1>
            <div className="mt-2 flex items-center gap-2">
              <span className={`h-2.5 w-2.5 rounded-full ${profileData.status === 'online' ? 'bg-emerald-500 animate-pulse' : 'bg-slate-300'}`} />
              <span className="text-sm font-bold text-slate-500 uppercase tracking-widest">{profileData.status}</span>
            </div>
          </div>

          {/* Main Grid */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">

            {/* LEFT: Account Info + Professional Background */}
            <div className="md:col-span-2 space-y-6">

              {/* Account Information */}
              <div className="bg-white rounded-2xl p-8 shadow-sm border border-slate-100">
                <div className="flex items-center gap-2 mb-8">
                  <User className="text-blue-600" size={20} />
                  <h2 className="text-lg font-bold text-slate-800 uppercase tracking-tight">Account Information</h2>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                  <div className="space-y-1.5">
                    <label className="text-xs font-black text-slate-400 uppercase tracking-wider ml-1">Full Name</label>
                    <input
                      type="text" name="name" value={profileData.name} onChange={handleChange} required
                      className="w-full px-4 py-3 rounded-xl bg-slate-50 border border-slate-100 text-slate-800 font-semibold focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all outline-none"
                    />
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-xs font-black text-slate-400 uppercase tracking-wider ml-1">Display Name</label>
                    <input
                      type="text" name="displayName" value={profileData.displayName} onChange={handleChange}
                      placeholder="e.g. Dr. Maduranga"
                      className="w-full px-4 py-3 rounded-xl bg-slate-50 border border-slate-100 text-slate-800 font-semibold focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all outline-none"
                    />
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-xs font-black text-slate-400 uppercase tracking-wider ml-1">Email Address</label>
                    <div className="relative">
                      <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300" size={16} />
                      <input
                        type="email" name="email" value={profileData.email} onChange={handleChange} required
                        className="w-full pl-11 pr-4 py-3 rounded-xl bg-slate-50 border border-slate-100 text-slate-800 font-semibold focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all outline-none"
                      />
                    </div>
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-xs font-black text-slate-400 uppercase tracking-wider ml-1">Phone Number</label>
                    <div className="relative">
                      <Phone className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300" size={16} />
                      <input
                        type="text" name="phoneNumber" value={profileData.phoneNumber} onChange={handleChange}
                        className="w-full pl-11 pr-4 py-3 rounded-xl bg-slate-50 border border-slate-100 text-slate-800 font-semibold focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all outline-none"
                      />
                    </div>
                  </div>
                </div>
              </div>

              {/* Professional Background */}
              <div className="bg-white rounded-2xl p-8 shadow-sm border border-slate-100">
                <div className="flex items-center gap-2 mb-8">
                  <Award className="text-blue-600" size={20} />
                  <h2 className="text-lg font-bold text-slate-800 uppercase tracking-tight">Professional Background</h2>
                </div>

                <div className="space-y-6">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                    <div className="space-y-1.5">
                      <label className="text-xs font-black text-slate-400 uppercase tracking-wider ml-1">Specialization</label>
                      <div className="relative">
                        <Brain className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300" size={16} />
                        <input
                          type="text" name="specialization" value={profileData.specialization} onChange={handleChange}
                          className="w-full pl-11 pr-4 py-3 rounded-xl bg-slate-50 border border-slate-100 text-slate-800 font-semibold focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all outline-none"
                        />
                      </div>
                    </div>
                    <div className="space-y-1.5">
                      <label className="text-xs font-black text-slate-400 uppercase tracking-wider ml-1">Years of Experience</label>
                      <input
                        type="number" name="experience" value={profileData.experience} onChange={handleChange}
                        className="w-full px-4 py-3 rounded-xl bg-slate-50 border border-slate-100 text-slate-800 font-semibold focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all outline-none"
                      />
                    </div>
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-xs font-black text-slate-400 uppercase tracking-wider ml-1">Professional Bio</label>
                    <div className="relative">
                      <Info className="absolute left-4 top-4 text-slate-300" size={16} />
                      <textarea
                        name="bio" value={profileData.bio} onChange={handleChange}
                        rows={4}
                        className="w-full pl-11 pr-4 py-3 rounded-xl bg-slate-50 border border-slate-100 text-slate-800 font-semibold focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all outline-none resize-none"
                        placeholder="Tell students about your expertise and counselling approach..."
                      />
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* RIGHT: Status, Consultation Info, Save */}
            <div className="space-y-6">

              {/* Counselling Status */}
              <div className="bg-white rounded-2xl p-8 shadow-sm border border-slate-100">
                <div className="flex items-center gap-2 mb-6">
                  <Activity className="text-blue-600" size={18} />
                  <h2 className="text-sm font-black text-slate-800 uppercase tracking-wider">Counselling Status</h2>
                </div>

                <div className="flex flex-col gap-3">
                  <button
                    type="button"
                    onClick={() => setProfileData(p => ({ ...p, status: 'online' }))}
                    className={`flex items-center gap-3 p-3 rounded-xl border transition-all font-bold text-sm ${profileData.status === 'online' ? 'bg-emerald-50 border-emerald-200 text-emerald-700 shadow-sm' : 'bg-slate-50 border-slate-100 text-slate-500 hover:bg-slate-100'}`}
                  >
                    <div className={`h-2 w-2 rounded-full ${profileData.status === 'online' ? 'bg-emerald-500 animate-pulse' : 'bg-slate-300'}`} />
                    Available / Online
                  </button>
                  <button
                    type="button"
                    onClick={() => setProfileData(p => ({ ...p, status: 'offline' }))}
                    className={`flex items-center gap-3 p-3 rounded-xl border transition-all font-bold text-sm ${profileData.status === 'offline' ? 'bg-slate-100 border-slate-200 text-slate-700 shadow-sm' : 'bg-slate-50 border-slate-100 text-slate-500 hover:bg-slate-100'}`}
                  >
                    <div className={`h-2 w-2 rounded-full ${profileData.status === 'offline' ? 'bg-slate-500' : 'bg-slate-300'}`} />
                    Offline / Break
                  </button>
                </div>
              </div>

              {/* Consultation Info */}
              <div className="bg-white rounded-2xl p-8 shadow-sm border border-slate-100">
                <div className="flex items-center gap-2 mb-6">
                  <Globe className="text-blue-600" size={18} />
                  <h2 className="text-sm font-black text-slate-800 uppercase tracking-wider">Consultation Info</h2>
                </div>

                <div className="space-y-4">
                  <div className="space-y-1.5">
                    <label className="text-xs font-black text-slate-400 uppercase tracking-wider">Preferred Type</label>
                    <select
                      name="counsellingType" value={profileData.counsellingType} onChange={handleChange}
                      className="w-full px-4 py-2.5 rounded-xl bg-slate-50 border border-slate-100 text-slate-800 font-bold focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none"
                    >
                      <option value="online">Online Sessions</option>
                      <option value="in-person">In-Person Only</option>
                      <option value="both">Flexible (Both)</option>
                    </select>
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-xs font-black text-slate-400 uppercase tracking-wider">Base Rate (per hr)</label>
                    <div className="relative">
                      <DollarSign className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-300" size={14} />
                      <input
                        type="number" name="price" value={profileData.price} onChange={handleChange}
                        className="w-full pl-8 pr-4 py-2.5 rounded-xl bg-slate-50 border border-slate-100 text-slate-800 font-bold focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none"
                      />
                    </div>
                  </div>
                </div>
              </div>

              {/* Save / Cancel */}
              <div className="bg-white rounded-2xl p-4 shadow-sm border border-slate-100">
                <button
                  type="submit" disabled={saving}
                  className="w-full flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-700 text-white font-black py-4 rounded-xl transition-all shadow-lg shadow-blue-600/20 disabled:opacity-50"
                >
                  {saving ? <div className="h-5 w-5 border-2 border-white/30 border-t-white rounded-full animate-spin" /> : <Save size={20} />}
                  {saving ? "Saving..." : "Save Profile"}
                </button>
                <button
                  type="button"
                  onClick={() => window.history.back()}
                  className="w-full mt-3 flex items-center justify-center gap-2 text-slate-400 hover:text-slate-600 font-bold py-3 transition-colors"
                >
                  <X size={18} /> Cancel
                </button>
              </div>

            </div>
          </div>
        </form>
      </div>
    </div>
  );
};

export default Profile;

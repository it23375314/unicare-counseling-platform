import { useState, useMemo } from "react";
import { useCounsellorContext } from "../../context/CounsellorContext";
import { useAuth } from "../../context/AuthContext";
import { Calendar, Clock, Trash2, Edit3, Plus, ChevronRight, AlertCircle, CalendarDays, X, CheckCircle } from "lucide-react";
import { Link } from "react-router-dom";

const SavedAvailability = () => {
  const { user } = useAuth();
  const { counsellors, updateAvailability, getCounsellorById } = useCounsellorContext();
  
  // Find current counsellor data deterministically using their ID
  const currentCounsellor = useMemo(() => {
    return getCounsellorById(user?.id) || counsellors?.find(c => c.email === user?.email) || counsellors?.[0] || null;
  }, [getCounsellorById, counsellors, user]);

  const [showEditModal, setShowEditModal] = useState(false);
  const [originalDate, setOriginalDate] = useState("");
  const [editDate, setEditDate] = useState("");
  const [editSlots, setEditSlots] = useState([]);
  const [newSlotInput, setNewSlotInput] = useState("");
  const [editError, setEditError] = useState("");

  const availability = useMemo(() => {
    if (!currentCounsellor?.availability) return [];
    
    const today = new Date().toISOString().split('T')[0];
    
    return [...currentCounsellor.availability]
      .filter(a => a.date >= today) // Only upcoming
      .sort((a, b) => new Date(a.date) - new Date(b.date)); // Nearest first
  }, [currentCounsellor]);

  const handleDeleteSlot = async (date, slotToDelete) => {
    if (!currentCounsellor) return;
    if (!window.confirm(`Are you sure you want to delete the ${slotToDelete} slot on ${date}?`)) return;
    
    const dayRecord = availability.find(a => a.date === date);
    if (!dayRecord) return;
    
    const newSlots = dayRecord.slots.filter(s => s !== slotToDelete);
    await updateAvailability(currentCounsellor.id, date, newSlots);
  };

  const handleDeleteFullDay = async (date) => {
    if (!currentCounsellor || !window.confirm(`Are you sure you want to delete all slots for ${date}?`)) return;
    await updateAvailability(currentCounsellor.id, date, []);
  };

  const handleOpenEdit = (day) => {
    setOriginalDate(day.date);
    setEditDate(day.date);
    setEditSlots([...day.slots]);
    setNewSlotInput("");
    setEditError("");
    setShowEditModal(true);
  };

  const handleAddEditSlot = () => {
    if (!newSlotInput) return setEditError("Please select a time");
    if (editSlots.includes(newSlotInput)) return setEditError("Slot already exists");
    setEditSlots(prev => [...prev, newSlotInput].sort());
    setNewSlotInput("");
    setEditError("");
  };

  const handleRemoveEditSlot = (slotToRemove) => {
    setEditSlots(prev => prev.filter(s => s !== slotToRemove));
  };

  const handleSaveEdit = async () => {
    if (!editDate) return setEditError("Please select a date");
    const today = new Date().toISOString().split('T')[0];
    if (editDate < today) return setEditError("Cannot select a past date");
    
    if (editDate !== originalDate) {
      await updateAvailability(currentCounsellor.id, originalDate, []);
    }
    await updateAvailability(currentCounsellor.id, editDate, editSlots);
    setShowEditModal(false);
  };

  return (
    <div className="min-h-screen bg-slate-50 pb-20 pt-24 relative">
      <div className="max-w-5xl mx-auto px-6">
        
        {/* Header Section */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-12">
          <div className="space-y-4">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-50 text-indigo-600 text-[10px] font-black uppercase tracking-widest border border-indigo-100">
              <CalendarDays size={12} /> Schedule Management
            </div>
            <h1 className="text-5xl font-black text-slate-900 tracking-tight italic">
              My <span className="text-indigo-600 not-italic">Availability.</span>
            </h1>
            <p className="text-slate-500 font-bold text-sm max-w-lg uppercase tracking-tight opacity-70">
              View and manage your saved time slots for upcoming counseling sessions.
            </p>
          </div>

          <Link 
            to="/counsellor/availability" 
            className="flex items-center gap-3 px-8 py-4 bg-slate-900 text-white rounded-2xl font-black text-xs uppercase tracking-widest hover:bg-indigo-600 transition-all shadow-xl shadow-slate-900/10 hover:-translate-y-1"
          >
            <Plus size={18} /> Add New Slots
          </Link>
        </div>

        {/* Availability List */}
        {availability.length === 0 ? (
          <div className="glass-card p-20 rounded-[3rem] text-center space-y-6 border border-white shadow-2xl shadow-slate-200/50 animate-fade-in">
            <div className="w-24 h-24 bg-slate-50 rounded-full flex items-center justify-center mx-auto mb-4 border border-slate-100">
              <AlertCircle size={48} className="text-slate-200" />
            </div>
            <div className="space-y-2">
                <h2 className="text-2xl font-black text-slate-900 tracking-tighter">No Active Schedule</h2>
                <p className="text-slate-400 font-bold uppercase tracking-widest text-[10px]">Your calendar is looking a bit empty for the upcoming weeks.</p>
            </div>
            <Link 
              to="/counsellor/availability" 
              className="inline-block px-10 py-5 bg-indigo-600 text-white rounded-3xl font-black text-[10px] uppercase tracking-widest hover:bg-indigo-700 transition-all shadow-xl shadow-indigo-600/20"
            >
              Set My Availability Now
            </Link>
          </div>
        ) : (
          <div className="grid gap-6">
            {availability.map((day, idx) => (
              <div 
                key={day.date} 
                className="group glass-card p-2 rounded-[2.5rem] bg-white border border-slate-100 transition-all duration-500 hover:shadow-2xl hover:shadow-indigo-900/5 flex flex-col md:flex-row animate-fade-in-up"
                style={{ animationDelay: `${idx * 100}ms` }}
              >
                {/* Date Side */}
                <div className="md:w-64 bg-slate-50 rounded-[2rem] p-8 flex flex-col justify-center items-center text-center group-hover:bg-indigo-600 group-hover:text-white transition-all duration-500">
                  <Calendar className="mb-3 opacity-40 group-hover:opacity-100" size={24} />
                  <h3 className="text-2xl font-black tracking-tighter leading-none mb-1">
                    {new Date(day.date).toLocaleDateString('en-US', { day: 'numeric', month: 'short' })}
                  </h3>
                  <p className="text-[10px] font-black uppercase tracking-widest opacity-60">
                    {new Date(day.date).toLocaleDateString('en-US', { weekday: 'long' })}
                  </p>
                </div>

                {/* Slots Area */}
                <div className="flex-1 p-8 md:p-10 flex flex-col justify-center">
                  <div className="flex flex-wrap gap-3 mb-8">
                    {day.slots.map((slot) => (
                      <div 
                        key={slot} 
                        className="group/slot flex items-center gap-2 px-5 py-3 bg-white border border-slate-100 rounded-2xl shadow-sm hover:border-indigo-200 transition-all"
                      >
                        <Clock size={12} className="text-indigo-500" />
                        <span className="font-black text-xs text-slate-700">{slot}</span>
                        <button 
                          onClick={() => handleDeleteSlot(day.date, slot)}
                          className="ml-2 w-6 h-6 rounded-lg bg-rose-50 text-rose-500 items-center justify-center flex opacity-0 group-hover/slot:opacity-100 hover:bg-rose-500 hover:text-white transition-all"
                          title="Delete slot"
                        >
                          <Plus size={14} className="rotate-45" />
                        </button>
                      </div>
                    ))}
                  </div>

                  <div className="flex items-center justify-between border-t border-slate-50 pt-6">
                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">
                      {day.slots.length} Total active slots
                    </p>
                    <div className="flex items-center gap-3">
                        <button 
                           onClick={() => handleOpenEdit(day)}
                           className="p-3 rounded-xl bg-slate-50 text-slate-400 hover:bg-slate-900 hover:text-white transition-all"
                           title="Edit Date"
                        >
                            <Edit3 size={18} />
                        </button>
                        <button 
                          onClick={() => handleDeleteFullDay(day.date)}
                          className="p-3 rounded-xl bg-slate-50 text-rose-400 hover:bg-rose-500 hover:text-white transition-all"
                          title="Delete Day"
                        >
                          <Trash2 size={18} />
                        </button>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

      </div>

      {/* Edit Modal */}
      {showEditModal && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-slate-900/40 backdrop-blur-sm p-4 animate-fade-in">
          <div className="bg-white rounded-[2rem] shadow-2xl max-w-lg w-full overflow-hidden border border-slate-100 flex flex-col scale-100 transition-transform">
            <div className="px-8 py-6 border-b border-slate-100 flex items-center justify-between bg-slate-50">
              <h2 className="text-xl font-black text-slate-900 tracking-tight flex items-center gap-2">
                <Edit3 size={20} className="text-indigo-600" /> Edit Availability
              </h2>
              <button onClick={() => setShowEditModal(false)} className="p-2 bg-white rounded-xl text-slate-400 hover:text-slate-900 shadow-sm border border-slate-100 transition-all">
                <X size={18} />
              </button>
            </div>
            
            <div className="p-8 space-y-6">
              <div className="space-y-4">
                <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Change Date (Future Only)</label>
                <div className="relative">
                  <Calendar className="absolute left-4 top-1/2 -translate-y-1/2 text-indigo-400 pointer-events-none" size={18} />
                  <input 
                    type="date" 
                    value={editDate} 
                    onChange={e => { setEditDate(e.target.value); setEditError(""); }}
                    className="w-full bg-slate-50 border border-slate-200 rounded-2xl pl-12 pr-4 py-4 text-sm font-bold text-slate-700 outline-none focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-500 transition-all"
                    min={new Date().toISOString().split('T')[0]} 
                  />
                </div>
              </div>

              <div className="space-y-4">
                <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Modify Time Slots</label>
                <div className="flex gap-3">
                  <div className="relative flex-1">
                    <Clock className="absolute left-4 top-1/2 -translate-y-1/2 text-indigo-400 pointer-events-none" size={18} />
                    <input 
                      type="time" 
                      value={newSlotInput} 
                      onChange={e => { setNewSlotInput(e.target.value); setEditError(""); }}
                      className="w-full bg-slate-50 border border-slate-200 rounded-2xl pl-12 pr-4 py-4 text-sm font-bold text-slate-700 outline-none focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-500 transition-all"
                    />
                  </div>
                  <button 
                    onClick={handleAddEditSlot}
                    className="px-6 py-4 bg-indigo-50 text-indigo-600 rounded-2xl font-black text-xs uppercase tracking-widest hover:bg-indigo-600 hover:text-white transition-all shadow-sm"
                  >
                    Add
                  </button>
                </div>
              </div>
              
              <div className="bg-slate-50/50 border border-slate-100 rounded-2xl p-4 min-h-[100px] flex flex-wrap gap-2 content-start">
                {editSlots.length > 0 ? editSlots.map((slot, i) => (
                   <button 
                     key={i}
                     onClick={() => handleRemoveEditSlot(slot)}
                     className="px-4 py-2 bg-white border border-slate-200 rounded-xl flex items-center gap-2 text-xs font-black text-slate-600 hover:bg-rose-500 hover:text-white hover:border-rose-500 hover:shadow-lg shadow-sm transition-all group"
                     title="Click to remove"
                   >
                     {slot}
                     <X size={14} className="text-slate-300 group-hover:text-white" />
                   </button>
                )) : (
                   <p className="text-xs font-bold text-slate-400 w-full text-center mt-4">No slots remaining</p>
                )}
              </div>

              {editError && <p className="text-rose-500 text-xs font-bold text-center bg-rose-50 p-3 rounded-xl">{editError}</p>}
            </div>

            <div className="px-8 py-6 border-t border-slate-100 bg-slate-50 flex justify-end gap-3">
              <button 
                onClick={() => setShowEditModal(false)}
                className="px-6 py-3 bg-white border border-slate-200 text-slate-600 rounded-xl font-black text-xs uppercase tracking-widest hover:bg-slate-100 transition-all shadow-sm"
              >
                Cancel
              </button>
              <button 
                onClick={handleSaveEdit}
                disabled={!editDate}
                className="px-8 py-3 bg-indigo-600 text-white rounded-xl font-black text-xs uppercase tracking-widest hover:bg-indigo-700 transition-all shadow-lg hover:shadow-xl shadow-indigo-600/20 flex items-center gap-2 disabled:opacity-50"
              >
                <CheckCircle size={16} /> Save Changes
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default SavedAvailability;

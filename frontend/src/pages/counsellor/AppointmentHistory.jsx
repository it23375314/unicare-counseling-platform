import { useState, useMemo, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import { useCounsellorContext } from "../../context/CounsellorContext";
import { useBooking } from "../../context/BookingContext";
import { useSessionNotes } from "../../context/SessionNoteContext";
import { Search, Calendar, FileText, Activity, Clock, Filter, AlertCircle, ArrowRight, CheckCircle, XCircle, Hash, MessageCircle } from "lucide-react";
import studentProfile from "../../assets/student_profile_john_smith.png";
import student1 from "../../assets/student1.png";
import student2 from "../../assets/student2.png";
import student3 from "../../assets/student3.png";

// Profile mocking utility
const guestProfiles = [
  { name: "Sithumini Fonseka", photo: student1 },
  { name: "Kavindu Perera", photo: student2 },
  { name: "Nadeesha Perera", photo: student3 },
  { name: "Dilshan Wijesinghe", photo: studentProfile },
];
const getDeterministicIndex = (idString, arrayLength) => {
  let hash = 0;
  for (let i = 0; i < idString.length; i++) {
    hash = idString.charCodeAt(i) + ((hash << 5) - hash);
  }
  return Math.abs(hash) % arrayLength;
};
const getGuestProfile = (idString) => guestProfiles[getDeterministicIndex(idString || "", guestProfiles.length)];
const getGuestPhoto = (idString) => getGuestProfile(idString).photo;

const getAvatarColor = (name) => {
  if (!name) return 'bg-slate-600';
  const colors = [
    'bg-slate-500', 'bg-neutral-500', 'bg-stone-500', 'bg-gray-500'
  ];
  let hash = 0;
  for (let i = 0; i < name.length; i++) {
    hash = name.charCodeAt(i) + ((hash << 5) - hash);
  }
  return colors[Math.abs(hash) % colors.length];
};

// Format date string to readable format
const formatDateHeader = (dateStr) => {
  if (!dateStr) return "Unknown Date";
  try {
    const date = new Date(dateStr);
    if (isNaN(date.getTime())) return dateStr;
    return date.toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' });
  } catch {
    return dateStr;
  }
};

export default function AppointmentHistory() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { counsellors, getCounsellorById } = useCounsellorContext();
  const { bookings, fetchBookings } = useBooking();
  const { getNoteByBookingId } = useSessionNotes();

  const counsellor = getCounsellorById(user?.id) || counsellors?.find(c => c.email === user?.email) || counsellors?.[0] || null;

  const [searchHistory, setSearchHistory] = useState("");
  const [filterDateHistory, setFilterDateHistory] = useState("");
  const [filterStatus, setFilterStatus] = useState("All");

  useEffect(() => {
    if (typeof fetchBookings === "function") {
      fetchBookings();
    }
  }, [fetchBookings]);

  const historyBookings = useMemo(() => {
    const safeBookings = Array.isArray(bookings) ? bookings : [];
    const myBookings = safeBookings.filter(b => 
      b?.counsellorId === counsellor?.id || 
      b?.counsellorName === counsellor?.name || 
      b?.counsellor === counsellor?.name
    );

    return myBookings
      .filter(b => b.status === "Completed" || b.status === "Cancelled" || b.status === "Rejected") // Rejected is structurally cancelled
      .filter(b => {
         const matchesStudent = !searchHistory || (b.studentName || b.name || "").toLowerCase().includes(searchHistory.toLowerCase());
         const matchesDate = !filterDateHistory || b.date === filterDateHistory;
         const matchesStatus = filterStatus === "All" || b.status === filterStatus || (filterStatus === "Cancelled" && b.status === "Rejected");
         return matchesStudent && matchesDate && matchesStatus;
      })
      .sort((a, b) => new Date(b.date || 0) - new Date(a.date || 0));
  }, [bookings, counsellor, searchHistory, filterDateHistory, filterStatus]);

  // Group bookings by date
  const groupedByDate = useMemo(() => {
    const groups = {};
    historyBookings.forEach(b => {
      const dateKey = b.date || "Unknown";
      if (!groups[dateKey]) groups[dateKey] = [];
      groups[dateKey].push(b);
    });
    return Object.entries(groups);
  }, [historyBookings]);

  // Stats
  const completedCount = historyBookings.filter(b => b.status === "Completed").length;
  const cancelledCount = historyBookings.filter(b => b.status === "Cancelled" || b.status === "Rejected").length;

  return (
    <div className="history-layout-bg pb-20 pt-24">
      <div className="max-w-6xl mx-auto px-6">
        
        {/* Header Block */}
        <div className="mb-10">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-slate-200 text-slate-700 text-[10px] font-black uppercase tracking-widest border border-slate-300 mb-4">
            <Filter size={12} /> Session Timeline
          </div>
          <h1 className="text-4xl md:text-5xl font-black text-white tracking-tight leading-none mb-4">
            History <span className="text-blue-300">Timeline</span>
          </h1>
          <p className="text-blue-100 font-medium max-w-2xl text-sm leading-relaxed opacity-80">
            A structured timeline of your past sessions. Review completed consultations, cancelled appointments, and session notes in chronological order.
          </p>
        </div>

        {/* Summary Stats */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-10">
          <div className="relative overflow-hidden rounded-2xl border border-white/20 p-6" style={{ background: 'rgba(255,255,255,0.08)', backdropFilter: 'blur(20px)' }}>
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-2xl bg-white/10 flex items-center justify-center border border-white/10">
                <Calendar size={22} className="text-blue-200" />
              </div>
              <div>
                <p className="text-3xl font-black text-white">{historyBookings.length}</p>
                <p className="text-[10px] font-bold text-blue-200/70 uppercase tracking-widest">Total Records</p>
              </div>
            </div>
          </div>
          <div className="relative overflow-hidden rounded-2xl border border-emerald-400/20 p-6" style={{ background: 'rgba(16,185,129,0.08)', backdropFilter: 'blur(20px)' }}>
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-2xl bg-emerald-500/15 flex items-center justify-center border border-emerald-400/20">
                <CheckCircle size={22} className="text-emerald-300" />
              </div>
              <div>
                <p className="text-3xl font-black text-white">{completedCount}</p>
                <p className="text-[10px] font-bold text-emerald-200/70 uppercase tracking-widest">Completed</p>
              </div>
            </div>
          </div>
          <div className="relative overflow-hidden rounded-2xl border border-rose-400/20 p-6" style={{ background: 'rgba(244,63,94,0.08)', backdropFilter: 'blur(20px)' }}>
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-2xl bg-rose-500/15 flex items-center justify-center border border-rose-400/20">
                <XCircle size={22} className="text-rose-300" />
              </div>
              <div>
                <p className="text-3xl font-black text-white">{cancelledCount}</p>
                <p className="text-[10px] font-bold text-rose-200/70 uppercase tracking-widest">Cancelled</p>
              </div>
            </div>
          </div>
        </div>

        {/* Filters */}
        <div className="relative overflow-hidden rounded-3xl border border-white/15 p-8 mb-10" style={{ background: 'rgba(255,255,255,0.06)', backdropFilter: 'blur(24px)' }}>
          <div className="flex flex-col md:flex-row gap-6 items-end">
            <div className="flex-1 w-full space-y-2">
              <label className="text-[10px] font-black text-blue-200/60 uppercase tracking-widest ml-1">Search Past Student</label>
              <div className="relative">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                <input 
                  type="text" 
                  placeholder="Search history..." 
                  value={searchHistory}
                  onChange={(e) => setSearchHistory(e.target.value)}
                  className="w-full pl-12 pr-4 h-12 border border-white/10 rounded-2xl focus:ring-4 focus:ring-blue-500/20 focus:border-blue-400/50 outline-none bg-white/5 text-white placeholder-white/30 transition-all font-medium"
                />
              </div>
            </div>
            <div className="w-full md:w-64 space-y-2">
              <label className="text-[10px] font-black text-blue-200/60 uppercase tracking-widest ml-1">Filter by Date</label>
              <div className="relative">
                <Calendar className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" size={16} />
                <input 
                  type="date" 
                  value={filterDateHistory}
                  onChange={(e) => setFilterDateHistory(e.target.value)}
                  className="w-full pl-10 pr-4 h-12 border border-white/10 rounded-2xl focus:ring-4 focus:ring-blue-500/20 focus:border-blue-400/50 outline-none bg-white/5 text-white transition-all font-medium text-xs"
                />
              </div>
            </div>
            <div className="w-full md:w-48 space-y-2">
              <label className="text-[10px] font-black text-blue-200/60 uppercase tracking-widest ml-1">Record Status</label>
              <div className="relative">
                <Filter className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" size={16} />
                <select 
                  value={filterStatus}
                  onChange={(e) => setFilterStatus(e.target.value)}
                  className="w-full pl-10 pr-8 h-12 border border-white/10 rounded-2xl focus:ring-4 focus:ring-blue-500/20 focus:border-blue-400/50 outline-none bg-white/5 text-white transition-all font-black text-[10px] uppercase tracking-wider appearance-none"
                >
                  <option value="All" className="bg-slate-800">All Types</option>
                  <option value="Completed" className="bg-slate-800">Completed</option>
                  <option value="Cancelled" className="bg-slate-800">Cancelled</option>
                </select>
              </div>
            </div>
          </div>
        </div>

        {/* Timeline View */}
        {groupedByDate.length > 0 ? (
          <div className="relative">
            {/* Timeline Vertical Line */}
            <div className="absolute left-[23px] top-0 bottom-0 w-[3px] rounded-full" style={{ background: 'linear-gradient(to bottom, rgba(59,130,246,0.5), rgba(59,130,246,0.1), transparent)' }}></div>

            {groupedByDate.map(([dateKey, items], groupIdx) => (
              <div key={dateKey} className="relative mb-12 last:mb-0">
                
                {/* Date Header with Timeline Dot */}
                <div className="flex items-center gap-5 mb-6">
                  <div className="relative z-10 w-[47px] h-[47px] rounded-2xl bg-blue-600 flex items-center justify-center shadow-lg shadow-blue-600/30 border-4 border-slate-900/80 shrink-0">
                    <Calendar size={20} className="text-white" />
                  </div>
                  <div className="flex items-center gap-4 flex-1">
                    <h2 className="text-lg font-black text-white tracking-tight">{formatDateHeader(dateKey)}</h2>
                    <div className="h-[1px] flex-1 bg-gradient-to-r from-blue-400/30 to-transparent rounded-full"></div>
                    <span className="text-[10px] font-black text-blue-300/50 uppercase tracking-widest">{items.length} session{items.length !== 1 ? 's' : ''}</span>
                  </div>
                </div>

                {/* Session Cards for this Date */}
                <div className="ml-[23px] pl-10 border-l-0 space-y-4">
                  {items.map((b, idx) => {
                    if (!b) return null;
                    const note = getNoteByBookingId(b.id || b._id);
                    const safeID = (b.id || "").toString();
                    const studentDispName = b.studentName || b.name || "N/A Student";
                    const initials = studentDispName.split(' ').map(nm => nm[0] || '').join('').substring(0, 2).toUpperCase() || '??';
                    const profileSrc = b.studentProfile || b.profileImage || getGuestPhoto(safeID || 'default');
                    const isCancelled = b.status === "Cancelled" || b.status === "Rejected";
                    
                    return (
                      <div key={b.id || safeID} className="relative group">
                        {/* Timeline connector dot */}
                        <div className={`absolute -left-[43px] top-8 w-3 h-3 rounded-full border-[3px] transition-all duration-300 ${
                          isCancelled 
                            ? 'bg-rose-400 border-rose-900/40 group-hover:shadow-[0_0_12px_rgba(244,63,94,0.5)]' 
                            : 'bg-emerald-400 border-emerald-900/40 group-hover:shadow-[0_0_12px_rgba(16,185,129,0.5)]'
                        }`}></div>
                        
                        {/* Card */}
                        <div className={`relative overflow-hidden rounded-2xl border transition-all duration-500 hover:shadow-2xl hover:-translate-y-1 ${
                          isCancelled 
                            ? 'border-rose-300/20 hover:border-rose-400/30' 
                            : 'border-emerald-300/20 hover:border-emerald-400/30'
                        }`} style={{ 
                          background: isCancelled 
                            ? 'linear-gradient(135deg, rgba(255,255,255,0.92), rgba(255,241,242,0.95))' 
                            : 'linear-gradient(135deg, rgba(255,255,255,0.95), rgba(240,253,244,0.95))',
                          backdropFilter: 'blur(20px)'
                        }}>
                          {/* Status Accent Bar */}
                          <div className={`absolute left-0 top-0 bottom-0 w-1.5 ${isCancelled ? 'bg-rose-400' : 'bg-emerald-400'}`}></div>
                          
                          {/* Status Label Banner */}
                          <div className={`flex items-center gap-2 px-8 py-2.5 border-b ${
                            isCancelled 
                              ? 'bg-rose-50/80 border-rose-100/50' 
                              : 'bg-emerald-50/80 border-emerald-100/50'
                          }`}>
                            {isCancelled ? (
                              <XCircle size={14} className="text-rose-400" />
                            ) : (
                              <CheckCircle size={14} className="text-emerald-500" />
                            )}
                            <span className={`text-[10px] font-black uppercase tracking-[0.2em] ${
                              isCancelled ? 'text-rose-500' : 'text-emerald-600'
                            }`}>
                              {isCancelled ? 'Session Cancelled' : 'Session Completed'}
                            </span>
                            <div className="ml-auto flex items-center gap-2">
                              {note ? (
                                <span className="text-[9px] font-bold text-sky-600 bg-sky-50 px-2.5 py-0.5 rounded-full border border-sky-100">
                                  Note Attached
                                </span>
                              ) : (
                                <span className="text-[9px] font-bold text-gray-400 bg-gray-50 px-2.5 py-0.5 rounded-full border border-gray-100">
                                  No Notes Added
                                </span>
                              )}
                            </div>
                          </div>

                          {/* Card Body */}
                          <div className="flex flex-col lg:flex-row items-stretch">
                            {/* Student Info */}
                            <div className="flex items-center gap-5 p-7 pl-8 flex-1">
                              <div className="relative group/avatar shrink-0">
                                <div className={`w-16 h-16 rounded-2xl ${getAvatarColor(studentDispName)} flex items-center justify-center border-[3px] border-white shadow-lg overflow-hidden transition-all duration-500 group-hover/avatar:rotate-3 group-hover/avatar:scale-110 ${
                                  isCancelled ? 'opacity-70 grayscale-[30%]' : ''
                                }`}>
                                  {profileSrc ? (
                                    <img src={profileSrc} alt={studentDispName} className="w-full h-full object-cover" />
                                  ) : (
                                    <span className="text-white font-black text-xl">{initials}</span>
                                  )}
                                </div>
                                <div className={`absolute -bottom-1.5 -right-1.5 w-5 h-5 rounded-full border-[3px] border-white shadow-sm ${
                                  isCancelled ? 'bg-rose-400' : 'bg-emerald-400'
                                }`}></div>
                              </div>
                              <div className="min-w-0">
                                <h3 className={`font-black text-lg leading-tight tracking-tight mb-1.5 transition-colors ${
                                  isCancelled ? 'text-gray-500' : 'text-gray-900 group-hover:text-blue-600'
                                }`}>{studentDispName}</h3>
                                <span className="text-[10px] font-black text-blue-600/50 uppercase tracking-widest bg-blue-50 px-2.5 py-0.5 rounded-full border border-blue-100/50">
                                  {b.studentId || (safeID ? "STU-" + safeID.substring(0,5) : "N/A ID")}
                                </span>
                              </div>
                            </div>

                            {/* Session Details Grid */}
                            <div className={`grid grid-cols-2 lg:grid-cols-4 gap-1 px-7 py-5 lg:px-4 border-t lg:border-t-0 lg:border-l ${
                              isCancelled ? 'border-rose-100/50' : 'border-emerald-100/50'
                            }`}>
                              <div className="flex items-center gap-3 px-3 py-2">
                                <div className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 ${
                                  isCancelled ? 'bg-rose-50 text-rose-400' : 'bg-violet-50 text-violet-500'
                                }`}><Activity size={16}/></div>
                                <div className="flex flex-col min-w-0">
                                  <span className="text-[9px] font-bold text-gray-400 uppercase tracking-widest">Type</span>
                                  <span className="text-xs font-black text-gray-700 capitalize leading-none mt-0.5 truncate">{b.sessionType || "1-on-1"}</span>
                                </div>
                              </div>
                              <div className="flex items-center gap-3 px-3 py-2">
                                <div className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 ${
                                  isCancelled ? 'bg-rose-50 text-rose-400' : 'bg-blue-50 text-blue-500'
                                }`}><Clock size={16}/></div>
                                <div className="flex flex-col min-w-0">
                                  <span className="text-[9px] font-bold text-gray-400 uppercase tracking-widest">Time</span>
                                  <span className="text-xs font-black text-gray-700 leading-none mt-0.5 truncate">{b.time || "N/A"}</span>
                                </div>
                              </div>
                              <div className="flex items-center gap-3 px-3 py-2">
                                <div className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 ${
                                  isCancelled ? 'bg-rose-50 text-rose-400' : 'bg-indigo-50 text-indigo-500'
                                }`}><Hash size={16}/></div>
                                <div className="flex flex-col min-w-0">
                                  <span className="text-[9px] font-bold text-gray-400 uppercase tracking-widest">ID</span>
                                  <span className="text-xs font-black text-gray-700 uppercase leading-none mt-0.5 truncate">{safeID ? safeID.substring(0,8) : "N/A"}</span>
                                </div>
                              </div>
                              <div className="flex items-center gap-3 px-3 py-2">
                                <div className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 ${
                                  isCancelled ? 'bg-rose-50 text-rose-400' : 'bg-emerald-50 text-emerald-500'
                                }`}>{isCancelled ? <XCircle size={16}/> : <CheckCircle size={16}/>}</div>
                                <div className="flex flex-col min-w-0">
                                  <span className="text-[9px] font-bold text-gray-400 uppercase tracking-widest">Result</span>
                                  <span className={`text-xs font-black leading-none mt-0.5 ${isCancelled ? 'text-rose-500' : 'text-emerald-600'}`}>
                                    {isCancelled ? 'Cancelled' : 'Success'}
                                  </span>
                                </div>
                              </div>
                            </div>

                            {/* Action Buttons */}
                            <div className={`flex lg:flex-col items-center justify-center gap-3 p-5 lg:px-6 border-t lg:border-t-0 lg:border-l ${
                              isCancelled ? 'border-rose-100/50' : 'border-emerald-100/50'
                            }`}>
                              <button 
                                onClick={() => navigate(`/counsellor/appointment/${b.id || b._id}`)} 
                                className="h-10 px-6 rounded-xl font-bold text-[10px] uppercase tracking-widest transition-all border-2 border-gray-100 bg-white text-gray-500 hover:border-blue-400 hover:text-blue-600 hover:bg-blue-50 active:scale-95 flex items-center justify-center gap-2 w-full lg:w-auto"
                              >
                                <ArrowRight size={14} /> Details
                              </button>
                              {!isCancelled && (
                                <button 
                                  onClick={() => navigate(`/counsellor/notes`)} 
                                  className={`h-10 px-6 rounded-xl font-bold text-[10px] uppercase tracking-widest transition-all flex items-center justify-center gap-2 border-2 active:scale-95 w-full lg:w-auto ${
                                    note 
                                      ? 'bg-sky-50 text-sky-700 border-sky-100 hover:bg-sky-100' 
                                      : 'bg-gray-50 text-gray-400 border-gray-100 hover:bg-gray-100'
                                  }`}
                                >
                                  <FileText size={14} /> {note ? "View Note" : "No Note"}
                                </button>
                              )}
                            </div>
                          </div>

                          {/* Rejection Reason */}
                          {b.rejectReason && (
                            <div className="mx-7 mb-5 p-4 rounded-xl bg-rose-50/80 border border-rose-100 flex items-start gap-3">
                              <AlertCircle size={16} className="text-rose-400 mt-0.5 shrink-0" />
                              <p className="text-xs text-rose-600 font-bold leading-relaxed">
                                <span className="uppercase text-[9px] tracking-widest opacity-50 mr-2">Reason:</span>
                                {b.rejectReason}
                              </p>
                            </div>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            ))}

            {/* Timeline End Marker */}
            <div className="flex items-center gap-5 mt-4">
              <div className="relative z-10 w-[47px] h-[47px] rounded-2xl bg-slate-700/50 flex items-center justify-center border-4 border-slate-900/80 shrink-0" style={{ backdropFilter: 'blur(10px)' }}>
                <div className="w-3 h-3 rounded-full bg-slate-500"></div>
              </div>
              <p className="text-sm font-bold text-slate-500/50 italic">End of timeline</p>
            </div>
          </div>
        ) : (
          <div className="text-center py-20 rounded-3xl border border-dashed border-white/15" style={{ background: 'rgba(255,255,255,0.04)', backdropFilter: 'blur(20px)' }}>
            <AlertCircle className="mx-auto h-14 w-14 text-white/15 mb-5" />
            <h3 className="text-xl font-black text-white/70 tracking-tight">No history records found</h3>
            <p className="text-white/40 text-sm font-medium mt-2">No completed or cancelled appointments match your criteria.</p>
          </div>
        )}

      </div>
    </div>
  );
}

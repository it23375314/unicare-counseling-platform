import { useState, useMemo, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import { useCounsellorContext } from "../../context/CounsellorContext";
import { useBooking } from "../../context/BookingContext";
import { useSessionNotes } from "../../context/SessionNoteContext";
import { Search, Calendar, FileText, Activity, Clock, Filter, AlertCircle, ArrowRight } from "lucide-react";
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

  return (
    <div className="history-layout-bg pb-20 pt-24">
      <div className="max-w-6xl mx-auto px-6">
        
        {/* Header Block */}
        <div className="mb-10">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-slate-200 text-slate-700 text-[10px] font-black uppercase tracking-widest border border-slate-300 mb-4">
            <Filter size={12} /> Appointment Archive
          </div>
          <h1 className="text-4xl md:text-5xl font-black text-white tracking-tight leading-none mb-4">
            History <span className="text-blue-300">Records</span>
          </h1>
          <p className="text-blue-100 font-medium max-w-2xl text-sm leading-relaxed opacity-80">
            Review your past completed sessions or cancelled appointments. Historical data is preserved for auditing and session note tracking purposes.
          </p>
        </div>

        {/* Filters */}
        <div className="glass-neutral p-8 flex flex-col md:flex-row gap-6 items-end mb-10">
          <div className="flex-1 w-full space-y-2">
            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Search Past Student Name</label>
            <div className="relative">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
              <input 
                type="text" 
                placeholder="Search history..." 
                value={searchHistory}
                onChange={(e) => setSearchHistory(e.target.value)}
                className="w-full pl-12 pr-4 h-12 border border-slate-200 rounded-2xl focus:ring-4 focus:ring-slate-500/10 focus:border-slate-500 outline-none bg-slate-50 transition-all font-medium"
              />
            </div>
          </div>
          <div className="w-full md:w-64 space-y-2">
            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Filter by Date</label>
            <div className="relative">
              <Calendar className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" size={16} />
              <input 
                type="date" 
                value={filterDateHistory}
                onChange={(e) => setFilterDateHistory(e.target.value)}
                className="w-full pl-10 pr-4 h-12 border border-slate-200 rounded-2xl focus:ring-4 focus:ring-slate-500/10 focus:border-slate-500 outline-none bg-slate-50 transition-all font-medium text-xs"
              />
            </div>
          </div>
          <div className="w-full md:w-48 space-y-2">
            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Record Status</label>
            <div className="relative">
              <Filter className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" size={16} />
              <select 
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value)}
                className="w-full pl-10 pr-8 h-12 border border-slate-200 rounded-2xl focus:ring-4 focus:ring-slate-500/10 focus:border-slate-500 outline-none bg-slate-50 transition-all font-black text-[10px] uppercase tracking-wider appearance-none"
              >
                <option value="All">All Types</option>
                <option value="Completed">Completed</option>
                <option value="Cancelled">Cancelled</option>
              </select>
            </div>
          </div>
        </div>

        {/* History List */}
        <div className="space-y-4">
          {historyBookings.length > 0 ? (
            historyBookings.map(b => {
              if (!b) return null;
              const note = getNoteByBookingId(b.id || b._id);
              const safeID = (b.id || "").toString();
              const studentDispName = b.studentName || b.name || "N/A Student";
              const initials = studentDispName.split(' ').map(nm => nm[0] || '').join('').substring(0, 2).toUpperCase() || '??';
              const profileSrc = b.studentProfile || b.profileImage || getGuestPhoto(safeID || 'default');
              const isCancelled = b.status === "Cancelled" || b.status === "Rejected";
              
              return (
                <div key={b.id || safeID} className={`relative flex flex-col lg:flex-row glass-blue overflow-hidden transition-all duration-500 hover:shadow-2xl hover:-translate-y-1.5 group border ${
                    isCancelled ? 'border-rose-200' : 'border-emerald-200'
                }`}>
                  <div className={`absolute left-0 top-0 bottom-0 w-2.5 transition-all duration-300 group-hover:w-3.5 ${
                    isCancelled ? 'bg-rose-500' : 'bg-emerald-500'
                  }`}></div>
                  
                  <div className="flex-1 p-10 pl-12">
                    <div className="flex flex-col sm:flex-row sm:items-center gap-8">
                      <div className="relative group/avatar shrink-0">
                        <div className={`w-14 h-14 rounded-2xl ${getAvatarColor(studentDispName)} flex items-center justify-center border-2 border-white shadow-md overflow-hidden transition-all duration-500 group-hover/avatar:rotate-3 group-hover/avatar:scale-110`}>
                          {profileSrc ? (
                            <img src={profileSrc} alt={studentDispName} className="w-full h-full object-cover" />
                          ) : (
                            <span className="text-white font-black text-lg">{initials}</span>
                          )}
                        </div>
                        <div className={`absolute -bottom-1 -right-1 w-4 h-4 ${isCancelled ? 'bg-rose-500' : 'bg-emerald-500'} border-2 border-white rounded-full shadow-sm`}></div>
                      </div>
                      <div>
                        <h3 className="font-black text-gray-900 text-2xl leading-tight group-hover:text-blue-600 transition-colors tracking-tight">{studentDispName}</h3>
                        <div className="flex items-center gap-2 mt-1.5">
                          <span className="text-[10px] font-black text-blue-600/60 uppercase tracking-widest bg-blue-50 px-2 py-0.5 rounded-md border border-blue-100/50">
                            {b.studentId || (safeID ? "STU-" + safeID.substring(0,5) : "N/A ID")}
                          </span>
                        </div>
                      </div>
                      
                      <div className={`sm:ml-auto flex items-center gap-2.5 px-5 py-2 rounded-2xl font-black text-[11px] uppercase tracking-[0.2em] border-2 shadow-sm transition-all duration-300 ${
                        isCancelled ? 'bg-rose-100 text-rose-800 border-rose-200' : 'bg-emerald-100 text-emerald-800 border-emerald-200'
                      }`}>
                        <span className={`w-2.5 h-2.5 rounded-full animate-pulse ${
                          isCancelled ? 'bg-rose-600' : 'bg-emerald-600'
                        }`}></span>
                        {isCancelled ? 'Cancelled' : 'Completed'}
                      </div>
                    </div>
                    
                    <div className="grid grid-cols-2 xl:grid-cols-4 gap-6 mt-10">
                      <div className="group/item flex items-center gap-3.5 bg-white/50 p-2 pr-4 rounded-2xl border border-transparent hover:border-violet-100 hover:bg-violet-50/30 transition-all">
                        <div className="w-10 h-10 rounded-xl bg-violet-100/50 flex items-center justify-center text-violet-600 shadow-sm group-hover/item:scale-110 transition-transform"><Activity size={18}/></div>
                        <div className="flex flex-col">
                          <span className="text-[9px] font-black text-gray-400 uppercase tracking-widest">Type</span>
                          <span className="text-xs font-bold text-gray-800 capitalize leading-none mt-0.5">{b.sessionType || "1-on-1"}</span>
                        </div>
                      </div>
                      <div className="group/item flex items-center gap-3.5 bg-white/50 p-2 pr-4 rounded-2xl border border-transparent hover:border-blue-100 hover:bg-blue-50/30 transition-all">
                        <div className="w-10 h-10 rounded-xl bg-blue-100/50 flex items-center justify-center text-blue-600 shadow-sm group-hover/item:scale-110 transition-transform"><Calendar size={18}/></div>
                        <div className="flex flex-col">
                          <span className="text-[9px] font-black text-gray-400 uppercase tracking-widest">Date</span>
                          <span className="text-xs font-bold text-gray-800 leading-none mt-0.5">{b.date || "N/A"}</span>
                        </div>
                      </div>
                      <div className="group/item flex items-center gap-3.5 bg-white/50 p-2 pr-4 rounded-2xl border border-transparent hover:border-indigo-100 hover:bg-indigo-50/30 transition-all">
                        <div className="w-10 h-10 rounded-xl bg-indigo-100/50 flex items-center justify-center text-indigo-600 shadow-sm group-hover/item:scale-110 transition-transform"><Clock size={18}/></div>
                        <div className="flex flex-col">
                          <span className="text-[9px] font-black text-gray-400 uppercase tracking-widest">Time</span>
                          <span className="text-xs font-bold text-gray-800 leading-none mt-0.5">{b.time || "N/A"}</span>
                        </div>
                      </div>
                      <div className="group/item flex items-center gap-3.5 bg-white/50 p-2 pr-4 rounded-2xl border border-transparent hover:border-slate-100 hover:bg-slate-50/30 transition-all">
                        <div className="w-10 h-10 rounded-xl bg-slate-100/50 flex items-center justify-center text-slate-600 shadow-sm group-hover/item:scale-110 transition-transform"><FileText size={18}/></div>
                        <div className="flex flex-col">
                          <span className="text-[9px] font-black text-gray-400 uppercase tracking-widest">ID</span>
                          <span className="text-xs font-bold text-gray-800 uppercase leading-none mt-0.5">{safeID ? safeID.substring(0,8) : "N/A"}</span>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="flex flex-wrap items-center gap-4 w-full lg:w-auto p-10 lg:pl-0 lg:pr-12 lg:ml-auto">
                    <button 
                      onClick={() => navigate(`/counsellor/appointment/${b.id || b._id}`)} 
                      className="flex-1 lg:flex-none h-14 px-10 rounded-3xl font-black text-sm transition-all shadow-md flex items-center justify-center gap-3 border-[3px] border-gray-100 bg-white text-gray-700 hover:bg-gray-50 hover:border-blue-400 hover:text-blue-700 hover:shadow-xl active:scale-95"
                    >
                      <ArrowRight size={18} /> Details
                    </button>
                    {!isCancelled && (
                       <button 
                         onClick={() => navigate(`/counsellor/notes`)} 
                         className={`flex-1 lg:flex-none h-14 px-10 rounded-3xl font-black text-sm transition-all shadow-md flex items-center justify-center gap-3 border-[3px] shadow-sm transition-all duration-300 active:scale-95 ${
                            note 
                            ? 'bg-blue-600 text-white border-blue-600 hover:bg-blue-700 hover:shadow-xl' 
                            : 'bg-white text-gray-400 border-gray-100 hover:bg-gray-50'
                         }`}
                       >
                         <FileText size={18} /> {note ? "View Note" : "No Note"}
                       </button>
                    )}
                  </div>
                </div>
              );
            })
          ) : (
            <div className="text-center py-20 bg-white rounded-3xl border border-dashed border-slate-300">
              <AlertCircle className="mx-auto h-12 w-12 text-slate-300 mb-4" />
              <h3 className="text-lg font-black text-slate-800 tracking-tight">No history records found</h3>
              <p className="text-slate-500 text-sm font-medium mt-1">No completed or cancelled appointments match your criteria.</p>
            </div>
          )}
        </div>

      </div>
    </div>
  );
}

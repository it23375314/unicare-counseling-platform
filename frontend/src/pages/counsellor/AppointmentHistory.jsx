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
    <div className="min-h-screen bg-slate-50 pb-20 pt-24 relative">
      <div className="max-w-6xl mx-auto px-6">
        
        {/* Header Block */}
        <div className="mb-10">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-slate-200 text-slate-700 text-[10px] font-black uppercase tracking-widest border border-slate-300 mb-4">
            <Filter size={12} /> Appointment Archive
          </div>
          <h1 className="text-4xl md:text-5xl font-black text-slate-800 tracking-tight leading-none mb-4">
            History <span className="text-slate-400">Records</span>
          </h1>
          <p className="text-slate-500 font-medium max-w-2xl text-sm leading-relaxed">
            Review your past completed sessions or cancelled appointments. Historical data is preserved for auditing and session note tracking purposes.
          </p>
        </div>

        {/* Filters */}
        <div className="bg-white p-6 rounded-3xl shadow-sm border border-slate-200 flex flex-col md:flex-row gap-4 items-end mb-8">
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
                <div key={b.id || safeID} className={`group bg-white rounded-3xl border ${isCancelled ? 'border-rose-100' : 'border-slate-200'} flex flex-col lg:flex-row relative overflow-hidden transition-all duration-300 opacity-90 hover:opacity-100 hover:shadow-lg grayscale-[15%] hover:grayscale-0`}>
                  <div className={`absolute left-0 top-0 bottom-0 w-2.5 transition-all duration-300 ${
                    isCancelled ? 'bg-rose-400/50 group-hover:bg-rose-500' : 'bg-emerald-400/50 group-hover:bg-emerald-500'
                  }`}></div>
                  
                  <div className="flex-1 p-6 pl-10">
                    <div className="flex flex-col sm:flex-row sm:items-center gap-6">
                      <div className="relative group/avatar shrink-0">
                        <div className={`w-12 h-12 rounded-2xl ${getAvatarColor(studentDispName)} flex items-center justify-center border-2 border-white shadow-sm overflow-hidden`}>
                          {profileSrc ? (
                            <img src={profileSrc} alt={studentDispName} className="w-full h-full object-cover" />
                          ) : (
                            <span className="text-white font-black text-sm">{initials}</span>
                          )}
                        </div>
                      </div>
                      <div>
                        <h3 className="font-black text-slate-800 text-lg leading-tight group-hover:text-slate-900 transition-colors tracking-tight">{studentDispName}</h3>
                        <div className="flex items-center gap-2 mt-1">
                          <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest bg-slate-100 px-2 py-0.5 rounded-md border border-slate-200">
                            {b.studentId || (safeID ? "STU-" + safeID.substring(0,5) : "N/A ID")}
                          </span>
                        </div>
                      </div>
                      
                      <div className={`sm:ml-auto flex items-center gap-2 px-4 py-1.5 rounded-xl font-black text-[10px] uppercase tracking-[0.2em] border shadow-sm transition-all duration-300 ${
                        isCancelled ? 'bg-rose-50 text-rose-700 border-rose-200' : 'bg-emerald-50 text-emerald-700 border-emerald-200'
                      }`}>
                        {isCancelled ? 'Cancelled' : 'Completed'}
                      </div>
                    </div>
                    
                    <div className="flex flex-wrap gap-4 mt-6">
                      <div className="flex items-center gap-2 bg-slate-50 px-3 py-1.5 rounded-lg border border-slate-100">
                        <Activity size={14} className="text-slate-400"/>
                        <span className="text-[10px] font-bold text-slate-600 capitalize">{b.sessionType || "1-on-1"}</span>
                      </div>
                      <div className="flex items-center gap-2 bg-slate-50 px-3 py-1.5 rounded-lg border border-slate-100">
                        <Calendar size={14} className="text-slate-400"/>
                        <span className="text-[10px] font-bold text-slate-600 leading-none">{b.date || "N/A"}</span>
                      </div>
                      <div className="flex items-center gap-2 bg-slate-50 px-3 py-1.5 rounded-lg border border-slate-100">
                        <Clock size={14} className="text-slate-400"/>
                        <span className="text-[10px] font-bold text-slate-600 leading-none">{b.time || "N/A"}</span>
                      </div>
                      <div className="flex items-center gap-2 bg-slate-50 px-3 py-1.5 rounded-lg border border-slate-100">
                        <FileText size={14} className="text-slate-400"/>
                        <span className="text-[10px] font-bold text-slate-600 uppercase leading-none">{safeID ? safeID.substring(0,8) : "N/A"}</span>
                      </div>
                    </div>
                  </div>

                  <div className="flex border-t lg:border-t-0 lg:border-l border-slate-100 bg-slate-50/50">
                    <button 
                      onClick={() => navigate(`/counsellor/appointment/${b.id || b._id}`)} 
                      className="flex-1 lg:w-32 py-4 lg:py-0 font-black text-[10px] uppercase tracking-[0.1em] text-slate-600 hover:bg-white hover:text-blue-600 border-r lg:border-r-0 lg:border-b border-slate-100 transition-all flex flex-col items-center justify-center gap-1.5"
                    >
                      <ArrowRight size={18} /> Details
                    </button>
                    {!isCancelled && (
                       <button 
                         onClick={() => navigate(`/counsellor/notes`)} 
                         className={`flex-1 lg:w-32 py-4 lg:py-0 font-black text-[10px] uppercase tracking-[0.1em] transition-all flex flex-col items-center justify-center gap-1.5 ${
                           note ? 'text-indigo-600 hover:bg-indigo-50 hover:text-indigo-700' : 'text-slate-400 hover:bg-slate-100'
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

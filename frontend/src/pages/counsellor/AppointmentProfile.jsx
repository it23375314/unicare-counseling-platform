import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useBooking } from "../../context/BookingContext";
import { useSessionNotes } from "../../context/SessionNoteContext";
import { useAuth } from "../../context/AuthContext";
import { Calendar, Clock, User, Phone, Mail, Activity, FileText, MessageCircle, CheckCircle, XCircle, ArrowLeft, AlertTriangle, ExternalLink } from "lucide-react";
import studentProfile from "../../assets/student_profile_john_smith.png";
import student1 from "../../assets/student1.png";
import student2 from "../../assets/student2.png";
import student3 from "../../assets/student3.png";

const guestPhotos = [student1, student2, student3];
const guestNames = ["Alex Johnson", "Taylor Smith", "Jordan Lee", "Morgan Davis", "Casey Wilson", "Riley Taylor", "Quinn Brown", "Avery Miller"];

const getDeterministicIndex = (idString, arrayLength) => {
  let hash = 0;
  for (let i = 0; i < idString.length; i++) {
    hash = idString.charCodeAt(i) + ((hash << 5) - hash);
  }
  return Math.abs(hash) % arrayLength;
};

const getGuestPhoto = (idString) => {
  if (!idString) return guestPhotos[0];
  return guestPhotos[getDeterministicIndex(idString, guestPhotos.length)];
};

const getGuestName = (idString) => {
  if (!idString) return guestNames[0];
  return guestNames[getDeterministicIndex(idString, guestNames.length)];
};

const getAvatarColor = (name) => {
  if (!name) return 'bg-blue-600';
  const colors = [
    'bg-blue-500', 'bg-emerald-500', 'bg-violet-500', 'bg-rose-500', 
    'bg-amber-500', 'bg-indigo-500', 'bg-sky-500', 'bg-fuchsia-500',
    'bg-teal-500', 'bg-orange-500'
  ];
  let hash = 0;
  for (let i = 0; i < name.length; i++) {
    hash = name.charCodeAt(i) + ((hash << 5) - hash);
  }
  return colors[Math.abs(hash) % colors.length];
};

export default function AppointmentProfile() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  
  const { bookings, confirmBookingByCounsellor, cancelBookingByCounsellor, completeBooking } = useBooking();
  const { getNoteByBookingId } = useSessionNotes();

  const appointment = bookings.find(b => b.id === id);
  const note = appointment ? getNoteByBookingId(appointment.id) : null;

  // Mocking previous sessions count for demo purposes based on email/name matching
  const previousSessions = appointment 
    ? bookings.filter(b => b.studentEmail === appointment.studentEmail && b.status === "Completed" && b.id !== appointment.id).length 
    : 0;

  const hasChatHistory = (studentName) => {
    if (!studentName) return false;
    const key = `unicare_chat_${studentName.replace(/\s+/g, '_')}`;
    return localStorage.getItem(key) !== null;
  };

  if (user?.role !== "counsellor") {
    return <div className="text-center py-20">Access Denied</div>;
  }

  if (!appointment) {
    return (
      <div className="bg-gray-50 min-h-screen pt-24 pb-24 flex justify-center">
        <div className="text-center bg-white p-10 rounded-2xl shadow-sm border border-gray-100 max-w-md">
          <Activity className="mx-auto h-12 w-12 text-gray-300 mb-4" />
          <h2 className="text-xl font-bold text-gray-900 mb-2">Appointment Not Found</h2>
          <p className="text-gray-500 mb-6">The requested appointment could not be located.</p>
          <button onClick={() => navigate("/counsellor/appointments")} className="bg-blue-600 text-white px-6 py-2.5 rounded-xl font-medium hover:bg-blue-700 transition">
            Back to Appointments
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-gray-50/50 min-h-screen pt-12 pb-24">
      <div className="max-w-6xl mx-auto px-6 lg:px-8">
        
        {/* Header Section */}
        <div className="flex items-center gap-6 mb-12 border-b border-gray-100 pb-10">
          <button 
            onClick={() => navigate("/counsellor/appointments")} 
            className="group shrink-0 h-12 w-12 flex items-center justify-center bg-white rounded-2xl shadow-sm border border-gray-100 hover:border-blue-100 hover:shadow-md transition-all active:scale-95"
            title="Go Back"
          >
            <ArrowLeft size={22} className="text-gray-400 group-hover:text-blue-600 group-hover:-translate-x-0.5 transition-all" />
          </button>
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-4 flex-wrap mb-1">
              <h1 className="text-4xl font-black text-gray-900 tracking-tight leading-none">
                Appointment Details
              </h1>
              <span className={`text-[10px] px-3 py-1.5 rounded-full font-black uppercase tracking-widest border shadow-sm ${
                appointment.status === 'Confirmed' || appointment.status === 'Accepted' ? 'bg-blue-50 text-blue-700 border-blue-200' : 
                appointment.status === 'Completed' ? 'bg-emerald-50 text-emerald-700 border-emerald-200' : 
                appointment.status === 'Cancelled' || appointment.status === 'Rejected' ? 'bg-rose-50 text-rose-700 border-rose-200' : 
                'bg-amber-50 text-amber-700 border-amber-200'
              }`}>
                {appointment.status === 'Accepted' ? 'Confirmed' : appointment.status === 'Rejected' ? 'Cancelled' : appointment.status}
              </span>
            </div>
            <p className="text-gray-400 font-bold text-xs uppercase tracking-[0.15em]">
              <span className="opacity-50">Reference ID:</span> 
              <span className="text-gray-500 ml-2 font-mono">{appointment.id}</span>
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-10 items-start">
          
          {/* Left Column: Info Panels */}
          <div className="lg:col-span-2 space-y-10">
            
            {/* Student Profile Card */}
            <div className="bg-white rounded-[2rem] shadow-sm border border-gray-100 p-10 relative overflow-hidden group">
              <div className="absolute top-0 right-0 w-48 h-48 bg-blue-50/50 rounded-full -mr-24 -mt-24 blur-3xl transition-all duration-700 group-hover:bg-blue-100/50"></div>
              
              <div className="relative z-10">
                <h2 className="text-[10px] font-black text-gray-400 uppercase tracking-[0.25em] mb-10 flex items-center gap-3">
                  <div className="w-1.5 h-1.5 rounded-full bg-blue-600"></div> Student Profile
                </h2>
                
                <div className="flex flex-col md:flex-row gap-12 items-start">
                  {/* Avatar Section */}
                  <div className="shrink-0 relative">
                    <div className={`w-32 h-32 rounded-full ${getAvatarColor(appointment.studentName || appointment.name)} shadow-2xl transition-transform duration-500 group-hover:scale-105 flex items-center justify-center border-4 border-white overflow-hidden`}>
                      { (appointment.studentProfile || appointment.profileImage) ? (
                        <img 
                          src={appointment.studentProfile || appointment.profileImage} 
                          alt={appointment.studentName || "Student"} 
                          className="w-full h-full object-cover"
                        />
                      ) : (appointment.studentName || appointment.name) === "John Smith" ? (
                        <img 
                          src={studentProfile} 
                          alt={appointment.studentName || "Student"} 
                          className="w-full h-full object-cover"
                        />
                      ) : (appointment.studentName || appointment.name || getGuestName(appointment.id || appointment.studentId || 'default')) === getGuestName(appointment.id || appointment.studentId || 'default') ? (
                        <img 
                          src={getGuestPhoto(appointment.id || appointment.studentId || 'default')} 
                          alt="Student" 
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <span className="text-white font-black text-3xl">
                          {((appointment.studentName || appointment.name || "??") + " ").split(' ').map(nm => nm[0] || '').join('').substring(0, 2).toUpperCase()}
                        </span>
                      )}
                    </div>
                    <div className="absolute bottom-1 right-1 w-7 h-7 bg-emerald-500 border-4 border-white rounded-full shadow-lg" title="Active Student"></div>
                  </div>
                  
                  {/* General Info */}
                  <div className="flex-1 space-y-8">
                    <div>
                      <h3 className="text-3xl font-black text-gray-900 leading-tight mb-2">
                        {appointment.studentName || appointment.name || getGuestName(appointment.id || appointment.studentId || 'default')}
                      </h3>
                      <div className="inline-flex items-center gap-2 px-3 py-1.5 bg-gray-50 text-gray-500 rounded-xl text-[10px] font-black tracking-widest uppercase border border-gray-200/50">
                        Student ID: {appointment.studentId || "N/A ID"}
                      </div>
                    </div>
                    
                    {/* Two-Column Detail Grid */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-8 border-t border-gray-50 pt-8">
                      <div className="space-y-2">
                        <label className="text-[9px] text-gray-400 uppercase font-black tracking-widest block transition-colors group-hover:text-blue-500">Email Address</label>
                        <div className="flex items-center gap-3">
                          <div className="w-9 h-9 bg-gray-50 rounded-xl flex items-center justify-center text-gray-400 group-hover:bg-blue-50 group-hover:text-blue-600 transition-all">
                            <Mail size={16} />
                          </div>
                          <span className="font-bold text-gray-700 text-sm truncate">{appointment.studentEmail || "No email available"}</span>
                        </div>
                      </div>
                      <div className="space-y-2">
                        <label className="text-[9px] text-gray-400 uppercase font-black tracking-widest block transition-colors group-hover:text-blue-500">Contact Number</label>
                        <div className="flex items-center gap-3">
                          <div className="w-9 h-9 bg-gray-50 rounded-xl flex items-center justify-center text-gray-400 group-hover:bg-blue-50 group-hover:text-blue-600 transition-all">
                            <Phone size={16} />
                          </div>
                          <span className="font-bold text-gray-700 text-sm truncate">{appointment.studentContact || "No contact available"}</span>
                        </div>
                      </div>
                    </div>

                    {/* Aligned History Box */}
                    <div className="bg-blue-50/30 rounded-2xl p-6 flex items-center gap-5 border border-blue-100/50 transition-all hover:bg-blue-50/50">
                      <div className="w-12 h-12 rounded-xl bg-white shadow-sm flex items-center justify-center text-blue-600 border border-blue-50">
                        <Activity size={24} />
                      </div>
                      <div>
                        <p className="text-[10px] text-blue-600/60 uppercase font-black tracking-[0.2em] mb-0.5">Session History</p>
                        <p className="text-blue-900 font-bold text-base leading-none">
                          {previousSessions} previous completed session(s)
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Appointment Information Card */}
            <div className="bg-white rounded-[2rem] shadow-sm border border-gray-100 p-10 overflow-hidden relative">
              <h2 className="text-[10px] font-black text-gray-400 uppercase tracking-[0.25em] mb-10 flex items-center gap-3">
                 <div className="w-1.5 h-1.5 rounded-full bg-indigo-500"></div> Appointment Information
              </h2>
              
              {/* 3-Column Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-10">
                <div className="space-y-3">
                  <div className="text-[9px] text-gray-400 uppercase font-black tracking-widest flex items-center gap-2">
                    <Calendar size={14} className="text-blue-500" /> Date
                  </div>
                  <p className="text-xl font-black text-gray-900 leading-tight">
                    {appointment.date}
                  </p>
                </div>
                <div className="space-y-3">
                  <div className="text-[9px] text-gray-400 uppercase font-black tracking-widest flex items-center gap-2">
                    <Clock size={14} className="text-blue-500" /> Time
                  </div>
                  <p className="text-xl font-black text-gray-900 leading-tight">
                    {appointment.time}
                  </p>
                </div>
                <div className="space-y-3 min-w-0">
                  <div className="text-[9px] text-gray-400 uppercase font-black tracking-widest flex items-center gap-2">
                    <Activity size={14} className="text-indigo-500" /> Session Type
                  </div>
                  <p className="text-xl font-black text-gray-900 leading-tight truncate-none whitespace-normal break-words" title={appointment.sessionType || "In-Person Counseling"}>
                    {appointment.sessionType || "In-Person Counseling"}
                  </p>
                </div>
              </div>

              {appointment.rejectReason && (
                <div className="mt-10 bg-rose-50/50 p-6 rounded-2xl border border-rose-100/50">
                  <div className="flex items-center gap-2 mb-3 text-[10px] font-black uppercase tracking-widest text-rose-600">
                    <AlertTriangle size={16} /> Reason for Cancellation
                  </div>
                  <p className="text-sm font-medium leading-relaxed italic text-rose-900">"{appointment.rejectReason}"</p>
                </div>
              )}
            </div>

            {/* Clinical Records Card */}
            <div className="bg-white rounded-[2rem] shadow-sm border border-gray-100 p-10">
              <h2 className="text-[10px] font-black text-gray-400 uppercase tracking-[0.25em] mb-10 flex items-center gap-3">
                <div className="w-1.5 h-1.5 rounded-full bg-sky-500"></div> Clinical Records
              </h2>
              
              {note ? (
                <div className="space-y-8">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-gray-50/50 p-6 rounded-2xl border border-gray-100/50">
                    <h3 className="font-black text-gray-900 text-lg">{note.title}</h3>
                    <span className={`text-[9px] px-3 py-1.5 rounded-full font-black uppercase tracking-widest border shadow-sm ${
                        note.riskLevel === 'Severe' || note.riskLevel === 'Critical' || note.riskLevel === 'High' ? 'bg-rose-50 text-rose-700 border-rose-200' : 
                        note.riskLevel === 'Medium' ? 'bg-amber-50 text-amber-700 border-amber-200' : 
                        'bg-emerald-50 text-emerald-700 border-emerald-200'
                      }`}>
                      {note.riskLevel} Risk Assessment
                    </span>
                  </div>
                  
                  <div className="bg-white p-8 rounded-2xl text-sm text-gray-600 leading-relaxed italic border border-gray-100 shadow-inner">
                    "{note.notes}"
                  </div>
                  
                  <div className="p-6 bg-gray-50/30 rounded-2xl border border-gray-100 transition-all hover:bg-gray-50/60">
                    <label className="text-[9px] text-gray-400 uppercase font-black tracking-widest block mb-3">Follow-up Recommendation</label>
                    <p className="font-bold text-gray-900">{note.followUpRecommendation}</p>
                  </div>
                  
                  <div className="pt-2">
                    <button onClick={() => navigate("/counsellor/notes")} className="group text-blue-600 hover:text-blue-800 text-[10px] font-black uppercase tracking-widest flex items-center gap-2 transition-all">
                      Access Full Clinical File <ExternalLink size={14} className="group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" />
                    </button>
                  </div>
                </div>
              ) : (
                <div className="text-center py-16 bg-gray-50/30 rounded-3xl border border-dashed border-gray-200">
                  <div className="w-16 h-16 bg-white rounded-2xl shadow-sm border border-gray-100 flex items-center justify-center mx-auto mb-5">
                    <FileText className="h-8 w-8 text-gray-200" />
                  </div>
                  <p className="text-gray-400 font-bold mb-8 italic">No clinical records found for this session.</p>
                  {appointment.status === "Completed" && (
                    <button onClick={() => navigate("/counsellor/notes")} className="bg-white border border-gray-200 text-gray-700 hover:bg-gray-50 hover:border-blue-600 hover:text-blue-600 px-8 py-3 rounded-2xl font-black text-[10px] tracking-[0.15em] uppercase transition-all shadow-sm">
                      Initialize Note Directory
                    </button>
                  )}
                </div>
              )}
            </div>

          </div>

          {/* Right Column: Available Actions Panel */}
          <div className="lg:col-span-1 space-y-10 sticky top-24">
            <div className="bg-white rounded-[2rem] shadow-sm border border-gray-100 p-8">
              <h2 className="text-[10px] font-black text-gray-400 uppercase tracking-[0.25em] mb-10 border-b border-gray-50 pb-5">Available Actions</h2>
              
              <div className="flex flex-col gap-4">
                
                {/* Action: Chat */}
                {(appointment.status === "Confirmed" || appointment.status === "Accepted" || appointment.status === "Completed") && (
                  <button 
                    onClick={() => navigate(`/chat?student=${encodeURIComponent(appointment.studentName || appointment.name || 'Student')}`)} 
                    className="h-16 flex items-center justify-center gap-3 bg-indigo-600 text-white hover:bg-indigo-700 rounded-2xl font-black text-xs uppercase tracking-widest transition-all shadow-lg shadow-indigo-100 active:scale-95"
                  >
                    <MessageCircle size={20} /> {hasChatHistory(appointment.studentName || appointment.name) ? "Continue Chat" : "Start Chat"}
                  </button>
                )}
                
                {/* State: Pending */}
                {appointment.status === "Pending" && (
                  <>
                    <button onClick={() => confirmBookingByCounsellor(appointment.id)} className="h-16 flex items-center justify-center gap-3 bg-blue-600 text-white hover:bg-blue-700 rounded-2xl font-black text-xs uppercase tracking-widest transition-all shadow-lg shadow-blue-100 active:scale-95">
                      <CheckCircle size={20} /> Confirm Appointment
                    </button>
                    <button onClick={() => { const reason = window.prompt("Reason for cancellation:"); if(reason !== null) cancelBookingByCounsellor(appointment.id, reason); }} className="h-16 flex items-center justify-center gap-3 bg-white text-rose-600 border border-rose-100 hover:bg-rose-50 rounded-2xl font-black text-xs uppercase tracking-widest transition-all active:scale-95">
                      <XCircle size={20} /> Decline Request
                    </button>
                  </>
                )}

                {/* State: Confirmed */}
                {(appointment.status === "Confirmed" || appointment.status === "Accepted") && (
                  <>
                    <button onClick={() => completeBooking(appointment.id)} className="h-16 flex items-center justify-center gap-3 bg-emerald-600 text-white hover:bg-emerald-700 rounded-2xl font-black text-xs uppercase tracking-widest transition-all shadow-lg shadow-emerald-100 active:scale-95">
                      <CheckCircle size={20} /> Finalize Session
                    </button>
                    <button onClick={() => { const reason = window.prompt("Reason for cancellation:"); if(reason !== null) cancelBookingByCounsellor(appointment.id, reason); }} className="h-16 flex items-center justify-center gap-3 bg-white text-rose-600 border border-rose-100 hover:bg-rose-50 rounded-2xl font-black text-xs uppercase tracking-widest transition-all active:scale-95">
                      <XCircle size={20} /> Cancel Appointment
                    </button>
                  </>
                )}

                {/* State: Completed */}
                {appointment.status === "Completed" && (
                  <button onClick={() => navigate("/counsellor/notes")} className="h-16 flex items-center justify-center gap-3 bg-white text-gray-700 border border-gray-200 hover:bg-gray-50 hover:border-blue-600 hover:text-blue-600 rounded-2xl font-black text-xs uppercase tracking-widest transition-all active:scale-95">
                    <FileText size={20} /> Manage Professional Notes
                  </button>
                )}

              </div>
              
              {/* Security Notice */}
              <div className="mt-10 bg-gray-50/50 p-6 rounded-2xl border border-gray-100 flex items-start gap-4 transition-all hover:bg-gray-50">
                <div className="shrink-0 w-8 h-8 rounded-xl bg-amber-50 flex items-center justify-center border border-amber-100">
                  <AlertTriangle size={16} className="text-amber-600" />
                </div>
                <p className="text-[10px] text-gray-500 font-bold uppercase tracking-tight leading-relaxed">
                  Security Notice: All actions are encrypted and logged for university compliance and student safety.
                </p>
              </div>

            </div>
          </div>

        </div>
      </div>
    </div>
  );
}

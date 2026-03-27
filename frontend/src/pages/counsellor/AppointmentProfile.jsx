import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useBooking } from "../../context/BookingContext";
import { useSessionNotes } from "../../context/SessionNoteContext";
import { useAuth } from "../../context/AuthContext";
import { Calendar, Clock, User, Phone, Mail, Activity, FileText, MessageCircle, CheckCircle, XCircle, ArrowLeft, AlertTriangle } from "lucide-react";

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
    <div className="bg-gray-50 min-h-screen pt-12 pb-24">
      <div className="max-w-5xl mx-auto px-6 lg:px-8">
        
        {/* Header */}
        <div className="flex items-center gap-4 mb-8 border-b border-gray-200 pb-6">
          <button onClick={() => navigate("/counsellor/appointments")} className="text-gray-500 hover:text-blue-600 transition bg-white p-2 rounded-full shadow-sm border border-gray-100">
            <ArrowLeft size={20} />
          </button>
          <div>
            <h1 className="text-2xl font-extrabold text-gray-900 flex items-center gap-3">
              Appointment Details
              <span className={`text-xs px-2.5 py-1 rounded-md font-bold uppercase tracking-wide border ${
                appointment.status === 'Confirmed' || appointment.status === 'Accepted' ? 'bg-blue-50 text-blue-700 border-blue-200' : 
                appointment.status === 'Completed' ? 'bg-green-50 text-green-700 border-green-200' : 
                appointment.status === 'Cancelled' || appointment.status === 'Rejected' ? 'bg-red-50 text-red-700 border-red-200' : 
                'bg-amber-50 text-amber-700 border-amber-200'
              }`}>
                {appointment.status === 'Accepted' ? 'Confirmed' : appointment.status === 'Rejected' ? 'Cancelled' : appointment.status}
              </span>
            </h1>
            <p className="text-gray-500 text-sm mt-1">ID: {appointment.id}</p>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          
          {/* Left Column: Info Panels */}
          <div className="lg:col-span-2 space-y-6">
            
            {/* Student Info */}
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
              <h2 className="text-lg font-bold text-gray-900 mb-6 border-b border-gray-100 pb-2">Student Information</h2>
              <div className="flex flex-col sm:flex-row gap-8 items-start">
                <div className="shrink-0">
                  <div className="w-24 h-24 rounded-full bg-blue-600 border-4 border-white shadow-lg flex items-center justify-center overflow-hidden">
                    {appointment.studentProfilePhoto ? (
                      <img src={appointment.studentProfilePhoto} alt="Student" className="w-full h-full object-cover" />
                    ) : (
                      <span className="text-2xl font-bold text-white uppercase tracking-wider">
                        {(appointment.studentName || appointment.name || "John Smith")
                          .split(" ")
                          .filter(Boolean)
                          .map((n) => n[0])
                          .join("")
                          .slice(0, 2)}
                      </span>
                    )}
                  </div>
                </div>
                <div className="flex-1 w-full text-center sm:text-left">
                  <div className="mb-6">
                    <h3 className="text-2xl font-bold text-gray-900 leading-tight">
                      {appointment.studentName || appointment.name || "John Smith"}
                    </h3>
                    <p className="text-sm font-bold text-blue-600 mt-1">
                      ID: {appointment.studentId || "STD-1774"}
                    </p>
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-4">
                    <div>
                      <label className="text-[10px] text-gray-400 uppercase font-black tracking-widest block mb-1">Email Address</label>
                      <p className="font-semibold text-gray-700 flex items-center gap-2 justify-center sm:justify-start">
                        <Mail size={16} className="text-blue-500 opacity-60"/> {appointment.studentEmail || "john.smith@university.edu"}
                      </p>
                    </div>
                    <div>
                      <label className="text-[10px] text-gray-400 uppercase font-black tracking-widest block mb-1">Contact Number</label>
                      <p className="font-semibold text-gray-700 flex items-center gap-2 justify-center sm:justify-start">
                        <Phone size={16} className="text-blue-500 opacity-60"/> {appointment.studentContact || "+1 (555) 177-4000"}
                      </p>
                    </div>
                    <div className="md:col-span-2">
                       <div className="bg-blue-50/50 text-blue-800 px-5 py-3 rounded-2xl text-sm font-bold flex items-center gap-3 border border-blue-100/50">
                        <Activity size={18} className="text-blue-500" />
                        <span>This student has had <span className="text-blue-700 underline decoration-blue-300 decoration-2 underline-offset-4">{previousSessions} previous completed session(s)</span>.</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Appointment Info */}
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
              <h2 className="text-lg font-bold text-gray-900 mb-4 border-b border-gray-100 pb-2">Appointment Details</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="text-xs text-gray-500 uppercase font-semibold">Date</label>
                  <p className="font-medium text-gray-900 flex items-center gap-2 mt-1"><Calendar size={16} className="text-blue-500"/> {appointment.date}</p>
                </div>
                <div>
                  <label className="text-xs text-gray-500 uppercase font-semibold">Time</label>
                  <p className="font-medium text-gray-900 flex items-center gap-2 mt-1"><Clock size={16} className="text-blue-500"/> {appointment.time}</p>
                </div>
                <div className="md:col-span-2">
                  <label className="text-xs text-gray-500 uppercase font-semibold">Session Type</label>
                  <p className="font-medium text-gray-900 flex items-center gap-2 mt-1"><Activity size={16} className="text-purple-500"/> {appointment.sessionType || "1-on-1 In-Person Counseling"}</p>
                </div>
                {appointment.rejectReason && (
                  <div className="md:col-span-2 bg-red-50 text-red-800 px-4 py-3 rounded-xl mt-2 text-sm border border-red-100">
                    <span className="font-bold block mb-1">Cancellation Reason:</span>
                    {appointment.rejectReason}
                  </div>
                )}
              </div>
            </div>

            {/* Session Info (Notes) */}
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
              <h2 className="text-lg font-bold text-gray-900 mb-4 border-b border-gray-100 pb-2 flex items-center gap-2">
                <FileText size={20} className="text-gray-500"/> Session Records
              </h2>
              
              {note ? (
                <div className="space-y-4">
                  <div className="flex justify-between items-start">
                    <h3 className="font-bold text-gray-900 text-lg">{note.title}</h3>
                    <span className={`text-xs px-2.5 py-1 rounded-md font-bold uppercase tracking-wide border ${
                        note.riskLevel === 'Severe' || note.riskLevel === 'Critical' || note.riskLevel === 'High' ? 'bg-red-50 text-red-700 border-red-200' : 
                        note.riskLevel === 'Medium' ? 'bg-orange-50 text-orange-700 border-orange-200' : 
                        'bg-green-50 text-green-700 border-green-200'
                      }`}>
                      {note.riskLevel} Risk
                    </span>
                  </div>
                  <div className="bg-gray-50 p-4 rounded-xl text-sm text-gray-700 whitespace-pre-wrap border border-gray-100 leading-relaxed">
                    {note.notes}
                  </div>
                  <div>
                    <label className="text-xs text-gray-500 uppercase font-semibold">Follow-up Recommendation</label>
                    <p className="font-medium text-gray-900 mt-1">{note.followUpRecommendation}</p>
                  </div>
                  <div className="pt-2">
                    <button onClick={() => navigate("/counsellor/notes")} className="text-blue-600 hover:text-blue-800 text-sm font-semibold flex items-center gap-1 transition">
                      Edit File in Notes Hub <ArrowLeft size={14} className="rotate-180" />
                    </button>
                  </div>
                </div>
              ) : (
                <div className="text-center py-8">
                  <FileText className="mx-auto h-10 w-10 text-gray-300 mb-2" />
                  <p className="text-gray-500 font-medium">No session notes have been recorded yet.</p>
                  {appointment.status === "Completed" && (
                     <button onClick={() => navigate("/counsellor/notes")} className="mt-4 bg-white border border-gray-200 text-gray-700 hover:bg-gray-50 px-4 py-2 rounded-lg font-medium shadow-sm transition">
                       Go To Notes Directory
                     </button>
                  )}
                </div>
              )}
            </div>

          </div>

          {/* Right Column: ActionsPanel */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 sticky top-24">
              <h2 className="text-lg font-bold text-gray-900 mb-6 border-b border-gray-100 pb-2">Available Actions</h2>
              
              <div className="space-y-3">
                
                {/* Always available if not pending/cancelled */}
                {(appointment.status === "Confirmed" || appointment.status === "Accepted" || appointment.status === "Completed") && (
                  <button onClick={() => navigate(`/chat?student=${encodeURIComponent(appointment.studentName || appointment.name || 'Student')}`)} className="w-full flex items-center justify-center gap-2 bg-indigo-50 text-indigo-700 border border-indigo-200 hover:bg-indigo-100 px-4 py-3 rounded-xl font-bold transition shadow-sm">
                    <MessageCircle size={18} /> {hasChatHistory(appointment.studentName || appointment.name) ? "Continue Chat" : "Start Chat"}
                  </button>
                )}

                {/* State: Pending */}
                {appointment.status === "Pending" && (
                  <>
                    <button onClick={() => confirmBookingByCounsellor(appointment.id)} className="w-full flex items-center justify-center gap-2 bg-blue-600 text-white hover:bg-blue-700 px-4 py-3 rounded-xl font-bold transition shadow-sm">
                      <CheckCircle size={18} /> Confirm Appointment
                    </button>
                    <button onClick={() => { const reason = window.prompt("Reason for cancellation:"); if(reason !== null) cancelBookingByCounsellor(appointment.id, reason); }} className="w-full flex items-center justify-center gap-2 bg-white text-red-600 border border-red-200 hover:bg-red-50 px-4 py-3 rounded-xl font-bold transition shadow-sm">
                      <XCircle size={18} /> Cancel Appointment
                    </button>
                  </>
                )}

                {/* State: Confirmed */}
                {(appointment.status === "Confirmed" || appointment.status === "Accepted") && (
                  <>
                    <button onClick={() => completeBooking(appointment.id)} className="w-full flex items-center justify-center gap-2 bg-green-600 text-white hover:bg-green-700 px-4 py-3 rounded-xl font-bold transition shadow-sm">
                      <CheckCircle size={18} /> Mark as Completed
                    </button>
                    <button onClick={() => { const reason = window.prompt("Reason for cancellation:"); if(reason !== null) cancelBookingByCounsellor(appointment.id, reason); }} className="w-full flex items-center justify-center gap-2 bg-white text-red-600 border border-red-200 hover:bg-red-50 px-4 py-3 rounded-xl font-bold transition shadow-sm">
                      <XCircle size={18} /> Cancel Appointment
                    </button>
                  </>
                )}

                {/* State: Completed (Notes management bridged to global modal via dashboard for now, or just instruction) */}
                {appointment.status === "Completed" && (
                   <button onClick={() => navigate("/counsellor/notes")} className="w-full flex items-center justify-center gap-2 bg-gray-50 text-gray-800 border border-gray-200 hover:bg-gray-100 px-4 py-3 rounded-xl font-bold transition shadow-sm">
                     <FileText size={18} /> Manage Notes
                   </button>
                )}

              </div>
              
              <div className="mt-8 bg-gray-50 p-4 rounded-xl border border-gray-100">
                <p className="text-xs text-gray-500 flex items-start gap-2 leading-relaxed">
                  <AlertTriangle size={14} className="shrink-0 mt-0.5" />
                  All actions taken here are securely logged and synced to the administrative and student portals.
                </p>
              </div>

            </div>
          </div>

        </div>
      </div>
    </div>
  );
}

import { useState } from "react";
import { Link } from "react-router-dom";
import { 
  Calendar as CalendarIcon, 
  Clock, 
  Video, 
  FileText, 
  XCircle, 
  AlertCircle, 
  CheckCircle, 
  Edit, 
  Save, 
  Sparkles, 
  ChevronRight, 
  User, 
  Activity, 
  MessageSquare
} from "lucide-react";
import { useBooking } from "../../context/BookingContext";
import { useAuth } from "../../context/AuthContext";

const regularSlots = ["09:00 AM", "11:00 AM", "01:00 PM", "03:00 PM", "05:00 PM"];

const StudentDashboard = () => {
  const { user } = useAuth();
  const { bookings, cancelBooking, rescheduleBooking, checkIsRefundable, getAvailableSlots } = useBooking();
  const [filter, setFilter] = useState("All"); 
  
  const [editingBookingId, setEditingBookingId] = useState(null);
  const [newDate, setNewDate] = useState("");
  const [newTime, setNewTime] = useState("");
  const [rescheduleError, setRescheduleError] = useState("");

  const filteredBookings = [...bookings].reverse().filter(b => {
    if (filter === "All") return true;
    return b.status === filter;
  });

  const handleOpenReschedule = (booking) => {
    setEditingBookingId(booking.id);
    setNewDate(booking.date);
    setNewTime("");
    setRescheduleError("");
  };

  const handleSaveReschedule = (booking) => {
    setRescheduleError("");
    if (!newDate || !newTime) {
      setRescheduleError("Please pick both a valid date and time.");
      return;
    }
    try {
      rescheduleBooking(booking.id, newDate, newTime);
      setEditingBookingId(null);
    } catch (err) {
      setRescheduleError(err.message);
    }
  };

  return (
    <div className="bg-[#F8FAFC] min-h-screen pt-32 pb-24">
      <div className="max-w-7xl mx-auto px-6 lg:px-8">
        
        {/* Welcome Header */}
        <div className="flex flex-col lg:flex-row lg:items-end justify-between mb-12 gap-8">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-100 text-blue-700 text-xs font-black uppercase tracking-widest mb-4">
              <Sparkles size={14} />
              <span>Student Dashboard</span>
            </div>
            <h1 className="text-4xl lg:text-5xl font-black text-gray-900 mb-2">
              Hello, <span className="text-blue-600">{user?.name?.split(' ')[0] || "Student"}</span>!
            </h1>
            <p className="text-gray-500 font-bold text-lg">Your mental wellness journey is our priority today.</p>
          </div>
          
          {/* Quick Stats */}
          <div className="flex gap-4">
            <div className="bg-white p-4 rounded-3xl shadow-xl shadow-gray-200/50 border border-gray-100 min-w-[120px] text-center">
              <p className="text-2xl font-black text-gray-900">{bookings.filter(b => b.status === 'Confirmed').length}</p>
              <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Active Sessions</p>
            </div>
            <div className="bg-white p-4 rounded-3xl shadow-xl shadow-gray-200/50 border border-gray-100 min-w-[120px] text-center">
              <p className="text-2xl font-black text-blue-600">4</p>
              <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Completed</p>
            </div>
            <Link to="/appointment/counsellors" className="bg-gray-900 hover:bg-blue-600 text-white font-black px-8 py-4 rounded-3xl shadow-xl shadow-gray-900/10 transition-all flex items-center justify-center gap-2">
              <CalendarIcon className="w-5 h-5" /> <span>New Session</span>
            </Link>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
          
          <div className="lg:col-span-2 space-y-10">
            {/* Appointments List */}
            <div className="bg-white rounded-[3rem] p-10 shadow-2xl shadow-gray-200/50 border border-gray-50 relative overflow-hidden">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-10 pb-6 border-b border-gray-100 gap-6">
                 <h2 className="text-2xl font-black text-gray-900 flex items-center">
                  Recent Appointments
                  <span className="ml-4 text-xs font-black text-blue-600 bg-blue-50 px-4 py-1.5 rounded-full border border-blue-100">{bookings.length} Total</span>
                </h2>

                <div className="flex items-center gap-1 bg-gray-100/80 p-1.5 rounded-2xl border border-gray-100">
                  {["All", "Pending", "Confirmed", "Cancelled"].map(f => (
                    <button
                      key={f}
                      onClick={() => setFilter(f)}
                      className={`px-5 py-2.5 rounded-xl text-xs font-black transition-all ${
                        filter === f ? "bg-white shadow-xl text-blue-600" : "text-gray-400 hover:text-gray-600"
                      }`}
                    >
                      {f}
                    </button>
                  ))}
                </div>
              </div>

              {filteredBookings.length === 0 ? (
                <div className="text-center py-20 bg-gray-50/50 rounded-[2rem] border-2 border-dashed border-gray-100">
                  <div className="bg-white w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-6 shadow-xl text-gray-200">
                    <CalendarIcon size={32} />
                  </div>
                  <p className="text-gray-400 font-bold text-lg">No {filter !== "All" ? filter.toLowerCase() : ""} sessions found.</p>
                  <Link to="/appointment/counsellors" className="mt-4 inline-block text-blue-600 font-black uppercase tracking-widest text-xs hover:underline">Book your first session</Link>
                </div>
              ) : (
                <div className="space-y-8">
                  {filteredBookings.map((app) => {
                    const isRefundable = checkIsRefundable(app.date, app.time);
                    const isRescheduling = editingBookingId === app.id;
                    const computedSlots = isRescheduling && newDate ? getAvailableSlots(app.counsellor, newDate, regularSlots) : [];

                    return (
                      <div key={app.id} className="group border border-gray-100 rounded-[2rem] p-8 flex flex-col gap-6 shadow-xl shadow-gray-100/30 hover:shadow-2xl hover:shadow-blue-500/5 transition-all duration-500 bg-white relative overflow-hidden">
                        
                        {/* Status bar */}
                        <div className={`absolute top-0 left-0 w-2 h-full ${
                          app.status === "Confirmed" ? "bg-teal-500" : 
                          app.status === "Pending" ? "bg-yellow-400" : "bg-red-400"
                        }`}></div>

                        <div className="flex flex-col sm:flex-row gap-8">
                          <div className="relative shrink-0">
                            <img src={app.counsellorImage} alt={app.counsellor} className="w-24 h-24 rounded-3xl object-cover shadow-lg border-2 border-white" />
                            <div className="absolute -bottom-2 -right-2 bg-white p-1.5 rounded-xl shadow-lg">
                              <div className={`w-3 h-3 rounded-full ${app.status === 'Confirmed' ? 'bg-teal-500' : 'bg-gray-300'}`}></div>
                            </div>
                          </div>
                          
                          <div className="flex-grow">
                            <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start mb-4 gap-4">
                              <div>
                                <h3 className="text-2xl font-black text-gray-900 group-hover:text-blue-600 transition-colors uppercase tracking-tight">{app.counsellor}</h3>
                                <p className="text-sm font-extrabold text-blue-500 mb-4">{app.specialty}</p>
                              </div>
                              
                              <div className="flex flex-col gap-2 items-end">
                                <span className={`text-[10px] font-black px-4 py-2 rounded-xl uppercase tracking-[0.1em] shadow-sm ${
                                  app.status === "Confirmed" ? "bg-teal-50 text-teal-700 border border-teal-100" :
                                  app.status === "Pending" ? "bg-yellow-50 text-yellow-700 border border-yellow-100" : "bg-red-50 text-red-700 border border-red-100"
                                }`}>
                                  {app.status}
                                </span>

                                {app.status === "Cancelled" && (
                                  <span className={`text-[10px] font-black flex items-center gap-1.5 px-3 py-1.5 rounded-lg border ${
                                    app.refundStatus === 'Eligible' ? 'text-green-600 bg-green-50 border-green-100' : 'text-gray-400 bg-gray-50 border-gray-100'
                                  }`}>
                                    {app.refundStatus === 'Eligible' ? <CheckCircle className="w-3 h-3" /> : <AlertCircle className="w-3 h-3" />}
                                    {app.refundStatus === 'Eligible' ? 'REFUNDED' : 'NO REFUND'}
                                  </span>
                                )}
                              </div>
                            </div>

                            {!isRescheduling && (
                              <div className="flex flex-wrap gap-4 mb-8">
                                <div className="flex items-center gap-3 bg-gray-50 px-5 py-3 rounded-2xl border border-gray-100">
                                  <CalendarIcon className="w-4 h-4 text-blue-500" />
                                  <span className="text-sm font-black text-gray-700">{app.date}</span>
                                </div>
                                <div className="flex items-center gap-3 bg-gray-50 px-5 py-3 rounded-2xl border border-gray-100">
                                  <Clock className="w-4 h-4 text-teal-500" />
                                  <span className="text-sm font-black text-gray-700">{app.time}</span>
                                </div>
                                <div className="flex items-center gap-3 bg-gray-50/50 px-5 py-3 rounded-2xl border border-gray-100 border-dashed">
                                  <Video className="w-4 h-4 text-gray-400" />
                                  <span className="text-sm font-bold text-gray-500">{app.type}</span>
                                </div>
                              </div>
                            )}

                            {!isRescheduling && (
                              <div className="flex flex-wrap gap-3">
                                {app.status === "Pending" && (
                                  <Link to="/appointment/payment" state={{ bookingId: app.id, counsellor: { name: app.counsellor, image: app.counsellorImage, specialty: app.specialty }, date: app.date, time: app.time, price: app.price }} className="bg-blue-600 text-white px-8 py-3.5 rounded-2xl text-xs font-black uppercase tracking-widest hover:bg-blue-700 transition shadow-xl shadow-blue-500/20">
                                    Confirm & Pay
                                  </Link>
                                )}

                                {app.status === "Confirmed" && (
                                  <button className="bg-teal-600 text-white px-8 py-3.5 rounded-2xl text-xs font-black uppercase tracking-widest hover:bg-teal-700 transition flex items-center gap-2 shadow-xl shadow-teal-500/20">
                                    <Video className="w-4 h-4" /> Start Session
                                  </button>
                                )}

                                {app.status === "Pending" && (
                                  <button 
                                    onClick={() => handleOpenReschedule(app)}
                                    disabled={!isRefundable}
                                    className={`px-8 py-3.5 rounded-2xl text-xs font-black uppercase tracking-widest flex items-center gap-2 transition-all ${
                                      !isRefundable 
                                        ? "bg-gray-50 text-gray-300 cursor-not-allowed border border-gray-100" 
                                        : "bg-white border-2 border-blue-50 text-blue-600 hover:bg-blue-50"
                                    }`}
                                  >
                                    <Edit className="w-4 h-4" /> Reschedule
                                  </button>
                                )}
                                
                                {(app.status === "Pending" || app.status === "Confirmed") && (
                                  <button 
                                    onClick={() => cancelBooking(app.id)}
                                    disabled={!isRefundable && app.status === "Confirmed"}
                                    className={`px-8 py-3.5 rounded-2xl text-xs font-black uppercase tracking-widest flex items-center gap-2 transition-all ${
                                      !isRefundable && app.status === "Confirmed" 
                                        ? "bg-gray-50 text-gray-300 cursor-not-allowed border border-gray-100" 
                                        : "bg-white border-2 border-red-50 text-red-600 hover:bg-red-50"
                                    }`}
                                  >
                                    <XCircle className="w-4 h-4" /> Cancel
                                  </button>
                                )}
                              </div>
                            )}
                          </div>
                        </div>

                        {/* Rescheduling UI */}
                        {isRescheduling && (
                          <div className="mt-4 pt-8 border-t border-gray-100 animate-in fade-in slide-in-from-top-4 duration-300">
                            <h4 className="text-gray-900 font-black mb-6 flex items-center uppercase tracking-widest text-xs">
                              <Edit className="w-4 h-4 mr-2 text-blue-600" /> Choose New Available Slot
                            </h4>
                            
                            {rescheduleError && (
                              <div className="mb-6 text-xs font-black text-red-600 bg-red-50 p-4 rounded-2xl border border-red-100 flex items-center gap-2">
                                <AlertCircle size={16} /> {rescheduleError}
                              </div>
                            )}

                            <div className="flex flex-col sm:flex-row gap-6 mb-8 text-center items-center">
                              <input 
                                type="date" 
                                value={newDate}
                                min={new Date().toISOString().split("T")[0]}
                                onChange={(e) => { setNewDate(e.target.value); setNewTime(""); }}
                                className="bg-gray-50 border-2 border-gray-100 rounded-2xl px-6 py-4 text-sm font-bold focus:ring-4 focus:ring-blue-500/10 outline-none w-full sm:w-auto"
                              />
                              <ChevronRight className="text-gray-300 hidden sm:block" />
                              <div className="flex flex-wrap justify-center gap-2 flex-grow">
                                {newDate && (
                                  <>
                                    {computedSlots.filter(s => !s.disabled).length === 0 ? (
                                      <span className="text-sm font-bold text-red-400">No open slots on this date.</span>
                                    ) : (
                                      computedSlots.map((slot, idx) => (
                                        <button
                                          key={idx}
                                          onClick={() => !slot.disabled && setNewTime(slot.time)}
                                          disabled={slot.disabled}
                                          className={`px-5 py-2.5 rounded-xl text-xs font-black transition-all ${
                                            slot.disabled 
                                              ? "bg-gray-100 text-gray-300 line-through cursor-not-allowed" 
                                              : newTime === slot.time
                                                ? "bg-blue-600 text-white shadow-xl shadow-blue-500/20"
                                                : "bg-white border-2 border-gray-100 text-gray-700 hover:border-blue-500"
                                          }`}
                                        >
                                          {slot.time}
                                        </button>
                                      ))
                                    )}
                                  </>
                                )}
                              </div>
                            </div>
                            
                            <div className="flex gap-4 pt-4">
                              <button 
                                onClick={() => handleSaveReschedule(app)}
                                className="bg-blue-600 hover:bg-blue-700 text-white px-8 py-4 rounded-2xl text-xs font-black uppercase tracking-widest flex items-center shadow-xl shadow-blue-500/20"
                              >
                                <Save className="w-4 h-4 mr-2" /> Save New Slot
                              </button>
                              <button 
                                onClick={() => setEditingBookingId(null)}
                                className="bg-gray-100 text-gray-500 hover:bg-gray-200 px-8 py-4 rounded-2xl text-xs font-black uppercase tracking-widest"
                              >
                                Cancel
                              </button>
                            </div>
                          </div>
                        )}

                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </div>

          {/* Sidebar */}
          <div className="space-y-10">
            {/* Mood Card */}
            <div className="bg-gradient-to-br from-indigo-600 via-blue-600 to-teal-500 rounded-[3rem] p-10 text-white shadow-2xl shadow-blue-600/20 relative overflow-hidden group">
              <div className="absolute right-0 bottom-0 opacity-10 group-hover:scale-110 transition-transform duration-700">
                <Activity className="w-48 h-48 -mr-12 -mb-12" />
              </div>
              <div className="relative z-10">
                <div className="bg-white/20 w-12 h-12 rounded-2xl flex items-center justify-center mb-6 backdrop-blur-md">
                  <Activity size={24} />
                </div>
                <h2 className="text-2xl font-black mb-2 uppercase tracking-tight">Track Your Mood</h2>
                <p className="text-blue-100 mb-8 text-sm font-medium leading-relaxed">Regularly logging your feelings helps us provide smarter support.</p>
                <button className="bg-white text-blue-600 font-black px-8 py-4 rounded-2xl w-full hover:bg-blue-50 transition-all shadow-xl hover:scale-[1.02] active:scale-95 text-sm uppercase tracking-widest">
                  Log My Feelings
                </button>
              </div>
            </div>

            {/* Resources Card */}
            <div className="bg-white rounded-[3rem] p-10 shadow-2xl shadow-gray-200/50 border border-gray-50">
              <div className="flex items-center gap-4 mb-8">
                <div className="bg-pink-100 text-pink-600 w-12 h-12 rounded-2xl flex items-center justify-center">
                  <Sparkles size={24} />
                </div>
                <h2 className="text-xl font-black text-gray-900 uppercase tracking-tight">For You</h2>
              </div>
              
              <div className="space-y-4">
                {[
                  { title: "Manage Exam Anxiety", type: "Guide" },
                  { title: "Deep Breathing 101", type: "Video" },
                  { title: "Sleep Better Guide", type: "Audio" }
                ].map((item, idx) => (
                  <div key={idx} className="group cursor-pointer flex items-center justify-between p-4 rounded-2xl hover:bg-gray-50 transition-colors border border-transparent hover:border-gray-100">
                    <div>
                      <p className="text-sm font-black text-gray-900 leading-tight">{item.title}</p>
                      <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mt-1">{item.type}</p>
                    </div>
                    <ChevronRight size={18} className="text-gray-300 group-hover:text-blue-600 transition-colors" />
                  </div>
                ))}
              </div>

              <button className="mt-10 text-xs font-black text-blue-600 hover:text-blue-700 w-full text-center uppercase tracking-[0.2em] py-4 rounded-2xl bg-blue-50/50 border border-blue-100/50 hover:bg-blue-50 transition-all">
                More Resources
              </button>
            </div>

            {/* Quick Contact */}
            <div className="p-8 bg-gray-900 rounded-[3rem] text-center text-white relative overflow-hidden">
               <div className="absolute top-0 right-0 w-32 h-32 bg-blue-600/10 rounded-full blur-3xl"></div>
               <MessageSquare className="w-10 h-10 text-blue-500 mx-auto mb-4" />
               <p className="text-sm font-bold text-gray-400 mb-6">Need immediate help? Our emergency line is open 24/7.</p>
               <button className="text-xs font-black uppercase tracking-widest text-white border-2 border-white/20 hover:border-white/50 px-8 py-3 rounded-2xl transition-all">
                 Emergency Support
               </button>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
};

export default StudentDashboard;

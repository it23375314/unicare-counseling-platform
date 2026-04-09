import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { Calendar as CalendarIcon, Clock, Video, FileText, XCircle, AlertCircle, CheckCircle2, Edit, Save, ArrowRight, User, Sparkles, Heart, Activity } from "lucide-react";
import { useBooking } from "../../context/BookingContext";

const regularSlots = ["09:00", "11:00", "13:00", "15:00"];

const StudentDashboard = () => {
  const { bookings, cancelBooking, rescheduleBooking, checkIsRefundable, getAvailableSlots } = useBooking();
  const [filter, setFilter] = useState("All"); 
  
  const [showRescheduleModal, setShowRescheduleModal] = useState(false);
  const [showCancelModal, setShowCancelModal] = useState(false);
  const [currentBooking, setCurrentBooking] = useState(null);
  const [newDate, setNewDate] = useState("");
  const [newTime, setNewTime] = useState("");
  const [rescheduleError, setRescheduleError] = useState("");
  const [cancelReason, setCancelReason] = useState("");

  const filteredBookings = [...bookings].reverse().filter(b => {
    if (filter === "All") return true;
    return b.status === filter;
  });

  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  const handleOpenReschedule = (booking) => {
    setCurrentBooking(booking);
    setNewDate(booking.date);
    setNewTime("");
    setRescheduleError("");
    setShowRescheduleModal(true);
  };

  const handleSaveReschedule = () => {
    setRescheduleError("");
    if (!newDate || !newTime) {
      setRescheduleError("Please pick both a valid date and time.");
      return;
    }
    try {
      rescheduleBooking(currentBooking.id, newDate, newTime);
      setShowRescheduleModal(false);
      setCurrentBooking(null);
    } catch (err) {
      setRescheduleError(err.message);
    }
  };

  const handleOpenCancel = (booking) => {
    if (booking.paymentStatus !== "Paid") {
      if (window.confirm("Are you sure you want to cancel this session?")) {
        cancelBooking(booking.id);
      }
      return;
    }
    setCurrentBooking(booking);
    setCancelReason("");
    setShowCancelModal(true);
  };

  const handleConfirmCancel = () => {
    cancelBooking(currentBooking.id);
    setShowCancelModal(false);
    setCurrentBooking(null);
  };

  return (
    <div className="bg-slate-50 min-h-screen pb-32">
      {/* Reschedule Modal */}
      {showRescheduleModal && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center px-6">
          <div className="absolute inset-0 bg-slate-900/40 backdrop-blur-md" onClick={() => setShowRescheduleModal(false)} />
          <div className="glass-card max-w-2xl w-full p-10 rounded-[3rem] shadow-2xl relative animate-fade-in-up border border-white/20 bg-white/95 overflow-y-auto max-h-[90vh] no-scrollbar">
             <div className="flex items-center gap-4 mb-10">
               <div className="w-14 h-14 rounded-2xl bg-indigo-600 text-white flex items-center justify-center shadow-lg shadow-indigo-600/20">
                 <Edit size={28} />
               </div>
               <div>
                 <h2 className="text-3xl font-black text-slate-900 tracking-tight">Modify Session</h2>
                 <p className="text-sm text-slate-400 font-bold uppercase tracking-widest">Reschedule with {currentBooking?.counsellor}</p>
               </div>
             </div>

             {rescheduleError && (
               <div className="mb-8 p-5 bg-rose-50 text-rose-700 flex items-center gap-4 rounded-2xl border border-rose-100 animate-slide-up">
                 <AlertCircle className="w-5 h-5 flex-shrink-0" />
                 <p className="font-black text-[10px] uppercase tracking-widest">{rescheduleError}</p>
               </div>
             )}

             <div className="space-y-10">
                <div className="space-y-4">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest px-1">Choose New Date</label>
                  <input 
                    type="date" 
                    value={newDate}
                    min={new Date().toISOString().split("T")[0]}
                    onChange={(e) => { setNewDate(e.target.value); setNewTime(""); }}
                    className="w-full bg-slate-100 border-none text-slate-900 text-sm font-black rounded-3xl focus:ring-2 focus:ring-indigo-500 block p-5 shadow-inner cursor-pointer transition-all"
                  />
                </div>

                {newDate && (
                  <div className="space-y-4 animate-fade-in">
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest px-1">Available Slots on {newDate}</label>
                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                      {getAvailableSlots(currentBooking?.counsellor, newDate, regularSlots).map((slot, idx) => (
                        <button
                          key={idx}
                          onClick={() => !slot.disabled && setNewTime(slot.time)}
                          disabled={slot.disabled}
                          className={`py-4 rounded-2xl font-black text-xs transition-all duration-300 border ${
                            slot.disabled 
                              ? "bg-slate-50 text-slate-200 border-slate-50 cursor-not-allowed line-through" 
                              : newTime === slot.time
                                ? "bg-indigo-600 text-white border-indigo-600 shadow-xl shadow-indigo-600/20 scale-102"
                                : "bg-white text-slate-600 border-slate-100 hover:border-indigo-400 hover:text-indigo-600 shadow-sm"
                          }`}
                        >
                          {slot.time}
                        </button>
                      ))}
                    </div>
                  </div>
                )}
             </div>

             <div className="grid grid-cols-2 gap-4 mt-12 bg-slate-50 p-4 rounded-[2.5rem]">
               <button 
                 onClick={() => { setShowRescheduleModal(false); setCurrentBooking(null); }}
                 className="py-5 rounded-[2rem] bg-white text-slate-400 font-black uppercase tracking-widest text-[10px] hover:text-slate-600 transition-all border border-slate-100"
               >
                 Go Back
               </button>
               <button 
                 onClick={handleSaveReschedule}
                 className="py-5 rounded-[2rem] bg-slate-900 text-white font-black uppercase tracking-widest text-[10px] hover:bg-indigo-600 transition-all shadow-xl shadow-slate-900/20"
               >
                 Save Update
               </button>
             </div>
          </div>
        </div>
      )}

      {/* Cancellation & Refund Modal */}
      {showCancelModal && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center px-6">
          <div className="absolute inset-0 bg-slate-900/40 backdrop-blur-md" onClick={() => setShowCancelModal(false)} />
          <div className="glass-card max-w-xl w-full p-10 rounded-[3rem] shadow-2xl relative animate-fade-in-up border border-white/20 bg-white/95">
             <div className="flex items-center gap-4 mb-8">
               <div className="w-14 h-14 rounded-2xl bg-rose-100 text-rose-600 flex items-center justify-center shadow-lg shadow-rose-600/10">
                 <XCircle size={28} />
               </div>
               <div>
                 <h2 className="text-3xl font-black text-slate-900 tracking-tight">Cancel Session</h2>
                 <p className="text-sm text-slate-400 font-bold uppercase tracking-widest">Refunding for {currentBooking?.counsellor}</p>
               </div>
             </div>

             <div className="space-y-8">
                {/* Refund Inquiry Policy Box */}
                <div className={`p-6 rounded-3xl border ${checkIsRefundable(currentBooking?.date, currentBooking?.time) ? "bg-emerald-50 border-emerald-100" : "bg-rose-50 border-rose-100"}`}>
                   <div className="flex items-start gap-4">
                     {checkIsRefundable(currentBooking?.date, currentBooking?.time) ? (
                        <CheckCircle2 className="w-6 h-6 text-emerald-600 shrink-0 mt-1" />
                     ) : (
                        <AlertCircle className="w-6 h-6 text-rose-600 shrink-0 mt-1" />
                     )}
                     <div className="space-y-2">
                        <h4 className={`text-lg font-black ${checkIsRefundable(currentBooking?.date, currentBooking?.time) ? "text-emerald-900" : "text-rose-900"}`}>
                          {checkIsRefundable(currentBooking?.date, currentBooking?.time) ? "Full Refund Eligible" : "Non-Refundable Window"}
                        </h4>
                        <p className={`text-xs font-medium leading-relaxed ${checkIsRefundable(currentBooking?.date, currentBooking?.time) ? "text-emerald-700" : "text-rose-700"}`}>
                          {checkIsRefundable(currentBooking?.date, currentBooking?.time) 
                            ? "Since you are cancelling more than 2 hours in advance, you will receive a 100% refund (Rs. 3000) to your account." 
                            : "Cancellations made within 2 hours of the session start time are not eligible for a refund per university policy."}
                        </p>
                     </div>
                   </div>
                </div>

                <div className="space-y-4">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest px-1">Why are you cancelling? (Optional)</label>
                  <textarea 
                    value={cancelReason}
                    onChange={(e) => setCancelReason(e.target.value)}
                    placeholder="e.g., Change of plans, academic conflict..."
                    className="w-full bg-slate-100 border-none text-slate-900 text-sm font-bold rounded-3xl focus:ring-2 focus:ring-rose-500 block p-5 h-32 resize-none shadow-inner"
                  />
                </div>
             </div>

             <div className="grid grid-cols-2 gap-4 mt-12 bg-slate-50 p-4 rounded-[2.5rem]">
               <button 
                 onClick={() => { setShowCancelModal(false); setCurrentBooking(null); }}
                 className="py-5 rounded-[2rem] bg-white text-slate-400 font-black uppercase tracking-widest text-[10px] hover:text-slate-600 transition-all border border-slate-100"
               >
                 Go Back
               </button>
               <button 
                 onClick={handleConfirmCancel}
                 className="py-5 rounded-[2rem] bg-rose-600 text-white font-black uppercase tracking-widest text-[10px] hover:bg-rose-700 transition-all shadow-xl shadow-rose-600/20"
               >
                 Confirm Cancellation
               </button>
             </div>
          </div>
        </div>
      )}

      {/* Dynamic Hero Header */}
      <div className="bg-white border-b border-slate-200 pt-32 pb-24 overflow-hidden relative">
        <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-blue-600/5 rounded-full blur-[100px] -mr-64 -mt-64" />
        <div className="max-w-7xl mx-auto px-6 lg:px-8 relative z-10">
          <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-12">
            <div className="space-y-6 animate-fade-in-up">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-50 text-blue-600 text-[10px] font-black uppercase tracking-widest border border-blue-100">
                <Sparkles size={12} /> Student Dashboard
              </div>
              <h1 className="text-5xl lg:text-7xl font-black text-slate-900 tracking-tight leading-none italic">
                Welcome back, <span className="text-blue-600 not-italic">Alex.</span>
              </h1>
              <p className="text-lg text-slate-500 font-medium max-w-xl">
                Ready to continue your wellness journey? Your history and upcoming sessions are organized right here.
              </p>
            </div>

            {/* Quick Stats Grid */}
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 animate-fade-in-up delay-100">
              <StatCard icon={<CalendarIcon size={18} />} label="Sessions" value={bookings.length} />
              <StatCard icon={<Heart size={18} className="text-rose-500" />} label="Mood Avg" value="Good" />
              <StatCard icon={<Activity size={18} className="text-emerald-500" />} label="Active" value={bookings.filter(b => b.status === "Confirmed").length} />
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6 lg:px-8 mt-12 grid grid-cols-1 lg:grid-cols-12 gap-12">
        
        {/* Main Feed */}
        <div className="lg:col-span-8 space-y-12">
          
          <section className="glass-card p-10 rounded-[2.5rem] animate-fade-in-up delay-200">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-10 gap-6 border-b border-slate-50 pb-8">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-2xl bg-slate-900 text-white flex items-center justify-center shadow-xl">
                  <Clock size={24} />
                </div>
                <h2 className="text-2xl font-black text-slate-900 tracking-tight">Timeline</h2>
              </div>

              <div className="flex items-center gap-2 bg-slate-50 p-1.5 rounded-2xl border border-slate-100 overflow-x-auto no-scrollbar">
                {["All", "Pending", "Confirmed", "Cancelled"].map(f => (
                  <button
                    key={f}
                    onClick={() => setFilter(f)}
                    className={`px-5 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all whitespace-nowrap ${
                      filter === f ? "bg-white shadow-lg shadow-slate-200 text-blue-600 border border-slate-100" : "text-slate-400 hover:text-slate-600"
                    }`}
                  >
                    {f}
                  </button>
                ))}
              </div>
            </div>

            {filteredBookings.length === 0 ? (
              <div className="text-center py-20 space-y-4">
                <CalendarIcon className="w-16 h-16 text-slate-100 mx-auto" />
                <p className="text-slate-400 font-bold uppercase tracking-widest text-xs">No matching sessions found</p>
              </div>
            ) : (
              <div className="space-y-6">
                {filteredBookings.map((app, idx) => {
                  const isRefundable = checkIsRefundable(app.date, app.time);

                  return (
                    <div 
                      key={app.id} 
                      className="group bg-white rounded-[2rem] p-8 border border-slate-100 shadow-sm hover:shadow-2xl hover:shadow-blue-900/5 transition-all duration-500 relative overflow-hidden flex flex-col md:flex-row gap-8"
                    >
                      <div className={`absolute top-0 left-0 w-2 h-full transition-all duration-500 ${
                        app.status === "Confirmed" ? "bg-emerald-500" : 
                        app.status === "Pending" ? "bg-blue-400" : "bg-slate-300"
                      }`} />

                      <div className="shrink-0 relative">
                        <div className="absolute inset-0 bg-blue-600/10 rounded-2xl scale-110 group-hover:scale-125 transition-transform duration-500" />
                        <img 
                          src={app.counsellorImage} 
                          alt={app.counsellor} 
                          className="w-24 h-24 rounded-2xl object-cover relative z-10 border-2 border-white shadow-lg" 
                        />
                      </div>

                      <div className="flex-grow space-y-6">
                        <div className="flex flex-col sm:flex-row justify-between items-start gap-4">
                          <div className="space-y-1">
                            <h3 className="text-xl font-black text-slate-900 leading-tight group-hover:text-blue-600 transition-colors">{app.counsellor}</h3>
                            <p className="text-[10px] font-black text-blue-600 uppercase tracking-widest">{app.specialty}</p>
                          </div>
                          
                          <div className="flex flex-col items-end gap-2 shrink-0">
                            <span className={`text-[10px] font-black px-3 py-1.5 rounded-xl uppercase tracking-widest shadow-sm ${
                              app.status === "Confirmed" ? "bg-emerald-50 text-emerald-600 border border-emerald-100" :
                              app.status === "Pending" ? "bg-blue-50 text-blue-600 border border-blue-100" : 
                              "bg-slate-50 text-slate-400 border border-slate-100"
                            }`}>
                              {app.status}
                            </span>
                            {app.status === "Cancelled" && (
                              <div className="flex items-center gap-1.5">
                                <span className={`text-[9px] font-black uppercase tracking-widest px-2 py-0.5 rounded-md ${
                                  app.refundStatus === "Processing" ? "bg-amber-50 text-amber-600 border border-amber-100" :
                                  app.refundStatus === "Completed" ? "bg-emerald-50 text-emerald-600 border border-emerald-100" : 
                                  "bg-slate-50 text-slate-400 border border-slate-100"
                                }`}>
                                  {app.refundStatus === "Processing" ? "Refund In Progress" : 
                                   app.refundStatus === "Ineligible" ? "Non-Refundable" : 
                                   app.refundStatus === "Completed" ? "Refund Verified" : "Cancelled"}
                                </span>
                              </div>
                            )}
                          </div>
                        </div>

                        <div className="flex flex-wrap gap-4 items-center">
                          <SessionInfo icon={<CalendarIcon size={14} />} text={app.date} />
                          <SessionInfo icon={<Clock size={14} />} text={app.time} />
                          <SessionInfo icon={<Video size={14} />} text={app.type} />
                        </div>

                        <div className="flex flex-wrap gap-3 pt-2">
                          {app.status === "Pending" && (
                            <Link to="/appointment/payment" state={{ bookingId: app.id, counsellor: { name: app.counsellor, image: app.counsellorImage, specialty: app.specialty }, date: app.date, time: app.time, price: app.price }} className="btn-primary-sm">
                              Pay Now
                            </Link>
                          )}

                          {app.status === "Confirmed" && (
                            <button className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-emerald-600 text-white font-black text-[10px] uppercase tracking-widest hover:bg-emerald-700 transition shadow-lg shadow-emerald-600/20">
                              <Video className="w-4 h-4" /> Start Session
                            </button>
                          )}

                          {app.status === "Pending" && (
                            <button 
                              onClick={() => handleOpenReschedule(app)}
                              disabled={!isRefundable}
                              className={`flex items-center gap-2 px-5 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-widest transition shadow-sm ${
                                !isRefundable 
                                  ? "bg-slate-50 text-slate-300 border border-slate-100 cursor-not-allowed" 
                                  : "bg-white border border-slate-200 text-slate-900 hover:border-blue-600 hover:text-blue-600"
                              }`}
                            >
                              <Edit className="w-4 h-4" /> Reschedule
                            </button>
                          )}
                          
                          {(app.status === "Pending" || app.status === "Confirmed") && (
                            <button 
                              onClick={() => handleOpenCancel(app)}
                              disabled={!isRefundable && app.status === "Confirmed"}
                              className={`flex items-center gap-2 px-5 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-widest transition shadow-sm ${
                                !isRefundable && app.status === "Confirmed" 
                                  ? "bg-slate-50 text-slate-300 border border-slate-100 cursor-not-allowed" 
                                  : "bg-white border border-rose-100 text-rose-500 hover:bg-rose-50 hover:border-rose-200"
                              }`}
                            >
                              <XCircle className="w-4 h-4" /> Cancel
                            </button>
                          )}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </section>
        </div>

        {/* Sidebar Insights */}
        <div className="lg:col-span-4 space-y-8">
          
          <div className="glass-card p-10 rounded-[3rem] bg-slate-900 text-white shadow-2xl shadow-slate-900/40 relative overflow-hidden group">
            <div className="absolute top-0 right-0 w-48 h-48 bg-blue-600/20 rounded-full blur-3xl -mr-24 -mt-24 transition-transform duration-700 group-hover:scale-110" />
            <h3 className="text-xl font-black mb-4 relative z-10">How have <br /> you been?</h3>
            <p className="text-slate-400 text-sm font-medium mb-10 relative z-10 leading-relaxed">Regular mood logging unlocks tailored wellness insights in your portal.</p>
            <button className="w-full py-5 rounded-[2rem] bg-blue-600 text-white font-black uppercase tracking-widest text-xs hover:bg-white hover:text-slate-900 transition-all duration-500 shadow-xl shadow-blue-600/20 relative z-10 group/btn">
              Log Your Session <ArrowRight className="inline-block ml-2 w-4 h-4 group-hover/btn:translate-x-1 transition-transform" />
            </button>
          </div>

          <div className="glass-card p-10 rounded-[3rem] space-y-10 border border-white shadow-2xl shadow-blue-900/5">
            <h3 className="text-lg font-black text-slate-900 flex items-center gap-2">
              <Sparkles size={20} className="text-blue-600" /> Resource Hub
            </h3>
            <div className="space-y-6">
              <ResourceItem title="Managing Academic Stress" category="Reading" min="5" />
              <ResourceItem title="Sleep Hygiene Guide" category="Audio" min="12" />
              <ResourceItem title="Building Relationships" category="Session" min="45" />
            </div>
            <button className="w-full text-[10px] font-black text-blue-600 uppercase tracking-widest hover:underline pt-4 transition-all">
              Explore Academic Library
            </button>
          </div>

        </div>

      </div>
    </div>
  );
};

const StatCard = ({ icon, label, value }) => (
  <div className="glass-card px-6 py-5 rounded-3xl border border-slate-100 flex items-center gap-4 group hover:bg-slate-900 hover:text-white transition-all duration-500">
    <div className="w-10 h-10 rounded-2xl bg-blue-50 text-blue-600 flex items-center justify-center group-hover:bg-blue-600 group-hover:text-white transition-all duration-500">
      {icon}
    </div>
    <div>
      <p className="text-2xl font-black leading-none mb-1 tracking-tight">{value}</p>
      <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest group-hover:text-slate-500">{label}</p>
    </div>
  </div>
);

const SessionInfo = ({ icon, text }) => (
  <div className="flex items-center gap-2 text-[11px] font-black text-slate-500 truncate bg-slate-50 border border-slate-100 px-3 py-1.5 rounded-xl uppercase tracking-widest">
    <span className="text-blue-500">{icon}</span>
    {text}
  </div>
);

const ResourceItem = ({ title, category, min }) => (
  <div className="group cursor-pointer">
    <div className="flex justify-between items-start mb-1">
      <h4 className="text-sm font-bold text-slate-900 group-hover:text-blue-600 transition-colors">{title}</h4>
      <ArrowRight size={14} className="text-slate-300 group-hover:text-blue-600 transition-all group-hover:translate-x-1" />
    </div>
    <div className="flex gap-3">
      <span className="text-[9px] font-black text-blue-500 uppercase tracking-widest">{category}</span>
      <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest">{min} Min</span>
    </div>
  </div>
);

export default StudentDashboard;

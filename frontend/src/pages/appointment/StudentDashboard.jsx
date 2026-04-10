import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { 
  Calendar as CalendarIcon, 
  Clock, 
  Video, 
  XCircle, 
  AlertCircle, 
  CheckCircle2, 
  Edit, 
  ArrowRight, 
  Sparkles, 
  Heart, 
  Activity,
  ChevronRight,
  ShieldCheck,
  Stethoscope,
  Info
} from "lucide-react";
import { useBooking } from "../../context/BookingContext";
import FeedbackForm from "../../components/FeedbackForm";

const regularSlots = ["09:00", "11:00", "13:00", "15:00"];

const StudentDashboard = () => {
  const { bookings, cancelBooking, rescheduleBooking, getAvailableSlots } = useBooking();
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

  const handleOpenCancel = (booking) => {
    if (!window.confirm("Are you sure you want to cancel this session?")) return;
    if (booking.paymentStatus !== "Paid") {
      cancelBooking(booking.id);
      return;
    }
    setCurrentBooking(booking);
    setCancelReason("");
    setShowCancelModal(true);
  };

  const handleConfirmCancel = () => {
    if (window.confirm("Are you absolutely sure you want to cancel this session? This action cannot be undone.")) {
      cancelBooking(currentBooking.id, cancelReason);
      setShowCancelModal(false);
      setCurrentBooking(null);
    }
  };

  return (
    <div className="bg-[#FBFCFE] min-h-screen pb-32 font-sans selection:bg-blue-100 selection:text-blue-900">
      <AnimatePresence>
        {/* Modern Cancellation Modal */}
        {showCancelModal && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[100] flex items-center justify-center px-6"
          >
            <div className="absolute inset-0 bg-slate-900/40 backdrop-blur-xl" onClick={() => setShowCancelModal(false)} />
            <motion.div 
              initial={{ scale: 0.9, y: 20, opacity: 0 }}
              animate={{ scale: 1, y: 0, opacity: 1 }}
              exit={{ scale: 0.9, y: 20, opacity: 0 }}
              className="bg-white max-w-xl w-full p-10 rounded-[3rem] shadow-[0_32px_64px_-16px_rgba(0,0,0,0.2)] relative border border-white"
            >
              <div className="flex items-center gap-6 mb-10">
                <div className="w-16 h-16 rounded-3xl bg-rose-50 text-rose-600 flex items-center justify-center shadow-inner border border-rose-100/50">
                  <XCircle size={32} strokeWidth={1.5} />
                </div>
                <div>
                  <h2 className="text-3xl font-black text-slate-900 tracking-tight leading-none mb-2">Confirm Cancellation</h2>
                  <p className="text-sm text-slate-400 font-bold uppercase tracking-widest leading-none">Session with {currentBooking?.counsellor}</p>
                </div>
              </div>

              <div className="space-y-8">
                <div className="p-8 rounded-[2rem] bg-rose-50/50 border border-rose-100 relative overflow-hidden">
                  <div className="absolute top-0 right-0 p-4 opacity-10">
                    <Info size={120} />
                  </div>
                  <div className="relative z-10 flex gap-5">
                    <AlertCircle className="w-8 h-8 text-rose-600 shrink-0" />
                    <div className="space-y-3">
                      <h4 className="text-lg font-black text-rose-900 leading-none">Refund Evaluation</h4>
                      <p className="text-sm font-medium text-rose-700/80 leading-relaxed">
                        Per University Policy, cancellations made within 2 hours of the start time are not eligible for a refund. 
                        <strong> If this is an emergency, please contact the student wellness center after cancelling.</strong>
                      </p>
                    </div>
                  </div>
                </div>

                <div className="space-y-4">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest px-3 ml-1 border-l-2 border-slate-200">Objective Modification Reason</label>
                  <textarea 
                    value={cancelReason}
                    onChange={(e) => setCancelReason(e.target.value)}
                    placeholder="Briefly describe the reason for clinical coordination change..."
                    className="w-full bg-slate-50 border-2 border-transparent focus:border-rose-500/20 focus:bg-white text-slate-900 text-sm font-bold rounded-3xl block p-6 h-32 resize-none shadow-sm transition-all"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4 mt-12">
                <button 
                  onClick={() => setShowCancelModal(false)}
                  className="py-6 rounded-3xl bg-slate-50 text-slate-400 font-black uppercase tracking-widest text-[10px] hover:bg-slate-100 transition-all active:scale-95"
                >
                  Return to Dashboard
                </button>
                <button 
                  onClick={handleConfirmCancel}
                  className="py-6 rounded-3xl bg-rose-600 text-white font-black uppercase tracking-widest text-[10px] hover:bg-rose-700 transition-all shadow-xl shadow-rose-600/30 active:scale-95"
                >
                  Verify Cancellation
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Premium Hero Section */}
      <div className="bg-[#0F172A] relative pt-32 pb-32 overflow-hidden">
        {/* Animated Background Orbs */}
        <div className="absolute top-0 left-0 w-[800px] h-[800px] bg-blue-600/20 rounded-full blur-[160px] -ml-96 -mt-96 animate-pulse" />
        <div className="absolute bottom-0 right-0 w-[600px] h-[600px] bg-emerald-600/10 rounded-full blur-[140px] -mr-64 -mb-64" />
        
        <div className="max-w-7xl mx-auto px-6 lg:px-8 relative z-10">
          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-16">
            <motion.div 
              initial={{ x: -20, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              className="max-w-2xl space-y-8"
            >
              <div className="inline-flex items-center gap-3 px-4 py-2 rounded-2xl bg-white/5 border border-white/10 backdrop-blur-md">
                <ShieldCheck size={16} className="text-blue-400" />
                <span className="text-[10px] font-black text-white/60 uppercase tracking-[0.2em]">Clinical Portal Active</span>
              </div>
              
              <h1 className="text-6xl lg:text-8xl font-black text-white tracking-tighter leading-[0.9] italic">
                Wellness <span className="text-blue-500 not-italic">Vault.</span>
              </h1>
              
              <p className="text-xl text-slate-400 font-medium leading-relaxed max-w-lg">
                Your journey to mental clarity is tracked here. Access your clinical timeline, coordinate sessions, and review your path.
              </p>

              <div className="flex items-center gap-8 pt-4">
                <div className="flex -space-x-4">
                  {[1,2,3].map(i => (
                    <div key={i} className="w-12 h-12 rounded-2xl border-4 border-[#0F172A] bg-slate-800 overflow-hidden">
                      <img src={`https://i.pravatar.cc/100?u=${i*12}`} alt="User" />
                    </div>
                  ))}
                  <div className="w-12 h-12 rounded-2xl border-4 border-[#0F172A] bg-blue-600 flex items-center justify-center text-white text-[10px] font-black">+24</div>
                </div>
                <div className="h-10 w-px bg-white/10" />
                <p className="text-xs font-bold text-slate-500 uppercase tracking-widest">Joined by <span className="text-white">1,240 Students</span></p>
              </div>
            </motion.div>

            {/* Live Status Cards */}
            <motion.div 
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ delay: 0.2 }}
              className="grid grid-cols-2 gap-4 w-full lg:w-auto"
            >
              <MetricBox icon={<Activity className="text-emerald-400" />} label="Engagement" value="High" />
              <MetricBox icon={<CalendarIcon className="text-blue-400" />} label="Timeline" value={bookings.length} />
              <MetricBox icon={<Heart className="text-rose-400" />} label="Completed" value={bookings.filter(b => b.status === "Completed").length} />
              <MetricBox icon={<Stethoscope className="text-indigo-400" />} label="Experts" value="3" />
            </motion.div>
          </div>
        </div>
      </div>

      {/* Main Content Area */}
      <div className="max-w-7xl mx-auto px-6 lg:px-8 mt-[-64px] relative z-20">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">
          
          {/* Timeline Feed */}
          <div className="lg:col-span-8 space-y-12">
            <div className="bg-white p-10 rounded-[3rem] shadow-[0_12px_24px_-8px_rgba(0,0,0,0.05)] border border-slate-100">
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-8 mb-12 pb-8 border-b border-slate-50">
                <div className="flex items-center gap-5">
                  <div className="w-14 h-14 rounded-3xl bg-blue-600 text-white flex items-center justify-center shadow-xl shadow-blue-600/20">
                    <Clock size={28} />
                  </div>
                  <div>
                    <h2 className="text-2xl font-black text-slate-900 tracking-tight leading-none mb-1">Session Timeline</h2>
                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Chronological clinical tracking</p>
                  </div>
                </div>

                {/* Animated Pills Filter */}
                <div className="flex p-1.5 bg-slate-50 rounded-2xl border border-slate-100/50">
                  {["All", "Confirmed", "Pending", "Cancelled"].map(f => (
                    <button
                      key={f}
                      onClick={() => setFilter(f)}
                      className={`relative px-6 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${
                        filter === f ? "text-blue-600" : "text-slate-400 hover:text-slate-600"
                      }`}
                    >
                      {filter === f && (
                        <motion.div layoutId="pill-bg" className="absolute inset-0 bg-white rounded-xl shadow-sm border border-slate-100" />
                      )}
                      <span className="relative z-10">{f}</span>
                    </button>
                  ))}
                </div>
              </div>

              {filteredBookings.length === 0 ? (
                <motion.div 
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="text-center py-32 space-y-6"
                >
                  <div className="w-24 h-24 bg-slate-50 rounded-full flex items-center justify-center mx-auto text-slate-200">
                    <CalendarIcon size={48} strokeWidth={1} />
                  </div>
                  <div className="space-y-2">
                    <p className="text-xl font-black text-slate-900 leading-none">The vault is empty</p>
                    <p className="text-xs text-slate-400 font-medium uppercase tracking-widest">No matching coordination records found</p>
                  </div>
                  <Link to="/appointment" className="inline-flex items-center gap-2 text-blue-600 font-black uppercase tracking-widest text-[10px] hover:gap-3 transition-all pt-4">
                    Book Your Next Session <ArrowRight size={14} />
                  </Link>
                </motion.div>
              ) : (
                <div className="space-y-8">
                  {filteredBookings.map((app, idx) => (
                    <motion.div 
                      layout
                      initial={{ y: 20, opacity: 0 }}
                      animate={{ y: 0, opacity: 1 }}
                      transition={{ delay: idx * 0.05 }}
                      key={app.id}
                      className="group p-8 rounded-[2.5rem] bg-white border border-slate-100 hover:border-blue-200 hover:shadow-[0_24px_48px_-12px_rgba(0,0,0,0.06)] transition-all duration-500 relative"
                    >
                      <div className="flex flex-col md:flex-row gap-8 items-start">
                        <div className="relative shrink-0">
                          <img 
                            src={app.counsellorImage} 
                            alt={app.counsellor} 
                            className="w-28 h-28 rounded-3xl object-cover shadow-lg border-4 border-white" 
                          />
                          <div className={`absolute -bottom-1 -right-1 w-6 h-6 rounded-full border-4 border-white shadow-sm ${
                            app.status === "Confirmed" ? "bg-emerald-500" : "bg-blue-400"
                          }`} />
                        </div>

                        <div className="flex-grow space-y-5">
                          <div className="flex flex-col sm:flex-row justify-between items-start gap-4">
                            <div>
                              <h3 className="text-2xl font-black text-slate-900 tracking-tight group-hover:text-blue-600 transition-colors uppercase leading-none mb-2">{app.counsellor}</h3>
                              <p className="text-[10px] font-black text-blue-500 bg-blue-50/50 inline-block px-3 py-1 rounded-lg uppercase tracking-widest">{app.specialty || "Counselling Expert"}</p>
                            </div>
                            
                            <div className="flex flex-col items-end gap-2">
                              <StatusBadge status={app.status} refund={app.refundStatus} />
                              <div className="flex items-center gap-1.5 text-slate-400 font-black text-[9px] uppercase tracking-widest">
                                <Sparkles size={10} /> Certified Expertise
                              </div>
                            </div>
                          </div>

                          <div className="flex flex-wrap gap-3">
                            <MetaInfo icon={<CalendarIcon size={12} />} text={app.date} />
                            <MetaInfo icon={<Clock size={12} />} text={app.time} />
                            <MetaInfo icon={<Video size={12} />} text={app.type || "One-to-One"} />
                          </div>

                          <div className="pt-4 flex flex-wrap gap-4 border-t border-slate-50">
                            {app.status === "Confirmed" ? (
                              <button className="flex items-center gap-3 px-8 py-4 rounded-2xl bg-slate-900 text-white font-black text-[10px] uppercase tracking-widest hover:bg-blue-600 shadow-xl shadow-slate-900/10 transition-all active:scale-95">
                                <Video size={16} /> Enter Clinical Suite
                              </button>
                            ) : app.status === "Pending" ? (
                              <Link to="/appointment/payment" className="flex items-center gap-3 px-8 py-4 rounded-2xl bg-blue-600 text-white font-black text-[10px] uppercase tracking-widest hover:bg-blue-700 shadow-xl shadow-blue-600/20 transition-all active:scale-95">
                                Complete Final Enrollment
                              </Link>
                            ) : null}

                            {app.status !== "Cancelled" && (
                              <button 
                                onClick={() => handleOpenCancel(app)}
                                className="flex items-center gap-3 px-8 py-4 rounded-2xl bg-white border border-slate-100 text-slate-400 font-black text-[10px] uppercase tracking-widest hover:text-rose-600 hover:border-rose-100 transition-all active:scale-95"
                              >
                                <XCircle size={16} /> Opt-Out
                              </button>
                            )}
                          </div>
                        </div>
                      </div>
                    </motion.div>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Sidebar Insights */}
          <div className="lg:col-span-4 space-y-12">
            <div className="bg-white p-10 rounded-[3rem] shadow-sm border border-slate-100 space-y-10">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
                  <Heart size={24} />
                </div>
                <h3 className="text-xl font-black text-slate-900 tracking-tight leading-none">Wellness Hub</h3>
              </div>

              <div className="space-y-8">
                <HubItem icon={<Stethoscope size={18} />} title="Session Notes" desc="Clinical audit trails from your sessions." />
                <HubItem icon={<CalendarIcon size={18} />} title="Wellness History" desc="Historical coordination timeline." />
                <HubItem icon={<Sparkles size={18} />} title="Risk Assessment" desc="Automated wellness verification status." />
              </div>

              <button className="w-full py-5 rounded-3xl bg-slate-50 text-slate-400 hover:text-blue-600 hover:bg-blue-50 font-black uppercase tracking-widest text-[10px] transition-all">
                Access Medical Library
              </button>
            </div>

            <div className="bg-gradient-to-br from-blue-600 to-indigo-700 p-10 rounded-[3rem] text-white shadow-2xl shadow-blue-600/30 overflow-hidden relative group">
              <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full blur-3xl -mr-16 -mt-16 group-hover:scale-150 transition-transform duration-700" />
              <h3 className="text-2xl font-black tracking-tight leading-none mb-4 relative z-10 uppercase italic">Coordinate Next.</h3>
              <p className="text-white/60 text-sm font-bold mb-10 relative z-10 leading-relaxed uppercase tracking-widest">The path to wellness requires consistent clinical coordination.</p>
              <Link to="/appointment" className="w-full py-6 rounded-3xl bg-white text-blue-600 text-center block font-black uppercase tracking-widest text-[10px] shadow-xl hover:bg-slate-900 hover:text-white transition-all duration-500 active:scale-95">
                New Enrollment <ArrowRight className="inline-block ml-2 w-4 h-4" />
              </Link>
            </div>
          </div>

        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6 lg:px-8 mt-12">
        <FeedbackForm />
      </div>

    </div>
  );
};

const MetricBox = ({ icon, label, value }) => (
  <div className="bg-white/5 border border-white/10 p-6 rounded-3xl backdrop-blur-md hover:bg-white/10 transition-all duration-500">
    <div className="w-10 h-10 rounded-2xl bg-white/5 flex items-center justify-center mb-4 border border-white/10 shadow-inner">
      {icon}
    </div>
    <div className="space-y-1">
      <p className="text-3xl font-black text-white tracking-tighter leading-none italic">{value}</p>
      <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest leading-none">{label}</p>
    </div>
  </div>
);

const MetaInfo = ({ icon, text }) => (
  <div className="flex items-center gap-2 px-4 py-2 bg-slate-50 border border-slate-100 rounded-xl text-[10px] font-black text-slate-500 uppercase tracking-widest leading-none">
    <span className="text-blue-600">{icon}</span>
    {text}
  </div>
);

const HubItem = ({ icon, title, desc }) => (
  <div className="group cursor-pointer flex gap-5">
    <div className="shrink-0 w-10 p-2 text-slate-300 group-hover:text-blue-600 transition-colors">
      {icon}
    </div>
    <div className="space-y-1">
      <h4 className="text-sm font-black text-slate-900 group-hover:text-blue-600 transition-colors uppercase leading-none">{title}</h4>
      <p className="text-[10px] font-bold text-slate-400 leading-relaxed">{desc}</p>
    </div>
  </div>
);

const StatusBadge = ({ status, refund }) => {
  const isCancelled = status === "Cancelled";
  
  if (isCancelled) {
    return (
      <div className="flex flex-col items-end gap-1">
        <span className="px-4 py-1.5 rounded-lg bg-slate-50 text-slate-400 border border-slate-100 text-[10px] font-black uppercase tracking-widest">Cancelled</span>
        {refund !== "None" && (
          <span className={`px-2 py-0.5 rounded-md text-[8px] font-black uppercase tracking-widest ${
            refund === "Eligible" || refund === "Processing" ? "bg-emerald-50 text-emerald-600" : "bg-rose-50 text-rose-500"
          }`}>
             {refund === "Eligible" ? "Full Refund Eligible" : 
              refund === "Processing" ? "Refund In Progress" :
              refund === "Refunded" ? "Refund Verified" : "Non-Refundable"}
          </span>
        )}
      </div>
    );
  }

  return (
    <span className={`px-4 py-1.5 rounded-lg text-[10px] font-black uppercase tracking-widest shadow-sm ${
      status === "Confirmed" ? "bg-emerald-100 text-emerald-700" : "bg-blue-100 text-blue-700"
    }`}>
      {status}
    </span>
  );
};

export default StudentDashboard;

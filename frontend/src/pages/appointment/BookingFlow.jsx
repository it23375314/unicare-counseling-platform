import React, { useState, useMemo } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { useCounsellorContext } from "../../context/CounsellorContext";
import { useBooking } from "../../context/BookingContext";
import { 
  ArrowLeft, 
  ChevronRight, 
  Calendar as CalendarIcon, 
  Clock, 
  Shield, 
  User, 
  Stethoscope, 
  Brain, 
  Hourglass, 
  FileText,
  AlertCircle,
  CheckCircle2
} from "lucide-react";

const BookingFlow = () => {
  const navigate = useNavigate();
  const { id } = useParams();
  const { counsellors } = useCounsellorContext();
  const { addBooking, getAvailableSlots } = useBooking();

  // Form State (Sections A-G)
  const [studentName, setStudentName] = useState("");
  const [studentEmail, setStudentEmail] = useState("");
  const [selectedCounsellorId, setSelectedCounsellorId] = useState(id || "");
  const [sessionType, setSessionType] = useState("Individual");
  const [issueCategory, setIssueCategory] = useState("");
  const [selectedDate, setSelectedDate] = useState("");
  const [selectedTime, setSelectedTime] = useState("");
  const [duration, setDuration] = useState("60 mins");
  const [notes, setNotes] = useState("");
  
  const [error, setError] = useState("");
  const [showConfirmModal, setShowConfirmModal] = useState(false);

  const [isSubmitting, setIsSubmitting] = useState(false);

  const activeCounsellor = useMemo(() => 
    counsellors.find(c => c.id === selectedCounsellorId), 
    [counsellors, selectedCounsellorId]
  );

  // Form Validation Logic
  const isFormValid = useMemo(() => {
    return (
      studentName.trim().length > 0 &&
      selectedCounsellorId !== "" &&
      sessionType !== "" &&
      issueCategory !== "" &&
      selectedDate !== "" &&
      selectedTime !== "" &&
      duration !== ""
    );
  }, [studentName, selectedCounsellorId, sessionType, issueCategory, selectedDate, selectedTime, duration]);

  // Rule: Fixed time slots as requested
  const fixedSlots = ["09:00", "11:00", "13:00", "15:00"];

  const availableSlots = useMemo(() => {
    if (!selectedDate || !activeCounsellor) return [];
    const slots = getAvailableSlots(activeCounsellor.name, selectedDate, fixedSlots);
    return slots.map(s => ({
      ...s,
      // VERY NICE TOUCH: Detailed booked message
      reason: s.reason === "Already booked" ? `Reserved for ${activeCounsellor.name}` : s.reason
    }));
  }, [selectedDate, activeCounsellor, getAvailableSlots]);

  const handleContinue = () => {
    setShowConfirmModal(true);
  };

  const handleFinalConfirm = async () => {
    setIsSubmitting(true);
    const bookingData = {
      studentName,
      studentEmail,
      counsellor: activeCounsellor.name,
      counsellorImage: activeCounsellor.image,
      specialty: activeCounsellor.specialization,
      sessionType,
      issueCategory,
      date: selectedDate,
      time: selectedTime,
      duration,
      notes,
      price: activeCounsellor.price || 3000,
      status: "Pending",
      type: "Video Session"
    };

    try {
      const newBookingId = await addBooking(bookingData);
      navigate("/appointment/payment", {
        state: {
          bookingId: newBookingId,
          counsellor: activeCounsellor,
          studentName,
          studentEmail,
          date: selectedDate,
          time: selectedTime,
          price: activeCounsellor.price || 3000
        }
      });
    } catch (e) {
      setError(e.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleSavePending = async () => {
    setIsSubmitting(true);
    try {
      await addBooking({
        studentName,
        studentEmail,
        counsellor: activeCounsellor.name,
        counsellorImage: activeCounsellor.image,
        specialty: activeCounsellor.specialization,
        sessionType,
        issueCategory,
        date: selectedDate,
        time: selectedTime,
        duration,
        notes,
        price: activeCounsellor.price || 3000,
        status: "Pending",
        type: "Video Session"
      });
      navigate("/dashboard");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="bg-slate-50 min-h-screen pb-32 pt-24 font-sans">
      {/* Booking Confirmation Modal */}
      {showConfirmModal && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center px-6">
          <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-md" onClick={() => setShowConfirmModal(false)} />
          <div className="glass-card max-w-lg w-full p-10 rounded-[3rem] shadow-2xl relative animate-fade-in-up border border-white/20 bg-white/90">
             <div className="w-16 h-16 bg-blue-50 text-blue-600 rounded-2xl flex items-center justify-center mb-8 shadow-inner">
               <Shield size={32} />
             </div>
             <h2 className="text-3xl font-black text-slate-900 tracking-tight mb-4">Final Review</h2>
             <div className="space-y-4 mb-10 text-sm text-slate-600">
                <p><strong>Student:</strong> {studentName}</p>
                <p><strong>Expert:</strong> {activeCounsellor?.name}</p>
                <p><strong>Schedule:</strong> {selectedDate} at {selectedTime}</p>
                <p><strong>Category:</strong> {issueCategory} ({duration})</p>
             </div>
             
             <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
               <button 
                onClick={handleFinalConfirm} 
                disabled={isSubmitting}
                className="py-5 rounded-[2rem] bg-blue-600 text-white font-black uppercase tracking-widest text-xs hover:bg-blue-700 transition-all shadow-xl shadow-blue-600/30 flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-wait"
               >
                 {isSubmitting ? "Booking..." : "Pay Now"} {!isSubmitting && <ChevronRight size={16} />}
               </button>
               <button 
                onClick={handleSavePending} 
                disabled={isSubmitting}
                className="py-5 rounded-[2rem] bg-slate-100 text-slate-600 font-black uppercase tracking-widest text-xs hover:bg-slate-200 transition-all shadow-md disabled:opacity-50 disabled:cursor-wait"
               >
                 {isSubmitting ? "Booking..." : "Pay Later"}
               </button>
             </div>
             
             <button onClick={() => setShowConfirmModal(false)} className="w-full mt-6 text-[10px] font-black text-slate-400 uppercase tracking-widest hover:text-slate-600 transition-colors text-center">
               Back to Editing
             </button>
          </div>
        </div>
      )}

      <div className="max-w-4xl mx-auto px-6">
        <header className="mb-16 space-y-4 animate-fade-in">
          <button onClick={() => navigate("/appointment/counsellors")} className="flex items-center text-slate-400 hover:text-blue-600 font-bold text-xs uppercase tracking-widest transition-colors mb-4 group">
            <ArrowLeft className="w-4 h-4 mr-2 group-hover:-translate-x-1 transition-transform" /> Back to Experts
          </button>
          <h1 className="text-5xl font-black text-slate-900 tracking-tight leading-none italic">
            Session <span className="text-blue-600 not-italic">Intake Form.</span>
          </h1>
          <p className="text-slate-500 font-medium max-w-lg">Please provide your details and select a convenient time for your consultation.</p>
        </header>

        {error && (
          <div className="mb-10 p-6 bg-rose-50 border border-rose-100 rounded-3xl flex items-center gap-4 text-rose-700 animate-slide-up">
            <AlertCircle size={24} />
            <p className="font-black text-xs uppercase tracking-[0.1em]">{error}</p>
          </div>
        )}

        <div className="space-y-12">
          {/* Section A: Student Details */}
          <Section icon={<User />} title="A. Student Details">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mt-6">
              <FormGroup label="Full Name" required>
                <input 
                  type="text" 
                  value={studentName} 
                  onChange={(e) => setStudentName(e.target.value)} 
                  placeholder="Enter your registered name" 
                  className="w-full bg-slate-50 border-none text-slate-900 text-sm font-bold rounded-2xl focus:ring-2 focus:ring-blue-500 block p-4 shadow-inner mt-1" 
                />
              </FormGroup>
              <FormGroup label="Email (Optional)">
                <input 
                  type="email" 
                  value={studentEmail} 
                  onChange={(e) => setStudentEmail(e.target.value)} 
                  placeholder="example@unicare.edu" 
                  className="w-full bg-slate-50 border-none text-slate-900 text-sm font-bold rounded-2xl focus:ring-2 focus:ring-blue-500 block p-4 shadow-inner mt-1" 
                />
              </FormGroup>
            </div>
          </Section>

          {/* Section B: Counsellor Selection */}
          <Section icon={<Stethoscope />} title="B. Counsellor Selection">
            <div className="mt-6">
              <FormGroup label="Choose Your Expert" required>
                <select 
                  value={selectedCounsellorId} 
                  onChange={(e) => setSelectedCounsellorId(e.target.value)} 
                  className="w-full bg-slate-50 border-none text-slate-900 text-sm font-bold rounded-2xl focus:ring-2 focus:ring-blue-500 block p-4 shadow-inner mt-1 appearance-none cursor-pointer"
                >
                  <option value="">Select a counsellor...</option>
                  {counsellors.map(c => (
                    <option key={c.id} value={c.id}>{c.name} – {c.specialization} ({c.experience})</option>
                  ))}
                </select>
              </FormGroup>
            </div>
          </Section>

          {/* Section C: Session Details */}
          <Section icon={<Brain />} title="C. Session Details">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-10 mt-6">
              <FormGroup label="Session Type" required>
                <div className="flex gap-4 mt-1">
                  {["Individual", "Group"].map(type => (
                    <button
                      key={type}
                      onClick={() => setSessionType(type)}
                      className={`flex-1 py-4 rounded-2xl font-black text-xs uppercase tracking-widest border-2 transition-all ${
                        sessionType === type ? "bg-slate-900 text-white border-slate-900" : "bg-white text-slate-400 border-slate-100 hover:border-slate-300"
                      }`}
                    >
                      {type}
                    </button>
                  ))}
                </div>
              </FormGroup>

              <FormGroup label="Issue Category" required>
                <select 
                  value={issueCategory} 
                  onChange={(e) => setIssueCategory(e.target.value)} 
                  className="w-full bg-slate-50 border-none text-slate-900 text-sm font-bold rounded-2xl focus:ring-2 focus:ring-blue-500 block p-4 shadow-inner mt-1 appearance-none cursor-pointer"
                >
                  <option value="">Select a category...</option>
                  <option value="Anxiety">Anxiety</option>
                  <option value="Depression">Depression</option>
                  <option value="Academic Stress">Academic Stress</option>
                  <option value="Other">Other</option>
                </select>
              </FormGroup>
            </div>
          </Section>

          {/* Section D: Date Selection */}
          <Section icon={<CalendarIcon />} title="D. Date Selection">
            <div className="mt-6">
              <FormGroup label="Pick a Business Day (Future Only)" required>
                <input 
                  type="date" 
                  value={selectedDate} 
                  min={new Date().toISOString().split("T")[0]} 
                  onChange={(e) => {
                    setSelectedDate(e.target.value);
                    setSelectedTime("");
                  }} 
                  className="w-full bg-slate-50 border-none text-slate-900 text-sm font-bold rounded-2xl focus:ring-2 focus:ring-blue-500 block p-4 shadow-inner mt-1 cursor-pointer" 
                />
              </FormGroup>
            </div>
          </Section>

          {/* Section E: Time Slot Selection */}
          <Section icon={<Clock />} title="E. Time Slot Selection">
            <div className="mt-6">
              <FormGroup label="Available Times" required>
                {!selectedDate ? (
                  <div className="p-8 bg-slate-50 border border-dashed border-slate-200 rounded-3xl text-center mt-1">
                    <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">Select a date first to view slots</p>
                  </div>
                ) : (
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mt-1">
                    {availableSlots.map((slot, idx) => (
                      <button
                        key={idx}
                        disabled={slot.disabled}
                        onClick={() => setSelectedTime(slot.time)}
                        className={`py-5 rounded-2xl font-black text-xs transition-all border-2 ${
                          slot.disabled 
                            ? "bg-slate-50 border-slate-50 text-slate-200 cursor-not-allowed line-through" 
                            : selectedTime === slot.time
                              ? "bg-blue-600 text-white border-blue-600 shadow-xl shadow-blue-600/20"
                              : "bg-white border-slate-100 text-slate-600 hover:border-blue-400 hover:text-blue-600"
                        }`}
                      >
                        {slot.time}
                        {slot.disabled && <span className="block text-[8px] mt-1 opacity-60">{slot.reason}</span>}
                      </button>
                    ))}
                  </div>
                )}
              </FormGroup>
            </div>
          </Section>

          {/* Section F: Duration */}
          <Section icon={<Hourglass />} title="F. Duration">
            <div className="mt-6 flex flex-wrap gap-4">
              {["30 mins", "60 mins", "90 mins"].map(d => (
                <button
                  key={d}
                  onClick={() => setDuration(d)}
                  className={`px-8 py-5 rounded-3xl font-black text-xs uppercase tracking-widest border-2 transition-all ${
                    duration === d ? "bg-slate-900 text-white border-slate-900" : "bg-white text-slate-400 border-slate-100 hover:border-slate-300"
                  }`}
                >
                  {d}
                </button>
              ))}
            </div>
          </Section>

          {/* Section G: Additional Notes */}
          <Section icon={<FileText />} title="G. Additional Notes">
            <div className="mt-6">
              <FormGroup label="Context for your expert (Optional)">
                <textarea 
                  value={notes} 
                  onChange={(e) => setNotes(e.target.value)} 
                  rows={4} 
                  placeholder="Share any background or specific questions you'd like addressed..." 
                  className="w-full bg-slate-50 border-none text-slate-900 text-sm font-bold rounded-2xl focus:ring-2 focus:ring-blue-500 block p-4 shadow-inner mt-1 resize-none" 
                />
              </FormGroup>
            </div>
          </Section>

          {/* Booking Summary - VERY NICE TOUCH */}
          <div className={`transition-all duration-700 overflow-hidden ${isFormValid ? "max-h-[500px] opacity-100 mb-12" : "max-h-0 opacity-0 mb-0"}`}>
            <div className="bg-slate-900 text-white rounded-[3rem] p-10 shadow-2xl relative overflow-hidden group border border-white/10">
              <div className="absolute top-0 right-0 w-64 h-64 bg-blue-600/10 rounded-full blur-3xl -mr-32 -mt-32" />
              <h3 className="text-xl font-black mb-8 border-b border-white/5 pb-4 flex items-center gap-3 uppercase tracking-widest text-blue-400">
                <CheckCircle2 className="text-emerald-400" size={20} /> Booking Summary
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-x-12 gap-y-8">
                <SummaryItemLight label="Expert Professional" value={activeCounsellor?.name} />
                <SummaryItemLight label="Scheduled Date" value={selectedDate} />
                <SummaryItemLight label="Session Time" value={selectedTime} />
                <SummaryItemLight label="Duration" value={duration} />
                <SummaryItemLight label="Type" value={sessionType} />
                <SummaryItemLight label="Amount Due" value={`Rs. ${activeCounsellor?.price || 3000}`} highlight />
              </div>
            </div>
          </div>

          {/* Final Action */}
          <div className="pt-12 border-t border-slate-200 flex flex-col md:flex-row items-center justify-between gap-8">
            <div className="flex items-center gap-4 text-emerald-600 bg-emerald-50 px-6 py-4 rounded-3xl border border-emerald-100">
              <CheckCircle2 size={24} />
              <div className="text-left">
                <p className="text-[10px] font-black uppercase tracking-widest">Pricing Policy</p>
                <p className="text-sm font-bold">Rs. {activeCounsellor?.price || "3000"} per session</p>
              </div>
            </div>
            
            <button 
              onClick={handleContinue}
              disabled={!isFormValid || isSubmitting}
              className={`w-full md:w-auto px-16 py-6 rounded-[2rem] font-black uppercase tracking-[0.2em] text-sm transition-all shadow-2xl active:scale-95 flex items-center justify-center gap-3 ${
                isFormValid && !isSubmitting
                  ? "bg-blue-600 text-white hover:bg-blue-700 shadow-blue-600/30"
                  : "bg-slate-200 text-slate-400 cursor-not-allowed shadow-none"
              }`}
            >
              {isSubmitting ? (
                <>
                  <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  Booking...
                </>
              ) : "Finalize Intake"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

const SummaryItemLight = ({ label, value, highlight }) => (
  <div className="space-y-1">
    <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest">{label}</p>
    <p className={`text-sm font-bold tracking-wide ${highlight ? "text-blue-400 text-lg" : "text-white"}`}>{value}</p>
  </div>
);

// Helper Components
const Section = ({ icon, title, children }) => (
  <section className="glass-card p-10 rounded-[3rem] border border-white shadow-2xl shadow-blue-900/5 hover:shadow-blue-900/10 transition-shadow duration-700 relative overflow-hidden group bg-white/80 backdrop-blur-sm">
    <div className="absolute top-0 right-0 w-32 h-32 bg-blue-600/5 rounded-full blur-2xl -mr-16 -mt-16 group-hover:bg-blue-600/10 transition-colors" />
    <div className="flex items-center gap-4 mb-8">
      <div className="w-12 h-12 bg-slate-900 text-white rounded-2xl flex items-center justify-center shadow-xl">
        {icon}
      </div>
      <h3 className="text-2xl font-black text-slate-900 tracking-tight italic">{title}</h3>
    </div>
    {children}
  </section>
);

const FormGroup = ({ label, required, children }) => (
  <div className="flex flex-col">
    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest px-1">
      {label} {required && <span className="text-rose-500">*</span>}
    </label>
    {children}
  </div>
);

export default BookingFlow;

import { useState, useEffect, useMemo, useRef } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { 
  ArrowLeft, 
  ChevronRight, 
  ChevronLeft,
  Calendar as CalendarIcon, 
  Clock, 
  Shield, 
  User as UserIcon, 
  Mail,
  Stethoscope, 
  Brain, 
  Hourglass, 
  FileText,
  AlertCircle,
  CheckCircle2,
  Sparkles,
  Zap,
  Target,
  CreditCard,
  History,
  Star,
  Award,
  ShieldCheck,
  Activity,
  MessageSquare,
  HelpingHand
} from "lucide-react";
import { useCounsellorContext } from "../../context/CounsellorContext";
import { useBooking } from "../../context/BookingContext";
import { useAuth } from "../../context/AuthContext";
import { motion, AnimatePresence } from "framer-motion";

const BookingFlow = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { counsellors } = useCounsellorContext();
  const { addBooking, getAvailableSlots } = useBooking();
  const { user } = useAuth();

  const [currentStep, setCurrentStep] = useState(1);
  
  // Form State
  const [studentName, setStudentName] = useState(user?.name || "");
  const [studentEmail, setStudentEmail] = useState(user?.email || ""); // Contact email (Editable)
  const [emergencyContact, setEmergencyContact] = useState(""); // Safety info
  const [reasonDescription, setReasonDescription] = useState(""); // Clinical intake
  const [selectedCounsellorId, setSelectedCounsellorId] = useState(id || "");
  const [sessionType, setSessionType] = useState("Individual");
  const [issueCategory, setIssueCategory] = useState("");
  const [selectedDate, setSelectedDate] = useState("");
  const [selectedTime, setSelectedTime] = useState("");
  const [duration, setDuration] = useState("60 mins");
  const [notes, setNotes] = useState("");
  
  const [error, setError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (user) {
      if (!studentName) setStudentName(user.name || "");
      if (!studentEmail) setStudentEmail(user.email || "");
    }
  }, [user]);

  const activeCounsellor = useMemo(() => 
    counsellors.find(c => c.id === selectedCounsellorId), 
    [counsellors, selectedCounsellorId]
  );

  const isStep1Valid = studentName.trim().length > 0 && 
                      studentEmail.trim().length > 5 && 
                      studentEmail.includes("@") &&
                      selectedCounsellorId !== "";
  const isStep2Valid = sessionType !== "" && 
                      issueCategory !== "" && 
                      duration !== "" && 
                      reasonDescription.trim().length > 5;
  const isStep3Valid = selectedDate !== "" && selectedTime !== "";
  const isFormValid = isStep1Valid && isStep2Valid && isStep3Valid;

  const fixedSlots = ["09:00", "11:00", "13:00", "15:00"];
  const availableSlots = useMemo(() => {
    if (!selectedDate || !activeCounsellor) return [];
    return getAvailableSlots(activeCounsellor.name, selectedDate, fixedSlots);
  }, [selectedDate, activeCounsellor, getAvailableSlots]);

  const handleFinalConfirm = async (status = "Pending") => {
    setIsSubmitting(true);
    const isPaid = status === "Paid";
    const bookingData = {
      studentName,
      studentEmail, // Primarily used for OTP targeting
      emergencyContact,
      reasonDescription,
      counsellorId: selectedCounsellorId,
      counsellorName: activeCounsellor.name,
      counsellorImage: activeCounsellor.image,
      specialty: activeCounsellor.specialization,
      sessionType,
      issueCategory,
      date: selectedDate,
      time: selectedTime,
      duration,
      notes,
      price: activeCounsellor.price || 3000,
      status: isPaid ? "Confirmed" : "Pending",
      paymentStatus: isPaid ? "Paid" : "Unpaid",
      type: "Video Session"
    };

    try {
      const newBookingId = await addBooking(bookingData);
      if (status === "Pending") {
        navigate("/dashboard");
      } else {
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
      }
    } catch (e) {
      setError(e.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  const nextStep = () => setCurrentStep(prev => Math.min(prev + 1, 4));
  const prevStep = () => setCurrentStep(prev => Math.max(prev - 1, 1));

  return (
    <div className="min-h-screen bg-[#f1f5f9] pb-20 pt-10 px-4 lg:px-8">
      {/* Background Decor */}
      <div className="fixed top-0 left-0 w-full h-full pointer-events-none -z-10 overflow-hidden">
        <div className="absolute top-[-10%] right-[-10%] w-[500px] h-[500px] bg-indigo-600/5 rounded-full blur-[100px]" />
        <div className="absolute bottom-[-10%] left-[-10%] w-[500px] h-[500px] bg-emerald-600/5 rounded-full blur-[100px]" />
      </div>

      <div className="max-w-7xl mx-auto">
        <div className="flex flex-col lg:flex-row gap-8 items-start">
          
          {/* Main Wizard Area */}
          <div className="flex-1 w-full space-y-8">
            <header className="flex items-center justify-between">
              <div className="space-y-1">
                <h1 className="text-4xl font-black text-slate-900 tracking-tight italic">
                  Premium <span className="text-indigo-600 not-italic">Intake.</span>
                </h1>
                <p className="text-slate-400 font-bold uppercase text-[10px] tracking-widest flex items-center gap-2">
                  <ShieldCheck size={14} className="text-emerald-500" /> Direct Secure Registration
                </p>
              </div>
              <StepIndicator current={currentStep} />
            </header>

            <AnimatePresence mode="wait">
              <motion.div
                key={currentStep}
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className="glass-card bg-white rounded-[3rem] p-8 lg:p-12 shadow-2xl shadow-indigo-900/5 border border-white/50"
              >
                {currentStep === 1 && (
                  <div className="space-y-10">
                    <SectionLabel icon={<UserIcon />} title="Identity & Assignment" />
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                      <FormInput label="Full Name" value={studentName} onChange={setStudentName} placeholder="Enter your name" icon={<Sparkles size={14} />} />
                      <FormInput label="University Email (For OTP)" value={studentEmail} onChange={setStudentEmail} placeholder="yourname@university.com" icon={<Mail size={14} />} />
                    </div>

                    <div className="space-y-6">
                      <p className="text-[10px] font-black uppercase tracking-widest text-slate-400 flex items-center gap-2">
                        <Award size={14} className="text-indigo-600" /> Select Your Clinical Expert
                      </p>
                      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                        {counsellors.map(c => (
                          <ExpertCard 
                            key={c.id} 
                            expert={c} 
                            isSelected={selectedCounsellorId === c.id}
                            onClick={() => setSelectedCounsellorId(c.id)}
                          />
                        ))}
                      </div>
                    </div>
                  </div>
                )}

                {currentStep === 2 && (
                  <div className="space-y-10">
                    <SectionLabel icon={<FileText />} title="Medical Specification" />
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                      <div className="space-y-6">
                        <div className="space-y-4">
                          <label className="text-[10px] font-black uppercase tracking-widest text-slate-400">Consultation Category</label>
                          <div className="flex flex-wrap gap-2">
                            {["Anxiety", "Academic Stress", "Relationship", "Career", "Other"].map(cat => (
                              <Pill key={cat} active={issueCategory === cat} onClick={() => setIssueCategory(cat)} label={cat} />
                            ))}
                          </div>
                        </div>

                        <div className="space-y-4">
                          <label className="text-[10px] font-black uppercase tracking-widest text-slate-400">Session Mode</label>
                          <div className="grid grid-cols-2 gap-3">
                            <SelectCard active={sessionType === "Individual"} onClick={() => setSessionType("Individual")} label="Individual" icon={<UserIcon size={18} />} />
                            <SelectCard active={sessionType === "Group"} onClick={() => setSessionType("Group")} label="Group Session" icon={<Brain size={18} />} />
                          </div>
                        </div>
                      </div>

                      <div className="space-y-6">
                        <FormTextArea 
                          label="Clinical intake reason" 
                          value={reasonDescription} 
                          onChange={setReasonDescription} 
                          placeholder="Briefly describe what you'd like to discuss..." 
                        />
                        <FormInput 
                          label="Emergency Contact (Name + Relation)" 
                          value={emergencyContact} 
                          onChange={setEmergencyContact} 
                          placeholder="e.g. John Doe (Father)" 
                          icon={<AlertCircle size={14} />} 
                        />
                      </div>
                    </div>
                  </div>
                )}

                {/* Rest of the steps remain logically same but slightly refined UI */}
                {currentStep === 3 && (
                  <div className="space-y-10">
                    <SectionLabel icon={<CalendarIcon />} title="Temporal Coordination" />
                    
                    <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
                      <div className="lg:col-span-7">
                        <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 block mb-6">Select Appointment Window</label>
                        <input 
                          type="date" 
                          min={new Date().toISOString().split('T')[0]}
                          value={selectedDate}
                          onChange={(e) => setSelectedDate(e.target.value)}
                          className="w-full p-6 lg:p-8 bg-slate-50 border-none rounded-[2rem] text-xl font-black text-slate-900 shadow-inner focus:ring-4 focus:ring-indigo-500/10 mb-8"
                        />
                        <div className="p-6 bg-indigo-50 rounded-[2.5rem] border border-indigo-100 flex items-start gap-4">
                           <Target className="text-indigo-600 shrink-0 mt-1" size={20} />
                           <p className="text-xs font-bold text-indigo-900 leading-relaxed">
                             All time slots are synchronized in real-time. Secure your slot now to prevent concurrent booking conflicts.
                           </p>
                        </div>
                      </div>

                      <div className="lg:col-span-5 space-y-6">
                        <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 block mb-2">Available Slots</label>
                        {selectedDate ? (
                          <div className="grid grid-cols-2 gap-3">
                            {availableSlots.map(slot => (
                              <SlotButton 
                                key={slot.time}
                                time={slot.time}
                                active={selectedTime === slot.time}
                                disabled={slot.disabled}
                                onClick={() => setSelectedTime(slot.time)}
                              />
                            ))}
                          </div>
                        ) : (
                          <div className="h-48 flex items-center justify-center text-slate-300 font-black text-xs uppercase tracking-widest border-2 border-dashed border-slate-100 rounded-[2rem]">
                            Select Date First
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                )}

                {currentStep === 4 && (
                  <div className="space-y-10 text-center py-10">
                    <div className="w-24 h-24 bg-indigo-50 text-indigo-600 rounded-[3rem] flex items-center justify-center mx-auto shadow-inner mb-6">
                       <CheckCircle2 size={48} className="animate-pulse" />
                    </div>
                    <div className="space-y-4 max-w-sm mx-auto">
                      <h2 className="text-4xl font-black text-slate-900 tracking-tight italic">Confirm <span className="text-indigo-600 not-italic">Intake.</span></h2>
                      <p className="text-slate-400 font-bold text-sm">Review your clinical summary. Direct authorization will be initiated upon checkout confirmation.</p>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 max-w-2xl mx-auto pt-8">
                       <GatewayCard 
                        title="Secure Payment" 
                        desc="Direct Secure Authorize" 
                        icon={<CreditCard size={32} />} 
                        primary 
                        onClick={() => handleFinalConfirm("Paid")}
                        loading={isSubmitting}
                       />
                       <GatewayCard 
                        title="Book Now" 
                        desc="Pay at Counter" 
                        icon={<History size={32} />} 
                        onClick={() => handleFinalConfirm("Pending")}
                        loading={isSubmitting}
                       />
                    </div>
                  </div>
                )}

                {/* Footer Navigation */}
                {currentStep < 4 && (
                  <div className="mt-12 pt-8 border-t border-slate-100 flex justify-between items-center">
                    <button 
                      onClick={prevStep}
                      disabled={currentStep === 1}
                      className="px-6 py-4 lg:px-8 lg:py-5 flex items-center gap-3 text-[10px] font-black uppercase tracking-widest text-slate-400 hover:text-indigo-600 transition-all disabled:opacity-30 disabled:cursor-not-allowed group"
                    >
                      <ChevronLeft size={16} className="group-hover:-translate-x-1 transition-transform" /> Back
                    </button>
                    <button 
                      onClick={nextStep}
                      disabled={(currentStep === 1 && !isStep1Valid) || (currentStep === 2 && !isStep2Valid) || (currentStep === 3 && !isStep3Valid)}
                      className="px-8 py-4 lg:px-12 lg:py-5 bg-indigo-600 text-white rounded-[1.5rem] flex items-center gap-4 text-[10px] font-black uppercase tracking-widest shadow-xl shadow-indigo-600/30 hover:bg-black transition-all hover:scale-105 active:scale-95 disabled:opacity-50 disabled:grayscale disabled:cursor-not-allowed"
                    >
                      Advance <ChevronRight size={16} />
                    </button>
                  </div>
                )}
              </motion.div>
            </AnimatePresence>
          </div>

          {/* Dynamic Summary Sidebar */}
          <aside className="w-full lg:w-[400px] sticky top-10">
            <div className="glass-card bg-slate-900 rounded-[3.5rem] p-10 text-white shadow-2xl relative overflow-hidden">
               <div className="absolute top-0 right-0 w-32 h-32 bg-emerald-600/20 rounded-full blur-3xl -mr-16 -mt-16" />
               
               <header className="flex justify-between items-center mb-10 border-b border-white/5 pb-6">
                 <h2 className="text-xl font-black italic tracking-tight">Summary <span className="text-emerald-400 not-italic">Vault.</span></h2>
                 <Shield className="text-emerald-400" size={20} />
               </header>

               <div className="space-y-10">
                  {activeCounsellor ? (
                    <div className="flex items-center gap-6 p-4 bg-white/5 rounded-[2rem] border border-white/5">
                      <img src={activeCounsellor.image} className="w-16 h-16 rounded-[1.5rem] object-cover border-2 border-white/10" alt="" />
                      <div className="space-y-1">
                        <p className="text-lg font-black tracking-tight">{activeCounsellor.name}</p>
                        <p className="text-[9px] font-black text-emerald-400 uppercase tracking-widest">{activeCounsellor.specialization}</p>
                      </div>
                    </div>
                  ) : (
                    <div className="p-6 border-2 border-dashed border-white/5 rounded-[2rem] text-white/30 text-[10px] font-black uppercase tracking-widest">
                       Select Expert
                    </div>
                  )}

                  <div className="space-y-6">
                    <SummaryLine label="Student Name" value={studentName} />
                    <SummaryLine label="Contact Email" value={studentEmail} /> {/* Changed from Phone */}
                    <SummaryLine label="Schedule" value={selectedDate ? `${selectedDate} @ ${selectedTime || "??:??"}` : "Not Selected"} />
                    <SummaryLine label="Emergency" value={emergencyContact || "Required Step 2"} />
                  </div>

                  <div className="pt-10 border-t border-white/5 flex justify-between items-end">
                    <div className="space-y-1">
                       <p className="text-[10px] font-black text-white/40 uppercase tracking-widest">Total Payable</p>
                       <p className="text-5xl font-black text-white tracking-tighter italic leading-none">
                         Rs. {activeCounsellor ? Number(activeCounsellor.price) + 200 : "---"}
                       </p>
                    </div>
                    <div className="text-[9px] font-black text-emerald-400 animate-pulse uppercase tracking-[0.2em] mb-1">LIVE SECURE</div>
                  </div>
               </div>
            </div>
          </aside>
        </div>
      </div>
    </div>
  );
};

// UI Components
const StepIndicator = ({ current }) => (
  <div className="flex gap-2">
    {[1, 2, 3, 4].map(s => (
      <div 
        key={s} 
        className={`h-2 rounded-full transition-all duration-700 ${
          s === current ? "w-10 bg-indigo-600 shadow-lg shadow-indigo-600/30" : 
          s < current ? "w-6 bg-emerald-500" : "w-4 bg-slate-200"
        }`} 
      />
    ))}
  </div>
);

const SectionLabel = ({ icon, title }) => (
  <div className="flex items-center gap-4">
    <div className="w-12 h-12 bg-slate-50 text-indigo-600 rounded-2xl flex items-center justify-center shadow-inner">
      {icon}
    </div>
    <h3 className="text-2xl font-black text-slate-900 tracking-tight italic">{title}</h3>
  </div>
);

const ExpertCard = ({ expert, isSelected, onClick }) => (
  <motion.div 
    whileHover={{ scale: 1.02 }}
    whileTap={{ scale: 0.98 }}
    onClick={onClick}
    className={`p-5 rounded-[2.5rem] border-2 cursor-pointer transition-all relative overflow-hidden group ${
      isSelected ? "border-indigo-600 bg-indigo-600 text-white shadow-2xl shadow-indigo-600/30" : "border-slate-100 bg-slate-50 text-slate-900 hover:border-slate-200"
    }`}
  >
    <div className="absolute top-4 right-4 flex gap-1 items-center">
       <div className={`px-2 py-1 rounded-md text-[8px] font-black uppercase tracking-widest flex items-center gap-1 ${
         isSelected ? "bg-white/20 text-white" : "bg-indigo-50 text-indigo-600"
       }`}>
         <Star size={10} fill={isSelected ? "white" : "currentColor"} /> 4.9
       </div>
    </div>

    <div className="flex items-center gap-4 mb-4">
      <img src={expert.image} className="w-16 h-16 rounded-2xl object-cover border-2 border-white/20" alt="" />
      <div>
        <p className="text-sm font-black tracking-tight">{expert.name}</p>
        <p className={`text-[9px] font-black uppercase tracking-widest ${isSelected ? "text-indigo-200" : "text-indigo-600"}`}>
          {expert.specialization}
        </p>
      </div>
    </div>
  </motion.div>
);

const FormInput = ({ label, value, onChange, placeholder, icon }) => (
  <div className="space-y-3">
    <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 px-1">{label}</label>
    <div className="relative group">
      <div className="absolute left-6 top-1/2 -translate-y-1/2 text-slate-300 group-focus-within:text-indigo-600 transition-colors">
        {icon}
      </div>
      <input 
        type="text" 
        value={value} 
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className="w-full bg-slate-50 border-none rounded-3xl py-5 pl-14 pr-6 text-sm font-bold text-slate-900 placeholder:text-slate-300 focus:ring-4 focus:ring-indigo-600/10 transition-all shadow-inner"
      />
    </div>
  </div>
);

const FormTextArea = ({ label, value, onChange, placeholder }) => (
  <div className="space-y-3">
    <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 px-1">{label}</label>
    <textarea 
      value={value} 
      onChange={(e) => onChange(e.target.value)}
      placeholder={placeholder}
      rows="4"
      className="w-full bg-slate-50 border-none rounded-[2rem] p-6 text-sm font-bold text-slate-900 placeholder:text-slate-300 focus:ring-4 focus:ring-indigo-600/10 transition-all shadow-inner resize-none"
    />
  </div>
);

const Pill = ({ label, active, onClick }) => (
  <button 
    onClick={onClick}
    className={`px-6 py-3 rounded-2xl text-[10px] font-black uppercase tracking-widest transition-all ${
      active ? "bg-indigo-600 text-white shadow-lg" : "bg-slate-100 text-slate-400 hover:bg-slate-200"
    }`}
  >
    {label}
  </button>
);

const SelectCard = ({ label, active, onClick, icon }) => (
  <button 
    onClick={onClick}
    className={`flex items-center gap-4 p-5 rounded-[1.5rem] border-2 transition-all ${
      active ? "border-indigo-600 bg-indigo-50 text-indigo-600" : "border-slate-100 bg-white text-slate-400"
    }`}
  >
    <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${active ? "bg-indigo-600 text-white" : "bg-slate-50 text-slate-400"}`}>
      {icon}
    </div>
    <span className="text-[10px] font-black uppercase tracking-widest">{label}</span>
  </button>
);

const SlotButton = ({ time, active, disabled, onClick }) => (
  <button 
    disabled={disabled}
    onClick={onClick}
    className={`py-5 rounded-2xl text-[10px] font-black uppercase tracking-[0.2em] transition-all ${
      active ? "bg-indigo-600 text-white shadow-lg scale-105" : 
      disabled ? "bg-slate-50 text-slate-200 cursor-not-allowed italic" : 
      "bg-white border-2 border-slate-100 text-slate-900 hover:border-indigo-100"
    }`}
  >
    {time}
    <div className="mt-1 text-[8px] font-black opacity-40">
      {disabled ? "Occupied" : "Instant"}
    </div>
  </button>
);

const GatewayCard = ({ title, desc, icon, primary, onClick, loading }) => (
  <button 
    onClick={onClick}
    disabled={loading}
    className={`p-8 rounded-[3rem] text-left transition-all border-2 flex items-center gap-6 group scale-hover active:scale-95 ${
      primary ? "border-indigo-600 bg-indigo-50 shadow-xl shadow-indigo-900/5 hover:bg-indigo-100" : "border-slate-100 bg-white hover:border-emerald-200"
    }`}
  >
    <div className={`w-20 h-20 rounded-[2rem] flex items-center justify-center shrink-0 transition-transform group-hover:rotate-12 ${
      primary ? "bg-indigo-600 text-white" : "bg-emerald-50 text-emerald-600"
    }`}>
      {icon}
    </div>
    <div className="space-y-1">
      <p className="text-xl font-black text-slate-900 tracking-tight leading-none italic">{title}</p>
      <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{desc}</p>
    </div>
  </button>
);

const SummaryLine = ({ label, value }) => (
  <div className="space-y-1">
    <p className="text-[9px] font-black text-white/30 uppercase tracking-widest">{label}</p>
    <p className="text-sm font-black tracking-tight">{value || "---"}</p>
  </div>
);

export default BookingFlow;

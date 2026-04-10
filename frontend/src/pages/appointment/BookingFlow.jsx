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

import bookingBg from "../../assets/booking_flow_bg.png";

const BookingFlow = () => {
  const { counsellorId } = useParams();
  const navigate = useNavigate();
  const { counsellors } = useCounsellorContext();
  const { addBooking, getAvailableSlots } = useBooking();
  const { user } = useAuth();

  const [currentStep, setCurrentStep] = useState(1);
  
  // Form State
  const [studentName, setStudentName] = useState(user?.name || "");
  const [studentEmail, setStudentEmail] = useState(user?.email || ""); 
  const [emergencyContact, setEmergencyContact] = useState(""); 
  const [reasonDescription, setReasonDescription] = useState(""); 
  const [selectedCounsellorId, setSelectedCounsellorId] = useState(counsellorId || "");
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

  const availableSlots = useMemo(() => {
    if (!selectedDate || !activeCounsellor) return [];
    
    const counsellorDayAvailability = activeCounsellor.availability?.find(a => a.date === selectedDate);
    const slotsToFilter = counsellorDayAvailability ? counsellorDayAvailability.slots : [];
    
    if (slotsToFilter.length === 0) return [];
    
    return getAvailableSlots(activeCounsellor.name, selectedDate, slotsToFilter);
  }, [selectedDate, activeCounsellor, getAvailableSlots]);

  const handleFinalConfirm = async (status = "Pending") => {
    setIsSubmitting(true);
    const isPaid = status === "Paid";
    const bookingData = {
      studentName,
      studentEmail, 
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
    <div className="min-h-screen relative overflow-hidden bg-slate-900">
      {/* Immersive Background */}
      <div className="fixed inset-0 z-0">
        <img src={bookingBg} className="w-full h-full object-cover opacity-60 scale-105" alt="" />
        <div className="absolute inset-0 bg-gradient-to-br from-slate-900 via-slate-900/40 to-indigo-900/20 backdrop-blur-[2px]" />
      </div>

      {/* Dynamic Aura Glows */}
      <div className="fixed inset-0 z-1 pointer-events-none">
        <div className={`absolute top-1/4 left-1/4 w-96 h-96 rounded-full blur-[120px] transition-all duration-1000 ${
          currentStep === 1 ? "bg-emerald-500/20 scale-150" : 
          currentStep === 2 ? "bg-blue-500/20 scale-125" : 
          currentStep === 3 ? "bg-purple-500/20 scale-110" : "bg-indigo-500/20 scale-150"
        }`} />
      </div>

      <div className="relative z-10 max-w-7xl mx-auto px-6 lg:px-8 pt-32 pb-32">
        <div className="flex flex-col lg:flex-row gap-12 items-start">
          
          <div className="flex-1 w-full space-y-12">
            <header className="flex flex-col md:flex-row md:items-end justify-between gap-8">
              <div className="space-y-4 animate-fade-in-up">
                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/10 text-white text-[10px] font-black uppercase tracking-widest border border-white/20 backdrop-blur-md">
                   <Sparkles size={12} className="text-emerald-400" /> Medical Intake Vault
                </div>
                <h1 className="text-5xl lg:text-7xl font-black text-white tracking-tight leading-none italic">
                  Clinical <span className="text-emerald-400 not-italic">Intake.</span>
                </h1>
                <p className="text-slate-200 font-medium max-w-sm">
                  Your path to wellness starts here. Secure, private, and professionally guided.
                </p>
              </div>
              <StepIndicator current={currentStep} />
            </header>

            <AnimatePresence mode="wait">
              <motion.div
                key={currentStep}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                className="glass-card bg-white rounded-[3.5rem] p-8 lg:p-14 shadow-2xl border border-white relative overflow-hidden group"
              >
                {/* Internal Card Aura */}
                <div className={`absolute -top-24 -right-24 w-64 h-64 blur-[80px] opacity-10 transition-all duration-1000 ${
                  currentStep === 1 ? "bg-emerald-400" : 
                  currentStep === 2 ? "bg-blue-400" : 
                  currentStep === 3 ? "bg-purple-400" : "bg-indigo-400"
                }`} />

                {currentStep === 1 && (
                  <div className="space-y-12 relative z-10">
                    <SectionLabel icon={<UserIcon className="text-emerald-400" />} title="Identify Expert" />
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                      <FormInput label="Full Name" value={studentName} onChange={setStudentName} placeholder="Enter your name" icon={<Sparkles size={14} />} />
                      <FormInput label="Contact Email" value={studentEmail} onChange={setStudentEmail} placeholder="yourname@university.com" icon={<Mail size={14} />} />
                    </div>

                        <div className="space-y-4">
                          <label className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 px-2 flex items-center gap-2">
                             <Stethoscope size={14} className="text-emerald-400" /> Select Specialty Expert
                          </label>
                          <PremiumExpertSelect 
                            counsellors={counsellors} 
                            selectedId={selectedCounsellorId} 
                            onSelect={setSelectedCounsellorId} 
                          />
                        </div>

                       <div className="space-y-8">
                         <label className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 px-2 flex items-center gap-2">
                           <Award size={14} className="text-emerald-400" /> Professional Assignment Preview
                         </label>
                      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
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
                  <div className="space-y-12 relative z-10">
                    <SectionLabel icon={<FileText className="text-blue-400" />} title="Medical Specifications" />
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
                      <div className="space-y-8">
                        <div className="space-y-4">
                          <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 px-2">Focus Category</label>
                          <div className="flex flex-wrap gap-2">
                            {["Anxiety", "Academic", "Relationship", "Career", "Other"].map(cat => (
                              <Pill key={cat} active={issueCategory === cat} onClick={() => setIssueCategory(cat)} label={cat} />
                            ))}
                          </div>
                        </div>

                        <div className="space-y-4">
                          <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 px-2">Session Environment</label>
                          <div className="grid grid-cols-2 gap-3">
                            <SelectCard active={sessionType === "Individual"} onClick={() => setSessionType("Individual")} label="Individual" icon={<UserIcon size={18} />} />
                            <SelectCard active={sessionType === "Group"} onClick={() => setSessionType("Group")} label="Group Session" icon={<Brain size={18} />} />
                          </div>
                        </div>
                      </div>

                      <div className="space-y-8">
                        <FormTextArea 
                          label="Session Objectives" 
                          value={reasonDescription} 
                          onChange={setReasonDescription} 
                          placeholder="What would you like to achieve today?" 
                        />
                        <FormInput 
                          label="Safety Contact" 
                          value={emergencyContact} 
                          onChange={setEmergencyContact} 
                          placeholder="Name + Relation" 
                          icon={<AlertCircle size={14} />} 
                        />
                      </div>
                    </div>
                  </div>
                )}

                {currentStep === 3 && (
                  <div className="space-y-12 relative z-10">
                    <SectionLabel icon={<CalendarIcon className="text-purple-400" />} title="Timing Coordination" />
                    
                    <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">
                      <div className="lg:col-span-12 space-y-8">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-end">
                           <div className="space-y-4">
                              <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 px-2">Select Date</label>
                              <input 
                                type="date" 
                                min={new Date().toISOString().split('T')[0]}
                                value={selectedDate}
                                onChange={(e) => setSelectedDate(e.target.value)}
                                className="w-full p-6 bg-slate-50 border-none rounded-[2rem] text-xl font-black text-slate-900 shadow-inner focus:ring-4 focus:ring-purple-500/10"
                              />
                           </div>
                           <div className="p-6 bg-purple-50 rounded-[2.5rem] border border-purple-100 flex items-start gap-4 shadow-sm">
                              <Target className="text-purple-400 shrink-0 mt-1" size={20} />
                              <p className="text-[10px] font-bold text-slate-500 leading-relaxed uppercase tracking-widest">
                                Synchronization is active. All time slots are verified in real-time.
                              </p>
                           </div>
                        </div>

                        <div className="space-y-4 pt-4">
                          <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 px-2 block">Choose Available Time</label>
                          {selectedDate ? (
                            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                              {availableSlots.length > 0 ? (
                                availableSlots.map(slot => (
                                  <SlotButton 
                                    key={slot.time}
                                    time={slot.time}
                                    active={selectedTime === slot.time}
                                    disabled={slot.disabled}
                                    onClick={() => setSelectedTime(slot.time)}
                                  />
                                ))
                              ) : (
                                <div className="col-span-full p-12 bg-rose-50 rounded-[3rem] border border-dashed border-rose-200 text-center">
                                   <AlertCircle className="text-rose-300 mx-auto mb-4" size={40} />
                                   <p className="text-xs font-black uppercase tracking-widest text-rose-400">No slots available for this timeline</p>
                                </div>
                              )}
                            </div>
                          ) : (
                            <div className="h-32 flex items-center justify-center text-slate-200 font-black text-xs uppercase tracking-widest border-2 border-dashed border-slate-100 rounded-[2.5rem]">
                              Please select a date first
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {currentStep === 4 && (
                  <div className="space-y-12 text-center py-10 relative z-10">
                    <div className="w-28 h-28 bg-emerald-50 text-emerald-400 rounded-[3.5rem] flex items-center justify-center mx-auto shadow-xl border border-emerald-100 mb-10">
                       <CheckCircle2 size={56} className="animate-pulse" />
                    </div>
                    <div className="space-y-6 max-w-lg mx-auto mb-16">
                      <h2 className="text-5xl lg:text-7xl font-black text-slate-900 tracking-tight italic leading-none">Final <span className="text-emerald-400 not-italic">Vault.</span></h2>
                      <p className="text-slate-500 font-medium text-lg leading-relaxed">Review your clinical summary below. Once confirmed, your session will be locked and an OTP will be sent.</p>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-3xl mx-auto">
                       <GatewayCard 
                        title="Secure Payment" 
                        desc="Instant Authorization" 
                        icon={<CreditCard size={32} />} 
                        primary 
                        onClick={() => handleFinalConfirm("Paid")}
                        loading={isSubmitting}
                       />
                       <GatewayCard 
                        title="Book Now" 
                        desc="Pay at University Counter" 
                        icon={<History size={32} />} 
                        onClick={() => handleFinalConfirm("Pending")}
                        loading={isSubmitting}
                       />
                    </div>
                  </div>
                )}

                {/* Footer Navigation */}
                {currentStep < 4 && (
                  <div className="mt-20 pt-10 border-t border-slate-100 flex justify-between items-center relative z-10">
                    <button 
                      onClick={prevStep}
                      disabled={currentStep === 1}
                      className="px-10 py-5 flex items-center gap-3 text-[10px] font-black uppercase tracking-widest text-slate-400 hover:text-slate-900 transition-all disabled:opacity-0 disabled:pointer-events-none group"
                    >
                      <ChevronLeft size={16} className="group-hover:-translate-x-1 transition-transform" /> Back
                    </button>
                    <button 
                      onClick={nextStep}
                      disabled={(currentStep === 1 && !isStep1Valid) || (currentStep === 2 && !isStep2Valid) || (currentStep === 3 && !isStep3Valid)}
                      className="px-12 py-5 bg-slate-900 text-white rounded-[2rem] flex items-center gap-4 text-[10px] font-black uppercase tracking-widest shadow-2xl hover:bg-emerald-400 transition-all hover:scale-105 active:scale-95 disabled:opacity-20 disabled:grayscale disabled:cursor-not-allowed"
                    >
                      Next Step <ChevronRight size={16} />
                    </button>
                  </div>
                )}
              </motion.div>
            </AnimatePresence>
          </div>

          {/* Dynamic Summary Sidebar */}
          <aside className="w-full lg:w-[400px] sticky top-12">
            <div className="glass-card bg-slate-900 rounded-[3.5rem] p-10 text-white shadow-2xl relative overflow-hidden group">
               <div className="absolute top-0 right-0 w-32 h-32 bg-emerald-400/10 rounded-full blur-3xl -mr-16 -mt-16 group-hover:scale-125 transition-transform duration-700" />
               
               <header className="flex justify-between items-center mb-10 border-b border-white/10 pb-6">
                 <h2 className="text-xl font-black italic tracking-tight">Summary <span className="text-emerald-400 not-italic">Vault.</span></h2>
                 <Shield className="text-emerald-400" size={20} />
               </header>

               <div className="space-y-10">
                  {activeCounsellor ? (
                    <div className="flex items-center gap-6 p-5 bg-white/5 rounded-[2.5rem] border border-white/10 shadow-inner group/expert">
                      <img src={activeCounsellor.image} className="w-16 h-16 rounded-2xl object-cover border-2 border-white/10 group-hover/expert:rotate-3 transition-transform" alt="" />
                      <div className="space-y-1">
                        <p className="text-lg font-black tracking-tight">{activeCounsellor.name}</p>
                        <p className="text-[9px] font-black text-emerald-400 uppercase tracking-widest leading-none">{activeCounsellor.specialization}</p>
                      </div>
                    </div>
                  ) : (
                    <div className="p-10 border-2 border-dashed border-white/10 rounded-[2.5rem] text-white/20 text-[10px] font-black uppercase tracking-widest text-center">
                       Expert Not Assigned
                    </div>
                  )}

                  <div className="space-y-8">
                    <SummaryLine label="Identity" value={studentName} />
                    <SummaryLine label="Channel" value={studentEmail} />
                    <SummaryLine label="Temporal Coordination" value={selectedDate ? `${selectedDate} @ ${selectedTime || "Pending Time"}` : "Waiting for date..."} />
                    <SummaryLine label="Safety Protocol" value={emergencyContact || "Required Step 2"} />
                  </div>

                  <div className="pt-10 border-t border-white/10 flex justify-between items-end">
                    <div className="space-y-1">
                       <p className="text-[10px] font-black text-white/30 uppercase tracking-widest">Total Valuation</p>
                       <p className="text-5xl font-black text-white tracking-tighter italic leading-none">
                         Rs. {activeCounsellor ? Number(activeCounsellor.price) + 200 : "---"}
                       </p>
                    </div>
                    <div className="text-[9px] font-black text-emerald-400 animate-pulse uppercase tracking-[0.2em] mb-1">SECURE</div>
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
          s === current ? "w-12 bg-emerald-400 shadow-lg shadow-emerald-400/20" : 
          s < current ? "w-8 bg-emerald-500/50 shadow-lg" : "w-6 bg-white/20"
        }`} 
      />
    ))}
  </div>
);

const SectionLabel = ({ icon, title }) => (
  <div className="flex items-center gap-5">
    <div className="w-14 h-14 bg-slate-50 text-slate-900 rounded-[1.5rem] flex items-center justify-center shadow-inner border border-slate-100">
      {icon}
    </div>
    <h3 className="text-3xl font-black text-slate-900 tracking-tight italic">{title}</h3>
  </div>
);

const ExpertCard = ({ expert, isSelected, onClick }) => (
  <motion.div 
    whileHover={{ scale: 1.02 }}
    whileTap={{ scale: 0.98 }}
    onClick={onClick}
    className={`p-5 rounded-[2.5rem] border-2 cursor-pointer transition-all relative overflow-hidden group ${
      isSelected ? "border-emerald-400 bg-emerald-50 text-emerald-900 shadow-xl shadow-emerald-400/10" : "border-slate-100 bg-slate-50 text-slate-600 hover:border-slate-200"
    }`}
  >
    <div className="absolute top-4 right-4 flex gap-1 items-center">
       <div className={`px-2 py-1 rounded-md text-[8px] font-black uppercase tracking-widest flex items-center gap-1 ${
         isSelected ? "bg-emerald-400 text-white" : "bg-slate-200 text-slate-500"
       }`}>
         <Star size={10} fill={isSelected ? "currentColor" : "none"} /> 4.9
       </div>
    </div>

    <div className="flex items-center gap-4">
      <img src={expert.image} className="w-16 h-16 rounded-2xl object-cover border-2 border-white/20 group-hover:rotate-2 transition-transform" alt="" />
      <div>
        <p className="text-sm font-black tracking-tight">{expert.name}</p>
        <p className={`text-[9px] font-black uppercase tracking-widest ${isSelected ? "text-slate-900/40" : "text-emerald-600"}`}>
          {expert.specialization}
        </p>
      </div>
    </div>
  </motion.div>
);

const FormInput = ({ label, value, onChange, placeholder, icon }) => (
  <div className="space-y-4">
    <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 px-2">{label}</label>
    <div className="relative group">
      <div className="absolute left-6 top-1/2 -translate-y-1/2 text-slate-300 group-focus-within:text-emerald-400 transition-colors">
        {icon}
      </div>
      <input 
        type="text" 
        value={value} 
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className="w-full bg-slate-50 border border-slate-100 rounded-[2rem] py-6 pl-14 pr-8 text-sm font-bold text-slate-900 placeholder:text-slate-200 focus:ring-4 focus:ring-emerald-400/10 transition-all shadow-inner"
      />
    </div>
  </div>
);

const FormTextArea = ({ label, value, onChange, placeholder }) => (
  <div className="space-y-4">
    <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 px-2">{label}</label>
    <textarea 
      value={value} 
      onChange={(e) => onChange(e.target.value)}
      placeholder={placeholder}
      rows="4"
      className="w-full bg-slate-50 border border-slate-100 rounded-[2.5rem] p-8 text-sm font-bold text-slate-900 placeholder:text-slate-200 focus:ring-4 focus:ring-emerald-400/10 transition-all shadow-inner resize-none"
    />
  </div>
);

const Pill = ({ label, active, onClick }) => (
  <button 
    onClick={onClick}
    className={`px-8 py-4 rounded-2xl text-[10px] font-black uppercase tracking-widest transition-all ${
      active ? "bg-slate-900 text-white shadow-xl scale-105" : "bg-slate-50 text-slate-400 hover:bg-slate-100 border border-slate-100"
    }`}
  >
    {label}
  </button>
);

const SelectCard = ({ label, active, onClick, icon }) => (
  <button 
    onClick={onClick}
    className={`flex items-center gap-5 p-6 rounded-[2rem] border-2 transition-all group ${
      active ? "border-slate-900 bg-slate-900 text-white shadow-xl" : "border-slate-100 bg-slate-50 text-slate-400 hover:border-slate-200"
    }`}
  >
    <div className={`w-12 h-12 rounded-2xl flex items-center justify-center transition-all ${active ? "bg-emerald-400 text-slate-900" : "bg-white text-slate-200 group-hover:bg-white"}`}>
      {icon}
    </div>
    <span className="text-[10px] font-black uppercase tracking-widest">{label}</span>
  </button>
);

const SlotButton = ({ time, active, disabled, onClick }) => (
  <button 
    disabled={disabled}
    onClick={onClick}
    className={`py-6 rounded-3xl text-[11px] font-black uppercase tracking-[0.2em] transition-all border ${
      active ? "bg-slate-900 text-white border-slate-900 shadow-2xl scale-105" : 
      disabled ? "bg-slate-50 text-slate-200 border-slate-100 cursor-not-allowed italic" : 
      "bg-white border-slate-100 text-slate-600 hover:border-emerald-400 hover:text-emerald-600 shadow-sm"
    }`}
  >
    {time}
  </button>
);

const GatewayCard = ({ title, desc, icon, primary, onClick, loading }) => (
  <button 
    onClick={onClick}
    disabled={loading}
    className={`p-10 rounded-[3.5rem] text-left transition-all border-2 flex items-center gap-8 group scale-hover active:scale-95 relative overflow-hidden ${
      primary ? "border-emerald-400 bg-emerald-50 shadow-xl shadow-emerald-400/5 hover:bg-emerald-100" : "border-slate-100 bg-white hover:border-slate-200"
    }`}
  >
    <div className={`w-24 h-24 rounded-[2.5rem] flex items-center justify-center shrink-0 transition-all group-hover:shadow-lg ${
      primary ? "bg-emerald-400 text-white shadow-emerald-400/20" : "bg-slate-50 text-slate-400"
    }`}>
      {icon}
    </div>
    <div className="space-y-2 relative z-10">
      <p className="text-2xl font-black text-slate-900 tracking-tight leading-none italic">{title}</p>
      <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{desc}</p>
    </div>
  </button>
);

const SummaryLine = ({ label, value }) => (
  <div className="space-y-2">
    <p className="text-[9px] font-black text-white/20 uppercase tracking-widest px-1">{label}</p>
    <p className="text-sm font-black tracking-tight text-white/90">{value || "Pending Protocol..."}</p>
  </div>
);

const PremiumExpertSelect = ({ counsellors, selectedId, onSelect }) => {
  const [isOpen, setIsOpen] = useState(false);
  const selectedCounsellor = counsellors.find(c => c.id === selectedId);

  return (
    <div className="relative z-50">
      <button
        type="button"
        id="counsellor-dropdown-trigger"
        onClick={() => setIsOpen(!isOpen)}
        className="w-full bg-slate-50 border border-slate-100 rounded-[2rem] py-4 px-6 flex items-center justify-between text-sm font-bold text-slate-900 shadow-inner hover:bg-white transition-all focus:ring-4 focus:ring-emerald-400/10"
      >
        <div className="flex items-center gap-4">
          {selectedCounsellor ? (
            <>
              <img src={selectedCounsellor.image} className="w-12 h-12 rounded-xl object-cover border-2 border-white shadow-sm" alt="" />
              <div className="text-left">
                <p className="text-sm font-black tracking-tight">{selectedCounsellor.name}</p>
                <p className="text-[10px] font-black text-emerald-500 uppercase tracking-widest">{selectedCounsellor.specialization}</p>
              </div>
            </>
          ) : (
            <span className="text-slate-300">Choose your wellness expert...</span>
          )}
        </div>
        <ChevronRight className={`transition-transform duration-500 text-slate-300 ${isOpen ? "rotate-[-90deg]" : "rotate-90"}`} size={20} />
      </button>

      <AnimatePresence>
        {isOpen && (
          <>
            <div className="fixed inset-0 z-[60]" onClick={() => setIsOpen(false)} />
            <motion.div
              initial={{ opacity: 0, y: 10, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 10, scale: 0.95 }}
              className="absolute top-full left-0 right-0 mt-4 bg-white rounded-[2.5rem] shadow-[0_32px_64px_-16px_rgba(0,0,0,0.15)] border border-slate-100 overflow-hidden z-[70] p-3 space-y-1"
            >
              {counsellors.map(c => (
                <button
                  key={c.id}
                  id={`counsellor-option-${c.id}`}
                  onClick={() => {
                    onSelect(c.id);
                    setIsOpen(false);
                  }}
                  className={`w-full p-4 rounded-2xl flex items-center gap-4 hover:bg-slate-50 transition-all group ${selectedId === c.id ? "bg-emerald-50 border border-emerald-100" : "border border-transparent"}`}
                >
                  <img src={c.image} className="w-14 h-14 rounded-xl object-cover shadow-sm group-hover:scale-105 transition-transform" alt="" />
                  <div className="text-left">
                    <p className={`text-sm font-black tracking-tight ${selectedId === c.id ? "text-emerald-900" : "text-slate-900"}`}>{c.name}</p>
                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{c.specialization}</p>
                  </div>
                  {selectedId === c.id && <CheckCircle2 className="ml-auto text-emerald-500" size={18} />}
                </button>
              ))}
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
};

export default BookingFlow;

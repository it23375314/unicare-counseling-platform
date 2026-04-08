import { useState, useEffect, useRef } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { CreditCard, CheckCircle, ShieldCheck, ArrowLeft, Download, ExternalLink, Receipt, Lock, ChevronRight, CheckCircle2, Phone, Sparkles, Mail, RefreshCw, Loader2, AlertCircle, Clock } from "lucide-react";
import { useBooking } from "../../context/BookingContext";
import { motion, AnimatePresence } from "framer-motion";

const Payment = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { confirmPayment } = useBooking();
  const [isProcessing, setIsProcessing] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  
  const { bookingId, counsellor, studentName, studentEmail, date, time, price } = location.state || {};

  // Form states
  const [cardName, setCardName] = useState(studentName || "");
  const [cardNumber, setCardNumber] = useState("");
  const [expiry, setExpiry] = useState("");
  const [cvc, setCvc] = useState("");
  const [formErrors, setFormErrors] = useState({});

  const validateForm = () => {
    const errors = {};
    if (cardName.trim().length < 3) errors.cardName = "Enter full name";
    const cleanCard = cardNumber.replace(/\s+/g, "");
    if (!/^\d{16}$/.test(cleanCard)) errors.cardNumber = "Invalid card number (16 digits)";
    if (!/^\d{2}\/\d{2}$/.test(expiry)) {
      errors.expiry = "Use MM/YY format";
    } else {
      const [m, y] = expiry.split("/").map(Number);
      const now = new Date();
      const expDate = new Date(2000 + y, m - 1);
      if (expDate < now) errors.expiry = "Card has expired";
      if (m < 1 || m > 12) errors.expiry = "Invalid month";
    }
    if (!/^\d{3,4}$/.test(cvc)) errors.cvc = "Invalid CVC";
    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handlePayment = async (e) => {
    e.preventDefault();
    if (!validateForm()) return;
    
    setIsProcessing(true);
    try {
      await confirmPayment(bookingId);
      setTimeout(() => {
        setIsSuccess(true);
        setIsProcessing(false);
      }, 1500);
    } catch (err) {
      alert("Authorization failed. Please contact your issuer.");
      setIsProcessing(false);
    }
  };

  if (!counsellor || !bookingId) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[70vh] text-center space-y-6 px-6">
        <Receipt size={48} className="text-slate-300 animate-bounce" />
        <h2 className="text-3xl font-black text-slate-900 tracking-tight">Checkout expired.</h2>
        <button onClick={() => navigate("/appointment/counsellors")} className="btn-primary">Return to Directory</button>
      </div>
    );
  }

  if (isSuccess) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-[#f8fafc] px-6 py-20 relative overflow-hidden">
        <div className="absolute top-[-10%] right-[-10%] w-[500px] h-[500px] bg-emerald-400/10 rounded-full blur-[120px]" />
        <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} className="max-w-2xl w-full">
          <div className="bg-white rounded-[4rem] shadow-2xl p-10 lg:p-14 text-center border border-emerald-100/50 relative overflow-hidden">
            <div className="absolute top-0 left-0 w-full h-3 bg-gradient-to-r from-emerald-400 to-teal-500" />
            <div className="w-28 h-28 bg-emerald-50 text-emerald-500 rounded-[3rem] flex items-center justify-center mx-auto shadow-inner relative border border-emerald-100">
               <CheckCircle2 size={56} className="animate-pulse" />
               <div className="absolute -top-2 -right-2 bg-emerald-500 text-white p-2 rounded-full shadow-lg"><Sparkles size={16} /></div>
            </div>
            <h1 className="text-4xl lg:text-5xl font-black text-slate-900 tracking-tight mt-10 italic">Payment <span className="text-emerald-500 not-italic">Authorized.</span></h1>
            <p className="text-slate-500 font-bold mt-4 text-sm">Thank you, {studentName}. your session is now confirmed.</p>
            
            <div className="glass-card p-10 rounded-[3rem] bg-slate-50/50 border border-slate-100 text-left space-y-8 mt-12">
               <div className="flex justify-between items-center pb-6 border-b border-slate-200/50">
                  <div>
                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Transaction ID</p>
                    <p className="text-xs font-mono font-black text-slate-900 mt-1">#UNI-{bookingId.substring(0, 10).toUpperCase()}</p>
                  </div>
                  <ShieldCheck className="text-emerald-500 opacity-20" size={32} />
               </div>
               <div className="grid grid-cols-2 gap-10">
                  <SummaryItem label="Expert" value={counsellor.name} />
                  <SummaryItem label="Schedule" value={`${date} @ ${time}`} />
                  <SummaryItem label="Contact Email" value={studentEmail} />
                  <SummaryItem label="Total Paid" value={`Rs. ${Number(price) + 200}`} />
               </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 pt-10">
               <button onClick={() => navigate("/dashboard")} className="bg-slate-900 text-white px-8 py-5 rounded-[2rem] font-black uppercase tracking-widest text-[10px] hover:bg-black transition-all shadow-xl hover:scale-105 active:scale-95">Enter Portal <ChevronRight size={18} className="inline ml-2" /></button>
               <button className="bg-white border-2 border-slate-100 text-slate-400 px-8 py-5 rounded-[2rem] font-black uppercase tracking-widest text-[10px] hover:border-slate-300 flex items-center justify-center gap-2"><Download size={18} /> Receipt</button>
            </div>
          </div>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="bg-[#f8fafc] min-h-screen pb-32 pt-32 overflow-hidden relative">
      <div className="absolute top-0 left-0 w-full h-full pointer-events-none -z-10">
        <div className="absolute top-[-10%] right-[-10%] w-[500px] h-[500px] bg-blue-400/5 rounded-full blur-[120px]" />
        <div className="absolute bottom-[-10%] left-[-10%] w-[500px] h-[500px] bg-indigo-400/5 rounded-full blur-[120px]" />
      </div>

      <div className="max-w-7xl mx-auto px-6 lg:px-12 relative">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-20">
          <div className="lg:col-span-12 xl:col-span-7 space-y-16">
            <header className="space-y-4">
              <button onClick={() => navigate(-1)} className="flex items-center text-slate-400 hover:text-blue-600 font-black text-[10px] uppercase tracking-widest transition-all group">
                <ArrowLeft className="w-4 h-4 mr-2 group-hover:-translate-x-1" /> Return to directory
              </button>
              <h1 className="text-5xl lg:text-7xl font-black text-slate-900 tracking-tighter italic">Secure <span className="text-blue-600 not-italic">Vault.</span></h1>
            </header>

            <main className="glass-card bg-white p-8 lg:p-12 rounded-[3.5rem] shadow-xl border border-slate-100">
               <form onSubmit={handlePayment} className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  <InputField label="Cardholder Name" placeholder="AS APPEARS ON CARD" value={cardName} error={formErrors.cardName} onChange={e => setCardName(e.target.value)} />
                  <InputField label="Card Number" placeholder="•••• •••• •••• ••••" maxLength="19" value={cardNumber} error={formErrors.cardNumber} onChange={e => setCardNumber(e.target.value.replace(/\D/g, '').replace(/(.{4})/g, '$1 ').trim())} />
                  <InputField label="Expiration Date" placeholder="MM/YY" maxLength="5" value={expiry} error={formErrors.expiry} onChange={e => {
                    let val = e.target.value.replace(/\D/g, '');
                    if (val.length > 2) val = val.substring(0, 2) + '/' + val.substring(2);
                    setExpiry(val);
                  }} />
                  <InputField label="Security Code" placeholder="CVC" maxLength="4" value={cvc} error={formErrors.cvc} onChange={e => setCvc(e.target.value.replace(/\D/g, ''))} />
                  
                  <div className="md:col-span-2 pt-6">
                    <button type="submit" disabled={isProcessing} className={`w-full py-6 rounded-[2.5rem] font-black uppercase tracking-[0.2em] text-[11px] transition-all shadow-2xl flex justify-center items-center gap-4 ${isProcessing ? "bg-slate-200 text-slate-400 cursor-wait" : "bg-blue-600 text-white hover:bg-black shadow-blue-600/20 hover:scale-102"}`}>
                      {isProcessing ? <Loader2 className="animate-spin" /> : <>Execute Payment • Rs. {Number(price) + 200}</>}
                    </button>
                  </div>
               </form>
            </main>
          </div>

          <aside className="lg:col-span-12 xl:col-span-5">
            <div className="glass-card p-10 rounded-[3.5rem] sticky top-32 border border-slate-100 shadow-2xl shadow-blue-900/5 space-y-10 bg-white">
              <div className="flex items-center justify-between border-b border-slate-100 pb-8"><h3 className="text-[10px] font-black text-slate-400 uppercase tracking-widest italic">Order Breakdown</h3><CheckCircle2 size={24} className="text-emerald-500" /></div>
              <div className="flex items-center gap-6 p-6 bg-slate-50/50 rounded-[2.5rem] border border-slate-100">
                 <img src={counsellor.image} alt="" className="w-20 h-20 rounded-3xl object-cover shadow-lg border-2 border-white" />
                 <div><p className="text-xl font-black text-slate-900 tracking-tight">{counsellor.name}</p><p className="text-[10px] font-bold text-blue-600 uppercase tracking-widest">{counsellor.specialization || "Expert Consultant"}</p></div>
              </div>
              <div className="space-y-5 px-4 font-black">
                 <div className="flex justify-between items-center text-xs text-slate-400 uppercase tracking-widest text-[9px]"><span>Date</span><span className="text-slate-900">{date}</span></div>
                 <div className="flex justify-between items-center text-xs text-slate-400 uppercase tracking-widest text-[9px]"><span>Time Window</span><span className="text-slate-900">{time}</span></div>
                 <div className="flex justify-between items-center text-xs text-slate-400 uppercase tracking-widest text-[9px]"><span>Access Fee</span><span className="text-slate-900">Rs. 200</span></div>
              </div>
              <div className="pt-10 border-t border-slate-100 flex justify-between items-end px-4">
                 <div className="space-y-1"><span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Net Payable</span><p className="text-5xl font-black text-slate-900 tracking-tighter italic leading-none">Rs. {Number(price) + 200}</p></div>
              </div>
            </div>
          </aside>
        </div>
      </div>
    </div>
  );
};

const InputField = ({ label, error, ...props }) => (
  <div className="space-y-3">
    <div className="flex justify-between px-1">
      <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest">{label}</label>
      {error && <span className="text-[8px] font-black text-rose-500 uppercase italic">{error}</span>}
    </div>
    <input {...props} required className={`w-full bg-slate-50 border-none text-sm font-bold rounded-[1.8rem] p-5 shadow-inner transition-all focus:ring-4 ${error ? "ring-rose-500/20 text-rose-600" : "focus:ring-blue-500/10 text-slate-900"}`} />
  </div>
);

const SummaryItem = ({ label, value }) => (
  <div className="space-y-1"><p className="text-[9px] font-black text-slate-400 uppercase tracking-widest">{label}</p><p className="text-sm font-black text-slate-900 truncate">{value}</p></div>
);

export default Payment;

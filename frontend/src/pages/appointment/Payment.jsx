import { useState, useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { CreditCard, CheckCircle, ShieldCheck, ArrowLeft, Download, ExternalLink, Receipt, Lock, ChevronRight, CheckCircle2 } from "lucide-react";
import { useBooking } from "../../context/BookingContext";

const Payment = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { confirmPayment } = useBooking();
  const [isProcessing, setIsProcessing] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [showOTP, setShowOTP] = useState(false);
  const [otp, setOtp] = useState("");
  const [otpError, setOtpError] = useState("");
  
  const { bookingId, counsellor, studentName, studentEmail, date, time, price } = location.state || {};
  
  // Form states for the visual card
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
    
    if (!/^\d{3,4}$/.test(cvc)) errors.cvc = "Invalid CVC (3-4 digits)";

    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  useEffect(() => {
    window.scrollTo(0, 0);
  }, [isSuccess]);

  if (!counsellor || !bookingId) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[70vh] text-center space-y-6 px-6">
        <div className="w-20 h-20 bg-slate-100 rounded-[2rem] flex items-center justify-center text-slate-400">
          <Receipt size={32} />
        </div>
        <div className="space-y-2">
          <h2 className="text-3xl font-black text-slate-900 tracking-tight">Session data not found.</h2>
          <p className="text-slate-500 font-medium">Your checkout session may have expired or is invalid.</p>
        </div>
        <button 
          onClick={() => navigate("/appointment/counsellors")} 
          className="btn-primary"
        >
          Return to Directory
        </button>
      </div>
    );
  }

  const handlePayment = (e) => {
    e.preventDefault();
    if (!validateForm()) return;
    
    setIsProcessing(true);
    
    // Simulate initial gateway check
    setTimeout(() => {
      setIsProcessing(false);
      setShowOTP(true);
    }, 1500);
  };

  const handleVerifyOTP = (e) => {
    e.preventDefault();
    if (otp.length !== 6) {
      setOtpError("Please enter a valid 6-digit code.");
      return;
    }
    
    setIsProcessing(true);
    setOtpError("");
    
    // Simulate final bank authorization
    setTimeout(() => {
      confirmPayment(bookingId);
      setIsProcessing(false);
      setShowOTP(false);
      setIsSuccess(true);
    }, 2000);
  };

  if (isSuccess) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-slate-50 px-6 py-20">
        <div className="max-w-2xl w-full">
          <div className="bg-white rounded-[3rem] shadow-2xl shadow-blue-900/10 p-12 text-center relative overflow-hidden animate-fade-in-up border border-slate-100">
            {/* Success Animation Background */}
            <div className="absolute top-0 left-0 w-full h-2 bg-emerald-500" />
            <div className="absolute -top-24 -right-24 w-64 h-64 bg-emerald-500/5 rounded-full blur-3xl" />
            
            <div className="relative z-10 space-y-10">
              <div className="w-24 h-24 bg-emerald-50 text-emerald-500 rounded-[2.5rem] flex items-center justify-center mx-auto shadow-inner">
                <CheckCircle2 size={48} className="animate-float" />
              </div>

              <div className="space-y-3">
                <h1 className="text-4xl lg:text-5xl font-black text-slate-900 tracking-tight leading-none">Session Confirmed.</h1>
                <p className="text-slate-500 font-medium">Your mental wellness journey starts here, {studentName}.</p>
              </div>

              {/* Digital Receipt */}
              <div className="glass-card p-8 rounded-[2rem] border border-slate-100 text-left space-y-6">
                <div className="flex justify-between items-center pb-4 border-b border-slate-50">
                  <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Transaction Ref</span>
                  <span className="text-sm font-mono font-black text-slate-900">#UNI-{bookingId.substring(0, 8).toUpperCase()}</span>
                </div>
                <div className="grid grid-cols-2 gap-8">
                  <div className="space-y-1">
                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Date</p>
                    <p className="text-sm font-bold text-slate-900">{date}</p>
                  </div>
                  <div className="space-y-1">
                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Time</p>
                    <p className="text-sm font-bold text-slate-900">{time}</p>
                  </div>
                </div>
                <div className="space-y-1">
                  <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Professional</p>
                  <p className="text-sm font-bold text-slate-900">{counsellor.name}</p>
                </div>
                <div className="pt-4 border-t border-slate-100 flex justify-between items-center">
                  <span className="text-lg font-black text-slate-900">Paid Amount</span>
                  <span className="text-2xl font-black text-blue-600">Rs. {Number(price) + 200}.00</span>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-4">
                <button 
                  onClick={() => navigate("/dashboard")}
                  className="btn-primary w-full flex items-center justify-center gap-2"
                >
                  Enter Portal <ChevronRight size={18} />
                </button>
                <button className="btn-secondary w-full flex items-center justify-center gap-2">
                  <Download size={18} /> Get Receipt
                </button>
              </div>
              
              <div className="flex items-center justify-center gap-2 text-[10px] font-black text-slate-400 uppercase tracking-widest">
                <Lock size={12} /> Securely Managed by UniCare Node
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-slate-50 min-h-screen pb-32">
      {/* OTP Verification Modal */}
      {showOTP && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center px-6">
          <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-md" onClick={() => setShowOTP(false)} />
          <div className="glass-card max-w-md w-full p-10 rounded-[3rem] shadow-2xl relative animate-fade-in-up border border-white/20 bg-white/95">
             <div className="w-16 h-16 bg-blue-50 text-blue-600 rounded-2xl flex items-center justify-center mb-8 shadow-inner">
               <ShieldCheck size={32} />
             </div>
             <h2 className="text-3xl font-black text-slate-900 tracking-tight mb-2">Verification</h2>
             <p className="text-slate-500 font-medium mb-8 leading-relaxed">
               A 6-digit security code has been sent to your registered mobile number for this <span className="text-slate-900 font-bold">Rs. {Number(price) + 200}</span> transaction.
             </p>

             <form onSubmit={handleVerifyOTP} className="space-y-6">
               <div className="space-y-2">
                 <input 
                   type="text"
                   placeholder="0 0 0 0 0 0"
                   maxLength="6"
                   value={otp}
                   onChange={(e) => setOtp(e.target.value.replace(/\D/g, ''))}
                   className="w-full text-center text-4xl font-black tracking-[0.5em] h-20 bg-slate-100 border-none rounded-3xl focus:ring-4 focus:ring-blue-500/20 shadow-inner"
                 />
                 {otpError && <p className="text-rose-500 text-[10px] font-black uppercase tracking-widest text-center mt-2">{otpError}</p>}
               </div>

               <button 
                 type="submit"
                 disabled={isProcessing}
                 className={`w-full py-5 rounded-[2rem] font-black uppercase tracking-widest text-xs transition-all duration-500 shadow-xl flex items-center justify-center gap-3 ${
                   isProcessing ? "bg-slate-200 text-slate-400 cursor-wait" : "bg-blue-600 text-white hover:bg-blue-700 shadow-blue-600/30"
                 }`}
               >
                 {isProcessing ? (
                   <div className="w-5 h-5 border-2 border-slate-400 border-t-transparent rounded-full animate-spin" />
                 ) : "Authorize Transaction"}
               </button>
             </form>

             <div className="mt-8 pt-6 border-t border-slate-100 flex justify-between items-center">
               <button type="button" className="text-[10px] font-black text-slate-400 uppercase tracking-widest hover:text-blue-600 transition-colors">Resend Code</button>
               <button type="button" onClick={() => setShowOTP(false)} className="text-[10px] font-black text-slate-400 uppercase tracking-widest hover:text-rose-500 transition-colors">Cancel</button>
             </div>
          </div>
        </div>
      )}

      <div className="max-w-7xl mx-auto px-6 lg:px-8 pt-32">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-16 items-start">
          {/* Left Side: Dynamic Payment Experience */}
          <div className="lg:col-span-7 space-y-12">
            <header className="space-y-4">
              <button 
                onClick={() => navigate(-1)}
                className="flex items-center text-slate-400 hover:text-blue-600 font-black text-xs uppercase tracking-widest transition-colors group"
              >
                <ArrowLeft className="w-4 h-4 mr-2 group-hover:-translate-x-1 transition-transform" /> Modify Schedule
              </button>
              <h1 className="text-5xl font-black text-slate-900 tracking-tight">Finalize <br /><span className="text-blue-600">Securely.</span></h1>
            </header>

            {/* Visual Card Preview */}
            <div className="relative h-64 w-full sm:w-[400px] mx-auto lg:mx-0 rounded-[3rem] bg-gradient-to-br from-slate-900 to-slate-800 p-8 text-white shadow-2xl shadow-slate-900/40 overflow-hidden group border border-white/10">
              <div className="absolute top-0 right-0 w-64 h-64 bg-blue-600/20 rounded-full blur-3xl -mr-32 -mt-32 group-hover:bg-blue-600/30 transition-colors duration-700" />
              <div className="relative z-10 h-full flex flex-col justify-between">
                <div className="flex justify-between items-start">
                   <div className="w-12 h-10 bg-white/10 rounded-lg flex items-center justify-center border border-white/10 backdrop-blur-md">
                     <CreditCard size={24} className="text-white/80" />
                   </div>
                   <div className="text-[10px] font-black uppercase tracking-[0.3em] opacity-40">UniCare Secure</div>
                </div>
                
                <div className="space-y-1">
                   <p className="text-xs font-bold text-white/40 uppercase tracking-widest">Card Number</p>
                   <p className="text-2xl font-black tracking-[0.15em] font-mono">
                     {cardNumber ? cardNumber.replace(/(\d{4})/g, '$1 ').trim() : "•••• •••• •••• ••••"}
                   </p>
                </div>

                <div className="flex justify-between items-end">
                   <div className="space-y-1">
                     <p className="text-[10px] font-bold text-white/40 uppercase tracking-widest">Card Holder</p>
                     <p className="text-sm font-black uppercase tracking-widest">{cardName || "Your Name"}</p>
                   </div>
                   <div className="space-y-1 text-right">
                     <p className="text-[10px] font-bold text-white/40 uppercase tracking-widest">Expires</p>
                     <p className="text-sm font-black tracking-widest">{expiry || "MM/YY"}</p>
                   </div>
                </div>
              </div>
            </div>

            <div className="glass-card p-10 rounded-[2.5rem] shadow-xl border border-slate-100">
              <form onSubmit={handlePayment} className="space-y-8">
                <div className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <InputField 
                      label="Cardholder Name" 
                      placeholder="Student Full Name" 
                      value={cardName} 
                      error={formErrors.cardName}
                      onChange={(e) => setCardName(e.target.value)} 
                    />
                    <InputField 
                      label="Card Number" 
                      placeholder="0000 0000 0000 0000" 
                      maxLength="19" 
                      value={cardNumber} 
                      error={formErrors.cardNumber}
                      onChange={(e) => {
                        const val = e.target.value.replace(/\D/g, '').replace(/(.{4})/g, '$1 ').trim();
                        setCardNumber(val);
                      }} 
                    />
                  </div>
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-6">
                    <InputField 
                      label="MM/YY" 
                      placeholder="12/28" 
                      maxLength="5" 
                      value={expiry} 
                      error={formErrors.expiry}
                      onChange={(e) => {
                        let val = e.target.value.replace(/\D/g, '');
                        if (val.length > 2) val = val.substring(0, 2) + '/' + val.substring(2);
                        setExpiry(val);
                      }} 
                    />
                    <InputField 
                      label="CVC" 
                      placeholder="•••" 
                      maxLength="4" 
                      value={cvc} 
                      error={formErrors.cvc}
                      onChange={(e) => setCvc(e.target.value.replace(/\D/g, ''))} 
                    />
                    <div className="hidden md:flex items-center justify-center">
                      <div className="px-4 py-2 bg-slate-50 rounded-xl border border-slate-100 flex items-center gap-2">
                        <Lock size={12} className="text-slate-400" />
                        <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Bank Grade</span>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="p-6 bg-blue-50 rounded-2xl border border-blue-100 flex items-start gap-4">
                  <ShieldCheck className="text-blue-600 shrink-0 w-6 h-6" />
                  <div className="space-y-1">
                    <p className="text-xs font-black text-blue-900 uppercase tracking-widest">Protected Checkout</p>
                    <p className="text-xs font-medium text-blue-600/80 leading-relaxed">Your data is encrypted using 256-bit AES protocols. We do not store your cardinal details.</p>
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={isProcessing}
                  className={`w-full py-6 rounded-[2rem] font-black uppercase tracking-[0.2em] text-sm transition-all duration-500 shadow-2xl flex justify-center items-center gap-4 ${
                    isProcessing ? "bg-slate-200 text-slate-400 cursor-wait shadow-none" : "bg-blue-600 text-white hover:bg-blue-700 shadow-blue-600/30 hover:scale-102"
                  }`}
                >
                  {isProcessing ? (
                    <>
                      <div className="w-5 h-5 border-2 border-slate-400 border-t-transparent rounded-full animate-spin" />
                      Decrypting Gateway...
                    </>
                  ) : `Execute Payment • Rs. ${Number(price) + 200}`}
                </button>
              </form>
            </div>
          </div>

          {/* Right Side: High-End Summary */}
          <div className="lg:col-span-5">
            <div className="glass-card p-10 rounded-[3rem] sticky top-32 border border-slate-100 shadow-2xl shadow-blue-900/5 space-y-10">
              <div className="flex items-center justify-between border-b border-slate-100 pb-6">
                <h2 className="text-2xl font-black text-slate-900 tracking-tight">Order Audit</h2>
                <div className="px-3 py-1 bg-blue-50 text-blue-600 text-[10px] font-black rounded-lg uppercase tracking-widest">Locked Rate</div>
              </div>
              
              <div className="flex items-center gap-6">
                <div className="relative">
                  <div className="absolute inset-0 bg-blue-600/10 rounded-2xl scale-110" />
                  <img src={counsellor.image} alt={counsellor.name} className="w-20 h-20 rounded-2xl object-cover relative z-10 border-2 border-white shadow-lg" />
                </div>
                <div className="space-y-1">
                  <p className="text-lg font-black text-slate-900 tracking-tight">{counsellor.name}</p>
                  <p className="text-[10px] font-black text-blue-600 uppercase tracking-widest">{counsellor.specialization || "Clinical Expert"}</p>
                </div>
              </div>

              <div className="space-y-4 bg-slate-50/50 p-6 rounded-[2rem] border border-slate-100">
                <div className="flex justify-between items-center">
                  <span className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Scheduled Date</span>
                  <span className="text-xs font-bold text-slate-900">{date}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Session Time</span>
                  <span className="text-xs font-bold text-slate-900 uppercase tracking-widest">{time}</span>
                </div>
                <div className="flex justify-between items-center h-4 overflow-hidden">
                  <div className="w-full border-t border-dashed border-slate-200" />
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Consultation Fee</span>
                  <span className="text-xs font-bold text-slate-900">Rs. {price}.00</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Network Access</span>
                  <span className="text-xs font-bold text-slate-900">Rs. 200.00</span>
                </div>
              </div>

              <div className="flex justify-between items-end px-2">
                <div className="space-y-1">
                   <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Total Charged</p>
                  <p className="text-4xl font-black text-slate-900 leading-none">Rs. {Number(price) + 200}.00</p>
                </div>
                <button className="text-blue-600 hover:text-blue-700 font-black text-[10px] uppercase tracking-widest flex items-center gap-1 group">
                  View Policy <ExternalLink size={12} className="group-hover:scale-110 transition-transform" />
                </button>
              </div>

              <div className="pt-6 text-center">
                <p className="text-[10px] font-bold text-slate-400 leading-relaxed max-w-xs mx-auto">
                  By executing this transaction, you authorize UniCare to provision a secure digital meeting vault for your session.
                </p>
              </div>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
};

const InputField = ({ label, error, ...props }) => (
  <div className="space-y-3">
    <div className="flex justify-between items-center px-1">
      <label className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">{label}</label>
      {error && <span className="text-[9px] font-black text-rose-500 uppercase tracking-widest animate-pulse">{error}</span>}
    </div>
    <input 
      {...props} 
      required 
      className={`w-full bg-slate-50 border-2 text-sm font-bold rounded-2xl focus:ring-4 block p-4 shadow-inner transition-all placeholder:text-slate-300 ${
        error 
          ? "border-rose-100 focus:border-rose-500 focus:ring-rose-500/10 text-rose-900" 
          : "border-transparent focus:border-blue-500 focus:ring-blue-500/10 text-slate-900"
      }`} 
    />
  </div>
);

export default Payment;

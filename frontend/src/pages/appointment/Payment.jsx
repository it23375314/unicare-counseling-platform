import { useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { CreditCard, CheckCircle, ShieldCheck, ArrowLeft, Download, ExternalLink, Sparkles, Lock } from "lucide-react";
import { useBooking } from "../../context/BookingContext";

const Payment = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { confirmPayment } = useBooking();
  const [isProcessing, setIsProcessing] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);

  // Retrieve booking details passed from BookingFlow
  const { bookingId, counsellor, date, time, price } = location.state || {};

  if (!counsellor || !bookingId) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-[#F8FAFC]">
        <div className="bg-white p-12 rounded-[3rem] shadow-2xl shadow-gray-200/50 border border-gray-100 text-center max-w-md mx-auto">
          <div className="bg-red-50 text-red-500 w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-8">
            <ShieldCheck size={40} />
          </div>
          <h2 className="text-3xl font-black mb-4 text-gray-900">Session Expired</h2>
          <p className="text-gray-500 font-bold mb-10 leading-relaxed">We couldn't find your booking details. Please start the process again from the directory.</p>
          <button 
            onClick={() => navigate("/appointment/counsellors")} 
            className="w-full bg-blue-600 hover:bg-blue-700 text-white font-black px-8 py-4 rounded-2xl shadow-xl shadow-blue-500/30 transition-all uppercase tracking-widest text-xs"
          >
            Back to Directory
          </button>
        </div>
      </div>
    );
  }

  const handlePayment = (e) => {
    e.preventDefault();
    setIsProcessing(true);
    
    // Simulate payment processing
    setTimeout(() => {
      confirmPayment(bookingId); // Update Context -> Paid & Confirmed
      setIsProcessing(false);
      setIsSuccess(true);
    }, 2500);
  };

  if (isSuccess) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-[#F8FAFC] px-6 py-12">
        <div className="bg-white rounded-[3.5rem] shadow-[0_40px_100px_rgba(0,0,0,0.08)] border border-gray-100 p-12 max-w-lg w-full relative overflow-hidden animate-in fade-in zoom-in duration-500">
          
          <div className="absolute top-0 right-0 w-64 h-64 bg-teal-50 rounded-full blur-3xl opacity-50"></div>
          <div className="absolute bottom-0 left-0 w-64 h-64 bg-blue-50 rounded-full blur-3xl opacity-50"></div>

          <div className="text-center mb-12 relative z-10">
            <div className="relative inline-block mb-8">
              <div className="absolute inset-0 bg-teal-500 rounded-full blur-2xl opacity-20 animate-pulse"></div>
              <div className="bg-gradient-to-br from-teal-500 to-emerald-400 text-white w-24 h-24 rounded-full flex items-center justify-center mx-auto shadow-2xl shadow-teal-500/30 relative">
                <CheckCircle className="w-12 h-12" />
              </div>
            </div>
            <h1 className="text-4xl font-black text-gray-900 mb-2 uppercase tracking-tight">Success!</h1>
            <p className="text-gray-400 font-black text-xs uppercase tracking-[0.2em]">Transaction Confirmed</p>
          </div>

          <div className="space-y-6 mb-12 bg-gray-50/50 p-10 rounded-[2.5rem] border border-gray-100 text-sm relative z-10">
            <div className="flex justify-between items-center pb-5 border-b border-gray-100/50">
              <span className="text-gray-400 font-bold uppercase tracking-widest text-[10px]">Session ID</span>
              <span className="text-gray-900 font-black font-mono text-base">{bookingId.substring(0, 8).toUpperCase()}</span>
            </div>
            <div className="flex justify-between items-start pb-5 border-b border-gray-100/50">
              <span className="text-gray-400 font-bold uppercase tracking-widest text-[10px]">Date & Time</span>
              <div className="text-right">
                <p className="text-gray-900 font-black">{date}</p>
                <p className="text-gray-500 font-bold">{time}</p>
              </div>
            </div>
            <div className="flex justify-between items-center pb-5 border-b border-gray-100/50">
              <span className="text-gray-400 font-bold uppercase tracking-widest text-[10px]">Professional</span>
              <span className="text-gray-900 font-black">{counsellor.name}</span>
            </div>
            <div className="flex justify-between items-center pt-2">
              <span className="text-gray-900 font-black text-lg uppercase tracking-tight">Total Paid</span>
              <span className="text-blue-600 font-black text-3xl">${price + 2}.00</span>
            </div>
          </div>

          <div className="flex flex-col gap-4 relative z-10">
            <button 
              onClick={() => navigate("/dashboard")}
              className="w-full bg-gray-900 hover:bg-blue-600 text-white font-black py-5 rounded-2xl shadow-2xl shadow-gray-900/10 transition-all flex items-center justify-center gap-3 uppercase tracking-widest text-xs"
            >
              Go to Dashboard <ChevronRight className="rotate-0" size={16} />
            </button>
            <button className="w-full bg-white hover:bg-gray-50 text-gray-500 border-2 border-gray-100 font-black py-5 rounded-2xl transition-all flex items-center justify-center gap-3 uppercase tracking-widest text-xs">
              <Download size={16} /> Save Receipt
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-[#F8FAFC] min-h-screen pt-32 pb-24">
      <div className="max-w-7xl mx-auto px-6 lg:px-8">
        
        <div className="mb-12">
            <button 
                onClick={() => navigate(-1)}
                className="group flex items-center text-gray-400 font-black uppercase tracking-widest text-[10px] hover:text-blue-600 transition mb-6"
            >
                <ArrowLeft className="w-4 h-4 mr-2 group-hover:-translate-x-1 transition-transform" /> Modify Booking
            </button>
            <h1 className="text-5xl font-black text-gray-900 tracking-tight leading-tight">Secure <br /> <span className="text-blue-600">Checkout.</span></h1>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-start">
          
          {/* Checkout Form */}
          <div className="bg-white p-12 rounded-[3.5rem] shadow-2xl shadow-gray-200/30 border border-gray-50">
            <div className="flex items-center gap-3 mb-10">
                <div className="bg-blue-100 text-blue-600 p-2.5 rounded-xl">
                    <CreditCard size={20} />
                </div>
                <h2 className="text-2xl font-black text-gray-900 uppercase tracking-tight">Payment Method</h2>
            </div>

            <form onSubmit={handlePayment} className="space-y-8">
              <div className="space-y-3">
                <label className="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] ml-2">Cardholder Full Name</label>
                <input type="text" required placeholder="JOHN DOE" className="w-full bg-gray-50 border-2 border-transparent focus:bg-white focus:border-blue-100 transition-all rounded-2xl px-6 py-4 text-sm font-bold outline-none placeholder-gray-300" />
              </div>
              
              <div className="space-y-3">
                <label className="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] ml-2">Card Number</label>
                <div className="relative">
                    <input type="text" required placeholder="4111 1111 1111 1111" maxLength="19" className="w-full bg-gray-50 border-2 border-transparent focus:bg-white focus:border-blue-100 transition-all rounded-2xl pl-6 pr-14 py-4 text-sm font-black font-mono outline-none placeholder-gray-300" />
                    <div className="absolute right-5 inset-y-0 flex items-center">
                        <img src="https://upload.wikimedia.org/wikipedia/commons/5/5e/Visa_Inc._logo.svg" alt="Visa" className="h-4 w-auto opacity-50" />
                    </div>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-6">
                <div className="space-y-3">
                  <label className="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] ml-2">Expiry Date</label>
                  <input type="text" required placeholder="MM/YY" maxLength="5" className="w-full bg-gray-50 border-2 border-transparent focus:bg-white focus:border-blue-100 transition-all rounded-2xl px-6 py-4 text-sm font-black outline-none placeholder-gray-300 text-center" />
                </div>
                <div className="space-y-3">
                  <label className="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] ml-2">CVC Code</label>
                  <input type="text" required placeholder="•••" maxLength="4" className="w-full bg-gray-50 border-2 border-transparent focus:bg-white focus:border-blue-100 transition-all rounded-2xl px-6 py-4 text-sm font-black outline-none placeholder-gray-300 text-center" />
                </div>
              </div>

              <div className="p-6 bg-teal-50/50 rounded-2xl border border-teal-100 flex gap-4 items-start">
                <Lock className="text-teal-600 shrink-0 mt-0.5" size={18} />
                <p className="text-[11px] font-bold text-teal-800 leading-relaxed uppercase tracking-wider">
                  Fully encrypted connection. We do not store your full card details in our systems.
                </p>
              </div>

              <button
                type="submit"
                disabled={isProcessing}
                className={`w-full py-5 rounded-2xl font-black text-white transition-all shadow-2xl flex justify-center items-center gap-3 uppercase tracking-[0.2em] text-xs ${
                  isProcessing ? "bg-gray-200 cursor-wait shadow-none" : "bg-blue-600 hover:bg-blue-700 shadow-blue-500/30 hover:scale-[1.02] active:scale-95"
                }`}
              >
                {isProcessing ? (
                   <div className="w-5 h-5 border-2 border-gray-400 border-t-white rounded-full animate-spin"></div>
                ) : (
                  <>
                    <CreditCard size={18} />
                    <span>Authorize ${price + 2}</span>
                  </>
                )}
              </button>
            </form>
          </div>

          {/* Right Side: Enhanced Order Summary */}
          <div className="space-y-8">
            <div className="bg-white p-10 rounded-[3.5rem] shadow-2xl shadow-gray-200/30 border border-gray-50">
              <h2 className="text-xl font-black text-gray-900 mb-8 uppercase tracking-tight">Order Summary</h2>
              
              <div className="flex items-center gap-6 mb-10 pb-10 border-b border-gray-100">
                <div className="relative">
                    <img src={counsellor.image} alt="Counsellor" className="w-20 h-20 rounded-3xl object-cover shadow-lg border-2 border-white" />
                    <div className="absolute -bottom-1 -right-1 bg-yellow-400 p-1.5 rounded-lg shadow-lg">
                        <Sparkles size={12} className="text-white" fill="currentColor" />
                    </div>
                </div>
                <div>
                  <p className="font-black text-gray-900 text-xl tracking-tight leading-none mb-2">{counsellor.name}</p>
                  <p className="text-xs font-black text-blue-500 uppercase tracking-[0.1em]">{counsellor.specialty}</p>
                </div>
              </div>

              <div className="space-y-5 mb-10 pb-10 border-b border-gray-100">
                <div className="flex justify-between items-center group">
                  <span className="text-gray-400 font-bold uppercase tracking-widest text-[10px] group-hover:text-blue-500 transition-colors">Scheduled Date</span>
                  <span className="font-black text-gray-900">{date}</span>
                </div>
                <div className="flex justify-between items-center group">
                  <span className="text-gray-400 font-bold uppercase tracking-widest text-[10px] group-hover:text-blue-500 transition-colors">Session Time</span>
                  <span className="font-black text-gray-900">{time}</span>
                </div>
                <div className="flex justify-between items-center group">
                  <span className="text-gray-400 font-bold uppercase tracking-widest text-[10px] group-hover:text-blue-500 transition-colors">Session Format</span>
                  <span className="font-black text-teal-600 bg-teal-50 px-3 py-1 rounded-lg text-xs">Video Call</span>
                </div>
              </div>

              <div className="space-y-4 mb-10">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-500 font-bold">Standard Session Fee</span>
                  <span className="text-gray-900 font-black">${price}.00</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-500 font-bold">University Platform Fee</span>
                  <span className="text-gray-900 font-black">$2.00</span>
                </div>
                <div className="flex justify-between text-lg font-black mt-8 pt-8 border-t border-gray-100 items-baseline">
                  <span className="text-gray-900 uppercase tracking-tight">Total Amount</span>
                  <span className="text-blue-600 text-[2.5rem] leading-none">${price + 2}.00</span>
                </div>
              </div>

              <div className="bg-gray-50/50 p-6 rounded-3xl border border-gray-100 flex flex-col gap-3">
                 <div className="flex items-center gap-2 text-[10px] font-black text-gray-400 uppercase tracking-widest">
                    <CheckCircle2 size={12} className="text-teal-500" /> Professional Matching Guarantee
                 </div>
                 <div className="flex items-center gap-2 text-[10px] font-black text-gray-400 uppercase tracking-widest">
                    <CheckCircle2 size={12} className="text-teal-500" /> Full Refund (24hr notice)
                 </div>
              </div>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
};

export default Payment;

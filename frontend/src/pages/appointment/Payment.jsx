import { useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { CreditCard, CheckCircle, ShieldCheck } from "lucide-react";
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
      <div className="flex flex-col items-center justify-center min-h-[60vh]">
        <h2 className="text-2xl font-bold mb-4">No Booking Data Found</h2>
        <button onClick={() => navigate("/appointment/counsellors")} className="text-blue-600 underline">
          Go back to Counsellors
        </button>
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
    }, 2000);
  };

  if (isSuccess) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-gray-50 px-4 py-12">
        
        <div className="bg-white rounded-3xl shadow-xl border border-gray-100 p-8 max-w-md w-full relative overflow-hidden animate-slide-up">
          {/* Decorative Header */}
          <div className="bg-teal-500 h-2 w-full absolute top-0 left-0"></div>
          
          <div className="text-center mb-8 pt-4">
            <div className="bg-teal-50 text-teal-600 w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-4">
               <CheckCircle className="w-10 h-10 animate-scale-in" />
            </div>
            <h1 className="text-2xl font-extrabold text-gray-900 mb-1">Payment Successful</h1>
            <p className="text-sm text-gray-500">Your session has been confirmed.</p>
          </div>

          <div className="space-y-4 mb-8 bg-gray-50 p-6 rounded-2xl border border-gray-100 text-sm">
            <div className="flex justify-between items-center pb-4 border-b border-gray-200">
              <span className="text-gray-500 font-medium">Receipt ID</span>
              <span className="text-gray-900 font-mono font-bold">{bookingId.substring(0, 8).toUpperCase()}</span>
            </div>
            <div className="flex justify-between items-center pb-4 border-b border-gray-200">
              <span className="text-gray-500 font-medium">Date & Time</span>
              <span className="text-gray-900 font-bold text-right">{date}<br/>{time}</span>
            </div>
            <div className="flex justify-between items-center pb-4 border-b border-gray-200">
              <span className="text-gray-500 font-medium">Counsellor</span>
              <span className="text-gray-900 font-bold">{counsellor.name}</span>
            </div>
            <div className="flex justify-between items-center pb-4 border-b border-gray-200">
              <span className="text-gray-500 font-medium">Status</span>
              <span className="text-teal-700 bg-teal-100 px-3 py-1 rounded-full font-bold uppercase tracking-wider text-xs">Paid</span>
            </div>
            <div className="flex justify-between items-center pt-2">
              <span className="text-gray-900 font-bold text-base">Total Amount</span>
              <span className="text-blue-600 font-extrabold text-xl">${price + 2}.00</span>
            </div>
          </div>

          <div className="flex flex-col gap-3">
            <button 
              onClick={() => navigate("/dashboard")}
              className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-4 rounded-xl shadow-lg transition"
            >
              Go to Dashboard
            </button>
            <button className="w-full bg-white hover:bg-gray-50 text-gray-700 border border-gray-200 font-semibold py-4 rounded-xl transition">
              Download Receipt PDF
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-gray-50 min-h-screen pt-12 pb-24">
      <div className="max-w-6xl mx-auto px-6 lg:px-8 grid grid-cols-1 lg:grid-cols-2 gap-12">
        
        {/* Left Side: Payment Form */}
        <div>
          <h1 className="text-3xl font-extrabold text-gray-900 mb-8 font-serif">Checkout</h1>
          
          <div className="bg-white p-8 rounded-3xl border border-gray-100 shadow-sm">
            <h2 className="text-xl font-bold text-gray-900 mb-6 flex items-center">
              <CreditCard className="w-5 h-5 mr-3 text-blue-600" /> Payment Details
            </h2>

            <form onSubmit={handlePayment} className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Cardholder Name</label>
                <input type="text" required placeholder="John Doe" className="w-full bg-gray-50 border border-gray-200 text-gray-900 rounded-xl focus:ring-blue-500 focus:border-blue-500 block p-3" />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Card Number</label>
                <input type="text" required placeholder="4111 1111 1111 1111" maxLength="19" className="w-full bg-gray-50 border border-gray-200 text-gray-900 rounded-xl focus:ring-blue-500 focus:border-blue-500 block p-3 font-mono" />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Expiry (MM/YY)</label>
                  <input type="text" required placeholder="12/26" maxLength="5" className="w-full bg-gray-50 border border-gray-200 text-gray-900 rounded-xl focus:ring-blue-500 focus:border-blue-500 block p-3" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">CVC</label>
                  <input type="text" required placeholder="123" maxLength="4" className="w-full bg-gray-50 border border-gray-200 text-gray-900 rounded-xl focus:ring-blue-500 focus:border-blue-500 block p-3" />
                </div>
              </div>

              <div className="pt-4 flex items-center gap-2 text-sm text-gray-500 bg-teal-50/50 p-4 rounded-xl border border-teal-100">
                <ShieldCheck className="text-teal-600 shrink-0" />
                <p>Your payment is 100% secure. We use bank-level 256-bit encryption to protect your data.</p>
              </div>

              <button
                type="submit"
                disabled={isProcessing}
                className={`w-full py-4 mt-4 rounded-xl font-bold text-white transition flex justify-center shadow-lg ${
                  isProcessing ? "bg-gray-400 cursor-wait" : "bg-blue-600 hover:bg-blue-700"
                }`}
              >
                {isProcessing ? "Processing..." : `Pay $${price}`}
              </button>
            </form>
          </div>
        </div>

        {/* Right Side: Order Summary */}
        <div className="lg:pl-8">
          <div className="bg-white p-8 rounded-3xl border border-gray-100 shadow-sm sticky top-24">
            <h2 className="text-xl font-bold text-gray-900 mb-6">Booking Summary</h2>
            
            <div className="flex items-center gap-4 mb-6 pb-6 border-b border-gray-100">
              <img src={counsellor.image} alt="Counsellor" className="w-16 h-16 rounded-full object-cover" />
              <div>
                <p className="font-bold text-gray-900">{counsellor.name}</p>
                <p className="text-sm text-gray-500">{counsellor.specialty}</p>
                 <span className="text-xs font-semibold bg-yellow-100 text-yellow-800 px-2 mt-1 inline-block rounded">Status: Pending Checkout</span>
              </div>
            </div>

            <div className="space-y-4 mb-6 pb-6 border-b border-gray-100 text-sm">
              <div className="flex justify-between">
                <span className="text-gray-500">Date</span>
                <span className="font-medium text-gray-900">{date}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-500">Time</span>
                <span className="font-medium text-gray-900">{time}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-500">Duration</span>
                <span className="font-medium text-gray-900">1 Hour Video Session</span>
              </div>
            </div>

            <div className="space-y-3 mb-6">
              <div className="flex justify-between text-sm">
                <span className="text-gray-500">Session Fee</span>
                <span className="text-gray-900">${price}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-500">Platform Fee</span>
                <span className="text-gray-900">$2.00</span>
              </div>
              <div className="flex justify-between text-lg font-bold mt-4 pt-4 border-t border-gray-100">
                <span className="text-gray-900">Total</span>
                <span className="text-blue-600">${price + 2}</span>
              </div>
            </div>

            <p className="text-xs text-gray-400 text-center">
              By proceeding, you agree to our Cancellation and Refund Policy. Full refunds are provided for cancellations made 24 hours prior to the session.
            </p>
          </div>
        </div>

      </div>
    </div>
  );
};

export default Payment;

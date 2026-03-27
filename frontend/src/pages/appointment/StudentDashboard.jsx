import { useState } from "react";
import { Link } from "react-router-dom";
import { Calendar as CalendarIcon, Clock, Video, FileText, XCircle, AlertCircle, CheckCircle, Edit, Save } from "lucide-react";
import { useBooking } from "../../context/BookingContext";

const regularSlots = ["09:00 AM", "11:00 AM", "01:00 PM", "03:00 PM", "05:00 PM"];

const StudentDashboard = () => {
  const { bookings, cancelBooking, rescheduleBooking, checkIsRefundable, getAvailableSlots } = useBooking();
  const [filter, setFilter] = useState("All"); // All, Pending, Confirmed, Cancelled
  
  // Reschedule states
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
    <div className="bg-gray-50 min-h-screen pt-12 pb-24">
      <div className="max-w-7xl mx-auto px-6 lg:px-8">
        
        <div className="flex flex-col md:flex-row md:items-center justify-between mb-10 gap-4">
          <div>
            <h1 className="text-3xl font-extrabold text-gray-900 mb-2 font-serif">Welcome back, Alex</h1>
            <p className="text-gray-600">Here is an overview of your mental wellness journey.</p>
          </div>
          <Link to="/appointment/counsellors" className="bg-blue-600 hover:bg-blue-700 text-white font-semibold px-6 py-3 rounded-xl shadow-sm transition flex items-center justify-center gap-2 max-w-max">
            <CalendarIcon className="w-5 h-5" /> Book New Session
          </Link>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          
          <div className="lg:col-span-2 space-y-8">
            <div className="bg-white rounded-3xl p-8 border border-gray-100 shadow-sm">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-8 pb-4 border-b border-gray-100 gap-4">
                 <h2 className="text-xl font-bold text-gray-900 flex items-center">
                  Your Appointments
                  <span className="ml-3 text-sm font-medium text-blue-600 bg-blue-50 px-3 py-1 rounded-full">{bookings.length}</span>
                </h2>

                <div className="flex flex-wrap gap-2 bg-gray-100 p-1 rounded-lg">
                  {["All", "Pending", "Confirmed", "Cancelled"].map(f => (
                    <button
                      key={f}
                      onClick={() => setFilter(f)}
                      className={`px-4 py-1.5 rounded-md text-sm font-medium transition ${
                        filter === f ? "bg-white shadow text-gray-900" : "text-gray-500 hover:text-gray-900"
                      }`}
                    >
                      {f}
                    </button>
                  ))}
                </div>
              </div>

              {filteredBookings.length === 0 ? (
                <div className="text-center py-10">
                  <CalendarIcon className="w-12 h-12 text-gray-300 mx-auto mb-4" />
                  <p className="text-gray-500">No {filter !== "All" ? filter.toLowerCase() : ""} sessions found.</p>
                </div>
              ) : (
                <div className="space-y-6">
                  {filteredBookings.map((app) => {
                    const isRefundable = checkIsRefundable(app.date, app.time);
                    const isRescheduling = editingBookingId === app.id;
                    const computedSlots = isRescheduling && newDate ? getAvailableSlots(app.counsellor, newDate, regularSlots) : [];

                    return (
                      <div key={app.id} className="border border-gray-100 rounded-2xl p-6 flex flex-col gap-4 shadow-sm hover:shadow-md transition bg-gray-50/30 relative overflow-hidden">
                        
                        <div className={`absolute top-0 left-0 w-1.5 h-full ${
                          app.status === "Confirmed" ? "bg-teal-500" : 
                          app.status === "Pending" ? "bg-yellow-400" : "bg-red-400"
                        }`}></div>

                        <div className="flex flex-col sm:flex-row gap-6">
                          <img src={app.counsellorImage} alt={app.counsellor} className="w-20 h-20 rounded-2xl object-cover shrink-0" />
                          
                          <div className="flex-grow">
                            <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start mb-2">
                              <div>
                                <h3 className="text-lg font-bold text-gray-900">{app.counsellor}</h3>
                                <p className="text-sm text-gray-600 font-medium mb-3">{app.specialty}</p>
                              </div>
                              
                              <div className="flex flex-col gap-2 items-end">
                                <span className={`text-xs font-bold px-3 py-1 rounded-full uppercase tracking-wide w-max ${
                                  app.status === "Confirmed" ? "bg-teal-100 text-teal-700" :
                                  app.status === "Pending" ? "bg-yellow-100 text-yellow-700" : "bg-red-100 text-red-700"
                                }`}>
                                  {app.status}
                                </span>

                                {app.status === "Cancelled" && app.refundStatus === "Eligible" && (
                                  <span className="text-xs font-semibold flex items-center gap-1 text-green-600 bg-green-50 px-2 py-1 rounded border border-green-200">
                                    <CheckCircle className="w-3 h-3" /> Refunded
                                  </span>
                                )}
                                {app.status === "Cancelled" && app.refundStatus === "Not Eligible" && (
                                  <span className="text-xs font-semibold flex items-center gap-1 text-gray-500 bg-gray-100 px-2 py-1 rounded border border-gray-200">
                                    <AlertCircle className="w-3 h-3" /> No Refund (&lt; 2hrs)
                                  </span>
                                )}
                              </div>
                            </div>

                            {!isRescheduling && (
                              <div className="flex flex-wrap gap-4 text-sm text-gray-700 mb-6 bg-white p-3 rounded-xl border border-gray-100 inline-flex">
                                <span className="flex items-center font-medium"><CalendarIcon className="w-4 h-4 mr-1.5 text-blue-500" /> {app.date}</span>
                                <span className="flex items-center font-medium"><Clock className="w-4 h-4 mr-1.5 text-blue-500" /> {app.time}</span>
                                <span className="flex items-center"><Video className="w-4 h-4 mr-1.5 text-gray-400" /> {app.type}</span>
                              </div>
                            )}

                            {!isRescheduling && (
                              <div className="flex flex-wrap gap-3">
                                {app.status === "Pending" && (
                                  <Link to="/appointment/payment" state={{ bookingId: app.id, counsellor: { name: app.counsellor, image: app.counsellorImage, specialty: app.specialty }, date: app.date, time: app.time, price: app.price }} className="bg-blue-600 text-white px-5 py-2.5 rounded-lg text-sm font-medium hover:bg-blue-700 transition shadow-sm">
                                    Pay Now to Confirm
                                  </Link>
                                )}

                                {app.status === "Confirmed" && (
                                  <button className="bg-teal-600 text-white px-5 py-2.5 rounded-lg text-sm font-medium hover:bg-teal-700 transition flex items-center gap-2 shadow-sm">
                                    <Video className="w-4 h-4" /> Join Session
                                  </button>
                                )}

                                {app.status === "Pending" && (
                                  <button 
                                    onClick={() => handleOpenReschedule(app)}
                                    disabled={!isRefundable}
                                    title={!isRefundable ? "Cannot reschedule less than 2 hours before session" : ""}
                                    className={`px-5 py-2.5 rounded-lg text-sm font-medium flex items-center gap-2 transition ${
                                      !isRefundable 
                                        ? "bg-gray-100 text-gray-400 cursor-not-allowed border border-gray-200" 
                                        : "bg-white border text-blue-600 border-blue-200 hover:bg-blue-50"
                                    }`}
                                  >
                                    <Edit className="w-4 h-4" /> Reschedule
                                  </button>
                                )}
                                
                                {(app.status === "Pending" || app.status === "Confirmed") && (
                                  <button 
                                    onClick={() => cancelBooking(app.id)}
                                    disabled={!isRefundable && app.status === "Confirmed"}
                                    title={!isRefundable && app.status === "Confirmed" ? "Cannot cancel directly less than 2 hours before session" : ""}
                                    className={`px-5 py-2.5 rounded-lg text-sm font-medium flex items-center gap-2 transition ${
                                      !isRefundable && app.status === "Confirmed" 
                                        ? "bg-gray-100 text-gray-400 cursor-not-allowed border border-gray-200" 
                                        : "bg-white border border-red-200 text-red-600 hover:bg-red-50"
                                    }`}
                                  >
                                    <XCircle className="w-4 h-4" /> Cancel
                                  </button>
                                )}
                              </div>
                            )}
                          </div>
                        </div>

                        {/* Inline Rescheduling UI */}
                        {isRescheduling && (
                          <div className="mt-4 pt-6 border-t border-gray-200 animate-slide-up">
                            <h4 className="text-gray-900 font-bold mb-4 flex items-center"><Edit className="w-4 h-4 mr-2" /> Select New Time</h4>
                            
                            {rescheduleError && (
                              <div className="mb-4 text-xs font-semibold text-red-600 bg-red-50 p-2 rounded">
                                {rescheduleError}
                              </div>
                            )}

                            <div className="flex flex-col sm:flex-row gap-4 mb-4">
                              <input 
                                type="date" 
                                value={newDate}
                                min={new Date().toISOString().split("T")[0]}
                                onChange={(e) => { setNewDate(e.target.value); setNewTime(""); }}
                                className="border border-gray-300 rounded-lg p-2 text-sm"
                              />
                            </div>
                            
                            {newDate && (
                              <div className="flex flex-wrap gap-2 mb-6">
                                {computedSlots.filter(s => !s.disabled).length === 0 ? (
                                  <span className="text-sm text-red-500">No open slots. Pick another date.</span>
                                ) : (
                                  computedSlots.map((slot, idx) => (
                                    <button
                                      key={idx}
                                      onClick={() => !slot.disabled && setNewTime(slot.time)}
                                      disabled={slot.disabled}
                                      className={`px-3 py-1.5 rounded-md text-xs font-bold transition ${
                                        slot.disabled 
                                          ? "bg-gray-100 text-gray-400 line-through cursor-not-allowed" 
                                          : newTime === slot.time
                                            ? "bg-blue-600 text-white"
                                            : "bg-white border border-gray-300 text-gray-700 hover:border-blue-500"
                                      }`}
                                    >
                                      {slot.time}
                                    </button>
                                  ))
                                )}
                              </div>
                            )}

                            <div className="flex gap-3">
                              <button 
                                onClick={() => handleSaveReschedule(app)}
                                className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg text-sm font-semibold flex items-center"
                              >
                                <Save className="w-4 h-4 mr-2" /> Confirm New Time
                              </button>
                              <button 
                                onClick={() => setEditingBookingId(null)}
                                className="bg-white border border-gray-300 text-gray-700 hover:bg-gray-50 px-4 py-2 rounded-lg text-sm font-semibold"
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

          <div className="space-y-8">
            <div className="bg-gradient-to-br from-teal-500 to-emerald-600 rounded-3xl p-8 text-white shadow-lg relative overflow-hidden">
              <div className="absolute right-0 bottom-0 opacity-10">
                <FileText className="w-40 h-40 -mr-10 -mb-10" />
              </div>
              <h2 className="text-xl font-bold mb-2 relative z-10">How are you feeling today?</h2>
              <p className="text-teal-100 mb-6 text-sm relative z-10">Log your mood to get personalized resource recommendations.</p>
              <button className="bg-white text-teal-700 font-bold px-6 py-3 rounded-xl w-full hover:bg-teal-50 transition shadow-md relative z-10">
                Log Mood
              </button>
            </div>
            <div className="bg-white rounded-3xl p-8 border border-gray-100 shadow-sm">
              <h2 className="text-lg font-bold text-gray-900 mb-4">Recommended Resources</h2>
              <button className="mt-4 text-sm font-medium text-blue-600 hover:underline w-full text-center">
                View all resources
              </button>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
};

export default StudentDashboard;

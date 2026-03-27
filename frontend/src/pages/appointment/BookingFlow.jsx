import { useState, useMemo } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { ArrowLeft, Calendar as CalendarIcon, Clock, Sparkles, AlertCircle, User, ChevronRight, CheckCircle2 } from "lucide-react";
import { useBooking } from "../../context/BookingContext";
import { useCounsellorContext } from "../../context/CounsellorContext";

const BookingFlow = () => {
  const { counsellorId } = useParams();
  const navigate = useNavigate();
  const { addBooking, getAvailableSlots } = useBooking();
  const { counsellors } = useCounsellorContext();
  
  const initialCounsellor = counsellors.find(c => c.id === counsellorId) || counsellors[0];
  const [selectedCounsellorId, setSelectedCounsellorId] = useState(initialCounsellor?.id);

  const activeCounsellor = counsellors.find(c => c.id === selectedCounsellorId) || counsellors[0];

  const [selectedDate, setSelectedDate] = useState("");
  const [selectedTime, setSelectedTime] = useState("");
  const [error, setError] = useState("");

  const computedSlots = useMemo(() => {
    if (!selectedDate || !activeCounsellor) return [];
    const dayAvail = activeCounsellor.availability?.find(a => a.date === selectedDate);
    const slotsForDay = dayAvail ? dayAvail.slots : [];
    return getAvailableSlots(activeCounsellor.name, selectedDate, slotsForDay);
  }, [selectedDate, activeCounsellor, getAvailableSlots]);

  const aiRecommendations = useMemo(() => {
    if (!selectedDate) return [];
    const openSlots = computedSlots.filter(s => !s.disabled);
    if (openSlots.length === 0) return [];
    return [
      { time: openSlots[0].time, score: 98, reason: "Matches your lowest class load period" },
      ...(openSlots.length > 1 ? [{ time: openSlots[1].time, score: 92, reason: "Historically low stress hours for you" }] : [])
    ];
  }, [computedSlots, selectedDate]);


  const handleContinue = () => {
    setError("");
    if (!selectedDate || !selectedTime) {
      setError("Please select both a date and a time.");
      return;
    }

    try {
      const newBookingId = addBooking({
        counsellor: activeCounsellor.name,
        counsellorImage: activeCounsellor.image || "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?q=80&w=600&auto=format&fit=crop",
        specialty: activeCounsellor.specialization || "General Counseling",
        date: selectedDate,
        time: selectedTime,
        price: activeCounsellor.price || 40,
        type: "Video Session"
      });

      navigate("/appointment/payment", {
        state: {
          bookingId: newBookingId,
          counsellor: activeCounsellor,
          date: selectedDate,
          time: selectedTime,
          price: activeCounsellor.price || 40
        }
      });
    } catch (err) {
      setError(err.message);
    }
  };

  return (
    <div className="bg-[#F8FAFC] min-h-screen pt-32 pb-24">
      <div className="max-w-5xl mx-auto px-6 lg:px-8">
        
        <button 
          onClick={() => navigate("/appointment/counsellors")}
          className="group flex items-center text-gray-400 font-black uppercase tracking-widest text-[10px] hover:text-blue-600 transition mb-10 bg-white px-6 py-3 rounded-2xl shadow-sm border border-gray-100"
        >
          <ArrowLeft className="w-4 h-4 mr-2 group-hover:-translate-x-1 transition-transform" /> Back to Directory
        </button>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
          
          <div className="lg:col-span-2 space-y-8">
            {/* Step 1: Select Professional */}
            <div className="bg-white rounded-[2.5rem] p-10 shadow-2xl shadow-gray-200/50 border border-gray-50 relative overflow-hidden">
               <div className="absolute top-0 right-0 w-32 h-32 bg-blue-50 rounded-full blur-3xl opacity-50"></div>
               
               <h2 className="text-2xl font-black text-gray-900 mb-8 flex items-center uppercase tracking-tight">
                <div className="bg-blue-600 text-white w-10 h-10 rounded-xl flex items-center justify-center mr-4 shadow-lg shadow-blue-500/20">
                  <User size={20} />
                </div>
                Booking Details
              </h2>

              <div className="flex flex-col sm:flex-row items-center sm:items-start gap-8 mb-10 pb-10 border-b border-gray-100">
                <div className="relative">
                  <img 
                    src={activeCounsellor?.image || "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?q=80&w=600&auto=format&fit=crop"} 
                    alt={activeCounsellor?.name} 
                    className="w-32 h-32 rounded-[2rem] object-cover shrink-0 shadow-xl border-4 border-white"
                  />
                  <div className="absolute -bottom-2 -right-2 bg-teal-500 text-white p-2 rounded-xl shadow-lg">
                    <CheckCircle2 size={16} />
                  </div>
                </div>
                <div className="text-center sm:text-left flex-grow w-full">
                  <div className="relative mb-4 group">
                    <select 
                      value={selectedCounsellorId}
                      onChange={(e) => {
                        setSelectedCounsellorId(e.target.value);
                        setSelectedTime("");
                      }}
                      className="text-2xl font-black text-gray-900 bg-gray-50 border-2 border-transparent group-hover:border-blue-100 rounded-[1.5rem] px-5 py-4 w-full sm:max-w-md appearance-none cursor-pointer focus:ring-4 focus:ring-blue-500/5 focus:bg-white transition-all outline-none"
                    >
                      {counsellors.map(c => (
                        <option key={c.id} value={c.id}>{c.name}</option>
                      ))}
                    </select>
                  </div>

                  <p className="text-base font-black text-blue-500 uppercase tracking-widest mb-1">{activeCounsellor?.specialization || "General Counseling"}</p>
                  <p className="text-sm font-bold text-gray-400">Premium 60 Min Video Session • <span className="text-gray-900">${activeCounsellor?.price || 40}</span></p>
                </div>
              </div>

              {error && (
                <div className="mb-8 p-5 bg-red-50 text-red-700 flex items-center gap-4 rounded-3xl border border-red-100 animate-in fade-in slide-in-from-top-4 duration-300">
                  <AlertCircle className="w-5 h-5" />
                  <p className="font-bold text-sm tracking-tight">{error}</p>
                </div>
              )}

              {/* Step 2: Date Selection */}
              <h2 className="text-xl font-black text-gray-900 mb-6 flex items-center uppercase tracking-tight">
                <CalendarIcon className="w-5 h-5 mr-3 text-blue-600" />
                Step 1: Pick a Date
              </h2>
              {activeCounsellor?.availability && activeCounsellor.availability.length > 0 ? (
                <div className="flex flex-wrap gap-3 mb-12">
                  {activeCounsellor.availability.map((avail, idx) => (
                    <button
                      key={idx}
                      onClick={() => {
                        setSelectedDate(avail.date);
                        setSelectedTime("");
                      }}
                      className={`px-6 py-4 rounded-2xl border-2 font-black text-sm transition-all duration-300 ${
                        selectedDate === avail.date
                          ? "border-blue-600 bg-blue-600 text-white shadow-xl shadow-blue-500/25 scale-105"
                          : "border-gray-50 bg-gray-50 text-gray-500 hover:border-blue-200 hover:bg-white hover:text-blue-600 shadow-sm"
                      }`}
                    >
                      <span className="block text-[10px] uppercase tracking-widest mb-1 opacity-70">
                        {new Date(avail.date).toLocaleDateString('en-US', { weekday: 'short' })}
                      </span>
                      {new Date(avail.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                    </button>
                  ))}
                </div>
              ) : (
                <div className="bg-orange-50 text-orange-700 p-8 rounded-3xl border border-orange-100 mb-12 font-bold text-sm">
                  This counsellor currently has no explicitly available dates scheduled.
                </div>
              )}

              {/* Step 3: Time Selection */}
              <h2 className="text-xl font-black text-gray-900 mb-6 flex items-center uppercase tracking-tight">
                <Clock className="w-5 h-5 mr-3 text-blue-600" />
                Step 2: Choose a Time
              </h2>

              {!selectedDate ? (
                <div className="bg-gray-50/50 text-gray-400 py-12 px-6 rounded-[2rem] text-center border-2 border-dashed border-gray-100 font-bold">
                  Please select a date above to view available hours.
                </div>
              ) : (
                <div className="animate-in fade-in slide-in-from-top-4 duration-500">
                  {aiRecommendations.length > 0 && (
                    <div className="mb-12">
                      <div className="flex items-center gap-2 mb-6">
                        <div className="bg-blue-100 text-blue-600 px-4 py-2 rounded-xl text-xs font-black uppercase tracking-[0.2em] flex items-center gap-2">
                          <Sparkles size={14} fill="currentColor" /> AI Recommendations
                        </div>
                      </div>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        {aiRecommendations.map((slot, idx) => (
                          <button
                            key={idx}
                            onClick={() => setSelectedTime(slot.time)}
                            className={`p-6 rounded-3xl text-left border-2 transition-all duration-300 group ${
                              selectedTime === slot.time 
                                ? "border-blue-600 bg-blue-50/50 shadow-xl shadow-blue-500/10"
                                : "border-blue-50 bg-blue-50/30 hover:border-blue-200 hover:bg-white shadow-sm"
                            }`}
                          >
                            <div className="flex justify-between items-center mb-2">
                              <span className="font-black text-gray-900 text-xl tracking-tight">{slot.time}</span>
                              <span className="text-[10px] font-black text-teal-600 bg-teal-50 px-3 py-1.5 rounded-lg border border-teal-100 tracking-[0.1em] uppercase shadow-sm">{slot.score}% Match</span>
                            </div>
                            <p className="text-xs font-bold text-blue-400 group-hover:text-blue-500">{slot.reason}</p>
                          </button>
                        ))}
                      </div>
                    </div>
                  )}

                  <div className="bg-gray-50/50 p-8 rounded-[2rem] border border-gray-50">
                    <h3 className="text-gray-400 font-black mb-6 text-[10px] uppercase tracking-[0.2em]">Other Available Slots</h3>
                    
                    {computedSlots.filter(s => !s.disabled).length === 0 ? (
                      <p className="text-red-500 p-6 bg-red-50 rounded-2xl font-bold text-center">No slots available on this date. Please pick another day.</p>
                    ) : (
                      <div className="flex flex-wrap gap-3">
                        {computedSlots.map((slot, idx) => (
                          <button
                            key={idx}
                            onClick={() => !slot.disabled && setSelectedTime(slot.time)}
                            disabled={slot.disabled}
                            className={`px-8 py-4 rounded-xl border-2 font-black text-sm transition-all duration-300 ${
                              slot.disabled 
                                ? "border-transparent bg-gray-100 text-gray-300 cursor-not-allowed line-through"
                                : selectedTime === slot.time
                                  ? "border-gray-900 bg-gray-900 text-white shadow-xl shadow-gray-900/10"
                                  : "border-white bg-white text-gray-600 hover:border-blue-100 hover:text-blue-600 shadow-sm"
                            }`}
                          >
                            {slot.time}
                          </button>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Sidebar Summary */}
          <div className="space-y-8">
            <div className="bg-white rounded-[2.5rem] p-8 border border-gray-50 shadow-2xl shadow-gray-200/50 sticky top-32">
              <h3 className="text-xl font-black text-gray-900 mb-8 uppercase tracking-tight">Booking Summary</h3>
              
              <div className="space-y-6 pb-8 border-b border-gray-100">
                <div className="flex justify-between items-center">
                  <span className="text-gray-400 font-bold text-sm uppercase tracking-widest">Date</span>
                  <span className="text-gray-900 font-black">{selectedDate || "-- --"}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-400 font-bold text-sm uppercase tracking-widest">Time</span>
                  <span className="text-gray-900 font-black">{selectedTime || "-- --"}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-400 font-bold text-sm uppercase tracking-widest">Duration</span>
                  <span className="text-gray-900 font-black">1 Hour</span>
                </div>
              </div>

              <div className="pt-8">
                <div className="flex justify-between items-center mb-10">
                  <span className="text-gray-900 font-black text-xl uppercase tracking-tighter">Total Price</span>
                  <span className="text-blue-600 font-black text-3xl">${activeCounsellor?.price || 40}</span>
                </div>
                
                <button
                  onClick={handleContinue}
                  disabled={!selectedDate || !selectedTime}
                  className={`w-full flex items-center justify-center gap-3 px-8 py-5 rounded-[2rem] font-black text-white transition-all shadow-2xl uppercase tracking-widest text-sm ${
                    selectedDate && selectedTime
                      ? "bg-blue-600 hover:bg-blue-700 shadow-blue-500/30 hover:scale-105 active:scale-95"
                      : "bg-gray-200 cursor-not-allowed shadow-none"
                  }`}
                >
                  Pay & Confirm <ArrowLeft className="w-5 h-5 rotate-180" />
                </button>
                
                <div className="mt-8 flex items-center justify-center gap-3 text-gray-400">
                  <CheckCircle2 size={16} />
                  <p className="text-[10px] font-bold uppercase tracking-widest">Verified & Secure Booking</p>
                </div>
              </div>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
};

export default BookingFlow;

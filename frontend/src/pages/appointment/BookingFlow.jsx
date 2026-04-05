import { useState, useMemo } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { ArrowLeft, Calendar as CalendarIcon, Clock, Sparkles, AlertCircle, User } from "lucide-react";
import { useBooking } from "../../context/BookingContext";
import { useCounsellorContext } from "../../context/CounsellorContext";

const BookingFlow = () => {
  const { counsellorId } = useParams();
  const navigate = useNavigate();
  const { addBooking, getAvailableSlots } = useBooking();
  const { counsellors } = useCounsellorContext();
  
  // Set default counsellor from URL param or default to first
  const initialCounsellor = counsellors.find(c => c.id === counsellorId) || counsellors[0];
  const [selectedCounsellorId, setSelectedCounsellorId] = useState(initialCounsellor?.id);

  const activeCounsellor = counsellors.find(c => c.id === selectedCounsellorId) || counsellors[0];

  const [selectedDate, setSelectedDate] = useState("");
  const [selectedTime, setSelectedTime] = useState("");
  const [error, setError] = useState("");

  // Dynamically compute available slots whenever date or counsellor changes
  const computedSlots = useMemo(() => {
    if (!selectedDate || !activeCounsellor) return [];
    
    // Find the counsellor's configured slots for the selected date
    const dayAvail = activeCounsellor.availability?.find(a => a.date === selectedDate);
    const slotsForDay = dayAvail ? dayAvail.slots : [];
    
    return getAvailableSlots(activeCounsellor.name, selectedDate, slotsForDay);
  }, [selectedDate, activeCounsellor, getAvailableSlots]);

  // Dynamically generated smart recommendations based on open slots
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
    <div className="bg-gray-50 min-h-screen pt-12 pb-24">
      <div className="max-w-4xl mx-auto px-6 lg:px-8">
        
        <button 
          onClick={() => navigate("/appointment/counsellors")}
          className="flex items-center text-gray-500 hover:text-gray-900 transition mb-8"
        >
          <ArrowLeft className="w-4 h-4 mr-2" /> Back to Directory
        </button>

        <div className="bg-white rounded-3xl p-8 border border-gray-100 shadow-sm mb-8">
          <h2 className="text-xl font-bold text-gray-900 mb-6 flex items-center">
            <User className="w-5 h-5 mr-3 text-blue-600" />
            Select Professional
          </h2>

            <div className="flex flex-col sm:flex-row items-center sm:items-start gap-6 border-b border-gray-100 pb-8 mb-8">
            <img 
              src={activeCounsellor?.image || "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?q=80&w=600&auto=format&fit=crop"} 
              alt={activeCounsellor?.name} 
              className="w-24 h-24 rounded-full object-cover shrink-0 ring-4 ring-blue-50"
            />
            <div className="text-center sm:text-left flex-grow w-full">
              <select 
                value={selectedCounsellorId}
                onChange={(e) => {
                  setSelectedCounsellorId(e.target.value);
                  setSelectedTime(""); // Reset time when counsellor changes
                }}
                className="text-xl font-bold text-gray-900 bg-gray-50 border border-gray-200 rounded-xl p-3 w-full sm:max-w-xs mb-3 focus:ring-blue-500 focus:border-blue-500 cursor-pointer"
              >
                {counsellors.map(c => (
                  <option key={c.id} value={c.id}>{c.name}</option>
                ))}
              </select>

              <p className="text-teal-600 font-medium mb-1">{activeCounsellor?.specialization || "General Counseling"}</p>
              <p className="text-sm text-gray-500">60 Min Video Session • ${activeCounsellor?.price || 40}</p>
            </div>
          </div>

          {error && (
            <div className="mb-6 p-4 bg-red-50 text-red-700 flex items-center gap-3 rounded-xl border border-red-100 animate-slide-up">
              <AlertCircle className="w-5 h-5" />
              <p className="font-medium text-sm">{error}</p>
            </div>
          )}

          <h2 className="text-xl font-bold text-gray-900 mb-6 flex items-center">
            <CalendarIcon className="w-5 h-5 mr-3 text-blue-600" />
            Pick a Date
          </h2>
          {activeCounsellor?.availability && activeCounsellor.availability.length > 0 ? (
            <div className="flex flex-wrap gap-3 mb-10">
              {activeCounsellor.availability.map((avail, idx) => (
                <button
                  key={idx}
                  onClick={() => {
                    setSelectedDate(avail.date);
                    setSelectedTime("");
                  }}
                  className={`px-5 py-3 rounded-xl border font-medium transition ${
                    selectedDate === avail.date
                      ? "border-blue-600 bg-blue-600 text-white shadow-md"
                      : "border-gray-200 bg-white text-gray-700 hover:border-blue-300 hover:bg-blue-50 shadow-sm"
                  }`}
                >
                  {new Date(avail.date).toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' })}
                </button>
              ))}
            </div>
          ) : (
            <div className="bg-orange-50 text-orange-700 p-6 rounded-xl border border-orange-200 mb-10">
              This counsellor currently has no explicitly available dates scheduled.
            </div>
          )}

          <h2 className="text-xl font-bold text-gray-900 mb-6 flex items-center">
            <Clock className="w-5 h-5 mr-3 text-blue-600" />
            Select Appointment Time
          </h2>

          {!selectedDate ? (
            <div className="bg-gray-50 text-gray-500 p-6 rounded-xl text-center border border-dashed border-gray-300">
              Please select a date to view available times for {activeCounsellor.name}.
            </div>
          ) : (
            <>
              {aiRecommendations.length > 0 && (
                <div className="mb-10 animate-fade-in">
                  <h3 className="flex items-center text-blue-700 font-semibold mb-4 bg-blue-50 w-max px-3 py-1.5 rounded-lg text-sm">
                    <Sparkles className="w-4 h-4 mr-2 fill-blue-600" /> AI Smart Suggestions
                  </h3>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {aiRecommendations.map((slot, idx) => (
                      <button
                        key={idx}
                        onClick={() => setSelectedTime(slot.time)}
                        className={`p-4 rounded-xl text-left border-2 transition ${
                          selectedTime === slot.time 
                            ? "border-blue-600 bg-blue-50/50"
                            : "border-blue-100 bg-white hover:border-blue-300 shadow-sm hover:shadow-md"
                        }`}
                      >
                        <div className="flex justify-between items-center mb-1">
                          <span className="font-bold text-gray-900 text-lg">{slot.time}</span>
                          <span className="text-xs font-bold text-teal-600 bg-teal-50 px-2 py-1 rounded">{slot.score}% Match</span>
                        </div>
                        <p className="text-xs text-gray-500">{slot.reason}</p>
                      </button>
                    ))}
                  </div>
                </div>
              )}

              <div>
                <h3 className="text-gray-700 font-medium mb-4 text-sm uppercase tracking-wide">All Available Slots</h3>
                
                {computedSlots.filter(s => !s.disabled).length === 0 ? (
                  <p className="text-red-500 p-4 bg-red-50 rounded-lg">No slots available on this date. Please pick another day.</p>
                ) : (
                  <div className="flex flex-wrap gap-3">
                    {computedSlots.map((slot, idx) => (
                      <button
                        key={idx}
                        onClick={() => !slot.disabled && setSelectedTime(slot.time)}
                        disabled={slot.disabled}
                        title={slot.reason}
                        className={`px-6 py-3 rounded-xl border font-medium transition ${
                          slot.disabled 
                            ? "border-gray-100 bg-gray-50 text-gray-400 cursor-not-allowed line-through"
                            : selectedTime === slot.time
                              ? "border-gray-900 bg-gray-900 text-white"
                              : "border-gray-200 bg-white text-gray-700 hover:border-gray-300 hover:bg-gray-50 shadow-sm"
                        }`}
                      >
                        {slot.time}
                      </button>
                    ))}
                  </div>
                )}
              </div>
            </>
          )}

          <div className="mt-12 pt-8 border-t border-gray-100 flex justify-end">
            <button
              onClick={handleContinue}
              className={`flex items-center px-8 py-4 rounded-xl font-semibold text-white transition ${
                selectedDate && selectedTime
                  ? "bg-blue-600 hover:bg-blue-700 shadow-lg"
                  : "bg-blue-300 cursor-not-allowed"
              }`}
            >
              Continue to Payment <ArrowLeft className="w-5 h-5 ml-2 rotate-180" />
            </button>
          </div>
        </div>

      </div>
    </div>
  );
};

export default BookingFlow;

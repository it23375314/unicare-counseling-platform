import { useState } from "react";
import { useAuth } from "../../context/AuthContext";
import { useCounsellorContext } from "../../context/CounsellorContext";
import { useBooking } from "../../context/BookingContext";
import { Calendar, Clock, CheckCircle, XCircle, FileText, Activity } from "lucide-react";

export default function CounsellorDashboard() {
  const { user } = useAuth();
  const { getCounsellorById, updateAvailability } = useCounsellorContext();
  const { bookings, acceptBooking, rejectBooking, addSessionNotes } = useBooking();

  const counsellor = getCounsellorById(user.id);
  const [activeTab, setActiveTab] = useState("availability");

  // For Availability
  const [selectedDate, setSelectedDate] = useState("");
  const [selectedSlots, setSelectedSlots] = useState([]);
  const [slotInput, setSlotInput] = useState("");

  const handleAddSlot = () => {
    if (!slotInput) return;
    if (!selectedSlots.includes(slotInput)) {
      setSelectedSlots([...selectedSlots, slotInput]);
    }
    setSlotInput("");
  };

  const handleSaveAvailability = () => {
    if (!selectedDate) {
      alert("Please select a date first.");
      return;
    }
    const today = new Date().toISOString().split('T')[0];
    if (selectedDate < today) {
      alert("Must choose a future date.");
      return;
    }
    updateAvailability(counsellor.id, selectedDate, selectedSlots);
  };

  const handleDateChange = (e) => {
    const date = e.target.value;
    setSelectedDate(date);
    const existing = counsellor?.availability?.find(a => a.date === date);
    setSelectedSlots(existing ? existing.slots : []);
  };

  // For Appointments
  const myBookings = bookings.filter(b => b.counsellor === counsellor?.name);
  const pendingBookings = myBookings.filter(b => b.status === "Pending");
  const historyBookings = myBookings.filter(b => b.status !== "Pending");

  // For Session Notes
  const [showNoteModal, setShowNoteModal] = useState(false);
  const [currentBookingId, setCurrentBookingId] = useState(null);
  const [noteText, setNoteText] = useState("");
  const [riskLevel, setRiskLevel] = useState(null);

  const calculateRisk = (text) => {
    const lower = text.toLowerCase();
    if (lower.includes("suicide") || lower.includes("harm") || lower.includes("severe")) {
      return { level: "High Risk", color: "bg-red-100 text-red-800" };
    }
    if (lower.includes("stress") || lower.includes("anxiety") || lower.includes("panic")) {
      return { level: "Medium Risk", color: "bg-yellow-100 text-yellow-800" };
    }
    return { level: "Low Risk", color: "bg-green-100 text-green-800" };
  };

  const handleNoteChange = (e) => {
    setNoteText(e.target.value);
    setRiskLevel(calculateRisk(e.target.value));
  };

  const saveNotes = () => {
    addSessionNotes(currentBookingId, noteText);
    setShowNoteModal(false);
  };

  const openNotes = (booking) => {
    setCurrentBookingId(booking.id);
    setNoteText(booking.notes || "");
    setRiskLevel(booking.notes ? calculateRisk(booking.notes) : null);
    setShowNoteModal(true);
  };

  if (user.role !== "counsellor" || !counsellor) {
    return <div className="text-center py-20">Access Denied. Counsellors only.</div>;
  }

  return (
    <div className="bg-gray-50 min-h-screen pt-12 pb-24">
      <div className="max-w-7xl mx-auto px-6 lg:px-8">
        <h1 className="text-3xl font-extrabold text-gray-900 font-serif mb-2">Welcome, {counsellor.name}</h1>
        <p className="text-gray-600 mb-8">Manage your schedule, view appointments, and add session notes.</p>

        {/* Tabs */}
        <div className="flex space-x-4 border-b border-gray-200 mb-8">
          {["availability", "appointments", "history"].map(tab => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`pb-4 px-2 font-medium text-sm transition ${activeTab === tab ? "border-b-2 border-blue-600 text-blue-600" : "text-gray-500 hover:text-gray-700"}`}
            >
              {tab.charAt(0).toUpperCase() + tab.slice(1)}
            </button>
          ))}
        </div>

        {/* Availability Tab */}
        {activeTab === "availability" && (
          <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
            <h2 className="text-xl font-bold mb-4">Set Availability</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Select Date (Future Only)</label>
                <input type="date" value={selectedDate} onChange={handleDateChange} className="w-full border border-gray-300 rounded-lg p-3 focus:ring-2 focus:ring-blue-600" min={new Date().toISOString().split('T')[0]} />
                
                {selectedDate && (
                  <div className="mt-6">
                    <label className="block text-sm font-medium text-gray-700 mb-2">Add Time Slot</label>
                    <div className="flex gap-2">
                      <input type="time" value={slotInput} onChange={e => setSlotInput(e.target.value)} className="border border-gray-300 rounded-lg p-3 flex-grow focus:ring-2 focus:ring-blue-600" />
                      <button onClick={handleAddSlot} className="bg-gray-100 px-4 py-2 rounded-lg font-medium hover:bg-gray-200">Add</button>
                    </div>
                  </div>
                )}
              </div>
              
              <div>
                <h3 className="text-sm font-medium text-gray-700 mb-2">Slots for {selectedDate || "selected date"}</h3>
                <div className="flex flex-wrap gap-2 mb-6">
                  {selectedSlots.map(slot => (
                    <div key={slot} className="bg-blue-50 text-blue-700 px-3 py-1.5 rounded-full text-sm font-semibold flex items-center gap-2">
                      {slot} <button onClick={() => setSelectedSlots(selectedSlots.filter(s => s !== slot))} className="text-blue-400 hover:text-blue-900"><XCircle size={14}/></button>
                    </div>
                  ))}
                  {selectedSlots.length === 0 && <p className="text-gray-500 text-sm">No slots added yet.</p>}
                </div>
                <button onClick={handleSaveAvailability} className="w-full bg-blue-600 hover:bg-blue-700 text-white font-medium py-3 rounded-xl transition shadow-sm">Save Availability</button>
              </div>
            </div>
            
            <div className="mt-8 pt-8 border-t border-gray-100">
              <h3 className="font-bold text-gray-800 mb-4">Current Schedule</h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
                {counsellor.availability?.map(avail => (
                  <div key={avail.date} className="bg-gray-50 border border-gray-200 rounded-xl p-4">
                    <div className="font-semibold text-gray-900 flex items-center gap-2 mb-2"><Calendar size={16}/> {avail.date}</div>
                    <div className="text-sm text-gray-600 space-y-1">
                      {avail.slots.map(s => <div key={s} className="flex items-center gap-2"><Clock size={14}/> {s}</div>)}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Appointments Tab */}
        {activeTab === "appointments" && (
          <div className="space-y-4">
            {pendingBookings.length === 0 ? (
              <div className="text-center py-10 bg-white rounded-2xl border border-gray-100">No pending requests!</div>
            ) : (
              pendingBookings.map(b => (
                <div key={b.id} className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                  <div>
                    <h3 className="font-bold text-gray-900 text-lg">{b.studentName || "Student"}</h3>
                    <p className="text-gray-500 text-sm">{b.studentEmail || "No Email"}</p>
                    <div className="flex gap-4 mt-2 text-sm text-gray-600">
                      <span className="flex items-center gap-1"><Calendar size={14}/>{b.date}</span>
                      <span className="flex items-center gap-1"><Clock size={14}/>{b.time}</span>
                    </div>
                  </div>
                  <div className="flex gap-2 w-full sm:w-auto">
                    <button onClick={() => acceptBooking(b.id)} className="flex-1 sm:flex-none justify-center bg-green-50 text-green-700 border border-green-200 hover:bg-green-100 px-4 py-2 rounded-lg font-medium flex items-center gap-2 transition"><CheckCircle size={16}/> Accept</button>
                    <button onClick={() => { const reason = window.prompt("Reason for rejection:"); if(reason !== null) rejectBooking(b.id, reason); }} className="flex-1 sm:flex-none justify-center bg-red-50 text-red-700 border border-red-200 hover:bg-red-100 px-4 py-2 rounded-lg font-medium flex items-center gap-2 transition"><XCircle size={16}/> Reject</button>
                  </div>
                </div>
              ))
            )}
          </div>
        )}

        {/* History Tab */}
        {activeTab === "history" && (
          <div className="space-y-4">
            {historyBookings.map(b => (
              <div key={b.id} className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <div>
                  <h3 className="font-bold text-gray-900">{b.studentName || "Student"} <span className={`text-xs px-2 py-1 rounded ml-2 ${b.status === 'Accepted' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>{b.status}</span></h3>
                  <div className="text-sm text-gray-600 mt-1">{b.date} at {b.time}</div>
                  {b.rejectReason && <p className="text-sm text-red-600 mt-2">Reason: {b.rejectReason}</p>}
                </div>
                {b.status === "Accepted" && (
                  <button onClick={() => openNotes(b)} className="bg-blue-50 text-blue-700 hover:bg-blue-100 px-4 py-2 rounded-lg font-medium flex items-center gap-2 transition">
                    <FileText size={16} /> {b.notes ? "Edit Notes" : "Add Notes"}
                  </button>
                )}
              </div>
            ))}
            {historyBookings.length === 0 && <div className="text-center py-10">No history yet.</div>}
          </div>
        )}

      </div>

      {/* Note Modal */}
      {showNoteModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl p-6 w-full max-w-xl shadow-2xl">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-2xl font-bold text-gray-900">Session Notes</h2>
              {riskLevel && (
                <div className={`flex items-center gap-2 px-3 py-1 rounded-full text-sm font-semibold ${riskLevel.color}`}>
                  <Activity size={16}/> AI: {riskLevel.level} 
                </div>
              )}
            </div>
            <textarea
              value={noteText}
              onChange={handleNoteChange}
              placeholder="e.g. Student shows signs of stress. Recommend follow-up."
              rows={6}
              className="w-full border border-gray-300 rounded-xl p-4 focus:ring-2 focus:ring-blue-600 mb-6 text-sm outline-none"
            />
            <div className="flex justify-end gap-3">
              <button onClick={() => setShowNoteModal(false)} className="px-5 py-2 hover:bg-gray-100 rounded-lg font-medium text-gray-700">Cancel</button>
              <button onClick={saveNotes} className="px-5 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium shadow-sm">Save Notes</button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}

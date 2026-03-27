import { useState, useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import { useCounsellorContext } from "../../context/CounsellorContext";
import { useBooking } from "../../context/BookingContext";
import { useSessionNotes } from "../../context/SessionNoteContext";
import { Calendar, Clock, CheckCircle, XCircle, FileText, Activity, Search, Filter, Plus, MessageCircle, Sparkles, AlertTriangle, Eye, Pencil } from "lucide-react";

export default function CounsellorDashboard() {
  const { user } = useAuth();
  const { getCounsellorById, updateAvailability } = useCounsellorContext();
  const { bookings, confirmBookingByCounsellor, cancelBookingByCounsellor, completeBooking } = useBooking();
  const { notes, addNote, updateNote, deleteNote, getNoteByBookingId } = useSessionNotes();

  const counsellor = getCounsellorById(user.id);
  const location = useLocation();
  const navigate = useNavigate();

  const hasChatHistory = (studentName) => {
    if (!studentName) return false;
    const key = `unicare_chat_${studentName.replace(/\s+/g, '_')}`;
    return localStorage.getItem(key) !== null;
  };

  const path = location.pathname;
  let activeTab = "availability";
  if (path.includes("appointments")) activeTab = "appointments";
  else if (path.includes("history")) activeTab = "history";
  else if (path.includes("notes")) activeTab = "session notes";

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

  // For Appointments Tab
  const safeBookings = Array.isArray(bookings) ? bookings : [];
  const myBookings = safeBookings.filter(b => b?.counsellor === counsellor?.name);
  
  const [searchApptStudent, setSearchApptStudent] = useState("");
  const [filterApptDate, setFilterApptDate] = useState("");
  const [filterApptStatus, setFilterApptStatus] = useState("");
  const [filterApptTiming, setFilterApptTiming] = useState("All");
  const [debouncedSearchAppt, setDebouncedSearchAppt] = useState("");
  const [apptSearchError, setApptSearchError] = useState("");
  const [formData, setFormData] = useState({ id: null, title: "", notes: "", riskLevel: "Low", followUpRecommendation: "", status: "Draft", aiAnalysis: null });
  const [isViewOnly, setIsViewOnly] = useState(false);
  const [errors, setErrors] = useState({});

  useEffect(() => {
    const timer = setTimeout(() => {
      const trimmed = searchApptStudent.trim();
      
      if (trimmed === "") {
        setDebouncedSearchAppt("");
        setApptSearchError("");
        return;
      }
      
      if (trimmed.length < 2) {
        setDebouncedSearchAppt("");
        setApptSearchError(""); // No error for short input per requirement, just don't trigger
        return;
      }

      if (trimmed.length > 50) {
        setApptSearchError("Search term too long (max 50 chars)");
        setDebouncedSearchAppt("");
        return;
      }

      // Allow letters, numbers, spaces, and hyphens
      if (/^[^a-zA-Z0-9\s-]+$/.test(trimmed)) {
        setApptSearchError("Please enter a valid search term");
        setDebouncedSearchAppt("");
        return;
      }

      setApptSearchError("");
      setDebouncedSearchAppt(trimmed);
    }, 400);

    return () => clearTimeout(timer);
  }, [searchApptStudent]);

  const validateForm = () => {
    const newErrors = {};
    if (!selectedBookingId) newErrors.selectedBookingId = "Please select a completed appointment";
    
    if (!noteTitle.trim()) newErrors.noteTitle = "Please enter a note title";
    else if (noteTitle.trim().length < 3) newErrors.noteTitle = "Note title must be at least 3 characters";
    
    if (!riskLevel) newErrors.riskLevel = "Please select a risk level";
    
    if (!noteText.trim()) newErrors.noteText = "Please enter detailed session notes";
    else if (noteText.trim().length < 10) newErrors.noteText = "Detailed session notes must be at least 10 characters";
    
    if (!recommendation.trim()) newErrors.recommendation = "Please enter follow-up recommendation";
    else if (recommendation.trim().length < 5) newErrors.recommendation = "Follow-up recommendation must be at least 5 characters";

    if (!existingNoteId && selectedBookingId) {
      const alreadyExists = getNoteByBookingId(selectedBookingId);
      if (alreadyExists) newErrors.selectedBookingId = "A session note already exists for this appointment";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const isPastAppointment = (dateStr, timeStr) => {
    if (!dateStr || !timeStr || typeof timeStr !== 'string') return false;
    const match12 = timeStr.match(/(\d+):(\d+)\s?(AM|PM)/i);
    if (!match12) return false;
    let [_, hours, minutes, modifier] = match12;
    hours = parseInt(hours, 10);
    if (hours === 12) {
      hours = modifier.toUpperCase() === "AM" ? 0 : 12;
    } else if (modifier.toUpperCase() === "PM") {
      hours += 12;
    }
    try {
      const apptDate = new Date(`${dateStr}T${hours.toString().padStart(2, '0')}:${minutes}:00`);
      return apptDate < new Date();
    } catch (e) {
      return false;
    }
  };

  // Filter Appointments

  
  const filteredAppointments = myBookings.filter(b => {
    const actName = (b?.studentName || b?.name || "Unknown Student");
    const safeSid = (b?.studentId || "").toString();
    const safeAid = (b?.id || "").toString();
    
    // Multi-field search
    const term = (debouncedSearchAppt || "").toLowerCase();
    const nameMatch = actName.toLowerCase().includes(term);
    const idMatch = safeSid.toLowerCase().includes(term) || safeAid.toLowerCase().includes(term);
    
    const searchMatch = !term || nameMatch || idMatch;
    const dateMatch = filterApptDate ? b?.date === filterApptDate : true;
    const statusMatch = filterApptStatus ? b?.status === filterApptStatus : true;
    
    let timingMatch = true;
    if (filterApptTiming === "Past") timingMatch = isPastAppointment(b?.date, b?.time);
    else if (filterApptTiming === "Upcoming") timingMatch = !isPastAppointment(b?.date, b?.time);
    
    return searchMatch && dateMatch && statusMatch && timingMatch;
  });

  const completedBookingsForNotes = myBookings
    .filter(b => b?.status === "Completed")
    .sort((a, b) => {
      try {
        return new Date((b?.date || "") + ' ' + (b?.time || "")) - new Date((a?.date || "") + ' ' + (a?.time || ""));
      } catch (e) { return 0; }
    })
    .reverse();

  const rawHistoryBookings = myBookings.filter(b => b && (b.status === "Completed" || b.status === "Cancelled" || b.status === "Rejected" || b.status === "Accepted"));

  // Filter History Tab
  const [searchHistory, setSearchHistory] = useState("");
  const [filterDateHistory, setFilterDateHistory] = useState("");

  const historyBookings = rawHistoryBookings.filter(b => {
    const nameMatch = (b.studentName || "Student").toLowerCase().includes(searchHistory.toLowerCase());
    const dateMatch = filterDateHistory ? b.date === filterDateHistory : true;
    return nameMatch && dateMatch;
  });

  // Filter Session Notes Tab
  const [searchNotes, setSearchNotes] = useState("");
  const [debouncedSearchNotes, setDebouncedSearchNotes] = useState("");
  const [searchNotesError, setSearchNotesError] = useState("");
  const [filterDateNotes, setFilterDateNotes] = useState("");
  const [filterRiskNotes, setFilterRiskNotes] = useState("");

  useEffect(() => {
    const timer = setTimeout(() => {
      const trimmed = searchNotes.trim();
      
      if (trimmed === "") {
        setDebouncedSearchNotes("");
        setSearchNotesError("");
        return;
      }
      
      if (trimmed.length < 2) {
        setDebouncedSearchNotes("");
        setSearchNotesError("");
        return;
      }

      if (/^[^a-zA-Z0-9]+$/.test(trimmed)) {
        setSearchNotesError("Please enter a valid search term");
        setDebouncedSearchNotes("");
        return;
      }

      setSearchNotesError("");
      setDebouncedSearchNotes(trimmed);
    }, 400);

    return () => clearTimeout(timer);
  }, [searchNotes]);

  const safeNotes = Array.isArray(notes) ? notes : [];
  const myNotes = safeNotes.filter(n => n.counsellorId === counsellor?.id);
  const filteredNotes = myNotes.filter(n => {
    const term = (debouncedSearchNotes || "").toLowerCase();
    const nameMatch = (n.studentName || "N/A").toLowerCase().includes(term);
    const titleMatch = (n.title || "").toLowerCase().includes(term);
    const textMatch = (n.notes || "").toLowerCase().includes(term);
    
    const matchesSearch = !term || nameMatch || titleMatch || textMatch;
    const dateMatch = filterDateNotes ? n.sessionDate === filterDateNotes : true;
    const riskMatch = filterRiskNotes ? n.riskLevel === filterRiskNotes : true;
    return matchesSearch && dateMatch && riskMatch;
  });

  // For Session Notes Modal
  const [showNoteModal, setShowNoteModal] = useState(false);
  const [currentBooking, setCurrentBooking] = useState(null);
  const [existingNoteId, setExistingNoteId] = useState(null);
  const [selectedBookingId, setSelectedBookingId] = useState("");
  
  const [noteTitle, setNoteTitle] = useState("");
  const [noteText, setNoteText] = useState("");
  const [riskLevel, setRiskLevel] = useState("Low");
  const [recommendation, setRecommendation] = useState("");
  const [noteStatus, setNoteStatus] = useState("Draft");
  
  // AI Risk State
  const [aiAnalysis, setAiAnalysis] = useState(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);

  const analyzeRisk = () => {
    if (!noteText.trim()) {
      alert("Please write some session notes first.");
      return;
    }
    
    setIsAnalyzing(true);
    
    // Simulate AI delay
    setTimeout(() => {
      const t = noteText.toLowerCase();
      let indicators = [];
      let totalScore = 0;
      
      const keywords = {
        High: { words: ['suicide', 'self-harm', 'kill myself', 'kill', 'hopeless', 'end it all', 'severe depression'], score: 5 },
        Medium: { words: ['depression', 'anxiety', 'panic', 'withdrawal', 'trauma', 'aggression', 'instability'], score: 3 },
        Low: { words: ['stress', 'tired', 'exam pressure', 'overwhelmed', 'sad'], score: 1 },
      };

      Object.entries(keywords).forEach(([category, data]) => {
        data.words.forEach(w => {
          if (t.includes(w)) {
            indicators.push(w);
            totalScore += data.score;
          }
        });
      });

      let level = "Low";
      let action = "monitor student condition";
      let reason = `Risk Score: ${totalScore}. No major concerning keywords detected. General observation recommended.`;

      if (totalScore >= 10) {
        level = "Critical";
        action = "emergency support referral";
        reason = `Risk Score: ${totalScore}. Detected multiple high severity indicators.`;
      } else if (totalScore >= 6) {
        level = "High";
        action = "urgent counsellor review";
        reason = `Risk Score: ${totalScore}. Detected high-risk indicators requiring urgent review.`;
      } else if (totalScore >= 3) {
        level = "Medium";
        action = "schedule another counselling session";
        reason = `Risk Score: ${totalScore}. Detected moderate indicators such as anxiety or depression.`;
      } else if (totalScore > 0) {
         reason = `Risk Score: ${totalScore}. Detected minor stressors. Monitor baseline.`;
      }

      setAiAnalysis({
        suggestedRisk: level,
        indicators,
        reason,
        suggestedAction: action
      });
      setIsAnalyzing(false);
    }, 1200);
  };

  const populateForm = (note) => {
    setExistingNoteId(note.id);
    setNoteTitle(note.title);
    setNoteText(note.notes);
    setRiskLevel(note.riskLevel);
    setRecommendation(note.followUpRecommendation);
    setNoteStatus(note.status);
    setAiAnalysis(note.aiAnalysis || null);
    setErrors({});
  };

  const populateEmpty = () => {
    setExistingNoteId(null);
    setNoteTitle("");
    setNoteText("");
    setRiskLevel("Low");
    setRecommendation("");
    setNoteStatus("Draft");
    setAiAnalysis(null);
    setErrors({});
  };

  const openNotesModal = (itemType, data, viewOnly = false) => {
    setIsViewOnly(viewOnly);
    if (itemType === "booking") {
      setCurrentBooking(data);
      setSelectedBookingId(data.id);
      const existing = getNoteByBookingId(data.id);
      if (existing) populateForm(existing); else populateEmpty();
    } else if (itemType === "note") {
      const booking = rawHistoryBookings.find(b => b.id === data.appointmentId);
      setCurrentBooking(booking || null);
      setSelectedBookingId(data.appointmentId);
      populateForm(data);
    } else if (itemType === "new") {
      setCurrentBooking(null);
      setSelectedBookingId("");
      populateEmpty();
    }
    setShowNoteModal(true);
  };

  const saveNotes = () => {
    if (!validateForm()) return;

    const bookingToSave = currentBooking || rawHistoryBookings.find(b => b.id === selectedBookingId);
    if (!bookingToSave) {
      alert("Invalid appointment selected.");
      return;
    }

    const noteData = {
      counsellorId: counsellor.id,
      counsellorName: counsellor.name,
      studentId: bookingToSave.studentId || "student",
      studentName: bookingToSave.studentName || "Student",
      appointmentId: bookingToSave.id,
      sessionDate: bookingToSave.date,
      title: noteTitle,
      notes: noteText,
      riskLevel,
      followUpRecommendation: recommendation,
      status: noteStatus,
      aiAnalysis: aiAnalysis
    };

    if (existingNoteId) {
      updateNote(existingNoteId, noteData);
    } else {
      addNote(noteData);
    }
    setShowNoteModal(false);
  };

  const handleDeleteNote = () => {
    if (existingNoteId) {
      deleteNote(existingNoteId);
      setShowNoteModal(false);
    }
  };

  if (user.role !== "counsellor" || !counsellor) {
    return <div className="text-center py-20">Access Denied. Counsellors only.</div>;
  }

  return (
    <div className="bg-gray-50 min-h-screen pt-12 pb-24">
      <div className="max-w-7xl mx-auto px-6 lg:px-8">
        <h1 className="text-3xl font-extrabold text-gray-900 font-serif mb-2">Welcome, {counsellor.name}</h1>
        <p className="text-gray-600 mb-8">Manage your schedule, view appointments, and add session notes.</p>

        {/* In-page tabs removed in favor of global Navbar routing */}

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
          <div>
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-xl font-bold text-gray-900">Appointment Management</h2>
            </div>
            <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-100 mb-6 flex flex-col md:flex-row gap-4">
              <div className="flex-1 relative">
                <Search className="absolute left-3 top-3 text-gray-400" size={18} />
                <input 
                  type="text" 
                  placeholder="Search appointments..." 
                  value={searchApptStudent}
                  onChange={(e) => setSearchApptStudent(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-600 outline-none"
                />
                {apptSearchError && <p className="text-red-500 text-xs mt-1 absolute left-0 top-full">{apptSearchError}</p>}
              </div>
              <div className="flex gap-4">
                <div className="relative">
                  <Calendar className="absolute left-3 top-3 text-gray-400" size={18} />
                  <input 
                    type="date" 
                    value={filterApptDate}
                    onChange={(e) => setFilterApptDate(e.target.value)}
                    className="pl-10 pr-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-600 outline-none"
                  />
                </div>
                <div className="relative">
                  <Filter className="absolute left-3 top-3 text-gray-400" size={18} />
                  <select 
                    value={filterApptStatus} 
                    onChange={(e) => setFilterApptStatus(e.target.value)}
                    className="pl-10 pr-8 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-600 outline-none appearance-none bg-white"
                  >
                    <option value="">All Statuses</option>
                    <option value="Pending">Pending</option>
                    <option value="Confirmed">Confirmed</option>
                    <option value="Completed">Completed</option>
                    <option value="Cancelled">Cancelled</option>
                  </select>
                </div>
                <div className="relative">
                  <Clock className="absolute left-3 top-3 text-gray-400" size={18} />
                  <select 
                    value={filterApptTiming} 
                    onChange={(e) => setFilterApptTiming(e.target.value)}
                    className="pl-10 pr-8 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-600 outline-none appearance-none bg-white"
                  >
                    <option value="All">All Timing</option>
                    <option value="Upcoming">Upcoming</option>
                    <option value="Past">Past</option>
                  </select>
                </div>
              </div>
            </div>

            <div className="space-y-4">
              {filteredAppointments.length > 0 ? (
                filteredAppointments.map(b => {
                  if (!b) return null;
                  const note = getNoteByBookingId(b.id);
                  const safeID = (b.id || "").toString();
                  const studentDispName = b.studentName || b.name || "Unknown Student";
                  
                  return (
                    <div key={b.id || Math.random()} className={`bg-white p-6 rounded-2xl shadow-sm border ${b.status === 'Cancelled' || b.status === 'Rejected' ? 'border-red-200 opacity-75' : 'border-gray-100'} flex flex-col lg:flex-row justify-between items-start lg:items-center gap-6 transition hover:shadow-md`}>
                      <div className="flex-1">
                        <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-4">
                          <div>
                            <h3 className="font-bold text-gray-900 text-xl leading-tight">{studentDispName}</h3>
                            <p className="text-sm font-semibold text-gray-500 uppercase tracking-tight mt-1">Student ID: {b.studentId || (safeID ? "STU-" + safeID.substring(0,5) : "N/A ID")}</p>
                          </div>
                          <span className={`w-fit text-xs px-2 py-1 rounded font-semibold border ${
                            b.status === 'Confirmed' || b.status === 'Accepted' ? 'bg-blue-50 text-blue-700 border-blue-200' : 
                            b.status === 'Completed' ? 'bg-green-50 text-green-700 border-green-200' : 
                            b.status === 'Cancelled' || b.status === 'Rejected' ? 'bg-red-50 text-red-700 border-red-200' : 
                            'bg-amber-50 text-amber-700 border-amber-200'
                          }`}>
                            {b.status === 'Accepted' ? 'Confirmed' : b.status === 'Rejected' ? 'Cancelled' : (b.status || "Pending")}
                          </span>
                        </div>
                        
                        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mt-4 text-sm text-gray-600 font-medium">
                          <div className="flex items-center gap-2"><Activity size={16} className="text-gray-400"/> {b.sessionType || "1-on-1 Session"}</div>
                          <div className="flex items-center gap-2"><Calendar size={16} className="text-blue-500"/> {b.date || "N/A Date"}</div>
                          <div className="flex items-center gap-2"><Clock size={16} className="text-blue-500"/> {b.time || "N/A Time"}</div>
                          <div className="flex items-center gap-2"><FileText size={16} className="text-gray-400"/> Appt ID: {safeID ? safeID.substring(0,8) : "N/A"}</div>
                        </div>
                        {b.rejectReason && <p className="text-sm text-red-600 mt-3 font-semibold bg-red-50 inline-block px-3 py-1 rounded-md">Reason: {b.rejectReason}</p>}
                      </div>

                      <div className="flex flex-wrap gap-2 w-full lg:w-auto mt-4 lg:mt-0">
                        <button onClick={() => navigate(`/counsellor/appointment/${b.id}`)} className="flex-1 lg:flex-none justify-center bg-gray-50 text-gray-700 border border-gray-200 hover:bg-gray-100 px-4 py-2 rounded-xl font-medium transition">
                          View Details
                        </button>
                      
                        {b.status === "Pending" && (
                          <>
                            <button onClick={() => confirmBookingByCounsellor(b.id)} className="flex-1 lg:flex-none justify-center bg-blue-600 text-white hover:bg-blue-700 px-4 py-2 rounded-xl font-medium flex items-center gap-2 transition"><CheckCircle size={16}/> Confirm</button>
                            <button onClick={() => { const reason = window.prompt("Reason for cancellation:"); if(reason !== null) cancelBookingByCounsellor(b.id, reason); }} className="flex-1 lg:flex-none justify-center bg-red-50 text-red-700 border border-red-200 hover:bg-red-100 px-4 py-2 rounded-xl font-medium flex items-center gap-2 transition"><XCircle size={16}/> Cancel</button>
                          </>
                        )}

                        {(b.status === "Confirmed" || b.status === "Accepted") && (
                          <>
                            <button onClick={() => navigate(`/chat?student=${encodeURIComponent(b.studentName || b.name || 'Student')}`)} className="flex-1 lg:flex-none justify-center bg-indigo-50 text-indigo-700 hover:bg-indigo-100 border border-indigo-200 px-4 py-2 rounded-xl font-medium flex items-center gap-2 transition">
                              <MessageCircle size={16}/> {hasChatHistory(b.studentName || b.name) ? "Continue Chat" : "Start Chat"}
                            </button>
                            <button onClick={() => completeBooking(b.id)} className="flex-1 lg:flex-none justify-center bg-green-600 text-white hover:bg-green-700 px-4 py-2 rounded-xl font-medium flex items-center gap-2 transition"><CheckCircle size={16}/> Mark Completed</button>
                            <button onClick={() => { const reason = window.prompt("Reason for cancellation:"); if(reason !== null) cancelBookingByCounsellor(b.id, reason); }} className="flex-1 lg:flex-none justify-center text-red-600 hover:bg-red-50 hover:text-red-700 border border-transparent hover:border-red-200 px-4 py-2 rounded-xl font-medium transition">Cancel</button>
                          </>
                        )}

                        {b.status === "Completed" && (
                          <>
                            <button onClick={() => navigate(`/chat?student=${encodeURIComponent(b.studentName || b.name || 'Student')}`)} className="flex-1 lg:flex-none justify-center bg-indigo-50 text-indigo-700 hover:bg-indigo-100 border border-indigo-200 px-4 py-2 rounded-xl font-medium flex items-center gap-2 transition">
                              <MessageCircle size={16}/> {hasChatHistory(b.studentName || b.name) ? "Continue Chat" : "Start Chat"}
                            </button>
                            <button onClick={() => openNotesModal("booking", b)} className={`flex-1 lg:flex-none justify-center px-4 py-2 rounded-xl font-medium flex items-center gap-2 transition border ${note ? 'bg-white text-blue-700 border-blue-200 hover:bg-blue-50' : 'bg-blue-50 text-blue-700 border-transparent hover:bg-blue-100'}`}>
                              <FileText size={16} /> {note ? "View Session Note" : "Add Session Note"}
                            </button>
                          </>
                        )}
                      </div>
                    </div>
                  );
                })
              ) : (
                <div className="text-center py-16 bg-white rounded-2xl border border-gray-100">
                  <Calendar className="mx-auto h-12 w-12 text-gray-300 mb-3" />
                  <h3 className="text-lg font-medium text-gray-900">No appointments found</h3>
                  <p className="text-gray-500">Try adjusting your filters or search term.</p>
                </div>
              )}
            </div>
          </div>
        )}

        {/* History Tab */}
        {activeTab === "history" && (
          <div>
            <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-100 mb-6 flex flex-col md:flex-row gap-4">
              <div className="flex-1 relative">
                <Search className="absolute left-3 top-3 text-gray-400" size={18} />
                <input 
                  type="text" 
                  placeholder="Search past appointments by student name..." 
                  value={searchHistory}
                  onChange={(e) => setSearchHistory(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-600 outline-none"
                />
              </div>
              <div className="relative">
                <Calendar className="absolute left-3 top-3 text-gray-400" size={18} />
                <input 
                  type="date" 
                  value={filterDateHistory}
                  onChange={(e) => setFilterDateHistory(e.target.value)}
                  className="pl-10 pr-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-600 outline-none"
                />
              </div>
            </div>

            <div className="space-y-4">
              {historyBookings.length > 0 ? (
                historyBookings.map(b => {
                  if (!b) return null;
                  const note = getNoteByBookingId(b.id);
                  const safeID = (b.id || "").toString();
                  const studentDispName = b.studentName || b.name || "N/A Student";
                  
                  return (
                    <div key={b.id || Math.random()} className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 flex flex-col md:flex-row justify-between items-start md:items-center gap-4 hover:border-blue-100 transition">
                      <div>
                        <div className="flex items-center gap-3">
                          <h3 className="font-bold text-gray-900">{studentDispName}</h3>
                          <span className={`text-xs px-2 py-1 rounded font-medium ${b.status === 'Accepted' || b.status === 'Confirmed' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                            {b.status || "N/A"}
                          </span>
                        </div>
                        <div className="text-sm text-gray-600 mt-2 flex items-center gap-4">
                          <span className="flex items-center gap-1"><Calendar size={14}/> {b.date || "N/A"}</span>
                          <span className="flex items-center gap-1"><Clock size={14}/> {b.time || "N/A"}</span>
                          {safeID && <span className="text-gray-400">ID: {safeID.substring(0,8)}</span>}
                        </div>
                        {b.rejectReason && <p className="text-sm text-red-600 mt-2">Reason: {b.rejectReason}</p>}
                      </div>
                      {(b.status === "Accepted" || b.status === "Confirmed" || b.status === "Completed") && (
                        <button onClick={() => openNotesModal("booking", b)} className={`px-5 py-2.5 rounded-xl font-medium flex items-center gap-2 transition shadow-sm border ${note ? 'bg-white text-blue-700 border-blue-200 hover:bg-blue-50' : 'bg-blue-600 text-white border-transparent hover:bg-blue-700'}`}>
                          <FileText size={18} /> {note ? "View Note" : "Add Note"}
                        </button>
                      )}
                    </div>
                  );
                })
              ) : (
                <div className="text-center py-16 bg-white rounded-2xl border border-gray-100">
                  <Activity className="mx-auto h-12 w-12 text-gray-300 mb-3" />
                  <h3 className="text-lg font-medium text-gray-900">No history found</h3>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Session Notes Tab */}
        {activeTab === "session notes" && (
          <div>
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-xl font-bold text-gray-900">Your Session Notes</h2>
              <button onClick={() => openNotesModal("new")} className="bg-blue-600 hover:bg-blue-700 text-white px-5 py-2.5 rounded-xl font-medium shadow-sm transition flex items-center gap-2">
                <Plus size={18} /> Create New Note
              </button>
            </div>

            <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-100 mb-6 flex flex-col md:flex-row gap-4">
              <div className="flex-1 relative">
                <Search className="absolute left-3 top-3 text-gray-400" size={18} />
                <input 
                  type="text" 
                  placeholder="Search by student, title, or keywords..." 
                  value={searchNotes}
                  maxLength={50}
                  onChange={(e) => setSearchNotes(e.target.value)}
                  className={`w-full pl-10 pr-10 py-2 border rounded-lg focus:ring-2 focus:ring-blue-600 outline-none transition ${searchNotesError ? 'border-red-300 bg-red-50' : 'border-gray-200'}`}
                />
                {searchNotes && (
                  <button 
                    onClick={() => setSearchNotes("")}
                    className="absolute right-3 top-2.5 text-gray-400 hover:text-gray-600 transition-colors"
                    title="Clear search"
                  >
                    <XCircle size={18} />
                  </button>
                )}
                {searchNotesError && (
                  <p className="text-red-500 text-[10px] mt-1 absolute left-1 -bottom-4 font-medium uppercase tracking-wider">{searchNotesError}</p>
                )}
              </div>
              <div className="flex gap-4">
                <div className="relative">
                  <Calendar className="absolute left-3 top-3 text-gray-400" size={18} />
                  <input 
                    type="date" 
                    value={filterDateNotes}
                    onChange={(e) => setFilterDateNotes(e.target.value)}
                    className="pl-10 pr-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-600 outline-none"
                  />
                </div>
                <div className="relative">
                  <Filter className="absolute left-3 top-3 text-gray-400" size={18} />
                  <select 
                    value={filterRiskNotes} 
                    onChange={(e) => setFilterRiskNotes(e.target.value)}
                    className="pl-10 pr-8 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-600 outline-none appearance-none bg-white"
                  >
                    <option value="">All Risk Levels</option>
                    <option value="Low">Low Risk</option>
                    <option value="Medium">Medium Risk</option>
                    <option value="High">High Risk</option>
                    <option value="Critical">Critical Risk</option>
                    <option value="Severe">Severe Risk</option>
                  </select>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 space-y-4">
              {filteredNotes.map(n => (
                <div key={n.id} className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 flex flex-col md:flex-row justify-between items-start md:items-center gap-6 hover:border-blue-100 transition hover:shadow-md group">
                  <div className="flex-1 w-full">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-4">
                      <div className="flex items-center gap-4">
                        <div className="w-12 h-12 rounded-full bg-blue-600 flex items-center justify-center text-white font-bold text-sm shadow-sm shrink-0 uppercase">
                          {(n.studentName || "N A").split(" ").filter(Boolean).map(nn => nn[0]).join("").slice(0, 2)}
                        </div>
                        <div>
                          <h3 className="font-bold text-gray-900 text-lg leading-tight group-hover:text-blue-600 transition-colors">{n.studentName || "Unknown Student"}</h3>
                          <p className="text-xs font-semibold text-gray-500 tracking-tight mt-0.5">Student ID: {n.studentId || "STU-" + (n.appointmentId || "").toString().substring(0,5)}</p>
                        </div>
                      </div>
                      <div className="flex flex-wrap gap-2">
                        <span className={`text-[10px] px-2 py-0.5 rounded font-bold uppercase tracking-wider ${n.status === 'Completed' ? 'bg-blue-100 text-blue-700' : 'bg-amber-100 text-amber-700'}`}>
                          {n.status}
                        </span>
                        <span className={`text-[10px] px-2 py-0.5 rounded font-bold uppercase tracking-wider border ${
                          n.riskLevel === 'Severe' || n.riskLevel === 'Critical' || n.riskLevel === 'High' ? 'bg-red-50 text-red-700 border-red-200' : 
                          n.riskLevel === 'Medium' ? 'bg-orange-50 text-orange-700 border-orange-200' : 
                          'bg-green-50 text-green-700 border-green-200'
                        }`}>
                          {n.riskLevel} Risk
                        </span>
                      </div>
                    </div>
                    
                    <div className="text-sm text-gray-500 mt-2 flex flex-wrap items-center gap-x-6 gap-y-2 font-medium">
                      <span className="flex items-center gap-1.5"><Calendar size={14} className="text-blue-500"/> {n.sessionDate || "N/A Date"}</span>
                      <span className="flex items-center gap-1.5"><FileText size={14} className="text-gray-400"/> {(n.appointmentId || "N/A ID").toString().substring(0,10)}</span>
                    </div>
 
                    <div className="mt-5 border-l-4 border-blue-500 pl-4 py-1 bg-gray-50/50 rounded-r-lg group-hover:bg-blue-50/30 transition-colors">
                      <div className="mb-2">
                        <span className="text-[11px] font-bold text-blue-700 tracking-tight">Note Title</span>
                        <h4 className="text-gray-900 font-bold">{n.title}</h4>
                      </div>
                      <div>
                        <span className="text-[11px] font-bold text-gray-500 tracking-tight">Summary</span>
                        <p className="text-sm text-gray-600 line-clamp-2 leading-relaxed">{n.notes}</p>
                      </div>
                    </div>
                  </div>
                  
                  <div className="flex shrink-0 w-full md:w-auto mt-2 md:mt-0 gap-2">
                    <button 
                      onClick={() => openNotesModal("note", n, true)} 
                      className="flex-1 md:flex-none bg-white text-gray-700 border border-gray-200 hover:bg-gray-50 px-4 py-2.5 rounded-xl font-bold flex items-center justify-center gap-2 transition shadow-sm active:scale-95"
                      title="View read-only version"
                    >
                      <Eye size={18} className="text-blue-500" /> View
                    </button>
                    <button 
                      onClick={() => openNotesModal("note", n, false)} 
                      className="flex-1 md:flex-none bg-white text-blue-700 border border-blue-200 hover:bg-blue-600 hover:text-white hover:border-blue-600 px-4 py-2.5 rounded-xl font-bold flex items-center justify-center gap-2 transition shadow-sm active:scale-95"
                      title="Edit this note"
                    >
                      <Pencil size={18} /> Edit
                    </button>
                  </div>
                </div>
              ))}
              {filteredNotes.length === 0 && (
                <div className="text-center py-16 bg-white rounded-2xl border border-gray-100">
                  <FileText className="mx-auto h-12 w-12 text-gray-300 mb-3" />
                  <h3 className="text-lg font-medium text-gray-900">{debouncedSearchNotes ? "No session notes found matching your search" : "No session notes found"}</h3>
                  <p className="text-gray-500 text-sm mt-1">Try adjusting your filters or search term.</p>
                </div>
              )}
            </div>
          </div>
        )}

      </div>

      {/* Advanced Session Note Form Modal */}
      {showNoteModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-50 overflow-y-auto">
          <div className="bg-white rounded-2xl w-full max-w-3xl shadow-2xl my-8 overflow-hidden flex flex-col max-h-[90vh]">
            <div className="p-6 border-b border-gray-100 flex justify-between items-center bg-gray-50 sticky top-0 z-10">
              <div>
                <h2 className="text-2xl font-bold text-gray-900">
                  {isViewOnly ? "View Session Note" : (existingNoteId ? "Edit Session Note" : "New Session Note")}
                </h2>
                {currentBooking && <p className="text-sm text-gray-500 mt-1">For {currentBooking.studentName} | {currentBooking.date}</p>}
              </div>
              <button onClick={() => setShowNoteModal(false)} className="text-gray-400 hover:text-gray-700 transition">
                <XCircle size={24} />
              </button>
            </div>
            
            <div className="p-6 overflow-y-auto space-y-6 flex-grow">
              
              {!currentBooking && !existingNoteId && (
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Select Appointment *</label>
                  <select 
                    value={selectedBookingId}
                    disabled={isViewOnly}
                    onChange={(e) => { setSelectedBookingId(e.target.value); if(errors.selectedBookingId) setErrors({...errors, selectedBookingId: null}); }}
                    className={`w-full border rounded-xl p-3 focus:ring-2 focus:ring-blue-600 outline-none transition bg-white disabled:bg-gray-50 disabled:text-gray-400 ${errors.selectedBookingId ? 'border-red-500 bg-red-50' : 'border-gray-300'}`}
                  >
                    <option value="">-- Choose a past appointment --</option>
                    {completedBookingsForNotes.length > 0 ? (
                      completedBookingsForNotes.map(b => {
                        const hasNote = !!getNoteByBookingId(b?.id);
                        const safeID = (b?.id || "").toString();
                        return (
                          <option key={b?.id || Math.random()} value={b?.id} disabled={hasNote}>
                            {b?.studentName || b?.name || "N/A"} – {b?.studentId || ("STU-" + safeID.substring(0,5))} – {b?.date || "N/A"} – {b?.time || "N/A"} – {safeID.substring(0,8)} {hasNote ? "(Note already added)" : ""}
                          </option>
                        );
                      })
                    ) : (
                      <option disabled value="">No completed appointments available for session notes</option>
                    )}
                  </select>
                  {errors.selectedBookingId && <p className="text-red-600 text-xs mt-1 font-medium">{errors.selectedBookingId}</p>}
                </div>
              )}

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Note Title *</label>
                  <input 
                    type="text" 
                    value={noteTitle}
                    disabled={isViewOnly}
                    onChange={(e) => { setNoteTitle(e.target.value); if(errors.noteTitle) setErrors({...errors, noteTitle: null}); }}
                    placeholder="e.g. Initial Assessment"
                    className={`w-full border rounded-xl p-3 focus:ring-2 focus:ring-blue-600 outline-none transition disabled:bg-gray-50 ${errors.noteTitle ? 'border-red-500 bg-red-50' : 'border-gray-300'}`}
                  />
                  {errors.noteTitle && <p className="text-red-600 text-xs mt-1 font-medium">{errors.noteTitle}</p>}
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Risk Level *</label>
                  <select 
                    value={riskLevel}
                    disabled={isViewOnly}
                    onChange={(e) => { setRiskLevel(e.target.value); if(errors.riskLevel) setErrors({...errors, riskLevel: null}); }}
                    className={`w-full border rounded-xl p-3 focus:ring-2 focus:ring-blue-600 outline-none transition appearance-none bg-white disabled:bg-gray-50 ${errors.riskLevel ? 'border-red-500 bg-red-50' : 'border-gray-300'}`}
                  >
                    <option value="Low">Low Risk</option>
                    <option value="Medium">Medium Risk</option>
                    <option value="High">High Risk</option>
                    <option value="Critical">Critical Risk</option>
                    <option value="Severe">Severe Risk</option>
                  </select>
                  {errors.riskLevel && <p className="text-red-600 text-xs mt-1 font-medium">{errors.riskLevel}</p>}
                </div>
              </div>

              <div>
                <div className="flex justify-between items-center mb-2">
                  <label className="block text-sm font-semibold text-gray-700">Detailed Session Notes *</label>
                  <button 
                    onClick={analyzeRisk} 
                    disabled={isAnalyzing || noteText.trim().length < 10 || isViewOnly}
                    className="text-sm bg-indigo-50 text-indigo-700 border border-indigo-200 hover:bg-indigo-100 px-3 py-1.5 rounded-lg flex items-center gap-1 font-medium transition disabled:opacity-50"
                  >
                    <Sparkles size={14} /> {isAnalyzing ? "Analyzing..." : "Analyze Risk"}
                  </button>
                </div>
                <textarea
                  value={noteText}
                  disabled={isViewOnly}
                  onChange={(e) => { setNoteText(e.target.value); if(errors.noteText) setErrors({...errors, noteText: null}); }}
                  placeholder="Record observations, discussed topics, and student progress..."
                  rows={6}
                  className={`w-full border rounded-xl p-4 focus:ring-2 focus:ring-blue-600 text-sm outline-none transition resize-none disabled:bg-gray-50 ${errors.noteText ? 'border-red-500 bg-red-50' : 'border-gray-300'}`}
                />
                {errors.noteText && <p className="text-red-600 text-xs mt-1 font-medium">{errors.noteText}</p>}
              </div>

              {aiAnalysis && (
                <div className="bg-gradient-to-r from-indigo-50 to-blue-50 border border-indigo-100 rounded-xl p-5 shadow-sm">
                  <div className="flex items-start gap-3 mb-3">
                    <Sparkles className="text-indigo-600 mt-0.5 shrink-0" size={20} />
                    <div>
                      <h4 className="font-bold text-gray-900 flex items-center gap-2">
                        AI Risk Level Suggestion: 
                        <span className={`px-2 py-0.5 rounded text-xs border ${
                          aiAnalysis.suggestedRisk === 'Critical' || aiAnalysis.suggestedRisk === 'High' ? 'bg-red-100 text-red-800 border-red-200' :
                          aiAnalysis.suggestedRisk === 'Medium' ? 'bg-orange-100 text-orange-800 border-orange-200' :
                          'bg-green-100 text-green-800 border-green-200'
                        }`}>{aiAnalysis.suggestedRisk} Risk</span>
                      </h4>
                      <p className="text-sm text-gray-700 mt-1">{aiAnalysis.reason}</p>
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 ml-8 mt-4">
                    <div>
                      <div className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1">Warning Indicators</div>
                      <div className="flex flex-wrap gap-1.5">
                        {aiAnalysis.indicators.length > 0 ? aiAnalysis.indicators.map(ind => (
                          <span key={ind} className="bg-white border border-indigo-100 text-indigo-700 px-2 py-0.5 rounded text-xs font-medium">{ind}</span>
                        )) : <span className="text-sm text-gray-500 italic">None detected</span>}
                      </div>
                    </div>
                    <div>
                      <div className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1">Suggested Follow-up</div>
                      <div className="text-sm font-medium text-gray-800">{aiAnalysis.suggestedAction}</div>
                    </div>
                  </div>

                  <div className="ml-8 mt-5 pt-4 border-t border-indigo-100 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                    <div className="flex items-center gap-1.5 text-xs text-amber-700 font-medium">
                      <AlertTriangle size={14} /> This suggestion is generated by AI and must be reviewed.
                    </div>
                    <button 
                      onClick={() => {
                        setRiskLevel(aiAnalysis.suggestedRisk);
                        if (!recommendation) setRecommendation(aiAnalysis.suggestedAction);
                      }}
                      disabled={isViewOnly}
                      className="text-sm bg-white border border-indigo-200 text-indigo-700 hover:bg-indigo-50 px-3 py-1.5 rounded-lg font-semibold transition shadow-sm disabled:opacity-50"
                    >
                      Apply Suggestion
                    </button>
                  </div>
                </div>
              )}

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Follow-up Recommendation *</label>
                <input 
                  type="text" 
                  value={recommendation}
                  disabled={isViewOnly}
                  onChange={(e) => { setRecommendation(e.target.value); if(errors.recommendation) setErrors({...errors, recommendation: null}); }}
                  placeholder="e.g. Schedule another session in 2 weeks"
                  className={`w-full border rounded-xl p-3 focus:ring-2 focus:ring-blue-600 outline-none transition disabled:bg-gray-50 ${errors.recommendation ? 'border-red-500 bg-red-50' : 'border-gray-300'}`}
                />
                {errors.recommendation && <p className="text-red-600 text-xs mt-1 font-medium">{errors.recommendation}</p>}
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-3">Note Status</label>
                <div className="flex gap-4">
                  <label className={`flex-1 flex items-center justify-center p-3 border rounded-xl cursor-pointer transition ${noteStatus === 'Draft' ? 'border-amber-500 bg-amber-50 text-amber-700 shadow-sm' : 'border-gray-200 hover:bg-gray-50'} ${isViewOnly ? 'pointer-events-none' : ''}`}>
                    <input type="radio" name="noteStatus" value="Draft" checked={noteStatus === 'Draft'} onChange={() => setNoteStatus("Draft")} className="sr-only" disabled={isViewOnly} />
                    <span className="font-medium">Save as Draft</span>
                  </label>
                  <label className={`flex-1 flex items-center justify-center p-3 border rounded-xl cursor-pointer transition ${noteStatus === 'Completed' ? 'border-blue-600 bg-blue-50 text-blue-700 shadow-sm' : 'border-gray-200 hover:bg-gray-50'} ${isViewOnly ? 'pointer-events-none' : ''}`}>
                    <input type="radio" name="noteStatus" value="Completed" checked={noteStatus === 'Completed'} onChange={() => setNoteStatus("Completed")} className="sr-only" disabled={isViewOnly} />
                    <span className="font-medium">Mark as Completed</span>
                  </label>
                </div>
              </div>
            </div>

            <div className="p-6 border-t border-gray-100 bg-gray-50 flex justify-between items-center sticky bottom-0">
              {existingNoteId && !isViewOnly ? (
                <button onClick={handleDeleteNote} className="text-red-600 hover:text-red-800 font-medium px-4 py-2 hover:bg-red-50 rounded-lg transition">
                  Delete Note
                </button>
              ) : <div></div>}
              
              <div className="flex gap-3">
                <button onClick={() => setShowNoteModal(false)} className="px-6 py-2.5 hover:bg-gray-200 bg-white border border-gray-200 rounded-xl font-medium text-gray-700 transition">
                  {isViewOnly ? "Close" : "Cancel"}
                </button>
                {!isViewOnly && (
                  <button onClick={saveNotes} className="px-6 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-medium shadow-sm transition flex items-center gap-2">
                    <CheckCircle size={18} /> {existingNoteId ? "Update File" : "Save File"}
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}

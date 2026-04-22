import { useState, useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import { useCounsellorContext } from "../../context/CounsellorContext";
import { useBooking } from "../../context/BookingContext";
import { useSessionNotes } from "../../context/SessionNoteContext";
import { Calendar, Clock, CheckCircle, XCircle, FileText, Activity, Search, Filter, Plus, MessageCircle, Sparkles, AlertTriangle, Eye, Pencil, User, Trash2, Video, Hash, ClipboardList, ShieldAlert, Save, Info } from "lucide-react";
import toast from "react-hot-toast";
import FeedbackForm from "../../components/FeedbackForm";
import PopMsg from "../../components/PopMsg";
import studentProfilePlaceholder from "../../assets/student_profile_john_smith.png";
import student1 from "../../assets/student1.png";
import student2 from "../../assets/student2.png";
import student3 from "../../assets/student3.png";

const guestProfiles = [
  { name: "Sithumini Fonseka", photo: student1 },
  { name: "Kavindu Perera", photo: student2 },
  { name: "Nadeesha Perera", photo: student3 },
  { name: "Dilshan Wijesinghe", photo: studentProfilePlaceholder },
  { name: "Kasun Bandara", photo: student2 },
  { name: "Tharushi Silva", photo: student1 },
  { name: "Amandi Fernando", photo: student3 },
  { name: "Nimesh Jayawardena", photo: studentProfilePlaceholder }
];

const getDeterministicIndex = (idString, arrayLength) => {
  let hash = 0;
  for (let i = 0; i < idString.length; i++) {
    hash = idString.charCodeAt(i) + ((hash << 5) - hash);
  }
  return Math.abs(hash) % arrayLength;
};

const getGuestProfile = (idString) => {
  if (!idString) return guestProfiles[0];
  return guestProfiles[getDeterministicIndex(idString, guestProfiles.length)];
};

const getGuestPhoto = (idString) => getGuestProfile(idString).photo;
const getGuestName = (idString) => getGuestProfile(idString).name;

const getAvatarColor = (name) => {
  if (!name) return 'bg-blue-600';
  const colors = [
    'bg-blue-500', 'bg-emerald-500', 'bg-violet-500', 'bg-rose-500', 
    'bg-amber-500', 'bg-indigo-500', 'bg-sky-500', 'bg-fuchsia-500',
    'bg-teal-500', 'bg-orange-500'
  ];
  let hash = 0;
  for (let i = 0; i < name.length; i++) {
    hash = name.charCodeAt(i) + ((hash << 5) - hash);
  }
  return colors[Math.abs(hash) % colors.length];
};

export default function CounsellorDashboard() {
  const { user } = useAuth();
  const { getCounsellorById, getCounsellorByEmail, updateAvailability, fetchCounsellors } = useCounsellorContext();
  const { bookings, fetchBookings, confirmBookingByCounsellor, cancelBookingByCounsellor, completeBooking, startSession } = useBooking();
  const { notes, addNote, updateNote, deleteNote, getNoteByBookingId } = useSessionNotes();

  const counsellor = getCounsellorById(user?.id) || getCounsellorByEmail(user?.email) || null;
  const counsellorName = counsellor?.name || user?.name || "";
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
  else if (path.includes("notes")) activeTab = "session notes";

  // Re-fetch bookings on navigating to appointments
  useEffect(() => {
    if (activeTab === "appointments" && typeof fetchBookings === "function") {
      fetchBookings();
    }
  }, [activeTab, fetchBookings]);

  // Ensure counsellor is loaded if accessed directly
  useEffect(() => {
    if (!counsellor?.id && user?.email && typeof fetchCounsellors === 'function') {
      fetchCounsellors();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [counsellor?.id, user?.email]);

  // For Availability
  const [selectedDate, setSelectedDate] = useState("");
  const [selectedSlots, setSelectedSlots] = useState([]);
  const [slotInput, setSlotInput] = useState("");
  const [availabilityErrors, setAvailabilityErrors] = useState({});

  // Handle ?edit=date query param
  useEffect(() => {
    const editDate = new URLSearchParams(location.search).get('edit');
    if (editDate && counsellor) {
      setSelectedDate(editDate);
      const existing = counsellor.availability?.find(a => a.date === editDate);
      setSelectedSlots(existing ? existing.slots : []);
    }
  }, [location.search, counsellor]);

  const formatSelectedDate = (dateString) => {
    if (!dateString) return "---";
    const [y, m, d] = dateString.split("-");
    return `${d}/${m}/${y}`;
  };

  const handleDateChange = (e) => {
    const date = e.target.value;
    setSelectedDate(date);
    setAvailabilityErrors((prev) => ({ ...prev, date: null }));
    
    const today = new Date().toISOString().split('T')[0];
    if (date && date < today) {
       setAvailabilityErrors((prev) => ({ ...prev, date: "Please select a future date" }));
       setSelectedSlots([]);
       return;
    }

    const existing = counsellor?.availability?.find(a => a.date === date);
    setSelectedSlots(existing ? existing.slots : []);
  };

  const handleAddSlot = () => {
    if (!slotInput) {
       setAvailabilityErrors((prev) => ({ ...prev, slot: "Please select a time" }));
       return;
    }
    if (selectedSlots.includes(slotInput)) {
       setAvailabilityErrors((prev) => ({ ...prev, slot: "This time slot is already added" }));
       return;
    }
    setSelectedSlots(prev => [...prev, slotInput].sort());
    setSlotInput("");
    setAvailabilityErrors((prev) => ({ ...prev, slot: null, slots: null }));
  };

  const handleSaveAvailability = async () => {
    let hasError = false;
    const errors = {};
    if (!selectedDate) {
      errors.date = "Please select a future date";
      hasError = true;
    } else {
      const today = new Date().toISOString().split('T')[0];
      if (selectedDate < today) {
        errors.date = "Please select a future date";
        hasError = true;
      }
    }
    
    if (selectedSlots.length === 0 && !hasError) {
      errors.slots = "No time slots added yet";
      hasError = true;
    }

    if (hasError) {
       setAvailabilityErrors(errors);
       return;
    }

    try {
      let activeCounsellorId = counsellor?.id;
      
      if (!activeCounsellorId && typeof fetchCounsellors === 'function') {
        const refreshed = await fetchCounsellors();
        if (refreshed && user?.email) {
            const found = refreshed.find(c => c.email?.toLowerCase() === user.email.toLowerCase());
            if (found) activeCounsellorId = found.id || found._id;
        }
      }
      
      if (!activeCounsellorId) {
         toast.error("Connecting to server. Please wait or refresh the page.");
         return;
      }

      if (typeof updateAvailability === 'function') {
        const promise = updateAvailability(activeCounsellorId, selectedDate, selectedSlots);
        if (promise instanceof Promise) await promise;
      }
      toast.success("Availability saved successfully.");
      setAvailabilityErrors({});
      setSelectedDate("");
      setSelectedSlots([]);
      setSlotInput("");
    } catch (err) {
      toast.error("Failed to save availability");
    }
  };

  // For Appointments Tab
  const safeBookings = Array.isArray(bookings) ? bookings : [];
  const myBookings = safeBookings.filter(b => 
    b?.counsellorId === counsellor?.id || 
    b?.counsellorName === counsellor?.name || 
    b?.counsellor === counsellor?.name
  );
  
  const stats = {
    total: myBookings.length,
    confirmed: myBookings.filter(b => b.status === 'Confirmed' || b.status === 'Accepted').length,
    completed: myBookings.filter(b => b.status === 'Completed').length,
    cancelled: myBookings.filter(b => b.status === 'Cancelled' || b.status === 'Rejected').length,
    live: myBookings.filter(b => b.status === 'In Session').length
  };
  
  const [searchApptStudent, setSearchApptStudent] = useState("");
  const [filterApptDate, setFilterApptDate] = useState("");
  const [filterApptStatus, setFilterApptStatus] = useState("");
  const [filterApptTiming, setFilterApptTiming] = useState("All");
  const [debouncedSearchAppt, setDebouncedSearchAppt] = useState("");
  const [apptSearchError, setApptSearchError] = useState("");
  const [formData, setFormData] = useState({ id: null, title: "", notes: "", riskLevel: "Low", counsellorAssessment: "", status: "Draft", aiAnalysis: null });
  const [isViewOnly, setIsViewOnly] = useState(false);

  // Custom PopMsg state
  const [popMsg, setPopMsg] = useState({ 
    isOpen: false, 
    title: "", 
    message: "", 
    onConfirm: null,
    type: 'warning'
  });
  const [popInput, setPopInput] = useState("");

  const handleModalCancel = (id) => {
    if (popInput.trim().length > 0 || popMsg.type !== 'prompt') {
      cancelBookingByCounsellor(id, popInput);
      setPopMsg(prev => ({ ...prev, isOpen: false }));
    } else {
      toast.error("Please provide a reason.");
    }
  };
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
    
    if (!counsellorAssessment.trim()) newErrors.counsellorAssessment = "Please enter counsellor assessment";
    else if (counsellorAssessment.trim().length < 5) newErrors.counsellorAssessment = "Counsellor assessment must be at least 5 characters";

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
    const actName = (b?.studentName || b?.name || getGuestName((b?.id || "").toString()));
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
  // Match by counsellorId OR counsellorName as a fallback (handles user.id mismatch)
  const myNotes = safeNotes.filter(n => {
    if (!n) return false;
    if (counsellor?.id && n.counsellorId === String(counsellor.id)) return true;
    if (counsellorName && n.counsellorName && n.counsellorName.toLowerCase() === counsellorName.toLowerCase()) return true;
    // If counsellor context is missing, show all notes for safety
    if (!counsellor && !counsellorName) return true;
    return false;
  });
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
  const [counsellorAssessment, setCounsellorAssessment] = useState("");
  const [noteStatus, setNoteStatus] = useState("Draft");
  
  // AI Risk State
  const [aiAnalysis, setAiAnalysis] = useState(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);

  const analyzeRisk = () => {
    if (!noteText.trim()) {
      toast.error("Please write some session notes first.");
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
    setCounsellorAssessment(note.counsellorAssessment || note.followUpRecommendation || "");
    setNoteStatus(note.status);
    setAiAnalysis(note.aiAnalysis || null);
    setErrors({});
  };

  const populateEmpty = () => {
    setExistingNoteId(null);
    setNoteTitle("");
    setNoteText("");
    setRiskLevel("Low");
    setCounsellorAssessment("");
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
    if (!validateForm()) {
      toast.error("There are validation errors. Please check the form.");
      return;
    }

    const bookingToSave = currentBooking || rawHistoryBookings.find(b => b.id === selectedBookingId);
    if (!bookingToSave) {
      toast.error("Invalid appointment selected.");
      return;
    }

    const noteData = {
      counsellorId: counsellor?.id || user?.id || "unknown",
      counsellorName: counsellor?.name || user?.name || "Unknown Counsellor",
      studentId: bookingToSave.studentId || "student",
      studentName: bookingToSave.studentName || "Student",
      studentProfile: bookingToSave.studentProfile || bookingToSave.profileImage || null,
      appointmentId: bookingToSave.id,
      sessionDate: bookingToSave.date,
      title: noteTitle,
      notes: noteText,
      riskLevel,
      counsellorAssessment: counsellorAssessment,
      status: noteStatus,
      aiAnalysis: aiAnalysis
    };

    if (existingNoteId) {
      updateNote(existingNoteId, noteData);
      toast.success("Session note updated.");
    } else {
      addNote(noteData);
      toast.success("New session note saved.");
    }
    setShowNoteModal(false);
  };

  const handleDeleteNote = () => {
    if (existingNoteId) {
      deleteNote(existingNoteId);
      setShowNoteModal(false);
    }
  };

  const upcomingAvailability = counsellor?.availability ? [...counsellor.availability]
      .filter(a => a.date >= new Date().toISOString().split('T')[0])
      .sort((a, b) => new Date(a.date) - new Date(b.date)) : [];

  if (user?.role !== "counsellor") {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="bg-white rounded-3xl shadow-xl border border-gray-100 p-12 max-w-md w-full text-center">
          <div className="w-16 h-16 rounded-2xl bg-blue-50 flex items-center justify-center mx-auto mb-6">
            <User size={32} className="text-blue-600" />
          </div>
          <h2 className="text-2xl font-black text-gray-900 mb-3">Counsellor Access Required</h2>
          <p className="text-gray-500 mb-8 leading-relaxed">You need to be logged in as a Counsellor to access this page. Use the role switcher in the top navigation bar to switch to Counsellor mode.</p>
          <div className="bg-blue-50 rounded-2xl p-4 text-sm text-blue-700 font-medium">
            💡 Click your name in the navbar → <strong>"Login as Counsellor"</strong>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="counsellor-layout-bg pt-20 pb-32">
      <PopMsg 
        {...popMsg} 
        inputValue={popInput}
        setInputValue={setPopInput}
        onClose={() => setPopMsg(prev => ({ ...prev, isOpen: false }))} 
      />
      <div className="max-w-7xl mx-auto px-6 lg:px-8 relative z-10">
        <h1 className="text-5xl font-black text-white tracking-tight mb-2 selection:bg-blue-600/30">Welcome, {counsellor?.name || user?.name || 'Counsellor'}</h1>
        <p className="text-blue-200 font-black uppercase tracking-widest text-xs mb-12 opacity-80 flex items-center gap-2">
          <div className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></div> Secure Clinical Portal
        </p>

        {/* In-page tabs removed in favor of global Navbar routing */}

        {/* Availability Tab */}
        {activeTab === "availability" && (
          <div className="space-y-8 animate-in fade-in duration-700">
            <div className="glass-green p-8 lg:p-14 relative overflow-hidden group">
              <div className="absolute top-0 right-0 w-64 h-64 bg-blue-400/5 rounded-full -mr-32 -mt-32 blur-3xl transition-all group-hover:bg-blue-400/10"></div>
              <div className="absolute left-0 top-0 bottom-0 w-2.5 bg-blue-600"></div>
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-6 mb-10">
                <h2 className="text-2xl font-black text-gray-900 flex items-center gap-3 tracking-tight">
                  <Calendar size={28} strokeWidth={3} className="text-blue-600" /> Set Your Availability
                </h2>
                <button 
                  onClick={() => navigate('/counsellor/my-availability')}
                  className="flex items-center gap-2 px-6 py-3 bg-slate-900 text-white rounded-2xl font-black text-xs uppercase tracking-widest hover:bg-blue-600 transition-all shadow-lg hover:-translate-y-1"
                >
                  <Calendar size={16} /> View Schedule
                </button>
              </div>
              <div className="grid grid-cols-1 lg:grid-cols-2 lg:gap-16 gap-10">
                <div className="space-y-10">
                  <div className="group">
                    <label className="block text-xs font-black text-gray-400 uppercase tracking-widest mb-3 transition-colors group-focus-within:text-blue-600 ml-1">Select Date (Future Only)</label>
                    <div className="relative">
                      <Calendar className="absolute left-5 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" size={20} strokeWidth={2.5} />
                      <input 
                        type="date" 
                        value={selectedDate} 
                        onChange={handleDateChange} 
                        className={`w-full border-2 rounded-2xl p-4 pl-14 outline-none transition-all bg-white font-black text-gray-700 shadow-sm ${availabilityErrors.date ? 'border-red-400 focus:ring-4 focus:ring-red-500/10 focus:border-red-500' : 'border-gray-100 focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 hover:border-blue-200'}`} 
                        min={new Date().toISOString().split('T')[0]} 
                      />
                    </div>
                    {availabilityErrors.date && <p className="text-red-500 text-xs font-bold mt-2 ml-1">{availabilityErrors.date}</p>}
                  </div>
                  
                  {selectedDate && !availabilityErrors.date && (
                    <div className="group animate-in fade-in slide-in-from-top-6 duration-500">
                      <label className="block text-xs font-black text-gray-400 uppercase tracking-widest mb-3 transition-colors group-focus-within:text-blue-600 ml-1">Add Time Slot</label>
                      <div className="flex flex-col sm:flex-row gap-4">
                        <div className="relative flex-grow">
                          <Clock className="absolute left-5 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" size={20} strokeWidth={2.5} />
                          <input 
                            type="time" 
                            value={slotInput} 
                            onChange={e => {
                                setSlotInput(e.target.value);
                                if(availabilityErrors.slot) setAvailabilityErrors((prev) => ({...prev, slot: null}));
                            }} 
                            className={`w-full bg-white border-2 shadow-sm rounded-2xl pl-14 pr-4 p-4 outline-none transition-all font-black text-gray-700 ${availabilityErrors.slot ? 'border-red-400 focus:ring-4 focus:ring-red-500/10 focus:border-red-500' : 'border-gray-100 focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 hover:border-blue-200'}`}
                          />
                        </div>
                        <button 
                          onClick={handleAddSlot} 
                          disabled={!slotInput}
                          className={`w-full sm:w-auto px-8 py-4 rounded-2xl font-black text-sm flex items-center justify-center gap-3 shadow-md transition-all ${!slotInput ? 'bg-gray-100 text-gray-400 border-2 border-gray-100 cursor-not-allowed' : 'bg-blue-50 border-2 border-blue-200 text-blue-700 hover:bg-blue-600 hover:text-white hover:border-blue-600 active:scale-95'}`}
                        >
                          <Plus size={20} strokeWidth={3} /> Add Slot
                        </button>
                      </div>
                      {availabilityErrors.slot && <p className="text-red-500 text-xs font-bold mt-2 ml-1">{availabilityErrors.slot}</p>}
                    </div>
                  )}
                </div>
                
                <div className="flex flex-col h-full mt-4 lg:mt-0">
                  <h3 className="text-xs font-black text-gray-400 uppercase tracking-widest mb-4 ml-1">Planned Slots: <span className="text-blue-600">{formatSelectedDate(selectedDate)}</span></h3>
                  <div className={`flex-grow bg-blue-50/40 border-2 rounded-[1.5rem] p-6 flex flex-wrap gap-4 content-start min-h-[180px] shadow-inner mb-2 ${availabilityErrors.slots ? 'border-red-400' : 'border-blue-100/50'}`}>
                    {selectedSlots.length > 0 ? selectedSlots.map((slot, idx) => (
                      <button 
                        key={idx}
                        onClick={() => setSelectedSlots(selectedSlots.filter((_, i) => i !== idx))}
                        className="bg-white text-blue-700 px-5 py-2.5 rounded-2xl border-2 border-blue-200 shadow-md flex items-center gap-3 font-black text-sm group transition-all hover:bg-rose-500 hover:text-white hover:border-rose-500 hover:shadow-rose-200 cursor-pointer active:scale-90"
                        title="Click to remove slot"
                      >
                        {slot}
                        <XCircle size={18} strokeWidth={3} className="text-blue-400 group-hover:text-white transition-colors" />
                      </button>
                    )) : (
                      <div className="w-full h-full flex flex-col items-center justify-center text-center py-8 text-gray-400 opacity-60">
                        <Clock size={40} strokeWidth={2.5} className="mb-4 text-blue-300" />
                        <p className="text-sm font-black uppercase tracking-widest">No time slots added yet</p>
                      </div>
                    )}
                  </div>
                  {availabilityErrors.slots && <p className="text-red-500 text-xs font-bold mb-4 ml-1">{availabilityErrors.slots}</p>}
                  <button 
                    onClick={handleSaveAvailability} 
                    disabled={!selectedDate || selectedSlots.length === 0}
                    className={`w-full h-16 rounded-2xl font-black text-lg flex items-center justify-center gap-3 transition-all ${
                        (!selectedDate || selectedSlots.length === 0) 
                        ? 'bg-gray-200 text-gray-400 cursor-not-allowed border-[3px] border-gray-100' 
                        : 'bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white shadow-xl shadow-blue-200 hover:shadow-2xl hover:-translate-y-1 active:scale-[0.98]'
                    }`}
                  >
                    <CheckCircle size={24} strokeWidth={3} /> Save Availability
                  </button>
                </div>
              </div>
            </div>

            {/* Current Weekly Schedule Section */}
            <div className="bg-white p-8 lg:p-12 rounded-[2rem] shadow-md border border-gray-100 flex flex-col pt-10">
              <h2 className="text-2xl font-black text-gray-900 mb-8 flex items-center gap-3 tracking-tight border-b-2 border-gray-50 pb-6">
                <Calendar size={28} strokeWidth={3} className="text-blue-600" /> Current Weekly Schedule
              </h2>
              {upcomingAvailability.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {upcomingAvailability.map((avail, index) => (
                    <div 
                      key={index} 
                      className="bg-gray-50 p-6 rounded-[2rem] border border-gray-200/60 shadow-sm relative overflow-hidden group hover:shadow-lg hover:-translate-y-1 transition-all"
                    >
                      <div className="absolute top-0 left-0 bottom-0 w-2 bg-blue-500"></div>
                      <div className="flex justify-between items-start mb-4">
                        <div>
                          <p className="text-gray-400 font-bold uppercase tracking-widest text-[10px] mb-1">
                            {new Date(avail.date).toLocaleDateString('en-US', { weekday: 'long' })}
                          </p>
                          <p className="text-xl font-black text-gray-900 tracking-tight">
                            {formatSelectedDate(avail.date)}
                          </p>
                        </div>
                      </div>
                      <div className="flex flex-wrap gap-2">
                        {avail.slots.map((slot, i) => (
                          <span 
                            key={i} 
                            className="bg-blue-100/50 text-blue-700 px-3 py-1.5 rounded-xl text-xs font-black"
                          >
                            {slot}
                          </span>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-16 bg-gray-50/50 rounded-3xl border border-dashed border-gray-200">
                  <Calendar className="mx-auto h-12 w-12 text-gray-300 mb-4" />
                  <p className="text-gray-500 font-black uppercase tracking-widest text-sm">No sessions scheduled yet.</p>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Appointments Tab */}
        {activeTab === "appointments" && (
          <div className="space-y-8">
            
          <div className="space-y-12">
            
            {/* Premium Hero Section */}
            <div className="relative p-10 lg:p-16 rounded-[3rem] overflow-hidden group shadow-2xl mb-12" style={{ background: 'linear-gradient(135deg, rgba(15, 23, 42, 0.9), rgba(30, 41, 59, 0.8))', backdropFilter: 'blur(20px)' }}>
              <div className="absolute top-0 right-0 w-96 h-96 bg-blue-500/10 rounded-full -mr-48 -mt-48 blur-[100px] animate-pulse"></div>
              <div className="absolute bottom-0 left-0 w-64 h-64 bg-indigo-500/5 rounded-full -ml-32 -mb-32 blur-[80px]"></div>
              
              <div className="relative z-10">
                <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-10">
                  <div className="space-y-4">
                    <div className="inline-flex items-center gap-2.5 px-4 py-1.5 rounded-full bg-blue-500/10 border border-blue-500/20 text-blue-400 text-[10px] font-black uppercase tracking-[0.2em] animate-fade-in">
                      <Sparkles size={14} /> Intelligence Dashboard
                    </div>
                    <h2 className="text-4xl lg:text-5xl font-black text-white tracking-tighter italic">Clinical <span className="text-blue-500">Appointments.</span></h2>
                    <p className="text-gray-400 font-medium max-w-lg leading-relaxed">
                      Manage and coordinate your patient care journey with advanced analytics and real-time session tracking.
                    </p>
                  </div>
                  
                  {/* Compact Stats Row */}
                  <div className="grid grid-cols-2 sm:grid-cols-5 gap-4 lg:gap-6">
                    {[
                      { label: 'Total', value: stats.total, color: 'text-white' },
                      { label: 'Confirmed', value: stats.confirmed, color: 'text-blue-400' },
                      { label: 'Completed', value: stats.completed, color: 'text-emerald-400' },
                      { label: 'Cancelled', value: stats.cancelled, color: 'text-rose-400' },
                      { label: 'Live', value: stats.live, color: 'text-red-500', pulse: true }
                    ].map((stat, idx) => (
                      <div key={idx} className="bg-white/5 backdrop-blur-md border border-white/10 p-5 rounded-3xl min-w-[100px] flex flex-col items-center justify-center transition-all hover:bg-white/10 hover:-translate-y-1">
                        <span className="text-[9px] font-black text-gray-500 uppercase tracking-widest mb-2">{stat.label}</span>
                        <div className="flex items-center gap-2">
                          {stat.pulse && <span className="w-2 h-2 rounded-full bg-red-500 animate-pulse shadow-[0_0_8px_rgba(239,68,68,0.8)]" />}
                          <span className={`text-2xl font-black tracking-tight ${stat.color}`}>{stat.value}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          
          {/* Floating Premium Filter Toolbar */}
            <div className="sticky top-24 z-40 animate-fade-in-up" style={{ animationDelay: '200ms' }}>
              <div className="relative overflow-hidden rounded-[2.5rem] border border-white/20 shadow-[0_20px_50px_-15px_rgba(0,0,0,0.15)] bg-white/70 backdrop-blur-3xl p-3 lg:p-4">
                <div className="flex flex-col lg:flex-row gap-3 items-center">
                  
                  {/* Search Field */}
                  <div className="relative flex-grow w-full lg:w-auto group">
                    <Search className="absolute left-6 top-1/2 -translate-y-1/2 text-gray-400 transition-colors group-focus-within:text-blue-600" size={20} />
                    <input 
                      type="text" 
                      placeholder="Search correspondence or student ID..." 
                      value={searchApptStudent}
                      onChange={(e) => setSearchApptStudent(e.target.value)}
                      className="w-full pl-14 pr-6 h-16 bg-white/50 border border-transparent rounded-[2rem] focus:bg-white focus:ring-8 focus:ring-blue-600/5 focus:border-blue-500/30 outline-none transition-all font-bold text-sm text-gray-700 placeholder:text-gray-400 shadow-inner"
                    />
                  </div>

                  {/* Horizontal Filters */}
                  <div className="flex flex-wrap sm:flex-nowrap gap-3 w-full lg:w-auto shrink-0">
                    <div className="relative flex-1 sm:w-44">
                      <Calendar className="absolute left-5 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" size={16} />
                      <input 
                        type="date" 
                        value={filterApptDate}
                        onChange={(e) => setFilterApptDate(e.target.value)}
                        className="w-full pl-12 pr-4 h-16 bg-white/50 border border-transparent rounded-[2rem] focus:bg-white focus:border-blue-500/30 outline-none transition-all font-black text-[10px] uppercase tracking-widest text-gray-600 appearance-none cursor-pointer"
                      />
                    </div>

                    <div className="relative flex-1 sm:w-44">
                      <Filter className="absolute left-5 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" size={16} />
                      <select 
                        value={filterApptStatus} 
                        onChange={(e) => setFilterApptStatus(e.target.value)}
                        className="w-full pl-12 pr-10 h-16 bg-white/50 border border-transparent rounded-[2rem] focus:bg-white focus:border-blue-500/30 outline-none transition-all font-black text-[10px] uppercase tracking-widest text-gray-600 appearance-none cursor-pointer"
                      >
                        <option value="">Status</option>
                        <option value="Pending">Pending</option>
                        <option value="Confirmed">Confirmed</option>
                        <option value="Completed">Completed</option>
                        <option value="Cancelled">Cancelled</option>
                        <option value="In Session">Live</option>
                      </select>
                      <div className="absolute right-5 top-1/2 -translate-y-1/2 pointer-events-none text-gray-400">
                        <Plus size={14} className="rotate-45" />
                      </div>
                    </div>

                    <div className="relative flex-1 sm:w-44">
                      <Clock className="absolute left-5 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" size={16} />
                      <select 
                        value={filterApptTiming} 
                        onChange={(e) => setFilterApptTiming(e.target.value)}
                        className="w-full pl-12 pr-10 h-16 bg-white/50 border border-transparent rounded-[2rem] focus:bg-white focus:border-blue-500/30 outline-none transition-all font-black text-[10px] uppercase tracking-widest text-gray-600 appearance-none cursor-pointer"
                      >
                        <option value="All">Timing</option>
                        <option value="Upcoming">Upcoming</option>
                        <option value="Past">Past</option>
                      </select>
                      <div className="absolute right-5 top-1/2 -translate-y-1/2 pointer-events-none text-gray-400">
                        <Plus size={14} className="rotate-45" />
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Premium Appointment Cards Grid */}
            <div className="space-y-6">
              {filteredAppointments.length > 0 ? (
                filteredAppointments.map((b, idx) => {
                  if (!b) return null;
                  const note = getNoteByBookingId(b.id);
                  const safeID = (b.id || "").toString();
                  const studentDispName = b.studentName || b.name || getGuestName(safeID);
                  const initials = studentDispName.split(' ').map(nm => nm[0] || '').join('').substring(0, 2).toUpperCase() || '??';
                  const profileSrc = b.studentProfile || b.profileImage || getGuestPhoto(safeID || 'default');
                  
                  const isCancelled = b.status === 'Cancelled' || b.status === 'Rejected';
                  const isCompleted = b.status === 'Completed';
                  const isLive = b.status === 'In Session';
                  const isPending = b.status === 'Pending';
                  const isConfirmed = b.status === 'Confirmed' || b.status === 'Accepted';

                  // Dynamic Card Styling based on status - Soft Solid Gradients
                  const statusColors = {
                    Completed: { 
                      accent: '#10b981', 
                      gradient: 'linear-gradient(135deg, #e6f9f0 0%, #f5fffb 100%)', 
                      border: 'rgba(16, 185, 129, 0.2)', 
                      badgeBg: 'bg-emerald-100', 
                      badgeText: 'text-emerald-700',
                      dot: 'bg-emerald-500'
                    },
                    Cancelled: { 
                      accent: '#f43f5e', 
                      gradient: 'linear-gradient(135deg, #ffe6e6 0%, #fff5f5 100%)', 
                      border: 'rgba(244, 63, 94, 0.2)', 
                      badgeBg: 'bg-rose-100', 
                      badgeText: 'text-rose-700',
                      dot: 'bg-rose-500'
                    },
                    InSession: { 
                      accent: '#f59e0b', 
                      gradient: 'linear-gradient(135deg, #fff3e6 0%, #fffbf5 100%)', 
                      border: 'rgba(245, 158, 11, 0.2)', 
                      badgeBg: 'bg-amber-100', 
                      badgeText: 'text-amber-700',
                      dot: 'bg-amber-500'
                    },
                    Pending: { 
                      accent: '#3b82f6', 
                      gradient: 'linear-gradient(135deg, #eef4ff 0%, #f7faff 100%)', 
                      border: 'rgba(59, 130, 246, 0.2)', 
                      badgeBg: 'bg-blue-100', 
                      badgeText: 'text-blue-700',
                      dot: 'bg-blue-500'
                    },
                    Confirmed: { 
                      accent: '#6366f1', 
                      gradient: 'linear-gradient(135deg, #f0f4ff 0%, #fbfcfe 100%)', 
                      border: 'rgba(99, 102, 241, 0.2)', 
                      badgeBg: 'bg-indigo-100', 
                      badgeText: 'text-indigo-700',
                      dot: 'bg-indigo-500'
                    }
                  };

                  const currentStatusKey = isCompleted ? 'Completed' : isCancelled ? 'Cancelled' : isLive ? 'InSession' : isPending ? 'Pending' : 'Confirmed';
                  const style = statusColors[currentStatusKey];

                  return (
                    <div 
                      key={b.id} 
                      className="group relative rounded-[2.5rem] overflow-hidden transition-all duration-500 hover:shadow-[0_20px_40px_rgba(0,0,0,0.12)] hover:-translate-y-1 animate-fade-in-up"
                      style={{ 
                        animationDelay: `${idx * 50}ms`,
                        background: style.gradient,
                        border: `1px solid ${style.border}`,
                        boxShadow: '0 10px 25px rgba(0,0,0,0.08)'
                      }}
                    >
                      {/* Left Accent Border */}
                      <div className="absolute left-0 top-0 bottom-0 w-2.5 transition-all duration-300 group-hover:w-3.5" style={{ background: style.accent }}></div>

                      <div className="flex flex-col lg:flex-row">
                        
                        {/* Column 1: Student Identity (Left) */}
                        <div className="flex items-center gap-6 p-8 lg:w-[320px] shrink-0 lg:border-r border-gray-100 bg-white/30">
                          <div className="relative shrink-0">
                            <div className={`w-20 h-20 rounded-[2rem] ${getAvatarColor(studentDispName)} flex items-center justify-center border-4 border-white shadow-xl overflow-hidden transition-transform duration-500 group-hover:scale-105`}>
                              {profileSrc ? (
                                <img src={profileSrc} alt={studentDispName} className="w-full h-full object-cover" />
                              ) : (
                                <span className="text-white font-black text-2xl">{initials}</span>
                              )}
                            </div>
                            <div className={`absolute -bottom-1 -right-1 w-6 h-6 rounded-full border-4 border-white shadow-lg ${isLive ? 'animate-pulse' : ''}`} style={{ background: style.accent }}></div>
                          </div>
                          <div className="min-w-0">
                            <h3 className="font-black text-slate-900 text-xl tracking-tight leading-tight mb-2 group-hover:text-blue-700 transition-colors truncate">{studentDispName}</h3>
                            <div className="flex flex-col gap-1.5">
                              <span className="inline-flex items-center gap-1.5 text-[9px] font-bold text-slate-400 uppercase tracking-widest">
                                <User size={10} className="text-blue-600" /> {b.studentId || "STU-" + safeID.substring(0,5)}
                              </span>
                              {isLive && (
                                <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 bg-red-600 text-white rounded-lg text-[8px] font-black uppercase tracking-[0.2em] animate-pulse">
                                  Live Session
                                </span>
                              )}
                            </div>
                          </div>
                        </div>

                        {/* Column 2: Session Info Chips (Center) */}
                        <div className="flex-1 p-8 flex flex-col justify-center border-b lg:border-b-0 lg:border-r border-gray-100">
                          <div className="grid grid-cols-2 xl:grid-cols-4 gap-4">
                            {[
                              { label: 'Type', val: b.sessionType || "Individual", icon: Activity, bg: 'bg-violet-600/5', iconColor: 'text-violet-600' },
                              { label: 'Date', val: b.date || "TBD", icon: Calendar, bg: 'bg-blue-600/5', iconColor: 'text-blue-600' },
                              { label: 'Time', val: b.time || "TBD", icon: Clock, bg: 'bg-indigo-600/5', iconColor: 'text-indigo-600' },
                              { label: 'ID', val: safeID.substring(0,8), icon: Hash, bg: 'bg-slate-600/5', iconColor: 'text-slate-600' }
                            ].map((item, i) => (
                              <div key={i} className={`flex items-center gap-3 p-3.5 rounded-2xl border border-white transition-all hover:bg-white/60 ${item.bg}`}>
                                <div className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 shadow-sm bg-white ${item.iconColor}`}><item.icon size={16} strokeWidth={2.5}/></div>
                                <div className="flex flex-col min-w-0">
                                  <span className="text-[8px] font-black text-slate-400 uppercase tracking-[0.2em]">{item.label}</span>
                                  <span className="text-[13px] font-black text-slate-800 truncate leading-none mt-1">{item.val}</span>
                                </div>
                              </div>
                            ))}
                          </div>
                          
                          {b.rejectReason && (
                            <div className="mt-5 p-4 rounded-2xl bg-white/60 border border-rose-200/50 flex items-start gap-3">
                              <AlertTriangle size={16} className="text-rose-500 mt-0.5 shrink-0" />
                              <p className="text-[11px] text-slate-600 font-bold leading-relaxed"><span className="font-black uppercase tracking-widest text-[9px] mr-2 text-rose-600 opacity-70">Reason:</span>{b.rejectReason}</p>
                            </div>
                          )}
                        </div>

                        {/* Column 3: Status & Actions (Right) */}
                        <div className="lg:w-[260px] shrink-0 p-8 flex flex-col justify-center gap-4 bg-white/20">
                          {/* Premium Status Badge */}
                          <div className={`flex items-center justify-center gap-2.5 px-5 py-3 rounded-2xl font-black text-[10px] uppercase tracking-[0.2em] border shadow-sm transition-all duration-300 ${style.badgeBg} ${style.badgeText} border-white/60`}>
                            <span className={`w-2 h-2 rounded-full ${style.dot} ${isLive ? 'animate-pulse' : ''}`}></span>
                            {isLive ? 'In Session' : (b.status === 'Accepted' ? 'Confirmed' : b.status === 'Rejected' ? 'Cancelled' : (b.status || 'Pending'))}
                          </div>

                          {/* Action Grid */}
                          <div className="grid gap-2">
                            {isPending && (
                              <button onClick={() => confirmBookingByCounsellor(b.id)} className="w-full py-4 rounded-3xl font-black text-[10px] uppercase tracking-widest bg-blue-600 text-white hover:bg-blue-700 shadow-lg shadow-blue-100 transition-all active:scale-95 flex items-center justify-center gap-2">
                                <CheckCircle size={15} strokeWidth={3}/> Confirm Appt
                              </button>
                            )}

                            {(isConfirmed || isLive) && (
                              <div className="flex flex-col gap-2">
                                <button onClick={() => isLive ? window.open(b.sessionLink, "_blank") : startSession(b.id)} className={`w-full py-4 rounded-3xl font-black text-[10px] uppercase tracking-widest text-white transition-all active:scale-95 flex items-center justify-center gap-2 shadow-lg ${isLive ? 'bg-red-600 hover:bg-red-700 shadow-red-100' : 'bg-indigo-600 hover:bg-indigo-700 shadow-indigo-100'}`}>
                                  <Video size={15} strokeWidth={3}/> {isLive ? 'Join Room' : 'Start Session'}
                                </button>
                                <button onClick={() => completeBooking(b.id)} className="w-full py-4 rounded-3xl font-black text-[10px] uppercase tracking-widest bg-emerald-600 text-white hover:bg-emerald-700 shadow-lg shadow-emerald-100 transition-all active:scale-95 flex items-center justify-center gap-2">
                                  <CheckCircle size={15} strokeWidth={3}/> Mark Complete
                                </button>
                              </div>
                            )}

                            {isCompleted && (
                              <button onClick={() => navigate(`/chat?id=${b.studentId || b.id}&name=${encodeURIComponent(studentDispName)}`)} className="w-full py-4 rounded-3xl font-black text-[10px] uppercase tracking-widest bg-slate-900 text-white hover:bg-blue-600 shadow-lg shadow-slate-200 transition-all active:scale-95 flex items-center justify-center gap-2">
                                <MessageCircle size={15} strokeWidth={3}/> Patient Chat
                              </button>
                            )}

                            <div className="grid grid-cols-2 gap-2 mt-1">
                              <button onClick={() => navigate(`/counsellor/appointment/${b.id}`)} className="h-11 rounded-2xl font-black text-[9px] uppercase tracking-widest transition-all bg-white text-slate-500 border border-slate-100 hover:border-blue-400 hover:text-blue-600 active:scale-95 shadow-sm">
                                Details
                              </button>
                              
                              {isCompleted ? (
                                <button onClick={() => openNotesModal("booking", b)} className={`h-11 rounded-2xl font-black text-[9px] uppercase tracking-widest transition-all border active:scale-95 shadow-sm ${note ? 'bg-blue-600 text-white border-blue-600' : 'bg-white text-slate-400 border-slate-100 hover:text-blue-600 hover:border-blue-300'}`}>
                                  {note ? "View Note" : "Add Note"}
                                </button>
                              ) : (
                                <button 
                                  onClick={() => {
                                    setPopInput("");
                                    setPopMsg({
                                      isOpen: true,
                                      title: isPending ? "Decline Request" : "Cancel Session",
                                      message: "Please provide a valid reason for the student:",
                                      type: 'prompt',
                                      onConfirm: () => handleModalCancel(b.id)
                                    });
                                  }}
                                  className="h-11 rounded-2xl font-black text-[9px] uppercase tracking-widest transition-all bg-white text-rose-400 border border-rose-50 hover:text-rose-600 hover:border-rose-200 active:scale-95 shadow-sm"
                                >
                                  {isPending ? "Decline" : "Cancel"}
                                </button>
                              )}
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                })
              ) : (
                <div className="text-center py-24 rounded-[3rem] border-4 border-dashed border-white/20 bg-white/5 backdrop-blur-xl animate-fade-in">
                  <div className="w-24 h-24 bg-white/10 rounded-[2rem] flex items-center justify-center mx-auto mb-6 border border-white/20">
                    <Calendar className="text-white/40" size={48} />
                  </div>
                  <h3 className="text-2xl font-black text-white tracking-tight">No Appointments Synchronized</h3>
                  <p className="text-gray-400 text-sm font-medium mt-2">Adjust your filters to view historical or pending correspondence.</p>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

        {/* Session Notes Tab */}
        {activeTab === "session notes" && (
          <div className="space-y-8">
            <div className="flex justify-between items-center">
              <h2 className="text-sm font-black text-white uppercase tracking-[0.2em] flex items-center gap-2">
                <FileText size={18} className="text-blue-400" /> Manage Professional Notes
              </h2>
              <button onClick={() => openNotesModal("new")} className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-2xl font-black text-xs uppercase tracking-widest shadow-lg shadow-blue-200 transition-all flex items-center gap-2 active:scale-95">
                <Plus size={18} /> Create New Note
              </button>
            </div>

            <div className="glass-purple p-6 rounded-3xl shadow-sm border border-gray-100 flex flex-col md:flex-row gap-4 items-end">
              <div className="flex-1 w-full space-y-2">
                <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Search Keywords</label>
                <div className="relative">
                  <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                  <input 
                    type="text" 
                    placeholder="Search by student, title, or keywords..." 
                    value={searchNotes}
                    maxLength={50}
                    onChange={(e) => setSearchNotes(e.target.value)}
                    className={`w-full pl-12 pr-12 h-12 border rounded-2xl focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 outline-none transition font-medium ${searchNotesError ? 'border-red-300 bg-red-50' : 'border-gray-100 bg-gray-50/50'}`}
                  />
                  {searchNotes && (
                    <button 
                      onClick={() => setSearchNotes("")}
                      className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
                      title="Clear search"
                    >
                      <XCircle size={18} />
                    </button>
                  )}
                </div>
                {searchNotesError && (
                  <p className="text-red-500 text-[10px] font-bold uppercase tracking-wider mt-1 ml-1">{searchNotesError}</p>
                )}
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 w-full md:w-auto">
                <div className="space-y-2">
                  <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Date</label>
                  <div className="relative">
                    <Calendar className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" size={16} />
                    <input 
                      type="date" 
                      value={filterDateNotes}
                      onChange={(e) => setFilterDateNotes(e.target.value)}
                      className="w-full pl-10 pr-4 h-12 border border-gray-100 rounded-2xl focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 outline-none bg-gray-50/50 transition-all font-medium text-xs"
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Risk Level</label>
                  <div className="relative">
                    <Filter className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" size={16} />
                    <select 
                      value={filterRiskNotes} 
                      onChange={(e) => setFilterRiskNotes(e.target.value)}
                      className="w-full pl-10 pr-8 h-12 border border-gray-100 rounded-2xl focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 outline-none bg-gray-50/50 transition-all font-black text-[10px] uppercase tracking-wider appearance-none"
                    >
                      <option value="">All Risk Levels</option>
                      <option value="Low">Low Risk</option>
                      <option value="Medium">Medium Risk</option>
                      <option value="High">High Risk</option>
                      <option value="Severe">Severe Risk</option>
                    </select>
                  </div>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 space-y-5">
              {filteredNotes.map(n => {
                const safeId = n.studentId || (n.appointmentId ? "STU-" + n.appointmentId.toString().substring(0, 5) : "N/A ID");
                const safeName = n.studentName || getGuestName(n.appointmentId || n.id || 'default');
                const initials = safeName ? safeName.split(' ').map(nm => nm[0]).join('').substring(0, 2).toUpperCase() : '??';
                const profileSrc = n.studentProfile || getGuestPhoto(n.appointmentId || n.id || 'default');

                return (
                  <div key={n.id} className="glass-purple flex flex-col md:flex-row justify-between items-start md:items-center gap-6 hover:shadow-xl hover:shadow-blue-200/20 hover:border-blue-300 group overflow-hidden relative p-6 pl-8 transition-all duration-300">
                    <div className="absolute left-0 top-0 bottom-0 w-1.5 bg-blue-500 transition-all duration-300 group-hover:w-2"></div>
                    
                    <div className="flex-1 w-full">
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
                        <div className="flex items-center gap-5">
                          <div className="relative group/avatar">
                            <div className={`w-14 h-14 rounded-full ${getAvatarColor(safeName)} flex items-center justify-center border-2 border-white shadow-sm overflow-hidden transition-transform group-hover/avatar:scale-105`}>
                              {profileSrc ? (
                                <img 
                                  src={profileSrc} 
                                  alt={safeName} 
                                  className="w-full h-full object-cover"
                                />
                              ) : (
                                <span className="text-white font-black text-lg">{initials}</span>
                              )}
                            </div>
                            <div className="absolute -bottom-0.5 -right-0.5 w-4 h-4 bg-emerald-500 border-2 border-white rounded-full"></div>
                          </div>
                          <div>
                            <h3 className="font-black text-gray-900 text-xl leading-tight group-hover:text-blue-600 transition-colors">{safeName}</h3>
                            <p className="text-[10px] font-black text-gray-400 uppercase tracking-[0.15em] mt-1">Student ID: {safeId}</p>
                          </div>
                        </div>
                        <div className="flex flex-wrap gap-2">
                          <span className={`text-[9px] px-3 py-1 rounded-full font-black uppercase tracking-widest border shadow-sm transition-all duration-300 flex items-center gap-2 ${
                            (n.status || '') === 'Completed' ? 'bg-emerald-100/50 text-emerald-700 border-emerald-200/50' : 'bg-blue-100/50 text-blue-700 border-blue-200/50'
                          }`}>
                            <span className={`w-2 h-2 rounded-full animate-pulse ${
                              (n.status || '') === 'Completed' ? 'bg-emerald-500' : 'bg-blue-500'
                            }`}></span>
                            {n.status || 'Draft'}
                          </span>
                          <span className={`text-[9px] px-3 py-1 rounded-full font-black uppercase tracking-widest border shadow-sm transition-all duration-300 flex items-center gap-2 ${
                            ['Severe','Critical','High'].includes(n.riskLevel) ? 'bg-rose-100/50 text-rose-700 border-rose-200/50' : 
                            n.riskLevel === 'Medium' ? 'bg-amber-100/50 text-amber-700 border-amber-200/50' : 
                            'bg-blue-100/50 text-blue-700 border-blue-200/50'
                          }`}>
                            <span className={`w-2 h-2 rounded-full animate-pulse ${
                              ['Severe','Critical','High'].includes(n.riskLevel) ? 'bg-rose-500' : 
                              n.riskLevel === 'Medium' ? 'bg-amber-500' : 'bg-blue-500'
                            }`}></span>
                            {n.riskLevel || 'Low'} Risk
                          </span>
                          <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest bg-white/80 px-3 py-1 rounded-lg border border-gray-100 group-hover:bg-blue-50 group-hover:text-blue-700 group-hover:border-blue-100 transition-all">
                            {n.sessionDate || 'N/A'}
                          </span>
                        </div>
                      </div>
                      
                      <div className="mb-6 bg-white/40 p-5 rounded-2xl border border-white/60">
                        <h4 className="font-black text-gray-900 text-sm mb-2 group-hover:text-blue-700 transition-colors">{n.title || 'Untitled Note'}</h4>
                        <p className="text-sm text-gray-600 leading-relaxed font-medium line-clamp-2 italic">
                          "{n.notes || 'No summary available'}"
                        </p>
                      </div>
                      
                      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                        <div className="flex items-center gap-6">
                          <div className="flex items-center gap-2.5">
                            <div className="w-8 h-8 rounded-lg bg-emerald-50 flex items-center justify-center text-emerald-600 border border-emerald-100/50 italic font-black text-[10px]">R</div>
                            <p className="text-[11px] font-black text-gray-600 leading-tight">
                              <span className="block text-[8px] text-gray-400 uppercase tracking-widest mb-0.5">Recommendation</span>
                              {n.recommendation || 'No recommendation specified.'}
                            </p>
                          </div>
                        </div>
                        
                        <div className="flex gap-2 w-full sm:w-auto">
                          <button onClick={() => openNotesModal("edit", n)} className="flex-1 sm:flex-none p-3 bg-blue-50 text-blue-600 rounded-xl hover:bg-blue-600 hover:text-white transition-all active:scale-95 shadow-sm border border-blue-100/50 flex items-center justify-center gap-2" title="Edit Clinical Note">
                            <Eye size={18} /> <span className="sm:hidden text-[10px] font-black uppercase">View/Edit</span>
                          </button>
                          <button onClick={() => deleteNote(n.id)} className="p-3 bg-white text-rose-500 border border-rose-100 rounded-xl hover:bg-rose-50 transition-all active:scale-95 flex items-center justify-center" title="Delete Note">
                            <Trash2 size={18} />
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
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

      {/* Advanced Clinical Session Note Modal */}
      {showNoteModal && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-[2px] flex items-center justify-center p-4 z-50 overflow-y-auto transition-all duration-500">
          <div className="bg-[#fcfdfe] rounded-[2.5rem] w-full max-w-4xl shadow-[0_30px_70px_rgba(0,0,0,0.15)] my-8 overflow-hidden flex flex-col max-h-[95vh] border border-white animate-fade-in-up">
            
            {/* Modal Header */}
            <div className="p-8 lg:px-10 border-b border-slate-100 flex justify-between items-center bg-white sticky top-0 z-10">
              <div className="flex items-center gap-5">
                <div className="w-14 h-14 rounded-2xl bg-blue-600 flex items-center justify-center text-white shadow-lg shadow-blue-200">
                  <ClipboardList size={28} strokeWidth={2.5} />
                </div>
                <div>
                  <h2 className="text-2xl font-black text-slate-900 tracking-tight leading-none mb-1.5">
                    {isViewOnly ? "Clinical Record View" : (existingNoteId ? "Update Session Note" : "New Session Note")}
                  </h2>
                  <p className="text-[11px] font-bold text-slate-400 uppercase tracking-widest flex items-center gap-2">
                    <Activity size={12} className="text-blue-500" /> Record and analyze counselling session details
                  </p>
                </div>
              </div>
              <button onClick={() => setShowNoteModal(false)} className="w-12 h-12 rounded-2xl bg-slate-50 text-slate-400 hover:bg-rose-50 hover:text-rose-500 transition-all flex items-center justify-center active:scale-90">
                <XCircle size={24} strokeWidth={2.5} />
              </button>
            </div>
            
            <div className="p-8 lg:p-10 overflow-y-auto space-y-10 flex-grow scrollbar-hide">
              
              {/* Section 1: Appointment Context */}
              <div className="space-y-6">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-lg bg-blue-100/50 flex items-center justify-center text-blue-600"><Hash size={16} strokeWidth={3}/></div>
                  <h3 className="text-xs font-black text-slate-400 uppercase tracking-[0.2em]">Section 01: Appointment Context</h3>
                </div>
                
                {!currentBooking && !existingNoteId ? (
                  <div className="group">
                    <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2.5 ml-1">Target Appointment *</label>
                    <div className="relative">
                      <Calendar className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" size={18} />
                      <select 
                        value={selectedBookingId}
                        disabled={isViewOnly}
                        onChange={(e) => { setSelectedBookingId(e.target.value); if(errors.selectedBookingId) setErrors({...errors, selectedBookingId: null}); }}
                        className={`w-full h-14 pl-12 pr-10 border rounded-2xl outline-none transition-all font-bold text-sm bg-[#f7faff] appearance-none disabled:bg-slate-50 disabled:text-slate-300 ${errors.selectedBookingId ? 'border-red-300 ring-4 ring-red-500/5' : 'border-slate-100 focus:ring-4 focus:ring-blue-500/5 focus:border-blue-400 focus:bg-white'}`}
                      >
                        <option value="">Select a completed session to associate...</option>
                        {completedBookingsForNotes.length > 0 ? (
                          completedBookingsForNotes.map(b => {
                            const hasNote = !!getNoteByBookingId(b?.id);
                            const safeID = (b?.id || "").toString();
                            return (
                              <option key={b?.id || Math.random()} value={b?.id} disabled={hasNote}>
                                {b?.studentName || b?.name || "N/A"} – {b?.studentId || ("STU-" + safeID.substring(0,5))} – {b?.date || "N/A"} {hasNote ? "(Already Documented)" : ""}
                              </option>
                            );
                          })
                        ) : (
                          <option disabled value="">No completed appointments found</option>
                        )}
                      </select>
                      <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none text-slate-400">
                        <Plus size={16} className="rotate-45" />
                      </div>
                    </div>
                    {errors.selectedBookingId && <p className="text-red-600 text-[10px] font-black uppercase tracking-wider mt-2 ml-1">{errors.selectedBookingId}</p>}
                  </div>
                ) : (
                  <div className="bg-blue-50/50 border border-blue-100 rounded-3xl p-6 flex flex-col sm:flex-row items-center gap-6">
                    <div className={`w-16 h-16 rounded-2xl ${getAvatarColor(currentBooking?.studentName || "S")} flex items-center justify-center text-white text-2xl font-black shadow-lg`}>
                      {currentBooking?.studentName?.charAt(0) || "S"}
                    </div>
                    <div className="flex-1 text-center sm:text-left">
                      <h4 className="text-xl font-black text-slate-900 tracking-tight">{currentBooking?.studentName || "Documented Student"}</h4>
                      <p className="text-[11px] font-bold text-slate-400 uppercase tracking-widest mt-1">
                        Session Date: <span className="text-blue-600">{currentBooking?.date || "N/A"}</span> | ID: <span className="text-slate-600">{(currentBooking?.id || "").toString().substring(0,8)}</span>
                      </p>
                    </div>
                    <div className="px-5 py-2.5 bg-white rounded-2xl border border-blue-100 text-[10px] font-black text-blue-700 uppercase tracking-widest shadow-sm">
                      Linked Appointment
                    </div>
                  </div>
                )}
              </div>

              <div className="w-full h-px bg-slate-100 opacity-50"></div>

              {/* Section 2: Core Classification */}
              <div className="space-y-6">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-lg bg-emerald-100/50 flex items-center justify-center text-emerald-600"><Info size={16} strokeWidth={3}/></div>
                  <h3 className="text-xs font-black text-slate-400 uppercase tracking-[0.2em]">Section 02: Core Classification</h3>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  <div className="group">
                    <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2.5 ml-1">Case Title *</label>
                    <input 
                      type="text" 
                      value={noteTitle}
                      disabled={isViewOnly}
                      onChange={(e) => { setNoteTitle(e.target.value); if(errors.noteTitle) setErrors({...errors, noteTitle: null}); }}
                      placeholder="e.g. Anxiety Assessment & Stress Management"
                      className={`w-full h-14 px-5 border rounded-2xl outline-none transition-all font-bold text-sm bg-[#f7faff] disabled:bg-slate-50 ${errors.noteTitle ? 'border-red-300 ring-4 ring-red-500/5' : 'border-slate-100 focus:ring-4 focus:ring-blue-500/5 focus:border-blue-400 focus:bg-white'}`}
                    />
                    {errors.noteTitle && <p className="text-red-600 text-[10px] font-black uppercase tracking-wider mt-2 ml-1">{errors.noteTitle}</p>}
                  </div>
                  <div>
                    <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2.5 ml-1">Risk Assessment *</label>
                    <div className="relative">
                      <ShieldAlert className={`absolute left-4 top-1/2 -translate-y-1/2 ${
                        riskLevel === 'High' || riskLevel === 'Critical' || riskLevel === 'Severe' ? 'text-rose-500' :
                        riskLevel === 'Medium' ? 'text-amber-500' : 'text-emerald-500'
                      }`} size={18} />
                      <select 
                        value={riskLevel}
                        disabled={isViewOnly}
                        onChange={(e) => { setRiskLevel(e.target.value); if(errors.riskLevel) setErrors({...errors, riskLevel: null}); }}
                        className={`w-full h-14 pl-12 pr-10 border rounded-2xl outline-none transition-all font-bold text-sm bg-[#f7faff] appearance-none disabled:bg-slate-50 ${errors.riskLevel ? 'border-red-300 ring-4 ring-red-500/5' : 'border-slate-100 focus:ring-4 focus:ring-blue-500/5 focus:border-blue-400 focus:bg-white'}`}
                      >
                        <option value="Low">Low Risk (Baseline)</option>
                        <option value="Medium">Medium Risk (Monitoring)</option>
                        <option value="High">High Risk (Urgent)</option>
                        <option value="Critical">Critical Risk (Emergency)</option>
                        <option value="Severe">Severe Risk (Acute)</option>
                      </select>
                      <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none text-slate-400">
                        <Plus size={16} className="rotate-45" />
                      </div>
                    </div>
                    {errors.riskLevel && <p className="text-red-600 text-[10px] font-black uppercase tracking-wider mt-2 ml-1">{errors.riskLevel}</p>}
                  </div>
                </div>
              </div>

              <div className="w-full h-px bg-slate-100 opacity-50"></div>

              {/* Section 3: Detailed Documentation */}
              <div className="space-y-6">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-lg bg-violet-100/50 flex items-center justify-center text-violet-600"><FileText size={16} strokeWidth={3}/></div>
                    <h3 className="text-xs font-black text-slate-400 uppercase tracking-[0.2em]">Section 03: Session Documentation</h3>
                  </div>
                  <button 
                    onClick={analyzeRisk} 
                    disabled={isAnalyzing || noteText.trim().length < 10 || isViewOnly}
                    className="group/btn relative px-6 py-2.5 rounded-xl font-black text-[10px] uppercase tracking-[0.2em] transition-all overflow-hidden disabled:opacity-50"
                  >
                    <div className="absolute inset-0 bg-gradient-to-r from-blue-600 to-indigo-600 transition-all group-hover/btn:scale-110"></div>
                    <span className="relative flex items-center justify-center gap-2 text-white">
                      <Sparkles size={14} className={isAnalyzing ? 'animate-spin' : 'animate-pulse'} /> 
                      {isAnalyzing ? "Intelli-Analysis..." : "AI Intelligence Analyze"}
                    </span>
                  </button>
                </div>
                
                <div className="relative group">
                  <textarea
                    value={noteText}
                    disabled={isViewOnly}
                    onChange={(e) => { setNoteText(e.target.value); if(errors.noteText) setErrors({...errors, noteText: null}); }}
                    placeholder="Enter detailed clinical observations, discussed topics, student progress, and mental state markers..."
                    rows={8}
                    className={`w-full border rounded-[2rem] p-8 outline-none transition-all text-sm font-medium leading-relaxed bg-[#f7faff] resize-none disabled:bg-slate-50 ${errors.noteText ? 'border-red-300 ring-4 ring-red-500/5' : 'border-slate-100 focus:ring-8 focus:ring-blue-500/5 focus:border-blue-300 focus:bg-white shadow-inner'}`}
                  />
                  {errors.noteText && <p className="text-red-600 text-[10px] font-black uppercase tracking-wider mt-3 ml-1">{errors.noteText}</p>}
                </div>
              </div>

              {aiAnalysis && (
                <div className="bg-gradient-to-br from-indigo-50/50 to-blue-50/50 border border-indigo-100 rounded-[2rem] p-8 shadow-sm animate-in fade-in zoom-in duration-500">
                  <div className="flex items-start gap-4 mb-6">
                    <div className="w-12 h-12 rounded-2xl bg-white flex items-center justify-center text-indigo-600 shadow-md">
                      <Sparkles size={24} className="animate-pulse" />
                    </div>
                    <div className="flex-1">
                      <h4 className="font-black text-slate-900 flex flex-wrap items-center gap-3">
                        Intelli-Analysis Result: 
                        <span className={`px-4 py-1 rounded-xl text-[10px] font-black uppercase tracking-[0.2em] border shadow-sm ${
                          aiAnalysis.suggestedRisk === 'Critical' || aiAnalysis.suggestedRisk === 'High' || aiAnalysis.suggestedRisk === 'Severe' ? 'bg-rose-100 text-rose-700 border-rose-200' :
                          aiAnalysis.suggestedRisk === 'Medium' ? 'bg-amber-100 text-amber-700 border-amber-200' :
                          'bg-emerald-100 text-emerald-700 border-emerald-200'
                        }`}>
                          <span className={`inline-block w-2 h-2 rounded-full mr-2 ${
                             aiAnalysis.suggestedRisk === 'Critical' || aiAnalysis.suggestedRisk === 'High' || aiAnalysis.suggestedRisk === 'Severe' ? 'bg-rose-500' :
                             aiAnalysis.suggestedRisk === 'Medium' ? 'bg-amber-500' : 'bg-emerald-500'
                          }`}></span>
                          {aiAnalysis.suggestedRisk} Risk Suggested
                        </span>
                      </h4>
                      <p className="text-sm text-slate-600 mt-2 font-medium leading-relaxed italic border-l-4 border-indigo-200 pl-4 py-1">
                        "{aiAnalysis.reason}"
                      </p>
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8 ml-4">
                    <div className="bg-white/60 p-4 rounded-2xl border border-white">
                      <div className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-2.5">Detected Markers</div>
                      <div className="flex flex-wrap gap-2">
                        {aiAnalysis.indicators.length > 0 ? aiAnalysis.indicators.map(ind => (
                          <span key={ind} className="bg-indigo-50 text-indigo-700 px-3 py-1 rounded-lg text-[10px] font-black uppercase tracking-wider border border-indigo-100/50">{ind}</span>
                        )) : <span className="text-xs text-slate-400 italic">No major indicators identified</span>}
                      </div>
                    </div>
                    <div className="bg-white/60 p-4 rounded-2xl border border-white">
                      <div className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-2.5">Suggested Action</div>
                      <div className="text-sm font-black text-slate-800 flex items-center gap-2">
                        <div className="w-1.5 h-1.5 rounded-full bg-indigo-500"></div>
                        {aiAnalysis.suggestedAction}
                      </div>
                    </div>
                  </div>

                  <div className="pt-6 border-t border-indigo-100 flex flex-col sm:flex-row sm:items-center justify-between gap-5">
                    <div className="flex items-start gap-2.5 text-[10px] text-amber-600 font-bold max-w-md">
                      <AlertTriangle size={14} className="shrink-0 mt-0.5" /> 
                      AI suggestions are decision-support tools only and do not replace professional clinical judgment.
                    </div>
                    <button 
                      onClick={() => {
                        setRiskLevel(aiAnalysis.suggestedRisk);
                        if (!counsellorAssessment) setCounsellorAssessment(aiAnalysis.suggestedAction);
                        toast.success("Intelligence data applied to form.");
                      }}
                      disabled={isViewOnly}
                      className="px-6 py-3 bg-white text-indigo-600 rounded-2xl font-black text-[10px] uppercase tracking-widest shadow-lg shadow-indigo-100 hover:bg-indigo-600 hover:text-white transition-all active:scale-95 border border-indigo-100"
                    >
                      Apply Analysis
                    </button>
                  </div>
                </div>
              )}

              <div className="w-full h-px bg-slate-100 opacity-50"></div>

              {/* Section 4: Clinical Assessment */}
              <div className="space-y-6">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-lg bg-rose-100/50 flex items-center justify-center text-rose-600"><Activity size={16} strokeWidth={3}/></div>
                  <h3 className="text-xs font-black text-slate-400 uppercase tracking-[0.2em]">Section 04: Clinical Assessment</h3>
                </div>

                <div className="group">
                  <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2.5 ml-1">Professional Assessment *</label>
                  <textarea 
                    value={counsellorAssessment}
                    disabled={isViewOnly}
                    onChange={(e) => { setCounsellorAssessment(e.target.value); if(errors.counsellorAssessment) setErrors({...errors, counsellorAssessment: null}); }}
                    placeholder="Record professional clinical assessment, diagnostic notes, and post-session recommendations..."
                    rows={4}
                    className={`w-full border rounded-2xl p-6 outline-none transition-all text-sm font-medium bg-[#f7faff] resize-none disabled:bg-slate-50 ${errors.counsellorAssessment ? 'border-red-300 ring-4 ring-red-500/5' : 'border-slate-100 focus:ring-8 focus:ring-rose-500/5 focus:border-rose-300 focus:bg-white shadow-inner'}`}
                  />
                  {errors.counsellorAssessment && <p className="text-red-600 text-[10px] font-black uppercase tracking-wider mt-3 ml-1">{errors.counsellorAssessment}</p>}
                </div>
              </div>

              <div className="w-full h-px bg-slate-100 opacity-50"></div>

              {/* Section 5: Note Finalization */}
              <div className="space-y-6">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-lg bg-slate-100 flex items-center justify-center text-slate-600"><Save size={16} strokeWidth={3}/></div>
                  <h3 className="text-xs font-black text-slate-400 uppercase tracking-[0.2em]">Section 05: Note Finalization</h3>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {[
                    { val: 'Draft', label: 'Save as Internal Draft', icon: Pencil, color: 'amber' },
                    { val: 'Completed', label: 'Finalize Clinical Record', icon: CheckCircle, color: 'blue' }
                  ].map(option => (
                    <label 
                      key={option.val}
                      className={`relative flex items-center gap-4 p-5 rounded-2xl border-2 cursor-pointer transition-all ${
                        noteStatus === option.val 
                          ? `border-${option.color}-500 bg-${option.color}-50/50 shadow-md` 
                          : 'border-slate-100 bg-white hover:bg-slate-50'
                      } ${isViewOnly ? 'opacity-60 cursor-default' : 'active:scale-[0.98]'}`}
                    >
                      <input type="radio" name="noteStatus" value={option.val} checked={noteStatus === option.val} onChange={() => !isViewOnly && setNoteStatus(option.val)} className="sr-only" disabled={isViewOnly} />
                      <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${
                        noteStatus === option.val ? `bg-${option.color}-500 text-white` : 'bg-slate-100 text-slate-400'
                      }`}>
                        <option.icon size={20} strokeWidth={2.5} />
                      </div>
                      <div className="flex-1">
                        <p className={`text-xs font-black uppercase tracking-widest ${noteStatus === option.val ? `text-${option.color}-700` : 'text-slate-500'}`}>
                          {option.val}
                        </p>
                        <p className="text-[10px] text-slate-400 font-bold mt-0.5">{option.label}</p>
                      </div>
                      {noteStatus === option.val && (
                        <div className={`w-5 h-5 rounded-full bg-${option.color}-500 flex items-center justify-center text-white`}>
                          <CheckCircle size={12} strokeWidth={4} />
                        </div>
                      )}
                    </label>
                  ))}
                </div>
              </div>
            </div>
            
            {/* Modal Footer */}
            <div className="p-8 lg:px-10 border-t border-slate-100 bg-white flex flex-col sm:flex-row justify-between items-center gap-5 sticky bottom-0">
              <div className="w-full sm:w-auto">
                {existingNoteId && !isViewOnly && (
                  <button 
                    onClick={handleDeleteNote} 
                    className="w-full sm:w-auto px-6 py-3 text-rose-500 hover:text-white hover:bg-rose-500 rounded-2xl font-black text-[10px] uppercase tracking-widest transition-all active:scale-95 border border-rose-100 hover:border-rose-500 shadow-sm"
                  >
                    Discard Record
                  </button>
                )}
              </div>
              
              <div className="flex gap-3 w-full sm:w-auto">
                <button 
                  onClick={() => setShowNoteModal(false)} 
                  className="flex-1 sm:flex-none px-8 py-3.5 bg-slate-50 text-slate-500 hover:bg-slate-100 rounded-2xl font-black text-[10px] uppercase tracking-widest transition-all active:scale-95 border border-slate-100"
                >
                  {isViewOnly ? "Close Record" : "Cancel"}
                </button>
                {!isViewOnly && (
                  <button 
                    onClick={saveNotes} 
                    className="flex-1 sm:flex-none px-10 py-3.5 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-2xl font-black text-[10px] uppercase tracking-widest shadow-xl shadow-blue-200 hover:shadow-indigo-300 hover:-translate-y-1 transition-all active:scale-95 flex items-center justify-center gap-3"
                  >
                    <Save size={18} strokeWidth={2.5} /> {existingNoteId ? "Update Clinical File" : "Commit to System"}
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Global Feedback Form placed below tabs */}
      <div className="max-w-7xl mx-auto mt-6">
        <FeedbackForm />
      </div>

    </div>
  );
}

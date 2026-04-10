import { useState, useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import { useCounsellorContext } from "../../context/CounsellorContext";
import { useBooking } from "../../context/BookingContext";
import { useSessionNotes } from "../../context/SessionNoteContext";
import { Calendar, Clock, CheckCircle, XCircle, FileText, Activity, Search, Filter, Plus, MessageCircle, Sparkles, AlertTriangle, Eye, Pencil, User, Trash2 } from "lucide-react";
import toast from "react-hot-toast";
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
  const { fetchCounsellors, getCounsellorById, getCounsellorByEmail, updateAvailability } = useCounsellorContext();
  const { bookings, fetchBookings, confirmBookingByCounsellor, cancelBookingByCounsellor, completeBooking } = useBooking();
  const { notes, fetchNotes, addNote, updateNote, deleteNote, getNoteByBookingId } = useSessionNotes();

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

  // Re-fetch data on navigating to specific tabs
  useEffect(() => {
    if (activeTab === "appointments" && typeof fetchBookings === "function") {
      fetchBookings();
    }
    if (activeTab === "session notes" && typeof fetchNotes === "function") {
      fetchNotes();
    }
    if (typeof fetchCounsellors === "function") {
      fetchCounsellors();
    }
  }, [activeTab, fetchBookings, fetchNotes, fetchCounsellors]);

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
      if (typeof updateAvailability === 'function') {
        const promise = updateAvailability(counsellor?.id, selectedDate, selectedSlots);
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
  const [recommendation, setRecommendation] = useState("");
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
      followUpRecommendation: recommendation,
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
    <div className={`min-h-screen pt-12 pb-24 relative transition-colors duration-500 ${activeTab !== "availability" ? "bg-gray-50/50" : ""}`}>

      {/* Background image — only shown on Availability tab */}
      {activeTab === "availability" && (
        <>
          <div
            className="fixed inset-0 z-0 bg-cover bg-center bg-no-repeat"
            style={{ backgroundImage: `url('https://images.unsplash.com/photo-1497366754035-f200968a6e72?q=80&w=1600&auto=format&fit=crop')` }}
          />
          {/* Light white overlay for readability */}
          <div className="fixed inset-0 z-10 bg-white/80 backdrop-blur-[1px]" />
        </>
      )}

      {/* Background image — only shown on Appointments tab */}
      {activeTab === "appointments" && (
        <>
          <div
            className="fixed inset-0 z-0 bg-cover bg-center bg-no-repeat"
            style={{ backgroundImage: `url('https://images.unsplash.com/photo-1506784983877-45594efa4cbe?q=80&w=1600&auto=format&fit=crop')` }}
          />
          {/* Light white overlay for readability */}
          <div className="fixed inset-0 z-10 bg-white/80 backdrop-blur-[1px]" />
        </>
      )}

      {/* Background image — only shown on Session Notes tab */}
      {activeTab === "session notes" && (
        <>
          <div
            className="fixed inset-0 z-0 bg-cover bg-center bg-no-repeat"
            style={{ backgroundImage: `url('https://images.unsplash.com/photo-1476234251651-f353703a034d?q=80&w=1600&auto=format&fit=crop')` }}
          />
          {/* Light white overlay for readability */}
          <div className="fixed inset-0 z-10 bg-white/85 backdrop-blur-[1px]" />
        </>
      )}

      <div className="max-w-7xl mx-auto px-6 lg:px-8 relative z-20">
        <h1 className="text-4xl font-black text-gray-900 tracking-tight mb-2">Welcome, {counsellor?.name || user?.name || 'Counsellor'}</h1>
        <p className="text-gray-500 font-black uppercase tracking-widest text-[10px] mb-10 opacity-60">Manage notes only</p>

        {/* In-page tabs removed in favor of global Navbar routing */}

        {/* Availability Tab */}
        {activeTab === "availability" && (
          <div className="space-y-8 animate-in fade-in duration-700">
            <div className="bg-gradient-to-br from-blue-50/60 via-white to-white p-8 lg:p-12 rounded-[2rem] shadow-md border-2 border-blue-100/50 relative overflow-hidden">
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
            <div className="flex justify-between items-center">
              <h2 className="text-sm font-black text-gray-400 uppercase tracking-[0.2em] flex items-center gap-2">
                <Calendar size={18} className="text-blue-600" /> Appointment Management
              </h2>
            </div>
            
            <div className="bg-white p-6 rounded-3xl shadow-sm border border-gray-100 flex flex-col md:flex-row gap-4 items-end">
              <div className="flex-1 w-full space-y-2">
                <label className="text-sm font-semibold text-gray-600 block ml-1 mb-1">Search Student or ID</label>
                <div className="relative">
                  <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                  <input 
                    type="text" 
                    placeholder="Search by student name, ID, or appointment ID" 
                    value={searchApptStudent}
                    onChange={(e) => setSearchApptStudent(e.target.value)}
                    className="w-full pl-12 pr-4 h-12 border border-gray-100 rounded-2xl focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 outline-none bg-gray-50/50 transition-all font-medium"
                  />
                </div>
                {apptSearchError && <p className="text-red-500 text-[10px] font-bold uppercase tracking-wider mt-1 ml-1">{apptSearchError}</p>}
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 w-full md:w-auto">
                <div className="space-y-2">
                  <label className="text-sm font-semibold text-gray-600 block ml-1 mb-1">Date</label>
                  <div className="relative">
                    <Calendar className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" size={16} />
                    <input 
                      type="date" 
                      value={filterApptDate}
                      onChange={(e) => setFilterApptDate(e.target.value)}
                      className="w-full pl-10 pr-4 h-12 border border-gray-100 rounded-2xl focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 outline-none bg-gray-50/50 transition-all font-medium text-sm"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-semibold text-gray-600 block ml-1 mb-1">Status</label>
                  <div className="relative">
                    <Filter className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" size={16} />
                    <select 
                      value={filterApptStatus} 
                      onChange={(e) => setFilterApptStatus(e.target.value)}
                      className="w-full pl-10 pr-8 h-12 border border-gray-100 rounded-2xl focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 outline-none bg-gray-50/50 transition-all font-medium text-sm appearance-none text-gray-700"
                    >
                      <option value="">All Statuses</option>
                      <option value="Pending">Pending</option>
                      <option value="Confirmed">Confirmed</option>
                      <option value="Completed">Completed</option>
                      <option value="Cancelled">Cancelled</option>
                    </select>
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-semibold text-gray-600 block ml-1 mb-1">Timing</label>
                  <div className="relative">
                    <Clock className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" size={16} />
                    <select 
                      value={filterApptTiming} 
                      onChange={(e) => setFilterApptTiming(e.target.value)}
                      className="w-full pl-10 pr-8 h-12 border border-gray-100 rounded-2xl focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 outline-none bg-gray-50/50 transition-all font-medium text-sm appearance-none text-gray-700"
                    >
                      <option value="All">All Timing</option>
                      <option value="Upcoming">Upcoming</option>
                      <option value="Past">Past</option>
                    </select>
                  </div>
                </div>
              </div>
            </div>

            <div className="space-y-5">
              {filteredAppointments.length > 0 ? (
                filteredAppointments.map(b => {
                  if (!b) return null;
                  const note = getNoteByBookingId(b.id);
                  const safeID = (b.id || "").toString();
                  const studentDispName = b.studentName || b.name || getGuestName(safeID);
                  const initials = studentDispName.split(' ').map(nm => nm[0] || '').join('').substring(0, 2).toUpperCase() || '??';
                  const profileSrc = b.studentProfile || b.profileImage || getGuestPhoto(safeID || 'default');
                  return (
                    <div key={b.id || Math.random()} className={`rounded-[2rem] shadow-md border-2 transition-all duration-500 hover:shadow-2xl hover:-translate-y-1.5 group overflow-hidden relative ${
                      b.status === 'Cancelled' || b.status === 'Rejected' 
                        ? 'border-rose-200 bg-gradient-to-br from-rose-50/60 via-white to-white' 
                        : b.status === 'Completed'
                        ? 'border-emerald-200 bg-gradient-to-br from-emerald-50/60 via-white to-white'
                        : 'border-blue-200 bg-gradient-to-br from-blue-50/60 via-white to-white'
                    }`}>
                      <div className={`absolute left-0 top-0 bottom-0 w-2.5 transition-all duration-300 group-hover:w-3.5 ${
                        b.status === 'Cancelled' || b.status === 'Rejected' ? 'bg-rose-500' : b.status === 'Completed' ? 'bg-emerald-500' : 'bg-blue-600'
                      }`}></div>
                      
                      <div className="flex-1 p-10 pl-12">
                        <div className="flex flex-col sm:flex-row sm:items-center gap-8">
                          <div className="relative group/avatar shrink-0">
                            <div className={`w-14 h-14 rounded-2xl ${getAvatarColor(studentDispName)} flex items-center justify-center border-2 border-white shadow-md overflow-hidden transition-all duration-500 group-hover/avatar:rotate-3 group-hover/avatar:scale-110`}>
                              {profileSrc ? (
                                <img src={profileSrc} alt={studentDispName} className="w-full h-full object-cover" />
                              ) : (
                                <span className="text-white font-black text-lg">{initials}</span>
                              )}
                            </div>
                            <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-emerald-500 border-2 border-white rounded-full shadow-sm"></div>
                          </div>
                          <div>
                            <h3 className="font-black text-gray-900 text-2xl leading-tight group-hover:text-blue-600 transition-colors tracking-tight">{studentDispName}</h3>
                            <div className="flex items-center gap-2 mt-1.5">
                              <span className="text-[10px] font-black text-blue-600/60 uppercase tracking-widest bg-blue-50 px-2 py-0.5 rounded-md border border-blue-100/50">
                                {b.studentId || (safeID ? "STU-" + safeID.substring(0,5) : "N/A ID")}
                              </span>
                            </div>
                          </div>
                          
                          <div className={`sm:ml-auto flex items-center gap-2.5 px-5 py-2 rounded-2xl font-black text-[11px] uppercase tracking-[0.2em] border-2 shadow-sm transition-all duration-300 ${
                            b.status === 'Confirmed' || b.status === 'Accepted' ? 'bg-blue-100 text-blue-800 border-blue-200' : 
                            b.status === 'Completed' ? 'bg-emerald-100 text-emerald-800 border-emerald-200' : 
                            b.status === 'Cancelled' || b.status === 'Rejected' ? 'bg-rose-100 text-rose-800 border-rose-200' : 
                            'bg-amber-100 text-amber-800 border-amber-200'
                          }`}>
                            <span className={`w-2.5 h-2.5 rounded-full animate-pulse ${
                              b.status === 'Completed' ? 'bg-emerald-600' : 
                              b.status === 'Cancelled' || b.status === 'Rejected' ? 'bg-rose-600' : 
                              b.status === 'Confirmed' || b.status === 'Accepted' ? 'bg-blue-600' : 'bg-amber-600'
                            }`}></span>
                            {b.status === 'Accepted' ? 'Confirmed' : b.status === 'Rejected' ? 'Cancelled' : (b.status || "Pending")}
                          </div>
                        </div>
                        
                        <div className="grid grid-cols-2 xl:grid-cols-4 gap-6 mt-10">
                          <div className="group/item flex items-center gap-3.5 bg-white/50 p-2 pr-4 rounded-2xl border border-transparent hover:border-violet-100 hover:bg-violet-50/30 transition-all">
                            <div className="w-10 h-10 rounded-xl bg-violet-100/50 flex items-center justify-center text-violet-600 shadow-sm group-hover/item:scale-110 transition-transform"><Activity size={18}/></div>
                            <div className="flex flex-col">
                              <span className="text-[9px] font-black text-gray-400 uppercase tracking-widest">Type</span>
                              <span className="text-xs font-bold text-gray-800 capitalize leading-none mt-0.5">{b.sessionType || "1-on-1"}</span>
                            </div>
                          </div>
                          <div className="group/item flex items-center gap-3.5 bg-white/50 p-2 pr-4 rounded-2xl border border-transparent hover:border-blue-100 hover:bg-blue-50/30 transition-all">
                            <div className="w-10 h-10 rounded-xl bg-blue-100/50 flex items-center justify-center text-blue-600 shadow-sm group-hover/item:scale-110 transition-transform"><Calendar size={18}/></div>
                            <div className="flex flex-col">
                              <span className="text-[9px] font-black text-gray-400 uppercase tracking-widest">Date</span>
                              <span className="text-xs font-bold text-gray-800 leading-none mt-0.5">{b.date || "N/A"}</span>
                            </div>
                          </div>
                          <div className="group/item flex items-center gap-3.5 bg-white/50 p-2 pr-4 rounded-2xl border border-transparent hover:border-indigo-100 hover:bg-indigo-50/30 transition-all">
                            <div className="w-10 h-10 rounded-xl bg-indigo-100/50 flex items-center justify-center text-indigo-600 shadow-sm group-hover/item:scale-110 transition-transform"><Clock size={18}/></div>
                            <div className="flex flex-col">
                              <span className="text-[9px] font-black text-gray-400 uppercase tracking-widest">Time</span>
                              <span className="text-xs font-bold text-gray-800 leading-none mt-0.5">{b.time || "N/A"}</span>
                            </div>
                          </div>
                          <div className="group/item flex items-center gap-3.5 bg-white/50 p-2 pr-4 rounded-2xl border border-transparent hover:border-slate-100 hover:bg-slate-50/30 transition-all">
                            <div className="w-10 h-10 rounded-xl bg-slate-100/50 flex items-center justify-center text-slate-600 shadow-sm group-hover/item:scale-110 transition-transform"><FileText size={18}/></div>
                            <div className="flex flex-col">
                              <span className="text-[9px] font-black text-gray-400 uppercase tracking-widest">ID</span>
                              <span className="text-xs font-bold text-gray-800 uppercase leading-none mt-0.5">{safeID ? safeID.substring(0,8) : "N/A"}</span>
                            </div>
                          </div>
                        </div>
                        {b.rejectReason && <p className="text-sm text-rose-700 mt-6 font-bold bg-rose-100/50 border border-rose-200/50 inline-block px-5 py-2.5 rounded-2xl shadow-sm">Reason: {b.rejectReason}</p>}
                      </div>

                      <div className="flex flex-wrap items-center gap-4 w-full lg:w-auto p-10 lg:pl-0 lg:pr-12 lg:ml-auto">
                        <button 
                          onClick={() => navigate(`/counsellor/appointment/${b.id}`)} 
                          className="flex-1 lg:flex-none h-14 px-10 rounded-3xl font-black text-sm transition-all shadow-md flex items-center justify-center gap-3 border-[3px] border-gray-100 bg-white text-gray-700 hover:bg-gray-50 hover:border-blue-400 hover:text-blue-700 hover:shadow-xl active:scale-95"
                        >
                          Details
                        </button>
                      
                        {b.status === "Pending" && (
                          <>
                            <button 
                              onClick={() => confirmBookingByCounsellor(b.id)} 
                              className="flex-1 lg:flex-none h-14 px-10 rounded-3xl font-black text-sm transition-all shadow-lg flex items-center justify-center gap-3 bg-blue-600 text-white hover:bg-blue-700 hover:shadow-2xl hover:-translate-y-1 active:scale-95 shadow-blue-200"
                            >
                              <CheckCircle size={20} strokeWidth={3}/> Confirm
                            </button>
                            <button 
                              onClick={() => { const reason = window.prompt("Reason for cancellation:"); if(reason !== null) cancelBookingByCounsellor(b.id, reason); }} 
                              className="flex-1 lg:flex-none h-14 px-10 rounded-3xl font-black text-sm transition-all shadow-md flex items-center justify-center gap-3 border-[3px] border-rose-100 text-rose-600 bg-white hover:bg-rose-50 hover:border-rose-400 hover:shadow-xl active:scale-95"
                            >
                              <XCircle size={20} strokeWidth={3}/> Cancel
                            </button>
                          </>
                        )}

                        {(b.status === "Confirmed" || b.status === "Accepted") && (
                          <>
                            <button 
                              onClick={() => navigate(`/chat?id=${b.studentId || b.id}&name=${encodeURIComponent(b.studentName || b.name || 'Student')}`)} 
                              className="flex-1 lg:flex-none h-14 px-10 rounded-3xl font-black text-sm transition-all shadow-lg flex items-center justify-center gap-3 bg-indigo-600 text-white hover:bg-indigo-700 hover:shadow-2xl hover:-translate-y-1 active:scale-95 shadow-indigo-200"
                            >
                              <MessageCircle size={20} strokeWidth={3}/> {hasChatHistory(b.studentName || b.name) ? "Chat" : "Start Chat"}
                            </button>
                            <button 
                              onClick={() => completeBooking(b.id)} 
                              className="flex-1 lg:flex-none h-14 px-10 rounded-3xl font-black text-sm transition-all shadow-lg flex items-center justify-center gap-3 bg-emerald-600 text-white hover:bg-emerald-700 hover:shadow-2xl hover:-translate-y-1 active:scale-95 shadow-emerald-200"
                            >
                              <CheckCircle size={20} strokeWidth={3}/> Complete
                            </button>
                            <button 
                              onClick={() => { const reason = window.prompt("Reason for cancellation:"); if(reason !== null) cancelBookingByCounsellor(b.id, reason); }} 
                              className="flex-1 lg:flex-none h-14 px-10 rounded-3xl font-black text-sm transition-all shadow-md flex items-center justify-center gap-3 border-[3px] border-rose-100 text-rose-600 bg-white hover:bg-rose-50 hover:border-rose-400 hover:shadow-xl active:scale-95"
                            >
                              Cancel
                            </button>
                          </>
                        )}

                        {b.status === "Completed" && (
                          <>
                            <button 
                              onClick={() => navigate(`/chat?id=${b.studentId || b.id}&name=${encodeURIComponent(b.studentName || b.name || 'Student')}`)} 
                              className="flex-1 lg:flex-none h-14 px-10 rounded-3xl font-black text-sm transition-all shadow-lg flex items-center justify-center gap-3 bg-indigo-600 text-white hover:bg-indigo-700 hover:shadow-2xl hover:-translate-y-1 active:scale-95 shadow-indigo-200"
                            >
                              <MessageCircle size={20} strokeWidth={3}/> Chat
                            </button>
                            <button 
                              onClick={() => openNotesModal("booking", b)} 
                              className={`flex-1 lg:flex-none h-14 px-10 rounded-3xl font-black text-sm transition-all shadow-md flex items-center justify-center gap-3 border-[3px] active:scale-95 ${
                                note 
                                  ? 'border-sky-200 bg-white text-sky-800 hover:bg-sky-50 hover:border-sky-400 hover:shadow-xl' 
                                  : 'border-sky-500 bg-white text-sky-600 hover:bg-sky-600 hover:text-white hover:shadow-xl shadow-sky-100'
                              }`}
                            >
                              <FileText size={20} strokeWidth={3} /> {note ? "Note" : "Add Note"}
                            </button>
                          </>
                        )}
                      </div>
                    </div>
                  );
                })
              ) : (
                <div className="text-center py-20 bg-white rounded-3xl border border-dashed border-gray-200">
                  <Calendar className="mx-auto h-16 w-16 text-gray-100 mb-6" />
                  <h3 className="text-lg font-black text-gray-900 tracking-tight">No appointments found</h3>
                  <p className="text-gray-400 text-sm font-medium mt-1">Try adjusting your filters or search term.</p>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Session Notes Tab */}
        {activeTab === "session notes" && (
          <div className="space-y-8">
            <div className="flex justify-between items-center">
              <h2 className="text-sm font-black text-gray-400 uppercase tracking-[0.2em] flex items-center gap-2">
                <FileText size={18} className="text-blue-600" /> Manage Professional Notes
              </h2>
              <button onClick={() => openNotesModal("new")} className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-2xl font-black text-xs uppercase tracking-widest shadow-lg shadow-blue-200 transition-all flex items-center gap-2 active:scale-95">
                <Plus size={18} /> Create New Note
              </button>
            </div>

            <div className="bg-white p-6 rounded-3xl shadow-sm border border-gray-100 flex flex-col md:flex-row gap-4 items-end">
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
                  <div key={n.id} className="bg-gradient-to-br from-blue-50/50 via-white to-white rounded-3xl shadow-sm border border-blue-100/50 flex flex-col md:flex-row justify-between items-start md:items-center gap-6 hover:shadow-xl hover:shadow-blue-200/20 hover:border-blue-300 group overflow-hidden relative p-6 pl-8 transition-all duration-300">
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
                    className={`w-full border rounded-xl p-3 focus:ring-2 focus:ring-teal-600 outline-none transition bg-white disabled:bg-gray-50 disabled:text-gray-400 ${errors.selectedBookingId ? 'border-red-500 bg-red-50' : 'border-gray-300'}`}
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

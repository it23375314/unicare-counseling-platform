import { createContext, useContext, useState, useEffect } from "react";
import { useToast } from "./ToastContext";

const SessionNoteContext = createContext();

export const useSessionNotes = () => useContext(SessionNoteContext);

export const SessionNoteProvider = ({ children }) => {
  const { addToast } = useToast();
  
  const [notes, setNotes] = useState(() => {
    try {
      const saved = localStorage.getItem("unicare_session_notes_v2");
      if (saved) return JSON.parse(saved);
      
      // Default Mock Data for demo
      return [
        {
          id: "1",
          appointmentId: "appt-101",
          studentId: "STD-1774",
          studentName: "John Smith",
          studentProfile: "/john_smith.png", 
          counsellorId: "1",
          counsellorName: "Dr. Sarah Jenkins",
          title: "Anxiety Management Follow-up",
          notes: "Student is showing progress with breathing exercises. Reported lower panic frequency.",
          riskLevel: "Low",
          status: "Completed",
          sessionDate: "2026-03-29",
          recommendation: "Continue current exercises."
        },
        {
          id: "2",
          appointmentId: "appt-102",
          studentId: "STD-2491",
          studentName: "Emma Johnson",
          studentProfile: "/emma_johnson.png",
          counsellorId: "1",
          counsellorName: "Dr. Sarah Jenkins",
          title: "Exam Stress & Time Management",
          notes: "Emma is feeling overwhelmed by upcoming finals. Discussed prioritization techniques.",
          riskLevel: "Medium",
          status: "Completed",
          sessionDate: "2026-03-30",
          recommendation: "Follow up next week."
        },
        {
          id: "3",
          appointmentId: "appt-103",
          studentId: "STD-8823",
          studentName: "Michael Brown",
          studentProfile: "/michael_brown.png",
          counsellorId: "1",
          counsellorName: "Dr. Sarah Jenkins",
          title: "Social Anxiety Discussion",
          notes: "Student expressed difficulty in group settings. Began social exposure planning.",
          riskLevel: "Low",
          status: "Draft",
          sessionDate: "2026-03-28",
          recommendation: "Try one small group interaction."
        }
      ];
    } catch (e) {
      console.error("Session note data corrupted:", e);
      return [];
    }
  });

  useEffect(() => {
    localStorage.setItem("unicare_session_notes_v2", JSON.stringify(notes));
  }, [notes]);

  const addNote = (noteData) => {
    const newNote = {
      ...noteData,
      id: Date.now().toString(),
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
    setNotes((prev) => [...prev, newNote]);
    addToast("Session note saved successfully.", "success");
    return newNote.id;
  };

  const updateNote = (id, updatedFields) => {
    setNotes((prev) =>
      prev.map((note) =>
        note.id === id ? { ...note, ...updatedFields, updatedAt: new Date().toISOString() } : note
      )
    );
    addToast("Session note updated successfully.", "success");
  };

  const deleteNote = (id) => {
    if (window.confirm("Are you sure you want to delete this session note? This action cannot be undone.")) {
      setNotes((prev) => prev.filter((note) => note.id !== id));
      addToast("Session note deleted.", "info");
    }
  };

  const getNotesByCounsellor = (counsellorName) => {
    return notes.filter((n) => n.counsellorName === counsellorName);
  };

  const getNoteByBookingId = (bookingId) => {
    return notes.find((n) => n.appointmentId === bookingId);
  };

  return (
    <SessionNoteContext.Provider
      value={{
        notes,
        addNote,
        updateNote,
        deleteNote,
        getNotesByCounsellor,
        getNoteByBookingId
      }}
    >
      {children}
    </SessionNoteContext.Provider>
  );
};

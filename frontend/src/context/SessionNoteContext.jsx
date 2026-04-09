import { createContext, useContext, useState, useEffect } from "react";
import { useToast } from "./ToastContext";

const SessionNoteContext = createContext();
const API_URL = "http://localhost:5001/api";

export const useSessionNotes = () => useContext(SessionNoteContext);

export const SessionNoteProvider = ({ children }) => {
  const { addToast } = useToast();
  
  const [notes, setNotes] = useState([]);
  const [loading, setLoading] = useState(false);

  const fetchNotes = async () => {
    setLoading(true);
    try {
      const res = await fetch(`${API_URL}/session-notes`);
      const json = await res.json();
      if (json.success) {
        setNotes((json.data || []).map(n => ({ ...n, id: n._id })));
      }
    } catch (e) {
      console.error("Failed to fetch notes:", e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchNotes();
  }, []);

  const addNote = async (noteData) => {
    try {
        const res = await fetch(`${API_URL}/session-notes`, {
            method: "POST", headers: { "Content-Type": "application/json" },
            body: JSON.stringify(noteData)
        });
        const json = await res.json();
        
        if (json.success) {
            setNotes(prev => [...prev, {...json.data, id: json.data._id}]);
            addToast("Session note saved successfully.", "success");
            return json.data._id;
        }
    } catch(e) {
        // Fallback for UI testing
        const fallback = { ...noteData, id: Date.now().toString() };
        setNotes((prev) => [...prev, fallback]);
        addToast("Offline: Session note saved.", "success");
        return fallback.id;
    }
  };

  const updateNote = async (id, updatedFields) => {
    try {
        const res = await fetch(`${API_URL}/session-notes/${id}`, {
            method: "PUT", headers: { "Content-Type": "application/json" },
            body: JSON.stringify(updatedFields)
        });
        const json = await res.json();
        
        if(json.success) {
            setNotes((prev) => prev.map((note) => note.id === id || note._id === id ? { ...note, ...json.data, id: json.data._id } : note));
            addToast("Session note updated successfully.", "success");
        }
    } catch(e) {
        setNotes((prev) => prev.map((note) => note.id === id || note._id === id ? { ...note, ...updatedFields } : note));
        addToast("Offline: Session note updated.", "success");
    }
  };

  const deleteNote = async (id) => {
    if (window.confirm("Are you sure you want to delete this session note? This action cannot be undone.")) {
      try {
          await fetch(`${API_URL}/session-notes/${id}`, { method: "DELETE" });
          setNotes((prev) => prev.filter((note) => note.id !== id && note._id !== id));
          addToast("Session note deleted.", "info");
      } catch(e) {
          setNotes((prev) => prev.filter((note) => note.id !== id && note._id !== id));
          addToast("Offline: Session note deleted.", "info");
      }
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
        loading,
        fetchNotes,
        addNote,
        updateNote,
        deleteNote,
        getNotesByCounsellor,
        getNoteByBookingId,
        setNotes
      }}
    >
      {children}
    </SessionNoteContext.Provider>
  );
};

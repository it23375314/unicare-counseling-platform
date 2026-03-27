import { createContext, useContext, useState, useEffect } from "react";
import { useToast } from "./ToastContext";

const SessionNoteContext = createContext();

export const useSessionNotes = () => useContext(SessionNoteContext);

export const SessionNoteProvider = ({ children }) => {
  const { addToast } = useToast();
  
  const [notes, setNotes] = useState(() => {
    try {
      const saved = localStorage.getItem("unicare_session_notes");
      return saved ? JSON.parse(saved) : [];
    } catch (e) {
      console.error("Session note data corrupted:", e);
      return [];
    }
  });

  useEffect(() => {
    localStorage.setItem("unicare_session_notes", JSON.stringify(notes));
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

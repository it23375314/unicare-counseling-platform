import { createContext, useContext, useState, useEffect } from "react";
import { useToast } from "./ToastContext";

const CounsellorContext = createContext();

export const useCounsellorContext = () => useContext(CounsellorContext);

// Initial mock data if empty
const initialCounsellors = [
  {
    id: "1",
    name: "Dr. Sarah Jenkins",
    email: "sarah.jenkins@unicare.edu",
    specialization: "Anxiety & Academic Stress",
    experience: "10 years",
    availability: [], // Array of { date: 'YYYY-MM-DD', slots: ['09:00 AM', '11:00 AM'] }
  },
  {
    id: "2",
    name: "Dr. Ahmed Rahman",
    email: "ahmed.rahman@unicare.edu",
    specialization: "Depression & Career Counseling",
    experience: "8 years",
    availability: [],
  }
];

export const CounsellorProvider = ({ children }) => {
  const { addToast } = useToast();
  
  const [counsellors, setCounsellors] = useState(() => {
    try {
      const saved = localStorage.getItem("unicare_counsellors");
      return saved ? JSON.parse(saved) : initialCounsellors;
    } catch (e) {
      console.error("Counsellor data corrupted:", e);
      return initialCounsellors;
    }
  });

  useEffect(() => {
    localStorage.setItem("unicare_counsellors", JSON.stringify(counsellors));
  }, [counsellors]);

  // CRUD Operations
  const addCounsellor = (counsellorData) => {
    const isDuplicate = counsellors.some(
      (c) => c.email.toLowerCase() === counsellorData.email.toLowerCase()
    );
    if (isDuplicate) {
      throw new Error("A counsellor with this email already exists.");
    }

    const newCounsellor = {
      ...counsellorData,
      id: Date.now().toString(),
      availability: [] // Initialize empty
    };
    
    setCounsellors((prev) => [...prev, newCounsellor]);
    addToast("Counsellor added successfully!", "success");
    return newCounsellor.id;
  };

  const editCounsellor = (id, updatedData) => {
    // Check if email clash with another counsellor
    const isDuplicate = counsellors.some(
      (c) => c.id !== id && c.email.toLowerCase() === updatedData.email.toLowerCase()
    );
    if (isDuplicate) {
      throw new Error("Another counsellor with this email already exists.");
    }

    setCounsellors((prev) =>
      prev.map((c) => (c.id === id ? { ...c, ...updatedData } : c))
    );
    addToast("Counsellor updated successfully!", "success");
  };

  const deleteCounsellor = (id) => {
    setCounsellors((prev) => prev.filter((c) => c.id !== id));
    addToast("Counsellor deleted successfully.", "info");
  };

  // Availability Management
  const updateAvailability = (counsellorId, date, timeSlots) => {
    // timeSlots is array of strings e.g. ["09:00 AM", "11:00 AM"]
    setCounsellors((prev) =>
      prev.map((c) => {
        if (c.id !== counsellorId) return c;
        
        let newAvail = [...(c.availability || [])];
        const dateIndex = newAvail.findIndex(a => a.date === date);
        
        if (dateIndex >= 0) {
          // Replace or delete if empty
          if (timeSlots.length === 0) {
            newAvail.splice(dateIndex, 1);
          } else {
            newAvail[dateIndex].slots = timeSlots;
          }
        } else if (timeSlots.length > 0) {
          // Add new date
          newAvail.push({ date, slots: timeSlots });
        }
        
        return { ...c, availability: newAvail };
      })
    );
    addToast("Availability updated!", "success");
  };
  
  const getCounsellorById = (id) => {
    return counsellors.find(c => c.id === id);
  };

  return (
    <CounsellorContext.Provider
      value={{
        counsellors,
        addCounsellor,
        editCounsellor,
        deleteCounsellor,
        updateAvailability,
        getCounsellorById
      }}
    >
      {children}
    </CounsellorContext.Provider>
  );
};

import { createContext, useContext, useState, useEffect } from "react";
import { useToast } from "./ToastContext";

const CounsellorContext = createContext();

export const useCounsellorContext = () => useContext(CounsellorContext);

// Initial mock data if empty
const initialCounsellors = [
  {
    id: "1",
    name: "Dr. Silva",
    email: "silva@unicare.edu",
    specialization: "Anxiety Specialist",
    experience: "12 years",
    image: "https://images.unsplash.com/photo-1559839734-2b71f1536750?q=80&w=600&auto=format&fit=crop",
    price: 3500,
    availability: [
      { date: new Date().toISOString().split('T')[0], slots: ["09:00", "11:00", "13:00", "15:00"] }
    ],
  },
  {
    id: "2",
    name: "Dr. Perera",
    email: "perera@unicare.edu",
    specialization: "Academic Stress Expert",
    experience: "8 years",
    image: "https://images.unsplash.com/photo-1594824476967-48c8b964273f?q=80&w=600&auto=format&fit=crop",
    price: 3000,
    availability: [
      { date: new Date().toISOString().split('T')[0], slots: ["09:00", "11:00", "13:00", "15:00"] }
    ],
  }
];

export const CounsellorProvider = ({ children }) => {
  const { addToast } = useToast();
  
  const [counsellors, setCounsellors] = useState(() => {
    try {
      const saved = localStorage.getItem("unicare_counsellors_v2");
      return saved ? JSON.parse(saved) : initialCounsellors;
    } catch (e) {
      console.error("Counsellor data corrupted:", e);
      return initialCounsellors;
    }
  });

  useEffect(() => {
    localStorage.setItem("unicare_counsellors_v2", JSON.stringify(counsellors));
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

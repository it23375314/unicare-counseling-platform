import { createContext, useContext, useState, useEffect } from "react";
import { useToast } from "./ToastContext";

const CounsellorContext = createContext();
const API_URL = "http://localhost:5001/api";

export const useCounsellorContext = () => useContext(CounsellorContext);


export const CounsellorProvider = ({ children }) => {
  const { addToast } = useToast();
  
  const [counsellors, setCounsellors] = useState([]);

  useEffect(() => {
    fetchCounsellors();
  }, []);

  const fetchCounsellors = async () => {
    try {
        const res = await fetch(`${API_URL}/counsellors`);
        if (res.ok) {
            const json = await res.json();
            if(json.success) setCounsellors(json.data.map(c => ({...c, id: c._id || c.id})));
        }
    } catch(e) {
        console.error("Failed to fetch counsellors", e);
    }
  };

  const addCounsellor = async (counsellorData) => {
    try {
        const res = await fetch(`${API_URL}/counsellors`, {
            method: "POST", headers: { "Content-Type": "application/json" },
            body: JSON.stringify({...counsellorData, availability: []})
        });
        const json = await res.json();
        
        if (!json.success) {
            throw new Error(json.message || "Failed to add counsellor");
        }
        
        setCounsellors(prev => [...prev, {...json.data, id: json.data._id}]);
        addToast("Counsellor added successfully!", "success");
        return json.data._id;
    } catch(e) {
        addToast(e.message || "Error adding counsellor", "error");
        throw e;
    }
  };

  const editCounsellor = async (id, updatedData) => {
    try {
        const res = await fetch(`${API_URL}/counsellors/${id}`, {
            method: "PUT", headers: { "Content-Type": "application/json" },
            body: JSON.stringify(updatedData)
        });
        const json = await res.json();
        
        if (!json.success) {
            throw new Error(json.message || "Failed to modify counsellor");
        }
        
        setCounsellors((prev) =>
          prev.map((c) => (c.id === id ? { ...c, ...json.data, id: json.data._id } : c))
        );
        addToast("Counsellor updated successfully!", "success");
    } catch(e) {
        addToast(e.message || "Error updating counsellor", "error");
        throw e;
    }
  };

  const deleteCounsellor = async (id) => {
    try {
        const res = await fetch(`${API_URL}/counsellors/${id}`, { method: "DELETE" });
        const json = await res.json();
        
        if(json.success) {
            setCounsellors((prev) => prev.filter((c) => c.id !== id));
            addToast("Counsellor deleted successfully.", "info");
        }
    } catch(e) {
        addToast("Error deleting counsellor", "error");
    }
  };

  const updateAvailability = async (counsellorId, date, timeSlots) => {
    try {
        const counsellor = counsellors.find(c => c.id === counsellorId);
        if(!counsellor) return;

        let newAvail = [...(counsellor.availability || [])];
        const dateIndex = newAvail.findIndex(a => a.date === date);
        
        if (dateIndex >= 0) {
          if (timeSlots.length === 0) {
            newAvail.splice(dateIndex, 1);
          } else {
            newAvail[dateIndex].slots = timeSlots;
          }
        } else if (timeSlots.length > 0) {
          newAvail.push({ date, slots: timeSlots });
        }
        
        const res = await fetch(`${API_URL}/counsellors/${counsellorId}`, {
            method: "PUT", headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ availability: newAvail })
        });
        
        const json = await res.json();
        if(json.success) {
            setCounsellors((prev) => prev.map((c) => c.id === counsellorId ? { ...c, availability: newAvail } : c));
            addToast("Availability updated!", "success");
        }
    } catch(e) {
        addToast("Error updating availability", "error");
    }
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

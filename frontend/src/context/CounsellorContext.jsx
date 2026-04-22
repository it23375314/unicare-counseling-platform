import { createContext, useContext, useState, useEffect, useCallback, useMemo } from "react";
import { useToast } from "./ToastContext";

const CounsellorContext = createContext();
const API_URL = "http://localhost:5005/api";

export const useCounsellorContext = () => useContext(CounsellorContext);

export const CounsellorProvider = ({ children }) => {
  const { addToast } = useToast();
  const [counsellors, setCounsellors] = useState([]);

  const fetchCounsellors = useCallback(async () => {
    try {
        const res = await fetch(`${API_URL}/counsellors`);
        if (res.ok) {
            const json = await res.json();
            if(json.success) {
               const mapped = json.data.map(c => ({...c, id: c._id || c.id}));
               setCounsellors(mapped);
               return mapped;
            }
        }
        return null;
    } catch(e) {
        console.error("Failed to fetch counsellors", e);
        return null;
    }
  }, []);

  useEffect(() => {
    fetchCounsellors();
  }, [fetchCounsellors]);

  const addCounsellor = useCallback(async (counsellorData) => {
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
  }, [addToast]);

  const editCounsellor = useCallback(async (id, updatedData) => {
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
  }, [addToast]);

  const deleteCounsellor = useCallback(async (id) => {
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
  }, [addToast]);

  const updateAvailability = useCallback(async (counsellorId, date, timeSlots) => {
    try {
        if (!counsellorId) throw new Error("Counsellor ID is missing");
        const res = await fetch(`${API_URL}/counsellors/${counsellorId}/availability`, {
            method: "PATCH", headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ date, slots: timeSlots })
        });
        
        const json = await res.json();
        if(json.success) {
            setCounsellors((prev) => prev.map((c) => c.id === counsellorId ? { ...c, availability: json.data.availability } : c));
            addToast("Availability updated!", "success");
            return json;
        } else {
            throw new Error(json.message || "Failed to update API");
        }
    } catch(e) {
        addToast(e.message || "Error updating availability", "error");
        throw e;
    }
  }, [addToast]);
  
  const getCounsellorById = useCallback((id) => {
    return counsellors.find(c => c.id === id);
  }, [counsellors]);

  const getCounsellorByEmail = useCallback((email) => {
    if (!email) return null;
    return counsellors.find(c => c.email?.toLowerCase() === email.toLowerCase());
  }, [counsellors]);

  const value = useMemo(() => ({
    counsellors,
    addCounsellor,
    editCounsellor,
    deleteCounsellor,
    updateAvailability,
    getCounsellorById,
    getCounsellorByEmail,
    fetchCounsellors
  }), [
    counsellors, addCounsellor, editCounsellor, deleteCounsellor, 
    updateAvailability, getCounsellorById, getCounsellorByEmail, 
    fetchCounsellors
  ]);

  return (
    <CounsellorContext.Provider value={value}>
      {children}
    </CounsellorContext.Provider>
  );
};

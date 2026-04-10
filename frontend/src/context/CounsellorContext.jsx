import { createContext, useContext, useState, useEffect } from "react";
import { useToast } from "./ToastContext";

const CounsellorContext = createContext();
const API_URL = "/api";

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
        const res = await fetch(`${API_URL}/counsellors/${counsellorId}/availability`, {
            method: "PATCH", headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ date, slots: timeSlots })
        });
        
        const json = await res.json();
        if(json.success) {
            setCounsellors((prev) => prev.map((c) => c.id === counsellorId ? { ...c, availability: json.data.availability } : c));
            addToast("Availability updated!", "success");
        }
    } catch(e) {
        addToast("Error updating availability", "error");
    }
  };
  
  const getCounsellorById = (id) => {
    return counsellors.find(c => c.id === id);
  };

  const getCounsellorByEmail = (email) => {
    if (!email) return null;
    return counsellors.find(c => c.email?.toLowerCase() === email.toLowerCase());
  };

  const getMyProfile = async (email) => {
    try {
      const res = await fetch(`${API_URL}/counsellors/profile/me?email=${email}`);
      const json = await res.json();
      if (json.success) return json.data;
      throw new Error(json.message);
    } catch (e) {
      console.error("Error fetching profile", e);
      return null;
    }
  };

  const updateMyProfile = async (currentEmail, data) => {
    try {
      const res = await fetch(`${API_URL}/counsellors/profile/me`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ currentEmail, ...data })
      });
      const json = await res.json();
      if (!json.success) throw new Error(json.message);
      
      // Update local context state
      setCounsellors(prev => prev.map(c => c.email === currentEmail ? { ...c, ...json.data, id: json.data._id } : c));
      addToast("Profile updated successfully!", "success");
      return json.data;
    } catch (e) {
      addToast(e.message || "Error updating profile", "error");
      throw e;
    }
  };

  const uploadProfileImage = async (email, file) => {
    const formData = new FormData();
    formData.append("email", email);
    formData.append("image", file);

    try {
      const res = await fetch(`${API_URL}/counsellors/profile/upload`, {
        method: "POST",
        body: formData
      });
      const json = await res.json();
      if (!json.success) throw new Error(json.message);

      setCounsellors(prev => prev.map(c => c.email === email ? { ...c, profileImage: json.imagePath } : c));
      addToast("Profile picture updated!", "success");
      return json.imagePath;
    } catch (e) {
      addToast(e.message || "Error uploading image", "error");
      throw e;
    }
  };

  return (
    <CounsellorContext.Provider
      value={{
        counsellors,
        addCounsellor,
        editCounsellor,
        deleteCounsellor,
        updateAvailability,
        getCounsellorById,
        getCounsellorByEmail,
        getMyProfile,
        updateMyProfile,
        uploadProfileImage,
        fetchCounsellors
      }}
    >
      {children}
    </CounsellorContext.Provider>
  );
};

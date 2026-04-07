import { createContext, useContext, useState, useEffect } from "react";
import { useToast } from "./ToastContext";

const AuthContext = createContext();
const API_URL = "http://localhost:5000/api";

export const useAuth = () => useContext(AuthContext);

export const AuthProvider = ({ children }) => {
  const { addToast } = useToast();
  
  const [user, setUser] = useState({ role: "student", id: "student-1", name: "Current Student" });

  useEffect(() => {
    const fetchUser = async () => {
        try {
            const savedId = localStorage.getItem("unicare_user_id");
            if (savedId) {
                const res = await fetch(`${API_URL}/auth/me?id=${savedId}`);
                if (res.ok) {
                    const json = await res.json();
                    if(json.success && json.data) {
                        setUser({ 
                            role: json.data.role, 
                            id: json.data._id, 
                            name: json.data.name 
                        });
                        return;
                    }
                }
            }
            
            // Fallback default
            setUser({ role: "counsellor", id: "1", name: "Dr. Sarah Jenkins" });
        } catch(e) {
            console.error("Auth API failed:", e);
        }
    };
    fetchUser();
  }, []);

  const login = async (role, id, name) => {
    try {
        const res = await fetch(`${API_URL}/auth/login`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ role, name })
        });
        
        if (res.ok) {
            const json = await res.json();
            if(json.success && json.data) {
                const u = json.data;
                setUser({ role: u.role, id: u._id, name: u.name });
                localStorage.setItem("unicare_user_id", u._id);
            } else {
                setUser({ role, id, name });
            }
        } else {
             setUser({ role, id, name });
        }
        addToast(`Logged in as ${name || role}`, "success");
    } catch(e) {
        setUser({ role, id, name });
        addToast(`Logged in (Offline Mode)`, "success");
    }
  };

  const logout = () => {
    localStorage.removeItem("unicare_user_id");
    setUser({ role: "student", id: "student-1", name: "Current Student" });
    addToast("Logged out successfully.", "info");
  };

  return (
    <AuthContext.Provider value={{ user, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

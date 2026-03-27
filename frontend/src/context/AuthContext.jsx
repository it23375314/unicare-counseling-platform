import { createContext, useContext, useState, useEffect } from "react";
import { useToast } from "./ToastContext";

const AuthContext = createContext();

export const useAuth = () => useContext(AuthContext);

export const AuthProvider = ({ children }) => {
  const { addToast } = useToast();
  
  // Default to student if nothing in localStorage
  const [user, setUser] = useState(() => {
    try {
      const saved = localStorage.getItem("unicare_auth_user");
      return saved ? JSON.parse(saved) : { role: "student", id: "student-1", name: "Current Student" };
    } catch (e) {
      console.error("Auth data corrupted:", e);
      return { role: "student", id: "student-1", name: "Current Student" };
    }
  });

  useEffect(() => {
    localStorage.setItem("unicare_auth_user", JSON.stringify(user));
  }, [user]);

  const login = (role, id, name) => {
    setUser({ role, id, name });
    addToast(`Logged in as ${name} (${role})`, "success");
  };

  const logout = () => {
    // Reset to generic student for demo purposes
    setUser({ role: "student", id: "student-1", name: "Current Student" });
    addToast("Logged out successfully.", "info");
  };

  return (
    <AuthContext.Provider value={{ user, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

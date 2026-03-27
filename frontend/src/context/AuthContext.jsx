import { createContext, useContext, useState, useEffect } from "react";
import { useToast } from "./ToastContext";

const AuthContext = createContext();

export const useAuth = () => useContext(AuthContext);

export const AuthProvider = ({ children }) => {
  const { addToast } = useToast();
  
  // Default to null if nothing in localStorage
  const [user, setUser] = useState(() => {
    const saved = localStorage.getItem("unicare_auth_user");
    return saved ? JSON.parse(saved) : null;
  });

  useEffect(() => {
    if (user) {
      localStorage.setItem("unicare_auth_user", JSON.stringify(user));
    } else {
      localStorage.removeItem("unicare_auth_user");
    }
  }, [user]);

  const login = (role, id, name) => {
    const newUser = { role, id, name };
    setUser(newUser);
    addToast(`Welcome back, ${name}!`, "success");
  };

  const logout = () => {
    setUser(null);
    addToast("You have been signed out.", "info");
  };

  return (
    <AuthContext.Provider value={{ user, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

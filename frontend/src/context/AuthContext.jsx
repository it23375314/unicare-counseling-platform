import { createContext, useContext, useEffect, useMemo, useState } from 'react';
import axios from 'axios';

<<<<<<< HEAD
const AuthContext = createContext();
const API_URL = "http://localhost:5001/api";
=======
const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5001';
const STORAGE_KEY = 'authUser';
>>>>>>> 8fb9068df7e128346a2da11006239f32da7d6dcc

const defaultUser = null; // null means not logged in

const AuthContext = createContext({
  user: null,
  login: () => {},
  logout: () => {},
  isAuthenticated: false,
});

export const AuthProvider = ({ children }) => {
<<<<<<< HEAD
  const { addToast } = useToast();
  
  const [user, setUser] = useState({ role: "student", id: "student-1", name: "Current Student", email: "student@unicare.edu" });

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
                            name: json.data.name,
                            email: json.data.email
                        });
                        return;
                    }
                }
            }
            
            // Fallback default
            setUser({ role: "student", id: "student-1", name: "Current Student", email: "student@unicare.edu" });
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
                setUser({ role: u.role, id: u._id, name: u.name, email: u.email });
                localStorage.setItem("unicare_user_id", u._id);
            } else {
                setUser({ role, id, name, email: "guest@unicare.edu" });
            }
        } else {
             setUser({ role, id, name, email: "guest@unicare.edu" });
        }
        addToast(`Logged in as ${name || role}`, "success");
    } catch(e) {
        setUser({ role, id, name, email: "guest@unicare.edu" });
        addToast(`Logged in (Offline Mode)`, "success");
=======
  const [user, setUser] = useState(() => {
    try {
      const saved = window.localStorage.getItem(STORAGE_KEY);
      return saved ? JSON.parse(saved) : null;
    } catch {
      return null;
>>>>>>> 8fb9068df7e128346a2da11006239f32da7d6dcc
    }
  });

  // Persist user to localStorage whenever it changes
  useEffect(() => {
    if (user) {
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(user));
      // Legacy keys for backward compat with UniCare components
      window.localStorage.setItem('userRole', user.role);
      window.localStorage.setItem('userName', user.name);
      if (user.email) window.localStorage.setItem('userEmail', user.email);
      if (user.id) window.localStorage.setItem('userId', user.id);
      if (user.itNumber) window.localStorage.setItem('itNumber', user.itNumber);
      if (user.id) window.localStorage.setItem('unicare_user_id', user.id);
    } else {
      window.localStorage.removeItem(STORAGE_KEY);
      window.localStorage.removeItem('userRole');
      window.localStorage.removeItem('userName');
      window.localStorage.removeItem('userEmail');
      window.localStorage.removeItem('userId');
      window.localStorage.removeItem('itNumber');
      window.localStorage.removeItem('unicare_user_id');
    }
  }, [user]);

  /**
   * login â€” called after a successful POST /api/auth/login response
   * Accepts the full response data object from the server.
   */
  const login = (userData) => {
    const normalized = {
      id: userData._id || userData.userId || userData.id,
      name: userData.name,
      email: userData.email,
      role: userData.role,
      itNumber: userData.itNumber || '',
    };
    setUser(normalized);
  };

<<<<<<< HEAD
  const logout = () => {
    localStorage.removeItem("unicare_user_id");
    setUser({ role: "student", id: "student-1", name: "Current Student", email: "student@unicare.edu" });
    addToast("Logged out successfully.", "info");
=======
  /**
   * loginWithCredentials â€” convenience method that calls the API and logs in
   */
  const loginWithCredentials = async (email, password) => {
    const res = await axios.post(`${API_URL}/api/auth/login`, { email, password });
    const data = res.data;
    if (!data.success) throw new Error(data.msg || 'Login failed');
    login(data.data);
    return data.data;
>>>>>>> 8fb9068df7e128346a2da11006239f32da7d6dcc
  };

  /**
   * logout â€” clears user state and all localStorage keys
   */
  const logout = () => {
    setUser(null);
  };

  const value = useMemo(() => ({
    user,
    login,
    loginWithCredentials,
    logout,
    isAuthenticated: !!user,
  }), [user]);

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);

export default AuthContext;

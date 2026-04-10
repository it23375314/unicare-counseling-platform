import { createContext, useContext, useEffect, useMemo, useState } from 'react';
import axios from 'axios';
import { useToast } from "./ToastContext";

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5001';
const STORAGE_KEY = 'authUser';

const AuthContext = createContext({
  user: null,
  login: () => {},
  loginWithCredentials: () => {},
  logout: () => {},
  isAuthenticated: false,
});

export const AuthProvider = ({ children }) => {
  const { addToast } = useToast();
  const [user, setUser] = useState(() => {
    try {
      const saved = window.localStorage.getItem(STORAGE_KEY);
      return saved ? JSON.parse(saved) : null;
    } catch {
      return null;
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
   * login — called after a successful POST /api/auth/login response
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
    addToast(`Welcome back, ${userData.name}!`, "success");
  };

  /**
   * loginWithCredentials — convenience method that calls the API and logs in
   */
  const loginWithCredentials = async (email, password) => {
    try {
      const res = await axios.post(`${API_URL}/api/auth/login`, { email, password });
      const data = res.data;
      if (!data.success) throw new Error(data.msg || 'Login failed');
      login(data.data);
      return data.data;
    } catch (err) {
      const errorMsg = err.response?.data?.msg || err.message || 'Login connection failed';
      addToast(errorMsg, "error");
      throw err;
    }
  };

  /**
   * logout — clears user state and all localStorage keys
   */
  const logout = () => {
    setUser(null);
    addToast("Signed out successfully.", "info");
  };

  const value = useMemo(() => ({
    user,
    login,
    loginWithCredentials,
    logout,
    updateUser: (newData) => setUser(prev => ({ ...prev, ...newData })),
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

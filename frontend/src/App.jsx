// src/App.jsx
import React, { useEffect } from 'react'; // <-- Update import
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Login from './pages/Login';
import Register from './pages/Register'; 
import OTPVerification from './pages/OTPVerification'; 
import StudentDashboard from './pages/StudentDashboard'; 
import CounsellorDashboard from './pages/CounsellorDashboard'; 
import AdminDashboard from './pages/AdminDashboard';           
import ProtectedRoute from './components/ProtectedRoute'; 
import Settings from './pages/Settings';
import UserManagement from './pages/UserManagement';
import PlatformLogs from './pages/PlatformLogs';

function App() {

  useEffect(() => {
    // When the app first loads, check if they like dark mode
    if (localStorage.getItem('theme') === 'dark') {
      document.body.classList.add('dark-mode');
    }
  }, []);
  return (
    <Router>
      <Routes>
        {/* Public Routes - Anyone can see these */}
        <Route path="/" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/verify-otp" element={<OTPVerification />} />
        
        {/* Protected Routes - The Bouncer is guarding these! */}
        <Route path="/student-dashboard" element={
          <ProtectedRoute>
            <StudentDashboard />
          </ProtectedRoute>
        } /> 
        
        <Route path="/counsellor-dashboard" element={
          <ProtectedRoute>
            <CounsellorDashboard />
          </ProtectedRoute>
        } /> 
        
        <Route path="/admin-dashboard" element={
          <ProtectedRoute>
            <AdminDashboard />
          </ProtectedRoute>
        } />  

        <Route path="/settings" element={
          <ProtectedRoute>
           <Settings />
          </ProtectedRoute>
        } />  

        <Route path="/admin-users" element={<UserManagement />} />   

        <Route path="/admin-logs" element={<PlatformLogs />} />

      </Routes>
    </Router>
  );
}

export default App;
// src/App.jsx
import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Login from './pages/Login';
import Register from './pages/Register'; // We added this import!
import OTPVerification from './pages/OTPVerification'; // <-- We imported it here!
import StudentDashboard from './pages/StudentDashboard'; // <-- Import it!
import CounsellorDashboard from './pages/CounsellorDashboard'; // <-- Imported
import AdminDashboard from './pages/AdminDashboard';           // <-- Imported
import ProtectedRoute from './components/ProtectedRoute'; // <-- Import the Bouncer!


function App() {
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
      </Routes>
    </Router>
  );
}

export default App;
// src/App.jsx
import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Login from './pages/Login';
import Register from './pages/Register'; // We added this import!
import OTPVerification from './pages/OTPVerification'; // <-- We imported it here!
import StudentDashboard from './pages/StudentDashboard'; // <-- Import it!

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Login />} />
        <Route path="/register" element={<Register />} /> {/* We added this route! */}
        <Route path="/verify-otp" element={<OTPVerification />} /> {/* <-- We added the route here! */}
        <Route path="/dashboard" element={<StudentDashboard />} /> {/* <-- Add route! */}
      </Routes>
    </Router>
  );
}

export default App;
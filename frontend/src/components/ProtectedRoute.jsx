// src/components/ProtectedRoute.jsx
import React from 'react';
import { Navigate } from 'react-router-dom';

const ProtectedRoute = ({ children }) => {
  // Check if the digital wristband exists in the browser's storage
  const isLoggedIn = localStorage.getItem('isLoggedIn') === 'true';

  if (!isLoggedIn) {
    // If they aren't logged in, instantly send them back to the Login page
    return <Navigate to="/" replace />;
  }

  // If they are logged in, let them through to the dashboard!
  return children;
};

export default ProtectedRoute;
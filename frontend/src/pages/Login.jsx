// src/pages/Login.jsx
import React, { useState } from 'react';
import {Link, useNavigate } from 'react-router-dom';
import '../styles/Auth.css'; 

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const navigate = useNavigate();

  const handleLogin = (e) => {
    e.preventDefault();
    alert(`Testing Login for: ${email}`);
    // Later, this will navigate to the dashboard!
  };

  return (
    <div className="auth-container">
      <div className="auth-card">
        <h2 className="auth-title">Welcome to UniCare</h2>
        
        <form onSubmit={handleLogin}>
          <div className="input-group">
            <label htmlFor="email">University Email</label>
            <input 
              type="email" 
              id="email" 
              placeholder="student@uni.edu" 
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required 
            />
          </div>

          <div className="input-group">
            <label htmlFor="password">Password</label>
            <input 
              type="password" 
              id="password" 
              placeholder="••••••••" 
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required 
            />
          </div>

          <button type="submit" className="auth-button">Log In</button>
        </form>
        <div style={{ textAlign: 'center', marginTop: '20px' }}>
          <p style={{ color: '#555', fontSize: '14px' }}>
            Don't have an account? <Link to="/register" style={{ color: '#007bff', textDecoration: 'none', fontWeight: '500' }}>Register here</Link>
          </p>
        </div>
      </div>
      
    </div>
  );
};

export default Login;
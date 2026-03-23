// src/pages/Register.jsx
import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import '../styles/Auth.css'; 

const Register = () => {
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [role, setRole] = useState('student');
  const [password, setPassword] = useState('');
  const navigate = useNavigate();

  const handleRegister = (e) => {
    e.preventDefault();
    alert(`Testing Registration for ${fullName} as a ${role}`);
    // Now it sends them to the OTP page!
    navigate('/verify-otp'); 
  };

  return (
    <div className="auth-container">
      <div className="auth-card">
        <h2 className="auth-title">Create an Account</h2>
        
        <form onSubmit={handleRegister}>
          <div className="input-group">
            <label htmlFor="fullName">Full Name</label>
            <input 
              type="text" 
              id="fullName" 
              placeholder="John Doe" 
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              required 
            />
          </div>

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
            <label htmlFor="role">I am a...</label>
            <select 
              id="role" 
              value={role} 
              onChange={(e) => setRole(e.target.value)}
              style={{ padding: '12px', borderRadius: '6px', border: '1px solid #ccc', fontSize: '16px', marginBottom: '20px' }}
            >
              <option value="student">Student</option>
              <option value="counsellor">Counsellor</option>
            </select>
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

          <button type="submit" className="auth-button">Register</button>
        </form>

        <div style={{ textAlign: 'center', marginTop: '20px' }}>
          <p style={{ color: '#555', fontSize: '14px' }}>
            Already have an account? <Link to="/" style={{ color: '#007bff', textDecoration: 'none', fontWeight: '500' }}>Log in here</Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default Register;
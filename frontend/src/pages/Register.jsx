import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import '../styles/Auth.css'; 

const Register = () => {
  const navigate = useNavigate();

  // 1. Group all form fields into one clean state object
  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    role: 'student', // Default
    password: '',
    phone: '',
    age: '',
    religion: '',
    // Counsellor-specific fields
    specialization: '',
    experience: '',
    licenseNumber: ''
  });

  // 2. One smart function to handle ALL input changes
  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleRegister = (e) => {
    e.preventDefault();
    console.log("Registered Data:", formData);
    
    // Save their role TEMPORARILY so the OTP page knows where to send them later!
    localStorage.setItem('userRole', formData.role);
    
    // Send them to the OTP verification page
    navigate('/verify-otp'); 
  };

  return (
    <div className="auth-container">
      <div className="auth-card">
        <h2 className="auth-title">Create an Account</h2>
        
        <form onSubmit={handleRegister}>
          
          <div className="input-group">
            <label htmlFor="role">I am registering as a...</label>
            <select 
              name="role" 
              id="role" 
              value={formData.role} 
              onChange={handleChange}
              style={{ padding: '12px', borderRadius: '6px', border: '1px solid #ccc', fontSize: '16px', marginBottom: '10px', width: '100%', boxSizing: 'border-box' }}
            >
              <option value="student">Student</option>
              <option value="counsellor">Counsellor</option>
            </select>
          </div>

          <div className="input-group">
            <label htmlFor="fullName">Full Name</label>
            <input type="text" id="fullName" name="fullName" placeholder="John Doe" value={formData.fullName} onChange={handleChange} required />
          </div>

          <div className="input-group">
            <label htmlFor="email">University Email</label>
            <input type="email" id="email" name="email" placeholder="student@uni.edu" value={formData.email} onChange={handleChange} required />
          </div>

          <div className="input-group">
            <label htmlFor="password">Password</label>
            <input type="password" id="password" name="password" placeholder="••••••••" value={formData.password} onChange={handleChange} required />
          </div>

          {/* --- NEW DEMOGRAPHIC FIELDS --- */}
          <div style={{ display: 'flex', gap: '15px', marginBottom: '15px' }}>
            <div className="input-group" style={{ flex: 2, marginBottom: 0 }}>
              <label htmlFor="phone">Phone Number</label>
              <input type="tel" id="phone" name="phone" placeholder="071 234 5678" value={formData.phone} onChange={handleChange} required />
            </div>
            
            <div className="input-group" style={{ flex: 1, marginBottom: 0 }}>
              <label htmlFor="age">Age</label>
              <input type="number" id="age" name="age" placeholder="18" min="16" max="100" value={formData.age} onChange={handleChange} required />
            </div>
          </div>

          <div className="input-group">
            <label htmlFor="religion">Religion / Belief System (Optional)</label>
            <input type="text" id="religion" name="religion" placeholder="e.g., Buddhist, Christian, None" value={formData.religion} onChange={handleChange} />
          </div>

          {/* --- COUNSELLOR SPECIFIC FIELDS --- */}
          {formData.role === 'counsellor' && (
            <div style={{ 
              padding: '15px', 
              backgroundColor: 'rgba(0, 123, 255, 0.05)', 
              borderRadius: '8px', 
              border: '1px solid #007bff',
              marginBottom: '20px'
            }}>
              <h4 style={{ marginTop: '0', marginBottom: '15px', color: '#007bff' }}>Professional Details</h4>
              
              <div className="input-group">
                <label htmlFor="specialization">Specialization</label>
                <input type="text" id="specialization" name="specialization" placeholder="e.g., Academic Stress, Anxiety" value={formData.specialization} onChange={handleChange} required />
              </div>
                     
              <div style={{ display: 'flex', gap: '15px' }}>
                <div className="input-group" style={{ flex: 1, marginBottom: 0 }}>
                  <label htmlFor="experience">Years Exp.</label>
                  <input type="number" id="experience" name="experience" placeholder="5" value={formData.experience} onChange={handleChange} required />
                </div>
                       
                <div className="input-group" style={{ flex: 2, marginBottom: 0 }}>
                  <label htmlFor="licenseNumber">License / Reg Number</label>
                  <input type="text" id="licenseNumber" name="licenseNumber" placeholder="SLMC-12345" value={formData.licenseNumber} onChange={handleChange} required />
                </div>
              </div>
            </div>
          )}

          <button type="submit" className="auth-button" style={{ marginTop: '10px' }}>Register</button>
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
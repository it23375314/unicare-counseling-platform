import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import '../styles/Auth.css'; 

const Register = () => {
  const navigate = useNavigate();

  // 1. Form State
  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    role: 'student', 
    password: '',
    phone: '',
    age: '',
    religion: '',
    specialization: '',
    experience: '',
    licenseNumber: ''
  });

  // 2. Error State
  const [errors, setErrors] = useState({});

  // 3. Handle Input Changes
  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
    if (errors[e.target.name]) {
      setErrors({ ...errors, [e.target.name]: null });
    }
  };

  // 4. Validation Logic
  const validateForm = () => {
    const newErrors = {};

    if (!formData.fullName.trim()) newErrors.fullName = "Full name is required";
    
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(formData.email)) newErrors.email = "Enter a valid university email";
    
    if (formData.password.length < 6) newErrors.password = "Password must be at least 6 characters";
    
    const phoneRegex = /^[\d\s-]{9,12}$/;
    if (!phoneRegex.test(formData.phone)) newErrors.phone = "Enter a valid phone number";
    
    if (!formData.age || formData.age < 16 || formData.age > 100) newErrors.age = "Invalid age";

    if (formData.role === 'counsellor') {
      if (!formData.specialization.trim()) newErrors.specialization = "Required";
      if (formData.experience === '' || formData.experience < 0) newErrors.experience = "Invalid exp.";
      if (!formData.licenseNumber.trim()) newErrors.licenseNumber = "Required";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // 5. Submit to Backend
  // 5. Submit to Backend
  const handleRegister = async (e) => {
    e.preventDefault();
    
    if (validateForm()) {
      try {
        const response = await fetch('http://localhost:5000/api/auth/register', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(formData),
        });

        const data = await response.json();

        if (response.ok) {
          console.log("✅ Success:", data.message);
          
          // --- CHANGE 1: Store the email so VerifyOTP.jsx knows who to verify ---
          localStorage.setItem('userEmail', formData.email); 
          
          // --- CHANGE 2: Store the role for dashboard routing later ---
          localStorage.setItem('userRole', formData.role);
          
          navigate('/verify-otp'); 
        } else {
          alert(data.error || "Internal Server Error"); 
        }
      } catch (err) {
        console.error("❌ Connection Error:", err);
        alert("Server is down. Please check your backend terminal.");
      }
    }
  };

  const errorStyle = { color: '#ef4444', fontSize: '12px', marginTop: '4px', display: 'block' };
  const inputStyle = { width: '100%', boxSizing: 'border-box' };

  return (
    <div className="auth-container">
      <div className="auth-card">
        <h2 className="auth-title">Create an Account</h2>
        
        <form onSubmit={handleRegister} noValidate>
          <div className="input-group">
            <label htmlFor="role">I am registering as a...</label>
            <select 
              name="role" 
              id="role" 
              value={formData.role} 
              onChange={handleChange}
              style={{ ...inputStyle, padding: '12px', borderRadius: '6px', border: '1px solid #ccc', fontSize: '16px', marginBottom: '10px' }}
            >
              <option value="student">Student</option>
              <option value="counsellor">Counsellor</option>
            </select>
          </div>

          <div className="input-group">
            <label htmlFor="fullName">Full Name</label>
            <input type="text" id="fullName" name="fullName" placeholder="John Doe" value={formData.fullName} onChange={handleChange} style={inputStyle} />
            {errors.fullName && <span style={errorStyle}>{errors.fullName}</span>}
          </div>

          <div className="input-group">
            <label htmlFor="email">University Email</label>
            <input type="email" id="email" name="email" placeholder="student@uni.edu" value={formData.email} onChange={handleChange} style={inputStyle} />
            {errors.email && <span style={errorStyle}>{errors.email}</span>}
          </div>

          <div className="input-group">
            <label htmlFor="password">Password</label>
            <input type="password" id="password" name="password" placeholder="••••••••" value={formData.password} onChange={handleChange} style={inputStyle} />
            {errors.password && <span style={errorStyle}>{errors.password}</span>}
          </div>

          {/* --- FIXED DEMOGRAPHIC FIELDS --- */}
          <div style={{ display: 'flex', gap: '15px', marginBottom: '15px', width: '100%' }}>
            <div className="input-group" style={{ flex: 3, marginBottom: 0 }}>
              <label htmlFor="phone">Phone Number</label>
              <input type="tel" id="phone" name="phone" placeholder="071 234 5678" value={formData.phone} onChange={handleChange} style={inputStyle} />
              {errors.phone && <span style={errorStyle}>{errors.phone}</span>}
            </div>
            
            <div className="input-group" style={{ flex: 1, marginBottom: 0 }}>
              <label htmlFor="age">Age</label>
              <input type="number" id="age" name="age" placeholder="18" value={formData.age} onChange={handleChange} style={inputStyle} />
              {errors.age && <span style={errorStyle}>{errors.age}</span>}
            </div>
          </div>

          <div className="input-group">
            <label htmlFor="religion">Religion / Belief System (Optional)</label>
            <input type="text" id="religion" name="religion" placeholder="e.g., Buddhist" value={formData.religion} onChange={handleChange} style={inputStyle} />
          </div>

          {formData.role === 'counsellor' && (
            <div style={{ padding: '15px', backgroundColor: 'rgba(0, 123, 255, 0.05)', borderRadius: '8px', border: '1px solid #007bff', marginBottom: '20px' }}>
              <h4 style={{ marginTop: '0', marginBottom: '15px', color: '#007bff' }}>Professional Details</h4>
              <div className="input-group">
                <label htmlFor="specialization">Specialization</label>
                <input type="text" id="specialization" name="specialization" placeholder="Academic Stress" value={formData.specialization} onChange={handleChange} style={inputStyle} />
                {errors.specialization && <span style={errorStyle}>{errors.specialization}</span>}
              </div>
              <div style={{ display: 'flex', gap: '15px' }}>
                <div className="input-group" style={{ flex: 1, marginBottom: 0 }}>
                  <label htmlFor="experience">Years</label>
                  <input type="number" id="experience" name="experience" placeholder="5" value={formData.experience} onChange={handleChange} style={inputStyle} />
                  {errors.experience && <span style={errorStyle}>{errors.experience}</span>}
                </div>
                <div className="input-group" style={{ flex: 2, marginBottom: 0 }}>
                  <label htmlFor="licenseNumber">License No.</label>
                  <input type="text" id="licenseNumber" name="licenseNumber" placeholder="SLMC-123" value={formData.licenseNumber} onChange={handleChange} style={inputStyle} />
                  {errors.licenseNumber && <span style={errorStyle}>{errors.licenseNumber}</span>}
                </div>
              </div>
            </div>
          )}

          <button type="submit" className="auth-button" style={{ marginTop: '10px', width: '100%' }}>Register</button>
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
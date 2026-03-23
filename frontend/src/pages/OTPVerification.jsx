// src/pages/OTPVerification.jsx
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import '../styles/Auth.css'; 

const OTPVerification = () => {
  const [otp, setOtp] = useState('');
  const navigate = useNavigate();

  const handleVerify = (e) => {
    e.preventDefault();
    
    if (otp.length === 4) {
      alert(`Verifying OTP: ${otp}. Success! Redirecting to Dashboard...`);
      navigate('/dashboard');
      // Later, we will change this to navigate to the actual dashboard
    } else {
      alert('Please enter a 4-digit code.');
    }
  };

  return (
    <div className="auth-container">
      <div className="auth-card">
        <h2 className="auth-title">Verify Your Account</h2>
        <p style={{ textAlign: 'center', color: '#666', marginBottom: '20px', fontSize: '14px' }}>
          We have sent a 4-digit code to your university email.
        </p>
        
        <form onSubmit={handleVerify}>
          <div className="input-group">
            <label htmlFor="otp" style={{ textAlign: 'center' }}>Enter Security Code</label>
            <input 
              type="text" 
              id="otp" 
              placeholder="0 0 0 0" 
              maxLength="4"
              value={otp}
              // This regex perfectly stops users from typing letters!
              onChange={(e) => setOtp(e.target.value.replace(/[^0-9]/g, ''))} 
              required 
              style={{ letterSpacing: '12px', textAlign: 'center', fontSize: '24px', fontWeight: 'bold' }}
            />
          </div>

          <button type="submit" className="auth-button">Verify Code</button>
        </form>

        <div style={{ textAlign: 'center', marginTop: '20px' }}>
          <p style={{ color: '#555', fontSize: '14px' }}>
            Didn't receive the code? <span style={{ color: '#007bff', cursor: 'pointer', fontWeight: '500' }}>Resend</span>
          </p>
        </div>
      </div>
    </div>
  );
};

export default OTPVerification;
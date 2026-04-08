import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import '../styles/Auth.css';

const VerifyOTP = () => {
  const [otp, setOtp] = useState('');
  const navigate = useNavigate();

  const handleVerify = async (e) => {
    e.preventDefault();

    try {
      const response = await fetch('http://localhost:5000/api/auth/verify-otp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          email: localStorage.getItem('userEmail'), 
          otp: otp 
        }),
      });

      const data = await response.json();

      if (response.ok) {
        localStorage.setItem('isLoggedIn', 'true');
        // Redirect based on role returned from backend
        if (data.role === 'student') navigate('/student-dashboard');
        else if (data.role === 'counsellor') navigate('/counsellor-dashboard');
      } else {
        alert(data.error || 'Invalid OTP');
      }
    } catch (err) {
      alert("Connection error. Is the backend running?");
    }
  };

  return (
    <div className="auth-container">
      <div className="auth-card" style={{ textAlign: 'center' }}>
        <h2 className="auth-title">Verify Your Email</h2>
        <p style={{ color: '#888', marginBottom: '25px' }}>
          Enter the 4-digit code sent to your university email.
        </p>

        <form onSubmit={handleVerify}>
          <div className="input-group">
            <input
              type="text"
              maxLength="4"
              placeholder="0 0 0 0"
              value={otp}
              onChange={(e) => setOtp(e.target.value.replace(/\D/g, ''))}
              required
              style={{
                fontSize: '32px',
                letterSpacing: '15px',
                textAlign: 'center',
                padding: '15px',
                width: '100%',
                boxSizing: 'border-box'
              }}
            />
          </div>
          <button type="submit" className="auth-button" style={{ marginTop: '20px' }}>
            Verify & Login
          </button>
        </form>
      </div>
    </div>
  );
};

// CRITICAL: This line fixes the "does not provide an export named default" error
export default VerifyOTP;
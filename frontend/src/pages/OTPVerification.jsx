import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import '../styles/Auth.css';

const VerifyOTP = () => {
  const [otp, setOtp] = useState('');
  const navigate = useNavigate();

  const handleVerify = (e) => {
    e.preventDefault();

    if (otp === '1234') {
      localStorage.setItem('isLoggedIn', 'true');
      const role = localStorage.getItem('userRole') || 'student';

      if (role === 'student') {
        navigate('/student-dashboard');
      } else if (role === 'counsellor') { // <-- Make sure this has two Ls!
        navigate('/counsellor-dashboard'); // <-- EXACT match to App.jsx!
      } else {
        // Fallback just in case
        navigate('/');
      }
      
    } else {
      alert('Invalid code. For testing, please enter: 1234');
    }
  };

  return (
    <div className="auth-container">
      <div className="auth-card" style={{ textAlign: 'center' }}>
        <h2 className="auth-title">Verify Your Email</h2>
        <p style={{ color: '#888', marginBottom: '25px', lineHeight: '1.5' }}>
          We've sent a 4-digit secure code to your university email.
        </p>

        <form onSubmit={handleVerify}>
          <div className="input-group">
            <input
              type="text"
              maxLength="4"
              placeholder="0 0 0 0"
              value={otp}
              onChange={(e) => setOtp(e.target.value.replace(/\D/g, ''))} // Only allows numbers!
              required
              style={{
                fontSize: '32px',
                letterSpacing: '15px',
                textAlign: 'center',
                padding: '15px',
                borderRadius: '8px',
                border: '1px solid #ccc',
                width: '100%',
                boxSizing: 'border-box',
                fontFamily: 'monospace'
              }}
            />
          </div>

          <button type="submit" className="auth-button" style={{ marginTop: '20px' }}>
            Verify & Login
          </button>
        </form>

        <div style={{ marginTop: '20px' }}>
          <p style={{ color: '#555', fontSize: '14px' }}>
            Didn't receive the code? <span style={{ color: '#007bff', cursor: 'pointer', fontWeight: '500' }}>Resend</span>
          </p>
        </div>
      </div>
    </div>
  );
};

export default VerifyOTP;
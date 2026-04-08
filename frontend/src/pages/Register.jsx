import { useState, useEffect } from 'react';
import axios from 'axios';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';

export default function Register() {
  const [formData, setFormData] = useState({
    name: '', email: '', password: '', role: 'student', itNumber: '', specialization: ''
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [pendingApproval, setPendingApproval] = useState(false);
  const navigate = useNavigate();
  const { login } = useAuth();

  useEffect(() => {
    document.body.style.overflow = 'hidden';
    return () => { document.body.style.overflow = 'auto'; };
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (!formData.name || !formData.email || !formData.password || !formData.itNumber) {
      setError('All fields are required.');
      return;
    }

    setLoading(true);
    try {
      const res = await axios.post(`${API_URL}/api/auth/register`, formData);

      // If counsellor, show pending screen — DO NOT auto-login
      if (res.data.pending) {
        setPendingApproval(true);
        return;
      }

      // For students/admins: auto-login after registration
      const loginRes = await axios.post(`${API_URL}/api/auth/login`, {
        email: formData.email,
        password: formData.password,
      });

      if (loginRes.data.success) {
        login(loginRes.data.data);
        const role = loginRes.data.data.role;
        navigate(role === 'admin' ? '/admin/resources' : '/', { replace: true });
      } else {
        navigate('/login');
      }
    } catch (err) {
      const msg = err.response?.data?.msg || err.response?.data?.errors?.[0]?.msg || 'Registration failed';
      setError(msg);
    } finally {
      setLoading(false);
    }
  };

  // Show pending approval screen for counsellors
  if (pendingApproval) {
    return (
      <div style={styles.pageWrapper}>
        <div style={{ maxWidth: '500px', width: '90%', backgroundColor: '#fff', borderRadius: '24px', padding: '60px 48px', textAlign: 'center', boxShadow: '0 20px 60px -15px rgba(15,118,110,0.15)' }}>
          <div style={{ fontSize: '64px', marginBottom: '24px' }}>⏳</div>
          <h2 style={{ fontSize: '28px', fontWeight: '800', color: '#164e63', marginBottom: '16px' }}>Registration Submitted!</h2>
          <p style={{ color: '#64748b', fontSize: '15px', lineHeight: '1.7', marginBottom: '32px' }}>
            Your counsellor account is <strong>pending admin approval</strong>. You will be able to log in once an administrator reviews and confirms your registration.
          </p>
          <div style={{ backgroundColor: '#f0fdf4', border: '1px solid #bbf7d0', borderRadius: '12px', padding: '16px', marginBottom: '32px' }}>
            <p style={{ color: '#166534', fontSize: '14px', fontWeight: '600', margin: 0 }}>📧 We'll contact you at <strong>{formData.email}</strong></p>
          </div>
          <Link to="/login" style={{ display: 'inline-block', backgroundColor: '#0891b2', color: '#fff', padding: '14px 36px', borderRadius: '12px', fontWeight: '700', textDecoration: 'none', fontSize: '15px' }}>Go to Login</Link>
        </div>
      </div>
    );
  }

  return (
    <div style={styles.pageWrapper}>
      <div style={styles.mainCard}>
        {/* LEFT â€” Branding */}
        <div style={styles.leftPanel}>
          <div style={styles.overlayCircle1}></div>
          <div style={styles.overlayCircle2}></div>
          <div style={styles.contentZIndex}>
            <div style={styles.logo}>🌱</div>
            <h1 style={styles.mainTitle}>Join Our<br />Community</h1>
            <p style={styles.subTitle}>
              Create your UniCare profile to start your wellness journey and
              access counseling and mental health resources.
            </p>
            <div style={styles.divider}></div>
          </div>
        </div>

        {/* RIGHT â€” Registration Form */}
        <div style={styles.rightPanel}>
          <div style={styles.formHeader}>
            <h2 style={styles.loginLabel}>Create Account</h2>
            <p style={styles.formSubText}>Please fill in your details accurately.</p>
          </div>

          {error && <div style={styles.errorBox}>{error}</div>}

          <form onSubmit={handleSubmit} style={styles.formStack}>
            <div style={styles.inputWrapper}>
              <span style={styles.icon}>👤</span>
              <input
                type="text" placeholder="Full Name" style={styles.inputField}
                value={formData.name} required
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              />
            </div>

            <div style={styles.inputWrapper}>
              <span style={styles.icon}>✉️</span>
              <input
                type="email" placeholder="Email Address" style={styles.inputField}
                value={formData.email} required
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              />
            </div>

            <div style={styles.inputWrapper}>
              <span style={styles.icon}>🆔</span>
              <input
                type="text" placeholder="IT Number (e.g., IT23375314)"
                style={styles.inputField} value={formData.itNumber} required
                pattern="^[A-Z]{2}[0-9]{8}$"
                title="Format: 2 uppercase letters followed by 8 digits (e.g. IT23375314)"
                onChange={(e) => setFormData({ ...formData, itNumber: e.target.value.toUpperCase() })}
              />
            </div>

            <div style={styles.inputWrapper}>
              <span style={styles.icon}>🔑</span>
              <input
                type="password" placeholder="Create Password" style={styles.inputField}
                value={formData.password} required
                onChange={(e) => setFormData({ ...formData, password: e.target.value })}
              />
            </div>

            <div style={styles.inputWrapper}>
              <span style={styles.icon}>🎓</span>
              <select
                style={styles.selectField} value={formData.role}
                onChange={(e) => setFormData({ ...formData, role: e.target.value })}
              >
                <option value="student">Role: Student</option>
                <option value="counsellor">Role: Counsellor</option>
                <option value="admin">Role: Admin</option>
              </select>
            </div>

            {formData.role === 'counsellor' && (
              <div style={styles.inputWrapper}>
                <span style={styles.icon}>🏥</span>
                <input
                  type="text" placeholder="Specialization (e.g. Anxiety, Career Guidance)"
                  style={styles.inputField} value={formData.specialization}
                  onChange={(e) => setFormData({ ...formData, specialization: e.target.value })}
                />
              </div>
            )}

            <button
              type="submit" disabled={loading}
              style={loading ? { ...styles.loginBtn, opacity: 0.7 } : styles.loginBtn}
            >
              {loading ? 'Processing...' : 'REGISTER NOW'}
            </button>
          </form>

          <div style={styles.footer}>
            <p style={styles.footerText}>
              Already registered?{' '}
              <Link to="/login" style={styles.registerLink}>Sign In here</Link>
            </p>
            <p style={{ ...styles.footerText, marginTop: '8px' }}>
              <Link to="/" style={styles.registerLink}>← Back to Home</Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

const styles = {
  pageWrapper: {
    minHeight: '100vh', width: '100%', display: 'flex',
    alignItems: 'center', justifyContent: 'center',
    margin: 0, padding: 0,
    fontFamily: "'Segoe UI', Roboto, sans-serif",
  },
  mainCard: {
    display: 'flex', flexDirection: 'row', width: '90%', maxWidth: '1050px',
    backgroundColor: '#fff', borderRadius: '24px', overflow: 'hidden',
    boxShadow: '0 20px 60px -15px rgba(15, 118, 110, 0.15)', minHeight: '680px',
  },
  leftPanel: {
    width: '40%',
    background: 'linear-gradient(145deg, #0e7490 0%, #0891b2 100%)',
    padding: '60px', display: 'flex', flexDirection: 'column',
    justifyContent: 'center', position: 'relative', color: '#fff', overflow: 'hidden',
  },
  contentZIndex: { position: 'relative', zIndex: 10 },
  logo: { fontSize: '48px', marginBottom: '16px' },
  mainTitle: { fontSize: '40px', fontWeight: '700', marginBottom: '20px', lineHeight: '1.1' },
  subTitle: { fontSize: '15px', opacity: 0.9, lineHeight: '1.6', fontWeight: '300' },
  divider: { width: '40px', height: '4px', backgroundColor: '#2dd4bf', marginTop: '20px', borderRadius: '2px' },
  overlayCircle1: {
    position: 'absolute', top: '-20px', right: '-20px', width: '180px', height: '180px',
    borderRadius: '50%', backgroundColor: 'rgba(255,255,255,0.08)', filter: 'blur(30px)',
  },
  overlayCircle2: {
    position: 'absolute', bottom: '10%', left: '-30px', width: '120px', height: '120px',
    borderRadius: '50%', backgroundColor: 'rgba(45,212,191,0.2)', filter: 'blur(20px)',
  },
  rightPanel: {
    width: '60%', padding: '40px 80px', display: 'flex',
    flexDirection: 'column', justifyContent: 'center', backgroundColor: '#fff',
  },
  formHeader: { marginBottom: '28px' },
  loginLabel: { color: '#164e63', fontSize: '28px', fontWeight: '800', marginBottom: '8px' },
  formSubText: { color: '#64748b', fontSize: '14px' },
  errorBox: {
    backgroundColor: '#fef2f2', border: '1px solid #fca5a5', color: '#dc2626',
    borderRadius: '10px', padding: '12px 16px', marginBottom: '16px', fontSize: '14px',
  },
  formStack: { display: 'flex', flexDirection: 'column', gap: '18px' },
  inputWrapper: { position: 'relative' },
  icon: { position: 'absolute', left: '18px', top: '50%', transform: 'translateY(-50%)', opacity: 0.5 },
  inputField: {
    width: '100%', padding: '14px 14px 14px 50px', borderRadius: '12px',
    border: '1px solid #e2e8f0', backgroundColor: '#fcfdfe', fontSize: '15px',
    outline: 'none', boxSizing: 'border-box',
  },
  selectField: {
    width: '100%', padding: '14px 14px 14px 50px', borderRadius: '12px',
    border: '1px solid #e2e8f0', backgroundColor: '#fcfdfe', fontSize: '15px',
    color: '#374151', outline: 'none', appearance: 'none',
  },
  loginBtn: {
    width: '100%', padding: '16px', borderRadius: '12px', border: 'none',
    backgroundColor: '#0891b2', color: '#fff', fontWeight: '700', fontSize: '15px',
    cursor: 'pointer', marginTop: '8px',
  },
  footer: { marginTop: '28px' },
  footerText: { color: '#64748b', fontSize: '14px' },
  registerLink: { color: '#0e7490', fontWeight: '700', textDecoration: 'none' },
};

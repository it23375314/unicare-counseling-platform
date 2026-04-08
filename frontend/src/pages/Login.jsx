import { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';

export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const navigate = useNavigate();
  const { login } = useAuth();

  useEffect(() => {
    document.body.style.overflow = 'hidden';
    return () => { document.body.style.overflow = 'auto'; };
  }, []);

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      const res = await axios.post(`${API_URL}/api/auth/login`, { email, password });
      const data = res.data;

      if (!data.success) {
        setError(data.msg || 'Login failed');
        return;
      }

      // Update AuthContext with full user data
      login(data.data);

      // Redirect based on role
      if (data.data.role === 'admin') {
        navigate('/admin/resources', { replace: true });
      } else if (data.data.role === 'counsellor') {
        navigate('/counsellor/availability', { replace: true });
      } else {
        navigate('/', { replace: true });
      }
    } catch (err) {
      setError(err.response?.data?.msg || 'Login failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={styles.pageWrapper}>
      <div style={styles.mainCard}>
        {/* LEFT â€” Branding */}
        <div style={styles.leftPanel}>
          <div style={styles.overlayCircle1}></div>
          <div style={styles.overlayCircle2}></div>
          <div style={styles.contentZIndex}>
            <div style={styles.logo}>🧠</div>
            <h1 style={styles.mainTitle}>UniCare<br />Counseling</h1>
            <p style={styles.subTitle}>
              Your trusted space for mental health support, counseling bookings,
              and student wellness resources.
            </p>
            <div style={styles.divider}></div>
          </div>
        </div>

        {/* RIGHT â€” Login Form */}
        <div style={styles.rightPanel}>
          <div style={styles.formHeader}>
            <h2 style={styles.loginLabel}>Secure Login</h2>
            <p style={styles.formSubText}>Enter your credentials to access your dashboard.</p>
          </div>

          {error && <div style={styles.errorBox}>{error}</div>}

          <form onSubmit={handleLogin} style={styles.formStack}>
            <div style={styles.inputWrapper}>
              <span style={styles.icon}>✉️</span>
              <input
                type="email"
                placeholder="Email Address"
                style={styles.inputField}
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>

            <div style={styles.inputWrapper}>
              <span style={styles.icon}>🔑</span>
              <input
                type="password"
                placeholder="Password"
                style={styles.inputField}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              style={loading ? { ...styles.loginBtn, opacity: 0.7 } : styles.loginBtn}
            >
              {loading ? 'Signing In...' : 'ACCESS PORTAL'}
            </button>
          </form>

          <div style={styles.footer}>
            <p style={styles.footerText}>
              New to UniCare?{' '}
              <Link to="/register" style={styles.registerLink}>Create an Account</Link>
            </p>
            <p style={{ ...styles.footerText, marginTop: '8px' }}>
              <Link to="/" style={styles.registerLink}>← Back to Home</Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

const styles = {
  pageWrapper: {
    minHeight: '100vh', width: '100vw', display: 'flex',
    alignItems: 'center', justifyContent: 'center',
    backgroundColor: '#f0fdfa', margin: 0, padding: 0,
    position: 'fixed', top: 0, left: 0,
    fontFamily: "'Segoe UI', Roboto, Helvetica, Arial, sans-serif",
  },
  mainCard: {
    display: 'flex', flexDirection: 'row', width: '90%', maxWidth: '1050px',
    backgroundColor: '#fff', borderRadius: '24px', overflow: 'hidden',
    boxShadow: '0 20px 60px -15px rgba(15, 118, 110, 0.15)', minHeight: '620px',
  },
  leftPanel: {
    width: '45%',
    background: 'linear-gradient(145deg, #0e7490 0%, #0891b2 100%)',
    padding: '60px', display: 'flex', flexDirection: 'column',
    justifyContent: 'center', position: 'relative', color: '#fff', overflow: 'hidden',
  },
  contentZIndex: { position: 'relative', zIndex: 10 },
  logo: { fontSize: '48px', marginBottom: '16px' },
  mainTitle: { fontSize: '42px', fontWeight: '700', marginBottom: '20px', lineHeight: '1.1' },
  subTitle: { fontSize: '16px', opacity: 0.9, lineHeight: '1.6', fontWeight: '300' },
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
    width: '55%', padding: '60px 80px', display: 'flex',
    flexDirection: 'column', justifyContent: 'center', backgroundColor: '#fff',
  },
  formHeader: { textAlign: 'left', marginBottom: '32px' },
  loginLabel: { color: '#164e63', fontSize: '28px', fontWeight: '800', marginBottom: '8px' },
  formSubText: { color: '#64748b', fontSize: '14px' },
  errorBox: {
    backgroundColor: '#fef2f2', border: '1px solid #fca5a5', color: '#dc2626',
    borderRadius: '10px', padding: '12px 16px', marginBottom: '16px', fontSize: '14px',
  },
  formStack: { display: 'flex', flexDirection: 'column', gap: '22px' },
  inputWrapper: { position: 'relative' },
  icon: { position: 'absolute', left: '18px', top: '50%', transform: 'translateY(-50%)', opacity: 0.5 },
  inputField: {
    width: '100%', padding: '16px 16px 16px 50px', borderRadius: '12px',
    border: '1px solid #e2e8f0', backgroundColor: '#fcfdfe', fontSize: '15px',
    outline: 'none', boxSizing: 'border-box',
  },
  loginBtn: {
    width: '100%', padding: '16px', borderRadius: '12px', border: 'none',
    backgroundColor: '#0891b2', color: '#fff', fontWeight: '700', fontSize: '15px',
    cursor: 'pointer', marginTop: '10px', boxShadow: '0 4px 12px rgba(8,145,178,0.2)',
  },
  footer: { marginTop: '40px' },
  footerText: { color: '#64748b', fontSize: '14px' },
  registerLink: { color: '#0e7490', fontWeight: '700', textDecoration: 'none' },
};

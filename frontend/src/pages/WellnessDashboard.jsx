import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';

export default function WellnessDashboard() {
  const userName = localStorage.getItem('userName') || 'Current Student';
  const userRole = localStorage.getItem('userRole') || 'student';
  const [selectedMood, setSelectedMood] = useState(null);
  const [showMoodPrompt, setShowMoodPrompt] = useState(true);
  const navigate = useNavigate();

  const MOOD_OPTIONS = [
    { label: 'Very Low', emoji: '😔' },
    { label: 'Low', emoji: '🙁' },
    { label: 'Okay', emoji: '😐' },
    { label: 'Good', emoji: '🙂' },
    { label: 'Great', emoji: '😄' }
  ];

  if (userRole !== 'student') {
    return (
      <div style={styles.deniedContainer}>
        <div style={styles.deniedCard}>
          <div style={{ fontSize: '50px', marginBottom: '15px' }}>🚫</div>
          <h2 style={{ fontSize: '24px', fontWeight: 'bold', color: '#111827' }}>Access Denied</h2>
          <button onClick={() => window.location.href='/login'} style={styles.deniedBtn}>
            Return to Login
          </button>
        </div>
      </div>
    );
  }

  useEffect(() => {
    document.body.style.margin = "0";
    document.body.style.padding = "0";

    const savedMood = localStorage.getItem('quickMood');
    if (savedMood) setSelectedMood(savedMood);

    const moodPromptDismissed = sessionStorage.getItem('moodPromptDismissed');
    if (moodPromptDismissed) setShowMoodPrompt(false);
  }, []);

  const handleMoodSelect = (option) => {
    setSelectedMood(option.label);
    localStorage.setItem('quickMood', option.label);
    localStorage.setItem('quickMoodEmoji', option.emoji);
    localStorage.setItem('quickMoodAt', new Date().toISOString());
    sessionStorage.setItem('moodPromptDismissed', 'true');
    setShowMoodPrompt(false);
    navigate('/mood');
  };

  const handleLogout = () => {
    if (window.confirm("Are you sure you want to log out?")) {
      localStorage.clear();
      window.location.href = '/login';
    }
  };

  return (
    <>
      <style>{`
        /* Modern Card Hover Effects */
        .service-card { transition: box-shadow 0.3s ease, transform 0.3s ease; }
        .service-card:hover { box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05); transform: translateY(-2px); }
        .service-card:hover .card-arrow { transform: translateX(4px); }
        .card-arrow { transition: transform 0.2s ease; }

        /* Bulletproof Pill Buttons */
        .mood-btn {
            outline: none !important;
            -webkit-tap-highlight-color: transparent;
            transition: all 0.2s ease;
        }
        .mood-btn:focus, .mood-btn:active {
            outline: none !important;
            border-color: #e5e7eb !important; 
            box-shadow: 0 1px 2px 0 rgba(0, 0, 0, 0.05) !important;
        }
        .mood-btn-active:focus, .mood-btn-active:active {
            outline: none !important;
            border-color: #2563eb !important;
        }
        .mood-btn:hover { background-color: #f9fafb !important; border-color: #d1d5db !important; }
        .mood-btn-active:hover { background-color: #1d4ed8 !important; border-color: #1d4ed8 !important; }

        /* Nav & Footer Hover Effects */
        .nav-link:hover { color: #2563eb; }
        .footer-link:hover { color: #ffffff; text-decoration: underline; }
      `}</style>

      <div style={styles.dashboardContainer}>
        

        {/* --- MAIN CONTENT AREA --- */}
        <div style={styles.mainWrapper}>
          <main style={styles.mainContent}>
            
            {/* HEADER SECTION */}
            <div style={styles.headerSection}>
              <div style={styles.sessionBadge}>
                <span style={styles.checkIcon}>
                    <svg xmlns="http://www.w3.org/2000/svg" width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"></polyline></svg>
                </span>
                SECURE SESSION ACTIVE
              </div>
              <h1 style={styles.mainTitle}>Welcome, {userName.split(' ')[0] || "Student"}.</h1>
              <p style={styles.subTitle}>
                Your central hub for medical and wellness services. Explore tools designed to help you build healthy habits and find balance.
              </p>
            </div>

            <div style={{ marginBottom: '24px' }}>
              <h2 style={styles.sectionTitle}>Your Tools & Resources</h2>
            </div>

            {/* SERVICES GRID */}
            <div style={styles.servicesGrid}>
              
              <Link to="/wellness" className="service-card" style={styles.serviceCard}>
                <div style={{...styles.iconWrap, backgroundColor: '#eff6ff', color: '#2563eb'}}>
                  <svg viewBox="0 0 24 24" aria-hidden="true" style={styles.iconSvg}>
                    <circle cx="12" cy="12" r="9" fill="none" stroke="currentColor" strokeWidth="2" />
                    <circle cx="12" cy="12" r="5" fill="none" stroke="currentColor" strokeWidth="2" />
                    <circle cx="12" cy="12" r="1.5" fill="currentColor" />
                  </svg>
                </div>
                <h3 style={styles.cardTitle}>Goal Tracker</h3>
                <p style={styles.cardDesc}>Set personal milestones, track progress, and build long-lasting healthy habits.</p>
                <div style={styles.cardAction}>
                    Open Tracker 
                    <span className="card-arrow" style={styles.arrowIcon}>➔</span>
                </div>
              </Link>

              <Link to="/mood" className="service-card" style={styles.serviceCard}>
                <div style={{...styles.iconWrap, backgroundColor: '#f3e8ff', color: '#9333ea'}}>
                  <svg viewBox="0 0 24 24" aria-hidden="true" style={styles.iconSvg}>
                    <circle cx="8" cy="10" r="5" fill="none" stroke="currentColor" strokeWidth="2" />
                    <circle cx="16" cy="14" r="5" fill="none" stroke="currentColor" strokeWidth="2" />
                    <circle cx="6.5" cy="9" r="0.6" fill="currentColor" />
                    <circle cx="9.5" cy="9" r="0.6" fill="currentColor" />
                    <path d="M6.5 11.2c1 1 2.5 1 3.5 0" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
                    <circle cx="14.5" cy="13" r="0.6" fill="currentColor" />
                    <circle cx="17.5" cy="13" r="0.6" fill="currentColor" />
                    <path d="M14.5 16c1-1 2.5-1 3.5 0" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
                  </svg>
                </div>
                <h3 style={styles.cardTitle}>Mood Support</h3>
                <p style={styles.cardDesc}>Log your daily emotional check-ins and receive AI-guided, personalized support.</p>
                <div style={styles.cardAction}>
                    Open Assistant 
                    <span className="card-arrow" style={styles.arrowIcon}>➔</span>
                </div>
              </Link>

              <Link to="/resources" className="service-card" style={styles.serviceCard}>
                <div style={{...styles.iconWrap, backgroundColor: '#ccfbf1', color: '#0d9488'}}>
                  <svg viewBox="0 0 24 24" aria-hidden="true" style={styles.iconSvg}>
                    <path d="M4 6a3 3 0 0 1 3-3h10v18H7a3 3 0 0 1-3-3V6z" fill="none" stroke="currentColor" strokeWidth="2" />
                    <path d="M7 5h10" fill="none" stroke="currentColor" strokeWidth="2" />
                    <path d="M7 9h10" fill="none" stroke="currentColor" strokeWidth="2" />
                  </svg>
                </div>
                <h3 style={styles.cardTitle}>Health Library</h3>
                <p style={styles.cardDesc}>Browse a directory of premium wellness materials specializing in student mental health.</p>
                <div style={styles.cardAction}>
                    Open Library 
                    <span className="card-arrow" style={styles.arrowIcon}>➔</span>
                </div>
              </Link>

              <Link to="/saved" className="service-card" style={styles.serviceCard}>
                <div style={{...styles.iconWrap, backgroundColor: '#fce7f3', color: '#db2777'}}>
                  <svg viewBox="0 0 24 24" aria-hidden="true" style={styles.iconSvg}>
                    <path d="M7 3h10a1 1 0 0 1 1 1v17l-6-4-6 4V4a1 1 0 0 1 1-1z" fill="none" stroke="currentColor" strokeWidth="2" />
                  </svg>
                </div>
                <h3 style={styles.cardTitle}>Saved Files</h3>
                <p style={styles.cardDesc}>Access your personal collection of bookmarked wellness materials and guides.</p>
                <div style={styles.cardAction}>
                    View Favorites 
                    <span className="card-arrow" style={styles.arrowIcon}>➔</span>
                </div>
              </Link>

            </div>

            {/* MOOD PROMPT CARD */}
            {showMoodPrompt && (
                <div style={styles.moodPromptCard}>
                  <div>
                    <h3 style={styles.cardTitle}>Interactive Mood Tracker</h3>
                    <p style={styles.cardDesc}>Tap how you feel right now. We will save it and take you directly to the Assistant.</p>
                    
                    <div style={styles.moodRow}>
                      {MOOD_OPTIONS.map(option => {
                          const isActive = selectedMood === option.label;
                          return (
                            <button
                                key={option.label}
                                type="button"
                                className={`mood-btn ${isActive ? 'mood-btn-active' : ''}`}
                                onClick={() => handleMoodSelect(option)}
                                style={{
                                    ...styles.moodButton,
                                    ...(isActive ? styles.moodButtonActive : {})
                                }}
                            >
                                <span style={styles.moodEmoji}>{option.emoji}</span>
                                <span style={styles.moodLabel}>{option.label}</span>
                            </button>
                          );
                      })}
                    </div>
                  </div>
                </div>
            )}

          </main>
        </div>

        {/* --- FOOTER --- */}
        <footer style={styles.footer}>
          <div style={styles.footerGrid}>
            <div>
              <h3 style={styles.footerHeading}>UniCare</h3>
              <p style={styles.footerText}>
                Empowering university students with accessible, secure, and private mental health counseling.
              </p>
            </div>
            
            <div>
              <h3 style={styles.footerHeading}>Links</h3>
              <Link to="/" className="footer-link" style={styles.footerLink}>Home</Link>
              <Link to="/about" className="footer-link" style={styles.footerLink}>About Us</Link>
              <Link to="/counsellors" className="footer-link" style={styles.footerLink}>Find a Counsellor</Link>
            </div>

            <div>
              <h3 style={styles.footerHeading}>Support</h3>
              <Link to="/faq" className="footer-link" style={styles.footerLink}>FAQ</Link>
              <Link to="/privacy" className="footer-link" style={styles.footerLink}>Privacy Policy</Link>
              <Link to="/terms" className="footer-link" style={styles.footerLink}>Terms of Service</Link>
            </div>

            <div>
              <h3 style={styles.footerHeading}>Contact</h3>
              <a href="mailto:support@unicare.edu" className="footer-link" style={styles.footerLink}>support@unicare.edu</a>
              <p style={{...styles.footerLink, cursor: 'default'}}>1-800-UNICARE</p>
            </div>
          </div>
          <div style={styles.footerBottom}>
            © 2026 UniCare Platform. All rights reserved.
          </div>
        </footer>

      </div>
    </>
  );
}

const styles = {
  // --- LAYOUT ---
  dashboardContainer: { display: 'flex', flexDirection: 'column', minHeight: '100vh', width: '100%', fontFamily: "'Inter', 'Segoe UI', Roboto, sans-serif", backgroundColor: '#f9fafb' },
  mainWrapper: { flex: 1, width: '100%', boxSizing: 'border-box' },
  mainContent: { maxWidth: '1000px', margin: '0 auto', padding: '48px 32px 96px 32px' },

  // --- NAVBAR ---
  navbar: { display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '16px 40px', backgroundColor: '#ffffff', borderBottom: '1px solid #e5e7eb', position: 'sticky', top: 0, zIndex: 1000 },
  navLeft: { display: 'flex', alignItems: 'center', gap: '12px', cursor: 'pointer' },
  logoBox: { backgroundColor: '#2563eb', color: 'white', borderRadius: '8px', padding: '8px', display: 'flex', alignItems: 'center', justifyContent: 'center' },
  logoText: { fontSize: '22px', fontWeight: '800', color: '#0ea5e9' },
  navLinks: { display: 'flex', gap: '32px', alignItems: 'center' },
  navLink: { textDecoration: 'none', color: '#4b5563', fontWeight: '500', fontSize: '15px', transition: 'color 0.2s' },
  navLinkActive: { textDecoration: 'none', color: '#2563eb', fontWeight: '600', fontSize: '15px', borderBottom: '2px solid #2563eb', paddingBottom: '4px' },
  navRight: { display: 'flex', alignItems: 'center' },
  userPill: { display: 'flex', alignItems: 'center', gap: '10px', padding: '8px 20px', border: '1px solid #e5e7eb', borderRadius: '30px', cursor: 'pointer', color: '#374151', fontSize: '14px', fontWeight: '500', backgroundColor: '#ffffff', transition: 'all 0.2s', boxShadow: '0 1px 2px 0 rgba(0,0,0,0.05)' },

  // --- HEADER SECTION ---
  headerSection: { marginBottom: '48px' },
  sessionBadge: { color: '#0d9488', fontSize: '11px', fontWeight: '800', textTransform: 'uppercase', letterSpacing: '1px', display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '16px' },
  checkIcon: { backgroundColor: '#10b981', color: 'white', borderRadius: '50%', width: '16px', height: '16px', display: 'flex', alignItems: 'center', justifyContent: 'center' },
  mainTitle: { fontSize: '36px', fontWeight: '800', color: '#111827', marginBottom: '16px', fontFamily: "Georgia, serif" },
  subTitle: { color: '#4b5563', fontSize: '16px', margin: 0, maxWidth: '672px', lineHeight: '1.5' },
  sectionTitle: { fontSize: '20px', fontWeight: '700', color: '#111827', margin: 0 },

  // --- SERVICES GRID ---
  servicesGrid: { display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '24px', marginBottom: '40px' },
  serviceCard: { backgroundColor: '#ffffff', borderRadius: '24px', padding: '24px', border: '1px solid #f3f4f6', boxShadow: '0 1px 2px 0 rgba(0, 0, 0, 0.05)', display: 'flex', flexDirection: 'column', textDecoration: 'none', cursor: 'pointer' },
  iconWrap: { width: '48px', height: '48px', borderRadius: '12px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '24px', marginBottom: '20px' },
  iconSvg: { width: '26px', height: '26px', display: 'block' },
  cardTitle: { fontSize: '18px', fontWeight: '700', color: '#111827', margin: '0 0 8px 0' },
  cardDesc: { fontSize: '14px', color: '#4b5563', margin: '0 0 24px 0', lineHeight: '1.5', flexGrow: 1 },
  cardAction: { fontSize: '14px', fontWeight: '600', color: '#2563eb', display: 'flex', alignItems: 'center', gap: '6px', marginTop: 'auto' },
  arrowIcon: { fontSize: '16px' },

  // --- MOOD PROMPT CARD ---
  moodPromptCard: { backgroundColor: '#ffffff', borderRadius: '24px', padding: '32px', border: '1px solid #f3f4f6', boxShadow: '0 1px 2px 0 rgba(0, 0, 0, 0.05)', marginTop: '16px' },
  moodRow: { display: 'flex', gap: '12px', flexWrap: 'wrap', marginTop: '24px' },
  moodButton: { backgroundColor: '#ffffff', borderWidth: '1px', borderStyle: 'solid', borderColor: '#e5e7eb', color: '#4b5563', padding: '10px 20px', borderRadius: '30px', fontSize: '14px', fontWeight: '500', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '8px', boxShadow: '0 1px 2px 0 rgba(0, 0, 0, 0.05)' },
  moodButtonActive: { backgroundColor: '#2563eb', borderColor: '#2563eb', color: '#ffffff', fontWeight: '600' },
  moodEmoji: { fontSize: '18px' },
  moodLabel: { fontSize: '14px' },

  // --- FOOTER ---
  footer: { backgroundColor: '#0f172a', color: '#e2e8f0', padding: '64px 40px 24px 40px', marginTop: 'auto' },
  footerGrid: { display: 'grid', gridTemplateColumns: '2fr 1fr 1fr 1fr', gap: '40px', maxWidth: '1200px', margin: '0 auto', marginBottom: '48px' },
  footerHeading: { fontSize: '16px', fontWeight: '700', marginBottom: '20px', color: '#ffffff' },
  footerText: { fontSize: '14px', color: '#94a3b8', lineHeight: '1.6', maxWidth: '300px' },
  footerLink: { display: 'block', fontSize: '14px', color: '#94a3b8', textDecoration: 'none', marginBottom: '12px', transition: 'color 0.2s' },
  footerBottom: { borderTop: '1px solid #1e293b', paddingTop: '24px', textAlign: 'center', fontSize: '14px', color: '#64748b' },

  deniedContainer: { display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '100vh', backgroundColor: '#f9fafb' },
  deniedCard: { backgroundColor: 'white', padding: '40px', borderRadius: '24px', boxShadow: '0 4px 6px rgba(0,0,0,0.05)', textAlign: 'center', border: '1px solid #f3f4f6' },
  deniedBtn: { marginTop: '20px', width: '100%', backgroundColor: '#2563eb', color: 'white', padding: '12px', borderRadius: '12px', fontWeight: '600', cursor: 'pointer', border: 'none' }
};

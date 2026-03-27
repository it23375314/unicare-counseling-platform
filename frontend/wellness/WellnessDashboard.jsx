import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';

export default function WellnessDashboard() {
  const userName = localStorage.getItem('userName');
  const userRole = localStorage.getItem('userRole');
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
        .sidebar-item { padding: 15px; margin-bottom: 10px; border-radius: 8px; cursor: pointer; color: #4b5563; font-weight: 500; transition: all 0.3s ease; }
        .sidebar-item:hover { background-color: #f3f4f6; color: #111827; }
        .sub-item { padding: 10px 15px !important; font-size: 13px !important; margin-bottom: 5px !important; opacity: 0.8; }
        .sub-item:hover { opacity: 1; transform: translateX(5px); }
        
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
        .mood-btn:hover { 
            background-color: #f9fafb !important; 
            border-color: #d1d5db !important; 
        }
        .mood-btn-active:hover { 
            background-color: #1d4ed8 !important; 
            border-color: #1d4ed8 !important; 
        }
      `}</style>

      <div style={styles.dashboardContainer}>
        
        {/* --- LEFT SIDEBAR --- */}
        <div style={styles.sidebar}>
          <h2 style={{ color: '#2563eb', marginBottom: '40px', textAlign: 'center', marginTop: 0 }}>
            UniCare
          </h2>
          
          <ul style={{ listStyle: 'none', padding: 0, flex: 1, margin: 0 }}>
            <li className="sidebar-item" onClick={() => navigate('/')}>🏠 Dashboard</li>
            <li className="sidebar-item" onClick={() => navigate('/appointments')}>📅 Appointments</li>
            <li className="sidebar-item" style={{ backgroundColor: '#eff6ff', color: '#1d4ed8', fontWeight: '800', cursor: 'pointer' }} onClick={() => navigate('/wellness-dashboard')}>🌿 My Wellness Portal</li>
            
            <ul style={{ listStyle: 'none', paddingLeft: '20px', marginBottom: '10px' }}>
                <li className="sidebar-item sub-item" onClick={() => navigate('/wellness')}>🎯 Goal Tracker</li>
                <li className="sidebar-item sub-item" onClick={() => navigate('/mood')}>🎭 Mood Support</li>
                <li className="sidebar-item sub-item" onClick={() => navigate('/resources')}>📚 Health Library</li>
                <li className="sidebar-item sub-item" onClick={() => navigate('/saved')}>🔖 Saved Files</li>
            </ul>

            <li className="sidebar-item" onClick={() => navigate('/settings')}>⚙️ Settings</li>
          </ul>
          
          <ul style={{ listStyle: 'none', padding: 0, flex: 0, margin: 0 }}>
            <li className="sidebar-item" onClick={handleLogout} style={{ color: '#dc2626' }}>🚪 Logout</li>
          </ul>
        </div>

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
              <h1 style={styles.mainTitle}>Welcome, {userName?.split(' ')[0] || "Student"}.</h1>
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
      </div>
    </>
  );
}

const styles = {
  dashboardContainer: { display: 'flex', minHeight: '100vh', width: '100%', fontFamily: "'Inter', 'Segoe UI', Roboto, sans-serif", backgroundColor: '#f9fafb' },
  sidebar: { width: '250px', backgroundColor: '#ffffff', padding: '20px', boxShadow: '2px 0 10px rgba(0, 0, 0, 0.05)', display: 'flex', flexDirection: 'column', position: 'fixed', top: 0, left: 0, bottom: 0, boxSizing: 'border-box', zIndex: 1000, overflowY: 'auto' },
  mainWrapper: { flex: 1, marginLeft: '250px', boxSizing: 'border-box' },
  mainContent: { maxWidth: '1000px', margin: '0 auto', padding: '48px 32px 96px 32px' },

  headerSection: { marginBottom: '48px' },
  sessionBadge: { color: '#0d9488', fontSize: '11px', fontWeight: '800', textTransform: 'uppercase', letterSpacing: '1px', display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '16px' },
  checkIcon: { backgroundColor: '#10b981', color: 'white', borderRadius: '50%', width: '16px', height: '16px', display: 'flex', alignItems: 'center', justifyContent: 'center' },
  mainTitle: { fontSize: '36px', fontWeight: '800', color: '#111827', marginBottom: '16px', fontFamily: "Georgia, serif" },
  subTitle: { color: '#4b5563', fontSize: '16px', margin: 0, maxWidth: '672px', lineHeight: '1.5' },

  sectionTitle: { fontSize: '20px', fontWeight: '700', color: '#111827', margin: 0 },

  // --- NEW SERVICES GRID ---
  servicesGrid: { display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '24px', marginBottom: '40px' },
  serviceCard: { 
      backgroundColor: '#ffffff', 
      borderRadius: '24px', 
      padding: '24px', 
      border: '1px solid #f3f4f6', 
      boxShadow: '0 1px 2px 0 rgba(0, 0, 0, 0.05)', 
      display: 'flex', 
      flexDirection: 'column', 
      textDecoration: 'none',
      cursor: 'pointer'
  },
  iconWrap: { width: '48px', height: '48px', borderRadius: '12px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '24px', marginBottom: '20px' },
  iconSvg: { width: '26px', height: '26px', display: 'block' },
  cardTitle: { fontSize: '18px', fontWeight: '700', color: '#111827', margin: '0 0 8px 0' },
  cardDesc: { fontSize: '14px', color: '#4b5563', margin: '0 0 24px 0', lineHeight: '1.5', flexGrow: 1 },
  cardAction: { fontSize: '14px', fontWeight: '600', color: '#2563eb', display: 'flex', alignItems: 'center', gap: '6px', marginTop: 'auto' },
  arrowIcon: { fontSize: '16px' },

  // --- MOOD PROMPT CARD ---
  moodPromptCard: { 
      backgroundColor: '#ffffff', 
      borderRadius: '24px', 
      padding: '32px', 
      border: '1px solid #f3f4f6', 
      boxShadow: '0 1px 2px 0 rgba(0, 0, 0, 0.05)',
      marginTop: '16px'
  },
  moodRow: { display: 'flex', gap: '12px', flexWrap: 'wrap', marginTop: '24px' },
  
  moodButton: { 
      backgroundColor: '#ffffff', 
      borderWidth: '1px',
      borderStyle: 'solid',
      borderColor: '#e5e7eb', 
      color: '#4b5563', 
      padding: '10px 20px', 
      borderRadius: '30px', 
      fontSize: '14px',
      fontWeight: '500',
      cursor: 'pointer',
      display: 'flex', 
      alignItems: 'center', 
      gap: '8px',
      boxShadow: '0 1px 2px 0 rgba(0, 0, 0, 0.05)'
  },
  moodButtonActive: { 
      backgroundColor: '#2563eb', 
      borderColor: '#2563eb', 
      color: '#ffffff', 
      fontWeight: '600'
  },
  moodEmoji: { fontSize: '18px' },
  moodLabel: { fontSize: '14px' },

  deniedContainer: { display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '100vh', backgroundColor: '#f9fafb' },
  deniedCard: { backgroundColor: 'white', padding: '40px', borderRadius: '24px', boxShadow: '0 4px 6px rgba(0,0,0,0.05)', textAlign: 'center', border: '1px solid #f3f4f6' },
  deniedBtn: { marginTop: '20px', width: '100%', backgroundColor: '#2563eb', color: 'white', padding: '12px', borderRadius: '12px', fontWeight: '600', cursor: 'pointer', border: 'none' }
};
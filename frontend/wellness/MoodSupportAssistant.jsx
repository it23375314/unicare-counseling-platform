import React, { useEffect, useMemo, useState } from 'react';
import axios from 'axios';
import { Link, useNavigate } from 'react-router-dom';

const SCORE_DETAILS = {
  1: { label: 'Very Low', meaning: 'Feeling overwhelmed or drained; focus on one grounding breath and take it easy.' },
  2: { label: 'Low', meaning: 'You are carrying weight right now; a restful break or gentle movement can help.' },
  3: { label: 'Okay', meaning: 'Things feel neutral today; consider one small win to swing momentum forward.' },
  4: { label: 'Good', meaning: 'You are steady; keep building on what is working and celebrate the progress.' },
  5: { label: 'Great', meaning: 'Energy is high; share the good energy and stay connected to your support circle.' }
};

const NEGATIVE_KEYWORDS = [
  'sad', 'down', 'anxious', 'stress', 'stressed', 'depressed', 'lonely',
  'tired', 'overwhelmed', 'angry', 'hopeless', 'panic', 'burnout', 'worried'
];

const POSITIVE_KEYWORDS = [
  'good', 'great', 'happy', 'proud', 'calm', 'excited', 'relieved', 'hopeful'
];

const QUICK_MOOD_TO_SCORE = { 'Very Low': 1, Low: 2, Okay: 3, Good: 4, Great: 5 };

const SCORE_ICON_STYLE = { width: '16px', height: '16px', display: 'block' };

const SCORE_ICONS = {
  1: (
    <svg viewBox="0 0 24 24" aria-hidden="true" style={SCORE_ICON_STYLE}>
      <circle cx="12" cy="12" r="9" fill="none" stroke="currentColor" strokeWidth="2" />
      <circle cx="9" cy="10" r="1" fill="currentColor" />
      <circle cx="15" cy="10" r="1" fill="currentColor" />
      <path d="M8.5 16c1.5-1.5 5.5-1.5 7 0" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
    </svg>
  ),
  2: (
    <svg viewBox="0 0 24 24" aria-hidden="true" style={SCORE_ICON_STYLE}>
      <circle cx="12" cy="12" r="9" fill="none" stroke="currentColor" strokeWidth="2" />
      <circle cx="9" cy="10" r="1" fill="currentColor" />
      <circle cx="15" cy="10" r="1" fill="currentColor" />
      <path d="M9 16c1.5-1 4.5-1 6 0" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
    </svg>
  ),
  3: (
    <svg viewBox="0 0 24 24" aria-hidden="true" style={SCORE_ICON_STYLE}>
      <circle cx="12" cy="12" r="9" fill="none" stroke="currentColor" strokeWidth="2" />
      <circle cx="9" cy="10" r="1" fill="currentColor" />
      <circle cx="15" cy="10" r="1" fill="currentColor" />
      <path d="M9 16h6" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
    </svg>
  ),
  4: (
    <svg viewBox="0 0 24 24" aria-hidden="true" style={SCORE_ICON_STYLE}>
      <circle cx="12" cy="12" r="9" fill="none" stroke="currentColor" strokeWidth="2" />
      <circle cx="9" cy="10" r="1" fill="currentColor" />
      <circle cx="15" cy="10" r="1" fill="currentColor" />
      <path d="M9 15c1.5 1 4.5 1 6 0" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
    </svg>
  ),
  5: (
    <svg viewBox="0 0 24 24" aria-hidden="true" style={SCORE_ICON_STYLE}>
      <circle cx="12" cy="12" r="9" fill="none" stroke="currentColor" strokeWidth="2" />
      <circle cx="9" cy="10" r="1" fill="currentColor" />
      <circle cx="15" cy="10" r="1" fill="currentColor" />
      <path d="M8.5 15c1.5 2 5.5 2 7 0" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
    </svg>
  )
};

const RESOURCES = {
  low: ['5-minute box breathing exercise', 'Grounding technique: 5-4-3-2-1', 'Short walk or light stretch break', 'Connect with a friend or trusted peer', 'Campus counseling center drop-in hours'],
  medium: ['Plan one small task to regain control', 'Hydrate and eat a balanced snack', 'Take a 10-minute focus reset', 'Write down 3 things you can influence today', 'Review wellness resources in the library'],
  high: ['Celebrate a small win today', 'Keep your routine consistent', 'Support a peer or join a group activity', 'Schedule time for a hobby you enjoy', 'Share your progress with someone you trust']
};

const getTodayStr = () => new Date().toISOString().split('T')[0];

const getDisplayName = (userName, userId) => {
  if (userName && userName.trim()) return userName;
  const suffix = (userId || '').slice(-4).padStart(4, '0');
  return `Anonymous#${suffix}`;
};

const isNegativeMood = (text, score) => {
  const lowerText = (text || '').toLowerCase();
  const hasNegative = NEGATIVE_KEYWORDS.some(k => lowerText.includes(k));
  const hasPositive = POSITIVE_KEYWORDS.some(k => lowerText.includes(k));

  if (typeof score === 'number' && score <= 2) return true;
  if (hasNegative && !hasPositive) return true;
  return false;
};

const buildSupportResponse = (text, score, negativeStreak) => {
  const lowerText = (text || '').toLowerCase();
  const hasNegative = NEGATIVE_KEYWORDS.some(k => lowerText.includes(k));
  const hasPositive = POSITIVE_KEYWORDS.some(k => lowerText.includes(k));

  if (typeof score === 'number' && score >= 4) {
    return { tone: 'high', message: 'Thanks for sharing. It sounds like you are feeling steady or positive today. Keep building on what is working and make time for one meaningful action that supports your goals.' };
  }
  if (typeof score === 'number' && score === 3) {
    return { tone: 'medium', message: 'Thank you for checking in. A neutral day still counts. Consider one small step that could improve how you feel over the next few hours.' };
  }
  if (hasNegative || (typeof score === 'number' && score <= 2)) {
    const extra = negativeStreak >= 2 ? 'If this low mood continues, it might help to book a counseling session for extra support.' : 'You are not alone. Try a small, gentle action that feels doable right now.';
    return { tone: 'low', message: `I hear you. That sounds heavy. ${extra} This space is here to support you, not to replace professional care.` };
  }
  return { tone: hasPositive ? 'high' : 'medium', message: 'Thanks for sharing your mood. Consider one small action that supports your well-being today.' };
};

export default function MoodSupportAssistant() {
  const userId = localStorage.getItem('userId');
  const userRole = localStorage.getItem('userRole');
  const userName = localStorage.getItem('userName');
  const navigate = useNavigate();

  const [moodText, setMoodText] = useState('');
  const [moodScore, setMoodScore] = useState(null);
  const [loading, setLoading] = useState(false);
  const [supportMessage, setSupportMessage] = useState('');
  const [suggestedResources, setSuggestedResources] = useState([]);
  const [counselingRecommended, setCounselingRecommended] = useState(false);
  const [history, setHistory] = useState([]);
  const [errorMessage, setErrorMessage] = useState('');
  
  const displayName = useMemo(() => getDisplayName(userName, userId), [userName, userId]);

  useEffect(() => {
    document.body.style.margin = '0';
    document.body.style.padding = '0';
    fetchHistory();

    window.scrollTo({ top: 0, behavior: 'auto' });

    const quickMood = localStorage.getItem('quickMood');
    if (quickMood && QUICK_MOOD_TO_SCORE[quickMood]) {
      setMoodScore(QUICK_MOOD_TO_SCORE[quickMood]);
    }
  }, []);

  if (userRole !== 'student') {
    return (
      <div style={styles.deniedContainer}>
        <div style={styles.deniedCard}>
          <div style={styles.deniedIconWrap}>
            <svg viewBox="0 0 24 24" aria-hidden="true" style={styles.deniedIconSvg}>
              <circle cx="12" cy="12" r="9" fill="none" stroke="currentColor" strokeWidth="2" />
              <line x1="7" y1="7" x2="17" y2="17" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
            </svg>
          </div>
          <h2 style={{ fontSize: '24px', fontWeight: 'bold', color: '#111827' }}>Access Denied</h2>
          <button onClick={() => window.location.href = '/login'} style={styles.deniedBtn}>Return to Login</button>
        </div>
      </div>
    );
  }

  const fetchHistory = async () => {
    if (!userId) return;
    try {
      const res = await axios.get(`http://localhost:5000/api/moods/${userId}?limit=7`);
      setHistory(res.data || []);
    } catch (err) {
      console.error('Error fetching mood history', err);
    }
  };

  const calculateNegativeStreak = (entries) => {
    let streak = 0;
    for (const entry of entries) {
      if (isNegativeMood(entry.moodText, entry.moodScore)) streak += 1;
      else break;
    }
    return streak;
  };

  const validateForm = () => {
    if (!moodText.trim()) { setErrorMessage('Please enter how you feel today.'); return false; }
    if (moodText.trim().length < 3) { setErrorMessage('Please write a slightly more detailed note.'); return false; }
    if (moodText.trim().length > 1000) { setErrorMessage('Your note is a bit too long. Please keep it under 1000 characters.'); return false; }
    if (!moodScore) { setErrorMessage('Please select a mood score to continue.'); return false; }
    return true;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMessage('');
    if (!validateForm()) return;

    setLoading(true);
    const recentStreak = calculateNegativeStreak(history);
    const nextStreak = isNegativeMood(moodText, moodScore) ? recentStreak + 1 : 0;
    const response = buildSupportResponse(moodText, moodScore, nextStreak);
    const counselingFlag = nextStreak >= 2;
    const resources = RESOURCES[response.tone] || RESOURCES.medium;

    try {
      const payload = { userId, entryDate: getTodayStr(), moodText: moodText.trim(), moodScore, aiResponse: response.message, suggestedResources: resources, counselingRecommended: counselingFlag, displayName };
      await axios.post('http://localhost:5000/api/moods', payload);
      setSupportMessage(response.message);
      setSuggestedResources(resources);
      setCounselingRecommended(counselingFlag);
      setMoodText('');
      setMoodScore(null);
      fetchHistory();
    } catch (err) {
      setErrorMessage(err.response?.data?.msg || 'Unable to save mood entry.');
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () => {
    if (window.confirm("Are you sure you want to log out?")) {
      localStorage.clear();
      window.location.href = '/login';
    }
  };

  const latestEntry = history[0];

  return (
    <>
      <style>{`
        .sidebar-item { padding: 15px; margin-bottom: 10px; border-radius: 8px; cursor: pointer; color: #555; font-weight: 500; transition: all 0.3s ease; }
        .sidebar-item:hover { background-color: #f0f4ff; color: #007bff; }
        .sub-item { padding: 10px 15px !important; font-size: 13px !important; margin-bottom: 5px !important; opacity: 0.8; }
        .sub-item:hover { opacity: 1; transform: translateX(5px); }
        
        .action-btn { transition: background-color 0.2s ease; }
        .action-btn:hover { background-color: #1d4ed8 !important; }
        
        /* Modern Textarea Focus */
        .modern-textarea:focus {
            border-color: #2563eb !important;
            box-shadow: 0 0 0 3px rgba(37, 99, 235, 0.1) !important;
            outline: none;
        }

        /* Pill Buttons matching the Library */
        .score-pill {
            outline: none !important;
            -webkit-tap-highlight-color: transparent;
        }
        .score-pill:hover { 
            background-color: #f9fafb !important; 
            border-color: #d1d5db !important; 
        }
        .score-pill-active:hover { 
            background-color: #1d4ed8 !important; 
            border-color: #1d4ed8 !important; 
        }
      `}</style>

      <div style={styles.dashboardContainer}>
        {/* --- LEFT SIDEBAR --- */}
        <div style={styles.sidebar}>
            <h2 style={{ color: '#007bff', marginBottom: '40px', textAlign: 'center', marginTop: 0 }}>
                UniCare
            </h2>
            <ul style={{ listStyle: 'none', padding: 0, flex: 1, margin: 0 }}>
                <li className="sidebar-item" onClick={() => navigate('/')}>🏠 Dashboard</li>
                <li className="sidebar-item" onClick={() => navigate('/appointments')}>📅 Appointments</li>
                <li className="sidebar-item" onClick={() => navigate('/wellness-dashboard')} style={{ fontWeight: '800', color: '#111827', cursor: 'pointer' }}>🌿 My Wellness Portal</li>
                <ul style={{ listStyle: 'none', paddingLeft: '20px', marginBottom: '10px' }}>
                    <li className="sidebar-item sub-item" onClick={() => navigate('/wellness')}>🎯 Goal Tracker</li>
                    <li className="sidebar-item sub-item" onClick={() => navigate('/mood')} style={{ backgroundColor: '#eff6ff', color: '#1d4ed8', fontWeight: 'bold', opacity: 1 }}>🎭 Mood Support</li>
                    <li className="sidebar-item sub-item" onClick={() => navigate('/resources')}>📚 Health Library</li>
                    <li className="sidebar-item sub-item" onClick={() => navigate('/saved')}>🔖 Saved Files</li>
                </ul>
                <li className="sidebar-item" onClick={() => navigate('/settings')}>⚙️ Settings</li>
            </ul>
            <ul style={{ listStyle: 'none', padding: 0, flex: 0, margin: 0 }}>
                <li className="sidebar-item" onClick={handleLogout} style={{ color: '#dc3545' }}>🚪 Logout</li>
            </ul>
        </div>

        <div style={styles.mainWrapper}>
          <main style={styles.mainContent}>
            
            {/* --- HEADER --- */}
            <div style={styles.headerSection}>
              <div>
                <div style={styles.sessionBadge}>
                   <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{marginRight: '6px'}}><rect x="3" y="11" width="18" height="11" rx="2" ry="2"></rect><path d="M7 11V7a5 5 0 0 1 10 0v4"></path></svg>
                   PRIVATE CHECK-IN • {displayName}
                </div>
                <h1 style={styles.mainTitle}>Mood Support Assistant</h1>
                <p style={styles.subTitle}>Share how you feel today. The assistant offers personalized guidance and resources tailored to your well-being.</p>
              </div>
              <div style={styles.headerButtons}>
                <Link to="/mood/history" style={styles.secondaryBtn}>View History</Link>
              </div>
            </div>

            <section style={styles.grid}>
              {/* --- FORM CARD --- */}
              <div style={styles.card}>
                <h3 style={styles.cardTitle}>How are you feeling today? <span style={{color: '#ef4444'}}>*</span></h3>
                <p style={styles.cardSubtitle}>Enter a quick note and choose a score.</p>

                <form onSubmit={handleSubmit}>
                  <textarea
                    className="modern-textarea"
                    style={errorMessage && !moodText.trim() ? { ...styles.textarea, ...styles.inputError } : styles.textarea}
                    placeholder="Write a short note about your mood..."
                    value={moodText}
                    onChange={(e) => {
                      setMoodText(e.target.value);
                      if (errorMessage) setErrorMessage('');
                    }}
                  />
                  
                  <div style={styles.scoreRow}>
                    <span style={styles.scoreLabel}>Mood score <span style={{color: '#ef4444'}}>*</span></span>
                    
                    <div style={styles.scoreButtons}>
                      {[1, 2, 3, 4, 5].map(value => {
                        const isActive = moodScore === value;
                        return (
                            <button
                                key={value}
                                type="button"
                                className={isActive ? "score-pill-active" : "score-pill"}
                                onClick={() => { setMoodScore(value); if (errorMessage) setErrorMessage(''); }}
                                style={{
                                    ...styles.scoreBtn,
                                    ...(isActive ? styles.scoreBtnActive : {}),
                                    ...(errorMessage && !moodScore ? styles.scoreBtnError : {})
                                }}
                            >
                            <span style={styles.scoreEmoji}>{SCORE_ICONS[value]}</span>
                            {value}
                            </button>
                        );
                      })}
                      <button type="button" onClick={() => setMoodScore(null)} style={styles.scoreClearBtn}>Clear</button>
                    </div>

                    {moodScore ? (
                      <div style={styles.scoreMeaning}><strong>{SCORE_DETAILS[moodScore]?.label}:</strong> {SCORE_DETAILS[moodScore]?.meaning}</div>
                    ) : (
                      <div style={styles.scoreMeaningHint}>Pick a score to see what it means.</div>
                    )}
                  </div>

                  {errorMessage && <div style={styles.errorText}>⚠️ {errorMessage}</div>}

                  <button type="submit" className="action-btn" style={styles.primaryBtn} disabled={loading}>
                    {loading ? 'Saving...' : 'Generate Support'}
                  </button>
                </form>
              </div>

              {/* --- SUPPORT GUIDANCE CARD --- */}
              <div style={styles.card}>
                <h3 style={styles.cardTitle}>Supportive Guidance</h3>
                <p style={styles.cardSubtitle}>A gentle response based on your mood.</p>

                {/* Styled like the "Our Mission" block from the About page */}
                <div style={styles.responseBox}>
                    <div style={styles.responseIconWrapper}>
                        <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"></path></svg>
                    </div>
                    <div>
                        <h4 style={styles.responseHeader}>Assistant Response</h4>
                        {supportMessage ? (
                            <p style={styles.responseText}>{supportMessage}</p>
                        ) : (
                            <p style={styles.placeholderText}>Share your mood on the left to receive a personalized, supportive response.</p>
                        )}
                    </div>
                </div>

                <div style={styles.resourceSection}>
                  <h4 style={styles.resourceTitle}>Suggested Resources</h4>
                  {suggestedResources.length > 0 ? (
                    <ul style={styles.resourceList}>
                      {suggestedResources.map((item, idx) => (
                          <li key={idx} style={styles.resourceItem}>
                              <span style={styles.bulletIcon}>•</span> {item}
                          </li>
                      ))}
                    </ul>
                  ) : (
                    <p style={{...styles.placeholderText, marginLeft: '4px'}}>Resources will appear here after your check-in.</p>
                  )}
                </div>

                {counselingRecommended && (
                  <div style={styles.counselingBox}>
                    <div style={styles.counselingIcon}>
                      <svg viewBox="0 0 24 24" aria-hidden="true" style={styles.counselingIconSvg}>
                        <path d="M12 3l9 16H3l9-16z" fill="none" stroke="currentColor" strokeWidth="2" strokeLinejoin="round" />
                        <line x1="12" y1="9" x2="12" y2="13" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
                        <circle cx="12" cy="16" r="1" fill="currentColor" />
                      </svg>
                    </div>
                    <div>
                        <strong style={{color: '#991b1b'}}>Consider booking a counseling session.</strong>
                        <p style={{ margin: '4px 0 0 0', color: '#b91c1c' }}>If low moods persist, professional support can help. You deserve care.</p>
                    </div>
                  </div>
                )}
              </div>
            </section>

            {/* --- RECENT HISTORY CARD --- */}
            {latestEntry && (
              <section style={styles.recentSection}>
                <h3 style={styles.cardTitle}>Most Recent Check-In</h3>
                <div style={styles.recentCard}>
                  <div style={styles.recentDataBlock}>
                      <p style={styles.recentLabel}>Date</p>
                      <p style={styles.recentValue}>{latestEntry.entryDate}</p>
                  </div>
                  <div style={styles.recentDataBlock}>
                      <p style={styles.recentLabel}>Score</p>
                      <p style={styles.recentValue}>
                        {latestEntry.moodScore ? (<span style={styles.recentScoreWrap}>{SCORE_ICONS[latestEntry.moodScore]} {latestEntry.moodScore} / 5</span>) : '—'}
                      </p>
                  </div>
                  <div style={{ gridColumn: '1 / -1' }}>
                      <p style={styles.recentLabel}>Note</p>
                      <p style={styles.recentNoteValue}>"{latestEntry.moodText}"</p>
                  </div>
                </div>
              </section>
            )}

          </main>
        </div>
      </div>
    </>
  );
}

const styles = {
  // bg-gray-50
  dashboardContainer: { display: 'flex', minHeight: '100vh', width: '100%', fontFamily: "'Inter', 'Segoe UI', Roboto, sans-serif", backgroundColor: '#f9fafb' },
  sidebar: { width: '250px', backgroundColor: '#ffffff', padding: '20px', boxShadow: '2px 0 10px rgba(0, 0, 0, 0.05)', display: 'flex', flexDirection: 'column', position: 'fixed', top: 0, left: 0, bottom: 0, boxSizing: 'border-box', zIndex: 1000, overflowY: 'auto' },
  mainWrapper: { flex: 1, marginLeft: '250px', boxSizing: 'border-box' },
  mainContent: { maxWidth: '1100px', margin: '0 auto', padding: '48px 32px 96px 32px' },

  // Header styles matching Counsellor / About page
  headerSection: { display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: '24px', flexWrap: 'wrap', marginBottom: '48px' },
  sessionBadge: { display: 'flex', alignItems: 'center', color: '#4b5563', fontSize: '12px', fontWeight: '700', textTransform: 'uppercase', letterSpacing: '1px', marginBottom: '16px' },
  mainTitle: { fontSize: '36px', fontWeight: '800', color: '#111827', marginBottom: '16px', fontFamily: "Georgia, serif" },
  subTitle: { color: '#4b5563', fontSize: '16px', margin: 0, maxWidth: '600px', lineHeight: '1.5' },
  
  headerButtons: { display: 'flex', gap: '12px', marginTop: '10px' },
  secondaryBtn: { backgroundColor: '#ffffff', color: '#374151', padding: '10px 20px', borderRadius: '12px', fontWeight: '600', fontSize: '14px', textDecoration: 'none', border: '1px solid #e5e7eb', boxShadow: '0 1px 2px rgba(0,0,0,0.05)', transition: 'all 0.2s' },
  
  // Cards layout
  grid: { display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(400px, 1fr))', gap: '32px' },
  
  card: { backgroundColor: '#ffffff', borderRadius: '24px', padding: '32px', border: '1px solid #f3f4f6', boxShadow: '0 1px 2px 0 rgba(0, 0, 0, 0.05)' },
  cardTitle: { fontSize: '20px', fontWeight: '800', color: '#111827', marginBottom: '8px', fontFamily: "Georgia, serif" },
  cardSubtitle: { fontSize: '14px', color: '#6b7280', marginBottom: '24px' },
  
  // Form Elements
  textarea: { width: '100%', minHeight: '140px', borderRadius: '12px', border: '1px solid #e5e7eb', backgroundColor: '#ffffff', padding: '16px', fontSize: '15px', color: '#111827', fontFamily: "'Inter', sans-serif", marginBottom: '8px', resize: 'vertical', boxSizing: 'border-box', boxShadow: '0 1px 2px 0 rgba(0, 0, 0, 0.05)', transition: 'border-color 0.2s' },
  inputError: { border: '1px solid #ef4444', backgroundColor: '#fef2f2' },
  errorText: { color: '#dc2626', fontWeight: '600', fontSize: '13px', marginTop: '16px', display: 'flex', alignItems: 'center', gap: '4px' },
  
  scoreRow: { display: 'flex', flexDirection: 'column', gap: '12px', marginTop: '16px' },
  scoreLabel: { fontSize: '13px', fontWeight: '600', color: '#374151' },
  scoreButtons: { display: 'flex', gap: '10px', flexWrap: 'wrap' },
  
  // Pill Buttons matching Resource Library
  scoreBtn: { 
      backgroundColor: '#ffffff', 
      borderWidth: '1px', borderStyle: 'solid', borderColor: '#e5e7eb', 
      borderRadius: '9999px', 
      padding: '8px 18px', 
      fontWeight: '500', 
      cursor: 'pointer', 
      color: '#4b5563', 
      display: 'flex', alignItems: 'center', gap: '8px', 
      transition: 'all 0.2s ease', 
      fontSize: '14px',
      boxShadow: '0 1px 2px rgba(0,0,0,0.05)'
  },
  scoreBtnActive: { 
      backgroundColor: '#2563eb', 
      borderColor: '#2563eb', 
      color: '#ffffff',
      fontWeight: '600',
      boxShadow: '0 4px 12px rgba(37, 99, 235, 0.25)' 
  },
  scoreBtnError: { borderColor: '#ef4444' },
  scoreEmoji: { display: 'flex', alignItems: 'center' },
  scoreIcon: { width: '16px', height: '16px', display: 'block' },
  scoreClearBtn: { backgroundColor: 'transparent', border: 'none', borderRadius: '999px', padding: '8px 12px', fontWeight: '500', cursor: 'pointer', color: '#9ca3af', fontSize: '13px' },

  scoreMeaning: { marginTop: '8px', color: '#4b5563', fontSize: '13px', lineHeight: '1.5' },
  scoreMeaningHint: { marginTop: '8px', color: '#9ca3af', fontSize: '13px', fontStyle: 'italic' },

  primaryBtn: { 
      backgroundColor: '#2563eb', 
      color: '#fff', 
      border: 'none', 
      padding: '14px 24px', 
      borderRadius: '12px', 
      fontWeight: '600', 
      fontSize: '15px', 
      cursor: 'pointer', 
      marginTop: '24px', 
      width: '100%', 
      transition: 'all 0.2s', 
      boxShadow: '0 1px 2px 0 rgba(0, 0, 0, 0.05)' 
  },

  // --- STYLED LIKE THE "OUR MISSION" BOX ---
  responseBox: { 
      backgroundColor: '#eff6ff', // bg-blue-50
      borderRadius: '16px', 
      padding: '24px', 
      border: '1px solid #bfdbfe', // border-blue-200
      display: 'flex',
      gap: '16px',
      alignItems: 'flex-start'
  },
  responseIconWrapper: {
      backgroundColor: '#2563eb', // Solid Blue icon box
      color: '#ffffff',
      width: '40px',
      height: '40px',
      borderRadius: '10px',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      flexShrink: 0
  },
  responseHeader: { margin: '0 0 8px 0', fontSize: '16px', fontWeight: '700', color: '#1e3a8a' }, // text-blue-900
  responseText: { color: '#1e3a8a', fontSize: '14px', lineHeight: '1.6', margin: 0 },
  placeholderText: { color: '#60a5fa', fontSize: '14px', margin: 0 }, // text-blue-400
  
  resourceSection: { marginTop: '32px' },
  resourceTitle: { fontSize: '14px', fontWeight: '700', color: '#111827', margin: '0 0 12px 0' },
  resourceList: { margin: 0, padding: 0, listStyle: 'none', display: 'flex', flexDirection: 'column', gap: '10px' },
  resourceItem: { color: '#4b5563', fontSize: '14px', lineHeight: '1.5', display: 'flex', alignItems: 'flex-start', gap: '8px' },
  bulletIcon: { color: '#2563eb', fontSize: '16px', lineHeight: '1' },
  
  counselingBox: { marginTop: '24px', backgroundColor: '#fef2f2', border: '1px solid #fecaca', borderRadius: '16px', padding: '20px', display: 'flex', gap: '16px', alignItems: 'flex-start' },
  counselingIcon: { width: '24px', height: '24px', color: '#b91c1c', display: 'flex', alignItems: 'center', justifyContent: 'center' },
  counselingIconSvg: { width: '20px', height: '20px', display: 'block' },

  // Recent Section
  recentSection: { marginTop: '48px' },
  recentCard: { marginTop: '16px', display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px', backgroundColor: '#ffffff', padding: '24px', borderRadius: '20px', border: '1px solid #f3f4f6', boxShadow: '0 1px 2px 0 rgba(0, 0, 0, 0.05)' },
  recentDataBlock: { display: 'flex', flexDirection: 'column', gap: '4px' },
  recentLabel: { fontSize: '12px', textTransform: 'uppercase', letterSpacing: '1px', color: '#9ca3af', fontWeight: '600', margin: 0 },
  recentValue: { fontSize: '15px', color: '#111827', fontWeight: '700', margin: 0 },
  recentScoreWrap: { display: 'inline-flex', alignItems: 'center', gap: '8px' },
  recentNoteValue: { fontSize: '15px', color: '#4b5563', fontWeight: '500', margin: '4px 0 0 0', fontStyle: 'italic' },

  deniedContainer: { display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '100vh', backgroundColor: '#f9fafb' },
  deniedCard: { backgroundColor: 'white', padding: '40px', borderRadius: '24px', boxShadow: '0 4px 6px rgba(0,0,0,0.05)', textAlign: 'center', border: '1px solid #f3f4f6' },
  deniedIconWrap: { width: '52px', height: '52px', borderRadius: '18px', margin: '0 auto 15px auto', display: 'flex', alignItems: 'center', justifyContent: 'center', backgroundColor: '#fef2f2', color: '#dc2626' },
  deniedIconSvg: { width: '26px', height: '26px', display: 'block' },
  deniedBtn: { marginTop: '20px', width: '100%', backgroundColor: '#2563eb', color: 'white', padding: '12px', borderRadius: '12px', fontWeight: '600', cursor: 'pointer', border: 'none' }
};
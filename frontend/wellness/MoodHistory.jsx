// Add score details mapping for mood label and meaning
const SCORE_DETAILS = {
  1: { label: 'Very Low', meaning: 'Feeling overwhelmed or drained; focus on one grounding breath and take it easy.' },
  2: { label: 'Low', meaning: 'You are carrying weight right now; a restful break or gentle movement can help.' },
  3: { label: 'Okay', meaning: 'Things feel neutral today; consider one small win to swing momentum forward.' },
  4: { label: 'Good', meaning: 'You are steady; keep building on what is working and celebrate the progress.' },
  5: { label: 'Great', meaning: 'Energy is high; share the good energy and stay connected to your support circle.' }
};

import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { Link, useNavigate } from 'react-router-dom';

export default function MoodHistory() {
  const userId = localStorage.getItem('userId');
  const userRole = localStorage.getItem('userRole');
  const navigate = useNavigate();

  const [entries, setEntries] = useState([]);
  const [loading, setLoading] = useState(false);
  const [hoveredEntryId, setHoveredEntryId] = useState(null);

  // User-facing expressions are kept as emojis since they act as data points
  const SCORE_EMOJIS = { 1: '😔', 2: '🙁', 3: '😐', 4: '🙂', 5: '😄' };

  useEffect(() => {
    document.body.style.margin = '0';
    document.body.style.padding = '0';
    fetchEntries();
  }, []);

  if (userRole !== 'student') {
    return (
      <div style={styles.deniedContainer}>
        <div style={styles.deniedCard}>
          <svg xmlns="http://www.w3.org/2000/svg" width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="#ef4444" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{marginBottom: '15px'}}><circle cx="12" cy="12" r="10"/><line x1="4.93" y1="4.93" x2="19.07" y2="19.07"/></svg>
          <h2 style={{ fontSize: '24px', fontWeight: 'bold', color: '#111827' }}>Access Denied</h2>
          <button onClick={() => window.location.href = '/login'} style={styles.deniedBtn}>Return to Login</button>
        </div>
      </div>
    );
  }

  const fetchEntries = async () => {
    if (!userId) return;
    setLoading(true);
    try {
      const res = await axios.get(`http://localhost:5000/api/moods/${userId}`);
      setEntries(res.data || []);
    } catch (err) {
      console.error('Error fetching mood entries', err);
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

  // --- STAT CALCULATIONS ---
  const scoredEntries = entries.filter(entry => typeof entry.moodScore === 'number');
  const totalEntries = entries.length;
  
  const averageScore = scoredEntries.length
    ? (scoredEntries.reduce((sum, entry) => sum + entry.moodScore, 0) / scoredEntries.length).toFixed(1)
    : '—';
    
  const lastEntryDate = entries[0]?.entryDate || '—';
  
  const lowCount = scoredEntries.filter(entry => entry.moodScore <= 2).length;
  const neutralCount = scoredEntries.filter(entry => entry.moodScore === 3).length;
  const highCount = scoredEntries.filter(entry => entry.moodScore >= 4).length;

  let avgLabel = "No Data";
  if (averageScore !== '—') {
      const avg = parseFloat(averageScore);
      if (avg < 2.5) {
          avgLabel = <span style={{display: 'flex', alignItems: 'center'}}>Trending Low <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" style={{marginLeft: '4px'}}><line x1="12" y1="5" x2="12" y2="19"/><polyline points="19 12 12 19 5 12"/></svg></span>;
      } else if (avg < 3.5) {
          avgLabel = <span style={{display: 'flex', alignItems: 'center'}}>Trending Neutral <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" style={{marginLeft: '4px'}}><line x1="5" y1="12" x2="19" y2="12"/><polyline points="12 5 19 12 12 19"/></svg></span>;
      } else {
          avgLabel = <span style={{display: 'flex', alignItems: 'center'}}>Trending Positive <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" style={{marginLeft: '4px'}}><line x1="12" y1="19" x2="12" y2="5"/><polyline points="5 12 12 5 19 12"/></svg></span>;
      }
  }

  return (
    <>
      <style>{`
        .sidebar-item { padding: 15px; margin-bottom: 10px; border-radius: 8px; cursor: pointer; color: #4b5563; font-weight: 500; transition: all 0.3s ease; }
        .sidebar-item:hover { background-color: #f3f4f6; color: #111827; }
        .sub-item { padding: 10px 15px !important; font-size: 13px !important; margin-bottom: 5px !important; opacity: 0.8; }
        .sub-item:hover { opacity: 1; transform: translateX(5px); }
        .action-btn { transition: background-color 0.2s ease; }
        .action-btn:hover { background-color: #1d4ed8 !important; }
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
                <li className="sidebar-item" style={{ fontWeight: '800', color: '#111827', cursor: 'pointer' }} onClick={() => navigate('/wellness-dashboard')}>🌿 My Wellness Portal</li>
                <ul style={{ listStyle: 'none', paddingLeft: '20px', marginBottom: '10px' }}>
                    <li className="sidebar-item sub-item" onClick={() => navigate('/wellness')}>🎯 Goal Tracker</li>
                    <li className="sidebar-item sub-item" onClick={() => navigate('/mood')} style={{ backgroundColor: '#eff6ff', color: '#1d4ed8', fontWeight: 'bold', opacity: 1 }}>🎭 Mood Support</li>
                    <li className="sidebar-item sub-item" onClick={() => navigate('/resources')}>📚 Health Library</li>
                    <li className="sidebar-item sub-item" onClick={() => navigate('/saved')}>🔖 Saved Files</li>
                </ul>
                <li className="sidebar-item" onClick={() => navigate('/settings')}>⚙️ Settings</li>
            </ul>
            <ul style={{ listStyle: 'none', padding: 0, flex: 0, margin: 0 }}>
                <li className="sidebar-item" onClick={handleLogout} style={{ color: '#dc2626' }}>🚪 Logout</li>
            </ul>
        </div>

        <div style={styles.mainWrapper}>
          <main style={styles.mainContent}>
            
            {/* Header Section */}
            <div style={styles.headerSection}>
              <div>
                <h1 style={styles.mainTitle}>Mood History</h1>
                <p style={styles.subTitle}>Review your recent emotional check-ins and track your progress.</p>
              </div>
              <div style={styles.headerButtons}>
                <Link to="/mood" style={styles.historyBtn}>
                    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{marginRight: '6px', verticalAlign: 'text-bottom'}}><line x1="19" y1="12" x2="5" y2="12"/><polyline points="12 19 5 12 12 5"/></svg>
                    Back to Check-in
                </Link>
              </div>
            </div>

            {/* --- SUMMARY CARDS --- */}
            <section style={styles.summaryGrid}>
              <div style={styles.summaryCard}>
                <div style={{...styles.statIconWrap, background: '#eff6ff', color: '#2563eb'}}>
                  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M14.5 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7.5L14.5 2z"/><polyline points="14 2 14 8 20 8"/><line x1="16" y1="13" x2="8" y2="13"/><line x1="16" y1="17" x2="8" y2="17"/><line x1="10" y1="9" x2="8" y2="9"/></svg>
                </div>
                <div>
                  <p style={styles.summaryLabel}>Total Entries</p>
                  <h2 style={styles.summaryValue}>{totalEntries}</h2>
                  <p style={styles.summarySubtext}>Lifetime check-ins</p>
                </div>
              </div>
              <div style={styles.summaryCard}>
                <div style={{...styles.statIconWrap, background: '#faf5ff', color: '#9333ea'}}>
                  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="20" x2="18" y2="10"/><line x1="12" y1="20" x2="12" y2="4"/><line x1="6" y1="20" x2="6" y2="14"/></svg>
                </div>
                <div>
                  <p style={styles.summaryLabel}>Average Score</p>
                  <h2 style={styles.summaryValue}>{averageScore}</h2>
                  <div style={{...styles.summarySubtext, color: averageScore < 3 ? '#ef4444' : averageScore > 3 ? '#10b981' : '#64748b'}}>{avgLabel}</div>
                </div>
              </div>
              <div style={styles.summaryCard}>
                <div style={{...styles.statIconWrap, background: '#f0fdf4', color: '#16a34a'}}>
                  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="4" width="18" height="18" rx="2" ry="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></svg>
                </div>
                <div>
                  <p style={styles.summaryLabel}>Last Check-In</p>
                  <h2 style={{...styles.summaryValue, fontSize: '18px', paddingTop: '6px'}}>{lastEntryDate}</h2>
                  <p style={styles.summarySubtext}>Most recent update</p>
                </div>
              </div>
              <div style={styles.summaryCard}>
                <div style={{...styles.statIconWrap, background: '#fffbeb', color: '#d97706'}}>
                  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21.21 15.89A10 10 0 1 1 8 2.83"/><path d="M22 12A10 10 0 0 0 12 2v10z"/></svg>
                </div>
                <div>
                  <p style={styles.summaryLabel}>Mood Spread</p>
                  <h2 style={{...styles.summaryValue, fontSize: '20px', paddingTop: '5px'}}>
                    <span style={{color: '#ef4444'}}>{lowCount}</span> <span style={{color: '#d1d5db'}}>/</span> <span style={{color: '#f59e0b'}}>{neutralCount}</span> <span style={{color: '#d1d5db'}}>/</span> <span style={{color: '#10b981'}}>{highCount}</span>
                  </h2>
                  <p style={styles.summarySubtext}>Low / Neutral / High</p>
                </div>
              </div>
            </section>

            {/* --- LIST SECTION --- */}
            <section style={styles.card}>
              {loading ? (
                <p style={styles.placeholderText}>Loading entries...</p>
              ) : entries.length === 0 ? (
                <p style={styles.placeholderText}>No mood entries yet. Start with a check-in.</p>
              ) : (
                <div style={styles.table}>
                  
                  {/* Header Row */}
                  <div style={styles.tableHeader}>
                    <span>Date</span>
                    <span>Score</span>
                    <span>Note</span>
                  </div>
                  
                  {/* Data Rows */}
                  {entries.map(entry => (
                    <div key={entry._id} style={styles.entryContainer}>
                      <div style={styles.primaryRow}>
                        <span style={{ fontWeight: '600', color: '#111827' }}>{entry.entryDate}</span>
                        <span
                          style={{
                            ...styles.scoreCell,
                            transform: hoveredEntryId === entry._id ? 'translateY(-2px) scale(1.06)' : 'translateY(0) scale(1)'
                          }}
                          onMouseEnter={() => setHoveredEntryId(entry._id)}
                          onMouseLeave={() => setHoveredEntryId(null)}
                        >
                          <span style={styles.scoreEmoji}>{entry.moodScore ? SCORE_EMOJIS[entry.moodScore] : '—'}</span>
                          {entry.moodScore || '—'}
                        </span>
                        <span style={{ color: '#4b5563' }}>{entry.moodText || <em style={{color: '#9ca3af'}}>No note provided</em>}</span>
                      </div>

                      {/* Expanded Details */}
                      {(entry.moodScore || entry.aiResponse || (entry.suggestedResources && entry.suggestedResources.length > 0)) && (
                        <div style={styles.detailsCard}>
                          {entry.moodScore && (
                            <div>
                              <strong style={{ color: '#111827' }}>Mood Level:</strong> {SCORE_DETAILS[entry.moodScore]?.label || '—'} 
                              <span style={{ color: '#6b7280', marginLeft: '6px' }}>({SCORE_DETAILS[entry.moodScore]?.meaning})</span>
                            </div>
                          )}
                          {entry.aiResponse && (
                            <div>
                              <strong style={{ color: '#111827' }}>Assistant Guidance:</strong> {entry.aiResponse}
                            </div>
                          )}
                          {Array.isArray(entry.suggestedResources) && entry.suggestedResources.length > 0 && (
                            <div>
                              <strong style={{ color: '#111827' }}>Suggested Resources:</strong>
                              <ul style={styles.resourcesList}>
                                {entry.suggestedResources.map((res, idx) => (
                                  <li key={idx} style={{ marginBottom: '4px' }}>{res}</li>
                                ))}
                              </ul>
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </section>
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

  headerSection: { display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: '24px', flexWrap: 'wrap', marginBottom: '32px' },
  mainTitle: { fontSize: '36px', fontWeight: '800', color: '#111827', margin: '0 0 16px 0', fontFamily: "Georgia, serif" },
  subTitle: { color: '#4b5563', fontSize: '16px', margin: 0, maxWidth: '600px', lineHeight: '1.5' },
  headerButtons: { display: 'flex', gap: '12px' },
  historyBtn: { display: 'inline-flex', alignItems: 'center', backgroundColor: '#ffffff', color: '#374151', padding: '10px 20px', borderRadius: '12px', fontWeight: '600', fontSize: '14px', textDecoration: 'none', border: '1px solid #e5e7eb', boxShadow: '0 1px 2px rgba(0,0,0,0.05)', transition: 'all 0.2s' },

  summaryGrid: { display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '24px', marginBottom: '32px' },
  summaryCard: { backgroundColor: '#ffffff', borderRadius: '24px', padding: '24px', border: '1px solid #f3f4f6', boxShadow: '0 1px 2px 0 rgba(0, 0, 0, 0.05)', display: 'flex', alignItems: 'center', gap: '16px' },
  statIconWrap: { width: '56px', height: '56px', borderRadius: '16px', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 },
  summaryLabel: { margin: 0, fontSize: '12px', textTransform: 'uppercase', letterSpacing: '0.05em', color: '#6b7280', fontWeight: '700' },
  summaryValue: { margin: '4px 0 0 0', fontSize: '28px', fontWeight: '800', color: '#111827', lineHeight: 1 },
  summarySubtext: { margin: '6px 0 0 0', fontSize: '13px', color: '#9ca3af', fontWeight: '500' },

  card: { backgroundColor: '#ffffff', borderRadius: '24px', padding: '32px', border: '1px solid #f3f4f6', boxShadow: '0 1px 2px 0 rgba(0, 0, 0, 0.05)' },
  table: { display: 'flex', flexDirection: 'column' },
  
  tableHeader: { display: 'grid', gridTemplateColumns: '140px 120px 1fr', gap: '16px', fontWeight: '700', color: '#6b7280', fontSize: '13px', textTransform: 'uppercase', letterSpacing: '0.05em', paddingBottom: '16px', borderBottom: '1px solid #f3f4f6' },
  entryContainer: { display: 'flex', flexDirection: 'column', padding: '24px 0', borderBottom: '1px solid #f3f4f6' },
  primaryRow: { display: 'grid', gridTemplateColumns: '140px 120px 1fr', gap: '16px', color: '#111827', fontSize: '15px', alignItems: 'start' },
  
  detailsCard: { marginTop: '16px', padding: '20px', backgroundColor: '#f9fafb', borderRadius: '16px', fontSize: '14px', color: '#4b5563', display: 'flex', flexDirection: 'column', gap: '12px', border: '1px solid #e5e7eb' },
  resourcesList: { margin: '8px 0 0 24px', padding: 0, color: '#2563eb' },

  scoreCell: { display: 'inline-flex', alignItems: 'center', gap: '8px', transition: 'transform 0.2s ease', cursor: 'default' },
  scoreEmoji: { fontSize: '20px' },
  placeholderText: { color: '#6b7280', fontSize: '15px', textAlign: 'center', padding: '40px 0' },

  deniedContainer: { display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '100vh', backgroundColor: '#f9fafb' },
  deniedCard: { backgroundColor: 'white', padding: '40px', borderRadius: '24px', boxShadow: '0 4px 6px rgba(0,0,0,0.05)', textAlign: 'center', border: '1px solid #f3f4f6', display: 'flex', flexDirection: 'column', alignItems: 'center' },
  deniedBtn: { marginTop: '20px', width: '100%', backgroundColor: '#2563eb', color: 'white', padding: '12px', borderRadius: '12px', fontWeight: '600', cursor: 'pointer', border: 'none' }
};
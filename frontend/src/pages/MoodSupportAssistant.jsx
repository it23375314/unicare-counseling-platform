import React, { useEffect, useMemo, useState, useRef } from 'react';
import axios from 'axios';
import { Link, useNavigate } from 'react-router-dom';

const SCORE_DETAILS = {
  1: { label: 'Very Low', meaning: 'Feeling overwhelmed or drained; focus on one grounding breath and take it easy.' },
  2: { label: 'Low', meaning: 'You are carrying weight right now; a restful break or gentle movement can help.' },
  3: { label: 'Okay', meaning: 'Things feel neutral today; consider one small win to swing momentum forward.' },
  4: { label: 'Good', meaning: 'You are steady; keep building on what is working and celebrate the progress.' },
  5: { label: 'Great', meaning: 'Energy is high; share the good energy and stay connected to your support circle.' }
};

const NEGATIVE_KEYWORDS = ['sad', 'down', 'anxious', 'stress', 'stressed', 'depressed', 'lonely', 'tired', 'overwhelmed', 'angry', 'hopeless', 'panic', 'burnout', 'worried'];
const POSITIVE_KEYWORDS = ['good', 'great', 'happy', 'proud', 'calm', 'excited', 'relieved', 'hopeful'];
const QUICK_MOOD_TO_SCORE = { 'Very Low': 1, Low: 2, Okay: 3, Good: 4, Great: 5 };

const SCORE_ICONS = {
  1: <svg viewBox="0 0 24 24" style={{width:'16px', height:'16px', display:'block'}}><circle cx="12" cy="12" r="9" fill="none" stroke="currentColor" strokeWidth="2" /><circle cx="9" cy="10" r="1" fill="currentColor" /><circle cx="15" cy="10" r="1" fill="currentColor" /><path d="M8.5 16c1.5-1.5 5.5-1.5 7 0" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" /></svg>,
  2: <svg viewBox="0 0 24 24" style={{width:'16px', height:'16px', display:'block'}}><circle cx="12" cy="12" r="9" fill="none" stroke="currentColor" strokeWidth="2" /><circle cx="9" cy="10" r="1" fill="currentColor" /><circle cx="15" cy="10" r="1" fill="currentColor" /><path d="M9 16c1.5-1 4.5-1 6 0" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" /></svg>,
  3: <svg viewBox="0 0 24 24" style={{width:'16px', height:'16px', display:'block'}}><circle cx="12" cy="12" r="9" fill="none" stroke="currentColor" strokeWidth="2" /><circle cx="9" cy="10" r="1" fill="currentColor" /><circle cx="15" cy="10" r="1" fill="currentColor" /><path d="M9 16h6" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" /></svg>,
  4: <svg viewBox="0 0 24 24" style={{width:'16px', height:'16px', display:'block'}}><circle cx="12" cy="12" r="9" fill="none" stroke="currentColor" strokeWidth="2" /><circle cx="9" cy="10" r="1" fill="currentColor" /><circle cx="15" cy="10" r="1" fill="currentColor" /><path d="M9 15c1.5 1 4.5 1 6 0" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" /></svg>,
  5: <svg viewBox="0 0 24 24" style={{width:'16px', height:'16px', display:'block'}}><circle cx="12" cy="12" r="9" fill="none" stroke="currentColor" strokeWidth="2" /><circle cx="9" cy="10" r="1" fill="currentColor" /><circle cx="15" cy="10" r="1" fill="currentColor" /><path d="M8.5 15c1.5 2 5.5 2 7 0" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" /></svg>
};

// --- RICH DETAILED RESOURCES ---
const RESOURCES = {
  low: [
    { title: 'The 5-4-3-2-1 Grounding Method', desc: 'Look around and name 5 things you can see, 4 you can touch, 3 you can hear, 2 you can smell, and 1 you can taste. This instantly shifts focus away from anxiety.' },
    { title: 'Box Breathing Technique', desc: 'Inhale deeply for 4 seconds, hold for 4 seconds, exhale for 4 seconds, and hold empty for 4 seconds. Repeat 3 times to lower your heart rate.' },
    { title: 'Campus Counseling Drop-in', desc: 'The university wellness center has open hours from 9 AM - 4 PM. You can walk in without an appointment for immediate peer support.' }
  ],
  medium: [
    { title: 'The 10-Minute Rule', desc: 'If a task feels overwhelming, commit to working on it for just 10 minutes. Getting started is the hardest part.' },
    { title: 'Hydration and Posture Reset', desc: 'Drink a full glass of water and stretch your shoulders. Physical tension heavily contributes to mental brain-fog.' }
  ],
  high: [
    { title: 'Gratitude Logging', desc: 'Take 2 minutes to write down three specific things that went well today to reinforce positive thinking habits.' },
    { title: 'Share Your Win', desc: 'Positive energy multiplies when shared. Text a friend or family member about your good day!' }
  ]
};

const getTodayStr = () => new Date().toISOString().split('T')[0];
const getDisplayName = (userName, userId) => userName && userName.trim() ? userName : `Anonymous#${(userId || '').slice(-4).padStart(4, '0')}`;

const isNegativeMood = (text, score) => {
  const lowerText = (text || '').toLowerCase();
  if (typeof score === 'number' && score <= 2) return true;
  if (NEGATIVE_KEYWORDS.some(k => lowerText.includes(k)) && !POSITIVE_KEYWORDS.some(k => lowerText.includes(k))) return true;
  return false;
};

const buildSupportResponse = (text, score, negativeStreak) => {
  const hasNegative = isNegativeMood(text, score);
  if (typeof score === 'number' && score >= 4) return { tone: 'high' };
  if (typeof score === 'number' && score === 3) return { tone: 'medium' };
  if (hasNegative) return { tone: 'low' };
  return { tone: 'medium' };
};

// Formatter to turn **text** into styled bold HTML
const formatBotText = (text) => {
  if (!text) return null;
  const parts = text.split(/(\*\*.*?\*\*)/g);
  return parts.map((part, index) => {
      if (part.startsWith('**') && part.endsWith('**')) {
          return <strong key={index} style={{ color: '#1e3a8a', fontWeight: '800' }}>{part.slice(2, -2)}</strong>;
      }
      return <span key={index}>{part}</span>;
  });
};

export default function MoodSupportAssistant() {
  const userId = localStorage.getItem('userId');
  const userRole = localStorage.getItem('userRole') || 'student';
  const userName = localStorage.getItem('userName') || 'Current Student';
  const navigate = useNavigate();

  const displayName = useMemo(() => getDisplayName(userName, userId), [userName, userId]);

  const [messages, setMessages] = useState([
    { id: '1', role: 'bot', type: 'text', content: `Hi ${displayName}! I'm your UniCare Mood Assistant.` },
    { id: '2', role: 'bot', type: 'text', content: 'How are you feeling today? Please type a quick note below and select a mood score.' }
  ]);
  const [inputText, setInputText] = useState('');
  const [inputScore, setInputScore] = useState(null);
  
  const [loading, setLoading] = useState(false);
  const [history, setHistory] = useState([]);
  const [hasTodayEntry, setHasTodayEntry] = useState(false);
  const messagesEndRef = useRef(null);
  const messagesContainerRef = useRef(null);

  useEffect(() => {
    document.body.style.margin = '0';
    document.body.style.padding = '0';
    fetchHistory();
    const quickMood = localStorage.getItem('quickMood');
    if (quickMood && QUICK_MOOD_TO_SCORE[quickMood]) {
      setInputScore(QUICK_MOOD_TO_SCORE[quickMood]);
      localStorage.removeItem('quickMood'); 
    }
  }, []);

  useEffect(() => {
    if (messagesContainerRef.current) {
      messagesContainerRef.current.scrollTop = messagesContainerRef.current.scrollHeight;
    } else {
      messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages]);

  if (userRole !== 'student') {
    return (
      <div style={styles.deniedContainer}>
        <div style={styles.deniedCard}>
          <div style={styles.deniedIconWrap}>ðŸš«</div>
          <h2 style={{ fontSize: '24px', fontWeight: 'bold', color: '#111827' }}>Access Denied</h2>
          <button onClick={() => window.location.href = '/login'} style={styles.deniedBtn}>Return to Login</button>
        </div>
      </div>
    );
  }

  const fetchHistory = async () => {
    if (!userId) return;
    try {
      const res = await axios.get(`http://localhost:5001/api/moods/${userId}?limit=10`);
      const entries = res.data || [];
      setHistory(entries);
      setHasTodayEntry(entries.some(entry => entry.entryDate === getTodayStr()));
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

  const handleSendMessage = async () => {
    if (hasTodayEntry || !inputText.trim() || !inputScore) return;

    const userMessage = { id: Date.now().toString(), role: 'user', content: inputText.trim(), score: inputScore };
    setMessages(prev => [...prev, userMessage]);
    setLoading(true);

    const currentText = inputText.trim();
    const currentScore = inputScore;
    setInputText('');
    setInputScore(null);

    const recentStreak = calculateNegativeStreak(history);
    const nextStreak = isNegativeMood(currentText, currentScore) ? recentStreak + 1 : 0;
    const response = buildSupportResponse(currentText, currentScore, nextStreak);
    const counselingFlag = nextStreak >= 2 || currentScore === 1; // Flag if score is very low or string of low moods
    const resources = RESOURCES[response.tone] || RESOURCES.medium;

    try {
      const aiRes = await axios.post('http://localhost:5001/api/chat', {
        message: currentText,
        history: messages.filter(msg => !msg.type || msg.type === 'text').map(msg => ({
            role: msg.role === 'bot' ? 'assistant' : 'user',
            content: String(msg.content)
        }))
      });

      const aiReply = aiRes.data.reply;

      const payload = { 
          userId, entryDate: getTodayStr(), moodText: currentText, moodScore: currentScore, 
          aiResponse: aiReply, suggestedResources: resources.map(r => r.title), counselingRecommended: counselingFlag, displayName 
      };
      
      await axios.post('http://localhost:5001/api/moods', payload);
      
      setTimeout(() => {
          const botReplies = [{ id: Date.now().toString() + '_1', role: 'bot', type: 'text', content: aiReply }];

          // 1. APPEND RICH RESOURCES BOX IF NEEDED
          if (resources && resources.length > 0 && (response.tone === 'low' || response.tone === 'medium')) {
            botReplies.push({ id: Date.now().toString() + '_2', role: 'bot', type: 'resources', content: resources });
          }

          // 2. APPEND COUNSELING WARNING BOX IF NEEDED
          if (counselingFlag) {
            botReplies.push({
                id: Date.now().toString() + '_3', role: 'bot', type: 'counseling', 
                content: "Youâ€™ve reported feeling overwhelmed recently. We strongly encourage you to connect with a professional for support."
            });
          }

          setMessages(prev => [...prev, ...botReplies]);
          setLoading(false);
          fetchHistory(); 
      }, 800);

    } catch (err) {
      console.error('AI Chat Error:', err);
      setMessages(prev => [...prev, { id: Date.now().toString(), role: 'bot', type: 'text', content: "I'm having trouble connecting to my AI core. Please try again in a moment." }]);
      setLoading(false);
    }
  };

  return (
    <>
      <style>{`
        .score-pill { outline: none !important; -webkit-tap-highlight-color: transparent; }
        .score-pill:hover { background-color: #f9fafb !important; border-color: #d1d5db !important; }
        .score-pill-active:hover { background-color: #1d4ed8 !important; border-color: #1d4ed8 !important; }
        .chat-scroll::-webkit-scrollbar { width: 8px; }
        .chat-scroll::-webkit-scrollbar-track { background: transparent; }
        .chat-scroll::-webkit-scrollbar-thumb { background-color: #cbd5e1; border-radius: 10px; }
        .nav-link:hover { color: #2563eb; }
        .footer-link:hover { color: #ffffff; text-decoration: underline; }
      `}</style>

      <div style={styles.dashboardContainer}>
        <div style={styles.mainWrapper}>
          <main style={styles.mainContent}>
            
            <div style={styles.headerSection}>
              <div>
                <div style={styles.sessionBadge}>PRIVATE CHECK-IN â€¢ {displayName}</div>
                <h1 style={styles.mainTitle}>Mood Support Assistant</h1>
              </div>
              <div style={styles.headerButtons}>
                <Link to="/wellness-dashboard" style={styles.backToDashBtn}>
                  <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ marginRight: '6px', flexShrink: 0 }}><line x1="19" y1="12" x2="5" y2="12"></line><polyline points="12 19 5 12 12 5"></polyline></svg>
                  Back to Wellness Portal
                </Link>
                <Link to="/mood/history" style={styles.secondaryBtn}>View History</Link>
              </div>
            </div>

            <div style={styles.chatWrapper}>
                <div ref={messagesContainerRef} style={styles.messagesArea} className="chat-scroll">
                    {messages.map((msg) => (
                        <div key={msg.id} style={msg.role === 'user' ? styles.userRow : styles.botRow}>
                            {msg.role === 'bot' && (
                                <div style={styles.botAvatar}>
                                    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 8V4H8"/><rect width="16" height="12" x="4" y="8" rx="2"/><path d="M2 14h2"/><path d="M20 14h2"/><path d="M15 13v2"/><path d="M9 13v2"/></svg>
                                </div>
                            )}

                            <div style={msg.role === 'user' ? styles.userBubble : styles.botBubble}>
                                
                                {/* 1. RENDER USER TEXT */}
                                {msg.role === 'user' && (
                                    <>
                                        <p style={styles.userMessageText}>{msg.content}</p>
                                        <div style={styles.userScoreTag}>
                                            <span style={styles.scoreEmojiSmall}>{SCORE_ICONS[msg.score]}</span>
                                            {SCORE_DETAILS[msg.score]?.label} ({msg.score}/5)
                                        </div>
                                    </>
                                )}

                                {/* 2. RENDER BOT TEXT (with bold HTML formatting) */}
                                {msg.role === 'bot' && msg.type === 'text' && (
                                    <div style={styles.botMessageText}>{formatBotText(msg.content)}</div>
                                )}

                                {/* 3. RENDER RICH RESOURCES BOX */}
                                {msg.role === 'bot' && msg.type === 'resources' && (
                                    <div style={styles.resourcesBox}>
                                        <h4 style={styles.resourcesTitle}>Recommended Action Plan</h4>
                                        <div style={styles.resourceList}>
                                            {msg.content.map((res, i) => (
                                                <div key={i} style={styles.resourceItem}>
                                                    <div style={styles.bulletIcon}>â€¢</div>
                                                    <div>
                                                        <div style={{fontWeight: '700', color: '#1e3a8a', marginBottom: '2px'}}>{res.title}</div>
                                                        <div style={{color: '#475569', fontSize: '14px', lineHeight: '1.5'}}>{res.desc}</div>
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                )}

                                {/* 4. RENDER COUNSELING WARNING BOX */}
                                {msg.role === 'bot' && msg.type === 'counseling' && (
                                    <div style={styles.counselingBox}>
                                        <div style={styles.counselingIcon}>
                                            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{width: '28px', height: '28px', display: 'block'}}><path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"/><line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/></svg>
                                        </div>
                                        <div>
                                            <p style={{margin: '0 0 6px 0', fontSize: '15px', color: '#7f1d1d', fontWeight: '700'}}>Professional Support Recommended</p>
                                            <p style={{margin: 0, fontSize: '14px', color: '#991b1b', lineHeight: '1.5'}}>{msg.content}</p>
                                            <Link to="/counsellors" style={styles.bookBtn}>Find a Counsellor â†’</Link>
                                        </div>
                                    </div>
                                )}

                            </div>
                        </div>
                    ))}
                    
                    {loading && (
                        <div style={styles.botRow}>
                            <div style={styles.botAvatar}>...</div>
                            <div style={{...styles.botBubble, color: '#6b7280', fontStyle: 'italic'}}>UniBot is typing...</div>
                        </div>
                    )}
                    <div ref={messagesEndRef} />
                </div>

                <div style={styles.inputArea}>
                    <p style={styles.inputPromptText}>How are you feeling today? <span style={{color: '#ef4444'}}>*</span></p>
                  {hasTodayEntry && <div style={styles.dailyLimitNotice}>âœ… You already submitted todayâ€™s mood check-in.</div>}
                    
                    <input 
                        type="text" 
                        style={styles.textInput} 
                        placeholder="Write a short, detailed note about your mood..." 
                        value={inputText}
                        onChange={(e) => setInputText(e.target.value)}
                        onKeyDown={(e) => { if(e.key === 'Enter') handleSendMessage() }}
                        disabled={loading || hasTodayEntry}
                    />

                    <div style={styles.inputBottomRow}>
                        <div style={styles.scoreSelectorArea}>
                            <span style={styles.scoreSelectorLabel}>Mood Score:</span>
                            <div style={styles.scoreButtons}>
                                {[1, 2, 3, 4, 5].map(value => {
                                    const isActive = inputScore === value;
                                    return (
                                        <button
                                            key={value} type="button"
                                            className={isActive ? "score-pill-active" : "score-pill"}
                                            onClick={() => setInputScore(value)}
                                            disabled={loading || hasTodayEntry}
                                            style={{...styles.scoreBtn, ...(isActive ? styles.scoreBtnActive : {})}}
                                            title={SCORE_DETAILS[value].label}
                                        >
                                            <span style={styles.scoreEmoji}>{SCORE_ICONS[value]}</span> {value}
                                        </button>
                                    );
                                })}
                            </div>
                        </div>

                        <button 
                            onClick={handleSendMessage} 
                            disabled={!inputText.trim() || !inputScore || loading || hasTodayEntry}
                            style={{
                                ...styles.sendBtn,
                                opacity: (!inputText.trim() || !inputScore || loading || hasTodayEntry) ? 0.5 : 1,
                                cursor: (!inputText.trim() || !inputScore || loading || hasTodayEntry) ? 'not-allowed' : 'pointer'
                            }}
                        >
                            Send Message
                        </button>
                    </div>
                </div>
            </div>
          </main>
        </div>
      </div>
    </>
  );
}

const styles = {
  dashboardContainer: { display: 'flex', flexDirection: 'column', minHeight: '100vh', width: '100%', fontFamily: "'Inter', 'Segoe UI', Roboto, sans-serif", backgroundColor: '#f1f5f9' },
  mainWrapper: { flex: 1, width: '100%', boxSizing: 'border-box' },
  mainContent: { maxWidth: '1050px', margin: '0 auto', padding: '48px 32px 96px 32px', width: '100%' },

  navbar: { display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '16px 40px', backgroundColor: '#ffffff', borderBottom: '1px solid #e5e7eb', position: 'sticky', top: 0, zIndex: 1000 },
  navLeft: { display: 'flex', alignItems: 'center', gap: '12px', cursor: 'pointer' },
  logoBox: { backgroundColor: '#2563eb', color: 'white', borderRadius: '8px', padding: '8px', display: 'flex', alignItems: 'center', justifyContent: 'center' },
  logoText: { fontSize: '22px', fontWeight: '800', color: '#0ea5e9' },
  navLinks: { display: 'flex', gap: '32px', alignItems: 'center' },
  navLink: { textDecoration: 'none', color: '#4b5563', fontWeight: '500', fontSize: '15px', transition: 'color 0.2s' },
  navLinkActive: { textDecoration: 'none', color: '#2563eb', fontWeight: '600', fontSize: '15px', borderBottom: '2px solid #2563eb', paddingBottom: '4px' },
  navRight: { display: 'flex', alignItems: 'center' },
  userPill: { display: 'flex', alignItems: 'center', gap: '10px', padding: '8px 20px', border: '1px solid #e5e7eb', borderRadius: '30px', cursor: 'pointer', color: '#374151', fontSize: '14px', fontWeight: '500', backgroundColor: '#ffffff', transition: 'all 0.2s', boxShadow: '0 1px 2px 0 rgba(0,0,0,0.05)' },

  headerSection: { display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: '24px', flexWrap: 'wrap', marginBottom: '24px' },
  sessionBadge: { display: 'flex', alignItems: 'center', color: '#4b5563', fontSize: '12px', fontWeight: '700', textTransform: 'uppercase', letterSpacing: '1px', marginBottom: '16px' },
  mainTitle: { fontSize: '36px', fontWeight: '800', color: '#111827', margin: 0, fontFamily: "Georgia, serif" },
  headerButtons: { display: 'flex', gap: '12px', marginTop: '10px' },
  secondaryBtn: { display: 'inline-flex', alignItems: 'center', backgroundColor: '#ffffff', color: '#374151', padding: '12px 24px', borderRadius: '12px', fontWeight: '600', fontSize: '15px', textDecoration: 'none', border: '1px solid #e5e7eb', boxShadow: '0 1px 2px rgba(0,0,0,0.05)', transition: 'all 0.2s' },
  backToDashBtn: { display: 'inline-flex', alignItems: 'center', gap: '8px', background: '#e0f2fe', color: '#0b63d3', padding: '12px 20px', borderRadius: '9999px', border: '1px solid #bae6fd', fontSize: '15px', fontWeight: '600', textDecoration: 'none', boxShadow: '0 1px 2px rgba(0,0,0,0.08)' },
  
  chatWrapper: { backgroundColor: '#ffffff', borderRadius: '24px', border: '1px solid #e2e8f0', boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1)', display: 'flex', flexDirection: 'column', height: '80vh', minHeight: '700px', overflow: 'hidden' },
  
  messagesArea: { flex: 1, padding: '40px', overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '28px', backgroundColor: '#f8fafc' },
  
  userRow: { display: 'flex', justifyContent: 'flex-end', width: '100%' },
  botRow: { display: 'flex', justifyContent: 'flex-start', alignItems: 'flex-end', gap: '16px', width: '100%' },
  botAvatar: { width: '44px', height: '44px', borderRadius: '14px', backgroundColor: '#2563eb', color: '#ffffff', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 },
  
  userBubble: { backgroundColor: '#2563eb', padding: '18px 24px', borderRadius: '24px 24px 4px 24px', maxWidth: '75%', boxShadow: '0 2px 4px rgba(0,0,0,0.05)' },
  botBubble: { backgroundColor: '#ffffff', padding: '18px 24px', borderRadius: '24px 24px 24px 4px', maxWidth: '75%', border: '1px solid #e2e8f0', boxShadow: '0 2px 4px rgba(0,0,0,0.05)' },
  
  userMessageText: { color: '#ffffff', fontSize: '16px', lineHeight: '1.6', margin: '0 0 12px 0' },
  userScoreTag: { display: 'inline-flex', alignItems: 'center', gap: '6px', backgroundColor: 'rgba(255,255,255,0.2)', padding: '8px 14px', borderRadius: '10px', fontSize: '14px', color: '#ffffff', fontWeight: '600' },
  scoreEmojiSmall: { fontSize: '18px', display: 'flex' },
  botMessageText: { color: '#1e293b', fontSize: '16px', lineHeight: '1.7', margin: 0, whiteSpace: 'pre-wrap' },

  // --- NEW STYLES FOR RICH RESOURCES ---
  resourcesBox: { backgroundColor: '#eff6ff', padding: '20px', borderRadius: '16px', border: '1px solid #bfdbfe', marginTop: '16px' },
  resourcesTitle: { margin: '0 0 16px 0', fontSize: '16px', fontWeight: '700', color: '#1e3a8a' },
  resourceList: { display: 'flex', flexDirection: 'column', gap: '16px' },
  resourceItem: { display: 'flex', alignItems: 'flex-start', gap: '12px' },
  bulletIcon: { color: '#3b82f6', fontSize: '20px', lineHeight: '1.2', fontWeight: 'bold' },

  counselingBox: { backgroundColor: '#fef2f2', border: '1px solid #fecaca', borderRadius: '16px', padding: '20px', display: 'flex', gap: '20px', alignItems: 'flex-start', marginTop: '16px' },
  counselingIcon: { color: '#b91c1c', flexShrink: 0 },
  bookBtn: { display: 'inline-block', marginTop: '14px', color: '#b91c1c', fontWeight: '700', fontSize: '15px', textDecoration: 'none' },

  inputArea: { padding: '32px', backgroundColor: '#ffffff', borderTop: '1px solid #e2e8f0' },
  inputPromptText: { margin: '0 0 16px 0', fontSize: '15px', fontWeight: '600', color: '#475569' },
  dailyLimitNotice: { margin: '0 0 16px 0', fontSize: '14px', fontWeight: '600', color: '#16a34a', backgroundColor: '#ecfdf3', border: '1px solid #bbf7d0', padding: '12px 16px', borderRadius: '12px' },
  textInput: { width: '100%', boxSizing: 'border-box', padding: '18px', borderRadius: '16px', border: '1px solid #cbd5e1', backgroundColor: '#f8fafc', fontSize: '16px', color: '#0f172a', marginBottom: '20px', outline: 'none', transition: 'border-color 0.2s', boxShadow: 'inset 0 1px 2px rgba(0,0,0,0.02)' },
  
  inputBottomRow: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '20px' },
  scoreSelectorArea: { display: 'flex', alignItems: 'center', gap: '16px' },
  scoreSelectorLabel: { fontSize: '14px', fontWeight: '700', color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.5px' },
  scoreButtons: { display: 'flex', gap: '10px', flexWrap: 'wrap' },
  
  scoreBtn: { backgroundColor: '#ffffff', borderWidth: '1px', borderStyle: 'solid', borderColor: '#e2e8f0', borderRadius: '999px', padding: '10px 20px', fontWeight: '600', color: '#475569', display: 'flex', alignItems: 'center', gap: '10px', transition: 'all 0.2s ease', fontSize: '14px'},
  scoreBtnActive: { backgroundColor: '#2563eb', borderColor: '#2563eb', color: '#ffffff', boxShadow: '0 4px 12px rgba(37, 99, 235, 0.25)' },
  scoreEmoji: { display: 'flex', alignItems: 'center' },
  
  sendBtn: { backgroundColor: '#2563eb', color: '#fff', border: 'none', padding: '14px 28px', borderRadius: '14px', fontWeight: '700', fontSize: '16px', transition: 'background-color 0.2s' },

  deniedContainer: { display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '100vh', backgroundColor: '#f9fafb' },
  deniedCard: { backgroundColor: 'white', padding: '40px', borderRadius: '24px', boxShadow: '0 4px 6px rgba(0,0,0,0.05)', textAlign: 'center', border: '1px solid #f3f4f6', display: 'flex', flexDirection: 'column', alignItems: 'center' },
  deniedIconWrap: { width: '52px', height: '52px', borderRadius: '18px', margin: '0 auto 15px auto', display: 'flex', alignItems: 'center', justifyContent: 'center', backgroundColor: '#fef2f2', color: '#dc2626', fontSize: '24px' },
  deniedBtn: { marginTop: '20px', width: '100%', backgroundColor: '#2563eb', color: 'white', padding: '12px', borderRadius: '12px', fontWeight: '600', cursor: 'pointer', border: 'none' }
};
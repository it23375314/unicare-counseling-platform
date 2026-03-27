import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Link, useNavigate } from 'react-router-dom';

const CATEGORIES = ["Personal", "Academic", "Health", "Fitness", "Career"];

const CATEGORY_ICONS = { 
  Personal: <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{marginRight:'6px'}}><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>, 
  Academic: <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{marginRight:'6px'}}><path d="M4 19.5v-15A2.5 2.5 0 0 1 6.5 2H20v20H6.5a2.5 2.5 0 0 1 0-5H20"/></svg>, 
  Health: <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{marginRight:'6px'}}><path d="M20.42 4.58a5.4 5.4 0 0 0-7.65 0l-.77.78-.77-.78a5.4 5.4 0 0 0-7.65 0C1.46 6.7 1.33 10.28 4 13l8 8 8-8c2.67-2.72 2.54-6.3.42-8.42z"/></svg>, 
  Fitness: <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{marginRight:'6px'}}><polyline points="22 12 18 12 15 21 9 3 6 12 2 12"/></svg>, 
  Career: <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{marginRight:'6px'}}><rect x="2" y="7" width="20" height="14" rx="2" ry="2"/><path d="M16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16"/></svg> 
};

// Custom colors for Priority buttons
const PRIORITIES = [
  { label: "Low", color: "#2563eb", bg: "#eff6ff", border: "#bfdbfe" },
  { label: "Medium", color: "#d97706", bg: "#fffbeb", border: "#fde68a" },
  { label: "High", color: "#dc2626", bg: "#fef2f2", border: "#fecaca" },
];

export default function WellnessCenter() {
  const userId = localStorage.getItem('userId');
  const navigate = useNavigate();
  const [goals, setGoals] = useState([]);
  
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [activeTab, setActiveTab] = useState(0);
  const [formData, setFormData] = useState({
    title: '', targetDate: '', category: 'Personal', priority: 'Medium',
    description: '', frequency: 'Daily', customFrequency: '',
    progressType: 'Binary', targetValue: '', reward: '',
    reminderEnabled: false, reminderTime: ''
  });

  const [errors, setErrors] = useState({});
  const [expandedGoalId, setExpandedGoalId] = useState(null);
  const [completeModalOpen, setCompleteModalOpen] = useState(false);
  const [goalToComplete, setGoalToComplete] = useState(null);
  const [completionMood, setCompletionMood] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterCategory, setFilterCategory] = useState('All');
  const [sortBy, setSortBy] = useState('Newest');
  const [isMobile, setIsMobile] = useState(window.innerWidth < 900);
  const todayStr = new Date().toISOString().split('T')[0];

  useEffect(() => {
    document.body.style.margin = "0";
    document.body.style.padding = "0";
    fetchGoals();
    const onResize = () => setIsMobile(window.innerWidth < 900);
    window.addEventListener("resize", onResize);
    return () => window.removeEventListener("resize", onResize);
  }, []);

  const fetchGoals = async () => {
    try {
      const res = await axios.get(`http://localhost:5000/api/goals/${userId}`);
      setGoals(res.data);
    } catch (err) {
      console.error("Error fetching goals", err);
    }
  };

  const handleFormChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({ ...prev, [name]: type === 'checkbox' ? checked : value }));
    if (errors[name]) setErrors(prev => ({ ...prev, [name]: null }));
  };

  const openModal = () => {
    setFormData({
        title: '', targetDate: '', category: 'Personal', priority: 'Medium',
        description: '', frequency: 'Daily', customFrequency: '',
        progressType: 'Binary', targetValue: '', reward: '',
        reminderEnabled: false, reminderTime: ''
    });
    setErrors({});
    setActiveTab(0);
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setErrors({});
  };

  const validateForm = () => {
    const newErrors = {};
    let firstErrorTab = null;

    if (!formData.title.trim()) { newErrors.title = 'Milestone name is required.'; if (firstErrorTab === null) firstErrorTab = 0; } 
    else if (formData.title.trim().length < 3) { newErrors.title = 'Name must be at least 3 characters.'; if (firstErrorTab === null) firstErrorTab = 0; }
    
    if (!formData.description.trim()) { newErrors.description = 'Description is required.'; if (firstErrorTab === null) firstErrorTab = 0; } 
    else if (formData.description.trim().length < 10) { newErrors.description = 'Description must be at least 10 characters.'; if (firstErrorTab === null) firstErrorTab = 0; }

    if (!formData.targetDate) { newErrors.targetDate = 'Deadline is required.'; if (firstErrorTab === null) firstErrorTab = 0; } 
    else if (formData.targetDate < todayStr) { newErrors.targetDate = 'Deadline cannot be in the past.'; if (firstErrorTab === null) firstErrorTab = 0; }

    if (formData.frequency === 'Custom') {
      if (!formData.customFrequency || formData.customFrequency < 1 || formData.customFrequency > 7) {
        newErrors.customFrequency = 'Enter a valid frequency (1-7).'; if (firstErrorTab === null) firstErrorTab = 1;
      }
    }
    if (formData.progressType === 'Numeric' || formData.progressType === 'Timer-based') {
      if (!formData.targetValue || formData.targetValue <= 0) {
        newErrors.targetValue = `Target ${formData.progressType === 'Numeric' ? 'value' : 'minutes'} must be greater than 0.`; if (firstErrorTab === null) firstErrorTab = 1;
      }
    }

    if (!formData.reward.trim()) { newErrors.reward = 'Reward is required.'; if (firstErrorTab === null) firstErrorTab = 2; } 
    else if (formData.reward.trim().length < 3) { newErrors.reward = 'Reward must be at least 3 characters.'; if (firstErrorTab === null) firstErrorTab = 2; }

    if (formData.reminderEnabled && !formData.reminderTime) { newErrors.reminderTime = 'Please set a reminder time.'; if (firstErrorTab === null) firstErrorTab = 2; }

    setErrors(newErrors);
    if (firstErrorTab !== null && firstErrorTab !== activeTab) setActiveTab(firstErrorTab);
    return Object.keys(newErrors).length === 0;
  };

  const addGoal = async (e) => {
    e.preventDefault();
    if (!validateForm()) return;

    const payload = {
      userId, ...formData,
      customFrequency: formData.frequency === 'Custom' ? Number(formData.customFrequency || 0) : 0,
      targetValue: (formData.progressType === 'Numeric' || formData.progressType === 'Timer-based') ? Number(formData.targetValue || 0) : 0
    };
    
    try { await axios.post('http://localhost:5000/api/goals', payload); closeModal(); fetchGoals(); } 
    catch (err) { alert(err.response?.data?.msg || "Error adding goal"); }
  };

  const initiateCompletion = (goal) => { setGoalToComplete(goal); setCompletionMood(null); setCompleteModalOpen(true); };

  const confirmCompletion = async () => {
    if (!goalToComplete) return;
    try { await axios.put(`http://localhost:5000/api/goals/complete/${goalToComplete._id}`, { mood: completionMood }); fetchGoals(); setCompleteModalOpen(false); setGoalToComplete(null); } 
    catch (err) { alert("Error marking as complete"); }
  };

  const deleteGoal = async (goalId) => {
    if (!window.confirm("Delete this milestone?")) return;
    try { await axios.delete(`http://localhost:5000/api/goals/${goalId}`); fetchGoals(); } 
    catch (err) { alert("Error deleting goal"); }
  };

  const handleLogout = () => {
    if (window.confirm("Are you sure you want to log out?")) { localStorage.clear(); window.location.href = '/login'; }
  };

  const resetSearch = () => {
    setSearchQuery('');
    setFilterCategory('All');
    setSortBy('Newest');
  };

  const toLocalYmd = (value) => { const d = new Date(value); return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`; };
  const isOverdue = (date, isCompleted) => { if (isCompleted) return false; return toLocalYmd(date) < toLocalYmd(new Date()); };
  const daysLeft = (date) => { const target = new Date(`${toLocalYmd(date)}T00:00:00`).getTime(); const today = new Date(`${toLocalYmd(new Date())}T00:00:00`).getTime(); return Math.ceil((target - today) / 86400000); };
  const getStreakValue = (goal) => { const storedStreak = Number(goal.streak || 0); if (storedStreak > 0) return storedStreak; const startDate = goal.createdAt ? new Date(goal.createdAt) : new Date(goal.targetDate); const endDate = goal.isCompleted ? new Date(goal.updatedAt || goal.targetDate) : new Date(); const start = new Date(`${toLocalYmd(startDate)}T00:00:00`).getTime(); const end = new Date(`${toLocalYmd(endDate)}T00:00:00`).getTime(); return Math.max(0, Math.floor((end - start) / 86400000) + 1); };
  const formatDate = (date) => { return new Date(date).toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" }); };

  const totalGoals = goals.length;
  const completedGoals = goals.filter(g => g.isCompleted).length;
  const activeGoals = totalGoals - completedGoals;
  const progressPercentage = totalGoals > 0 ? Math.round((completedGoals / totalGoals) * 100) : 0;
  const overdueGoalsList = goals.filter(g => isOverdue(g.targetDate, g.isCompleted));
  const bestStreak = goals.reduce((max, g) => Math.max(max, getStreakValue(g)), 0);

  const priorityRank = { High: 3, Medium: 2, Low: 1 };
  let processedGoals = goals
    .filter(goal => goal.title.toLowerCase().includes(searchQuery.toLowerCase()))
    .filter(goal => (filterCategory === 'All' ? true : goal.category === filterCategory))
    .sort((a, b) => {
      if (a.isCompleted !== b.isCompleted) return a.isCompleted ? 1 : -1;
      if (sortBy === 'Newest') {
        const createdDiff = new Date(b.createdAt || b.targetDate) - new Date(a.createdAt || a.targetDate);
        if (createdDiff !== 0) return createdDiff;
      }
      if (sortBy === 'Priority') {
        const priorityDiff = (priorityRank[b.priority] || 0) - (priorityRank[a.priority] || 0);
        if (priorityDiff !== 0) return priorityDiff;
      }
      if (sortBy === 'Urgency') {
        const dateDiff = new Date(a.targetDate) - new Date(b.targetDate);
        if (dateDiff !== 0) return dateDiff;
      }
      return new Date(b.createdAt || b.targetDate) - new Date(a.createdAt || a.targetDate);
    });

  return (
    <>
      <style>{`
        .sidebar-item { padding: 15px; margin-bottom: 10px; border-radius: 8px; cursor: pointer; color: #4b5563; font-weight: 500; transition: all 0.3s ease; }
        .sidebar-item:hover { background-color: #f3f4f6; color: #111827; }
        .sub-item { padding: 10px 15px !important; font-size: 13px !important; margin-bottom: 5px !important; opacity: 0.8; }
        .sub-item:hover { opacity: 1; transform: translateX(5px); }
        
        .action-btn { transition: background-color 0.2s ease; }
        .action-btn:hover { background-color: #1d4ed8 !important; }
        
        .pill-btn { outline: none !important; -webkit-tap-highlight-color: transparent; }
        .pill-btn:focus, .pill-btn:active { outline: none !important; border-color: #e5e7eb !important; }
        
        button:focus { outline: none; }
        button:focus-visible { outline: 2px solid #2563eb; outline-offset: 2px; }
      `}</style>

      <div style={styles.dashboardContainer}>
        {/* --- LEFT SIDEBAR --- */}
        <div style={styles.sidebar}>
            <h2 style={{ color: '#2563eb', marginBottom: '40px', textAlign: 'center', marginTop: 0 }}>UniCare</h2>
            <ul style={{ listStyle: 'none', padding: 0, flex: 1, margin: 0 }}>
                <li className="sidebar-item" onClick={() => navigate('/')}>🏠 Dashboard</li>
                <li className="sidebar-item" onClick={() => navigate('/appointments')}>📅 Appointments</li>
                <li className="sidebar-item" style={{ fontWeight: '800', color: '#111827', cursor: 'pointer' }} onClick={() => navigate('/wellness-dashboard')}>🌿 My Wellness Portal</li>
                <ul style={{ listStyle: 'none', paddingLeft: '20px', marginBottom: '10px' }}>
                    <li className="sidebar-item sub-item" onClick={() => navigate('/wellness')} style={{ backgroundColor: '#eff6ff', color: '#1d4ed8', fontWeight: 'bold', opacity: 1 }}>🎯 Goal Tracker</li>
                    <li className="sidebar-item sub-item" onClick={() => navigate('/mood')}>🎭 Mood Support</li>
                    <li className="sidebar-item sub-item" onClick={() => navigate('/resources')}>📚 Health Library</li>
                    <li className="sidebar-item sub-item" onClick={() => navigate('/saved')}>🔖 Saved Files</li>
                </ul>
                <li className="sidebar-item" onClick={() => navigate('/settings')}>⚙️ Settings</li>
            </ul>
            <ul style={{ listStyle: 'none', padding: 0, flex: 0, margin: 0 }}><li className="sidebar-item" onClick={handleLogout} style={{ color: '#dc2626' }}>🚪 Logout</li></ul>
        </div>

        <div style={styles.mainWrapper}>
          <main style={styles.mainContent}>
            
            <div style={styles.headerSection}>
              <div>
                <h1 style={styles.mainTitle}>Your Journey</h1>
                <p style={styles.subTitle}>Ready to crush your wellness goals today?</p>
              </div>
              <div style={styles.headerButtons}>
                <Link to="/wellness/history" style={styles.historyBtn}>
                    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{marginRight:'6px'}}><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="16" y1="13" x2="8" y2="13"/><line x1="16" y1="17" x2="8" y2="17"/><polyline points="10 9 9 9 8 9"/></svg>
                    Goal History
                </Link>
                <button onClick={openModal} className="action-btn" style={styles.primaryBtn}>
                    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{marginRight:'6px'}}><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>
                    New Milestone
                </button>
              </div>
            </div>

            {overdueGoalsList.length > 0 && (
              <div style={styles.alertBox}>
                <span style={{ display: 'flex' }}>
                    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#dc2626" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m21.73 18-8-14a2 2 0 0 0-3.48 0l-8 14A2 2 0 0 0 4 21h16a2 2 0 0 0 1.73-3Z"/><line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/></svg>
                </span>
                <div>
                  <p style={{ margin: 0, color: '#b91c1c', fontWeight: '700', fontSize: '14px' }}>{overdueGoalsList.length} milestone{overdueGoalsList.length > 1 ? "s" : ""} past deadline!</p>
                  <p style={{ margin: '4px 0 0 0', color: '#dc2626', fontSize: '13px', fontWeight: '500' }}>{overdueGoalsList.map(g => g.title).join(", ")}</p>
                </div>
              </div>
            )}

            <div style={styles.dashboardStatsCard}>
              <div style={styles.statsHeader}>
                <div><p style={styles.statsEyebrow}>Dashboard Overview</p><h3 style={styles.statsTitle}>Your Progress Snapshot</h3></div>
                <span style={styles.statsDateChip}>{new Date().toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" })}</span>
              </div>
              <div style={{ ...styles.statsGrid, gridTemplateColumns: isMobile ? "1fr" : "1.5fr 1fr 1fr 1fr" }}>
                <div style={styles.heroStatCard}>
                  <div><p style={styles.heroLabel}>Completion Rate</p><h2 style={styles.heroValue}>{progressPercentage}%</h2><p style={styles.heroSubtext}>{completedGoals} completed • {activeGoals} active</p></div>
                  <div style={styles.ringWrap}>
                    <svg width="92" height="92" viewBox="0 0 100 100">
                      <circle cx="50" cy="50" r="40" fill="none" stroke="#e5e7eb" strokeWidth="10" />
                      <circle cx="50" cy="50" r="40" fill="none" stroke="#0d9488" strokeWidth="10" strokeDasharray="251.2" strokeDashoffset={251.2 - (251.2 * progressPercentage) / 100} strokeLinecap="round" style={{ transition: "stroke-dashoffset 0.8s ease", transform: "rotate(-90deg)", transformOrigin: "50% 50%" }} />
                    </svg>
                    <span style={styles.ringCenterText}>{progressPercentage}%</span>
                  </div>
                </div>
                <div style={styles.metricTile}>
                    <div style={{ ...styles.metricIcon, background: "#eff6ff", color: "#2563eb" }}>
                        <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><circle cx="12" cy="12" r="6"/><circle cx="12" cy="12" r="2"/></svg>
                    </div>
                    <p style={styles.metricLabel}>Total Goals</p>
                    <p style={styles.metricValue}>{totalGoals}</p>
                </div>
                <div style={styles.metricTile}>
                    <div style={{ ...styles.metricIcon, background: "#ecfdf5", color: "#16a34a" }}>
                        <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M8.5 14.5A2.5 2.5 0 0 0 11 12c0-1.38-.5-2-1-3-1.072-2.143-.224-4.054 2-6 .5 2.5 2 4.9 4 6.5 2 1.6 3 3.5 3 5.5a7 7 0 1 1-14 0c0-1.153.433-2.294 1-3a2.5 2.5 0 0 0 2.5 2.5z"/></svg>
                    </div>
                    <p style={styles.metricLabel}>Best Streak</p>
                    <p style={styles.metricValue}>{bestStreak} days</p>
                </div>
                <div style={styles.metricTile}>
                    <div style={{ ...styles.metricIcon, background: "#fef2f2", color: "#dc2626" }}>
                        <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="13" r="8"/><path d="M12 9v4l2 2"/><path d="M5 3 2 6"/><path d="M22 6l-3-3"/><path d="M6.38 18.7 4 21"/><path d="M17.64 18.67 20 21"/></svg>
                    </div>
                    <p style={styles.metricLabel}>Overdue</p>
                    <p style={styles.metricValue}>{overdueGoalsList.length}</p>
                </div>
              </div>
            </div>

            <div style={styles.controlsRow}>
              <div style={styles.searchBox}>
                <span style={styles.searchIcon}>
                    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="11" cy="11" r="8"></circle><line x1="21" y1="21" x2="16.65" y2="16.65"></line></svg>
                </span>
                <input style={styles.searchInput} placeholder="Search goals..." value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} />
              </div>
              <div style={styles.filters}>
                <select style={styles.selectInput} value={filterCategory} onChange={(e) => setFilterCategory(e.target.value)}><option value="All">All Categories</option>{CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}</select>
                <select style={styles.selectInput} value={sortBy} onChange={(e) => setSortBy(e.target.value)}><option value="Newest">Newest First</option><option value="Urgency">Sort by Deadline</option><option value="Priority">Sort by Priority</option></select>
                <button type="button" onClick={resetSearch} style={styles.resetBtn}>Reset</button>
              </div>
            </div>

            <section>
              {processedGoals.length > 0 ? (
                <div style={styles.listContainer}>
                  {processedGoals.map((goal) => {
                    const overdue = isOverdue(goal.targetDate, goal.isCompleted);
                    const isExpanded = expandedGoalId === goal._id;
                    const dLeft = daysLeft(goal.targetDate);
                    const daysLeftText = overdue ? `${Math.abs(dLeft)} days overdue` : dLeft === 0 ? "Due Today" : `${dLeft} days left`;
                    return (
                      <div key={goal._id} style={{ ...styles.listItemWrapper, opacity: goal.isCompleted ? 0.75 : 1, borderLeft: overdue ? '4px solid #ef4444' : goal.isCompleted ? '4px solid #10b981' : '1px solid #f3f4f6', background: overdue ? '#fef2f2' : styles.listItemWrapper.background }}>
                        <div style={styles.listItemHeader} onClick={() => setExpandedGoalId(isExpanded ? null : goal._id)}>
                          <div style={styles.listLeft}>
                            <button onClick={(e) => { e.stopPropagation(); if (overdue) return alert("Deadline passed."); if (!goal.isCompleted) initiateCompletion(goal); }} disabled={overdue || goal.isCompleted} style={{ ...styles.checkboxCircle, background: goal.isCompleted ? '#10b981' : 'transparent', borderColor: goal.isCompleted ? '#10b981' : '#d1d5db', cursor: (overdue || goal.isCompleted) ? 'default' : 'pointer' }}>
                                {goal.isCompleted && <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#ffffff" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"/></svg>}
                            </button>
                            <div style={styles.goalInfo}>
                              <h3 style={{ ...styles.goalTitleList, textDecoration: goal.isCompleted ? 'line-through' : 'none', color: overdue ? '#991b1b' : '#111827' }}>{goal.title}</h3>
                              <div style={styles.badgeGroup}>
                                <span style={styles.textBadge}>{CATEGORY_ICONS[goal.category]} {goal.category}</span>
                                {goal.priority === 'High' && !goal.isCompleted && <span style={styles.urgentBadge}>High Priority</span>}
                                {overdue && <span style={styles.overdueBadge}>Overdue</span>}
                                {goal.isCompleted && <span style={styles.completedBadge}>Completed</span>}
                              </div>
                            </div>
                          </div>
                          <div style={styles.listRight}>
                            <div style={styles.dateBlock}>
                              <span style={styles.dateLabel}>DEADLINE</span><span style={{ ...styles.dateValue, color: overdue ? '#ef4444' : '#111827' }}>{formatDate(goal.targetDate)}</span>
                              {!goal.isCompleted && <span style={{ fontSize: '11px', fontWeight: '600', marginTop: '4px', color: overdue ? '#ef4444' : dLeft <= 3 ? '#f59e0b' : '#6b7280' }}>{daysLeftText}</span>}
                            </div>
                            <div style={styles.actionButtons}>
                                <button onClick={(e) => { e.stopPropagation(); deleteGoal(goal._id); }} style={styles.deleteBtn} title="Delete">
                                    <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
                                </button>
                                <span style={{ ...styles.chevron, transform: isExpanded ? 'rotate(180deg)' : 'rotate(0deg)' }}>▼</span>
                            </div>
                          </div>
                        </div>
                        {isExpanded && (
                          <div style={styles.expandedContent}>
                            <div style={styles.detailGrid}>
                              {goal.description && <div style={{ ...styles.detailBlock, gridColumn: '1 / -1' }}><div style={styles.detailHeader}>DESCRIPTION</div><div style={styles.detailValue}>{goal.description}</div></div>}
                              <div style={styles.detailBlock}><div style={styles.detailHeader}>FREQUENCY</div><div style={styles.detailValue}>{goal.frequency === 'Custom' ? (goal.customFrequency ? `${goal.customFrequency}x per week` : 'Custom') : (goal.frequency || 'Not set')}</div></div>
                              <div style={styles.detailBlock}><div style={styles.detailHeader}>TRACKING</div><div style={styles.detailValue}>{goal.progressType || 'Not set'} {(goal.progressType === 'Numeric' || goal.progressType === 'Timer-based') && goal.targetValue > 0 ? `(Target: ${goal.targetValue})` : ''}</div></div>
                              <div style={{ ...styles.detailBlock, background: '#fffbeb', borderColor: '#fef3c7' }}><div style={{ ...styles.detailHeader, color: '#b45309' }}>REWARD</div><div style={{ ...styles.detailValue, color: '#92400e' }}>{goal.reward || 'None set'}</div></div>
                              <div style={{ ...styles.detailBlock, background: '#ecfdf5', borderColor: '#d1fae5' }}><div style={{ ...styles.detailHeader, color: '#059669' }}>STREAK</div><div style={{ ...styles.detailValue, color: '#047857' }}>{getStreakValue(goal)} days</div></div>
                            </div>
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              ) : (
                <div style={styles.emptyState}>
                  <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '16px' }}>
                      <svg xmlns="http://www.w3.org/2000/svg" width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="#9ca3af" strokeWidth="1" strokeLinecap="round" strokeLinejoin="round"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/></svg>
                  </div>
                  <h3 style={{ margin: '0 0 8px 0', color: '#111827', fontSize: '20px', fontWeight: '800' }}>No milestones found</h3>
                </div>
              )}
            </section>
          </main>
        </div>

        {isModalOpen && (
          <div style={styles.modalOverlay} onClick={closeModal}>
            <div style={styles.modalContent} onClick={e => e.stopPropagation()}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '24px 28px 10px' }}>
                <div style={{ display: 'flex', alignItems: 'center' }}>
                    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#111827" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{marginRight:'8px'}}><path d="M4.5 16.5c-1.5 1.26-2 5-2 5s3.74-.5 5-2c.71-.84.7-2.13-.09-2.91a2.18 2.18 0 0 0-2.91-.09z"/><path d="m12 15-3-3a22 22 0 0 1 2-3.95A12.88 12.88 0 0 1 22 2c0 2.72-.78 7.5-6 11a22.35 22.35 0 0 1-4 2z"/><path d="M9 12H4s.55-3.03 2-4c1.62-1.08 5 0 5 0"/><path d="M12 15v5s3.03-.55 4-2c1.08-1.62 0-5 0-5"/></svg>
                    <h3 style={styles.modalTitle}>Launch Milestone</h3>
                </div>
                <button onClick={closeModal} style={styles.iconBtn}>
                    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
                </button>
              </div>
              <div style={styles.tabContainer}>
                {['Basic Info', 'Tracking', 'Motivation'].map((tab, i) => (
                  <button key={i} type="button" onClick={() => setActiveTab(i)} style={{ ...styles.tabBtn, borderBottomColor: activeTab === i ? '#2563eb' : 'transparent', color: activeTab === i ? '#2563eb' : '#6b7280' }}>{tab}</button>
                ))}
              </div>
              <form onSubmit={addGoal} style={{ padding: '20px 28px 28px', maxHeight: '65vh', overflowY: 'auto' }} noValidate>
                
                {/* --- TAB 0: BASIC INFO --- */}
                {activeTab === 0 && (
                  <div style={styles.formSection}>
                    
                    <div style={styles.inputGroup}>
                        <label style={styles.label}>Goal Name <span style={{color: '#ef4444'}}>*</span></label>
                        <input name="title" style={errors.title ? { ...styles.input, ...styles.inputError } : styles.input} value={formData.title} onChange={handleFormChange} />
                        {errors.title && <span style={styles.errorText}>⚠️ {errors.title}</span>}
                    </div>
                    
                    <div style={styles.inputGroup}>
                        <label style={styles.label}>Description <span style={{color: '#ef4444'}}>*</span></label>
                        <textarea 
                            name="description" 
                            style={errors.description ? { ...styles.input, resize: 'vertical', minHeight: '80px', ...styles.inputError } : { ...styles.input, resize: 'vertical', minHeight: '80px' }} 
                            value={formData.description} 
                            onChange={handleFormChange} 
                        />
                        {errors.description && <span style={styles.errorText}>⚠️ {errors.description}</span>}
                    </div>
                    
                    <div style={styles.inputGroup}>
                      <label style={styles.label}>Category</label>
                      <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                        {CATEGORIES.map(cat => {
                            const isActive = formData.category === cat;
                            return (
                                <button 
                                    type="button" 
                                    key={cat} 
                                    onClick={() => setFormData(p => ({ ...p, category: cat }))} 
                                    className={`pill-btn ${isActive ? 'pill-btn-active' : ''}`}
                                    style={{ ...styles.pillBtn, ...(isActive ? styles.pillActiveTeal : styles.pillInactive) }}
                                >
                                    {CATEGORY_ICONS[cat]} {cat}
                                </button>
                            );
                        })}
                      </div>
                    </div>

                    <div style={styles.inputGroup}>
                      <label style={styles.label}>Priority Level</label>
                      <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                        {PRIORITIES.map(p => {
                          const isActive = formData.priority === p.label;
                          return (
                            <button
                              type="button"
                              key={p.label}
                              onClick={() => setFormData(prev => ({ ...prev, priority: p.label }))}
                              className="pill-btn"
                              style={{
                                ...styles.pillBtn,
                                borderColor: isActive ? p.color : '#e5e7eb',
                                background: isActive ? p.bg : '#ffffff',
                                color: isActive ? p.color : '#4b5563',
                                fontWeight: isActive ? '700' : '500'
                              }}
                            >
                              {p.label}
                            </button>
                          );
                        })}
                      </div>
                    </div>
                    
                    <div style={styles.inputGroup}>
                        <label style={styles.label}>Deadline <span style={{color: '#ef4444'}}>*</span></label>
                        <input name="targetDate" style={errors.targetDate ? { ...styles.input, ...styles.inputError } : styles.input} type="date" value={formData.targetDate} min={todayStr} onChange={handleFormChange} />
                        {errors.targetDate && <span style={styles.errorText}>⚠️ {errors.targetDate}</span>}
                    </div>
                    
                    <button type="button" onClick={() => setActiveTab(1)} style={styles.nextBtn}>
                        Next 
                        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{marginLeft:'6px', verticalAlign:'text-bottom'}}><line x1="5" y1="12" x2="19" y2="12"/><polyline points="12 5 19 12 12 19"/></svg>
                    </button>
                  </div>
                )}
                
                {/* --- TAB 1: TRACKING --- */}
                {activeTab === 1 && (
                  <div style={styles.formSection}>
                    <div style={styles.inputGroup}>
                        <label style={styles.label}>Frequency</label>
                        <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                            {['Daily', 'Weekdays', 'Weekly', 'Custom'].map(f => {
                                const isActive = formData.frequency === f;
                                return(
                                    <button type="button" key={f} className={`pill-btn ${isActive ? 'pill-btn-active' : ''}`} onClick={() => setFormData(p => ({ ...p, frequency: f }))} style={{ ...styles.pillBtn, ...(isActive ? styles.pillActiveTeal : styles.pillInactive) }}>{f}</button>
                                )
                            })}
                        </div>
                    </div>
                    {formData.frequency === 'Custom' && (<div style={styles.inputGroup}><label style={styles.label}>Times per week</label><input name="customFrequency" type="number" min="1" max="7" style={errors.customFrequency ? { ...styles.input, ...styles.inputError } : styles.input} value={formData.customFrequency} onChange={handleFormChange} />{errors.customFrequency && <span style={styles.errorText}>⚠️ {errors.customFrequency}</span>}</div>)}
                    <div style={styles.inputGroup}><label style={styles.label}>Progress Type</label><div style={{ display: 'flex', gap: '8px' }}>{[{ v: 'Binary', l: 'Yes/No' }, { v: 'Numeric', l: 'Count' }, { v: 'Timer-based', l: 'Timer' }].map(pt => (<button type="button" key={pt.v} onClick={() => setFormData(p => ({ ...p, progressType: pt.v }))} style={{ ...styles.priorityBtn, background: formData.progressType === pt.v ? '#eff6ff' : '#fff', borderColor: formData.progressType === pt.v ? '#2563eb' : '#e5e7eb', color: formData.progressType === pt.v ? '#1d4ed8' : '#6b7280' }}>{pt.l}</button>))}</div></div>
                    {(formData.progressType === 'Numeric' || formData.progressType === 'Timer-based') && (<div style={styles.inputGroup}><label style={styles.label}>Target {formData.progressType === 'Numeric' ? 'Value' : 'Mins'}</label><input name="targetValue" type="number" min="1" style={errors.targetValue ? { ...styles.input, ...styles.inputError } : styles.input} value={formData.targetValue} onChange={handleFormChange} />{errors.targetValue && <span style={styles.errorText}>⚠️ {errors.targetValue}</span>}</div>)}
                    <div style={{ display: 'flex', gap: '10px' }}>
                        <button type="button" onClick={() => setActiveTab(0)} style={styles.backBtn}>
                            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{marginRight:'6px', verticalAlign:'text-bottom'}}><line x1="19" y1="12" x2="5" y2="12"/><polyline points="12 19 5 12 12 5"/></svg>
                            Back
                        </button>
                        <button type="button" onClick={() => setActiveTab(2)} style={styles.nextBtn}>
                            Next 
                            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{marginLeft:'6px', verticalAlign:'text-bottom'}}><line x1="5" y1="12" x2="19" y2="12"/><polyline points="12 5 19 12 12 19"/></svg>
                        </button>
                    </div>
                  </div>
                )}
                
                {/* --- TAB 2: MOTIVATION --- */}
                {activeTab === 2 && (
                  <div style={styles.formSection}>
                    <div style={styles.inputGroup}>
                        <label style={styles.label}>Reward <span style={{color: '#ef4444'}}>*</span></label>
                        <input name="reward" style={errors.reward ? { ...styles.input, ...styles.inputError } : styles.input} placeholder="Treat yourself..." value={formData.reward} onChange={handleFormChange} />
                        {errors.reward && <span style={styles.errorText}>⚠️ {errors.reward}</span>}
                    </div>
                    
                    <div style={styles.reminderBox}>
                      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                        <label style={{ ...styles.label, margin: 0, display: 'flex', alignItems: 'center' }}>
                            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{marginRight:'8px'}}><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>
                            Enable Reminder
                        </label>
                        <div style={{ position: 'relative', width: '44px', height: '24px' }}>
                          <input type="checkbox" name="reminderEnabled" checked={formData.reminderEnabled} onChange={handleFormChange} style={{ opacity: 0, position: 'absolute', zIndex: -1 }} id="reminderToggle" />
                          <label htmlFor="reminderToggle" style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, borderRadius: '24px', cursor: 'pointer', transition: '0.3s', background: formData.reminderEnabled ? '#2563eb' : '#cbd5e1' }}></label>
                        </div>
                      </div>
                      {formData.reminderEnabled && (
                        <div style={{ marginTop: '16px' }}><input name="reminderTime" type="time" style={errors.reminderTime ? { ...styles.input, ...styles.inputError } : styles.input} value={formData.reminderTime} onChange={handleFormChange} />{errors.reminderTime && <span style={styles.errorText}>⚠️ {errors.reminderTime}</span>}</div>
                      )}
                    </div>
                    <div style={{ display: 'flex', gap: '10px' }}>
                        <button type="button" onClick={() => setActiveTab(1)} style={styles.backBtn}>
                            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{marginRight:'6px', verticalAlign:'text-bottom'}}><line x1="19" y1="12" x2="5" y2="12"/><polyline points="12 19 5 12 12 5"/></svg>
                            Back
                        </button>
                        <button type="submit" className="action-btn" style={styles.submitBtn}>
                            Start Journey 
                            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{marginLeft:'6px', verticalAlign:'text-bottom'}}><line x1="5" y1="12" x2="19" y2="12"/><polyline points="12 5 19 12 12 19"/></svg>
                        </button>
                    </div>
                  </div>
                )}
              </form>
            </div>
          </div>
        )}

        {completeModalOpen && (
          <div style={styles.modalOverlay}>
            <div style={{ ...styles.modalContent, maxWidth: '400px', textAlign: 'center', padding: '30px' }}>
              <h2 style={{ margin: '0 0 10px 0', color: '#111827', fontSize: '24px', fontWeight: '800' }}>Goal Completed?</h2>
              <p style={{color: '#6b7280', fontSize: '14px', marginBottom: '24px'}}>Marking this complete will archive it and update your stats.</p>
              <div style={{ display: 'flex', gap: '15px' }}><button onClick={() => setCompleteModalOpen(false)} style={styles.cancelBtn}>Not Yet</button><button onClick={confirmCompletion} style={styles.confirmBtn}>Verify ✓</button></div>
            </div>
          </div>
        )}
      </div>
    </>
  );
}

const styles = {
  dashboardContainer: { display: 'flex', minHeight: '100vh', width: '100%', fontFamily: "'Inter', 'Segoe UI', Roboto, sans-serif", backgroundColor: '#f9fafb' },
  sidebar: { width: '250px', backgroundColor: '#ffffff', padding: '20px', boxShadow: '2px 0 10px rgba(0, 0, 0, 0.05)', display: 'flex', flexDirection: 'column', position: 'fixed', top: 0, left: 0, bottom: 0, boxSizing: 'border-box', zIndex: 1000, overflowY: 'auto' },
  mainWrapper: { flex: 1, marginLeft: '250px', boxSizing: 'border-box' },
  mainContent: { maxWidth: '1000px', margin: '0 auto', padding: '48px 32px 96px 32px' },

  headerSection: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '40px', flexWrap: 'wrap', gap: '16px' },
  mainTitle: { fontSize: '36px', fontWeight: '800', color: '#111827', marginBottom: '12px', fontFamily: "Georgia, serif" },
  subTitle: { color: '#4b5563', fontSize: '16px', margin: 0, maxWidth: '600px', lineHeight: '1.5' },
  
  headerButtons: { display: 'flex', gap: '12px', flexWrap: 'wrap' },
  historyBtn: { display: 'flex', alignItems: 'center', background: '#ffffff', color: '#374151', padding: '12px 20px', borderRadius: '12px', border: '1px solid #e5e7eb', fontSize: '14px', fontWeight: '600', cursor: 'pointer', textDecoration: 'none', boxShadow: '0 1px 2px 0 rgba(0, 0, 0, 0.05)', transition: 'background 0.2s' },
  primaryBtn: { display: 'flex', alignItems: 'center', background: '#2563eb', color: '#fff', padding: '12px 24px', borderRadius: '12px', border: 'none', fontSize: '14px', fontWeight: '600', cursor: 'pointer', boxShadow: '0 1px 2px 0 rgba(0, 0, 0, 0.05)', transition: 'background-color 0.2s ease' },

  alertBox: { background: '#fef2f2', border: '1px solid #fecaca', padding: '16px 20px', borderRadius: '16px', display: 'flex', alignItems: 'center', gap: '16px', marginBottom: '32px' },
  
  dashboardStatsCard: { background: "#ffffff", border: "1px solid #f3f4f6", borderRadius: "24px", padding: "24px", boxShadow: "0 1px 3px 0 rgba(0, 0, 0, 0.05)", marginBottom: "32px" },
  statsHeader: { display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: "12px", marginBottom: "20px", flexWrap: "wrap" },
  statsEyebrow: { margin: 0, fontSize: "12px", fontWeight: 700, letterSpacing: "0.05em", textTransform: "uppercase", color: "#6b7280" },
  statsTitle: { margin: "4px 0 0 0", fontSize: "20px", fontWeight: 800, color: "#111827" },
  statsDateChip: { background: "#f3f4f6", color: "#4b5563", borderRadius: "999px", padding: "6px 12px", fontSize: "12px", fontWeight: 600 },
  statsGrid: { display: "grid", gap: "16px" },

  heroStatCard: { border: "1px solid #f3f4f6", background: "#ffffff", borderRadius: "16px", padding: "20px", display: "flex", alignItems: "center", justifyContent: "space-between", gap: "14px", minHeight: "145px" },
  heroLabel: { margin: 0, fontSize: "12px", color: "#6b7280", textTransform: "uppercase", letterSpacing: "0.05em", fontWeight: 700 },
  heroValue: { margin: "4px 0", fontSize: "40px", lineHeight: 1, fontWeight: 800, color: "#111827" },
  heroSubtext: { margin: 0, fontSize: "13px", color: "#4b5563", fontWeight: 500 },
  ringWrap: { position: "relative", width: "92px", height: "92px", display: "flex", alignItems: "center", justifyContent: "center" },
  ringCenterText: { position: "absolute", fontSize: "14px", fontWeight: 800, color: "#111827" },
  metricTile: { background: "#ffffff", border: "1px solid #f3f4f6", borderRadius: "16px", padding: "20px", display: "flex", flexDirection: "column", justifyContent: "space-between", minHeight: "145px" },
  metricIcon: { width: "36px", height: "36px", borderRadius: "10px", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "16px", marginBottom: "10px" },
  metricLabel: { margin: 0, fontSize: "12px", textTransform: "uppercase", letterSpacing: "0.05em", color: "#6b7280", fontWeight: 700 },
  metricValue: { margin: "8px 0 0 0", fontSize: "28px", lineHeight: 1.1, color: "#111827", fontWeight: 800 },

  controlsRow: { display: 'flex', justifyContent: 'space-between', gap: '16px', marginBottom: '24px', flexWrap: 'wrap' },
  searchBox: { position: 'relative', flexGrow: 1, maxWidth: '400px' },
  searchIcon: { position: 'absolute', left: '16px', top: '12px', color: '#9ca3af', fontSize: '16px', display: 'flex' },
  searchInput: { width: '100%', boxSizing: 'border-box', padding: '12px 16px 12px 44px', borderRadius: '12px', border: '1px solid #e5e7eb', background: '#ffffff', outline: 'none', fontSize: '14px', color: '#111827', boxShadow: '0 1px 2px 0 rgba(0, 0, 0, 0.05)' },
  filters: { display: 'flex', gap: '12px' },
  selectInput: { padding: '12px 16px', borderRadius: '12px', border: '1px solid #e5e7eb', background: '#ffffff', outline: 'none', fontSize: '14px', fontWeight: '500', color: '#374151', cursor: 'pointer', boxShadow: '0 1px 2px 0 rgba(0, 0, 0, 0.05)' },
  resetBtn: { padding: '12px 16px', borderRadius: '12px', border: '1px solid #e5e7eb', background: '#f9fafb', outline: 'none', fontSize: '14px', fontWeight: '600', color: '#374151', cursor: 'pointer', boxShadow: '0 1px 2px 0 rgba(0, 0, 0, 0.05)' },

  listContainer: { display: 'flex', flexDirection: 'column', gap: '16px' },
  listItemWrapper: { background: '#ffffff', borderRadius: '20px', border: '1px solid #f3f4f6', overflow: 'hidden', transition: 'all 0.2s ease', boxShadow: '0 1px 2px 0 rgba(0,0,0,0.05)' },
  listItemHeader: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '20px 24px', cursor: 'pointer', flexWrap: 'wrap', gap: '16px' },
  listLeft: { display: 'flex', alignItems: 'center', gap: '20px', flex: 1, minWidth: '0' },
  checkboxCircle: { width: '28px', height: '28px', borderRadius: '50%', border: '2px solid', display: 'flex', alignItems: 'center', justifyContent: 'center', transition: 'all 0.2s', flexShrink: 0 },
  goalInfo: { display: 'flex', flexDirection: 'column', gap: '6px', minWidth: '0' },
  goalTitleList: { fontSize: '18px', fontWeight: '700', margin: 0, color: '#111827', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' },
  
  badgeGroup: { display: 'flex', gap: '8px', flexWrap: 'wrap' },
  textBadge: { display: 'flex', alignItems: 'center', fontSize: '11px', fontWeight: '600', background: '#f3f4f6', color: '#4b5563', padding: '4px 10px', borderRadius: '6px' },
  urgentBadge: { fontSize: '11px', fontWeight: '600', background: '#fef2f2', color: '#dc2626', padding: '4px 10px', borderRadius: '6px' },
  overdueBadge: { fontSize: '11px', fontWeight: '600', background: '#fee2e2', color: '#b91c1c', padding: '4px 10px', borderRadius: '6px' },
  completedBadge: { fontSize: '11px', fontWeight: '600', background: '#dcfce7', color: '#166534', padding: '4px 10px', borderRadius: '6px' },

  listRight: { display: 'flex', alignItems: 'center', gap: '24px' },
  dateBlock: { textAlign: 'right', minWidth: '80px' },
  dateLabel: { fontSize: '10px', color: '#6b7280', fontWeight: '700', textTransform: 'uppercase', display: 'block', letterSpacing: '0.05em' },
  dateValue: { fontSize: '14px', fontWeight: '600', display: 'block', marginTop: '2px' },
  
  actionButtons: { display: 'flex', alignItems: 'center', gap: '10px' },
  chevron: { color: '#9ca3af', fontSize: '12px', transition: 'transform 0.2s', background: '#f3f4f6', width: '28px', height: '28px', display: 'flex', alignItems: 'center', justifyContent: 'center', borderRadius: '50%' },
  deleteBtn: { display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'transparent', border: 'none', color: '#9ca3af', cursor: 'pointer', padding: '4px', transition: 'color 0.2s' },

  expandedContent: { padding: '0 24px 24px 68px', borderTop: '1px solid #f9fafb', marginTop: '-4px' },
  detailGrid: { display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))', gap: '16px', paddingTop: '16px' },
  detailBlock: { background: '#f9fafb', padding: '16px', borderRadius: '12px', border: '1px solid #f3f4f6' },
  detailHeader: { fontSize: '10px', color: '#6b7280', fontWeight: '700', textTransform: 'uppercase', marginBottom: '6px', letterSpacing: '0.05em' },
  detailValue: { fontSize: '14px', color: '#111827', fontWeight: '600', lineHeight: '1.5' },

  emptyState: { textAlign: 'center', padding: '80px 20px', background: '#ffffff', borderRadius: '24px', border: '1px solid #f3f4f6' },

  modalOverlay: { position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(15, 23, 42, 0.6)', backdropFilter: 'blur(4px)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000, padding: '16px' },
  modalContent: { background: '#fff', width: '100%', maxWidth: '580px', borderRadius: '24px', boxShadow: '0 25px 50px -12px rgba(0,0,0,0.25)', overflow: 'hidden' },
  modalTitle: { fontSize: '24px', fontWeight: '800', margin: 0, color: '#111827' },
  iconBtn: { background: '#f3f4f6', border: 'none', borderRadius: '50%', width: '36px', height: '36px', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#6b7280', cursor: 'pointer' },

  tabContainer: { display: 'flex', padding: '0 28px', borderBottom: '1px solid #f3f4f6', marginTop: '16px', gap: '4px' },
  tabBtn: { background: 'none', border: 'none', borderBottom: '2px solid', padding: '12px 16px', fontSize: '13px', fontWeight: '600', cursor: 'pointer', transition: 'all 0.2s' },

  inputError: { border: '1px solid #ef4444', backgroundColor: '#fef2f2' },
  errorText: { color: '#ef4444', fontSize: '12px', fontWeight: '600', marginTop: '6px', display: 'flex', alignItems: 'center', gap: '4px' },

  formSection: { display: 'flex', flexDirection: 'column', gap: '20px' },
  inputGroup: { display: 'flex', flexDirection: 'column', gap: '8px' },
  label: { fontSize: '13px', fontWeight: '600', color: '#374151' },
  input: { width: '100%', boxSizing: 'border-box', padding: '12px 16px', borderRadius: '12px', border: '1px solid #e5e7eb', background: '#ffffff', outline: 'none', fontSize: '14px', color: '#111827', boxShadow: '0 1px 2px 0 rgba(0, 0, 0, 0.05)' },

  pillBtn: { display: 'flex', alignItems: 'center', padding: '8px 16px', borderRadius: '9999px', fontSize: '13px', fontWeight: '500', borderWidth: '1px', borderStyle: 'solid', cursor: 'pointer', transition: 'all 0.2s ease', outline: 'none' },
  pillActiveTeal: { background: '#0d9488', color: '#fff', borderColor: '#0d9488', boxShadow: '0 1px 2px rgba(0,0,0,0.05)' },
  pillInactive: { background: '#ffffff', color: '#4b5563', borderColor: '#e5e7eb' },
  priorityBtn: { flex: 1, padding: '10px', borderRadius: '12px', fontSize: '13px', fontWeight: '500', border: '1px solid', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', outline: 'none' },

  reminderBox: { background: '#f9fafb', padding: '20px', borderRadius: '16px', border: '1px solid #f3f4f6' },

  nextBtn: { display: 'flex', justifyContent: 'center', alignItems: 'center', background: '#eff6ff', color: '#2563eb', padding: '14px', borderRadius: '12px', border: 'none', fontWeight: '600', fontSize: '14px', cursor: 'pointer', flex: 1 },
  backBtn: { display: 'flex', justifyContent: 'center', alignItems: 'center', background: '#f3f4f6', color: '#4b5563', padding: '14px', borderRadius: '12px', border: 'none', fontWeight: '600', fontSize: '14px', cursor: 'pointer', flex: 1 },
  submitBtn: { display: 'flex', justifyContent: 'center', alignItems: 'center', background: '#2563eb', color: '#fff', padding: '14px', borderRadius: '12px', border: 'none', fontWeight: '600', fontSize: '14px', cursor: 'pointer', flex: 2 },

  cancelBtn: { flex: 1, padding: '14px', borderRadius: '12px', border: '1px solid #e5e7eb', background: '#fff', color: '#4b5563', fontWeight: '600', fontSize: '14px', cursor: 'pointer' },
  confirmBtn: { flex: 2, padding: '14px', borderRadius: '12px', border: 'none', background: '#2563eb', color: '#fff', fontWeight: '600', fontSize: '14px', cursor: 'pointer' },
};
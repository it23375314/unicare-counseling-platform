import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Link, useNavigate } from 'react-router-dom';

// Export Libraries
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import * as XLSX from 'xlsx';
import { Document, Packer, Paragraph, TextRun, HeadingLevel } from 'docx';
import { saveAs } from 'file-saver';

const CATEGORIES = ["Personal", "Academic", "Health", "Fitness", "Career"];

export default function GoalHistory() {
  const userId = localStorage.getItem('userId');
  const navigate = useNavigate();
  const [goals, setGoals] = useState([]);
  
  // Filter States
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('All'); 
  const [categoryFilter, setCategoryFilter] = useState('All');
  const [dateFrom, setDateFrom] = useState('');
  const [dateTo, setDateTo] = useState('');

  useEffect(() => {
    document.body.style.margin = "0";
    document.body.style.padding = "0";
    fetchHistory();
  }, []);

  const handleLogout = () => {
    if (window.confirm("Are you sure you want to log out?")) {
      localStorage.clear();
      window.location.href = '/login';
    }
  };

  const fetchHistory = async () => {
    try {
      const res = await axios.get(`http://localhost:5000/api/goals/${userId}`);
      setGoals(res.data);
    } catch (err) {
      console.error("Error fetching history", err);
    }
  };

  const toLocalYmd = (value) => {
    const d = new Date(value);
    const year = d.getFullYear();
    const month = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  };

  const getGoalStatus = (goal) => {
    if (goal.isCompleted) return 'Completed';
    const isOverdue = toLocalYmd(goal.targetDate) < toLocalYmd(new Date());
    if (isOverdue) return 'Expired';
    return 'Active';
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" });
  };

  const filteredGoals = goals.filter(goal => {
    const status = getGoalStatus(goal);
    const matchesSearch = goal.title.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = categoryFilter === 'All' || goal.category === categoryFilter;
    const matchesStatus = statusFilter === 'All' || status === statusFilter;
    
    let matchesDate = true;
    const goalDate = new Date(goal.targetDate).getTime();
    if (dateFrom) matchesDate = matchesDate && goalDate >= new Date(dateFrom).getTime();
    if (dateTo) matchesDate = matchesDate && goalDate <= new Date(dateTo).getTime();

    return matchesSearch && matchesCategory && matchesStatus && matchesDate;
  }).sort((a, b) => new Date(b.targetDate) - new Date(a.targetDate)); 

  const totalLifetime = goals.length;
  const totalCompleted = goals.filter(g => g.isCompleted).length;
  const lifetimeSuccessRate = totalLifetime > 0 ? Math.round((totalCompleted / totalLifetime) * 100) : 0;
  
  const categoryCounts = goals.reduce((acc, g) => {
    acc[g.category] = (acc[g.category] || 0) + 1;
    return acc;
  }, {});
  const mostCommonCategory = Object.keys(categoryCounts).length > 0 
    ? Object.keys(categoryCounts).reduce((a, b) => categoryCounts[a] > categoryCounts[b] ? a : b) 
    : "N/A";

  // Exports
  const exportPDF = () => {
    const doc = new jsPDF();
    doc.text("Student Wellness Goal History", 14, 20);
    doc.setFontSize(10);
    doc.text(`Generated on: ${new Date().toLocaleDateString()}`, 14, 28);
    const tableData = filteredGoals.map(g => [ g.title, g.category, getGoalStatus(g), formatDate(g.targetDate), g.streak ? `${g.streak} days` : '0 days' ]);
    autoTable(doc, { startY: 35, head: [['Goal Name', 'Category', 'Status', 'Deadline', 'Streak']], body: tableData, theme: 'grid', headStyles: { fillColor: [37, 99, 235] } });
    doc.save("Wellness-History.pdf");
  };

  const exportExcel = () => {
    const excelData = filteredGoals.map(g => ({ "Goal Name": g.title, "Category": g.category, "Status": getGoalStatus(g), "Deadline": formatDate(g.targetDate), "Frequency": g.frequency, "Final Streak": g.streak || 0, "Reward": g.reward || 'None' }));
    const worksheet = XLSX.utils.json_to_sheet(excelData);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Goals");
    XLSX.writeFile(workbook, "Wellness-History.xlsx");
  };

  const exportWord = () => {
    const children = [ new Paragraph({ text: "Student Wellness Goal History", heading: HeadingLevel.HEADING_1 }), new Paragraph({ text: `Generated on: ${new Date().toLocaleDateString()}`, spacing: { after: 400 } }) ];
    filteredGoals.forEach(g => {
      children.push( new Paragraph({ children: [ new TextRun({ text: `Title: ${g.title}`, bold: true }) ] }), new Paragraph({ text: `Category: ${g.category}` }), new Paragraph({ text: `Status: ${getGoalStatus(g)}` }), new Paragraph({ text: `Deadline: ${formatDate(g.targetDate)}` }), new Paragraph({ text: `Streak: ${g.streak || 0} days` }), new Paragraph({ text: "----------------------------------------" }) );
    });
    const doc = new Document({ sections: [{ children: children }] });
    Packer.toBlob(doc).then(blob => { saveAs(blob, "Wellness-History.docx"); });
  };

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
                    <li className="sidebar-item sub-item" onClick={() => navigate('/wellness')} style={{ backgroundColor: '#eff6ff', color: '#1d4ed8', fontWeight: 'bold', opacity: 1 }}>🎯 Goal Tracker</li>
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

        <div style={styles.mainWrapper}>
          <main style={styles.mainContent}>
            
            {/* Header */}
            <div style={styles.headerSection}>
              <div>
                <h1 style={styles.mainTitle}>Goal Archive</h1>
                <p style={styles.subTitle}>Reflect on your past wellness milestones and export your progress reports.</p>
              </div>
              <div style={styles.headerButtons}>
                <Link to="/wellness" style={styles.secondaryBtn}>
                  <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{marginRight: '6px', verticalAlign: 'text-bottom'}}><line x1="19" y1="12" x2="5" y2="12"/><polyline points="12 19 5 12 12 5"/></svg>
                  Back to Tracker
                </Link>
              </div>
            </div>

            {/* LIFETIME STATS */}
            <div style={styles.statsGrid}>
              <div style={styles.statCard}>
                <div style={{...styles.statIconWrap, background: '#eff6ff', color: '#2563eb'}}>
                  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M6 9H4.5a2.5 2.5 0 0 1 0-5H6"/><path d="M18 9h1.5a2.5 2.5 0 0 0 0-5H18"/><path d="M4 22h16"/><path d="M10 14.66V17c0 .55-.47.98-.97 1.21C7.85 18.75 7 20.24 7 22"/><path d="M14 14.66V17c0 .55.47.98.97 1.21C16.15 18.75 17 20.24 17 22"/><path d="M18 2H6v7a6 6 0 0 0 12 0V2Z"/></svg>
                </div>
                <div>
                  <p style={styles.statLabel}>Lifetime Completed</p>
                  <h2 style={styles.statValue}>{totalCompleted}</h2>
                </div>
              </div>
              <div style={styles.statCard}>
                <div style={{...styles.statIconWrap, background: '#ecfdf5', color: '#16a34a'}}>
                  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="22 7 13.5 15.5 8.5 10.5 2 17"/><polyline points="16 7 22 7 22 13"/></svg>
                </div>
                <div>
                  <p style={styles.statLabel}>Lifetime Success Rate</p>
                  <h2 style={styles.statValue}>{lifetimeSuccessRate}%</h2>
                </div>
              </div>
              <div style={styles.statCard}>
                <div style={{...styles.statIconWrap, background: '#faf5ff', color: '#9333ea'}}>
                  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/></svg>
                </div>
                <div>
                  <p style={styles.statLabel}>Top Category</p>
                  <h2 style={styles.statValue} className="truncate">{mostCommonCategory}</h2>
                </div>
              </div>
            </div>

            {/* FILTER BAR & EXPORT ROW */}
            <div style={styles.controlPanel}>
              <div style={styles.filterRow}>
                <div style={styles.searchBox}>
                    <span style={styles.searchIcon}>
                        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="11" cy="11" r="8"></circle><line x1="21" y1="21" x2="16.65" y2="16.65"></line></svg>
                    </span>
                    <input 
                    style={styles.searchInput} 
                    placeholder="Search history..." 
                    value={searchQuery} 
                    onChange={e => setSearchQuery(e.target.value)} 
                    />
                </div>
                
                <select style={styles.selectInput} value={statusFilter} onChange={e => setStatusFilter(e.target.value)}>
                  <option value="All">All Statuses</option>
                  <option value="Completed">Completed</option>
                  <option value="Active">Active</option>
                  <option value="Expired">Expired</option>
                </select>
                <select style={styles.selectInput} value={categoryFilter} onChange={e => setCategoryFilter(e.target.value)}>
                  <option value="All">All Categories</option>
                  {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
                </select>
                <div style={styles.dateGroup}>
                  <span style={styles.dateLabel}>From:</span>
                  <input type="date" style={styles.selectInput} value={dateFrom} onChange={e => setDateFrom(e.target.value)} />
                </div>
                <div style={styles.dateGroup}>
                  <span style={styles.dateLabel}>To:</span>
                  <input type="date" style={styles.selectInput} value={dateTo} onChange={e => setDateTo(e.target.value)} />
                </div>
              </div>

              <div style={styles.exportRow}>
                <span style={styles.exportLabel}>Download Report:</span>
                <button onClick={exportPDF} className="action-btn" style={{...styles.exportBtn, background: '#fee2e2', color: '#b91c1c'}}>
                  <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" style={{marginRight:'6px', display:'inline-block', verticalAlign:'text-bottom'}}><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="16" y1="13" x2="8" y2="13"/><line x1="16" y1="17" x2="8" y2="17"/><polyline points="10 9 9 9 8 9"/></svg>
                  PDF
                </button>
                <button onClick={exportExcel} className="action-btn" style={{...styles.exportBtn, background: '#dcfce7', color: '#15803d'}}>
                  <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" style={{marginRight:'6px', display:'inline-block', verticalAlign:'text-bottom'}}><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/><rect x="8" y="13" width="8" height="4"/></svg>
                  Excel
                </button>
                <button onClick={exportWord} className="action-btn" style={{...styles.exportBtn, background: '#eff6ff', color: '#1d4ed8'}}>
                  <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" style={{marginRight:'6px', display:'inline-block', verticalAlign:'text-bottom'}}><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="9" y1="15" x2="15" y2="15"/></svg>
                  Word
                </button>
              </div>
            </div>

            {/* RESULTS TABLE */}
            <div style={styles.tableContainer}>
              <table style={styles.table}>
                <thead>
                  <tr style={styles.tableHeadRow}>
                    <th style={styles.th}>Goal Name</th>
                    <th style={styles.th}>Category</th>
                    <th style={styles.th}>Deadline</th>
                    <th style={styles.th}>Status</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredGoals.length > 0 ? filteredGoals.map(goal => {
                    const status = getGoalStatus(goal);
                    return (
                      <tr key={goal._id} style={{
                        ...styles.tableRow,
                        opacity: status === 'Expired' ? 0.7 : 1,
                        background: status === 'Expired' ? '#f9fafb' : '#ffffff'
                      }}>
                        <td style={styles.td}>
                          <p style={{margin: 0, fontWeight: '700', color: status === 'Expired' ? '#6b7280' : '#111827', fontSize: '15px'}}>{goal.title}</p>
                          <p style={{margin: '4px 0 0 0', fontSize: '13px', color: '#6b7280'}}>{goal.description || 'No description'}</p>
                        </td>
                        <td style={styles.td}>
                          <span style={styles.categoryBadge}>{goal.category}</span>
                        </td>
                        <td style={styles.td}>
                          <span style={{fontWeight: '600', color: '#4b5563', fontSize: '14px'}}>{formatDate(goal.targetDate)}</span>
                        </td>
                        <td style={styles.td}>
                          <span style={{
                            ...styles.statusBadge,
                            background: status === 'Completed' ? '#dcfce7' : status === 'Expired' ? '#f3f4f6' : '#fef3c7',
                            color: status === 'Completed' ? '#166534' : status === 'Expired' ? '#4b5563' : '#b45309',
                          }}>
                            {status === 'Completed' ? (
                                <><svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" style={{marginRight:'4px', display:'inline-block', verticalAlign:'text-bottom'}}><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/><polyline points="22 4 12 14.01 9 11.01"/></svg> Completed</>
                            ) : status === 'Expired' ? (
                                <><svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" style={{marginRight:'4px', display:'inline-block', verticalAlign:'text-bottom'}}><circle cx="12" cy="12" r="10"/><line x1="15" y1="9" x2="9" y2="15"/><line x1="9" y1="9" x2="15" y2="15"/></svg> Expired</>
                            ) : (
                                <><svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" style={{marginRight:'4px', display:'inline-block', verticalAlign:'text-bottom'}}><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg> Active</>
                            )}
                          </span>
                        </td>
                      </tr>
                    )
                  }) : (
                    <tr>
                      <td colSpan="4" style={{textAlign: 'center', padding: '60px', color: '#6b7280', fontSize: '15px'}}>
                        No history found for the selected filters.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
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
  mainContent: { maxWidth: '1100px', margin: '0 auto', padding: '48px 32px 96px 32px' },

  headerSection: { display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: '24px', flexWrap: 'wrap', marginBottom: '40px' },
  mainTitle: { fontSize: '36px', fontWeight: '800', color: '#111827', margin: '0 0 16px 0', fontFamily: "Georgia, serif" },
  subTitle: { color: '#4b5563', fontSize: '16px', margin: 0, maxWidth: '600px', lineHeight: '1.5' },
  headerButtons: { display: 'flex', gap: '12px' },
  secondaryBtn: { display: 'inline-flex', alignItems: 'center', backgroundColor: '#ffffff', color: '#374151', padding: '10px 20px', borderRadius: '12px', fontWeight: '600', fontSize: '14px', textDecoration: 'none', border: '1px solid #e5e7eb', boxShadow: '0 1px 2px rgba(0,0,0,0.05)', transition: 'all 0.2s' },

  // Stats
  statsGrid: { display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '24px', marginBottom: '32px' },
  statCard: { background: '#fff', borderRadius: '24px', padding: '24px', display: 'flex', alignItems: 'center', gap: '16px', border: '1px solid #f3f4f6', boxShadow: '0 1px 2px 0 rgba(0, 0, 0, 0.05)' },
  statIconWrap: { width: '56px', height: '56px', borderRadius: '16px', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 },
  statLabel: { margin: 0, fontSize: '12px', textTransform: 'uppercase', letterSpacing: '0.05em', color: '#6b7280', fontWeight: '700' },
  statValue: { margin: '4px 0 0 0', fontSize: '32px', fontWeight: '800', color: '#111827', lineHeight: 1 },

  // Controls
  controlPanel: { background: '#fff', padding: '24px', borderRadius: '24px', border: '1px solid #f3f4f6', marginBottom: '32px', display: 'flex', flexDirection: 'column', gap: '24px', boxShadow: '0 1px 2px 0 rgba(0, 0, 0, 0.05)' },
  filterRow: { display: 'flex', gap: '16px', flexWrap: 'wrap', alignItems: 'center' },
  
  searchBox: { position: 'relative', flexGrow: 1, minWidth: '200px' },
  searchIcon: { position: 'absolute', top: '50%', left: '16px', transform: 'translateY(-50%)', color: '#9ca3af', display: 'flex', alignItems: 'center' }, 
  searchInput: { width: '100%', boxSizing: 'border-box', padding: '12px 16px 12px 44px', borderRadius: '12px', border: '1px solid #e5e7eb', backgroundColor: '#ffffff', outline: 'none', fontSize: '14px', color: '#111827' },
  
  selectInput: { padding: '12px 16px', borderRadius: '12px', border: '1px solid #e5e7eb', outline: 'none', fontSize: '14px', fontWeight: '500', color: '#374151', cursor: 'pointer', background: '#fff' },
  dateGroup: { display: 'flex', alignItems: 'center', gap: '8px' },
  dateLabel: { fontSize: '13px', fontWeight: '600', color: '#4b5563' },
  
  exportRow: { display: 'flex', gap: '12px', alignItems: 'center', paddingTop: '20px', borderTop: '1px solid #f3f4f6', flexWrap: 'wrap' },
  exportLabel: { fontSize: '13px', fontWeight: '700', color: '#374151', textTransform: 'uppercase', letterSpacing: '0.05em' },
  exportBtn: { display: 'inline-flex', alignItems: 'center', padding: '8px 20px', borderRadius: '8px', border: 'none', fontWeight: '600', fontSize: '13px', cursor: 'pointer', boxShadow: '0 1px 2px 0 rgba(0, 0, 0, 0.05)' },

  // Table
  tableContainer: { background: '#fff', borderRadius: '24px', border: '1px solid #f3f4f6', overflow: 'hidden', boxShadow: '0 1px 2px 0 rgba(0, 0, 0, 0.05)' },
  table: { width: '100%', borderCollapse: 'collapse', textAlign: 'left' },
  tableHeadRow: { background: '#ffffff', borderBottom: '1px solid #e5e7eb' },
  th: { padding: '20px 24px', fontSize: '12px', textTransform: 'uppercase', letterSpacing: '0.05em', color: '#6b7280', fontWeight: '700' },
  tableRow: { borderBottom: '1px solid #f3f4f6', transition: 'background 0.2s' },
  td: { padding: '20px 24px', verticalAlign: 'middle' },
  
  // Badges
  categoryBadge: { fontSize: '12px', fontWeight: '600', background: '#f3f4f6', color: '#4b5563', padding: '6px 12px', borderRadius: '8px' },
  statusBadge: { fontSize: '12px', fontWeight: '700', textTransform: 'uppercase', padding: '6px 12px', borderRadius: '8px', display: 'inline-block' },
};
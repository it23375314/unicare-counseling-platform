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
  const userName = localStorage.getItem('userName') || 'Current Student';
  const userRole = localStorage.getItem('userRole') || 'student';
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

  const getLongestRunValue = (goal) => {
    const storedRun = Number(goal.longestRun || goal.streak || 0);
    if (storedRun > 1) return storedRun;

    const startDate = goal.createdAt ? new Date(goal.createdAt) : new Date(goal.targetDate);
    const endDate = goal.isCompleted ? new Date(goal.updatedAt || goal.targetDate) : new Date();
    const start = new Date(`${toLocalYmd(startDate)}T00:00:00`).getTime();
    const end = new Date(`${toLocalYmd(endDate)}T00:00:00`).getTime();

    return Math.max(1, Math.floor((end - start) / 86400000) + 1);
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
    const tableData = filteredGoals.map(g => [ g.title, g.category, getGoalStatus(g), formatDate(g.targetDate), `${getLongestRunValue(g)} days` ]);
    autoTable(doc, { startY: 35, head: [['Goal Name', 'Category', 'Status', 'Deadline', 'Longest Run']], body: tableData, theme: 'grid', headStyles: { fillColor: [37, 99, 235] } });
    doc.save("Wellness-History.pdf");
  };

  const exportExcel = () => {
    const excelData = filteredGoals.map(g => ({ "Goal Name": g.title, "Category": g.category, "Status": getGoalStatus(g), "Deadline": formatDate(g.targetDate), "Frequency": g.frequency, "Longest Run": getLongestRunValue(g), "Reward": g.reward || 'None' }));
    const worksheet = XLSX.utils.json_to_sheet(excelData);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Goals");
    XLSX.writeFile(workbook, "Wellness-History.xlsx");
  };

  const exportWord = () => {
    const children = [ new Paragraph({ text: "Student Wellness Goal History", heading: HeadingLevel.HEADING_1 }), new Paragraph({ text: `Generated on: ${new Date().toLocaleDateString()}`, spacing: { after: 400 } }) ];
    filteredGoals.forEach(g => {
      children.push( new Paragraph({ children: [ new TextRun({ text: `Title: ${g.title}`, bold: true }) ] }), new Paragraph({ text: `Category: ${g.category}` }), new Paragraph({ text: `Status: ${getGoalStatus(g)}` }), new Paragraph({ text: `Deadline: ${formatDate(g.targetDate)}` }), new Paragraph({ text: `Longest Run: ${getLongestRunValue(g)} days` }), new Paragraph({ text: "----------------------------------------" }) );
    });
    const doc = new Document({ sections: [{ children: children }] });
    Packer.toBlob(doc).then(blob => { saveAs(blob, "Wellness-History.docx"); });
  };

  const clearSearch = () => {
    setSearchQuery('');
  };

  return (
    <>
      <style>{`
        .action-btn { transition: background-color 0.2s ease; }
        .action-btn:hover { background-color: #1d4ed8 !important; }
        .action-btn.export-pdf:hover { background-color: #fee2e2 !important; }
        .action-btn.export-excel:hover { background-color: #dcfce7 !important; }
        .action-btn.export-word:hover { background-color: #eff6ff !important; }

        /* Nav & Footer Hover Effects */
        .nav-link:hover { color: #2563eb; }
        .footer-link:hover { color: #ffffff; text-decoration: underline; }
      `}</style>

      <div style={styles.dashboardContainer}>
        
        {/* --- TOP NAVBAR --- */}
        <nav style={styles.navbar}>
          <div style={styles.navLeft} onClick={() => navigate('/')}>
            <div style={styles.logoBox}>
              <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"></path>
                <polyline points="9 12 11 14 15 10"></polyline>
              </svg>
            </div>
            <span style={styles.logoText}>UniCare</span>
          </div>

          <div style={styles.navLinks}>
            <Link to="/" className="nav-link" style={styles.navLink}>Home</Link>
            <Link to="/about" className="nav-link" style={styles.navLink}>About Us</Link>
            <Link to="/counsellors" className="nav-link" style={styles.navLink}>Find a Counsellor</Link>
            <Link to="/dashboard" className="nav-link" style={styles.navLink}>Dashboard</Link>
            <Link to="/wellness-dashboard" style={styles.navLinkActive}>My Wellness Portal</Link>
          </div>

          <div style={styles.navRight}>
            <div style={styles.userPill} onClick={handleLogout}>
              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#2563eb" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path>
                <circle cx="12" cy="7" r="4"></circle>
              </svg>
              {userName} ({userRole})
            </div>
          </div>
        </nav>

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
                  {searchQuery && (
                    <button type="button" onClick={clearSearch} style={styles.clearSearchBtn} title="Clear search">✕</button>
                  )}
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
                <button onClick={exportPDF} className="action-btn export-pdf" style={{...styles.exportBtn, background: '#fee2e2', color: '#b91c1c'}}>
                  <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" style={{marginRight:'6px', display:'inline-block', verticalAlign:'text-bottom'}}><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="16" y1="13" x2="8" y2="13"/><line x1="16" y1="17" x2="8" y2="17"/><polyline points="10 9 9 9 8 9"/></svg>
                  PDF
                </button>
                <button onClick={exportExcel} className="action-btn export-excel" style={{...styles.exportBtn, background: '#dcfce7', color: '#15803d'}}>
                  <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" style={{marginRight:'6px', display:'inline-block', verticalAlign:'text-bottom'}}><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/><rect x="8" y="13" width="8" height="4"/></svg>
                  Excel
                </button>
                <button onClick={exportWord} className="action-btn export-word" style={{...styles.exportBtn, background: '#eff6ff', color: '#1d4ed8'}}>
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

        {/* --- FOOTER --- */}
        <footer style={styles.footer}>
          <div style={styles.footerGrid}>
            <div>
              <h3 style={styles.footerHeading}>UniCare</h3>
              <p style={styles.footerText}>Empowering university students with accessible, secure, and private mental health counseling.</p>
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
  mainContent: { maxWidth: '1100px', margin: '0 auto', padding: '48px 32px 96px 32px' },

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
  clearSearchBtn: { position: 'absolute', top: '50%', right: '12px', transform: 'translateY(-50%)', width: '24px', height: '24px', borderRadius: '9999px', border: 'none', background: '#f3f4f6', color: '#6b7280', cursor: 'pointer', fontSize: '14px', lineHeight: 1, display: 'flex', alignItems: 'center', justifyContent: 'center' },
  
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

  // --- FOOTER ---
  footer: { backgroundColor: '#0f172a', color: '#e2e8f0', padding: '64px 40px 24px 40px', marginTop: 'auto' },
  footerGrid: { display: 'grid', gridTemplateColumns: '2fr 1fr 1fr 1fr', gap: '40px', maxWidth: '1200px', margin: '0 auto', marginBottom: '48px' },
  footerHeading: { fontSize: '16px', fontWeight: '700', marginBottom: '20px', color: '#ffffff' },
  footerText: { fontSize: '14px', color: '#94a3b8', lineHeight: '1.6', maxWidth: '300px' },
  footerLink: { display: 'block', fontSize: '14px', color: '#94a3b8', textDecoration: 'none', marginBottom: '12px', transition: 'color 0.2s' },
  footerBottom: { borderTop: '1px solid #1e293b', paddingTop: '24px', textAlign: 'center', fontSize: '14px', color: '#64748b' }
};

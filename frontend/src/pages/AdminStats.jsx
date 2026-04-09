import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Link } from 'react-router-dom';

export default function AdminStats() {
    const [stats, setStats] = useState([]);
    const [loading, setLoading] = useState(true);
    const userName = localStorage.getItem('userName');

    useEffect(() => {
        // Ensures no white margins around the gradient background
        document.body.style.margin = "0";
        document.body.style.padding = "0";

        axios.get('http://localhost:5001/api/resources/all')
            .then(res => {
                // Sort by highest views first for better UX
                const sortedData = res.data.sort((a, b) => (b.usageCount || 0) - (a.usageCount || 0));
                setStats(sortedData);
                setLoading(false);
            })
            .catch(err => {
                console.error(err);
                setLoading(false);
            });
    }, []);

    const handleLogout = () => {
        if (window.confirm("End admin session?")) {
            localStorage.clear();
            window.location.href = '/login';
        }
    };

    return (
        <div style={styles.pageWrapper}>
            
            {/* --- FLOATING PILL NAVBAR (ADMIN VER.) --- */}
            <div style={styles.navContainer}>
                <nav style={styles.navbar}>
                    {/* Brand */}
                    <div style={styles.brand}>
                        <span style={{ color: '#7c3aed', fontWeight: '900' }}>ADMIN</span>
                        <span style={{ color: '#1e293b', fontWeight: '900' }}>PORTAL</span>
                    </div>

                    <div style={styles.navLinks}>
                        <Link to="/admin-dashboard" style={styles.navLink}>Dashboard</Link>
                        <Link to="/admin/resources" style={styles.navLink}>Manage Resources</Link>
                        {/* Active Link: Performance */}
                        <Link to="/admin/stats" style={styles.navLinkActivePurple}>Performance</Link>
                        
                        <div style={styles.navDivider}></div>
                        
                        <div style={styles.adminProfile}>
                            <span style={{fontSize: '14px'}}>👑</span> 
                            <span style={{fontWeight: '900', fontSize: '11px', color: '#1e293b', textTransform: 'uppercase'}}>
                                {userName?.split(' ')[0] || "Admin"}
                            </span>
                        </div>
                        
                        <button onClick={handleLogout} style={styles.logoutBtn}>Logout</button>
                    </div>
                </nav>
            </div>

            <main style={styles.mainContent}>
                
                {/* --- HEADER --- */}
                <div style={styles.headerSection}>
                    <div>
                        <h1 style={styles.mainTitle}>Resource <span style={{color: '#7c3aed'}}>Performance</span></h1>
                        <p style={styles.subTitle}>Track engagement and monitor which wellness content performs best.</p>
                    </div>
                </div>

                {/* --- STATS TABLE --- */}
                <div style={styles.tableContainer}>
                    <table style={styles.table}>
                        <thead style={styles.tableHead}>
                            <tr>
                                <th style={styles.th}>Resource Title</th>
                                <th style={styles.th}>Category</th>
                                <th style={{...styles.th, textAlign: 'center'}}>Total Views</th>
                            </tr>
                        </thead>
                        <tbody>
                            {loading ? (
                                <tr>
                                    <td colSpan="3" style={styles.emptyState}>Loading Analytics...</td>
                                </tr>
                            ) : stats.length === 0 ? (
                                <tr>
                                    <td colSpan="3" style={styles.emptyState}>No usage data available yet.</td>
                                </tr>
                            ) : (
                                stats.map(res => (
                                    <tr key={res._id} style={styles.tr}>
                                        <td style={{...styles.td, fontWeight: '900', color: '#1e293b'}}>
                                            {res.title}
                                        </td>
                                        <td style={styles.td}>
                                            <span style={styles.categoryBadge}>
                                                {res.category}
                                            </span>
                                        </td>
                                        <td style={{...styles.td, textAlign: 'center'}}>
                                            <span style={styles.usageBadge}>
                                                {res.usageCount || 0} Students
                                            </span>
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>

            </main>
        </div>
    );
}

// ==========================================
// PURE CSS-IN-JS FOR GUARANTEED DESIGN
// ==========================================
const styles = {
    pageWrapper: {
        minHeight: '100vh',
        width: '100%',
        fontFamily: "'Inter', 'Segoe UI', sans-serif",
        paddingBottom: '80px',
        boxSizing: 'border-box',
    },

    // --- FLOATING NAVBAR (ADMIN) ---
    navContainer: { padding: '20px 20px 0 20px', display: 'flex', justifyContent: 'center', position: 'sticky', top: 0, zIndex: 1000 },
    navbar: {
        display: 'flex', alignItems: 'center', justifyContent: 'space-between', width: '100%', maxWidth: '1200px',
        backgroundColor: 'rgba(255, 255, 255, 0.85)', backdropFilter: 'blur(15px)', WebkitBackdropFilter: 'blur(15px)',
        borderRadius: '50px', padding: '10px 24px', boxShadow: '0 4px 20px rgba(0, 0, 0, 0.04)', border: '1px solid rgba(255, 255, 255, 0.6)',
    },
    brand: { fontSize: '18px', letterSpacing: '-0.5px', display: 'flex', gap: '3px' },
    navLinks: { display: 'flex', alignItems: 'center', gap: '20px' },
    navLink: { textDecoration: 'none', color: '#475569', fontSize: '11px', fontWeight: '800', textTransform: 'uppercase', letterSpacing: '0.5px', transition: 'color 0.2s' },
    navLinkActivePurple: {
        textDecoration: 'none', backgroundColor: '#f3e8ff', color: '#7e22ce', fontSize: '11px', fontWeight: '900', 
        textTransform: 'uppercase', letterSpacing: '0.5px', padding: '8px 18px', borderRadius: '20px',
    },
    navDivider: { width: '1px', height: '20px', backgroundColor: 'rgba(0,0,0,0.1)' },
    adminProfile: { display: 'flex', alignItems: 'center', gap: '6px', backgroundColor: 'rgba(255,255,255,0.5)', padding: '6px 12px', borderRadius: '20px' },
    logoutBtn: { backgroundColor: '#fee2e2', color: '#ef4444', border: 'none', padding: '8px 18px', borderRadius: '20px', fontSize: '11px', fontWeight: '900', textTransform: 'uppercase', cursor: 'pointer' },

    // --- MAIN CONTENT & HEADER ---
    mainContent: { maxWidth: '1000px', margin: '40px auto 0 auto', padding: '0 20px' },
    headerSection: { display: 'flex', flexDirection: 'column', gap: '10px', marginBottom: '40px' },
    mainTitle: { fontSize: '42px', fontWeight: '900', letterSpacing: '-1px', margin: '0', color: '#1e293b' },
    subTitle: { color: '#64748b', fontSize: '15px', margin: 0, fontWeight: '500' },

    // --- TABLE STYLES ---
    tableContainer: {
        backgroundColor: 'rgba(255, 255, 255, 0.7)', backdropFilter: 'blur(15px)', WebkitBackdropFilter: 'blur(15px)',
        borderRadius: '30px', border: '1px solid rgba(255, 255, 255, 0.9)',
        boxShadow: '0 15px 35px -5px rgba(0, 0, 0, 0.05)', overflow: 'hidden',
    },
    table: { width: '100%', borderCollapse: 'collapse' },
    tableHead: { backgroundColor: 'rgba(255, 255, 255, 0.5)' },
    th: {
        padding: '20px 30px', textAlign: 'left', fontSize: '11px',
        fontWeight: '900', textTransform: 'uppercase', color: '#64748b',
        letterSpacing: '1px', borderBottom: '1px solid rgba(0,0,0,0.05)'
    },
    tr: { transition: 'background-color 0.2s', ':hover': { backgroundColor: 'rgba(255,255,255,0.9)' } },
    td: { padding: '20px 30px', borderBottom: '1px solid rgba(0,0,0,0.03)', fontSize: '14px' },
    
    // --- BADGES ---
    categoryBadge: {
        backgroundColor: 'rgba(255,255,255,0.8)', color: '#475569', 
        padding: '6px 14px', borderRadius: '10px', fontSize: '10px', 
        fontWeight: '900', textTransform: 'uppercase', letterSpacing: '0.5px'
    },
    usageBadge: {
        backgroundColor: '#dcfce7', color: '#166534', 
        padding: '8px 18px', borderRadius: '20px', fontSize: '11px', 
        fontWeight: '900', textTransform: 'uppercase', letterSpacing: '0.5px',
        display: 'inline-block', boxShadow: '0 2px 10px rgba(22, 101, 52, 0.1)'
    },

    emptyState: { textAlign: 'center', padding: '60px 20px', color: '#64748b', fontWeight: '800', fontSize: '14px', textTransform: 'uppercase', letterSpacing: '1px' }
};

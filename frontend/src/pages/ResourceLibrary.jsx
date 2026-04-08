import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Link, useNavigate } from 'react-router-dom';

export default function ResourceLibrary() {
    const [resources, setResources] = useState([]);
    const [search, setSearch] = useState('');
    const [activeFilter, setActiveFilter] = useState('All');
    const [loading, setLoading] = useState(true);
    
    const navigate = useNavigate();
    const itNumber = localStorage.getItem('itNumber');
    const userName = localStorage.getItem('userName') || 'Current Student';
    const userRole = localStorage.getItem('userRole') || 'student';

    // Helper to safely remove HTML tags for preview texts
    const stripHtml = (html) => {
        if (!html) return '';
        return html.replace(/<[^>]*>?/gm, '').trim();
    };

    useEffect(() => {
        document.body.style.margin = "0";
        document.body.style.padding = "0";
        fetchData();
    }, []);

    const fetchData = async () => {
        setLoading(true);
        try {
            const res = await axios.get(`http://localhost:5000/api/resources/all`);
            setResources(res.data);
        } catch (err) { 
            console.error(err);
        }
        setLoading(false);
    };

    const handleView = async (item) => {
        try {
            await axios.post(`http://localhost:5000/api/resources/view/${item._id}`, { itNumber });
        } catch (err) { 
            console.error("Tracking error", err); 
        }
        navigate(`/resources/${item._id}`);
    };

    const handleLogout = () => {
        if (window.confirm("Are you sure you want to log out?")) {
            localStorage.clear();
            window.location.href = '/login';
        }
    };

    const normalizedSearch = search.trim().toLowerCase();
    const filteredResources = resources.filter(item => {
        const matchesSearch = !normalizedSearch ||
            [stripHtml(item.title), item.category, stripHtml(item.description)].some(value =>
                value?.toLowerCase().includes(normalizedSearch)
            ) ||
            (item.tags || []).some(tag => tag.toLowerCase().includes(normalizedSearch));
        const matchesType = activeFilter === 'All' || item.resourceType === activeFilter;
        return matchesSearch && matchesType;
    });

    const filterOptions = [
        { label: 'All Resources', value: 'All' },
        { label: 'Video Courses', value: 'Video' },
        { label: 'Digital PDFs', value: 'PDF' },
        { label: 'Articles', value: 'Article' },
        { label: 'Audio', value: 'Audio' }
    ];

    return (
        <>
            <style>{`
                .resource-card { transition: box-shadow 0.3s ease, transform 0.3s ease; }
                .resource-card:hover { box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05); transform: translateY(-2px); }
                
                .action-btn { transition: background-color 0.2s ease; }
                .action-btn:hover { background-color: #1d4ed8 !important; }
                
                /* EXPLICIT CSS TO OVERRIDE ALL BROWSER DEFAULTS */
                .filter-btn { outline: none !important; -webkit-tap-highlight-color: transparent; }
                .filter-btn:focus, .filter-btn:active { outline: none !important; border-color: #e5e7eb !important; box-shadow: 0 1px 2px 0 rgba(0, 0, 0, 0.05) !important; }
                .filter-btn-active:focus, .filter-btn-active:active { outline: none !important; border-color: #2563eb !important; }
                .filter-btn:hover { background-color: #f9fafb !important; border-color: #d1d5db !important; }
                .filter-btn-active:hover { background-color: #1d4ed8 !important; border-color: #1d4ed8 !important; }

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
                        
                        <div style={styles.headerSection}>
                            <Link to="/wellness-dashboard" style={styles.backToDashBtn}>
                                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{marginRight:'6px'}}><polyline points="15 18 9 12 15 6"/><line x1="9" y1="12" x2="21" y2="12"/></svg>
                                Back to Wellness Portal
                            </Link>
                            <div>
                                <h1 style={styles.mainTitle}>Health Library</h1>
                                <p style={styles.subTitle}>
                                    Browse our directory of premium wellness materials specializing in student mental health challenges. Find the perfect resource for your needs and schedule.
                                </p>
                            </div>
                        </div>

                        <div style={styles.searchFilterContainer}>
                            <div style={styles.searchBox}>
                                <span style={styles.searchIcon}>
                                    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="11" cy="11" r="8"></circle><line x1="21" y1="21" x2="16.65" y2="16.65"></line></svg>
                                </span>
                                <input 
                                    style={styles.searchInput} 
                                    placeholder="Search by name, topic, or keyword..." 
                                    value={search}
                                    onChange={(e) => setSearch(e.target.value)}
                                />
                                {search && (
                                    <button onClick={() => setSearch('')} style={styles.clearSearchBtn} title="Clear search">✖</button>
                                )}
                            </div>
                        </div>

                        <div style={styles.categoryRow}>
                            {filterOptions.map((filter) => (
                                <button 
                                    key={filter.value}
                                    className={`filter-btn ${activeFilter === filter.value ? 'filter-btn-active' : ''}`}
                                    onClick={() => setActiveFilter(filter.value)}
                                    style={{
                                        ...styles.filterBtn, 
                                        ...(activeFilter === filter.value ? styles.filterBtnActive : {})
                                    }}
                                >
                                    {filter.label}
                                </button>
                            ))}
                        </div>

                        {loading ? (
                            <div style={styles.loadingState}>Loading Resources...</div>
                        ) : filteredResources.length === 0 ? (
                            <div style={styles.emptyState}>
                                <p style={styles.emptyStateText}>No resources found matching your search criteria.</p>
                            </div>
                        ) : (
                            <div style={styles.listContainer}>
                                {filteredResources.map(item => {
                                    return (
                                        <div key={item._id} className="resource-card" style={styles.card}>
                                            <img 
                                                src={item.imageUrl || 'https://via.placeholder.com/150x150?text=Resource'} 
                                                alt="cover" 
                                                style={styles.cardImage} 
                                            />
                                            <div style={styles.cardBody}>
                                                <div style={styles.titleRow}>
                                                    <h3 style={styles.cardTitle} title={stripHtml(item.title)}>
                                                        {stripHtml(item.title)}
                                                    </h3>
                                                </div>
                                                <p style={styles.categoryText}>{item.category}</p>
                                                <div style={styles.metaDataContainer}>
                                                    <div style={styles.metaRow}>
                                                        <span style={styles.metaIcon}>
                                                            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M22 19a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5l2 3h9a2 2 0 0 1 2 2z"></path></svg>
                                                        </span> 
                                                        {item.resourceType}
                                                    </div>
                                                    <div style={styles.metaRow}>
                                                        <span style={styles.metaIcon}>
                                                            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"></circle><line x1="2" y1="12" x2="22" y2="12"></line><path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"></path></svg>
                                                        </span> 
                                                        {item.language || 'English'}
                                                    </div>
                                                </div>
                                                <div style={styles.cardFooter}>
                                                    <span style={styles.priceText}>Free Access</span>
                                                    <button 
                                                        className="action-btn"
                                                        onClick={() => handleView(item)} 
                                                        style={styles.actionBtn}
                                                    >
                                                        Open Resource
                                                    </button>
                                                </div>
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                        )}
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

    headerSection: { marginBottom: '48px', display: 'flex', flexDirection: 'column', gap: '16px' }, 
    mainTitle: { fontSize: '36px', fontWeight: '800', color: '#111827', marginBottom: '16px', fontFamily: "Georgia, serif" }, 
    subTitle: { color: '#4b5563', fontSize: '16px', marginBottom: '32px', maxWidth: '672px', lineHeight: '1.5' }, 
    backToDashBtn: { display: 'inline-flex', alignItems: 'center', gap: '6px', background: '#e0f2fe', color: '#0b63d3', padding: '10px 16px', borderRadius: '9999px', border: '1px solid #bae6fd', fontSize: '14px', fontWeight: '600', textDecoration: 'none', width: 'fit-content', boxShadow: '0 1px 2px rgba(15, 23, 42, 0.08)' },
    
    searchFilterContainer: { display: 'flex', flexDirection: 'row', gap: '16px', marginBottom: '20px' },
    searchBox: { position: 'relative', flexGrow: 1 },
    searchIcon: { position: 'absolute', top: '50%', left: '16px', transform: 'translateY(-50%)', color: '#9ca3af', display: 'flex', alignItems: 'center' }, 
    searchInput: { 
        width: '100%', 
        padding: '16px 16px 16px 44px', 
        backgroundColor: '#ffffff', 
        borderWidth: '1px',
        borderStyle: 'solid',
        borderColor: '#e5e7eb', 
        borderRadius: '12px', 
        fontSize: '14px', 
        color: '#111827', 
        boxShadow: '0 1px 2px 0 rgba(0, 0, 0, 0.05)', 
        outline: 'none',
        boxSizing: 'border-box',
        transition: 'border-color 0.2s'
    },
    clearSearchBtn: { position: 'absolute', top: '50%', right: '16px', transform: 'translateY(-50%)', background: 'transparent', border: 'none', color: '#9ca3af', fontSize: '14px', cursor: 'pointer', outline: 'none' },

    categoryRow: { display: 'flex', gap: '12px', flexWrap: 'wrap', marginBottom: '40px' },
    
    filterBtn: { 
        backgroundColor: '#ffffff', 
        borderWidth: '1px',
        borderStyle: 'solid',
        borderColor: '#e5e7eb',
        color: '#4b5563', 
        padding: '10px 20px', 
        borderRadius: '12px', 
        fontSize: '14px',
        fontWeight: '500',
        cursor: 'pointer',
        transition: 'all 0.2s ease',
        boxShadow: '0 1px 2px 0 rgba(0, 0, 0, 0.05)',
        outline: 'none'
    },
    filterBtnActive: { 
        backgroundColor: '#2563eb', 
        borderWidth: '1px',
        borderStyle: 'solid',
        borderColor: '#2563eb', 
        color: '#ffffff', 
        fontWeight: '600'
    },

    loadingState: { textAlign: 'center', padding: '80px 0', color: '#6b7280', fontSize: '18px' },
    emptyState: { padding: '80px 0', textAlign: 'center' },
    emptyStateText: { color: '#6b7280', fontSize: '18px' }, 

    listContainer: { display: 'flex', flexDirection: 'column', gap: '32px' },
    
    card: { 
        backgroundColor: '#ffffff', 
        borderRadius: '24px', 
        padding: '24px', 
        border: '1px solid #f3f4f6', 
        boxShadow: '0 1px 2px 0 rgba(0, 0, 0, 0.05)', 
        display: 'flex', 
        flexDirection: 'row', 
        gap: '24px', 
        cursor: 'pointer'
    },
    
    cardImage: { width: '140px', height: '140px', borderRadius: '16px', objectFit: 'cover', flexShrink: 0, backgroundColor: '#f3f4f6' },
    cardBody: { display: 'flex', flexDirection: 'column', flexGrow: 1, padding: '4px 0' },
    
    titleRow: { display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '8px' },
    cardTitle: { fontSize: '20px', fontWeight: '800', color: '#0f172a', margin: '0 0 6px 0', display: '-webkit-box', WebkitLineClamp: 1, WebkitBoxOrient: 'vertical', overflow: 'hidden' }, 
    
    categoryText: { fontSize: '14px', fontWeight: '600', color: '#0d9488', margin: '0 0 16px 0' },
    
    metaDataContainer: { display: 'flex', flexDirection: 'column', gap: '10px', marginBottom: '24px' },
    metaRow: { display: 'flex', alignItems: 'center', fontSize: '13px', color: '#4b5563' }, 
    metaIcon: { marginRight: '10px', color: '#9ca3af', display: 'flex', alignItems: 'center' },
    
    cardFooter: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: 'auto', paddingTop: '16px', borderTop: '1px solid #f1f5f9' },
    priceText: { fontSize: '15px', fontWeight: '800', color: '#0f172a' }, 
    
    actionBtn: { 
        backgroundColor: '#2563eb', 
        color: '#ffffff', 
        padding: '10px 24px', 
        borderRadius: '8px', 
        fontSize: '14px', 
        fontWeight: '600', 
        border: 'none',
        boxShadow: '0 1px 2px 0 rgba(0, 0, 0, 0.05)',
        outline: 'none'
    },

    // --- FOOTER ---
    footer: { backgroundColor: '#0f172a', color: '#e2e8f0', padding: '64px 40px 24px 40px', marginTop: 'auto' },
    footerGrid: { display: 'grid', gridTemplateColumns: '2fr 1fr 1fr 1fr', gap: '40px', maxWidth: '1200px', margin: '0 auto', marginBottom: '48px' },
    footerHeading: { fontSize: '16px', fontWeight: '700', marginBottom: '20px', color: '#ffffff' },
    footerText: { fontSize: '14px', color: '#94a3b8', lineHeight: '1.6', maxWidth: '300px' },
    footerLink: { display: 'block', fontSize: '14px', color: '#94a3b8', textDecoration: 'none', marginBottom: '12px', transition: 'color 0.2s' },
    footerBottom: { borderTop: '1px solid #1e293b', paddingTop: '24px', textAlign: 'center', fontSize: '14px', color: '#64748b' }
};

import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000';

export default function ResourceLibrary() {
    const [resources, setResources] = useState([]);
    const [search, setSearch] = useState('');
    const [activeFilter, setActiveFilter] = useState('All');
    const [loading, setLoading] = useState(true);
    const [fetchError, setFetchError] = useState('');
    
    const navigate = useNavigate();
    const itNumber = localStorage.getItem('itNumber');

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
        setFetchError('');
        try {
            const res = await axios.get(`${API_BASE_URL}/api/resources/all`);
            const payload = Array.isArray(res.data) ? res.data : res.data?.resources;
            setResources(payload || []);
        } catch (err) { 
            console.error(err);
            const message = err?.response?.data?.error || 'Unable to load resources right now.';
            setFetchError(message);
        }
        setLoading(false);
    };

    const handleView = async (item) => {
        try {
            await axios.post(`${API_BASE_URL}/api/resources/view/${item._id}`, { itNumber });
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
                .sidebar-item { padding: 15px; margin-bottom: 10px; border-radius: 8px; cursor: pointer; color: #555; font-weight: 500; transition: all 0.3s ease; }
                .sidebar-item:hover { background-color: #f0f4ff; color: #007bff; }
                .sub-item { padding: 10px 15px !important; font-size: 13px !important; margin-bottom: 5px !important; opacity: 0.8; }
                .sub-item:hover { opacity: 1; transform: translateX(5px); }
                
                .resource-card { transition: box-shadow 0.3s ease, transform 0.3s ease; }
                .resource-card:hover { box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05); transform: translateY(-2px); }
                
                .action-btn { transition: background-color 0.2s ease; }
                .action-btn:hover { background-color: #1d4ed8 !important; }
                
                /* EXPLICIT CSS TO OVERRIDE ALL BROWSER DEFAULTS */
                .filter-btn {
                    outline: none !important;
                    -webkit-tap-highlight-color: transparent;
                }
                
                .filter-btn:focus, 
                .filter-btn:active {
                    outline: none !important;
                    border-color: #e5e7eb !important; 
                    box-shadow: 0 1px 2px 0 rgba(0, 0, 0, 0.05) !important;
                }

                .filter-btn-active:focus, 
                .filter-btn-active:active {
                    outline: none !important;
                    border-color: #2563eb !important;
                }

                .filter-btn:hover { 
                    background-color: #f9fafb !important; 
                    border-color: #d1d5db !important; 
                }
                .filter-btn-active:hover { 
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
                        <li className="sidebar-item" style={{ fontWeight: '800', color: '#111827', cursor: 'pointer' }} onClick={() => navigate('/wellness-dashboard')}>🌿 My Wellness Portal</li>
                        <ul style={{ listStyle: 'none', paddingLeft: '20px', marginBottom: '10px' }}>
                            <li className="sidebar-item sub-item" onClick={() => navigate('/wellness')}>🎯 Goal Tracker</li>
                            <li className="sidebar-item sub-item" onClick={() => navigate('/mood')}>🎭 Mood Support</li>
                            <li className="sidebar-item sub-item" onClick={() => navigate('/resources')} style={{ backgroundColor: '#eff6ff', color: '#1d4ed8', fontWeight: 'bold', opacity: 1 }}>📚 Health Library</li>
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
                        
                        <div style={styles.headerSection}>
                            <h1 style={styles.mainTitle}>Health Library</h1>
                            <p style={styles.subTitle}>
                                Browse our directory of premium wellness materials specializing in student mental health challenges. Find the perfect resource for your needs and schedule.
                            </p>
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

                        {fetchError && (
                            <div style={styles.errorMessage}>{fetchError}</div>
                        )}

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
    mainTitle: { fontSize: '36px', fontWeight: '800', color: '#111827', marginBottom: '16px', fontFamily: "Georgia, serif" }, 
    subTitle: { color: '#4b5563', fontSize: '16px', marginBottom: '32px', maxWidth: '672px', lineHeight: '1.5' }, 
    
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
    
    // EXPLICITLY DEFINED BORDER PROPERTIES
    filterBtn: { 
        backgroundColor: '#ffffff', 
        borderWidth: '1px',
        borderStyle: 'solid',
        borderColor: '#e5e7eb', // This forces React to compile the border color properly!
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
        borderColor: '#2563eb', // Forces the blue border
        color: '#ffffff', 
        fontWeight: '600'
    },

    loadingState: { textAlign: 'center', padding: '80px 0', color: '#6b7280', fontSize: '18px' },
    emptyState: { padding: '80px 0', textAlign: 'center' },
    emptyStateText: { color: '#6b7280', fontSize: '18px' }, 
    errorMessage: { color: '#b91c1c', fontWeight: 600, textAlign: 'center', marginBottom: '24px' }, 

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
    }
};
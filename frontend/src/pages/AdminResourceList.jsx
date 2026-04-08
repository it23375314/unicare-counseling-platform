import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate, Link } from 'react-router-dom';

export default function AdminResourceList() {
    const [resources, setResources] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState('');
    const [filterStatus, setFilterStatus] = useState('All');
    const [filterCategory, setFilterCategory] = useState('All');
    const [filterType, setFilterType] = useState('All');
    const navigate = useNavigate();

    // Helper to remove HTML tags for clean text previews
    const stripHtml = (html) => html ? html.replace(/<[^>]*>?/gm, '').trim() : '';

    const getMostPopularCategory = () => {
        if (!resources.length) return 'N/A';
        const categoryUsage = {};
        resources.forEach(r => {
            if (!r.category) return;
            categoryUsage[r.category] = (categoryUsage[r.category] || 0) + (r.usageCount || 0);
        });
        let max = -1;
        let mostPopular = 'N/A';
        Object.entries(categoryUsage).forEach(([cat, count]) => {
            if (count > max) {
                max = count;
                mostPopular = cat;
            }
        });
        return mostPopular;
    };

    useEffect(() => {
        document.body.style.margin = "0";
        document.body.style.padding = "0";
        fetchResources();
    }, []);

    const fetchResources = async () => {
        try {
            const res = await axios.get('http://localhost:5001/api/resources/admin/all');
            setResources(res.data);
            setLoading(false);
        } catch (err) {
            console.error("Error fetching resources:", err);
            setLoading(false);
        }
    };

    const deleteResource = async (id) => {
        if (!window.confirm("Are you sure you want to completely delete this resource? This cannot be undone.")) return;
        
        try {
            await axios.delete(`http://localhost:5001/api/resources/delete/${id}`);
            setResources(resources.filter(r => r._id !== id));
        } catch (err) {
            alert("Error deleting resource");
        }
    };

    const handleLogout = () => {
        if (window.confirm("End admin session?")) {
            localStorage.clear();
            window.location.href = '/login';
        }
    };

    const resetFilters = () => {
        setSearchQuery('');
        setFilterStatus('All');
        setFilterCategory('All');
        setFilterType('All');
    };

    const totalResources = resources.length;
    const publishedResources = resources.filter(r => r.status === 'Published').length;
    const topCategory = getMostPopularCategory();

    const categoryOptions = ['All', ...Array.from(new Set(resources.map(r => r.category).filter(Boolean)))];
    const typeOptions = ['All', ...Array.from(new Set(resources.map(r => r.resourceType).filter(Boolean)))];

    const filteredResources = resources.filter((item) => {
        const title = stripHtml(item.title).toLowerCase();
        const desc = stripHtml(item.description).toLowerCase();
        const category = (item.category || '').toLowerCase();
        const type = (item.resourceType || '').toLowerCase();
        const status = (item.status || '').toLowerCase();
        const q = searchQuery.trim().toLowerCase();
        const matchesQuery = !q || title.includes(q) || desc.includes(q) || category.includes(q);
        const matchesStatus = filterStatus === 'All' || status === filterStatus.toLowerCase();
        const matchesCategory = filterCategory === 'All' || (item.category || '') === filterCategory;
        const matchesType = filterType === 'All' || (item.resourceType || '') === filterType;
        return matchesQuery && matchesStatus && matchesCategory && matchesType;
    });

    return (
        <>
            <style>{`
                .sidebar-item { padding: 15px; margin-bottom: 10px; border-radius: 8px; cursor: pointer; color: #4b5563; font-weight: 500; transition: all 0.3s ease; }
                .sidebar-item:hover { background-color: #f3f4f6; color: #111827; }
                
                .resource-row { transition: box-shadow 0.2s ease, border-color 0.2s ease; }
                .resource-row:hover { box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.05), 0 2px 4px -1px rgba(0, 0, 0, 0.03); border-color: #e5e7eb; }
                
                .primary-btn { transition: background-color 0.2s ease; }
                .primary-btn:hover { background-color: #1d4ed8 !important; }

                .edit-btn { transition: all 0.2s ease; }
                .edit-btn:hover { background-color: #eff6ff !important; color: #2563eb !important; border-color: #bfdbfe !important; }

                .delete-btn { transition: all 0.2s ease; }
                .delete-btn:hover { background-color: #fef2f2 !important; color: #dc2626 !important; border-color: #fecaca !important; }
            `}</style>

            <div style={styles.dashboardContainer}>
                
                {/* --- SIDEBAR --- */}
                <div style={styles.sidebar}>
                    <h2 style={{ color: '#2563eb', marginBottom: '40px', textAlign: 'center', marginTop: 0 }}>
                        UniCare Admin
                    </h2>
                    <ul style={{ listStyle: 'none', padding: 0, flex: 1, margin: 0 }}>
                        <li className="sidebar-item" onClick={() => navigate('/admin-dashboard')}>ðŸ›¡ï¸ Control Panel</li>
                        <li className="sidebar-item" style={{ backgroundColor: '#eff6ff', color: '#1d4ed8', fontWeight: 'bold' }} onClick={() => navigate('/admin/resources')}>ðŸ“š Resource Library</li>
                        <li className="sidebar-item" onClick={() => navigate('/admin-analytics')}>ðŸ“Š System Analytics</li>
                        <li className="sidebar-item" onClick={() => navigate('/admin-users')}>ðŸ‘¥ User Management</li>
                        <li className="sidebar-item" onClick={() => navigate('/admin-logs')}>ðŸ“ Platform Logs</li>
                        <li className="sidebar-item" onClick={() => navigate('/system-config')}>âš™ï¸ System Config</li>
                        <li className="sidebar-item" onClick={() => navigate('/settings')}>âš™ï¸ Settings</li>
                    </ul>
                    <ul style={{ listStyle: 'none', padding: 0, flex: 0, margin: 0 }}>
                        <li className="sidebar-item" onClick={handleLogout} style={{ color: '#dc2626' }}>ðŸšª Logout</li>
                    </ul>
                </div>

                <div style={styles.mainContent}>
                    <div style={styles.contentMaxWidth}>

                        {/* --- HEADER --- */}
                        <div style={styles.headerSection}>
                            <div>
                                <h1 style={styles.mainTitle}>Resource Directory</h1>
                                <p style={styles.subTitle}>Manage and oversee all wellness materials available to students.</p>
                            </div>
                            <Link to="/admin/resources/add" className="primary-btn" style={styles.addBtn}>
                                + Add New Resource
                            </Link>
                        </div>

                        {/* --- DASHBOARD STATS --- */}
                        <div style={styles.summaryGrid}>
                            <div style={styles.summaryCard}>
                                <div style={{...styles.statIconWrap, background: '#eff6ff', color: '#2563eb'}}>
                                    <svg viewBox="0 0 24 24" aria-hidden="true" style={styles.statIconSvg}>
                                        <path d="M4 6a3 3 0 0 1 3-3h10v18H7a3 3 0 0 1-3-3V6z" fill="none" stroke="currentColor" strokeWidth="2" />
                                        <path d="M7 5h10" fill="none" stroke="currentColor" strokeWidth="2" />
                                        <path d="M7 9h10" fill="none" stroke="currentColor" strokeWidth="2" />
                                    </svg>
                                </div>
                                <div>
                                    <p style={styles.summaryLabel}>Total Resources</p>
                                    <h2 style={styles.summaryValue}>{totalResources}</h2>
                                    <p style={styles.summarySubtext}>Entire Library</p>
                                </div>
                            </div>
                            <div style={styles.summaryCard}>
                                <div style={{...styles.statIconWrap, background: '#ecfdf5', color: '#10b981'}}>
                                    <svg viewBox="0 0 24 24" aria-hidden="true" style={styles.statIconSvg}>
                                        <circle cx="12" cy="12" r="8" fill="none" stroke="currentColor" strokeWidth="2" />
                                        <path d="M8 12l2.5 2.5L16 9" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                                    </svg>
                                </div>
                                <div>
                                    <p style={styles.summaryLabel}>Live & Published</p>
                                    <h2 style={styles.summaryValue}>{publishedResources}</h2>
                                    <p style={styles.summarySubtext}>Visible to students</p>
                                </div>
                            </div>
                            <div style={styles.summaryCard}>
                                <div style={{...styles.statIconWrap, background: '#faf5ff', color: '#9333ea'}}>
                                    <svg viewBox="0 0 24 24" aria-hidden="true" style={styles.statIconSvg}>
                                        <path d="M8 5h8v3a4 4 0 0 1-8 0V5z" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                                        <path d="M6 6H4a3 3 0 0 0 3 3" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
                                        <path d="M18 6h2a3 3 0 0 1-3 3" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
                                        <path d="M12 12v4" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
                                        <path d="M9 20h6" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
                                    </svg>
                                </div>
                                <div>
                                    <p style={styles.summaryLabel}>Top Category</p>
                                    <h2 style={{...styles.summaryValue, fontSize: '20px', paddingTop: '6px'}}>{topCategory}</h2>
                                    <p style={styles.summarySubtext}>Highest engagement</p>
                                </div>
                            </div>
                        </div>

                        {/* --- SEARCH + FILTERS --- */}
                        <div style={styles.controlsRow}>
                            <div style={styles.searchBox}>
                                <span style={styles.searchIcon}>
                                    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="11" cy="11" r="8"></circle><line x1="21" y1="21" x2="16.65" y2="16.65"></line></svg>
                                </span>
                                <input
                                    style={styles.searchInput}
                                    placeholder="Search resources..."
                                    value={searchQuery}
                                    onChange={(e) => setSearchQuery(e.target.value)}
                                />
                            </div>
                            <div style={styles.filterGroup}>
                                <select style={styles.filterSelect} value={filterStatus} onChange={(e) => setFilterStatus(e.target.value)}>
                                    <option value="All">All Status</option>
                                    <option value="Published">Published</option>
                                    <option value="Draft">Draft</option>
                                    <option value="Archived">Archived</option>
                                </select>
                                <select style={styles.filterSelect} value={filterCategory} onChange={(e) => setFilterCategory(e.target.value)}>
                                    {categoryOptions.map(cat => (
                                        <option key={cat} value={cat}>{cat === 'All' ? 'All Categories' : cat}</option>
                                    ))}
                                </select>
                                <select style={styles.filterSelect} value={filterType} onChange={(e) => setFilterType(e.target.value)}>
                                    {typeOptions.map(type => (
                                        <option key={type} value={type}>{type === 'All' ? 'All Types' : type}</option>
                                    ))}
                                </select>
                                <button type="button" onClick={resetFilters} style={styles.resetBtn}>Reset filters</button>
                            </div>
                        </div>

                        {/* --- RESOURCE LIST --- */}
                        <div style={styles.listContainer}>
                            {loading ? (
                                <div style={styles.loadingState}>Loading directory...</div>
                            ) : resources.length === 0 ? (
                                <div style={styles.emptyState}>
                                    <div style={{fontSize: '48px', marginBottom: '16px'}}>ðŸ“­</div>
                                    <h3 style={{margin: '0 0 8px 0', color: '#111827', fontSize: '20px', fontWeight: '800'}}>Directory is empty</h3>
                                    <p style={{margin: 0, color: '#6b7280', fontSize: '15px'}}>Click "Add New Resource" to start building the library.</p>
                                </div>
                            ) : filteredResources.length === 0 ? (
                                <div style={styles.emptyState}>
                                    <div style={styles.emptyIconWrap}>
                                        <svg viewBox="0 0 24 24" aria-hidden="true" style={styles.emptyIconSvg}>
                                            <circle cx="11" cy="11" r="6" fill="none" stroke="currentColor" strokeWidth="2" />
                                            <line x1="16" y1="16" x2="21" y2="21" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
                                            <line x1="8" y1="11" x2="14" y2="11" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
                                        </svg>
                                    </div>
                                    <h3 style={{margin: '0 0 8px 0', color: '#111827', fontSize: '20px', fontWeight: '800'}}>No matching resources</h3>
                                    <p style={{margin: 0, color: '#6b7280', fontSize: '15px'}}>Try adjusting the search or filters.</p>
                                </div>
                            ) : (
                                <div style={styles.listWrapper}>
                                    {filteredResources.map(item => (
                                        <div key={item._id} className="resource-row" style={styles.listItem}>
                                            
                                            {/* LEFT: IMAGE & TEXT */}
                                            <div style={styles.listLeft}>
                                                <img 
                                                    src={item.imageUrl || 'https://via.placeholder.com/150x150?text=Cover'} 
                                                    alt="cover" 
                                                    style={styles.itemImage} 
                                                />
                                                <div style={styles.itemInfo}>
                                                    <h3 style={styles.itemTitle} title={stripHtml(item.title)}>{stripHtml(item.title)}</h3>
                                                    <span style={styles.categoryText}>{item.category || 'General'}</span>
                                                    <p style={styles.itemDesc}>{stripHtml(item.description)}</p>
                                                </div>
                                            </div>

                                            {/* MIDDLE: METADATA & USAGE */}
                                            <div style={styles.listMiddle}>
                                                <div style={styles.badgeCol}>
                                                    <span style={styles.metaPillGray}>
                                                        <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{marginRight: '4px'}}><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path><polyline points="14 2 14 8 20 8"></polyline><line x1="16" y1="13" x2="8" y2="13"></line><line x1="16" y1="17" x2="8" y2="17"></line><polyline points="10 9 9 9 8 9"></polyline></svg>
                                                        {item.resourceType}
                                                    </span>
                                                    <span style={styles.metaPillBlue}>
                                                        <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{marginRight: '4px'}}><circle cx="12" cy="12" r="10"></circle><line x1="2" y1="12" x2="22" y2="12"></line><path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"></path></svg>
                                                        {item.language || 'EN'}
                                                    </span>
                                                </div>
                                                <div style={styles.usageCol}>
                                                    <span style={styles.usageCount}>{item.usageCount || 0}</span>
                                                    <span style={styles.usageLabel}>VIEWS</span>
                                                </div>
                                            </div>

                                            {/* RIGHT: STATUS & ACTIONS */}
                                            <div style={styles.listRight}>
                                                <span style={{
                                                    ...styles.statusBadge,
                                                    backgroundColor: item.status === 'Published' ? '#dcfce7' : item.status === 'Archived' ? '#fef9c3' : '#f3f4f6',
                                                    color: item.status === 'Published' ? '#166534' : item.status === 'Archived' ? '#a16207' : '#4b5563'
                                                }}>
                                                    {item.status === 'Published' ? 'Published' : item.status === 'Archived' ? 'Archived' : 'Draft'}
                                                </span>

                                                <div style={styles.actionCol}>
                                                    <button className="edit-btn" onClick={() => navigate(`/admin/resources/edit/${item._id}`)} style={styles.iconBtn} title="Edit Resource">
                                                        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path></svg>
                                                    </button>
                                                    <button className="delete-btn" onClick={() => deleteResource(item._id)} style={styles.iconBtn} title="Delete Resource">
                                                        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="3 6 5 6 21 6"></polyline><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path></svg>
                                                    </button>
                                                </div>
                                            </div>

                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </>
    );
}

const styles = {
    dashboardContainer: { display: 'flex', minHeight: '100vh', width: '100%', fontFamily: "'Inter', 'Segoe UI', sans-serif", backgroundColor: '#f9fafb' },
    sidebar: { width: '250px', backgroundColor: '#ffffff', padding: '20px', boxShadow: '2px 0 10px rgba(0, 0, 0, 0.05)', display: 'flex', flexDirection: 'column', position: 'fixed', top: 0, left: 0, bottom: 0, boxSizing: 'border-box', zIndex: 1000 },
    mainContent: { flex: 1, marginLeft: '250px', padding: '48px 40px', boxSizing: 'border-box' },
    contentMaxWidth: { maxWidth: '1100px', margin: '0 auto' },
    
    // Header
    headerSection: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '20px', marginBottom: '40px' },
    mainTitle: { fontSize: '36px', fontWeight: '800', margin: '0 0 8px 0', color: '#111827', fontFamily: "Georgia, serif" },
    subTitle: { color: '#6b7280', fontSize: '16px', margin: 0, fontWeight: '400' },
    addBtn: { backgroundColor: '#2563eb', color: '#ffffff', padding: '12px 24px', borderRadius: '12px', fontWeight: '600', fontSize: '14px', textDecoration: 'none', display: 'inline-block', boxShadow: '0 1px 2px 0 rgba(0, 0, 0, 0.05)', outline: 'none' },

    // Summary Cards (Match Wellness Dashboard)
    summaryGrid: { display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '24px', marginBottom: '40px' },
    summaryCard: { backgroundColor: '#ffffff', borderRadius: '24px', padding: '24px', border: '1px solid #f3f4f6', boxShadow: '0 1px 2px 0 rgba(0, 0, 0, 0.05)', display: 'flex', alignItems: 'center', gap: '16px' },
    statIconWrap: { width: '56px', height: '56px', borderRadius: '16px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '24px', flexShrink: 0 },
    statIconSvg: { width: '26px', height: '26px', display: 'block' },
    summaryLabel: { margin: 0, fontSize: '12px', textTransform: 'uppercase', letterSpacing: '0.05em', color: '#6b7280', fontWeight: '700' },
    summaryValue: { margin: '4px 0 0 0', fontSize: '32px', fontWeight: '800', color: '#111827', lineHeight: 1 },
    summarySubtext: { margin: '6px 0 0 0', fontSize: '13px', color: '#9ca3af', fontWeight: '500' },

    controlsRow: { display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '16px', flexWrap: 'wrap', marginBottom: '24px' },
    searchBox: { position: 'relative', flex: '1 1 280px', maxWidth: '420px' },
    searchIcon: { position: 'absolute', left: '14px', top: '12px', color: '#9ca3af', display: 'flex' },
    searchInput: { width: '100%', padding: '12px 16px 12px 42px', borderRadius: '12px', border: '1px solid #e5e7eb', backgroundColor: '#ffffff', fontSize: '14px', color: '#111827', outline: 'none', boxSizing: 'border-box', boxShadow: '0 1px 2px 0 rgba(0, 0, 0, 0.05)' },
    filterGroup: { display: 'flex', gap: '12px', flexWrap: 'wrap' },
    filterSelect: { padding: '12px 16px', borderRadius: '12px', border: '1px solid #e5e7eb', backgroundColor: '#ffffff', fontSize: '14px', fontWeight: '500', color: '#374151', cursor: 'pointer', outline: 'none', boxShadow: '0 1px 2px 0 rgba(0, 0, 0, 0.05)' },
    resetBtn: { padding: '12px 16px', borderRadius: '12px', border: '1px solid #e5e7eb', backgroundColor: '#f9fafb', fontSize: '14px', fontWeight: '600', color: '#374151', cursor: 'pointer', outline: 'none', boxShadow: '0 1px 2px 0 rgba(0, 0, 0, 0.05)' },

    loadingState: { textAlign: 'center', padding: '80px 0', color: '#6b7280', fontSize: '18px' },
    emptyState: { textAlign: 'center', padding: '80px 0', backgroundColor: '#ffffff', borderRadius: '24px', border: '1px solid #f3f4f6' },
    emptyIconWrap: { width: '48px', height: '48px', borderRadius: '16px', margin: '0 auto 12px auto', display: 'flex', alignItems: 'center', justifyContent: 'center', backgroundColor: '#eff6ff', color: '#2563eb' },
    emptyIconSvg: { width: '22px', height: '22px', display: 'block' },

    // List Layout
    listContainer: { width: '100%' },
    listWrapper: { display: 'flex', flexDirection: 'column', gap: '16px' },
    
    // Modern Resource Card
    listItem: { backgroundColor: '#ffffff', borderRadius: '20px', border: '1px solid #f3f4f6', padding: '20px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '24px', flexWrap: 'wrap' },
    
    listLeft: { display: 'flex', alignItems: 'center', gap: '20px', flex: '2 1 400px', minWidth: 0 },
    itemImage: { width: '80px', height: '80px', borderRadius: '12px', objectFit: 'cover', flexShrink: 0, backgroundColor: '#f3f4f6' },
    itemInfo: { display: 'flex', flexDirection: 'column', gap: '4px', minWidth: 0 },
    itemTitle: { fontSize: '18px', fontWeight: '700', color: '#111827', margin: 0, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' },
    categoryText: { fontSize: '13px', fontWeight: '600', color: '#0d9488', margin: 0 },
    itemDesc: { fontSize: '14px', color: '#6b7280', margin: 0, display: '-webkit-box', WebkitLineClamp: 1, WebkitBoxOrient: 'vertical', overflow: 'hidden' },

    listMiddle: { display: 'flex', alignItems: 'center', gap: '32px', flex: '1 1 200px' },
    badgeCol: { display: 'flex', flexDirection: 'column', gap: '8px' },
    
    // Clean Pills
    metaPillGray: { display: 'inline-flex', alignItems: 'center', backgroundColor: '#f8fafc', color: '#475569', border: '1px solid #e2e8f0', padding: '4px 10px', borderRadius: '999px', fontSize: '11px', fontWeight: '600' },
    metaPillBlue: { display: 'inline-flex', alignItems: 'center', backgroundColor: '#eff6ff', color: '#2563eb', border: '1px solid #dbeafe', padding: '4px 10px', borderRadius: '999px', fontSize: '11px', fontWeight: '600' },
    
    usageCol: { display: 'flex', flexDirection: 'column', alignItems: 'center' },
    usageCount: { fontSize: '22px', fontWeight: '800', color: '#111827', lineHeight: '1' },
    usageLabel: { fontSize: '10px', fontWeight: '700', color: '#9ca3af', textTransform: 'uppercase', letterSpacing: '0.05em', marginTop: '2px' },

    listRight: { display: 'flex', alignItems: 'center', gap: '24px', flex: '1 1 200px', justifyContent: 'flex-end' },
    statusBadge: { padding: '6px 14px', borderRadius: '999px', fontSize: '12px', fontWeight: '700' },

    actionCol: { display: 'flex', gap: '8px' },
    iconBtn: { display: 'flex', alignItems: 'center', justifyContent: 'center', width: '36px', height: '36px', borderRadius: '10px', backgroundColor: '#ffffff', border: '1px solid #e5e7eb', color: '#6b7280', cursor: 'pointer', outline: 'none' }
};
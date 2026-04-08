import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Link, useNavigate } from 'react-router-dom'; 

export default function SavedResources() {
  const [savedItems, setSavedItems] = useState([]);
  const [loading, setLoading] = useState(true);
  
  // Search and Filter States
  const [search, setSearch] = useState('');
  const [activeFilter, setActiveFilter] = useState('All');
  
  const userId = localStorage.getItem('userId');
  const itNumber = localStorage.getItem('itNumber');
  const userName = localStorage.getItem('userName') || 'Current Student';
  const userRole = localStorage.getItem('userRole') || 'student';
  const navigate = useNavigate(); 

  const filterOptions = [
      { label: 'All Saved', value: 'All' },
      { label: 'Video Courses', value: 'Video' },
      { label: 'Digital PDFs', value: 'PDF' },
      { label: 'Articles', value: 'Article' },
      { label: 'Audio', value: 'Audio' }
  ];

  // Helper to safely remove HTML tags for preview texts
  const stripHtml = (html) => {
    if (!html) return '';
    return html.replace(/<[^>]*>?/gm, '').trim();
  };

  useEffect(() => {
    document.body.style.margin = "0";
    document.body.style.padding = "0";
    fetchSavedResources();
  }, []);

  const fetchSavedResources = async () => {
    try {
      const cleanUserId = userId ? userId.replace(/['"]+/g, '') : '';
      const res = await axios.get(`http://localhost:5000/api/resources/bookmarks/${cleanUserId}`);
      
      setSavedItems(res.data.reverse());
      setLoading(false);
    } catch (err) {
      console.error("Error fetching saved resources", err);
      setLoading(false);
    }
  };

  const removeBookmark = async (e, resourceId) => {
    e.stopPropagation(); 
    try {
      const cleanUserId = userId ? userId.replace(/['"]+/g, '') : '';
      await axios.post(`http://localhost:5000/api/resources/bookmark/${resourceId}`, { userId: cleanUserId });
      setSavedItems(savedItems.filter(item => item._id !== resourceId));
    } catch (err) {
      alert("Error removing bookmark");
    }
  };

  const handleView = async (id) => {
    try {
      await axios.post(`http://localhost:5000/api/resources/view/${id}`, { itNumber });
    } catch (err) {
      console.error("Error recording view analytics", err);
    }
    navigate(`/resources/${id}`, { state: { from: '/saved' } });
  };

  // --- FILTERING LOGIC ---
  const normalizedSearch = search.trim().toLowerCase();
  const filteredItems = savedItems.filter(item => {
      const matchesSearch = !normalizedSearch ||
          [stripHtml(item.title), item.category, stripHtml(item.description)].some(value =>
              value?.toLowerCase().includes(normalizedSearch)
          ) ||
          (item.tags || []).some(tag => tag.toLowerCase().includes(normalizedSearch));
      const matchesType = activeFilter === 'All' || item.resourceType === activeFilter;
      return matchesSearch && matchesType;
  });

  return (
    <>
      <style>{`
        .resource-card { transition: box-shadow 0.3s ease, transform 0.3s ease; }
        .resource-card:hover { box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05); transform: translateY(-2px); }
        
        .action-btn { transition: background-color 0.2s ease; }
        .action-btn:hover { background-color: #1d4ed8 !important; }
        
        .remove-btn { transition: all 0.2s ease; }
        .remove-btn:hover { background-color: #fef2f2 !important; border-color: #fecaca !important; color: #ef4444 !important; }
        
        /* Category Button Fixes - Removes default black borders and outlines */
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
        <div style={styles.mainWrapper}>
          <main style={styles.mainContent}>
            
            {/* HEADER */}
            <div style={styles.headerSection}>
              <Link to="/wellness-dashboard" style={styles.backToDashBtn}>
                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{marginRight:'6px'}}><polyline points="15 18 9 12 15 6"/><line x1="9" y1="12" x2="21" y2="12"/></svg>
                Back to Wellness Portal
              </Link>
              <div>
                <h1 style={styles.mainTitle}>My Saved Resources</h1>
                <p style={styles.subTitle}>Your personal collection of bookmarked wellness materials for quick access.</p>
              </div>
            </div>

            {loading ? (
              <div style={styles.loadingState}>Loading your library...</div>
            ) : savedItems.length === 0 ? (
              <div style={styles.emptyState}>
                <div style={{fontSize: '48px', marginBottom: '16px', color: '#9ca3af'}}>
                  <svg xmlns="http://www.w3.org/2000/svg" width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M19 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v11a2 2 0 0 1-2 2z"/><polyline points="17 21 17 13 7 13 7 21"/><polyline points="7 3 7 8 15 8"/></svg>
                </div>
                <h3 style={{margin: '0 0 8px 0', color: '#111827', fontWeight: '800', fontSize: '20px'}}>No saved resources yet</h3>
                <p style={{margin: 0, color: '#6b7280', fontSize: '15px'}}>Go to the Health Library to add your favorites!</p>
              </div>
            ) : (
              <>
                  {/* --- SEARCH BAR --- */}
                  <div style={styles.searchFilterContainer}>
                      <div style={styles.searchBox}>
                          <span style={styles.searchIcon}>
                              <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="11" cy="11" r="8"></circle><line x1="21" y1="21" x2="16.65" y2="16.65"></line></svg>
                          </span>
                          <input 
                              style={styles.searchInput} 
                              placeholder="Search your favorites by name or topic..." 
                              value={search}
                              onChange={(e) => setSearch(e.target.value)}
                          />
                          {search && (
                              <button onClick={() => setSearch('')} style={styles.clearSearchBtn} title="Clear search">✖</button>
                          )}
                      </div>
                  </div>

                  {/* --- CATEGORY FILTERS --- */}
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

                  {/* --- LIST CONTAINER --- */}
                  <div style={styles.listContainer}>
                    {filteredItems.length === 0 ? (
                        <div style={{ textAlign: 'center', padding: '60px 0', color: '#6b7280' }}>
                            No saved resources match your search or filter.
                        </div>
                    ) : (
                        filteredItems.map(item => (
                          <div key={item._id} className="resource-card" style={styles.card}>
                            
                            {/* Left Image */}
                            <img 
                                src={item.imageUrl || 'https://via.placeholder.com/150x150?text=Resource'} 
                                alt="cover" 
                                style={styles.cardImage} 
                            />
                            
                            {/* Right Content Area */}
                            <div style={styles.cardBody}>
                                
                                <div style={styles.titleRow}>
                                    <h3 style={styles.cardTitle} title={stripHtml(item.title)}>
                                        {stripHtml(item.title)}
                                    </h3>
                                    {/* Sleek Remove Button */}
                                    <button 
                                        className="remove-btn"
                                        onClick={(e) => removeBookmark(e, item._id)} 
                                        style={styles.removeBtn} 
                                        title="Remove from Saved"
                                    >
                                        <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M19 21l-7-5-7 5V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2z"></path></svg>
                                        Remove
                                    </button>
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
                                    type="button"
                                        className="action-btn"
                                        onClick={(e) => { e.stopPropagation(); handleView(item._id); }} 
                                        style={styles.actionBtn}
                                    >
                                        Open Resource
                                    </button>
                                </div>
                            </div>
                          </div>
                        ))
                    )}
                  </div>
              </>
            )}
                    </main>
                </div>
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

  headerSection: { marginBottom: '40px', display: 'flex', flexDirection: 'column', gap: '16px' },
  mainTitle: { fontSize: '36px', fontWeight: '800', color: '#111827', marginBottom: '16px', fontFamily: "Georgia, serif" },
  subTitle: { color: '#4b5563', fontSize: '16px', margin: 0, maxWidth: '672px', lineHeight: '1.5' },
  backToDashBtn: { display: 'inline-flex', alignItems: 'center', gap: '6px', background: '#e0f2fe', color: '#0b63d3', padding: '10px 16px', borderRadius: '9999px', border: '1px solid #bae6fd', fontSize: '14px', fontWeight: '600', textDecoration: 'none', width: 'fit-content', boxShadow: '0 1px 2px rgba(15, 23, 42, 0.08)' },

  loadingState: { textAlign: 'center', padding: '80px 0', color: '#6b7280', fontSize: '18px' },
  emptyState: { textAlign: 'center', padding: '80px 0', backgroundColor: '#ffffff', borderRadius: '24px', border: '1px solid #f3f4f6' },

  searchFilterContainer: { display: 'flex', flexDirection: 'row', gap: '16px', marginBottom: '20px' },
  searchBox: { position: 'relative', flexGrow: 1 },
  searchIcon: { position: 'absolute', top: '50%', left: '16px', transform: 'translateY(-50%)', color: '#9ca3af', display: 'flex', alignItems: 'center' }, 
  searchInput: { width: '100%', padding: '16px 16px 16px 44px', backgroundColor: '#ffffff', border: '1px solid #e5e7eb', borderRadius: '12px', fontSize: '14px', color: '#111827', boxShadow: '0 1px 2px 0 rgba(0, 0, 0, 0.05)', outline: 'none', boxSizing: 'border-box', transition: 'border-color 0.2s' },
  clearSearchBtn: { position: 'absolute', top: '50%', right: '16px', transform: 'translateY(-50%)', background: 'transparent', border: 'none', color: '#9ca3af', fontSize: '14px', cursor: 'pointer', outline: 'none' },

  categoryRow: { display: 'flex', gap: '12px', flexWrap: 'wrap', marginBottom: '40px' },
  filterBtn: { backgroundColor: '#ffffff', borderWidth: '1px', borderStyle: 'solid', borderColor: '#e5e7eb', color: '#4b5563', padding: '10px 20px', borderRadius: '12px', fontSize: '14px', fontWeight: '500', cursor: 'pointer', transition: 'all 0.2s ease', boxShadow: '0 1px 2px 0 rgba(0, 0, 0, 0.05)', outline: 'none' },
  filterBtnActive: { backgroundColor: '#2563eb', borderWidth: '1px', borderStyle: 'solid', borderColor: '#2563eb', color: '#ffffff', fontWeight: '600' },

  listContainer: { display: 'flex', flexDirection: 'column', gap: '24px' },
  
  card: { backgroundColor: '#ffffff', borderRadius: '24px', padding: '24px', border: '1px solid #f3f4f6', boxShadow: '0 1px 3px 0 rgba(0, 0, 0, 0.05)', display: 'flex', flexDirection: 'row', gap: '24px', cursor: 'default' },
  cardImage: { width: '140px', height: '140px', borderRadius: '16px', objectFit: 'cover', flexShrink: 0, backgroundColor: '#f3f4f6' },
  cardBody: { display: 'flex', flexDirection: 'column', flexGrow: 1, padding: '4px 0', minWidth: 0 },
  
  titleRow: { display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '8px', gap: '16px' },
  cardTitle: { fontSize: '20px', fontWeight: '800', color: '#0f172a', margin: '0 0 6px 0', display: '-webkit-box', WebkitLineClamp: 1, WebkitBoxOrient: 'vertical', overflow: 'hidden' }, 
  
  removeBtn: { display: 'flex', alignItems: 'center', gap: '6px', backgroundColor: '#ffffff', color: '#6b7280', border: '1px solid #e5e7eb', padding: '6px 12px', borderRadius: '8px', fontSize: '12px', fontWeight: '600', cursor: 'pointer', outline: 'none', flexShrink: 0 },
  categoryText: { fontSize: '14px', fontWeight: '600', color: '#0d9488', margin: '0 0 16px 0' },
  
  metaDataContainer: { display: 'flex', flexDirection: 'column', gap: '10px', marginBottom: '24px' },
  metaRow: { display: 'flex', alignItems: 'center', fontSize: '13px', color: '#4b5563' }, 
  metaIcon: { marginRight: '10px', color: '#9ca3af', display: 'flex', alignItems: 'center' },
  
  cardFooter: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: 'auto', paddingTop: '16px', borderTop: '1px solid #f1f5f9' },
  priceText: { fontSize: '15px', fontWeight: '800', color: '#0f172a' }, 
  actionBtn: { backgroundColor: '#2563eb', color: '#ffffff', padding: '10px 24px', borderRadius: '8px', fontSize: '14px', fontWeight: '600', border: 'none', boxShadow: '0 1px 2px 0 rgba(0, 0, 0, 0.05)', outline: 'none' },

  // --- FOOTER ---
  footer: { backgroundColor: '#0f172a', color: '#e2e8f0', padding: '64px 40px 24px 40px', marginTop: 'auto' },
  footerGrid: { display: 'grid', gridTemplateColumns: '2fr 1fr 1fr 1fr', gap: '40px', maxWidth: '1200px', margin: '0 auto', marginBottom: '48px' },
  footerHeading: { fontSize: '16px', fontWeight: '700', marginBottom: '20px', color: '#ffffff' },
  footerText: { fontSize: '14px', color: '#94a3b8', lineHeight: '1.6', maxWidth: '300px' },
  footerLink: { display: 'block', fontSize: '14px', color: '#94a3b8', textDecoration: 'none', marginBottom: '12px', transition: 'color 0.2s' },
  footerBottom: { borderTop: '1px solid #1e293b', paddingTop: '24px', textAlign: 'center', fontSize: '14px', color: '#64748b' }
};

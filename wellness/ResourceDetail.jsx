import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useParams, Link, useNavigate } from 'react-router-dom';

export default function ResourceDetail() {
    const { id } = useParams(); 
    const navigate = useNavigate();
    
    const [selected, setSelected] = useState(null);
    const [userBookmarks, setUserBookmarks] = useState([]);
    const [loading, setLoading] = useState(true);

    let userId = localStorage.getItem('userId');
    if (userId) {
        userId = userId.replace(/['"]+/g, '');
    }

    useEffect(() => {
        document.body.style.margin = "0";
        document.body.style.padding = "0";
        fetchResourceDetails();
    }, [id]);

    const fetchResourceDetails = async () => {
        setLoading(true);
        try {
            const res = await axios.get(`http://localhost:5000/api/resources/all`);
            const specificResource = res.data.find(item => item._id === id);
            setSelected(specificResource);

            if (userId) {
                const bRes = await axios.get(`http://localhost:5000/api/resources/bookmarks/${userId}`);
                setUserBookmarks(bRes.data.map(b => b._id));
            }
        } catch (err) { 
            console.error("Error fetching details:", err);
        }
        setLoading(false);
    };

    const toggleBookmark = async (resourceId) => {
        let currentUserId = localStorage.getItem('userId');
        
        if (!currentUserId) {
            alert("Session expired. Please log in again.");
            return;
        }

        currentUserId = currentUserId.replace(/['"]+/g, '');

        try {
            await axios.post(`http://localhost:5000/api/resources/bookmark/${resourceId}`, { 
                userId: currentUserId 
            });
            
            if (userBookmarks.includes(resourceId)) {
                setUserBookmarks(userBookmarks.filter(bId => bId !== resourceId));
            } else {
                setUserBookmarks([...userBookmarks, resourceId]);
            }
        } catch (err) {
            alert(`Failed to save favorite: ${err.response?.data?.msg || "Internal Server Error"}`);
        }
    };

    const getYoutubeId = (url) => {
        if (!url) return null;
        const regExp = /(?:youtube\.com\/(?:[^\/]+\/.+\/|(?:v|e(?:mbed)?)\/|.*[?&]v=)|youtu\.be\/)([^"&?\/\s]{11})/i;
        const match = url.match(regExp);
        return match ? match[1] : null;
    };

    const handleOpenPdf = (url) => {
        if (!url) return;
        let finalUrl = url;
        if (!/^https?:\/\//i.test(url)) {
              finalUrl = url.startsWith('/') ? `http://localhost:5000${url}` : `http://localhost:5000/${url}`;
        }
        window.open(finalUrl, '_blank', 'noopener,noreferrer');
    };

    const handleDownloadPdf = (url, title) => {
        if (!url) return;
        let finalUrl = url;
        if (!/^https?:\/\//i.test(url)) {
            finalUrl = url.startsWith('/') ? `http://localhost:5000${url}` : `http://localhost:5000/${url}`;
        }

        fetch(finalUrl)
            .then(response => response.blob())
            .then(blob => {
                const blobUrl = window.URL.createObjectURL(blob);
                const link = document.createElement('a');
                link.href = blobUrl;
                const cleanTitle = title ? title.replace(/<[^>]*>?/gm, '').replace(/[^a-zA-Z0-9]/g, '_') : 'Wellness_Resource';
                link.download = `${cleanTitle}.pdf`;
                document.body.appendChild(link);
                link.click();
                link.remove();
                window.URL.revokeObjectURL(blobUrl);
            })
            .catch(err => {
                console.error("Download failed, opening in new tab as fallback", err);
                window.open(finalUrl, '_blank', 'noopener,noreferrer');
            });
    };

    const handleLogout = () => {
        if (window.confirm("Are you sure you want to log out?")) {
            localStorage.clear();
            window.location.href = '/login';
        }
    };

    return (
        <>
            <style>{`
                .sidebar-item { padding: 15px; margin-bottom: 10px; border-radius: 8px; cursor: pointer; color: #4b5563; font-weight: 500; transition: all 0.3s ease; }
                .sidebar-item:hover { background-color: #f3f4f6; color: #111827; }
                .sub-item { padding: 10px 15px !important; font-size: 13px !important; margin-bottom: 5px !important; opacity: 0.8; }
                .sub-item:hover { opacity: 1; transform: translateX(5px); }

                /* Rich Text Overrides to match clean style */
                .rich-text-content { overflow-wrap: anywhere; word-break: break-word; }
                .rich-text-content h1, .rich-text-content h2, .rich-text-content h3 { color: #111827; font-weight: 800; margin: 32px 0 16px 0; font-family: "Georgia", serif; word-break: break-word; }
                .rich-text-content p { margin-bottom: 16px; color: #374151; line-height: 1.8; font-size: 16px; }
                .rich-text-content ul, .rich-text-content ol { padding-left: 20px; margin-bottom: 16px; color: #374151; }
                .rich-text-content li { margin-bottom: 8px; line-height: 1.6; font-size: 16px; }
                
                .back-btn { transition: color 0.2s ease; }
                .back-btn:hover { color: #111827 !important; }
                
                .save-btn { transition: all 0.2s ease; }
                .save-btn:hover { background-color: #f8fafc; border-color: #cbd5e1; }
                .save-btn.active:hover { background-color: #fef2f2; border-color: #fecaca; color: #ef4444; }
                
                .primary-btn { transition: background-color 0.2s ease; }
                .primary-btn:hover { background-color: #1d4ed8 !important; }
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
                            <li className="sidebar-item sub-item" onClick={() => navigate('/mood')}>🎭 Mood Support</li>
                            <li className="sidebar-item sub-item" onClick={() => navigate('/resources')} style={{ backgroundColor: '#eff6ff', color: '#1d4ed8', fontWeight: 'bold', opacity: 1 }}>📚 Health Library</li>
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
                        
                        <div style={{ marginBottom: '24px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                            <button className="back-btn" onClick={() => navigate('/resources')} style={styles.backBtn}>
                                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{marginRight: '6px'}}><line x1="19" y1="12" x2="5" y2="12"></line><polyline points="12 19 5 12 12 5"></polyline></svg>
                                Back to Library
                            </button>
                            
                            {/* Top Right Save Button */}
                            {selected && (
                                <button 
                                    className={`save-btn ${userBookmarks.includes(selected._id) ? 'active' : ''}`}
                                    onClick={() => toggleBookmark(selected._id)} 
                                    style={userBookmarks.includes(selected._id) ? styles.removeBtnTop : styles.saveBtnTop}
                                >
                                    {userBookmarks.includes(selected._id) ? '❤️ Saved to Favorites' : '🤍 Save Resource'}
                                </button>
                            )}
                        </div>

                        {loading ? (
                            <div style={styles.loadingState}>
                                Loading Resource...
                            </div>
                        ) : !selected ? (
                            <div style={styles.emptyState}>
                                <p style={styles.emptyStateText}>Resource not found or has been removed.</p>
                            </div>
                        ) : (
                            <div style={styles.detailContainer}>
                                
                                {/* --- MEDIA HEADER --- */}
                                <div style={styles.mediaSection}>
                                    {selected.resourceType === 'Video' ? (
                                        <iframe 
                                            style={styles.iframeStyle}
                                            src={`https://www.youtube.com/embed/${getYoutubeId(selected.content)}?autoplay=0`} 
                                            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                                            allowFullScreen 
                                            title="video" 
                                        ></iframe>
                                    ) : selected.resourceType === 'PDF' ? (
                                        <div style={styles.pdfContainer}>
                                            <div style={styles.pdfIconWrapper}>
                                                <svg xmlns="http://www.w3.org/2000/svg" width="72" height="72" viewBox="0 0 24 24" fill="#f1f5f9" stroke="#94a3b8" strokeWidth="1" strokeLinecap="round" strokeLinejoin="round">
                                                    <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path>
                                                    <polyline points="14 2 14 8 20 8"></polyline>
                                                    <line x1="16" y1="13" x2="8" y2="13" stroke="#475569" strokeWidth="2"></line>
                                                    <line x1="16" y1="17" x2="8" y2="17" stroke="#475569" strokeWidth="2"></line>
                                                    <polyline points="10 9 9 9 8 9" stroke="#475569" strokeWidth="2"></polyline>
                                                </svg>
                                            </div>
                                            <h2 style={styles.pdfTitle}>PDF Document Attached</h2>
                                            <p style={styles.pdfSubtitle}>Click below to securely read or download this document.</p>
                                            
                                            <div style={styles.pdfButtonGroup}>
                                                <button className="primary-btn" onClick={() => handleOpenPdf(selected.content)} style={styles.pdfBtn}>
                                                    Open Document
                                                </button>
                                                <button onClick={() => handleDownloadPdf(selected.content, selected.title)} style={styles.pdfDownloadBtn}>
                                                    Download PDF 
                                                    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{marginLeft: '6px'}}><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path><polyline points="7 10 12 15 17 10"></polyline><line x1="12" y1="15" x2="12" y2="3"></line></svg>
                                                </button>
                                            </div>
                                        </div>
                                    ) : selected.resourceType === 'Audio' ? (
                                        <div style={styles.pdfContainer}>
                                            <div style={styles.pdfIconWrapper}>
                                                <svg xmlns="http://www.w3.org/2000/svg" width="72" height="72" viewBox="0 0 24 24" fill="none" stroke="#94a3b8" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><path d="M3 18v-6a9 9 0 0 1 18 0v6"></path><path d="M21 19a2 2 0 0 1-2 2h-1a2 2 0 0 1-2-2v-3a2 2 0 0 1 2-2h3zM3 19a2 2 0 0 0 2 2h1a2 2 0 0 0 2-2v-3a2 2 0 0 0-2-2H3z"></path></svg>
                                            </div>
                                            <h2 style={styles.pdfTitle}>Audio Session</h2>
                                            <p style={styles.pdfSubtitle}>Find a comfortable space and click play to begin.</p>
                                            <audio controls style={{ width: '100%', maxWidth: '400px' }}>
                                                <source src={selected.content} />
                                            </audio>
                                        </div>
                                    ) : (
                                        <img src={selected.imageUrl || 'https://via.placeholder.com/1000x400?text=Resource+Cover'} style={styles.clearImg} alt="Resource cover" />
                                    )}
                                </div>

                                {/* --- MAIN TEXT CONTENT AREA --- */}
                                <div style={styles.textWrapper}>
                                    
                                    {/* TITLE - Fixed text wrapping to prevent cutting off */}
                                    <h1 style={styles.hugeTitle} dangerouslySetInnerHTML={{ __html: selected.title }}></h1>

                                    {/* MODERN META PILLS */}
                                    <div style={styles.metaGrid}>
                                        <span style={styles.metaPillTeal}>
                                            <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M22 19a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5l2 3h9a2 2 0 0 1 2 2z"></path></svg>
                                            {selected.category}
                                        </span>
                                        <span style={styles.metaPillBlue}>
                                            <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"></circle><polyline points="12 6 12 12 16 14"></polyline></svg>
                                            {selected.difficulty || 'All Levels'}
                                        </span>
                                        <span style={styles.metaPillPurple}>
                                            <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"></circle><line x1="2" y1="12" x2="22" y2="12"></line><path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1 4-10z"></path></svg>
                                            {selected.language || 'English'}
                                        </span>
                                        <span style={styles.metaPillGray}>
                                            <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path><polyline points="14 2 14 8 20 8"></polyline><line x1="16" y1="13" x2="8" y2="13"></line><line x1="16" y1="17" x2="8" y2="17"></line><polyline points="10 9 9 9 8 9"></polyline></svg>
                                            {selected.resourceType}
                                        </span>
                                    </div>

                                    <div style={styles.divider}></div>
                                    
                                    <div style={styles.descContainer}>
                                        {/* Description */}
                                        <div style={styles.leadDesc} dangerouslySetInnerHTML={{ __html: selected.description }}></div>
                                        
                                        {/* --- CONTEXTUAL GUIDES (Styled like BookingFlow alerts) --- */}
                                        {selected.resourceType === 'Article' && (
                                            <div className="rich-text-content" style={{ marginTop: '32px' }} dangerouslySetInnerHTML={{ __html: selected.content }}></div>
                                        )}
                                        
                                        {selected.resourceType === 'Video' && (
                                            <div style={styles.contextNoteBlue}>
                                                <div style={styles.contextIconBlue}>
                                                    <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"></circle><line x1="12" y1="16" x2="12" y2="12"></line><line x1="12" y1="8" x2="12.01" y2="8"></line></svg>
                                                </div>
                                                <p style={{margin: 0}}><strong>Instructor Note:</strong> Watch the video presentation above. Take notes on key wellness concepts and apply them to your daily student life.</p>
                                            </div>
                                        )}
                                        
                                        {selected.resourceType === 'PDF' && (
                                            <div style={styles.contextNoteBlue}>
                                                <div style={styles.contextIconBlue}>
                                                    <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"></circle><line x1="12" y1="16" x2="12" y2="12"></line><line x1="12" y1="8" x2="12.01" y2="8"></line></svg>
                                                </div>
                                                <p style={{margin: 0}}><strong>Document Access:</strong> Access the attached PDF document using the buttons in the media viewer above.</p>
                                            </div>
                                        )}

                                        {selected.resourceType === 'Audio' && (
                                            <div style={styles.contextNoteBlue}>
                                                <div style={styles.contextIconBlue}>
                                                    <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"></circle><line x1="12" y1="16" x2="12" y2="12"></line><line x1="12" y1="8" x2="12.01" y2="8"></line></svg>
                                                </div>
                                                <p style={{margin: 0}}><strong>Listening Guide:</strong> Find a comfortable space, hit play above, and take a moment to carefully listen and relax.</p>
                                            </div>
                                        )}

                                        {selected.resourceType === 'Link' && (
                                            <div style={styles.contextNoteBlue}>
                                                <div style={styles.contextIconBlue}>
                                                    <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71"></path><path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71"></path></svg>
                                                </div>
                                                <p style={{margin: 0}}>
                                                    <strong>External Resource:</strong>{' '}
                                                    <a href={selected.content} target="_blank" rel="noopener noreferrer" style={styles.linkBtn}>Click here to safely access this resource ➔</a>
                                                </p>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            </div>
                        )}
                    </main>
                </div>
            </div>
        </>
    );
}

const styles = {
    // UPDATED BACKGROUND TO SLATE-100 TO MAKE CARD POP
    dashboardContainer: { display: 'flex', minHeight: '100vh', width: '100%', fontFamily: "'Inter', 'Segoe UI', Roboto, sans-serif", backgroundColor: '#f1f5f9' },
    sidebar: { width: '250px', backgroundColor: '#ffffff', padding: '20px', boxShadow: '2px 0 10px rgba(0, 0, 0, 0.05)', display: 'flex', flexDirection: 'column', position: 'fixed', top: 0, left: 0, bottom: 0, boxSizing: 'border-box', zIndex: 1000, overflowY: 'auto' },
    mainWrapper: { flex: 1, marginLeft: '250px', boxSizing: 'border-box', minWidth: 0 },
    mainContent: { maxWidth: '1000px', margin: '48px auto 96px auto', padding: '0 32px', minWidth: 0 },
    
    // Header & Buttons
    backBtn: { backgroundColor: 'transparent', border: 'none', color: '#6b7280', fontWeight: '600', fontSize: '14px', cursor: 'pointer', padding: '0', display: 'flex', alignItems: 'center' },
    saveBtnTop: { display: 'flex', alignItems: 'center', gap: '8px', backgroundColor: '#ffffff', border: '1px solid #e5e7eb', color: '#4b5563', padding: '10px 16px', borderRadius: '12px', fontSize: '13px', fontWeight: '600', cursor: 'pointer', boxShadow: '0 1px 2px 0 rgba(0, 0, 0, 0.05)', outline: 'none' },
    removeBtnTop: { display: 'flex', alignItems: 'center', gap: '8px', backgroundColor: '#fef2f2', border: '1px solid #fecaca', color: '#dc2626', padding: '10px 16px', borderRadius: '12px', fontSize: '13px', fontWeight: '600', cursor: 'pointer', boxShadow: '0 1px 2px 0 rgba(0, 0, 0, 0.05)', outline: 'none' },
    
    loadingState: { textAlign: 'center', padding: '80px 0', color: '#6b7280', fontSize: '18px' },
    emptyState: { padding: '80px 0', textAlign: 'center' },
    emptyStateText: { color: '#6b7280', fontSize: '18px' }, 

    // --- MAIN CARD CONTAINER (Now with stronger shadow) ---
    detailContainer: { 
        backgroundColor: '#ffffff', 
        borderRadius: '24px', 
        border: '1px solid #e2e8f0', 
        boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 8px 10px -6px rgba(0, 0, 0, 0.1)', 
        display: 'flex', 
        flexDirection: 'column',
        overflow: 'visible' // Allows content to wrap naturally without cutting off
    },
    
    // --- MEDIA HEADER (FLEX CENTERED) ---
    mediaSection: { 
        width: '100%', 
        minHeight: '400px', 
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: '#f8fafc', 
        position: 'relative', 
        borderBottom: '1px solid #e2e8f0', 
        borderTopLeftRadius: '24px', 
        borderTopRightRadius: '24px', 
        overflow: 'hidden' 
    },
    clearImg: { width: '100%', height: '100%', objectFit: 'cover' },
    iframeStyle: { width: '100%', height: '100%', border: 'none' },
    
    // PDF SPECIFIC STYLING (Perfectly Centered)
    pdfContainer: { width: '100%', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '40px 20px', textAlign: 'center' },
    pdfIconWrapper: { marginBottom: '20px', display: 'flex', justifyContent: 'center' },
    pdfTitle: { color: '#111827', margin: '0 0 12px 0', fontSize: '32px', fontWeight: '800', fontFamily: 'Georgia, serif' },
    pdfSubtitle: { color: '#4b5563', margin: '0 0 32px 0', fontSize: '16px' },
    pdfButtonGroup: { display: 'flex', gap: '16px', justifyContent: 'center', alignItems: 'center', flexWrap: 'wrap', width: '100%' },
    
    pdfBtn: { backgroundColor: '#2563eb', color: '#ffffff', padding: '12px 32px', borderRadius: '12px', fontWeight: '600', border: 'none', cursor: 'pointer', fontSize: '15px', boxShadow: '0 1px 2px 0 rgba(0, 0, 0, 0.05)', outline: 'none' },
    pdfDownloadBtn: { display: 'flex', alignItems: 'center', backgroundColor: '#ffffff', color: '#374151', padding: '12px 32px', borderRadius: '12px', fontWeight: '600', border: '1px solid #d1d5db', cursor: 'pointer', fontSize: '15px', boxShadow: '0 1px 2px 0 rgba(0, 0, 0, 0.05)', outline: 'none' },
    
    // --- TEXT & CONTENT AREA ---
    textWrapper: { width: '100%', padding: '48px', flexGrow: 1, backgroundColor: '#ffffff', display: 'flex', flexDirection: 'column', boxSizing: 'border-box', overflowWrap: 'anywhere', wordBreak: 'break-word', borderBottomLeftRadius: '24px', borderBottomRightRadius: '24px' },
    
    hugeTitle: { 
        fontSize: '36px', 
        fontWeight: '800', 
        color: '#111827', 
        margin: '0 0 24px 0', 
        lineHeight: '1.3', 
        fontFamily: "Georgia, serif",
        wordBreak: 'break-all', // FORCES long unbroken strings to wrap to the next line
        overflowWrap: 'anywhere' 
    },
    
    // --- MODERN META PILLS ---
    metaGrid: { display: 'flex', flexWrap: 'wrap', gap: '12px', marginBottom: '32px' },
    
    metaPillTeal: { display: 'flex', alignItems: 'center', gap: '6px', padding: '6px 14px', backgroundColor: '#f0fdfa', border: '1px solid #ccfbf1', color: '#0d9488', borderRadius: '999px', fontSize: '13px', fontWeight: '600' },
    metaPillBlue: { display: 'flex', alignItems: 'center', gap: '6px', padding: '6px 14px', backgroundColor: '#eff6ff', border: '1px solid #dbeafe', color: '#2563eb', borderRadius: '999px', fontSize: '13px', fontWeight: '600' },
    metaPillPurple: { display: 'flex', alignItems: 'center', gap: '6px', padding: '6px 14px', backgroundColor: '#faf5ff', border: '1px solid #e9d5ff', color: '#9333ea', borderRadius: '999px', fontSize: '13px', fontWeight: '600' },
    metaPillGray: { display: 'flex', alignItems: 'center', gap: '6px', padding: '6px 14px', backgroundColor: '#f8fafc', border: '1px solid #e2e8f0', color: '#475569', borderRadius: '999px', fontSize: '13px', fontWeight: '600' },
    
    divider: { width: '100%', height: '1px', backgroundColor: '#f3f4f6', margin: '0 0 32px 0' },
    
    descContainer: { flexGrow: 1, marginBottom: '24px' },
    leadDesc: { fontSize: '16px', color: '#4b5563', margin: '0 0 24px 0', fontWeight: '400', lineHeight: '1.7' },
    
    // --- CONTEXT ALERTS ---
    contextNoteBlue: { display: 'flex', alignItems: 'flex-start', gap: '12px', padding: '20px', backgroundColor: '#eff6ff', border: '1px solid #dbeafe', borderRadius: '16px', color: '#1e3a8a', fontSize: '14px', lineHeight: '1.6', marginTop: '32px' },
    contextIconBlue: { color: '#2563eb', marginTop: '2px' },
    
    linkBtn: { color: '#2563eb', fontWeight: '600', textDecoration: 'underline' },
};
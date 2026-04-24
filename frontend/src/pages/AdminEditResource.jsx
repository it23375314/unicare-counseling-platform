import React, { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import { useNavigate, useParams } from 'react-router-dom';

// --- NATIVE ZERO-DEPENDENCY RICH TEXT EDITOR ---
const SimpleEditor = ({ value, onChange, minHeight = "80px" }) => {
    const editorRef = useRef(null);

    useEffect(() => {
        if (editorRef.current && value !== editorRef.current.innerHTML) {
            editorRef.current.innerHTML = value || '';
        }
    }, [value]);

    const exec = (cmd, val = null) => {
        document.execCommand(cmd, false, val);
        editorRef.current.focus();
        onChange(editorRef.current.innerHTML);
    };

    return (
        <div style={{ border: '1px solid #e5e7eb', borderRadius: '12px', backgroundColor: '#ffffff', overflow: 'hidden', boxShadow: '0 1px 2px 0 rgba(0, 0, 0, 0.05)' }}>
            <div style={{ display: 'flex', gap: '6px', padding: '8px 12px', background: '#f9fafb', borderBottom: '1px solid #e5e7eb', flexWrap: 'wrap' }}>
                <button type="button" onClick={() => exec('bold')} style={styles.tbBtn}><b>B</b></button>
                <button type="button" onClick={() => exec('italic')} style={styles.tbBtn}><i>I</i></button>
                <button type="button" onClick={() => exec('underline')} style={styles.tbBtn}><u>U</u></button>
                <button type="button" onClick={() => exec('formatBlock', 'H3')} style={styles.tbBtn}>H3</button>
                <button type="button" onClick={() => exec('insertUnorderedList')} style={styles.tbBtn}>• List</button>
                <button type="button" onClick={() => exec('removeFormat')} style={styles.tbBtn}>🧹 Clear</button>
            </div>
            <div
                ref={editorRef}
                contentEditable
                onInput={(e) => onChange(e.currentTarget.innerHTML)}
                onBlur={(e) => onChange(e.currentTarget.innerHTML)}
                style={{ minHeight, padding: '16px', outline: 'none', fontSize: '14px', color: '#111827', backgroundColor: '#fff' }}
            />
        </div>
    );
};

export default function AdminEditResource() {
    const { id } = useParams();
    const navigate = useNavigate();
    
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    
    const [imageFile, setImageFile] = useState(null);
    const [pdfFile, setPdfFile] = useState(null);
    const [audioFile, setAudioFile] = useState(null);

    const [errors, setErrors] = useState({});
    const [notification, setNotification] = useState(null);

    const [formData, setFormData] = useState({
        title: '', description: '', resourceType: 'Article',
        category: 'Stress', content: '', imageUrl: '',
        difficulty: 'Beginner', language: 'English', status: 'Published'
    });

    useEffect(() => {
        document.body.style.margin = "0";
        document.body.style.padding = "0";

        const fetchResource = async () => {
            try {
                const res = await axios.get(`http://localhost:5001/api/resources/admin/all`);
                const resource = res.data.find(r => r._id === id);
                if (resource) setFormData(resource);
            } catch (err) {
                console.error("Error fetching resource:", err);
            } finally {
                setLoading(false);
            }
        };
        fetchResource();
    }, [id]);

    const handleTypeChange = (e) => {
        setFormData({ ...formData, resourceType: e.target.value, content: '' });
        setPdfFile(null);
        setAudioFile(null);
        setErrors({});
    };

    const stripHtml = (html) => html ? html.replace(/<[^>]*>?/gm, '').trim() : '';

    const validateForm = () => {
        const newErrors = {};
        
        const textTitle = stripHtml(formData.title);
        if (!textTitle) newErrors.title = 'A resource title is required.';
        else if (textTitle.length < 5) newErrors.title = 'Title must be at least 5 characters long.';

        const textDesc = stripHtml(formData.description);
        if (!textDesc) newErrors.description = 'A short description is required.';
        else if (textDesc.length < 10) newErrors.description = 'Description must be at least 10 characters long.';

        if (formData.resourceType === 'Article') {
            const textContent = stripHtml(formData.content);
            if (!textContent) newErrors.content = 'Article content cannot be empty.';
            else if (textContent.length < 50) newErrors.content = 'Article is too short. Please provide more detail.';
        } else if (formData.resourceType === 'PDF') {
            if (!pdfFile && !formData.content) newErrors.pdf = 'You must have a PDF file linked.';
            if (pdfFile && pdfFile.size > 10 * 1024 * 1024) newErrors.pdf = 'PDF must be under 10MB.';
        } else if (formData.resourceType === 'Audio') {
            if (!audioFile && !formData.content) newErrors.audio = 'You must have an audio file linked.';
            if (audioFile && audioFile.size > 20 * 1024 * 1024) newErrors.audio = 'Audio must be under 20MB.';
        } else if (formData.resourceType === 'Video') {
            if (!formData.content.trim()) newErrors.content = 'A URL link is required.';
        }

        if (!imageFile && !formData.imageUrl) {
            newErrors.image = 'A cover image is required.';
        } else if (imageFile && imageFile.size > 5 * 1024 * 1024) {
            newErrors.image = 'Cover image must be under 5MB.';
        }

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (!validateForm()) {
            setNotification({ type: 'error', message: '⚠️ Please fix the highlighted errors below before saving.' });
            window.scrollTo({ top: 0, behavior: 'smooth' });
            return;
        }

        setSaving(true);
        setNotification(null);

        const data = new FormData();
        if (imageFile) data.append('image', imageFile);
        else data.append('imageUrl', formData.imageUrl);

        if (formData.resourceType === 'PDF' && pdfFile) data.append('pdf', pdfFile);
        else if (formData.resourceType === 'Audio' && audioFile) data.append('audio', audioFile);
        else data.append('content', formData.content);

        data.append('title', formData.title);
        data.append('description', formData.description);
        data.append('resourceType', formData.resourceType);
        data.append('category', formData.category);
        data.append('difficulty', formData.difficulty);
        data.append('language', formData.language);
        data.append('status', formData.status);

        try {
            await axios.put(`http://localhost:5001/api/resources/edit/${id}`, data, { headers: { 'Content-Type': 'multipart/form-data' } });
            setNotification({ type: 'success', message: '✅ Resource Updated Successfully! Redirecting...' });
            setTimeout(() => navigate('/admin/resources'), 1500);
        } catch (err) {
            setNotification({ type: 'error', message: '❌ Update failed: ' + (err.response?.data?.msg || err.message) });
        } finally {
            setSaving(false);
        }
    };

    const handleLogout = () => {
        if (window.confirm("End admin session?")) {
            localStorage.clear();
            window.location.href = '/login';
        }
    };

    if (loading) return <div style={styles.loadingState}>Loading Resource Data...</div>;

    return (
        <>
            <style>{`
                .sidebar-item { padding: 15px; margin-bottom: 10px; border-radius: 8px; cursor: pointer; color: #4b5563; font-weight: 500; transition: all 0.3s ease; }
                .sidebar-item:hover { background-color: #f3f4f6; color: #111827; }
                
                .back-btn { transition: color 0.2s ease; }
                .back-btn:hover { color: #111827 !important; }
                
                .submit-btn { transition: background-color 0.2s ease; }
                .submit-btn:hover { background-color: #1d4ed8 !important; }
            `}</style>

            <div style={styles.dashboardContainer}>
                
                {/* --- SIDEBAR --- */}
                <div style={styles.sidebar}>
                    <h2 style={{ color: '#2563eb', marginBottom: '40px', textAlign: 'center', marginTop: 0 }}>
                        UniCare Admin
                    </h2>
                    <ul style={{ listStyle: 'none', padding: 0, flex: 1, margin: 0 }}>
                        <li className="sidebar-item" onClick={() => navigate('/admin-dashboard')}>🛡️ Control Panel</li>
                        <li className="sidebar-item" style={{ backgroundColor: '#eff6ff', color: '#1d4ed8', fontWeight: 'bold' }} onClick={() => navigate('/admin/resources')}>📚 Resource Library</li>
                        <li className="sidebar-item" onClick={() => navigate('/admin-analytics')}>📊 System Analytics</li>
                        <li className="sidebar-item" onClick={() => navigate('/admin-users')}>👥 User Management</li>
                        <li className="sidebar-item" onClick={() => navigate('/admin-logs')}>📝 Platform Logs</li>
                        <li className="sidebar-item" onClick={() => navigate('/system-config')}>⚙️ System Config</li>
                        <li className="sidebar-item" onClick={() => navigate('/settings')}>⚙️ Settings</li>
                    </ul>
                    <ul style={{ listStyle: 'none', padding: 0, flex: 0, margin: 0 }}>
                        <li className="sidebar-item" onClick={handleLogout} style={{ color: '#dc2626' }}>🚪 Logout</li>
                    </ul>
                </div>

                <div style={styles.mainContent}>
                    <div style={styles.contentMaxWidth}>

                        <div style={styles.headerSection}>
                            <div>
                                <h1 style={styles.mainTitle}>Edit Resource</h1>
                                <p style={styles.subTitle}>Update information or replace media for this resource.</p>
                            </div>
                            <button className="back-btn" onClick={() => navigate(-1)} style={styles.backBtn}>
                                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{marginRight: '6px'}}><line x1="19" y1="12" x2="5" y2="12"></line><polyline points="12 19 5 12 12 5"></polyline></svg>
                                Back to Library
                            </button>
                        </div>

                        {notification && (
                            <div style={notification.type === 'success' ? styles.notifySuccess : styles.notifyError}>
                                {notification.message}
                            </div>
                        )}

                        <form onSubmit={handleSubmit} style={styles.formLayout} noValidate>
                            {/* --- LEFT COLUMN: MAIN CONTENT --- */}
                            <div style={styles.mainColumn}>
                                <div style={styles.cardPanel}>
                                    <div style={styles.panelHeader}>
                                        <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#2563eb" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path><polyline points="14 2 14 8 20 8"></polyline><line x1="16" y1="13" x2="8" y2="13"></line><line x1="16" y1="17" x2="8" y2="17"></line><polyline points="10 9 9 9 8 9"></polyline></svg>
                                        Primary Content
                                    </div>
                                    
                                    <div style={styles.inputGroup}>
                                        <label style={styles.inputLabel}>Resource Title <span style={{color: '#ef4444'}}>*</span></label>
                                        <div style={errors.title ? {border: '1px solid #ef4444', borderRadius: '12px'} : {}}>
                                            <SimpleEditor value={formData.title} onChange={(val) => setFormData({...formData, title: val})} minHeight="50px" />
                                        </div>
                                        {errors.title && <span style={styles.errorText}>⚠️ {errors.title}</span>}
                                    </div>
                                    
                                    <div style={styles.inputGroup}>
                                        <label style={styles.inputLabel}>Short Description <span style={{color: '#ef4444'}}>*</span></label>
                                        <div style={errors.description ? {border: '1px solid #ef4444', borderRadius: '12px'} : {}}>
                                            <SimpleEditor value={formData.description} onChange={(val) => setFormData({...formData, description: val})} minHeight="100px" />
                                        </div>
                                        {errors.description && <span style={styles.errorText}>⚠️ {errors.description}</span>}
                                    </div>
                                    
                                    {formData.resourceType === 'Article' ? (
                                        <div style={styles.inputGroup}>
                                            <label style={styles.inputLabel}>Full Article Content <span style={{color: '#ef4444'}}>*</span></label>
                                            <div style={errors.content ? {border: '1px solid #ef4444', borderRadius: '12px'} : {}}>
                                                <SimpleEditor value={formData.content} onChange={(val) => setFormData({...formData, content: val})} minHeight="300px" />
                                            </div>
                                            {errors.content && <span style={styles.errorText}>⚠️ {errors.content}</span>}
                                        </div>
                                    ) : formData.resourceType === 'PDF' ? (
                                        <div style={styles.inputGroup}>
                                            <label style={styles.inputLabel}>PDF Document <span style={{color: '#ef4444'}}>*</span></label>
                                            <div style={errors.pdf ? {...styles.fileDropzone, ...styles.inputError} : styles.fileDropzone}>
                                                <span style={{fontSize: '28px', marginBottom: '8px'}}>📑</span>
                                                <span style={{fontSize: '14px', fontWeight: '600', color: '#2563eb'}}>Click to upload a new PDF</span>
                                                <input type="file" accept=".pdf,application/pdf" style={styles.fileInputHidden} onChange={(e) => setPdfFile(e.target.files[0])} />
                                                {pdfFile ? <div style={styles.fileName}><span style={{color: '#10b981'}}>✔</span> {pdfFile.name} (New)</div> : <div style={styles.currentFileNotice}><strong>Current File:</strong> {formData.content ? formData.content.split('/').pop() : 'No file linked'}</div>}
                                            </div>
                                            {errors.pdf && <span style={styles.errorText}>⚠️ {errors.pdf}</span>}
                                        </div>
                                    ) : formData.resourceType === 'Audio' ? (
                                        <div style={styles.inputGroup}>
                                            <label style={styles.inputLabel}>Audio File <span style={{color: '#ef4444'}}>*</span></label>
                                            <div style={errors.audio ? {...styles.fileDropzone, ...styles.inputError} : styles.fileDropzone}>
                                                <span style={{fontSize: '28px', marginBottom: '8px'}}>🎧</span>
                                                <span style={{fontSize: '14px', fontWeight: '600', color: '#2563eb'}}>Click to upload a new audio file</span>
                                                <input type="file" accept="audio/*" style={styles.fileInputHidden} onChange={(e) => setAudioFile(e.target.files[0])} />
                                                {audioFile ? <div style={styles.fileName}><span style={{color: '#10b981'}}>✔</span> {audioFile.name} (New)</div> : <div style={styles.currentFileNotice}><strong>Current File:</strong> {formData.content ? formData.content.split('/').pop() : 'No file linked'}</div>}
                                            </div>
                                            {errors.audio && <span style={styles.errorText}>⚠️ {errors.audio}</span>}
                                        </div>
                                    ) : (
                                        <div style={styles.inputGroup}>
                                            <label style={styles.inputLabel}>YouTube Video Link <span style={{color: '#ef4444'}}>*</span></label>
                                            <input type="url" style={errors.content ? {...styles.inputStandard, ...styles.inputError} : styles.inputStandard} value={formData.content} onChange={(e) => setFormData({ ...formData, content: e.target.value })} />
                                            {errors.content && <span style={styles.errorText}>⚠️ {errors.content}</span>}
                                        </div>
                                    )}
                                </div>
                            </div>

                            {/* --- RIGHT COLUMN: SETTINGS --- */}
                            <div style={styles.sidebarColumn}>
                                <div style={styles.cardPanel}>
                                    <div style={styles.panelHeader}>
                                        <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#2563eb" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"></path><polyline points="3.27 6.96 12 12.01 20.73 6.96"></polyline><line x1="12" y1="22.08" x2="12" y2="12"></line></svg>
                                        Classification
                                    </div>
                                    <div style={styles.inputGroup}>
                                        <label style={styles.inputLabel}>Resource Type</label>
                                        <select style={styles.selectStandard} value={formData.resourceType} onChange={handleTypeChange}>
                                            <option value="Article">📄 Article</option>
                                            <option value="Video">🎬 Video</option>
                                            <option value="PDF">📑 PDF Document</option>
                                            <option value="Audio">🎧 Audio</option>
                                        </select>
                                    </div>
                                    <div style={styles.inputGroup}>
                                        <label style={styles.inputLabel}>Category</label>
                                        <select style={styles.selectStandard} value={formData.category} onChange={(e) => setFormData({ ...formData, category: e.target.value })}>
                                            <option value="Stress">Stress Management</option>
                                            <option value="Anxiety">Anxiety Relief</option>
                                            <option value="Motivation">Study Motivation</option>
                                            <option value="Health">Physical Health</option>
                                        </select>
                                    </div>
                                    <div style={styles.grid2Col}>
                                        <div style={styles.inputGroup}>
                                            <label style={styles.inputLabel}>Difficulty</label>
                                            <select style={styles.selectStandard} value={formData.difficulty} onChange={(e) => setFormData({ ...formData, difficulty: e.target.value })}>
                                                <option value="Beginner">Beginner</option>
                                                <option value="Intermediate">Intermediate</option>
                                                <option value="Advanced">Advanced</option>
                                            </select>
                                        </div>
                                        <div style={styles.inputGroup}>
                                            <label style={styles.inputLabel}>Language</label>
                                            <select style={styles.selectStandard} value={formData.language} onChange={(e) => setFormData({ ...formData, language: e.target.value })}>
                                                <option value="English">English</option>
                                                <option value="Sinhala">Sinhala</option>
                                                <option value="Tamil">Tamil</option>
                                            </select>
                                        </div>
                                    </div>
                                </div>

                                <div style={styles.cardPanel}>
                                    <div style={styles.panelHeader}>
                                        <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#2563eb" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="3" width="18" height="18" rx="2" ry="2"></rect><circle cx="8.5" cy="8.5" r="1.5"></circle><polyline points="21 15 16 10 5 21"></polyline></svg>
                                        Media
                                    </div>
                                    <div style={styles.inputGroup}>
                                        <label style={styles.inputLabel}>Cover Image <span style={{color: '#ef4444'}}>*</span></label>
                                        <div style={errors.image ? {...styles.fileDropzone, ...styles.inputError} : styles.fileDropzone}>
                                            <span style={{fontSize: '24px', marginBottom: '8px'}}>📸</span>
                                            <span style={{fontSize: '13px', fontWeight: '600', color: '#2563eb'}}>Upload new cover image</span>
                                            <input type="file" accept="image/*" style={styles.fileInputHidden} onChange={(e) => setImageFile(e.target.files[0])} />
                                            {imageFile ? <div style={styles.fileName}><span style={{color: '#10b981'}}>✔</span> {imageFile.name} (New)</div> : formData.imageUrl ? <div style={styles.currentFileNotice}>Current: {formData.imageUrl.split('/').pop()}</div> : null}
                                        </div>
                                        {errors.image && <span style={styles.errorText}>⚠️ {errors.image}</span>}
                                    </div>
                                </div>

                                <div style={styles.cardPanel}>
                                    <div style={styles.panelHeader}>
                                        <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#2563eb" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"></path></svg>
                                        Publish Settings
                                    </div>
                                    <div style={styles.inputGroup}>
                                        <label style={styles.inputLabel}>Visibility Status</label>
                                        <select style={styles.selectStandard} value={formData.status} onChange={(e) => setFormData({ ...formData, status: e.target.value })}>
                                            <option value="Published">🟢 Published (Live)</option>
                                            <option value="Draft">🟡 Draft (Hidden)</option>
                                            <option value="Archived">⚪ Archived</option>
                                        </select>
                                    </div>
                                    <button type="submit" disabled={saving} className="submit-btn" style={saving ? {...styles.submitBtn, opacity: 0.7} : styles.submitBtn}>
                                        {saving ? 'Saving Changes...' : 'Save Changes ➔'}
                                    </button>
                                </div>
                            </div>
                        </form>
                    </div>
                </div>
            </div>
        </>
    );
}

const styles = {
    dashboardContainer: { display: 'flex', minHeight: '100vh', width: '100%', fontFamily: "'Inter', 'Segoe UI', sans-serif", backgroundColor: '#f9fafb' },
    sidebar: { width: '250px', backgroundColor: '#ffffff', padding: '20px', boxShadow: '2px 0 10px rgba(0, 0, 0, 0.05)', display: 'flex', flexDirection: 'column', position: 'fixed', top: '80px', left: 0, bottom: 0, boxSizing: 'border-box', zIndex: 40 },
    mainContent: { flex: 1, marginLeft: '250px', padding: '48px 40px', boxSizing: 'border-box' },
    contentMaxWidth: { maxWidth: '1000px', margin: '0 auto' },
    
    // Toolbar Button
    tbBtn: { padding: '6px 12px', background: '#ffffff', border: '1px solid #e5e7eb', borderRadius: '8px', cursor: 'pointer', fontSize: '13px', fontWeight: '600', color: '#4b5563', transition: 'background 0.2s', outline: 'none' },
    
    loadingState: { minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', backgroundColor: '#f9fafb', color: '#6b7280', fontSize: '18px', fontWeight: '600' },

    headerSection: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '20px', marginBottom: '40px' },
    mainTitle: { fontSize: '36px', fontWeight: '800', margin: '0 0 8px 0', color: '#111827', fontFamily: "Georgia, serif" },
    subTitle: { color: '#6b7280', fontSize: '16px', margin: 0, fontWeight: '400' },
    backBtn: { backgroundColor: 'transparent', color: '#6b7280', padding: '0', border: 'none', fontWeight: '600', fontSize: '14px', cursor: 'pointer', display: 'flex', alignItems: 'center' },
    
    notifySuccess: { marginBottom: '24px', padding: '16px 20px', borderRadius: '12px', backgroundColor: '#f0fdf4', color: '#166534', fontWeight: '600', fontSize: '14px', border: '1px solid #bbf7d0', display: 'flex', alignItems: 'center' },
    notifyError: { marginBottom: '24px', padding: '16px 20px', borderRadius: '12px', backgroundColor: '#fef2f2', color: '#991b1b', fontWeight: '600', fontSize: '14px', border: '1px solid #fecaca', display: 'flex', alignItems: 'center' },
    
    formLayout: { display: 'flex', gap: '24px', alignItems: 'flex-start', flexWrap: 'wrap' },
    mainColumn: { flex: '2 1 600px', display: 'flex', flexDirection: 'column', gap: '24px' },
    sidebarColumn: { flex: '1 1 300px', display: 'flex', flexDirection: 'column', gap: '24px' },
    
    cardPanel: { backgroundColor: '#ffffff', borderRadius: '24px', border: '1px solid #f3f4f6', boxShadow: '0 1px 3px 0 rgba(0, 0, 0, 0.05), 0 4px 6px -2px rgba(0, 0, 0, 0.05)', padding: '32px', display: 'flex', flexDirection: 'column', gap: '24px' },
    panelHeader: { fontSize: '16px', fontWeight: '700', color: '#111827', display: 'flex', alignItems: 'center', gap: '10px', borderBottom: '1px solid #f3f4f6', paddingBottom: '16px', margin: 0 },
    
    inputGroup: { display: 'flex', flexDirection: 'column', gap: '8px' },
    inputLabel: { fontSize: '13px', fontWeight: '600', color: '#374151' },
    grid2Col: { display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' },
    
    inputStandard: { width: '100%', padding: '14px 16px', borderRadius: '12px', border: '1px solid #e5e7eb', backgroundColor: '#ffffff', fontSize: '14px', color: '#111827', outline: 'none', boxSizing: 'border-box', transition: 'border-color 0.2s', fontFamily: 'inherit' },
    selectStandard: { width: '100%', padding: '14px 16px', borderRadius: '12px', border: '1px solid #e5e7eb', backgroundColor: '#ffffff', fontSize: '14px', fontWeight: '500', color: '#111827', outline: 'none', boxSizing: 'border-box', cursor: 'pointer' },
    
    inputError: { border: '1px solid #ef4444', backgroundColor: '#fef2f2' },
    errorText: { color: '#dc2626', fontSize: '12px', fontWeight: '600', marginTop: '2px' },
    
    fileDropzone: { position: 'relative', width: '100%', padding: '32px 20px', borderRadius: '16px', border: '2px dashed #cbd5e1', backgroundColor: '#f8fafc', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', boxSizing: 'border-box', transition: 'all 0.2s ease' },
    fileInputHidden: { position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', opacity: 0, cursor: 'pointer' },
    fileName: { marginTop: '12px', fontSize: '13px', color: '#0f172a', fontWeight: '600', wordBreak: 'break-all', textAlign: 'center', backgroundColor: '#f1f5f9', padding: '6px 12px', borderRadius: '8px' },
    currentFileNotice: { marginTop: '8px', fontSize: '12px', color: '#6b7280', fontStyle: 'italic', wordBreak: 'break-all', textAlign: 'center' },
    
    submitBtn: { marginTop: '8px', width: '100%', backgroundColor: '#2563eb', color: 'white', padding: '14px', borderRadius: '12px', border: 'none', fontWeight: '600', fontSize: '15px', cursor: 'pointer', boxShadow: '0 1px 2px 0 rgba(0, 0, 0, 0.05)', transition: 'background-color 0.2s ease' }
};

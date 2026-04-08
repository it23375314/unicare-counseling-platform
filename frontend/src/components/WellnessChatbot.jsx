import React, { useState, useRef, useEffect } from 'react';
import axios from 'axios';

export default function WellnessChatbot({ isOpen: controlledOpen, onOpen, onClose, inline = false, showToggle = true }) {
    const [internalOpen, setInternalOpen] = useState(false);
    const isOpen = typeof controlledOpen === 'boolean' ? controlledOpen : internalOpen;
    const [messages, setMessages] = useState([
        { role: 'bot', content: "Hi there! I'm UniBot. How are you feeling today? You can share your mood or ask me a wellness question." }
    ]);
    const [inputText, setInputText] = useState('');
    const [isTyping, setIsTyping] = useState(false);
    const messagesEndRef = useRef(null);
    const messagesContainerRef = useRef(null);

    // Auto-scroll to the newest message
    const scrollToBottom = () => {
        if (messagesContainerRef.current) {
            messagesContainerRef.current.scrollTop = messagesContainerRef.current.scrollHeight;
            return;
        }
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    };

    useEffect(() => {
        scrollToBottom();
    }, [messages, isTyping]);

    const handleSendMessage = async (e) => {
        e.preventDefault();
        if (!inputText.trim()) return;

        const userMsg = { role: 'user', content: inputText };
        setMessages(prev => [...prev, userMsg]);
        setInputText('');
        setIsTyping(true);

        try {
            // Prepare history to give the AI context of the conversation
            const history = messages.map(msg => ({
                role: msg.role === 'bot' ? 'assistant' : 'user',
                content: msg.content
            }));

            // Send to your backend API
            const res = await axios.post('http://localhost:5001/api/chat', {
                message: userMsg.content,
                history: history
            });

            setMessages(prev => [...prev, { role: 'bot', content: res.data.reply }]);
        } catch (error) {
            setMessages(prev => [...prev, { role: 'bot', content: "Sorry, I'm having trouble connecting to the server. Please try again in a moment." }]);
        } finally {
            setIsTyping(false);
        }
    };

    const handleOpen = () => {
        if (typeof controlledOpen === 'boolean') {
            if (onOpen) onOpen();
            return;
        }
        setInternalOpen(true);
    };

    const handleClose = () => {
        if (typeof controlledOpen === 'boolean') {
            if (onClose) onClose();
            return;
        }
        setInternalOpen(false);
    };

    return (
        <div style={inline ? styles.inlineContainer : styles.container}>
            {/* Chatbot Window */}
            {isOpen && (
                <div style={inline ? styles.inlineChatWindow : styles.chatWindow}>
                    {/* Header */}
                    <div style={styles.header}>
                        <div style={styles.headerTitle}>
                            <span style={styles.botAvatar}>ðŸ¤–</span>
                            <div>
                                <h3 style={{ margin: 0, fontSize: '15px', color: 'white' }}>UniBot Support</h3>
                                <p style={{ margin: 0, fontSize: '11px', color: '#bfdbfe' }}>Always here to listen</p>
                            </div>
                        </div>
                        <button onClick={handleClose} style={styles.closeBtn}>âœ–</button>
                    </div>

                    {/* Messages Area */}
                    <div ref={messagesContainerRef} style={styles.messagesContainer}>
                        {messages.map((msg, idx) => (
                            <div key={idx} style={msg.role === 'user' ? styles.userMessageRow : styles.botMessageRow}>
                                {msg.role === 'bot' && <div style={styles.botSmallAvatar}>ðŸ¤–</div>}
                                <div style={msg.role === 'user' ? styles.userBubble : styles.botBubble}>
                                    {msg.content}
                                </div>
                            </div>
                        ))}
                        {isTyping && (
                            <div style={styles.botMessageRow}>
                                <div style={styles.botSmallAvatar}>ðŸ¤–</div>
                                <div style={{ ...styles.botBubble, fontStyle: 'italic', color: '#6b7280' }}>
                                    Typing...
                                </div>
                            </div>
                        )}
                        <div ref={messagesEndRef} />
                    </div>

                    {/* Input Area */}
                    <form onSubmit={handleSendMessage} style={styles.inputArea}>
                        <input
                            type="text"
                            style={styles.input}
                            placeholder="Type how you feel..."
                            value={inputText}
                            onChange={(e) => setInputText(e.target.value)}
                            disabled={isTyping}
                        />
                        <button type="submit" style={styles.sendBtn} disabled={!inputText.trim() || isTyping}>
                            <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="22" y1="2" x2="11" y2="13"></line><polygon points="22 2 15 22 11 13 2 9 22 2"></polygon></svg>
                        </button>
                    </form>
                </div>
            )}

            {/* Floating Toggle Button */}
            {showToggle && !isOpen && !inline && (
                <button onClick={handleOpen} style={styles.toggleBtn}>
                    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"></path></svg>
                </button>
            )}
        </div>
    );
}

const styles = {
    container: { position: 'fixed', bottom: '30px', right: '30px', zIndex: 9999, fontFamily: "'Inter', sans-serif" },
    inlineContainer: { width: '100%', fontFamily: "'Inter', sans-serif", display: 'flex', justifyContent: 'stretch' },
    
    toggleBtn: { backgroundColor: '#2563eb', color: 'white', border: 'none', borderRadius: '50%', width: '60px', height: '60px', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', boxShadow: '0 4px 12px rgba(37, 99, 235, 0.4)', transition: 'transform 0.2s' },
    
    chatWindow: { backgroundColor: 'white', width: 'min(92vw, 480px)', height: '560px', borderRadius: '20px', display: 'flex', flexDirection: 'column', overflow: 'hidden', boxShadow: '0 10px 25px rgba(0, 0, 0, 0.15)', border: '1px solid #e5e7eb' },
    inlineChatWindow: { backgroundColor: 'white', width: '100%', maxWidth: 'none', height: '560px', margin: '0', borderRadius: '20px', display: 'flex', flexDirection: 'column', overflow: 'hidden', boxShadow: '0 10px 25px rgba(0, 0, 0, 0.12)', border: '1px solid #e5e7eb', boxSizing: 'border-box' },
    
    header: { backgroundColor: '#2563eb', padding: '16px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' },
    headerTitle: { display: 'flex', alignItems: 'center', gap: '10px' },
    botAvatar: { fontSize: '24px', backgroundColor: 'white', borderRadius: '50%', padding: '4px' },
    closeBtn: { background: 'transparent', border: 'none', color: '#bfdbfe', fontSize: '16px', cursor: 'pointer' },
    
    messagesContainer: { flex: 1, padding: '16px', overflowY: 'auto', backgroundColor: '#f9fafb', display: 'flex', flexDirection: 'column', gap: '12px' },
    
    userMessageRow: { display: 'flex', justifyContent: 'flex-end' },
    botMessageRow: { display: 'flex', justifyContent: 'flex-start', alignItems: 'flex-end', gap: '8px' },
    
    botSmallAvatar: { fontSize: '16px', marginBottom: '4px' },
    
    userBubble: { backgroundColor: '#2563eb', color: 'white', padding: '10px 14px', borderRadius: '16px 16px 0 16px', maxWidth: '75%', fontSize: '14px', lineHeight: '1.4' },
    botBubble: { backgroundColor: '#ffffff', color: '#111827', padding: '10px 14px', borderRadius: '16px 16px 16px 0', maxWidth: '75%', fontSize: '14px', lineHeight: '1.4', border: '1px solid #e5e7eb', boxShadow: '0 1px 2px rgba(0,0,0,0.05)' },
    
    inputArea: { display: 'flex', padding: '16px', backgroundColor: 'white', borderTop: '1px solid #e5e7eb', gap: '10px' },
    input: { flex: 1, padding: '10px 16px', borderRadius: '20px', border: '1px solid #d1d5db', outline: 'none', fontSize: '14px' },
    sendBtn: { backgroundColor: '#2563eb', color: 'white', border: 'none', borderRadius: '50%', width: '40px', height: '40px', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer' }
};
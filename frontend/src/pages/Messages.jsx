import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import '../styles/Dashboard.css';

const Messages = () => {
  const navigate = useNavigate();

  // Mock data for chat list
  const [chats] = useState([
    { id: 1, name: 'Emma Wilson', lastMsg: 'Thank you for the session!', time: '10:30 AM', unread: true, online: true },
    { id: 2, name: 'Liam Brown', lastMsg: 'Can we reschedule?', time: 'Yesterday', unread: false, online: false },
    { id: 3, name: 'Noah James', lastMsg: 'I am feeling much better.', time: 'Mar 22', unread: false, online: true },
  ]);

  const [activeChat, setActiveChat] = useState(chats[0]);
  const [messageText, setMessageText] = useState('');

  const handleLogout = () => {
    localStorage.removeItem('isLoggedIn');
    localStorage.removeItem('userRole');
    navigate('/');
  };

  return (
    <div className="dashboard-container">
      {/* Sidebar - Matching UniCare Pro */}
      <div className="sidebar">
        <h2 style={{ color: '#007bff', marginBottom: '30px', paddingLeft: '20px' }}>UniCare Pro</h2>
        <ul>
          <li onClick={() => navigate('/counsellor-dashboard')}>🏠 Overview</li>
          <li onClick={() => navigate('/my-schedule')}>📅 My Schedule</li>
          <li onClick={() => navigate('/student-records')}>📄 Student Records</li>
          <li style={{ backgroundColor: '#f0f4ff', color: '#007bff', fontWeight: 'bold' }}>💬 Messages</li>
          <li onClick={() => navigate('/settings')}>⚙️ Settings</li>
        </ul>
        <div style={{ marginTop: 'auto', paddingLeft: '20px', paddingBottom: '20px' }}>
          <li onClick={handleLogout} style={{ color: '#dc3545', listStyle: 'none', cursor: 'pointer' }}>🚪 Logout</li>
        </div>
      </div>

      {/* Main Content Area */}
      <div className="main-content" style={{ display: 'flex', gap: '0', padding: '0', height: '100vh' }}>
        
        {/* Chat List Column */}
        <div style={{ width: '350px', background: 'white', borderRight: '1px solid #eee', display: 'flex', flexDirection: 'column' }}>
          <div style={{ padding: '25px', borderBottom: '1px solid #eee' }}>
            <h2 style={{ margin: 0, fontSize: '22px' }}>Messages</h2>
          </div>
          <div style={{ overflowY: 'auto' }}>
            {chats.map(chat => (
              <div 
                key={chat.id}
                onClick={() => setActiveChat(chat)}
                style={{ 
                  padding: '15px 25px', 
                  cursor: 'pointer', 
                  borderBottom: '1px solid #f9f9f9',
                  background: activeChat.id === chat.id ? '#f0f4ff' : 'transparent',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '15px'
                }}
              >
                <div style={{ position: 'relative' }}>
                  <div style={{ width: '45px', height: '45px', borderRadius: '50%', background: '#ddd', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 'bold', color: '#666' }}>
                    {chat.name.charAt(0)}
                  </div>
                  {chat.online && <div style={{ position: 'absolute', bottom: 0, right: 0, width: '12px', height: '12px', background: '#28a745', border: '2px solid white', borderRadius: '50%' }}></div>}
                </div>
                <div style={{ flex: 1 }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                    <strong style={{ fontSize: '14px' }}>{chat.name}</strong>
                    <span style={{ fontSize: '11px', color: '#aaa' }}>{chat.time}</span>
                  </div>
                  <p style={{ margin: 0, fontSize: '13px', color: chat.unread ? '#333' : '#888', fontWeight: chat.unread ? 'bold' : 'normal', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', width: '180px' }}>
                    {chat.lastMsg}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Conversation Column */}
        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', background: '#f8f9fa' }}>
          {/* Chat Header */}
          <div style={{ padding: '15px 30px', background: 'white', borderBottom: '1px solid #eee', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div>
              <h3 style={{ margin: 0 }}>{activeChat.name}</h3>
              <span style={{ fontSize: '12px', color: activeChat.online ? '#28a745' : '#888' }}>
                {activeChat.online ? '● Online' : 'Offline'}
              </span>
            </div>
            <button style={{ background: 'none', border: 'none', fontSize: '20px', cursor: 'pointer' }}>⋮</button>
          </div>

          {/* Messages Area */}
          <div style={{ flex: 1, padding: '30px', overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '15px' }}>
            <div style={{ alignSelf: 'flex-start', background: 'white', padding: '12px 18px', borderRadius: '15px 15px 15px 0', boxShadow: '0 2px 5px rgba(0,0,0,0.05)', maxWidth: '70%', fontSize: '14px' }}>
              Hello! How are you feeling today after our session?
            </div>
            <div style={{ alignSelf: 'flex-end', background: '#007bff', color: 'white', padding: '12px 18px', borderRadius: '15px 15px 0 15px', boxShadow: '0 2px 5px rgba(0,0,0,0.1)', maxWidth: '70%', fontSize: '14px' }}>
              I'm doing much better, thank you for the mindfulness tips!
            </div>
          </div>

          {/* Input Area */}
          <div style={{ padding: '20px 30px', background: 'white', borderTop: '1px solid #eee' }}>
            <div style={{ display: 'flex', gap: '10px' }}>
              <input 
                type="text" 
                placeholder="Type your message..." 
                value={messageText}
                onChange={(e) => setMessageText(e.target.value)}
                style={{ flex: 1, padding: '12px 20px', borderRadius: '25px', border: '1px solid #eee', background: '#f8f9fa' }}
              />
              <button style={{ background: '#007bff', color: 'white', border: 'none', width: '45px', height: '45px', borderRadius: '50%', cursor: 'pointer', fontSize: '18px' }}>
                ➤
              </button>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
};

export default Messages;
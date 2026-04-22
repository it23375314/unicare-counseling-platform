import { useState, useRef, useEffect } from "react";
import { useAuth } from "../../context/AuthContext";
import { useChat } from "../../context/ChatContext";
import { useLocation, useNavigate } from "react-router-dom";
import { Send, UserCircle, Search, Settings, ArrowLeft, MoreVertical, Paperclip, Smile, Bot, Zap, MessageCircle, Shield, Sparkles, CheckCircle } from "lucide-react";
import EmojiPicker from 'emoji-picker-react';

// Custom Background Asset imports removed in favor of CSS utility classes


export default function ChatUI() {
  const { user } = useAuth();
  const { 
    conversations, 
    activeMessages, 
    activeTarget, 
    setActiveTarget, 
    fetchHistory, 
    sendMessage, 
    sendTyping, 
    isTyping,
    fetchConversationList
  } = useChat();
  
  const location = useLocation();
  const navigate = useNavigate();
  const queryParams = new URLSearchParams(location.search);
  const studentIdFromUrl = queryParams.get("id");
  const appointmentIdFromUrl = queryParams.get("appointmentId");
  const studentNameFromUrl = queryParams.get("name") || "Student User";

  const [input, setInput] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const endRef = useRef(null);

  // Initial fetch of conversation list on mount
  useEffect(() => {
    fetchConversationList();
  }, [fetchConversationList]);

  // Handle URL params for direct chat navigation
  useEffect(() => {
    if (appointmentIdFromUrl && studentIdFromUrl) {
      const chatInfo = conversations.find(c => c.appointmentId === appointmentIdFromUrl);
      const target = { 
        id: studentIdFromUrl, 
        name: studentNameFromUrl, 
        appointmentId: appointmentIdFromUrl,
        status: chatInfo?.status || "In Session"
      };

      // CRITICAL: Prevent re-fetching history if we are already in this thread
      if (activeTarget?.appointmentId !== appointmentIdFromUrl) {
         console.log("🔗 [ChatUI] Syncing state with URL params:", appointmentIdFromUrl);
         setActiveTarget(target);
         fetchHistory(appointmentIdFromUrl);
      }
    }
  }, [appointmentIdFromUrl, studentIdFromUrl, studentNameFromUrl, setActiveTarget, fetchHistory, activeTarget?.appointmentId]);

  // Deep Diagnostic Trace: Log messages every time they update
  useEffect(() => {
    console.log(`📊 [ChatUI] Messages state updated. Count: ${activeMessages.length}`);
    if (activeMessages.length > 0) {
      console.log("📋 [ChatUI] Latest message visible to UI:", activeMessages[activeMessages.length - 1]);
    }
  }, [activeMessages]);

  // Scroll to bottom on updates
  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [activeMessages, isTyping]);

  const handleSend = (e) => {
    if (e) e.preventDefault();
    
    // User requested diagnostic logs
    console.log("🔥 [handleSend] send handler fires");
    console.log(`📤 [handleSend] current conversation ID matches the sent message: ${activeTarget?.appointmentId === appointmentIdFromUrl}`);
    
    if (!input.trim() || !activeTarget) return;

    // Additional frontend safeguard: Students restricted if not Completed
    if (user.role === 'student' && activeTarget.status !== 'Completed') return;

    sendMessage(activeTarget.appointmentId, activeTarget.id, input);
    setInput("");
    setShowEmojiPicker(false);
    sendTyping(activeTarget.appointmentId, false);
  };

  const handleInputChange = (e) => {
    setInput(e.target.value);
    if (activeTarget) {
      sendTyping(activeTarget.appointmentId, e.target.value.length > 0);
    }
  };

  const onEmojiClick = (emojiData) => {
    setInput((prev) => prev + emojiData.emoji);
  };

  const selectConversation = (chat) => {
    const target = { 
      id: chat.partnerId, 
      name: chat.partnerName, 
      appointmentId: chat.appointmentId,
      status: chat.status
    };
    setActiveTarget(target);
    fetchHistory(chat.appointmentId);
    navigate(`/chat?appointmentId=${chat.appointmentId}&id=${chat.partnerId}&name=${encodeURIComponent(chat.partnerName)}`, { replace: true });
  };

  // Helper to determine if input should be disabled
  const isInputDisabled = user.role === 'student' && activeTarget?.status !== 'Completed';

  return (
    <div className="chat-layout-bg mt-20 flex text-slate-900 overflow-hidden font-sans relative">
      
      {/* Immersive Background Layer handled via .chat-layout-bg CSS */}


      {/* Sidebar - Glass Thread List */}
      <div className="w-1/4 lg:w-1/5 min-w-[320px] bg-white/80 backdrop-blur-3xl border-r border-white/20 hidden md:flex flex-col z-20 shadow-[20px_0_40px_-20px_rgba(0,0,0,0.05)]">
        
        <div className="p-8 border-b border-white/20 flex items-center justify-between">
            <h2 className="text-3xl font-black tracking-tighter text-slate-900 italic">Threads<span className="text-indigo-600">.</span></h2>
            <button className="p-2.5 rounded-2xl bg-white/50 text-slate-400 hover:text-indigo-600 hover:bg-white transition-all shadow-sm">
                <Settings size={20} />
            </button>
        </div>

        <div className="p-6">
          <div className="relative group">
            <Search size={18} className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-300 transition-colors group-focus-within:text-indigo-600" />
            <input 
              type="text" 
              placeholder="Search correspondence..." 
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-white/50 backdrop-blur-md border border-white/50 rounded-2xl pl-14 pr-4 py-4 text-[10px] font-black uppercase tracking-[0.2em] outline-none focus:ring-8 focus:ring-indigo-600/5 focus:bg-white transition-all shadow-inner" 
            />
          </div>
        </div>

        <div className="flex-1 overflow-y-auto px-4 pb-6 space-y-2 no-scrollbar">
          {conversations.length === 0 ? (
            <div className="text-center py-20 px-6">
                <div className="w-20 h-20 bg-white/50 backdrop-blur rounded-3xl flex items-center justify-center mx-auto mb-6 border border-white shadow-sm">
                    <Zap size={28} className="text-slate-200" />
                </div>
                <p className="text-[10px] font-black uppercase tracking-[0.3em] text-slate-300 leading-loose">Access Restricted</p>
                <p className="text-[9px] font-bold text-slate-400 mt-2 px-10">
                  {user.role === 'student' 
                    ? "Correspondence channels unlock once your clinical sessions are Completed." 
                    : "No active or completed sessions found in your current profile."}
                </p>
            </div>
          ) : (
            conversations.map((chat) => (
              <div 
                key={chat.appointmentId} 
                onClick={() => selectConversation(chat)}
                className={`flex items-center gap-5 p-5 cursor-pointer rounded-[2.5rem] transition-all duration-500 group relative overflow-hidden ${
                  activeTarget?.appointmentId === chat.appointmentId 
                    ? "bg-slate-900 text-white shadow-2xl shadow-slate-900/40 translate-x-3" 
                    : "hover:bg-white/60 text-slate-600"
                }`}
              >
                <div className="relative shrink-0">
                    <div className={`w-14 h-14 rounded-[1.5rem] flex items-center justify-center font-black transition-all duration-500 ${activeTarget?.appointmentId === chat.appointmentId ? "bg-white/20 text-white rotate-6" : "bg-white text-slate-300 group-hover:shadow-lg shadow-sm border border-slate-100"}`}>
                    {(chat.partnerName || "U").substring(0, 1).toUpperCase()}
                    </div>
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex justify-between items-baseline mb-1">
                    <h3 className="font-black text-sm tracking-tight truncate">{chat.partnerName}</h3>
                    {activeTarget?.appointmentId === chat.appointmentId && <span className="w-1.5 h-1.5 bg-emerald-400 rounded-full animate-pulse shadow-[0_0_8px_rgba(52,211,153,0.8)]" />}
                  </div>
                  <div className="flex items-center gap-2">
                    <p className={`text-[10px] font-black uppercase tracking-widest truncate opacity-40 ${activeTarget?.appointmentId === chat.appointmentId ? "text-white/60" : "text-slate-400"}`}>
                      {chat.status}
                    </p>
                    {chat.status === 'Completed' && <CheckCircle size={10} className="text-emerald-400" />}
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      {/* Main Chat Window - Glassmorphism View */}
      <div className="flex-1 flex flex-col relative z-10">
        {!activeTarget ? (
          <div className="flex-1 flex flex-col items-center justify-center p-12 text-center">
            <div className="relative mb-12">
                <div className="absolute inset-0 bg-indigo-500/20 rounded-full blur-[80px] animate-pulse" />
                <div className="w-48 h-48 bg-white/20 backdrop-blur-3xl rounded-[4rem] shadow-2xl flex items-center justify-center border border-white/50 relative z-10 rotate-6 group">
                    <MessageCircle size={80} className="text-white drop-shadow-2xl transition-transform group-hover:scale-110" />
                </div>
            </div>
            <h2 className="text-5xl font-black text-slate-900 tracking-tighter mb-6 italic">Secure <span className="text-indigo-600">Portal.</span></h2>
            <div className="max-w-sm space-y-4">
                <p className="text-[11px] font-black uppercase tracking-[0.4em] text-slate-400 leading-loose">
                    Clinical correspondence is now active.
                </p>
                <div className="h-px w-20 bg-slate-200 mx-auto" />
                <p className="text-[10px] font-bold text-slate-300 uppercase tracking-widest italic">
                    Select a verified thread to proceed.
                </p>
            </div>
          </div>
        ) : (
          <>
            {/* Elegant Header */}
            <div className="px-10 py-8 border-b border-white/20 flex items-center justify-between bg-white/80 backdrop-blur-2xl sticky top-0 z-30 shadow-sm">
                <div className="flex items-center gap-7">
                    <button className="md:hidden p-3 rounded-2xl hover:bg-white/50 transition-all text-slate-400" onClick={() => setActiveTarget(null)}>
                        <ArrowLeft size={20} />
                    </button>
                    <div className="relative">
                        <div className="w-16 h-16 rounded-[2rem] bg-slate-900 text-white flex items-center justify-center font-black shadow-2xl shadow-slate-900/20 border-4 border-white transform hover:rotate-3 transition-transform">
                            {activeTarget.name.substring(0, 1).toUpperCase()}
                        </div>
                        <div className="absolute -bottom-1 -right-1 w-5 h-5 bg-emerald-500 border-4 border-white rounded-full shadow-lg animate-pulse"></div>
                    </div>
                    <div className="space-y-1">
                        <h2 className="text-3xl font-black text-slate-900 tracking-tight italic">{activeTarget.name}</h2>
                        <div className="flex items-center gap-3">
                            <div className="px-3 py-1 bg-emerald-50 text-[9px] font-black text-emerald-600 rounded-lg uppercase tracking-widest border border-emerald-100 flex items-center gap-2">
                                <span className={`w-1.5 h-1.5 ${activeTarget.status === 'Completed' ? 'bg-emerald-500' : 'bg-amber-400'} rounded-full`} /> {activeTarget.status}
                            </div>
                            <span className="text-[9px] font-black text-slate-300 uppercase tracking-widest italic ml-2">Correspondence Policy Active</span>
                        </div>
                    </div>
                </div>
                <div className="flex items-center gap-4">
                    <button className="w-14 h-14 rounded-2xl bg-white/50 backdrop-blur-md text-slate-400 hover:text-indigo-600 hover:bg-white transition-all shadow-sm flex items-center justify-center">
                        <MoreVertical size={24} />
                    </button>
                </div>
            </div>

            {/* Cinematic Message Area */}
            <div className="flex-1 px-10 py-12 overflow-y-auto flex flex-col gap-10 no-scrollbar scroll-smooth">
              <div className="flex justify-center mb-12">
                  <div className="px-6 py-3 bg-white/40 backdrop-blur-xl rounded-full border border-white/50 text-[10px] font-black uppercase tracking-[0.4em] text-slate-400 shadow-xl flex items-center gap-3">
                      <Shield size={14} className="text-emerald-400" /> End-to-End Encrypted Vault
                  </div>
              </div>

              {activeMessages
                .filter(msg => 
                  (msg.senderId === user.id && msg.receiverId === activeTarget.id) ||
                  (msg.senderId === activeTarget.id && msg.receiverId === user.id)
                )
                .map((m, idx) => {
                const isMe = m.senderId === user.id;
                return (
                  <div 
                    key={m._id || idx} 
                    className={`flex flex-col gap-3 max-w-[80%] lg:max-w-[55%] animate-fade-in-up ${isMe ? "self-end items-end" : "self-start items-start"}`}
                    style={{ animationDelay: `${idx * 15}ms` }}
                  >
                    <div className={`px-8 py-5 rounded-[2.5rem] text-[15px] font-medium transition-all duration-500 leading-relaxed shadow-lg ${
                      isMe 
                        ? "bg-slate-900 text-white rounded-br-none shadow-slate-900/10 hover:shadow-slate-900/20" 
                        : "bg-white/80 backdrop-blur-xl text-slate-700 border border-white rounded-bl-none hover:shadow-2xl"
                    }`}>
                      {m.message}
                    </div>
                    <div className="flex items-center gap-2 px-3">
                        <span className="text-[9px] font-black uppercase tracking-[0.2em] text-slate-300">
                            {m.timestamp ? new Date(m.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : 'Syncing...'}
                        </span>
                        {isMe && <div className="w-1 h-1 bg-indigo-400 rounded-full shadow-[0_0_4px_rgba(129,140,248,0.8)]" />}
                    </div>
                  </div>
                );
              })}

              {isTyping && (
                <div className="flex flex-col gap-3 self-start items-start animate-fade-in">
                    <div className="px-8 py-5 bg-white/60 backdrop-blur border border-white rounded-[2.5rem] rounded-bl-none shadow-sm flex items-center gap-2">
                        <div className="flex gap-2">
                            <div className="w-2 h-2 bg-indigo-200 rounded-full animate-bounce [animation-delay:0ms]"></div>
                            <div className="w-2 h-2 bg-indigo-400 rounded-full animate-bounce [animation-delay:200ms]"></div>
                            <div className="w-2 h-2 bg-indigo-600 rounded-full animate-bounce [animation-delay:400ms]"></div>
                        </div>
                    </div>
                    <span className="text-[10px] font-black uppercase tracking-[0.2em] text-indigo-400 px-4 italic animate-pulse">{activeTarget.name} drafting...</span>
                </div>
              )}
              <div ref={endRef} />
            </div>

            {/* Smart Input Area - Glass Box */}
            <div className="p-10 bg-white/20 backdrop-blur-2xl border-t border-white/30 lg:px-32 relative">
              
              {showEmojiPicker && (
                <div className="absolute bottom-[100%] right-10 mb-4 shadow-2xl animate-fade-in-up z-[100]">
                    <EmojiPicker 
                        onEmojiClick={onEmojiClick} 
                        searchDisabled={true}
                        width={300}
                        height={400}
                        theme="light"
                        skinTonesDisabled={true}
                    />
                </div>
              )}

              {isInputDisabled && (
                <div className="absolute inset-0 z-[110] bg-white/60 backdrop-blur-md flex flex-col items-center justify-center gap-4 animate-fade-in">
                  <div className="w-16 h-16 bg-white rounded-3xl flex items-center justify-center shadow-xl border border-slate-100">
                    <Bot size={32} className="text-slate-300" />
                  </div>
                  <p className="text-[11px] font-black uppercase tracking-[0.3em] text-indigo-600">Correspondence Restricted</p>
                  <p className="text-[10px] font-bold text-slate-400 max-w-xs text-center px-4 leading-relaxed uppercase tracking-widest italic">
                    The chat channel becomes available for students once the counselling session is marked as **Completed**.
                  </p>
                </div>
              )}

              <form onSubmit={handleSend} className="relative group/input">
                <div className="absolute -top-16 left-4 flex items-center gap-3">
                    <button type="button" className="p-3.5 rounded-2xl bg-white/80 backdrop-blur text-slate-400 hover:bg-slate-900 hover:text-white transition-all shadow-sm border border-white group/btn">
                        <Paperclip size={18} className="group-hover/btn:rotate-12 transition-transform" />
                    </button>
                    <button 
                        type="button" 
                        onClick={() => setShowEmojiPicker(!showEmojiPicker)}
                        className={`p-3.5 rounded-2xl bg-white/80 backdrop-blur transition-all shadow-sm border border-white group/btn ${showEmojiPicker ? "bg-indigo-600 text-white" : "text-slate-400 hover:bg-yellow-400 hover:text-white"}`}
                    >
                        <Smile size={18} className="group-hover/btn:scale-110 transition-transform" />
                    </button>
                    <div className="ml-4 px-4 py-2 bg-indigo-50/50 backdrop-blur border border-indigo-100 rounded-xl text-[9px] font-black tracking-widest text-indigo-600 uppercase flex items-center gap-2">
                        <Sparkles size={10} /> Expressing support
                    </div>
                </div>

                <div className="flex items-center gap-5 bg-white/60 backdrop-blur-3xl border border-white/50 rounded-[3rem] p-4 shadow-[0_10px_30px_-15px_rgba(0,0,0,0.1)] group-focus-within/input:border-slate-900 group-focus-within/input:bg-white group-focus-within/input:shadow-2xl transition-all duration-700">
                    <input 
                    type="text" 
                    value={input}
                    onChange={handleInputChange}
                    disabled={isInputDisabled}
                    placeholder={isInputDisabled ? "Select a completed session..." : `Compose correspondence for ${activeTarget.name}...`}
                    className="flex-1 bg-transparent px-8 py-5 text-[16px] font-semibold outline-none text-slate-800 placeholder:text-slate-300 disabled:cursor-not-allowed"
                    />
                    <button 
                        type="submit" 
                        disabled={!input.trim() || isInputDisabled}
                        className={`w-20 h-20 rounded-full flex items-center justify-center transition-all duration-500 shadow-2xl relative overflow-hidden group/submit ${
                            (!input.trim() || isInputDisabled)
                                ? "bg-slate-100 text-slate-300 cursor-not-allowed grayscale" 
                                : "bg-slate-900 text-white hover:bg-indigo-600 active:scale-90"
                        }`}
                    >
                        {input.trim() && !isInputDisabled && <div className="absolute inset-0 bg-gradient-to-tr from-white/0 via-white/10 to-white/0 -translate-x-full group-hover/submit:translate-x-full transition-transform duration-1000" />}
                        <Send size={28} strokeWidth={2.5} className="relative z-10 transition-transform group-hover/submit:translate-x-1 group-hover/submit:-translate-y-1" />
                    </button>
                </div>
              </form>
            </div>
          </>
        )}
      </div>
    </div>
  );
}

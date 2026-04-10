import { useState, useRef, useEffect } from "react";
import { useAuth } from "../../context/AuthContext";
import { useChat } from "../../context/ChatContext";
import { useLocation, useNavigate } from "react-router-dom";
import { Send, UserCircle, Search, Settings, ArrowLeft, MoreVertical, Paperclip, Smile, Bot, Zap } from "lucide-react";

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
    trainingMode,
    setTrainingMode
  } = useChat();

  const location = useLocation();
  const navigate = useNavigate();
  const queryParams = new URLSearchParams(location.search);
  const studentIdFromUrl = queryParams.get("id");
  const studentNameFromUrl = queryParams.get("name") || "Student User";

  const [input, setInput] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const endRef = useRef(null);

  // Handle URL params for direct chat navigation
  useEffect(() => {
    if (studentIdFromUrl) {
      const target = { id: studentIdFromUrl, name: studentNameFromUrl };
      setActiveTarget(target);
      fetchHistory(studentIdFromUrl);
    }
  }, [studentIdFromUrl, studentNameFromUrl, setActiveTarget]);

  // Scroll to bottom on updates
  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [activeMessages, isTyping]);

  const handleSend = (e) => {
    e.preventDefault();
    if (!input.trim() || !activeTarget) return;

    sendMessage(activeTarget.id, input);
    setInput("");
    sendTyping(activeTarget.id, false);
  };

  const handleInputChange = (e) => {
    setInput(e.target.value);
    if (activeTarget) {
      sendTyping(activeTarget.id, e.target.value.length > 0);
    }
  };

  const selectConversation = (id) => {
    const target = { id, name: `User ${id.substring(0, 5)}` }; // Fallback name
    setActiveTarget(target);
    fetchHistory(id);
  };

  return (
    <div className="bg-slate-50 h-[calc(100vh-80px)] mt-20 flex text-slate-900 overflow-hidden font-sans">

      {/* Sidebar - Chat List */}
      <div className="w-1/4 lg:w-1/5 min-w-[320px] bg-white border-r border-slate-200 hidden md:flex flex-col shadow-xl shadow-slate-200/20 z-20">

        <div className="p-6 border-b border-slate-100 flex items-center justify-between">
          <h2 className="text-2xl font-black tracking-tight text-slate-900 italic">Chats.</h2>
          <div className="flex items-center gap-2">
            <button
              onClick={() => setTrainingMode(!trainingMode)}
              className={`p-2 rounded-xl transition-all ${trainingMode ? "bg-indigo-600 text-white shadow-lg shadow-indigo-600/30" : "bg-slate-100 text-slate-400"}`}
              title={trainingMode ? "Training Mode Active" : "Enable Training Mode"}
            >
              <Bot size={18} />
            </button>
            <button className="p-2 rounded-xl bg-slate-50 text-slate-400 hover:text-slate-900 transition-all">
              <Settings size={18} />
            </button>
          </div>
        </div>

        <div className="p-4">
          <div className="relative group">
            <Search size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 transition-colors group-focus-within:text-indigo-600" />
            <input
              type="text"
              placeholder="Search conversations..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-slate-50 border border-slate-100 rounded-2xl pl-12 pr-4 py-3.5 text-xs font-bold uppercase tracking-widest outline-none focus:ring-4 focus:ring-indigo-600/5 focus:border-indigo-600 transition-all"
            />
          </div>
        </div>

        <div className="flex-1 overflow-y-auto px-2 pb-6 space-y-1 no-scrollbar">
          {conversations.length === 0 ? (
            <div className="text-center py-20 px-6">
              <div className="w-16 h-16 bg-slate-50 rounded-full flex items-center justify-center mx-auto mb-4 border border-indigo-50">
                <Zap size={24} className="text-indigo-100" />
              </div>
              <p className="text-[10px] font-black uppercase tracking-widest text-slate-300">No active conversations</p>
              <p className="text-[10px] font-black uppercase tracking-widest text-indigo-400 mt-2">Start chatting with students from the appointments list.</p>
            </div>
          ) : (
            conversations.map((pId) => (
              <div
                key={pId}
                onClick={() => selectConversation(pId)}
                className={`flex items-center gap-4 p-4 cursor-pointer rounded-[1.5rem] transition-all duration-300 group ${activeTarget?.id === pId
                    ? "bg-indigo-600 text-white shadow-2xl shadow-indigo-600/20 translate-x-2"
                    : "hover:bg-slate-50 text-slate-600"
                  }`}
              >
                <div className="relative shrink-0">
                  <div className={`w-12 h-12 rounded-2xl flex items-center justify-center font-black transition-all ${activeTarget?.id === pId ? "bg-white/20 text-white" : "bg-slate-100 text-slate-400 group-hover:bg-white border border-slate-200"}`}>
                    {pId.substring(0, 2).toUpperCase()}
                  </div>
                  <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-emerald-500 border-2 border-white rounded-full"></div>
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex justify-between items-baseline mb-1">
                    <h3 className="font-black text-sm tracking-tight truncate">User {pId.substring(0, 8)}</h3>
                    {activeTarget?.id === pId && <span className="text-[9px] font-black uppercase px-2 py-0.5 bg-white/20 rounded">Active</span>}
                  </div>
                  <p className={`text-[10px] font-black uppercase tracking-widest truncate opacity-60 ${activeTarget?.id === pId ? "text-white" : "text-slate-400"}`}>
                    Last message content...
                  </p>
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      {/* Main Chat Window */}
      <div className="flex-1 flex flex-col bg-white relative">
        {!activeTarget ? (
          <div className="flex-1 flex flex-col items-center justify-center p-12 text-center bg-slate-50/50">
            <div className="relative mb-10">
              <div className="absolute inset-0 bg-indigo-600/20 rounded-full blur-3xl animate-pulse" />
              <div className="w-40 h-40 bg-white rounded-[3rem] shadow-2xl flex items-center justify-center border border-white relative z-10 rotate-3">
                <MessageCircle size={64} className="text-indigo-600" />
              </div>
            </div>
            <h2 className="text-3xl font-black text-slate-900 tracking-tighter mb-4 italic">Open a conversation to begin.</h2>
            <p className="text-[11px] font-black uppercase tracking-widest text-slate-400 max-w-sm leading-loose">
              Select a student from the sidebar to start a real-time counseling session.
              Training mode is active.
            </p>
          </div>
        ) : (
          <>
            {/* Chat Header */}
            <div className="px-8 py-6 border-b border-slate-100 flex items-center justify-between bg-white/80 backdrop-blur-xl sticky top-0 z-10 shadow-sm">
              <div className="flex items-center gap-5">
                <button className="md:hidden p-3 rounded-xl hover:bg-slate-50 transition-all text-slate-400" onClick={() => setActiveTarget(null)}>
                  <ArrowLeft size={20} />
                </button>
                <div className="relative">
                  <div className="w-14 h-14 rounded-2xl bg-indigo-600 text-white flex items-center justify-center font-black shadow-lg shadow-indigo-600/20 border-2 border-white">
                    {activeTarget.name.substring(0, 2).toUpperCase()}
                  </div>
                  <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-emerald-500 border-2 border-white rounded-full shadow-sm animate-pulse"></div>
                </div>
                <div>
                  <h2 className="text-xl font-black text-slate-900 tracking-tight">{activeTarget.name}</h2>
                  <div className="flex items-center gap-2">
                    <span className="text-[9px] font-black text-emerald-500 uppercase tracking-[0.2em] flex items-center gap-1.5"><div className="w-1.5 h-1.5 bg-emerald-500 rounded-full" /> Online</span>
                    {trainingMode && <span className="text-[9px] font-black text-indigo-400 uppercase tracking-[0.2em] flex items-center gap-1.5 border-l border-slate-200 pl-2">Training Student</span>}
                  </div>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <button className="p-3 rounded-xl bg-slate-50 text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 transition-all">
                  <MoreVertical size={20} />
                </button>
              </div>
            </div>

            {/* Message Area */}
            <div className="flex-1 px-8 py-10 overflow-y-auto bg-slate-50/30 flex flex-col gap-8 no-scrollbar scroll-smooth">
              <div className="flex justify-center mb-10">
                <div className="px-4 py-2 bg-white/80 backdrop-blur rounded-full border border-slate-100 text-[9px] font-black uppercase tracking-[0.3em] text-slate-400 shadow-sm">
                  🔒 Secure Counseling Session
                </div>
              </div>

              {activeMessages.map((m, idx) => {
                const isMe = m.senderId === user.id;
                return (
                  <div
                    key={m.id || idx}
                    className={`flex flex-col gap-2 max-w-[75%] lg:max-w-[60%] animate-fade-in-up ${isMe ? "self-end items-end" : "self-start items-start"}`}
                    style={{ animationDelay: `${idx * 50}ms` }}
                  >
                    <div className={`px-6 py-4 rounded-[2rem] text-sm font-medium shadow-md transition-all duration-300 ${isMe
                        ? "bg-indigo-600 text-white rounded-br-none shadow-indigo-600/10 hover:shadow-indigo-600/20"
                        : "bg-white text-slate-700 border border-slate-100 rounded-bl-none hover:shadow-xl hover:shadow-slate-200/50"
                      }`}>
                      {m.message}
                    </div>
                    <span className="text-[9px] font-black uppercase tracking-widest text-slate-300 px-2">
                      {new Date(m.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </span>
                  </div>
                );
              })}

              {isTyping && (
                <div className="flex flex-col gap-2 self-start items-start animate-fade-in">
                  <div className="px-6 py-4 bg-white border border-slate-100 rounded-[2rem] rounded-bl-none shadow-sm flex items-center gap-2">
                    <div className="flex gap-1.5">
                      <div className="w-1.5 h-1.5 bg-indigo-200 rounded-full animate-bounce [animation-delay:0ms]"></div>
                      <div className="w-1.5 h-1.5 bg-indigo-400 rounded-full animate-bounce [animation-delay:150ms]"></div>
                      <div className="w-1.5 h-1.5 bg-indigo-600 rounded-full animate-bounce [animation-delay:300ms]"></div>
                    </div>
                  </div>
                  <span className="text-[9px] font-black uppercase tracking-widest text-indigo-400 px-2">Student is typing...</span>
                </div>
              )}
              <div ref={endRef} />
            </div>

            {/* Input Area */}
            <div className="p-8 bg-white border-t border-slate-100 lg:px-20">
              <form onSubmit={handleSend} className="relative group/input">
                <div className="absolute -top-12 left-2 flex items-center gap-2">
                  <button className="p-2.5 rounded-xl bg-slate-50 text-slate-400 hover:bg-slate-900 hover:text-white transition-all">
                    <Paperclip size={16} />
                  </button>
                  <button className="p-2.5 rounded-xl bg-slate-50 text-slate-400 hover:bg-slate-900 hover:text-white transition-all">
                    <Smile size={16} />
                  </button>
                </div>

                <div className="flex items-center gap-4 bg-slate-50 border border-slate-100 rounded-[2.5rem] p-3 shadow-inner group-focus-within/input:border-indigo-600 group-focus-within/input:bg-white group-focus-within/input:ring-4 group-focus-within/input:ring-indigo-600/5 transition-all duration-300">
                  <input
                    type="text"
                    value={input}
                    onChange={handleInputChange}
                    placeholder={`Message ${activeTarget.name}...`}
                    className="flex-1 bg-transparent px-6 py-4 text-sm font-semibold outline-none text-slate-700 placeholder:text-slate-300"
                  />
                  <button
                    type="submit"
                    disabled={!input.trim()}
                    className={`p-5 rounded-full flex items-center justify-center transition-all shadow-xl ${!input.trim()
                        ? "bg-slate-200 text-slate-400 cursor-not-allowed"
                        : "bg-indigo-600 text-white hover:bg-slate-900 active:scale-95 shadow-indigo-600/20"
                      }`}
                  >
                    <Send size={22} strokeWidth={2.5} />
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

const MessageCircle = ({ size, className }) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width={size}
    height={size}
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2.5"
    strokeLinecap="round"
    strokeLinejoin="round"
    className={className}
  >
    <path d="M7.9 20A9 9 0 1 0 4 16.1L2 22Z" />
  </svg>
);

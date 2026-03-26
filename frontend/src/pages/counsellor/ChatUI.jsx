import { useState, useRef, useEffect } from "react";
import { useAuth } from "../../context/AuthContext";
import { Send, UserCircle, Search, Settings } from "lucide-react";

export default function ChatUI() {
  const { user } = useAuth();
  const [messages, setMessages] = useState([
    { id: 1, sender: "counsellor", text: "Hello! How have you been feeling since our last session?", time: "10:00 AM" },
    { id: 2, sender: "student", text: "I've been okay, but midterms are causing a lot of stress.", time: "10:05 AM" },
    { id: 3, sender: "counsellor", text: "I understand. Let's talk about some strategies to manage that stress.", time: "10:06 AM" },
  ]);
  const [input, setInput] = useState("");
  const endRef = useRef(null);

  const isCounsellor = user.role === "counsellor";
  const currentUserRole = isCounsellor ? "counsellor" : "student";

  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const handleSend = (e) => {
    e.preventDefault();
    if (!input.trim()) return;

    const newMessage = {
      id: Date.now(),
      sender: currentUserRole,
      text: input,
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };

    setMessages([...messages, newMessage]);
    setInput("");

    // Simulate auto-reply if needed
    setTimeout(() => {
      setMessages(prev => [
        ...prev, 
        { 
          id: Date.now() + 1, 
          sender: currentUserRole === "counsellor" ? "student" : "counsellor", 
          text: "(Automated response) Thanks for your message.", 
          time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) 
        }
      ]);
    }, 2000);
  };

  return (
    <div className="bg-gray-50 h-[calc(100vh-64px)] flex text-gray-900">
      {/* Sidebar */}
      <div className="w-1/3 border-r border-gray-200 bg-white hidden md:flex flex-col">
        <div className="p-4 border-b border-gray-100 flex items-center justify-between">
          <h2 className="font-bold text-lg">Messages</h2>
          <Settings size={20} className="text-gray-500 cursor-pointer hover:text-gray-800" />
        </div>
        <div className="p-4 border-b border-gray-100">
          <div className="relative">
            <Search size={16} className="absolute left-3 top-3 text-gray-400" />
            <input type="text" placeholder="Search chats..." className="w-full bg-gray-50 border border-gray-200 rounded-full pl-10 pr-4 py-2 text-sm outline-none focus:ring-2 focus:ring-blue-600" />
          </div>
        </div>
        <div className="flex-1 overflow-y-auto">
          <div className="p-4 flex items-center gap-3 cursor-pointer bg-blue-50 border-l-4 border-blue-600">
            <UserCircle size={48} className="text-gray-400" />
            <div className="flex-1">
              <div className="flex justify-between items-baseline mb-1">
                <h3 className="font-semibold text-sm">{isCounsellor ? "Student (Active)" : "Dr. Jenkins (Active)"}</h3>
                <span className="text-xs text-blue-600 font-medium">10:06 AM</span>
              </div>
              <p className="text-xs text-gray-600 truncate">Let's talk about some strategies...</p>
            </div>
          </div>
        </div>
      </div>

      {/* Main Chat Area */}
      <div className="flex-1 flex flex-col bg-white">
        <div className="p-4 border-b border-gray-200 flex items-center gap-3 bg-white sticky top-0 z-10">
          <UserCircle size={40} className="text-gray-400" />
          <div>
            <h2 className="font-bold text-gray-900">{isCounsellor ? "Current Student" : "Dr. Sarah Jenkins"}</h2>
            <p className="text-xs text-green-600 font-medium flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-green-500 inline-block"></span> Online</p>
          </div>
        </div>

        <div className="flex-1 p-6 overflow-y-auto bg-gray-50 flex flex-col gap-4">
          <div className="text-center text-xs text-gray-400 my-4 uppercase font-semibold">Today</div>
          {messages.map((m) => {
            const isMe = m.sender === currentUserRole;
            return (
              <div key={m.id} className={`flex flex-col max-w-[70%] ${isMe ? "self-end items-end" : "self-start items-start"}`}>
                <div className={`px-4 py-3 rounded-2xl shadow-sm text-sm ${isMe ? "bg-blue-600 text-white rounded-br-none" : "bg-white border border-gray-200 rounded-bl-none"}`}>
                  {m.text}
                </div>
                <span className="text-xs text-gray-500 mt-1 px-1">{m.time}</span>
              </div>
            );
          })}
          <div ref={endRef} />
        </div>

        <form onSubmit={handleSend} className="p-4 bg-white border-t border-gray-200">
          <div className="flex items-center gap-3">
            <input 
              type="text" 
              value={input}
              onChange={e => setInput(e.target.value)}
              placeholder="Type your message..." 
              className="flex-1 border border-gray-300 rounded-full px-5 py-3 text-sm focus:ring-2 focus:ring-blue-600 focus:border-transparent outline-none bg-gray-50"
            />
            <button type="submit" className="bg-blue-600 hover:bg-blue-700 text-white p-3 rounded-full flex items-center justify-center transition shadow-sm focus:ring-2 focus:ring-offset-2 focus:ring-blue-600">
              <Send size={20} />
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

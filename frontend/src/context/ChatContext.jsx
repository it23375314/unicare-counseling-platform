import { createContext, useContext, useState, useEffect, useCallback } from "react";
import { io } from "socket.io-client";
import { useAuth } from "./AuthContext";

const ChatContext = createContext();

export const useChat = () => useContext(ChatContext);

const SOCKET_URL = "http://localhost:5000";
const API_URL = "http://localhost:5000/api/messages";

export const ChatProvider = ({ children }) => {
  const { user } = useAuth();
  const [socket, setSocket] = useState(null);
  const [conversations, setConversations] = useState([]);
  const [activeMessages, setActiveMessages] = useState([]);
  const [activeTarget, setActiveTarget] = useState(null);
  const [isTyping, setIsTyping] = useState(false);
  const [trainingMode, setTrainingMode] = useState(true); // Default to on as per request

  // Socket Connection
  useEffect(() => {
    if (user?.id) {
      const newSocket = io(SOCKET_URL);
      setSocket(newSocket);
      
      newSocket.emit("join-chat", { userId: user.id });

      newSocket.on("receive-message", (message) => {
        // If message is for the currently open chat, add it
        if (message.senderId === activeTarget?.id || message.receiverId === activeTarget?.id) {
          setActiveMessages((prev) => [...prev, message]);
        }
        // Refresh conversation list
        fetchConversationList();
      });

      newSocket.on("display-typing", (data) => {
        if (data.senderId === activeTarget?.id) {
          setIsTyping(data.isTyping);
        }
      });

      return () => newSocket.close();
    }
  }, [user, activeTarget]);

  const fetchConversationList = useCallback(async () => {
    if (!user?.id) return;
    try {
      const res = await fetch(`${API_URL}/list/${user.id}`);
      const json = await res.json();
      if (json.success) {
        setConversations(json.data);
      }
    } catch (e) {
      console.error("Failed to fetch chat list", e);
    }
  }, [user]);

  const fetchHistory = async (targetId) => {
    if (!user?.id) return;
    try {
      const res = await fetch(`${API_URL}/${targetId}?currentUserId=${user.id}`);
      const json = await res.json();
      if (json.success) {
        setActiveMessages(json.data);
      }
    } catch (e) {
      console.error("Failed to fetch history", e);
    }
  };

  const sendMessage = async (receiverId, text) => {
    if (!user?.id || !text.trim()) return;

    const messageData = {
      senderId: user.id,
      receiverId,
      message: text,
      role: user.role,
      timestamp: new Date()
    };

    try {
      // 1. Save to DB
      const res = await fetch(`${API_URL}/send`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(messageData),
      });
      const json = await res.json();

      if (json.success) {
        // 2. Emit via Socket
        socket.emit("send-message", json.data);
        setActiveMessages((prev) => [...prev, json.data]);
        
        // 3. Training Simulator Logic
        if (trainingMode && user.role === 'counsellor') {
            triggerSimulation(text, receiverId);
        }
      }
    } catch (e) {
      console.error("Send failed", e);
    }
  };

  const triggerSimulation = (counsellorMsg, studentId) => {
      const lower = counsellorMsg.toLowerCase();
      let response = "I understand. Can you tell me more about that?";
      
      if (lower.includes("exam") || lower.includes("test") || lower.includes("study")) {
          response = "I'm feeling really stressed about my upcoming exams. I can't seem to focus on my notes.";
      } else if (lower.includes("stress") || lower.includes("overwhelmed")) {
          response = "I feel completely overwhelmed by everything right now. It's hard to even get out of bed.";
      } else if (lower.includes("anxiety") || lower.includes("anxious")) {
          response = "My heart starts racing every time I think about going to lectures. Is this normal?";
      }

      // Simulate typing delay
      setTimeout(() => {
          if(socket) socket.emit("typing", { receiverId: user.id, isTyping: true });
          
          setTimeout(async () => {
              const simMessage = {
                  senderId: studentId,
                  receiverId: user.id,
                  message: response,
                  role: 'student',
                  timestamp: new Date()
              };

              const res = await fetch(`${API_URL}/send`, {
                  method: "POST",
                  headers: { "Content-Type": "application/json" },
                  body: JSON.stringify(simMessage),
              });
              const json = await res.json();
              if(json.success) {
                  socket.emit("send-message", json.data);
                  setActiveMessages((prev) => [...prev, json.data]);
              }
              if(socket) socket.emit("typing", { receiverId: user.id, isTyping: false });
          }, 2000);
      }, 1000);
  };

  const sendTyping = (receiverId, isTyping) => {
    if (socket) {
      socket.emit("typing", { receiverId, isTyping });
    }
  };

  return (
    <ChatContext.Provider
      value={{
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
      }}
    >
      {children}
    </ChatContext.Provider>
  );
};

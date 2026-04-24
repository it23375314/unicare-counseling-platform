import { createContext, useContext, useState, useEffect, useCallback } from "react";
import { io } from "socket.io-client";
import { useAuth } from "./AuthContext";

const ChatContext = createContext();
ChatContext.displayName = 'ChatContext';

const SOCKET_URL = "http://localhost:5001";
const API_URL = "http://localhost:5001/api/messages";

export const ChatProvider = ({ children }) => {
  const { user } = useAuth();
  const [socket, setSocket] = useState(null);
  const [conversations, setConversations] = useState([]);
  const [activeMessages, setActiveMessages] = useState([]);
  const [activeTarget, setActiveTarget] = useState(null); // { id, name, appointmentId, status }
  const [isTyping, setIsTyping] = useState(false);

  // Initialize Socket.IO connection
  useEffect(() => {
    if (user?.id) {
      console.log("🔌 Initializing Chat Socket for user:", user.id);
      const newSocket = io(SOCKET_URL);
      setSocket(newSocket);
      
      // Handle incoming messages
      newSocket.on("receive-message", (message) => {
        if (message.appointmentId === activeTarget?.appointmentId) {
          setActiveMessages((prev) => [...prev, message]);
        }
        fetchConversationList();
      });

      newSocket.on("display-typing", (data) => {
        if (data.appointmentId === activeTarget?.appointmentId) {
          setIsTyping(data.isTyping);
        }
      });

      return () => newSocket.close();
    }
  }, [user?.id, activeTarget?.appointmentId]);

  // Join a specific room when the target session changes
  useEffect(() => {
    if (socket && activeTarget?.appointmentId) {
      socket.emit("join-room", { appointmentId: activeTarget.appointmentId });
    }
  }, [socket, activeTarget?.appointmentId]);

  const fetchConversationList = useCallback(async () => {
    if (!user?.id) return;
    try {
      console.log("🔄 Fetching conversation list for:", user.id);
      const res = await fetch(`${API_URL}/list/${user.id}`);
      const json = await res.json();
      console.log("📁 Conversations found:", json.data?.length || 0);
      if (json.success) {
        setConversations(json.data);
      }
    } catch (e) {
      console.error("❌ Failed to fetch chat list", e);
    }
  }, [user?.id]);

  useEffect(() => {
    if (user?.id) fetchConversationList();
  }, [user?.id, fetchConversationList]);

  const fetchHistory = useCallback(async (appointmentId) => {
    if (!user?.id || !appointmentId) return;
    try {
      console.log(`📜 [fetchHistory] Triggered for: ${appointmentId}`);
      const res = await fetch(`${API_URL}/${appointmentId}?currentUserId=${user.id}`);
      const json = await res.json();
      console.log(`📥 [fetchHistory] Response: ${json.data?.length || 0} messages`);
      if (json.success) {
        setActiveMessages(json.data);
      }
    } catch (e) {
      console.error("❌ [fetchHistory] Error:", e);
    }
  }, [user?.id]);

  const sendMessage = async (appointmentId, receiverId, text) => {
    if (!user?.id || !text.trim() || !appointmentId) {
      console.warn("⚠️ [sendMessage] Context missing", { userId: user?.id, text, appointmentId });
      return;
    }

    const messageData = {
      appointmentId,
      senderId: user.id,
      receiverId,
      message: text,
      role: user.role,
      timestamp: new Date()
    };

    console.log("📤 [sendMessage] Payload prepared:", messageData);

    try {
      const res = await fetch(`${API_URL}/send`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(messageData),
      });
      const json = await res.json();

      console.log("📥 [sendMessage] API returns the saved message:", json.data);

      if (json.success) {
        // 1. Broadcast to others via Socket.IO
        socket.emit("send-message", json.data);
        
        // 2. IMMEDIATE LOCAL UPDATE: Append the real DB object to state with deduplication
        console.log("✅ [sendMessage] saved message is appended to messages state. ID:", json.data._id);
        setActiveMessages((prev) => {
          // Prevent duplicates if socket somehow echoed back
          if (prev.some(m => m._id === json.data._id)) return prev;
          return [...prev, json.data];
        });
        
        return true;
      } else {
        throw new Error(json.message);
      }
    } catch (e) {
      console.error("❌ [sendMessage] Execution error:", e.message);
      throw e;
    }
  };

  const sendTyping = (appointmentId, isTyping) => {
    if (socket && appointmentId) {
      socket.emit("typing", { appointmentId, isTyping });
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
        fetchConversationList
      }}
    >
      {children}
    </ChatContext.Provider>
  );
};

export const useChat = () => {
    const context = useContext(ChatContext);
    if (!context) {
        throw new Error("useChat must be used within a ChatProvider");
    }
    return context;
};

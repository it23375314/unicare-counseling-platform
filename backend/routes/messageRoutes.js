const express = require('express');
const router = express.Router();
const Message = require('../models/Message');
const Appointment = require('../models/Appointment');
const User = require('../models/User');

// Helper to find user by ID or Email (handles legacy and seeded clinical records)
const findUserSafe = async (idOrEmail) => {
  if (!idOrEmail) return null;
  // If it's an email, find by email
  if (idOrEmail.includes('@')) {
    return await User.findOne({ email: idOrEmail });
  }
  // Otherwise, try by ID, safely catch invalid ObjectIds
  try {
    return await User.findById(idOrEmail);
  } catch (err) {
    // If it's not a valid ObjectId but we didn't catch it as email, try email just in case
    return await User.findOne({ email: idOrEmail });
  }
};

// POST /api/messages/send — Save a new message
router.post('/send', async (req, res) => {
  console.log("📨 Incoming Message Request:", req.body);
  try {
    const { senderId, receiverId, message, role, appointmentId } = req.body;
    
    if (!message || message.trim().length === 0) {
      return res.status(400).json({ success: false, message: "Message cannot be empty" });
    }

    if (!appointmentId) {
      return res.status(400).json({ success: false, message: "Appointment ID is required" });
    }

    const appointment = await Appointment.findById(appointmentId);
    if (!appointment) {
      console.error("❌ Appointment not found:", appointmentId);
      return res.status(404).json({ success: false, message: "Appointment not found" });
    }

    console.log("📌 Session Status:", appointment.status, "| Role:", role);

    // ASYMMETRIC GATING: 
    // Students: Only "Completed" status allowed.
    // Counsellors: "Confirmed", "In Session", or "Completed" allowed.
    if (role === 'student' && appointment.status !== 'Completed') {
      return res.status(403).json({ success: false, message: "Students can only start chatting after the session is marked as Completed." });
    }

    const allowedCounsellorStatuses = ['Confirmed', 'In Session', 'Completed', 'Pending']; 
    // Note: Relaxed further to Pending if counsellor needs to initiate BEFORE confirmation in some cases
    if (role === 'counsellor' && !allowedCounsellorStatuses.includes(appointment.status)) {
      return res.status(403).json({ success: false, message: "Counsellors can only correspond for Active or Completed sessions." });
    }

    const sender = await findUserSafe(senderId);
    const receiver = await findUserSafe(receiverId);

    console.log("🔍 Match Check:", { 
      sender: sender?.name, 
      receiver: receiver?.name, 
      appC: appointment.counsellorId, 
      appS: appointment.studentId 
    });

    // DUAL VERIFICATION: Check if participants match by ID OR by Email
    const studentMatch = 
      (appointment.studentId === senderId || appointment.studentEmail === sender?.email) ||
      (appointment.studentId === receiverId || appointment.studentEmail === receiver?.email);

    const counsellorMatch = 
      (appointment.counsellorId === senderId || appointment.counsellorId === receiverId);

    if (!studentMatch || !counsellorMatch) {
      console.warn("⚠️ Authorization Mismatch for participants");
      return res.status(403).json({ success: false, message: "Authorization failure: You are not a verified participant of this session." });
    }

    const newMessage = new Message({
      appointmentId,
      senderId,
      receiverId,
      senderRole: role,
      message,
      isRead: false
    });

    await newMessage.save();
    console.log(`✅ Message Persistent: ${newMessage._id} | Session: ${appointmentId} | Msg: ${newMessage.message.substring(0, 20)}...`);
    res.status(201).json({ success: true, data: newMessage });
  } catch (error) {
    console.error("❌ Chat Send Error:", error.message);
    res.status(500).json({ success: false, message: error.message });
  }
});

// GET /api/messages/:appointmentId — Get history for a specific session
router.get('/:appointmentId', async (req, res) => {
  try {
    const { appointmentId } = req.params;
    const { currentUserId } = req.query;

    const appointment = await Appointment.findById(appointmentId);
    if (!appointment) return res.status(404).json({ success: false, message: "Appointment not found" });

    const user = await User.findById(currentUserId);
    if (!user) return res.status(404).json({ success: false, message: "User context not found" });

    // NEW: Use case-insensitive name fragment matching for robust owner identification
    const userLower = user.name.toLowerCase();
    const cNameLower = (appointment.counsellorName || "").toLowerCase();
    const sNameLower = (appointment.studentName || "").toLowerCase();
    
    const isOwner = 
      appointment.counsellorId === currentUserId || 
      appointment.studentId === currentUserId || 
      appointment.studentEmail === user.email ||
      cNameLower.includes(userLower) ||
      sNameLower.includes(userLower);

    if (!isOwner) {
      console.warn(`🛑 Unauthorized history access attempt for app ${appointmentId} by ${user.name}. (C:${appointment.counsellorName} S:${appointment.studentName})`);
      return res.status(403).json({ success: false, message: "Unauthorized access to chat history" });
    }

    const messages = await Message.find({ appointmentId }).sort({ timestamp: 1 });
    console.log(`📜 Retrieved ${messages.length} messages for session ${appointmentId}`);
    res.json({ success: true, data: messages });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// GET /api/messages/list/:userId — Get all active chat sessions
router.get('/list/:userId', async (req, res) => {
  try {
    const { userId } = req.params;
    const user = await User.findById(userId);
    if (!user) return res.status(404).json({ success: false, message: "User not found" });

    const statusFilter = (user.role === 'counsellor') 
      ? ['Confirmed', 'In Session', 'Completed', 'Pending'] 
      : ['Completed'];

    const userLower = user.name.toLowerCase();

    const appointments = await Appointment.find({
      $and: [
        { status: { $in: statusFilter } },
        { 
          $or: [
            { studentId: userId }, 
            { counsellorId: userId }, 
            { studentEmail: user.email },
            { counsellorName: { $regex: userLower, $options: 'i' } },
            { studentName: { $regex: userLower, $options: 'i' } }
          ] 
        }
      ]
    }).sort({ updatedAt: -1 });
    
    console.log(`📊 Found ${appointments.length} chat-eligible sessions for ${user.role} ${user.name}`);
    
    const chatList = appointments.map(app => {
      const isStudent = user.role === 'student';
      return {
        appointmentId: app._id,
        partnerId: isStudent ? app.counsellorId : (app.studentId || app.studentEmail),
        partnerName: isStudent ? app.counsellorName : app.studentName,
        lastUpdate: app.updatedAt,
        status: app.status
      };
    });
    
    res.json({ success: true, data: chatList });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

module.exports = router;

module.exports = router;

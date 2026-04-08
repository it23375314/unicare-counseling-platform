const express = require('express');
const router = express.Router();
const Chat = require('../models/Chat');

// POST /api/chat/send — Save a new message
router.post('/send', async (req, res) => {
  try {
    const { senderId, receiverId, message, role } = req.body;
    
    if (!message || message.trim().length === 0) {
      return res.status(400).json({ success: false, message: "Message cannot be empty" });
    }

    const newMessage = new Chat({
      senderId,
      receiverId,
      message,
      role
    });

    await newMessage.save();
    res.status(201).json({ success: true, data: newMessage });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// GET /api/chat/:userId — Get history between current user and :userId
router.get('/:userId', async (req, res) => {
  try {
    const { currentUserId } = req.query; // Usually we'd get this from auth middleware
    const { userId } = req.params;

    const messages = await Chat.find({
      $or: [
        { senderId: currentUserId, receiverId: userId },
        { senderId: userId, receiverId: currentUserId }
      ]
    }).sort({ timestamp: 1 });

    res.json({ success: true, data: messages });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// GET /api/chat/list/:userId — Get list of conversation partners for a user
router.get('/list/:userId', async (req, res) => {
  try {
    const { userId } = req.params;
    
    // Find unique partners the user has chatted with
    const sent = await Chat.distinct('receiverId', { senderId: userId });
    const received = await Chat.distinct('senderId', { receiverId: userId });
    
    // Merge and remove duplicates
    const pIds = [...new Set([...sent, ...received])];
    
    res.json({ success: true, data: pIds });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

module.exports = router;

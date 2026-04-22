const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const mongoose = require('mongoose');
const cors = require('cors');
const path = require('path');
require('dotenv').config();

// ─── Route Imports ─────────────────────────────────────────────────────────────
const authRoutes = require('./routes/authRoutes');
const counsellorRoutes = require('./routes/counsellorRoutes');
const appointmentRoutes = require('./routes/appointmentRoutes');
const sessionNoteRoutes = require('./routes/sessionNoteRoutes');
const bookingRoutes = require('./routes/bookingRoutes');
const goalRoutes = require('./routes/goalRoutes');
const moodRoutes = require('./routes/moodRoutes');
const resourceRoutes = require('./routes/resourceRoutes');
const chatRoutes     = require('./routes/chatRoutes');
const messageRoutes  = require('./routes/messageRoutes');

const app = express();
const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: "*", // Adjust for production security
    methods: ["GET", "POST"]
  }
});

// ─── Middleware ────────────────────────────────────────────────────────────────
app.use(express.json());
app.use(cors({
  origin: process.env.CLIENT_URLS
    ? process.env.CLIENT_URLS.split(',').map(url => url.trim())
    : ['http://localhost:5173', 'http://localhost:5174', 'http://localhost:5175', 'http://localhost:5176'],
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));

app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// ─── Health Check ──────────────────────────────────────────────────────────────
app.get('/api/health', (req, res) => {
  const dbState = ['disconnected', 'connected', 'connecting', 'disconnecting'];
  res.json({
    status: 'ok',
    db: dbState[mongoose.connection.readyState] || 'unknown',
    message: 'UniCare API is running'
  });
});

// ─── API Routes ────────────────────────────────────────────────────────────────
app.use('/api/auth', authRoutes);
app.use('/api/counsellors', counsellorRoutes);
app.use('/api/bookings', bookingRoutes);
app.use('/api/appointments', appointmentRoutes);
app.use('/api/session-notes', sessionNoteRoutes);
app.use('/api/goals', goalRoutes);
app.use('/api/moods', moodRoutes);
app.use('/api/resources', resourceRoutes);
app.use('/api/chat',      chatRoutes);
app.use('/api/messages',  messageRoutes);

// ─── Socket.IO Real-time Logic ────────────────────────────────────────────────
io.on('connection', (socket) => {
  console.log('🔌 New client connected:', socket.id);

  // Users join a room named after the specific appointmentId
  socket.on('join-room', (data) => {
    const { appointmentId } = data;
    if (appointmentId) {
      socket.join(appointmentId);
      console.log(`👤 User ${socket.id} joined room: ${appointmentId}`);
    }
  });

  // Messages are sent to the room, so both student and counsellor see them
  socket.on('send-message', (data) => {
    const { appointmentId } = data;
    if (appointmentId) {
      // Emit to everyone in the room except the sender (optional, can use io.to().emit if we want sender to receive it too)
      socket.to(appointmentId).emit('receive-message', data);
      console.log('✉️ Message routed to room:', appointmentId);
    }
  });

  socket.on('typing', (data) => {
    const { appointmentId, isTyping } = data;
    if (appointmentId) {
      socket.to(appointmentId).emit('display-typing', { ...data, senderSocketId: socket.id });
    }
  });

  socket.on('disconnect', () => {
    console.log('🔌 Client disconnected');
  });
});

// ─── Start Server ──────────────────────────────────────────────────────────────
const PORT = process.env.PORT || 5001;

server.listen(PORT, () => {
  console.log(`🚀 UniCare Backend API running on port ${PORT}`);
  console.log(`   Core:     /api/auth | /api/counsellors | /api/bookings | /api/appointments`);
  console.log(`   Wellness: /api/goals | /api/moods | /api/resources | /api/chat`);
  console.log(`   Realtime: Socket.IO enabled`);
});

// Database Connection with Resilience
const connectDB = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI, {
      serverSelectionTimeoutMS: 30000, // Wait 30s before failing
      connectTimeoutMS: 30000,
      heartbeatFrequencyMS: 10000,
    });
    console.log('✅ MongoDB Connected (UniCare Full Platform)');
  } catch (err) {
    console.error('❌ initial MongoDB Connection Error:', err.message);
    // don't exit process, let it try to reconnect if configured
  }
};

mongoose.connection.on('error', err => {
  console.error('🔴 MongoDB Runtime Error:', err.message);
});

mongoose.connection.on('disconnected', () => {
  console.warn('🟠 MongoDB Disconnected. Attempting to reconnect...');
});

mongoose.connection.on('connected', () => {
  console.log('🟢 MongoDB Connection Established');
});

connectDB();

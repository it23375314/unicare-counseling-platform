const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const mongoose = require('mongoose');
const path = require('path');
require('dotenv').config();

<<<<<<< HEAD
const authRoutes = require('./routes/authRoutes');
const counsellorRoutes = require('./routes/counsellorRoutes');
const appointmentRoutes = require('./routes/appointmentRoutes');
const sessionNoteRoutes = require('./routes/sessionNoteRoutes');
=======
// ─── Route Imports ─────────────────────────────────────────────────────────────
const authRoutes     = require('./routes/authRoutes');
const counsellorRoutes = require('./routes/counsellorRoutes');
const bookingRoutes  = require('./routes/bookingRoutes');
const sessionNoteRoutes = require('./routes/sessionNoteRoutes');
const appointmentRoutes = require('./routes/appointmentRoutes');

const goalRoutes     = require('./routes/goalRoutes');
const moodRoutes     = require('./routes/moodRoutes');
const resourceRoutes = require('./routes/resourceRoutes');
const chatRoutes     = require('./routes/chatRoutes');
>>>>>>> 8fb9068df7e128346a2da11006239f32da7d6dcc

const app = express();

// ─── Middleware ────────────────────────────────────────────────────────────────
app.use(express.json());
app.use(cors({
  origin: process.env.CLIENT_URLS
    ? process.env.CLIENT_URLS.split(',').map(url => url.trim())
    : ['http://localhost:5173', 'http://localhost:5174'],
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));

<<<<<<< HEAD
// Routes
app.use('/api/auth', authRoutes);
app.use('/api/counsellors', counsellorRoutes);
app.use('/api/appointments', appointmentRoutes);
app.use('/api/session-notes', sessionNoteRoutes);

// Database Connection
mongoose.connect(process.env.MONGO_URI)
  .then(() => console.log('Connected to MongoDB (UniCare Full Platform)'))
  .catch(err => console.error('MongoDB connection error:', err));
=======
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// ─── Health Check (works even before DB connects) ──────────────────────────────
app.get('/api/health', (req, res) => {
  const dbState = ['disconnected', 'connected', 'connecting', 'disconnecting'];
  res.json({
    status: 'ok',
    db: dbState[mongoose.connection.readyState] || 'unknown',
    message: 'UniCare API is running'
  });
});

// ─── API Routes ────────────────────────────────────────────────────────────────
app.use('/api/auth',          authRoutes);
app.use('/api/counsellors',   counsellorRoutes);
app.use('/api/bookings',      bookingRoutes);
app.use('/api/session-notes', sessionNoteRoutes);
app.use('/api/appointments',  appointmentRoutes);

app.use('/api/goals',     goalRoutes);
app.use('/api/moods',     moodRoutes);
app.use('/api/resources', resourceRoutes);
app.use('/api/chat',      chatRoutes);

// ─── Start Server FIRST, then connect DB ──────────────────────────────────────
const PORT = process.env.PORT || 5001;
>>>>>>> 8fb9068df7e128346a2da11006239f32da7d6dcc

const PORT = process.env.PORT || 5001;
app.listen(PORT, () => {
<<<<<<< HEAD
  console.log(`Backend API Server running on port ${PORT}`);
=======
  console.log(`🚀 UniCare Backend API running on port ${PORT}`);
  console.log(`   Core:     /api/auth | /api/counsellors | /api/bookings | /api/session-notes`);
  console.log(`   Wellness: /api/goals | /api/moods | /api/resources | /api/chat`);
>>>>>>> 8fb9068df7e128346a2da11006239f32da7d6dcc
});

// Connect MongoDB after server starts
mongoose.connect(process.env.MONGO_URI, {
  serverSelectionTimeoutMS: 15000,
  connectTimeoutMS: 15000,
})
  .then(() => console.log('✅ MongoDB Connected Successfully'))
  .catch(err => console.error('❌ MongoDB Error:', err.message));

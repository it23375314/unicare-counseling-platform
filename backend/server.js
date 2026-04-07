const express = require('express');
const cors = require('cors');
const mongoose = require('mongoose');
require('dotenv').config();

const sessionNoteRoutes = require('./routes/sessionNoteRoutes');
const authRoutes = require('./routes/authRoutes');
const counsellorRoutes = require('./routes/counsellorRoutes');
const bookingRoutes = require('./routes/bookingRoutes');

const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/counsellors', counsellorRoutes);
app.use('/api/bookings', bookingRoutes);
app.use('/api/session-notes', sessionNoteRoutes);

// Server Connection
const PORT = process.env.PORT || 5000;

mongoose.connect(process.env.MONGO_URI)
  .then(() => {
      console.log('🚀 MongoDB Connected Successfully');
      app.listen(PORT, () => {
          console.log(`Backend API Server running on port ${PORT}`);
      });
  })
  .catch((err) => {
      console.error('❌ MongoDB Connection Error:', err.message);
  });

const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
require('dotenv').config();

const sessionNoteRoutes = require('./routes/sessionNoteRoutes');
const counsellorRoutes = require('./routes/counsellorRoutes');
const appointmentRoutes = require('./routes/appointmentRoutes');

const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// Routes
app.use('/api/session-notes', sessionNoteRoutes);
app.use('/api/counsellors', counsellorRoutes);
app.use('/api/appointments', appointmentRoutes);

// Database Connection
const PORT = process.env.PORT || 5000;
const MONGO_URI = process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/unicare_notes';

mongoose.connect(MONGO_URI)
  .then(() => {
    console.log('Connected to MongoDB (Session Notes DB)');
    app.listen(PORT, () => console.log(`Backend API Server running on port ${PORT}`));
  })
  .catch(err => {
    console.error('Failed to connect to MongoDB', err);
  });

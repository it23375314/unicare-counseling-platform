const express = require('express');
const cors = require('cors');
require('dotenv').config();

const sessionNoteRoutes = require('./routes/sessionNoteRoutes');
<<<<<<< HEAD
const authRoutes = require('./routes/authRoutes');
const counsellorRoutes = require('./routes/counsellorRoutes');
const bookingRoutes = require('./routes/bookingRoutes');
=======
const counsellorRoutes = require('./routes/counsellorRoutes');
const appointmentRoutes = require('./routes/appointmentRoutes');
>>>>>>> 4ccf38913c13d612b5f36df71f8c1efaa2b43708

const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/counsellors', counsellorRoutes);
app.use('/api/bookings', bookingRoutes);
app.use('/api/session-notes', sessionNoteRoutes);
app.use('/api/counsellors', counsellorRoutes);
app.use('/api/appointments', appointmentRoutes);

// Server Connection (Mock DB mode)
const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
    console.log(`Backend API Server running on port ${PORT} (Using In-Memory Mock Data)`);
});

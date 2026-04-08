require('dotenv').config(); 
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const path = require('path');

// 1. Import Routes
const authRoutes = require('./routes/auth');

// 2. INITIALIZE APP (This MUST be done before using middleware or routes)
const app = express();

// --- MIDDLEWARE ---
app.use(cors()); 
app.use(express.json()); 

// --- DATABASE CONNECTION ---
const mongoURI = process.env.MONGO_URI;

mongoose.connect(mongoURI)
  .then(() => console.log("✅ Cloud MongoDB Connected Successfully!"))
  .catch((err) => console.error("❌ Cloud Connection Error:", err));

// --- API ROUTES ---
// This makes the URL: http://localhost:5000/api/auth/...
app.use('/api/auth', authRoutes);

// Root Route
app.get('/', (req, res) => {
    res.send("UniCare Backend Server is Running... 🚀");
});

// --- START SERVER ---
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
    console.log(`🚀 Server started on http://localhost:${PORT}`);
    console.log(`📋 API Endpoint: http://localhost:${PORT}/api/auth/logs`);
});
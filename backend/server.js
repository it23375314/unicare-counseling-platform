const express = require('express');
const mongoose = require('mongoose');
const dotenv = require('dotenv');
const cors = require('cors');
const path = require('path'); // ADD THIS
const authRoutes = require('./routes/auth');
const goalRoutes = require('./routes/goals');
const resourceRoutes = require('./routes/resources');
const moodRoutes = require('./routes/moods');

dotenv.config();
const app = express();

app.use(express.json());
app.use(cors()); // Allow all origins for testing

// ✅ SERVE STATIC FILES (Images)
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

app.use('/api/auth', authRoutes);
app.use('/api/goals', goalRoutes);
app.use('/api/resources', resourceRoutes);
app.use('/api/moods', moodRoutes);

const PORT = process.env.PORT || 5000;

const startServer = async () => {
    try {
        mongoose.set('bufferCommands', false);
        await mongoose.connect(process.env.MONGO_URI, {
            serverSelectionTimeoutMS: 10000
        });
        console.log('✅ MongoDB Connected!');
        app.listen(PORT, () => console.log(`🚀 Server running on port ${PORT}`));
    } catch (err) {
        console.error('❌ Connection Error:', err.message);
        process.exit(1);
    }
};

startServer();
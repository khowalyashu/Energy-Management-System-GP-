require('dotenv').config();
const express = require('express');
const path = require('path');
const cors = require('cors');

// Import routes directly (fix path issues)
const authRoutes = require('./routes/auth');
const energyRoutes = require('./routes/energy');
const deviceRoutes = require('./routes/devices');
const reportRoutes = require('./routes/reports');
const userRoutes = require('./routes/users');

const app = express();
const port = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname)));

// API Routes
app.use('/api/auth', authRoutes);
app.use('/api/energy', energyRoutes);
app.use('/api/devices', deviceRoutes);
app.use('/api/reports', reportRoutes);
app.use('/api/users', userRoutes);

// Serve frontend
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'index.html'));
});

// Health check endpoint
app.get('/api/health', (req, res) => {
    res.json({
        status: 'OK',
        message: 'Server is running',
        timestamp: new Date().toISOString()
    });
});

// Error handling middleware
app.use((error, req, res, next) => {
    console.error(error.stack);
    res.status(500).json({ message: 'Something went wrong!' });
});

// Start server
app.listen(port, () => {
    console.log(`MyEMS server running at http://localhost:${port}`);
    // 4. Change this message
    console.log('Connected to MongoDB. Server is ready.');
});
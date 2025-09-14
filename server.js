require('dotenv').config();
const express = require('express');
const path = require('path');
const cors = require('cors');

const app = express();
const port = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname)));

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

// Simple in-memory database simulation (for testing without MongoDB)
let simulatedDB = {
  users: [
    {
      _id: '1',
      username: 'admin',
      email: 'admin@myems.com',
      name: 'Administrator',
      role: 'admin',
      preferences: {
        notifications: true,
        darkMode: false,
        dataRefresh: 5
      }
    }
  ],
  devices: [
    {
      _id: '1',
      name: 'Living Room Lights',
      type: 'lighting',
      powerRating: 100,
      energyConsumption: 5.2,
      status: 'active',
      location: 'Living Room',
      userId: '1'
    },
    {
      _id: '2',
      name: 'Kitchen HVAC',
      type: 'heating',
      powerRating: 1500,
      energyConsumption: 28.3,
      status: 'active',
      location: 'Kitchen',
      userId: '1'
    }
  ],
  energyData: []
};

// Simple auth endpoints (for testing without MongoDB)
app.post('/api/auth/login', (req, res) => {
  const { username, password } = req.body;
  console.log('Login attempt:', username, password);
  
  if (username === 'admin' && password === 'password') {
    res.json({
      _id: '1',
      username: 'admin',
      email: 'admin@myems.com',
      name: 'Administrator',
      role: 'admin',
      preferences: {
        notifications: true,
        darkMode: false,
        dataRefresh: 5
      },
      token: 'mock-jwt-token-for-testing'
    });
  } else {
    res.status(401).json({ message: 'Invalid credentials' });
  }
});

// Simple data endpoints (for testing without MongoDB)
app.get('/api/devices', (req, res) => {
  res.json(simulatedDB.devices);
});

app.get('/api/energy/stats', (req, res) => {
  res.json({
    totalConsumption: 243.4,
    totalCost: 27.34,
    avgConsumption: 10.14,
    avgCost: 1.14
  });
});

// Get energy data
app.get('/api/energy', (req, res) => {
  // Generate sample energy data
  const energyData = [];
  const now = new Date();
  
  for (let i = 0; i < 24; i++) {
    const timestamp = new Date(now);
    timestamp.setHours(now.getHours() - 23 + i);
    
    energyData.push({
      timestamp,
      consumption: 0.5 + Math.random() * 2,
      cost: (0.5 + Math.random() * 2) * 0.12,
      deviceId: i % 2 === 0 ? '1' : '2',
      deviceType: i % 2 === 0 ? 'lighting' : 'heating',
      userId: '1'
    });
  }
  
  res.json(energyData);
});

// Get users
app.get('/api/users', (req, res) => {
  res.json(simulatedDB.users);
});

// Generate report
app.post('/api/reports/generate', (req, res) => {
  const { type } = req.body;
  const now = new Date();
  
  let period;
  switch (type) {
    case 'daily':
      period = now.toDateString();
      break;
    case 'weekly':
      period = `Week of ${new Date(now.setDate(now.getDate() - 7)).toDateString()}`;
      break;
    case 'monthly':
      period = now.toLocaleString('default', { month: 'long', year: 'numeric' });
      break;
    case 'yearly':
      period = now.getFullYear().toString();
      break;
    default:
      period = now.toDateString();
  }
  
  const report = {
    _id: Date.now().toString(),
    type,
    period,
    data: [],
    totalConsumption: 243.4,
    totalCost: 27.34,
    userId: '1',
    generatedAt: new Date()
  };
  
  // Generate sample data
  for (let i = 0; i < 10; i++) {
    report.data.push({
      timestamp: new Date(now.getTime() - i * 3600000),
      consumption: 1 + Math.random() * 3,
      cost: (1 + Math.random() * 3) * 0.12,
      deviceType: ['lighting', 'heating', 'electronics'][i % 3]
    });
  }
  
  res.status(201).json(report);
});

// Get reports
app.get('/api/reports', (req, res) => {
  res.json([]);
});

// Update profile
app.put('/api/auth/profile', (req, res) => {
  res.json({
    _id: '1',
    username: 'admin',
    email: req.body.email || 'admin@myems.com',
    name: req.body.name || 'Administrator',
    role: 'admin',
    preferences: {
      notifications: true,
      darkMode: false,
      dataRefresh: 5
    }
  });
});

// Error handling middleware
app.use((error, req, res, next) => {
  console.error(error.stack);
  res.status(500).json({ message: 'Something went wrong!' });
});

// Start server without MongoDB connection
app.listen(port, () => {
  console.log(`MyEMS server running at http://localhost:${port}`);
  console.log('Using simulated database (MongoDB not required)');
  console.log('Login with: username=admin, password=password');
});
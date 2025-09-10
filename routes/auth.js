const express = require('express');
const router = express.Router();

// Mock login function
const login = async (req, res) => {
  try {
    const { username, password } = req.body;
    
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
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Mock getProfile function
const getProfile = async (req, res) => {
  try {
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
      }
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Mock updateProfile function
const updateProfile = async (req, res) => {
  try {
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
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

router.post('/login', login);
router.get('/profile', getProfile);
router.put('/profile', updateProfile);

module.exports = router;
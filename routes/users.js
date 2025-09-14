const express = require('express');
const router = express.Router();

// Mock users data
const users = [
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
    },
    createdAt: new Date()
  }
];

const getUsers = async (req, res) => {
  try {
    res.json(users);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const getUser = async (req, res) => {
  try {
    const user = users.find(u => u._id === req.params.id);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    res.json(user);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

router.get('/', getUsers);
router.get('/:id', getUser);

module.exports = router;
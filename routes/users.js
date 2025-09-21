// routes/users.js
const express = require('express');
const router = express.Router();

const auth = require('../middleware/auth');
const Users = require('../controllers/userController');

// Protect all routes (dev bypass keeps working)
router.use(auth);

// CRUD
router.get('/', Users.getUsers);
router.get('/:id', Users.getUser);
router.post('/', Users.createUser);
router.put('/:id', Users.updateUser);
router.delete('/:id', Users.deleteUser);

module.exports = router;

// routes/reports.js
const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const C = require('../controllers/reportController');

router.use(auth);

router.get('/', C.list);
router.post('/generate', C.generate);

// optional
router.delete('/:id', C.remove);

module.exports = router;

// routes/reports.js
const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const C = require('../controllers/reportController');

router.use(auth);

router.get('/', C.list);
router.get('/:id', C.getReport);
router.post('/generate', C.generate);
router.get('/:id/export/csv', C.exportCSV);
router.get('/:id/export/excel', C.exportExcel);

// optional
router.delete('/:id', C.remove);

module.exports = router;

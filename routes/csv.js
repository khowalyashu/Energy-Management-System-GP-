// routes/csv.js
const express = require('express');
const router = express.Router();
const multer = require('multer');
const upload = multer({ storage: multer.memoryStorage(), limits: { fileSize: 10 * 1024 * 1024 } });

// auth is optional-safe: use if available, else no-op
const authModule = require('../middleware/auth');
const auth =
  typeof authModule === 'function'
    ? authModule
    : authModule?.verifyToken ||
    authModule?.auth ||
    authModule?.default ||
    ((req, _res, next) => next());

const {
  importDevicesFromCSV,
  importEnergyFromCSV,
  exportDevicesStream,
  exportEnergyStream,
} = require('../controllers/csvController');

// POST /api/csv/devices/import  (multipart/form-data with 'file')
router.post('/devices/import', auth, upload.single('file'), async (req, res, next) => {
  try {
    if (!req.file?.buffer) return res.status(400).json({ error: 'CSV file is required as field "file"' });
    const defaultUserId = req.user?._id || req.user?.id;   // <- add this
    const result = await importDevicesFromCSV(req.file.buffer, defaultUserId); // <- pass it
    res.json({ ok: true, ...result });
  } catch (err) {
    next(err);
  }
});

// GET /api/csv/devices/export
router.get('/devices/export', auth, async (req, res, next) => {
  try {
    await exportDevicesStream(res);
  } catch (err) {
    next(err);
  }
});

// POST /api/csv/energy/import
router.post('/energy/import', auth, upload.single('file'), async (req, res, next) => {
  try {
    if (!req.file?.buffer) return res.status(400).json({ error: 'CSV file is required as field "file"' });
    const result = await importEnergyFromCSV(req.file.buffer);
    res.json({ ok: true, ...result });
  } catch (err) {
    next(err);
  }
});

// GET /api/csv/energy/export
router.get('/energy/export', auth, async (req, res, next) => {
  try {
    await exportEnergyStream(res);
  } catch (err) {
    next(err);
  }
});

// Sample CSVs
router.get('/samples/devices', (_req, res) => {
  res.type('text/csv').send(
    [
      'name,type,powerRating,energyConsumption,status,location,userId',
      'Desk Lamp,lighting,12,0,active,Lab A,',
      'Heater,heating,1500,0,inactive,Room 2,',
    ].join('\n')
  );
});

router.get('/samples/energy', (_req, res) => {
  res.type('text/csv').send(
    [
      'timestamp,deviceId,deviceType,consumption',
      '2025-01-01T00:00:00.000Z,,lighting,0.25',
      '2025-01-01T01:00:00.000Z,,cooling,0.55',
    ].join('\n')
  );
});

module.exports = router;

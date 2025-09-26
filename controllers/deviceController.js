// controllers/DeviceController.js
const mongoose = require('mongoose');
const Device = require('../models/Device');

// Map/normalize incoming payload so it matches the Device schema
function normalizePayload(src = {}) {
  const out = {};

  if (src.name !== undefined) out.name = String(src.name).trim();
  if (src.type !== undefined) out.type = String(src.type).trim();

  // Accept both power and powerRating from the client
  if (src.powerRating !== undefined) {
    out.powerRating = Number(src.powerRating) || 0;
  } else if (src.power !== undefined) {
    out.powerRating = Number(src.power) || 0;
  }

  if (src.energyConsumption !== undefined) {
    out.energyConsumption = Number(src.energyConsumption) || 0;
  }

  // Accept both active (bool) and status (string)
  if (src.status !== undefined) {
    out.status = String(src.status);
  } else if (src.active !== undefined) {
    out.status = src.active ? 'active' : 'inactive';
  }

  if (src.location !== undefined) out.location = String(src.location).trim();

  // Never blindly trust userId from client; only keep it if valid
  if (src.userId && mongoose.isValidObjectId(src.userId)) {
    out.userId = src.userId;
  }

  return out;
}

// GET /api/devices
exports.getDevices = async (req, res) => {
  try {
    const docs = await Device.find().sort({ createdAt: -1 }).lean();
    res.json(docs);
  } catch (err) {
    console.error('[getDevices]', err);
    res.status(500).json({ message: 'Failed to fetch devices' });
  }
};

// GET /api/devices/:id
exports.getDevice = async (req, res) => {
  try {
    const doc = await Device.findById(req.params.id).lean();
    if (!doc) return res.status(404).json({ message: 'Device not found' });
    res.json(doc);
  } catch (err) {
    console.error('[getDevice]', err);
    res.status(500).json({ message: 'Failed to fetch device' });
  }
};

// POST /api/devices
exports.createDevice = async (req, res) => {
  try {
    const payload = normalizePayload(req.body);

    // Attach owner from auth (only if valid ObjectId)
    if (req.user && mongoose.isValidObjectId(req.user._id)) {
      payload.userId = req.user._id;
    }

    // Provide sensible defaults
    if (payload.status === undefined) payload.status = 'inactive';
    if (payload.energyConsumption === undefined) payload.energyConsumption = 0;

    const doc = await Device.create(payload);
    res.status(201).json(doc);
  } catch (err) {
    console.error('[createDevice]', err);
    res.status(500).json({ message: err.message || 'Failed to create device' });
  }
};

// PUT /api/devices/:id
exports.updateDevice = async (req, res) => {
  try {
    const update = normalizePayload(req.body);

    // Do not allow writing an invalid userId
    if (update.userId && !mongoose.isValidObjectId(update.userId)) {
      delete update.userId;
    }

    const doc = await Device.findByIdAndUpdate(req.params.id, update, { new: true });
    if (!doc) return res.status(404).json({ message: 'Device not found' });
    res.json(doc);
  } catch (err) {
    console.error('[updateDevice]', err);
    res.status(500).json({ message: err.message || 'Failed to update device' });
  }
};

// DELETE /api/devices/:id
exports.deleteDevice = async (req, res) => {
  try {
    const doc = await Device.findByIdAndDelete(req.params.id);
    if (!doc) return res.status(404).json({ message: 'Device not found' });
    res.json({ ok: true });
  } catch (err) {
    console.error('[deleteDevice]', err);
    res.status(500).json({ message: 'Failed to delete device' });
  }
};

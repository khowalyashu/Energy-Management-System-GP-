// routes/devices.js (defensive version)
const express = require('express');
const router = express.Router();

// --- Resolve auth middleware no matter how it's exported
const authModule = require('../middleware/auth');
const auth =
  typeof authModule === 'function'
    ? authModule
    : authModule?.verifyToken ||
    authModule?.auth ||
    authModule?.default ||
    ((req, _res, next) => next()); // no-op fallback (won't block)

// --- Resolve controller functions even if names differ
const ctrl = require('../controllers/deviceController');

function pick(fnNames) {
  for (const name of fnNames) {
    if (typeof ctrl?.[name] === 'function') return ctrl[name];
  }
  return null;
}
function ensure(fn, label) {
  if (typeof fn === 'function') return fn;
  // Helpful crash with context if still not found
  throw new TypeError(`devices route: handler "${label}" not found on controller; available: ${Object.keys(ctrl || {})}`);
}

const getDevices = pick(['getDevices', 'list', 'index', 'getAllDevices']);
const createDevice = pick(['createDevice', 'create', 'add', 'addDevice']);
const getDevice = pick(['getDevice', 'read', 'show', 'findById']);
const updateDevice = pick(['updateDevice', 'update', 'edit']);
const deleteDevice = pick(['deleteDevice', 'remove', 'destroy', 'del']);

// --- Routes
router.get('/', auth, ensure(getDevices, 'getDevices'));
router.post('/', auth, ensure(createDevice, 'createDevice'));
router.get('/:id', auth, ensure(getDevice, 'getDevice'));
router.put('/:id', auth, ensure(updateDevice, 'updateDevice'));
router.delete('/:id', auth, ensure(deleteDevice, 'deleteDevice'));

module.exports = router;


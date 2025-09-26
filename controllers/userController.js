// controllers/UserController.js
const User = require('../models/User');

/**
 * Normalize and whitelist incoming user fields
 */
function normalize(payload = {}) {
  const out = {};

  if (payload.username !== undefined) out.username = String(payload.username).trim();
  if (payload.name !== undefined) out.name = String(payload.name).trim();
  if (payload.email !== undefined) out.email = String(payload.email).trim();
  if (payload.role !== undefined) out.role = String(payload.role).trim();

  // Only set password if explicitly provided
  if (payload.password !== undefined) out.password = String(payload.password);

  return out;
}

// GET /api/users
exports.getUsers = async (_req, res) => {
  try {
    const users = await User.find().select('-password').sort({ createdAt: -1 }).lean();
    res.json(users);
  } catch (err) {
    console.error('[getUsers]', err);
    res.status(500).json({ message: 'Failed to fetch users' });
  }
};

// GET /api/users/:id
exports.getUser = async (req, res) => {
  try {
    const doc = await User.findById(req.params.id).select('-password').lean();
    if (!doc) return res.status(404).json({ message: 'User not found' });
    res.json(doc);
  } catch (err) {
    console.error('[getUser]', err);
    res.status(500).json({ message: 'Failed to fetch user' });
  }
};

// POST /api/users
exports.createUser = async (req, res) => {
  try {
    const data = normalize(req.body);

    // Basic defaults
    if (!data.username || !data.name) {
      return res.status(400).json({ message: 'username and name are required' });
    }
    if (!data.role) data.role = 'user';

    // If schema has password required, set a safe default when not provided
    if (!data.password && User.schema.path('password')?.isRequired) {
      data.password = 'changeme';
    }

    // Optional uniqueness checks
    if (data.username) {
      const exists = await User.findOne({ username: data.username }).lean();
      if (exists) return res.status(409).json({ message: 'Username already exists' });
    }
    if (data.email) {
      const exists = await User.findOne({ email: data.email }).lean();
      if (exists) return res.status(409).json({ message: 'Email already exists' });
    }

    const created = await User.create(data);
    const safe = created.toObject();
    delete safe.password;
    res.status(201).json(safe);
  } catch (err) {
    console.error('[createUser]', err);
    res.status(500).json({ message: err.message || 'Failed to create user' });
  }
};

// PUT /api/users/:id
exports.updateUser = async (req, res) => {
  try {
    const patch = normalize(req.body);

    const updated = await User.findByIdAndUpdate(
      req.params.id,
      patch,
      { new: true, runValidators: true, context: 'query' }
    ).select('-password');

    if (!updated) return res.status(404).json({ message: 'User not found' });
    res.json(updated);
  } catch (err) {
    console.error('[updateUser]', err);
    res.status(500).json({ message: err.message || 'Failed to update user' });
  }
};

// DELETE /api/users/:id
exports.deleteUser = async (req, res) => {
  try {
    const removed = await User.findByIdAndDelete(req.params.id);
    if (!removed) return res.status(404).json({ message: 'User not found' });
    res.json({ ok: true });
  } catch (err) {
    console.error('[deleteUser]', err);
    res.status(500).json({ message: 'Failed to delete user' });
  }
};

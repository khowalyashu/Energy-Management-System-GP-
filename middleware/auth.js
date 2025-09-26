// middleware/auth.js
const jwt = require('jsonwebtoken');
const User = require('../models/User');

/**
 * Dev bypass:
 * Enabled when NODE_ENV !== 'production' unless set AUTH_DEV_BYPASS=false.
 * It ensures req.user has a REAL Mongo ObjectId by finding/creating an admin.
 */
const DEV_BYPASS =
  (process.env.NODE_ENV !== 'production') &&
  (process.env.AUTH_DEV_BYPASS !== 'false');

module.exports = async function auth(req, res, next) {
  try {
    if (DEV_BYPASS) {
      // Use a real user from DB so refs like userId are valid ObjectIds
      let admin = await User.findOne({ username: 'admin' }).select('_id username role');
      if (!admin) {
        // Adjust fields to match your User schema requirements
        admin = await User.create({
          username: 'admin',
          name: 'Administrator',
          email: 'admin@myems.com',
          password: 'dev-bypass',
          role: 'admin',
        });
      }
      req.user = { _id: admin._id, username: admin.username, role: admin.role };
      return next();
    }

    // -------- Real JWT path --------
    const header = req.header('Authorization') || '';
    if (!header.startsWith('Bearer ')) {
      return res.status(401).json({ message: 'Access denied. No token provided.' });
    }

    const token = header.slice(7); // after 'Bearer '
    const secret = process.env.JWT_SECRET || 'change-me-in-prod';

    const decoded = jwt.verify(token, secret);
    const userId = decoded.id || decoded._id;
    const user = await User.findById(userId).select('-password');
    if (!user) return res.status(401).json({ message: 'Token is not valid.' });

    req.user = user;
    next();
  } catch (err) {
    console.error('[auth] error:', err);
    res.status(401).json({ message: 'Token is not valid.' });
  }
};

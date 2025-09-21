const mongoose = require('mongoose');

module.exports = async function connectDB() {
  // Accept either env var; default to local "myems"
  const uri =
    process.env.MONGO_URI ||
    process.env.MONGODB_URI ||
    'mongodb://127.0.0.1:27017/myems';

  if (typeof uri !== 'string' || !uri.trim()) {
    throw new Error('Mongo connection URI is empty. Set MONGO_URI or MONGODB_URI.');
  }

  // Optional: tame deprecation warnings
  mongoose.set('strictQuery', true);

  // Connect (throws on failure)
  const conn = await mongoose.connect(uri);
  return conn; // caller can log host/name
};

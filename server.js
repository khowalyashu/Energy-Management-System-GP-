// server.js (MongoDB mode)
require('dotenv').config();

const path = require('path');
const express = require('express');
const cors = require('cors');
const connectDB = require('./config/database');
const studentRoute = require('./routes/student');

const app = express();
const PORT = Number(process.env.PORT) || 3000;

// default local connection if .env not present during dev
process.env.MONGODB_URI =
process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/myems';

// ---- middleware ----
app.use(cors());
app.use(express.json({ limit: '1mb' }));
app.use(express.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname)));

// ---- health ----
app.get('/api/health', (_req, res) => {
  res.json({
    ok: true,
    env: process.env.NODE_ENV || 'development',
    db: !!process.env.MONGODB_URI,
    ts: new Date().toISOString(),
  });
});
// app.use("/api/student", require("./routes/student"));

// ---- api routes ----
app.use('/api/auth', require('./routes/auth'));
app.use('/api/devices', require('./routes/devices'));
app.use('/api/users', require('./routes/users'));
app.use('/api/energy', require('./routes/energy'));   // mount once
app.use('/api/reports', require('./routes/reports'));

app.use('/api/student', studentRoute); // Student details route


// ---- spa entry ----
app.get('/', (_req, res) => {
  res.sendFile(path.join(__dirname, 'index.html'));
});

// ---- error handler ----
app.use((err, _req, res, _next) => {
  console.error('[ERROR]', err);
  res.status(err.status || 500).json({
    message: err.message || 'Something went wrong',
    status: err.status || 500,
  });
});

// ---- start (single start guard) ----
let server;
let started = false;

async function start() {
  if (started) return server;
  started = true;

  try {
    const mongoose = await connectDB();
    const { host, name } = mongoose.connection;
    console.log(`MongoDB Connected: ${host}`);
    console.log(`MongoDB DB Name: ${name}`);

    server = app.listen(PORT,"0.0.0.0", () => {
      console.log(`MyEMS server running at http://localhost:${PORT}`);
      console.log('Mode: MongoDB (live CRUD via /api/*)');
    });

    return server;
  } catch (err) {
    console.error('Failed to connect DB:', err?.message || err);
    process.exit(1);
  }
}

// auto-start only when executed directly
if (require.main === module) {
  start();
}

module.exports = { app, start };

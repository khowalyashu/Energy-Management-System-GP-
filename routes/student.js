// routes/student.js
const express = require('express');
const router = express.Router();

/**
 * GET /api/student
 * Returns JSON with student's full name and student ID.
 * Values can be provided via environment variables for flexibility.
 */
router.get('/', async (_req, res) => {
  // Allow env-configurable identity, fall back to hardcoded if desired
  const name = process.env.STUDENT_NAME || "Your Full Name";
  const id = process.env.STUDENT_ID || "YourStudentID";
  res.json({ name, studentId: id });
});

module.exports = router;

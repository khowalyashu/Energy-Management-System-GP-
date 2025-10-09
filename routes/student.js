const express = require("express");
const router = express.Router();

// TODO: put your real name & Deakin student ID
const STUDENT = {
  name: "Yash",
  studentId: "224695043"
};

router.get("/", (req, res) => {
  res.json(STUDENT);
});

module.exports = router;

// models/Report.js
const mongoose = require('mongoose');

const ReportSchema = new mongoose.Schema({
  type: { type: String, enum: ['daily','weekly','monthly','yearly'], required: true },
  period: { type: String, required: true },
  totalConsumption: { type: Number, default: 0 },
  totalCost: { type: Number, default: 0 },
  dataPoints: { type: Number, default: 0 },
  generatedAt: { type: Date, default: Date.now },

  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: false },
});

module.exports = mongoose.model('Report', ReportSchema);

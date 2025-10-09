// models/Report.js
const mongoose = require('mongoose');

const ReportSchema = new mongoose.Schema({
  type: { type: String, enum: ['daily', 'weekly', 'monthly', 'yearly', 'comparison'], required: true },
  period: { type: String, required: true },
  totalConsumption: { type: Number, default: 0 },
  totalCost: { type: Number, default: 0 },
  dataPoints: { type: Number, default: 0 },
  generatedAt: { type: Date, default: Date.now },
  lastUpdated: { type: Date, default: Date.now },

  // Weekly summary stats
  weeklyStats: {
    total: { type: Number, default: 0 },
    min: { type: Number, default: 0 },
    max: { type: Number, default: 0 },
    avg: { type: Number, default: 0 }
  },

  // Peak usage hours
  peakHours: [{
    hour: { type: Number },
    consumption: { type: Number },
    isPeak: { type: Boolean, default: false }
  }],

  // Device filter
  deviceTypeFilter: { type: String },

  // Comparison data for month-over-month reports
  comparisonData: {
    currentMonth: { type: Number, default: 0 },
    previousMonth: { type: Number, default: 0 },
    percentageChange: { type: Number, default: 0 }
  },

  // Energy cost settings
  costPerKwh: { type: Number, default: 0.12 },

  // Report filename for search
  filename: { type: String },

  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: false },
});

// Update lastUpdated before saving
ReportSchema.pre('save', function (next) {
  this.lastUpdated = new Date();
  if (!this.filename) {
    this.filename = `${this.type}_report_${this.period}_${Date.now()}.pdf`;
  }
  next();
});

module.exports = mongoose.model('Report', ReportSchema);

const mongoose = require('mongoose');

const reportSchema = new mongoose.Schema({
  type: {
    type: String,
    enum: ['daily', 'weekly', 'monthly', 'yearly'],
    required: true
  },
  period: {
    type: String,
    required: true
  },
  data: [{
    timestamp: Date,
    consumption: Number,
    cost: Number,
    deviceType: String
  }],
  totalConsumption: {
    type: Number,
    default: 0
  },
  totalCost: {
    type: Number,
    default: 0
  },
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  }
}, {
  timestamps: true
});

module.exports = mongoose.model('Report', reportSchema);
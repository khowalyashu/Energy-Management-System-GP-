const mongoose = require('mongoose');

const deviceSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true
  },
  type: {
    type: String,
    enum: ['lighting', 'heating', 'cooling', 'appliances', 'electronics'],
    required: true
  },
  powerRating: {
    type: Number,
    required: true,
    min: 0
  },
  energyConsumption: {
    type: Number,
    default: 0,
    min: 0
  },
  status: {
    type: String,
    enum: ['active', 'inactive', 'maintenance'],
    default: 'inactive'
  },
  lastActive: {
    type: Date
  },
  location: {
    type: String,
    required: true,
    trim: true
  },
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  }
}, {
  timestamps: true
});

module.exports = mongoose.model('Device', deviceSchema);
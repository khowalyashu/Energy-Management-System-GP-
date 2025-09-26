const mongoose = require('mongoose');

const EnergyDataSchema = new mongoose.Schema({
  timestamp:   { type: Date, default: Date.now },
  consumption: { type: Number, required: true },
  cost:        { type: Number, required: true },
  deviceId:    { type: mongoose.Schema.Types.ObjectId, ref: 'Device' },
  deviceType:  { type: String },
  userId:      { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true }
}, { timestamps: true });

module.exports = mongoose.model('EnergyData', EnergyDataSchema);
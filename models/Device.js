const mongoose = require('mongoose');

const DeviceSchema = new mongoose.Schema({
  name:  { type: String, required: true },
  type:  { type: String, enum: ['lighting','heating','cooling','appliances','electronics'], required: true },
  powerRating:       { type: Number, default: 0 },
  energyConsumption: { type: Number, default: 0 },
  status:            { type: String, enum: ['active','inactive'], default: 'active' },
  location:          { type: String, default: '' },
  userId:            { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true }
}, { timestamps: true });

module.exports = mongoose.model('Device', DeviceSchema);
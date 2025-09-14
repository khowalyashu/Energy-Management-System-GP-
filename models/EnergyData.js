<<<<<<< Updated upstream
const mongoose = require('mongoose');

const energyDataSchema = new mongoose.Schema({
  timestamp: {
    type: Date,
    required: true,
    default: Date.now
  },
  consumption: {
    type: Number,
    required: true,
    min: 0
  },
  cost: {
    type: Number,
    required: true,
    min: 0
  },
  deviceId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Device'
  },
  deviceType: {
    type: String,
    enum: ['lighting', 'heating', 'cooling', 'appliances', 'electronics'],
    required: true
  },
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  }
}, {
  timestamps: true
});

energyDataSchema.index({ userId: 1, timestamp: 1 });
energyDataSchema.index({ deviceId: 1, timestamp: 1 });

module.exports = mongoose.model('EnergyData', energyDataSchema);
=======
class EnergyData {
    constructor(data) {
        this.id = data._id || data.id || null;
        this.timestamp = data.timestamp ? new Date(data.timestamp) : new Date();
        this.consumption = data.consumption || 0;
        this.cost = data.cost || 0;
        this.deviceId = data.deviceId || null;
        this.deviceType = data.deviceType || '';
        this.userId = data.userId || null;
    }
    
    calculateCost(rate = 0.12) {
        return this.consumption * rate;
    }
}
>>>>>>> Stashed changes

<<<<<<< Updated upstream
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
=======
class Report {
    constructor(data) {
        this.id = data._id || data.id || null;
        this.type = data.type || 'daily';
        this.period = data.period || new Date().toISOString().split('T')[0];
        this.data = data.data || [];
        this.totalConsumption = data.totalConsumption || 0;
        this.totalCost = data.totalCost || 0;
        this.userId = data.userId || null;
        this.generatedAt = data.generatedAt ? new Date(data.generatedAt) : new Date();
    }
    
    calculateTotals() {
        this.totalConsumption = this.data.reduce((sum, item) => sum + (item.consumption || 0), 0);
        this.totalCost = this.data.reduce((sum, item) => sum + (item.cost || 0), 0);
        return { consumption: this.totalConsumption, cost: this.totalCost };
    }
}
>>>>>>> Stashed changes

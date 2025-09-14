const express = require('express');
const router = express.Router();

// Mock energy data
const getEnergyData = async (req, res) => {
  try {
    // Generate sample energy data
    const energyData = [];
    const now = new Date();
    
    for (let i = 0; i < 24; i++) {
      const timestamp = new Date(now);
      timestamp.setHours(now.getHours() - 23 + i);
      
      energyData.push({
        timestamp,
        consumption: 0.5 + Math.random() * 2,
        cost: (0.5 + Math.random() * 2) * 0.12,
        deviceId: i % 2 === 0 ? '1' : '2',
        deviceType: i % 2 === 0 ? 'lighting' : 'heating',
        userId: '1'
      });
    }
    
    res.json(energyData);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Mock energy stats
const getEnergyStats = async (req, res) => {
  try {
    res.json({
      totalConsumption: 243.4,
      totalCost: 27.34,
      avgConsumption: 10.14,
      avgCost: 1.14
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

router.get('/', getEnergyData);
router.get('/stats', getEnergyStats);

module.exports = router;
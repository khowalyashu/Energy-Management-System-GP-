const EnergyData = require('../models/EnergyData');

exports.getEnergyData = async (req, res) => {
  try {
    const { startDate, endDate, deviceId } = req.query;
    const filter = { userId: req.user._id };

    if (startDate && endDate) {
      filter.timestamp = {
        $gte: new Date(startDate),
        $lte: new Date(endDate)
      };
    }

    if (deviceId) {
      filter.deviceId = deviceId;
    }

    const energyData = await EnergyData.find(filter)
      .sort({ timestamp: 1 })
      .populate('deviceId', 'name type');

    res.json(energyData);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.addEnergyData = async (req, res) => {
  try {
    const energyData = await EnergyData.create({
      ...req.body,
      userId: req.user._id
    });

    res.status(201).json(energyData);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.getEnergyStats = async (req, res) => {
  try {
    const { period = 'day' } = req.query;
    const now = new Date();
    let startDate;

    switch (period) {
      case 'day':
        startDate = new Date(now.setDate(now.getDate() - 1));
        break;
      case 'week':
        startDate = new Date(now.setDate(now.getDate() - 7));
        break;
      case 'month':
        startDate = new Date(now.setMonth(now.getMonth() - 1));
        break;
      default:
        startDate = new Date(now.setDate(now.getDate() - 1));
    }

    const stats = await EnergyData.aggregate([
      {
        $match: {
          userId: req.user._id,
          timestamp: { $gte: startDate }
        }
      },
      {
        $group: {
          _id: null,
          totalConsumption: { $sum: '$consumption' },
          totalCost: { $sum: '$cost' },
          avgConsumption: { $avg: '$consumption' },
          avgCost: { $avg: '$cost' }
        }
      }
    ]);

    res.json(stats[0] || { totalConsumption: 0, totalCost: 0, avgConsumption: 0, avgCost: 0 });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
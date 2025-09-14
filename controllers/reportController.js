const Report = require('../models/Report');
const EnergyData = require('../models/EnergyData');

exports.generateReport = async (req, res) => {
  try {
    const { type, startDate, endDate } = req.body;
    const userId = req.user._id;

    const now = new Date();
    let periodStart, periodEnd, periodName;

    switch (type) {
      case 'daily':
        periodStart = new Date(now.setHours(0, 0, 0, 0));
        periodEnd = new Date(now.setHours(23, 59, 59, 999));
        periodName = now.toDateString();
        break;
      case 'weekly':
        const day = now.getDay();
        const diff = now.getDate() - day + (day === 0 ? -6 : 1);
        periodStart = new Date(now.setDate(diff));
        periodStart.setHours(0, 0, 0, 0);
        periodEnd = new Date(periodStart);
        periodEnd.setDate(periodStart.getDate() + 6);
        periodEnd.setHours(23, 59, 59, 999);
        periodName = `Week of ${periodStart.toDateString()}`;
        break;
      case 'monthly':
        periodStart = new Date(now.getFullYear(), now.getMonth(), 1);
        periodEnd = new Date(now.getFullYear(), now.getMonth() + 1, 0);
        periodEnd.setHours(23, 59, 59, 999);
        periodName = now.toLocaleString('default', { month: 'long', year: 'numeric' });
        break;
      case 'yearly':
        periodStart = new Date(now.getFullYear(), 0, 1);
        periodEnd = new Date(now.getFullYear(), 11, 31);
        periodEnd.setHours(23, 59, 59, 999);
        periodName = now.getFullYear().toString();
        break;
      default:
        return res.status(400).json({ message: 'Invalid report type' });
    }

    const energyData = await EnergyData.find({
      userId,
      timestamp: { $gte: periodStart, $lte: periodEnd }
    }).sort({ timestamp: 1 });

    const totalConsumption = energyData.reduce((sum, item) => sum + item.consumption, 0);
    const totalCost = energyData.reduce((sum, item) => sum + item.cost, 0);

    const report = await Report.create({
      type,
      period: periodName,
      data: energyData,
      totalConsumption,
      totalCost,
      userId
    });

    res.status(201).json(report);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.getReports = async (req, res) => {
  try {
    const reports = await Report.find({ userId: req.user._id }).sort({ createdAt: -1 });
    res.json(reports);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.getReport = async (req, res) => {
  try {
    const report = await Report.findOne({
      _id: req.params.id,
      userId: req.user._id
    });

    if (!report) {
      return res.status(404).json({ message: 'Report not found' });
    }

    res.json(report);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
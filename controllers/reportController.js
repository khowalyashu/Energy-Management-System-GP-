const mongoose = require('mongoose');
const Report = require('../models/Report');
const EnergyData = require('../models/EnergyData');

const isValidId = (v) => mongoose.isValidObjectId(v);

function label(type) {
  const now = new Date();
  if (type === 'weekly')  return `Week of ${now.toDateString()}`;
  if (type === 'monthly') return `${now.toLocaleString('default',{month:'long'})} ${now.getFullYear()}`;
  if (type === 'yearly')  return `${now.getFullYear()}`;
  return now.toDateString();
}

exports.list = async (_req, res) => {
  try {
    const list = await Report.find().sort({ createdAt: -1 }).lean();
    res.json(list);
  } catch (e) {
    res.status(500).json({ message: 'Failed to fetch reports' });
  }
};

exports.generate = async (req, res) => {
  try {
    const type = String(req.body?.type || 'daily').toLowerCase();

    const now = new Date();
    let since = new Date(now.getTime() - 24*60*60*1000);
    if (type === 'weekly')  since = new Date(now.getTime() - 7*24*60*60*1000);
    if (type === 'monthly') since = new Date(now.getTime() - 30*24*60*60*1000);
    if (type === 'yearly')  since = new Date(now.getTime() - 365*24*60*60*1000);

    const [agg] = await EnergyData.aggregate([
      { $match: { timestamp: { $gte: since } } },
      { $group: { _id: null,
        totalConsumption: { $sum: '$consumption' },
        totalCost: { $sum: '$cost' },
        dataPoints: { $sum: 1 }
      } }
    ]);

    const doc = await Report.create({
      type,
      period: label(type),
      totalConsumption: Number((agg?.totalConsumption || 0).toFixed(2)),
      totalCost: Number((agg?.totalCost || 0).toFixed(2)),
      dataPoints: agg?.dataPoints || 0,
      generatedAt: new Date(),
      // 👇 only set userId if it's a real ObjectId
      ...(isValidId(req.user?._id) && { userId: req.user._id }),
    });

    res.status(201).json(doc);
  } catch (e) {
    console.error('[Reports:generate]', e);
    res.status(500).json({ message: e.message || 'Failed to generate report' });
  }
};

exports.remove = async (req, res) => {
  try {
    const removed = await Report.findByIdAndDelete(req.params.id);
    if (!removed) return res.status(404).json({ message: 'Report not found' });
    res.json({ ok: true });
  } catch (e) {
    res.status(500).json({ message: 'Failed to delete report' });
  }
};

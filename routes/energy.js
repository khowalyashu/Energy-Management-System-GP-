// routes/energy.js
const express = require('express');
const router = express.Router();
const EnergyData = require('../models/EnergyData'); // reuse the single model

// GET /api/energy 
router.get('/', async (req, res, next) => {
  try {
    const docs = await EnergyData.find({})
      .sort({ timestamp: -1 })
      .limit(24)
      .lean();

    docs.reverse(); // oldest -> newest for the line chart
    res.json({ series: docs.map(d => Number(d.consumption || 0)) });
  } catch (err) {
    next(err);
  }
});

// GET /api/energy/stats  (top summary cards)
router.get('/stats', async (req, res, next) => {
  try {
    const agg = await EnergyData.aggregate([
      {
        $group: {
          _id: null,
          totalConsumption: { $sum: { $ifNull: ['$consumption', 0] } },
          totalCost:        { $sum: { $ifNull: ['$cost', 0] } },
        },
      },
    ]);
    const { totalConsumption = 0, totalCost = 0 } = agg[0] || {};
    res.json({ totalConsumption, totalCost });
  } catch (err) {
    next(err);
  }
});


// GET /api/energy/by-type  (bottom “Energy Consumption by Device Type” tiles)
router.get('/by-type', async (req, res, next) => {
  try {
    const rows = await EnergyData.aggregate([
      {
        $group: {
          _id: { $toLower: { $ifNull: ['$deviceType', 'unknown'] } },
          kwh: { $sum: { $ifNull: ['$consumption', 0] } },
        },
      },
    ]);

    const out = { lighting: 0, heating: 0, cooling: 0, appliances: 0, electronics: 0 };
    rows.forEach(r => {
      if (out.hasOwnProperty(r._id)) out[r._id] = Number(r.kwh || 0);
    });

    res.json(out);
  } catch (err) {
    next(err);
  }
});

module.exports = router;

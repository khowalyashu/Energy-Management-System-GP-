const mongoose = require('mongoose');
const EnergyData = require('../models/EnergyData');
const Device = require('../models/Device');

/**
 * GET /api/energy
 * Returns:
 *   {
 *     series: [24 numbers],   // kWh by hour for the last 24 hours
 *     byType: { lighting, heating, cooling, appliances, electronics } // kWh totals
 *   }
 */
exports.series = async (req, res, next) => {
  try {
    const now = new Date();
    const since = new Date(now.getTime() - 24 * 60 * 60 * 1000);

    // 24-point series (sum consumption per hour in the last 24h)
    const hourly = await EnergyData.aggregate([
      { $match: { timestamp: { $gte: since } } },
      {
        $group: {
          _id: {
            y: { $year: '$timestamp' },
            m: { $month: '$timestamp' },
            d: { $dayOfMonth: '$timestamp' },
            h: { $hour: '$timestamp' }        // UTC hour
          },
          kWh: { $sum: '$consumption' }
        }
      },
      { $sort: { '_id.y': 1, '_id.m': 1, '_id.d': 1, '_id.h': 1 } }
    ]);

    // Make a 24-slot array aligned to "now - 23h ... now"
    const series = Array(24).fill(0);
    const startHour = new Date(now.getTime() - 23 * 60 * 60 * 1000).getUTCHours();
    hourly.forEach(row => {
      const h = row._id.h; // 0..23 UTC
      // map 0..23 absolute hour into index 0..23 in the last 24h window
      // (relative to current UTC hour)
      const idx = (h - startHour + 24) % 24;
      series[idx] = Number(row.kWh || 0);
    });

    // Totals by deviceType for donut/legend
    const byTypeAgg = await EnergyData.aggregate([
      { $match: { timestamp: { $gte: since } } },
      { $group: { _id: '$deviceType', kWh: { $sum: '$consumption' } } }
    ]);

    const byType = {
      lighting: 0, heating: 0, cooling: 0, appliances: 0, electronics: 0
    };
    for (const r of byTypeAgg) {
      const key = String(r._id || '').toLowerCase();
      if (byType[key] !== undefined) byType[key] = Number(r.kWh || 0);
    }

    res.json({ series, byType });
  } catch (err) {
    next(err);
  }
};

/**
 * GET /api/energy/stats
 * Returns:
 *   { totalConsumption, totalCost, devices, savings }
 */
exports.stats = async (req, res, next) => {
  try {
    const totals = await EnergyData.aggregate([
      {
        $group: {
          _id: null,
          totalConsumption: { $sum: '$consumption' },
          totalCost: { $sum: '$cost' }
        }
      }
    ]);
    const tc = totals[0]?.totalConsumption || 0;
    const tcost = totals[0]?.totalCost || 0;

    // Count active devices (or distinct deviceIds seen in energy data)
    const activeDevices = await Device.countDocuments({ status: 'active' }).catch(() => 0);
    const devices =
      activeDevices ||
      (await EnergyData.distinct('deviceId')).length || 0;

    // a small “potential savings” heuristic
    const savings = Math.max(0, (tc * 0.6 - tcost) * 0.2);

    res.json({
      totalConsumption: Number(tc),
      totalCost: Number(tcost),
      devices: Number(devices),
      potentialSavings: Number(savings.toFixed(2))
    });
  } catch (err) {
    next(err);
  }
};

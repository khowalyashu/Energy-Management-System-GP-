// controllers/csvController.js
const { parse } = require('csv-parse/sync');
const Device = require('../models/Device');
const EnergyData = require('../models/EnergyData');

/** CSV escaper for export */
function csvEscape(val) {
  if (val === null || val === undefined) return '';
  const s = String(val);
  if (/[",\n]/.test(s)) return `"${s.replace(/"/g, '""')}"`;
  return s;
}
function sendCsv(res, filename, headers, rows) {
  res.setHeader('Content-Type', 'text/csv');
  res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);
  const lines = [];
  lines.push(headers.join(','));
  for (const r of rows) {
    lines.push(headers.map(h => csvEscape(r[h])).join(','));
  }
  res.send(lines.join('\n'));
}

/**
 * Import Devices from CSV (memory buffer)
 * Headers: name,type,powerRating,energyConsumption,status,location,userId
 * type ∈ [lighting,heating,cooling,appliances,electronics]
 */
async function importDevicesFromCSV(buffer, defaultUserId) {
  const csv = buffer.toString('utf8');
  const rows = parse(csv, {
    columns: true,
    skip_empty_lines: true,
    trim: true
  });
  if (!rows.length) return { inserted: 0, duplicates: 0 };

  const docs = [];
  for (const r of rows) {
    const doc = {
      name: String(r.name || '').trim(),
      type: String(r.type || '').trim().toLowerCase(),
      powerRating: Number(r.powerRating ?? r.power ?? 0),
      energyConsumption: Number(r.energyConsumption ?? r.kwh ?? r.consumption ?? 0),
      status: (r.status || 'active').toString().toLowerCase() === 'inactive' ? 'inactive' : 'active',
      location: String(r.location || '').trim(),
      userId: r.userId || defaultUserId,
    };
    if (!doc.name || !doc.type || !doc.userId) continue;
    docs.push(doc);
  }
  if (!docs.length) return { inserted: 0, duplicates: 0 };

  // upsert by (name + userId if present)
  let inserted = 0, duplicates = 0;
  for (const d of docs) {
    const query = { name: d.name };
    if (d.userId) query.userId = d.userId;
    const existing = await Device.findOne(query).lean();
    if (existing) {
      duplicates++;
      await Device.updateOne({ _id: existing._id }, { $set: d });
    } else {
      await Device.create(d);
      inserted++;
    }
  }
  return { inserted, duplicates };
}

/**
 * Import EnergyData from CSV
 * Headers: timestamp,deviceId,deviceType,consumption
 */
async function importEnergyFromCSV(buffer) {
  const csv = buffer.toString('utf8');
  const rows = parse(csv, {
    columns: true,
    skip_empty_lines: true,
    trim: true
  });

  const docs = [];
  for (const r of rows) {
    // timestamp 
    const ts = r.timestamp;
    let timestamp = ts ? new Date(ts) : new Date();
    if (/^\d+$/.test(String(ts))) {
      const n = Number(ts);
      if (!Number.isNaN(n)) timestamp = new Date(n);
    }

    const doc = {
      timestamp,
      deviceId: r.deviceId || undefined,
      deviceType: (r.deviceType || '').toString().toLowerCase(),
      consumption: Number(r.consumption ?? r.energyConsumption ?? r.kwh ?? 0),
    };
    if (!doc.consumption) continue;

    if (!doc.deviceType && doc.deviceId) {
      try {
        const dev = await Device.findById(doc.deviceId).lean();
        if (dev?.type) doc.deviceType = String(dev.type).toLowerCase();
      } catch {}
    }
    if (!doc.deviceType) doc.deviceType = 'electronics';
    docs.push(doc);
  }

  if (!docs.length) return { inserted: 0 };

  await EnergyData.insertMany(docs, { ordered: false });
  return { inserted: docs.length };
}

/** Export Devices as CSV  */
async function exportDevicesStream(res) {
  const rows = await Device.find({}).lean();
  const headers = [
    '_id','name','type','powerRating','energyConsumption','status','location','userId','createdAt','updatedAt'
  ];
  const data = rows.map(r => ({
    _id: r._id,
    name: r.name,
    type: r.type,
    powerRating: r.powerRating,
    energyConsumption: r.energyConsumption,
    status: r.status,
    location: r.location,
    userId: r.userId,
    createdAt: r.createdAt,
    updatedAt: r.updatedAt,
  }));
  sendCsv(res, 'devices.csv', headers, data);
}

/** Export EnergyData as CSV  */
async function exportEnergyStream(res) {
  const rows = await EnergyData.find({}).sort({ timestamp: 1 }).lean();
  const headers = ['_id','timestamp','deviceId','deviceType','consumption','createdAt','updatedAt'];
  const data = rows.map(r => ({
    _id: r._id,
    timestamp: r.timestamp?.toISOString?.() || r.timestamp,
    deviceId: r.deviceId,
    deviceType: r.deviceType,
    consumption: r.consumption,
    createdAt: r.createdAt,
    updatedAt: r.updatedAt,
  }));
  sendCsv(res, 'energy.csv', headers, data);
}

module.exports = {
  importDevicesFromCSV,
  importEnergyFromCSV,
  exportDevicesStream,
  exportEnergyStream,
};

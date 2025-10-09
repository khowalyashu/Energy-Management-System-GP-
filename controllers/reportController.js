const mongoose = require('mongoose');
const Report = require('../models/Report');
const EnergyData = require('../models/EnergyData');
const Device = require('../models/Device');
const ExcelJS = require('exceljs');

const isValidId = (v) => mongoose.isValidObjectId(v);

function label(type) {
  const now = new Date();
  if (type === 'weekly') return `Week of ${now.toDateString()}`;
  if (type === 'monthly') return `${now.toLocaleString('default', { month: 'long' })} ${now.getFullYear()}`;
  if (type === 'yearly') return `${now.getFullYear()}`;
  if (type === 'comparison') return `${now.toLocaleString('default', { month: 'long' })} Comparison`;
  return now.toDateString();
}

// Helper to calculate peak hours
function calculatePeakHours(energyData) {
  const hourlyConsumption = {};

  energyData.forEach(data => {
    const hour = new Date(data.timestamp).getHours();
    if (!hourlyConsumption[hour]) {
      hourlyConsumption[hour] = 0;
    }
    hourlyConsumption[hour] += data.consumption;
  });

  const peakHours = Object.entries(hourlyConsumption).map(([hour, consumption]) => ({
    hour: parseInt(hour),
    consumption: parseFloat(consumption.toFixed(2))
  }));

  // Mark top 3 hours as peak
  const sorted = [...peakHours].sort((a, b) => b.consumption - a.consumption);
  const topThree = sorted.slice(0, 3).map(h => h.hour);

  peakHours.forEach(h => {
    h.isPeak = topThree.includes(h.hour);
  });

  return peakHours;
}

// Helper to calculate weekly stats
function calculateWeeklyStats(energyData) {
  if (!energyData.length) {
    return { total: 0, min: 0, max: 0, avg: 0 };
  }

  const consumptions = energyData.map(d => d.consumption);
  const total = consumptions.reduce((sum, c) => sum + c, 0);

  return {
    total: parseFloat(total.toFixed(2)),
    min: parseFloat(Math.min(...consumptions).toFixed(2)),
    max: parseFloat(Math.max(...consumptions).toFixed(2)),
    avg: parseFloat((total / consumptions.length).toFixed(2))
  };
}

exports.list = async (req, res) => {
  try {
    const { deviceType, search } = req.query;

    let query = {};

    // Filter by device type
    if (deviceType) {
      query.deviceTypeFilter = deviceType;
    }

    // Search by filename
    if (search) {
      query.filename = { $regex: search, $options: 'i' };
    }

    const list = await Report.find(query).sort({ createdAt: -1 }).lean();
    res.json(list);
  } catch (e) {
    res.status(500).json({ message: 'Failed to fetch reports' });
  }
};

exports.generate = async (req, res) => {
  try {
    const type = String(req.body?.type || 'daily').toLowerCase();
    const deviceTypeFilter = req.body?.deviceType || null;
    const costPerKwh = parseFloat(req.body?.costPerKwh) || 0.12;

    const now = new Date();
    let since = new Date(now.getTime() - 24 * 60 * 60 * 1000);
    if (type === 'weekly') since = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
    if (type === 'monthly') since = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
    if (type === 'yearly') since = new Date(now.getTime() - 365 * 24 * 60 * 60 * 1000);

    // Build query with device type filter
    let matchQuery = { timestamp: { $gte: since } };
    if (deviceTypeFilter) {
      matchQuery.deviceType = deviceTypeFilter;
    }

    // Get detailed energy data for calculations
    const energyData = await EnergyData.find(matchQuery).lean();

    // Check if report data is missing
    if (!energyData || energyData.length === 0) {
      return res.status(400).json({
        message: 'No energy data available for the selected period and filters. Please ensure devices are logging data.'
      });
    }

    const [agg] = await EnergyData.aggregate([
      { $match: matchQuery },
      {
        $group: {
          _id: null,
          totalConsumption: { $sum: '$consumption' },
          totalCost: { $sum: '$cost' },
          dataPoints: { $sum: 1 }
        }
      }
    ]);

    // Calculate peak hours
    const peakHours = calculatePeakHours(energyData);

    // Calculate weekly stats
    const weeklyStats = calculateWeeklyStats(energyData);

    // For comparison reports, get previous month data
    let comparisonData = { currentMonth: 0, previousMonth: 0, percentageChange: 0 };
    if (type === 'comparison') {
      const currentMonthStart = new Date(now.getFullYear(), now.getMonth(), 1);
      const previousMonthStart = new Date(now.getFullYear(), now.getMonth() - 1, 1);
      const previousMonthEnd = new Date(now.getFullYear(), now.getMonth(), 0, 23, 59, 59);

      const [currentAgg] = await EnergyData.aggregate([
        {
          $match: {
            timestamp: { $gte: currentMonthStart },
            ...(deviceTypeFilter && { deviceType: deviceTypeFilter })
          }
        },
        { $group: { _id: null, totalConsumption: { $sum: '$consumption' } } }
      ]);

      const [previousAgg] = await EnergyData.aggregate([
        {
          $match: {
            timestamp: { $gte: previousMonthStart, $lte: previousMonthEnd },
            ...(deviceTypeFilter && { deviceType: deviceTypeFilter })
          }
        },
        { $group: { _id: null, totalConsumption: { $sum: '$consumption' } } }
      ]);

      comparisonData.currentMonth = currentAgg?.totalConsumption || 0;
      comparisonData.previousMonth = previousAgg?.totalConsumption || 0;
      comparisonData.percentageChange = previousAgg?.totalConsumption
        ? ((comparisonData.currentMonth - comparisonData.previousMonth) / comparisonData.previousMonth * 100).toFixed(2)
        : 0;
    }

    const doc = await Report.create({
      type,
      period: label(type),
      totalConsumption: Number((agg?.totalConsumption || 0).toFixed(2)),
      totalCost: Number((agg?.totalCost || 0).toFixed(2)),
      dataPoints: agg?.dataPoints || 0,
      generatedAt: new Date(),
      lastUpdated: new Date(),
      peakHours,
      weeklyStats,
      deviceTypeFilter,
      comparisonData,
      costPerKwh,
      filename: `${type}_report_${label(type).replace(/\s/g, '_')}_${Date.now()}.pdf`,
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

// Export report as CSV with average daily usage
exports.exportCSV = async (req, res) => {
  try {
    const reportId = req.params.id;
    const report = await Report.findById(reportId).lean();

    if (!report) {
      return res.status(404).json({ message: 'Report not found' });
    }

    // Get energy data for this report period
    const now = new Date(report.generatedAt);
    let since = new Date(now.getTime() - 24 * 60 * 60 * 1000);
    if (report.type === 'weekly') since = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
    if (report.type === 'monthly') since = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
    if (report.type === 'yearly') since = new Date(now.getTime() - 365 * 24 * 60 * 60 * 1000);

    let matchQuery = { timestamp: { $gte: since, $lte: now } };
    if (report.deviceTypeFilter) {
      matchQuery.deviceType = report.deviceTypeFilter;
    }

    const energyData = await EnergyData.find(matchQuery)
      .populate('deviceId')
      .sort({ timestamp: 1 })
      .lean();

    // Calculate average daily usage
    const daysDiff = Math.max(1, Math.ceil((now - since) / (1000 * 60 * 60 * 24)));
    const avgDailyUsage = (report.totalConsumption / daysDiff).toFixed(2);

    // Build CSV content
    let csv = 'Timestamp,Device,Device Type,Consumption (kWh),Cost ($),Average Daily Usage (kWh)\n';

    energyData.forEach(data => {
      const deviceName = data.deviceId?.name || 'Unknown Device';
      const deviceType = data.deviceType || 'Unknown';
      csv += `${new Date(data.timestamp).toISOString()},${deviceName},${deviceType},${data.consumption},${data.cost},${avgDailyUsage}\n`;
    });

    // Add summary row
    csv += `\nSummary,,,${report.totalConsumption},${report.totalCost},${avgDailyUsage}\n`;
    csv += `\nWeekly Stats - Total: ${report.weeklyStats?.total || 0}, Min: ${report.weeklyStats?.min || 0}, Max: ${report.weeklyStats?.max || 0}, Avg: ${report.weeklyStats?.avg || 0}\n`;

    res.setHeader('Content-Type', 'text/csv');
    res.setHeader('Content-Disposition', `attachment; filename="${report.filename.replace('.pdf', '.csv')}"`);
    res.send(csv);

  } catch (e) {
    console.error('[Reports:exportCSV]', e);
    res.status(500).json({ message: 'Failed to export CSV' });
  }
};

// Export report as Excel
exports.exportExcel = async (req, res) => {
  try {
    const reportId = req.params.id;
    const report = await Report.findById(reportId).lean();

    if (!report) {
      return res.status(404).json({ message: 'Report not found' });
    }

    // Get energy data for this report period
    const now = new Date(report.generatedAt);
    let since = new Date(now.getTime() - 24 * 60 * 60 * 1000);
    if (report.type === 'weekly') since = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
    if (report.type === 'monthly') since = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
    if (report.type === 'yearly') since = new Date(now.getTime() - 365 * 24 * 60 * 60 * 1000);

    let matchQuery = { timestamp: { $gte: since, $lte: now } };
    if (report.deviceTypeFilter) {
      matchQuery.deviceType = report.deviceTypeFilter;
    }

    const energyData = await EnergyData.find(matchQuery)
      .populate('deviceId')
      .sort({ timestamp: 1 })
      .lean();

    // Calculate average daily usage
    const daysDiff = Math.max(1, Math.ceil((now - since) / (1000 * 60 * 60 * 24)));
    const avgDailyUsage = (report.totalConsumption / daysDiff).toFixed(2);

    // Create Excel workbook
    const workbook = new ExcelJS.Workbook();
    const worksheet = workbook.addWorksheet('Energy Report');

    // Add title and metadata
    worksheet.mergeCells('A1:F1');
    worksheet.getCell('A1').value = `Energy Management Report - ${report.period}`;
    worksheet.getCell('A1').font = { size: 16, bold: true };
    worksheet.getCell('A1').alignment = { horizontal: 'center' };

    worksheet.getCell('A2').value = `Generated: ${new Date(report.generatedAt).toLocaleString()}`;
    worksheet.getCell('A3').value = `Last Updated: ${new Date(report.lastUpdated).toLocaleString()}`;

    // Add headers
    worksheet.getRow(5).values = ['Timestamp', 'Device', 'Device Type', 'Consumption (kWh)', 'Cost ($)', 'Avg Daily Usage (kWh)', 'Cost Estimate'];
    worksheet.getRow(5).font = { bold: true };
    worksheet.getRow(5).fill = {
      type: 'pattern',
      pattern: 'solid',
      fgColor: { argb: 'FF4472C4' }
    };

    // Add data rows with peak hour highlighting
    let rowIndex = 6;
    energyData.forEach(data => {
      const deviceName = data.deviceId?.name || 'Unknown Device';
      const deviceType = data.deviceType || 'Unknown';
      const timestamp = new Date(data.timestamp);
      const hour = timestamp.getHours();
      const costEstimate = (data.consumption * report.costPerKwh).toFixed(2);

      const row = worksheet.getRow(rowIndex);
      row.values = [
        timestamp.toISOString(),
        deviceName,
        deviceType,
        data.consumption,
        data.cost,
        avgDailyUsage,
        costEstimate
      ];

      // Highlight peak hours
      const peakHour = report.peakHours?.find(ph => ph.hour === hour && ph.isPeak);
      if (peakHour) {
        row.fill = {
          type: 'pattern',
          pattern: 'solid',
          fgColor: { argb: 'FFFFEB9C' }
        };
      }

      rowIndex++;
    });

    // Add summary section
    rowIndex += 2;
    worksheet.getCell(`A${rowIndex}`).value = 'Summary Statistics';
    worksheet.getCell(`A${rowIndex}`).font = { bold: true, size: 14 };

    rowIndex++;
    worksheet.getCell(`A${rowIndex}`).value = 'Total Consumption:';
    worksheet.getCell(`B${rowIndex}`).value = `${report.totalConsumption} kWh`;

    rowIndex++;
    worksheet.getCell(`A${rowIndex}`).value = 'Total Cost:';
    worksheet.getCell(`B${rowIndex}`).value = `$${report.totalCost}`;

    rowIndex++;
    worksheet.getCell(`A${rowIndex}`).value = 'Average Daily Usage:';
    worksheet.getCell(`B${rowIndex}`).value = `${avgDailyUsage} kWh`;

    // Add weekly stats
    if (report.weeklyStats) {
      rowIndex += 2;
      worksheet.getCell(`A${rowIndex}`).value = 'Weekly Statistics';
      worksheet.getCell(`A${rowIndex}`).font = { bold: true, size: 14 };

      rowIndex++;
      worksheet.getCell(`A${rowIndex}`).value = 'Total:';
      worksheet.getCell(`B${rowIndex}`).value = `${report.weeklyStats.total} kWh`;

      rowIndex++;
      worksheet.getCell(`A${rowIndex}`).value = 'Min:';
      worksheet.getCell(`B${rowIndex}`).value = `${report.weeklyStats.min} kWh`;

      rowIndex++;
      worksheet.getCell(`A${rowIndex}`).value = 'Max:';
      worksheet.getCell(`B${rowIndex}`).value = `${report.weeklyStats.max} kWh`;

      rowIndex++;
      worksheet.getCell(`A${rowIndex}`).value = 'Average:';
      worksheet.getCell(`B${rowIndex}`).value = `${report.weeklyStats.avg} kWh`;
    }

    // Add comparison data if available
    if (report.type === 'comparison' && report.comparisonData) {
      rowIndex += 2;
      worksheet.getCell(`A${rowIndex}`).value = 'Month-over-Month Comparison';
      worksheet.getCell(`A${rowIndex}`).font = { bold: true, size: 14 };

      rowIndex++;
      worksheet.getCell(`A${rowIndex}`).value = 'Current Month:';
      worksheet.getCell(`B${rowIndex}`).value = `${report.comparisonData.currentMonth} kWh`;

      rowIndex++;
      worksheet.getCell(`A${rowIndex}`).value = 'Previous Month:';
      worksheet.getCell(`B${rowIndex}`).value = `${report.comparisonData.previousMonth} kWh`;

      rowIndex++;
      worksheet.getCell(`A${rowIndex}`).value = 'Change:';
      worksheet.getCell(`B${rowIndex}`).value = `${report.comparisonData.percentageChange}%`;
      worksheet.getCell(`B${rowIndex}`).font = {
        color: { argb: report.comparisonData.percentageChange >= 0 ? 'FFFF0000' : 'FF00B050' }
      };
    }

    // Auto-fit columns
    worksheet.columns.forEach(column => {
      column.width = 20;
    });

    // Generate Excel file
    res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
    res.setHeader('Content-Disposition', `attachment; filename="${report.filename.replace('.pdf', '.xlsx')}"`);

    await workbook.xlsx.write(res);
    res.end();

  } catch (e) {
    console.error('[Reports:exportExcel]', e);
    res.status(500).json({ message: 'Failed to export Excel' });
  }
};

// Get single report details
exports.getReport = async (req, res) => {
  try {
    const report = await Report.findById(req.params.id).lean();

    if (!report) {
      return res.status(404).json({ message: 'Report not found' });
    }

    // Get energy data for this report
    const now = new Date(report.generatedAt);
    let since = new Date(now.getTime() - 24 * 60 * 60 * 1000);
    if (report.type === 'weekly') since = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
    if (report.type === 'monthly') since = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
    if (report.type === 'yearly') since = new Date(now.getTime() - 365 * 24 * 60 * 60 * 1000);

    let matchQuery = { timestamp: { $gte: since, $lte: now } };
    if (report.deviceTypeFilter) {
      matchQuery.deviceType = report.deviceTypeFilter;
    }

    const energyData = await EnergyData.find(matchQuery)
      .populate('deviceId')
      .lean();

    res.json({ ...report, data: energyData });
  } catch (e) {
    console.error('[Reports:getReport]', e);
    res.status(500).json({ message: 'Failed to fetch report' });
  }
};

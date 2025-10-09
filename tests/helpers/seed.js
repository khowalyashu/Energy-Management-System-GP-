// tests/helpers/seed.js
const Device = require('../../models/Device');
const User   = require('../../models/User');

let Report;
try {
  Report = require('../../models/Report');
} catch {
  Report = null;
}

const seedUsers = async () => {
  const admin = await User.create({
    name: 'Administrator',
    role: 'admin',
    username: 'admin',
    email: 'admin@myems.com',
    password: 'password',  // plain so /auth/login succeeds with current controller
  });

  const user1 = await User.create({
    name: 'User-1',
    role: 'user',
    username: 'user-1',
    email: 'user-1@myems.com',
    password: 'password',
  });

  return [admin, user1];
};

const seedDevices = async (ownerId) => {
  const docs = await Device.insertMany([
    { name: 'Living Room Lights', type: 'lighting', powerRating: 100, location: 'Living Room', status: 'active',   userId: ownerId },
    { name: 'Kitchen HVAC',       type: 'heating',  powerRating: 1500, location: 'Kitchen',      status: 'active',   userId: ownerId },
    { name: 'Office PC',          type: 'electronics', powerRating: 300, location: 'Office',   status: 'inactive', userId: ownerId },
  ]);
  return docs;
};

const seedReports = async () => {
  if (!Report) return [];
  const now = new Date();
  const docs = await Report.insertMany([
    {
      title: 'Daily Report',
      type: 'daily',
      period: 'daily',
      createdAt: now,
      totalConsumption: 72.13,
      totalCost: 8.77,
      dataPoints: 107,
    },
    {
      title: 'Monthly Report',
      type: 'monthly',      // <- supported enum in your model
      period: 'monthly',
      createdAt: now,
      totalConsumption: 489.5,
      totalCost: 61.02,
      dataPoints: 700,
    },
  ]);
  return docs;
};

module.exports = { seedUsers, seedDevices, seedReports };

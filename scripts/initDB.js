const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
require('dotenv').config();

mongoose.connect(process.env.MONGODB_URI)
  .then(() => console.log('Connected to MongoDB for initialization'))
  .catch(err => console.error('Connection error:', err));

const User = mongoose.model('User', new mongoose.Schema({
  username: String,
  email: String,
  password: String,
  name: String,
  role: String,
  preferences: Object
}));

const Device = mongoose.model('Device', new mongoose.Schema({
  name: String,
  type: String,
  powerRating: Number,
  energyConsumption: Number,
  status: String,
  location: String,
  userId: mongoose.Schema.Types.ObjectId
}));

const EnergyData = mongoose.model('EnergyData', new mongoose.Schema({
  timestamp: Date,
  consumption: Number,
  cost: Number,
  deviceId: mongoose.Schema.Types.ObjectId,
  deviceType: String,
  userId: mongoose.Schema.Types.ObjectId
}));

async function initializeDatabase() {
  try {
    await User.deleteMany({});
    await Device.deleteMany({});
    await EnergyData.deleteMany({});

    console.log('Cleared existing data');

    const hashedPassword = await bcrypt.hash('password', 12);
    const adminUser = await User.create({
      username: 'admin',
      email: 'admin@myems.com',
      password: hashedPassword,
      name: 'Administrator',
      role: 'admin',
      preferences: {
        notifications: true,
        darkMode: false,
        dataRefresh: 5
      }
    });

    console.log('Admin user created:', adminUser.username);

    const devices = await Device.insertMany([
      {
        name: 'Living Room Lights',
        type: 'lighting',
        powerRating: 100,
        energyConsumption: 5.2,
        status: 'active',
        location: 'Living Room',
        userId: adminUser._id
      },
      {
        name: 'Kitchen HVAC',
        type: 'heating',
        powerRating: 1500,
        energyConsumption: 28.3,
        status: 'active',
        location: 'Kitchen',
        userId: adminUser._id
      },
      {
        name: 'Office Computer',
        type: 'electronics',
        powerRating: 300,
        energyConsumption: 3.7,
        status: 'inactive',
        location: 'Office',
        userId: adminUser._id
      },
      {
        name: 'Refrigerator',
        type: 'appliances',
        powerRating: 150,
        energyConsumption: 12.5,
        status: 'active',
        location: 'Kitchen',
        userId: adminUser._id
      },
      {
        name: 'Air Conditioner',
        type: 'cooling',
        powerRating: 2000,
        energyConsumption: 35.7,
        status: 'active',
        location: 'Living Room',
        userId: adminUser._id
      }
    ]);

    console.log('Sample devices created:', devices.length);

    const now = new Date();
    const energyData = [];
    
    for (let i = 0; i < 24; i++) {
      const timestamp = new Date(now);
      timestamp.setHours(now.getHours() - 23 + i);
      
      energyData.push({
        timestamp,
        consumption: 0.2 + Math.random() * 0.3,
        cost: (0.2 + Math.random() * 0.3) * 0.12,
        deviceId: devices[0]._id,
        deviceType: 'lighting',
        userId: adminUser._id
      });
      
      energyData.push({
        timestamp,
        consumption: 1.0 + Math.random() * 0.5,
        cost: (1.0 + Math.random() * 0.5) * 0.12,
        deviceId: devices[1]._id,
        deviceType: 'heating',
        userId: adminUser._id
      });
      
      if (i >= 8 && i <= 18) {
        energyData.push({
          timestamp,
          consumption: 0.15 + Math.random() * 0.1,
          cost: (0.15 + Math.random() * 0.1) * 0.12,
          deviceId: devices[2]._id,
          deviceType: 'electronics',
          userId: adminUser._id
        });
      }
      
      energyData.push({
        timestamp,
        consumption: 0.5 + Math.random() * 0.1,
        cost: (0.5 + Math.random() * 0.1) * 0.12,
        deviceId: devices[3]._id,
        deviceType: 'appliances',
        userId: adminUser._id
      });
      
      const coolingConsumption = i >= 10 && i <= 20 ? 
        1.2 + Math.random() * 0.3 : 
        0.3 + Math.random() * 0.2;
      
      energyData.push({
        timestamp,
        consumption: coolingConsumption,
        cost: coolingConsumption * 0.12,
        deviceId: devices[4]._id,
        deviceType: 'cooling',
        userId: adminUser._id
      });
    }
    
    await EnergyData.insertMany(energyData);
    console.log('Sample energy data created:', energyData.length);

    console.log('Database initialization completed successfully!');
    process.exit(0);
  } catch (error) {
    console.error('Initialization error:', error);
    process.exit(1);
  }
}

initializeDatabase();
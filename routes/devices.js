const express = require('express');
const router = express.Router();

// Mock devices data
const devices = [
  {
    _id: '1',
    name: 'Living Room Lights',
    type: 'lighting',
    powerRating: 100,
    energyConsumption: 5.2,
    status: 'active',
    location: 'Living Room',
    userId: '1'
  },
  {
    _id: '2',
    name: 'Kitchen HVAC',
    type: 'heating',
    powerRating: 1500,
    energyConsumption: 28.3,
    status: 'active',
    location: 'Kitchen',
    userId: '1'
  },
  {
    _id: '3',
    name: 'Office Computer',
    type: 'electronics',
    powerRating: 300,
    energyConsumption: 3.7,
    status: 'inactive',
    location: 'Office',
    userId: '1'
  }
];

const getDevices = async (req, res) => {
  try {
    res.json(devices);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const getDevice = async (req, res) => {
  try {
    const device = devices.find(d => d._id === req.params.id);
    if (!device) {
      return res.status(404).json({ message: 'Device not found' });
    }
    res.json(device);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

router.get('/', getDevices);
router.get('/:id', getDevice);

module.exports = router;
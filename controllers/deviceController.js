const Device = require('../models/Device');

exports.getDevices = async (req, res) => {
  try {
    const devices = await Device.find({ userId: req.user._id });
    res.json(devices);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.getDevice = async (req, res) => {
  try {
    const device = await Device.findOne({
      _id: req.params.id,
      userId: req.user._id
    });

    if (!device) {
      return res.status(404).json({ message: 'Device not found' });
    }

    res.json(device);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.addDevice = async (req, res) => {
  try {
    const device = await Device.create({
      ...req.body,
      userId: req.user._id
    });

    res.status(201).json(device);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.updateDevice = async (req, res) => {
  try {
    const device = await Device.findOneAndUpdate(
      { _id: req.params.id, userId: req.user._id },
      req.body,
      { new: true, runValidators: true }
    );

    if (!device) {
      return res.status(404).json({ message: 'Device not found' });
    }

    res.json(device);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.deleteDevice = async (req, res) => {
  try {
    const device = await Device.findOneAndDelete({
      _id: req.params.id,
      userId: req.user._id
    });

    if (!device) {
      return res.status(404).json({ message: 'Device not found' });
    }

    res.json({ message: 'Device removed' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
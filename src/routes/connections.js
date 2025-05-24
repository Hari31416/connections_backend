const express = require('express');
const Connection = require('../models/Connection');
const auth = require('../middleware/auth');

const router = express.Router();

// Get all connections for authenticated user
router.get('/', auth, async (req, res) => {
  try {
    const connections = await Connection.find({ userId: req.user.userId });
    res.json(connections);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get connection by ID
router.get('/:id', auth, async (req, res) => {
  try {
    const connection = await Connection.findOne({
      _id: req.params.id,
      userId: req.user.userId
    });
    
    if (!connection) {
      return res.status(404).json({ error: 'Connection not found' });
    }
    
    res.json(connection);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Create a new connection
router.post('/', auth, async (req, res) => {
  try {
    const { name, email, phone, companies, notes } = req.body;
    const connection = await Connection.create({
      userId: req.user.userId,
      name,
      email,
      phone,
      companies,
      notes
    });
    res.json(connection);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

// Update connection by ID
router.put('/:id', auth, async (req, res) => {
  try {
    const { name, email, phone, companies, notes } = req.body;
    const connection = await Connection.findOneAndUpdate(
      { _id: req.params.id, userId: req.user.userId },
      { name, email, phone, companies, notes },
      { new: true }
    );
    
    if (!connection) {
      return res.status(404).json({ error: 'Connection not found' });
    }
    
    res.json(connection);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

// Delete connection by ID
router.delete('/:id', auth, async (req, res) => {
  try {
    const connection = await Connection.findOneAndDelete({
      _id: req.params.id,
      userId: req.user.userId
    });
    
    if (!connection) {
      return res.status(404).json({ error: 'Connection not found' });
    }
    
    res.json({ success: true });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

module.exports = router;
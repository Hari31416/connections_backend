const express = require('express');
const Company = require('../models/Company');
const auth = require('../middleware/auth');

const router = express.Router();

// Get all companies for authenticated user
router.get('/', auth, async (req, res) => {
  try {
    const companies = await Company.find({ userId: req.user.userId });
    res.json(companies);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Create a new company
router.post('/', auth, async (req, res) => {
  try {
    const { name, industry, website } = req.body;
    const company = await Company.create({ 
      userId: req.user.userId, 
      name, 
      industry, 
      website 
    });
    res.json(company);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

// Update company by ID
router.put('/:id', auth, async (req, res) => {
  try {
    const { name, industry, website } = req.body;
    const company = await Company.findOneAndUpdate(
      { _id: req.params.id, userId: req.user.userId },
      { name, industry, website },
      { new: true }
    );
    
    if (!company) {
      return res.status(404).json({ error: 'Company not found' });
    }
    
    res.json(company);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

// Delete company by ID
router.delete('/:id', auth, async (req, res) => {
  try {
    const company = await Company.findOneAndDelete({ 
      _id: req.params.id, 
      userId: req.user.userId 
    });
    
    if (!company) {
      return res.status(404).json({ error: 'Company not found' });
    }
    
    res.json({ success: true });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

module.exports = router;
const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const User = require('../models/User');

const router = express.Router();

// Register new user
router.post('/register', async (req, res) => {
  const { email, password } = req.body;
  const hashed = await bcrypt.hash(password, 10);
  
  try {
    const user = await User.create({ email, password: hashed });
    res.json({ success: true });
  } catch (e) {
    res.status(400).json({ error: 'User exists' });
  }
});

// Login user
router.post('/login', async (req, res) => {
  const { email, password } = req.body;
  const user = await User.findOne({ email });
  
  if (!user) return res.status(400).json({ error: 'Invalid credentials' });
  
  const valid = await bcrypt.compare(password, user.password);
  if (!valid) return res.status(400).json({ error: 'Invalid credentials' });
  
  const token = jwt.sign(
    { userId: user._id, email: user.email }, 
    process.env.JWT_SECRET || 'secret'
  );
  
  res.json({ token });
});

module.exports = router;
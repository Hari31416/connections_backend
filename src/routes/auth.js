const express = require("express");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const User = require("../models/User");

const router = express.Router();

// Register new user
router.post("/register", async (req, res) => {
  const { email, password } = req.body;
  console.log(`[AUTH] Registration attempt for email: ${email}`);

  try {
    const hashed = await bcrypt.hash(password, 10);
    const user = await User.create({ email, password: hashed });

    // Generate JWT token for immediate login after registration
    const token = jwt.sign(
      { userId: user._id, email: user.email },
      process.env.JWT_SECRET || "secret"
    );

    console.log(
      `[AUTH] User registered successfully: ${email} (ID: ${user._id})`
    );
    res.json({ token });
  } catch (e) {
    console.error(
      `[AUTH] [ERROR] Registration failed for ${email}: ${e.message}`
    );
    res.status(400).json({ error: "User exists" });
  }
});

// Login user
router.post("/login", async (req, res) => {
  const { email, password } = req.body;
  console.log(`[AUTH] Login attempt for email: ${email}`);

  try {
    const user = await User.findOne({ email });

    if (!user) {
      console.log(`[AUTH] Login failed - user not found: ${email}`);
      return res.status(400).json({ error: "Invalid credentials" });
    }

    const valid = await bcrypt.compare(password, user.password);
    if (!valid) {
      console.log(`[AUTH] Login failed - invalid password: ${email}`);
      return res.status(400).json({ error: "Invalid credentials" });
    }

    const token = jwt.sign(
      { userId: user._id, email: user.email },
      process.env.JWT_SECRET || "secret"
    );

    console.log(`[AUTH] Login successful: ${email} (ID: ${user._id})`);
    res.json({ token });
  } catch (error) {
    console.error(`[AUTH] [ERROR] Login error for ${email}: ${error.message}`);
    res.status(500).json({ error: "Server error" });
  }
});

module.exports = router;

const express = require("express");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const User = require("../models/User");
const auth = require("../middleware/auth");

const router = express.Router();

// Check if any users exist (for cold start)
router.get("/users/exists", async (req, res) => {
  try {
    const userCount = await User.countDocuments();
    console.log(`[AUTH] User count check: ${userCount} users found`);
    res.json({ hasUsers: userCount > 0 });
  } catch (error) {
    console.error(
      `[AUTH] [ERROR] Failed to check user count: ${error.message}`
    );
    res.status(500).json({ error: "Server error" });
  }
});

// Create first admin user (only when no users exist)
router.post("/initialize", async (req, res) => {
  const { email, password } = req.body;
  console.log(`[AUTH] First user initialization attempt for email: ${email}`);

  try {
    // Check if any users already exist
    const userCount = await User.countDocuments();
    if (userCount > 0) {
      console.log(
        `[AUTH] Initialization denied - users already exist (${userCount})`
      );
      return res.status(403).json({
        error: "System already initialized. Users exist in the database.",
      });
    }

    // Check if email is provided
    if (!email || !password) {
      return res.status(400).json({
        error: "Email and password are required.",
      });
    }

    const hashed = await bcrypt.hash(password, 10);
    const user = await User.create({
      email,
      password: hashed,
      isAdmin: true, // First user is always admin
    });

    // Generate JWT token for immediate login
    const token = jwt.sign(
      { userId: user._id, email: user.email, isAdmin: user.isAdmin },
      process.env.JWT_SECRET || "secret"
    );

    console.log(
      `[AUTH] First admin user created successfully: ${email} (ID: ${user._id})`
    );
    res.json({
      token,
      user: {
        id: user._id,
        email: user.email,
        isAdmin: user.isAdmin,
      },
    });
  } catch (e) {
    console.error(
      `[AUTH] [ERROR] First user initialization failed for ${email}: ${e.message}`
    );
    res.status(500).json({
      error: "Server error occurred during initialization",
    });
  }
});

// Register new user (admin only)
router.post("/register", auth, async (req, res) => {
  const { email, password } = req.body;
  console.log(
    `[AUTH] Admin registration attempt for email: ${email} by user ID: ${req.user.userId}`
  );

  try {
    // Check if the requesting user is an admin
    const adminUser = await User.findById(req.user.userId);
    if (!adminUser || !adminUser.isAdmin) {
      console.log(
        `[AUTH] Registration denied - user ${req.user.userId} is not an admin`
      );
      return res.status(403).json({
        error: "Access denied. Only administrators can create new users.",
      });
    }

    // Check if user already exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      console.log(
        `[AUTH] Registration failed - email already exists: ${email}`
      );
      return res.status(400).json({
        error: "Email already registered. Please use a different email.",
      });
    }

    const hashed = await bcrypt.hash(password, 10);
    const user = await User.create({ email, password: hashed });

    console.log(
      `[AUTH] User registered successfully by admin: ${email} (ID: ${user._id})`
    );
    res.json({
      message: "User created successfully",
      user: {
        id: user._id,
        email: user.email,
        isAdmin: user.isAdmin,
      },
    });
  } catch (e) {
    console.error(
      `[AUTH] [ERROR] Registration failed for ${email}: ${e.message}`
    );
    res.status(500).json({
      error: "Server error occurred during registration",
    });
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

    // Generate JWT token including admin status
    const token = jwt.sign(
      { userId: user._id, email: user.email, isAdmin: user.isAdmin },
      process.env.JWT_SECRET || "secret"
    );

    console.log(
      `[AUTH] Login successful: ${email} (ID: ${user._id}, Admin: ${user.isAdmin})`
    );
    res.json({
      token,
      user: {
        id: user._id,
        email: user.email,
        isAdmin: user.isAdmin,
      },
    });
  } catch (error) {
    console.error(`[AUTH] [ERROR] Login error for ${email}: ${error.message}`);
    res.status(500).json({ error: "Server error" });
  }
});

module.exports = router;

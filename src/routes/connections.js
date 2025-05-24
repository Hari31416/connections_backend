const express = require("express");
const Connection = require("../models/Connection");
const Position = require("../models/Position");
const auth = require("../middleware/auth");

const router = express.Router();

// Get all connections for authenticated user
router.get("/", auth, async (req, res) => {
  try {
    const connections = await Connection.find({ userId: req.user.userId });
    res.json(connections);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get connection by ID with their positions
router.get("/:id", auth, async (req, res) => {
  try {
    const connection = await Connection.findOne({
      _id: req.params.id,
      userId: req.user.userId,
    });

    if (!connection) {
      return res.status(404).json({ error: "Connection not found" });
    }

    // Get all positions for this connection
    const positions = await Position.find({
      connectionId: connection._id,
      userId: req.user.userId,
    }).populate("companyId", "name industry website");

    // Return both the connection and its positions
    res.json({
      ...connection.toObject(),
      positions,
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Create a new connection
router.post("/", auth, async (req, res) => {
  try {
    const { name, email, phone, notes } = req.body;

    const connection = await Connection.create({
      userId: req.user.userId,
      name,
      email,
      phone,
      notes,
    });

    res.json(connection);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

// Update connection by ID
router.put("/:id", auth, async (req, res) => {
  try {
    const { name, email, phone, notes } = req.body;

    // Get existing connection
    const existingConnection = await Connection.findOne({
      _id: req.params.id,
      userId: req.user.userId,
    });

    if (!existingConnection) {
      return res.status(404).json({ error: "Connection not found" });
    }

    // Update the connection
    const connection = await Connection.findOneAndUpdate(
      { _id: req.params.id, userId: req.user.userId },
      { name, email, phone, notes },
      { new: true }
    );

    res.json(connection);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

// Delete connection by ID
router.delete("/:id", auth, async (req, res) => {
  try {
    const connection = await Connection.findOneAndDelete({
      _id: req.params.id,
      userId: req.user.userId,
    });

    if (!connection) {
      return res.status(404).json({ error: "Connection not found" });
    }

    // Delete all positions associated with this connection
    await Position.deleteMany({
      connectionId: connection._id,
      userId: req.user.userId,
    });

    res.json({ success: true });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

// Get connections with positions at a specific company
router.get("/bycompany/:companyId", auth, async (req, res) => {
  try {
    // Find positions for this company
    const positions = await Position.find({
      companyId: req.params.companyId,
      userId: req.user.userId,
    }).populate("connectionId");

    // Extract unique connections
    const connections = positions.map((pos) => pos.connectionId);

    res.json(connections);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;

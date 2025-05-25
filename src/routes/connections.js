const express = require("express");
const Connection = require("../models/Connection");
const Position = require("../models/Position");
const auth = require("../middleware/auth");

const router = express.Router();

// Get all connections for authenticated user
router.get("/", auth, async (req, res) => {
  console.log(
    `[CONNECTIONS] Fetching all connections for user: ${req.user.userId}`
  );
  try {
    const connections = await Connection.find({ userId: req.user.userId });
    console.log(
      `[CONNECTIONS] Found ${connections.length} connections for user: ${req.user.userId}`
    );
    res.json(connections);
  } catch (error) {
    console.error(
      `[CONNECTIONS] [ERROR] Failed to fetch connections for user ${req.user.userId}: ${error.message}`
    );
    res.status(500).json({ error: error.message });
  }
});

// Get connection by ID with their positions
router.get("/:id", auth, async (req, res) => {
  const connectionId = req.params.id;
  console.log(
    `[CONNECTIONS] Fetching connection ${connectionId} for user: ${req.user.userId}`
  );

  try {
    const connection = await Connection.findOne({
      _id: req.params.id,
      userId: req.user.userId,
    });

    if (!connection) {
      console.log(
        `[CONNECTIONS] [WARN] Connection ${connectionId} not found for user: ${req.user.userId}`
      );
      return res.status(404).json({ error: "Connection not found" });
    }

    // Get all positions for this connection
    const positions = await Position.find({
      connectionId: connection._id,
      userId: req.user.userId,
    }).populate("companyId", "name industry website");

    console.log(
      `[CONNECTIONS] Found connection ${connection.name} with ${positions.length} positions for user: ${req.user.userId}`
    );

    // Return both the connection and its positions
    res.json({
      ...connection.toObject(),
      positions,
    });
  } catch (error) {
    console.error(
      `[CONNECTIONS] [ERROR] Failed to fetch connection ${connectionId} for user ${req.user.userId}: ${error.message}`
    );
    res.status(500).json({ error: error.message });
  }
});

// Create a new connection
router.post("/", auth, async (req, res) => {
  const { name, email, phone, linkedinUserId, githubUserId, notes } = req.body;
  console.log(
    `[CONNECTIONS] Creating new connection "${name}" (${email}) for user: ${req.user.userId}`
  );

  try {
    const connection = await Connection.create({
      userId: req.user.userId,
      name,
      email,
      phone,
      linkedinUserId,
      githubUserId,
      notes,
    });

    console.log(
      `[CONNECTIONS] Connection created successfully: ${connection.name} (ID: ${connection._id}) for user: ${req.user.userId}`
    );
    res.json(connection);
  } catch (error) {
    console.error(
      `[CONNECTIONS] [ERROR] Failed to create connection "${name}" for user ${req.user.userId}: ${error.message}`
    );
    res.status(400).json({ error: error.message });
  }
});

// Update connection by ID
router.put("/:id", auth, async (req, res) => {
  const connectionId = req.params.id;
  const { name, email, phone, linkedinUserId, githubUserId, notes } = req.body;
  console.log(
    `[CONNECTIONS] Updating connection ${connectionId} for user: ${req.user.userId}`
  );

  try {
    // Get existing connection to track changes
    const existingConnection = await Connection.findOne({
      _id: req.params.id,
      userId: req.user.userId,
    });

    if (!existingConnection) {
      console.log(
        `[CONNECTIONS] [WARN] Connection ${connectionId} not found for update by user: ${req.user.userId}`
      );
      return res.status(404).json({ error: "Connection not found" });
    }

    // Update the connection
    const connection = await Connection.findOneAndUpdate(
      { _id: req.params.id, userId: req.user.userId },
      { name, email, phone, linkedinUserId, githubUserId, notes },
      { new: true }
    );

    console.log(
      `[CONNECTIONS] Connection updated successfully: ${existingConnection.name} -> ${name} (ID: ${connectionId}) for user: ${req.user.userId}`
    );
    res.json(connection);
  } catch (error) {
    console.error(
      `[CONNECTIONS] [ERROR] Failed to update connection ${connectionId} for user ${req.user.userId}: ${error.message}`
    );
    res.status(400).json({ error: error.message });
  }
});

// Delete connection by ID
router.delete("/:id", auth, async (req, res) => {
  const connectionId = req.params.id;
  console.log(
    `[CONNECTIONS] Deleting connection ${connectionId} for user: ${req.user.userId}`
  );

  try {
    const connection = await Connection.findOneAndDelete({
      _id: req.params.id,
      userId: req.user.userId,
    });

    if (!connection) {
      console.log(
        `[CONNECTIONS] [WARN] Connection ${connectionId} not found for deletion by user: ${req.user.userId}`
      );
      return res.status(404).json({ error: "Connection not found" });
    }

    // Delete all positions associated with this connection
    const deletedPositions = await Position.deleteMany({
      connectionId: connection._id,
      userId: req.user.userId,
    });

    console.log(
      `[CONNECTIONS] Connection deleted successfully: ${connection.name} (ID: ${connectionId}) and ${deletedPositions.deletedCount} associated positions for user: ${req.user.userId}`
    );
    res.json({ success: true });
  } catch (error) {
    console.error(
      `[CONNECTIONS] [ERROR] Failed to delete connection ${connectionId} for user ${req.user.userId}: ${error.message}`
    );
    res.status(400).json({ error: error.message });
  }
});

// Get connections with positions at a specific company
router.get("/bycompany/:companyId", auth, async (req, res) => {
  const companyId = req.params.companyId;
  console.log(
    `[CONNECTIONS] Fetching connections for company ${companyId} by user: ${req.user.userId}`
  );

  try {
    // Find positions for this company
    const positions = await Position.find({
      companyId: req.params.companyId,
      userId: req.user.userId,
    }).populate("connectionId");

    // Extract unique connections
    const connections = positions.map((pos) => pos.connectionId);

    console.log(
      `[CONNECTIONS] Found ${connections.length} connections for company ${companyId} by user: ${req.user.userId}`
    );
    res.json(connections);
  } catch (error) {
    console.error(
      `[CONNECTIONS] [ERROR] Failed to fetch connections for company ${companyId} by user ${req.user.userId}: ${error.message}`
    );
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;

const express = require("express");
const Position = require("../models/Position");
const Connection = require("../models/Connection");
const Company = require("../models/Company");
const auth = require("../middleware/auth");

const router = express.Router();

// Get all positions for authenticated user
router.get("/", auth, async (req, res) => {
  console.log(
    `[POSITIONS] Fetching all positions for user: ${req.user.userId}`
  );
  try {
    const positions = await Position.find({ userId: req.user.userId })
      .populate("connectionId", "name")
      .populate("companyId", "name");
    console.log(
      `[POSITIONS] Found ${positions.length} positions for user: ${req.user.userId}`
    );
    res.json(positions);
  } catch (error) {
    console.error(
      `[POSITIONS] [ERROR] Failed to fetch positions for user ${req.user.userId}: ${error.message}`
    );
    res.status(500).json({ error: error.message });
  }
});

// Get position by ID
router.get("/:id", auth, async (req, res) => {
  const positionId = req.params.id;
  console.log(
    `[POSITIONS] Fetching position ${positionId} for user: ${req.user.userId}`
  );

  try {
    const position = await Position.findOne({
      _id: req.params.id,
      userId: req.user.userId,
    })
      .populate("connectionId", "name")
      .populate("companyId", "name");

    if (!position) {
      console.log(
        `[POSITIONS] [WARN] Position ${positionId} not found for user: ${req.user.userId}`
      );
      return res.status(404).json({ error: "Position not found" });
    }

    console.log(
      `[POSITIONS] Found position: ${position.title} at ${position.companyId.name} for ${position.connectionId.name} (user: ${req.user.userId})`
    );
    res.json(position);
  } catch (error) {
    console.error(
      `[POSITIONS] [ERROR] Failed to fetch position ${positionId} for user ${req.user.userId}: ${error.message}`
    );
    res.status(500).json({ error: error.message });
  }
});

// Get positions by connection ID
router.get("/connection/:connectionId", auth, async (req, res) => {
  const connectionId = req.params.connectionId;
  console.log(
    `[POSITIONS] Fetching positions for connection ${connectionId} by user: ${req.user.userId}`
  );

  try {
    const positions = await Position.find({
      connectionId: req.params.connectionId,
      userId: req.user.userId,
    }).populate("companyId", "name industry website");

    console.log(
      `[POSITIONS] Found ${positions.length} positions for connection ${connectionId} by user: ${req.user.userId}`
    );
    res.json(positions);
  } catch (error) {
    console.error(
      `[POSITIONS] [ERROR] Failed to fetch positions for connection ${connectionId} by user ${req.user.userId}: ${error.message}`
    );
    res.status(500).json({ error: error.message });
  }
});

// Get positions by company ID
router.get("/company/:companyId", auth, async (req, res) => {
  const companyId = req.params.companyId;
  console.log(
    `[POSITIONS] Fetching positions for company ${companyId} by user: ${req.user.userId}`
  );

  try {
    const positions = await Position.find({
      companyId: req.params.companyId,
      userId: req.user.userId,
    }).populate("connectionId", "name email phone");

    console.log(
      `[POSITIONS] Found ${positions.length} positions for company ${companyId} by user: ${req.user.userId}`
    );
    res.json(positions);
  } catch (error) {
    console.error(
      `[POSITIONS] [ERROR] Failed to fetch positions for company ${companyId} by user ${req.user.userId}: ${error.message}`
    );
    res.status(500).json({ error: error.message });
  }
});

// Create a new position
router.post("/", auth, async (req, res) => {
  try {
    const {
      connectionId,
      companyId,
      title,
      startDate,
      endDate,
      current,
      notes,
    } = req.body;

    console.log(
      `[POSITIONS] Creating new position "${title}" for connection ${connectionId} at company ${companyId} by user: ${req.user.userId}`
    );

    // Validate the connection exists
    const connection = await Connection.findOne({
      _id: connectionId,
      userId: req.user.userId,
    });
    if (!connection) {
      console.log(
        `[POSITIONS] [WARN] Connection ${connectionId} not found for position creation by user: ${req.user.userId}`
      );
      return res.status(404).json({ error: "Connection not found" });
    }

    // Validate the company exists
    const company = await Company.findOne({
      _id: companyId,
      userId: req.user.userId,
    });
    if (!company) {
      console.log(
        `[POSITIONS] [WARN] Company ${companyId} not found for position creation by user: ${req.user.userId}`
      );
      return res.status(404).json({ error: "Company not found" });
    }

    // Process dates
    const processedStartDate = startDate ? new Date(startDate) : undefined;
    const processedEndDate = endDate ? new Date(endDate) : undefined;

    // Ensure start date is before end date if both are provided
    if (
      processedStartDate &&
      processedEndDate &&
      processedStartDate > processedEndDate
    ) {
      throw new Error("Start date cannot be after end date");
    }

    // Create the position
    const position = await Position.create({
      userId: req.user.userId,
      connectionId,
      companyId,
      title,
      startDate: processedStartDate,
      endDate: processedEndDate,
      current,
      notes,
    });

    // Populate connection and company details for the response
    const populatedPosition = await Position.findById(position._id)
      .populate("connectionId", "name")
      .populate("companyId", "name");

    console.log(
      `[POSITIONS] Position created successfully: ${title} for ${connection.name} at ${company.name} (ID: ${position._id}) by user: ${req.user.userId}`
    );
    res.json(populatedPosition);
  } catch (error) {
    console.error(
      `[POSITIONS] [ERROR] Failed to create position for user ${req.user.userId}: ${error.message}`
    );
    res.status(400).json({ error: error.message });
  }
});

// Update position by ID
router.put("/:id", auth, async (req, res) => {
  const positionId = req.params.id;
  console.log(
    `[POSITIONS] Updating position ${positionId} for user: ${req.user.userId}`
  );

  try {
    const { title, startDate, endDate, current, notes } = req.body;

    // Get existing position
    const existingPosition = await Position.findOne({
      _id: req.params.id,
      userId: req.user.userId,
    })
      .populate("connectionId", "name")
      .populate("companyId", "name");

    if (!existingPosition) {
      console.log(
        `[POSITIONS] [WARN] Position ${positionId} not found for update by user: ${req.user.userId}`
      );
      return res.status(404).json({ error: "Position not found" });
    }

    // Process dates
    const processedStartDate = startDate ? new Date(startDate) : undefined;
    const processedEndDate = endDate ? new Date(endDate) : undefined;

    // Ensure start date is before end date if both are provided
    if (
      processedStartDate &&
      processedEndDate &&
      processedStartDate > processedEndDate
    ) {
      throw new Error("Start date cannot be after end date");
    }

    // Update the position
    const position = await Position.findOneAndUpdate(
      { _id: req.params.id, userId: req.user.userId },
      {
        title,
        startDate: processedStartDate,
        endDate: processedEndDate,
        current,
        notes,
      },
      { new: true }
    )
      .populate("connectionId", "name")
      .populate("companyId", "name");

    console.log(
      `[POSITIONS] Position updated successfully: ${existingPosition.title} -> ${title} for ${existingPosition.connectionId.name} at ${existingPosition.companyId.name} (ID: ${positionId}) by user: ${req.user.userId}`
    );
    res.json(position);
  } catch (error) {
    console.error(
      `[POSITIONS] [ERROR] Failed to update position ${positionId} for user ${req.user.userId}: ${error.message}`
    );
    res.status(400).json({ error: error.message });
  }
});

// Delete position by ID
router.delete("/:id", auth, async (req, res) => {
  const positionId = req.params.id;
  console.log(
    `[POSITIONS] Deleting position ${positionId} for user: ${req.user.userId}`
  );

  try {
    const position = await Position.findOne({
      _id: req.params.id,
      userId: req.user.userId,
    })
      .populate("connectionId", "name")
      .populate("companyId", "name");

    if (!position) {
      console.log(
        `[POSITIONS] [WARN] Position ${positionId} not found for deletion by user: ${req.user.userId}`
      );
      return res.status(404).json({ error: "Position not found" });
    }

    await Position.findOneAndDelete({
      _id: req.params.id,
      userId: req.user.userId,
    });

    console.log(
      `[POSITIONS] Position deleted successfully: ${position.title} for ${position.connectionId.name} at ${position.companyId.name} (ID: ${positionId}) by user: ${req.user.userId}`
    );
    res.json({ success: true });
  } catch (error) {
    console.error(
      `[POSITIONS] [ERROR] Failed to delete position ${positionId} for user ${req.user.userId}: ${error.message}`
    );
    res.status(400).json({ error: error.message });
  }
});

module.exports = router;

const express = require("express");
const Position = require("../models/Position");
const Connection = require("../models/Connection");
const Company = require("../models/Company");
const auth = require("../middleware/auth");

const router = express.Router();

// Get all positions for authenticated user
router.get("/", auth, async (req, res) => {
  try {
    const positions = await Position.find({ userId: req.user.userId })
      .populate("connectionId", "name")
      .populate("companyId", "name");
    res.json(positions);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get position by ID
router.get("/:id", auth, async (req, res) => {
  try {
    const position = await Position.findOne({
      _id: req.params.id,
      userId: req.user.userId,
    })
      .populate("connectionId", "name")
      .populate("companyId", "name");

    if (!position) {
      return res.status(404).json({ error: "Position not found" });
    }

    res.json(position);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get positions by connection ID
router.get("/connection/:connectionId", auth, async (req, res) => {
  try {
    const positions = await Position.find({
      connectionId: req.params.connectionId,
      userId: req.user.userId,
    }).populate("companyId", "name industry website");
    res.json(positions);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get positions by company ID
router.get("/company/:companyId", auth, async (req, res) => {
  try {
    const positions = await Position.find({
      companyId: req.params.companyId,
      userId: req.user.userId,
    }).populate("connectionId", "name email phone");
    res.json(positions);
  } catch (error) {
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

    // Validate the connection exists
    const connection = await Connection.findOne({
      _id: connectionId,
      userId: req.user.userId,
    });
    if (!connection) {
      return res.status(404).json({ error: "Connection not found" });
    }

    // Validate the company exists
    const company = await Company.findOne({
      _id: companyId,
      userId: req.user.userId,
    });
    if (!company) {
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

    res.json(populatedPosition);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

// Update position by ID
router.put("/:id", auth, async (req, res) => {
  try {
    const { title, startDate, endDate, current, notes } = req.body;

    // Get existing position
    const existingPosition = await Position.findOne({
      _id: req.params.id,
      userId: req.user.userId,
    });

    if (!existingPosition) {
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

    res.json(position);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

// Delete position by ID
router.delete("/:id", auth, async (req, res) => {
  try {
    const position = await Position.findOneAndDelete({
      _id: req.params.id,
      userId: req.user.userId,
    });

    if (!position) {
      return res.status(404).json({ error: "Position not found" });
    }

    res.json({ success: true });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

module.exports = router;

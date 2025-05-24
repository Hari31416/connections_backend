const express = require("express");
const Company = require("../models/Company");
const Position = require("../models/Position");
const auth = require("../middleware/auth");

const router = express.Router();

// Get all companies for authenticated user
router.get("/", auth, async (req, res) => {
  try {
    const companies = await Company.find({ userId: req.user.userId });
    res.json(companies);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get company by ID with positions
router.get("/:id", auth, async (req, res) => {
  try {
    const company = await Company.findOne({
      _id: req.params.id,
      userId: req.user.userId,
    });

    if (!company) {
      return res.status(404).json({ error: "Company not found" });
    }

    // Get all positions for this company
    const positions = await Position.find({
      companyId: company._id,
      userId: req.user.userId,
    }).populate("connectionId", "name email phone");

    // Return both the company and its positions
    res.json({
      ...company.toObject(),
      positions,
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Create a new company
router.post("/", auth, async (req, res) => {
  try {
    const { name, industry, website } = req.body;
    const company = await Company.create({
      userId: req.user.userId,
      name,
      industry,
      website,
    });

    res.json(company);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

// Update company by ID
router.put("/:id", auth, async (req, res) => {
  try {
    const { name, industry, website } = req.body;

    // Get existing company to track changes
    const existingCompany = await Company.findOne({
      _id: req.params.id,
      userId: req.user.userId,
    });

    if (!existingCompany) {
      return res.status(404).json({ error: "Company not found" });
    }

    // Update the company
    const company = await Company.findOneAndUpdate(
      { _id: req.params.id, userId: req.user.userId },
      { name, industry, website },
      { new: true }
    );

    res.json(company);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

// Delete company by ID
router.delete("/:id", auth, async (req, res) => {
  try {
    const company = await Company.findOneAndDelete({
      _id: req.params.id,
      userId: req.user.userId,
    });

    if (!company) {
      return res.status(404).json({ error: "Company not found" });
    }

    // Delete all positions associated with this company
    await Position.deleteMany({
      companyId: company._id,
      userId: req.user.userId,
    });

    res.json({ success: true });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

// Get companies with positions for a specific connection
router.get("/byconnection/:connectionId", auth, async (req, res) => {
  try {
    // Find positions for this connection
    const positions = await Position.find({
      connectionId: req.params.connectionId,
      userId: req.user.userId,
    }).populate("companyId");

    // Extract unique companies
    const companies = positions.map((pos) => pos.companyId);

    res.json(companies);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;

const express = require("express");
const Company = require("../models/Company");
const Position = require("../models/Position");
const auth = require("../middleware/auth");

const router = express.Router();

// Get all companies for authenticated user
router.get("/", auth, async (req, res) => {
  console.log(
    `[COMPANIES] Fetching all companies for user: ${req.user.userId}`
  );
  try {
    const companies = await Company.find({ userId: req.user.userId });
    console.log(
      `[COMPANIES] Found ${companies.length} companies for user: ${req.user.userId}`
    );
    res.json(companies);
  } catch (error) {
    console.error(
      `[COMPANIES] [ERROR] Failed to fetch companies for user ${req.user.userId}: ${error.message}`
    );
    res.status(500).json({ error: error.message });
  }
});

// Get company by ID with positions
router.get("/:id", auth, async (req, res) => {
  const companyId = req.params.id;
  console.log(
    `[COMPANIES] Fetching company ${companyId} for user: ${req.user.userId}`
  );

  try {
    const company = await Company.findOne({
      _id: req.params.id,
      userId: req.user.userId,
    });

    if (!company) {
      console.log(
        `[COMPANIES] [WARN] Company ${companyId} not found for user: ${req.user.userId}`
      );
      return res.status(404).json({ error: "Company not found" });
    }

    // Get all positions for this company
    const positions = await Position.find({
      companyId: company._id,
      userId: req.user.userId,
    }).populate("connectionId", "name email phone");

    console.log(
      `[COMPANIES] Found company ${company.name} with ${positions.length} positions for user: ${req.user.userId}`
    );

    // Return both the company and its positions
    res.json({
      ...company.toObject(),
      positions,
    });
  } catch (error) {
    console.error(
      `[COMPANIES] [ERROR] Failed to fetch company ${companyId} for user ${req.user.userId}: ${error.message}`
    );
    res.status(500).json({ error: error.message });
  }
});

// Create a new company
router.post("/", auth, async (req, res) => {
  const { name, industry, website } = req.body;
  console.log(
    `[COMPANIES] Creating new company "${name}" for user: ${req.user.userId}`
  );

  try {
    const company = await Company.create({
      userId: req.user.userId,
      name,
      industry,
      website,
    });

    console.log(
      `[COMPANIES] Company created successfully: ${company.name} (ID: ${company._id}) for user: ${req.user.userId}`
    );
    res.json(company);
  } catch (error) {
    console.error(
      `[COMPANIES] [ERROR] Failed to create company "${name}" for user ${req.user.userId}: ${error.message}`
    );
    res.status(400).json({ error: error.message });
  }
});

// Update company by ID
router.put("/:id", auth, async (req, res) => {
  const companyId = req.params.id;
  const { name, industry, website } = req.body;
  console.log(
    `[COMPANIES] Updating company ${companyId} for user: ${req.user.userId}`
  );

  try {
    // Get existing company to track changes
    const existingCompany = await Company.findOne({
      _id: req.params.id,
      userId: req.user.userId,
    });

    if (!existingCompany) {
      console.log(
        `[COMPANIES] [WARN] Company ${companyId} not found for update by user: ${req.user.userId}`
      );
      return res.status(404).json({ error: "Company not found" });
    }

    // Update the company
    const company = await Company.findOneAndUpdate(
      { _id: req.params.id, userId: req.user.userId },
      { name, industry, website },
      { new: true }
    );

    console.log(
      `[COMPANIES] Company updated successfully: ${existingCompany.name} -> ${name} (ID: ${companyId}) for user: ${req.user.userId}`
    );
    res.json(company);
  } catch (error) {
    console.error(
      `[COMPANIES] [ERROR] Failed to update company ${companyId} for user ${req.user.userId}: ${error.message}`
    );
    res.status(400).json({ error: error.message });
  }
});

// Delete company by ID
router.delete("/:id", auth, async (req, res) => {
  const companyId = req.params.id;
  console.log(
    `[COMPANIES] Deleting company ${companyId} for user: ${req.user.userId}`
  );

  try {
    const company = await Company.findOneAndDelete({
      _id: req.params.id,
      userId: req.user.userId,
    });

    if (!company) {
      console.log(
        `[COMPANIES] [WARN] Company ${companyId} not found for deletion by user: ${req.user.userId}`
      );
      return res.status(404).json({ error: "Company not found" });
    }

    // Delete all positions associated with this company
    const deletedPositions = await Position.deleteMany({
      companyId: company._id,
      userId: req.user.userId,
    });

    console.log(
      `[COMPANIES] Company deleted successfully: ${company.name} (ID: ${companyId}) and ${deletedPositions.deletedCount} associated positions for user: ${req.user.userId}`
    );
    res.json({ success: true });
  } catch (error) {
    console.error(
      `[COMPANIES] [ERROR] Failed to delete company ${companyId} for user ${req.user.userId}: ${error.message}`
    );
    res.status(400).json({ error: error.message });
  }
});

// Get companies with positions for a specific connection
router.get("/byconnection/:connectionId", auth, async (req, res) => {
  const connectionId = req.params.connectionId;
  console.log(
    `[COMPANIES] Fetching companies for connection ${connectionId} by user: ${req.user.userId}`
  );

  try {
    // Find positions for this connection
    const positions = await Position.find({
      connectionId: req.params.connectionId,
      userId: req.user.userId,
    }).populate("companyId");

    // Extract unique companies
    const companies = positions.map((pos) => pos.companyId);

    console.log(
      `[COMPANIES] Found ${companies.length} companies for connection ${connectionId} by user: ${req.user.userId}`
    );
    res.json(companies);
  } catch (error) {
    console.error(
      `[COMPANIES] [ERROR] Failed to fetch companies for connection ${connectionId} by user ${req.user.userId}: ${error.message}`
    );
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;

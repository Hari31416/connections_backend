const express = require("express");
const Connection = require("../models/Connection");
const Company = require("../models/Company");
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

// Get connection by ID
router.get("/:id", auth, async (req, res) => {
  try {
    const connection = await Connection.findOne({
      _id: req.params.id,
      userId: req.user.userId,
    });

    if (!connection) {
      return res.status(404).json({ error: "Connection not found" });
    }

    res.json(connection);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Create a new connection
router.post("/", auth, async (req, res) => {
  try {
    const { name, email, phone, companies = [], notes } = req.body;

    // Validate company data if provided
    const processedCompanies = companies.map((company) => {
      const { companyId, companyName, position, startDate, endDate } = company;

      // Validate dates if provided
      const processedStartDate = startDate ? new Date(startDate) : undefined;
      const processedEndDate = endDate ? new Date(endDate) : undefined;

      // Ensure start date is before end date if both are provided
      if (
        processedStartDate &&
        processedEndDate &&
        processedStartDate > processedEndDate
      ) {
        throw new Error(
          `Invalid date range for company ${companyName}: start date cannot be after end date`
        );
      }

      return {
        companyId,
        companyName,
        position,
        startDate: processedStartDate,
        endDate: processedEndDate,
      };
    });

    const connection = await Connection.create({
      userId: req.user.userId,
      name,
      email,
      phone,
      companies: processedCompanies,
      notes,
    });

    // If companies are provided, update each company with this connection
    if (processedCompanies && processedCompanies.length > 0) {
      for (const comp of processedCompanies) {
        await Company.findOneAndUpdate(
          { _id: comp.companyId, userId: req.user.userId },
          {
            $push: {
              connections: {
                connectionId: connection._id,
                connectionName: connection.name,
                position: comp.position,
              },
            },
          }
        );
      }
    }

    res.json(connection);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

// Update connection by ID
router.put("/:id", auth, async (req, res) => {
  try {
    const { name, email, phone, companies = [], notes } = req.body;

    // Get existing connection to track changes
    const existingConnection = await Connection.findOne({
      _id: req.params.id,
      userId: req.user.userId,
    });

    if (!existingConnection) {
      return res.status(404).json({ error: "Connection not found" });
    }

    // Validate company data if provided
    const processedCompanies = companies.map((company) => {
      const { companyId, companyName, position, startDate, endDate } = company;

      // Validate dates if provided
      const processedStartDate = startDate ? new Date(startDate) : undefined;
      const processedEndDate = endDate ? new Date(endDate) : undefined;

      // Ensure start date is before end date if both are provided
      if (
        processedStartDate &&
        processedEndDate &&
        processedStartDate > processedEndDate
      ) {
        throw new Error(
          `Invalid date range for company ${companyName}: start date cannot be after end date`
        );
      }

      return {
        companyId,
        companyName,
        position,
        startDate: processedStartDate,
        endDate: processedEndDate,
      };
    });

    // Update the connection
    const connection = await Connection.findOneAndUpdate(
      { _id: req.params.id, userId: req.user.userId },
      { name, email, phone, companies: processedCompanies, notes },
      { new: true }
    );

    // If name changed, update all companies that reference this connection
    if (name !== existingConnection.name) {
      await Company.updateMany(
        { userId: req.user.userId, "connections.connectionId": connection._id },
        { $set: { "connections.$.connectionName": name } }
      );
    }

    // Get IDs of companies in the updated connection
    const updatedCompanyIds = processedCompanies.map((c) =>
      c.companyId.toString()
    );

    // Get IDs of companies in the previous version
    const existingCompanyIds = existingConnection.companies
      ? existingConnection.companies.map((c) => c.companyId.toString())
      : [];

    // Companies to add (in updated but not in existing)
    const companiesToAdd = processedCompanies.filter(
      (c) => !existingCompanyIds.includes(c.companyId.toString())
    );

    // Companies to remove (in existing but not in updated)
    const companyIdsToRemove = existingCompanyIds.filter(
      (id) => !updatedCompanyIds.includes(id)
    );

    // Add this connection to new companies
    for (const comp of companiesToAdd) {
      await Company.findOneAndUpdate(
        { _id: comp.companyId, userId: req.user.userId },
        {
          $push: {
            connections: {
              connectionId: connection._id,
              connectionName: connection.name,
              position: comp.position,
            },
          },
        }
      );
    }

    // Remove this connection from companies no longer associated
    if (companyIdsToRemove.length > 0) {
      await Company.updateMany(
        { _id: { $in: companyIdsToRemove }, userId: req.user.userId },
        { $pull: { connections: { connectionId: connection._id } } }
      );
    }

    // Update position for existing companies
    for (const comp of processedCompanies) {
      if (existingCompanyIds.includes(comp.companyId.toString())) {
        await Company.updateOne(
          {
            _id: comp.companyId,
            userId: req.user.userId,
            "connections.connectionId": connection._id,
          },
          { $set: { "connections.$.position": comp.position } }
        );
      }
    }

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

    // Remove this connection from all companies
    if (connection.companies && connection.companies.length > 0) {
      const companyIds = connection.companies.map((c) => c.companyId);
      await Company.updateMany(
        { _id: { $in: companyIds }, userId: req.user.userId },
        { $pull: { connections: { connectionId: connection._id } } }
      );
    }

    res.json({ success: true });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

module.exports = router;

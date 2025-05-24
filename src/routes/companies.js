const express = require("express");
const Company = require("../models/Company");
const Connection = require("../models/Connection");
const auth = require("../middleware/auth");

const router = express.Router();

// Get all companies for authenticated user
router.get("/", auth, async (req, res) => {
  try {
    const companies = await Company.find({ userId: req.user.userId });

    // Check if companies have the connections array
    if (companies.length > 0) {
      // Make sure connections array is initialized for each company
      companies.forEach((company) => {
        if (!company.connections) {
          company.connections = [];
        }
      });
    }

    res.json(companies);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get company by ID with connections
router.get("/:id", auth, async (req, res) => {
  try {
    const company = await Company.findOne({
      _id: req.params.id,
      userId: req.user.userId,
    });

    if (!company) {
      return res.status(404).json({ error: "Company not found" });
    }

    res.json(company);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Create a new company
router.post("/", auth, async (req, res) => {
  try {
    const { name, industry, website, connections = [] } = req.body;
    const company = await Company.create({
      userId: req.user.userId,
      name,
      industry,
      website,
      connections,
    });

    // If connections are provided, update the connections too
    if (connections && connections.length > 0) {
      for (const conn of connections) {
        await Connection.findOneAndUpdate(
          { _id: conn.connectionId, userId: req.user.userId },
          {
            $push: {
              companies: {
                companyId: company._id,
                companyName: company.name,
                position: conn.position,
              },
            },
          }
        );
      }
    }

    res.json(company);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

// Update company by ID
router.put("/:id", auth, async (req, res) => {
  try {
    const { name, industry, website, connections = [] } = req.body;

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
      { name, industry, website, connections },
      { new: true }
    );

    // If name changed, update all connections that reference this company
    if (name !== existingCompany.name) {
      await Connection.updateMany(
        { userId: req.user.userId, "companies.companyId": company._id },
        { $set: { "companies.$.companyName": name } }
      );
    }

    // Handle connections updates - more complex logic would be needed for a complete solution
    // This is a simplified approach
    if (connections && connections.length > 0) {
      // Update or add connections
      for (const conn of connections) {
        // Get connection details to get the name if needed
        const connectionDetails = await Connection.findOne({
          _id: conn.connectionId,
          userId: req.user.userId,
        });

        // Check if connection exists and has this company
        const connection = await Connection.findOne({
          _id: conn.connectionId,
          userId: req.user.userId,
          "companies.companyId": company._id,
        });

        if (connection) {
          // Update existing connection
          await Connection.updateOne(
            {
              _id: conn.connectionId,
              userId: req.user.userId,
              "companies.companyId": company._id,
            },
            {
              $set: {
                "companies.$.position": conn.position,
                "companies.$.companyName": name,
              },
            }
          );

          // Update company connection position
          await Company.updateOne(
            { _id: company._id, "connections.connectionId": conn.connectionId },
            {
              $set: {
                "connections.$.position": conn.position,
              },
            }
          );
        } else {
          // Add company to connection
          await Connection.findOneAndUpdate(
            { _id: conn.connectionId, userId: req.user.userId },
            {
              $push: {
                companies: {
                  companyId: company._id,
                  companyName: name,
                  position: conn.position,
                },
              },
            }
          );

          // Add connection to company
          const connectionEntry = {
            connectionId: conn.connectionId,
            connectionName: connectionDetails ? connectionDetails.name : "",
            position: conn.position,
          };

          // If the connection isn't in the connections array, add it
          const connectionExists = company.connections.some(
            (c) => c.connectionId.toString() === conn.connectionId.toString()
          );

          if (!connectionExists) {
            await Company.findOneAndUpdate(
              { _id: company._id, userId: req.user.userId },
              { $push: { connections: connectionEntry } }
            );
          }
        }
      }
    }

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

    // Remove this company from all connections
    await Connection.updateMany(
      { userId: req.user.userId },
      { $pull: { companies: { companyId: company._id } } }
    );

    res.json({ success: true });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

module.exports = router;

const express = require("express");
const cors = require("cors");
require("dotenv").config();

// Import database connection
const connectDB = require("./config/db");

// Import routes
const authRoutes = require("./routes/auth");
const companyRoutes = require("./routes/companies");
const connectionRoutes = require("./routes/connections");
const positionRoutes = require("./routes/positions");

// Initialize Express app
const app = express();

// Request logging middleware
app.use((req, res, next) => {
  const timestamp = new Date().toISOString();
  console.log(
    `[${timestamp}] ${req.method} ${req.path} - IP: ${req.ip.replace(
      /:/g,
      "***"
    )}`
  );

  // Log limited request info for non-GET requests (excluding sensitive data)
  if (req.method !== "GET" && req.body) {
    const logData = {};

    // Only log non-sensitive field names and types, not values
    Object.keys(req.body).forEach((key) => {
      if (
        [
          "password",
          "email",
          "phone",
          "notes",
          "linkedinUserId",
          "githubUserId",
        ].includes(key)
      ) {
        logData[key] = "[HIDDEN]";
      } else {
        logData[key] = typeof req.body[key];
      }
    });

    console.log(
      `[${timestamp}] Request fields:`,
      JSON.stringify(logData, null, 2)
    );
  }

  next();
});

// Middleware
app.use(cors());
app.use(express.json());

console.log("[SERVER] Initializing server...");
console.log(`[SERVER] Environment: ${process.env.NODE_ENV || "development"}`);

// Connect to MongoDB
connectDB();

// Routes
console.log("[SERVER] Setting up routes...");
app.use("/api", authRoutes);
app.use("/api/companies", companyRoutes);
app.use("/api/connections", connectionRoutes);
app.use("/api/positions", positionRoutes);
console.log("[SERVER] Routes configured successfully");

// Health check endpoint
app.get("/health", (req, res) => {
  console.log("[HEALTH] Health check requested");
  res.json({
    status: "OK",
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
  });
});

// Error handling middleware
app.use((err, req, res, next) => {
  const timestamp = new Date().toISOString();
  console.error(`[${timestamp}] [ERROR] ${err.message}`);
  console.error(`[${timestamp}] [ERROR] Stack: ${err.stack}`);
  res.status(500).json({ error: "Server error" });
});

// Start server
const PORT = process.env.PORT || 4000;
app.listen(PORT, () => {
  console.log(`[SERVER] Backend running on port ${PORT}`);
  console.log(
    `[SERVER] Health check available at http://localhost:${PORT}/health`
  );
  console.log(
    `[SERVER] API endpoints available at http://localhost:${PORT}/api`
  );
  console.log(
    `[SERVER] Server started successfully at ${new Date().toISOString()}`
  );
});

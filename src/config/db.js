const mongoose = require("mongoose");
require("dotenv").config();

const connectDB = async () => {
  try {
    console.log("[DB] Attempting to connect to MongoDB...");

    await mongoose.connect(
      process.env.MONGO_URI || "mongodb://localhost:27017/connections",
      {
        useNewUrlParser: true,
        useUnifiedTopology: true,
      }
    );
    console.log("[DB] MongoDB connected successfully");
    console.log(`[DB] Database: ${mongoose.connection.db.databaseName}`);
    console.log(
      `[DB] Host: ${mongoose.connection.host}:${mongoose.connection.port}`
    );
  } catch (error) {
    console.error("[DB] [ERROR] MongoDB connection failed:", error.message);
    console.error("[DB] [ERROR] Full error:", error);
    process.exit(1);
  }
};

// Monitor connection events
mongoose.connection.on("disconnected", () => {
  console.log("[DB] MongoDB disconnected");
});

mongoose.connection.on("reconnected", () => {
  console.log("[DB] MongoDB reconnected");
});

mongoose.connection.on("error", (err) => {
  console.error("[DB] [ERROR] MongoDB connection error:", err);
});

module.exports = connectDB;

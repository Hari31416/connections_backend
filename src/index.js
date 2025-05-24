const express = require('express');
const cors = require('cors');
require('dotenv').config();

// Import database connection
const connectDB = require('./config/db');

// Import routes
const authRoutes = require('./routes/auth');
const companyRoutes = require('./routes/companies');
const connectionRoutes = require('./routes/connections');

// Initialize Express app
const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// Connect to MongoDB
connectDB();

// Routes
app.use('/api', authRoutes);
app.use('/api/companies', companyRoutes);
app.use('/api/connections', connectionRoutes);

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ error: 'Server error' });
});

// Start server
const PORT = process.env.PORT || 4000;
app.listen(PORT, () => console.log('Backend running on port', PORT));
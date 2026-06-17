// Required packages
// Environment variables
const express = require('express');
const dotenv = require('dotenv');
dotenv.config();
const mongoose = require('mongoose');
const cors = require('cors');
const issueRoutes = require('./routes/issueRoutes');
const authRoutes = require('./routes/authRoutes');



// Initialize Express app
const app = express();

// Enable CORS for all routes
app.use(cors());





// Middleware
app.use(express.json());

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/issues', issueRoutes);

// Port and database
const PORT = process.env.PORT || 5000;
const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/citypulse';

// DB Connection
const connectDB = async () => {
  try {
    const conn = await mongoose.connect(MONGODB_URI);

    console.log(`DB Connected: ${conn.connection.host}`);
    return conn;
  } catch (error) {
    console.error(`DB Connection Error: ${error.message}`);
    process.exit(1);
  }
};

// Connect to database
connectDB();

// Start server
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});

module.exports = app;
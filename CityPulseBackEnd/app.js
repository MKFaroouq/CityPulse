// Required packages
const express = require('express');
const dotenv = require('dotenv');
const mongoose = require('mongoose');

// Environment variables
dotenv.config();

// Initialize Express app
const app = express();

// Middleware
app.use(express.json());

// Port and database
const PORT = process.env.PORT || 5000;
const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/citypulse';

// DB Connection
const connectDB = async () => {
  try {
    const conn = await mongoose.connect(MONGODB_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });

    console.log(`MongoDB Connected: ${conn.connection.host}`);
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
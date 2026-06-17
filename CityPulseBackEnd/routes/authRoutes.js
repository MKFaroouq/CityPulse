const express = require('express');
const router = express.Router();
const { registerUser, loginUser, getAllUser } = require("../controllers/authController");

// const {registerUser} = require("../controllers/authController");
// const {loginUser} = require("../controllers/authController");
// const {getAllUser} = require("../controllers/authController");
const { protectKey, adminOnly } = require('../controllers/authMiddleware');

// const { registerUser, loginUser } = require("../controllers/authController");

// more efficient way to import both functions from the same file.
//1- const { registerUser, loginUser } = require("../controllers/authController");
// importing all functions from the same file and then using them as authController.
//2- const authController = require("../controllers/authController");


// Register route
router.post("/register", protectKey, adminOnly, registerUser);
// register get
// router.get("/register", adminOnly, protectKey, registerUser);

// Login route
router.post("/login", loginUser);
// login get
// router.get("/login", loginUser);

// Get all users route
router.get("/users", protectKey, adminOnly, getAllUser);

module.exports = router;

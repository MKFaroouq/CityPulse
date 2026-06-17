const express = require('express');
const router = express.Router();
const {registerUser} = require("../controllers/authController");
const {loginUser} = require("../controllers/authController");
// const { registerUser, loginUser } = require("../controllers/authController");

// more efficient way to import both functions from the same file.
//1- const { registerUser, loginUser } = require("../controllers/authController");
// importing all functions from the same file and then using them as authController.
//2- const authController = require("../controllers/authController");


// Register route
router.post("/register", registerUser);
// register get
router.get("/register", registerUser);

// Login route
router.post("/login", loginUser);
// login get
// router.get("/login", loginUser);

module.exports = router;

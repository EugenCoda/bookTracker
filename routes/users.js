var express = require("express");
var router = express.Router();
const { check, validationResult } = require("express-validator");
const flash = require("connect-flash");
const bcrypt = require("bcryptjs");
const passport = require("passport");

// Require controller module.
var user_controller = require("../controllers/userController");
var booklist_controller = require("../controllers/booklistController");

/// USER ROUTES ///

// Register Form
router.get("/register", user_controller.user_create_get);

// POST request for registering User.
router.post("/register", user_controller.user_create_post);

// User Login Form
router.get("/login", user_controller.user_login_get);

// POST request for Login User.
router.post("/login", user_controller.user_login_post);

//User Logout
router.get("/logout", user_controller.user_logout_get);

module.exports = router;

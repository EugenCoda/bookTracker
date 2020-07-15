var express = require("express");
var router = express.Router();
const { ensureGuest } = require("../middleware/auth");

// Require controller module.
var user_controller = require("../controllers/userController");

/// USER ROUTES ///

// Register Form
router.get("/register", ensureGuest, user_controller.user_create_get);

// POST request for registering User.
router.post("/register", user_controller.user_create_post);

// GET request User Login Form
router.get("/login", ensureGuest, user_controller.user_login_get);

// POST request for Login User.
router.post("/login", user_controller.user_login_post);

// GET request for Confirmation of User.
router.get(
  "/confirmation/:id",
  ensureGuest,
  user_controller.user_confirmation_get
);

// POST request for Confirmation of User.
router.post("/confirmation/:id", user_controller.user_confirmation_post);

// GET request for Resending the Token.
router.get("/resend", ensureGuest, user_controller.resend_token_get);

// POST request for Resending the Token.
router.post("/resend", user_controller.resend_token_post);

//User Logout
router.get("/logout", user_controller.user_logout_get);

module.exports = router;

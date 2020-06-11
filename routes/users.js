var express = require("express");
var router = express.Router();
const { check, validationResult } = require("express-validator");
const flash = require("connect-flash");
const bcrypt = require("bcryptjs");
const passport = require("passport");

// Bring in User Model
let User = require("../models/user");

//Register Form
router.get("/register", (req, res) => {
  res.render("user_form");
});

//Register Process
router.post(
  "/register",
  [
    check("name", "Name is required").isLength({ min: 1 }),
    check("email", "Email is required").isLength({ min: 1 }),
    check("email", "Email is not valid").isEmail(),
    check("username", "Username is required").isLength({ min: 1 }),
    check("password", "Password is required").isLength({ min: 1 }),
    check("password2", "Passwords should match").custom((value, { req }) => {
      return value === req.body.password;
    }),
  ],
  (req, res, next) => {
    let user = new User({
      name: req.body.name,
      email: req.body.email,
      username: req.body.username,
      password: req.body.password,
    });

    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      console.log(errors);
      res.render("register", {
        user: user,
        errors: errors.mapped(),
      });
    } else {
      bcrypt.genSalt(10, (err, salt) => {
        bcrypt.hash(user.password, salt, (err, hash) => {
          if (err) {
            console.log(err);
          }
          user.password = hash;

          user.save((err) => {
            if (err) {
              console.log(err);
              return;
            } else {
              req.flash("success", "You are now registered and can log in");
              console.log("You are now registered and can log in");
              res.redirect("/users/login");
            }
          });
        });
      });
    }
  }
);

//User Login Form
router.get("/login", (req, res) => {
  res.render("user_login");
});

//Login Process
router.post("/login", (req, res, next) => {
  passport.authenticate("local", {
    successRedirect: "/",
    failureRedirect: "/users/login",
    failureFlash: true,
  })(req, res, next);
});

//Logout
router.get("/logout", (req, res) => {
  req.logout();
  req.flash("success", "You are logged out.");
  res.redirect("/users/login");
});

module.exports = router;

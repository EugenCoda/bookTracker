var User = require("../models/user");
var Booklist = require("../models/booklist");
const { check, validationResult } = require("express-validator");
const flash = require("connect-flash");
const bcrypt = require("bcryptjs");
const passport = require("passport");

// Display User create form on GET.
exports.user_create_get = function (req, res, next) {
  res.render("user_form", { title: "Register User" });
};

// Handle User create on POST.
exports.user_create_post = [
  check("name", "Name is required").isLength({ min: 1 }),
  check("email", "Email is required").isLength({ min: 1 }),
  check("email", "Email is not valid").isEmail(),
  check("username", "Username is required").isLength({ min: 1 }),
  check("password", "Password is required").isLength({ min: 1 }),
  check("password2", "Passwords should match").custom((value, { req }) => {
    return value === req.body.password;
  }),

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
              res.redirect("/users/login");
            }
          });
        });
      });

      // Create user booklist
      var booklist = new Booklist({
        user: user._id,
        personal_list: [],
      });

      // Save user booklist.
      booklist.save(function (err) {
        if (err) {
          return next(err);
        }
      });
    }
  },
];

// Display User login form on GET.
exports.user_login_get = function (req, res, next) {
  res.render("user_login", { title: "Login" });
};

// Handle User login form on POST.
exports.user_login_post = (req, res, next) => {
  passport.authenticate("local", {
    successRedirect: "/",
    failureRedirect: "/users/login",
    failureFlash: true,
  })(req, res, next);
};

// Display User logout on GET.
exports.user_logout_get = (req, res) => {
  req.logout();
  req.flash("success", "You are logged out.");
  res.redirect("/users/login");
};

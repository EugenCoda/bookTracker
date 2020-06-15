var Booklist = require("../models/booklist");
var Author = require("../models/author");
var Genre = require("../models/genre");
const { body, validationResult } = require("express-validator");

//Create user booklist
exports.booklist_create_post = (req, res, next) => {
  // Check if booklist for this user already exists
  //TODO

  //If booklist does not exists, create it
  //TODO

  // Create a Booklist object.
  // var booklist = new Booklist({
  //   user: req.user._id,
  //   personal_list: [],
  // });
  // // Save booklist.
  // booklist.save(function (err) {
  //   if (err) {
  //     return next(err);
  //   }
  // });
  console.log(req.user._id);
  res.redirect("/");
};

// Display User booklist on GET.
exports.booklist_list = (req, res, next) => {
  res.render("booklist_list", { title: "My Books List" });
};

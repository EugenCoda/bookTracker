var express = require("express");
var router = express.Router();

// Require controller module.
var booklist_controller = require("../controllers/booklistController");

/// Book Lists Routes ///

// Get personal list of books
router.get("/mylist", ensureAuthenticated, booklist_controller.booklist_list);

// Add book to booklist
router.get(
  "/mylist/add",
  ensureAuthenticated,
  booklist_controller.booklist_create_post
);

//Access Control
function ensureAuthenticated(req, res, next) {
  if (req.isAuthenticated()) {
    return next();
  } else {
    req.flash("danger", "Please login");
    res.redirect("/users/login");
  }
}

module.exports = router;

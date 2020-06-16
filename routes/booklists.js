var express = require("express");
var router = express.Router();

// Require controller module.
var booklist_controller = require("../controllers/booklistController");

/// Book Lists Routes ///

// Get user list of books
router.get("/mylist", ensureAuthenticated, booklist_controller.booklist_list);

// Add book to user list of books on GET
router.get(
  "/addtolist/:id",
  ensureAuthenticated,
  booklist_controller.booklist_add_get
);

// Add book to user list of books on POST
router.post("/addtolist/:id", booklist_controller.booklist_add_post);

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

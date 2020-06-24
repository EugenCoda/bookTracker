var express = require("express");
var router = express.Router();

// Require controller module.
var booklist_controller = require("../controllers/booklistController");

/// Book Lists Routes ///

// Get user list of books
router.get("/mylist", ensureAuthenticated, booklist_controller.booklist_list);

// Add book to user list of books on GET
router.get(
  "/:id/addtolist",
  ensureAuthenticated,
  booklist_controller.booklist_add_get
);

// Add book to user list of books on POST
router.post("/:id/addtolist", booklist_controller.booklist_add_post);

// GET request to edit book from booklist.
router.get(
  "/:id/edit",
  ensureAuthenticated,
  booklist_controller.booklist_edit_get
);

// POST request to edit book from booklist.
router.post("/:id/edit", booklist_controller.booklist_edit_post);

// GET request to remove book from booklist.
router.get(
  "/:id/remove",
  ensureAuthenticated,
  booklist_controller.booklist_remove_get
);

// POST request to remove book from booklist.
router.post("/:id/remove", booklist_controller.booklist_remove_post);

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

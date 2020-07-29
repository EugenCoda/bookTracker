var express = require("express");
var router = express.Router();
const { ensureAuthenticated } = require("../middleware/auth");

// Require controller module.
var booklist_controller = require("../controllers/booklistController");

/// Book Lists Routes ///

// Get user list of books
router.get("/mylist", ensureAuthenticated, booklist_controller.booklist_list);

// Get user list of read books
router.get(
  "/mylist/read",
  ensureAuthenticated,
  booklist_controller.booklist_list_read
);

// Get user list of books in progress
router.get(
  "/mylist/in-progress",
  ensureAuthenticated,
  booklist_controller.booklist_list_inProgress
);

// Get user list of books on wishlist
router.get(
  "/mylist/wishlist",
  ensureAuthenticated,
  booklist_controller.booklist_list_wishlist
);

// View book from user list of books on GET
router.get(
  "/:id/view",
  ensureAuthenticated,
  booklist_controller.booklist_view_get
);

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

module.exports = router;

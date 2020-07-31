var express = require("express");
var router = express.Router();
const { ensureAdmin } = require("../middleware/auth");

// Require controller module.
var admin_controller = require("../controllers/adminController");

/// ADMIN ROUTES ///

// GET Dashboard
router.get("/", ensureAdmin, admin_controller.admin_dashboard_get);

// GET Pending Books
router.get("/books", ensureAdmin, admin_controller.admin_books_get);

// POST Approving Books
router.post("/books", ensureAdmin, admin_controller.admin_books_post);

// GET Pending Authors
router.get("/authors", ensureAdmin, admin_controller.admin_authors_get);

// POST Approving Authors
router.post("/authors", ensureAdmin, admin_controller.admin_authors_post);

// GET Pending Genres
router.get("/genres", ensureAdmin, admin_controller.admin_genres_get);

// POST Approving Genres
router.post("/genres", ensureAdmin, admin_controller.admin_genres_post);

// GET Pending Languages
router.get("/languages", ensureAdmin, admin_controller.admin_languages_get);

// POST Approving Languages
router.post("/languages", ensureAdmin, admin_controller.admin_languages_post);

// GET Pending Countries
router.get("/countries", ensureAdmin, admin_controller.admin_countries_get);

// POST Approving Countries
router.post("/countries", ensureAdmin, admin_controller.admin_countries_post);

// GET Pending Reviews
router.get("/reviews", ensureAdmin, admin_controller.admin_reviews_get);

// POST Approving Reviews
router.post("/reviews", ensureAdmin, admin_controller.admin_reviews_post);

module.exports = router;

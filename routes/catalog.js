var express = require("express");
var cors = require("cors");
var router = express.Router();
const { ensureAuthenticated } = require("../middleware/auth");

// Require controller modules.
var book_controller = require("../controllers/bookController");
var author_controller = require("../controllers/authorController");
var genre_controller = require("../controllers/genreController");
var language_controller = require("../controllers/languageController");
var country_controller = require("../controllers/countryController");

/// BOOK ROUTES ///

// GET catalog home page.
router.get("/", book_controller.index);

// GET request for creating a Book. NOTE This must come before routes that display Book (uses id).
router.get(
  "/book/create",
  ensureAuthenticated,
  book_controller.book_create_get
);

// POST request for creating Book.
router.post("/book/create", book_controller.book_create_post);

// GET request to delete Book.
router.get(
  "/book/:id/delete",
  ensureAuthenticated,
  book_controller.book_delete_get
);

// POST request to delete Book.
router.post("/book/:id/delete", book_controller.book_delete_post);

// GET request to update Book.
router.get(
  "/book/:id/update",
  ensureAuthenticated,
  book_controller.book_update_get
);

// POST request to update Book.
router.post("/book/:id/update", book_controller.book_update_post);

// GET request for one Book.
router.get("/book/:id", book_controller.book_detail);

// GET request for list of all Book items.
router.get("/books", book_controller.book_list);

/// AUTHOR ROUTES ///

// GET request for creating Author. NOTE This must come before route for id (i.e. display author).
router.get(
  "/author/create",
  ensureAuthenticated,
  author_controller.author_create_get
);

// POST request for creating Author.
router.post("/author/create", author_controller.author_create_post);

// GET request to delete Author.
router.get(
  "/author/:id/delete",
  ensureAuthenticated,
  author_controller.author_delete_get
);

// POST request to delete Author.
router.post("/author/:id/delete", author_controller.author_delete_post);

// GET request to update Author.
router.get(
  "/author/:id/update",
  ensureAuthenticated,
  author_controller.author_update_get
);

// POST request to update Author.
router.post("/author/:id/update", author_controller.author_update_post);

// GET request for one Author.
router.get("/author/:id", author_controller.author_detail);

// GET request for list of all Authors.
router.get("/authors", author_controller.author_list);

/// GENRE ROUTES ///

// GET request for creating a Genre. NOTE This must come before route that displays Genre (uses id).
router.get(
  "/genre/create",
  ensureAuthenticated,
  genre_controller.genre_create_get
);

//POST request for creating Genre.
router.post("/genre/create", genre_controller.genre_create_post);

// GET request to delete Genre.
router.get(
  "/genre/:id/delete",
  ensureAuthenticated,
  genre_controller.genre_delete_get
);

// POST request to delete Genre.
router.post("/genre/:id/delete", genre_controller.genre_delete_post);

// GET request to update Genre.
router.get(
  "/genre/:id/update",
  ensureAuthenticated,
  genre_controller.genre_update_get
);

// POST request to update Genre.
router.post("/genre/:id/update", genre_controller.genre_update_post);

// GET request for one Genre.
router.get("/genre/:id", genre_controller.genre_detail);

// GET request for list of all Genre.
router.get("/genres", genre_controller.genre_list);

/// LANGUAGE ROUTES ///

// GET request for creating a Language. NOTE This must come before route that displays Language (uses id).
router.get(
  "/language/create",
  ensureAuthenticated,
  language_controller.language_create_get
);

//POST request for creating Language.
router.post("/language/create", language_controller.language_create_post);

// GET request to delete Language.
router.get(
  "/language/:id/delete",
  ensureAuthenticated,
  language_controller.language_delete_get
);

// POST request to delete Language.
router.post("/language/:id/delete", language_controller.language_delete_post);

// GET request to update Language.
router.get(
  "/language/:id/update",
  ensureAuthenticated,
  language_controller.language_update_get
);

// POST request to update Language.
router.post("/language/:id/update", language_controller.language_update_post);

// GET request for one Language (show books available in this language).
router.get("/language/:id", language_controller.language_detail);

// GET request for one Language (show books written in this language).
router.get(
  "/originalLanguage/:id",
  language_controller.language_detail_original
);

// GET request for list of all Languages.
router.get("/languages", language_controller.language_list);

/// COUNTRY ROUTES ///

// GET request for creating a Country. NOTE This must come before route that displays Country (uses id).
router.get(
  "/country/create",
  ensureAuthenticated,
  country_controller.country_create_get
);

//POST request for creating Country.
router.post("/country/create", country_controller.country_create_post);

// GET request to delete Country.
router.get(
  "/country/:id/delete",
  ensureAuthenticated,
  country_controller.country_delete_get
);

// POST request to delete Country.
router.post("/country/:id/delete", country_controller.country_delete_post);

// GET request to update Country.
router.get(
  "/country/:id/update",
  ensureAuthenticated,
  country_controller.country_update_get
);

// POST request to update Country.
router.post("/country/:id/update", country_controller.country_update_post);

// GET request for one Country.
router.get("/country/:id", country_controller.country_detail);

// GET request for list of all Countries.
router.get("/countries", country_controller.country_list);

/// SEARCH ROUTES ///

// GET request for SEARCH.
router.get("/search", cors(), book_controller.search);

module.exports = router;

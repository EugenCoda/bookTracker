var Booklist = require("../models/booklist");
var Book = require("../models/book");
const { body, validationResult } = require("express-validator");

var async = require("async");

// Create User Booklist (right after user register)
exports.booklist_create = (req, res, next) => {
  var booklist = new Booklist({
    user: req.user._id,
    personal_list: [],
  });

  // Save booklist.
  booklist.save(function (err) {
    if (err) {
      return next(err);
    }
  });
};

// Display User booklist.
exports.booklist_list = (req, res, next) => {
  async.parallel(
    {
      booklist: function (callback) {
        Booklist.findOne({ user: req.user._id })
          .populate("user")
          .populate({
            path: "personal_list.book",
            populate: { path: "genre" },
            populate: { path: "author" },
          })
          .exec(callback);
      },
      booklist_count: function (callback) {
        Booklist.find({})
          .populate({ path: "personal_list.book" })
          .exec(callback);
      },
    },
    function (err, results) {
      if (err) {
        return next(err);
      }

      // Successful, so render.
      res.render("booklist_list", {
        title: "My Books",
        personal_list: results.booklist.personal_list,
        booklist_count: results.booklist_count,
      });
    }
  );
};

//Add book to user list of books on GET
exports.booklist_add_get = (req, res, next) => {
  // Get book and authors for form.
  async.parallel(
    {
      book: function (callback) {
        Book.findById(req.params.id).populate("author").exec(callback);
      },
      booklist: function (callback) {
        Booklist.findOne({ user: req.user._id })
          .populate("user")
          .populate({
            path: "personal_list.book",
            populate: { path: "genre" },
            populate: { path: "author" },
          })
          .exec(callback);
      },
    },
    function (err, results) {
      if (err) {
        return next(err);
      }
      if (results.book == null) {
        // No results.
        var err = new Error("Book not found");
        err.status = 404;
        return next(err);
      }

      // Loop through personal list and check if the book is already added
      // TODO: It gives a 500 error, tbc how to avoid this
      for (var i = 0; i < results.booklist.personal_list.length; i++) {
        if (results.booklist.personal_list[i].book._id == req.params.id) {
          req.flash("danger", "Book already added to your list");
          res.redirect("/catalog/books");
        }
      }
      // Success.
      res.render("booklist_form", {
        title: "Add Book to My List",
        book: results.book,
        personal_list: results.booklist.personal_list,
      });
    }
  );
};

//Add book to user list of books on POST
exports.booklist_add_post = [
  // Validate fields.
  body("status", "Status must not be empty.").trim().isLength({ min: 1 }),
  body("currentPage").trim().optional(),
  body("availability", "Availability must not be empty.")
    .trim()
    .isLength({ min: 1 }),
  body("date_started", "Invalid date")
    .optional({ checkFalsy: true })
    .isISO8601(),
  body("date_finished", "Invalid date")
    .optional({ checkFalsy: true })
    .isISO8601(),
  body("rating").trim().optional(),
  body("reviews").trim().optional(),

  // Sanitize fields (using wildcard).
  body("*").escape(),
  body("*").unescape(), //not sure if it is safe to do so
  body("date_started").toDate(),
  body("date_finished").toDate(),

  // Process request after validation and sanitization.
  (req, res, next) => {
    // Extract the validation errors from a request.
    const errors = validationResult(req);

    if (!errors.isEmpty()) {
      // There are errors. Render form again with sanitized values/error messages.
      async.parallel(
        {
          book: function (callback) {
            Book.findById(req.params.id).populate("author").exec(callback);
          },
          booklist: function (callback) {
            Booklist.findOne({ user: req.user._id })
              .populate("user")
              .populate({
                path: "personal_list.book",
                populate: { path: "genre" },
                populate: { path: "author" },
              })
              .exec(callback);
          },
        },
        function (err, results) {
          if (err) {
            return next(err);
          }
          if (results.book == null) {
            // No results.
            var err = new Error("Book not found");
            err.status = 404;
            return next(err);
          }

          // Loop through personal list and check if the book is already added
          // TODO: It gives a 500 error, tbc how to avoid this
          for (var i = 0; i < results.booklist.personal_list.length; i++) {
            if (results.booklist.personal_list[i].book._id == req.params.id) {
              req.flash("danger", "Book already added to your list");
              res.redirect("/catalog/books");
            }
          }
          // Success.
          res.render("booklist_form", {
            title: "Add Book to My List",
            book: results.book,
            personal_list: results.booklist.personal_list,
            errors: errors.array(),
          });
        }
      );
    } else {
      Booklist.findOneAndUpdate(
        { user: req.user._id },
        {
          $push: {
            personal_list: [
              {
                book: req.params.id,
                status: req.body.status,
                currentPage: req.body.currentPage,
                availability: req.body.availability,
                date_added: Date.now(),
                date_updated: Date.now(),
                date_started: req.body.date_started,
                date_finished: req.body.date_finished,
                rating: req.body.rating,
                reviews: req.body.reviews,
              },
            ],
          },
        },
        { new: true },
        (err, booklist) => {
          if (err) {
            return next(err);
          }
        }
      );

      res.redirect("/booklists/mylist");
    }
  },
];

// Handle Book edit from booklist on GET.
exports.booklist_edit_get = (req, res, next) => {
  async.parallel(
    {
      book: function (callback) {
        Book.findById(req.params.id).populate("author").exec(callback);
      },
      booklist: function (callback) {
        Booklist.findOne({ user: req.user._id })
          .populate("user")
          .populate({
            path: "personal_list.book",
            populate: { path: "genre" },
            populate: { path: "author" },
          })
          .exec(callback);
      },
    },
    function (err, results) {
      if (err) {
        return next(err);
      }
      if (results.book == null) {
        // No results.
        res.redirect("/booklists/mylist");
      }
      // Successful, so render.
      res.render("booklist_form", {
        title: "Edit Book Entry",
        book: results.book,
        personal_list: results.booklist.personal_list,
      });
    }
  );
};

// Handle Book edit from booklist on POST
exports.booklist_edit_post = [
  // Validate fields.
  body("status", "Status must not be empty.").trim().isLength({ min: 1 }),
  body("currentPage").trim().optional(),
  body("availability", "Availability must not be empty.")
    .trim()
    .isLength({ min: 1 }),
  body("date_started", "Invalid date")
    .optional({ checkFalsy: true })
    .isISO8601(),
  body("date_finished", "Invalid date")
    .optional({ checkFalsy: true })
    .isISO8601(),
  body("rating").trim().optional(),
  body("reviews").trim().optional(),

  // Sanitize fields (using wildcard).
  body("*").escape(),
  body("*").unescape(), //not sure if it is safe to do so
  body("date_started").toDate(),
  body("date_finished").toDate(),

  // Process request after validation and sanitization.
  (req, res, next) => {
    // Extract the validation errors from a request.
    const errors = validationResult(req);

    if (!errors.isEmpty()) {
      // There are errors. Render form again with sanitized values/error messages.
      async.parallel(
        {
          book: function (callback) {
            Book.findById(req.params.id).populate("author").exec(callback);
          },
          booklist: function (callback) {
            Booklist.findOne({ user: req.user._id })
              .populate("user")
              .populate({
                path: "personal_list.book",
                populate: { path: "genre" },
                populate: { path: "author" },
              })
              .exec(callback);
          },
        },
        function (err, results) {
          if (err) {
            return next(err);
          }
          if (results.book == null) {
            // No results.
            res.redirect("/booklists/mylist");
          }
          // Successful, so render.
          res.render("booklist_form", {
            title: "Edit Book Entry",
            book: results.book,
            personal_list: results.booklist.personal_list,
            errors: errors.array(),
          });
        }
      );
    } else {
      Booklist.findOneAndUpdate(
        { user: req.user._id, "personal_list.book": req.params.id },
        {
          $set: {
            "personal_list.$": [
              {
                book: req.params.id,
                status: req.body.status,
                currentPage: req.body.currentPage,
                availability: req.body.availability,
                date_added: Date.now(),
                date_updated: Date.now(),
                date_started: req.body.date_started,
                date_finished: req.body.date_finished,
                rating: req.body.rating,
                reviews: req.body.reviews,
              },
            ],
          },
        },
        { new: true },
        (err, booklist) => {
          if (err) {
            return next(err);
          }
        }
      );
      res.redirect("/booklists/mylist");
    }
  },
];

// Handle Book remove from booklist on GET.
exports.booklist_remove_get = (req, res, next) => {
  async.parallel(
    {
      book: function (callback) {
        Book.findById(req.params.id).populate("author").exec(callback);
      },
    },
    function (err, results) {
      if (err) {
        return next(err);
      }
      if (results.book == null) {
        // No results.
        res.redirect("/booklists/mylist");
      }
      // Successful, so render.
      res.render("booklist_remove", {
        title: "Remove Book from List",
        book: results.book,
      });
    }
  );
};

// Handle Book remove from booklist on POST
exports.booklist_remove_post = (req, res, next) => {
  Booklist.updateOne(
    { user: req.user._id, "personal_list.book": req.params.id },
    {
      $pull: {
        personal_list: {
          book: req.params.id,
        },
      },
    },
    { safe: true, multi: true },
    (err, booklist) => {
      if (err) {
        return next(err);
      }
    }
  );
  res.redirect("/booklists/mylist");
};

var Booklist = require("../models/booklist");
var Book = require("../models/book");
var Review = require("../models/review");
const { body, validationResult } = require("express-validator");

var async = require("async");

// Display User booklist.
exports.booklist_list = (req, res, next) => {
  const pagination = req.query.pagination ? parseInt(req.query.pagination) : 10;
  const page = req.query.page ? parseInt(req.query.page) : 1;
  async.parallel(
    {
      booklist: (callback) => {
        Booklist.findOne({ user: req.user._id })
          .populate("user")
          .populate({
            path: "personal_list.book",
            populate: { path: "genre" },
            populate: { path: "author" },
          })
          .exec(callback);
      },
      userReview_all: (callback) => {
        Review.find({}).populate("book").exec(callback);
      },
      userReview_user: (callback) => {
        Review.find({ user: req.user._id }).populate("book").exec(callback);
      },
    },
    (err, results) => {
      if (err) {
        return next(err);
      }

      // Successful, so render.
      res.render("booklist_list", {
        title: "My Books",
        page: page,
        pagination: pagination,
        personal_list: results.booklist.personal_list,
        userReview_all: results.userReview_all,
        userReview_user: results.userReview_user,
      });
    }
  );
};

// Display User booklist of read books.
exports.booklist_list_read = (req, res, next) => {
  const pagination = req.query.pagination ? parseInt(req.query.pagination) : 10;
  const page = req.query.page ? parseInt(req.query.page) : 1;
  async.parallel(
    {
      booklist: (callback) => {
        Booklist.findOne({ user: req.user._id })
          .populate("user")
          .populate({
            path: "personal_list.book",
            populate: { path: "genre" },
            populate: { path: "author" },
          })
          .exec(callback);
      },
      userReview_all: (callback) => {
        Review.find({}).populate("book").exec(callback);
      },
      userReview_user: (callback) => {
        Review.find({ user: req.user._id }).populate("book").exec(callback);
      },
    },
    (err, results) => {
      if (err) {
        return next(err);
      }

      // Successful, so render.
      res.render("booklist_list_read", {
        title: "My Books",
        page: page,
        pagination: pagination,
        personal_list: results.booklist.personal_list,
        userReview_all: results.userReview_all,
        userReview_user: results.userReview_user,
      });
    }
  );
};

// Display User booklist in progress.
exports.booklist_list_inProgress = (req, res, next) => {
  const pagination = req.query.pagination ? parseInt(req.query.pagination) : 10;
  const page = req.query.page ? parseInt(req.query.page) : 1;
  async.parallel(
    {
      booklist: (callback) => {
        Booklist.findOne({ user: req.user._id })
          .populate("user")
          .populate({
            path: "personal_list.book",
            populate: { path: "genre" },
            populate: { path: "author" },
          })
          .exec(callback);
      },
      userReview_all: (callback) => {
        Review.find({}).populate("book").exec(callback);
      },
      userReview_user: (callback) => {
        Review.find({ user: req.user._id }).populate("book").exec(callback);
      },
    },
    (err, results) => {
      if (err) {
        return next(err);
      }

      // Successful, so render.
      res.render("booklist_list_inProgress", {
        title: "My Books",
        page: page,
        pagination: pagination,
        personal_list: results.booklist.personal_list,
        userReview_all: results.userReview_all,
        userReview_user: results.userReview_user,
      });
    }
  );
};

// Display User booklist on wishlist.
exports.booklist_list_wishlist = (req, res, next) => {
  const pagination = req.query.pagination ? parseInt(req.query.pagination) : 10;
  const page = req.query.page ? parseInt(req.query.page) : 1;
  async.parallel(
    {
      booklist: (callback) => {
        Booklist.findOne({ user: req.user._id })
          .populate("user")
          .populate({
            path: "personal_list.book",
            populate: { path: "genre" },
            populate: { path: "author" },
          })
          .exec(callback);
      },
      userReview_all: (callback) => {
        Review.find({}).populate("book").exec(callback);
      },
      userReview_user: (callback) => {
        Review.find({ user: req.user._id }).populate("book").exec(callback);
      },
    },
    (err, results) => {
      if (err) {
        return next(err);
      }

      // Successful, so render.
      res.render("booklist_list_wishlist", {
        title: "My Books",
        page: page,
        pagination: pagination,
        personal_list: results.booklist.personal_list,
        userReview_all: results.userReview_all,
        userReview_user: results.userReview_user,
      });
    }
  );
};

// Display one book from User booklist.
exports.booklist_view_get = (req, res, next) => {
  async.parallel(
    {
      book: (callback) => {
        Book.findById(req.params.id).populate("author").exec(callback);
      },
      booklist: (callback) => {
        Booklist.findOne({ user: req.user._id })
          .populate("user")
          .populate({
            path: "personal_list.book",
            populate: { path: "genre" },
            populate: { path: "author" },
          })
          .exec(callback);
      },
      userReview: (callback) => {
        Review.findOne({ user: req.user._id, book: req.params.id })
          .populate("book")
          .exec(callback);
      },
    },
    (err, results) => {
      if (err) {
        return next(err);
      }

      // Successful, so render.
      res.render("booklist_detail", {
        title: "View Book Entry",
        book: results.book,
        personal_list: results.booklist.personal_list,
        userReview: results.userReview,
      });
    }
  );
};

//Add book to user list of books on GET
exports.booklist_add_get = (req, res, next) => {
  // Get book and authors for form.
  async.parallel(
    {
      book: (callback) => {
        Book.findById(req.params.id).populate("author").exec(callback);
      },
      booklist: (callback) => {
        Booklist.findOne({ user: req.user._id })
          .populate("user")
          .populate({
            path: "personal_list.book",
            populate: { path: "genre" },
            populate: { path: "author" },
          })
          .exec(callback);
      },
      userReview: (callback) => {
        Review.findOne({ user: req.user._id, book: req.params.id })
          .populate("book")
          .exec(callback);
      },
    },
    (err, results) => {
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
      for (let i = 0; i < results.booklist.personal_list.length; i++) {
        if (results.booklist.personal_list[i].book._id == req.params.id) {
          req.flash("danger", "Book already added to your list");
          res.redirect("/catalog/books");
          return;
        }
      }
      // Success.
      res.render("booklist_form", {
        title: "Add Book to My List",
        book: results.book,
        personal_list: results.booklist.personal_list,
        userReview: results.userReview,
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
  body("review").trim().optional(),

  // Sanitize fields (using wildcard).
  body("*").escape(),
  body("*").unescape(), //not sure if it is safe to do so
  body("date_started").toDate(),
  body("date_finished").toDate(),

  // Process request after validation and sanitization.
  (req, res, next) => {
    // Extract the validation errors from a request.
    const errors = validationResult(req);
    // If Review object exists, update it with escaped/trimmed data and old id.
    if (req.body.reviewId) {
      var userReview = new Review({
        review: req.body.review,
        rating: req.body.rating,
        isVerified: false,
        user: req.user,
        book: req.params.id,
        _id: req.body.reviewId, //This is required, or a new ID will be assigned!
      });
    } else {
      // If Review object doesn't exist, create it with escaped/trimmed data.
      var userReview = new Review({
        review: req.body.review,
        rating: req.body.rating,
        user: req.user,
        book: req.params.id,
      });
    }

    if (!errors.isEmpty()) {
      // There are errors. Render form again with sanitized values/error messages.
      async.parallel(
        {
          book: (callback) => {
            Book.findById(req.params.id).populate("author").exec(callback);
          },
          booklist: (callback) => {
            Booklist.findOne({ user: req.user._id })
              .populate("user")
              .populate({
                path: "personal_list.book",
                populate: { path: "genre" },
                populate: { path: "author" },
              })
              .exec(callback);
          },
          userReview: (callback) => {
            Review.findOne({ user: req.user._id, book: req.params.id })
              .populate("book")
              .exec(callback);
          },
        },
        (err, results) => {
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
          for (let i = 0; i < results.booklist.personal_list.length; i++) {
            if (results.booklist.personal_list[i].book._id == req.params.id) {
              req.flash("danger", "Book already added to your list");
              res.redirect("/catalog/books");
              return;
            }
          }
          // Success.
          res.render("booklist_form", {
            title: "Add Book to My List",
            book: results.book,
            personal_list: results.booklist.personal_list,
            userReview: results.userReview,
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

      // Data from form is valid. Update the existing Review object.
      if (req.body.reviewId) {
        Review.findOneAndUpdate(
          { user: req.user._id, book: req.params.id },
          userReview,
          (err, review) => {
            if (err) {
              return next(err);
            }
          }
        );
        res.redirect("/booklists/mylist");
      } else {
        // Data from form is valid. Save the new Review object.
        userReview.save((err) => {
          if (err) {
            return next(err);
          }
        });
        res.redirect("/booklists/mylist");
      }
    }
  },
];

// Handle Book edit from booklist on GET.
exports.booklist_edit_get = (req, res, next) => {
  async.parallel(
    {
      book: (callback) => {
        Book.findById(req.params.id).populate("author").exec(callback);
      },
      booklist: (callback) => {
        Booklist.findOne({ user: req.user._id })
          .populate("user")
          .populate({
            path: "personal_list.book",
            populate: { path: "genre" },
            populate: { path: "author" },
          })
          .exec(callback);
      },
      userReview: (callback) => {
        Review.findOne({ user: req.user._id, book: req.params.id })
          .populate("book")
          .exec(callback);
      },
    },
    (err, results) => {
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
        userReview: results.userReview,
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
  body("review").trim().optional(),

  // Sanitize fields (using wildcard).
  body("*").escape(),
  body("*").unescape(), //not sure if it is safe to do so
  body("date_started").toDate(),
  body("date_finished").toDate(),

  // Process request after validation and sanitization.
  (req, res, next) => {
    // Extract the validation errors from a request.
    const errors = validationResult(req);
    // If Review object exists, update it with escaped/trimmed data and old id.
    if (req.body.reviewId) {
      var userReview = new Review({
        review: req.body.review,
        rating: req.body.rating,
        user: req.user,
        book: req.params.id,
        _id: req.body.reviewId, //This is required, or a new ID will be assigned!
      });
    } else {
      // If Review object doesn't exist, create it with escaped/trimmed data.
      var userReview = new Review({
        review: req.body.review,
        rating: req.body.rating,
        user: req.user,
        book: req.params.id,
      });
    }

    if (!errors.isEmpty()) {
      // There are errors. Render form again with sanitized values/error messages.
      async.parallel(
        {
          book: (callback) => {
            Book.findById(req.params.id).populate("author").exec(callback);
          },
          booklist: (callback) => {
            Booklist.findOne({ user: req.user._id })
              .populate("user")
              .populate({
                path: "personal_list.book",
                populate: { path: "genre" },
                populate: { path: "author" },
              })
              .exec(callback);
          },
          userReview: (callback) => {
            Review.findOne({ user: req.user._id, book: req.params.id })
              .populate("book")
              .exec(callback);
          },
        },
        (err, results) => {
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
            userReview: results.userReview,
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
      // Data from form is valid. Update the existing Review object.
      if (req.body.reviewId) {
        Review.findOneAndUpdate(
          { user: req.user._id, book: req.params.id },
          userReview,
          (err, review) => {
            if (err) {
              return next(err);
            }
          }
        );
      } else {
        // Data from form is valid. Save the new Review object.
        userReview.save((err) => {
          if (err) {
            return next(err);
          }
        });
      }

      res.redirect("/booklists/mylist");
    }
  },
];

// Handle Book remove from booklist on GET.
exports.booklist_remove_get = (req, res, next) => {
  async.parallel(
    {
      book: (callback) => {
        Book.findById(req.params.id).populate("author").exec(callback);
      },
    },
    (err, results) => {
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

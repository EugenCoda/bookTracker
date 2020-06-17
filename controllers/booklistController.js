var Booklist = require("../models/booklist");
var Book = require("../models/book");
var Author = require("../models/author");
var Genre = require("../models/genre");
const { body, validationResult } = require("express-validator");

var async = require("async");
const { populate } = require("../models/booklist");

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
    },
    function (err, results) {
      if (err) {
        return next(err);
      }

      // Successful, so render.
      res.render("booklist_list", {
        title: "My Books List",
        personal_list: results.booklist.personal_list,
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
      authors: function (callback) {
        Author.find(callback);
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
      // Success.
      res.render("booklist_form", {
        title: "Add Book to My List",
        authors: results.authors,
        book: results.book,
      });
    }
  );
};

//Add book to user list of books on POST
exports.booklist_add_post = (req, res, next) => {
  Booklist.findOneAndUpdate(
    { user: req.user._id },
    {
      $push: {
        personal_list: [{ book: req.params.id }],
      },
    },
    { new: true },
    (err, booklist) => {
      if (err) {
        return next(err);
      }
    }
  );
  res.redirect("/catalog/books");
};

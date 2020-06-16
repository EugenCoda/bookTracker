var Booklist = require("../models/booklist");
var Book = require("../models/book");
var Author = require("../models/author");
var Genre = require("../models/genre");
const { body, validationResult } = require("express-validator");

var async = require("async");

// Display User booklist.
exports.booklist_list = (req, res, next) => {
  async.parallel(
    {
      booklist: function (callback) {
        Booklist.findOne({ user: req.user._id })
          .populate("user")
          .populate("personal_list")
          .exec(callback);
      },
    },
    function (err, results) {
      if (err) {
        return next(err);
      }
      if (results.booklist == null) {
        //If booklist does not exists, create it

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
      }
      // Successful, so render.
      res.render("booklist_list", {
        title: "My Books List",
        results: results.booklist,
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
      console.log("User found:" + req.user._id);
      console.log(booklist);
    }
  );
  res.redirect("/catalog/books");
};

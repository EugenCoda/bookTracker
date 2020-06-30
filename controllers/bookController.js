var Book = require("../models/book");
var Language = require("../models/language");
var Country = require("../models/country");
var Booklist = require("../models/booklist");
var Author = require("../models/author");
var Genre = require("../models/genre");
const { body, validationResult } = require("express-validator");

var async = require("async");

exports.index = function (req, res) {
  async.parallel(
    {
      book_count: function (callback) {
        Book.countDocuments({}, callback); // Pass an empty object as match condition to find all documents of this collection
      },
      author_count: function (callback) {
        Author.countDocuments({}, callback);
      },
      genre_count: function (callback) {
        Genre.countDocuments({}, callback);
      },
      language_count: function (callback) {
        Language.countDocuments({}, callback);
      },
      country_count: function (callback) {
        Country.countDocuments({}, callback);
      },
    },
    function (err, results) {
      res.render("index", {
        title: "Book Tracker",
        error: err,
        data: results,
      });
    }
  );
};

// Display list of all Books.
exports.book_list = (req, res, next) => {
  //User is logged in, so we're able to search in the booklist
  if (req.user) {
    async.parallel(
      {
        book: function (callback) {
          Book.find({}, "title author").populate("author").exec(callback);
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
        //Successful, so render
        res.render("book_list", {
          title: "Book List",
          book_list: results.book,
          personal_list: results.booklist.personal_list,
        });
      }
    );
  } else {
    //User is not logged in, so we go through the standard path
    async.parallel(
      {
        book: function (callback) {
          Book.find({}, "title author").populate("author").exec(callback);
        },
      },
      function (err, results) {
        if (err) {
          return next(err);
        }
        //Successful, so render
        res.render("book_list", {
          title: "Book List",
          book_list: results.book,
        });
      }
    );
  }
};

// Display detail page for a specific book.
exports.book_detail = function (req, res, next) {
  //User is logged in, so we're able to search in the booklist
  if (req.user) {
    async.parallel(
      {
        book: function (callback) {
          Book.findById(req.params.id)
            .populate("author")
            .populate("genre")
            .populate("language")
            .populate("originalLanguage")
            .exec(callback);
        },
        booklist: function (callback) {
          Booklist.findOne({
            "personal_list.book": req.params.id,
            user: req.user._id,
          })
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

        // Successful, so render.
        res.render("book_detail", {
          title: results.book.title,
          book: results.book,
          booklist: results.booklist,
        });
      }
    );
  } else {
    //User is not logged in, so we go through the standard path
    async.parallel(
      {
        book: function (callback) {
          Book.findById(req.params.id)
            .populate("author")
            .populate("genre")
            .populate("language")
            .populate("originalLanguage")
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
        // Successful, so render.
        res.render("book_detail", {
          title: results.book.title,
          book: results.book,
        });
      }
    );
  }
};

// Display book create form on GET.
exports.book_create_get = function (req, res, next) {
  // Get all authors and genres, which we can use for adding to our book.
  async.parallel(
    {
      authors: function (callback) {
        Author.find(callback);
      },
      genres: function (callback) {
        Genre.find(callback);
      },
      languages: function (callback) {
        Language.find(callback);
      },
    },
    function (err, results) {
      if (err) {
        return next(err);
      }
      res.render("book_form", {
        title: "Create Book",
        authors: results.authors,
        genres: results.genres,
        languages: results.languages,
      });
    }
  );
};

// Handle book create on POST.
exports.book_create_post = [
  // Convert the genre to an array.
  (req, res, next) => {
    if (!(req.body.genre instanceof Array)) {
      if (typeof req.body.genre === "undefined") req.body.genre = [];
      else req.body.genre = new Array(req.body.genre);
    }
    next();
  },

  // Validate fields.
  body("title", "Title must not be empty.").trim().isLength({ min: 1 }),
  body("originalTitle").trim().optional(),
  body("author", "Author must not be empty.").trim().isLength({ min: 1 }),
  body("summary", "Summary must not be empty.").trim().isLength({ min: 1 }),
  body("isbn", "ISBN must not be empty").trim().isLength({ min: 1 }),
  body("language", "Language must not be empty.").trim().isLength({ min: 1 }),
  body("originalLanguage").trim().optional(),
  body("pages").trim().optional(),
  body("rating").trim().optional(),
  body("reviews").trim().optional(),

  // Sanitize fields (using wildcard).
  body("*").escape(),

  // Process request after validation and sanitization.
  (req, res, next) => {
    // Extract the validation errors from a request.
    const errors = validationResult(req);

    // Create a Book object with escaped and trimmed data.
    var book = new Book({
      title: req.body.title,
      originalTitle: req.body.originalTitle,
      author: req.body.author,
      summary: req.body.summary,
      isbn: req.body.isbn,
      genre: req.body.genre,
      language: req.body.language,
      originalLanguage: req.body.originalLanguage,
      pages: req.body.pages,
      rating: req.body.rating,
      reviews: req.body.reviews,
    });

    if (!errors.isEmpty()) {
      // There are errors. Render form again with sanitized values/error messages.

      // Get all authors and genres for form.
      async.parallel(
        {
          authors: function (callback) {
            Author.find(callback);
          },
          genres: function (callback) {
            Genre.find(callback);
          },
          languages: function (callback) {
            Language.find(callback);
          },
        },
        function (err, results) {
          if (err) {
            return next(err);
          }

          // Mark our selected genres as checked.
          for (let i = 0; i < results.genres.length; i++) {
            if (book.genre.indexOf(results.genres[i]._id) > -1) {
              results.genres[i].checked = "true";
            }
          }
          res.render("book_form", {
            title: "Create Book",
            authors: results.authors,
            genres: results.genres,
            languages: results.languages,
            book: book,
            errors: errors.array(),
          });
        }
      );
      return;
    } else {
      // Data from form is valid. Save book.
      book.save(function (err) {
        if (err) {
          return next(err);
        }
        //successful - redirect to new book record.
        res.redirect(book.url);
      });
    }
  },
];

// Display book delete form on GET.
exports.book_delete_get = (req, res, next) => {
  async.parallel(
    {
      book: function (callback) {
        Book.findById(req.params.id).exec(callback);
      },
      booklist: function (callback) {
        Booklist.find({ "personal_list.book": req.params.id })
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
        res.redirect("/catalog/books");
      }
      // Successful, so render.
      res.render("book_delete", {
        title: "Delete Book",
        book: results.book,
        booklist: results.booklist,
      });
    }
  );
};

// Handle book delete on POST.
exports.book_delete_post = function (req, res, next) {
  async.parallel(
    {
      book: function (callback) {
        Book.findById(req.body.bookid).exec(callback);
      },
      booklist: function (callback) {
        Booklist.find({})
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
      // Success

      //Checking if the book has booklist instances
      if (results.booklist.personal_list) {
        // Book has booklist instances. Render in same way as for GET route.
        res.render("book_delete", {
          title: "Delete Book",
          book: results.book,
          booklist: results.booklist,
        });
        return;
      } else {
        //Delete object and redirect to the list of books.
        Book.findByIdAndRemove(req.body.bookid, function deleteBook(err) {
          if (err) {
            return next(err);
          }
          // Success - go to book list
          res.redirect("/catalog/books");
        });
      }
    }
  );
};

// Display book update form on GET.
exports.book_update_get = function (req, res, next) {
  // Get book, authors and genres for form.
  async.parallel(
    {
      book: function (callback) {
        Book.findById(req.params.id)
          .populate("author")
          .populate("genre")
          .populate("language")
          .exec(callback);
      },
      authors: function (callback) {
        Author.find(callback);
      },
      genres: function (callback) {
        Genre.find(callback);
      },
      languages: function (callback) {
        Language.find(callback);
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
      // Mark our selected genres as checked.
      for (
        var all_g_iter = 0;
        all_g_iter < results.genres.length;
        all_g_iter++
      ) {
        for (
          var book_g_iter = 0;
          book_g_iter < results.book.genre.length;
          book_g_iter++
        ) {
          if (
            results.genres[all_g_iter]._id.toString() ==
            results.book.genre[book_g_iter]._id.toString()
          ) {
            results.genres[all_g_iter].checked = "true";
          }
        }
      }
      res.render("book_form", {
        title: "Update Book",
        authors: results.authors,
        genres: results.genres,
        languages: results.languages,
        book: results.book,
      });
    }
  );
};

// Handle book update on POST.
exports.book_update_post = [
  // Convert the genre to an array
  (req, res, next) => {
    if (!(req.body.genre instanceof Array)) {
      if (typeof req.body.genre === "undefined") req.body.genre = [];
      else req.body.genre = new Array(req.body.genre);
    }
    next();
  },

  // Validate fields.
  body("title", "Title must not be empty.").trim().isLength({ min: 1 }),
  body("originalTitle").trim().optional(),
  body("author", "Author must not be empty.").trim().isLength({ min: 1 }),
  body("summary", "Summary must not be empty.").trim().isLength({ min: 1 }),
  body("isbn", "ISBN must not be empty").trim().isLength({ min: 1 }),
  body("language", "Language must not be empty.").trim().isLength({ min: 1 }),
  body("originalLanguage").trim().optional(),
  body("pages").trim().optional(),
  body("rating").trim().optional(),
  body("reviews").trim().optional(),

  // Sanitize fields.
  body("*").escape(),

  // Process request after validation and sanitization.
  (req, res, next) => {
    // Extract the validation errors from a request.
    const errors = validationResult(req);

    // Create a Book object with escaped/trimmed data and old id.
    var book = new Book({
      title: req.body.title,
      originalTitle: req.body.originalTitle,
      author: req.body.author,
      summary: req.body.summary,
      isbn: req.body.isbn,
      genre: typeof req.body.genre === "undefined" ? [] : req.body.genre,
      language: req.body.language,
      originalLanguage: req.body.originalLanguage,
      pages: req.body.pages,
      rating: req.body.rating,
      reviews: req.body.reviews,
      _id: req.params.id, //This is required, or a new ID will be assigned!
    });

    if (!errors.isEmpty()) {
      // There are errors. Render form again with sanitized values/error messages.

      // Get all authors and genres for form.
      async.parallel(
        {
          authors: function (callback) {
            Author.find(callback);
          },
          genres: function (callback) {
            Genre.find(callback);
          },
          language: function (callback) {
            Language.find(callback);
          },
        },
        function (err, results) {
          if (err) {
            return next(err);
          }

          // Mark our selected genres as checked.
          for (let i = 0; i < results.genres.length; i++) {
            if (book.genre.indexOf(results.genres[i]._id) > -1) {
              results.genres[i].checked = "true";
            }
          }
          res.render("book_form", {
            title: "Update Book",
            authors: results.authors,
            genres: results.genres,
            languages: results.languages,
            book: book,
            errors: errors.array(),
          });
        }
      );
      return;
    } else {
      // Data from form is valid. Update the record.
      Book.findByIdAndUpdate(req.params.id, book, {}, function (err, thebook) {
        if (err) {
          return next(err);
        }
        // Successful - redirect to book detail page.
        res.redirect(thebook.url);
      });
    }
  },
];

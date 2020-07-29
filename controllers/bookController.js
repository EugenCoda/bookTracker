var Book = require("../models/book");
var Language = require("../models/language");
var Country = require("../models/country");
var Booklist = require("../models/booklist");
var Author = require("../models/author");
var Genre = require("../models/genre");
var Review = require("../models/review");
const { body, validationResult } = require("express-validator");
var async = require("async");

// Display statistics on main page
exports.index = (req, res) => {
  async.parallel(
    {
      book_count: (callback) => {
        Book.countDocuments({}, callback); // Pass an empty object as match condition to find all documents of this collection
      },
      author_count: (callback) => {
        Author.countDocuments({}, callback);
      },
      genre_count: (callback) => {
        Genre.countDocuments({}, callback);
      },
      language_count: (callback) => {
        Language.countDocuments({}, callback);
      },
      country_count: (callback) => {
        Country.countDocuments({}, callback);
      },
    },
    (err, results) => {
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
  const pagination = req.query.pagination ? parseInt(req.query.pagination) : 10;
  const page = req.query.page ? parseInt(req.query.page) : 1;
  //User is logged in, so we're able to search in the booklist
  if (req.user) {
    async.parallel(
      {
        book: (callback) => {
          Book.find({}, "title author yearFirstPublished")
            .skip((page - 1) * pagination)
            .limit(pagination)
            .sort("title")
            .populate("author")
            .exec(callback);
        },
        book_count: (callback) => {
          Book.countDocuments({}, callback);
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
        userReview_all: (callback) => {
          Review.find({}).populate("book").exec(callback);
        },
      },
      (err, results) => {
        if (err) {
          return next(err);
        }

        //Successful, so render
        res.render("book_list", {
          title: "Book List",
          page: page,
          pagination: pagination,
          book_list: results.book,
          book_count: results.book_count,
          personal_list: results.booklist.personal_list,
          userReview_all: results.userReview_all,
        });
      }
    );
  } else {
    //User is not logged in, so we go through the standard path
    async.parallel(
      {
        book: (callback) => {
          Book.find({}, "title author yearFirstPublished")
            .skip((page - 1) * pagination)
            .limit(pagination)
            .sort("title")
            .populate("author")
            .exec(callback);
        },
        book_count: (callback) => {
          Book.countDocuments({}, callback);
        },
        userReview_all: (callback) => {
          Review.find({}).populate("book").exec(callback);
        },
      },
      (err, results) => {
        if (err) {
          return next(err);
        }

        //Successful, so render
        res.render("book_list", {
          title: "Book List",
          page: page,
          pagination: pagination,
          book_list: results.book,
          book_count: results.book_count,
          userReview_all: results.userReview_all,
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
        book: (callback) => {
          Book.findById(req.params.id)
            .populate("author")
            .populate("author2")
            .populate("genre")
            .populate("language")
            .populate("originalLanguage")
            .exec(callback);
        },
        booklist: (callback) => {
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
        userReview_all: (callback) => {
          Review.find({}).populate("book").exec(callback);
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

        // Successful, so render.
        res.render("book_detail", {
          title: results.book.title,
          book: results.book,
          booklist: results.booklist,
          userReview_all: results.userReview_all,
        });
      }
    );
  } else {
    //User is not logged in, so we go through the standard path
    async.parallel(
      {
        book: (callback) => {
          Book.findById(req.params.id)
            .populate("author")
            .populate("author2")
            .populate("genre")
            .populate("language")
            .populate("originalLanguage")
            .exec(callback);
        },
        userReview_all: (callback) => {
          Review.find({}).populate("book").exec(callback);
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
        // Successful, so render.
        res.render("book_detail", {
          title: results.book.title,
          book: results.book,
          userReview_all: results.userReview_all,
        });
      }
    );
  }
};

// Display book create form on GET.
exports.book_create_get = (req, res, next) => {
  // Get all authors and genres, which we can use for adding to our book.
  async.parallel(
    {
      authors: (callback) => {
        Author.find(callback);
      },
      genres: (callback) => {
        Genre.find(callback);
      },
      languages: (callback) => {
        Language.find(callback);
      },
    },
    (err, results) => {
      if (err) {
        return next(err);
      }
      res.render("book_form", {
        title: "Add Book",
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
  body("author2").trim().optional(),
  body("summary", "Summary must not be empty.").trim().isLength({ min: 1 }),
  body("isbn", "ISBN must not be empty").trim().isLength({ min: 1 }),
  body("language", "Language must not be empty.").trim().isLength({ min: 1 }),
  body("originalLanguage").trim().optional(),
  body("pages").trim().optional(),
  body("yearFirstPublished").trim().optional(),

  // Sanitize fields (no wildcard used, it seems to affect genre array).
  body("title").escape(),
  body("originalTitle").escape(),
  body("author").escape(),
  body("author2").escape(),
  body("summary").escape(),
  body("isbn").escape(),
  body("language").escape(),
  body("originalLanguage").escape(),
  body("pages").escape(),
  body("yearFirstPublished").escape(),
  body("genre.*").escape(), // for the values within genre array

  //not sure if unescape is safe to apply like this
  body("title").unescape(),
  body("originalTitle").unescape(),
  body("author").unescape(),
  body("author2").unescape(),
  body("summary").unescape(),
  body("isbn").unescape(),
  body("language").unescape(),
  body("originalLanguage").unescape(),
  body("pages").unescape(),
  body("yearFirstPublished").unescape(),

  // Process request after validation and sanitization.
  (req, res, next) => {
    // Extract the validation errors from a request.
    const errors = validationResult(req);
    // Create a Book object with escaped and trimmed data.
    var book = new Book({
      title: req.body.title,
      originalTitle: req.body.originalTitle,
      author: req.body.author,
      author2: req.body.author2,
      summary: req.body.summary,
      isbn: req.body.isbn,
      genre: req.body.genre,
      language: req.body.language,
      originalLanguage: req.body.originalLanguage,
      pages: req.body.pages,
      yearFirstPublished: req.body.yearFirstPublished,
      createdBy: req.user,
      updatedBy: req.user,
    });

    if (!errors.isEmpty()) {
      // There are errors. Render form again with sanitized values/error messages.

      // Get all authors and genres for form.
      async.parallel(
        {
          authors: (callback) => {
            Author.find(callback);
          },
          genres: (callback) => {
            Genre.find(callback);
          },
          languages: (callback) => {
            Language.find(callback);
          },
        },
        (err, results) => {
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
            title: "Add Book",
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
      book.save((err) => {
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
      book: (callback) => {
        Book.findById(req.params.id).exec(callback);
      },
      booklist: (callback) => {
        Booklist.find({ "personal_list.book": req.params.id })
          .populate({
            path: "personal_list.book",
            populate: { path: "genre" },
            populate: { path: "author" },
          })
          .exec(callback);
      },
    },
    (err, results) => {
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
exports.book_delete_post = (req, res, next) => {
  async.parallel(
    {
      book: (callback) => {
        Book.findById(req.body.bookid).exec(callback);
      },
      booklist: (callback) => {
        Booklist.find({})
          .populate({
            path: "personal_list.book",
            populate: { path: "genre" },
            populate: { path: "author" },
          })
          .exec(callback);
      },
    },
    (err, results) => {
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
exports.book_update_get = (req, res, next) => {
  // Get book, authors and genres for form.
  async.parallel(
    {
      book: (callback) => {
        Book.findById(req.params.id)
          .populate("author")
          .populate("genre")
          .populate("language")
          .populate("originalLanguage")
          .exec(callback);
      },
      authors: (callback) => {
        Author.find(callback);
      },
      genres: (callback) => {
        Genre.find(callback);
      },
      languages: (callback) => {
        Language.find(callback);
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
  body("author2").trim().optional(),
  body("summary", "Summary must not be empty.").trim().isLength({ min: 1 }),
  body("isbn", "ISBN must not be empty").trim().isLength({ min: 1 }),
  body("language", "Language must not be empty.").trim().isLength({ min: 1 }),
  body("originalLanguage").trim().optional(),
  body("pages").trim().optional(),
  body("yearFirstPublished").trim().optional(),

  // Sanitize fields(no wildcard used, it seems to affect genre array)
  body("title").escape(),
  body("originalTitle").escape(),
  body("author").escape(),
  body("author2").escape(),
  body("summary").escape(),
  body("isbn").escape(),
  body("language").escape(),
  body("originalLanguage").escape(),
  body("pages").escape(),
  body("yearFirstPublished").escape(),
  body("genre.*").escape(), // for the values within genre array

  //not sure if unescape is safe to apply like this
  body("title").unescape(),
  body("originalTitle").unescape(),
  body("author").unescape(),
  body("author2").unescape(),
  body("summary").unescape(),
  body("isbn").unescape(),
  body("language").unescape(),
  body("originalLanguage").unescape(),
  body("pages").unescape(),
  body("yearFirstPublished").unescape(),

  // Process request after validation and sanitization.
  (req, res, next) => {
    // Extract the validation errors from a request.
    const errors = validationResult(req);

    // Create a Book object with escaped/trimmed data and old id.
    var book = new Book({
      title: req.body.title,
      originalTitle: req.body.originalTitle,
      author: req.body.author,
      author2: req.body.author2,
      summary: req.body.summary,
      isbn: req.body.isbn,
      genre: typeof req.body.genre === "undefined" ? [] : req.body.genre,
      language: req.body.language,
      originalLanguage: req.body.originalLanguage,
      pages: req.body.pages,
      yearFirstPublished: req.body.yearFirstPublished,
      updatedBy: req.user,
      _id: req.params.id, //This is required, or a new ID will be assigned!
    });

    if (!errors.isEmpty()) {
      // There are errors. Render form again with sanitized values/error messages.

      // Get all authors and genres for form.
      async.parallel(
        {
          book: (callback) => {
            Book.findById(req.params.id)
              .populate("author")
              .populate("genre")
              .populate("language")
              .populate("originalLanguage")
              .exec(callback);
          },
          authors: (callback) => {
            Author.find(callback);
          },
          genres: (callback) => {
            Genre.find(callback);
          },
          language: (callback) => {
            Language.find(callback);
          },
        },
        (err, results) => {
          if (err) {
            return next(err);
          }

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
            book: book,
            errors: errors.array(),
          });
        }
      );
      return;
    } else {
      // Data from form is valid. Update the record.
      Book.findByIdAndUpdate(req.params.id, book, {}, (err, thebook) => {
        if (err) {
          return next(err);
        }
        // Successful - redirect to book detail page.
        res.redirect(thebook.url);
      });
    }
  },
];

// Display search results on GET.
exports.search = (req, res, next) => {
  var search = req.query.search;

  async.parallel(
    {
      books: (callback) => {
        // For an unknown reason, I cannot create a text index in MongoDB Atlas for books,
        // so I created an Atlas Search Index, which works with aggregate
        Book.aggregate([
          {
            $search: {
              text: {
                query: search,
                path: ["title", "originalTitle", "summary", "isbn"],
              },
            },
          },
          {
            $limit: 5,
          },
          {
            $project: {
              _id: 1,
              title: 1,
              originalTitle: 1,
              summary: 1,
              isbn: 1,
              author: 1, // populate doesn't work with aggregate, so not sure how to bring author, language etc to results
              language: 1,
            },
          },
        ]).exec(callback);
      },
      authors: (callback) => {
        // For the rest of collections, there was no issue to create text index,
        // so below I'm using the "standard" text search with find
        Author.find({
          $text: {
            $search: search,
          },
        })
          .limit(5)
          .exec(callback);
      },
      countries: (callback) => {
        Country.find({
          $text: {
            $search: search,
          },
        })
          .limit(5)
          .exec(callback);
      },
      genres: (callback) => {
        Genre.find({
          $text: {
            $search: search,
          },
        })
          .limit(5)
          .exec(callback);
      },
    },

    (err, results) => {
      if (err) {
        return next(err);
      }

      res.render("search", {
        title: "Search Results",
        books: results.books,
        authors: results.authors,
        countries: results.countries,
        genres: results.genres,
      });
    }
  );
};

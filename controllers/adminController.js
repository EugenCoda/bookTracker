var Book = require("../models/book");
var Language = require("../models/language");
var Country = require("../models/country");
var Booklist = require("../models/booklist");
var Author = require("../models/author");
var Genre = require("../models/genre");
var Review = require("../models/review");
const { body, validationResult } = require("express-validator");
var async = require("async");

// Display Dashboard on GET.
exports.admin_dashboard_get = (req, res, next) => {
  async.parallel(
    {
      // All items from DB
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
      review_count: (callback) => {
        Review.countDocuments({}, callback);
      },
      // All approved items
      book_count_approved: (callback) => {
        Book.countDocuments({ isVerified: true }, callback);
      },
      author_count_approved: (callback) => {
        Author.countDocuments({ isVerified: true }, callback);
      },
      genre_count_approved: (callback) => {
        Genre.countDocuments({ isVerified: true }, callback);
      },
      language_count_approved: (callback) => {
        Language.countDocuments({ isVerified: true }, callback);
      },
      country_count_approved: (callback) => {
        Country.countDocuments({ isVerified: true }, callback);
      },
      review_count_approved: (callback) => {
        Review.countDocuments({ isVerified: true }, callback);
      },
      // All pending items
      book_count_pending: (callback) => {
        Book.countDocuments({ isVerified: false }, callback);
      },
      author_count_pending: (callback) => {
        Author.countDocuments({ isVerified: false }, callback);
      },
      genre_count_pending: (callback) => {
        Genre.countDocuments({ isVerified: false }, callback);
      },
      language_count_pending: (callback) => {
        Language.countDocuments({ isVerified: false }, callback);
      },
      country_count_pending: (callback) => {
        Country.countDocuments({ isVerified: false }, callback);
      },
      review_count_pending: (callback) => {
        Review.countDocuments({ isVerified: false }, callback);
      },
    },
    (err, results) => {
      res.render("admin_dashboard", {
        title: "Dashboard",
        error: err,
        data: results,
      });
    }
  );
};

// Display Pending Books on GET.
exports.admin_books_get = (req, res, next) => {
  async.parallel(
    {
      books: (callback) => {
        Book.find(
          // Show the item only if it's not approved by admin
          { isVerified: false },
          "title author yearFirstPublished"
        )
          .sort("title")
          .populate("author")
          .exec(callback);
      },
    },
    (err, results) => {
      res.render("admin_books", {
        title: "Pending Books",
        error: err,
        books: results.books,
      });
    }
  );
};

// Handle Approving Books on POST
exports.admin_books_post = (req, res, next) => {
  async.parallel(
    {
      book: (callback) => {
        Book.findOne(
          // Show the item only if it's not approved by admin
          { isVerified: false, _id: req.body.bookId }
        ).exec(callback);
      },
    },
    (err, book) => {
      if (err) {
        return next(err);
      }

      book.book.isVerified = true;

      book.book.markModified("isVerified");
      book.book.save((err) => {
        if (err) {
          return next(err);
        }
        req.flash("success", "The book has been successfully approved.");
        res.redirect("/dashboard/books");
        return;
      });
    }
  );
};

// Display Pending Authors on GET.
exports.admin_authors_get = (req, res, next) => {
  async.parallel(
    {
      authors: (callback) => {
        Author.find(
          // Show the item only if it's not approved by admin
          { isVerified: false }
        )
          .sort([["family_name", "ascending"]])
          .populate("country")
          .exec(callback);
      },
    },
    (err, results) => {
      res.render("admin_authors", {
        title: "Pending Authors",
        error: err,
        authors: results.authors,
      });
    }
  );
};

// Handle Approving Authors on POST
exports.admin_authors_post = (req, res, next) => {
  async.parallel(
    {
      author: (callback) => {
        Author.findOne(
          // Show the item only if it's not approved by admin
          { isVerified: false, _id: req.body.authorId }
        ).exec(callback);
      },
    },
    (err, author) => {
      if (err) {
        return next(err);
      }

      author.author.isVerified = true;

      author.author.markModified("isVerified");
      author.author.save((err) => {
        if (err) {
          return next(err);
        }
        req.flash("success", "The author has been successfully approved.");
        res.redirect("/dashboard/authors");
        return;
      });
    }
  );
};

// Display Pending Genres on GET.
exports.admin_genres_get = (req, res, next) => {
  async.parallel(
    {
      genres: (callback) => {
        Genre.find(
          // Show the item only if it's not approved by admin
          { isVerified: false }
        )
          .populate("genre")
          .sort([["name", "ascending"]])
          .exec(callback);
      },
    },
    (err, results) => {
      res.render("admin_genres", {
        title: "Pending Genres",
        error: err,
        genres: results.genres,
      });
    }
  );
};

// Handle Approving Genres on POST
exports.admin_genres_post = (req, res, next) => {
  async.parallel(
    {
      genre: (callback) => {
        Genre.findOne(
          // Show the item only if it's not approved by admin
          { isVerified: false, _id: req.body.genreId }
        ).exec(callback);
      },
    },
    (err, genre) => {
      if (err) {
        return next(err);
      }

      genre.genre.isVerified = true;

      genre.genre.markModified("isVerified");
      genre.genre.save((err) => {
        if (err) {
          return next(err);
        }
        req.flash("success", "The genre has been successfully approved.");
        res.redirect("/dashboard/genres");
        return;
      });
    }
  );
};

// Display Pending Languages on GET.
exports.admin_languages_get = (req, res, next) => {
  async.parallel(
    {
      languages: (callback) => {
        Language.find(
          // Show the item only if it's not approved by admin
          { isVerified: false }
        )
          .populate("language")
          .sort([["name", "ascending"]])
          .exec(callback);
      },
    },
    (err, results) => {
      res.render("admin_languages", {
        title: "Pending Languages",
        error: err,
        languages: results.languages,
      });
    }
  );
};

// Handle Approving Languages on POST
exports.admin_languages_post = (req, res, next) => {
  async.parallel(
    {
      language: (callback) => {
        Language.findOne(
          // Show the item only if it's not approved by admin
          { isVerified: false, _id: req.body.languageId }
        ).exec(callback);
      },
    },
    (err, language) => {
      if (err) {
        return next(err);
      }

      language.language.isVerified = true;

      language.language.markModified("isVerified");
      language.language.save((err) => {
        if (err) {
          return next(err);
        }
        req.flash("success", "The language has been successfully approved.");
        res.redirect("/dashboard/languages");
        return;
      });
    }
  );
};

// Display Pending Countries on GET.
exports.admin_countries_get = (req, res, next) => {
  async.parallel(
    {
      countries: (callback) => {
        Country.find(
          // Show the item only if it's not approved by admin
          { isVerified: false }
        )
          .populate("country")
          .sort([["name", "ascending"]])
          .exec(callback);
      },
    },
    (err, results) => {
      res.render("admin_countries", {
        title: "Pending Countries",
        error: err,
        countries: results.countries,
      });
    }
  );
};

// Handle Approving Countries on POST
exports.admin_countries_post = (req, res, next) => {
  async.parallel(
    {
      country: (callback) => {
        Country.findOne(
          // Show the item only if it's not approved by admin
          { isVerified: false, _id: req.body.countryId }
        ).exec(callback);
      },
    },
    (err, country) => {
      if (err) {
        return next(err);
      }

      country.country.isVerified = true;

      country.country.markModified("isVerified");
      country.country.save((err) => {
        if (err) {
          return next(err);
        }
        req.flash("success", "The country has been successfully approved.");
        res.redirect("/dashboard/countries");
        return;
      });
    }
  );
};

// Display Pending Reviews on GET.
exports.admin_reviews_get = (req, res, next) => {
  async.parallel(
    {
      reviews: (callback) => {
        Review.find(
          // Show the item only if it's not approved by admin
          { isVerified: false }
        )
          .populate("book")
          .populate("user")
          .sort([["name", "ascending"]])
          .exec(callback);
      },
    },
    (err, results) => {
      res.render("admin_reviews", {
        title: "Pending Reviews",
        error: err,
        reviews: results.reviews,
      });
    }
  );
};

// Handle Approving Reviews on POST
exports.admin_reviews_post = (req, res, next) => {
  async.parallel(
    {
      review: (callback) => {
        Review.findOne(
          // Show the item only if it's not approved by admin
          { isVerified: false, _id: req.body.reviewId }
        ).exec(callback);
      },
    },
    (err, review) => {
      if (err) {
        return next(err);
      }

      review.review.isVerified = true;

      review.review.markModified("isVerified");
      review.review.save((err) => {
        if (err) {
          return next(err);
        }
        req.flash("success", "The review has been successfully approved.");
        res.redirect("/dashboard/reviews");
        return;
      });
    }
  );
};

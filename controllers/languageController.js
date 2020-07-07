var Language = require("../models/language");
var Book = require("../models/book");
var async = require("async");
const { body, validationResult } = require("express-validator");

// Display list of all Languages.
exports.language_list = function (req, res, next) {
  Language.find()
    .populate("language")
    .sort([["name", "ascending"]])
    .exec(function (err, list_languages) {
      if (err) {
        return next(err);
      }
      //Successful, so render
      res.render("language_list", {
        title: "Languages",
        language_list: list_languages,
      });
    });
};

// Display detail page for a specific Language.
exports.language_detail = function (req, res, next) {
  async.parallel(
    {
      language: function (callback) {
        Language.findById(req.params.id).exec(callback);
      },

      language_books: function (callback) {
        Book.find({ language: req.params.id })
          .populate("author")
          .exec(callback);
      },
      originalLanguage_books: function (callback) {
        Book.find({ originalLanguage: req.params.id })
          .populate("author")
          .exec(callback);
      },
    },
    function (err, results) {
      if (err) {
        return next(err);
      }
      if (results.language == null) {
        // No results.
        var err = new Error("Language not found");
        err.status = 404;
        return next(err);
      }
      // Successful, so render
      res.render("language_detail", {
        title: "Language Detail",
        language: results.language,
        language_books: results.language_books,
        originalLanguage_books: results.originalLanguage_books,
      });
    }
  );
};

// Display Language create form on GET.
exports.language_create_get = function (req, res, next) {
  res.render("language_form", { title: "Add Language" });
};

// Handle Language create on POST.
exports.language_create_post = [
  // Validate that the name field is not empty.
  body("name", "Language name required").trim().isLength({ min: 1 }),

  // Sanitize (escape) the name field.
  body("name").escape(),
  body("name").unescape(), //not sure if it is safe to do so

  // Process request after validation and sanitization.
  (req, res, next) => {
    // Extract the validation errors from a request.
    const errors = validator.validationResult(req);

    // Create a language object with escaped and trimmed data.
    var language = new Language({ name: req.body.name });

    if (!errors.isEmpty()) {
      // There are errors. Render the form again with sanitized values/error messages.
      res.render("language_form", {
        title: "Add Language",
        language: language,
        errors: errors.array(),
      });
      return;
    } else {
      // Data from form is valid.
      // Check if language with same name already exists.
      Language.findOne({ name: req.body.name }).exec(function (
        err,
        found_language
      ) {
        if (err) {
          return next(err);
        }

        if (found_language) {
          // Language exists, redirect to its detail page.
          res.redirect(found_language.url);
        } else {
          language.save(function (err) {
            if (err) {
              return next(err);
            }
            // Language saved. Redirect to language detail page.
            res.redirect(language.url);
          });
        }
      });
    }
  },
];

// Display Language delete form on GET.
exports.language_delete_get = function (req, res, next) {
  async.parallel(
    {
      language: function (callback) {
        Language.findById(req.params.id).exec(callback);
      },
      languages_books: function (callback) {
        Book.find({ language: req.params.id }).exec(callback);
      },
      originalLanguage_books: function (callback) {
        Book.find({ originalLanguage: req.params.id }).exec(callback);
      },
    },
    function (err, results) {
      if (err) {
        return next(err);
      }
      if (results.language == null) {
        // No results.
        res.redirect("/catalog/languages");
      }
      // Successful, so render.
      res.render("language_delete", {
        title: "Delete Language",
        language: results.language,
        language_books: results.languages_books,
        originalLanguage_books: results.originalLanguage_books,
      });
    }
  );
};

// Handle Language delete on POST.
exports.language_delete_post = function (req, res, next) {
  async.parallel(
    {
      language: function (callback) {
        Language.findById(req.body.languageid).exec(callback);
      },
      languages_books: function (callback) {
        Book.find({ language: req.body.languageid }).exec(callback);
      },
      originalLanguage_books: function (callback) {
        Book.find({ originalLanguage: req.body.languageid }).exec(callback);
      },
    },
    function (err, results) {
      if (err) {
        return next(err);
      }
      // Success
      if (
        results.languages_books.length > 0 ||
        results.originalLanguages_books.length > 0
      ) {
        // Language has books. Render in same way as for GET route.
        res.render("language_delete", {
          title: "Delete Language",
          language: results.language,
          language_books: results.languages_books,
          originalLanguage_books: results.originalLanguage_books,
        });
        return;
      } else {
        // Language has no books. Delete object and redirect to the list of languages.
        Language.findByIdAndRemove(req.body.languageid, function deleteLanguage(
          err
        ) {
          if (err) {
            return next(err);
          }
          // Success - go to language list
          res.redirect("/catalog/languages");
        });
      }
    }
  );
};

// Display Language update form on GET.
exports.language_update_get = function (req, res, next) {
  Language.findById(req.params.id, function (err, language) {
    if (err) {
      return next(err);
    }
    if (language == null) {
      // No results.
      var err = new Error("Language not found");
      err.status = 404;
      return next(err);
    }
    // Success.
    res.render("language_form", {
      title: "Update Language",
      language: language,
    });
  });
};

// Handle Language update on POST.
exports.language_update_post = [
  // Validate that the name field is not empty.
  body("name", "Language name required").isLength({ min: 1 }).trim(),

  // Sanitize (escape) the name field.
  body("name").escape(),
  body("name").unescape(), //not sure if it is safe to do so

  // Process request after validation and sanitization.
  (req, res, next) => {
    // Extract the validation errors from a request .
    const errors = validationResult(req);

    // Create a language object with escaped and trimmed data (and the old id!)
    var language = new Language({
      name: req.body.name,
      _id: req.params.id,
    });

    if (!errors.isEmpty()) {
      // There are errors. Render the form again with sanitized values and error messages.
      res.render("language_form", {
        title: "Update Language",
        language: language,
        errors: errors.array(),
      });
      return;
    } else {
      // Data from form is valid. Update the record.
      Language.findByIdAndUpdate(req.params.id, language, {}, function (
        err,
        thelanguage
      ) {
        if (err) {
          return next(err);
        }
        // Successful - redirect to language detail page.
        res.redirect(thelanguage.url);
      });
    }
  },
];

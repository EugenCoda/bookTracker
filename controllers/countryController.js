const Country = require("../models/country");
const Author = require("../models/author");
var async = require("async");
const { body, validationResult } = require("express-validator");

// Display list of all Countries.
exports.country_list = function (req, res, next) {
  Country.find()
    .populate("country")
    .sort([["name", "ascending"]])
    .exec(function (err, list_countries) {
      if (err) {
        return next(err);
      }
      //Successful, so render
      res.render("country_list", {
        title: "Countries",
        country_list: list_countries,
      });
    });
};

// Display detail page for a specific Country.
exports.country_detail = function (req, res, next) {
  async.parallel(
    {
      country: function (callback) {
        Country.findById(req.params.id).exec(callback);
      },

      country_authors: function (callback) {
        Author.find({ country: req.params.id })
          .populate("author")
          .exec(callback);
      },
    },
    function (err, results) {
      if (err) {
        return next(err);
      }
      if (results.country == null) {
        // No results.
        var err = new Error("Country not found");
        err.status = 404;
        return next(err);
      }
      // Successful, so render
      res.render("country_detail", {
        title: "Country Detail",
        country: results.country,
        country_authors: results.country_authors,
      });
    }
  );
};

// Display Country create form on GET.
exports.country_create_get = function (req, res, next) {
  res.render("country_form", { title: "Add Country" });
};

// Handle Country create on POST.
exports.country_create_post = [
  // Validate that the name field is not empty.
  body("name", "Country name required").trim().isLength({ min: 1 }),

  // Sanitize (escape) the name field.
  body("name").escape(),
  body("name").unescape(), //not sure if it is safe to do so

  // Process request after validation and sanitization.
  (req, res, next) => {
    // Extract the validation errors from a request.
    const errors = validator.validationResult(req);

    // Create a country object with escaped and trimmed data.
    var country = new Country({ name: req.body.name });

    if (!errors.isEmpty()) {
      // There are errors. Render the form again with sanitized values/error messages.
      res.render("country_form", {
        title: "Add Country",
        country: country,
        errors: errors.array(),
      });
      return;
    } else {
      // Data from form is valid.
      // Check if country with same name already exists.
      Country.findOne({ name: req.body.name }).exec(function (
        err,
        found_country
      ) {
        if (err) {
          return next(err);
        }

        if (found_country) {
          // Country exists, redirect to its detail page.
          res.redirect(found_country.url);
        } else {
          country.save(function (err) {
            if (err) {
              return next(err);
            }
            // Country saved. Redirect to country detail page.
            res.redirect(country.url);
          });
        }
      });
    }
  },
];

// Display Country delete form on GET.
exports.country_delete_get = function (req, res, next) {
  async.parallel(
    {
      country: function (callback) {
        Country.findById(req.params.id).exec(callback);
      },
      countries_authors: function (callback) {
        Author.find({ country: req.params.id }).exec(callback);
      },
    },
    function (err, results) {
      if (err) {
        return next(err);
      }
      if (results.country == null) {
        // No results.
        res.redirect("/catalog/countries");
      }
      // Successful, so render.
      res.render("country_delete", {
        title: "Delete Country",
        country: results.country,
        country_authors: results.countries_authors,
      });
    }
  );
};

// Handle Country delete on POST.
exports.country_delete_post = function (req, res, next) {
  async.parallel(
    {
      country: function (callback) {
        Country.findById(req.body.countryid).exec(callback);
      },
      countries_authors: function (callback) {
        Author.find({ country: req.body.countryid }).exec(callback);
      },
    },
    function (err, results) {
      if (err) {
        return next(err);
      }
      // Success
      if (results.countries_authors.length > 0) {
        // Country has authors. Render in same way as for GET route.
        res.render("country_delete", {
          title: "Delete Country",
          country: results.country,
          country_authors: results.countries_authors,
        });
        return;
      } else {
        // Country has no authors. Delete object and redirect to the list of countries.
        Country.findByIdAndRemove(req.body.countryid, function deleteCountry(
          err
        ) {
          if (err) {
            return next(err);
          }
          // Success - go to country list
          res.redirect("/catalog/countries");
        });
      }
    }
  );
};

// Display Country update form on GET.
exports.country_update_get = function (req, res, next) {
  Country.findById(req.params.id, function (err, country) {
    if (err) {
      return next(err);
    }
    if (country == null) {
      // No results.
      var err = new Error("Country not found");
      err.status = 404;
      return next(err);
    }
    // Success.
    res.render("country_form", { title: "Update Country", country: country });
  });
};

// Handle Country update on POST.
exports.country_update_post = [
  // Validate that the name field is not empty.
  body("name", "Country name required").isLength({ min: 1 }).trim(),

  // Sanitize (escape) the name field.
  body("name").escape(),
  body("name").unescape(), //not sure if it is safe to do so

  // Process request after validation and sanitization.
  (req, res, next) => {
    // Extract the validation errors from a request .
    const errors = validationResult(req);

    // Create a country object with escaped and trimmed data (and the old id!)
    var country = new Country({
      name: req.body.name,
      _id: req.params.id,
    });

    if (!errors.isEmpty()) {
      // There are errors. Render the form again with sanitized values and error messages.
      res.render("country_form", {
        title: "Update Country",
        country: country,
        errors: errors.array(),
      });
      return;
    } else {
      // Data from form is valid. Update the record.
      Country.findByIdAndUpdate(req.params.id, country, {}, function (
        err,
        thecountry
      ) {
        if (err) {
          return next(err);
        }
        // Successful - redirect to country detail page.
        res.redirect(thecountry.url);
      });
    }
  },
];

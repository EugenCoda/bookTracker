module.exports = {
  ensureAuthenticated: function (req, res, next) {
    if (req.isAuthenticated()) {
      return next();
    } else {
      req.flash("danger", "Please login");
      res.redirect("/users/login");
    }
  },
  ensureGuest: function (req, res, next) {
    if (req.isAuthenticated()) {
      res.redirect("/catalog");
    } else {
      return next();
    }
  },

  ensureAdmin: function (req, res, next) {
    if (req.isAuthenticated() && req.user.email == "coda.eugen@gmail.com") {
      return next();
    } else {
      req.flash("danger", "You are not authorized to view this page");
      res.redirect("/catalog");
    }
  },
};

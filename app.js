var createError = require("http-errors");
var express = require("express");
var path = require("path");
var cookieParser = require("cookie-parser");
var logger = require("morgan");
require("dotenv/config");
const flash = require("connect-flash");
const session = require("express-session");
const passport = require("passport");

var indexRouter = require("./routes/index");
var usersRouter = require("./routes/users");
var booklistsRouter = require("./routes/booklists");
var catalogRouter = require("./routes/catalog"); //Import routes for "catalog" area of site

var app = express();

//Set up mongoose connection
var mongoose = require("mongoose");
mongoose.connect(process.env.DB_CONNECTION, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
  useFindAndModify: false,
});
var db = mongoose.connection;
db.on("error", console.error.bind(console, "MongoDB connection error:"));
db.once("open", () => console.log("Connected to DB!"));

// view engine setup
app.set("views", path.join(__dirname, "views"));
app.set("view engine", "pug");

app.use(logger("dev"));

//Body Parser
app.use(express.json());
app.use(express.urlencoded({ extended: false }));

app.use(cookieParser());

//Set Public Folder
app.use(express.static(path.join(__dirname, "public")));

//Express Session Middleware
app.use(
  session({
    secret: "keyboard cat",
    resave: true,
    saveUninitialized: true,
  })
);

//Express Messages Middleware
app.use(require("connect-flash")());
app.use((req, res, next) => {
  res.locals.messages = require("express-messages")(req, res);
  next();
});

//Passport Config
require("./config/passport")(passport);
//Passport Middleware
app.use(passport.initialize());
app.use(passport.session());

//Set up a global variable for user
app.get("*", (req, res, next) => {
  res.locals.user = req.user || null;
  next();
});

app.use("/", indexRouter);
app.use("/users", usersRouter);
app.use("/booklists", booklistsRouter);
app.use("/catalog", catalogRouter); // Add catalog routes to middleware chain.

// catch 404 and forward to error handler
app.use(function (req, res, next) {
  next(createError(404));
});

// error handler
app.use(function (err, req, res, next) {
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get("env") === "development" ? err : {};

  // render the error page
  res.status(err.status || 500);
  res.render("error");
});

module.exports = app;

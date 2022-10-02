const express = require("express");
const path = require("path");
const mongoose = require("mongoose");
const methodOverride = require("method-override");
const ejsMate = require("ejs-mate");
const morgan = require("morgan");
const session = require("express-session");
const app = express();

const expressError = require("./Utilities/expressErrorHandler");

const flash = require("connect-flash");

const passport = require("passport");
const LocalStrategy = require("passport-local");

app.get("/fakeuser", async (req, res) => {
  const user = new User({
    email: "alex@gmail.com",
    username: "alexxygg",
  });
  //Passport will take new user object and password, hash it with salt
  //and returns it to user object.
  const newUser = await User.register(user, "password");
  //Adds a salt and hash key value pair to object
  res.send(newUser);
});

//Here we import the specific routes
const campgroundsRoutes = require("./routes/campgrounds");
const reviewsRoutes = require("./routes/reviews");
const userRoutes = require("./routes/users");

const { nextTick } = require("process");
//Here we use the path, we must remove the prefix from all routes
//--on routes file for campgrounds
//We also changed app. to router.
// We also moved catch async to each routes fileLoader, since it
//will not work from this file.
//Same with expressError
//Also the Campground model

//Changed all require file paths since we saved the routes in a folder

//Moved validateCampground too

const User = require("./models/user");

mongoose.connect("mongodb://localhost:27017/yelp-camp", {
  useNewUrlParser: true,
  //NO LONGER NEEDED WITH MONGOOSE 6
  //   useCreateIndex: true,
  useUnifiedTopology: true,
});

const db = mongoose.connection;
db.on("error", console.error.bind(console, "connection error"));
db.once("open", () => {
  console.log("Database connected");
});

app.use(morgan("tiny"));

app.engine("ejs", ejsMate);
app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "views"));

//To return object defined
app.use(express.urlencoded({ extended: true }));
app.use(methodOverride("_method"));

// app.use(express.static("public"));
app.use(express.static(path.join(__dirname, "public")));

//Our session id cookie
const sessionConfig = {
  secret: "thisisabettersecret",
  resave: false,
  saveUninitialized: true,
  cookie: {
    //The milliseconds in a week
    expires: Date.now() + 604800000,
    maxAge: 604800000,
    //Extra security
    httpOnly: true,
  },
};
app.use(session(sessionConfig));

app.use(flash());

app.use(passport.initialize());
//This allows to not have to log in each time,
//needs to go after app.use session
app.use(passport.session());
//To use our strategy, which we required.
passport.use(new LocalStrategy(User.authenticate()));
//Store user in session   store,un store
passport.serializeUser(User.serializeUser());
//Get user out of session
passport.deserializeUser(User.deserializeUser());

//Our flash alert middleware, runs on every request
//We will have access to it locally
app.use((req, res, next) => {
  console.log(req.session);
  //All templates should have access to these locals
  res.locals.currentUser = req.user;
  res.locals.success = req.flash("success");
  res.locals.error = req.flash("error");
  next();
});

//Our router prefixes
app.use("/campgrounds", campgroundsRoutes);
app.use("/campgrounds/:id/reviews", reviewsRoutes);
app.use("/", userRoutes);

app.get("/", (req, res) => {
  //   res.send("OUR YELP CAMP");
  res.render("home");
});

app.all("*", (req, res, next) => {
  next(new expressError("Page not found.", 404));
});

app.use((err, req, res, next) => {
  const { statusCode = 500 } = err;
  if (!err.message) err.message = "Something went wrong";
  res.status(statusCode).render("error", { err });
  // res.send("SOMETHING WENT WRONG :c");
});

app.listen(3700, () => {
  console.log("port 3500 active");
});

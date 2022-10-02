const express = require("express");
const router = express.Router();

const catchAsync = require("../Utilities/catchAsync");
const expressError = require("../Utilities/expressErrorHandler");

const User = require("../models/user");
const passport = require("passport");
const { func } = require("joi");

//REGISTER
router.get("/register", (req, res) => {
  res.render("./users/register");
});

//This is to create a user, not keep him logged in.
router.post(
  "/register",
  catchAsync(async (req, res, next) => {
    //   res.send(req.body);
    try {
      const { email, username, password } = req.body;
      const user = new User({ email, username });
      //register() automatically saves, no need for user.save etc.
      const registeredUser = await User.register(user, password);
      //   console.log(registeredUser);
      //To log new user in, would be logged out even if registered
      req.login(registeredUser, (err) => {
        if (err) return next(err);
        req.flash("success", "Welcome to YelpCamp");
        res.redirect("/campgrounds");
      });
    } catch (err) {
      req.flash("danger", err.message);
      res.redirect("/register");
    }
  })
);

//LOGIN
router.get("/login", (req, res) => {
  res.render("./users/login");
});
//Here Passport uses our strategy/ies to validate the data
//We can include multiple in the same place,
//If there's an error, we'll flash a message and redirect
router.post(
  "/login",
  passport.authenticate("local", {
    failureFlash: true,
    failureRedirect: "/login",
    //Due to upgrades and changes, needed for the redirect to returnTo in session
    keepSessionInfo: true,
  }),
  (req, res) => {
    req.flash("success", "Welcome back!");
    // res.redirect("./campgrounds");
    const redirectUrl = req.session.returnTo || "/campgrounds";
    res.redirect(redirectUrl);
    delete req.session.returnTo;
  }
);
//DUE TO PASSPORT PROBLEMS
// router.get("/logout", (req, res, next) => {
//   req.logout(function (err) {
//     if (err) {
//       return next(err);
//     }
//     req.flash("success", "Logged out successfully.");
//     res.redirect("/campgrounds");
//   });
// });

router.get("/logout", (req, res, next) => {
  req.logout();
  req.flash("success", "Logged out successfully.");
  res.redirect("/campgrounds");
});
module.exports = router;

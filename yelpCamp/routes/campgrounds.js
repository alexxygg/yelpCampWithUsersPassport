const express = require("express");
const router = express.Router();

const catchAsync = require("../Utilities/catchAsync");
const expressError = require("../Utilities/expressErrorHandler");

const Campground = require("../models/campground");

//We destructured in case we create and use additional schemas later.
const { campgroundSchema } = require("../joiServerValidationSchemas");

//Our middleware to check if user is logged
const { isLoggedIn } = require("../middleware");

const validateCampground = (req, res, next) => {
  // const result = campgroundSchema.validate(req.body);
  const { error } = campgroundSchema.validate(req.body);
  if (error) {
    const message = error.details.map((el) => el.message).join(",");
    console.log(message);
    throw new expressError(message, 400);
  } else {
    next();
  }
};

router.get(
  "/",
  catchAsync(async (req, res) => {
    const campgrounds = await Campground.find({});
    res.render("campgrounds/index", { campgrounds });
  })
);

router.get(
  "/new",
  isLoggedIn,
  catchAsync((req, res) => {
    res.render("campgrounds/new");
  })
);

router.post(
  "/",
  isLoggedIn,
  validateCampground,
  catchAsync(async (req, res, next) => {
    // res.send(req.body);
    // if (!req.body.campground)
    //   throw new expressError("INVALID CAMPGROUND DATA", 400);

    const campground = new Campground(req.body.campground);
    await campground.save();
    //Our flash alert, AFTER making sure it is saved.
    req.flash("success", "New campground created successfully!");
    res.redirect(`/campgrounds/${campground._id}`);
    // res.redirect("/campgrounds");
  })
);

//SHOW campground details
router.get(
  "/:id",
  catchAsync(async (req, res) => {
    const campground = await Campground.findById(req.params.id).populate(
      "reviews"
    );
    if (!campground) {
      req.flash("danger", "Could not find requested campground!");
      return res.redirect("/campgrounds");
    }
    console.log(campground);
    //Here we include our flash alert.
    res.render("campgrounds/show", { campground });
    // { campground, msg: req.flash("success") }
  })
);

router.get(
  "/:id/edit",
  isLoggedIn,
  catchAsync(async (req, res) => {
    const campground = await Campground.findById(req.params.id);
    if (!campground) {
      req.flash("danger", "Could not find requested campground!");
      return res.redirect("/campgrounds");
    }
    res.render("campgrounds/edit", { campground });
  })
);

//REMEMBER, we need to npm i method.override
//to override when we need a put/patch request!!!
router.put(
  "/:id",
  isLoggedIn,
  validateCampground,
  catchAsync(async (req, res) => {
    const { id } = req.params;
    const campground = await Campground.findByIdAndUpdate(id, {
      ...req.body.campground,
    });
    req.flash("success", "Campground updated successfully!");
    res.redirect(`/campgrounds/${campground._id}`);
  })
);

router.delete(
  "/:id",
  isLoggedIn,
  catchAsync(async (req, res) => {
    const { id } = req.params;
    await Campground.findByIdAndDelete(id);
    req.flash("success", "Campground deleted successfully!");
    res.redirect("/campgrounds");
  })
);

module.exports = router;

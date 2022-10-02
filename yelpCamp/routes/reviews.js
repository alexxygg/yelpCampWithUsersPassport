const express = require("express");
//Needed because we have the /:id parameter as a prefix in app.js
const router = express.Router({ mergeParams: true });

const catchAsync = require("../Utilities/catchAsync");
const expressError = require("../Utilities/expressErrorHandler");

const Campground = require("../models/campground");
const Review = require("../models/review");

//We destructured in case we create and use additional schemas later.
const { reviewSchema } = require("../joiServerValidationSchemas");

const validateReview = (req, res, next) => {
  const { error } = reviewSchema.validate(req.body);
  if (error) {
    const msg = error.details.map((el) => el.message).join(",");
    console.log(msg);
    throw new expressError(msg, 400);
  } else {
    next();
  }
};

router.post(
  "/",
  validateReview,
  catchAsync(async (req, res) => {
    // res.send("REVIEW SUBMITTED");
    const campground = await Campground.findById(req.params.id);
    //This gives us access to all values stored in review[]
    const review = new Review(req.body.review);
    campground.reviews.push(review);
    await review.save();
    await campground.save();
    req.flash("success", "New review created successfully!");
    res.redirect(`/campgrounds/${campground._id}`);
  })
);

router.delete(
  "/:reviewId",
  catchAsync(async (req, res) => {
    const { id, reviewId } = req.params;
    const campground = await Campground.findByIdAndUpdate(id, {
      $pull: { reviews: reviewId },
    });
    // (req.params.reviewId) if NOT DESTRUCTURED
    const review = await Review.findByIdAndDelete(reviewId);
    // res.send("DELETE ME");
    req.flash("success", "Review deleted successfully!");
    res.redirect(`/campgrounds/${id}`);
  })
);

module.exports = router;

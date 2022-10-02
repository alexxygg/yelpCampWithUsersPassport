const mongoose = require("mongoose");

const Schema = mongoose.Schema;
const Review = require("./review");
const campgroundSchema = new Schema({
  title: String,
  price: Number,
  description: String,
  location: String,
  image: String,
  reviews: [{ type: Schema.Types.ObjectId, ref: "Review" }],
});

//Our mongoose middleware to delete all specific campground reviews
//upon campground deletion

//We must check what Mongoose method is triggered based on the method we use
//ourselves in the app paths
campgroundSchema.post("findOneAndDelete", async (doc) => {
  // console.log(doc);
  if (doc) {
    await Review.deleteMany({
      _id: { $in: doc.reviews },
    });
  }
});

module.exports = mongoose.model("Campground", campgroundSchema);

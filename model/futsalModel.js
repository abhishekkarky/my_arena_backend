const mongoose = require("mongoose");

const futsalSchema = mongoose.Schema(
  {
    futsalImageUrl: {
      type: String,
      trim: true,
    },
    name: {
      type: String,
    },
    location: {
      type: String,
    },
    rating: {
      type: Number,
    },
    groundSize: {
      type: String,
    },
    price: {
      type: Number,
    },
    lat: {
      type: Number,
    },
    long: {
      type: Number,
    },
    addedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "users",
    },
  },
  { timestamps: true }
);

const futsals = mongoose.model("futsals", futsalSchema);
module.exports = futsals;

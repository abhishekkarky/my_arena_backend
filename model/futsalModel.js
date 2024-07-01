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
    timeSlots: {
      type: [mongoose.Schema.Types.ObjectId],
      ref: "timeSlots",
    },
    dayOfWeek: {
      type: Number,
      min: 0,
      max: 6,
    },
    startTime: {
      type: String,
    },
    endTime: {
      type: String,
    },
  },
  { timestamps: true }
);

const futsals = mongoose.model("futsals", futsalSchema);
module.exports = futsals;

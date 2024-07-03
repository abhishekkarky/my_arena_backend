const mongoose = require("mongoose");

const bookingSchema = mongoose.Schema(
  {
    futsal: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "futsals",
    },
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "users",
    },
    vendor: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "users",
    },
    date: {
      type: String,
    },
    timeSlot: [
      {
        type: String,
      },
    ],
    paid: {
      type: Boolean,
      default: false,
    },
  },
  { timestamps: true }
);

const bookings = mongoose.model("bookings", bookingSchema);
module.exports = bookings;

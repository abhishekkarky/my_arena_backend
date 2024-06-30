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
    from: {
      type: Date,
    },
    to: {
      type: Date,
    },
  },
  { timestamps: true }
);

const bookings = mongoose.model("bookings", bookingSchema);
module.exports = bookings;

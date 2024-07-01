const mongoose = require("mongoose");

const timeSlotSchema = mongoose.Schema(
  {
    startTime: {
      type: String,
    },
    endTime: {
      type: String,
    },
    dayOfWeek: {
      type: Number,
      min: 0,
      max: 6,
    },
    futsal: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "futsals",
    },
    available: {
      type: Boolean,
      default: true,
    },
  },
  { timestamps: true }
);

const timeSlots = mongoose.model("timeSlots", timeSlotSchema);
module.exports = timeSlots;

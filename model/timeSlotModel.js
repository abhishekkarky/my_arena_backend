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
      type: String,
    },
  },
  { timestamps: true }
);

const timeSlots = mongoose.model("timeSlots", timeSlotSchema);
module.exports = timeSlots;

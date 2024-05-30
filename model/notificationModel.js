const mongoose = require("mongoose");

const notificationSchema = mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "users",
    },
    futsal: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "futsals",
    },
    isRead: {
      type: Boolean,
      default: false,
    },
  },
  { timestamps: true }
);

const notifications = mongoose.model("notification", notificationSchema);
module.exports = notifications;

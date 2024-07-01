const mongoose = require("mongoose");

const paymentMethodSchema = mongoose.Schema(
  {
    pidx: {
      type: String,
    },
    by: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "users",
    },
    vendor: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "users",
    },
    futsal: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "futsals",
    },
    amount: {
      type: Number,
    },
  },
  { timestamps: true }
);

const paymentLogs = mongoose.model("paymentLogs", paymentMethodSchema);
module.exports = paymentLogs;

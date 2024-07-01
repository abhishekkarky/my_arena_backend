const mongoose = require("mongoose");

const paymentMethodSchema = mongoose.Schema(
  {
    name: {
      type: String,
    },
    secretKey: {
      type: String,
    },
    ofUser: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "users",
    },
  },
  { timestamps: true }
);

const paymentMethod = mongoose.model("paymentMethod", paymentMethodSchema);
module.exports = paymentMethod;

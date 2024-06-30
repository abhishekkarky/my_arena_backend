const mongoose = require("mongoose");

const userSchema = mongoose.Schema(
  {
    userImageUrl: {
      type: String,
      trim: true,
    },
    name: {
      type: String,
    },
    email: {
      type: String,
      unique: true,
    },
    address: {
      type: String,
    },
    number: {
      type: String,
    },
    password: {
      type: String,
    },
    isAdmin: {
      type: Boolean,
      default: false,
    },
  },
  { timestamps: true }
);

const users = mongoose.model("users", userSchema);
module.exports = users;

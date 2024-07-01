const mongoose = require("mongoose");

const userSchema = mongoose.Schema(
  {
    userImageUrl: {
      type: String,
      trim: true,
    },
    fullName: {
      type: String,
    },
    email: {
      type: String,
    },
    address: {
      type: String,
    },
    number: {
      type: String,
      unique: true,
    },
    country: {
      type: String,
    },
    city: {
      type: String,
    },
    password: {
      type: String,
    },
    otp: {
      type: String,
      default: false,
    },
    otpTimestamp: {
      type: String,
      default: false,
      required: false,
    },
    isVerified: {
      type: Boolean,
      default: false,
    },
    fcmToken: [
      {
        type: String,
      },
    ],
    userTimeZone: {
      type: String,
    },
    failedLoginAttempts: {
      type: Number,
      default: 0,
    },
    role: {
      type: String,
      default: "customer",
      enum: ["customer", "vendor", "superadmin"],
    },
  },
  { timestamps: true }
);

const users = mongoose.model("users", userSchema);
module.exports = users;

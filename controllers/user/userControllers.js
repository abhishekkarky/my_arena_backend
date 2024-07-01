const bcrypt = require("bcrypt");
const users = require("../../model/userModel");
const jwt = require("jsonwebtoken");
const fetch = require("node-fetch");
const moment = require("moment");
const MP_API_KEY = process.env.MP_API_KEY;

async function sendSMS(to, message) {
  const url = "https://api.managepoint.co/api/sms/send";
  const payload = {
    apiKey: MP_API_KEY,
    to,
    message,
  };
  const headers = {
    "Content-Type": "application/json",
  };
  const response = await fetch(url, {
    method: "POST",
    headers,
    body: JSON.stringify(payload),
  });
  return await response.json();
}

function generateOTP() {
  return Math.floor(1000 + Math.random() * 9000);
}

const createUser = async (req, res) => {
  console.log(req.body);

  const { fullName, number, password, country, city } = req.body;

  if (!fullName || !number || !password) {
    return res.status(403).json({
      success: false,
      message: "Please enter all fields",
    });
  }

  try {
    let existingUser = await users.findOne({ number: number });

    if (existingUser) {
      if (existingUser.isVerified) {
        return res.status(403).json({
          success: false,
          message: "User already exists",
        });
      } else {
        const otp = generateOTP();
        console.log(otp);

        const generateSalt = await bcrypt.genSalt(10);
        const encryptedPassword = await bcrypt.hash(password, generateSalt);

        existingUser.fullName = fullName;
        existingUser.number = number;
        existingUser.password = encryptedPassword;
        existingUser.otp = otp;
        existingUser.otpTimestamp = moment().add(10, "minutes").valueOf();

        const response = await sendSMS(
          number,
          `Your verification code for My Arena is ${otp}`
        );
        console.log(response);
        if (response.success === true) {
          res.status(200).json({
            success: true,
            message: "Please check your number for verification code",
          });
          await existingUser.save();
        } else {
          return res.status(403).json({
            success: false,
            message: "Couldnot send verification code. Please try again later.",
          });
        }
      }
    } else {
      const otp = generateOTP();

      const generateSalt = await bcrypt.genSalt(10);
      const encryptedPassword = await bcrypt.hash(password, generateSalt);

      const newUser = new users({
        fullName: fullName,
        number: number,
        password: encryptedPassword,
        country: country ?? "Nepal",
        city: city ?? "Kathmandu",
        otp: otp,
        otpTimestamp: moment().add(10, "minutes").valueOf(),
      });

      const response = await sendSMS(
        number,
        `Your verification code for My Arena is ${otp}`
      );
      console.log(response);
      if (response.success === true) {
        res.status(200).json({
          success: true,
          message: "Please check your number for verification code",
        });
        await newUser.save();
      } else {
        return res.status(403).json({
          success: false,
          message: "Couldnot send verification code. Please try again later.",
        });
      }
    }
  } catch (error) {
    console.log(error);
    res.status(500).json({
      success: false,
      message: "Server Error",
    });
  }
};

const numberVerification = async (req, res) => {
  try {
    const { number, otp } = req.body;

    const user = await users.findOne({ number });

    if (!user) {
      return res
        .status(403)
        .json({ success: false, message: "User not found" });
    }

    if (!user.otp) {
      return res.status(403).json({
        success: false,
        message: "Please enter OTP...",
      });
    }

    if (user.otp !== otp) {
      return res.status(403).json({ success: false, message: "Invalid OTP" });
    }

    if (moment(user.otpTimestamp).isBefore(moment())) {
      return res.status(403).json({ success: false, message: "Expired OTP" });
    }

    user.isVerified = true;

    await user.save();
    res.status(200).json({
      success: true,
      message: "Your account is created and verified.",
    });
  } catch (error) {
    console.error("Error:", error);
    res.status(500).json({
      success: false,
      message: "Internal Server Error",
    });
  }
};

const MAX_LOGIN_ATTEMPTS = 10;

const loginUser = async (req, res) => {
  try {
    const { number, password, userTimeZone } = req.body;

    if (!number || !password) {
      return res.status(403).json({
        success: false,
        message: "Please enter all fields",
      });
    }

    let user = await users.findOne({ number: number });
    if (!user) {
      return res.status(403).json({
        success: false,
        message: `☹ No such user found with ${number} ☹`,
      });
    }

    if (user.isBlocked) {
      return res.status(403).json({
        success: false,
        message: "Maximum login attempts exceeded. Account blocked.",
      });
    }

    if (user.isVerified === false) {
      return res.status(403).json({
        success: false,
        message: "Please verify your account",
      });
    }

    if (!user.userTimeZone) {
      const defaultTimeZone = "Asia/Kathmandu";
      const finalUserTimeZone = userTimeZone ?? defaultTimeZone;
      await users.updateOne(
        { number: number },
        { $set: { userTimeZone: finalUserTimeZone } }
      );
    }

    const isPasswordMatch = await bcrypt.compare(password, user.password);

    if (!isPasswordMatch) {
      user.failedLoginAttempts = (user.failedLoginAttempts || 0) + 1;
      if (user.failedLoginAttempts >= MAX_LOGIN_ATTEMPTS) {
        user.isBlocked = true;
        user.failedLoginAttempts = 0;
        await users.updateOne({ _id: user._id }, user);

        return res.status(403).json({
          success: false,
          message:
            "Maximum login attempts exceeded. Account blocked. Contact Admin.",
        });
      }

      await users.updateOne({ _id: user._id }, user);

      return res.status(403).json({
        success: false,
        message: `Invalid password. You have ${
          MAX_LOGIN_ATTEMPTS - user.failedLoginAttempts
        } attempts left.`,
      });
    }
    if (user.failedLoginAttempts) {
      user.failedLoginAttempts = 0;
      await users.updateOne({ _id: user._id }, user);
    }

    const token = jwt.sign({ id: user._id }, process.env.JWT_TOKEN_SECRET);

    res.status(200).json({
      success: true,
      token: token,
      message: `Welcome ${user.fullName}`,
      user: user,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      success: false,
      message: "Internal Server Error",
    });
  }
};

const getUserById = async (req, res) => {
  const { id } = req.params;
  console.log(req.params.id)
  if (!id) {
    return res.status(403).json({
      success: false,
      message: "User ID is required",
    });
  }
  try {
    const user = await users.findById(id);
    if (!user) {
      return res.status(403).json({
        success: false,
        message: "User not found",
      });
    }
    res.status(200).json({
      success: true,
      userDetail: user,
    });
  } catch (error) {
    console.log(error);
    res.status(500).json({
      success: false,
      message: "Internal Server Error",
    });
  }
};

module.exports = {
  createUser,
  loginUser,
  numberVerification,
  getUserById,
};

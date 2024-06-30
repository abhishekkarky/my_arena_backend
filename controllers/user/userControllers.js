const bcrypt = require("bcrypt");
const users = require("../../model/userModel");
const jwt = require("jsonwebtoken");

const registerUser = async (req, res) => {
  const { name, email, password } = req.body;
  if (!name || !email || !password) {
    return res.status(403).json({
      success: false,
      message: "All fields are required!",
    });
  }
  try {
    let existingUser = await users.findOne({ email: email });
    if (existingUser) {
      return res.status(403).json({
        success: false,
        message: "Already registered!",
      });
    } else {
      const genSalt = await bcrypt.genSalt(10);
      const hashedPassword = await bcrypt.hash(password, genSalt);
      const newUser = new users({
        name,
        email,
        password: hashedPassword,
      });
      await newUser.save();
      return res.status(200).json({
        success: true,
        message: "User created successfully!",
      });
    }
  } catch (error) {
    console.log(error);
    return res.status(500).json({
      success: false,
      message: "Internal server error!",
    });
  }
};

const loginUser = async (req, res) => {
  const { email, password } = req.body;
  if (!email || !password) {
    return res.status(403).json({
      success: false,
      message: "Email and password is required!",
    });
  }
  try {
    const existingUser = await users.findOne({ email: email });
    if (!existingUser) {
      return res.status(403).json({
        success: false,
        message: "User not found!",
      });
    } else {
      const comparedPassword = await bcrypt.compare(
        password,
        existingUser.password
      );
      if (!comparedPassword) {
        return res.status(403).json({
          success: false,
          message: "Email or password is incorrect!",
        });
      } else {
        const token = jwt.sign(
          { _id: existingUser._id },
          process.env.JWT_TOKEN_SECRET,
          {
            expiresIn: "7d",
          }
        );
        return res.status(200).json({
          success: true,
          token: token,
          message: `Welcome ${existingUser.name}`,
          user: existingUser,
        });
      }
    }
  } catch (error) {
    console.log(error);
    return res.status(500).json({
      success: false,
      message: "Internal Server Error!",
    });
  }
};

module.exports = {
  registerUser,
  loginUser,
};

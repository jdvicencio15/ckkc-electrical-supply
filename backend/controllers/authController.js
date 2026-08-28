const User = require("../models/User");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const crypto = require("crypto");
const logger = require("../utils/logger");

const {
  sendPasswordResetEmail,
} = require("../utils/emailService");


// Register User
const registerUser = async (req, res) => {
  try {
    const {
      firstName,
      lastName,
      email,
      password,
    } = req.body;


    // Check existing user
    const existingUser = await User.findOne({ email });

    if (existingUser) {
      logger.warn("Registration failed: email already registered");
      return res.status(400).json({
        success: false,
        message: "Email already registered",
      });
    }


    // Hash password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);


    // Create user
    const user = await User.create({
      firstName,
      lastName,
      email,
      password: hashedPassword,
    });

    logger.info("Registration successful");


    res.status(201).json({
      success: true,
      message: "User registered successfully",
      user: {
        id: user._id,
        firstName: user.firstName,
        lastName: user.lastName,
        email: user.email,
      },
    });


  } catch (error) {
    if (error.code === 11000) {
      logger.warn("Registration failed: email already registered");

      return res.status(400).json({
        success: false,
        message: "Email already registered",
      });
    }

    logger.error("Registration failed due to server error");

    res.status(500).json({
      success: false,
      message: "Something went wrong. Please try again later.",
    });
  }
};


// Login User
const loginUser = async (req, res) => {
  try {

    const { email, password } = req.body;


    // Find user
    const user = await User.findOne({ email });


    if (!user) {
      logger.warn("Login failed");

      return res.status(401).json({
        success: false,
       message:"Invalid email or password",
      });
    }


    // Compare password
    const isMatch = await bcrypt.compare(
      password,
      user.password
    );


    if (!isMatch) {
       logger.warn("Login failed");
      return res.status(401).json({
        success: false,
        message:"Invalid email or password",
      });
    }


    // Generate JWT
    const token = jwt.sign(
      {
        id: user._id,
        role: user.role,
      },
      process.env.JWT_SECRET,
      {
        expiresIn: "7d",
      }
    );
logger.info("Login successful");

    res.json({
      success: true,
      token,
      user: {
        id: user._id,
        firstName: user.firstName,
        lastName: user.lastName,
        email: user.email,
      },
    });


  } catch (error) {
     logger.error("Login failed due to server error");
    res.status(500).json({
      success: false,
      message: "Something went wrong. Please try again later.",
    });

  }
};


// Forgot Password
const forgotPassword = async (req, res) => {
  try {
    const { email } = req.body;

    // Find user
    const user = await User.findOne({ email });

    logger.info("Password reset requested");

    // Do not reveal whether the email exists
    if (!user) {
      return res.status(200).json({
        success: true,
        message:
          "If an account with that email exists, a password reset link has been sent.",
      });
    }

    // Generate reset token
    const resetToken = crypto.randomBytes(32).toString("hex");

    // Hash token before saving to database
    const hashedToken = crypto
      .createHash("sha256")
      .update(resetToken)
      .digest("hex");

    // Token expires in 15 minutes
    user.resetToken = hashedToken;
    user.resetTokenExpire =
      Date.now() + 15 * 60 * 1000;

    await user.save();

    // Create reset URL
    const resetUrl =
      `${process.env.CLIENT_URL}/reset-password/${resetToken}`;

    // Send reset email
    await sendPasswordResetEmail(
      user.email,
      resetUrl
    );

    return res.status(200).json({
      success: true,
      message:
        "If an account with that email exists, a password reset link has been sent.",
    });

  } catch (error) {
    logger.error(
      "Password reset request failed due to server error"
    );

    return res.status(500).json({
      success: false,
      message:
        "Something went wrong. Please try again later.",
    });
  }
};

// Reset Password
const resetPassword = async (req, res) => {
  try {
    const {
      token,
      password,
      confirmPassword,
    } = req.body;

    // Check passwords
    if (password !== confirmPassword) {
      logger.warn("Password reset failed");
      return res.status(400).json({
        success: false,
        message: "Passwords do not match",
      });
    }

    // Hash token from request
    const hashedToken = crypto
      .createHash("sha256")
      .update(token)
      .digest("hex");

    // Find user with valid token
    const user = await User.findOne({
      resetToken: hashedToken,
      resetTokenExpire: {
        $gt: new Date(),
      },
    });

    if (!user) {
       logger.warn("Password reset failed");
      return res.status(400).json({
        success: false,
        message: "Invalid or expired reset token",
      });
    }

    // Hash new password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(
      password,
      salt
    );

    // Update password
    user.password = hashedPassword;

    // Clear reset token
    user.resetToken = null;
    user.resetTokenExpire = null;

    await user.save();
logger.info("Password reset successful");
    res.json({
      success: true,
      message: "Password reset successfully",
    });
  } catch (error) {
      logger.error("Password reset failed due to server error");
    res.status(500).json({
      success: false,
      message: "Something went wrong. Please try again later.",
    });
  }
};




module.exports = {
  registerUser,
  loginUser,
  forgotPassword,
  resetPassword,
};
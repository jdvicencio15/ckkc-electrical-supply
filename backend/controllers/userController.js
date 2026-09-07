const User = require("../models/User");
const bcrypt = require("bcryptjs");

// ==============================
// Get Current User
// ==============================

const getMe = async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select(
      "-password -resetToken -resetTokenExpire"
    );

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found.",
      });
    }

    res.json({
      success: true,
      user,
    });
  } catch (error) {
    console.error("Failed to get current user:", error);

    res.status(500).json({
      success: false,
      message:
        "Something went wrong. Please try again later.",
    });
  }
};

// ==============================
// Get All Users
// ==============================

const getUsers = async (req, res) => {
  try {
    const users = await User.find()
      .select("-password -resetToken -resetTokenExpire")
      .sort({ createdAt: -1 });

    res.json({
      success: true,
      data: users,
    });
  } catch (error) {
    console.error("Failed to get users:", error);

    res.status(500).json({
      success: false,
      message: "Failed to load users.",
    });
  }
};

// ==============================
// Get Single User
// ==============================

const getUserById = async (req, res) => {
  try {
    const user = await User.findById(req.params.id).select(
      "-password -resetToken -resetTokenExpire"
    );

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found.",
      });
    }

    res.json({
      success: true,
      user,
    });
  } catch (error) {
    console.error("Failed to get user:", error);

    res.status(500).json({
      success: false,
      message: "Failed to load user.",
    });
  }
};

// ==============================
// Create User
// ==============================

const createUser = async (req, res) => {
  try {
    const {
      firstName,
      lastName,
      email,
      password,
      role,
    } = req.body;

    const existingUser = await User.findOne({
      email: email.toLowerCase(),
    });

    if (existingUser) {
      return res.status(400).json({
        success: false,
        message: "Email already registered.",
      });
    }

    const salt = await bcrypt.genSalt(10);

    const hashedPassword = await bcrypt.hash(
      password,
      salt
    );

  const user = await User.create({
  firstName,
  lastName,
  email,
  password: hashedPassword,
  role: "sales",
  isActive: false,
});

    res.status(201).json({
      success: true,
      message: "User created successfully.",
      user: {
        id: user._id,
        firstName: user.firstName,
        lastName: user.lastName,
        email: user.email,
        role: user.role,
        isActive: user.isActive,
        createdAt: user.createdAt,
      },
    });
  } catch (error) {
    console.error("Failed to create user:", error);

    if (error.code === 11000) {
      return res.status(400).json({
        success: false,
        message: "Email already registered.",
      });
    }

    res.status(500).json({
      success: false,
      message: "Failed to create user.",
    });
  }
};

// ==============================
// Update User
// ==============================

const updateUser = async (req, res) => {
  try {
    const {
      firstName,
      lastName,
      email,
      role,
    } = req.body;

    const user = await User.findById(req.params.id);

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found.",
      });
    }

    if (email && email.toLowerCase() !== user.email) {
      const existingUser = await User.findOne({
        email: email.toLowerCase(),
        _id: { $ne: user._id },
      });

      if (existingUser) {
        return res.status(400).json({
          success: false,
          message: "Email already registered.",
        });
      }

      user.email = email.toLowerCase();
    }

    if (firstName !== undefined) {
      user.firstName = firstName;
    }

    if (lastName !== undefined) {
      user.lastName = lastName;
    }

    if (role !== undefined) {
      user.role = role;
    }

    await user.save();

    res.json({
      success: true,
      message: "User updated successfully.",
      user: {
        id: user._id,
        firstName: user.firstName,
        lastName: user.lastName,
        email: user.email,
        role: user.role,
        isActive: user.isActive,
        updatedAt: user.updatedAt,
      },
    });
  } catch (error) {
    console.error("Failed to update user:", error);

    res.status(500).json({
      success: false,
      message: "Failed to update user.",
    });
  }
};

// ==============================
// Update User Status
// ==============================

const updateUserStatus = async (req, res) => {
  try {
    const { isActive } = req.body;

    const user = await User.findById(req.params.id);

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found.",
      });
    }

    user.isActive = isActive;

    await user.save();

    res.json({
      success: true,
      message: isActive
        ? "User activated successfully."
        : "User deactivated successfully.",
      user: {
        id: user._id,
        firstName: user.firstName,
        lastName: user.lastName,
        email: user.email,
        role: user.role,
        isActive: user.isActive,
      },
    });
  } catch (error) {
    console.error(
      "Failed to update user status:",
      error
    );

    res.status(500).json({
      success: false,
      message: "Failed to update user status.",
    });
  }
};

module.exports = {
  getMe,
  getUsers,
  getUserById,
  createUser,
  updateUser,
  updateUserStatus,
};

const User = require("../models/User");

// Get Current User
const getMe = async (req, res) => {
  try {
    const user = await User.findById(req.user.id)
      .select("-password");

    res.json({
      success: true,
      user,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message:
        "Something went wrong. Please try again later.",
    });
  }
};

module.exports = {
  getMe,
};


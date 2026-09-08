const express = require("express");

const router = express.Router();

const {
  getMe,
  getUsers,
  getUserById,
  createUser,
  updateUser,
  updateUserStatus,
  updateMyProfile,
  changeMyPassword,
} = require("../controllers/userController");

const {
  updateProfileValidator,
  changePasswordValidator,
} = require("../validators/authValidator");

const validationMiddleware = require("../middleware/validationMiddleware");

const protect = require("../middleware/authMiddleware");
const authorize = require("../middleware/authorize");


// Current user
router.get(
  "/me",
  protect,
  getMe
);

// Current user profile
router.patch(
  "/me",
  protect,
  updateProfileValidator,
  validationMiddleware,
  updateMyProfile
);

router.patch(
  "/me/password",
  protect,
  changePasswordValidator,
  validationMiddleware,
  changeMyPassword
);

// User management
router.get(
  "/",
  protect,
  authorize("owner", "admin"),
  getUsers
);

router.post(
  "/",
  protect,
  authorize("owner", "admin"),
  createUser
);

router.get(
  "/:id",
  protect,
  authorize("owner", "admin"),
  getUserById
);

router.put(
  "/:id",
  protect,
  authorize("owner", "admin"),
  updateUser
);

router.patch(
  "/:id/status",
  protect,
  authorize("owner", "admin"),
  updateUserStatus
);

module.exports = router;
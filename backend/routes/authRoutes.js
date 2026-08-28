const express = require("express");

const router = express.Router();

const validationMiddleware = require("../middleware/validationMiddleware");
const { authLimiter } = require("../middleware/rateLimitMiddleware");

const {
  registerUser,
  loginUser,
  forgotPassword,
  resetPassword,
} = require("../controllers/authController");

const {
  registerValidator,
  loginValidator,
  forgotPasswordValidator,
  resetPasswordValidator,
} = require("../validators/authValidator");

// REGISTER
router.post(
  "/register",
  authLimiter,
  registerValidator,
  validationMiddleware,
  registerUser
);



// LOGIN
router.post(
  "/login",
  authLimiter,
  loginValidator,
  validationMiddleware,
  loginUser
);



// FORGOT PASSWORD

router.post(
  "/forgot-password",
  authLimiter,
  forgotPasswordValidator,
  validationMiddleware,
  forgotPassword
);

// RESET PASSWORD

router.post(
  "/reset-password",
  authLimiter,
  resetPasswordValidator,
  validationMiddleware,
  resetPassword
);



module.exports = router;
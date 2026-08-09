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
  forgotPassword
);



// RESET PASSWORD
router.post(
  "/reset-password",
  authLimiter,
  resetPassword
);



module.exports = router;
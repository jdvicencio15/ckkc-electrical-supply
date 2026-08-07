const express = require("express");
const router = express.Router();

const validationMiddleware = require("../middleware/validationMiddleware");


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


router.post(
  "/register",
  registerValidator,
  validationMiddleware,
  registerUser
);


router.post(
  "/login",
  loginValidator,
  validationMiddleware,
  loginUser
);

router.post(
  "/forgot-password",
  forgotPassword
);

router.post(
  "/reset-password",
  resetPassword
);


module.exports = router;
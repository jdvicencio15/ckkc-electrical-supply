const { body } = require("express-validator");

const registerValidator = [
 body("firstName")
  .trim()
  .notEmpty()
  .withMessage("First name is required")
  .isLength({ max: 100 })
  .withMessage("First name must not exceed 100 characters"),

body("lastName")
  .trim()
  .notEmpty()
  .withMessage("Last name is required")
  .isLength({ max: 100 })
  .withMessage("Last name must not exceed 100 characters"),

  body("email")
    .trim()
    .isEmail()
    .withMessage("Invalid email"),

  body("password")
    .isLength({ min: 8 })
    .withMessage("Password must be at least 8 characters"),
];

const loginValidator = [
  body("email")
    .trim()
    .isEmail()
    .withMessage("Invalid email"),

  body("password")
    .notEmpty()
    .withMessage("Password is required"),
];

// FORGOT PASSWORD

const forgotPasswordValidator = [
  body("email")
    .trim()
    .isEmail()
    .withMessage("Invalid email"),
];

// RESET PASSWORD

const resetPasswordValidator = [
  body("token")
    .trim()
    .notEmpty()
    .withMessage("Reset token is required"),

  body("password")
    .isLength({ min: 8 })
    .withMessage("Password must be at least 8 characters"),

  body("confirmPassword")
    .notEmpty()
    .withMessage("Password confirmation is required")
    .custom((value, { req }) => value === req.body.password)
    .withMessage("Passwords do not match"),
];

module.exports = {
  registerValidator,
  loginValidator,
  forgotPasswordValidator,
  resetPasswordValidator,
};
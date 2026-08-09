const { body } = require("express-validator");

const registerValidator = [
  body("firstName")
    .trim()
    .notEmpty()
    .withMessage("First name is required"),

  body("lastName")
    .trim()
    .notEmpty()
    .withMessage("Last name is required"),

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

module.exports = {
  registerValidator,
  loginValidator,
};
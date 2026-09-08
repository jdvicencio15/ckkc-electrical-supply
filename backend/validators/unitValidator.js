const { body } = require("express-validator");

const unitValidator = [
  body("code")
    .trim()
    .notEmpty()
    .withMessage("Unit code is required")
    .isLength({ max: 20 })
    .withMessage("Unit code must not exceed 20 characters"),

  body("name")
    .trim()
    .notEmpty()
    .withMessage("Unit name is required")
    .isLength({ max: 100 })
    .withMessage("Unit name must not exceed 100 characters"),

  body("description")
    .optional()
    .trim(),

  body("status")
    .optional()
    .isIn(["active", "inactive"])
    .withMessage("Status must be either active or inactive"),
];

const unitUpdateValidator = [
  body("code")
    .optional()
    .trim()
    .notEmpty()
    .withMessage("Unit code cannot be empty")
    .isLength({ max: 20 })
    .withMessage("Unit code must not exceed 20 characters"),

  body("name")
    .optional()
    .trim()
    .notEmpty()
    .withMessage("Unit name cannot be empty")
    .isLength({ max: 100 })
    .withMessage("Unit name must not exceed 100 characters"),

  body("description")
    .optional()
    .trim(),

  body("status")
    .optional()
    .isIn(["active", "inactive"])
    .withMessage("Status must be either active or inactive"),
];

module.exports = {
  unitValidator,
  unitUpdateValidator,
};
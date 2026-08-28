const { body } = require("express-validator");

const categoryValidator = [
body("name")
  .trim()
  .notEmpty()
  .withMessage("Category name is required")
  .isLength({ max: 100 })
  .withMessage("Category name must not exceed 100 characters"),

body("description")
  .optional()
  .trim()
  .isLength({ max: 500 })
  .withMessage("Description must not exceed 500 characters"),

  body("status")
    .optional()
    .isIn(["active", "inactive"])
    .withMessage("Status must be either active or inactive"),
];

module.exports = {
  categoryValidator,
};
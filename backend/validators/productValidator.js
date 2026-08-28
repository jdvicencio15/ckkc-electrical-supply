const { body } = require("express-validator");

const productValidator = [
  body("sku")
    .trim()
    .notEmpty()
    .withMessage("SKU is required"),

  body("name")
    .trim()
    .notEmpty()
    .withMessage("Product name is required"),

  body("description")
    .optional()
    .trim(),

  body("categoryId")
    .isMongoId()
    .withMessage("Valid category is required"),

  body("unit")
    .trim()
    .notEmpty()
    .withMessage("Unit is required"),

  body("minimumStock")
    .optional()
    .isFloat({ min: 0 })
    .withMessage("Minimum stock must be 0 or greater"),
];

const productUpdateValidator = [
  body("sku")
    .optional()
    .trim()
    .notEmpty()
    .withMessage("SKU cannot be empty"),

  body("name")
    .optional()
    .trim()
    .notEmpty()
    .withMessage("Product name cannot be empty"),

  body("description")
    .optional()
    .trim(),

  body("categoryId")
    .optional()
    .isMongoId()
    .withMessage("Valid category is required"),

  body("unit")
    .optional()
    .trim()
    .notEmpty()
    .withMessage("Unit cannot be empty"),

  body("minimumStock")
    .optional()
    .isFloat({ min: 0 })
    .withMessage("Minimum stock must be 0 or greater"),

  body("status")
    .optional()
    .isIn(["active", "inactive"])
    .withMessage("Status must be either active or inactive"),
];

module.exports = {
  productValidator,
  productUpdateValidator,
};
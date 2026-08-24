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

module.exports = {
  productValidator,
};
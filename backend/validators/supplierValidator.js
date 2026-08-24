const { body } = require("express-validator");

const supplierValidator = [
  body("supplierCode")
    .trim()
    .notEmpty()
    .withMessage("Supplier code is required")
    .isLength({ max: 50 })
    .withMessage("Supplier code must not exceed 50 characters"),

  body("name")
    .trim()
    .notEmpty()
    .withMessage("Supplier name is required")
    .isLength({ max: 150 })
    .withMessage("Supplier name must not exceed 150 characters"),

  body("contactPerson")
    .optional()
    .trim()
    .isLength({ max: 150 })
    .withMessage("Contact person must not exceed 150 characters"),

  body("email")
    .optional({ values: "falsy" })
    .trim()
    .isEmail()
    .withMessage("Please provide a valid email address"),

  body("phone")
    .optional()
    .trim()
    .isLength({ max: 30 })
    .withMessage("Phone number must not exceed 30 characters"),

  body("address")
    .optional()
    .trim()
    .isLength({ max: 500 })
    .withMessage("Address must not exceed 500 characters"),

  body("supplierType")
    .optional()
    .isIn(["local", "international"])
    .withMessage("Supplier type must be either local or international"),

  body("status")
    .optional()
    .isIn(["active", "inactive"])
    .withMessage("Status must be either active or inactive"),
];

module.exports = {
  supplierValidator,
};
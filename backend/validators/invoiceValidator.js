
const { body } = require("express-validator");

const invoiceValidator = [
  body("invoiceNumber")
    .trim()
    .notEmpty()
    .withMessage("Invoice number is required")
    .isLength({ max: 50 })
    .withMessage("Invoice number must not exceed 50 characters"),

  body("saleId")
    .notEmpty()
    .withMessage("Sale is required")
    .isMongoId()
    .withMessage("Valid sale ID is required"),

  body("invoiceDate")
    .optional()
    .isISO8601()
    .withMessage("Invoice date must be a valid date"),

  body("dueDate")
    .optional()
    .isISO8601()
    .withMessage("Due date must be a valid date"),

  body("status")
    .optional()
    .isIn(["draft", "issued", "cancelled"])
    .withMessage("Invalid invoice status"),
];

const invoiceUpdateValidator = [
  body("invoiceNumber")
    .optional()
    .trim()
    .notEmpty()
    .withMessage("Invoice number cannot be empty")
    .isLength({ max: 50 })
    .withMessage("Invoice number must not exceed 50 characters"),

  body("invoiceDate")
    .optional()
    .isISO8601()
    .withMessage("Invoice date must be a valid date"),

  body("dueDate")
    .optional()
    .isISO8601()
    .withMessage("Due date must be a valid date"),

  body("status")
    .optional()
    .isIn(["draft", "issued", "cancelled"])
    .withMessage("Invalid invoice status"),
];

module.exports = {
  invoiceValidator,
  invoiceUpdateValidator,
};

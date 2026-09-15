const { body } = require("express-validator");

const invoiceValidator = [
  body("saleId")
    .notEmpty()
    .withMessage("Sale is required")
    .isMongoId()
    .withMessage("Valid sale ID is required"),

  body("invoiceNumber")
    .optional()
    .isString()
    .withMessage("Invoice number must be a string"),

  body("invoiceDate")
    .optional()
    .isISO8601()
    .withMessage(
      "Invoice date must be a valid date"
    ),

  body("dueDate")
    .optional()
    .isISO8601()
    .withMessage(
      "Due date must be a valid date"
    ),
];

const invoiceUpdateValidator = [
  body("invoiceDate")
    .optional()
    .isISO8601()
    .withMessage(
      "Invoice date must be a valid date"
    ),

  body("dueDate")
    .optional()
    .isISO8601()
    .withMessage(
      "Due date must be a valid date"
    ),

  body("status")
    .optional()
    .isIn([
      "draft",
      "issued",
      "cancelled",
    ])
    .withMessage(
      "Invalid invoice status"
    ),
];

module.exports = {
  invoiceValidator,
  invoiceUpdateValidator,
};
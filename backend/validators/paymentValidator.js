
const { body } = require("express-validator");

const paymentValidator = [
  body("invoiceId")
    .notEmpty()
    .withMessage("Invoice is required")
    .isMongoId()
    .withMessage("Valid invoice ID is required"),

  body("paymentDate")
    .optional()
    .isISO8601()
    .withMessage("Payment date must be a valid date"),

  body("amount")
    .notEmpty()
    .withMessage("Payment amount is required")
    .isFloat({ min: 0.01 })
    .withMessage("Payment amount must be greater than 0"),

  body("paymentMethod")
    .notEmpty()
    .withMessage("Payment method is required")
    .isIn([
      "cash",
      "bank_transfer",
      "gcash",
      "maya",
      "check",
      "other",
    ])
    .withMessage("Invalid payment method"),

  body("referenceNumber")
    .optional()
    .trim()
    .isLength({ max: 100 })
    .withMessage(
      "Reference number must not exceed 100 characters"
    ),

  body("notes")
    .optional()
    .trim()
    .isLength({ max: 500 })
    .withMessage(
      "Notes must not exceed 500 characters"
    ),
];

const paymentUpdateValidator = [
  body("paymentDate")
    .optional()
    .isISO8601()
    .withMessage("Payment date must be a valid date"),

  body("amount")
    .optional()
    .isFloat({ min: 0.01 })
    .withMessage("Payment amount must be greater than 0"),

  body("paymentMethod")
    .optional()
    .isIn([
      "cash",
      "bank_transfer",
      "gcash",
      "maya",
      "check",
      "other",
    ])
    .withMessage("Invalid payment method"),

  body("referenceNumber")
    .optional()
    .trim()
    .isLength({ max: 100 })
    .withMessage(
      "Reference number must not exceed 100 characters"
    ),

  body("notes")
    .optional()
    .trim()
    .isLength({ max: 500 })
    .withMessage(
      "Notes must not exceed 500 characters"
    ),
];

module.exports = {
  paymentValidator,
  paymentUpdateValidator,
};


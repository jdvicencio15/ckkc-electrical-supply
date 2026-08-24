const { body } = require("express-validator");

const clientPOValidator = [
  body("poNumber")
    .trim()
    .notEmpty()
    .withMessage("PO number is required")
    .isLength({ max: 50 })
    .withMessage("PO number must not exceed 50 characters"),

  body("customerId")
    .notEmpty()
    .withMessage("Customer is required")
    .isMongoId()
    .withMessage("Valid customer ID is required"),

  body("quotationId")
    .optional()
    .isMongoId()
    .withMessage("Valid quotation ID is required"),

  body("poDate")
    .optional()
    .isISO8601()
    .withMessage("PO date must be a valid date"),

  body("status")
    .optional()
    .isIn([
      "draft",
      "received",
      "processing",
      "fulfilled",
      "cancelled",
    ])
    .withMessage("Invalid client PO status"),

  body("items")
    .isArray({ min: 1 })
    .withMessage("Client PO must contain at least one item"),

  body("items.*.productId")
    .isMongoId()
    .withMessage("Valid product ID is required"),

  body("items.*.description")
    .trim()
    .notEmpty()
    .withMessage("Item description is required"),

body("items.*.quantity")
  .isFloat({ min: 0.01 })
  .withMessage(
    "Quantity must be greater than 0"
  ),

  body("items.*.agreedUnitPrice")
    .isFloat({ min: 0 })
    .withMessage(
      "Agreed unit price must be a valid number greater than or equal to 0"
    ),


];

module.exports = {
  clientPOValidator,
};
const { body } = require("express-validator");

const quotationValidator = [
  body("customerId")
    .notEmpty()
    .withMessage("Customer is required")
    .isMongoId()
    .withMessage("Valid customer ID is required"),

  body("quotationDate")
    .optional()
    .isISO8601()
    .withMessage("Quotation date must be a valid date"),

  body("status")
    .optional()
    .isIn([
      "draft",
      "sent",
      "accepted",
      "rejected",
      "expired",
      "cancelled",
    ])
    .withMessage("Invalid quotation status"),

  body("items")
    .isArray({ min: 1 })
    .withMessage("Quotation must contain at least one item"),

  body("items.*.productId")
    .isMongoId()
    .withMessage("Valid product ID is required"),

  body("items.*.description")
    .trim()
    .notEmpty()
    .withMessage("Item description is required"),

body("items.*.quantity")
  .isFloat({ min: 0.01 })
    .withMessage("Quantity must be a valid number greater than 0"),

  body("items.*.supplierCostAtQuotation")
    .isFloat({ min: 0 })
    .withMessage("Supplier cost must be a valid number greater than or equal to 0"),

  body("items.*.quotedUnitPrice")
    .isFloat({ min: 0 })
    .withMessage("Quoted unit price must be a valid number greater than or equal to 0"),

  body("laborCost")
    .optional()
    .isFloat({ min: 0 })
    .withMessage("Labor cost must be a valid number greater than or equal to 0"),

  body("otherDirectCosts")
    .optional()
    .isFloat({ min: 0 })
    .withMessage("Other direct costs must be a valid number greater than or equal to 0"),


];

const quotationUpdateValidator = [
  body("customerId")
    .optional()
    .notEmpty()
    .withMessage("Customer cannot be empty")
    .isMongoId()
    .withMessage("Valid customer ID is required"),

  body("quotationDate")
    .optional()
    .isISO8601()
    .withMessage(
      "Quotation date must be a valid date"
    ),

  body("status")
    .optional()
    .isIn([
      "draft",
      "sent",
      "accepted",
      "rejected",
      "expired",
      "cancelled",
    ])
    .withMessage("Invalid quotation status"),

  body("items")
    .optional()
    .isArray({ min: 1 })
    .withMessage(
      "Quotation must contain at least one item"
    ),

  body("items.*.productId")
    .optional()
    .isMongoId()
    .withMessage("Valid product ID is required"),

  body("items.*.description")
    .optional()
    .trim()
    .notEmpty()
    .withMessage("Item description is required"),

  body("items.*.quantity")
    .optional()
    .isFloat({ min: 0.01 })
    .withMessage(
      "Quantity must be a valid number greater than 0"
    ),

  body("items.*.supplierCostAtQuotation")
    .optional()
    .isFloat({ min: 0 })
    .withMessage(
      "Supplier cost must be a valid number greater than or equal to 0"
    ),

  body("items.*.quotedUnitPrice")
    .optional()
    .isFloat({ min: 0 })
    .withMessage(
      "Quoted unit price must be a valid number greater than or equal to 0"
    ),

  body("laborCost")
    .optional()
    .isFloat({ min: 0 })
    .withMessage(
      "Labor cost must be a valid number greater than or equal to 0"
    ),

  body("otherDirectCosts")
    .optional()
    .isFloat({ min: 0 })
    .withMessage(
      "Other direct costs must be a valid number greater than or equal to 0"
    ),
];


module.exports = {
  quotationValidator,
  quotationUpdateValidator,
};
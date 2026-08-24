const { body } = require("express-validator");

const quotationValidator = [
  body("quotationNumber")
    .trim()
    .notEmpty()
    .withMessage("Quotation number is required")
    .isLength({ max: 50 })
    .withMessage("Quotation number must not exceed 50 characters"),

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
    .isFloat({ min: 0 })
    .withMessage("Quantity must be a valid number greater than or equal to 0"),

  body("items.*.supplierCostAtQuotation")
    .isFloat({ min: 0 })
    .withMessage("Supplier cost must be a valid number greater than or equal to 0"),

  body("items.*.quotedUnitPrice")
    .isFloat({ min: 0 })
    .withMessage("Quoted unit price must be a valid number greater than or equal to 0"),

  body("items.*.markup")
    .optional()
    .isFloat({ min: 0 })
    .withMessage("Markup must be a valid number greater than or equal to 0"),

  body("laborCost")
    .optional()
    .isFloat({ min: 0 })
    .withMessage("Labor cost must be a valid number greater than or equal to 0"),

  body("otherDirectCosts")
    .optional()
    .isFloat({ min: 0 })
    .withMessage("Other direct costs must be a valid number greater than or equal to 0"),

  body("subtotal")
    .optional()
    .isFloat({ min: 0 })
    .withMessage("Subtotal must be a valid number greater than or equal to 0"),

  body("total")
    .optional()
    .isFloat({ min: 0 })
    .withMessage("Total must be a valid number greater than or equal to 0"),
];

module.exports = {
  quotationValidator,
};
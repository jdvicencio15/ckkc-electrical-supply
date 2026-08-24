const { body } = require("express-validator");

const supplierPOValidator = [
  body("poNumber")
    .trim()
    .notEmpty()
    .withMessage("PO number is required")
    .isLength({ max: 50 })
    .withMessage("PO number must not exceed 50 characters"),

  body("supplierId")
    .notEmpty()
    .withMessage("Supplier is required")
    .isMongoId()
    .withMessage("Valid supplier ID is required"),

  body("supplierPODate")
    .optional()
    .isISO8601()
    .withMessage("Supplier PO date must be a valid date"),

  body("status")
    .optional()
    .isIn([
      "draft",
      "sent",
      "confirmed",
      "partially_received",
      "received",
      "cancelled",
    ])
    .withMessage("Invalid supplier PO status"),

  body("relatedClientPOId")
    .optional()
    .isMongoId()
    .withMessage("Valid client PO ID is required"),

  body("items")
    .isArray({ min: 1 })
    .withMessage("Supplier PO must contain at least one item"),

  body("items.*.productId")
    .isMongoId()
    .withMessage("Valid product ID is required"),

  body("items.*.description")
    .trim()
    .notEmpty()
    .withMessage("Item description is required"),

  body("items.*.quantity")
    .isFloat({ min: 0 })
    .withMessage(
      "Quantity must be a valid number greater than or equal to 0"
    ),

  body("items.*.expectedUnitCost")
    .isFloat({ min: 0 })
    .withMessage(
      "Expected unit cost must be a valid number greater than or equal to 0"
    ),

  body("totalAmount")
    .optional()
    .isFloat({ min: 0 })
    .withMessage(
      "Total amount must be a valid number greater than or equal to 0"
    ),
];

module.exports = {
  supplierPOValidator,
};
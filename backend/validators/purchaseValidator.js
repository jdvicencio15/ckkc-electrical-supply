const { body } = require("express-validator");

const purchaseValidator = [
  body("purchaseNumber")
    .trim()
    .notEmpty()
    .withMessage("Purchase number is required")
    .isLength({ max: 50 })
    .withMessage("Purchase number must not exceed 50 characters"),

  body("supplierId")
    .notEmpty()
    .withMessage("Supplier is required")
    .isMongoId()
    .withMessage("Valid supplier ID is required"),

  body("supplierPOId")
    .optional()
    .isMongoId()
    .withMessage("Valid supplier PO ID is required"),

  body("relatedClientPOId")
    .optional()
    .isMongoId()
    .withMessage("Valid client PO ID is required"),

  body("purchaseDate")
    .optional()
    .isISO8601()
    .withMessage("Purchase date must be a valid date"),

  body("items")
    .isArray({ min: 1 })
    .withMessage("Purchase must contain at least one item"),

  body("items.*.productId")
    .isMongoId()
    .withMessage("Valid product ID is required"),

  body("items.*.quantity")
    .isFloat({ min: 0 })
    .withMessage(
      "Quantity must be a valid number greater than or equal to 0"
    ),

  body("items.*.actualUnitCost")
    .isFloat({ min: 0 })
    .withMessage(
      "Actual unit cost must be a valid number greater than or equal to 0"
    ),

  body("items.*.totalCost")
    .isFloat({ min: 0 })
    .withMessage(
      "Total cost must be a valid number greater than or equal to 0"
    ),

  body("totalAmount")
    .optional()
    .isFloat({ min: 0 })
    .withMessage(
      "Total amount must be a valid number greater than or equal to 0"
    ),
];

module.exports = {
  purchaseValidator,
};
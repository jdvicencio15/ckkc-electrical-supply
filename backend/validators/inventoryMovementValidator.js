const { body } = require("express-validator");

const inventoryMovementValidator = [
  body("productId")
    .notEmpty()
    .withMessage("Product is required")
    .isMongoId()
    .withMessage("Valid product ID is required"),

  body("type")
    .notEmpty()
    .withMessage("Movement type is required")
    .isIn(["IN", "OUT", "ADJUSTMENT"])
    .withMessage("Invalid inventory movement type"),

  body("quantity")
    .notEmpty()
    .withMessage("Quantity is required")
    .isFloat({ min: 0.01 })
    .withMessage(
      "Quantity must be a valid number greater than or equal to 0.01"
    ),

  body("unitCost")
    .optional()
    .isFloat({ min: 0 })
    .withMessage(
      "Unit cost must be a valid number greater than or equal to 0"
    ),

  body("referenceType")
    .notEmpty()
    .withMessage("Reference type is required")
    .isIn(["PURCHASE", "SALE", "ADJUSTMENT"])
    .withMessage("Invalid inventory reference type"),

body("referenceId")
  .if((value, { req }) => req.body.referenceType !== "ADJUSTMENT")
  .notEmpty()
  .withMessage("Reference ID is required")
  .isMongoId()
  .withMessage("Valid reference ID is required"),

  body("date")
    .optional()
    .isISO8601()
    .withMessage("Movement date must be a valid date"),

  body("notes")
    .optional()
    .trim()
    .isLength({ max: 500 })
    .withMessage("Notes must not exceed 500 characters"),
];

const inventoryMovementUpdateValidator = [
  body("productId")
    .optional()
    .isMongoId()
    .withMessage("Valid product ID is required"),

  body("type")
    .optional()
    .isIn(["IN", "OUT", "ADJUSTMENT"])
    .withMessage("Invalid inventory movement type"),

  body("quantity")
    .optional()
    .isFloat({ min: 0.01 })
    .withMessage(
      "Quantity must be a valid number greater than or equal to 0.01"
    ),

  body("unitCost")
    .optional()
    .isFloat({ min: 0 })
    .withMessage(
      "Unit cost must be a valid number greater than or equal to 0"
    ),

  body("referenceType")
    .optional()
    .isIn(["PURCHASE", "SALE", "ADJUSTMENT"])
    .withMessage("Invalid inventory reference type"),

  body("referenceId")
    .optional()
    .isMongoId()
    .withMessage("Valid reference ID is required"),

  body("date")
    .optional()
    .isISO8601()
    .withMessage("Movement date must be a valid date"),

  body("notes")
    .optional()
    .trim()
    .isLength({ max: 500 })
    .withMessage("Notes must not exceed 500 characters"),
];

module.exports = {
  inventoryMovementValidator,
  inventoryMovementUpdateValidator,
};
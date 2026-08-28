const { body } = require("express-validator");

const supplierPricingValidator = [
  body("supplierId")
    .notEmpty()
    .withMessage("Supplier is required")
    .isMongoId()
    .withMessage("Valid supplier ID is required"),

  body("productId")
    .notEmpty()
    .withMessage("Product is required")
    .isMongoId()
    .withMessage("Valid product ID is required"),

  body("unitCost")
    .notEmpty()
    .withMessage("Unit cost is required")
    .isFloat({ min: 0 })
    .withMessage("Unit cost must be a valid number greater than or equal to 0"),

  body("effectiveFrom")
    .optional()
    .isISO8601()
    .withMessage("Effective date must be a valid date"),

  body("status")
    .optional()
    .isIn(["active", "inactive"])
    .withMessage("Status must be either active or inactive"),
];

const supplierPricingUpdateValidator = [
  body("supplierId")
    .optional()
    .isMongoId()
    .withMessage("Valid supplier ID is required"),

  body("productId")
    .optional()
    .isMongoId()
    .withMessage("Valid product ID is required"),

  body("unitCost")
    .optional()
    .isFloat({ min: 0 })
    .withMessage(
      "Unit cost must be a valid number greater than or equal to 0"
    ),

  body("effectiveFrom")
    .optional()
    .isISO8601()
    .withMessage("Effective date must be a valid date"),

  body("status")
    .optional()
    .isIn(["active", "inactive"])
    .withMessage(
      "Status must be either active or inactive"
    ),
];

module.exports = {
  supplierPricingValidator,
  supplierPricingUpdateValidator,
};


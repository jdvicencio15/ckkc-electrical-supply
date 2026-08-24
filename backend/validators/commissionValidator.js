const { body } = require("express-validator");

const commissionValidator = [
  body("clientPOId")
    .optional()
    .isMongoId()
    .withMessage("Valid client PO ID is required"),

  body("saleId")
    .optional()
    .isMongoId()
    .withMessage("Valid sale ID is required"),

  body("rate")
    .notEmpty()
    .withMessage("Commission rate is required")
    .isFloat({ min: 0 })
    .withMessage(
      "Commission rate must be a valid number greater than or equal to 0"
    ),

  body("baseAmount")
    .notEmpty()
    .withMessage("Commission base amount is required")
    .isFloat({ min: 0 })
    .withMessage(
      "Commission base amount must be a valid number greater than or equal to 0"
    ),
];

module.exports = {
  commissionValidator,
};
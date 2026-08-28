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

  body()
    .custom((value) => {
      if (!value.clientPOId && !value.saleId) {
        throw new Error(
          "Commission must reference a client PO or sale"
        );
      }

      return true;
    }),

 body("rate")
  .optional()
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

const commissionUpdateValidator = [
  body("clientPOId")
    .optional()
    .isMongoId()
    .withMessage("Valid client PO ID is required"),

  body("saleId")
    .optional()
    .isMongoId()
    .withMessage("Valid sale ID is required"),

  body("baseAmount")
    .optional()
    .isFloat({ min: 0 })
    .withMessage(
      "Commission base amount must be a valid number greater than or equal to 0"
    ),
];

const commissionRateValidator = [
  body("rate")
    .notEmpty()
    .withMessage("Commission rate is required")
    .isFloat({ min: 0 })
    .withMessage(
      "Commission rate must be a valid number greater than or equal to 0"
    ),
];

module.exports = {
  commissionValidator,
  commissionUpdateValidator,
  commissionRateValidator,
};
const { body } = require("express-validator");

const expenseValidator = [
  body("expenseDate")
    .optional()
    .isISO8601()
    .withMessage("Expense date must be a valid date"),

  body("category")
    .notEmpty()
    .withMessage("Expense category is required")
    .isIn(["DIRECT", "OPERATING"])
    .withMessage("Expense category must be DIRECT or OPERATING"),

  body("description")
    .trim()
    .notEmpty()
    .withMessage("Expense description is required"),

  body("amount")
    .notEmpty()
    .withMessage("Expense amount is required")
    .isFloat({ min: 0 })
    .withMessage(
      "Expense amount must be a valid number greater than or equal to 0"
    ),

  body("referenceType")
    .optional()
    .isIn(["SALE", "CLIENT_PO", "OTHER"])
    .withMessage("Invalid expense reference type"),

  body("referenceId")
    .optional()
    .isMongoId()
    .withMessage("Valid reference ID is required"),

  // Reference ID required for SALE / CLIENT_PO
  body().custom((value) => {
    if (
      value.referenceType &&
      value.referenceType !== "OTHER" &&
      !value.referenceId
    ) {
      throw new Error(
        "Reference ID is required when reference type is SALE or CLIENT_PO"
      );
    }

    return true;
  }),
];

const expenseUpdateValidator = [
  body("expenseDate")
    .optional()
    .isISO8601()
    .withMessage("Expense date must be a valid date"),

  body("category")
    .optional()
    .isIn(["DIRECT", "OPERATING"])
    .withMessage("Expense category must be DIRECT or OPERATING"),

  body("description")
    .optional()
    .trim()
    .notEmpty()
    .withMessage("Expense description cannot be empty"),

  body("amount")
    .optional()
    .isFloat({ min: 0 })
    .withMessage(
      "Expense amount must be a valid number greater than or equal to 0"
    ),

  body("referenceType")
    .optional()
    .isIn(["SALE", "CLIENT_PO", "OTHER"])
    .withMessage("Invalid expense reference type"),

  body("referenceId")
    .optional()
    .isMongoId()
    .withMessage("Valid reference ID is required"),
];

module.exports = {
  expenseValidator,
  expenseUpdateValidator,
};
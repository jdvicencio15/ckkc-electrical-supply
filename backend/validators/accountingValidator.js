const { body } = require("express-validator");

/*
|--------------------------------------------------------------------------
| Chart of Accounts Validators
|--------------------------------------------------------------------------
*/

const chartOfAccountValidator = [
  body("accountCode")
    .notEmpty()
    .withMessage("Account code is required")
    .trim()
    .isLength({ max: 20 })
    .withMessage("Account code must not exceed 20 characters"),

  body("accountName")
    .notEmpty()
    .withMessage("Account name is required")
    .trim()
    .isLength({ max: 100 })
    .withMessage("Account name must not exceed 100 characters"),

  body("accountType")
    .notEmpty()
    .withMessage("Account type is required")
    .isIn([
      "asset",
      "liability",
      "equity",
      "revenue",
      "expense",
    ])
    .withMessage("Invalid account type"),

  body("parentAccount")
    .optional({ nullable: true })
    .isMongoId()
    .withMessage("Valid parent account ID is required"),

  body("description")
    .optional()
    .trim()
    .isLength({ max: 500 })
    .withMessage("Description must not exceed 500 characters"),

  body("isActive")
    .optional()
    .isBoolean()
    .withMessage("isActive must be a boolean"),
];

const chartOfAccountUpdateValidator = [
  body("accountCode")
    .optional()
    .trim()
    .isLength({ max: 20 })
    .withMessage("Account code must not exceed 20 characters"),

  body("accountName")
    .optional()
    .trim()
    .isLength({ max: 100 })
    .withMessage("Account name must not exceed 100 characters"),

  body("accountType")
    .optional()
    .isIn([
      "asset",
      "liability",
      "equity",
      "revenue",
      "expense",
    ])
    .withMessage("Invalid account type"),

  body("parentAccount")
    .optional({ nullable: true })
    .isMongoId()
    .withMessage("Valid parent account ID is required"),

  body("description")
    .optional()
    .trim()
    .isLength({ max: 500 })
    .withMessage("Description must not exceed 500 characters"),

  body("isActive")
    .optional()
    .isBoolean()
    .withMessage("isActive must be a boolean"),
];

/*
|--------------------------------------------------------------------------
| Journal Entry Validators
|--------------------------------------------------------------------------
*/

const journalEntryValidator = [
  body("date")
    .optional()
    .isISO8601()
    .withMessage("Journal entry date must be a valid date"),

  body("reference")
    .optional()
    .trim()
    .isLength({ max: 100 })
    .withMessage("Reference must not exceed 100 characters"),

  body("description")
    .notEmpty()
    .withMessage("Journal entry description is required")
    .trim()
    .isLength({ max: 500 })
    .withMessage(
      "Journal entry description must not exceed 500 characters"
    ),

  body("sourceType")
    .optional()
    .trim()
    .isLength({ max: 50 })
    .withMessage("Source type must not exceed 50 characters"),

  body("sourceId")
    .optional()
    .isMongoId()
    .withMessage("Valid source ID is required"),

  body("entries")
    .isArray({ min: 2 })
    .withMessage(
      "Journal entry must contain at least two account entries"
    ),

  body("entries.*.account")
    .notEmpty()
    .withMessage("Account is required")
    .isMongoId()
    .withMessage("Valid account ID is required"),

body("entries.*.debit")
  .optional()
  .isFloat({ min: 0 })
  .withMessage("Debit must be a valid non-negative number")
  .custom((value) => {
    const decimalPlaces = String(value).split(".")[1]?.length || 0;

    if (decimalPlaces > 2) {
      throw new Error("Debit must not exceed 2 decimal places");
    }

    return true;
  }),

 body("entries.*.credit")
  .optional()
  .isFloat({ min: 0 })
  .withMessage("Credit must be a valid non-negative number")
  .custom((value) => {
    const decimalPlaces = String(value).split(".")[1]?.length || 0;

    if (decimalPlaces > 2) {
      throw new Error("Credit must not exceed 2 decimal places");
    }

    return true;
  }),

];

const journalEntryUpdateValidator = [
  body("date")
    .optional()
    .isISO8601()
    .withMessage("Journal entry date must be a valid date"),

  body("reference")
    .optional()
    .trim()
    .isLength({ max: 100 })
    .withMessage("Reference must not exceed 100 characters"),

  body("description")
    .optional()
    .trim()
    .isLength({ max: 500 })
    .withMessage(
      "Journal entry description must not exceed 500 characters"
    ),

  body("sourceType")
    .optional()
    .trim()
    .isLength({ max: 50 })
    .withMessage("Source type must not exceed 50 characters"),

  body("sourceId")
    .optional()
    .isMongoId()
    .withMessage("Valid source ID is required"),

  body("entries")
    .optional()
    .isArray({ min: 2 })
    .withMessage(
      "Journal entry must contain at least two account entries"
    ),

  body("entries.*.account")
    .optional()
    .isMongoId()
    .withMessage("Valid account ID is required"),

body("entries.*.debit")
  .optional()
  .isFloat({ min: 0 })
  .withMessage("Debit must be a valid non-negative number")
  .custom((value) => {
    const decimalPlaces = String(value).split(".")[1]?.length || 0;

    if (decimalPlaces > 2) {
      throw new Error("Debit must not exceed 2 decimal places");
    }

    return true;
  }),


body("entries.*.credit")
  .optional()
  .isFloat({ min: 0 })
  .withMessage("Credit must be a valid non-negative number")
  .custom((value) => {
    const decimalPlaces = String(value).split(".")[1]?.length || 0;

    if (decimalPlaces > 2) {
      throw new Error("Credit must not exceed 2 decimal places");
    }

    return true;
  }),

];

module.exports = {
  chartOfAccountValidator,
  chartOfAccountUpdateValidator,
  journalEntryValidator,
  journalEntryUpdateValidator,
};

const { body } = require("express-validator");

const settingsValidator = [
  // =========================
  // General Settings
  // =========================

  body("businessName")
    .optional()
    .isString()
    .withMessage("Business name must be a string")
    .trim()
    .isLength({ max: 150 })
    .withMessage("Business name must not exceed 150 characters"),

  body("businessEmail")
    .optional()
    .isEmail()
    .withMessage("Business email must be a valid email address")
    .normalizeEmail(),

  body("contactNumber")
    .optional()
    .isString()
    .withMessage("Contact number must be a string")
    .trim()
    .isLength({ max: 30 })
    .withMessage("Contact number must not exceed 30 characters"),

  body("businessAddress")
    .optional()
    .isString()
    .withMessage("Business address must be a string")
    .trim()
    .isLength({ max: 300 })
    .withMessage("Business address must not exceed 300 characters"),

  body("currency")
    .optional()
    .isIn(["PHP", "USD"])
    .withMessage("Currency must be PHP or USD"),

  // =========================
  // Appearance
  // =========================

  body("appearance")
    .optional()
    .isObject()
    .withMessage("Appearance must be an object"),

  body("appearance.systemName")
    .optional()
    .isString()
    .withMessage("System name must be a string")
    .trim()
    .isLength({ min: 1, max: 100 })
    .withMessage("System name must be between 1 and 100 characters"),

  // =========================
  // Sales & Invoicing
  // =========================

  body("salesInvoicing")
    .optional()
    .isObject()
    .withMessage("Sales and invoicing settings must be an object"),

  body("salesInvoicing.invoicePrefix")
    .optional()
    .isString()
    .withMessage("Invoice prefix must be a string")
    .trim()
    .isLength({ min: 1, max: 20 })
    .withMessage("Invoice prefix must be between 1 and 20 characters"),

  body("salesInvoicing.quotationPrefix")
    .optional()
    .isString()
    .withMessage("Quotation prefix must be a string")
    .trim()
    .isLength({ min: 1, max: 20 })
    .withMessage("Quotation prefix must be between 1 and 20 characters"),

  body("salesInvoicing.purchasePrefix")
  .optional()
  .isString()
  .withMessage("Purchase prefix must be a string")
  .trim()
  .isLength({ min: 1, max: 20 })
  .withMessage(
    "Purchase prefix must be between 1 and 20 characters"
  ),

  body("salesInvoicing.clientPOPrefix")
  .optional()
  .isString()
  .withMessage("Client PO prefix must be a string")
  .trim()
  .isLength({ min: 1, max: 20 })
  .withMessage("Client PO prefix must be between 1 and 20 characters"),

body("salesInvoicing.supplierPOPrefix")
  .optional()
  .isString()
  .withMessage("Supplier PO prefix must be a string")
  .trim()
  .isLength({ min: 1, max: 20 })
    .withMessage("Supplier PO prefix must be between 1 and 20 characters"),


  body("salesInvoicing.invoiceStartingNumber")
    .optional()
    .isInt({ min: 1 })
    .withMessage("Invoice starting number must be an integer greater than or equal to 1"),

  body("salesInvoicing.quotationStartingNumber")
    .optional()
    .isInt({ min: 1 })
    .withMessage(
      "Quotation starting number must be an integer greater than or equal to 1"
    ),

  body("salesInvoicing.purchaseStartingNumber")
  .optional()
  .isInt({ min: 1 })
  .withMessage(
    "Purchase starting number must be an integer greater than or equal to 1"
  ),

  body("salesInvoicing.clientPOStartingNumber")
  .optional()
  .isInt({ min: 1 })
  .withMessage(
    "Client PO starting number must be an integer greater than or equal to 1"
  ),

body("salesInvoicing.supplierPOStartingNumber")
  .optional()
  .isInt({ min: 1 })
  .withMessage(
    "Supplier PO starting number must be an integer greater than or equal to 1"
  ),

  body("salesInvoicing.defaultPaymentTerms")
    .optional()
    .isString()
    .withMessage("Default payment terms must be a string")
    .trim()
    .isLength({ min: 1, max: 50 })
    .withMessage(
      "Default payment terms must be between 1 and 50 characters"
    ),

  body("salesInvoicing.defaultTaxRate")
    .optional()
    .isFloat({ min: 0, max: 100 })
    .withMessage("Default tax rate must be between 0 and 100"),

  body("salesInvoicing.documentFooter")
    .optional()
    .isString()
    .withMessage("Document footer must be a string")
    .trim()
    .isLength({ max: 500 })
    .withMessage("Document footer must not exceed 500 characters"),

  // =========================
  // Inventory
  // =========================

  body("inventory")
    .optional()
    .isObject()
    .withMessage("Inventory settings must be an object"),

  body("inventory.lowStockThreshold")
    .optional()
    .isFloat({ min: 0 })
    .withMessage("Low stock threshold must be greater than or equal to 0"),

  body("inventory.allowNegativeStock")
    .optional()
    .isBoolean()
    .withMessage("Allow negative stock must be a boolean"),

  body("inventory.autoDeductStockOnSale")
    .optional()
    .isBoolean()
    .withMessage("Auto deduct stock on sale must be a boolean"),

  body("inventory.autoRestoreStockOnSaleCancellation")
    .optional()
    .isBoolean()
    .withMessage(
      "Auto restore stock on sale cancellation must be a boolean"
    ),

  // =========================
  // Accounting & Tax
  // =========================

  body("accountingTax")
    .optional()
    .isObject()
    .withMessage("Accounting and tax settings must be an object"),

  body("accountingTax.vatEnabled")
    .optional()
    .isBoolean()
    .withMessage("VAT enabled must be a boolean"),

  body("accountingTax.withholdingTaxEnabled")
    .optional()
    .isBoolean()
    .withMessage("Withholding tax enabled must be a boolean"),

  body("accountingTax.fiscalYearStartMonth")
    .optional()
    .isInt({ min: 1, max: 12 })
    .withMessage(
      "Fiscal year start month must be an integer between 1 and 12"
    ),

  body("accountingTax.vatRate")
  .optional()
  .isFloat({ min: 0, max: 100 })
  .withMessage("VAT rate must be between 0 and 100"),

body("accountingTax.pricingMode")
  .optional()
  .isIn(["inclusive", "exclusive"])
  .withMessage(
    "Pricing mode must be either inclusive or exclusive"
  ),

  
  // =========================
  // System Preferences
  // =========================

  body("lowStockNotifications")
    .optional()
    .isBoolean()
    .withMessage("Low stock notifications must be a boolean"),

  body("invoiceNotifications")
    .optional()
    .isBoolean()
    .withMessage("Invoice notifications must be a boolean"),
];

module.exports = settingsValidator;

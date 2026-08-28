const { body } = require("express-validator");

const saleValidator = [
  body("salesNumber")
    .trim()
    .notEmpty()
    .withMessage("Sales number is required")
    .isLength({ max: 50 })
    .withMessage("Sales number must not exceed 50 characters"),

  body("customerId")
    .notEmpty()
    .withMessage("Customer is required")
    .isMongoId()
    .withMessage("Valid customer ID is required"),

  body("clientPOId")
    .optional()
    .isMongoId()
    .withMessage("Valid client PO ID is required"),

  body("saleDate")
    .optional()
    .isISO8601()
    .withMessage("Sale date must be a valid date"),

  body("status")
    .optional()
    .isIn(["draft", "completed", "released", "cancelled"])
    .withMessage("Invalid sale status"),

  body("items")
    .isArray({ min: 1 })
    .withMessage("Sale must contain at least one item"),

  body("items.*.productId")
    .isMongoId()
    .withMessage("Valid product ID is required"),

  body("items.*.description")
    .trim()
    .notEmpty()
    .withMessage("Item description is required"),

  body("items.*.quantity")
    .isFloat({ min: 0.01 })
   .withMessage(
  "Quantity must be a valid number greater than 0"
),

  body("items.*.unitPrice")
    .isFloat({ min: 0 })
    .withMessage(
      "Unit price must be a valid number greater than or equal to 0"
    ),

  body("items.*.unitCost")
    .isFloat({ min: 0 })
    .withMessage(
      "Unit cost must be a valid number greater than or equal to 0"
    ),


  body("directExpenses")
    .optional()
    .isFloat({ min: 0 })
    .withMessage(
      "Direct expenses must be a valid number greater than or equal to 0"
    ),

  body("commission")
    .optional()
    .isFloat({ min: 0 })
    .withMessage(
      "Commission must be a valid number greater than or equal to 0"
    ),

];


const saleUpdateValidator = [
  body("salesNumber")
    .optional()
    .trim()
    .notEmpty()
    .withMessage("Sales number cannot be empty")
    .isLength({ max: 50 })
    .withMessage("Sales number must not exceed 50 characters"),

  body("customerId")
    .optional()
    .notEmpty()
    .withMessage("Customer cannot be empty")
    .isMongoId()
    .withMessage("Valid customer ID is required"),

  body("clientPOId")
    .optional()
    .isMongoId()
    .withMessage("Valid client PO ID is required"),

  body("saleDate")
    .optional()
    .isISO8601()
    .withMessage("Sale date must be a valid date"),

  body("status")
    .optional()
    .isIn(["draft", "completed", "released", "cancelled"])
    .withMessage("Invalid sale status"),

  body("items")
    .optional()
    .isArray({ min: 1 })
    .withMessage("Sale must contain at least one item"),

  body("items.*.productId")
    .optional()
    .isMongoId()
    .withMessage("Valid product ID is required"),

  body("items.*.description")
    .optional()
    .trim()
    .notEmpty()
    .withMessage("Item description is required"),

  body("items.*.quantity")
    .optional()
    .isFloat({ min: 0.01 })
    .withMessage("Quantity must be a valid number greater than 0"),

  body("items.*.unitPrice")
    .optional()
    .isFloat({ min: 0 })
    .withMessage(
      "Unit price must be a valid number greater than or equal to 0"
    ),

  body("items.*.unitCost")
    .optional()
    .isFloat({ min: 0 })
    .withMessage(
      "Unit cost must be a valid number greater than or equal to 0"
    ),

  body("directExpenses")
    .optional()
    .isFloat({ min: 0 })
    .withMessage(
      "Direct expenses must be a valid number greater than or equal to 0"
    ),

  body("commission")
    .optional()
    .isFloat({ min: 0 })
    .withMessage(
      "Commission must be a valid number greater than or equal to 0"
    ),
];



module.exports = {
  saleValidator,
  saleUpdateValidator,
};
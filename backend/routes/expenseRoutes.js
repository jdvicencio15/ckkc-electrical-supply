const express = require("express");
const router = express.Router();

const {
  createExpense,
  getExpenses,
  getExpenseById,
  updateExpense,
  deleteExpense,
} = require("../controllers/expenseController");

const protect = require("../middleware/authMiddleware");
const authorize = require("../middleware/authorize");

const {
  expenseValidator,
} = require("../validators/expenseValidator");

const validationMiddleware = require("../middleware/validationMiddleware");

// CREATE
router.post(
  "/",
  protect,
  authorize("owner", "admin", "accounting"),
  expenseValidator,
  validationMiddleware,
  createExpense
);

// READ ALL
router.get(
  "/",
  protect,
  authorize("owner", "admin", "sales", "purchasing", "accounting"),
  getExpenses
);

// READ SINGLE
router.get(
  "/:id",
  protect,
  authorize("owner", "admin", "sales", "purchasing", "accounting"),
  getExpenseById
);

// UPDATE
router.put(
  "/:id",
  protect,
  authorize("owner", "admin", "accounting"),
  updateExpense
);

// DELETE
router.delete(
  "/:id",
  protect,
  authorize("owner", "admin", "accounting"),
  deleteExpense
);

module.exports = router;
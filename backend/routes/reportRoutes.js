const express = require("express");
const router = express.Router();

const {
  getReportSummary,
  getSalesReport,
  getPurchasesReport,
    getInventoryReport,
  getExpenseReport,
  getIncomeStatement,
  getBalanceSheet,
} = require("../controllers/reportController");

const protect = require("../middleware/authMiddleware");
const authorize = require("../middleware/authorize");

// REPORT SUMMARY
router.get(
  "/summary",
  protect,
  authorize("owner", "admin", "accounting"),
  getReportSummary
);

// SALES REPORT
router.get(
  "/sales",
  protect,
  authorize("owner", "admin", "accounting"),
  getSalesReport
);


// PURCHASES REPORT
router.get(
  "/purchases",
  protect,
  authorize("owner", "admin", "accounting"),
  getPurchasesReport
);


// INVENTORY REPORT
router.get(
  "/inventory",
  protect,
  authorize("owner", "admin", "accounting"),
  getInventoryReport
);

//EXPENSE REPORT
router.get(
  "/expenses",
  protect,
  authorize("owner", "admin", "accounting"),
  getExpenseReport
);

//INCOME STATEMENT REPORT
router.get(
  "/income-statement",
  protect,
  authorize("owner", "admin", "accounting"),
  getIncomeStatement
);

//BALANCE SHEET REPORT
router.get(
  "/balance-sheet",
  protect,
  authorize("owner", "admin", "accounting"),
  getBalanceSheet
);

module.exports = router;
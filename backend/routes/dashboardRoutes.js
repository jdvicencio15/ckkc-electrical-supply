const express = require("express");
const router = express.Router();

const protect = require("../middleware/authMiddleware");
const authorize = require("../middleware/authorize");

const {
  getTodaySummary,
  getDashboardSummary,
} = require("../controllers/dashboardController");

// GET TODAY'S SUMMARY
router.get(
  "/today",
  protect,
  authorize(
    "owner",
    "admin",
    "sales",
    "purchasing",
    "accounting"
  ),
  getTodaySummary
);

// GET DASHBOARD SUMMARY
router.get(
  "/summary",
  protect,
  authorize("owner", "admin"),
  getDashboardSummary
);

module.exports = router;
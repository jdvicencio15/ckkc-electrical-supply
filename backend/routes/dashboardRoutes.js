const express = require("express");
const router = express.Router();

const protect = require("../middleware/authMiddleware");
const authorize = require("../middleware/authorize");

const {
  getTodaySummary,
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

module.exports = router;
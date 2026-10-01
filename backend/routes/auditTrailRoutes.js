const express = require("express");

const {
  getAuditTrails,
  getAuditTrailById,
} = require("../controllers/auditTrailController");

const protect = require("../middleware/authMiddleware");
const authorize = require("../middleware/authorize");

const router = express.Router();

// Audit Trail is read-only and restricted to Owner/Admin.
router.get(
  "/",
  protect,
  authorize("owner", "admin"),
  getAuditTrails
);

router.get(
  "/:id",
  protect,
  authorize("owner", "admin"),
  getAuditTrailById
);

module.exports = router;
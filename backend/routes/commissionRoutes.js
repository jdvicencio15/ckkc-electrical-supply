const express = require("express");
const router = express.Router();

const {
  createCommission,
  getCommissions,
  getCommissionById,
  updateCommission,
  deleteCommission,
} = require("../controllers/commissionController");

const protect = require("../middleware/authMiddleware");

const {
  commissionValidator,
} = require("../validators/commissionValidator");

const validationMiddleware = require("../middleware/validationMiddleware");

// CREATE
router.post(
  "/",
  protect,
  commissionValidator,
  validationMiddleware,
  createCommission
);

// READ ALL
router.get("/", protect, getCommissions);

// READ SINGLE
router.get("/:id", protect, getCommissionById);

// UPDATE
router.put("/:id", protect, updateCommission);

// DELETE
router.delete("/:id", protect, deleteCommission);

module.exports = router;
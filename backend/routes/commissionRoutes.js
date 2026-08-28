const express = require("express");
const router = express.Router();

const {
  createCommission,
  getCommissions,
  getCommissionById,
  updateCommission,
  updateCommissionRate,
  deleteCommission,
} = require("../controllers/commissionController");

const protect = require("../middleware/authMiddleware");
const authorize = require("../middleware/authorize");

const {
  commissionValidator,
  commissionUpdateValidator,
  commissionRateValidator,
} = require("../validators/commissionValidator");

const validationMiddleware = require("../middleware/validationMiddleware");

// CREATE
router.post(
  "/",
  protect,
  authorize("owner", "admin", "accounting"),
  commissionValidator,
  validationMiddleware,
  createCommission
);

// READ ALL
router.get(
  "/",
  protect,
  authorize("owner", "admin", "sales", "purchasing", "accounting"),
  getCommissions
);

// READ SINGLE
router.get(
  "/:id",
  protect,
  authorize("owner", "admin", "sales", "purchasing", "accounting"),
  getCommissionById
);

// UPDATE COMMISSION RATE
router.patch(
  "/:id/rate",
  protect,
  authorize("owner", "admin"),
  commissionRateValidator,
  validationMiddleware,
  updateCommissionRate
);


// UPDATE
router.put(
  "/:id",
  protect,
  authorize("owner", "admin", "accounting"),
  commissionUpdateValidator,
  validationMiddleware,
  updateCommission
);

// DELETE
router.delete(
  "/:id",
  protect,
  authorize("owner", "admin", "accounting"),
  deleteCommission
);

module.exports = router;
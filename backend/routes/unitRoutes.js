const express = require("express");

const router = express.Router();

const {
  getUnits,
  getActiveUnits,
  getUnitById,
  createUnit,
  updateUnit,
  deleteUnit,
} = require("../controllers/unitController");

const {
  unitValidator,
  unitUpdateValidator,
} = require("../validators/unitValidator");

const validationMiddleware = require("../middleware/validationMiddleware");
const authorize = require("../middleware/authorize");
const protect = require("../middleware/authMiddleware");

// GET ALL UNITS
router.get(
  "/",
  protect,
  authorize("owner", "admin", "sales", "purchasing", "accounting"),
  getUnits
);

// GET ACTIVE UNITS
// Used for product UOM selection.
router.get(
  "/active",
  protect,
  authorize("owner", "admin", "sales", "purchasing", "accounting"),
  getActiveUnits
);

// GET SINGLE UNIT
router.get(
  "/:id",
  protect,
  authorize("owner", "admin", "sales", "purchasing", "accounting"),
  getUnitById
);

// CREATE UNIT
router.post(
  "/",
  protect,
  authorize("owner", "admin"),
  unitValidator,
  validationMiddleware,
  createUnit
);

// UPDATE UNIT
router.put(
  "/:id",
  protect,
  authorize("owner", "admin"),
  unitUpdateValidator,
  validationMiddleware,
  updateUnit
);

// DELETE UNIT
router.delete(
  "/:id",
  protect,
  authorize("owner", "admin"),
  deleteUnit
);

module.exports = router;
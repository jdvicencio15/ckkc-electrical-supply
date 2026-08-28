const express = require("express");
const router = express.Router();

const {
  createSupplierPricing,
  getSupplierPricings,
  getSupplierPricingById,
  updateSupplierPricing,
  deleteSupplierPricing,
} = require("../controllers/supplierPricingController");

const authorize = require("../middleware/authorize");

const protect = require("../middleware/authMiddleware");

const {
  supplierPricingValidator,
  supplierPricingUpdateValidator,
} = require("../validators/supplierPricingValidator");

const validationMiddleware = require("../middleware/validationMiddleware");



// CREATE
router.post(
  "/",
  protect,
  authorize("owner", "admin", "purchasing"),
  supplierPricingValidator,
  validationMiddleware,
  createSupplierPricing
);

// READ ALL
router.get(
  "/",
  protect,
  authorize("owner", "admin", "sales", "purchasing", "accounting"),
  getSupplierPricings
);

// READ SINGLE
router.get(
  "/:id",
  protect,
  authorize("owner", "admin", "sales", "purchasing", "accounting"),
  getSupplierPricingById
);

// UPDATE
router.put(
  "/:id",
  protect,
  authorize("owner", "admin", "purchasing"),
  supplierPricingUpdateValidator,
  validationMiddleware,
  updateSupplierPricing
);

// DELETE
router.delete(
  "/:id",
  protect,
  authorize("owner", "admin", "purchasing"),
  deleteSupplierPricing
);

module.exports = router;
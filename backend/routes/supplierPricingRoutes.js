const express = require("express");
const router = express.Router();

const {
  createSupplierPricing,
  getSupplierPricings,
  getSupplierPricingById,
  updateSupplierPricing,
  deleteSupplierPricing,
} = require("../controllers/supplierPricingController");

const protect = require("../middleware/authMiddleware");

const {
  supplierPricingValidator,
} = require("../validators/supplierPricingValidator");

const validationMiddleware = require("../middleware/validationMiddleware");



// CREATE
router.post(
  "/",
  protect,
  supplierPricingValidator,
  validationMiddleware,
  createSupplierPricing
);

// READ ALL
router.get("/", protect, getSupplierPricings);

// READ SINGLE
router.get("/:id", protect, getSupplierPricingById);

// UPDATE
router.put("/:id", protect, updateSupplierPricing);

// DELETE
router.delete("/:id", protect, deleteSupplierPricing);

module.exports = router;
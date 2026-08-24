const express = require("express");
const router = express.Router();

const {
  createPurchase,
  getPurchases,
  getPurchaseById,
  updatePurchase,
  deletePurchase,
} = require("../controllers/purchaseController");

const protect = require("../middleware/authMiddleware");

const {
  purchaseValidator,
} = require("../validators/purchaseValidator");

const validationMiddleware = require("../middleware/validationMiddleware");

// CREATE
router.post(
  "/",
  protect,
  purchaseValidator,
  validationMiddleware,
  createPurchase
);

// READ ALL
router.get("/", protect, getPurchases);

// READ SINGLE
router.get("/:id", protect, getPurchaseById);

// UPDATE
router.put("/:id", protect, updatePurchase);

// DELETE
router.delete("/:id", protect, deletePurchase);

module.exports = router;
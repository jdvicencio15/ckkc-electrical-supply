const express = require("express");
const router = express.Router();

const {
  createSale,
  getSales,
  getSaleById,
  updateSale,
  deleteSale,
  releaseSale,
} = require("../controllers/saleController");

const protect = require("../middleware/authMiddleware");

const {
  saleValidator,
} = require("../validators/saleValidator");

const validationMiddleware = require("../middleware/validationMiddleware");

// CREATE
router.post(
  "/",
  protect,
  saleValidator,
  validationMiddleware,
  createSale
);

// READ ALL
router.get("/", protect, getSales);

// RELEASE SALE
router.post(
  "/:id/release",
  protect,
  releaseSale
);

// READ SINGLE
router.get("/:id", protect, getSaleById);

// UPDATE
router.put("/:id", protect, updateSale);

// DELETE
router.delete("/:id", protect, deleteSale);

module.exports = router;
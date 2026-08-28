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


const authorize = require("../middleware/authorize");

const protect = require("../middleware/authMiddleware");

const {
  saleValidator,
  saleUpdateValidator,
} = require("../validators/saleValidator");

const validationMiddleware = require("../middleware/validationMiddleware");

// CREATE
router.post(
  "/",
  protect,
  authorize("owner", "admin", "sales"),
  saleValidator,
  validationMiddleware,
  createSale
);

// READ ALL
router.get(
  "/",
  protect,
  authorize("owner", "admin", "sales", "purchasing", "accounting"),
  getSales
);

// RELEASE SALE
router.post(
  "/:id/release",
  protect,
  authorize("owner", "admin", "sales"),
  releaseSale
);

// READ SINGLE
router.get(
  "/:id",
  protect,
  authorize("owner", "admin", "sales", "purchasing", "accounting"),
  getSaleById
);

// UPDATE
router.put(
  "/:id",
  protect,
  authorize("owner", "admin", "sales"),
  saleUpdateValidator,
  validationMiddleware,
  updateSale
);

// DELETE
router.delete(
  "/:id",
  protect,
  authorize("owner", "admin", "sales"),
  deleteSale
);
module.exports = router;
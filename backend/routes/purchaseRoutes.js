const express = require("express");
const router = express.Router();

const {
  createPurchase,
  getPurchases,
  getPurchaseById,
  updatePurchase,
  deletePurchase,
  receivePurchase,
} = require("../controllers/purchaseController");

const authorize = require("../middleware/authorize");

const protect = require("../middleware/authMiddleware");

const {
  purchaseValidator,
  purchaseUpdateValidator,
} = require("../validators/purchaseValidator");

const validationMiddleware = require("../middleware/validationMiddleware");

// CREATE
router.post(
  "/",
  protect,
  authorize("owner", "admin", "purchasing"),
  purchaseValidator,
  validationMiddleware,
  createPurchase
);

// READ ALL
router.get(
  "/",
  protect,
  authorize("owner", "admin", "sales", "purchasing", "accounting"),
  getPurchases
);

// RECEIVE PURCHASE
router.post(
  "/:id/receive",
  protect,
  authorize("owner", "admin", "purchasing"),
  receivePurchase
);

// READ SINGLE
router.get(
  "/:id",
  protect,
  authorize("owner", "admin", "sales", "purchasing", "accounting"),
  getPurchaseById
);

// UPDATE
router.put(
  "/:id",
  protect,
  authorize("owner", "admin", "purchasing"),
  purchaseUpdateValidator,
  validationMiddleware,
  updatePurchase
);

// DELETE
router.delete(
  "/:id",
  protect,
  authorize("owner", "admin", "purchasing"),
  deletePurchase
);




module.exports = router;
const express = require("express");
const router = express.Router();

const {
  createQuotation,
  getQuotations,
  getQuotationById,
  updateQuotation,
  deleteQuotation,
} = require("../controllers/quotationController");

const authorize = require("../middleware/authorize");

const protect = require("../middleware/authMiddleware");

const {
  quotationValidator,
  quotationUpdateValidator,
} = require("../validators/quotationValidator");

const validationMiddleware = require("../middleware/validationMiddleware");

// CREATE
router.post(
  "/",
  protect,
  authorize("owner", "admin", "sales"),
  quotationValidator,
  validationMiddleware,
  createQuotation
);

// READ ALL
router.get(
  "/",
  protect,
  authorize("owner", "admin", "sales", "purchasing", "accounting"),
  getQuotations
);

// READ SINGLE
router.get(
  "/:id",
  protect,
  authorize("owner", "admin", "sales", "purchasing", "accounting"),
  getQuotationById
);

// UPDATE
router.put(
  "/:id",
  protect,
  authorize("owner", "admin", "sales"),
  quotationUpdateValidator,
  validationMiddleware,
  updateQuotation
);

// DELETE
router.delete(
  "/:id",
  protect,
  authorize("owner", "admin", "sales"),
  deleteQuotation
);

module.exports = router;
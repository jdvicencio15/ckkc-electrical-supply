const express = require("express");
const router = express.Router();

const {
  createQuotation,
  getQuotations,
  getQuotationById,
  updateQuotation,
  deleteQuotation,
} = require("../controllers/quotationController");

const protect = require("../middleware/authMiddleware");

const {
  quotationValidator,
} = require("../validators/quotationValidator");

const validationMiddleware = require("../middleware/validationMiddleware");

// CREATE
router.post(
  "/",
  protect,
  quotationValidator,
  validationMiddleware,
  createQuotation
);



// READ ALL
router.get("/", protect, getQuotations);

// READ SINGLE
router.get("/:id", protect, getQuotationById);

// UPDATE
router.put("/:id", protect, updateQuotation);

// DELETE
router.delete("/:id", protect, deleteQuotation);

module.exports = router;
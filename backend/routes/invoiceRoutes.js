const express = require("express");
const router = express.Router();

const {
  createInvoice,
  getInvoices,
  getInvoiceById,
  updateInvoice,
  deleteInvoice,
  exportInvoicePDF,
} = require("../controllers/invoiceController");

const authorize = require("../middleware/authorize");
const protect = require("../middleware/authMiddleware");

const {
  invoiceValidator,
  invoiceUpdateValidator,
} = require("../validators/invoiceValidator");

const validationMiddleware = require("../middleware/validationMiddleware");

// CREATE
router.post(
  "/",
  protect,
  authorize("owner", "admin", "sales", "accounting"),
  invoiceValidator,
  validationMiddleware,
  createInvoice
);

// READ ALL
router.get(
  "/",
  protect,
  authorize(
    "owner",
    "admin",
    "sales",
    "purchasing",
    "accounting"
  ),
  getInvoices
);

// READ SINGLE
router.get(
  "/:id",
  protect,
  authorize(
    "owner",
    "admin",
    "sales",
    "purchasing",
    "accounting"
  ),
  getInvoiceById
);

//pdf
router.get(
  "/:id/pdf",
  protect,
  authorize("owner", "admin", "sales", "accounting"),
  exportInvoicePDF,
);


// UPDATE
router.put(
  "/:id",
  protect,
  authorize("owner", "admin", "sales", "accounting"),
  invoiceUpdateValidator,
  validationMiddleware,
  updateInvoice
);

// DELETE
router.delete(
  "/:id",
  protect,
  authorize("owner", "admin", "sales", "accounting"),
  deleteInvoice
);

module.exports = router;
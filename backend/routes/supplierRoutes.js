const express = require("express");
const router = express.Router();

const {
  createSupplier,
  getSuppliers,
  getSupplierById,
  updateSupplier,
  deleteSupplier,
} = require("../controllers/supplierController");

const authorize = require("../middleware/authorize");

const protect = require("../middleware/authMiddleware");

const {
  supplierValidator,
} = require("../validators/supplierValidator");

const validationMiddleware = require("../middleware/validationMiddleware");


// CREATE
router.post(
  "/",
  protect,
  authorize("owner", "admin", "purchasing"),
  supplierValidator,
  validationMiddleware,
  createSupplier
);

// READ ALL
router.get(
  "/",
  protect,
  authorize("owner", "admin", "sales", "purchasing", "accounting"),
  getSuppliers
);

// READ SINGLE
router.get(
  "/:id",
  protect,
  authorize("owner", "admin", "sales", "purchasing", "accounting"),
  getSupplierById
);

// UPDATE
router.put(
  "/:id",
  protect,
  authorize("owner", "admin", "purchasing"),
  updateSupplier
);

// DELETE
router.delete(
  "/:id",
  protect,
  authorize("owner", "admin", "purchasing"),
  deleteSupplier
);

module.exports = router;
const express = require("express");
const router = express.Router();

const {
  createSupplierPO,
  getSupplierPOs,
  getSupplierPOById,
  updateSupplierPO,
  deleteSupplierPO,
} = require("../controllers/supplierPOController");

const authorize = require("../middleware/authorize");

const protect = require("../middleware/authMiddleware");

const {
  supplierPOValidator,
  supplierPOUpdateValidator,
} = require("../validators/supplierPOValidator");

const validationMiddleware = require("../middleware/validationMiddleware");

// CREATE
router.post(
  "/",
  protect,
  authorize("owner", "admin", "purchasing"),
  supplierPOValidator,
  validationMiddleware,
  createSupplierPO
);

// READ ALL
router.get(
  "/",
  protect,
  authorize("owner", "admin", "sales", "purchasing", "accounting"),
  getSupplierPOs
);

// READ SINGLE
router.get(
  "/:id",
  protect,
  authorize("owner", "admin", "sales", "purchasing", "accounting"),
  getSupplierPOById
);

// UPDATE
router.put(
  "/:id",
  protect,
  authorize("owner", "admin", "purchasing"),
  supplierPOUpdateValidator,
  validationMiddleware,
  updateSupplierPO
);


// DELETE
router.delete(
  "/:id",
  protect,
  authorize("owner", "admin", "purchasing"),
  deleteSupplierPO
);

module.exports = router;
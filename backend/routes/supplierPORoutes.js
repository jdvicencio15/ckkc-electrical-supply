const express = require("express");
const router = express.Router();

const {
  createSupplierPO,
  getSupplierPOs,
  getSupplierPOById,
  updateSupplierPO,
  deleteSupplierPO,
} = require("../controllers/supplierPOController");

const protect = require("../middleware/authMiddleware");

const {
  supplierPOValidator,
} = require("../validators/supplierPOValidator");

const validationMiddleware = require("../middleware/validationMiddleware");

// CREATE
router.post(
  "/",
  protect,
  supplierPOValidator,
  validationMiddleware,
  createSupplierPO
);

// READ ALL
router.get("/", protect, getSupplierPOs);

// READ SINGLE
router.get("/:id", protect, getSupplierPOById);

// UPDATE
router.put("/:id", protect, updateSupplierPO);

// DELETE
router.delete("/:id", protect, deleteSupplierPO);

module.exports = router;
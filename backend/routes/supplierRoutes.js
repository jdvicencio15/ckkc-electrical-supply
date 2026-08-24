const express = require("express");
const router = express.Router();

const {
  createSupplier,
  getSuppliers,
  getSupplierById,
  updateSupplier,
  deleteSupplier,
} = require("../controllers/supplierController");

const protect = require("../middleware/authMiddleware");

const {
  supplierValidator,
} = require("../validators/supplierValidator");

const validationMiddleware = require("../middleware/validationMiddleware");


// CREATE
router.post(
  "/",
  protect,
  supplierValidator,
  validationMiddleware,
  createSupplier
);



// READ ALL
router.get("/", protect, getSuppliers);

// READ SINGLE
router.get("/:id", protect, getSupplierById);

// UPDATE
router.put("/:id", protect, updateSupplier);

// DELETE
router.delete("/:id", protect, deleteSupplier);

module.exports = router;
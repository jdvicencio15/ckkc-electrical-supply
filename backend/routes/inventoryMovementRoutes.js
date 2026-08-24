const express = require("express");
const router = express.Router();

const {
  createInventoryMovement,
  getInventoryMovements,
  getInventoryMovementById,
  updateInventoryMovement,
  deleteInventoryMovement,
} = require("../controllers/inventoryMovementController");

const protect = require("../middleware/authMiddleware");

const {
  inventoryMovementValidator,
} = require("../validators/inventoryMovementValidator");

const validationMiddleware = require("../middleware/validationMiddleware");

// CREATE
router.post(
  "/",
  protect,
  inventoryMovementValidator,
  validationMiddleware,
  createInventoryMovement
);

// READ ALL
router.get("/", protect, getInventoryMovements);

// READ SINGLE
router.get("/:id", protect, getInventoryMovementById);

// UPDATE
router.put("/:id", protect, updateInventoryMovement);

// DELETE
router.delete("/:id", protect, deleteInventoryMovement);

module.exports = router;
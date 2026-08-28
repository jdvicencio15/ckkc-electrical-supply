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
const authorize = require("../middleware/authorize");

const {
  inventoryMovementValidator,
  inventoryMovementUpdateValidator,
} = require("../validators/inventoryMovementValidator");

const validationMiddleware = require("../middleware/validationMiddleware");

// CREATE
router.post(
  "/",
  protect,
  authorize("owner", "admin", "purchasing"),
  inventoryMovementValidator,
  validationMiddleware,
  createInventoryMovement
);

// READ ALL
router.get(
  "/",
  protect,
  authorize("owner", "admin", "sales", "purchasing", "accounting"),
  getInventoryMovements
);

// READ SINGLE
router.get(
  "/:id",
  protect,
  authorize("owner", "admin", "sales", "purchasing", "accounting"),
  getInventoryMovementById
);

// UPDATE
router.put(
  "/:id",
  protect,
  authorize("owner", "admin", "purchasing"),
  inventoryMovementUpdateValidator,
  validationMiddleware,
  updateInventoryMovement
);



// DELETE
router.delete(
  "/:id",
  protect,
  authorize("owner", "admin", "purchasing"),
  deleteInventoryMovement
);

module.exports = router;
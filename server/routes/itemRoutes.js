const express = require("express");
const router = express.Router();

const {
  createItem,
  getItems,
  getItemById,
  updateItem,
  deleteItem,
} = require("../controllers/itemController");

const {
  itemValidator,
} = require("../validators/itemValidator");

const validationMiddleware = require("../middleware/validationMiddleware");

const protect = require("../middleware/authMiddleware");

// CREATE
router.post(
  "/",
  protect,
  itemValidator,
  validationMiddleware,
  createItem
);

// READ
router.get(
  "/",
  protect,
  getItems
);

router.get(
  "/:id",
  protect,
  getItemById
);

// UPDATE
router.put(
  "/:id",
  protect,
  updateItem
);

// DELETE
router.delete(
  "/:id",
  protect,
  deleteItem
);

module.exports = router;
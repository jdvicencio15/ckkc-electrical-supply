const express = require("express");
const router = express.Router();

const {
  getItems,
  createItem,
  updateItem,
  deleteItem,
} = require("../controllers/itemController");

const protect = require("../middleware/authMiddleware");


// GET ALL ITEMS
router.get("/", protect, getItems);


// CREATE ITEM
router.post("/", protect, createItem);


// UPDATE ITEM
router.put("/:id", protect, updateItem);


// DELETE ITEM
router.delete("/:id", protect, deleteItem);


module.exports = router;
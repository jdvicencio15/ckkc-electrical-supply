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


// CREATE
router.post(
  "/",
  itemValidator,
  validationMiddleware,
  createItem
);


// READ
router.get("/", getItems);

router.get("/:id", getItemById);


// UPDATE
router.put("/:id", updateItem);


// DELETE
router.delete("/:id", deleteItem);


module.exports = router;
const express = require("express");
const router = express.Router();

const {
  createClientPO,
  getClientPOs,
  getClientPOById,
  updateClientPO,
  deleteClientPO,
} = require("../controllers/clientPOController");

const protect = require("../middleware/authMiddleware");

const {
  clientPOValidator,
} = require("../validators/clientPOValidator");

const validationMiddleware = require("../middleware/validationMiddleware");

// CREATE
router.post(
  "/",
  protect,
  clientPOValidator,
  validationMiddleware,
  createClientPO
);

// READ ALL
router.get("/", protect, getClientPOs);

// READ SINGLE
router.get("/:id", protect, getClientPOById);

// UPDATE
router.put("/:id", protect, updateClientPO);

// DELETE
router.delete("/:id", protect, deleteClientPO);

module.exports = router;
const express = require("express");
const router = express.Router();

const {
  createClientPO,
  getClientPOs,
  getClientPOById,
  updateClientPO,
  deleteClientPO,
} = require("../controllers/clientPOController");

const authorize = require("../middleware/authorize");

const protect = require("../middleware/authMiddleware");

const {
  clientPOValidator,
  clientPOUpdateValidator,
} = require("../validators/clientPOValidator");

const validationMiddleware = require("../middleware/validationMiddleware");

// CREATE
router.post(
  "/",
  protect,
  authorize("owner", "admin", "sales"),
  clientPOValidator,
  validationMiddleware,
  createClientPO
);

// READ ALL
router.get(
  "/",
  protect,
  authorize("owner", "admin", "sales", "purchasing", "accounting"),
  getClientPOs
);

// READ SINGLE
router.get(
  "/:id",
  protect,
  authorize("owner", "admin", "sales", "purchasing", "accounting"),
  getClientPOById
);

// UPDATE
router.put(
  "/:id",
  protect,
  authorize("owner", "admin", "sales"),
  clientPOUpdateValidator,
  validationMiddleware,
  updateClientPO
);

// DELETE
router.delete(
  "/:id",
  protect,
  authorize("owner", "admin", "sales"),
  deleteClientPO
);

module.exports = router;
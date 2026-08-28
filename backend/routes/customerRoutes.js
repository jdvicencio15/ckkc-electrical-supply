const express = require("express");
const router = express.Router();

const {
  createCustomer,
  getCustomers,
  getCustomerById,
  updateCustomer,
  deleteCustomer,
} = require("../controllers/customerController");

const protect = require("../middleware/authMiddleware");
const authorize = require("../middleware/authorize");

const {
  customerValidator,
  customerUpdateValidator,
} = require("../validators/customerValidator");

const validationMiddleware = require("../middleware/validationMiddleware");


// CREATE
router.post(
  "/",
  protect,
  authorize("owner", "admin", "sales"),
  customerValidator,
  validationMiddleware,
  createCustomer
);

// READ ALL
router.get(
  "/",
  protect,
  authorize("owner", "admin", "sales", "purchasing", "accounting"),
  getCustomers
);

// READ SINGLE
router.get(
  "/:id",
  protect,
  authorize("owner", "admin", "sales", "purchasing", "accounting"),
  getCustomerById
);

// UPDATE
router.put(
  "/:id",
  protect,
  authorize("owner", "admin", "sales"),
  customerUpdateValidator,
  validationMiddleware,
  updateCustomer
);

// DELETE
router.delete(
  "/:id",
  protect,
  authorize("owner", "admin", "sales"),
  deleteCustomer
);

module.exports = router;
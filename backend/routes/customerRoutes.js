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

const {
  customerValidator,
} = require("../validators/customerValidator");

const validationMiddleware = require("../middleware/validationMiddleware");


// CREATE
router.post(
  "/",
  protect,
  customerValidator,
  validationMiddleware,
  createCustomer
);

// READ ALL
router.get(
  "/",
  protect,
  getCustomers
);

// READ SINGLE
router.get(
  "/:id",
  protect,
  getCustomerById
);

// UPDATE
router.put(
  "/:id",
  protect,
  updateCustomer
);

// DELETE
router.delete(
  "/:id",
  protect,
  deleteCustomer
);

module.exports = router;

const express = require("express");

const router = express.Router();

const {
  createPayment,
  getPayments,
  getPaymentById,
  updatePayment,
  deletePayment,
} = require("../controllers/paymentController");

const authorize = require("../middleware/authorize");

const protect = require("../middleware/authMiddleware");

const {
  paymentValidator,
  paymentUpdateValidator,
} = require("../validators/paymentValidator");

const validationMiddleware = require("../middleware/validationMiddleware");

// CREATE

router.post(
  "/",
  protect,
  authorize("owner", "admin", "accounting"),
  paymentValidator,
  validationMiddleware,
  createPayment
);

// READ ALL

router.get(
  "/",
  protect,
  authorize("owner", "admin", "accounting"),
  getPayments
);

// READ SINGLE

router.get(
  "/:id",
  protect,
  authorize("owner", "admin", "accounting"),
  getPaymentById
);

// UPDATE

router.put(
  "/:id",
  protect,
  authorize("owner", "admin", "accounting"),
  paymentUpdateValidator,
  validationMiddleware,
  updatePayment
);

// DELETE

router.delete(
  "/:id",
  protect,
  authorize("owner", "admin", "accounting"),
  deletePayment
);

module.exports = router;


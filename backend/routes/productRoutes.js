const express = require("express");
const router = express.Router();

const {
  createProduct,
  getProducts,
  getProductById,
  updateProduct,
  deleteProduct,
} = require("../controllers/productController");

const {
  productValidator,
} = require("../validators/productValidator");

const validationMiddleware = require("../middleware/validationMiddleware");
const protect = require("../middleware/authMiddleware");

// CREATE PRODUCT
router.post(
  "/",
  protect,
  productValidator,
  validationMiddleware,
  createProduct
);

// READ ALL PRODUCTS
router.get(
  "/",
  protect,
  getProducts
);

// READ SINGLE PRODUCT
router.get(
  "/:id",
  protect,
  getProductById
);

// UPDATE PRODUCT
router.put(
  "/:id",
  protect,
  productValidator,
  validationMiddleware,
  updateProduct
);

// DELETE PRODUCT
router.delete(
  "/:id",
  protect,
  deleteProduct
);

module.exports = router;
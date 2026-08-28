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
  productUpdateValidator,
} = require("../validators/productValidator");

const validationMiddleware = require("../middleware/validationMiddleware");
const protect = require("../middleware/authMiddleware");
const authorize = require("../middleware/authorize");


// CREATE PRODUCT
router.post(
  "/",
  protect,
  authorize("owner", "admin", "purchasing"),
  productValidator,
  validationMiddleware,
  createProduct
);

// READ ALL PRODUCTS
router.get(
  "/",
  protect,
  authorize("owner", "admin", "sales", "purchasing", "accounting"),
  getProducts
);

// READ SINGLE PRODUCT
router.get(
  "/:id",
  protect,
  authorize("owner", "admin", "sales", "purchasing", "accounting"),
  getProductById
);

// UPDATE PRODUCT
router.put(
  "/:id",
  protect,
  authorize("owner", "admin", "purchasing"),
  productUpdateValidator,
  validationMiddleware,
  updateProduct
);

// DELETE PRODUCT
router.delete(
  "/:id",
  protect,
  authorize("owner", "admin", "purchasing"),
  deleteProduct
);

module.exports = router;
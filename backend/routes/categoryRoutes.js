const express = require("express");

const router = express.Router();

const {
  getCategories,
  getCategoryById,
  createCategory,
  updateCategory,
  deleteCategory,
} = require("../controllers/categoryController");

const {
  categoryValidator,
  categoryUpdateValidator,
} = require("../validators/categoryValidator");

const validationMiddleware = require("../middleware/validationMiddleware");
const authorize = require("../middleware/authorize");
const protect = require("../middleware/authMiddleware");

// GET ALL CATEGORIES
router.get(
  "/",
  protect,
  authorize(
    "owner",
    "admin",
    "sales",
    "purchasing",
    "accounting"
  ),
  getCategories
);

// GET SINGLE CATEGORY
router.get(
  "/:id",
  protect,
  authorize(
    "owner",
    "admin",
    "sales",
    "purchasing",
    "accounting"
  ),
  getCategoryById
);

// CREATE CATEGORY
router.post(
  "/",
  protect,
  authorize("owner", "admin"),
  categoryValidator,
  validationMiddleware,
  createCategory
);

// UPDATE CATEGORY
router.put(
  "/:id",
  protect,
  authorize("owner", "admin"),
  categoryUpdateValidator,
  validationMiddleware,
  updateCategory
);

// DELETE CATEGORY
router.delete(
  "/:id",
  protect,
  authorize("owner", "admin"),
  deleteCategory
);

module.exports = router;
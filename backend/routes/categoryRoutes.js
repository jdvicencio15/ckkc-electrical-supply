const express = require("express");
const router = express.Router();

const {
  getCategories,
  createCategory,
} = require("../controllers/categoryController");

const { categoryValidator } = require("../validators/categoryValidator");

const validationMiddleware = require("../middleware/validationMiddleware");


const authorize = require("../middleware/authorize");

const protect = require("../middleware/authMiddleware");


router.get(
  "/",
  protect,
  authorize("owner", "admin", "sales", "purchasing", "accounting"),
  getCategories
);

router.post(
  "/",
  protect,
  authorize("owner", "admin"),
  categoryValidator,
  validationMiddleware,
  createCategory
);

module.exports = router;
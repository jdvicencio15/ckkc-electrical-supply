const express = require("express");
const router = express.Router();

const {
  getCategories,
  createCategory,
} = require("../controllers/categoryController");

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
  createCategory
);


module.exports = router;
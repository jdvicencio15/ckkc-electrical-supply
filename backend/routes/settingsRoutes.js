const express = require("express");

const router = express.Router();

const {
  getSettings,
  updateSettings,
} = require("../controllers/settingsController");

const protect = require("../middleware/authMiddleware");
const authorize = require("../middleware/authorize");

// GET SETTINGS
router.get(
  "/",
  protect,
  authorize("owner", "admin"),
  getSettings
);

// UPDATE SETTINGS
router.put(
  "/",
  protect,
  authorize("owner", "admin"),
  updateSettings
);

module.exports = router;
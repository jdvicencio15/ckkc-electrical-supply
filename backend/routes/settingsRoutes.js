const express = require("express");

const router = express.Router();

const {
  getSettings,
  updateSettings,
  uploadLogo,
  removeLogo,
} = require("../controllers/settingsController");

const protect = require("../middleware/authMiddleware");
const authorize = require("../middleware/authorize");
const upload = require("../middleware/upload");

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

// UPLOAD BUSINESS LOGO
router.post(
  "/logo",
  protect,
  authorize("owner", "admin"),
  upload.single("logo"),
  uploadLogo
);

// REMOVE BUSINESS LOGO
router.delete(
  "/logo",
  protect,
  authorize("owner", "admin"),
  removeLogo
);



module.exports = router;
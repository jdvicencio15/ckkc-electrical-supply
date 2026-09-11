const express = require("express");

const router = express.Router();

const {
  getSettings,
  getPublicConfig,
  updateSettings,
  uploadLogo,
  removeLogo,
} = require("../controllers/settingsController");

const protect = require("../middleware/authMiddleware");
const authorize = require("../middleware/authorize");
const upload = require("../middleware/upload");

const settingsValidator = require("../validators/settingsValidator");
const validationMiddleware = require("../middleware/validationMiddleware");

// GET PUBLIC APPLICATION CONFIG
router.get(
  "/public",
  getPublicConfig
);


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
  settingsValidator,
  validationMiddleware,
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



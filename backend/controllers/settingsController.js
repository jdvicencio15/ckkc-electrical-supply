const Settings = require("../models/Settings");
const logger = require("../utils/logger");

// GET SETTINGS
const getSettings = async (req, res) => {
  try {
    let settings = await Settings.findOne();

    // Create default settings if none exist
    if (!settings) {
      settings = await Settings.create({});
    }

    return res.status(200).json({
      success: true,
      settings,
    });
  } catch (error) {
    logger.error(
      `Get settings error: ${error.message}`
    );

    return res.status(500).json({
      success: false,
      message: "Failed to retrieve settings.",
    });
  }
};

// UPDATE SETTINGS
const updateSettings = async (req, res) => {
  try {
    const {
      businessName,
      businessEmail,
      contactNumber,
      currency,
      appearance,
      lowStockNotifications,
      invoiceNotifications,
    } = req.body;

    let settings = await Settings.findOne();

    // Create if no settings document exists
    if (!settings) {
      settings = new Settings();
    }

    // =========================
    // General Settings
    // =========================

    if (businessName !== undefined) {
      settings.businessName =
        businessName.trim();
    }

    if (businessEmail !== undefined) {
      settings.businessEmail =
        businessEmail.trim().toLowerCase();
    }

    if (contactNumber !== undefined) {
      settings.contactNumber =
        contactNumber.trim();
    }

    if (currency !== undefined) {
      settings.currency = currency;
    }

    // =========================
    // Appearance
    // =========================

    if (appearance !== undefined) {
      if (
        appearance.systemName !== undefined
      ) {
        settings.appearance.systemName =
          appearance.systemName.trim();
      }

      if (appearance.logo !== undefined) {
        settings.appearance.logo =
          appearance.logo;
      }
    }

    // =========================
    // System Preferences
    // =========================

    if (
      lowStockNotifications !== undefined
    ) {
      settings.lowStockNotifications =
        lowStockNotifications;
    }

    if (
      invoiceNotifications !== undefined
    ) {
      settings.invoiceNotifications =
        invoiceNotifications;
    }

    await settings.save();

    logger.info(
      `System settings updated by user ${req.user._id}`
    );

    return res.status(200).json({
      success: true,
      message:
        "Settings updated successfully.",
      settings,
    });
  } catch (error) {
    logger.error(
      `Update settings error: ${error.message}`
    );

    return res.status(500).json({
      success: false,
      message: "Failed to update settings.",
    });
  }
};

module.exports = {
  getSettings,
  updateSettings,
};
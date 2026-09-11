const Settings = require("../models/Settings");
const logger = require("../utils/logger");

const fs = require("fs");

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

// GET PUBLIC APPLICATION CONFIG
const getPublicConfig = async (req, res) => {
  try {
    let settings = await Settings.findOne();

    // Create default settings if none exist
    if (!settings) {
      settings = await Settings.create({});
    }

    return res.status(200).json({
      success: true,
      config: {
        businessName: settings.businessName,
        systemName: settings.appearance.systemName,
        logo: settings.appearance.logo,
      },
    });
  } catch (error) {
    logger.error(
      `Get public application config error: ${error.message}`
    );

    return res.status(500).json({
      success: false,
      message: "Failed to retrieve application configuration.",
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
  businessAddress,
  currency,
  appearance,
  salesInvoicing,
  inventory,
  accountingTax,
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

    if (businessAddress !== undefined) {
  settings.businessAddress =
    businessAddress.trim();
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

  if (salesInvoicing !== undefined) {
  if (
    salesInvoicing.invoicePrefix !== undefined
  ) {
    settings.salesInvoicing.invoicePrefix =
      salesInvoicing.invoicePrefix.trim();
  }

  if (
    salesInvoicing.quotationPrefix !== undefined
  ) {
    settings.salesInvoicing.quotationPrefix =
      salesInvoicing.quotationPrefix.trim();
    }

    if (
  salesInvoicing.purchasePrefix !== undefined
) {
  settings.salesInvoicing.purchasePrefix =
    salesInvoicing.purchasePrefix.trim();
}

  if (
    salesInvoicing.invoiceStartingNumber !== undefined
  ) {
    settings.salesInvoicing.invoiceStartingNumber =
      Number(
        salesInvoicing.invoiceStartingNumber
      );
  }

  if (
    salesInvoicing.quotationStartingNumber !== undefined
  ) {
    settings.salesInvoicing.quotationStartingNumber =
      Number(
        salesInvoicing.quotationStartingNumber
      );
    }

if (
  salesInvoicing.purchaseStartingNumber !== undefined
) {
  settings.salesInvoicing.purchaseStartingNumber =
    Number(
      salesInvoicing.purchaseStartingNumber
    );
}

    if (
  salesInvoicing.clientPOPrefix !== undefined
) {
  settings.salesInvoicing.clientPOPrefix =
    salesInvoicing.clientPOPrefix.trim();
}

if (
  salesInvoicing.clientPOStartingNumber !== undefined
) {
  settings.salesInvoicing.clientPOStartingNumber =
    Number(
      salesInvoicing.clientPOStartingNumber
    );
}

if (
  salesInvoicing.supplierPOPrefix !== undefined
) {
  settings.salesInvoicing.supplierPOPrefix =
    salesInvoicing.supplierPOPrefix.trim();
}

if (
  salesInvoicing.supplierPOStartingNumber !== undefined
) {
  settings.salesInvoicing.supplierPOStartingNumber =
    Number(
      salesInvoicing.supplierPOStartingNumber
    );
    }

if (
  salesInvoicing.salesPrefix !== undefined
) {
  settings.salesInvoicing.salesPrefix =
    salesInvoicing.salesPrefix.trim();
}

if (
  salesInvoicing.salesStartingNumber !== undefined
) {
  settings.salesInvoicing.salesStartingNumber =
    Number(
      salesInvoicing.salesStartingNumber
    );
    }




  if (
    salesInvoicing.defaultPaymentTerms !== undefined
  ) {
    settings.salesInvoicing.defaultPaymentTerms =
      salesInvoicing.defaultPaymentTerms.trim();
  }

  if (
    salesInvoicing.defaultTaxRate !== undefined
  ) {
    settings.salesInvoicing.defaultTaxRate =
      Number(
        salesInvoicing.defaultTaxRate
      );
  }

  if (
    salesInvoicing.documentFooter !== undefined
  ) {
    settings.salesInvoicing.documentFooter =
      salesInvoicing.documentFooter.trim();
  }
    }

  if (inventory !== undefined) {
  if (inventory.lowStockThreshold !== undefined) {
    settings.inventory.lowStockThreshold =
      Number(inventory.lowStockThreshold);
  }

  if (inventory.allowNegativeStock !== undefined) {
    settings.inventory.allowNegativeStock =
      inventory.allowNegativeStock;
  }

  if (inventory.autoDeductStockOnSale !== undefined) {
    settings.inventory.autoDeductStockOnSale =
      inventory.autoDeductStockOnSale;
  }

  if (
    inventory.autoRestoreStockOnSaleCancellation !==
    undefined
  ) {
    settings.inventory.autoRestoreStockOnSaleCancellation =
      inventory.autoRestoreStockOnSaleCancellation;
  }
}

 if (accountingTax !== undefined) {
  if (accountingTax.vatEnabled !== undefined) {
    settings.accountingTax.vatEnabled =
      accountingTax.vatEnabled;
  }

  if (accountingTax.vatRate !== undefined) {
    settings.accountingTax.vatRate =
      Number(accountingTax.vatRate);
  }

  if (accountingTax.pricingMode !== undefined) {
    settings.accountingTax.pricingMode =
      accountingTax.pricingMode;
  }

  if (
    accountingTax.withholdingTaxEnabled !==
    undefined
  ) {
    settings.accountingTax.withholdingTaxEnabled =
      accountingTax.withholdingTaxEnabled;
  }

  if (
    accountingTax.fiscalYearStartMonth !==
    undefined
  ) {
    settings.accountingTax.fiscalYearStartMonth =
      Number(
        accountingTax.fiscalYearStartMonth
      );
  }
}




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



// UPLOAD BUSINESS LOGO
const uploadLogo = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: "Please select a logo image.",
      });
    }

    const {
      uploadLogo: uploadToCloudinary,
      deleteLogo,
    } = require("../services/cloudinaryService");

    let settings = await Settings.findOne();

    if (!settings) {
      settings = new Settings();
    }

    // Store old logo information
    const oldPublicId =
      settings.appearance.logo.publicId;

    // =========================
    // Upload new logo first
    // =========================

    const uploadedLogo = await uploadToCloudinary(
      req.file.path
    );

    // =========================
    // Delete temporary local file
    // =========================

    fs.unlink(req.file.path, (error) => {
      if (error) {
        logger.error(
          `Failed to delete temporary logo file: ${error.message}`
        );
      }
    });

    // =========================
    // Delete old Cloudinary logo
    // Only after new upload succeeds
    // =========================

    if (oldPublicId) {
      await deleteLogo(oldPublicId);
    }

    // =========================
    // Save new logo
    // =========================

    settings.appearance.logo = {
      url: uploadedLogo.url,
      publicId: uploadedLogo.publicId,
    };

    await settings.save();

    logger.info(
      `Business logo updated by user ${req.user._id}`
    );

    return res.status(200).json({
      success: true,
      message:
        "Business logo uploaded successfully.",
      logo: settings.appearance.logo,
      settings,
    });
  } catch (error) {
    // Cleanup temporary file if upload fails
    if (req.file?.path) {
      fs.unlink(req.file.path, (unlinkError) => {
        if (unlinkError) {
          logger.error(
            `Failed to cleanup temporary logo file: ${unlinkError.message}`
          );
        }
      });
    }

    logger.error(
      `Upload logo error: ${error.message}`
    );

    return res.status(500).json({
      success: false,
      message:
        "Failed to upload business logo.",
    });
  }
};


// REMOVE BUSINESS LOGO
const removeLogo = async (req, res) => {
  try {
    const settings = await Settings.findOne();

    if (!settings) {
      return res.status(404).json({
        success: false,
        message: "Settings not found.",
      });
    }

    const publicId =
      settings.appearance.logo.publicId;

    // Nothing to remove
    if (!publicId) {
      return res.status(400).json({
        success: false,
        message: "No business logo found.",
      });
    }

    const { deleteLogo } = require("../services/cloudinaryService");

    // Remove from Cloudinary
    await deleteLogo(publicId);

    // Remove from MongoDB
    settings.appearance.logo = {
      url: "",
      publicId: "",
    };

    await settings.save();

    logger.info(
      `Business logo removed by user ${req.user._id}`
    );

    return res.status(200).json({
      success: true,
      message:
        "Business logo removed successfully.",
      settings,
    });
  } catch (error) {
    logger.error(
      `Remove logo error: ${error.message}`
    );

    return res.status(500).json({
      success: false,
      message:
        "Failed to remove business logo.",
    });
  }
};

module.exports = {
  getSettings,
  getPublicConfig,
  updateSettings,
  uploadLogo,
  removeLogo,
};


const mongoose = require("mongoose");
const dotenv = require("dotenv");

const Settings = require("../models/Settings");

dotenv.config();

const dns = require("node:dns/promises");

dns.setServers(["1.1.1.1", "8.8.8.8"]);

const seedSettings = async () => {
  try {
    if (!process.env.MONGO_URI) {
      throw new Error("MONGO_URI is not configured.");
    }

    await mongoose.connect(process.env.MONGO_URI);

    console.log("MongoDB connected.");
    console.log("Database:", mongoose.connection.name);

    // Prevent duplicate settings
    const existingSettings = await Settings.findOne();

    if (existingSettings) {
      console.log("Settings already exist.");
      return;
    }

    const settings = await Settings.create({
      // =========================
      // Business Information
      // =========================
      businessName: "",
      businessEmail: "",
      contactNumber: "",
      businessAddress: "",
      currency: "PHP",

      // =========================
      // Appearance
      // =========================
      appearance: {
        logo: {
          url: "",
          publicId: "",
        },
        systemName: "",
      },

      // =========================
      // Sales & Invoicing
      // =========================
      salesInvoicing: {
        salesPrefix: "SAL-",
        salesStartingNumber: 1,

        invoicePrefix: "INV-",
        invoiceStartingNumber: 1,

        quotationPrefix: "QUO-",
        quotationStartingNumber: 1,

        purchasePrefix: "PUR-",
        purchaseStartingNumber: 1,

        clientPOPrefix: "CPO-",
        clientPOStartingNumber: 1,

        supplierPOPrefix: "SPO-",
        supplierPOStartingNumber: 1,

        defaultPaymentTerms: "Due on Receipt",

        defaultTaxRate: 0,

        documentFooter: "",
      },

      // =========================
      // Inventory
      // =========================
      inventory: {
        lowStockThreshold: 10,
        allowNegativeStock: false,
        autoDeductStockOnSale: true,
        autoRestoreStockOnSaleCancellation: true,
      },

      // =========================
      // Accounting & Tax
      // =========================
      accountingTax: {
        vatEnabled: false,
        vatRate: 12,
        pricingMode: "inclusive",
        withholdingTaxEnabled: false,
      },

      // =========================
      // Fiscal Year
      // =========================
      // Reserved for future V2 implementation.
      fiscalYear: {
        startMonth: 1,
      },

      // =========================
      // System Preferences
      // =========================
      lowStockNotifications: true,
      invoiceNotifications: true,
    });

    console.log("\n=================================");
    console.log("Settings seed completed.");
    console.log("=================================");
    console.log("System Name:", settings.appearance.systemName);
    console.log("Currency:", settings.currency);
    console.log("VAT Enabled:", settings.accountingTax.vatEnabled);
    console.log("=================================\n");
  } catch (error) {
    console.error("\n❌ Settings seed failed:");
    console.error(error.message);

    process.exitCode = 1;
  } finally {
    await mongoose.disconnect();
  }
};

seedSettings();
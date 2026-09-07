const mongoose = require("mongoose");

const settingsSchema = new mongoose.Schema(
  {
    businessName: {
      type: String,
      trim: true,
      default: "",
    },

    businessEmail: {
      type: String,
      trim: true,
      lowercase: true,
      default: "",
    },

    contactNumber: {
      type: String,
      trim: true,
      default: "",
    },

    currency: {
      type: String,
      enum: ["PHP", "USD"],
      default: "PHP",
    },

    // =========================
    // Appearance
    // =========================
    appearance: {
      logo: {
        type: String,
        default: "",
      },

      systemName: {
        type: String,
        trim: true,
        default: "CKKC",
      },
    },

    // =========================
    // System Preferences
    // =========================
    lowStockNotifications: {
      type: Boolean,
      default: true,
    },

    invoiceNotifications: {
      type: Boolean,
      default: true,
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model(
  "Settings",
  settingsSchema
);
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

    businessAddress: {
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
    url: {
      type: String,
      default: "",
    },

    publicId: {
      type: String,
      default: "",
    },
  },
      systemName: {
        type: String,
        trim: true,
        default: "CKKC",
      },
    },

salesInvoicing: {

      salesPrefix: {
    type: String,
    trim: true,
    default: "SAL-",
  },

  salesStartingNumber: {
    type: Number,
    default: 1,
    min: 1,
      },

  invoicePrefix: {
    type: String,
    trim: true,
    default: "INV-",
  },

  quotationPrefix: {
    type: String,
    trim: true,
    default: "QUO-",
  },

  invoiceStartingNumber: {
    type: Number,
    default: 1,
    min: 1,
  },

  quotationStartingNumber: {
    type: Number,
    default: 1,
    min: 1,
  },

  purchasePrefix: {
    type: String,
    trim: true,
    default: "PUR-",
  },

  purchaseStartingNumber: {
    type: Number,
    default: 1,
    min: 1,
  },

  clientPOPrefix: {
    type: String,
    trim: true,
    default: "CPO-",
  },

  clientPOStartingNumber: {
    type: Number,
    default: 1,
    min: 1,
    },

  supplierPOPrefix: {
  type: String,
  trim: true,
  default: "SPO-",
},

supplierPOStartingNumber: {
  type: Number,
  default: 1,
  min: 1,
    },


  defaultPaymentTerms: {
    type: String,
    trim: true,
    default: "Due on Receipt",
  },

  defaultTaxRate: {
    type: Number,
    default: 0,
    min: 0,
    max: 100,
  },

  documentFooter: {
    type: String,
    trim: true,
    default: "",
  },
},

    inventory: {
  lowStockThreshold: {
    type: Number,
    default: 10,
    min: 0,
  },

  allowNegativeStock: {
    type: Boolean,
    default: false,
  },

  autoDeductStockOnSale: {
    type: Boolean,
    default: true,
  },

  autoRestoreStockOnSaleCancellation: {
    type: Boolean,
    default: true,
  },
    },

accountingTax: {
  vatEnabled: {
    type: Boolean,
    default: false,
  },

  vatRate: {
    type: Number,
    default: 12,
    min: 0,
    max: 100,
  },

  pricingMode: {
    type: String,
    enum: ["inclusive", "exclusive"],
    default: "inclusive",
  },

  withholdingTaxEnabled: {
    type: Boolean,
    default: false,
  },

  fiscalYearStartMonth: {
    type: Number,
    default: 1,
    min: 1,
    max: 12,
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
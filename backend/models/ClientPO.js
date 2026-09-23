const mongoose = require("mongoose");

const clientPOItemSchema = new mongoose.Schema(
  {
    productId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Product",
      required: true,
    },

    description: {
      type: String,
      required: true,
      trim: true,
    },

    quantity: {
      type: Number,
      required: true,
      min: 0.01,
    },

    agreedUnitPrice: {
      type: Number,
      required: true,
      min: 0,
    },

    unitId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Unit",
      required: true,
    },

    unitCode: {
      type: String,
      required: true,
      trim: true,
      uppercase: true,
    },
  },
  { _id: false },
);

const clientPOSchema = new mongoose.Schema(
  {
    poNumber: {
      type: String,
      required: true,
      unique: true,
      trim: true,
      uppercase: true,
    },

    customerId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Customer",
      required: true,
    },

    quotationId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Quotation",
    },

    poDate: {
      type: Date,
      default: Date.now,
    },

 status: {
  type: String,
  enum: ["received", "fulfilled", "cancelled"],
  default: "received",
},

    items: {
      type: [clientPOItemSchema],
      required: true,
      validate: {
        validator: (items) => items.length > 0,
        message: "Client PO must contain at least one item",
      },
    },

    // =========================
    // COMMERCIAL COSTS
    // =========================

    laborCost: {
      type: Number,
      default: 0,
      min: 0,
    },

    otherDirectCosts: {
      type: Number,
      default: 0,
      min: 0,
    },

    // =========================
    // TAX SNAPSHOT
    // =========================

    subtotal: {
      type: Number,
      default: 0,
      min: 0,
    },

    taxRate: {
      type: Number,
      default: 0,
      min: 0,
      max: 100,
    },

    taxAmount: {
      type: Number,
      default: 0,
      min: 0,
    },

    pricingMode: {
      type: String,
      enum: ["inclusive", "exclusive"],
      default: "inclusive",
    },

    netAmount: {
      type: Number,
      default: 0,
      min: 0,
    },

    totalAmount: {
      type: Number,
      default: 0,
      min: 0,
    },

    // =========================
    // AUDIT
    // =========================

    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

    updatedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },
  },
  {
    timestamps: true,
  },
);

module.exports = mongoose.model("ClientPO", clientPOSchema);
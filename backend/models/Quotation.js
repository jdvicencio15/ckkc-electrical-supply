const mongoose = require("mongoose");

const quotationItemSchema = new mongoose.Schema(
  {
    productId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Product",
      required: true,
    },

    supplierId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Supplier",
      required: false,
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

    supplierCostAtQuotation: {
      type: Number,
      required: true,
      min: 0,
    },

    costSource: {
      type: String,
      enum: ["product_cost", "supplier_pricing"],
      required: true,
    },

    quotedUnitPrice: {
      type: Number,
      required: true,
      min: 0,
    },

    markup: {
      type: Number,
      default: 0,
    },
  },
  { _id: false },
);

const quotationSchema = new mongoose.Schema(
  {
    quotationNumber: {
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

    quotationDate: {
      type: Date,
      default: Date.now,
    },

    status: {
      type: String,
      enum: ["draft", "sent", "accepted", "rejected", "expired", "cancelled"],
      default: "draft",
    },

    items: {
      type: [quotationItemSchema],
      required: true,
      validate: {
        validator: (items) => items.length > 0,
        message: "Quotation must contain at least one item",
      },
    },

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

    total: {
      type: Number,
      default: 0,
      min: 0,
    },

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

module.exports = mongoose.model("Quotation", quotationSchema);

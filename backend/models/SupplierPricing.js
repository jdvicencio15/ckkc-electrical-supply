const mongoose = require("mongoose");

const supplierPricingSchema = new mongoose.Schema(
  {
    supplierId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Supplier",
      required: true,
    },

    productId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Product",
      required: true,
    },

    unitCost: {
      type: Number,
      required: true,
      min: 0,
    },

    effectiveFrom: {
      type: Date,
      default: Date.now,
    },

    status: {
      type: String,
      enum: ["active", "inactive"],
      default: "active",
    },
  },
  {
    timestamps: true,
  }
);

supplierPricingSchema.index(
  { supplierId: 1, productId: 1 },
  { unique: true }
);

module.exports = mongoose.model(
  "SupplierPricing",
  supplierPricingSchema
);
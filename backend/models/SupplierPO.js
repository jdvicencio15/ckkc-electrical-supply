const mongoose = require("mongoose");

const supplierPOItemSchema = new mongoose.Schema(
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

    expectedUnitCost: {
      type: Number,
      required: true,
      min: 0,
    },
  },
  { _id: false }
);

const supplierPOSchema = new mongoose.Schema(
  {
    poNumber: {
      type: String,
      required: true,
      unique: true,
      trim: true,
      uppercase: true,
    },

    supplierId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Supplier",
      required: true,
    },

    supplierPODate: {
      type: Date,
      default: Date.now,
    },

    status: {
      type: String,
      enum: [
        "draft",
        "sent",
        "confirmed",
        "partially_received",
        "received",
        "cancelled",
      ],
      default: "draft",
    },

    relatedClientPOId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "ClientPO",
    },

    items: {
      type: [supplierPOItemSchema],
      required: true,
      validate: {
        validator: (items) => items.length > 0,
        message: "Supplier PO must contain at least one item",
      },
    },

    totalAmount: {
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
  }
);

module.exports = mongoose.model("SupplierPO", supplierPOSchema);
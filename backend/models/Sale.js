const mongoose = require("mongoose");

const saleItemSchema = new mongoose.Schema(
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

    unitPrice: {
      type: Number,
      required: true,
      min: 0,
    },

    unitCost: {
      type: Number,
      required: true,
      min: 0,
    },

    profit: {
      type: Number,
      default: 0,
    },
  },
  { _id: false }
);

const saleSchema = new mongoose.Schema(
  {
    salesNumber: {
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

    clientPOId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "ClientPO",
    },

    saleDate: {
      type: Date,
      default: Date.now,
    },

    status: {
      type: String,
      enum: [
        "draft",
        "completed",
        "released",
        "cancelled",
      ],
      default: "draft",
    },

    items: {
      type: [saleItemSchema],
      required: true,
      validate: {
        validator: (items) => items.length > 0,
        message: "Sale must contain at least one item",
      },
    },

    subtotal: {
      type: Number,
      default: 0,
      min: 0,
    },

    directExpenses: {
      type: Number,
      default: 0,
      min: 0,
    },

    commission: {
      type: Number,
      default: 0,
      min: 0,
    },

    totalAmount: {
      type: Number,
      default: 0,
      min: 0,
    },

    totalCost: {
      type: Number,
      default: 0,
      min: 0,
    },

    totalProfit: {
      type: Number,
      default: 0,
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

module.exports = mongoose.model("Sale", saleSchema);
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
  },
  { _id: false }
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
      enum: [
        "draft",
        "received",
        "processing",
        "fulfilled",
        "cancelled",
      ],
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

module.exports = mongoose.model("ClientPO", clientPOSchema);
const mongoose = require("mongoose");

const inventoryMovementSchema = new mongoose.Schema(
  {
    productId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Product",
      required: true,
    },

    type: {
      type: String,
      enum: ["IN", "OUT", "ADJUSTMENT"],
      required: true,
    },

  quantity: {
  type: Number,
  required: true,
  min: 0.01,
},

    unitCost: {
      type: Number,
      default: 0,
      min: 0,
    },

    referenceType: {
      type: String,
      enum: ["PURCHASE", "SALE", "ADJUSTMENT"],
      required: true,
    },

    referenceId: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
    },

    date: {
      type: Date,
      default: Date.now,
    },

    notes: {
      type: String,
      default: "",
      trim: true,
    },

    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
  },
  {
    timestamps: true,
  }
);

inventoryMovementSchema.index({
  productId: 1,
  date: -1,
});

inventoryMovementSchema.index({
  referenceId: 1,
});

module.exports = mongoose.model(
  "InventoryMovement",
  inventoryMovementSchema
);
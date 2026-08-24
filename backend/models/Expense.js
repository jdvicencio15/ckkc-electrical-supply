const mongoose = require("mongoose");

const expenseSchema = new mongoose.Schema(
  {
    expenseDate: {
      type: Date,
      default: Date.now,
    },

    category: {
      type: String,
      enum: ["DIRECT", "OPERATING"],
      required: true,
    },

    description: {
      type: String,
      required: true,
      trim: true,
    },

    amount: {
      type: Number,
      required: true,
      min: 0,
    },

    referenceType: {
      type: String,
      enum: ["SALE", "CLIENT_PO", "OTHER"],
      default: "OTHER",
    },

    referenceId: {
      type: mongoose.Schema.Types.ObjectId,
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

module.exports = mongoose.model("Expense", expenseSchema);
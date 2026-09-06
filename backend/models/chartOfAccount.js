const mongoose = require("mongoose");

const chartOfAccountSchema = new mongoose.Schema(
  {
    accountCode: {
      type: String,
      required: true,
      unique: true,
      trim: true,
      maxlength: 20,
    },

    accountName: {
      type: String,
      required: true,
      trim: true,
      maxlength: 100,
    },

    accountType: {
      type: String,
      enum: [
        "asset",
        "liability",
        "equity",
        "revenue",
        "expense",
      ],
      required: true,
    },

    parentAccount: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "ChartOfAccount",
      default: null,
    },

    description: {
      type: String,
      trim: true,
      maxlength: 500,
    },

    isActive: {
      type: Boolean,
      default: true,
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

module.exports = mongoose.model(
  "ChartOfAccount",
  chartOfAccountSchema
);
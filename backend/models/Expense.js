const mongoose = require("mongoose");

const expenseSchema = new mongoose.Schema(
  {
    expenseDate: {
      type: Date,
      default: Date.now,
      required: true,
    },

    category: {
      type: String,
      enum: ["DIRECT", "OPERATING"],
      required: true,
    },

    // Explicit GL expense account.
    // Example:
    // 5010 = Salaries Expense
    // 5020 = Utilities Expense
    expenseAccountId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "ChartOfAccount",
      required: true,
    },

    description: {
      type: String,
      required: true,
      trim: true,
      maxlength: 500,
    },

    // Gross amount entered by the user.
    amount: {
      type: Number,
      required: true,
      min: 0.01,
    },

    pricingMode: {
      type: String,
      enum: ["inclusive", "exclusive", "off"],
      default: "inclusive",
      required: true,
    },

    taxRate: {
      type: Number,
      default: 0,
      min: 0,
      max: 100,
    },

    netAmount: {
      type: Number,
      required: true,
      min: 0,
    },

    taxAmount: {
      type: Number,
      default: 0,
      min: 0,
    },

    paymentMethod: {
      type: String,
      enum: [
        "cash",
        "bank_transfer",
        "gcash",
        "maya",
        "check",
        "other",
      ],
      required: true,
    },

  /*
 * Draft means the expense has not yet been financially recognized.
 *
 * Posted means the expense has been financially recognized and
 * has a corresponding system-generated Journal Entry.
 *
 * Cancelled is reserved for future cancellation/reversal handling.
 */
status: {
  type: String,
  enum: ["draft", "posted", "cancelled"],
  default: "draft",
  required: true,
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

expenseSchema.index({ expenseDate: -1 });
expenseSchema.index({ category: 1 });
expenseSchema.index({ status: 1 });
expenseSchema.index({ expenseAccountId: 1 });
expenseSchema.index({ referenceType: 1, referenceId: 1 });

module.exports = mongoose.model("Expense", expenseSchema);
const mongoose = require("mongoose");

const journalEntryLineSchema = new mongoose.Schema(
  {
    account: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "ChartOfAccount",
      required: true,
    },

    debit: {
      type: Number,
      default: 0,
      min: 0,
    },

    credit: {
      type: Number,
      default: 0,
      min: 0,
    },
  },
  {
    _id: false,
  }
);

const journalEntrySchema = new mongoose.Schema(
  {
    date: {
      type: Date,
      default: Date.now,
      required: true,
    },

    reference: {
      type: String,
      trim: true,
      maxlength: 100,
    },

    description: {
      type: String,
      required: true,
      trim: true,
      maxlength: 500,
    },

    /**
     * Accounting source classification
     *
     * system:
     *   Journal entry was generated automatically
     *   from a business transaction such as Sale,
     *   Purchase, Payment, or Expense.
     *
     * manual:
     *   Journal entry was intentionally created
     *   by an authorized accounting user.
     */
    entryType: {
      type: String,
      enum: ["manual", "system"],
      default: "manual",
      required: true,
    },

    sourceType: {
      type: String,
      trim: true,
      maxlength: 50,
    },

    sourceId: {
      type: mongoose.Schema.Types.ObjectId,
    },

    entries: {
      type: [journalEntryLineSchema],
      required: true,
      validate: {
        validator: function (entries) {
          return entries.length >= 2;
        },
        message: "Journal entry must contain at least two account entries",
      },
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

/*
|--------------------------------------------------------------------------
| System-generated Journal Entry Protection
|--------------------------------------------------------------------------
|
| One business transaction should produce only one
| system-generated journal entry.
|
| Example:
|   Sale #SALE-2026-000001
|        ↓
|   exactly one system JE
|
| Manual journal entries are not affected because
| entryType is included in the compound index.
|
*/
journalEntrySchema.index(
  {
    entryType: 1,
    sourceType: 1,
    sourceId: 1,
  },
  {
    unique: true,
    partialFilterExpression: {
      entryType: "system",
      sourceType: { $exists: true },
      sourceId: { $exists: true },
    },
  }
);

module.exports = mongoose.model("JournalEntry", journalEntrySchema);
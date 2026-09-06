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

module.exports = mongoose.model("JournalEntry", journalEntrySchema);
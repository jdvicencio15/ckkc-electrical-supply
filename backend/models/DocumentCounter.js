const mongoose = require("mongoose");

const documentCounterSchema = new mongoose.Schema(
  {
    documentType: {
      type: String,
      required: true,
      trim: true,
      lowercase: true,
    },

    year: {
      type: Number,
      required: true,
      min: 2000,
    },

    sequence: {
      type: Number,
      required: true,
      min: 0,
    },
  },
  {
    timestamps: true,
  }
);

documentCounterSchema.index(
  { documentType: 1, year: 1 },
  { unique: true }
);

module.exports = mongoose.model("DocumentCounter", documentCounterSchema);
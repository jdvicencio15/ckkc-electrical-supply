const mongoose = require("mongoose");

const commissionSchema = new mongoose.Schema(
  {
    clientPOId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "ClientPO",
    },

    saleId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Sale",
    },

    rate: {
      type: Number,
      required: true,
      default: 5,
      min: 0,
    },

    baseAmount: {
      type: Number,
      required: true,
      min: 0,
    },

    commissionAmount: {
      type: Number,
      required: true,
      min: 0,
    },

    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
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
  "Commission",
  commissionSchema
);
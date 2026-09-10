const Sale = require("../models/Sale");
const Purchase = require("../models/Purchase");
const Invoice = require("../models/Invoice");
const Payment = require("../models/Payment");
const Expense = require("../models/Expense");

const SOURCE_MODELS = {
  sale: Sale,
  purchase: Purchase,
  invoice: Invoice,
  payment: Payment,
  expense: Expense,
};

const validateAccountingSource = async (sourceType, sourceId) => {
  // No source at all = valid manual journal entry
  if (sourceType === undefined && sourceId === undefined) {
    return;
  }

  // Both must be provided together
  if (sourceType === undefined || sourceId === undefined) {
    const error = new Error(
      "sourceType and sourceId must be provided together"
    );
    error.statusCode = 400;
    throw error;
  }

  const Model = SOURCE_MODELS[sourceType];

  if (!Model) {
    const error = new Error(
      "Invalid journal entry source type"
    );
    error.statusCode = 400;
    throw error;
  }

  const source = await Model.findById(sourceId);

  if (!source) {
    const error = new Error(
      `Source ${sourceType} not found`
    );
    error.statusCode = 400;
    throw error;
  }

  /*
  |--------------------------------------------------------------------------
  | Source Lifecycle Rules
  |--------------------------------------------------------------------------
  */

  if (sourceType === "sale") {
    if (source.status !== "released") {
      const error = new Error(
        "Sale must be released before it can be used as an accounting source"
      );
      error.statusCode = 400;
      throw error;
    }
  }

  if (sourceType === "purchase") {
    if (source.status !== "received") {
      const error = new Error(
        "Purchase must be received before it can be used as an accounting source"
      );
      error.statusCode = 400;
      throw error;
    }
  }

  if (sourceType === "invoice") {
    if (source.status !== "issued") {
      const error = new Error(
        "Invoice must be issued before it can be used as an accounting source"
      );
      error.statusCode = 400;
      throw error;
    }
  }

  // Payment only needs to exist.
  // Expense lifecycle depends on the actual Expense model/state.
};

module.exports = {
  validateAccountingSource,
};
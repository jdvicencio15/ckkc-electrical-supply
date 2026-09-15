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

const validateAccountingSource = async (
  sourceType,
  sourceId,
  options = {},
) => {
  const { session } = options;

  /*
  |--------------------------------------------------------------------------
  | No Source
  |--------------------------------------------------------------------------
  |
  | No source means this is a manual journal entry.
  |
  */

  if (sourceType === undefined && sourceId === undefined) {
    return null;
  }

  /*
  |--------------------------------------------------------------------------
  | Source Pair Validation
  |--------------------------------------------------------------------------
  |
  | sourceType and sourceId must always exist together.
  |
  */

  if (sourceType === undefined || sourceId === undefined) {
    const error = new Error(
      "sourceType and sourceId must be provided together",
    );

    error.statusCode = 400;
    throw error;
  }

  /*
  |--------------------------------------------------------------------------
  | Validate Source Type
  |--------------------------------------------------------------------------
  */

  const Model = SOURCE_MODELS[sourceType];

  if (!Model) {
    const error = new Error(
      "Invalid journal entry source type",
    );

    error.statusCode = 400;
    throw error;
  }

  /*
  |--------------------------------------------------------------------------
  | Validate Source ID
  |--------------------------------------------------------------------------
  */

  const mongoose = require("mongoose");

  if (!mongoose.Types.ObjectId.isValid(sourceId)) {
    const error = new Error(
      "Invalid journal entry source ID",
    );

    error.statusCode = 400;
    throw error;
  }

  /*
  |--------------------------------------------------------------------------
  | Load Source
  |--------------------------------------------------------------------------
  |
  | If a MongoDB session is provided, the source lookup runs inside
  | the same transaction.
  |
  */

  const query = Model.findById(sourceId);

  if (session) {
    query.session(session);
  }

  const source = await query;

  if (!source) {
    const error = new Error(
      `Source ${sourceType} not found`,
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
        "Sale must be released before it can be used as an accounting source",
      );

      error.statusCode = 400;
      throw error;
    }
  }

  if (sourceType === "purchase") {
    if (source.status !== "received") {
      const error = new Error(
        "Purchase must be received before it can be used as an accounting source",
      );

      error.statusCode = 400;
      throw error;
    }
  }

  if (sourceType === "invoice") {
    if (source.status !== "issued") {
      const error = new Error(
        "Invoice must be issued before it can be used as an accounting source",
      );

      error.statusCode = 400;
      throw error;
    }
  }

/*
|--------------------------------------------------------------------------
| Payment
|--------------------------------------------------------------------------
|
| Only posted payments may be recognized by accounting.
|
*/

if (sourceType === "payment") {
  if (source.status !== "posted") {
    const error = new Error(
      "Payment must be posted before it can be used as an accounting source",
    );

    error.statusCode = 400;
    throw error;
  }
}

/*
|--------------------------------------------------------------------------
| Expense
|--------------------------------------------------------------------------
|
| Only posted expenses may be recognized by accounting.
|
*/

if (sourceType === "expense") {
  if (source.status !== "posted") {
    const error = new Error(
      "Expense must be posted before it can be used as an accounting source"
    );

    error.statusCode = 400;
    throw error;
  }
}

  return source;
};

module.exports = {
  validateAccountingSource,
};
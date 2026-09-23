const mongoose = require("mongoose");

const ChartOfAccount = require("../models/chartOfAccount");
const JournalEntry = require("../models/journalEntry");

const {
  validateAccountingSource,
} = require("../utils/accountingSourceValidator");

/*
|--------------------------------------------------------------------------
| Helpers
|--------------------------------------------------------------------------
*/

const roundMoney = (value) => {
  return Math.round((Number(value) + Number.EPSILON) * 100) / 100;
};

const validateJournalLines = (entries) => {
  if (!Array.isArray(entries) || entries.length < 2) {
    const error = new Error(
      "System journal entry must contain at least two account entries",
    );

    error.statusCode = 400;
    throw error;
  }

  let totalDebit = 0;
  let totalCredit = 0;

  for (const entry of entries) {
    if (!entry.account) {
      const error = new Error(
        "Each journal entry line must have an account",
      );

      error.statusCode = 400;
      throw error;
    }

    if (!mongoose.Types.ObjectId.isValid(entry.account)) {
      const error = new Error(
        "Each journal entry line must contain a valid account ID",
      );

      error.statusCode = 400;
      throw error;
    }

    const debit = roundMoney(entry.debit || 0);
    const credit = roundMoney(entry.credit || 0);

    if (debit < 0 || credit < 0) {
      const error = new Error(
        "Debit and credit cannot be negative",
      );

      error.statusCode = 400;
      throw error;
    }

    if (debit > 0 && credit > 0) {
      const error = new Error(
        "A journal entry line cannot contain both debit and credit",
      );

      error.statusCode = 400;
      throw error;
    }

    if (debit === 0 && credit === 0) {
      const error = new Error(
        "Each journal entry line must contain either a debit or credit amount",
      );

      error.statusCode = 400;
      throw error;
    }

    totalDebit += debit;
    totalCredit += credit;
  }

  totalDebit = roundMoney(totalDebit);
  totalCredit = roundMoney(totalCredit);

  if (totalDebit <= 0 || totalCredit <= 0) {
    const error = new Error(
      "Journal entry must contain both debit and credit amounts",
    );

    error.statusCode = 400;
    throw error;
  }

  if (Math.abs(totalDebit - totalCredit) > 0.01) {
    const error = new Error(
      "Total debit and total credit must be equal",
    );

    error.statusCode = 400;
    throw error;
  }

  return {
    totalDebit,
    totalCredit,
  };
};

/*
|--------------------------------------------------------------------------
| Account Validation
|--------------------------------------------------------------------------
*/

const validateAccounts = async (entries, session) => {
  const accountIds = entries.map((entry) =>
    entry.account.toString(),
  );

  const uniqueAccountIds = [...new Set(accountIds)];

  const accounts = await ChartOfAccount.find({
    _id: { $in: uniqueAccountIds },
    isActive: true,
  })
    .select("_id accountCode accountName accountType")
    .session(session);

  if (accounts.length !== uniqueAccountIds.length) {
    const error = new Error(
      "One or more accounts are invalid or inactive",
    );

    error.statusCode = 400;
    throw error;
  }

  return accounts;
};

/*
|--------------------------------------------------------------------------
| Create System Journal Entry
|--------------------------------------------------------------------------
|
| IMPORTANT:
|
| This function is internal.
|
| Public/manual Journal Entry endpoints must NOT use this function.
|
| Business transactions such as:
|
|   Sale Release
|   Purchase Receive
|   Payment
|   Expense
|
| will call this service.
|
*/

const createSystemJournalEntry = async ({
  session,
  date,
  reference,
  description,
  sourceType,
  sourceId,
  entries,
  createdBy,
}) => {
  /*
  |--------------------------------------------------------------------------
  | Require MongoDB Transaction Session
  |--------------------------------------------------------------------------
  |
  | System accounting must participate in the same transaction as the
  | originating business operation.
  |
  */

  if (!session) {
    const error = new Error(
      "A MongoDB session is required for system-generated journal entries",
    );

    error.statusCode = 500;
    throw error;
  }

  /*
  |--------------------------------------------------------------------------
  | Validate Source Information
  |--------------------------------------------------------------------------
  */

  if (!sourceType || !sourceId) {
    const error = new Error(
      "System journal entries require sourceType and sourceId",
    );

    error.statusCode = 400;
    throw error;
  }

  if (!mongoose.Types.ObjectId.isValid(sourceId)) {
    const error = new Error(
      "Invalid accounting source ID",
    );

    error.statusCode = 400;
    throw error;
  }

  /*
  |--------------------------------------------------------------------------
  | Validate Source Lifecycle
  |--------------------------------------------------------------------------
  */

  await validateAccountingSource(
    sourceType,
    sourceId,
    { session },
  );

  /*
  |--------------------------------------------------------------------------
  | Validate Journal Lines
  |--------------------------------------------------------------------------
  */

  validateJournalLines(entries);

  /*
  |--------------------------------------------------------------------------
  | Validate Accounts
  |--------------------------------------------------------------------------
  */

  await validateAccounts(entries, session);

  /*
  |--------------------------------------------------------------------------
  | Application-Level Idempotency Check
  |--------------------------------------------------------------------------
  |
  | Fast protection against duplicate accounting entries.
  |
  | The database unique index remains the final protection against
  | concurrent duplicate requests.
  |
  */

  const existingEntry = await JournalEntry.findOne({
    entryType: "system",
    sourceType,
    sourceId,
  }).session(session);

  if (existingEntry) {
    const error = new Error(
      "A system journal entry already exists for this source transaction",
    );

    error.statusCode = 409;
    throw error;
  }

  /*
  |--------------------------------------------------------------------------
  | Create System Journal Entry
  |--------------------------------------------------------------------------
  */

  try {
    const [journalEntry] = await JournalEntry.create(
      [
        {
          date,
          reference,
          description,
          entryType: "system",
          sourceType,
          sourceId,
          entries,
          createdBy,
        },
      ],
      { session },
    );

    return journalEntry;
  } catch (error) {
    /*
    |--------------------------------------------------------------------------
    | Database-Level Duplicate Protection
    |--------------------------------------------------------------------------
    |
    | Two concurrent requests can both pass the findOne() check.
    |
    | The unique JournalEntry index is therefore the final authority.
    |
    */

    if (error?.code === 11000) {
      const duplicateError = new Error(
        "A system journal entry already exists for this source transaction",
      );

      duplicateError.statusCode = 409;

      throw duplicateError;
    }

    throw error;
  }
};

const getAccountByCode = async (accountCode, session) => {
  const account = await ChartOfAccount.findOne({
    accountCode,
    isActive: true,
  })
    .select("_id accountCode accountName accountType")
    .session(session);

  if (!account) {
    const error = new Error(
      `Required accounting account ${accountCode} is missing or inactive`,
    );

    error.statusCode = 500;
    throw error;
  }

  return account;
};

const createSaleJournalEntry = async ({
  session,
  sale,
  createdBy,
}) => {
  if (!session) {
    const error = new Error(
      "A MongoDB session is required to create a sale journal entry",
    );

    error.statusCode = 500;
    throw error;
  }

  if (!sale) {
    const error = new Error("Sale is required");
    error.statusCode = 400;
    throw error;
  }

  /*
  |--------------------------------------------------------------------------
  | Sale Lifecycle
  |--------------------------------------------------------------------------
  */

  if (sale.status !== "released") {
    const error = new Error(
      "Sale must be released before accounting recognition",
    );

    error.statusCode = 400;
    throw error;
  }

  /*
  |--------------------------------------------------------------------------
  | Direct Expenses / Commission
  |--------------------------------------------------------------------------
  |
  | These amounts are currently included in the customer's total amount
  | but their accounting treatment has not yet been finalized.
  |
  | Do not silently force them into Revenue, COGS, or another account.
  |
  */

  if (
    Number(sale.directExpenses || 0) !== 0 ||
    Number(sale.commission || 0) !== 0
  ) {
    const error = new Error(
      "Sale accounting for direct expenses and commission is not yet configured",
    );

    error.statusCode = 400;
    throw error;
  }

  /*
  |--------------------------------------------------------------------------
  | Resolve Accounts by Stable Account Code
  |--------------------------------------------------------------------------
  */

  const accounts = await Promise.all([
  getAccountByCode("1200", session), // Accounts Receivable
  getAccountByCode("1300", session), // Inventory
  getAccountByCode("4100", session), // Sales Revenue
  getAccountByCode("5010", session), // COGS
]);

  const [
    accountsReceivable,
    inventory,
    salesRevenue,
    costOfGoodsSold,
  ] = accounts;

  /*
  |--------------------------------------------------------------------------
  | Build Revenue / VAT Entry
  |--------------------------------------------------------------------------
  */

  const entries = [];

  const totalAmount = roundMoney(sale.totalAmount || 0);
  const netAmount = roundMoney(sale.netAmount || 0);
  const taxAmount = roundMoney(sale.taxAmount || 0);
  const totalCost = roundMoney(sale.totalCost || 0);

  if (totalAmount <= 0) {
    const error = new Error(
      "Sale total amount must be greater than zero for accounting recognition",
    );

    error.statusCode = 400;
    throw error;
  }

  if (netAmount <= 0) {
    const error = new Error(
      "Sale net amount must be greater than zero for accounting recognition",
    );

    error.statusCode = 400;
    throw error;
  }

  /*
  |--------------------------------------------------------------------------
  | Accounts Receivable / Sales Revenue
  |--------------------------------------------------------------------------
  */

  entries.push({
    account: accountsReceivable._id,
    debit: totalAmount,
    credit: 0,
  });

  entries.push({
    account: salesRevenue._id,
    debit: 0,
    credit: netAmount,
  });

  /*
  |--------------------------------------------------------------------------
  | Output VAT
  |--------------------------------------------------------------------------
  |
  | VAT is only posted when the Sale contains a positive tax amount.
  |
  */

  if (taxAmount > 0) {
      const outputVat = await getAccountByCode("2200", session);

    entries.push({
      account: outputVat._id,
      debit: 0,
      credit: taxAmount,
    });
  }

  /*
  |--------------------------------------------------------------------------
  | Cost of Goods Sold / Inventory
  |--------------------------------------------------------------------------
  */

  if (totalCost > 0) {
    entries.push({
      account: costOfGoodsSold._id,
      debit: totalCost,
      credit: 0,
    });

    entries.push({
      account: inventory._id,
      debit: 0,
      credit: totalCost,
    });
  }

  /*
  |--------------------------------------------------------------------------
  | Reconciliation
  |--------------------------------------------------------------------------
  |
  | AR must equal Revenue + Output VAT because direct expenses and
  | commission are currently required to be zero.
  |
  */

  const expectedReceivable = roundMoney(
    netAmount + taxAmount,
  );

  if (totalAmount !== expectedReceivable) {
    const error = new Error(
      `Sale accounting total mismatch: AR ${totalAmount} does not equal net sales ${netAmount} plus VAT ${taxAmount}`,
    );

    error.statusCode = 400;
    throw error;
  }

  return createSystemJournalEntry({
    session,
    date: sale.saleDate,
    reference: sale.salesNumber,
    description: `Sales recognition for ${sale.salesNumber}`,
    sourceType: "sale",
    sourceId: sale._id,
    entries,
    createdBy,
  });
};

const createPurchaseJournalEntry = async ({
  session,
  purchase,
  createdBy,
}) => {
  if (!session) {
    const error = new Error(
      "A MongoDB session is required to create a purchase journal entry",
    );

    error.statusCode = 500;
    throw error;
  }

  if (!purchase) {
    const error = new Error("Purchase is required");
    error.statusCode = 400;
    throw error;
  }

  /*
  |--------------------------------------------------------------------------
  | Purchase Lifecycle
  |--------------------------------------------------------------------------
  */

  if (purchase.status !== "received") {
    const error = new Error(
      "Purchase must be received before accounting recognition",
    );

    error.statusCode = 400;
    throw error;
  }

/*
|--------------------------------------------------------------------------
| Resolve Accounts by Stable Account Code
|--------------------------------------------------------------------------
|
| 1300 = Inventory
| 1400 = Input VAT Recoverable
| 2100 = Accounts Payable
|
*/

  const inventory = await getAccountByCode("1300", session);
  const accountsPayable = await getAccountByCode("2100", session);
  /*
  |--------------------------------------------------------------------------
  | Purchase Amounts
  |--------------------------------------------------------------------------
  */

  const totalAmount = roundMoney(purchase.totalAmount || 0);
  const netAmount = roundMoney(purchase.netAmount || 0);
  const taxAmount = roundMoney(purchase.taxAmount || 0);

  if (totalAmount <= 0) {
    const error = new Error(
      "Purchase total amount must be greater than zero for accounting recognition",
    );

    error.statusCode = 400;
    throw error;
  }

  if (netAmount <= 0) {
    const error = new Error(
      "Purchase net amount must be greater than zero for accounting recognition",
    );

    error.statusCode = 400;
    throw error;
  }

  /*
  |--------------------------------------------------------------------------
  | Build Purchase Journal Entry
  |--------------------------------------------------------------------------
  */

  const entries = [];

  /*
  |--------------------------------------------------------------------------
  | Inventory
  |--------------------------------------------------------------------------
  */

  entries.push({
    account: inventory._id,
    debit: netAmount,
    credit: 0,
  });

  /*
  |--------------------------------------------------------------------------
  | Input VAT
  |--------------------------------------------------------------------------
  |
  | VAT is only posted when the Purchase contains
  | a positive tax amount.
  |
  */

  if (taxAmount > 0) {
   const inputVat = await getAccountByCode("1400", session);

    entries.push({
      account: inputVat._id,
      debit: taxAmount,
      credit: 0,
    });
  }

  /*
  |--------------------------------------------------------------------------
  | Accounts Payable
  |--------------------------------------------------------------------------
  */

  entries.push({
    account: accountsPayable._id,
    debit: 0,
    credit: totalAmount,
  });

  /*
  |--------------------------------------------------------------------------
  | Reconciliation
  |--------------------------------------------------------------------------
  |
  | AP must equal:
  |
  |   Inventory + Input VAT
  |
  */

  const expectedPayable = roundMoney(
    netAmount + taxAmount,
  );

  if (totalAmount !== expectedPayable) {
    const error = new Error(
      `Purchase accounting total mismatch: AP ${totalAmount} does not equal net purchase ${netAmount} plus VAT ${taxAmount}`,
    );

    error.statusCode = 400;
    throw error;
  }

  return createSystemJournalEntry({
    session,
    date: purchase.purchaseDate,
    reference: purchase.purchaseNumber,
    description: `Purchase recognition for ${purchase.purchaseNumber}`,
    sourceType: "purchase",
    sourceId: purchase._id,
    entries,
    createdBy,
  });
};

const createPaymentJournalEntry = async ({
  session,
  payment,
  createdBy,
}) => {
  if (!session) {
    const error = new Error(
      "A MongoDB session is required to create a payment journal entry",
    );

    error.statusCode = 500;
    throw error;
  }

  if (!payment) {
    const error = new Error("Payment is required");
    error.statusCode = 400;
    throw error;
  }

  /*
  |--------------------------------------------------------------------------
  | Payment Lifecycle
  |--------------------------------------------------------------------------
  */

  if (payment.status !== "posted") {
    const error = new Error(
      "Payment must be posted before accounting recognition",
    );

    error.statusCode = 400;
    throw error;
  }

/*
|--------------------------------------------------------------------------
| Payment Account
|--------------------------------------------------------------------------
|
| cash          -> 1110 Cash
| bank_transfer -> 1120 Bank
| gcash         -> 1130 GCash
| maya          -> 1130 Maya
| check         -> 1120 Bank
| other         -> 1110 Cash
|
*/

const paymentAccountCodeMap = {
  cash: "1110",
  bank_transfer: "1120",
  gcash: "1130",
  maya: "1130",
  check: "1120",
  other: "1110",
};

  const paymentAccountCode =
    paymentAccountCodeMap[payment.paymentMethod];

  if (!paymentAccountCode) {
    const error = new Error(
      `Unsupported payment method ${payment.paymentMethod}`,
    );

    error.statusCode = 400;
    throw error;
  }

  const paymentAccount = await getAccountByCode(
    paymentAccountCode,
    session,
  );

  const accountsReceivable = await getAccountByCode(
  "1200",
  session,
  );

  /*
  |--------------------------------------------------------------------------
  | Payment Amount
  |--------------------------------------------------------------------------
  */

  const amount = roundMoney(payment.amount || 0);

  if (amount <= 0) {
    const error = new Error(
      "Payment amount must be greater than zero for accounting recognition",
    );

    error.statusCode = 400;
    throw error;
  }

  /*
  |--------------------------------------------------------------------------
  | Build Payment Journal Entry
  |--------------------------------------------------------------------------
  |
  | Dr Cash / Bank
  | Cr Accounts Receivable
  |
  | Payment does NOT recognize:
  | - Revenue
  | - Output VAT
  |
  | Those were already recognized when the Sale was released.
  |
  */

  const entries = [
    {
      account: paymentAccount._id,
      debit: amount,
      credit: 0,
    },
    {
      account: accountsReceivable._id,
      debit: 0,
      credit: amount,
    },
  ];

  return createSystemJournalEntry({
    session,
    date: payment.paymentDate,
    reference: payment._id.toString(),
    description: `Payment received for Invoice ${payment.invoiceId}`,
    sourceType: "payment",
    sourceId: payment._id,
    entries,
    createdBy,
  });
};


const createExpenseJournalEntry = async ({
  session,
  expense,
  createdBy,
}) => {
  if (!session) {
    const error = new Error(
      "A MongoDB session is required to create an expense journal entry"
    );

    error.statusCode = 500;
    throw error;
  }

  if (!expense) {
    const error = new Error("Expense is required");
    error.statusCode = 400;
    throw error;
  }

  if (expense.status !== "posted") {
    const error = new Error(
      "Expense must be posted before accounting recognition"
    );

    error.statusCode = 400;
    throw error;
  }

  /*
  |--------------------------------------------------------------------------
  | Expense Account
  |--------------------------------------------------------------------------
  |
  | The Expense document stores the selected GL account directly.
  | We validate the account using the same transaction session.
  |
  */

  const expenseAccount = await ChartOfAccount.findOne({
    _id: expense.expenseAccountId,
    isActive: true,
    accountType: "expense",
  })
    .select("_id accountCode accountName accountType")
    .session(session);

  if (!expenseAccount) {
    const error = new Error(
      "Selected expense account is missing, inactive, or not an expense account"
    );

    error.statusCode = 400;
    throw error;
  }

/*
|--------------------------------------------------------------------------
| Payment Account
|--------------------------------------------------------------------------
|
| cash          -> 1110 Cash
| bank_transfer -> 1120 Bank
| gcash         -> 1130 GCash
| maya          -> 1130 Maya
| check         -> 1120 Bank
| other         -> 1110 Cash
|
*/



 const paymentAccountCodeMap = {
  cash: "1110",
  bank_transfer: "1120",
  gcash: "1130",
  maya: "1130",
  check: "1120",
  other: "1110",
};

  const paymentAccountCode =
    paymentAccountCodeMap[expense.paymentMethod];

  if (!paymentAccountCode) {
    const error = new Error(
      `Unsupported payment method ${expense.paymentMethod}`
    );

    error.statusCode = 400;
    throw error;
  }

  const paymentAccount = await getAccountByCode(
    paymentAccountCode,
    session
  );

  /*
  |--------------------------------------------------------------------------
  | Amount Validation
  |--------------------------------------------------------------------------
  */

  const totalAmount = roundMoney(expense.amount || 0);
  const netAmount = roundMoney(expense.netAmount || 0);
  const taxAmount = roundMoney(expense.taxAmount || 0);

  if (totalAmount <= 0) {
    const error = new Error(
      "Expense total amount must be greater than zero for accounting recognition"
    );

    error.statusCode = 400;
    throw error;
  }

  if (netAmount <= 0) {
    const error = new Error(
      "Expense net amount must be greater than zero for accounting recognition"
    );

    error.statusCode = 400;
    throw error;
  }

  /*
  |--------------------------------------------------------------------------
  | Reconciliation
  |--------------------------------------------------------------------------
  */

  const expectedTotal = roundMoney(netAmount + taxAmount);

  if (totalAmount !== expectedTotal) {
    const error = new Error(
      `Expense accounting total mismatch: total ${totalAmount} does not equal net expense ${netAmount} plus VAT ${taxAmount}`
    );

    error.statusCode = 400;
    throw error;
  }

  /*
  |--------------------------------------------------------------------------
  | Build Journal Entry
  |--------------------------------------------------------------------------
  |
  | VAT-inclusive / exclusive:
  |
  | Dr Expense       Net
  | Dr Input VAT     VAT
  | Cr Cash/Bank     Gross
  |
  | VAT-off:
  |
  | Dr Expense       Gross
  | Cr Cash/Bank     Gross
  |
  */

  const entries = [
    {
      account: expenseAccount._id,
      debit: netAmount,
      credit: 0,
    },
  ];

  if (taxAmount > 0) {
    const inputVat = await getAccountByCode("1400", session);

    entries.push({
      account: inputVat._id,
      debit: taxAmount,
      credit: 0,
    });
  }

  entries.push({
    account: paymentAccount._id,
    debit: 0,
    credit: totalAmount,
  });

  return createSystemJournalEntry({
    session,
    date: expense.expenseDate,
    reference: expense._id.toString(),
    description: `Expense recognition for ${expense.description}`,
    sourceType: "expense",
    sourceId: expense._id,
    entries,
    createdBy,
  });
};

module.exports = {
  createSystemJournalEntry,
  createSaleJournalEntry,
  createPurchaseJournalEntry,
  createPaymentJournalEntry,
  createExpenseJournalEntry,
};
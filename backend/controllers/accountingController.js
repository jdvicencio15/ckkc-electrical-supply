const mongoose = require("mongoose");

const ChartOfAccount = require("../models/chartOfAccount");
const JournalEntry = require("../models/journalEntry");

const {
  validateAccountingSource,
} = require("../utils/accountingSourceValidator");

/*
|--------------------------------------------------------------------------
| Chart of Accounts
|--------------------------------------------------------------------------
*/

// GET /api/accounting/accounts
const getAccounts = async (req, res, next) => {
  try {
    const accounts = await ChartOfAccount.find()
      .populate("parentAccount", "accountCode accountName accountType")
      .sort({ accountCode: 1 });

    res.status(200).json({
      success: true,
      count: accounts.length,
      data: accounts,
    });
  } catch (error) {
    next(error);
  }
};

// GET /api/accounting/accounts/:id
const getAccountById = async (req, res, next) => {
  try {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        success: false,
        message: "Invalid account ID",
      });
    }

    const account = await ChartOfAccount.findById(id).populate(
      "parentAccount",
      "accountCode accountName accountType",
    );

    if (!account) {
      return res.status(404).json({
        success: false,
        message: "Account not found",
      });
    }

    res.status(200).json({
      success: true,
      data: account,
    });
  } catch (error) {
    next(error);
  }
};

// POST /api/accounting/accounts
const createAccount = async (req, res, next) => {
  try {
    const {
      accountCode,
      accountName,
      accountType,
      parentAccount,
      description,
      isActive,
    } = req.body;

    await validateAccountingSource(sourceType, sourceId);

    // Prevent duplicate account codes
    const existingAccount = await ChartOfAccount.findOne({
      accountCode,
    });

    if (existingAccount) {
      return res.status(409).json({
        success: false,
        message: "Account code already exists",
      });
    }

    // Validate parent account
    if (parentAccount) {
      if (!mongoose.Types.ObjectId.isValid(parentAccount)) {
        return res.status(400).json({
          success: false,
          message: "Invalid parent account ID",
        });
      }

      const parent = await ChartOfAccount.findById(parentAccount);

      if (!parent) {
        return res.status(404).json({
          success: false,
          message: "Parent account not found",
        });
      }
    }

    const account = await ChartOfAccount.create({
      accountCode,
      accountName,
      accountType,
      parentAccount: parentAccount || null,
      description,
      isActive,
      createdBy: req.user._id,
    });

    res.status(201).json({
      success: true,
      message: "Account created successfully",
      data: account,
    });
  } catch (error) {
    next(error);
  }
};

// PUT /api/accounting/accounts/:id
const updateAccount = async (req, res, next) => {
  try {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        success: false,
        message: "Invalid account ID",
      });
    }

    const account = await ChartOfAccount.findById(id);

    if (!account) {
      return res.status(404).json({
        success: false,
        message: "Account not found",
      });
    }

    const {
      accountCode,
      accountName,
      accountType,
      parentAccount,
      description,
      isActive,
    } = req.body;

    // Prevent duplicate account codes
    if (accountCode && accountCode !== account.accountCode) {
      const existingAccount = await ChartOfAccount.findOne({
        accountCode,
        _id: { $ne: id },
      });

      if (existingAccount) {
        return res.status(409).json({
          success: false,
          message: "Account code already exists",
        });
      }
    }

    // Validate parent account
    if (parentAccount) {
      if (!mongoose.Types.ObjectId.isValid(parentAccount)) {
        return res.status(400).json({
          success: false,
          message: "Invalid parent account ID",
        });
      }

      // Prevent account from being its own parent
      if (parentAccount === id) {
        return res.status(400).json({
          success: false,
          message: "An account cannot be its own parent",
        });
      }

      const parent = await ChartOfAccount.findById(parentAccount);

      if (!parent) {
        return res.status(404).json({
          success: false,
          message: "Parent account not found",
        });
      }

      // Prevent circular account hierarchy
      let currentParentId = parent.parentAccount;

      while (currentParentId) {
        if (currentParentId.toString() === id) {
          return res.status(400).json({
            success: false,
            message: "Cannot create a circular account hierarchy",
          });
        }

        const currentParent = await ChartOfAccount.findById(currentParentId);

        if (!currentParent) {
          break;
        }

        currentParentId = currentParent.parentAccount;
      }
    }

    account.accountCode = accountCode ?? account.accountCode;
    account.accountName = accountName ?? account.accountName;
    account.accountType = accountType ?? account.accountType;
    account.parentAccount =
      parentAccount !== undefined ? parentAccount : account.parentAccount;
    account.description = description ?? account.description;
    account.isActive = isActive !== undefined ? isActive : account.isActive;
    account.updatedBy = req.user._id;

    await account.save();

    res.status(200).json({
      success: true,
      message: "Account updated successfully",
      data: account,
    });
  } catch (error) {
    next(error);
  }
};

// DELETE /api/accounting/accounts/:id
const deleteAccount = async (req, res, next) => {
  try {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        success: false,
        message: "Invalid account ID",
      });
    }

    const account = await ChartOfAccount.findById(id);

    if (!account) {
      return res.status(404).json({
        success: false,
        message: "Account not found",
      });
    }

    // Prevent deactivating an account with active child accounts
    const activeChildren = await ChartOfAccount.exists({
      parentAccount: id,
      isActive: true,
    });

    if (activeChildren) {
      return res.status(400).json({
        success: false,
        message: "Cannot deactivate an account with active child accounts",
      });
    }

    // Don't physically delete accounts.
    account.isActive = false;
    account.updatedBy = req.user._id;

    await account.save();

    res.status(200).json({
      success: true,
      message: "Account deactivated successfully",
    });
  } catch (error) {
    next(error);
  }
};

/*
|--------------------------------------------------------------------------
| Journal Entries
|--------------------------------------------------------------------------
*/

const validateJournalLines = (entries) => {
  if (!Array.isArray(entries) || entries.length < 2) {
    return "Journal entry must contain at least two account entries";
  }

  let totalDebit = 0;
  let totalCredit = 0;

  for (const entry of entries) {
    if (!entry.account) {
      return "Each journal entry line must have an account";
    }

    if (!mongoose.Types.ObjectId.isValid(entry.account)) {
      return "Each journal entry line must contain a valid account ID";
    }

    const debit = Number(entry.debit || 0);
    const credit = Number(entry.credit || 0);

    if (debit < 0 || credit < 0) {
      return "Debit and credit cannot be negative";
    }

    if (debit > 0 && credit > 0) {
      return "A journal entry line cannot contain both debit and credit";
    }

    if (debit === 0 && credit === 0) {
      return "Each journal entry line must contain either a debit or credit amount";
    }

    totalDebit += debit;
    totalCredit += credit;
  }

  if (totalDebit <= 0 || totalCredit <= 0) {
    return "Journal entry must contain both debit and credit amounts";
  }

  if (Math.abs(totalDebit - totalCredit) > 0.01) {
    return "Total debit and total credit must be equal";
  }

  return null;
};

// GET /api/accounting/journal-entries
const getJournalEntries = async (req, res, next) => {
  try {
    const journalEntries = await JournalEntry.find()
      .populate("entries.account", "accountCode accountName accountType")
      .populate("createdBy", "name email")
      .populate("updatedBy", "name email")
      .sort({ date: -1, createdAt: -1 });

    res.status(200).json({
      success: true,
      count: journalEntries.length,
      data: journalEntries,
    });
  } catch (error) {
    next(error);
  }
};

// GET /api/accounting/journal-entries/:id
const getJournalEntryById = async (req, res, next) => {
  try {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        success: false,
        message: "Invalid journal entry ID",
      });
    }

    const journalEntry = await JournalEntry.findById(id)
      .populate("entries.account", "accountCode accountName accountType")
      .populate("createdBy", "name email")
      .populate("updatedBy", "name email");

    if (!journalEntry) {
      return res.status(404).json({
        success: false,
        message: "Journal entry not found",
      });
    }

    res.status(200).json({
      success: true,
      data: journalEntry,
    });
  } catch (error) {
    next(error);
  }
};

// POST /api/accounting/journal-entries
const createJournalEntry = async (req, res, next) => {
  try {
    const { date, reference, description, sourceType, sourceId, entries } =
      req.body;

    await validateAccountingSource(
  sourceType,
  sourceId
    );

    const validationError = validateJournalLines(entries);

    if (validationError) {
      return res.status(400).json({
        success: false,
        message: validationError,
      });
    }

    // Verify all referenced accounts exist and are active
    const accountIds = entries.map((entry) => entry.account);

    const accounts = await ChartOfAccount.find({
      _id: { $in: accountIds },
      isActive: true,
    }).select("_id");

    if (accounts.length !== new Set(accountIds.map(String)).size) {
      return res.status(400).json({
        success: false,
        message: "One or more accounts are invalid or inactive",
      });
    }

    const journalEntry = await JournalEntry.create({
      date,
      reference,
      description,
      sourceType,
      sourceId,
      entries,
      createdBy: req.user._id,
    });

    const populatedEntry = await JournalEntry.findById(
      journalEntry._id,
    ).populate("entries.account", "accountCode accountName accountType");

    res.status(201).json({
      success: true,
      message: "Journal entry created successfully",
      data: populatedEntry,
    });
  } catch (error) {
    next(error);
  }
};

// PUT /api/accounting/journal-entries/:id
const updateJournalEntry = async (req, res, next) => {
  try {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        success: false,
        message: "Invalid journal entry ID",
      });
    }

    const journalEntry = await JournalEntry.findById(id);

    if (!journalEntry) {
      return res.status(404).json({
        success: false,
        message: "Journal entry not found",
      });
    }

    const { date, reference, description, sourceType, sourceId, entries } =
      req.body;

    const nextSourceType =
  sourceType !== undefined
    ? sourceType
    : journalEntry.sourceType;

const nextSourceId =
  sourceId !== undefined
    ? sourceId
    : journalEntry.sourceId;

await validateAccountingSource(
  nextSourceType,
  nextSourceId
);

    if (entries !== undefined) {
      const validationError = validateJournalLines(entries);

      if (validationError) {
        return res.status(400).json({
          success: false,
          message: validationError,
        });
      }

      const accountIds = entries.map((entry) => entry.account);

      const accounts = await ChartOfAccount.find({
        _id: { $in: accountIds },
        isActive: true,
      }).select("_id");

      if (accounts.length !== new Set(accountIds.map(String)).size) {
        return res.status(400).json({
          success: false,
          message: "One or more accounts are invalid or inactive",
        });
      }

      journalEntry.entries = entries;
    }

    journalEntry.date = date ?? journalEntry.date;
    journalEntry.reference = reference ?? journalEntry.reference;
    journalEntry.description = description ?? journalEntry.description;
    journalEntry.sourceType = sourceType ?? journalEntry.sourceType;
    journalEntry.sourceId = sourceId ?? journalEntry.sourceId;
    journalEntry.updatedBy = req.user._id;

    await journalEntry.save();

    const populatedEntry = await JournalEntry.findById(
      journalEntry._id,
    ).populate("entries.account", "accountCode accountName accountType");

    res.status(200).json({
      success: true,
      message: "Journal entry updated successfully",
      data: populatedEntry,
    });
  } catch (error) {
    next(error);
  }
};

// DELETE /api/accounting/journal-entries/:id
const deleteJournalEntry = async (req, res, next) => {
  try {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        success: false,
        message: "Invalid journal entry ID",
      });
    }

    const journalEntry = await JournalEntry.findById(id);

    if (!journalEntry) {
      return res.status(404).json({
        success: false,
        message: "Journal entry not found",
      });
    }

    await journalEntry.deleteOne();

    res.status(200).json({
      success: true,
      message: "Journal entry deleted successfully",
    });
  } catch (error) {
    next(error);
  }
};

/*
|--------------------------------------------------------------------------
| General Ledger
|--------------------------------------------------------------------------
*/

// GET /api/accounting/ledger
const getGeneralLedger = async (req, res, next) => {
  try {
    const { accountId, startDate, endDate } = req.query;

    /*
    |--------------------------------------------------------------------------
    | Validate account
    |--------------------------------------------------------------------------
    */

    let selectedAccount = null;

    if (accountId) {
      if (!mongoose.Types.ObjectId.isValid(accountId)) {
        return res.status(400).json({
          success: false,
          message: "Invalid account ID",
        });
      }

      selectedAccount = await ChartOfAccount.findById(accountId).select(
        "_id accountCode accountName accountType isActive",
      );

      if (!selectedAccount) {
        return res.status(404).json({
          success: false,
          message: "Account not found",
        });
      }
    }

    /*
    |--------------------------------------------------------------------------
    | Build Date Filters
    |--------------------------------------------------------------------------
    */

    const periodMatch = {};

    if (startDate || endDate) {
      periodMatch.date = {};

      if (startDate) {
        const start = new Date(startDate);

        if (Number.isNaN(start.getTime())) {
          return res.status(400).json({
            success: false,
            message: "Invalid start date",
          });
        }

        start.setHours(0, 0, 0, 0);

        periodMatch.date.$gte = start;
      }

      if (endDate) {
        const end = new Date(endDate);

        if (Number.isNaN(end.getTime())) {
          return res.status(400).json({
            success: false,
            message: "Invalid end date",
          });
        }

        end.setHours(23, 59, 59, 999);

        periodMatch.date.$lte = end;
      }
    }

    /*
    |--------------------------------------------------------------------------
    | Specific Account Ledger
    |--------------------------------------------------------------------------
    */

    if (selectedAccount) {
      /*
      |--------------------------------------------------------------------------
      | Opening Balance
      |--------------------------------------------------------------------------
      |
      | Only calculate an opening balance when a start date exists.
      | Transactions before the selected period are used.
      |
      */

      let openingBalance = 0;

      if (startDate) {
        const start = new Date(startDate);
        start.setHours(0, 0, 0, 0);

        const previousEntries = await JournalEntry.find({
          date: { $lt: start },
        })
          .populate("entries.account", "accountCode accountName accountType")
          .sort({ date: 1, createdAt: 1 });

        for (const journalEntry of previousEntries) {
          for (const entry of journalEntry.entries) {
            if (entry.account && entry.account._id.toString() === accountId) {
              const debit = Number(entry.debit || 0);
              const credit = Number(entry.credit || 0);

              if (
                selectedAccount.accountType === "asset" ||
                selectedAccount.accountType === "expense"
              ) {
                openingBalance += debit - credit;
              } else {
                openingBalance += credit - debit;
              }
            }
          }
        }
      }

      /*
      |--------------------------------------------------------------------------
      | Period Transactions
      |--------------------------------------------------------------------------
      */

      const journalEntries = await JournalEntry.find(periodMatch)
        .populate("entries.account", "accountCode accountName accountType")
        .sort({ date: 1, createdAt: 1 });

      const transactions = [];

      let runningBalance = openingBalance;

      for (const journalEntry of journalEntries) {
        for (const entry of journalEntry.entries) {
          if (!entry.account || entry.account._id.toString() !== accountId) {
            continue;
          }

          const debit = Number(entry.debit || 0);
          const credit = Number(entry.credit || 0);

          if (
            selectedAccount.accountType === "asset" ||
            selectedAccount.accountType === "expense"
          ) {
            runningBalance += debit - credit;
          } else {
            runningBalance += credit - debit;
          }

          transactions.push({
            date: journalEntry.date,
            reference: journalEntry.reference,
            description: journalEntry.description,
            account: entry.account,
            debit,
            credit,
            balance: Number(runningBalance.toFixed(2)),
            journalEntryId: journalEntry._id,
          });
        }
      }

      const totalDebit = transactions.reduce(
        (sum, entry) => sum + entry.debit,
        0,
      );

      const totalCredit = transactions.reduce(
        (sum, entry) => sum + entry.credit,
        0,
      );

      return res.status(200).json({
        success: true,
        count: transactions.length,
        data: {
          account: selectedAccount,
          openingBalance: Number(openingBalance.toFixed(2)),
          transactions,
          totalDebit: Number(totalDebit.toFixed(2)),
          totalCredit: Number(totalCredit.toFixed(2)),
          endingBalance: Number(runningBalance.toFixed(2)),
        },
      });
    }

    /*
    |--------------------------------------------------------------------------
    | All Accounts Activity
    |--------------------------------------------------------------------------
    */

    const journalEntries = await JournalEntry.find(periodMatch)
      .populate("entries.account", "accountCode accountName accountType")
      .sort({ date: 1, createdAt: 1 });

    const ledger = [];

    for (const journalEntry of journalEntries) {
      for (const entry of journalEntry.entries) {
        if (!entry.account) {
          continue;
        }

        ledger.push({
          date: journalEntry.date,
          reference: journalEntry.reference,
          description: journalEntry.description,
          account: entry.account,
          debit: Number(entry.debit || 0),
          credit: Number(entry.credit || 0),
          journalEntryId: journalEntry._id,
        });
      }
    }

    res.status(200).json({
      success: true,
      count: ledger.length,
      data: ledger,
    });
  } catch (error) {
    next(error);
  }
};

/*
|--------------------------------------------------------------------------
| Trial Balance
|--------------------------------------------------------------------------
*/

// GET /api/accounting/trial-balance
const getTrialBalance = async (req, res, next) => {
  try {
    const { startDate, endDate } = req.query;

    if (startDate) {
      const start = new Date(startDate);

      if (isNaN(start.getTime())) {
        return res.status(400).json({
          success: false,
          message: "Invalid startDate",
        });
      }
    }

    if (endDate) {
      const end = new Date(endDate);

      if (isNaN(end.getTime())) {
        return res.status(400).json({
          success: false,
          message: "Invalid endDate",
        });
      }
    }

    const match = {};

    if (startDate || endDate) {
      match.date = {};

      if (startDate) {
        match.date.$gte = new Date(startDate);
      }

      if (endDate) {
        const end = new Date(endDate);
        end.setHours(23, 59, 59, 999);
        match.date.$lte = end;
      }
    }

    const journalEntries = await JournalEntry.find(match).populate(
      "entries.account",
      "accountCode accountName accountType",
    );

    const balances = new Map();

    for (const journalEntry of journalEntries) {
      for (const entry of journalEntry.entries) {
        const accountId = entry.account._id.toString();

        if (!balances.has(accountId)) {
          balances.set(accountId, {
            account: entry.account,
            debit: 0,
            credit: 0,
          });
        }

        const balance = balances.get(accountId);

        balance.debit += Number(entry.debit || 0);
        balance.credit += Number(entry.credit || 0);
      }
    }

    const trialBalance = Array.from(balances.values())
      .map((item) => ({
        ...item,
        debit: Number(item.debit.toFixed(2)),
        credit: Number(item.credit.toFixed(2)),
      }))
      .sort((a, b) =>
        a.account.accountCode.localeCompare(b.account.accountCode),
      );

    const totalDebit = trialBalance.reduce((sum, item) => sum + item.debit, 0);

    const totalCredit = trialBalance.reduce(
      (sum, item) => sum + item.credit,
      0,
    );

    res.status(200).json({
      success: true,
      data: {
        accounts: trialBalance,
        totalDebit: Number(totalDebit.toFixed(2)),
        totalCredit: Number(totalCredit.toFixed(2)),
        isBalanced: Math.abs(totalDebit - totalCredit) <= 0.01,
      },
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getAccounts,
  getAccountById,
  createAccount,
  updateAccount,
  deleteAccount,

  getJournalEntries,
  getJournalEntryById,
  createJournalEntry,
  updateJournalEntry,
  deleteJournalEntry,

  getGeneralLedger,
  getTrialBalance,
};

const Expense = require("../models/Expense");
const Sale = require("../models/Sale");
const ClientPO = require("../models/ClientPO");

const mongoose = require("mongoose");

const { createExpenseJournalEntry } = require("../services/accountingService");

const roundMoney = (value) => {
  return Math.round((Number(value) + Number.EPSILON) * 100) / 100;
};

const calculateExpenseTotals = ({ amount, pricingMode, taxRate }) => {
  const grossAmount = roundMoney(amount);
  const rate = Number(taxRate || 0);

  if (grossAmount <= 0) {
    const error = new Error("Expense amount must be greater than zero");
    error.statusCode = 400;
    throw error;
  }

  if (pricingMode === "off") {
    return {
      amount: grossAmount,
      netAmount: grossAmount,
      taxAmount: 0,
      taxRate: 0,
      pricingMode: "off",
    };
  }

  if (rate <= 0) {
    return {
      amount: grossAmount,
      netAmount: grossAmount,
      taxAmount: 0,
      taxRate: 0,
      pricingMode,
    };
  }

  if (pricingMode === "inclusive") {
    const netAmount = roundMoney(grossAmount / (1 + rate / 100));

    const taxAmount = roundMoney(grossAmount - netAmount);

    return {
      amount: grossAmount,
      netAmount,
      taxAmount,
      taxRate: rate,
      pricingMode: "inclusive",
    };
  }

  if (pricingMode === "exclusive") {
    const netAmount = grossAmount;

    const taxAmount = roundMoney(netAmount * (rate / 100));

    return {
      amount: roundMoney(netAmount + taxAmount),
      netAmount,
      taxAmount,
      taxRate: rate,
      pricingMode: "exclusive",
    };
  }

  const error = new Error("Invalid expense pricing mode");
  error.statusCode = 400;
  throw error;
};

// GET ALL EXPENSES
const getExpenses = async (req, res, next) => {
  try {
    const expenses = await Expense.find()
      .populate("expenseAccountId", "accountCode accountName accountType")
      .populate("createdBy", "firstName lastName")
      .populate("updatedBy", "firstName lastName")

      .sort({ expenseDate: -1 });

    res.status(200).json({
      success: true,
      count: expenses.length,
      expenses,
    });
  } catch (error) {
    next(error);
  }
};

// GET SINGLE EXPENSE
const getExpenseById = async (req, res, next) => {
  try {
    const expense = await Expense.findById(req.params.id)
      .populate("expenseAccountId", "accountCode accountName accountType")
      .populate("createdBy", "firstName lastName")
      .populate("updatedBy", "firstName lastName");

    if (!expense) {
      return res.status(404).json({
        success: false,
        message: "Expense not found",
      });
    }

    res.status(200).json({
      success: true,
      expense,
    });
  } catch (error) {
    next(error);
  }
};

// CREATE EXPENSE
const createExpense = async (req, res, next) => {
  const session = await mongoose.startSession();

  try {
    const {
      expenseDate,
      category,
      expenseAccountId,
      description,
      amount,
      pricingMode = "inclusive",
      taxRate = 0,
      paymentMethod,
      referenceType = "OTHER",
      referenceId,
    } = req.body;

    if (referenceType !== "OTHER" && !referenceId) {
      const error = new Error(
        "Reference ID is required when reference type is SALE or CLIENT_PO",
      );

      error.statusCode = 400;
      throw error;
    }

    if (referenceType === "SALE") {
      const sale = await Sale.findById(referenceId);

      if (!sale) {
        const error = new Error("Sale not found");
        error.statusCode = 404;
        throw error;
      }
    }

    if (referenceType === "CLIENT_PO") {
      const clientPO = await ClientPO.findById(referenceId);

      if (!clientPO) {
        const error = new Error("Client PO not found");
        error.statusCode = 404;
        throw error;
      }
    }

    const totals = calculateExpenseTotals({
      amount,
      pricingMode,
      taxRate,
    });

    let createdExpenseId;

    await session.withTransaction(async () => {
      const ChartOfAccount = require("../models/chartOfAccount");

      const expenseAccount = await ChartOfAccount.findOne({
        _id: expenseAccountId,
        isActive: true,
        accountType: "expense",
      })
        .select("_id accountCode accountName accountType")
        .session(session);

      if (!expenseAccount) {
        const error = new Error(
          "Selected expense account is missing, inactive, or not an expense account",
        );

        error.statusCode = 400;
        throw error;
      }

      const [expense] = await Expense.create(
        [
          {
            expenseDate,
            category,
            expenseAccountId,
            description,
            amount: totals.amount,
            pricingMode: totals.pricingMode,
            taxRate: totals.taxRate,
            netAmount: totals.netAmount,
            taxAmount: totals.taxAmount,
            paymentMethod,
            status: "draft",
            referenceType,
            referenceId: referenceType === "OTHER" ? undefined : referenceId,
            createdBy: req.user._id,
          },
        ],
        { session },
      );

      createdExpenseId = expense._id;


    });

    const populatedExpense = await Expense.findById(createdExpenseId)
      .populate("createdBy", "firstName lastName")
      .populate("updatedBy", "firstName lastName")
      .populate("expenseAccountId", "accountCode accountName accountType");

    res.status(201).json({
      success: true,
      expense: populatedExpense,
    });
  } catch (error) {
    next(error);
  } finally {
    await session.endSession();
  }
};

// UPDATE EXPENSE
const updateExpense = async (req, res, next) => {
  try {
    const expense = await Expense.findById(req.params.id);

    if (!expense) {
      return res.status(404).json({
        success: false,
        message: "Expense not found",
      });
    }

    /*
    |--------------------------------------------------------------------------
    | Posted Expense Protection
    |--------------------------------------------------------------------------
    |
    | Once posted, the Expense has already been recognized in accounting.
    | It must not be edited directly.
    |
    */

    if (expense.status === "posted") {
      return res.status(400).json({
        success: false,
        message:
          "Posted expense cannot be modified. Cancel and reverse the expense instead.",
      });
    }

    if (expense.status === "cancelled") {
      return res.status(400).json({
        success: false,
        message: "Cancelled expense cannot be modified.",
      });
    }

    const {
      expenseDate,
      category,
      expenseAccountId,
      description,
      amount,
      pricingMode,
      taxRate,
      paymentMethod,
      referenceType,
      referenceId,
    } = req.body;

    /*
    |--------------------------------------------------------------------------
    | Determine Final Reference Values
    |--------------------------------------------------------------------------
    */

    const finalReferenceType =
      referenceType !== undefined
        ? referenceType
        : expense.referenceType;

    const finalReferenceId =
      referenceId !== undefined
        ? referenceId
        : expense.referenceId;

    /*
    |--------------------------------------------------------------------------
    | Validate Reference Integrity
    |--------------------------------------------------------------------------
    */

    if (finalReferenceType !== "OTHER" && !finalReferenceId) {
      return res.status(400).json({
        success: false,
        message:
          "Reference ID is required when reference type is SALE or CLIENT_PO",
      });
    }

    if (finalReferenceType === "SALE") {
      const sale = await Sale.findById(finalReferenceId);

      if (!sale) {
        return res.status(404).json({
          success: false,
          message: "Sale not found",
        });
      }
    }

    if (finalReferenceType === "CLIENT_PO") {
      const clientPO = await ClientPO.findById(finalReferenceId);

      if (!clientPO) {
        return res.status(404).json({
          success: false,
          message: "Client PO not found",
        });
      }
    }

    /*
    |--------------------------------------------------------------------------
    | Determine Final Financial Values
    |--------------------------------------------------------------------------
    */

    const finalAmount =
      amount !== undefined ? amount : expense.amount;

    const finalPricingMode =
      pricingMode !== undefined
        ? pricingMode
        : expense.pricingMode;

    const finalTaxRate =
      taxRate !== undefined
        ? taxRate
        : expense.taxRate;

    const totals = calculateExpenseTotals({
      amount: finalAmount,
      pricingMode: finalPricingMode,
      taxRate: finalTaxRate,
    });

    /*
    |--------------------------------------------------------------------------
    | Validate Expense Account
    |--------------------------------------------------------------------------
    */

    if (expenseAccountId !== undefined) {
      const ChartOfAccount = require("../models/chartOfAccount");

      const expenseAccount = await ChartOfAccount.findOne({
        _id: expenseAccountId,
        isActive: true,
        accountType: "expense",
      }).select("_id accountCode accountName accountType");

      if (!expenseAccount) {
        return res.status(400).json({
          success: false,
          message:
            "Selected expense account is missing, inactive, or not an expense account",
        });
      }
    }

    /*
    |--------------------------------------------------------------------------
    | Update Only Provided Fields
    |--------------------------------------------------------------------------
    */

    if (expenseDate !== undefined) {
      expense.expenseDate = expenseDate;
    }

    if (category !== undefined) {
      expense.category = category;
    }

    if (expenseAccountId !== undefined) {
      expense.expenseAccountId = expenseAccountId;
    }

    if (description !== undefined) {
      expense.description = description;
    }

    if (
      amount !== undefined ||
      pricingMode !== undefined ||
      taxRate !== undefined
    ) {
      expense.amount = totals.amount;
      expense.pricingMode = totals.pricingMode;
      expense.taxRate = totals.taxRate;
      expense.netAmount = totals.netAmount;
      expense.taxAmount = totals.taxAmount;
    }

    if (paymentMethod !== undefined) {
      expense.paymentMethod = paymentMethod;
    }

    if (referenceType !== undefined) {
      expense.referenceType = referenceType;
    }

    /*
    |--------------------------------------------------------------------------
    | Reference ID Handling
    |--------------------------------------------------------------------------
    */

    if (finalReferenceType === "OTHER") {
      expense.referenceId = undefined;
    } else if (referenceId !== undefined) {
      expense.referenceId = referenceId;
    }

    expense.updatedBy = req.user._id;

    await expense.save();

    /*
    |--------------------------------------------------------------------------
    | Return Populated Expense
    |--------------------------------------------------------------------------
    */

    const populatedExpense = await Expense.findById(expense._id)
      .populate("createdBy", "firstName lastName")
      .populate("updatedBy", "firstName lastName")
      .populate(
        "expenseAccountId",
        "accountCode accountName accountType",
      );

    res.status(200).json({
      success: true,
      expense: populatedExpense,
    });
  } catch (error) {
    next(error);
  }
};

// POST EXPENSE
const postExpense = async (req, res, next) => {
  const session = await mongoose.startSession();

  try {
    let postedExpenseId;

    await session.withTransaction(async () => {
      const expense = await Expense.findById(req.params.id).session(session);

      if (!expense) {
        const error = new Error("Expense not found");
        error.statusCode = 404;
        throw error;
      }

      if (expense.status === "posted") {
        const error = new Error("Expense is already posted");
        error.statusCode = 400;
        throw error;
      }

      if (expense.status === "cancelled") {
        const error = new Error("Cancelled expense cannot be posted");
        error.statusCode = 400;
        throw error;
      }

      expense.status = "posted";
      expense.updatedBy = req.user._id;

      await expense.save({ session });

      postedExpenseId = expense._id;

      await createExpenseJournalEntry({
        session,
        expense,
        createdBy: req.user._id,
      });
    });

    const populatedExpense = await Expense.findById(postedExpenseId)
      .populate("createdBy", "firstName lastName")
      .populate("updatedBy", "firstName lastName")
      .populate(
        "expenseAccountId",
        "accountCode accountName accountType",
      );

    res.status(200).json({
      success: true,
      message: "Expense posted successfully",
      expense: populatedExpense,
    });
  } catch (error) {
    next(error);
  } finally {
    await session.endSession();
  }
};


// DELETE EXPENSE
const deleteExpense = async (req, res, next) => {
  try {
    const expense = await Expense.findById(req.params.id);

    if (!expense) {
      return res.status(404).json({
        success: false,
        message: "Expense not found",
      });
    }

    /*
    |--------------------------------------------------------------------------
    | Posted Expense Protection
    |--------------------------------------------------------------------------
    |
    | Posted expenses have already been recognized in accounting.
    | They must never be hard-deleted.
    |
    */

    if (expense.status === "posted") {
      return res.status(400).json({
        success: false,
        message:
          "Posted expense cannot be deleted. Cancel and reverse the expense instead.",
      });
    }

    /*
    |--------------------------------------------------------------------------
    | Cancelled Expense Protection
    |--------------------------------------------------------------------------
    */

    if (expense.status === "cancelled") {
      return res.status(400).json({
        success: false,
        message: "Cancelled expense cannot be deleted.",
      });
    }

    /*
    |--------------------------------------------------------------------------
    | Draft Expense
    |--------------------------------------------------------------------------
    |
    | Draft expenses have no accounting recognition yet, so they can
    | safely be hard-deleted.
    |
    */

    await Expense.findByIdAndDelete(expense._id);

    res.status(200).json({
      success: true,
      message: "Draft expense deleted successfully",
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getExpenses,
  getExpenseById,
  createExpense,
  updateExpense,
  deleteExpense,
  postExpense,
};

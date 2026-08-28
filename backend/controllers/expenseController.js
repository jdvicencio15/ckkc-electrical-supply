const Expense = require("../models/Expense");
const Sale = require("../models/Sale");
const ClientPO = require("../models/ClientPO");


// GET ALL EXPENSES
const getExpenses = async (req, res, next) => {
  try {
    const expenses = await Expense.find()
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
  try {
    const {
      expenseDate,
      category,
      description,
      amount,
      referenceType = "OTHER",
      referenceId,
    } = req.body;

    // Validate reference integrity
    if (referenceType === "SALE" && referenceId) {
      const sale = await Sale.findById(referenceId);

      if (!sale) {
        return res.status(404).json({
          success: false,
          message: "Sale not found",
        });
      }
    }

    if (referenceType === "CLIENT_PO" && referenceId) {
      const clientPO = await ClientPO.findById(referenceId);

      if (!clientPO) {
        return res.status(404).json({
          success: false,
          message: "Client PO not found",
        });
      }
    }

    const expense = await Expense.create({
      expenseDate,
      category,
      description,
      amount,
      referenceType,
      referenceId,
      createdBy: req.user._id,
    });

    const populatedExpense = await Expense.findById(expense._id)
      .populate("createdBy", "firstName lastName")
      .populate("updatedBy", "firstName lastName");

    res.status(201).json({
      success: true,
      expense: populatedExpense,
    });
  } catch (error) {
    next(error);
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

    const {
      expenseDate,
      category,
      description,
      amount,
      referenceType,
      referenceId,
    } = req.body;

    // Determine final reference values
    const finalReferenceType =
      referenceType !== undefined
        ? referenceType
        : expense.referenceType;

    const finalReferenceId =
      referenceId !== undefined
        ? referenceId
        : expense.referenceId;

    // Validate reference integrity
    if (
      finalReferenceType !== "OTHER" &&
      !finalReferenceId
    ) {
      return res.status(400).json({
        success: false,
        message:
          "Reference ID is required when reference type is SALE or CLIENT_PO",
      });
    }

    if (
      finalReferenceType === "SALE" &&
      finalReferenceId
    ) {
      const sale = await Sale.findById(finalReferenceId);

      if (!sale) {
        return res.status(404).json({
          success: false,
          message: "Sale not found",
        });
      }
    }

    if (
      finalReferenceType === "CLIENT_PO" &&
      finalReferenceId
    ) {
      const clientPO =
        await ClientPO.findById(finalReferenceId);

      if (!clientPO) {
        return res.status(404).json({
          success: false,
          message: "Client PO not found",
        });
      }
    }

    // Update only provided fields
    if (expenseDate !== undefined) {
      expense.expenseDate = expenseDate;
    }

    if (category !== undefined) {
      expense.category = category;
    }

    if (description !== undefined) {
      expense.description = description;
    }

    if (amount !== undefined) {
      expense.amount = amount;
    }

    if (referenceType !== undefined) {
      expense.referenceType = referenceType;
    }

    if (referenceId !== undefined) {
      expense.referenceId = referenceId;
    }

    // Clear referenceId when changing reference type to OTHER
    if (
      referenceType !== undefined &&
      referenceType === "OTHER"
    ) {
      expense.referenceId = undefined;
    }

    // Record updater
    expense.updatedBy = req.user._id;

    await expense.save();

    const populatedExpense =
      await Expense.findById(expense._id)
        .populate("createdBy", "firstName lastName")
        .populate("updatedBy", "firstName lastName");

    res.status(200).json({
      success: true,
      expense: populatedExpense,
    });
  } catch (error) {
    next(error);
  }
};

// DELETE EXPENSE
const deleteExpense = async (req, res, next) => {
  try {
    const expense = await Expense.findByIdAndDelete(req.params.id);

    if (!expense) {
      return res.status(404).json({
        success: false,
        message: "Expense not found",
      });
    }

    res.status(200).json({
      success: true,
      message: "Expense deleted successfully",
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
};
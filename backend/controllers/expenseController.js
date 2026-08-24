const Expense = require("../models/Expense");

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
    const expense = await Expense.create({
      ...req.body,
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
    const expense = await Expense.findByIdAndUpdate(
      req.params.id,
      {
        ...req.body,
        updatedBy: req.user._id,
      },
      {
        new: true,
        runValidators: true,
      }
    )
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
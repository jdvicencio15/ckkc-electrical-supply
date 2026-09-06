const Product = require("../models/Product");
const InventoryMovement = require("../models/InventoryMovement");
const Sale = require("../models/Sale");
const Purchase = require("../models/Purchase");
const JournalEntry = require("../models/journalEntry");

// GET REPORT SUMMARY
const getReportSummary = async (req, res, next) => {
  try {
    const { startDate, endDate } = req.query;

    const filter = {};

    // Date filter
    if (startDate || endDate) {
      filter.date = {};

      if (startDate) {
        filter.date.$gte = new Date(startDate);
      }

      if (endDate) {
        const end = new Date(endDate);
        end.setHours(23, 59, 59, 999);

        filter.date.$lte = end;
      }
    }

    // SALES
    const salesFilter = {
      status: "released",
    };

    if (startDate || endDate) {
      salesFilter.saleDate = {};

      if (startDate) {
        salesFilter.saleDate.$gte = new Date(startDate);
      }

      if (endDate) {
        const end = new Date(endDate);
        end.setHours(23, 59, 59, 999);

        salesFilter.saleDate.$lte = end;
      }
    }

    const sales = await Sale.find(salesFilter).select(
      "subtotal totalAmount totalCost totalProfit"
    );

    const totalSales = sales.reduce(
      (sum, sale) => sum + (sale.subtotal || 0),
      0
    );

    // PURCHASES
    const purchasesFilter = {
      status: "received",
    };

    if (startDate || endDate) {
      purchasesFilter.purchaseDate = {};

      if (startDate) {
        purchasesFilter.purchaseDate.$gte = new Date(startDate);
      }

      if (endDate) {
        const end = new Date(endDate);
        end.setHours(23, 59, 59, 999);

        purchasesFilter.purchaseDate.$lte = end;
      }
    }

    const purchases = await Purchase.find(purchasesFilter).select(
      "totalAmount"
    );

    const totalPurchases = purchases.reduce(
      (sum, purchase) => sum + (purchase.totalAmount || 0),
      0
    );

    // ACCOUNTING EXPENSES
    const journalEntries = await JournalEntry.find(filter)
      .populate({
        path: "entries.account",
        select: "accountCode accountName accountType",
      })
      .select("entries");

    let totalExpenses = 0;
    let totalRevenue = 0;

    journalEntries.forEach((journalEntry) => {
      journalEntry.entries.forEach((entry) => {
        if (!entry.account) return;

        if (entry.account.accountType === "expense") {
          totalExpenses += (entry.debit || 0) - (entry.credit || 0);
        }

        if (entry.account.accountType === "revenue") {
          totalRevenue += (entry.credit || 0) - (entry.debit || 0);
        }
      });
    });

    const netProfit = totalRevenue - totalExpenses;

    res.status(200).json({
      success: true,
      data: {
        sales: totalSales,
        purchases: totalPurchases,
        expenses: totalExpenses,
        revenue: totalRevenue,
        netProfit,
      },
    });
  } catch (error) {
    next(error);
  }
};

// GET SALES REPORT
const getSalesReport = async (req, res, next) => {
  try {
    const { startDate, endDate } = req.query;

    const filter = {
      status: "released",
    };

    // Date filter
    if (startDate || endDate) {
      filter.saleDate = {};

      if (startDate) {
        filter.saleDate.$gte = new Date(startDate);
      }

      if (endDate) {
        const end = new Date(endDate);
        end.setHours(23, 59, 59, 999);

        filter.saleDate.$lte = end;
      }
    }

    const sales = await Sale.find(filter)
      .populate({
        path: "customerId",
        select: "name",
      })
      .select(
        "salesNumber customerId saleDate status subtotal totalAmount totalCost totalProfit"
      )
      .sort({ saleDate: -1 });

    const summary = sales.reduce(
      (acc, sale) => {
        acc.totalSales += sale.subtotal || 0;
        acc.totalAmount += sale.totalAmount || 0;
        acc.totalCost += sale.totalCost || 0;
        acc.totalProfit += sale.totalProfit || 0;

        return acc;
      },
      {
        totalSales: 0,
        totalAmount: 0,
        totalCost: 0,
        totalProfit: 0,
      }
    );

    res.status(200).json({
      success: true,
      data: {
        sales,
        count: sales.length,
        summary,
      },
    });
  } catch (error) {
    next(error);
  }
};

// GET PURCHASES REPORT
const getPurchasesReport = async (req, res, next) => {
  try {
    const { startDate, endDate } = req.query;

    const filter = {
      status: "received",
    };

    // Date filter
    if (startDate || endDate) {
      filter.purchaseDate = {};

      if (startDate) {
        filter.purchaseDate.$gte = new Date(startDate);
      }

      if (endDate) {
        const end = new Date(endDate);
        end.setHours(23, 59, 59, 999);

        filter.purchaseDate.$lte = end;
      }
    }

    const purchases = await Purchase.find(filter)
      .populate({
        path: "supplierId",
        select: "name",
      })
      .select(
        "purchaseNumber supplierId purchaseDate status totalAmount"
      )
      .sort({ purchaseDate: -1 });

    const summary = purchases.reduce(
      (acc, purchase) => {
        acc.totalPurchases += purchase.totalAmount || 0;

        return acc;
      },
      {
        totalPurchases: 0,
      }
    );

    res.status(200).json({
      success: true,
      data: {
        purchases,
        count: purchases.length,
        summary,
      },
    });
  } catch (error) {
    next(error);
  }
};


// GET INVENTORY REPORT
const getInventoryReport = async (req, res, next) => {
  try {
    const products = await Product.find()
      .populate({
        path: "categoryId",
        select: "name",
      })
      .select(
        "sku name categoryId unit minimumStock currentStock status"
      )
      .sort({ name: 1 });

    const summary = products.reduce(
      (acc, product) => {
        acc.totalProducts += 1;
        acc.totalStock += product.currentStock || 0;

        if ((product.currentStock || 0) === 0) {
          acc.outOfStock += 1;
        } else if (
          (product.currentStock || 0) <=
          (product.minimumStock || 0)
        ) {
          acc.lowStock += 1;
        }

        return acc;
      },
      {
        totalProducts: 0,
        totalStock: 0,
        lowStock: 0,
        outOfStock: 0,
      }
    );

    const movements = await InventoryMovement.find()
      .populate({
        path: "productId",
        select: "sku name unit",
      })
      .sort({ date: -1 })
      .select(
        "productId type quantity unitCost referenceType referenceId date notes"
      );

    res.status(200).json({
      success: true,
      data: {
        products,
        movements,
        summary,
      },
    });
  } catch (error) {
    next(error);
  }
};


// GET EXPENSE REPORT
const getExpenseReport = async (req, res, next) => {
  try {
    const { startDate, endDate } = req.query;

    const filter = {};

    if (startDate || endDate) {
      filter.date = {};

      if (startDate) {
        filter.date.$gte = new Date(`${startDate}T00:00:00.000Z`);
      }

      if (endDate) {
        filter.date.$lte = new Date(`${endDate}T23:59:59.999Z`);
      }
    }

    const journalEntries = await JournalEntry.find(filter)
      .populate({
        path: "entries.account",
        select: "accountCode accountName accountType",
      })
      .sort({ date: -1 });

    const expenseMap = new Map();
    const transactions = [];

    journalEntries.forEach((journalEntry) => {
      journalEntry.entries.forEach((line) => {
        const account = line.account;

        if (!account || account.accountType !== "expense") {
          return;
        }

        const amount = Number(line.debit || 0) - Number(line.credit || 0);

        if (amount === 0) {
          return;
        }

        const accountId = account._id.toString();

        if (!expenseMap.has(accountId)) {
          expenseMap.set(accountId, {
            accountId: account._id,
            accountCode: account.accountCode,
            accountName: account.accountName,
            total: 0,
          });
        }

        expenseMap.get(accountId).total += amount;

        transactions.push({
          journalEntryId: journalEntry._id,
          date: journalEntry.date,
          reference: journalEntry.reference,
          description: journalEntry.description,
          accountId: account._id,
          accountCode: account.accountCode,
          accountName: account.accountName,
          debit: Number(line.debit || 0),
          credit: Number(line.credit || 0),
          amount,
        });
      });
    });

    const breakdown = Array.from(expenseMap.values())
      .map((expense) => ({
        ...expense,
        total: Number(expense.total.toFixed(2)),
      }))
      .sort((a, b) => b.total - a.total);

    const totalExpenses = breakdown.reduce(
      (sum, expense) => sum + expense.total,
      0
    );

    res.status(200).json({
      success: true,
      data: {
        transactions,
        breakdown,
        summary: {
          totalExpenses: Number(totalExpenses.toFixed(2)),
          transactionCount: transactions.length,
          accountCount: breakdown.length,
        },
      },
    });
  } catch (error) {
    next(error);
  }
};




module.exports = {
  getReportSummary,
  getSalesReport,
  getPurchasesReport,
  getInventoryReport,
  getExpenseReport,
};
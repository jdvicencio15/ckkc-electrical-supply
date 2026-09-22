const Sale = require("../models/Sale");
const Purchase = require("../models/Purchase");
const SupplierPO = require("../models/SupplierPO");
const Quotation = require("../models/Quotation");
const Invoice = require("../models/Invoice");
const Payment = require("../models/Payment");
const Product = require("../models/Product");


// ==============================
// GET DASHBOARD MONTHLY SUMMARY
// ==============================
const getDashboardSummary = async (req, res, next) => {
  try {
    const { month } = req.query;

    // --------------------------------
    // VALIDATE MONTH
    // --------------------------------
    if (!month) {
      return res.status(400).json({
        success: false,
        message: "Month is required. Format: YYYY-MM",
      });
    }

    const monthRegex = /^\d{4}-(0[1-9]|1[0-2])$/;

    if (!monthRegex.test(month)) {
      return res.status(400).json({
        success: false,
        message: "Invalid month format. Expected YYYY-MM",
      });
    }

    // --------------------------------
    // MONTH DATE RANGE
    // --------------------------------
    const [year, monthNumber] = month.split("-").map(Number);

    const startOfMonth = new Date(
      year,
      monthNumber - 1,
      1,
      0,
      0,
      0,
      0
    );

    const startOfNextMonth = new Date(
      year,
      monthNumber,
      1,
      0,
      0,
      0,
      0
    );

    // --------------------------------
    // SALES SUMMARY
    // --------------------------------
    const salesSummary = await Sale.aggregate([
      {
        $match: {
          status: "released",
          saleDate: {
            $gte: startOfMonth,
            $lt: startOfNextMonth,
          },
        },
      },
      {
        $group: {
          _id: null,
          sales: {
            $sum: "$totalAmount",
          },
          orders: {
            $sum: 1,
          },
          profit: {
            $sum: "$totalProfit",
          },
        },
      },
    ]);

    const sales = salesSummary[0] || {
      sales: 0,
      orders: 0,
      profit: 0,
    };


    // --------------------------------
    // SALES BY CATEGORY
    // --------------------------------
    const salesByCategory = await Sale.aggregate([
      {
        $match: {
          status: "released",
          saleDate: {
            $gte: startOfMonth,
            $lt: startOfNextMonth,
          },
        },
      },

      {
        $unwind: "$items",
      },

      {
        $lookup: {
          from: "products",
          localField: "items.productId",
          foreignField: "_id",
          as: "product",
        },
      },

      {
        $unwind: "$product",
      },

      {
        $lookup: {
          from: "categories",
          localField: "product.categoryId",
          foreignField: "_id",
          as: "category",
        },
      },

      {
        $unwind: "$category",
      },

      {
        $group: {
          _id: "$category._id",
          categoryName: {
            $first: "$category.name",
          },
          sales: {
            $sum: {
              $multiply: [
                "$items.quantity",
                "$items.unitPrice",
              ],
            },
          },
        },
      },

      {
        $sort: {
          sales: -1,
        },
      },
    ]);

// --------------------------------
// SALES OVERVIEW
// --------------------------------
const salesOverview = await Sale.aggregate([
  {
    $match: {
      status: "released",
      saleDate: {
        $gte: new Date(
          year,
          monthNumber - 3,
          1,
          0,
          0,
          0,
          0
        ),
        $lt: startOfNextMonth,
      },
    },
  },
  {
    $group: {
      _id: {
        year: { $year: "$saleDate" },
        month: { $month: "$saleDate" },
      },
      sales: {
        $sum: "$totalAmount",
      },
    },
  },
  {
    $sort: {
      "_id.year": 1,
      "_id.month": 1,
    },
  },
]);

// --------------------------------
// FORMAT SALES OVERVIEW
// --------------------------------
const overviewData = salesOverview.map((item) => ({
  year: item._id.year,
  month: item._id.month,
  sales: item.sales || 0,
}));


  return res.status(200).json({
  success: true,
  month,
  summary: {
    sales: sales.sales || 0,
    orders: sales.orders || 0,
    profit: sales.profit || 0,
  },
  salesByCategory,
  salesOverview: overviewData,
});
  } catch (error) {
    next(error);
  }
};


// ==============================
// GET TODAY'S SUMMARY
// ==============================
const getTodaySummary = async (req, res, next) => {
  try {
    const role = req.user.role;

    // --------------------------------
    // TODAY DATE RANGE
    // --------------------------------
    const startOfDay = new Date();
    startOfDay.setHours(0, 0, 0, 0);

    const endOfDay = new Date();
    endOfDay.setHours(23, 59, 59, 999);

    // --------------------------------
    // OWNER / ADMIN
    // --------------------------------
    if (role === "owner" || role === "admin") {
      const [salesSummary, lowStock] = await Promise.all([
        Sale.aggregate([
          {
            $match: {
              status: "released",
              saleDate: {
                $gte: startOfDay,
                $lte: endOfDay,
              },
            },
          },
          {
            $group: {
              _id: null,
              sales: { $sum: "$totalAmount" },
              orders: { $sum: 1 },
              profit: { $sum: "$totalProfit" },
            },
          },
        ]),

        Product.countDocuments({
          status: "active",
          $expr: {
            $lte: ["$currentStock", "$minimumStock"],
          },
        }),
      ]);

      const summary = salesSummary[0] || {
        sales: 0,
        orders: 0,
        profit: 0,
      };

      return res.status(200).json({
        success: true,
        summary: {
          sales: summary.sales || 0,
          orders: summary.orders || 0,
          profit: summary.profit || 0,
          lowStock,
        },
      });
    }

    // --------------------------------
    // SALES
    // --------------------------------
    if (role === "sales") {
      const [salesSummary, quotations] = await Promise.all([
        Sale.aggregate([
          {
            $match: {
              status: "released",
              saleDate: {
                $gte: startOfDay,
                $lte: endOfDay,
              },
            },
          },
          {
            $group: {
              _id: null,
              sales: { $sum: "$totalAmount" },
              orders: { $sum: 1 },
            },
          },
        ]),

        Quotation.countDocuments({
          quotationDate: {
            $gte: startOfDay,
            $lte: endOfDay,
          },
        }),
      ]);

      const summary = salesSummary[0] || {
        sales: 0,
        orders: 0,
      };

      return res.status(200).json({
        success: true,
        summary: {
          sales: summary.sales || 0,
          orders: summary.orders || 0,
          quotations,
        },
      });
    }

    // --------------------------------
    // PURCHASING
    // --------------------------------
    if (role === "purchasing") {
      const [purchasesSummary, pendingPOs, lowStock] =
        await Promise.all([
          Purchase.aggregate([
            {
              $match: {
                status: "received",
                purchaseDate: {
                  $gte: startOfDay,
                  $lte: endOfDay,
                },
              },
            },
            {
              $group: {
                _id: null,
                purchases: { $sum: "$totalAmount" },
              },
            },
          ]),

          SupplierPO.countDocuments({
            status: {
              $in: [
                "draft",
                "sent",
                "confirmed",
                "partially_received",
              ],
            },
          }),

          Product.countDocuments({
            status: "active",
            $expr: {
              $lte: ["$currentStock", "$minimumStock"],
            },
          }),
        ]);

      const summary = purchasesSummary[0] || {
        purchases: 0,
      };

      return res.status(200).json({
        success: true,
        summary: {
          purchases: summary.purchases || 0,
          pendingPOs,
          lowStock,
        },
      });
    }

    // --------------------------------
    // ACCOUNTING
    // --------------------------------
    if (role === "accounting") {
      const [salesSummary, paymentsSummary, receivablesSummary] =
        await Promise.all([
          Sale.aggregate([
            {
              $match: {
                status: "released",
                saleDate: {
                  $gte: startOfDay,
                  $lte: endOfDay,
                },
              },
            },
            {
              $group: {
                _id: null,
                sales: { $sum: "$totalAmount" },
              },
            },
          ]),

          Payment.aggregate([
            {
              $match: {
                paymentDate: {
                  $gte: startOfDay,
                  $lte: endOfDay,
                },
              },
            },
            {
              $group: {
                _id: null,
                payments: { $sum: "$amount" },
              },
            },
          ]),

          Invoice.aggregate([
            {
              $match: {
                status: "issued",
              },
            },
            {
              $lookup: {
                from: "payments",
                localField: "_id",
                foreignField: "invoiceId",
                as: "payments",
              },
            },
            {
              $addFields: {
                totalPaid: {
                  $sum: "$payments.amount",
                },
              },
            },
            {
              $group: {
                _id: null,
                receivables: {
                  $sum: {
                    $max: [
                      {
                        $subtract: [
                          "$totalAmount",
                          "$totalPaid",
                        ],
                      },
                      0,
                    ],
                  },
                },
              },
            },
          ]),
        ]);

      const sales = salesSummary[0]?.sales || 0;
      const payments = paymentsSummary[0]?.payments || 0;
      const receivables =
        receivablesSummary[0]?.receivables || 0;

      return res.status(200).json({
        success: true,
        summary: {
          sales,
          payments,
          receivables,
        },
      });
    }

    // --------------------------------
    // UNSUPPORTED ROLE
    // --------------------------------
    return res.status(403).json({
      success: false,
      message: "Your role is not authorized for this summary",
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getTodaySummary,
   getDashboardSummary,
};
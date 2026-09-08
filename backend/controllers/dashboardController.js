const Sale = require("../models/Sale");
const Purchase = require("../models/Purchase");
const SupplierPO = require("../models/SupplierPO");
const Quotation = require("../models/Quotation");
const Invoice = require("../models/Invoice");
const Payment = require("../models/Payment");
const Product = require("../models/Product");

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
};
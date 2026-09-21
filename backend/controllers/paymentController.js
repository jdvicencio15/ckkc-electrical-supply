
const Payment = require("../models/Payment");
const Invoice = require("../models/Invoice");
const mongoose = require("mongoose");

const { roundMoney } = require("../utils/money");

const {
  createNotificationsForRoles,
} = require("../services/notificationService");

const {
  createPaymentJournalEntry,
} = require("../services/accountingService");


// ==============================
// GET ALL PAYMENTS
// ==============================
const getPayments = async (req, res, next) => {
  try {
    const payments = await Payment.find()
      .populate({
        path: "invoiceId",
        select: "invoiceNumber customerId invoiceDate dueDate status totalAmount",
        populate: {
          path: "customerId",
          select: "customerCode name",
        },
      })
      .populate("createdBy", "name")
      .populate("updatedBy", "name")
      .sort({ paymentDate: -1, createdAt: -1 });

    res.status(200).json({
      success: true,
      count: payments.length,
      payments,
    });
  } catch (error) {
    next(error);
  }
};

// ==============================
// GET PAYMENT BY ID
// ==============================
const getPaymentById = async (req, res, next) => {
  try {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        success: false,
        message: "Invalid payment ID",
      });
    }

    const payment = await Payment.findById(id)
      .populate({
        path: "invoiceId",
        select: "invoiceNumber customerId invoiceDate dueDate status totalAmount",
        populate: {
          path: "customerId",
          select: "customerCode name",
        },
      })
      .populate("createdBy", "name")
      .populate("updatedBy", "name");

    if (!payment) {
      return res.status(404).json({
        success: false,
        message: "Payment not found",
      });
    }

    res.status(200).json({
      success: true,
      payment,
    });
  } catch (error) {
    next(error);
  }
};

// ==============================
// CREATE PAYMENT
// ==============================
const createPayment = async (req, res, next) => {
  const session = await mongoose.startSession();

  try {
    session.startTransaction();

    const {
      invoiceId,
      paymentDate,
      amount,
      paymentMethod,
      referenceNumber,
      notes,
    } = req.body;

    // ------------------------------
    // Find invoice inside transaction
    // ------------------------------
    const invoice = await Invoice.findById(invoiceId).session(session);

    if (!invoice) {
      return res.status(404).json({
        success: false,
        message: "Invoice not found",
      });
    }

    // ------------------------------
    // Payment only allowed for issued invoices
    // ------------------------------
    if (invoice.status !== "issued") {
      return res.status(400).json({
        success: false,
        message: "Payment can only be recorded for issued invoices",
      });
    }

    // ------------------------------
    // Calculate total posted payments
    // ------------------------------
    const paymentSummary = await Payment.aggregate([
      {
        $match: {
          invoiceId: invoice._id,
          status: "posted",
        },
      },
      {
        $group: {
          _id: null,
          totalPaid: {
            $sum: "$amount",
          },
        },
      },
    ]).session(session);

    const totalPaid = paymentSummary[0]?.totalPaid || 0;

    const remainingBalance =
      roundMoney(invoice.totalAmount - totalPaid);

    const paymentAmount = roundMoney(amount);

    const newTotalPaid = roundMoney(
  totalPaid + paymentAmount,
);

const paymentStatus =
  newTotalPaid >= roundMoney(invoice.totalAmount)
    ? "paid"
    : newTotalPaid > 0
      ? "partial"
          : "unpaid";

    // ------------------------------
    // Prevent overpayment
    // ------------------------------
    if (paymentAmount > remainingBalance) {
      return res.status(400).json({
        success: false,
        message: `Payment exceeds remaining balance of ${remainingBalance}`,
      });
    }

    // ------------------------------
    // Create posted payment
    // ------------------------------
    const [payment] = await Payment.create(
      [
        {
          invoiceId,
          paymentDate,
          amount: paymentAmount,
          paymentMethod,
          referenceNumber,
          notes,
          status: "posted",
          createdBy: req.user._id,
        },
      ],
      { session },
    );

    // ------------------------------
    // Create accounting entry
    // ------------------------------
    await createPaymentJournalEntry({
      session,
      payment,
      createdBy: req.user._id,
    });

    // ------------------------------
    // Commit transaction
    // ------------------------------
    await session.commitTransaction();

    session.endSession();

    // ------------------------------
    // Notification AFTER successful commit
    // ------------------------------
    try {
      await createNotificationsForRoles({
  roles: ["owner", "admin", "accounting"],
  excludeUserId: req.user._id,
  type: "payment",
  title: "New Payment",
  message: `Payment received for Invoice ${invoice.invoiceNumber}.`,
  link: `/payments?search=${encodeURIComponent(
    invoice.invoiceNumber,
  )}`,
  entityType: "Payment",
  entityId: payment._id,
});
    } catch (notificationError) {
      console.error(
        "Failed to create payment notification:",
        notificationError,
      );
    }

    const populatedPayment = await Payment.findById(payment._id)
      .populate({
        path: "invoiceId",
        select:
          "invoiceNumber customerId invoiceDate dueDate status totalAmount",
        populate: {
          path: "customerId",
          select: "customerCode name",
        },
      })
      .populate("createdBy", "name")
      .populate("updatedBy", "name");

    return res.status(201).json({
      success: true,
      message: "Payment created successfully",
      payment: populatedPayment,
    });
  } catch (error) {
    if (session.inTransaction()) {
      await session.abortTransaction();
    }

    session.endSession();

    next(error);
  }
};

// ==============================
// UPDATE PAYMENT
// ==============================
const updatePayment = async (req, res, next) => {
  try {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        success: false,
        message: "Invalid payment ID",
      });
    }

    const payment = await Payment.findById(id);

    if (!payment) {
      return res.status(404).json({
        success: false,
        message: "Payment not found",
      });
    }

    if (payment.status === "posted") {
      return res.status(400).json({
        success: false,
        message:
          "Posted payment cannot be modified. Cancel and reverse the payment instead.",
      });
    }

    return res.status(400).json({
      success: false,
      message: "Cancelled payment cannot be modified",
    });
  } catch (error) {
    next(error);
  }
};

// ==============================
// DELETE PAYMENT
// ==============================
const deletePayment = async (req, res, next) => {
  try {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        success: false,
        message: "Invalid payment ID",
      });
    }

    const payment = await Payment.findById(id);

    if (!payment) {
      return res.status(404).json({
        success: false,
        message: "Payment not found",
      });
    }

    if (payment.status === "posted") {
      return res.status(400).json({
        success: false,
        message:
          "Posted payment cannot be deleted. Cancel and reverse the payment instead.",
      });
    }

    return res.status(400).json({
      success: false,
      message: "Cancelled payment cannot be deleted",
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getPayments,
  getPaymentById,
  createPayment,
  updatePayment,
  deletePayment,
};


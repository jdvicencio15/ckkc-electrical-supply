
const Payment = require("../models/Payment");
const Invoice = require("../models/Invoice");
const mongoose = require("mongoose");

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
  try {
    const {
      invoiceId,
      paymentDate,
      amount,
      paymentMethod,
      referenceNumber,
      notes,
    } = req.body;

    // ------------------------------
    // Find invoice
    // ------------------------------
    const invoice = await Invoice.findById(invoiceId);

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
    // Calculate total paid
    // ------------------------------
    const paymentSummary = await Payment.aggregate([
      {
        $match: {
          invoiceId: invoice._id,
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
    ]);

    const totalPaid = paymentSummary[0]?.totalPaid || 0;

    const remainingBalance = invoice.totalAmount - totalPaid;

    // ------------------------------
    // Prevent overpayment
    // ------------------------------
    if (Number(amount) > remainingBalance) {
      return res.status(400).json({
        success: false,
        message: `Payment exceeds remaining balance of ${remainingBalance}`,
      });
    }

    // ------------------------------
    // Create payment
    // ------------------------------
    const payment = await Payment.create({
      invoiceId,
      paymentDate,
      amount,
      paymentMethod,
      referenceNumber,
      notes,
      createdBy: req.user._id,
    });

    const populatedPayment = await Payment.findById(payment._id)
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

    res.status(201).json({
      success: true,
      message: "Payment created successfully",
      payment: populatedPayment,
    });
  } catch (error) {
    next(error);
  }
};

// ==============================
// UPDATE PAYMENT
// ==============================
const updatePayment = async (req, res, next) => {
  try {
    const { id } = req.params;

    const {
      paymentDate,
      amount,
      paymentMethod,
      referenceNumber,
      notes,
    } = req.body;

    // ------------------------------
    // Validate payment ID
    // ------------------------------
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        success: false,
        message: "Invalid payment ID",
      });
    }

    // ------------------------------
    // Find payment
    // ------------------------------
    const payment = await Payment.findById(id);

    if (!payment) {
      return res.status(404).json({
        success: false,
        message: "Payment not found",
      });
    }

    // ------------------------------
    // Find invoice
    // ------------------------------
    const invoice = await Invoice.findById(payment.invoiceId);

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
        message: "Payment can only be updated for issued invoices",
      });
    }

    // ------------------------------
    // Calculate total paid
    // excluding current payment
    // ------------------------------
    const paymentSummary = await Payment.aggregate([
      {
        $match: {
          invoiceId: invoice._id,
          _id: {
            $ne: payment._id,
          },
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
    ]);

    const totalPaidOtherPayments =
      paymentSummary[0]?.totalPaid || 0;

    const newAmount =
      amount !== undefined
        ? Number(amount)
        : payment.amount;

    const remainingBalance =
      invoice.totalAmount - totalPaidOtherPayments;

    // ------------------------------
    // Prevent overpayment
    // ------------------------------
    if (newAmount > remainingBalance) {
      return res.status(400).json({
        success: false,
        message: `Payment exceeds remaining balance of ${remainingBalance}`,
      });
    }

    // ------------------------------
    // Update payment
    // ------------------------------
    if (paymentDate !== undefined) {
      payment.paymentDate = paymentDate;
    }

    if (amount !== undefined) {
      payment.amount = amount;
    }

    if (paymentMethod !== undefined) {
      payment.paymentMethod = paymentMethod;
    }

    if (referenceNumber !== undefined) {
      payment.referenceNumber = referenceNumber;
    }

    if (notes !== undefined) {
      payment.notes = notes;
    }

    payment.updatedBy = req.user._id;

    await payment.save();

    const updatedPayment = await Payment.findById(payment._id)
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

    res.status(200).json({
      success: true,
      message: "Payment updated successfully",
      payment: updatedPayment,
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

    // ------------------------------
    // Validate payment ID
    // ------------------------------
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        success: false,
        message: "Invalid payment ID",
      });
    }

    // ------------------------------
    // Find payment
    // ------------------------------
    const payment = await Payment.findById(id);

    if (!payment) {
      return res.status(404).json({
        success: false,
        message: "Payment not found",
      });
    }

    // ------------------------------
    // Find invoice
    // ------------------------------
    const invoice = await Invoice.findById(payment.invoiceId);

    if (!invoice) {
      return res.status(404).json({
        success: false,
        message: "Invoice not found",
      });
    }

    // ------------------------------
    // Prevent modification of
    // payments for non-issued invoices
    // ------------------------------
    if (invoice.status !== "issued") {
      return res.status(400).json({
        success: false,
        message: "Payment can only be deleted for issued invoices",
      });
    }

    await Payment.findByIdAndDelete(id);

    res.status(200).json({
      success: true,
      message: "Payment deleted successfully",
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


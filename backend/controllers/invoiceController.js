const Invoice = require("../models/Invoice");
const Sale = require("../models/Sale");
const Customer = require("../models/Customer");
const Product = require("../models/Product");

const Payment = require("../models/Payment");
const { roundMoney } = require("../utils/money");

const {
  generateInvoicePDF,
} = require("../services/pdfService");

const Settings = require("../models/Settings");
const {
  checkReferenceExists,
  checkReferencesExist,
} = require("../utils/referenceValidator");

const {
  createNotificationsForRoles,
} = require("../services/notificationService");

const {
  generateDocumentNumber,
} = require("../services/documentNumberService");

const {
  resolveProductUnit,
} = require("../services/unitService");


const exportInvoicePDF = async (req, res, next) => {
  try {
    const invoice = await Invoice.findById(req.params.id)
      .populate("customerId", "customerCode name")
      .populate("items.productId", "sku name")
      .populate("items.unitId", "code name")
      .populate("createdBy", "firstName lastName email");

    if (!invoice) {
      return res.status(404).json({
        success: false,
        message: "Invoice not found",
      });
    }

    const settings = await Settings.findOne();

    generateInvoicePDF({
      invoice,
      settings,
      res,
    });
  } catch (error) {
    next(error);
  }
};

// GET ALL INVOICES
const getInvoices = async (req, res, next) => {
  try {
    const invoices = await Invoice.find()
      .populate("saleId", "salesNumber saleDate status totalAmount")
      .populate("customerId", "customerCode name")
      .populate("items.productId", "sku name unit")
      .populate("items.unitId", "code name")
      .populate("createdBy", "firstName lastName")
      .populate("updatedBy", "firstName lastName")
      .sort({ createdAt: -1 });

    // --------------------------------
    // Calculate payment status
    // --------------------------------
    const invoiceIds = invoices.map(
      (invoice) => invoice._id,
    );

    const paymentSummary = await Payment.aggregate([
      {
        $match: {
          invoiceId: {
            $in: invoiceIds,
          },
          status: "posted",
        },
      },
      {
        $group: {
          _id: "$invoiceId",
          totalPaid: {
            $sum: "$amount",
          },
        },
      },
    ]);

    const paymentMap = new Map(
      paymentSummary.map((payment) => [
        payment._id.toString(),
        roundMoney(payment.totalPaid),
      ]),
    );

    const invoicesWithPaymentStatus =
      invoices.map((invoice) => {
        const invoiceTotal = roundMoney(
          invoice.totalAmount || 0,
        );

        const totalPaid =
          paymentMap.get(invoice._id.toString()) || 0;

        const remainingBalance = roundMoney(
          Math.max(invoiceTotal - totalPaid, 0),
        );

        let paymentStatus = "unpaid";

        if (
          invoiceTotal > 0 &&
          totalPaid >= invoiceTotal
        ) {
          paymentStatus = "paid";
        } else if (totalPaid > 0) {
          paymentStatus = "partial";
        }

        return {
          ...invoice.toObject(),
          totalPaid,
          remainingBalance,
          paymentStatus,
        };
      });

    res.status(200).json({
      success: true,
      count: invoicesWithPaymentStatus.length,
      invoices: invoicesWithPaymentStatus,
    });
  } catch (error) {
    next(error);
  }
};

// GET SINGLE INVOICE
const getInvoiceById = async (req, res, next) => {
  try {
    const invoice = await Invoice.findById(req.params.id)
      .populate("saleId", "salesNumber saleDate status totalAmount")
      .populate("customerId", "customerCode name")
      .populate("items.productId", "sku name unit")
      .populate("items.unitId", "code name")
      .populate("createdBy", "firstName lastName")
      .populate("updatedBy", "firstName lastName");

    if (!invoice) {
      return res.status(404).json({
        success: false,
        message: "Invoice not found",
      });
    }

    res.status(200).json({
      success: true,
      invoice,
    });
  } catch (error) {
    next(error);
  }
};

// CREATE INVOICE
const createInvoice = async (req, res, next) => {
  try {
    const {
      invoiceNumber: _invoiceNumber,
      saleId,
      invoiceDate,
      dueDate,
    } = req.body;

    // CHECK SALE
    const sale = await Sale.findById(saleId);

    if (!sale) {
      return res.status(404).json({
        success: false,
        message: "Sale not found",
      });
    }

    // ONLY RELEASED SALES CAN BE INVOICED
    if (sale.status !== "released") {
      return res.status(400).json({
        success: false,
        message: "Only released sales can be invoiced",
      });
    }

    // PREVENT DUPLICATE INVOICE
    const existingInvoice = await Invoice.findOne({ saleId });

    if (existingInvoice) {
      return res.status(400).json({
        success: false,
        message: "This sale already has an invoice",
      });
    }

    // CHECK CUSTOMER FROM SALE
    await checkReferenceExists(
      Customer,
      sale.customerId,
      "Customer"
    );

    // CHECK PRODUCTS FROM SALE
    await checkReferencesExist(
      Product,
      sale.items.map((item) => item.productId),
      "Product"
    );

    // EFFECTIVE INVOICE DATE
    const effectiveInvoiceDate = invoiceDate
      ? new Date(invoiceDate)
      : new Date();

    // DUE DATE MUST NOT BE BEFORE INVOICE DATE
    if (
      dueDate &&
      new Date(dueDate) < effectiveInvoiceDate
    ) {
      return res.status(400).json({
        success: false,
        message: "Due date cannot be before invoice date",
      });
    }

    // SNAPSHOT SALE ITEMS INTO INVOICE
    const items = [];

    for (const item of sale.items) {
      const resolvedUnit = await resolveProductUnit(
        item.productId,
        item.unitId,
        item.unitCode
      );

      items.push({
        productId: item.productId,
        description: item.description,
        quantity: item.quantity,
        unitId: resolvedUnit.unitId,
        unitCode: resolvedUnit.unitCode,
        unitPrice: item.unitPrice,
      });
    }

    // SNAPSHOT SALE FINANCIAL TOTALS INTO INVOICE
    const subtotal = Number(sale.subtotal || 0);
    const taxRate = Number(sale.taxRate || 0);
    const taxAmount = Number(sale.taxAmount || 0);
    const pricingMode = sale.pricingMode || "inclusive";
    const netAmount = Number(
      sale.netAmount || subtotal
    );
    const totalAmount = Number(
      sale.totalAmount || subtotal
    );

    // GENERATE DOCUMENT NUMBER
    const invoiceNumber = await generateDocumentNumber(
      "invoice"
    );

    // CREATE INVOICE AS DRAFT
    // Status is intentionally NOT accepted from the client.
    const invoice = await Invoice.create({
      invoiceNumber,
      saleId: sale._id,
      customerId: sale.customerId,
      invoiceDate: effectiveInvoiceDate,
      dueDate,
      status: "draft",
      items,
      subtotal,
      taxRate,
      taxAmount,
      pricingMode,
      netAmount,
      totalAmount,
      createdBy: req.user._id,
    });

    // CHECK INVOICE NOTIFICATION SETTING
    const settings = await Settings.findOne().select(
      "invoiceNotifications"
    );

    // CREATE NOTIFICATION IF ENABLED
    if (settings?.invoiceNotifications !== false) {
      try {
       await createNotificationsForRoles({
  roles: ["owner", "admin", "accounting"],
  excludeUserId: req.user._id,
  type: "invoice",
  title: "New Invoice",
  message: `Invoice ${invoice.invoiceNumber} was created.`,
  link: `/invoices?search=${encodeURIComponent(
    invoice.invoiceNumber,
  )}`,
  entityType: "Invoice",
  entityId: invoice._id,
});
      } catch (notificationError) {
        console.error(
          "Failed to create invoice notification:",
          notificationError
        );
      }
    }

    // POPULATE RESPONSE
    const populatedInvoice =
      await Invoice.findById(invoice._id)
        .populate(
          "saleId",
          "salesNumber saleDate status totalAmount"
        )
        .populate(
          "customerId",
          "customerCode name"
        )
        .populate(
          "items.productId",
          "sku name unit"
        )
        .populate(
          "items.unitId",
          "code name"
        )
        .populate(
          "createdBy",
          "firstName lastName"
        );

    res.status(201).json({
      success: true,
      invoice: populatedInvoice,
    });
  } catch (error) {
    next(error);
  }
};

// UPDATE INVOICE
const updateInvoice = async (req, res, next) => {
  try {
    const invoice = await Invoice.findById(req.params.id);

    if (!invoice) {
      return res.status(404).json({
        success: false,
        message: "Invoice not found",
      });
    }

    // ONLY DRAFT INVOICES CAN BE UPDATED
    if (invoice.status !== "draft") {
      return res.status(400).json({
        success: false,
        message:
          "Only draft invoices can be updated",
      });
    }

    const {
      invoiceDate,
      dueDate,
      status,
    } = req.body;

    // ONLY ALLOW VALID DRAFT TRANSITIONS
    if (
      status !== undefined &&
      !["draft", "issued", "cancelled"].includes(
        status
      )
    ) {
      return res.status(400).json({
        success: false,
        message: "Invalid invoice status",
      });
    }

    // EFFECTIVE DATE VALUES
    const effectiveInvoiceDate =
      invoiceDate !== undefined
        ? new Date(invoiceDate)
        : invoice.invoiceDate;

    const effectiveDueDate =
      dueDate !== undefined
        ? new Date(dueDate)
        : invoice.dueDate;

    // DUE DATE MUST NOT BE BEFORE INVOICE DATE
    if (
      effectiveDueDate &&
      effectiveDueDate < effectiveInvoiceDate
    ) {
      return res.status(400).json({
        success: false,
        message:
          "Due date cannot be before invoice date",
      });
    }

    // UPDATE BASIC FIELDS ONLY
    if (invoiceDate !== undefined) {
      invoice.invoiceDate = effectiveInvoiceDate;
    }

    if (dueDate !== undefined) {
      invoice.dueDate = effectiveDueDate;
    }

    // ALLOW ONLY:
    // draft → draft
    // draft → issued
    // draft → cancelled
    if (status !== undefined) {
      invoice.status = status;
    }

    invoice.updatedBy = req.user._id;

    await invoice.save();

    const populatedInvoice =
      await Invoice.findById(invoice._id)
        .populate(
          "saleId",
          "salesNumber saleDate status totalAmount"
        )
        .populate(
          "customerId",
          "customerCode name"
        )
        .populate(
          "items.productId",
          "sku name unit"
        )
        .populate(
          "items.unitId",
          "code name"
        )
        .populate(
          "createdBy",
          "firstName lastName"
        )
        .populate(
          "updatedBy",
          "firstName lastName"
        );

    res.status(200).json({
      success: true,
      invoice: populatedInvoice,
    });
  } catch (error) {
    next(error);
  }
};

// DELETE INVOICE
const deleteInvoice = async (req, res, next) => {
  try {
    const invoice = await Invoice.findById(req.params.id);

    if (!invoice) {
      return res.status(404).json({
        success: false,
        message: "Invoice not found",
      });
    }

    // ONLY DRAFT INVOICES CAN BE DELETED
    if (invoice.status !== "draft") {
      return res.status(400).json({
        success: false,
        message:
          "Only draft invoices can be deleted",
      });
    }

    await invoice.deleteOne();

    res.status(200).json({
      success: true,
      message: "Invoice deleted successfully",
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getInvoices,
  getInvoiceById,
  createInvoice,
  updateInvoice,
  deleteInvoice,
  exportInvoicePDF,
};
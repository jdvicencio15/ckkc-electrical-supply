
const Invoice = require("../models/Invoice");
const Sale = require("../models/Sale");
const Customer = require("../models/Customer");
const Product = require("../models/Product");

const {
  checkReferenceExists,
  checkReferencesExist,
} = require("../utils/referenceValidator");

const {
  createNotificationsForRoles,
} = require("../services/notificationService");

// GET ALL INVOICES
const getInvoices = async (req, res, next) => {
  try {
    const invoices = await Invoice.find()
      .populate("saleId", "salesNumber saleDate status totalAmount")
      .populate("customerId", "customerCode name")
      .populate("items.productId", "sku name unit")
      .populate("createdBy", "firstName lastName")
      .populate("updatedBy", "firstName lastName")
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      count: invoices.length,
      invoices,
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
      invoiceNumber,
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

    // SNAPSHOT SALE ITEMS INTO INVOICE
    const items = sale.items.map((item) => ({
      productId: item.productId,
      description: item.description,
      quantity: item.quantity,
      unitPrice: item.unitPrice,
    }));

    // CALCULATE INVOICE SUBTOTAL
    const subtotal = items.reduce(
      (total, item) =>
        total +
        Number(item.quantity) * Number(item.unitPrice),
      0
    );

    // INVOICE TOTAL
    const totalAmount = subtotal;

    // CREATE INVOICE AS DRAFT
    const invoice = await Invoice.create({
      invoiceNumber,
      saleId: sale._id,
      customerId: sale.customerId,
      invoiceDate,
      dueDate,
      status: "draft",
      items,
      subtotal,
      totalAmount,
      createdBy: req.user._id,
    });

    // CREATE NOTIFICATION
try {
  await createNotificationsForRoles({
    roles: ["owner", "admin"],
    type: "invoice",
    title: "New Invoice",
    message: `Invoice ${invoice.invoiceNumber} was created.`,
    link: `/invoices?search=${encodeURIComponent(
      invoice.invoiceNumber
    )}`,
    entityType: "Invoice",
    entityId: invoice._id,
  });
} catch (notificationError) {
  console.error(
    "Failed to create invoice notification:",
    notificationError,
  );
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
        message: "Only draft invoices can be updated",
      });
    }

    const {
      invoiceNumber,
      invoiceDate,
      dueDate,
      status,
    } = req.body;

    // ONLY ALLOW VALID DRAFT TRANSITIONS
    if (
      status !== undefined &&
      !["draft", "issued", "cancelled"].includes(status)
    ) {
      return res.status(400).json({
        success: false,
        message: "Invalid invoice status",
      });
    }

    // UPDATE BASIC FIELDS ONLY
    if (invoiceNumber !== undefined) {
      invoice.invoiceNumber = invoiceNumber;
    }

    if (invoiceDate !== undefined) {
      invoice.invoiceDate = invoiceDate;
    }

    if (dueDate !== undefined) {
      invoice.dueDate = dueDate;
    }

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
        message: "Only draft invoices can be deleted",
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
};

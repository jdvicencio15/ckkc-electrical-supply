const Quotation = require("../models/Quotation");

const Customer = require("../models/Customer");
const Product = require("../models/Product");

const {
  checkReferenceExists,
  checkReferencesExist,
} = require("../utils/referenceValidator");



const calculateQuotationTotals = ({
  items,
  laborCost = 0,
  otherDirectCosts = 0,
}) => {
  const calculatedItems = items.map((item) => {
    const quantity = Number(item.quantity);
    const supplierCost = Number(
      item.supplierCostAtQuotation
    );
    const quotedUnitPrice = Number(
      item.quotedUnitPrice
    );

    if (
      !Number.isFinite(quantity) ||
      !Number.isFinite(supplierCost) ||
      !Number.isFinite(quotedUnitPrice)
    ) {
      const error = new Error(
        "Quotation item contains invalid numeric values"
      );

      error.statusCode = 400;

      throw error;
    }

    const markup =
      quotedUnitPrice - supplierCost;

    return {
      ...item.toObject?.() ?? item,
      quantity,
      supplierCostAtQuotation: supplierCost,
      quotedUnitPrice,
      markup,
    };
  });

  const safeLaborCost = Number(laborCost);
  const safeOtherDirectCosts =
    Number(otherDirectCosts);

  if (
    !Number.isFinite(safeLaborCost) ||
    !Number.isFinite(safeOtherDirectCosts)
  ) {
    const error = new Error(
      "Labor cost and other direct costs must be valid numbers"
    );

    error.statusCode = 400;

    throw error;
  }

  const subtotal = calculatedItems.reduce(
    (total, item) =>
      total + item.quantity * item.quotedUnitPrice,
    0
  );

  const total =
    subtotal +
    safeLaborCost +
    safeOtherDirectCosts;

  return {
    calculatedItems,
    subtotal,
    total,
  };
};

// GET ALL QUOTATIONS
const getQuotations = async (req, res, next) => {
  try {
    const quotations = await Quotation.find()
      .populate("customerId", "customerCode name")
      .populate("createdBy", "firstName lastName email")
      .populate("updatedBy", "firstName lastName email")
      .populate("items.productId", "sku name")
      .sort({ quotationDate: -1 });

    res.status(200).json({
      success: true,
      count: quotations.length,
      quotations,
    });
  } catch (error) {
    next(error);
  }
};

// GET SINGLE QUOTATION
const getQuotationById = async (req, res, next) => {
  try {
    const quotation = await Quotation.findById(req.params.id)
      .populate("customerId", "customerCode name")
      .populate("createdBy", "firstName lastName email")
      .populate("updatedBy", "firstName lastName email")
      .populate("items.productId", "sku name");

    if (!quotation) {
      return res.status(404).json({
        success: false,
        message: "Quotation not found",
      });
    }

    res.status(200).json({
      success: true,
      quotation,
    });
  } catch (error) {
    next(error);
  }
};

// CREATE QUOTATION
const createQuotation = async (req, res, next) => {
  try {
    const {
      items,
      customerId,
      laborCost = 0,
      otherDirectCosts = 0,
      ...quotationData
    } = req.body;

    await checkReferenceExists(
      Customer,
      customerId,
      "Customer"
    );

    await checkReferencesExist(
      Product,
      items.map((item) => item.productId),
      "Product"
    );

    const {
      calculatedItems,
      subtotal,
      total,
    } = calculateQuotationTotals({
      items,
      laborCost,
      otherDirectCosts,
    });

    const quotation = await Quotation.create({
      ...quotationData,
      customerId,
      items: calculatedItems,
      laborCost,
      otherDirectCosts,
      subtotal,
      total,
      createdBy: req.user._id,
    });

    const populatedQuotation =
      await Quotation.findById(quotation._id)
        .populate("customerId", "customerCode name")
        .populate(
          "createdBy",
          "firstName lastName email"
        )
        .populate("items.productId", "sku name");

    res.status(201).json({
      success: true,
      quotation: populatedQuotation,
    });
  } catch (error) {
    next(error);
  }
};

// UPDATE QUOTATION
const updateQuotation = async (req, res, next) => {
  try {
    const quotation =
      await Quotation.findById(req.params.id);

    if (!quotation) {
      return res.status(404).json({
        success: false,
        message: "Quotation not found",
      });
    }

    const {
      quotationNumber,
      customerId,
      quotationDate,
      status,
      items,
      laborCost,
      otherDirectCosts,
    } = req.body;

    if (customerId !== undefined) {
      await checkReferenceExists(
        Customer,
        customerId,
        "Customer"
      );

      quotation.customerId = customerId;
    }

    if (items !== undefined) {
      await checkReferencesExist(
        Product,
        items.map((item) => item.productId),
        "Product"
      );

      quotation.items = items;
    }

    if (quotationNumber !== undefined) {
      quotation.quotationNumber =
        quotationNumber;
    }

    if (quotationDate !== undefined) {
      quotation.quotationDate =
        quotationDate;
    }

    if (status !== undefined) {
      quotation.status = status;
    }

    if (laborCost !== undefined) {
      quotation.laborCost = laborCost;
    }

    if (otherDirectCosts !== undefined) {
      quotation.otherDirectCosts =
        otherDirectCosts;
    }


    const {
      calculatedItems,
      subtotal,
      total,
    } = calculateQuotationTotals({
      items: quotation.items,
      laborCost: quotation.laborCost,
      otherDirectCosts:
        quotation.otherDirectCosts,
    });

    quotation.items = calculatedItems;
    quotation.subtotal = subtotal;
    quotation.total = total;
    quotation.updatedBy = req.user._id;

    await quotation.save();

    const populatedQuotation =
      await Quotation.findById(quotation._id)
        .populate("customerId", "customerCode name")
        .populate(
          "createdBy",
          "firstName lastName email"
        )
        .populate(
          "updatedBy",
          "firstName lastName email"
        )
        .populate("items.productId", "sku name");

    res.status(200).json({
      success: true,
      quotation: populatedQuotation,
    });
  } catch (error) {
    next(error);
  }
};

// DELETE QUOTATION
const deleteQuotation = async (req, res, next) => {
  try {
    const quotation = await Quotation.findByIdAndDelete(req.params.id);

    if (!quotation) {
      return res.status(404).json({
        success: false,
        message: "Quotation not found",
      });
    }

    res.status(200).json({
      success: true,
      message: "Quotation deleted",
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getQuotations,
  getQuotationById,
  createQuotation,
  updateQuotation,
  deleteQuotation,
};
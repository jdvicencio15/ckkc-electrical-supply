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
    const markup =
      item.quotedUnitPrice -
      item.supplierCostAtQuotation;

    return {
      ...item,
      markup,
    };
  });

  const subtotal = calculatedItems.reduce(
    (total, item) =>
      total + item.quantity * item.quotedUnitPrice,
    0
  );

  const total =
    subtotal +
    laborCost +
    otherDirectCosts;

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
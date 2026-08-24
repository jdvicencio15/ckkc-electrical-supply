const Quotation = require("../models/Quotation");

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
    const quotation = await Quotation.create({
      ...req.body,
      createdBy: req.user._id,
    });

    const populatedQuotation = await Quotation.findById(quotation._id)
      .populate("customerId", "customerCode name")
      .populate("createdBy", "firstName lastName email")
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
    const quotation = await Quotation.findByIdAndUpdate(
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
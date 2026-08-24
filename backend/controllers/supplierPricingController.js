const SupplierPricing = require("../models/SupplierPricing");

// GET ALL SUPPLIER PRICING
const getSupplierPricings = async (req, res, next) => {
  try {
    const supplierPricings = await SupplierPricing.find()
      .populate("supplierId", "supplierCode name")
      .populate("productId", "sku name")
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      count: supplierPricings.length,
      supplierPricings,
    });
  } catch (error) {
    next(error);
  }
};

// GET SINGLE SUPPLIER PRICING
const getSupplierPricingById = async (req, res, next) => {
  try {
    const supplierPricing = await SupplierPricing.findById(req.params.id)
      .populate("supplierId", "supplierCode name")
      .populate("productId", "sku name");

    if (!supplierPricing) {
      return res.status(404).json({
        success: false,
        message: "Supplier pricing not found",
      });
    }

    res.status(200).json({
      success: true,
      supplierPricing,
    });
  } catch (error) {
    next(error);
  }
};

// CREATE SUPPLIER PRICING
const createSupplierPricing = async (req, res, next) => {
  try {
    const supplierPricing = await SupplierPricing.create(req.body);

    const populatedPricing = await SupplierPricing.findById(
      supplierPricing._id
    )
      .populate("supplierId", "supplierCode name")
      .populate("productId", "sku name");

    res.status(201).json({
      success: true,
      supplierPricing: populatedPricing,
    });
  } catch (error) {
    next(error);
  }
};

// UPDATE SUPPLIER PRICING
const updateSupplierPricing = async (req, res, next) => {
  try {
    const supplierPricing = await SupplierPricing.findByIdAndUpdate(
      req.params.id,
      req.body,
      {
        new: true,
        runValidators: true,
      }
    )
      .populate("supplierId", "supplierCode name")
      .populate("productId", "sku name");

    if (!supplierPricing) {
      return res.status(404).json({
        success: false,
        message: "Supplier pricing not found",
      });
    }

    res.status(200).json({
      success: true,
      supplierPricing,
    });
  } catch (error) {
    next(error);
  }
};

// DELETE SUPPLIER PRICING
const deleteSupplierPricing = async (req, res, next) => {
  try {
    const supplierPricing = await SupplierPricing.findByIdAndDelete(
      req.params.id
    );

    if (!supplierPricing) {
      return res.status(404).json({
        success: false,
        message: "Supplier pricing not found",
      });
    }

    res.status(200).json({
      success: true,
      message: "Supplier pricing deleted",
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getSupplierPricings,
  getSupplierPricingById,
  createSupplierPricing,
  updateSupplierPricing,
  deleteSupplierPricing,
};
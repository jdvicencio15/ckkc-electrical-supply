const SupplierPO = require("../models/SupplierPO");

// GET ALL SUPPLIER POS
const getSupplierPOs = async (req, res, next) => {
  try {
    const supplierPOs = await SupplierPO.find()
      .populate("supplierId", "supplierCode name")
      .populate("relatedClientPOId", "poNumber")
      .populate("createdBy", "firstName lastName")
      .populate("updatedBy", "firstName lastName")
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      count: supplierPOs.length,
      supplierPOs,
    });
  } catch (error) {
    next(error);
  }
};

// GET SINGLE SUPPLIER PO
const getSupplierPOById = async (req, res, next) => {
  try {
    const supplierPO = await SupplierPO.findById(req.params.id)
      .populate("supplierId", "supplierCode name")
      .populate("relatedClientPOId", "poNumber")
      .populate("items.productId", "sku name unit")
      .populate("createdBy", "firstName lastName")
      .populate("updatedBy", "firstName lastName");

    if (!supplierPO) {
      return res.status(404).json({
        success: false,
        message: "Supplier PO not found",
      });
    }

    res.status(200).json({
      success: true,
      supplierPO,
    });
  } catch (error) {
    next(error);
  }
};

// CREATE SUPPLIER PO
const createSupplierPO = async (req, res, next) => {
  try {
    const supplierPO = await SupplierPO.create({
      ...req.body,
      createdBy: req.user._id,
    });

    res.status(201).json({
      success: true,
      supplierPO,
    });
  } catch (error) {
    next(error);
  }
};

// UPDATE SUPPLIER PO
const updateSupplierPO = async (req, res, next) => {
  try {
    const supplierPO = await SupplierPO.findByIdAndUpdate(
      req.params.id,
      {
        ...req.body,
        updatedBy: req.user._id,
      },
      {
        new: true,
        runValidators: true,
      }
    );

    if (!supplierPO) {
      return res.status(404).json({
        success: false,
        message: "Supplier PO not found",
      });
    }

    res.status(200).json({
      success: true,
      supplierPO,
    });
  } catch (error) {
    next(error);
  }
};

// DELETE SUPPLIER PO
const deleteSupplierPO = async (req, res, next) => {
  try {
    const supplierPO = await SupplierPO.findByIdAndDelete(
      req.params.id
    );

    if (!supplierPO) {
      return res.status(404).json({
        success: false,
        message: "Supplier PO not found",
      });
    }

    res.status(200).json({
      success: true,
      message: "Supplier PO deleted",
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getSupplierPOs,
  getSupplierPOById,
  createSupplierPO,
  updateSupplierPO,
  deleteSupplierPO,
};
const SupplierPO = require("../models/SupplierPO");

const calculateSupplierPOTotal = (items) => {
  const totalAmount = items.reduce(
    (total, item) =>
      total + item.quantity * item.expectedUnitCost,
    0
  );

  return totalAmount;
};

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
    const {
      items,
      ...supplierPOData
    } = req.body;

    const totalAmount =
      calculateSupplierPOTotal(items);

    const supplierPO = await SupplierPO.create({
      ...supplierPOData,
      items,
      totalAmount,
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
    const supplierPO =
      await SupplierPO.findById(req.params.id);

    if (!supplierPO) {
      return res.status(404).json({
        success: false,
        message: "Supplier PO not found",
      });
    }

    const {
      supplierId,
      supplierPODate,
      status,
      relatedClientPOId,
      items,
    } = req.body;

    if (supplierId !== undefined) {
      supplierPO.supplierId = supplierId;
    }

    if (supplierPODate !== undefined) {
      supplierPO.supplierPODate = supplierPODate;
    }

    if (status !== undefined) {
      supplierPO.status = status;
    }

    if (relatedClientPOId !== undefined) {
      supplierPO.relatedClientPOId =
        relatedClientPOId;
    }

    if (items !== undefined) {
      supplierPO.items = items;
      supplierPO.totalAmount =
        calculateSupplierPOTotal(items);
    }

    supplierPO.updatedBy = req.user._id;

    await supplierPO.save();

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
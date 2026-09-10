const Supplier = require("../models/Supplier");
const SupplierPricing = require("../models/SupplierPricing");
const SupplierPO = require("../models/SupplierPO");
const Purchase = require("../models/Purchase");

// GET ALL SUPPLIERS
const getSuppliers = async (req, res, next) => {
  try {
    const suppliers = await Supplier.find().sort({ name: 1 });

    res.status(200).json({
      success: true,
      count: suppliers.length,
      suppliers,
    });
  } catch (error) {
    next(error);
  }
};

// GET SINGLE SUPPLIER
const getSupplierById = async (req, res, next) => {
  try {
    const supplier = await Supplier.findById(req.params.id);

    if (!supplier) {
      return res.status(404).json({
        success: false,
        message: "Supplier not found",
      });
    }

    res.status(200).json({
      success: true,
      supplier,
    });
  } catch (error) {
    next(error);
  }
};

// CREATE SUPPLIER
const createSupplier = async (req, res, next) => {
  try {
    const {
      supplierCode,
      name,
      contactPerson,
      email,
      phone,
      address,
      supplierType,
      status,
    } = req.body;

    const supplier = await Supplier.create({
      supplierCode,
      name,
      contactPerson,
      email,
      phone,
      address,
      supplierType,
      status,
    });

    res.status(201).json({
      success: true,
      supplier,
    });
  } catch (error) {
    next(error);
  }
};

// UPDATE SUPPLIER
const updateSupplier = async (req, res, next) => {
  try {
    const updateData = {
      supplierCode: req.body.supplierCode,
      name: req.body.name,
      contactPerson: req.body.contactPerson,
      email: req.body.email,
      phone: req.body.phone,
      address: req.body.address,
      supplierType: req.body.supplierType,
      status: req.body.status,
    };

    const supplier = await Supplier.findByIdAndUpdate(
      req.params.id,
      updateData,
      {
        new: true,
        runValidators: true,
      }
    );

    if (!supplier) {
      return res.status(404).json({
        success: false,
        message: "Supplier not found",
      });
    }

    res.status(200).json({
      success: true,
      supplier,
    });
  } catch (error) {
    next(error);
  }
};

// DELETE SUPPLIER
const deleteSupplier = async (req, res, next) => {
  try {
    const supplier = await Supplier.findById(req.params.id);

    if (!supplier) {
      return res.status(404).json({
        success: false,
        message: "Supplier not found",
      });
    }

    const [supplierPricingExists, supplierPOExists, purchaseExists] =
      await Promise.all([
        SupplierPricing.exists({ supplierId: supplier._id }),
        SupplierPO.exists({ supplierId: supplier._id }),
        Purchase.exists({ supplierId: supplier._id }),
      ]);

    if (
      supplierPricingExists ||
      supplierPOExists ||
      purchaseExists
    ) {
      return res.status(400).json({
        success: false,
        message:
          "Supplier cannot be deleted because it has existing transactions",
      });
    }

    await supplier.deleteOne();

    res.status(200).json({
      success: true,
      message: "Supplier deleted",
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getSuppliers,
  getSupplierById,
  createSupplier,
  updateSupplier,
  deleteSupplier,
};
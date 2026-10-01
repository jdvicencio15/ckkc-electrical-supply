const Supplier = require("../models/Supplier");
const SupplierPricing = require("../models/SupplierPricing");
const SupplierPO = require("../models/SupplierPO");
const Purchase = require("../models/Purchase");

const { createAuditLog } = require("../services/auditService");

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

    await createAuditLog({
      req,
      action: "CREATE",
      entity: "Supplier",
      entityId: supplier._id,
      documentNumber: supplier.supplierCode,
      description: `Created supplier ${supplier.name}`,
      after: supplier.toObject(),
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
    const supplier = await Supplier.findById(req.params.id);

    if (!supplier) {
      return res.status(404).json({
        success: false,
        message: "Supplier not found",
      });
    }

    const before = supplier.toObject();

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

    Object.keys(updateData).forEach((key) => {
      if (updateData[key] === undefined) {
        delete updateData[key];
      }
    });

    Object.assign(supplier, updateData);

    await supplier.save();

    await createAuditLog({
      req,
      action: "UPDATE",
      entity: "Supplier",
      entityId: supplier._id,
      documentNumber: supplier.supplierCode,
      description: `Updated supplier ${supplier.name}`,
      before,
      after: supplier.toObject(),
    });

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

    const before = supplier.toObject();

    await supplier.deleteOne();

    await createAuditLog({
      req,
      action: "DELETE",
      entity: "Supplier",
      entityId: supplier._id,
      documentNumber: supplier.supplierCode,
      description: `Deleted supplier ${supplier.name}`,
      before,
    });

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
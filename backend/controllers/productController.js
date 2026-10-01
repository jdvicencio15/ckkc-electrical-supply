const Product = require("../models/Product");
const Unit = require("../models/Unit");
const Supplier = require("../models/Supplier");
const SupplierPricing = require("../models/SupplierPricing");

const { createAuditLog } = require("../services/auditService");

// VALIDATE UNIT REFERENCE
const validateUnit = async (unitId) => {
  if (!unitId) return null;

  const unit = await Unit.findById(unitId);

  if (!unit) {
    const error = new Error("Unit not found");
    error.statusCode = 404;
    throw error;
  }

  if (unit.status !== "active") {
    const error = new Error(
      "This unit is inactive and cannot be assigned to a product."
    );
    error.statusCode = 400;
    throw error;
  }

  return unit;
};

// GET ALL PRODUCTS
const getProducts = async (req, res, next) => {
  try {
    const products = await Product.find()
      .populate("categoryId", "name")
      .populate("unitId", "code name");

    res.status(200).json({
      success: true,
      count: products.length,
      products,
    });
  } catch (error) {
    next(error);
  }
};

// GET SINGLE PRODUCT
const getProductById = async (req, res, next) => {
  try {
    const product = await Product.findById(req.params.id)
      .populate("categoryId", "name")
      .populate("unitId", "code name");

    if (!product) {
      return res.status(404).json({
        success: false,
        message: "Product not found",
      });
    }

    res.status(200).json({
      success: true,
      product,
    });
  } catch (error) {
    next(error);
  }
};

// CREATE PRODUCT
const createProduct = async (req, res, next) => {
  try {
    const { initialSupplierPricing, ...productData } = req.body;

    const unit = await validateUnit(productData.unitId);

    if (unit) {
      productData.unit = unit.code;
    }

    // VALIDATE INITIAL SUPPLIER PRICING
    let supplier = null;

    if (initialSupplierPricing) {
      supplier = await Supplier.findById(
        initialSupplierPricing.supplierId
      );

      if (!supplier) {
        const error = new Error("Supplier not found");
        error.statusCode = 404;
        throw error;
      }

      if (supplier.status !== "active") {
        const error = new Error(
          "This supplier is inactive and cannot be assigned to pricing."
        );
        error.statusCode = 400;
        throw error;
      }
    }

    // CREATE PRODUCT
    const product = await Product.create(productData);

    // CREATE INITIAL SUPPLIER PRICING
    if (initialSupplierPricing) {
      await SupplierPricing.create({
        supplierId: supplier._id,
        productId: product._id,
        unitCost: Number(initialSupplierPricing.unitCost),
      });
    }

    await product.populate([
      { path: "categoryId", select: "name" },
      { path: "unitId", select: "code name" },
    ]);

    // AUDIT CREATE
    await createAuditLog({
      req,
      action: "CREATE",
      entity: "Product",
      entityId: product._id,
      documentNumber: product.productCode,
      description: `Created product ${product.name}`,
      after: product.toObject(),
    });

    res.status(201).json({
      success: true,
      product,
    });
  } catch (error) {
    next(error);
  }
};

// UPDATE PRODUCT
const updateProduct = async (req, res, next) => {
  try {
    // currentStock must not be manually changed through Product CRUD.
    const { currentStock, ...updateData } = req.body;

    const product = await Product.findById(req.params.id);

    if (!product) {
      return res.status(404).json({
        success: false,
        message: "Product not found",
      });
    }

    // Capture state BEFORE modification.
    const before = product.toObject();

    if (updateData.unitId !== undefined) {
      const unit = await validateUnit(updateData.unitId);

      if (unit) {
        updateData.unit = unit.code;
      }
    }

    // Apply only supplied fields.
    Object.keys(updateData).forEach((key) => {
      if (updateData[key] === undefined) {
        delete updateData[key];
      }
    });

    Object.assign(product, updateData);

    await product.save();

    await product.populate([
      { path: "categoryId", select: "name" },
      { path: "unitId", select: "code name" },
    ]);

    // AUDIT UPDATE
    await createAuditLog({
      req,
      action: "UPDATE",
      entity: "Product",
      entityId: product._id,
      documentNumber: product.productCode,
      description: `Updated product ${product.name}`,
      before,
      after: product.toObject(),
    });

    res.status(200).json({
      success: true,
      product,
    });
  } catch (error) {
    next(error);
  }
};

// DELETE PRODUCT
const deleteProduct = async (req, res, next) => {
  try {
    const product = await Product.findById(req.params.id);

    if (!product) {
      return res.status(404).json({
        success: false,
        message: "Product not found",
      });
    }

    // Prevent deletion when supplier pricing still references the product.
    const supplierPricingExists = await SupplierPricing.exists({
      productId: product._id,
    });

    if (supplierPricingExists) {
      return res.status(400).json({
        success: false,
        message:
          "Product cannot be deleted because it has existing supplier pricing.",
      });
    }

    // Capture state BEFORE deletion.
    const before = product.toObject();

    await product.deleteOne();

    // AUDIT DELETE
    await createAuditLog({
      req,
      action: "DELETE",
      entity: "Product",
      entityId: product._id,
      documentNumber: product.productCode,
      description: `Deleted product ${product.name}`,
      before,
    });

    res.status(200).json({
      success: true,
      message: "Product deleted",
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getProducts,
  getProductById,
  createProduct,
  updateProduct,
  deleteProduct,
};
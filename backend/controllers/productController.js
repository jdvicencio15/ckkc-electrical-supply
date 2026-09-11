
const Product = require("../models/Product");
const Unit = require("../models/Unit");
const Supplier = require("../models/Supplier");
const SupplierPricing = require("../models/SupplierPricing");


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
    productData.unit = unit.code;

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

    if (updateData.unitId !== undefined) {
      const unit = await validateUnit(updateData.unitId);
      updateData.unit = unit.code;
    }

    const product = await Product.findByIdAndUpdate(
      req.params.id,
      updateData,
      {
        new: true,
        runValidators: true,
      }
    )
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

// DELETE PRODUCT
const deleteProduct = async (req, res, next) => {
  try {
    const product = await Product.findByIdAndDelete(req.params.id);

    if (!product) {
      return res.status(404).json({
        success: false,
        message: "Product not found",
      });
    }

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


const Category = require("../models/Category");

const Product = require("../models/Product");

const { createAuditLog } = require("../services/auditService");

// GET ALL CATEGORIES
const getCategories = async (req, res, next) => {
  try {
    const categories = await Category.find().sort({ name: 1 });

    res.status(200).json({
      success: true,
      count: categories.length,
      categories,
    });
  } catch (error) {
    next(error);
  }
};

// GET SINGLE CATEGORY
const getCategoryById = async (req, res, next) => {
  try {
    const category = await Category.findById(req.params.id);

    if (!category) {
      return res.status(404).json({
        success: false,
        message: "Category not found",
      });
    }

    res.status(200).json({
      success: true,
      category,
    });
  } catch (error) {
    next(error);
  }
};

// CREATE CATEGORY
const createCategory = async (req, res, next) => {
  try {
    const category = await Category.create(req.body);

    await createAuditLog({
      req,
      action: "CREATE",
      entity: "Category",
      entityId: category._id,
      documentNumber: category.name,
      description: `Created category ${category.name}`,
      after: category.toObject(),
    });

    res.status(201).json({
      success: true,
      category,
    });
  } catch (error) {
    next(error);
  }
};

// UPDATE CATEGORY
const updateCategory = async (req, res, next) => {
  try {
    const category = await Category.findById(req.params.id);

    if (!category) {
      return res.status(404).json({
        success: false,
        message: "Category not found",
      });
    }

    const before = category.toObject();

    Object.assign(category, req.body);

    await category.save();

    await createAuditLog({
      req,
      action: "UPDATE",
      entity: "Category",
      entityId: category._id,
      documentNumber: category.name,
      description: `Updated category ${category.name}`,
      before,
      after: category.toObject(),
    });

    res.status(200).json({
      success: true,
      category,
    });
  } catch (error) {
    next(error);
  }
};

// DELETE CATEGORY
const deleteCategory = async (req, res, next) => {
  try {
    const category = await Category.findById(req.params.id);

    if (!category) {
      return res.status(404).json({
        success: false,
        message: "Category not found",
      });
    }



    const productExists = await Product.exists({
  categoryId: category._id,
});

if (productExists) {
  return res.status(400).json({
    success: false,
    message:
      "Category cannot be deleted because it is assigned to existing products.",
  });
    }
    
    const before = category.toObject();


    await category.deleteOne();

    await createAuditLog({
      req,
      action: "DELETE",
      entity: "Category",
      entityId: category._id,
      documentNumber: category.name,
      description: `Deleted category ${category.name}`,
      before,
    });

    res.status(200).json({
      success: true,
      message: "Category deleted successfully",
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getCategories,
  getCategoryById,
  createCategory,
  updateCategory,
  deleteCategory,
};
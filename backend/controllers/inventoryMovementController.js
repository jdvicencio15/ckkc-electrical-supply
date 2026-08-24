const InventoryMovement = require("../models/InventoryMovement");

const Product = require("../models/Product");

// GET ALL INVENTORY MOVEMENTS
const getInventoryMovements = async (req, res, next) => {
  try {
    const movements = await InventoryMovement.find()
      .populate("productId", "sku name unit currentStock")
      .populate("createdBy", "firstName lastName")
      .sort({ date: -1 });

    res.status(200).json({
      success: true,
      count: movements.length,
      movements,
    });
  } catch (error) {
    next(error);
  }
};

// GET SINGLE INVENTORY MOVEMENT
const getInventoryMovementById = async (req, res, next) => {
  try {
    const movement = await InventoryMovement.findById(req.params.id)
      .populate("productId", "sku name unit currentStock")
      .populate("createdBy", "firstName lastName");

    if (!movement) {
      return res.status(404).json({
        success: false,
        message: "Inventory movement not found",
      });
    }

    res.status(200).json({
      success: true,
      movement,
    });
  } catch (error) {
    next(error);
  }
};

// CREATE INVENTORY MOVEMENT
const createInventoryMovement = async (req, res, next) => {
  try {
    const {
      productId,
      type,
      quantity,
      unitCost,
      referenceType,
      referenceId,
      date,
      notes,
    } = req.body;

    const product = await Product.findById(productId);

    if (!product) {
      return res.status(404).json({
        success: false,
        message: "Product not found",
      });
    }

    // Update stock
    if (type === "IN") {
      product.currentStock += quantity;
    }

    if (type === "OUT") {
      if (product.currentStock < quantity) {
        return res.status(400).json({
          success: false,
          message: "Insufficient stock",
        });
      }

      product.currentStock -= quantity;
    }

    if (type === "ADJUSTMENT") {
      product.currentStock = quantity;
    }

    await product.save();

    const movement = await InventoryMovement.create({
      productId,
      type,
      quantity,
      unitCost,
      referenceType,
      referenceId,
      date,
      notes,
      createdBy: req.user._id,
    });

    const populatedMovement = await InventoryMovement.findById(
      movement._id
    )
      .populate(
        "productId",
        "sku name unit currentStock"
      )
      .populate(
        "createdBy",
        "firstName lastName"
      );

    res.status(201).json({
      success: true,
      movement: populatedMovement,
    });
  } catch (error) {
    next(error);
  }
};
// UPDATE INVENTORY MOVEMENT
const updateInventoryMovement = async (req, res, next) => {
  try {
    const movement = await InventoryMovement.findByIdAndUpdate(
      req.params.id,
      req.body,
      {
        new: true,
        runValidators: true,
      }
    )
      .populate("productId", "sku name unit currentStock")
      .populate("createdBy", "firstName lastName");

    if (!movement) {
      return res.status(404).json({
        success: false,
        message: "Inventory movement not found",
      });
    }

    res.status(200).json({
      success: true,
      movement,
    });
  } catch (error) {
    next(error);
  }
};

// DELETE INVENTORY MOVEMENT
const deleteInventoryMovement = async (req, res, next) => {
  try {
    const movement = await InventoryMovement.findByIdAndDelete(
      req.params.id
    );

    if (!movement) {
      return res.status(404).json({
        success: false,
        message: "Inventory movement not found",
      });
    }

    res.status(200).json({
      success: true,
      message: "Inventory movement deleted successfully",
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getInventoryMovements,
  getInventoryMovementById,
  createInventoryMovement,
  updateInventoryMovement,
  deleteInventoryMovement,
};
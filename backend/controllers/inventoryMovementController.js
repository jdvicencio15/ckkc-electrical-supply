const mongoose = require("mongoose");

const InventoryMovement = require("../models/InventoryMovement");
const Product = require("../models/Product");
const Purchase = require("../models/Purchase");

// RECALCULATE PRODUCT STOCK
const recalculateProductStock = async (productId, session) => {
  const movements = await InventoryMovement.find({
    productId,
  })
    .sort({
      date: 1,
      createdAt: 1,
    })
    .session(session);

  let stock = 0;

  for (const movement of movements) {
    if (movement.type === "IN") {
      stock += movement.quantity;
    }

    if (movement.type === "OUT") {
      stock -= movement.quantity;
    }

    if (movement.type === "ADJUSTMENT") {
      stock = movement.quantity;
    }
  }

  stock = Math.max(stock, 0);

  await Product.findByIdAndUpdate(
    productId,
    {
      currentStock: stock,
    },
    {
      session,
      runValidators: true,
    }
  );
};

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

// VALIDATE MOVEMENT / REFERENCE TYPE
const validateMovementReference = (type, referenceType) => {
  const validCombinations = {
    IN: ["PURCHASE"],
    OUT: ["SALE"],
    ADJUSTMENT: ["ADJUSTMENT"],
  };

  return validCombinations[type]?.includes(referenceType);
};

// CREATE INVENTORY MOVEMENT
const createInventoryMovement = async (req, res, next) => {
  const session = await mongoose.startSession();

  try {
    session.startTransaction();

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

    // Validate movement/reference pairing
    if (!validateMovementReference(type, referenceType)) {
      await session.abortTransaction();

      return res.status(400).json({
        success: false,
        message:
          "Invalid inventory movement and reference type combination",
      });
    }

    // Sale-generated OUT movements must only be created
    // by the Sale release process
    if (type === "OUT" && referenceType === "SALE") {
      await session.abortTransaction();

      return res.status(403).json({
        success: false,
        message:
          "Sale-generated inventory movements can only be created when releasing a sale",
      });
    }

    // Validate Purchase reference
    if (type === "IN" && referenceType === "PURCHASE") {
      const purchase = await Purchase.findById(referenceId).session(
        session
      );

      if (!purchase) {
        await session.abortTransaction();

        return res.status(404).json({
          success: false,
          message: "Purchase not found",
        });
      }
    }

    const product = await Product.findById(productId).session(session);

    if (!product) {
      await session.abortTransaction();

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
        await session.abortTransaction();

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

    await product.save({ session });

    const [movement] = await InventoryMovement.create(
      [
        {
          productId,
          type,
          quantity,
          unitCost,
          referenceType,
          referenceId,
          date,
          notes,
          createdBy: req.user._id,
        },
      ],
      { session }
    );

    await session.commitTransaction();

    const populatedMovement = await InventoryMovement.findById(
      movement._id
    )
      .populate("productId", "sku name unit currentStock")
      .populate("createdBy", "firstName lastName");

    res.status(201).json({
      success: true,
      movement: populatedMovement,
    });
  } catch (error) {
    await session.abortTransaction();
    next(error);
  } finally {
    session.endSession();
  }
};

// UPDATE INVENTORY MOVEMENT
const updateInventoryMovement = async (req, res, next) => {
  const session = await mongoose.startSession();

  try {
    session.startTransaction();

    const movement = await InventoryMovement.findById(
      req.params.id
    ).session(session);

    if (!movement) {
      await session.abortTransaction();

      return res.status(404).json({
        success: false,
        message: "Inventory movement not found",
      });
    }

    // Sale movements are system-generated and immutable
    if (movement.referenceType === "SALE") {
      await session.abortTransaction();

      return res.status(403).json({
        success: false,
        message:
          "Sale-generated inventory movements cannot be modified",
      });
    }

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

    const nextProductId =
      productId !== undefined
        ? productId
        : movement.productId;

    const nextType =
      type !== undefined
        ? type
        : movement.type;

    const nextReferenceType =
      referenceType !== undefined
        ? referenceType
        : movement.referenceType;

    const nextReferenceId =
      referenceId !== undefined
        ? referenceId
        : movement.referenceId;

    // Validate resulting movement/reference combination
    if (
      !validateMovementReference(
        nextType,
        nextReferenceType
      )
    ) {
      await session.abortTransaction();

      return res.status(400).json({
        success: false,
        message:
          "Invalid inventory movement and reference type combination",
      });
    }

    // SALE movements cannot be converted into manually managed
    // inventory movements
    if (
      nextType === "OUT" &&
      nextReferenceType === "SALE"
    ) {
      await session.abortTransaction();

      return res.status(403).json({
        success: false,
        message:
          "Sale-generated inventory movements cannot be created or modified manually",
      });
    }

    // Validate Purchase reference
    if (
      nextType === "IN" &&
      nextReferenceType === "PURCHASE"
    ) {
      const purchase = await Purchase.findById(
        nextReferenceId
      ).session(session);

      if (!purchase) {
        await session.abortTransaction();

        return res.status(404).json({
          success: false,
          message: "Purchase not found",
        });
      }
    }

    const oldProductId =
      movement.productId.toString();

    movement.productId = nextProductId;
    movement.type = nextType;

    if (quantity !== undefined) {
      movement.quantity = quantity;
    }

    if (unitCost !== undefined) {
      movement.unitCost = unitCost;
    }

    movement.referenceType = nextReferenceType;
    movement.referenceId = nextReferenceId;

    if (date !== undefined) {
      movement.date = date;
    }

    if (notes !== undefined) {
      movement.notes = notes;
    }

    await movement.save({ session });

    const newProductId =
      movement.productId.toString();

    await recalculateProductStock(
      movement.productId,
      session
    );

    if (oldProductId !== newProductId) {
      await recalculateProductStock(
        oldProductId,
        session
      );
    }

    await session.commitTransaction();

    const populatedMovement =
      await InventoryMovement.findById(
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

    res.status(200).json({
      success: true,
      movement: populatedMovement,
    });
  } catch (error) {
    await session.abortTransaction();
    next(error);
  } finally {
    session.endSession();
  }
};

// DELETE INVENTORY MOVEMENT
const deleteInventoryMovement = async (req, res, next) => {
  const session = await mongoose.startSession();

  try {
    session.startTransaction();

    const movement = await InventoryMovement.findById(
      req.params.id
    ).session(session);

    if (!movement) {
      await session.abortTransaction();

      return res.status(404).json({
        success: false,
        message: "Inventory movement not found",
      });
    }

    // Sale movements are system-generated and immutable
    if (movement.referenceType === "SALE") {
      await session.abortTransaction();

      return res.status(403).json({
        success: false,
        message:
          "Sale-generated inventory movements cannot be deleted",
      });
    }

    const productId = movement.productId;

    await movement.deleteOne({ session });

    await recalculateProductStock(
      productId,
      session
    );

    await session.commitTransaction();

    res.status(200).json({
      success: true,
      message: "Inventory movement deleted successfully",
    });
  } catch (error) {
    await session.abortTransaction();
    next(error);
  } finally {
    session.endSession();
  }
};

module.exports = {
  getInventoryMovements,
  getInventoryMovementById,
  createInventoryMovement,
  updateInventoryMovement,
  deleteInventoryMovement,
};
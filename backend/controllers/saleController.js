const mongoose = require("mongoose");
const Sale = require("../models/Sale");
const Product = require("../models/Product");
const InventoryMovement = require("../models/InventoryMovement");

const Customer = require("../models/Customer");
const ClientPO = require("../models/ClientPO");

const {
  checkReferenceExists,
  checkReferencesExist,
} = require("../utils/referenceValidator");

// GET ALL SALES
const getSales = async (req, res, next) => {
  try {
    const sales = await Sale.find()
      .populate("customerId", "customerCode name")
      .populate("clientPOId", "poNumber")
      .populate("createdBy", "firstName lastName")
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      count: sales.length,
      sales,
    });
  } catch (error) {
    next(error);
  }
};

// GET SINGLE SALE
const getSaleById = async (req, res, next) => {
  try {
    const sale = await Sale.findById(req.params.id)
      .populate("customerId", "customerCode name")
      .populate("clientPOId", "poNumber")
      .populate("createdBy", "firstName lastName")
      .populate("updatedBy", "firstName lastName");

    if (!sale) {
      return res.status(404).json({
        success: false,
        message: "Sale not found",
      });
    }

    res.status(200).json({
      success: true,
      sale,
    });
  } catch (error) {
    next(error);
  }
};

// CREATE SALE
const createSale = async (req, res, next) => {
  try {
    const {
      salesNumber,
      customerId,
      clientPOId,
      saleDate,
      status,
      items,
      directExpenses = 0,
      commission = 0,
    } = req.body;

    await checkReferenceExists(Customer, customerId, "Customer");

    await checkReferenceExists(ClientPO, clientPOId, "Client PO");

    await checkReferencesExist(
      Product,
      items.map((item) => item.productId),
      "Product",
    );

    // Calculate item totals
    const calculatedItems = items.map((item) => {
      const profit = (item.unitPrice - item.unitCost) * item.quantity;

      return {
        ...item,
        profit,
      };
    });

    // Calculate totals
    const subtotal = calculatedItems.reduce(
      (total, item) => total + item.quantity * item.unitPrice,
      0,
    );

    const totalCost = calculatedItems.reduce(
      (total, item) => total + item.quantity * item.unitCost,
      0,
    );

    const totalAmount = subtotal + directExpenses + commission;

    const totalProfit = subtotal - totalCost - directExpenses - commission;

    const sale = await Sale.create({
      salesNumber,
      customerId,
      clientPOId,
      saleDate,
      status,
      items: calculatedItems,
      subtotal,
      directExpenses,
      commission,
      totalAmount,
      totalCost,
      totalProfit,
      createdBy: req.user._id,
    });

    res.status(201).json({
      success: true,
      sale,
    });
  } catch (error) {
    next(error);
  }
};

// UPDATE SALE
const updateSale = async (req, res, next) => {
  try {
    const sale = await Sale.findById(req.params.id);

    if (!sale) {
      return res.status(404).json({
        success: false,
        message: "Sale not found",
      });
    }

    if (sale.status === "released") {
      return res.status(400).json({
        success: false,
        message: "Released sale cannot be modified",
      });
    }

    const {
      customerId,
      clientPOId,
      saleDate,
      status,
      items,
      directExpenses,
      commission,
    } = req.body;

    // CHECK UPDATED REFERENCES
    if (customerId !== undefined) {
      await checkReferenceExists(Customer, customerId, "Customer");
    }

    if (clientPOId !== undefined) {
      await checkReferenceExists(ClientPO, clientPOId, "Client PO");
    }

    if (items !== undefined) {
      await checkReferencesExist(
        Product,
        items.map((item) => item.productId),
        "Product",
      );
    }

    // Update basic fields
    if (customerId !== undefined) {
      sale.customerId = customerId;
    }

    if (clientPOId !== undefined) {
      sale.clientPOId = clientPOId;
    }

    if (saleDate !== undefined) {
      sale.saleDate = saleDate;
    }

    if (status !== undefined) {
      sale.status = status;
    }

    // Update expenses only when explicitly provided
    if (directExpenses !== undefined) {
      sale.directExpenses = directExpenses;
    }

    // Update commission only when explicitly provided
    if (commission !== undefined) {
      sale.commission = commission;
    }

    // Recalculate item totals when items are provided
    if (items !== undefined) {
      const calculatedItems = items.map((item) => {
        const profit = (item.unitPrice - item.unitCost) * item.quantity;

        return {
          ...item,
          profit,
        };
      });

      const subtotal = calculatedItems.reduce(
        (total, item) => total + item.quantity * item.unitPrice,
        0,
      );

      const totalCost = calculatedItems.reduce(
        (total, item) => total + item.quantity * item.unitCost,
        0,
      );

      sale.items = calculatedItems;
      sale.subtotal = subtotal;
      sale.totalCost = totalCost;
    }

    // Always calculate totals using the CURRENT sale values
    sale.totalAmount = sale.subtotal + sale.directExpenses + sale.commission;

    sale.totalProfit =
      sale.subtotal - sale.totalCost - sale.directExpenses - sale.commission;

    sale.updatedBy = req.user._id;

    await sale.save();

    res.status(200).json({
      success: true,
      sale,
    });
  } catch (error) {
    next(error);
  }
};

// DELETE SALE
const deleteSale = async (req, res, next) => {
  try {
    const sale = await Sale.findById(req.params.id);

    if (!sale) {
      return res.status(404).json({
        success: false,
        message: "Sale not found",
      });
    }

    if (sale.status === "released") {
      return res.status(400).json({
        success: false,
        message: "Released sale cannot be deleted",
      });
    }

    await sale.deleteOne();

    res.status(200).json({
      success: true,
      message: "Sale deleted",
    });
  } catch (error) {
    next(error);
  }
};

// RELEASE SALE
const releaseSale = async (req, res, next) => {
  const session = await mongoose.startSession();

  try {
    session.startTransaction();

    const sale = await Sale.findById(req.params.id).session(session);

    if (!sale) {
      await session.abortTransaction();

      return res.status(404).json({
        success: false,
        message: "Sale not found",
      });
    }

    if (sale.status === "released") {
      await session.abortTransaction();

      return res.status(400).json({
        success: false,
        message: "Sale is already released",
      });
    }

    if (sale.status === "cancelled") {
      await session.abortTransaction();

      return res.status(400).json({
        success: false,
        message: "Cancelled sale cannot be released",
      });
    }

    // CHECK STOCK FIRST
    for (const item of sale.items) {
      const product = await Product.findById(item.productId).session(session);

      if (!product) {
        await session.abortTransaction();

        return res.status(404).json({
          success: false,
          message: `Product not found: ${item.productId}`,
        });
      }

      if (product.currentStock < item.quantity) {
        await session.abortTransaction();

        return res.status(400).json({
          success: false,
          message: `Insufficient stock for ${product.name}. Available: ${product.currentStock}, Required: ${item.quantity}`,
        });
      }
    }

    // DEDUCT STOCK + CREATE INVENTORY MOVEMENTS
    for (const item of sale.items) {
      const product = await Product.findById(item.productId).session(session);

      product.currentStock -= item.quantity;

      await product.save({ session });

      await InventoryMovement.create(
        [
          {
            productId: item.productId,
            type: "OUT",
            quantity: item.quantity,
            unitCost: item.unitCost,
            referenceType: "SALE",
            referenceId: sale._id,
            date: sale.saleDate,
            notes: `Released ${item.quantity} ${product.unit} of ${product.name}`,
            createdBy: req.user._id,
          },
        ],
        { session },
      );
    }

    // UPDATE SALE STATUS
    sale.status = "released";
    sale.updatedBy = req.user._id;

    await sale.save({ session });

    await session.commitTransaction();

    const populatedSale = await Sale.findById(sale._id)
      .populate("customerId", "customerCode name")
      .populate("clientPOId", "poNumber")
      .populate("createdBy", "firstName lastName")
      .populate("updatedBy", "firstName lastName");

    res.status(200).json({
      success: true,
      message: "Sale released successfully",
      sale: populatedSale,
    });
  } catch (error) {
    await session.abortTransaction();
    next(error);
  } finally {
    session.endSession();
  }
};

module.exports = {
  getSales,
  getSaleById,
  createSale,
  updateSale,
  deleteSale,
  releaseSale,
};

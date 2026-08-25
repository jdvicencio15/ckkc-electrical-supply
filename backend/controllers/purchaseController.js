const Purchase = require("../models/Purchase");

const calculatePurchaseTotals = (items) => {
  const calculatedItems = items.map((item) => ({
    ...item,
    totalCost: item.quantity * item.actualUnitCost,
  }));

  const totalAmount = calculatedItems.reduce(
    (total, item) => total + item.totalCost,
    0
  );

  return {
    calculatedItems,
    totalAmount,
  };
};

// GET ALL PURCHASES
const getPurchases = async (req, res, next) => {
  try {
    const purchases = await Purchase.find()
      .populate("supplierId", "supplierCode name")
      .populate("supplierPOId", "poNumber")
      .populate("relatedClientPOId", "poNumber")
      .populate("items.productId", "sku name unit")
      .populate("createdBy", "firstName lastName")
      .populate("updatedBy", "firstName lastName")
      .sort({ purchaseDate: -1 });

    res.status(200).json({
      success: true,
      count: purchases.length,
      purchases,
    });
  } catch (error) {
    next(error);
  }
};

// GET SINGLE PURCHASE
const getPurchaseById = async (req, res, next) => {
  try {
    const purchase = await Purchase.findById(req.params.id)
      .populate("supplierId", "supplierCode name")
      .populate("supplierPOId", "poNumber")
      .populate("relatedClientPOId", "poNumber")
      .populate("items.productId", "sku name unit")
      .populate("createdBy", "firstName lastName")
      .populate("updatedBy", "firstName lastName");

    if (!purchase) {
      return res.status(404).json({
        success: false,
        message: "Purchase not found",
      });
    }

    res.status(200).json({
      success: true,
      purchase,
    });
  } catch (error) {
    next(error);
  }
};

// CREATE PURCHASE
const createPurchase = async (req, res, next) => {
  try {
    const {
      items,
      ...purchaseData
    } = req.body;

    const {
      calculatedItems,
      totalAmount,
    } = calculatePurchaseTotals(items);

    const purchase = await Purchase.create({
      ...purchaseData,
      items: calculatedItems,
      totalAmount,
      createdBy: req.user._id,
    });

    const populatedPurchase = await Purchase.findById(
      purchase._id
    )
      .populate("supplierId", "supplierCode name")
      .populate("supplierPOId", "poNumber")
      .populate("relatedClientPOId", "poNumber")
      .populate("items.productId", "sku name unit")
      .populate("createdBy", "firstName lastName");

    res.status(201).json({
      success: true,
      purchase: populatedPurchase,
    });
  } catch (error) {
    next(error);
  }
};

// UPDATE PURCHASE
const updatePurchase = async (req, res, next) => {
  try {
    const purchase = await Purchase.findById(req.params.id);

    if (!purchase) {
      return res.status(404).json({
        success: false,
        message: "Purchase not found",
      });
    }

    const {
      supplierId,
      supplierPOId,
      relatedClientPOId,
      purchaseDate,
      items,
    } = req.body;

    if (supplierId !== undefined) {
      purchase.supplierId = supplierId;
    }

    if (supplierPOId !== undefined) {
      purchase.supplierPOId = supplierPOId;
    }

    if (relatedClientPOId !== undefined) {
      purchase.relatedClientPOId = relatedClientPOId;
    }

    if (purchaseDate !== undefined) {
      purchase.purchaseDate = purchaseDate;
    }

    if (items !== undefined) {
      const {
        calculatedItems,
        totalAmount,
      } = calculatePurchaseTotals(items);

      purchase.items = calculatedItems;
      purchase.totalAmount = totalAmount;
    }

    purchase.updatedBy = req.user._id;

    await purchase.save();

    const populatedPurchase = await Purchase.findById(
      purchase._id
    )
      .populate("supplierId", "supplierCode name")
      .populate("supplierPOId", "poNumber")
      .populate("relatedClientPOId", "poNumber")
      .populate("items.productId", "sku name unit")
      .populate("createdBy", "firstName lastName")
      .populate("updatedBy", "firstName lastName");

    res.status(200).json({
      success: true,
      purchase: populatedPurchase,
    });
  } catch (error) {
    next(error);
  }
};

// DELETE PURCHASE
const deletePurchase = async (req, res, next) => {
  try {
    const purchase = await Purchase.findByIdAndDelete(req.params.id);

    if (!purchase) {
      return res.status(404).json({
        success: false,
        message: "Purchase not found",
      });
    }

    res.status(200).json({
      success: true,
      message: "Purchase deleted successfully",
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getPurchases,
  getPurchaseById,
  createPurchase,
  updatePurchase,
  deletePurchase,
};
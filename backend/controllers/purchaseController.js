const Purchase = require("../models/Purchase");

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
    const purchase = await Purchase.create({
      ...req.body,
      createdBy: req.user._id,
    });

    const populatedPurchase = await Purchase.findById(purchase._id)
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
    const purchase = await Purchase.findByIdAndUpdate(
      req.params.id,
      {
        ...req.body,
        updatedBy: req.user._id,
      },
      {
        new: true,
        runValidators: true,
      }
    )
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
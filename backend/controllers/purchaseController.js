
const mongoose = require("mongoose");

const Purchase = require("../models/Purchase");

const Supplier = require("../models/Supplier");
const SupplierPO = require("../models/SupplierPO");
const ClientPO = require("../models/ClientPO");
const Product = require("../models/Product");
const InventoryMovement = require("../models/InventoryMovement");

const {
  checkReferenceExists,
  checkReferencesExist,
} = require("../utils/referenceValidator");

const {
  createNotificationsForRoles,
} = require("../services/notificationService");

const {
  generateDocumentNumber,
} = require("../services/documentNumberService");


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
      supplierId,
      supplierPOId,
      relatedClientPOId,
      purchaseDate,
    } = req.body;

    // SUPPLIER
    const supplier = await Supplier.findById(supplierId);

    if (!supplier) {
      const error = new Error("Supplier not found");
      error.statusCode = 400;
      throw error;
    }

    if (supplier.status !== "active") {
      const error = new Error(
        "Cannot create Purchase for an inactive supplier"
      );
      error.statusCode = 400;
      throw error;
    }

// SUPPLIER PO
let supplierPO = null;

if (supplierPOId !== undefined) {
  supplierPO = await SupplierPO.findById(supplierPOId);

  if (!supplierPO) {
    const error = new Error("Supplier PO not found");
    error.statusCode = 400;
    throw error;
  }

  if (
    supplierPO.supplierId.toString() !==
    supplierId.toString()
  ) {
    const error = new Error(
      "Supplier PO does not belong to the selected supplier"
    );
    error.statusCode = 400;
    throw error;
  }

  if (
    supplierPO.status === "cancelled" ||
    supplierPO.status === "received"
  ) {
    const error = new Error(
      `Cannot create Purchase from a ${supplierPO.status} Supplier PO`
    );
    error.statusCode = 400;
    throw error;
  }

  // PREVENT DUPLICATE PURCHASE FROM THE SAME SUPPLIER PO
  const existingPurchase = await Purchase.findOne({
    supplierPOId: supplierPO._id,
  });

  if (existingPurchase) {
    const error = new Error(
      "A Purchase already exists for this Supplier PO"
    );
    error.statusCode = 400;
    throw error;
  }
}
// CLIENT PO
if (relatedClientPOId !== undefined) {
  const clientPO = await ClientPO.findById(
    relatedClientPOId
  );

  if (!clientPO) {
    const error = new Error("Client PO not found");
    error.statusCode = 400;
    throw error;
  }

  if (
    supplierPO &&
    supplierPO.relatedClientPOId &&
    supplierPO.relatedClientPOId.toString() !==
      relatedClientPOId.toString()
  ) {
    const error = new Error(
      "Client PO does not match the Supplier PO"
    );
    error.statusCode = 400;
    throw error;
  }
}

    // PRODUCTS
    await checkReferencesExist(
      Product,
      items.map((item) => item.productId),
      "Product"
    );

    const products = await Product.find({
      _id: {
        $in: items.map((item) => item.productId),
      },
    }).select("_id status");

    const inactiveProduct = products.find(
      (product) => product.status !== "active"
    );

    if (inactiveProduct) {
      const error = new Error(
        "Cannot add inactive product to Purchase"
      );
      error.statusCode = 400;
      throw error;
    }

    // COMPUTE TOTAL ON BACKEND
    const {
      calculatedItems,
      totalAmount,
    } = calculatePurchaseTotals(items);

    const purchaseNumber =
      await generateDocumentNumber("purchase");

    const purchase = await Purchase.create({
      purchaseNumber,
      supplierId,
      supplierPOId,
      relatedClientPOId,
      purchaseDate,
      items: calculatedItems,
      totalAmount,
      createdBy: req.user._id,
    });

    // CREATE NOTIFICATION
    try {
      await createNotificationsForRoles({
        roles: ["owner", "admin"],
        type: "purchase",
        title: "New Purchase",
        message: `Purchase ${purchase.purchaseNumber} was created.`,
        link: `/purchases?search=${encodeURIComponent(
          purchase.purchaseNumber
        )}`,
        entityType: "Purchase",
        entityId: purchase._id,
      });
    } catch (notificationError) {
      console.error(
        "Failed to create purchase notification:",
        notificationError
      );
    }

    const populatedPurchase =
      await Purchase.findById(purchase._id)
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

    if (purchase.status !== "draft") {
      return res.status(400).json({
        success: false,
        message: "Only draft purchases can be updated",
      });
    }

    const {
      supplierId,
      supplierPOId,
      relatedClientPOId,
      purchaseDate,
      items,
    } = req.body;

    // DETERMINE FINAL REFERENCES
    let supplierPO = null;
    const nextSupplierId =
      supplierId !== undefined
        ? supplierId
        : purchase.supplierId;

    const nextSupplierPOId =
      supplierPOId !== undefined
        ? supplierPOId
        : purchase.supplierPOId;

    const nextRelatedClientPOId =
      relatedClientPOId !== undefined
        ? relatedClientPOId
        : purchase.relatedClientPOId;

    // SUPPLIER
    if (supplierId !== undefined) {
      const supplier = await Supplier.findById(
        nextSupplierId
      );

      if (!supplier) {
        const error = new Error("Supplier not found");
        error.statusCode = 400;
        throw error;
      }

      if (supplier.status !== "active") {
        const error = new Error(
          "Cannot assign Purchase to an inactive supplier"
        );
        error.statusCode = 400;
        throw error;
      }
    }

// SUPPLIER PO
if (nextSupplierPOId !== undefined) {
  supplierPO = await SupplierPO.findById(
    nextSupplierPOId
  );

  if (!supplierPO) {
    const error = new Error("Supplier PO not found");
    error.statusCode = 400;
    throw error;
  }

  if (
    supplierPO.supplierId.toString() !==
    nextSupplierId.toString()
  ) {
    const error = new Error(
      "Supplier PO does not belong to the selected supplier"
    );
    error.statusCode = 400;
    throw error;
  }

if (
  supplierPO.status === "cancelled" ||
  supplierPO.status === "received"
) {
  const error = new Error(
    `Cannot assign a ${supplierPO.status} Supplier PO to Purchase`
  );
  error.statusCode = 400;
  throw error;
}


}

   // CLIENT PO
if (relatedClientPOId !== undefined) {
  const clientPO = await ClientPO.findById(
    nextRelatedClientPOId
  );

  if (!clientPO) {
    const error = new Error("Client PO not found");
    error.statusCode = 400;
    throw error;
  }

  if (
    supplierPO &&
    supplierPO.relatedClientPOId &&
    supplierPO.relatedClientPOId.toString() !==
      nextRelatedClientPOId.toString()
  ) {
    const error = new Error(
      "Client PO does not match the Supplier PO"
    );
    error.statusCode = 400;
    throw error;
  }
}

    // PRODUCTS
    if (items !== undefined) {
      await checkReferencesExist(
        Product,
        items.map((item) => item.productId),
        "Product"
      );

      const products = await Product.find({
        _id: {
          $in: items.map((item) => item.productId),
        },
      }).select("_id status");

      const inactiveProduct = products.find(
        (product) => product.status !== "active"
      );

      if (inactiveProduct) {
        const error = new Error(
          "Cannot add inactive product to Purchase"
        );
        error.statusCode = 400;
        throw error;
      }
    }

    // UPDATE FIELDS
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

    const populatedPurchase =
      await Purchase.findById(purchase._id)
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
}




// DELETE PURCHASE
const deletePurchase = async (req, res, next) => {
  try {
    const purchase = await Purchase.findById(req.params.id);

    if (!purchase) {
      return res.status(404).json({
        success: false,
        message: "Purchase not found",
      });
    }

    // ONLY DRAFT PURCHASES CAN BE DELETED
    if (purchase.status !== "draft") {
      return res.status(400).json({
        success: false,
        message: "Only draft purchases can be deleted",
      });
    }

    await purchase.deleteOne();

    res.status(200).json({
      success: true,
      message: "Purchase deleted successfully",
    });
  } catch (error) {
    next(error);
  }
};


// RECEIVE PURCHASE
const receivePurchase = async (req, res, next) => {
  const session = await mongoose.startSession();

  try {
    session.startTransaction();

    const purchase = await Purchase.findById(req.params.id).session(session);

    if (!purchase) {
      await session.abortTransaction();

      return res.status(404).json({
        success: false,
        message: "Purchase not found",
      });
    }

    if (purchase.status === "received") {
      await session.abortTransaction();

      return res.status(400).json({
        success: false,
        message: "Purchase is already received",
      });
    }

    if (purchase.status === "cancelled") {
      await session.abortTransaction();

      return res.status(400).json({
        success: false,
        message: "Cancelled purchase cannot be received",
      });
    }

    // UPDATE STOCK + CREATE INVENTORY MOVEMENTS
    for (const item of purchase.items) {
      const product = await Product.findById(item.productId).session(session);

      if (!product) {
        await session.abortTransaction();

        return res.status(404).json({
          success: false,
          message: `Product not found: ${item.productId}`,
        });
      }

      product.currentStock += item.quantity;

      await product.save({ session });

      await InventoryMovement.create(
        [
          {
            productId: item.productId,
            type: "IN",
            quantity: item.quantity,
            unitCost: item.actualUnitCost,
            referenceType: "PURCHASE",
            referenceId: purchase._id,
            date: purchase.purchaseDate,
            notes: `Received ${item.quantity} ${product.unit} of ${product.name}`,
            createdBy: req.user._id,
          },
        ],
        { session },
      );
    }

    // UPDATE LINKED SUPPLIER PO
    if (purchase.supplierPOId) {
      const supplierPO = await SupplierPO.findById(
        purchase.supplierPOId,
      ).session(session);

      if (!supplierPO) {
        await session.abortTransaction();

        return res.status(404).json({
          success: false,
          message: "Linked Supplier PO not found",
        });
      }

      if (supplierPO.status === "cancelled") {
        await session.abortTransaction();

        return res.status(400).json({
          success: false,
          message: "Cannot receive Purchase linked to a cancelled Supplier PO",
        });
      }

      supplierPO.status = "received";
      supplierPO.updatedBy = req.user._id;

      await supplierPO.save({ session });
    }

    // MARK PURCHASE AS RECEIVED
    purchase.status = "received";
    purchase.updatedBy = req.user._id;

    await purchase.save({ session });

    await session.commitTransaction();

    const populatedPurchase = await Purchase.findById(purchase._id)
      .populate("supplierId", "supplierCode name")
      .populate("supplierPOId", "poNumber")
      .populate("relatedClientPOId", "poNumber")
      .populate("items.productId", "sku name unit")
      .populate("createdBy", "firstName lastName")
      .populate("updatedBy", "firstName lastName");

    res.status(200).json({
      success: true,
      message: "Purchase received successfully",
      purchase: populatedPurchase,
    });
  } catch (error) {
    if (session.inTransaction()) {
      await session.abortTransaction();
    }

    next(error);
  } finally {
    await session.endSession();
  }
};


// CANCEL PURCHASE
const cancelPurchase = async (req, res, next) => {
  try {
    const purchase = await Purchase.findById(req.params.id);

    if (!purchase) {
      return res.status(404).json({
        success: false,
        message: "Purchase not found",
      });
    }

    // ONLY DRAFT PURCHASES CAN BE CANCELLED
    if (purchase.status !== "draft") {
      const error = new Error(
        "Only draft purchases can be cancelled"
      );
      error.statusCode = 400;
      throw error;
    }

    purchase.status = "cancelled";
    purchase.updatedBy = req.user._id;

    await purchase.save();

    const populatedPurchase =
      await Purchase.findById(purchase._id)
        .populate("supplierId", "supplierCode name")
        .populate("supplierPOId", "poNumber")
        .populate("relatedClientPOId", "poNumber")
        .populate("items.productId", "sku name unit")
        .populate("createdBy", "firstName lastName")
        .populate("updatedBy", "firstName lastName");

    res.status(200).json({
      success: true,
      message: "Purchase cancelled successfully",
      purchase: populatedPurchase,
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
  receivePurchase,
  cancelPurchase,
};
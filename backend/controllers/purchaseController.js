const mongoose = require("mongoose");

const Purchase = require("../models/Purchase");
const Settings = require("../models/Settings");

const Supplier = require("../models/Supplier");
const SupplierPO = require("../models/SupplierPO");
const ClientPO = require("../models/ClientPO");
const Product = require("../models/Product");
const InventoryMovement = require("../models/InventoryMovement");
const { resolveProductUnit } = require("../services/unitService");

const { createAuditLog } = require("../services/auditService");

const {
  validatePurchaseAgainstSupplierPO,
} = require("../utils/purchaseValidator");

const {
  createPurchaseJournalEntry,
} = require("../services/accountingService");

const { checkReferencesExist } = require("../utils/referenceValidator");

const {
  createNotificationsForRoles,
} = require("../services/notificationService");

const { generateDocumentNumber } = require("../services/documentNumberService");

const roundMoney = (value) => Math.round((value + Number.EPSILON) * 100) / 100;


const { resolveProductCost } = require("../services/pricingService");

const calculatePurchaseTotals = (
  items,
  { vatEnabled, vatRate, pricingMode },
) => {
  const calculatedItems = items.map((item) => {
    const enteredUnitCost = roundMoney(
      item.enteredUnitCost,
    );

    let actualUnitCost = enteredUnitCost;

    if (
      vatEnabled &&
      vatRate > 0 &&
      pricingMode === "inclusive"
    ) {
      actualUnitCost = roundMoney(
        enteredUnitCost / (1 + vatRate / 100),
      );
    }

    const totalCost = roundMoney(
      item.quantity * actualUnitCost,
    );

    return {
      ...item,
      enteredUnitCost,
      actualUnitCost,
      totalCost,
    };
  });

  const grossAmount = roundMoney(
    calculatedItems.reduce(
      (total, item) =>
        total +
        item.quantity * item.enteredUnitCost,
      0,
    ),
  );

  let netAmount = grossAmount;
  let taxAmount = 0;

  if (vatEnabled && vatRate > 0) {
    if (pricingMode === "inclusive") {
      netAmount = roundMoney(
        grossAmount / (1 + vatRate / 100),
      );

      taxAmount = roundMoney(
        grossAmount - netAmount,
      );
    } else {
      netAmount = grossAmount;

      taxAmount = roundMoney(
        netAmount * (vatRate / 100),
      );
    }
  }

  const totalAmount =
    pricingMode === "inclusive"
      ? grossAmount
      : roundMoney(netAmount + taxAmount);

  return {
    calculatedItems,
    netAmount,
    taxRate: vatEnabled ? vatRate : 0,
    taxAmount,
    pricingMode,
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
      .populate("items.productId", "sku name")
      .populate("items.unitId", "code name")
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
      .populate("items.productId", "sku name")
      .populate("items.unitId", "code name")
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

    // ==========================================
    // SUPPLIER PO IS REQUIRED
    // ==========================================
    if (!supplierPOId) {
      const error = new Error(
        "Supplier PO is required to create a Purchase",
      );
      error.statusCode = 400;
      throw error;
    }

    // ==========================================
    // GET TAX SETTINGS
    // ==========================================
    const settings =
      await Settings.findOne().select("accountingTax");

    const vatEnabled =
      settings?.accountingTax?.vatEnabled === true;

    const vatRate = vatEnabled
      ? Number(settings?.accountingTax?.vatRate || 0)
      : 0;

    const pricingMode =
      settings?.accountingTax?.pricingMode === "inclusive"
        ? "inclusive"
        : "exclusive";

    // ==========================================
    // SUPPLIER
    // ==========================================
    const supplier = await Supplier.findById(supplierId);

    if (!supplier) {
      const error = new Error("Supplier not found");
      error.statusCode = 400;
      throw error;
    }

    if (supplier.status !== "active") {
      const error = new Error(
        "Cannot create Purchase for an inactive supplier",
      );
      error.statusCode = 400;
      throw error;
    }

    // ==========================================
    // SUPPLIER PO
    // ==========================================
    const supplierPO =
      await SupplierPO.findById(supplierPOId);

    if (!supplierPO) {
      const error = new Error("Supplier PO not found");
      error.statusCode = 400;
      throw error;
    }

    // Supplier PO must belong to selected supplier
    if (
      supplierPO.supplierId.toString() !==
      supplierId.toString()
    ) {
      const error = new Error(
        "Supplier PO does not belong to the selected supplier",
      );
      error.statusCode = 400;
      throw error;
    }

    // ==========================================
    // SUPPLIER PO STATUS PROTECTION
    // ==========================================
    //
    // Only SENT Supplier POs can be converted
    // into a Purchase.
    //
    // draft     → still being prepared
    // sent      → valid source for Purchase
    // received  → already completed
    // cancelled → permanently cancelled
    //
    if (supplierPO.status !== "sent") {
      const error = new Error(
        `Cannot create Purchase from a ${supplierPO.status} Supplier PO`,
      );
      error.statusCode = 400;
      throw error;
    }

    // ==========================================
    // PREVENT DUPLICATE PURCHASE
    // ==========================================
    const existingPurchase = await Purchase.findOne({
      supplierPOId: supplierPO._id,
    });

    if (existingPurchase) {
      const error = new Error(
        "A Purchase already exists for this Supplier PO",
      );
      error.statusCode = 400;
      throw error;
    }

    // ==========================================
    // VALIDATE PURCHASE ITEMS
    // AGAINST SUPPLIER PO
    // ==========================================
    //
    // Purchase items must exactly match the
    // Supplier PO items.
    //
    // This prevents:
    // - Increasing quantity
    // - Reducing quantity
    // - Removing PO items
    // - Adding products not included in PO
    // - Duplicate product lines
    //

    if (!Array.isArray(items) || items.length === 0) {
      const error = new Error(
        "Purchase must contain at least one item",
      );
      error.statusCode = 400;
      throw error;
    }

    if (items.length !== supplierPO.items.length) {
      const error = new Error(
        "Purchase items must exactly match Supplier PO items",
      );
      error.statusCode = 400;
      throw error;
    }

    const supplierPOProductIds = new Set(
      supplierPO.items.map((item) =>
        item.productId.toString(),
      ),
    );

    const purchaseProductIds = new Set();

    for (const purchaseItem of items) {
      const productId =
        purchaseItem.productId.toString();

      // Prevent duplicate product lines
      if (purchaseProductIds.has(productId)) {
        const error = new Error(
          "Duplicate product lines are not allowed in Purchase",
        );
        error.statusCode = 400;
        throw error;
      }

      purchaseProductIds.add(productId);

      // Product must exist in Supplier PO
      if (!supplierPOProductIds.has(productId)) {
        const error = new Error(
          "Purchase contains a product that is not included in the Supplier PO",
        );
        error.statusCode = 400;
        throw error;
      }

      const supplierPOItem = supplierPO.items.find(
        (poItem) =>
          poItem.productId.toString() === productId,
      );

      const purchaseQuantity = Number(
        purchaseItem.quantity,
      );

      // Quantity must be valid
      if (
        !Number.isFinite(purchaseQuantity) ||
        purchaseQuantity <= 0
      ) {
        const error = new Error(
          "Purchase quantity must be greater than zero",
        );
        error.statusCode = 400;
        throw error;
      }

      const supplierPOQuantity = Number(
        supplierPOItem.quantity,
      );

      // Purchase quantity must exactly match PO
      if (purchaseQuantity !== supplierPOQuantity) {
        const error = new Error(
          `Purchase quantity for ${supplierPOItem.description} must match Supplier PO quantity (${supplierPOQuantity})`,
        );
        error.statusCode = 400;
        throw error;
      }
    }

    // ==========================================
    // CLIENT PO
    // ==========================================
    if (relatedClientPOId !== undefined) {
      const clientPO = await ClientPO.findById(
        relatedClientPOId,
      );

      if (!clientPO) {
        const error = new Error("Client PO not found");
        error.statusCode = 400;
        throw error;
      }

      // If Supplier PO is linked to a Client PO,
      // Purchase must reference the same Client PO.
      if (
        supplierPO.relatedClientPOId &&
        supplierPO.relatedClientPOId.toString() !==
          relatedClientPOId.toString()
      ) {
        const error = new Error(
          "Client PO does not match the Supplier PO",
        );
        error.statusCode = 400;
        throw error;
      }
    }

    // ==========================================
    // PRODUCTS
    // ==========================================
    await checkReferencesExist(
      Product,
      items.map((item) => item.productId),
      "Product",
    );

    const products = await Product.find({
      _id: {
        $in: items.map((item) => item.productId),
      },
    }).select("_id status");

    const inactiveProduct = products.find(
      (product) => product.status !== "active",
    );

    if (inactiveProduct) {
      const error = new Error(
        "Cannot add inactive product to Purchase",
      );
      error.statusCode = 400;
      throw error;
    }

    // ==========================================
    // RESOLVE UOM + SUPPLIER COST SERVER-SIDE
    // ==========================================
    const calculatedItemsWithUOM = [];

    for (const item of items) {
      // Resolve Product UOM
      const { unitId, unitCode } =
        await resolveProductUnit(item.productId);

      // Resolve Purchase Cost
      // Supplier Pricing → Product Cost fallback
      const { unitCost } =
        await resolveProductCost({
          productId: item.productId,
          supplierId,
        });

      calculatedItemsWithUOM.push({
        productId: item.productId,
        quantity: item.quantity,

        // SERVER-RESOLVED COST
        // Frontend value is NOT trusted
        enteredUnitCost: unitCost,

        unitId,
        unitCode,
      });
    }

    // ==========================================
    // COMPUTE TOTALS + VAT ON BACKEND
    // ==========================================
    const {
      calculatedItems,
      netAmount,
      taxRate,
      taxAmount,
      pricingMode: purchasePricingMode,
      totalAmount,
    } = calculatePurchaseTotals(
      calculatedItemsWithUOM,
      {
        vatEnabled,
        vatRate,
        pricingMode,
      },
    );

    // ==========================================
    // GENERATE PURCHASE NUMBER SERVER-SIDE
    // ==========================================
    const purchaseNumber =
      await generateDocumentNumber("purchase");

    // ==========================================
    // CREATE PURCHASE
    // ==========================================
    const purchase = await Purchase.create({
      purchaseNumber,
      supplierId,
      supplierPOId,
      relatedClientPOId,
      purchaseDate,
      items: calculatedItems,
      netAmount,
      taxRate,
      taxAmount,
      pricingMode: purchasePricingMode,
      totalAmount,
      createdBy: req.user._id,
    });

    // ==========================================
    // AUDIT TRAIL
    // ==========================================
    await createAuditLog({
      req,
      action: "CREATE",
      entity: "Purchase",
      entityId: purchase._id,
      documentNumber: purchase.purchaseNumber,
      description:
        `Created Purchase ${purchase.purchaseNumber}`,
      after: purchase.toObject(),
    });

    // ==========================================
    // CREATE NOTIFICATION
    // ==========================================
    try {
      await createNotificationsForRoles({
        roles: ["owner", "admin", "purchasing"],
        excludeUserId: req.user._id,
        type: "purchase",
        title: "New Purchase",
        message:
          `Purchase ${purchase.purchaseNumber} was created.`,
        link: `/purchases?search=${encodeURIComponent(
          purchase.purchaseNumber,
        )}`,
        entityType: "Purchase",
        entityId: purchase._id,
      });
    } catch (notificationError) {
      console.error(
        "Failed to create purchase notification:",
        notificationError,
      );
    }

    // ==========================================
    // RETURN POPULATED PURCHASE
    // ==========================================
    const populatedPurchase =
      await Purchase.findById(purchase._id)
        .populate(
          "supplierId",
          "supplierCode name",
        )
        .populate(
          "supplierPOId",
          "poNumber",
        )
        .populate(
          "relatedClientPOId",
          "poNumber",
        )
        .populate(
          "items.unitId",
          "code name",
        )
        .populate(
          "items.productId",
          "sku name",
        )
        .populate(
          "createdBy",
          "firstName lastName",
        );

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

    // ==========================================
    // ONLY DRAFT PURCHASES CAN BE UPDATED
    // ==========================================
    if (purchase.status !== "draft") {
      return res.status(400).json({
        success: false,
        message: "Only draft purchases can be updated",
      });
    }

    // ==========================================
    // CAPTURE ORIGINAL STATE FOR AUDIT
    // ==========================================
    const before = purchase.toObject();

    const {
      supplierId,
      supplierPOId,
      relatedClientPOId,
      purchaseDate,
      items,
    } = req.body;

    // ==========================================
    // GET CURRENT TAX SETTINGS
    // ==========================================
    const settings =
      await Settings.findOne().select("accountingTax");

    const vatEnabled =
      settings?.accountingTax?.vatEnabled === true;

    const vatRate = vatEnabled
      ? Number(settings?.accountingTax?.vatRate || 0)
      : 0;

    const pricingMode =
      settings?.accountingTax?.pricingMode === "inclusive"
        ? "inclusive"
        : "exclusive";

    // ==========================================
    // DETERMINE FINAL REFERENCES
    // ==========================================
    const nextSupplierId =
      supplierId !== undefined
        ? supplierId
        : purchase.supplierId;

    const nextSupplierPOId =
      supplierPOId !== undefined
        ? supplierPOId
        : purchase.supplierPOId;

    // Supplier PO is REQUIRED for every Purchase
    if (!nextSupplierPOId) {
      const error = new Error(
        "Supplier PO is required for every Purchase",
      );
      error.statusCode = 400;
      throw error;
    }

    const nextRelatedClientPOId =
      relatedClientPOId !== undefined
        ? relatedClientPOId
        : purchase.relatedClientPOId;

    // ==========================================
    // SUPPLIER
    // ==========================================
    const supplier = await Supplier.findById(
      nextSupplierId,
    );

    if (!supplier) {
      const error = new Error("Supplier not found");
      error.statusCode = 400;
      throw error;
    }

    if (supplier.status !== "active") {
      const error = new Error(
        "Cannot assign Purchase to an inactive supplier",
      );
      error.statusCode = 400;
      throw error;
    }

    // ==========================================
    // SUPPLIER PO
    // ==========================================
    const supplierPO = await SupplierPO.findById(
      nextSupplierPOId,
    );

    if (!supplierPO) {
      const error = new Error("Supplier PO not found");
      error.statusCode = 400;
      throw error;
    }

    // Supplier PO must belong to selected supplier
    if (
      supplierPO.supplierId.toString() !==
      nextSupplierId.toString()
    ) {
      const error = new Error(
        "Supplier PO does not belong to the selected supplier",
      );
      error.statusCode = 400;
      throw error;
    }

    // ==========================================
    // SUPPLIER PO STATUS PROTECTION
    // ==========================================
    // Only SENT Supplier POs can be linked
    // to a draft Purchase.
    if (supplierPO.status !== "sent") {
      const error = new Error(
        `Cannot assign a ${supplierPO.status} Supplier PO to Purchase`,
      );
      error.statusCode = 400;
      throw error;
    }

    // ==========================================
    // PREVENT DUPLICATE PURCHASE FOR SUPPLIER PO
    // ==========================================
    // If changing to another Supplier PO, ensure
    // that PO is not already linked to another Purchase.
    const existingPurchase = await Purchase.findOne({
      supplierPOId: supplierPO._id,
      _id: { $ne: purchase._id },
    });

    if (existingPurchase) {
      const error = new Error(
        "A Purchase already exists for this Supplier PO",
      );
      error.statusCode = 400;
      throw error;
    }

    // ==========================================
    // DETERMINE FINAL ITEMS
    // ==========================================
    const finalItems =
      items !== undefined
        ? items
        : purchase.items;

    // ==========================================
    // VALIDATE PURCHASE ITEMS AGAINST SUPPLIER PO
    // ==========================================
    // Business rule:
    // Purchase items must EXACTLY match
    // Supplier PO items.
    //
    // Prevents:
    // - Missing PO items
    // - Additional products
    // - Duplicate product lines
    // - Increased quantity
    // - Reduced quantity
    // ==========================================

    if (
      !Array.isArray(finalItems) ||
      finalItems.length !== supplierPO.items.length
    ) {
      const error = new Error(
        "Purchase items must exactly match Supplier PO items",
      );
      error.statusCode = 400;
      throw error;
    }

    const supplierPOProductIds = new Set(
      supplierPO.items.map((item) =>
        item.productId.toString(),
      ),
    );

    const purchaseProductIds = new Set();

    for (const purchaseItem of finalItems) {
      if (!purchaseItem.productId) {
        const error = new Error(
          "Each Purchase item must have a product",
        );
        error.statusCode = 400;
        throw error;
      }

      const productId =
        purchaseItem.productId.toString();

      // Prevent duplicate product lines
      if (purchaseProductIds.has(productId)) {
        const error = new Error(
          "Duplicate product lines are not allowed in Purchase",
        );
        error.statusCode = 400;
        throw error;
      }

      purchaseProductIds.add(productId);

      // Product must exist in Supplier PO
      if (!supplierPOProductIds.has(productId)) {
        const error = new Error(
          "Purchase contains a product that is not included in the Supplier PO",
        );
        error.statusCode = 400;
        throw error;
      }

      const supplierPOItem = supplierPO.items.find(
        (poItem) =>
          poItem.productId.toString() === productId,
      );

      const purchaseQuantity = Number(
        purchaseItem.quantity,
      );

      const supplierPOQuantity = Number(
        supplierPOItem.quantity,
      );

      if (
        !Number.isFinite(purchaseQuantity) ||
        purchaseQuantity <= 0
      ) {
        const error = new Error(
          `Invalid quantity for ${supplierPOItem.description}`,
        );
        error.statusCode = 400;
        throw error;
      }

      if (purchaseQuantity !== supplierPOQuantity) {
        const error = new Error(
          `Purchase quantity for ${supplierPOItem.description} must match Supplier PO quantity (${supplierPOQuantity})`,
        );
        error.statusCode = 400;
        throw error;
      }
    }

    // ==========================================
    // CLIENT PO
    // ==========================================
    if (nextRelatedClientPOId !== undefined) {
      const clientPO = await ClientPO.findById(
        nextRelatedClientPOId,
      );

      if (!clientPO) {
        const error = new Error("Client PO not found");
        error.statusCode = 400;
        throw error;
      }

      if (
        supplierPO.relatedClientPOId &&
        supplierPO.relatedClientPOId.toString() !==
          nextRelatedClientPOId.toString()
      ) {
        const error = new Error(
          "Client PO does not match the Supplier PO",
        );
        error.statusCode = 400;
        throw error;
      }
    }

    // ==========================================
    // PRODUCTS
    // ==========================================
    await checkReferencesExist(
      Product,
      finalItems.map((item) => item.productId),
      "Product",
    );

    const products = await Product.find({
      _id: {
        $in: finalItems.map((item) => item.productId),
      },
    }).select("_id status");

    const inactiveProduct = products.find(
      (product) => product.status !== "active",
    );

    if (inactiveProduct) {
      const error = new Error(
        "Cannot add inactive product to Purchase",
      );
      error.statusCode = 400;
      throw error;
    }

    // ==========================================
    // RESOLVE UOM + SUPPLIER COST SERVER-SIDE
    // ==========================================
    const calculatedItemsWithUOM = [];

    for (const item of finalItems) {
      // Resolve Product UOM
      const { unitId, unitCode } =
        await resolveProductUnit(item.productId);

      // Resolve Purchase Cost
      // Supplier Pricing → Product Cost fallback
      const { unitCost } =
        await resolveProductCost({
          productId: item.productId,
          supplierId: nextSupplierId,
        });

      calculatedItemsWithUOM.push({
        productId: item.productId,
        quantity: Number(item.quantity),

        // SERVER-RESOLVED COST
        // Frontend value is NOT trusted
        enteredUnitCost: unitCost,

        unitId,
        unitCode,
      });
    }

    // ==========================================
    // RECALCULATE TOTALS + VAT
    // ==========================================
    const {
      calculatedItems,
      netAmount,
      taxRate,
      taxAmount,
      pricingMode: purchasePricingMode,
      totalAmount,
    } = calculatePurchaseTotals(
      calculatedItemsWithUOM,
      {
        vatEnabled,
        vatRate,
        pricingMode,
      },
    );

    // ==========================================
    // UPDATE FIELDS
    // ==========================================
    purchase.supplierId = nextSupplierId;
    purchase.supplierPOId = nextSupplierPOId;

    if (relatedClientPOId !== undefined) {
      purchase.relatedClientPOId =
        relatedClientPOId;
    }

    if (purchaseDate !== undefined) {
      purchase.purchaseDate = purchaseDate;
    }

    purchase.items = calculatedItems;
    purchase.netAmount = netAmount;
    purchase.taxRate = taxRate;
    purchase.taxAmount = taxAmount;
    purchase.pricingMode = purchasePricingMode;
    purchase.totalAmount = totalAmount;

    // ==========================================
    // AUDIT USER
    // ==========================================
    purchase.updatedBy = req.user._id;

    // ==========================================
    // SAVE
    // ==========================================
    await purchase.save();

    // ==========================================
    // AUDIT TRAIL
    // ==========================================
    await createAuditLog({
      req,
      action: "UPDATE",
      entity: "Purchase",
      entityId: purchase._id,
      documentNumber: purchase.purchaseNumber,
      description: `Updated Purchase ${purchase.purchaseNumber}`,
      before,
      after: purchase.toObject(),
    });

    // ==========================================
    // RETURN POPULATED PURCHASE
    // ==========================================
    const populatedPurchase =
      await Purchase.findById(purchase._id)
        .populate(
          "supplierId",
          "supplierCode name",
        )
        .populate(
          "supplierPOId",
          "poNumber",
        )
        .populate(
          "relatedClientPOId",
          "poNumber",
        )
        .populate(
          "items.unitId",
          "code name",
        )
        .populate(
          "items.productId",
          "sku name",
        )
        .populate(
          "createdBy",
          "firstName lastName",
        )
        .populate(
          "updatedBy",
          "firstName lastName",
        );

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

    const before = purchase.toObject();

    await purchase.deleteOne();

    await createAuditLog({
  req,
  action: "DELETE",
  entity: "Purchase",
  entityId: purchase._id,
  documentNumber: purchase.purchaseNumber,
  description: `Deleted Purchase ${purchase.purchaseNumber}`,
  before,
    });

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

    const purchase = await Purchase.findById(
      req.params.id
    ).session(session);

    if (!purchase) {
      await session.abortTransaction();

      return res.status(404).json({
        success: false,
        message: "Purchase not found",
      });
    }

    // ==========================================
    // PURCHASE STATE VALIDATION
    // ==========================================

    // Only DRAFT purchases can be received.
    // This prevents duplicate inventory movements,
    // duplicate accounting entries, and invalid
    // state transitions.
    if (purchase.status !== "draft") {
      await session.abortTransaction();

      return res.status(400).json({
        success: false,
        message:
          `Cannot receive Purchase from ${purchase.status} status`,
      });
    }

    // ==========================================
    // UPDATE STOCK + CREATE INVENTORY MOVEMENTS
    // ==========================================

    for (const item of purchase.items) {
      const product = await Product.findById(
        item.productId
      ).session(session);

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
            unitId: item.unitId,
            unitCode: item.unitCode,
            unitCost: item.actualUnitCost,
            referenceType: "PURCHASE",
            referenceId: purchase._id,
            date: purchase.purchaseDate,
            notes: `Received ${item.quantity} ${item.unitCode} of ${product.name}`,
            createdBy: req.user._id,
          },
        ],
        { session }
      );
    }


    // ==========================================
// SUPPLIER PO IS REQUIRED
// ==========================================

if (!purchase.supplierPOId) {
  await session.abortTransaction();

  return res.status(400).json({
    success: false,
    message: "Purchase cannot be received without a Supplier PO",
  });
    }

// ==========================================
// UPDATE LINKED SUPPLIER PO
// ==========================================

const supplierPO = await SupplierPO.findById(
  purchase.supplierPOId
).session(session);

if (!supplierPO) {
  await session.abortTransaction();

  return res.status(404).json({
    success: false,
    message: "Linked Supplier PO not found",
  });
}

// Supplier PO must be SENT before it can be received.
if (supplierPO.status !== "sent") {
  await session.abortTransaction();

  return res.status(400).json({
    success: false,
    message:
      `Cannot receive Supplier PO from ${supplierPO.status} status`,
  });
}

   // ==========================================
// MARK SUPPLIER PO AS RECEIVED
// ==========================================

const supplierPOBefore = supplierPO.toObject();

supplierPO.status = "received";
supplierPO.updatedBy = req.user._id;

await supplierPO.save({ session });

await createAuditLog({
  req,
  session,
  action: "RECEIVE",
  entity: "SupplierPO",
  entityId: supplierPO._id,
  documentNumber: supplierPO.poNumber,
  description:
    `Supplier PO ${supplierPO.poNumber} was automatically marked as received after Purchase ${purchase.purchaseNumber} was received.`,
  before: supplierPOBefore,
  after: supplierPO.toObject(),
  metadata: {
    source: "Purchase.receive",
    purchaseId: purchase._id,
    purchaseNumber: purchase.purchaseNumber,
  },
});

  
    // ==========================================
    // MARK PURCHASE AS RECEIVED
    // ==========================================

    const purchaseBefore = purchase.toObject();

    purchase.status = "received";
    purchase.updatedBy = req.user._id;

    await purchase.save({ session });

    await createAuditLog({
  req,
  session,
  action: "RECEIVE",
  entity: "Purchase",
  entityId: purchase._id,
  documentNumber: purchase.purchaseNumber,
  description:
    `Purchase ${purchase.purchaseNumber} was received.`,
  before: purchaseBefore,
  after: purchase.toObject(),
    });

    // ==========================================
    // CREATE SYSTEM ACCOUNTING ENTRY
    // ==========================================

    await createPurchaseJournalEntry({
      session,
      purchase,
      createdBy: req.user._id,
    });

    // ==========================================
    // COMMIT TRANSACTION
    // ==========================================

    await session.commitTransaction();

    // ==========================================
    // NOTIFICATION
    // ==========================================

    try {
      await createNotificationsForRoles({
        roles: [
          "owner",
          "admin",
          "purchasing",
          "accounting",
        ],
        excludeUserId: req.user._id,
        type: "purchase",
        title: "Purchase Received",
        message: `Purchase ${purchase.purchaseNumber} was received.`,
        link: `/purchases?search=${encodeURIComponent(
          purchase.purchaseNumber
        )}`,
        entityType: "Purchase",
        entityId: purchase._id,
      });
    } catch (notificationError) {
      console.error(
        "Failed to create purchase received notification:",
        notificationError
      );
    }

    // ==========================================
    // RETURN POPULATED PURCHASE
    // ==========================================

    const populatedPurchase =
      await Purchase.findById(purchase._id)
        .populate(
          "supplierId",
          "supplierCode name"
        )
        .populate(
          "supplierPOId",
          "poNumber"
        )
        .populate(
          "relatedClientPOId",
          "poNumber"
        )
        .populate(
          "items.unitId",
          "code name"
        )
        .populate(
          "items.productId",
          "sku name"
        )
        .populate(
          "createdBy",
          "firstName lastName"
        )
        .populate(
          "updatedBy",
          "firstName lastName"
        );

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
      const error = new Error("Only draft purchases can be cancelled");
      error.statusCode = 400;
      throw error;
    }

    const before = purchase.toObject();

    purchase.status = "cancelled";
    purchase.updatedBy = req.user._id;

    await purchase.save();


    await createAuditLog({
  req,
  action: "CANCEL",
  entity: "Purchase",
  entityId: purchase._id,
  documentNumber: purchase.purchaseNumber,
  description: `Cancelled Purchase ${purchase.purchaseNumber}`,
  before,
  after: purchase.toObject(),
});

    // ==========================================
// NOTIFICATION
// ==========================================

try {
  await createNotificationsForRoles({
    roles: ["owner", "admin", "purchasing"],
    excludeUserId: req.user._id,
    type: "purchase",
    title: "Purchase Cancelled",
    message: `Purchase ${purchase.purchaseNumber} was cancelled.`,
    link: `/purchases?search=${encodeURIComponent(
      purchase.purchaseNumber,
    )}`,
    entityType: "Purchase",
    entityId: purchase._id,
  });
} catch (notificationError) {
  console.error(
    "Failed to create purchase cancellation notification:",
    notificationError,
  );
}

    const populatedPurchase = await Purchase.findById(purchase._id)
      .populate("supplierId", "supplierCode name")
      .populate("supplierPOId", "poNumber")
      .populate("relatedClientPOId", "poNumber")
      .populate("items.unitId", "code name")
      .populate("items.productId", "sku name")
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

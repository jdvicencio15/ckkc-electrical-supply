const SupplierPO = require("../models/SupplierPO");

const Supplier = require("../models/Supplier");
const ClientPO = require("../models/ClientPO");
const Product = require("../models/Product");
const Settings = require("../models/Settings");

const { createAuditLog } = require("../services/auditService");

const { generateSupplierPOPDF } = require("../services/pdfService");

const { resolveProductCost } = require("../services/pricingService");

const { resolveProductUnit } = require("../services/unitService");

const { generateDocumentNumber } = require("../services/documentNumberService");

const {
  createNotificationsForRoles,
} = require("../services/notificationService");

const exportSupplierPOPDF = async (req, res, next) => {
  try {
    const supplierPO = await SupplierPO.findById(req.params.id)
      .populate("supplierId", "supplierCode name")
      .populate("relatedClientPOId", "poNumber")
      .populate("items.productId", "sku name")
      .populate("items.unitId", "code name")
      .populate("createdBy", "firstName lastName");

    if (!supplierPO) {
      return res.status(404).json({
        success: false,
        message: "Supplier PO not found",
      });
    }

    const settings = await Settings.findOne();

    if (!settings) {
      return res.status(404).json({
        success: false,
        message: "Settings not found",
      });
    }

    return generateSupplierPOPDF({
      supplierPO,
      settings,
      res,
    });
  } catch (error) {
    next(error);
  }
};

const calculateSupplierPOTotal = (items) => {
  const totalAmount = items.reduce(
    (total, item) => total + item.quantity * item.expectedUnitCost,
    0,
  );

  return totalAmount;
};

// GET ALL SUPPLIER POS
const getSupplierPOs = async (req, res, next) => {
  try {
    const supplierPOs = await SupplierPO.find()
      .populate("supplierId", "supplierCode name")
      .populate("relatedClientPOId", "poNumber")
      .populate("createdBy", "firstName lastName")
      .populate("updatedBy", "firstName lastName")
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      count: supplierPOs.length,
      supplierPOs,
    });
  } catch (error) {
    next(error);
  }
};

// GET SINGLE SUPPLIER PO
const getSupplierPOById = async (req, res, next) => {
  try {
    const supplierPO = await SupplierPO.findById(req.params.id)
      .populate("supplierId", "supplierCode name")
      .populate("relatedClientPOId", "poNumber")
      .populate("items.productId", "sku name")
      .populate("items.unitId", "code name")
      .populate("createdBy", "firstName lastName")
      .populate("updatedBy", "firstName lastName");

    if (!supplierPO) {
      return res.status(404).json({
        success: false,
        message: "Supplier PO not found",
      });
    }

    res.status(200).json({
      success: true,
      supplierPO,
    });
  } catch (error) {
    next(error);
  }
};

// CREATE SUPPLIER PO
const createSupplierPO = async (req, res, next) => {
  try {
    const {
      items,
      supplierId,
      relatedClientPOId,
      status,
      poNumber,
      ...supplierPOData
    } = req.body;

    // STATUS AND PO NUMBER ARE SERVER-CONTROLLED
    if (status !== undefined) {
      const error = new Error(
        "Supplier PO status cannot be set during creation",
      );
      error.statusCode = 400;
      throw error;
    }

    if (poNumber !== undefined) {
      const error = new Error(
        "Supplier PO number cannot be set during creation",
      );
      error.statusCode = 400;
      throw error;
    }

    // CHECK SUPPLIER
    const supplier = await Supplier.findById(supplierId);

    if (!supplier) {
      const error = new Error("Supplier not found");
      error.statusCode = 404;
      throw error;
    }

    if (supplier.status !== "active") {
      const error = new Error("Supplier is inactive");
      error.statusCode = 400;
      throw error;
    }

    // CHECK CLIENT PO (OPTIONAL)
    if (relatedClientPOId !== undefined) {
      const clientPO = await ClientPO.findById(relatedClientPOId);

      if (!clientPO) {
        const error = new Error("Client PO not found");
        error.statusCode = 404;
        throw error;
      }

      if (["fulfilled", "cancelled"].includes(clientPO.status)) {
        const error = new Error(
          `Cannot create Supplier PO for a ${clientPO.status} Client PO`,
        );
        error.statusCode = 400;
        throw error;
      }
    }

    if (!Array.isArray(items) || items.length === 0) {
      const error = new Error("Supplier PO must contain at least one item");
      error.statusCode = 400;
      throw error;
    }

    // CHECK PRODUCTS
    const productIds = [
      ...new Set(items.map((item) => item.productId.toString())),
    ];

    const products = await Product.find({
      _id: { $in: productIds },
    });

    if (products.length !== productIds.length) {
      const error = new Error("One or more products not found");
      error.statusCode = 404;
      throw error;
    }

    const inactiveProduct = products.find(
      (product) => product.status !== "active",
    );

    if (inactiveProduct) {
      const error = new Error(`Product ${inactiveProduct._id} is inactive`);
      error.statusCode = 400;
      throw error;
    }

    // RESOLVE PRODUCT UOM AND COST SERVER-SIDE
    const calculatedItems = [];

    for (const item of items) {
      const { unitId, unitCode } = await resolveProductUnit(item.productId);

      const { unitCost } = await resolveProductCost({
        productId: item.productId,
        supplierId,
      });

      calculatedItems.push({
        ...item,
        unitId,
        unitCode,
        expectedUnitCost: unitCost,
      });
    }
    // CALCULATE TOTAL SERVER-SIDE
    const totalAmount = calculateSupplierPOTotal(calculatedItems);

    // GENERATE DOCUMENT NUMBER SERVER-SIDE
    const generatedPONumber = await generateDocumentNumber("supplierPO");

    // CREATE SUPPLIER PO
    const supplierPO = await SupplierPO.create({
      ...supplierPOData,
      poNumber: generatedPONumber,
      supplierId,
      relatedClientPOId,
      items: calculatedItems,
      totalAmount,
      createdBy: req.user._id,
    });

    await createAuditLog({
      req,
      action: "CREATE",
      entity: "SupplierPO",
      entityId: supplierPO._id,
      documentNumber: supplierPO.poNumber,
      description: `Created Supplier PO ${supplierPO.poNumber}`,
      after: supplierPO.toObject(),
    });

    try {
      await createNotificationsForRoles({
        roles: ["owner", "admin", "purchasing"],
        excludeUserId: req.user._id,
        type: "supplier_po",
        title: "New Supplier PO",
        message: `Supplier PO ${supplierPO.poNumber} was created.`,
        link: `/supplier-pos?search=${encodeURIComponent(supplierPO.poNumber)}`,
        entityType: "SupplierPO",
        entityId: supplierPO._id,
      });
    } catch (notificationError) {
      console.error(
        "Failed to create Supplier PO notification:",
        notificationError,
      );
    }

    res.status(201).json({
      success: true,
      supplierPO,
    });
  } catch (error) {
    next(error);
  }
};

// UPDATE SUPPLIER PO
const updateSupplierPO = async (req, res, next) => {
  try {
    const supplierPO = await SupplierPO.findById(req.params.id);

    if (!supplierPO) {
      return res.status(404).json({
        success: false,
        message: "Supplier PO not found",
      });
    }

    const before = supplierPO.toObject();

    const {
      poNumber,
      supplierId,
      supplierPODate,
      status,
      relatedClientPOId,
      items,
    } = req.body;

    // ==========================================
    // LOCKED SUPPLIER PO STATUSES
    // ==========================================

    const LOCKED_SUPPLIER_PO_STATUSES = ["sent", "received", "cancelled"];

    if (LOCKED_SUPPLIER_PO_STATUSES.includes(supplierPO.status)) {
      const error = new Error(
        `Cannot modify a ${supplierPO.status} Supplier PO`,
      );

      error.statusCode = 400;
      throw error;
    }

    // ==========================================
    // DOCUMENT NUMBER PROTECTION
    // ==========================================

    if (poNumber !== undefined) {
      const error = new Error("Supplier PO number cannot be modified");

      error.statusCode = 400;
      throw error;
    }

    // ==========================================
    // STATUS IS SYSTEM-CONTROLLED
    // ==========================================

    if (status !== undefined) {
      const error = new Error(
        "Supplier PO status can only be changed through the appropriate workflow action",
      );

      error.statusCode = 400;
      throw error;
    }

    // ==========================================
    // SUPPLIER CHANGE REQUIRES ITEM RECALCULATION
    // ==========================================

    if (
      supplierId !== undefined &&
      supplierId.toString() !== supplierPO.supplierId.toString() &&
      items === undefined
    ) {
      const error = new Error(
        "Changing the supplier requires the Supplier PO items to be recalculated",
      );

      error.statusCode = 400;
      throw error;
    }

    // ==========================================
    // CHECK UPDATED SUPPLIER
    // ==========================================

    if (supplierId !== undefined) {
      const supplier = await Supplier.findById(supplierId);

      if (!supplier) {
        const error = new Error("Supplier not found");

        error.statusCode = 404;
        throw error;
      }

      if (supplier.status !== "active") {
        const error = new Error("Supplier is inactive");

        error.statusCode = 400;
        throw error;
      }
    }

    // ==========================================
    // CHECK UPDATED CLIENT PO
    // ==========================================

    if (relatedClientPOId !== undefined) {
      const clientPO = await ClientPO.findById(relatedClientPOId);

      if (!clientPO) {
        const error = new Error("Client PO not found");

        error.statusCode = 404;
        throw error;
      }

      if (["fulfilled", "cancelled"].includes(clientPO.status)) {
        const error = new Error(
          `Cannot associate Supplier PO with a ${clientPO.status} Client PO`,
        );

        error.statusCode = 400;
        throw error;
      }
    }

    // ==========================================
    // CHECK UPDATED ITEMS
    // ==========================================

    let calculatedItems;

    if (items !== undefined) {
      if (!Array.isArray(items) || items.length === 0) {
        const error = new Error("Supplier PO must contain at least one item");

        error.statusCode = 400;
        throw error;
      }

      const productIds = [
        ...new Set(items.map((item) => item.productId.toString())),
      ];

      const products = await Product.find({
        _id: { $in: productIds },
      });

      if (products.length !== productIds.length) {
        const error = new Error("One or more products not found");

        error.statusCode = 404;
        throw error;
      }

      const inactiveProduct = products.find(
        (product) => product.status !== "active",
      );

      if (inactiveProduct) {
        const error = new Error(`Product ${inactiveProduct._id} is inactive`);

        error.statusCode = 400;
        throw error;
      }

      // ==========================================
      // RESOLVE PRODUCT UOM AND COST SERVER-SIDE
      // ==========================================

      calculatedItems = [];

      const effectiveSupplierId =
        supplierId !== undefined ? supplierId : supplierPO.supplierId;

      for (const item of items) {
        const { unitId, unitCode } = await resolveProductUnit(item.productId);

        const { unitCost } = await resolveProductCost({
          productId: item.productId,
          supplierId: effectiveSupplierId,
        });

        calculatedItems.push({
          ...item,
          unitId,
          unitCode,
          expectedUnitCost: unitCost,
        });
      }
    }

    // ==========================================
    // APPLY UPDATES
    // ==========================================

    if (supplierId !== undefined) {
      supplierPO.supplierId = supplierId;
    }

    if (supplierPODate !== undefined) {
      supplierPO.supplierPODate = supplierPODate;
    }

    if (relatedClientPOId !== undefined) {
      supplierPO.relatedClientPOId = relatedClientPOId;
    }

    if (items !== undefined) {
      supplierPO.items = calculatedItems;

      supplierPO.totalAmount = calculateSupplierPOTotal(calculatedItems);
    }

    // ==========================================
    // AUDIT
    // ==========================================

    supplierPO.updatedBy = req.user._id;

    await supplierPO.save();

    await createAuditLog({
      req,
      action: "UPDATE",
      entity: "SupplierPO",
      entityId: supplierPO._id,
      documentNumber: supplierPO.poNumber,
      description: `Updated Supplier PO ${supplierPO.poNumber}`,
      before,
      after: supplierPO.toObject(),
    });
    // ==========================================
    // NOTIFICATION
    // ==========================================

    // NOTE:
    // Cancellation should have its own dedicated
    // workflow endpoint rather than being performed
    // through generic update.

    // ==========================================
    // RESPONSE
    // ==========================================

    res.status(200).json({
      success: true,
      supplierPO,
    });
  } catch (error) {
    next(error);
  }
};

// RELEASE SUPPLIER PO
const releaseSupplierPO = async (req, res, next) => {
  try {
    const supplierPO = await SupplierPO.findById(req.params.id);

    if (!supplierPO) {
      return res.status(404).json({
        success: false,
        message: "Supplier PO not found",
      });
    }

    // ONLY DRAFT SUPPLIER PO CAN BE RELEASED
    if (supplierPO.status !== "draft") {
      const error = new Error(
        `Cannot release a ${supplierPO.status} Supplier PO`,
      );

      error.statusCode = 400;
      throw error;
    }

    const before = supplierPO.toObject();

    // ==========================================
    // RELEASE SUPPLIER PO
    // ==========================================

    supplierPO.status = "sent";
    supplierPO.updatedBy = req.user._id;

    await supplierPO.save();

    await createAuditLog({
      req,
      action: "UPDATE",
      entity: "SupplierPO",
      entityId: supplierPO._id,
      documentNumber: supplierPO.poNumber,
      description: `Released Supplier PO ${supplierPO.poNumber} from ${before.status} to ${supplierPO.status}`,
      before,
      after: supplierPO.toObject(),
    });

    // ==========================================
    // NOTIFICATION
    // ==========================================

    try {
      await createNotificationsForRoles({
        roles: ["owner", "admin", "purchasing"],
        excludeUserId: req.user._id,
        type: "supplier_po",
        title: "Supplier PO Sent",
        message: `Supplier PO ${supplierPO.poNumber} was sent.`,
        link: `/supplier-pos?search=${encodeURIComponent(supplierPO.poNumber)}`,
        entityType: "SupplierPO",
        entityId: supplierPO._id,
      });
    } catch (notificationError) {
      console.error(
        "Failed to create Supplier PO release notification:",
        notificationError,
      );
    }

    // ==========================================
    // RESPONSE
    // ==========================================

    res.status(200).json({
      success: true,
      message: "Supplier PO released successfully.",
      supplierPO,
    });
  } catch (error) {
    next(error);
  }
};

// DELETE SUPPLIER PO
const deleteSupplierPO = async (req, res, next) => {
  try {
    const supplierPO = await SupplierPO.findById(req.params.id);

    if (!supplierPO) {
      return res.status(404).json({
        success: false,
        message: "Supplier PO not found",
      });
    }

    // ONLY DRAFT SUPPLIER POs CAN BE DELETED
    if (supplierPO.status !== "draft") {
      const error = new Error(
        `Cannot delete a ${supplierPO.status} Supplier PO`,
      );
      error.statusCode = 400;
      throw error;
    }

    // PREVENT DELETE IF REFERENCED BY PURCHASE
    const Purchase = require("../models/Purchase");

    const relatedPurchase = await Purchase.findOne({
      supplierPOId: supplierPO._id,
    });

    if (relatedPurchase) {
      const error = new Error(
        "Cannot delete Supplier PO because it is referenced by a Purchase",
      );
      error.statusCode = 400;
      throw error;
    }

    const before = supplierPO.toObject();

    await supplierPO.deleteOne();

    await createAuditLog({
      req,
      action: "DELETE",
      entity: "SupplierPO",
      entityId: supplierPO._id,
      documentNumber: supplierPO.poNumber,
      description: `Deleted Supplier PO ${supplierPO.poNumber}`,
      before,
    });

    res.status(200).json({
      success: true,
      message: "Supplier PO deleted",
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getSupplierPOs,
  getSupplierPOById,
  createSupplierPO,
  updateSupplierPO,
  deleteSupplierPO,
  releaseSupplierPO,
  exportSupplierPOPDF,
};

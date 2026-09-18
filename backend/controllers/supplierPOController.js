

const SupplierPO = require("../models/SupplierPO");

const Supplier = require("../models/Supplier");
const ClientPO = require("../models/ClientPO");
const Product = require("../models/Product");
const Settings = require("../models/Settings");

const {
  generateSupplierPOPDF,
} = require("../services/pdfService");

const {
  checkReferenceExists,
  checkReferencesExist,
} = require("../utils/referenceValidator");


const {
  resolveProductCost,
} = require("../services/pricingService");

const { resolveProductUnit } = require("../services/unitService");

const {
  generateDocumentNumber,
} = require("../services/documentNumberService");

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

    generateSupplierPOPDF({
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
    (total, item) =>
      total + item.quantity * item.expectedUnitCost,
    0
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
        "Supplier PO status cannot be set during creation"
      );
      error.statusCode = 400;
      throw error;
    }

    if (poNumber !== undefined) {
      const error = new Error(
        "Supplier PO number cannot be set during creation"
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
          `Cannot create Supplier PO for a ${clientPO.status} Client PO`
        );
        error.statusCode = 400;
        throw error;
      }
    }

    // CHECK PRODUCTS
    const productIds = [
      ...new Set(
        items.map((item) => item.productId.toString())
      ),
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
      (product) => product.status !== "active"
    );

    if (inactiveProduct) {
      const error = new Error(
        `Product ${inactiveProduct._id} is inactive`
      );
      error.statusCode = 400;
      throw error;
    }

  // RESOLVE PRODUCT UOM AND COST SERVER-SIDE
const calculatedItems = [];

for (const item of items) {
  const { unitId, unitCode } =
    await resolveProductUnit(item.productId);

  const { unitCost } =
    await resolveProductCost({
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
    const totalAmount =
      calculateSupplierPOTotal(calculatedItems);

    // GENERATE DOCUMENT NUMBER SERVER-SIDE
    const generatedPONumber =
      await generateDocumentNumber("supplierPO");

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

    // ==========================================
    // SUPPLIER PO STATE TRANSITIONS
    // ==========================================

const SUPPLIER_PO_STATE_TRANSITIONS = {
  draft: ["sent", "cancelled"],
  sent: [],
  cancelled: [],
};
    // ==========================================
    // TERMINAL SUPPLIER PO STATUSES
    // ==========================================

const TERMINAL_SUPPLIER_PO_STATUSES = [
  "sent",
  "cancelled",
    ];

    const {
      poNumber,
      supplierId,
      supplierPODate,
      status,
      relatedClientPOId,
      items,
    } = req.body;

    // ==========================================
    // DOCUMENT NUMBER PROTECTION
    // ==========================================

    if (poNumber !== undefined) {
      const error = new Error(
        "Supplier PO number cannot be modified"
      );

      error.statusCode = 400;
      throw error;
    }

    // ==========================================
    // TERMINAL STATE PROTECTION
    // ==========================================

    if (
      TERMINAL_SUPPLIER_PO_STATUSES.includes(
        supplierPO.status
      )
    ) {
      const error = new Error(
        `Cannot modify a ${supplierPO.status} Supplier PO`
      );

      error.statusCode = 400;
      throw error;
    }

    // ==========================================
    // VALIDATE STATE TRANSITION
    // ==========================================

    if (
      status !== undefined &&
      status !== supplierPO.status
    ) {
      const allowedTransitions =
        SUPPLIER_PO_STATE_TRANSITIONS[
          supplierPO.status
        ] || [];

      if (!allowedTransitions.includes(status)) {
        const error = new Error(
          `Invalid Supplier PO state transition: ${supplierPO.status} → ${status}`
        );

        error.statusCode = 400;
        throw error;
      }
    }

    // ==========================================
    // CHECK UPDATED SUPPLIER
    // ==========================================

    if (supplierId !== undefined) {
      const supplier = await Supplier.findById(
        supplierId
      );

      if (!supplier) {
        const error = new Error(
          "Supplier not found"
        );

        error.statusCode = 404;
        throw error;
      }

      if (supplier.status !== "active") {
        const error = new Error(
          "Supplier is inactive"
        );

        error.statusCode = 400;
        throw error;
      }
    }

    // ==========================================
    // CHECK UPDATED CLIENT PO
    // ==========================================

    if (relatedClientPOId !== undefined) {
      const clientPO = await ClientPO.findById(
        relatedClientPOId
      );

      if (!clientPO) {
        const error = new Error(
          "Client PO not found"
        );

        error.statusCode = 404;
        throw error;
      }

      if (
        ["fulfilled", "cancelled"].includes(
          clientPO.status
        )
      ) {
        const error = new Error(
          `Cannot associate Supplier PO with a ${clientPO.status} Client PO`
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
      const productIds = [
        ...new Set(
          items.map((item) =>
            item.productId.toString()
          )
        ),
      ];

      const products = await Product.find({
        _id: { $in: productIds },
      });

      if (products.length !== productIds.length) {
        const error = new Error(
          "One or more products not found"
        );

        error.statusCode = 404;
        throw error;
      }

      const inactiveProduct = products.find(
        (product) =>
          product.status !== "active"
      );

      if (inactiveProduct) {
        const error = new Error(
          `Product ${inactiveProduct._id} is inactive`
        );

        error.statusCode = 400;
        throw error;
      }

      // ==========================================
      // RESOLVE PRODUCT UOM AND COST SERVER-SIDE
      // ==========================================

      calculatedItems = [];

      const effectiveSupplierId =
        supplierId !== undefined
          ? supplierId
          : supplierPO.supplierId;

      for (const item of items) {
        const { unitId, unitCode } =
          await resolveProductUnit(
            item.productId
          );

        const { unitCost } =
          await resolveProductCost({
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
      supplierPO.supplierPODate =
        supplierPODate;
    }

    if (status !== undefined) {
      supplierPO.status = status;
    }

    if (relatedClientPOId !== undefined) {
      supplierPO.relatedClientPOId =
        relatedClientPOId;
    }

    if (items !== undefined) {
      supplierPO.items = calculatedItems;

      supplierPO.totalAmount =
        calculateSupplierPOTotal(
          calculatedItems
        );
    }

    // ==========================================
    // AUDIT
    // ==========================================

    supplierPO.updatedBy = req.user._id;

    await supplierPO.save();

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

    if (supplierPO.status !== "draft") {
      const error = new Error(
        `Cannot release a ${supplierPO.status} Supplier PO`
      );

      error.statusCode = 400;
      throw error;
    }

    supplierPO.status = "sent";
    supplierPO.updatedBy = req.user._id;

    await supplierPO.save();

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
        `Cannot delete a ${supplierPO.status} Supplier PO`
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
        "Cannot delete Supplier PO because it is referenced by a Purchase"
      );
      error.statusCode = 400;
      throw error;
    }

    await supplierPO.deleteOne();

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
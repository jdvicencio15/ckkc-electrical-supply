const Quotation = require("../models/Quotation");
const Customer = require("../models/Customer");
const Product = require("../models/Product");
const Supplier = require("../models/Supplier");
const SupplierPricing = require("../models/SupplierPricing");

const {
  checkReferencesExist,
} = require("../utils/referenceValidator");


const {
  createNotificationsForRoles,
} = require("../services/notificationService");


const {
  generateDocumentNumber,
} = require("../services/documentNumberService");


const calculateQuotationTotals = ({
  items,
  laborCost = 0,
  otherDirectCosts = 0,
}) => {
  const calculatedItems = items.map((item) => {
    const quantity = Number(item.quantity);
    const supplierCost = Number(
      item.supplierCostAtQuotation
    );
    const quotedUnitPrice = Number(
      item.quotedUnitPrice
    );

    if (
      !Number.isFinite(quantity) ||
      !Number.isFinite(supplierCost) ||
      !Number.isFinite(quotedUnitPrice)
    ) {
      const error = new Error(
        "Quotation item contains invalid numeric values"
      );

      error.statusCode = 400;

      throw error;
    }

    const markup =
      quotedUnitPrice - supplierCost;

    return {
      ...item.toObject?.() ?? item,
      quantity,
      supplierCostAtQuotation: supplierCost,
      quotedUnitPrice,
      markup,
    };
  });

  const safeLaborCost = Number(laborCost);
  const safeOtherDirectCosts =
    Number(otherDirectCosts);

  if (
    !Number.isFinite(safeLaborCost) ||
    !Number.isFinite(safeOtherDirectCosts)
  ) {
    const error = new Error(
      "Labor cost and other direct costs must be valid numbers"
    );

    error.statusCode = 400;

    throw error;
  }

  const subtotal = calculatedItems.reduce(
    (total, item) =>
      total + item.quantity * item.quotedUnitPrice,
    0
  );

  const total =
    subtotal +
    safeLaborCost +
    safeOtherDirectCosts;

  return {
    calculatedItems,
    subtotal,
    total,
  };
};


const applySupplierPricing = async (items) => {
  const calculatedItems = [];

  for (const item of items) {
    let supplierCost = Number(item.supplierCostAtQuotation);

    if (item.supplierId) {
      const pricing = await SupplierPricing.findOne({
        supplierId: item.supplierId,
        productId: item.productId,
        status: "active",
      }).select("unitCost");

      if (pricing) {
        supplierCost = Number(pricing.unitCost);
      }
    }

    calculatedItems.push({
      ...item,
      supplierCostAtQuotation: supplierCost,
    });
  }

  return calculatedItems;
};

// GET ALL QUOTATIONS
const getQuotations = async (req, res, next) => {
  try {
    const quotations = await Quotation.find()
      .populate("customerId", "customerCode name")
      .populate("createdBy", "firstName lastName email")
      .populate("updatedBy", "firstName lastName email")
      .populate("items.productId", "sku name")
      .sort({ quotationDate: -1 });

    res.status(200).json({
      success: true,
      count: quotations.length,
      quotations,
    });
  } catch (error) {
    next(error);
  }
};

// GET SINGLE QUOTATION
const getQuotationById = async (req, res, next) => {
  try {
    const quotation = await Quotation.findById(req.params.id)
      .populate("customerId", "customerCode name")
      .populate("createdBy", "firstName lastName email")
      .populate("updatedBy", "firstName lastName email")
      .populate("items.productId", "sku name");

    if (!quotation) {
      return res.status(404).json({
        success: false,
        message: "Quotation not found",
      });
    }

    res.status(200).json({
      success: true,
      quotation,
    });
  } catch (error) {
    next(error);
  }
};


// CREATE QUOTATION
const createQuotation = async (req, res, next) => {
  try {
    const {
      quotationNumber: _quotationNumber,
      items,
      customerId,
      laborCost,
      otherDirectCosts,
      ...quotationData
    } = req.body;

    // CUSTOMER
    const customer = await Customer.findById(customerId);

    if (!customer) {
      const error = new Error("Customer not found");
      error.statusCode = 400;
      throw error;
    }

    if (customer.status !== "active") {
      const error = new Error(
        "Cannot create Quotation for an inactive customer"
      );
      error.statusCode = 400;
      throw error;
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
    "Cannot add inactive product to Quotation"
  );
  error.statusCode = 400;
  throw error;
}

// SUPPLIERS
const supplierIds = items
  .map((item) => item.supplierId)
  .filter(Boolean);

if (supplierIds.length > 0) {
  const suppliers = await Supplier.find({
    _id: { $in: supplierIds },
  }).select("_id status");

  if (suppliers.length !== supplierIds.length) {
    const error = new Error("One or more suppliers not found");
    error.statusCode = 400;
    throw error;
  }

  const inactiveSupplier = suppliers.find(
    (supplier) => supplier.status !== "active"
  );

  if (inactiveSupplier) {
    const error = new Error(
      "Cannot assign an inactive supplier to Quotation"
    );
    error.statusCode = 400;
    throw error;
  }
    }

    const itemsWithSupplierPricing =
  await applySupplierPricing(items);

const {
  calculatedItems,
  subtotal,
  total,
} = calculateQuotationTotals({
  items: itemsWithSupplierPricing,
  laborCost,
  otherDirectCosts,
});


    // GENERATE DOCUMENT NUMBER
    const quotationNumber = await generateDocumentNumber(
      "quotation"
    );

    const quotation = await Quotation.create({
      ...quotationData,
      quotationNumber,
      customerId,
      items: calculatedItems,
      laborCost,
      otherDirectCosts,
      subtotal,
      total,
      createdBy: req.user._id,
    });

    // CREATE NOTIFICATION
    try {
      await createNotificationsForRoles({
        roles: ["owner", "admin"],
        type: "quotation",
        title: "New Quotation",
        message: `Quotation ${quotation.quotationNumber} was created.`,
        link: `/quotations?search=${encodeURIComponent(
          quotation.quotationNumber
        )}`,
        entityType: "Quotation",
        entityId: quotation._id,
      });
    } catch (notificationError) {
      console.error(
        "Failed to create quotation notification:",
        notificationError
      );
    }

    const populatedQuotation =
      await Quotation.findById(quotation._id)
        .populate("customerId", "customerCode name")
        .populate(
          "createdBy",
          "firstName lastName email"
        )
        .populate("items.productId", "sku name");

    res.status(201).json({
      success: true,
      quotation: populatedQuotation,
    });
  } catch (error) {
    next(error);
  }
};





// UPDATE QUOTATION
const updateQuotation = async (req, res, next) => {
  try {
    const quotation = await Quotation.findById(req.params.id);

    if (!quotation) {
      return res.status(404).json({
        success: false,
        message: "Quotation not found",
      });
    }

    const {
      customerId,
      quotationDate,
      status,
      items,
      laborCost,
      otherDirectCosts,
    } = req.body;

    // =========================
    // VALIDATE STATUS TRANSITION
    // =========================

    const allowedStatusTransitions = {
      draft: ["draft", "sent", "cancelled"],
      sent: ["accepted", "rejected", "expired", "cancelled"],
      accepted: [],
      rejected: [],
      expired: [],
      cancelled: [],
    };

    if (status !== undefined) {
      const allowedStatuses =
        allowedStatusTransitions[quotation.status] || [];

      if (!allowedStatuses.includes(status)) {
        return res.status(400).json({
          success: false,
          message: `Invalid quotation status transition: ${quotation.status} → ${status}`,
        });
      }
    }

    // =========================
    // ONLY DRAFT CAN EDIT
    // COMMERCIAL / BASIC FIELDS
    // =========================

    const hasEditableFields =
      customerId !== undefined ||
      quotationDate !== undefined ||
      items !== undefined ||
      laborCost !== undefined ||
      otherDirectCosts !== undefined;

    if (hasEditableFields && quotation.status !== "draft") {
      return res.status(400).json({
        success: false,
        message: "Only draft quotations can be edited",
      });
    }

    // =========================
    // UPDATE CUSTOMER
    // =========================

if (customerId !== undefined) {
  const customer = await Customer.findById(customerId);

  if (!customer) {
    const error = new Error("Customer not found");
    error.statusCode = 400;
    throw error;
  }

  if (customer.status !== "active") {
    const error = new Error(
      "Cannot assign Quotation to an inactive customer"
    );
    error.statusCode = 400;
    throw error;
  }

  quotation.customerId = customerId;
}
    // =========================
    // UPDATE ITEMS
    // =========================

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
      "Cannot add inactive product to Quotation"
    );
    error.statusCode = 400;
    throw error;
  }

  quotation.items = items;
}
    // =========================
    // UPDATE QUOTATION DATE
    // =========================

    if (quotationDate !== undefined) {
      quotation.quotationDate = quotationDate;
    }

    // =========================
    // UPDATE STATUS
    // =========================

    if (status !== undefined) {
      quotation.status = status;
    }

    // =========================
    // UPDATE LABOR COST
    // =========================

    if (laborCost !== undefined) {
      quotation.laborCost = laborCost;
    }

    // =========================
    // UPDATE OTHER DIRECT COSTS
    // =========================

    if (otherDirectCosts !== undefined) {
      quotation.otherDirectCosts = otherDirectCosts;
    }

    // =========================
    // RECALCULATE TOTALS
    // =========================

    const {
      calculatedItems,
      subtotal,
      total,
    } = calculateQuotationTotals({
      items: quotation.items,
      laborCost: quotation.laborCost,
      otherDirectCosts: quotation.otherDirectCosts,
    });

    quotation.items = calculatedItems;
    quotation.subtotal = subtotal;
    quotation.total = total;
    quotation.updatedBy = req.user._id;

    await quotation.save();

    const populatedQuotation =
      await Quotation.findById(quotation._id)
        .populate("customerId", "customerCode name")
        .populate(
          "createdBy",
          "firstName lastName email"
        )
        .populate(
          "updatedBy",
          "firstName lastName email"
        )
        .populate("items.productId", "sku name");

    res.status(200).json({
      success: true,
      quotation: populatedQuotation,
    });
  } catch (error) {
    next(error);
  }
};


// DELETE QUOTATION
const deleteQuotation = async (req, res, next) => {
  try {
    const quotation = await Quotation.findById(req.params.id);

    if (!quotation) {
      return res.status(404).json({
        success: false,
        message: "Quotation not found",
      });
    }

    if (quotation.status !== "draft") {
      return res.status(400).json({
        success: false,
        message: "Only draft quotations can be deleted",
      });
    }

    await quotation.deleteOne();

    res.status(200).json({
      success: true,
      message: "Quotation deleted",
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getQuotations,
  getQuotationById,
  createQuotation,
  updateQuotation,
  deleteQuotation,
};
const ClientPO = require("../models/ClientPO");

const Customer = require("../models/Customer");
const Quotation = require("../models/Quotation");
const Product = require("../models/Product");
const Settings = require("../models/Settings");

const { checkReferencesExist } = require("../utils/referenceValidator");

const { generateDocumentNumber } = require("../services/documentNumberService");

const {
  createNotificationsForRoles,
} = require("../services/notificationService");

// =========================
// CALCULATE CLIENT PO TOTALS
// =========================

const calculateClientPOTotals = ({
  items,
  laborCost = 0,
  otherDirectCosts = 0,
  taxRate = 0,
  pricingMode = "inclusive",
}) => {
  if (!["inclusive", "exclusive"].includes(pricingMode)) {
    const error = new Error(
      "Client PO pricing mode must be either inclusive or exclusive",
    );
    error.statusCode = 400;
    throw error;
  }

  const safeLaborCost = Number(laborCost);
  const safeOtherDirectCosts = Number(otherDirectCosts);
  const safeTaxRate = Number(taxRate);

  if (
    !Number.isFinite(safeLaborCost) ||
    !Number.isFinite(safeOtherDirectCosts) ||
    !Number.isFinite(safeTaxRate)
  ) {
    const error = new Error("Client PO financial values must be valid numbers");
    error.statusCode = 400;
    throw error;
  }

  if (safeLaborCost < 0 || safeOtherDirectCosts < 0) {
    const error = new Error("Client PO costs cannot be negative");
    error.statusCode = 400;
    throw error;
  }

  if (safeTaxRate < 0 || safeTaxRate > 100) {
    const error = new Error("Client PO tax rate must be between 0 and 100");
    error.statusCode = 400;
    throw error;
  }

  const subtotal = items.reduce((total, item) => {
    const quantity = Number(item.quantity);
    const agreedUnitPrice = Number(item.agreedUnitPrice);

    if (
      !Number.isFinite(quantity) ||
      !Number.isFinite(agreedUnitPrice) ||
      quantity <= 0 ||
      agreedUnitPrice < 0
    ) {
      const error = new Error(
        "Client PO item contains invalid quantity or unit price",
      );
      error.statusCode = 400;
      throw error;
    }

    return total + quantity * agreedUnitPrice;
  }, 0);

  const taxableAmount = subtotal + safeLaborCost + safeOtherDirectCosts;

  let netAmount = taxableAmount;
  let taxAmount = 0;

  if (safeTaxRate > 0) {
    if (pricingMode === "inclusive") {
      netAmount = taxableAmount / (1 + safeTaxRate / 100);

      taxAmount = taxableAmount - netAmount;
    } else {
      netAmount = taxableAmount;

      taxAmount = taxableAmount * (safeTaxRate / 100);
    }
  }

  const roundedSubtotal = Number(subtotal.toFixed(2));
  const roundedNetAmount = Number(netAmount.toFixed(2));
  const roundedTaxAmount = Number(taxAmount.toFixed(2));

  const total =
    pricingMode === "inclusive"
      ? roundedSubtotal +
        Number(safeLaborCost.toFixed(2)) +
        Number(safeOtherDirectCosts.toFixed(2))
      : roundedNetAmount + roundedTaxAmount;

  return {
    subtotal: roundedSubtotal,
    laborCost: Number(safeLaborCost.toFixed(2)),
    otherDirectCosts: Number(safeOtherDirectCosts.toFixed(2)),
    taxRate: safeTaxRate,
    taxAmount: roundedTaxAmount,
    pricingMode,
    netAmount: roundedNetAmount,
    totalAmount: Number(total.toFixed(2)),
  };
};

// =========================
// VALIDATE PRODUCTS + SNAPSHOT UOM
// =========================

const prepareClientPOItems = async (items) => {
  if (!Array.isArray(items) || items.length === 0) {
    const error = new Error("Client PO must contain at least one item");
    error.statusCode = 400;
    throw error;
  }

  await checkReferencesExist(
    Product,
    items.map((item) => item.productId),
    "Product",
  );

  const products = await Product.find({
    _id: {
      $in: items.map((item) => item.productId),
    },
  })
    .select("_id status unitId")
    .populate("unitId", "code status");

  const inactiveProduct = products.find(
    (product) => product.status !== "active",
  );

  if (inactiveProduct) {
    const error = new Error("Cannot add inactive product to Client PO");
    error.statusCode = 400;
    throw error;
  }

  const productMap = new Map(
    products.map((product) => [product._id.toString(), product]),
  );

  return items.map((item) => {
    const product = productMap.get(item.productId.toString());

    if (!product) {
      const error = new Error("Product not found");
      error.statusCode = 400;
      throw error;
    }

    if (!product.unitId) {
      const error = new Error(
        `Product ${product._id} has no valid Unit assigned`,
      );
      error.statusCode = 400;
      throw error;
    }

    if (product.unitId.status !== "active") {
      const error = new Error(
        `Unit assigned to product ${product._id} is inactive`,
      );
      error.statusCode = 400;
      throw error;
    }

    return {
      productId: item.productId,
      description: item.description,
      quantity: Number(item.quantity),
      agreedUnitPrice: Number(item.agreedUnitPrice),
      unitId: product.unitId._id,
      unitCode: product.unitId.code,
    };
  });
};

// =========================
// VALIDATE QUOTATION ITEMS
// =========================

const validateQuotationItems = ({
  quotation,
  clientPOItems,
  currentClientPOId = null,
}) => {
  const quotationItems = quotation.items || [];

  const quotationMap = new Map();

  for (const item of quotationItems) {
    const key = `${item.productId.toString()}::${item.unitCode}`;

    if (quotationMap.has(key)) {
      const error = new Error(
        `Quotation contains duplicate product/UOM line: ${item.productId} (${item.unitCode})`,
      );
      error.statusCode = 400;
      throw error;
    }

    quotationMap.set(key, item);
  }

  const poMap = new Map();

  for (const item of clientPOItems) {
    const key = `${item.productId.toString()}::${item.unitCode}`;

    if (poMap.has(key)) {
      const error = new Error(
        `Client PO contains duplicate product/UOM line: ${item.productId} (${item.unitCode})`,
      );
      error.statusCode = 400;
      throw error;
    }

    poMap.set(key, item);
  }

  for (const item of clientPOItems) {
    const key = `${item.productId.toString()}::${item.unitCode}`;

    const quotationItem = quotationMap.get(key);

    if (!quotationItem) {
      const error = new Error(
        `Product ${item.productId} (${item.unitCode}) is not included in the quotation`,
      );
      error.statusCode = 400;
      throw error;
    }

    const quotationPrice = Number(quotationItem.quotedUnitPrice);

    const clientPOPrice = Number(item.agreedUnitPrice);

    if (Math.abs(quotationPrice - clientPOPrice) > 0.01) {
      const error = new Error(
        `Agreed unit price for product ${item.productId} must match the accepted quotation`,
      );
      error.statusCode = 400;
      throw error;
    }
  }

  return quotationMap;
};

// =========================
// GET EXISTING QUOTATION COMMITMENTS
// =========================

const getQuotationCommittedQuantities = async ({
  quotationId,
  excludeClientPOId = null,
}) => {
  const query = {
    quotationId,
    status: {
      $ne: "cancelled",
    },
  };

  if (excludeClientPOId) {
    query._id = {
      $ne: excludeClientPOId,
    };
  }

  const existingPOs = await ClientPO.find(query).select("_id items");

  const committedQuantities = new Map();

  for (const po of existingPOs) {
    for (const item of po.items || []) {
      const key = `${item.productId.toString()}::${item.unitCode}`;

      const existingQuantity = committedQuantities.get(key) || 0;

      committedQuantities.set(key, existingQuantity + Number(item.quantity));
    }
  }

  return committedQuantities;
};

// =========================
// VALIDATE QUOTATION QUANTITIES
// =========================

const validateQuotationQuantities = async ({
  quotation,
  clientPOItems,
  committedQuantities,
}) => {
  const quotationMap = new Map();

  for (const item of quotation.items || []) {
    const key = `${item.productId.toString()}::${item.unitCode}`;

    quotationMap.set(key, item);
  }

  // =========================
  // GET PRODUCT DETAILS
  // =========================

  const productIds = clientPOItems.map((item) => item.productId);

  const products = await Product.find({
    _id: { $in: productIds },
  }).select("_id sku name");

  const productMap = new Map(
    products.map((product) => [
      product._id.toString(),
      product,
    ]),
  );

  for (const item of clientPOItems) {
    const key = `${item.productId.toString()}::${item.unitCode}`;

    const quotationItem = quotationMap.get(key);

    const product = productMap.get(item.productId.toString());

    const productName = product
      ? `${product.name}${product.sku ? ` (${product.sku})` : ""}`
      : item.productId.toString();

    // =========================
    // PRODUCT NOT IN QUOTATION
    // =========================

    if (!quotationItem) {
      const error = new Error(
        `Product ${productName} is not included in the quotation`,
      );

      error.statusCode = 400;
      throw error;
    }

    const quotationQuantity = Number(quotationItem.quantity);

    const alreadyCommitted = committedQuantities.get(key) || 0;

    const requestedQuantity = Number(item.quantity);

    const remainingQuantity =
      quotationQuantity - alreadyCommitted;

    // =========================
    // QUANTITY EXCEEDS REMAINING
    // =========================

    if (requestedQuantity > remainingQuantity + 0.000001) {
      const error = new Error(
        `Quantity for product ${productName} exceeds the remaining quotation quantity. Requested: ${requestedQuantity}, Remaining: ${remainingQuantity}`,
      );

      error.statusCode = 400;
      throw error;
    }
  }
};
// =========================
// GET ALL CLIENT POs
// =========================

const getClientPOs = async (req, res, next) => {
  try {
    const clientPOs = await ClientPO.find()
      .populate("customerId", "customerCode name")
      .populate("quotationId", "quotationNumber")
      .populate("items.productId", "sku name unit")
      .populate("items.unitId", "code name")
      .populate("createdBy", "firstName lastName")
      .populate("updatedBy", "firstName lastName")
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      count: clientPOs.length,
      clientPOs,
    });
  } catch (error) {
    next(error);
  }
};

// =========================
// GET SINGLE CLIENT PO
// =========================

const getClientPOById = async (req, res, next) => {
  try {
    const clientPO = await ClientPO.findById(req.params.id)
      .populate("customerId", "customerCode name")
      .populate("quotationId", "quotationNumber")
      .populate("items.productId", "sku name unit")
      .populate("items.unitId", "code name")
      .populate("createdBy", "firstName lastName")
      .populate("updatedBy", "firstName lastName");

    if (!clientPO) {
      return res.status(404).json({
        success: false,
        message: "Client PO not found",
      });
    }

    res.status(200).json({
      success: true,
      clientPO,
    });
  } catch (error) {
    next(error);
  }
};




// =========================
// CREATE CLIENT PO
// =========================

const createClientPO = async (req, res, next) => {
  try {
    const {
      items,
      customerId,
      quotationId,
      laborCost,
      otherDirectCosts,
      status: _status,
      poNumber: _poNumber,
      ...clientPOData
    } = req.body;

    // =========================
    // CUSTOMER
    // =========================

    const customer = await Customer.findById(customerId);

    if (!customer) {
      const error = new Error("Customer not found");
      error.statusCode = 400;
      throw error;
    }

    if (customer.status !== "active") {
      const error = new Error(
        "Cannot create Client PO for an inactive customer",
      );
      error.statusCode = 400;
      throw error;
    }

    // =========================
    // PREPARE ITEMS
    // =========================

    const clientPOItems = await prepareClientPOItems(items);

    let finalLaborCost = 0;
    let finalOtherDirectCosts = 0;
    let taxRate = 0;
    let pricingMode = "inclusive";

    // =========================
    // QUOTATION-LINKED PO
    // =========================

   if (quotationId) {
      const quotation = await Quotation.findById(quotationId);

      if (!quotation) {
        const error = new Error("Quotation not found");
        error.statusCode = 400;
        throw error;
      }

      if (quotation.status !== "accepted") {
        const error = new Error(
          "Client PO can only reference an accepted quotation",
        );
        error.statusCode = 400;
        throw error;
      }

      if (quotation.customerId.toString() !== customerId.toString()) {
        const error = new Error(
          "Quotation does not belong to the selected customer",
        );
        error.statusCode = 400;
        throw error;
      }

      // =========================
      // QUOTATION ITEM INTEGRITY
      // =========================

      validateQuotationItems({
        quotation,
        clientPOItems,
      });

      // =========================
      // PARTIAL PO QUANTITY
      // =========================

      const committedQuantities = await getQuotationCommittedQuantities({
        quotationId,
      });

      await validateQuotationQuantities({
  quotation,
  clientPOItems,
  committedQuantities,
});

      // =========================
      // INHERIT TAX SNAPSHOT
      // =========================

      taxRate = Number(quotation.taxRate || 0);

      pricingMode = quotation.pricingMode || "inclusive";

      // =========================
      // PROPORTIONAL COMMERCIAL COST
      // =========================

      const quotationSubtotal = Number(quotation.subtotal || 0);

      const clientPOSubtotal = clientPOItems.reduce(
        (total, item) =>
          total + Number(item.quantity) * Number(item.agreedUnitPrice),
        0,
      );

      const allocationRatio =
        quotationSubtotal > 0 ? clientPOSubtotal / quotationSubtotal : 0;

      finalLaborCost = Number(
        (Number(quotation.laborCost || 0) * allocationRatio).toFixed(2),
      );

      finalOtherDirectCosts = Number(
        (Number(quotation.otherDirectCosts || 0) * allocationRatio).toFixed(2),
      );
   } else {
  // =========================
  // MANUAL PO
  // SNAPSHOT CURRENT SETTINGS
  // =========================

  const settings = await Settings.findOne().select("accountingTax");

  const vatEnabled = settings?.accountingTax?.vatEnabled === true;

  taxRate = vatEnabled
    ? Number(settings?.accountingTax?.vatRate || 0)
    : 0;

  pricingMode =
    settings?.accountingTax?.pricingMode || "inclusive";

  finalLaborCost =
    laborCost !== undefined ? Number(laborCost) : 0;

  finalOtherDirectCosts =
    otherDirectCosts !== undefined
      ? Number(otherDirectCosts)
      : 0;
}

    // =========================
    // CALCULATE TOTALS
    // =========================

    const totals = calculateClientPOTotals({
      items: clientPOItems,
      laborCost: finalLaborCost,
      otherDirectCosts: finalOtherDirectCosts,
      taxRate,
      pricingMode,
    });

    // =========================
    // GENERATE DOCUMENT NUMBER
    // =========================

    const poNumber = await generateDocumentNumber("clientPO");

    // =========================
    // CREATE CLIENT PO
    // =========================

    const clientPO = await ClientPO.create({
      ...clientPOData,
      poNumber,
      customerId,
      quotationId,
      items: clientPOItems,

      laborCost: totals.laborCost,
      otherDirectCosts: totals.otherDirectCosts,

      subtotal: totals.subtotal,
      taxRate: totals.taxRate,
      taxAmount: totals.taxAmount,
      pricingMode: totals.pricingMode,
      netAmount: totals.netAmount,
      totalAmount: totals.totalAmount,

      // A created customer PO is considered received.
      status: "received",

      createdBy: req.user._id,
    });

   // CREATE NOTIFICATION
try {
  await createNotificationsForRoles({
    roles: ["owner", "admin", "sales"],
    excludeUserId: req.user._id,
    type: "client_po",
    title: "New Client PO",
    message: `Client PO ${clientPO.poNumber} was received.`,
    link: `/client-pos?search=${encodeURIComponent(clientPO.poNumber)}`,
    entityType: "ClientPO",
    entityId: clientPO._id,
  });
} catch (notificationError) {
  console.error(
    "Failed to create Client PO notification:",
    notificationError,
  );
}

    const populatedClientPO = await ClientPO.findById(clientPO._id)
      .populate("customerId", "customerCode name")
      .populate("quotationId", "quotationNumber")
      .populate("items.productId", "sku name unit")
      .populate("items.unitId", "code name")
      .populate("createdBy", "firstName lastName");

    res.status(201).json({
      success: true,
      clientPO: populatedClientPO,
    });
  } catch (error) {
    next(error);
  }
};




// =========================
// UPDATE CLIENT PO
// =========================
const updateClientPO = async (req, res, next) => {
  try {
    const clientPO = await ClientPO.findById(req.params.id);

    if (!clientPO) {
      return res.status(404).json({
        success: false,
        message: "Client PO not found",
      });
    }

    const TERMINAL_CLIENT_PO_STATUSES = ["fulfilled", "cancelled"];

    const {
      customerId,
      quotationId,
      poDate,
      items,
      laborCost,
      otherDirectCosts,
      status,
      // poNumber intentionally ignored because document numbers are immutable.
      poNumber: _poNumber,
    } = req.body;

    // =========================
    // CHECK EDITABLE FIELDS
    // =========================

    const hasEditableFields =
      customerId !== undefined ||
      quotationId !== undefined ||
      poDate !== undefined ||
      items !== undefined ||
      laborCost !== undefined ||
      otherDirectCosts !== undefined;

    // =========================
    // TERMINAL STATUS
    // =========================

    if (TERMINAL_CLIENT_PO_STATUSES.includes(clientPO.status)) {
      const error = new Error(
        `Cannot modify a ${clientPO.status} Client PO`,
      );
      error.statusCode = 400;
      throw error;
    }

    // =========================
    // RECEIVED PO IMMUTABILITY
    // =========================

    if (clientPO.status === "received" && hasEditableFields) {
      const error = new Error(
        "Received Client POs cannot be edited. Only status changes are allowed.",
      );
      error.statusCode = 400;
      throw error;
    }

   // =========================
// VALIDATE STATUS TRANSITION
// =========================

if (status !== undefined) {
  const ALLOWED_STATUS_TRANSITIONS = {
    received: ["cancelled"],
    fulfilled: [],
    cancelled: [],
  };

  const currentStatus = clientPO.status;

  if (!ALLOWED_STATUS_TRANSITIONS[currentStatus]) {
    const error = new Error(
      `Invalid current Client PO status: ${currentStatus}`,
    );
    error.statusCode = 400;
    throw error;
  }

  if (!ALLOWED_STATUS_TRANSITIONS[currentStatus].includes(status)) {
    const error = new Error(
      `Cannot change Client PO status from ${currentStatus} to ${status}`,
    );
    error.statusCode = 400;
    throw error;
  }

  clientPO.status = status;

  // CREATE STATUS NOTIFICATION
  try {
    await createNotificationsForRoles({
      roles: ["owner", "admin", "sales"],
      excludeUserId: req.user._id,
      type: "client_po",
      title: `Client PO ${status}`,
      message: `Client PO ${clientPO.poNumber} was ${status}.`,
      link: `/client-pos?search=${encodeURIComponent(
        clientPO.poNumber,
      )}`,
      entityType: "ClientPO",
      entityId: clientPO._id,
    });
  } catch (notificationError) {
    console.error(
      `Failed to create Client PO ${status} notification:`,
      notificationError,
    );
  }
    }

// =========================
// STATUS-ONLY UPDATE
// =========================

if (status !== undefined && !hasEditableFields) {
  clientPO.updatedBy = req.user._id;

  await clientPO.save();

  const populatedClientPO = await ClientPO.findById(clientPO._id)
    .populate("customerId", "customerCode name")
    .populate("quotationId", "quotationNumber")
    .populate("items.productId", "sku name unit")
    .populate("items.unitId", "code name")
    .populate("createdBy", "firstName lastName")
    .populate("updatedBy", "firstName lastName");

  return res.status(200).json({
    success: true,
    clientPO: populatedClientPO,
  });
}

    // =========================
    // PO NUMBER IMMUTABLE
    // =========================

    // poNumber intentionally ignored.

    // =========================
    // DETERMINE FINAL REFERENCES
    // =========================

    const nextCustomerId =
      customerId !== undefined ? customerId : clientPO.customerId;

    const nextQuotationId =
      quotationId !== undefined ? quotationId : clientPO.quotationId;

    // =========================
    // CUSTOMER
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
          "Cannot assign Client PO to an inactive customer",
        );
        error.statusCode = 400;
        throw error;
      }
    }

    // =========================
    // DETERMINE FINAL ITEMS
    // =========================

    const nextItems =
      items !== undefined
        ? await prepareClientPOItems(items)
        : clientPO.items.map((item) => ({
            productId: item.productId,
            description: item.description,
            quantity: Number(item.quantity),
            agreedUnitPrice: Number(item.agreedUnitPrice),
            unitId: item.unitId,
            unitCode: item.unitCode,
          }));

    // =========================
    // QUOTATION FLOW
    // =========================

    let finalLaborCost = 0;
    let finalOtherDirectCosts = 0;
    let taxRate = 0;
    let pricingMode = "inclusive";

    if (nextQuotationId) {
      const quotation = await Quotation.findById(nextQuotationId);

      if (!quotation) {
        const error = new Error("Quotation not found");
        error.statusCode = 400;
        throw error;
      }

      if (quotation.status !== "accepted") {
        const error = new Error(
          "Client PO can only reference an accepted quotation",
        );
        error.statusCode = 400;
        throw error;
      }

      if (quotation.customerId.toString() !== nextCustomerId.toString()) {
        const error = new Error(
          "Quotation does not belong to the selected customer",
        );
        error.statusCode = 400;
        throw error;
      }

      validateQuotationItems({
        quotation,
        clientPOItems: nextItems,
        currentClientPOId: clientPO._id,
      });

      const committedQuantities = await getQuotationCommittedQuantities({
        quotationId: quotation._id,
        excludeClientPOId: clientPO._id,
      });

 await validateQuotationQuantities({
  quotation,
  clientPOItems: nextItems,
  committedQuantities,
});

      taxRate = Number(quotation.taxRate || 0);

      pricingMode = quotation.pricingMode || "inclusive";

      const quotationSubtotal = Number(quotation.subtotal || 0);

      const clientPOSubtotal = nextItems.reduce(
        (total, item) =>
          total + Number(item.quantity) * Number(item.agreedUnitPrice),
        0,
      );

      const allocationRatio =
        quotationSubtotal > 0 ? clientPOSubtotal / quotationSubtotal : 0;

      finalLaborCost = Number(
        (Number(quotation.laborCost || 0) * allocationRatio).toFixed(2),
      );

      finalOtherDirectCosts = Number(
        (Number(quotation.otherDirectCosts || 0) * allocationRatio).toFixed(2),
      );
    } else {
  // =========================
  // MANUAL PO
  // PRESERVE EXISTING TAX SNAPSHOT
  // =========================

  taxRate = Number(clientPO.taxRate || 0);

  pricingMode = clientPO.pricingMode || "inclusive";

  finalLaborCost =
    laborCost !== undefined
      ? Number(laborCost)
      : Number(clientPO.laborCost || 0);

  finalOtherDirectCosts =
    otherDirectCosts !== undefined
      ? Number(otherDirectCosts)
      : Number(clientPO.otherDirectCosts || 0);
}

    // =========================
    // CALCULATE TOTALS
    // =========================

    const totals = calculateClientPOTotals({
      items: nextItems,
      laborCost: finalLaborCost,
      otherDirectCosts: finalOtherDirectCosts,
      taxRate,
      pricingMode,
    });

    // =========================
    // UPDATE FIELDS
    // =========================

    if (customerId !== undefined) {
      clientPO.customerId = customerId;
    }

    if (quotationId !== undefined) {
      clientPO.quotationId = quotationId;
    }

    if (poDate !== undefined) {
      clientPO.poDate = poDate;
    }


    clientPO.items = nextItems;

    clientPO.laborCost = totals.laborCost;

    clientPO.otherDirectCosts = totals.otherDirectCosts;

    clientPO.subtotal = totals.subtotal;

    clientPO.taxRate = totals.taxRate;

    clientPO.taxAmount = totals.taxAmount;

    clientPO.pricingMode = totals.pricingMode;

    clientPO.netAmount = totals.netAmount;

    clientPO.totalAmount = totals.totalAmount;

    clientPO.updatedBy = req.user._id;

    await clientPO.save();

    // =========================
    // POPULATE RESPONSE
    // =========================

    const populatedClientPO = await ClientPO.findById(clientPO._id)
      .populate("customerId", "customerCode name")
      .populate("quotationId", "quotationNumber")
      .populate("items.productId", "sku name unit")
      .populate("items.unitId", "code name")
      .populate("createdBy", "firstName lastName")
      .populate("updatedBy", "firstName lastName");

    res.status(200).json({
      success: true,
      clientPO: populatedClientPO,
    });
  } catch (error) {
    next(error);
  }
};

// =========================
// DELETE CLIENT PO
// =========================

const deleteClientPO = async (req, res, next) => {
  try {
    const clientPO = await ClientPO.findById(req.params.id);

    if (!clientPO) {
      return res.status(404).json({
        success: false,
        message: "Client PO not found",
      });
    }

    const error = new Error(
      "Client POs cannot be deleted. Cancel the Client PO instead.",
    );

    error.statusCode = 400;

    throw error;
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getClientPOs,
  getClientPOById,
  createClientPO,
  updateClientPO,
  deleteClientPO,
};

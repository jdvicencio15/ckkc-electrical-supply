const mongoose = require("mongoose");
const Sale = require("../models/Sale");
const Product = require("../models/Product");
const InventoryMovement = require("../models/InventoryMovement");

const Customer = require("../models/Customer");
const ClientPO = require("../models/ClientPO");
const Supplier = require("../models/Supplier");
const Settings = require("../models/Settings");

const { createAuditLog } = require("../services/auditService");

const { createSaleJournalEntry } = require("../services/accountingService");

const { resolveProductCost } = require("../services/pricingService");

const { resolveProductUnit } = require("../services/unitService");

const { roundMoney } = require("../utils/money");

const { generateDocumentNumber } = require("../services/documentNumberService");

const {
  checkReferenceExists,
  checkReferencesExist,
} = require("../utils/referenceValidator");

const {
  createNotificationsForRoles,
} = require("../services/notificationService");

const {
  checkAndCreateLowStockNotification,
} = require("../services/lowStockNotificationService");

const validateUniqueSaleItems = (items) => {
  const saleItems = new Map();

  for (const item of items) {
    const key = `${String(item.productId)}::${item.unitCode}`;

    if (saleItems.has(key)) {
      const error = new Error(
        `Duplicate product/UOM combination in Sale: ${item.productId}/${item.unitCode}`,
      );

      error.statusCode = 400;
      throw error;
    }

    saleItems.set(key, item);
  }

  return true;
};

const validateSaleFinancialValues = ({
  quantity,
  unitPrice,
  fieldPrefix = "Sale item",
}) => {
  const safeQuantity = Number(quantity);
  const safeUnitPrice = Number(unitPrice);

  if (!Number.isFinite(safeQuantity) || safeQuantity <= 0) {
    const error = new Error(`${fieldPrefix} quantity must be greater than 0`);
    error.statusCode = 400;
    throw error;
  }

  if (!Number.isFinite(safeUnitPrice) || safeUnitPrice < 0) {
    const error = new Error(`${fieldPrefix} unit price cannot be negative`);
    error.statusCode = 400;
    throw error;
  }

  return {
    quantity: safeQuantity,
    unitPrice: safeUnitPrice,
  };
};

const validateSaleItemsBasic = (items) => {
  if (!Array.isArray(items) || items.length === 0) {
    const error = new Error("Sale must contain at least one item");
    error.statusCode = 400;
    throw error;
  }

  for (const item of items) {
    validateSaleFinancialValues({
      quantity: item.quantity,
      unitPrice: item.unitPrice,
      fieldPrefix: `Product ${item.productId}`,
    });
  }
};

const validateCustomerForSale = async (customerId) => {
  const customer = await Customer.findById(customerId).select("status");

  if (!customer) {
    const error = new Error("Customer not found");
    error.statusCode = 404;
    throw error;
  }

  if (customer.status !== "active") {
    const error = new Error(
      "Cannot create or update a Sale for an inactive customer",
    );
    error.statusCode = 400;
    throw error;
  }

  return customer;
};

const validateProductsForSale = async (items) => {
  validateSaleItemsBasic(items);

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

  const productMap = new Map(
    products.map((product) => [String(product._id), product]),
  );

  for (const item of items) {
    const product = productMap.get(String(item.productId));

    if (!product) {
      const error = new Error(`Product not found: ${item.productId}`);
      error.statusCode = 404;
      throw error;
    }

    if (product.status !== "active") {
      const error = new Error(
        `Cannot use inactive product ${item.productId} in a Sale`,
      );
      error.statusCode = 400;
      throw error;
    }
  }
};

const validateClientPOSource = async ({ sale, clientPO, session }) => {
  if (!clientPO) {
    const error = new Error("Client PO not found");
    error.statusCode = 404;
    throw error;
  }

  // Only approved/active Client POs can be used for Sales.
  if (!["received", "processing"].includes(clientPO.status)) {
    const error = new Error(
      `Client PO with status "${clientPO.status}" cannot be used for a sale`,
    );

    error.statusCode = 400;
    throw error;
  }

  if (String(sale.customerId) !== String(clientPO.customerId)) {
    const error = new Error("Sale customer must match Client PO customer");
    error.statusCode = 400;
    throw error;
  }

  const poItems = new Map();

  for (const item of clientPO.items) {
    const key = `${String(item.productId)}::${item.unitCode}`;

    if (poItems.has(key)) {
      const error = new Error(
        `Duplicate product/UOM combination in Client PO: ${item.productId}/${item.unitCode}`,
      );
      error.statusCode = 400;
      throw error;
    }

    poItems.set(key, item);
  }

  let releasedSalesQuery = Sale.find({
    clientPOId: clientPO._id,
    status: "released",
    _id: { $ne: sale._id },
  }).select("items");

  if (session) {
    releasedSalesQuery = releasedSalesQuery.session(session);
  }

  const releasedSales = await releasedSalesQuery;

  const releasedQuantities = new Map();

  for (const releasedSale of releasedSales) {
    for (const item of releasedSale.items) {
      const key = `${String(item.productId)}::${item.unitCode}`;

      releasedQuantities.set(
        key,
        (releasedQuantities.get(key) || 0) + Number(item.quantity),
      );
    }
  }

  for (const saleItem of sale.items) {
    const key = `${String(saleItem.productId)}::${saleItem.unitCode}`;

    const poItem = poItems.get(key);

    if (!poItem) {
      const error = new Error(
        `Product ${saleItem.productId} with UOM ${saleItem.unitCode} is not included in Client PO`,
      );
      error.statusCode = 400;
      throw error;
    }

    if (
      Math.abs(Number(saleItem.unitPrice) - Number(poItem.agreedUnitPrice)) >
      0.01
    ) {
      const error = new Error(
        `Sale price for product ${saleItem.productId} does not match Client PO agreed price`,
      );
      error.statusCode = 400;
      throw error;
    }

    const previouslyReleased = releasedQuantities.get(key) || 0;

    const requestedQuantity = Number(saleItem.quantity);

    const remainingQuantity = Number(poItem.quantity) - previouslyReleased;

    if (requestedQuantity > remainingQuantity) {
      const error = new Error(
        `Sale quantity exceeds remaining Client PO quantity for product ${saleItem.productId}. Remaining: ${remainingQuantity}, Requested: ${requestedQuantity}`,
      );
      error.statusCode = 400;
      throw error;
    }
  }

  return true;
};

const updateClientPOFulfillmentStatus = async ({
  clientPOId,
  session,
  req,
  sale,
}) => {
  const clientPO = await ClientPO.findById(clientPOId).session(session);

  if (!clientPO) {
    const error = new Error("Client PO not found");
    error.statusCode = 404;
    throw error;
  }

  const previousStatus = clientPO.status;

  const releasedSales = await Sale.find({
    clientPOId,
    status: "released",
  })
    .select("items")
    .session(session);

  const releasedQuantities = new Map();

  for (const sale of releasedSales) {
    for (const item of sale.items) {
      const key = `${String(item.productId)}::${item.unitCode}`;

      releasedQuantities.set(
        key,
        (releasedQuantities.get(key) || 0) + Number(item.quantity),
      );
    }
  }

  let fullyFulfilled = true;
  let hasReleasedQuantity = false;

  for (const poItem of clientPO.items) {
    const key = `${String(poItem.productId)}::${poItem.unitCode}`;

    const releasedQuantity = releasedQuantities.get(key) || 0;

    if (releasedQuantity > 0) {
      hasReleasedQuantity = true;
    }

    if (releasedQuantity < Number(poItem.quantity)) {
      fullyFulfilled = false;
    }
  }

  if (fullyFulfilled) {
    clientPO.status = "fulfilled";
  } else if (hasReleasedQuantity) {
    clientPO.status = "processing";
  } else {
    clientPO.status = "received";
  }

  if (previousStatus !== clientPO.status) {
    await createAuditLog({
      req,
      session,
      action: "STATUS_CHANGE",
      entity: "ClientPO",
      entityId: clientPO._id,
      documentNumber: clientPO.poNumber,
      description:
        clientPO.status === "fulfilled"
          ? `Client PO ${clientPO.poNumber} was automatically fulfilled after Sale ${sale.salesNumber} released the remaining ordered quantities.`
          : `Client PO ${clientPO.poNumber} status changed from ${previousStatus} to ${clientPO.status} after Sale ${sale.salesNumber} was released.`,
      before: {
        status: previousStatus,
      },
      after: {
        status: clientPO.status,
      },
      metadata: {
        reason: "SALE_RELEASE",
        saleId: sale._id,
        saleNumber: sale.salesNumber,
        previousStatus,
        newStatus: clientPO.status,
      },
    });
  }

  await clientPO.save({ session });

  return clientPO;
};

const validateSaleNonNegativeAmount = (value, fieldName) => {
  const amount = Number(value);

  if (!Number.isFinite(amount) || amount < 0) {
    const error = new Error(`${fieldName} must be a valid non-negative number`);

    error.statusCode = 400;
    throw error;
  }

  return amount;
};


const validateSuppliersForSale = async (items) => {
  const supplierIds = [
    ...new Set(
      items
        .filter((item) => item.supplierId)
        .map((item) => String(item.supplierId)),
    ),
  ];

  if (supplierIds.length === 0) {
    return;
  }

  const suppliers = await Supplier.find({
    _id: { $in: supplierIds },
  }).select("_id status");

  const supplierMap = new Map(
    suppliers.map((supplier) => [String(supplier._id), supplier]),
  );

  for (const supplierId of supplierIds) {
    const supplier = supplierMap.get(supplierId);

    if (!supplier) {
      const error = new Error(`Supplier not found: ${supplierId}`);
      error.statusCode = 404;
      throw error;
    }

    if (supplier.status !== "active") {
      const error = new Error(
        `Inactive supplier cannot be used for a sale: ${supplierId}`,
      );
      error.statusCode = 400;
      throw error;
    }
  }
};


const prepareSaleCalculation = async ({
  items,
  directExpenses,
  commission,
  vatRate,
  pricingMode,
}) => {
  validateSaleItemsBasic(items);
  validateUniqueSaleItems(items);

  await validateProductsForSale(items);
  await validateSuppliersForSale(items);

  const safeDirectExpenses = validateSaleNonNegativeAmount(
    directExpenses,
    "Direct expenses",
  );

  const safeCommission = validateSaleNonNegativeAmount(
    commission,
    "Commission",
  );

  const calculatedItems = [];

  for (const item of items) {
    const { quantity, unitPrice } = validateSaleFinancialValues({
      quantity: item.quantity,
      unitPrice: item.unitPrice,
      fieldPrefix: `Product ${item.productId}`,
    });

    const { unitCost, source } = await resolveProductCost({
      productId: item.productId,
      supplierId: item.supplierId,
    });

    const { unitId, unitCode } = await resolveProductUnit(item.productId);

    const safeUnitCost = roundMoney(unitCost);
    const safeUnitPrice = roundMoney(unitPrice);

    const profit = roundMoney(
      (safeUnitPrice - safeUnitCost) * quantity,
    );

    calculatedItems.push({
      ...item,
      quantity,
      unitPrice: safeUnitPrice,
      unitCost: safeUnitCost,
      costSource: source,
      unitId,
      unitCode,
      profit,
    });
  }

  // Validate after unitCode has been resolved.
  validateUniqueSaleItems(calculatedItems);

  const subtotal = roundMoney(
    calculatedItems.reduce(
      (total, item) => total + item.quantity * item.unitPrice,
      0,
    ),
  );

  const totalCost = roundMoney(
    calculatedItems.reduce(
      (total, item) => total + item.quantity * item.unitCost,
      0,
    ),
  );

  let netAmount = subtotal;
  let taxAmount = 0;

  if (vatRate > 0) {
    if (pricingMode === "inclusive") {
      netAmount = subtotal / (1 + vatRate / 100);
      taxAmount = subtotal - netAmount;
    } else {
      netAmount = subtotal;
      taxAmount = subtotal * (vatRate / 100);
    }
  }

  netAmount = roundMoney(netAmount);
  taxAmount = roundMoney(taxAmount);

  const totalAmount = roundMoney(
    pricingMode === "inclusive"
      ? subtotal + safeDirectExpenses + safeCommission
      : subtotal +
          taxAmount +
          safeDirectExpenses +
          safeCommission,
  );

  const totalProfit = roundMoney(
    netAmount -
      totalCost -
      safeDirectExpenses -
      safeCommission,
  );

  return {
    calculatedItems,
    subtotal,
    totalCost,
    taxAmount,
    netAmount,
    totalAmount,
    totalProfit,
    directExpenses: safeDirectExpenses,
    commission: safeCommission,
  };
};
// GET ALL SALES
const getSales = async (req, res, next) => {
  try {
    const sales = await Sale.find()
      .populate("customerId", "customerCode name")
      .populate("clientPOId", "poNumber")
      .populate("items.supplierId", "supplierCode name")
      .populate("items.productId", "sku name")
      .populate("items.unitId", "code name")
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
      .populate("items.supplierId", "supplierCode name")
      .populate("items.productId", "sku name")
      .populate("items.unitId", "code name")
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
      customerId,
      clientPOId,
      saleDate,
      items,
      directExpenses = 0,
      commission = 0,
    } = req.body;

    await validateCustomerForSale(customerId);

    let clientPO = null;

    if (clientPOId) {
      await checkReferenceExists(ClientPO, clientPOId, "Client PO");

      clientPO = await ClientPO.findById(clientPOId).select(
        "status customerId items",
      );

      if (!clientPO) {
        return res.status(404).json({
          success: false,
          message: "Client PO not found",
        });
      }

      if (!["received", "processing"].includes(clientPO.status)) {
        return res.status(400).json({
          success: false,
          message: `Client PO with status "${clientPO.status}" cannot be used for a sale`,
        });
      }

      if (String(customerId) !== String(clientPO.customerId)) {
        return res.status(400).json({
          success: false,
          message: "Sale customer must match Client PO customer",
        });
      }
    }

    const settings = await Settings.findOne().select("accountingTax");

    const vatEnabled =
      settings?.accountingTax?.vatEnabled === true;

    const vatRate = vatEnabled
      ? Number(settings?.accountingTax?.vatRate || 0)
      : 0;

    const pricingMode =
      settings?.accountingTax?.pricingMode || "inclusive";

    const calculation = await prepareSaleCalculation({
      items,
      directExpenses,
      commission,
      vatRate,
      pricingMode,
    });

    // Validate Client PO against the final calculated Sale items.
    if (clientPOId) {
      await validateClientPOSource({
        sale: {
          _id: new mongoose.Types.ObjectId(),
          customerId,
          clientPOId,
          items: calculation.calculatedItems,
        },
        clientPO,
        session: null,
      });
    }

    const salesNumber = await generateDocumentNumber("sales");

    const sale = await Sale.create({
      salesNumber,
      customerId,
      clientPOId,
      saleDate,

      // Sales always start as draft.
      status: "draft",

      items: calculation.calculatedItems,

      subtotal: calculation.subtotal,

      taxRate: vatRate,
      taxAmount: calculation.taxAmount,
      pricingMode,
      netAmount: calculation.netAmount,

      directExpenses: calculation.directExpenses,
      commission: calculation.commission,

      totalAmount: calculation.totalAmount,
      totalCost: calculation.totalCost,
      totalProfit: calculation.totalProfit,

      createdBy: req.user._id,
    });

    await createAuditLog({
      req,
      action: "CREATE",
      entity: "Sale",
      entityId: sale._id,
      documentNumber: sale.salesNumber,
      description: `Created Sale ${sale.salesNumber}`,
      after: sale.toObject(),
    });

    try {
      await createNotificationsForRoles({
        roles: ["owner", "admin", "sales"],
        excludeUserId: req.user._id,
        type: "sale",
        title: "New Sale",
        message: `Sale ${sale.salesNumber} was created.`,
        link: `/sales?search=${encodeURIComponent(
          sale.salesNumber,
        )}`,
        entityType: "Sale",
        entityId: sale._id,
      });
    } catch (notificationError) {
      console.error(
        "Failed to create sale notification:",
        notificationError,
      );
    }

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

    if (sale.status !== "draft") {
      return res.status(400).json({
        success: false,
        message: `Only draft sales can be modified. Current status: ${sale.status}`,
      });
    }

    const before = sale.toObject();

    const {
      customerId,
      clientPOId,
      saleDate,
      items,
      directExpenses,
      commission,
    } = req.body;

    const effectiveCustomerId =
      customerId !== undefined
        ? customerId
        : sale.customerId;

    const effectiveClientPOId =
      clientPOId !== undefined
        ? clientPOId
        : sale.clientPOId;

    const effectiveItems =
      items !== undefined
        ? items
        : sale.items;

    const effectiveDirectExpenses =
      directExpenses !== undefined
        ? directExpenses
        : sale.directExpenses;

    const effectiveCommission =
      commission !== undefined
        ? commission
        : sale.commission;

    // Validate customer.
    await validateCustomerForSale(effectiveCustomerId);

    // Validate Client PO.
    let clientPO = null;

    if (effectiveClientPOId) {
      await checkReferenceExists(
        ClientPO,
        effectiveClientPOId,
        "Client PO",
      );

      clientPO = await ClientPO.findById(
        effectiveClientPOId,
      ).select("status customerId items");

      if (!clientPO) {
        return res.status(404).json({
          success: false,
          message: "Client PO not found",
        });
      }

      if (!["received", "processing"].includes(clientPO.status)) {
        return res.status(400).json({
          success: false,
          message: `Client PO with status "${clientPO.status}" cannot be used for a sale`,
        });
      }

      if (
        String(effectiveCustomerId) !==
        String(clientPO.customerId)
      ) {
        return res.status(400).json({
          success: false,
          message: "Sale customer must match Client PO customer",
        });
      }
    }

    // Get current VAT settings only when creating/rebuilding
    // the draft's financial values.
    const settings = await Settings.findOne().select(
      "accountingTax",
    );

    const vatEnabled =
      settings?.accountingTax?.vatEnabled === true;

    const currentVatRate = vatEnabled
      ? Number(settings?.accountingTax?.vatRate || 0)
      : 0;

    const currentPricingMode =
      settings?.accountingTax?.pricingMode || "inclusive";

    /*
     * IMPORTANT:
     * A draft Sale is still editable, so its financial values
     * should follow the same calculation rules as CREATE.
     */
    const calculation = await prepareSaleCalculation({
      items: effectiveItems,
      directExpenses: effectiveDirectExpenses,
      commission: effectiveCommission,
      vatRate: currentVatRate,
      pricingMode: currentPricingMode,
    });

    // Validate Client PO against the final Sale items.
    if (effectiveClientPOId) {
      await validateClientPOSource({
        sale: {
          ...sale.toObject(),
          customerId: effectiveCustomerId,
          clientPOId: effectiveClientPOId,
          items: calculation.calculatedItems,
        },
        clientPO,
        session: null,
      });
    }

    // Update basic fields.
    sale.customerId = effectiveCustomerId;
    sale.clientPOId =
      effectiveClientPOId || null;

    if (saleDate !== undefined) {
      sale.saleDate = saleDate;
    }

    // Update calculated financial values.
    sale.items = calculation.calculatedItems;
    sale.subtotal = calculation.subtotal;

    sale.taxRate = currentVatRate;
    sale.taxAmount = calculation.taxAmount;
    sale.pricingMode = currentPricingMode;
    sale.netAmount = calculation.netAmount;

    sale.directExpenses =
      calculation.directExpenses;

    sale.commission =
      calculation.commission;

    sale.totalAmount =
      calculation.totalAmount;

    sale.totalCost =
      calculation.totalCost;

    sale.totalProfit =
      calculation.totalProfit;

    sale.updatedBy = req.user._id;

    await sale.save();

    await createAuditLog({
      req,
      action: "UPDATE",
      entity: "Sale",
      entityId: sale._id,
      documentNumber: sale.salesNumber,
      description: `Updated Sale ${sale.salesNumber}`,
      before,
      after: sale.toObject(),
    });

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

    // RELEASED SALES ARE IMMUTABLE.
    // Only draft sales can be permanently deleted.
    if (sale.status !== "draft") {
      return res.status(400).json({
        success: false,
        message: `Only draft sales can be deleted. Current status: ${sale.status}`,
      });
    }

    /*
     * Capture the complete business snapshot BEFORE deletion.
     *
     * This is important because the actual Sale document will no longer
     * exist after deleteOne(). The audit trail becomes the historical
     * record that the draft Sale existed and was intentionally deleted.
     */
    const deletedSaleSnapshot = sale.toObject();

    // DELETE SALE
    await sale.deleteOne();

    // AUDIT TRAIL
    await createAuditLog({
      req,
      action: "DELETE",
      entity: "Sale",
      entityId: sale._id,
      documentNumber: sale.salesNumber,
      description: `Draft Sale ${sale.salesNumber} was deleted.`,
      before: deletedSaleSnapshot,
      after: null,
      metadata: {
        reason: "DRAFT_SALE_DELETED",
        saleNumber: sale.salesNumber,
        customerId: sale.customerId,
        clientPOId: sale.clientPOId || null,
        deletedStatus: "draft",
      },
    });

    res.status(200).json({
      success: true,
      message: `Draft Sale ${sale.salesNumber} deleted successfully`,
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

    const lowStockChecks = [];

    // ============================================================
    // 1. LOAD INVENTORY SETTINGS
    // ============================================================

    const settings = await Settings.findOne()
      .select("inventory.allowNegativeStock inventory.autoDeductStockOnSale")
      .session(session);

    const autoDeductStock =
      settings?.inventory?.autoDeductStockOnSale !== false;

    const allowNegativeStock =
      settings?.inventory?.allowNegativeStock === true;

    // ============================================================
    // 2. LOAD SALE
    // ============================================================

    const sale = await Sale.findById(req.params.id).session(session);

    if (!sale) {
      await session.abortTransaction();

      return res.status(404).json({
        success: false,
        message: "Sale not found",
      });
    }

    // Only draft sales can be released.
    if (sale.status !== "draft") {
      await session.abortTransaction();

      return res.status(400).json({
        success: false,
        message: `Only draft sales can be released. Current status: ${sale.status}`,
      });
    }

    // ============================================================
    // 3. BASIC SALE VALIDATION
    // ============================================================

    validateSaleItemsBasic(sale.items);
    validateUniqueSaleItems(sale.items);

    // ============================================================
    // 4. VALIDATE CLIENT PO
    // ============================================================

    if (sale.clientPOId) {
      const clientPO = await ClientPO.findById(
        sale.clientPOId,
      ).session(session);

      await validateClientPOSource({
        sale,
        clientPO,
        session,
      });
    }

    // ============================================================
    // 5. VALIDATE PRODUCTS
    // ============================================================

    await validateProductsForSale(sale.items);

    // ============================================================
    // 6. VALIDATE SUPPLIERS
    // ============================================================

    await validateSuppliersForSale(sale.items);

    // ============================================================
    // 7. CHECK STOCK
    // ============================================================
    //
    // We validate ALL stock first before deducting anything.
    //
    // This prevents a partial operation such as:
    //
    // Product A -> deducted
    // Product B -> insufficient stock
    //
    // The transaction would protect us anyway, but validating first
    // makes the business flow explicit and easier to reason about.
    // ============================================================

    if (autoDeductStock) {
      for (const item of sale.items) {
        const product = await Product.findById(
          item.productId,
        ).session(session);

        if (!product) {
          await session.abortTransaction();

          return res.status(404).json({
            success: false,
            message: `Product not found: ${item.productId}`,
          });
        }

        const currentStock = Number(product.currentStock);
        const requestedQuantity = Number(item.quantity);

        if (
          !Number.isFinite(currentStock) ||
          currentStock < requestedQuantity
        ) {
          if (!allowNegativeStock) {
            await session.abortTransaction();

            return res.status(400).json({
              success: false,
              message:
                `Insufficient stock for ${product.name}. ` +
                `Available: ${currentStock}, ` +
                `Required: ${requestedQuantity}`,
            });
          }
        }
      }
    }

    // ============================================================
    // 8. DEDUCT STOCK + CREATE INVENTORY MOVEMENTS
    // ============================================================

    if (autoDeductStock) {
      for (const item of sale.items) {
        const product = await Product.findById(
          item.productId,
        ).session(session);

        if (!product) {
          throw new Error(
            `Product not found during stock deduction: ${item.productId}`,
          );
        }

        const previousStock = Number(product.currentStock);
        const quantity = Number(item.quantity);

        const newStock = previousStock - quantity;

        // Record this for post-commit low-stock notification.
        lowStockChecks.push({
          productId: product._id,
          previousStock,
          newStock,
        });

        // Deduct stock.
        product.currentStock = newStock;

        await product.save({ session });

        // Create inventory movement.
        await InventoryMovement.create(
          [
            {
              productId: item.productId,
              type: "OUT",
              quantity,
              unitId: item.unitId,
              unitCode: item.unitCode,
              unitCost: item.unitCost,

              referenceType: "SALE",
              referenceId: sale._id,

              date: sale.saleDate,

              notes:
                `Released ${quantity} ${item.unitCode} ` +
                `of ${product.name} for Sale ${sale.salesNumber}`,

              createdBy: req.user._id,
            },
          ],
          { session },
        );
      }
    }

    // ============================================================
    // 9. RELEASE SALE
    // ============================================================

    const previousStatus = sale.status;

    sale.status = "released";
    sale.updatedBy = req.user._id;

    await sale.save({ session });

    // ============================================================
    // 10. AUDIT TRAIL
    // ============================================================

    await createAuditLog({
      req,
      session,
      action: "STATUS_CHANGE",
      entity: "Sale",
      entityId: sale._id,
      documentNumber: sale.salesNumber,

      description:
        `Sale ${sale.salesNumber} was released.`,

      before: {
        status: previousStatus,
      },

      after: {
        status: sale.status,
      },

      metadata: {
        reason: "SALE_RELEASE",
        previousStatus,
        newStatus: sale.status,

        autoDeductStock,
        allowNegativeStock,

        clientPOId: sale.clientPOId || null,
      },
    });

    // ============================================================
    // 11. CREATE ACCOUNTING JOURNAL ENTRY
    // ============================================================

    await createSaleJournalEntry({
      session,
      sale,
      createdBy: req.user._id,
    });

    // ============================================================
    // 12. UPDATE CLIENT PO FULFILLMENT
    // ============================================================

    if (sale.clientPOId) {
      await updateClientPOFulfillmentStatus({
        clientPOId: sale.clientPOId,
        session,
        req,
        sale,
      });
    }

    // ============================================================
    // 13. COMMIT EVERYTHING
    // ============================================================

    await session.commitTransaction();

    // ============================================================
    // 14. POST-COMMIT SALE NOTIFICATION
    // ============================================================

    try {
      await createNotificationsForRoles({
        roles: ["owner", "admin", "sales"],
        excludeUserId: req.user._id,

        type: "sale",

        title: "Sale Released",

        message:
          `Sale ${sale.salesNumber} was released successfully.`,

        link:
          `/sales?search=${encodeURIComponent(
            sale.salesNumber,
          )}`,

        entityType: "Sale",
        entityId: sale._id,
      });
    } catch (notificationError) {
      console.error(
        "Failed to create sale release notification:",
        notificationError,
      );
    }

    // ============================================================
    // 15. POST-COMMIT ACCOUNTING NOTIFICATION
    // ============================================================

    try {
      await createNotificationsForRoles({
        roles: ["owner", "admin", "accounting"],
        excludeUserId: req.user._id,

        type: "accounting",

        title: "Sales Journal Entry Created",

        message:
          `Accounting entry was created for Sale ${sale.salesNumber}.`,

        link:
          `/accounting/journal-entries?search=${encodeURIComponent(
            sale.salesNumber,
          )}`,

        entityType: "Sale",
        entityId: sale._id,
      });
    } catch (notificationError) {
      console.error(
        "Failed to create accounting notification:",
        notificationError,
      );
    }

    // ============================================================
    // 16. POST-COMMIT LOW STOCK NOTIFICATIONS
    // ============================================================

    for (const check of lowStockChecks) {
      try {
        await checkAndCreateLowStockNotification(check);
      } catch (notificationError) {
        console.error(
          "Failed to create low-stock notification:",
          notificationError,
        );
      }
    }

    // ============================================================
    // 17. RETURN UPDATED SALE
    // ============================================================

    const populatedSale = await Sale.findById(sale._id)
      .populate("customerId", "customerCode name")
      .populate("clientPOId", "poNumber")
      .populate("createdBy", "firstName lastName")
      .populate("updatedBy", "firstName lastName")
      .populate("items.productId", "sku name")
      .populate("items.unitId", "code name")
      .populate("items.supplierId", "supplierCode name");

    res.status(200).json({
      success: true,
      message: `Sale ${sale.salesNumber} released successfully`,
      sale: populatedSale,
    });
  } catch (error) {
    // ============================================================
    // TRANSACTION ROLLBACK
    // ============================================================

    if (session.inTransaction()) {
      await session.abortTransaction();
    }

    next(error);
  } finally {
    await session.endSession();
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

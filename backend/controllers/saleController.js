const mongoose = require("mongoose");
const Sale = require("../models/Sale");
const Product = require("../models/Product");
const InventoryMovement = require("../models/InventoryMovement");

const Customer = require("../models/Customer");
const ClientPO = require("../models/ClientPO");
const Supplier = require("../models/Supplier");
const Settings = require("../models/Settings");

const {
  createSaleJournalEntry,
} = require("../services/accountingService");

const {
  resolveProductCost,
} = require("../services/pricingService");

const { resolveProductUnit } = require("../services/unitService")

const { roundMoney } = require("../utils/money");

const {
  generateDocumentNumber,
} = require("../services/documentNumberService");

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


const validateClientPOSource = async ({
  sale,
  clientPO,
  session,
}) => {
  if (!clientPO) {
    const error = new Error("Client PO not found");
    error.statusCode = 404;
    throw error;
  }

  if (clientPO.status === "cancelled") {
    const error = new Error(
      "Cancelled Client PO cannot be used for a sale",
    );
    error.statusCode = 400;
    throw error;
  }

  if (String(sale.customerId) !== String(clientPO.customerId)) {
    const error = new Error(
      "Sale customer must match Client PO customer",
    );
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

  const releasedSales = await Sale.find({
    clientPOId: clientPO._id,
    status: "released",
    _id: { $ne: sale._id },
  })
    .select("items")
    .session(session);

  const releasedQuantities = new Map();

  for (const releasedSale of releasedSales) {
    for (const item of releasedSale.items) {
      const key = `${String(item.productId)}::${item.unitCode}`;

      releasedQuantities.set(
        key,
        (releasedQuantities.get(key) || 0) +
          Number(item.quantity),
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
      Math.abs(
        Number(saleItem.unitPrice) -
          Number(poItem.agreedUnitPrice),
      ) > 0.01
    ) {
      const error = new Error(
        `Sale price for product ${saleItem.productId} does not match Client PO agreed price`,
      );
      error.statusCode = 400;
      throw error;
    }

    const previouslyReleased =
      releasedQuantities.get(key) || 0;

    const requestedQuantity = Number(saleItem.quantity);

    const remainingQuantity =
      Number(poItem.quantity) - previouslyReleased;

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
}) => {
  const clientPO = await ClientPO.findById(clientPOId).session(
    session,
  );

  if (!clientPO) {
    const error = new Error("Client PO not found");
    error.statusCode = 404;
    throw error;
  }

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
        (releasedQuantities.get(key) || 0) +
          Number(item.quantity),
      );
    }
  }

  let fullyFulfilled = true;
  let hasReleasedQuantity = false;

  for (const poItem of clientPO.items) {
    const key = `${String(poItem.productId)}::${poItem.unitCode}`;

    const releasedQuantity =
      releasedQuantities.get(key) || 0;

    if (releasedQuantity > 0) {
      hasReleasedQuantity = true;
    }

    if (
      releasedQuantity < Number(poItem.quantity)
    ) {
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

  await clientPO.save({ session });

  return clientPO;
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

    await checkReferenceExists(Customer, customerId, "Customer");

    await checkReferenceExists(ClientPO, clientPOId, "Client PO");

    await checkReferencesExist(
      Product,
      items.map((item) => item.productId),
      "Product",
    );

    // VALIDATE SUPPLIERS
    for (const item of items) {
      if (!item.supplierId) continue;

      const supplier = await Supplier.findById(item.supplierId)
        .select("status");

      if (!supplier) {
        return res.status(404).json({
          success: false,
          message: `Supplier not found: ${item.supplierId}`,
        });
      }

      if (supplier.status !== "active") {
        return res.status(400).json({
          success: false,
          message: "Inactive supplier cannot be used for a sale",
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

    // CALCULATE ITEM TOTALS
    const calculatedItems = [];

    for (const item of items) {
      const { unitCost, source } = await resolveProductCost({
        productId: item.productId,
        supplierId: item.supplierId,
      });

      const { unitId, unitCode } = await resolveProductUnit(
        item.productId
      );

      const profit =
        (Number(item.unitPrice) - unitCost) *
        Number(item.quantity);

      calculatedItems.push({
        ...item,
        unitCost,
        costSource: source,
        unitId,
        unitCode,
        profit,
      });
    }

    // CALCULATE TOTALS
    const subtotal = roundMoney(
      calculatedItems.reduce(
        (total, item) =>
          total + item.quantity * item.unitPrice,
        0,
      )
    );

    const totalCost = roundMoney(
      calculatedItems.reduce(
        (total, item) =>
          total + item.quantity * item.unitCost,
        0,
      )
    );

    // VAT CALCULATION
    let netAmount = subtotal;
    let taxAmount = 0;

    if (vatEnabled && vatRate > 0) {
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

    // TOTAL CALCULATION
    const totalAmount = roundMoney(
      pricingMode === "inclusive"
        ? subtotal + directExpenses + commission
        : subtotal +
          taxAmount +
          directExpenses +
          commission
    );

    const totalProfit = roundMoney(
      netAmount -
        totalCost -
        directExpenses -
        commission
    );

    const salesNumber = await generateDocumentNumber("sales");

    // CREATE SALE
    const sale = await Sale.create({
      salesNumber,
      customerId,
      clientPOId,
      saleDate,

      // SALES ALWAYS START AS DRAFT
      status: "draft",

      items: calculatedItems,

      subtotal,

      taxRate: vatRate,
      taxAmount,
      pricingMode,
      netAmount,

      directExpenses,
      commission,
      totalAmount,
      totalCost,
      totalProfit,
      createdBy: req.user._id,
    });

    // CREATE NOTIFICATION
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

    if (sale.status === "released") {
      return res.status(400).json({
        success: false,
        message: "Released sale cannot be modified",
      });
    }

    if (sale.status === "cancelled") {
      return res.status(400).json({
        success: false,
        message: "Cancelled sale cannot be modified",
      });
    }

    const {
      customerId,
      clientPOId,
      saleDate,
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

      for (const item of items) {
        if (!item.supplierId) continue;

        const supplier = await Supplier.findById(item.supplierId)
          .select("status");

        if (!supplier) {
          return res.status(404).json({
            success: false,
            message: `Supplier not found: ${item.supplierId}`,
          });
        }

        if (supplier.status !== "active") {
          return res.status(400).json({
            success: false,
            message: "Inactive supplier cannot be used for a sale",
          });
        }
      }
    }

    // UPDATE BASIC FIELDS
    if (customerId !== undefined) {
      sale.customerId = customerId;
    }

    if (clientPOId !== undefined) {
      sale.clientPOId = clientPOId;
    }

    if (saleDate !== undefined) {
      sale.saleDate = saleDate;
    }

    // UPDATE EXPENSES ONLY WHEN EXPLICITLY PROVIDED
    if (directExpenses !== undefined) {
      sale.directExpenses = directExpenses;
    }

    // UPDATE COMMISSION ONLY WHEN EXPLICITLY PROVIDED
    if (commission !== undefined) {
      sale.commission = commission;
    }

    // RECALCULATE ITEM TOTALS WHEN ITEMS ARE PROVIDED
    if (items !== undefined) {
      const calculatedItems = [];

      for (const item of items) {
        const { unitCost, source } = await resolveProductCost({
          productId: item.productId,
          supplierId: item.supplierId,
        });

        const { unitId, unitCode } = await resolveProductUnit(
          item.productId,
        );

        const profit =
          (Number(item.unitPrice) - unitCost) *
          Number(item.quantity);

        calculatedItems.push({
          ...item,
          unitCost,
          costSource: source,
          unitId,
          unitCode,
          profit,
        });
      }

      const subtotal = roundMoney(
        calculatedItems.reduce(
          (total, item) =>
            total + item.quantity * item.unitPrice,
          0,
        ),
      );

      const totalCost = roundMoney(
        calculatedItems.reduce(
          (total, item) =>
            total + item.quantity * item.unitCost,
          0,
        ),
      );

      sale.items = calculatedItems;
      sale.subtotal = subtotal;
      sale.totalCost = totalCost;
    }

    // RECALCULATE VAT USING THE SALE'S EXISTING TAX SNAPSHOT
    let netAmount = sale.subtotal;
    let taxAmount = 0;

    if (sale.taxRate > 0) {
      if (sale.pricingMode === "inclusive") {
        netAmount =
          sale.subtotal / (1 + sale.taxRate / 100);

        taxAmount =
          sale.subtotal - netAmount;
      } else {
        netAmount = sale.subtotal;

        taxAmount =
          sale.subtotal * (sale.taxRate / 100);
      }
    }

    sale.netAmount = roundMoney(netAmount);
    sale.taxAmount = roundMoney(taxAmount);

    // RECALCULATE TOTAL AMOUNT
    sale.totalAmount = roundMoney(
      sale.pricingMode === "inclusive"
        ? sale.subtotal +
          sale.directExpenses +
          sale.commission
        : sale.subtotal +
          sale.taxAmount +
          sale.directExpenses +
          sale.commission,
    );

    // RECALCULATE PROFIT USING NET SALES
    sale.totalProfit = roundMoney(
      sale.netAmount -
        sale.totalCost -
        sale.directExpenses -
        sale.commission,
    );

    // STATUS REMAINS DRAFT
    sale.status = "draft";

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

    const lowStockChecks = [];

    const settings = await Settings.findOne()
      .select(
        "inventory.allowNegativeStock inventory.autoDeductStockOnSale"
      )
      .session(session);

    const autoDeductStock =
      settings?.inventory?.autoDeductStockOnSale !== false;

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

    // CANCELLED SALES CANNOT BE RELEASED
    if (sale.status === "cancelled") {
      await session.abortTransaction();

      return res.status(400).json({
        success: false,
        message: "Cancelled sale cannot be released",
      });
    }

    // VALIDATE CLIENT PO SOURCE
    if (sale.clientPOId) {
      const clientPO = await ClientPO.findById(sale.clientPOId)
        .session(session);

      await validateClientPOSource({
        sale,
        clientPO,
        session,
      });
    }

    // CHECK STOCK FIRST
    if (autoDeductStock) {
      for (const item of sale.items) {
        const product = await Product.findById(item.productId).session(
          session
        );

        if (!product) {
          await session.abortTransaction();

          return res.status(404).json({
            success: false,
            message: `Product not found: ${item.productId}`,
          });
        }

        if (
          product.currentStock < item.quantity &&
          settings?.inventory?.allowNegativeStock !== true
        ) {
          await session.abortTransaction();

          return res.status(400).json({
            success: false,
            message: `Insufficient stock for ${product.name}. Available: ${product.currentStock}, Required: ${item.quantity}`,
          });
        }
      }
    }

    // DEDUCT STOCK + CREATE INVENTORY MOVEMENTS
    if (autoDeductStock) {
      for (const item of sale.items) {
        const product = await Product.findById(item.productId).session(
          session
        );

        const previousStock = product.currentStock;

        product.currentStock -= item.quantity;

        const newStock = product.currentStock;

        lowStockChecks.push({
          productId: product._id,
          previousStock,
          newStock,
        });

        await product.save({ session });

        await InventoryMovement.create(
          [
            {
              productId: item.productId,
              type: "OUT",
              quantity: item.quantity,
              unitId: item.unitId,
              unitCode: item.unitCode,
              unitCost: item.unitCost,
              referenceType: "SALE",
              referenceId: sale._id,
              date: sale.saleDate,
              notes: `Released ${item.quantity} ${item.unitCode} of ${product.name}`,
              createdBy: req.user._id,
            },
          ],
          { session }
        );
      }
    }

    // UPDATE SALE STATUS
    sale.status = "released";
    sale.updatedBy = req.user._id;

    await sale.save({ session });

    // CREATE SYSTEM ACCOUNTING JOURNAL ENTRY
    await createSaleJournalEntry({
      session,
      sale,
      createdBy: req.user._id,
    });

    // UPDATE CLIENT PO FULFILLMENT STATUS
    if (sale.clientPOId) {
      await updateClientPOFulfillmentStatus({
        clientPOId: sale.clientPOId,
        session,
      });
    }

    // COMMIT TRANSACTION
    await session.commitTransaction();

    // POST-COMMIT: LOW STOCK NOTIFICATIONS
    for (const check of lowStockChecks) {
      try {
        await checkAndCreateLowStockNotification(check);
      } catch (notificationError) {
        console.error(
          "Failed to create low-stock notification:",
          notificationError
        );
      }
    }

    // GET UPDATED SALE
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
      message: "Sale released successfully",
      sale: populatedSale,
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


module.exports = {
  getSales,
  getSaleById,
  createSale,
  updateSale,
  deleteSale,
  releaseSale,
};

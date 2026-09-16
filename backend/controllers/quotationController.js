const Quotation = require("../models/Quotation");
const Customer = require("../models/Customer");
const Product = require("../models/Product");
const Supplier = require("../models/Supplier");
const Settings = require("../models/Settings");

const {
  generateQuotationPDF,
} = require("../services/pdfService");

const { resolveProductCost } = require("../services/pricingService");

const { resolveProductUnit } = require("../services/unitService");

const { checkReferencesExist } = require("../utils/referenceValidator");

const {
  createNotificationsForRoles,
} = require("../services/notificationService");

const { generateDocumentNumber } = require("../services/documentNumberService");

const calculateQuotationTotals = ({
  items,
  laborCost = 0,
  otherDirectCosts = 0,
  taxRate = 0,
  pricingMode = "inclusive",
}) => {
  const calculatedItems = items.map((item) => {
    const quantity = Number(item.quantity);
    const supplierCost = Number(item.supplierCostAtQuotation);
    const quotedUnitPrice = Number(item.quotedUnitPrice);

    if (
      !Number.isFinite(quantity) ||
      !Number.isFinite(supplierCost) ||
      !Number.isFinite(quotedUnitPrice)
    ) {
      const error = new Error("Quotation item contains invalid numeric values");

      error.statusCode = 400;

      throw error;
    }

    const markup = quotedUnitPrice - supplierCost;

    return {
      ...(item.toObject?.() ?? item),
      quantity,
      supplierCostAtQuotation: supplierCost,
      quotedUnitPrice,
      markup,
    };
  });

  const safeLaborCost = Number(laborCost);
  const safeOtherDirectCosts = Number(otherDirectCosts);
  const safeTaxRate = Number(taxRate);

  if (
    !Number.isFinite(safeLaborCost) ||
    !Number.isFinite(safeOtherDirectCosts) ||
    !Number.isFinite(safeTaxRate)
  ) {
    const error = new Error("Quotation financial values must be valid numbers");

    error.statusCode = 400;

    throw error;
  }

  if (safeTaxRate < 0 || safeTaxRate > 100) {
    const error = new Error("Quotation tax rate must be between 0 and 100");

    error.statusCode = 400;

    throw error;
  }

  const subtotal = calculatedItems.reduce(
    (total, item) => total + item.quantity * item.quotedUnitPrice,
    0,
  );

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

  netAmount = Number(netAmount.toFixed(2));
  taxAmount = Number(taxAmount.toFixed(2));

  const total =
    pricingMode === "inclusive" ? taxableAmount : taxableAmount + taxAmount;

  return {
    calculatedItems,
    subtotal: Number(subtotal.toFixed(2)),
    taxRate: safeTaxRate,
    taxAmount,
    pricingMode,
    netAmount,
    total: Number(total.toFixed(2)),
  };
};

const applySupplierPricing = async (items) => {
  const calculatedItems = [];

  for (const item of items) {
    const { unitCost, source } = await resolveProductCost({
      productId: item.productId,
      supplierId: item.supplierId,
    });

    const { unitId, unitCode } = await resolveProductUnit(item.productId);

    calculatedItems.push({
      ...item,
      supplierCostAtQuotation: unitCost,
      costSource: source,
      unitId,
      unitCode,
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
      .populate("items.unitId", "code name")
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
      .populate("items.productId", "sku name")
      .populate("items.unitId", "code name");

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
        "Cannot create Quotation for an inactive customer",
      );
      error.statusCode = 400;
      throw error;
    }

    // PRODUCTS
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
      const error = new Error("Cannot add inactive product to Quotation");
      error.statusCode = 400;
      throw error;
    }

    // SUPPLIERS
    const supplierIds = items.map((item) => item.supplierId).filter(Boolean);

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
        (supplier) => supplier.status !== "active",
      );

      if (inactiveSupplier) {
        const error = new Error(
          "Cannot assign an inactive supplier to Quotation",
        );
        error.statusCode = 400;
        throw error;
      }
    }

    // TAX CONFIGURATION SNAPSHOT
    const settings = await Settings.findOne().select("accountingTax");

    const vatEnabled = settings?.accountingTax?.vatEnabled === true;

    const taxRate = vatEnabled
      ? Number(settings?.accountingTax?.vatRate || 0)
      : 0;

    const pricingMode = settings?.accountingTax?.pricingMode || "inclusive";

    const itemsWithSupplierPricing = await applySupplierPricing(items);

    const {
      calculatedItems,
      subtotal,
      taxRate: calculatedTaxRate,
      taxAmount,
      pricingMode: calculatedPricingMode,
      netAmount,
      total,
    } = calculateQuotationTotals({
      items: itemsWithSupplierPricing,
      laborCost,
      otherDirectCosts,
      taxRate,
      pricingMode,
    });

    // GENERATE DOCUMENT NUMBER
    const quotationNumber = await generateDocumentNumber("quotation");

    const quotation = await Quotation.create({
      ...quotationData,
      quotationNumber,
      customerId,
      items: calculatedItems,
      laborCost,
      otherDirectCosts,

      subtotal,
      taxRate: calculatedTaxRate,
      taxAmount,
      pricingMode: calculatedPricingMode,
      netAmount,
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
          quotation.quotationNumber,
        )}`,
        entityType: "Quotation",
        entityId: quotation._id,
      });
    } catch (notificationError) {
      console.error(
        "Failed to create quotation notification:",
        notificationError,
      );
    }

    const populatedQuotation = await Quotation.findById(quotation._id)
      .populate("customerId", "customerCode name")
      .populate("createdBy", "firstName lastName email")
      .populate("items.productId", "sku name")
      .populate("items.unitId", "code name");
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
          "Cannot assign Quotation to an inactive customer",
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
        const error = new Error("Cannot add inactive product to Quotation");
        error.statusCode = 400;
        throw error;
      }

      const supplierIds = items.map((item) => item.supplierId).filter(Boolean);

      if (supplierIds.length > 0) {
        const suppliers = await Supplier.find({
          _id: { $in: supplierIds },
        }).select("_id status");

        if (
          suppliers.length !==
          new Set(supplierIds.map(String)).size
        ) {
          const error = new Error("One or more suppliers not found");
          error.statusCode = 400;
          throw error;
        }

        const inactiveSupplier = suppliers.find(
          (supplier) => supplier.status !== "active",
        );

        if (inactiveSupplier) {
          const error = new Error(
            "Cannot assign an inactive supplier to Quotation",
          );
          error.statusCode = 400;
          throw error;
        }
      }

      const itemsWithSupplierPricing = await applySupplierPricing(items);

      quotation.items = itemsWithSupplierPricing;
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
    // USING EXISTING TAX SNAPSHOT
    // =========================

    const {
      calculatedItems,
      subtotal,
      taxRate,
      taxAmount,
      pricingMode,
      netAmount,
      total,
    } = calculateQuotationTotals({
      items: quotation.items,
      laborCost: quotation.laborCost,
      otherDirectCosts: quotation.otherDirectCosts,
      taxRate: quotation.taxRate,
      pricingMode: quotation.pricingMode,
    });

    quotation.items = calculatedItems;
    quotation.subtotal = subtotal;
    quotation.taxRate = taxRate;
    quotation.taxAmount = taxAmount;
    quotation.pricingMode = pricingMode;
    quotation.netAmount = netAmount;
    quotation.total = total;
    quotation.updatedBy = req.user._id;

    await quotation.save();

    // =========================
    // POPULATE RESPONSE
    // =========================

    const populatedQuotation = await Quotation.findById(quotation._id)
      .populate("customerId", "customerCode name")
      .populate("createdBy", "firstName lastName email")
      .populate("updatedBy", "firstName lastName email")
      .populate("items.productId", "sku name")
      .populate("items.unitId", "code name");

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



// EXPORT QUOTATION PDF
const exportQuotationPDF = async (req, res, next) => {
  try {
    const quotation = await Quotation.findById(req.params.id)
      .populate("customerId", "customerCode name")
      .populate("createdBy", "firstName lastName email")
      .populate("items.productId", "sku name")
      .populate("items.unitId", "code name");

    if (!quotation) {
      return res.status(404).json({
        success: false,
        message: "Quotation not found",
      });
    }

    const settings = await Settings.findOne();

    if (!settings) {
      return res.status(404).json({
        success: false,
        message: "Settings not found",
      });
    }

    return generateQuotationPDF({
      quotation,
      settings,
      res,
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
  exportQuotationPDF,
};

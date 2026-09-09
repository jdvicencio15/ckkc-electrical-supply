const ClientPO = require("../models/ClientPO");

const Customer = require("../models/Customer");
const Quotation = require("../models/Quotation");
const Product = require("../models/Product");
const SupplierPO = require("../models/SupplierPO");
const Purchase = require("../models/Purchase");

const {
  checkReferencesExist,
} = require("../utils/referenceValidator");

const {
  generateDocumentNumber,
} = require("../services/documentNumberService");

// CLIENT PO STATE TRANSITIONS
const CLIENT_PO_STATE_TRANSITIONS = {
  draft: ["received", "cancelled"],
  received: ["processing", "cancelled"],
  processing: ["fulfilled", "cancelled"],
  fulfilled: [],
  cancelled: [],
};

// GET ALL CLIENT POs
const getClientPOs = async (req, res, next) => {
  try {
    const clientPOs = await ClientPO.find()
      .populate("customerId", "customerCode name")
      .populate("quotationId", "quotationNumber")
      .populate("items.productId", "sku name unit")
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

// GET SINGLE CLIENT PO
const getClientPOById = async (req, res, next) => {
  try {
    const clientPO = await ClientPO.findById(req.params.id)
      .populate("customerId", "customerCode name")
      .populate("quotationId", "quotationNumber")
      .populate("items.productId", "sku name unit")
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

// CREATE CLIENT PO

const createClientPO = async (req, res, next) => {
  try {
   const {
  items,
  customerId,
  quotationId,
  status,
  ...clientPOData
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
        "Cannot create Client PO for an inactive customer"
      );
      error.statusCode = 400;
      throw error;
    }

    // QUOTATION
    if (quotationId !== undefined) {
      const quotation = await Quotation.findById(quotationId);

      if (!quotation) {
        const error = new Error("Quotation not found");
        error.statusCode = 400;
        throw error;
      }

      if (quotation.status !== "accepted") {
        const error = new Error(
          "Client PO can only reference an accepted quotation"
        );
        error.statusCode = 400;
        throw error;
      }

      if (
        quotation.customerId.toString() !==
        customerId.toString()
      ) {
        const error = new Error(
          "Quotation does not belong to the selected customer"
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
        "Cannot add inactive product to Client PO"
      );
      error.statusCode = 400;
      throw error;
    }

    // COMPUTE TOTAL ON BACKEND
    const totalAmount = items.reduce(
      (total, item) =>
        total + item.quantity * item.agreedUnitPrice,
      0
    );
    const poNumber = await generateDocumentNumber("clientPO");

 const clientPO = await ClientPO.create({
  ...clientPOData,
  poNumber,
  customerId,
  quotationId,
  items,
  totalAmount,
  status: "received",
  createdBy: req.user._id,
});

    const populatedClientPO =
      await ClientPO.findById(clientPO._id)
        .populate("customerId", "customerCode name")
        .populate("quotationId", "quotationNumber")
        .populate("items.productId", "sku name unit")
        .populate("createdBy", "firstName lastName");

    res.status(201).json({
      success: true,
      clientPO: populatedClientPO,
    });
  } catch (error) {
    next(error);
  }
};

// UPDATE CLIENT PO
const updateClientPO = async (req, res, next) => {
  try {
    const clientPO = await ClientPO.findById(req.params.id);

    if (!clientPO) {
      return res.status(404).json({
        success: false,
        message: "Client PO not found",
      });
    }
     const TERMINAL_CLIENT_PO_STATUSES = [
      "fulfilled",
      "cancelled",
    ];

    if (TERMINAL_CLIENT_PO_STATUSES.includes(clientPO.status)) {
      const error = new Error(
        `Cannot modify a ${clientPO.status} Client PO`
      );
      error.statusCode = 400;
      throw error;
    }


    const {
      customerId,
      quotationId,
      poDate,
      status,
      items,
    } = req.body;

    // PO NUMBER IS IMMUTABLE
    // poNumber is intentionally not handled here.

    // DETERMINE FINAL REFERENCES
    const nextCustomerId =
      customerId !== undefined
        ? customerId
        : clientPO.customerId;

    const nextQuotationId =
      quotationId !== undefined
        ? quotationId
        : clientPO.quotationId;

    // CUSTOMER
    if (customerId !== undefined) {
      const customer = await Customer.findById(customerId);

      if (!customer) {
        const error = new Error("Customer not found");
        error.statusCode = 400;
        throw error;
      }

      if (customer.status !== "active") {
        const error = new Error(
          "Cannot assign Client PO to an inactive customer"
        );
        error.statusCode = 400;
        throw error;
      }
    }


    // REVALIDATE QUOTATION + CUSTOMER RELATIONSHIP
    if (nextQuotationId) {
      const quotation = await Quotation.findById(
        nextQuotationId
      );

      if (!quotation) {
        const error = new Error("Quotation not found");
        error.statusCode = 400;
        throw error;
      }

      if (quotation.status !== "accepted") {
        const error = new Error(
          "Client PO can only reference an accepted quotation"
        );
        error.statusCode = 400;
        throw error;
      }

      if (
        quotation.customerId.toString() !==
        nextCustomerId.toString()
      ) {
        const error = new Error(
          "Quotation does not belong to the selected customer"
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
          "Cannot add inactive product to Client PO"
        );
        error.statusCode = 400;
        throw error;
      }
    }

    // STATE TRANSITION
    if (
      status !== undefined &&
      status !== clientPO.status
    ) {
      const allowedTransitions =
        CLIENT_PO_STATE_TRANSITIONS[
          clientPO.status
        ] || [];

      if (!allowedTransitions.includes(status)) {
        const error = new Error(
          `Invalid Client PO state transition: ${clientPO.status} → ${status}`
        );
        error.statusCode = 400;
        throw error;
      }
    }

    // UPDATE FIELDS
    if (customerId !== undefined) {
      clientPO.customerId = customerId;
    }

    if (quotationId !== undefined) {
      clientPO.quotationId = quotationId;
    }

    if (poDate !== undefined) {
      clientPO.poDate = poDate;
    }

    if (status !== undefined) {
      clientPO.status = status;
    }

    if (items !== undefined) {
      clientPO.items = items;

      clientPO.totalAmount = items.reduce(
        (total, item) =>
          total +
          item.quantity * item.agreedUnitPrice,
        0
      );
    }

    clientPO.updatedBy = req.user._id;

    await clientPO.save();

    const populatedClientPO =
      await ClientPO.findById(clientPO._id)
        .populate("customerId", "customerCode name")
        .populate("quotationId", "quotationNumber")
        .populate("items.productId", "sku name unit")
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

// DELETE CLIENT PO
const deleteClientPO = async (req, res, next) => {
  try {
    const clientPO = await ClientPO.findById(req.params.id);

    if (!clientPO) {
      return res.status(404).json({
        success: false,
        message: "Client PO not found",
      });
    }


    // ONLY DRAFT CLIENT POs CAN BE DELETED
    if (clientPO.status !== "draft") {
      const error = new Error(
        "Only draft Client POs can be deleted"
      );
      error.statusCode = 400;
      throw error;
    }

    // CHECK SUPPLIER PO REFERENCE
    const supplierPOExists = await SupplierPO.exists({
      relatedClientPOId: clientPO._id,
    });

    if (supplierPOExists) {
      const error = new Error(
        "Cannot delete Client PO because it is referenced by a Supplier PO"
      );
      error.statusCode = 400;
      throw error;
    }

    // CHECK PURCHASE REFERENCE
    const purchaseExists = await Purchase.exists({
      relatedClientPOId: clientPO._id,
    });

    if (purchaseExists) {
      const error = new Error(
        "Cannot delete Client PO because it is referenced by a Purchase"
      );
      error.statusCode = 400;
      throw error;
    }

    await clientPO.deleteOne();

    res.status(200).json({
      success: true,
      message: "Client PO deleted successfully",
    });
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
const ClientPO = require("../models/ClientPO");

const Customer = require("../models/Customer");
const Quotation = require("../models/Quotation");
const Product = require("../models/Product");

const {
  checkReferenceExists,
  checkReferencesExist,
} = require("../utils/referenceValidator");

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
      ...clientPOData
    } = req.body;

    await checkReferenceExists(
      Customer,
      customerId,
      "Customer"
    );

    await checkReferenceExists(
      Quotation,
      quotationId,
      "Quotation"
    );

    await checkReferencesExist(
      Product,
      items.map((item) => item.productId),
      "Product"
    );

    // Compute totalAmount on the backend
    const totalAmount = items.reduce(
      (total, item) =>
        total + item.quantity * item.agreedUnitPrice,
      0
    );

    const clientPO = await ClientPO.create({
      ...clientPOData,
      customerId,
      quotationId,
      items,
      totalAmount,
      createdBy: req.user._id,
    });

    const populatedClientPO =
      await ClientPO.findById(clientPO._id)
        .populate(
          "customerId",
          "customerCode name"
        )
        .populate(
          "quotationId",
          "quotationNumber"
        )
        .populate(
          "items.productId",
          "sku name unit"
        )
        .populate(
          "createdBy",
          "firstName lastName"
        );

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

    const {
      poNumber,
      customerId,
      quotationId,
      poDate,
      status,
      items,
    } = req.body;

    // CHECK UPDATED REFERENCES
    if (customerId !== undefined) {
      await checkReferenceExists(
        Customer,
        customerId,
        "Customer"
      );
    }

    if (quotationId !== undefined) {
      await checkReferenceExists(
        Quotation,
        quotationId,
        "Quotation"
      );
    }

    if (items !== undefined) {
      await checkReferencesExist(
        Product,
        items.map((item) => item.productId),
        "Product"
      );
    }

    // UPDATE FIELDS
    if (poNumber !== undefined) {
      clientPO.poNumber = poNumber;
    }

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
        .populate(
          "customerId",
          "customerCode name"
        )
        .populate(
          "quotationId",
          "quotationNumber"
        )
        .populate(
          "items.productId",
          "sku name unit"
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
      clientPO: populatedClientPO,
    });
  } catch (error) {
    next(error);
  }
};

// DELETE CLIENT PO
const deleteClientPO = async (req, res, next) => {
  try {
    const clientPO = await ClientPO.findByIdAndDelete(req.params.id);

    if (!clientPO) {
      return res.status(404).json({
        success: false,
        message: "Client PO not found",
      });
    }

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
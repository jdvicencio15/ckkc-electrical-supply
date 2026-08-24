const ClientPO = require("../models/ClientPO");
const Product = require("../models/Product");

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
    const { items } = req.body;

    // Validate that all referenced products exist
    const productIds = items.map((item) => item.productId);

    const existingProducts = await Product.find({
      _id: { $in: productIds },
    }).select("_id");

    const existingProductIds = new Set(
      existingProducts.map((product) => product._id.toString())
    );

    const missingProduct = productIds.find(
      (productId) => !existingProductIds.has(productId.toString())
    );

    if (missingProduct) {
      return res.status(400).json({
        success: false,
        message: `Product not found: ${missingProduct}`,
      });
    }

    // Compute totalAmount on the backend
    const totalAmount = items.reduce(
      (total, item) =>
        total + item.quantity * item.agreedUnitPrice,
      0
    );

    const clientPO = await ClientPO.create({
      ...req.body,
      totalAmount,
      createdBy: req.user._id,
    });

    const populatedClientPO = await ClientPO.findById(clientPO._id)
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
    const clientPO = await ClientPO.findByIdAndUpdate(
      req.params.id,
      {
        ...req.body,
        updatedBy: req.user._id,
      },
      {
        new: true,
        runValidators: true,
      }
    )
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
const Commission = require("../models/Commission");

// GET ALL COMMISSIONS
const getCommissions = async (req, res, next) => {
  try {
    const commissions = await Commission.find()
      .populate("clientPOId", "poNumber totalAmount")
      .populate("saleId", "salesNumber totalAmount")
      .populate("createdBy", "firstName lastName")
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      count: commissions.length,
      commissions,
    });
  } catch (error) {
    next(error);
  }
};

// GET SINGLE COMMISSION
const getCommissionById = async (req, res, next) => {
  try {
    const commission = await Commission.findById(req.params.id)
      .populate("clientPOId", "poNumber totalAmount")
      .populate("saleId", "salesNumber totalAmount")
      .populate("createdBy", "firstName lastName");

    if (!commission) {
      return res.status(404).json({
        success: false,
        message: "Commission not found",
      });
    }

    res.status(200).json({
      success: true,
      commission,
    });
  } catch (error) {
    next(error);
  }
};

// CREATE COMMISSION
const createCommission = async (req, res, next) => {
  try {
    const {
      clientPOId,
      saleId,
      rate = 5,
      baseAmount,
    } = req.body;

    const commissionAmount =
      baseAmount * (rate / 100);

    const commission = await Commission.create({
      clientPOId,
      saleId,
      rate,
      baseAmount,
      commissionAmount,
      createdBy: req.user._id,
    });

    const populatedCommission =
      await Commission.findById(commission._id)
        .populate(
          "clientPOId",
          "poNumber totalAmount"
        )
        .populate(
          "saleId",
          "salesNumber totalAmount"
        )
        .populate(
          "createdBy",
          "firstName lastName"
        );

    res.status(201).json({
      success: true,
      commission: populatedCommission,
    });
  } catch (error) {
    next(error);
  }
};

// UPDATE COMMISSION
const updateCommission = async (req, res, next) => {
  try {
    const commission = await Commission.findByIdAndUpdate(
      req.params.id,
      req.body,
      {
        new: true,
        runValidators: true,
      }
    )
      .populate("clientPOId", "poNumber totalAmount")
      .populate("saleId", "salesNumber totalAmount")
      .populate("createdBy", "firstName lastName");

    if (!commission) {
      return res.status(404).json({
        success: false,
        message: "Commission not found",
      });
    }

    res.status(200).json({
      success: true,
      commission,
    });
  } catch (error) {
    next(error);
  }
};

// DELETE COMMISSION
const deleteCommission = async (req, res, next) => {
  try {
    const commission = await Commission.findByIdAndDelete(
      req.params.id
    );

    if (!commission) {
      return res.status(404).json({
        success: false,
        message: "Commission not found",
      });
    }

    res.status(200).json({
      success: true,
      message: "Commission deleted successfully",
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getCommissions,
  getCommissionById,
  createCommission,
  updateCommission,
  deleteCommission,
};
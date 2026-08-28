const Commission = require("../models/Commission");

const ClientPO = require("../models/ClientPO");
const Sale = require("../models/Sale");

// GET ALL COMMISSIONS
const getCommissions = async (req, res, next) => {
  try {
    const commissions = await Commission.find()
      .populate("clientPOId", "poNumber totalAmount")
      .populate("saleId", "salesNumber totalAmount")
      .populate("createdBy", "firstName lastName")
      .populate("updatedBy", "firstName lastName")
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
      .populate("createdBy", "firstName lastName")
      .populate("updatedBy", "firstName lastName");

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
  rate: requestedRate,
  baseAmount,
} = req.body;

const rate =
  req.user.role === "owner" || req.user.role === "admin"
    ? requestedRate ?? 5
    : 5;

    // Validate Client PO reference
    if (clientPOId) {
      const clientPO = await ClientPO.findById(clientPOId);

      if (!clientPO) {
        return res.status(404).json({
          success: false,
          message: "Client PO not found",
        });
      }
    }

    // Validate Sale reference
    if (saleId) {
      const sale = await Sale.findById(saleId);

      if (!sale) {
        return res.status(404).json({
          success: false,
          message: "Sale not found",
        });
      }
    }

    // Calculate commission server-side
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
        )
        .populate(
          "updatedBy",
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
    const commission = await Commission.findById(req.params.id);

    if (!commission) {
      return res.status(404).json({
        success: false,
        message: "Commission not found",
      });
    }

  const {
  clientPOId,
  saleId,
  baseAmount,
} = req.body;

    // Validate Client PO reference
    if (clientPOId !== undefined) {
      const clientPO = await ClientPO.findById(clientPOId);

      if (!clientPO) {
        return res.status(404).json({
          success: false,
          message: "Client PO not found",
        });
      }

      commission.clientPOId = clientPOId;
    }

    // Validate Sale reference
    if (saleId !== undefined) {
      const sale = await Sale.findById(saleId);

      if (!sale) {
        return res.status(404).json({
          success: false,
          message: "Sale not found",
        });
      }

      commission.saleId = saleId;
    }

    if (baseAmount !== undefined) {
      commission.baseAmount = baseAmount;
    }

    // Ensure commission has a valid reference
    if (!commission.clientPOId && !commission.saleId) {
      return res.status(400).json({
        success: false,
        message:
          "Commission must reference a client PO or sale",
      });
    }

    // Recalculate commission amount
    commission.commissionAmount =
      commission.baseAmount *
      (commission.rate / 100);

    // Record who updated the commission
    commission.updatedBy = req.user._id;

    await commission.save();

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
        )
        .populate(
          "updatedBy",
          "firstName lastName"
        );

    res.status(200).json({
      success: true,
      commission: populatedCommission,
    });
  } catch (error) {
    next(error);
  }
};

// UPDATE COMMISSION RATE
const updateCommissionRate = async (req, res, next) => {
  try {
    const commission = await Commission.findById(req.params.id);

    if (!commission) {
      return res.status(404).json({
        success: false,
        message: "Commission not found",
      });
    }

    const { rate } = req.body;

    // Update commission rate
    commission.rate = rate;

    // Recalculate commission amount
    commission.commissionAmount =
      commission.baseAmount *
      (commission.rate / 100);

    // Record who updated the rate
    commission.updatedBy = req.user._id;

    await commission.save();

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
        )
        .populate(
          "updatedBy",
          "firstName lastName"
        );

    res.status(200).json({
      success: true,
      message: "Commission rate updated successfully",
      commission: populatedCommission,
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
  updateCommissionRate,
  deleteCommission,
};
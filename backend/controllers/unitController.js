const Unit = require("../models/Unit");
const Product = require("../models/Product");

// GET ALL UNITS
const getUnits = async (req, res, next) => {
  try {
    const units = await Unit.find().sort({ code: 1 });

    res.status(200).json({
      success: true,
      count: units.length,
      units,
    });
  } catch (error) {
    next(error);
  }
};

// GET ACTIVE UNITS
// Used by Product forms when selecting a UOM.
const getActiveUnits = async (req, res, next) => {
  try {
    const units = await Unit.find({
      status: "active",
    }).sort({ code: 1 });

    res.status(200).json({
      success: true,
      count: units.length,
      units,
    });
  } catch (error) {
    next(error);
  }
};

// GET SINGLE UNIT
const getUnitById = async (req, res, next) => {
  try {
    const unit = await Unit.findById(req.params.id);

    if (!unit) {
      return res.status(404).json({
        success: false,
        message: "Unit not found",
      });
    }

    res.status(200).json({
      success: true,
      unit,
    });
  } catch (error) {
    next(error);
  }
};

// CREATE UNIT
const createUnit = async (req, res, next) => {
  try {
    const unit = await Unit.create(req.body);

    res.status(201).json({
      success: true,
      unit,
    });
  } catch (error) {
    next(error);
  }
};

// UPDATE UNIT
const updateUnit = async (req, res, next) => {
  try {
    const unit = await Unit.findById(req.params.id);

    if (!unit) {
      return res.status(404).json({
        success: false,
        message: "Unit not found",
      });
    }

    Object.assign(unit, req.body);

    await unit.save();

    res.status(200).json({
      success: true,
      unit,
    });
  } catch (error) {
    next(error);
  }
};

// DELETE UNIT
const deleteUnit = async (req, res, next) => {
  try {
    const unit = await Unit.findById(req.params.id);

    if (!unit) {
      return res.status(404).json({
        success: false,
        message: "Unit not found",
      });
    }

    // A Unit that is already assigned to a Product
    // must never be physically deleted.
    const productUsingUnit = await Product.exists({
      unitId: unit._id,
    });

    if (productUsingUnit) {
      return res.status(409).json({
        success: false,
        message:
          "This unit is already used by one or more products and cannot be deleted. Set it to inactive instead.",
      });
    }

    await unit.deleteOne();

    res.status(200).json({
      success: true,
      message: "Unit deleted successfully",
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getUnits,
  getActiveUnits,
  getUnitById,
  createUnit,
  updateUnit,
  deleteUnit,
};
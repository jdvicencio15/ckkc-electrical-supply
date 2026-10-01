const AuditTrail = require("../models/AuditTrail");

const getAuditTrails = async (req, res, next) => {
  try {
    const {
      page = 1,
      limit = 20,
      action,
      entity,
      userId,
      search,
      startDate,
      endDate,
    } = req.query;

    const filter = {};

    if (action) {
      filter.action = action;
    }

    if (entity) {
      filter.entity = entity;
    }

    if (userId) {
      filter.userId = userId;
    }

    if (search) {
      filter.$or = [
        {
          description: {
            $regex: search,
            $options: "i",
          },
        },
        {
          documentNumber: {
            $regex: search,
            $options: "i",
          },
        },
        {
          userName: {
            $regex: search,
            $options: "i",
          },
        },
      ];
    }

    if (startDate || endDate) {
      filter.createdAt = {};

      if (startDate) {
        filter.createdAt.$gte = new Date(startDate);
      }

      if (endDate) {
        const end = new Date(endDate);
        end.setHours(23, 59, 59, 999);
        filter.createdAt.$lte = end;
      }
    }

    const pageNumber = Math.max(parseInt(page, 10) || 1, 1);
    const limitNumber = Math.min(
      Math.max(parseInt(limit, 10) || 20, 1),
      100
    );

    const skip = (pageNumber - 1) * limitNumber;

    const [auditTrails, total] = await Promise.all([
      AuditTrail.find(filter)
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limitNumber)
        .lean(),

      AuditTrail.countDocuments(filter),
    ]);

    res.status(200).json({
      success: true,
      data: auditTrails,
      pagination: {
        page: pageNumber,
        limit: limitNumber,
        total,
        totalPages: Math.ceil(total / limitNumber),
      },
    });
  } catch (error) {
    next(error);
  }
};

const getAuditTrailById = async (req, res, next) => {
  try {
    const auditTrail = await AuditTrail.findById(req.params.id).lean();

    if (!auditTrail) {
      return res.status(404).json({
        success: false,
        message: "Audit trail not found",
      });
    }

    res.status(200).json({
      success: true,
      data: auditTrail,
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getAuditTrails,
  getAuditTrailById,
};
const logger = require("../utils/logger");

const errorMiddleware = (err, req, res, next) => {
  logger.error("Internal server error");

  res.status(err.statusCode || 500).json({
    success: false,
    message: err.message || "Server Error",
  });
};

module.exports = errorMiddleware;
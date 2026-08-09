
const logger = require("../utils/logger");

const errorMiddleware = (err, req, res, next) => {
  logger.error(err.message || "Internal server error");

  const statusCode = err.statusCode || 500;

  const message =
    process.env.NODE_ENV === "production"
      ? "Something went wrong. Please try again later."
      : err.message || "Server Error";

  res.status(statusCode).json({
    success: false,
    message,
  });
};

module.exports = errorMiddleware;


const logger = require("../utils/logger");

const errorMiddleware = (err, req, res, next) => {
  logger.error(err.stack || err.message || "Internal server error");

  let statusCode = err.statusCode || 500;
  let message = err.message || "Server Error";

  // Mongoose validation error
  if (err.name === "ValidationError") {
    statusCode = 400;
    message = Object.values(err.errors)
      .map((error) => error.message)
      .join(", ");
  }

  // Invalid MongoDB ObjectId
  if (err.name === "CastError") {
    statusCode = 400;
    message = "Invalid resource ID";
  }

  // MongoDB duplicate key error
  if (err.code === 11000) {
    statusCode = 409;
    const field = Object.keys(err.keyPattern || {})[0];
    message = field
      ? `${field} already exists`
      : "Duplicate resource";
  }

  // Never expose unexpected internal errors in production
  if (statusCode >= 500 && process.env.NODE_ENV === "production") {
    message = "Something went wrong. Please try again later.";
  }

  res.status(statusCode).json({
    success: false,
    message,
  });
};

module.exports = errorMiddleware;
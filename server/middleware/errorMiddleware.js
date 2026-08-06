const errorMiddleware = (err, req, res, next) => {
  res.status(res.statusCode || 500).json({
    success: false,
    message: err.message,
  });
};

module.exports = errorMiddleware;
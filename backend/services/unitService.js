const Product = require("../models/Product");

const resolveProductUnit = async (productId) => {
  const product = await Product.findById(productId)
    .populate("unitId", "code name status");

  if (!product) {
    const error = new Error("Product not found");
    error.statusCode = 404;
    throw error;
  }

  if (product.status !== "active") {
    const error = new Error(
      "Cannot resolve unit for an inactive product"
    );
    error.statusCode = 400;
    throw error;
  }

  if (!product.unitId) {
    const error = new Error(
      `Product ${product._id} has no unit assigned`
    );
    error.statusCode = 400;
    throw error;
  }

  if (product.unitId.status !== "active") {
    const error = new Error(
      "Product unit is inactive"
    );
    error.statusCode = 400;
    throw error;
  }

  return {
    unitId: product.unitId._id,
    unitCode: product.unitId.code,
  };
};

module.exports = {
  resolveProductUnit,
};
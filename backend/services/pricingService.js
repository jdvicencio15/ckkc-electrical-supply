const Product = require("../models/Product");
const SupplierPricing = require("../models/SupplierPricing");

const resolveProductCost = async ({
  productId,
  supplierId = null,
}) => {
  const product = await Product.findById(productId)
    .select("_id productCost status");

  if (!product) {
    const error = new Error("Product not found");
    error.statusCode = 404;
    throw error;
  }

  if (product.status !== "active") {
    const error = new Error(
      "Cannot resolve cost for an inactive product",
    );
    error.statusCode = 400;
    throw error;
  }

  if (supplierId) {
    const supplierPricing =
      await SupplierPricing.findOne({
        supplierId,
        productId,
        status: "active",
      }).select("unitCost");

    if (supplierPricing) {
      return {
        unitCost: Number(supplierPricing.unitCost),
        source: "supplier_pricing",
      };
    }
  }

  return {
    unitCost: Number(product.productCost),
    source: "product_cost",
  };
};

module.exports = {
  resolveProductCost,
};
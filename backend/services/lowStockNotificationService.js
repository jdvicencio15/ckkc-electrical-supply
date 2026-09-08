const Product = require("../models/Product");
const {
  createNotificationsForRoles,
} = require("./notificationService");

const checkAndCreateLowStockNotification = async ({
  productId,
  previousStock,
  newStock,
}) => {
  const product = await Product.findById(productId).select(
    "_id sku name unit minimumStock currentStock"
  );

  if (!product) {
    return null;
  }

  const minimumStock = Number(product.minimumStock);

  const wasAboveMinimum =
    Number(previousStock) > minimumStock;

  const isNowLow =
    Number(newStock) <= minimumStock;

  if (!wasAboveMinimum || !isNowLow) {
    return null;
  }

  return createNotificationsForRoles({
    roles: ["owner", "admin", "purchasing"],
    type: "low_stock",
    title: "Low Stock Alert",
    message: `${product.name} (${product.sku}) is low on stock. Current stock: ${newStock} ${product.unit}. Minimum stock: ${minimumStock} ${product.unit}.`,
    link: `/products?search=${encodeURIComponent(product.sku)}`,
    entityType: "Product",
    entityId: product._id,
  });
};

module.exports = {
  checkAndCreateLowStockNotification,
};
const validatePurchaseAgainstSupplierPO = ({
  supplierPO,
  purchaseItems,
}) => {
  if (!supplierPO) {
    return;
  }

  if (
    !Array.isArray(purchaseItems) ||
    purchaseItems.length === 0
  ) {
    const error = new Error(
      "Purchase must contain at least one item",
    );

    error.statusCode = 400;
    throw error;
  }

  const poItems = supplierPO.items || [];

  if (poItems.length !== purchaseItems.length) {
    const error = new Error(
      "Purchase items must exactly match the linked Supplier PO",
    );

    error.statusCode = 400;
    throw error;
  }

  const poItemsMap = new Map();

  for (const item of poItems) {
    const productId = item.productId?.toString();

    if (!productId) {
      const error = new Error(
        "Supplier PO contains an invalid product reference",
      );

      error.statusCode = 400;
      throw error;
    }

    poItemsMap.set(productId, {
      quantity: Number(item.quantity),
      unitId: item.unitId?.toString(),
      unitCode: item.unitCode,
    });
  }

  for (const item of purchaseItems) {
    const productId = item.productId?.toString();

    if (!productId) {
      const error = new Error(
        "Purchase contains an invalid product reference",
      );

      error.statusCode = 400;
      throw error;
    }

    const poItem = poItemsMap.get(productId);

    if (!poItem) {
      const error = new Error(
        "Purchase contains a product that is not included in the Supplier PO",
      );

      error.statusCode = 400;
      throw error;
    }

    const purchaseQuantity = Number(item.quantity);

    if (
      !Number.isFinite(purchaseQuantity) ||
      purchaseQuantity <= 0
    ) {
      const error = new Error(
        "Purchase quantity must be greater than zero",
      );

      error.statusCode = 400;
      throw error;
    }

    if (purchaseQuantity !== poItem.quantity) {
      const error = new Error(
        `Purchase quantity for product ${productId} must match the Supplier PO quantity of ${poItem.quantity}`,
      );

      error.statusCode = 400;
      throw error;
    }
  }
};

module.exports = {
  validatePurchaseAgainstSupplierPO,
};
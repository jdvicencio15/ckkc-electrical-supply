function LowStockAlerts() {
  const lowStockProducts = [
    {
      id: 1,
      name: "Electrical Wire",
      stock: 3,
    },
    {
      id: 2,
      name: "Circuit Breaker",
      stock: 5,
    },
    {
      id: 3,
      name: "LED Bulb",
      stock: 7,
    },
  ];

  return (
    <div className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm">
      <div className="mb-5">
        <h2 className="text-lg font-semibold text-gray-900">
          Low Stock Alerts
        </h2>

        <p className="mt-1 text-sm text-gray-500">
          Products that need attention
        </p>
      </div>

      <div className="space-y-4">
        {lowStockProducts.map((product) => (
          <div
            key={product.id}
            className="flex items-center justify-between rounded-lg bg-gray-50 px-4 py-3"
          >
            <span className="text-sm font-medium text-gray-800">
              {product.name}
            </span>

            <span className="text-sm font-semibold text-gray-600">
              {product.stock} left
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}

export default LowStockAlerts;
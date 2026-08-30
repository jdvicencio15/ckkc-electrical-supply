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
    <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
      <div className="mb-5">
        <h2 className="text-lg font-semibold text-slate-900">
          Low Stock Alerts
        </h2>

        <p className="mt-1 text-sm text-slate-500">
          Products that need attention
        </p>
      </div>

      <div className="space-y-4">
        {lowStockProducts.map((product) => (
          <div
            key={product.id}
            className="flex items-center justify-between rounded-lg bg-slate-50 px-4 py-3"
          >
            <span className="text-sm font-medium text-slate-800">
              {product.name}
            </span>

            <span className="rounded-full bg-red-50 px-2.5 py-1 text-xs font-semibold text-red-600">
              {product.stock} left
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}

export default LowStockAlerts;
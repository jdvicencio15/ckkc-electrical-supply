function LowStockAlerts({ products = [] }) {
  return (
    <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-slate-900">
      <div className="mb-5">
        <h2 className="text-lg font-semibold text-slate-900 dark:text-slate-100">
          Low Stock Alerts
        </h2>

        <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
          Products that need attention
        </p>
      </div>

      {products.length === 0 ? (
        <div className="rounded-lg bg-slate-50 px-4 py-6 text-center dark:bg-slate-800">
          <p className="text-sm text-slate-500 dark:text-slate-400">
            No low stock products.
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {products.map((product) => (
            <div
              key={product._id}
              className="flex items-center justify-between rounded-lg bg-slate-50 px-4 py-3 dark:bg-slate-800"
            >
              <span className="text-sm font-medium text-slate-800 dark:text-slate-200">
                {product.name}
              </span>

              <span className="rounded-full bg-red-50 px-2.5 py-1 text-xs font-semibold text-red-600 dark:bg-red-950/40 dark:text-red-400">
                {product.currentStock} left
              </span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default LowStockAlerts;
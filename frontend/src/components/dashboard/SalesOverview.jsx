function SalesOverview() {
  const salesData = [
    { month: "Jan", sales: 0 },
    { month: "Feb", sales: 0 },
    { month: "Mar", sales: 0 },
    { month: "Apr", sales: 0 },
    { month: "May", sales: 0 },
    { month: "Jun", sales: 0 },
  ];

  return (
    <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
      {/* Header */}
      <div className="mb-6 flex items-start justify-between gap-4">
        <div>
          <h2 className="text-lg font-semibold text-slate-900">
            Sales Overview
          </h2>

          <p className="mt-1 text-sm text-slate-500">
            Monthly sales performance
          </p>
        </div>

        <select
          defaultValue="this-month"
          className="rounded-lg border border-slate-200 bg-white px-3 py-2 text-xs font-medium text-slate-700 outline-none transition focus:border-green-500"
        >
          <option value="this-month">This Month</option>
          <option value="last-month">Last Month</option>
          <option value="last-3-months">Last 3 Months</option>
        </select>
      </div>

      {/* Summary */}
      <div className="mb-5">
        <p className="text-xs font-medium text-slate-500">
          Total Sales
        </p>

        <div className="mt-1 flex items-center gap-3">
          <h3 className="text-2xl font-bold text-slate-900">
            ₱0.00
          </h3>

          <span className="rounded-full bg-green-50 px-2.5 py-1 text-xs font-semibold text-green-600">
            No change
          </span>
        </div>
      </div>

      {/* Chart */}
      <div className="relative h-64">
        {/* Grid lines */}
        <div className="absolute inset-x-0 top-0 border-t border-slate-100" />
        <div className="absolute inset-x-0 top-1/4 border-t border-slate-100" />
        <div className="absolute inset-x-0 top-1/2 border-t border-slate-100" />
        <div className="absolute inset-x-0 top-3/4 border-t border-slate-100" />
        <div className="absolute inset-x-0 bottom-6 border-t border-slate-200" />

        {/* Empty chart state */}
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="text-center">
            <p className="text-sm font-medium text-slate-400">
              No sales data available
            </p>

            <p className="mt-1 text-xs text-slate-400">
              Sales performance will appear here
            </p>
          </div>
        </div>

        {/* Green baseline */}
        <div className="absolute inset-x-0 bottom-6 h-0.5 bg-green-500/30" />

        {/* Month labels */}
        <div className="absolute inset-x-0 bottom-0 flex justify-between">
          {salesData.map((item) => (
            <span
              key={item.month}
              className="text-xs text-slate-400"
            >
              {item.month}
            </span>
          ))}
        </div>
      </div>
    </div>
  );
}

export default SalesOverview;
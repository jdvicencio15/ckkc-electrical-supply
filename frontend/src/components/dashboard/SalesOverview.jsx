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
    <div className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm">
      <div className="mb-6">
        <h2 className="text-lg font-semibold text-gray-900">
          Sales Overview
        </h2>

        <p className="mt-1 text-sm text-gray-500">
          Monthly sales performance
        </p>
      </div>

      <div className="flex h-64 items-end gap-4">
        {salesData.map((item) => (
          <div
            key={item.month}
            className="flex flex-1 flex-col items-center gap-2"
          >
            <div className="flex h-full w-full items-end">
              <div
                className="w-full rounded-t-md bg-gray-900"
                style={{
                  height: `${item.sales || 5}%`,
                }}
              />
            </div>

            <span className="text-xs text-gray-500">
              {item.month}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}

export default SalesOverview;
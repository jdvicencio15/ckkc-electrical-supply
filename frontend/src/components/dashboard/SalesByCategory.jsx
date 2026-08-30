function SalesByCategory() {
  const categories = [
    {
      id: 1,
      name: "Electrical Supplies",
      sales: "₱0.00",
      percentage: 0,
    },
    {
      id: 2,
      name: "Lighting",
      sales: "₱0.00",
      percentage: 0,
    },
    {
      id: 3,
      name: "Tools",
      sales: "₱0.00",
      percentage: 0,
    },
    {
      id: 4,
      name: "Accessories",
      sales: "₱0.00",
      percentage: 0,
    },
  ];

  return (
    <div className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm">
      <div className="mb-5">
        <h2 className="text-lg font-semibold text-gray-900">
          Sales by Category
        </h2>

        <p className="mt-1 text-sm text-gray-500">
          Sales distribution by category
        </p>
      </div>

      <div className="space-y-5">
        {categories.map((category) => (
          <div key={category.id}>
            <div className="mb-2 flex items-center justify-between">
              <span className="text-sm font-medium text-gray-700">
                {category.name}
              </span>

              <span className="text-sm font-semibold text-gray-900">
                {category.sales}
              </span>
            </div>

            <div className="h-2 overflow-hidden rounded-full bg-gray-100">
              <div
                className="h-full rounded-full bg-gray-900"
                style={{
                  width: `${category.percentage}%`,
                }}
              />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export default SalesByCategory;
function SalesByCategory({ sales, products }) {
  const categories = [
    "Electrical Supplies",
    "Lighting",
    "Tools",
    "Accessories",
  ];

  const productCategoryMap = new Map(
    products.map((product) => [
      product._id,
      product.categoryId?.name,
    ]),
  );

  const categorySales = categories.map((categoryName) => {
    const categoryTotal = sales.reduce((total, sale) => {
      const itemTotal = (sale.items || []).reduce((itemSum, item) => {
        const productCategory = productCategoryMap.get(item.productId);

        if (productCategory !== categoryName) {
          return itemSum;
        }

        return itemSum + item.quantity * item.unitPrice;
      }, 0);

      return total + itemTotal;
    }, 0);

    return {
      name: categoryName,
      sales: categoryTotal,
    };
  });

  const totalCategorySales = categorySales.reduce(
    (total, category) => total + category.sales,
    0,
  );

  const categoriesWithPercentage = categorySales.map((category, index) => ({
    id: index + 1,
    name: category.name,
    sales: category.sales,
    percentage:
      totalCategorySales > 0
        ? (category.sales / totalCategorySales) * 100
        : 0,
  }));

  return (
    <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-700 dark:bg-slate-800">
      <div className="mb-5">
        <h2 className="text-lg font-semibold text-slate-900 dark:text-slate-100">
          Sales by Category
        </h2>

        <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
          Sales distribution by category
        </p>
      </div>

      <div className="space-y-5">
        {categoriesWithPercentage.map((category) => (
          <div key={category.id}>
            <div className="mb-2 flex items-center justify-between">
              <span className="text-sm font-medium text-slate-700 dark:text-slate-300">
                {category.name}
              </span>

              <span className="text-sm font-semibold text-slate-900 dark:text-slate-100">
                ₱
                {category.sales.toLocaleString("en-PH", {
                  minimumFractionDigits: 2,
                  maximumFractionDigits: 2,
                })}
              </span>
            </div>

            <div className="h-2 overflow-hidden rounded-full bg-green-50 dark:bg-slate-700">
              <div
                className="h-full rounded-full bg-gradient-to-r from-green-500 to-emerald-400 transition-all duration-500"
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
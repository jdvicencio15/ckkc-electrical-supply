import { useSettings } from "../../context/SettingsContext";
import { formatCurrency } from "../../utils/currency";

function SalesByCategory({ salesByCategory = [] }) {
  const { settings } = useSettings();

  // Backend is the source of truth.
  // The backend already resolves:
  // Sale Item → Product → Category → Sales Total
  const totalCategorySales = salesByCategory.reduce(
    (total, category) => total + Number(category.sales || 0),
    0,
  );

  const categoriesWithPercentage = salesByCategory.map(
    (category, index) => ({
      id: category._id || index,
      name: category.categoryName,
      sales: Number(category.sales || 0),
      percentage:
        totalCategorySales > 0
          ? (Number(category.sales || 0) / totalCategorySales) * 100
          : 0,
    }),
  );

  return (
    <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-slate-900">
      <div className="mb-5">
        <h2 className="text-lg font-semibold text-slate-900 dark:text-slate-100">
          Sales by Category
        </h2>

        <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
          Sales distribution by category
        </p>
      </div>

      <div className="space-y-5">
        {categoriesWithPercentage.length === 0 ? (
          <p className="text-sm text-slate-500 dark:text-slate-400">
            No sales data available for this month.
          </p>
        ) : (
          categoriesWithPercentage.map((category) => (
            <div key={category.id}>
              <div className="mb-2 flex items-center justify-between">
                <span className="text-sm font-medium text-slate-700 dark:text-slate-300">
                  {category.name}
                </span>

                <span className="text-sm font-semibold text-slate-900 dark:text-slate-100">
                  {formatCurrency(
                    category.sales,
                    settings?.currency,
                  )}
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
          ))
        )}
      </div>
    </div>
  );
}

export default SalesByCategory;
function Inventory() {
  return (
    <div className="space-y-6">

      {/* Page Header */}
      <div>
        <h1 className="text-2xl font-bold text-slate-900 dark:text-slate-100">
          Inventory
        </h1>

        <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
          Monitor stock levels and manage your inventory.
        </p>
      </div>

      {/* Inventory Summary */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">

        <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-slate-900">
          <p className="text-sm text-slate-500 dark:text-slate-400">
            Total Products
          </p>
          <p className="mt-2 text-2xl font-bold text-slate-900 dark:text-slate-100">
            0
          </p>
        </div>

        <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-slate-900">
          <p className="text-sm text-slate-500 dark:text-slate-400">
            In Stock
          </p>
          <p className="mt-2 text-2xl font-bold text-green-600">
            0
          </p>
        </div>

        <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-slate-900">
          <p className="text-sm text-slate-500 dark:text-slate-400">
            Low Stock
          </p>
          <p className="mt-2 text-2xl font-bold text-amber-500">
            0
          </p>
        </div>

        <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-slate-900">
          <p className="text-sm text-slate-500 dark:text-slate-400">
            Out of Stock
          </p>
          <p className="mt-2 text-2xl font-bold text-red-500">
            0
          </p>
        </div>

      </div>

      {/* Filters */}
      <div className="flex flex-col gap-3 rounded-xl border border-slate-200 bg-white p-4 shadow-sm md:flex-row dark:border-slate-800 dark:bg-slate-900">

        <input
          type="search"
          placeholder="Search products..."
          className="flex-1 rounded-lg border border-slate-200 bg-slate-50 px-4 py-2.5 text-sm text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-green-500 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-100"
        />

        <select
          className="rounded-lg border border-slate-200 bg-slate-50 px-4 py-2.5 text-sm text-slate-700 outline-none focus:border-green-500 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-300"
        >
          <option>All Categories</option>
        </select>

        <select
          className="rounded-lg border border-slate-200 bg-slate-50 px-4 py-2.5 text-sm text-slate-700 outline-none focus:border-green-500 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-300"
        >
          <option>All Stock Status</option>
        </select>

      </div>

      {/* Inventory Table */}
      <div className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm dark:border-slate-800 dark:bg-slate-900">

        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">

            <thead className="bg-slate-50 text-xs uppercase text-slate-500 dark:bg-slate-800/50 dark:text-slate-400">
              <tr>
                <th className="px-6 py-3 font-semibold">
                  Product
                </th>

                <th className="px-6 py-3 font-semibold">
                  SKU
                </th>

                <th className="px-6 py-3 font-semibold">
                  Category
                </th>

                <th className="px-6 py-3 font-semibold">
                  Stock
                </th>

                <th className="px-6 py-3 font-semibold">
                  Reorder Level
                </th>

                <th className="px-6 py-3 font-semibold">
                  Status
                </th>

                <th className="px-6 py-3 text-right font-semibold">
                  Actions
                </th>
              </tr>
            </thead>

            <tbody>
              <tr>
                <td
                  colSpan="7"
                  className="px-6 py-12 text-center text-sm text-slate-500 dark:text-slate-400"
                >
                  No inventory records found.
                </td>
              </tr>
            </tbody>

          </table>
        </div>

        <div className="border-t border-slate-200 px-6 py-3 dark:border-slate-800">
          <p className="text-xs text-slate-500 dark:text-slate-400">
            Showing 0 inventory records
          </p>
        </div>

      </div>

    </div>
  );
}

export default Inventory;
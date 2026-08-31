function Categories() {
  return (
    <div className="space-y-6">

      {/* Page Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-slate-100">
            Categories
          </h1>

          <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
            Organize and manage your product categories.
          </p>
        </div>

        <button
          type="button"
          className="rounded-lg bg-green-600 px-4 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-green-700"
        >
          + Add Category
        </button>
      </div>

      {/* Categories Table */}
      <div className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm dark:border-slate-800 dark:bg-slate-900">

        {/* Table Header */}
        <div className="border-b border-slate-200 px-6 py-4 dark:border-slate-800">
          <h2 className="text-sm font-semibold text-slate-900 dark:text-slate-100">
            Product Categories
          </h2>

          <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
            Manage categories used throughout your inventory.
          </p>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="bg-slate-50 text-xs uppercase text-slate-500 dark:bg-slate-800/50 dark:text-slate-400">
              <tr>
                <th className="px-6 py-3 font-semibold">
                  Category
                </th>

                <th className="px-6 py-3 font-semibold">
                  Description
                </th>

                <th className="px-6 py-3 font-semibold">
                  Products
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
                  colSpan="5"
                  className="px-6 py-12 text-center text-sm text-slate-500 dark:text-slate-400"
                >
                  No categories found.
                </td>
              </tr>
            </tbody>
          </table>
        </div>

        {/* Footer */}
        <div className="border-t border-slate-200 px-6 py-3 dark:border-slate-800">
          <p className="text-xs text-slate-500 dark:text-slate-400">
            Showing 0 categories
          </p>
        </div>

      </div>
    </div>
  );
}

export default Categories;
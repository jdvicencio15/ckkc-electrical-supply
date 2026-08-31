function Customers() {
  return (
    <div className="space-y-6">

      {/* Page Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-slate-100">
            Customers
          </h1>

          <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
            Manage your customers and their account information.
          </p>
        </div>

        <button
          type="button"
          className="rounded-lg bg-green-600 px-4 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-green-700"
        >
          + Add Customer
        </button>
      </div>

      {/* Filters */}
      <div className="flex flex-col gap-3 rounded-xl border border-slate-200 bg-white p-4 shadow-sm md:flex-row dark:border-slate-800 dark:bg-slate-900">

        <input
          type="search"
          placeholder="Search customers..."
          className="flex-1 rounded-lg border border-slate-200 bg-slate-50 px-4 py-2.5 text-sm text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-green-500 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-100"
        />

        <select
          className="rounded-lg border border-slate-200 bg-slate-50 px-4 py-2.5 text-sm text-slate-700 outline-none focus:border-green-500 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-300"
        >
          <option>All Status</option>
        </select>

      </div>

      {/* Customers Table */}
      <div className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm dark:border-slate-800 dark:bg-slate-900">

        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">

            <thead className="bg-slate-50 text-xs uppercase text-slate-500 dark:bg-slate-800/50 dark:text-slate-400">
              <tr>
                <th className="px-6 py-3 font-semibold">
                  Customer
                </th>

                <th className="px-6 py-3 font-semibold">
                  Contact
                </th>

                <th className="px-6 py-3 font-semibold">
                  Total Orders
                </th>

                <th className="px-6 py-3 font-semibold">
                  Total Purchases
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
                  colSpan="6"
                  className="px-6 py-12 text-center text-sm text-slate-500 dark:text-slate-400"
                >
                  No customers found.
                </td>
              </tr>
            </tbody>

          </table>
        </div>

        {/* Footer */}
        <div className="border-t border-slate-200 px-6 py-3 dark:border-slate-800">
          <p className="text-xs text-slate-500 dark:text-slate-400">
            Showing 0 customers
          </p>
        </div>

      </div>

    </div>
  );
}

export default Customers;
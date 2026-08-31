function Reports() {
  return (
    <div className="space-y-6">

      {/* Page Header */}
      <div>
        <h1 className="text-2xl font-bold text-slate-900 dark:text-slate-100">
          Reports
        </h1>

        <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
          View business performance and operational reports.
        </p>
      </div>

      {/* Report Filters */}
      <div className="flex flex-col gap-3 rounded-xl border border-slate-200 bg-white p-4 shadow-sm md:flex-row dark:border-slate-800 dark:bg-slate-900">

        <select
          className="rounded-lg border border-slate-200 bg-slate-50 px-4 py-2.5 text-sm text-slate-700 outline-none focus:border-green-500 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-300"
        >
          <option>This Month</option>
          <option>Last Month</option>
          <option>This Quarter</option>
          <option>This Year</option>
        </select>

        <select
          className="rounded-lg border border-slate-200 bg-slate-50 px-4 py-2.5 text-sm text-slate-700 outline-none focus:border-green-500 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-300"
        >
          <option>All Categories</option>
        </select>

        <button
          type="button"
          className="rounded-lg bg-green-600 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-green-700"
        >
          Generate Report
        </button>

      </div>

      {/* Report Cards */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">

        <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-slate-900">
          <p className="text-sm text-slate-500 dark:text-slate-400">
            Sales
          </p>

          <p className="mt-2 text-2xl font-bold text-green-600">
            ₱0.00
          </p>
        </div>

        <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-slate-900">
          <p className="text-sm text-slate-500 dark:text-slate-400">
            Purchases
          </p>

          <p className="mt-2 text-2xl font-bold text-blue-600">
            ₱0.00
          </p>
        </div>

        <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-slate-900">
          <p className="text-sm text-slate-500 dark:text-slate-400">
            Expenses
          </p>

          <p className="mt-2 text-2xl font-bold text-red-500">
            ₱0.00
          </p>
        </div>

        <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-slate-900">
          <p className="text-sm text-slate-500 dark:text-slate-400">
            Net Profit
          </p>

          <p className="mt-2 text-2xl font-bold text-slate-900 dark:text-slate-100">
            ₱0.00
          </p>
        </div>

      </div>

      {/* Available Reports */}
      <div className="rounded-xl border border-slate-200 bg-white shadow-sm dark:border-slate-800 dark:bg-slate-900">

        <div className="border-b border-slate-200 px-6 py-4 dark:border-slate-800">
          <h2 className="text-sm font-semibold text-slate-900 dark:text-slate-100">
            Available Reports
          </h2>

          <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
            Select a report to view detailed business information.
          </p>
        </div>

        <div className="grid gap-4 p-6 sm:grid-cols-2 lg:grid-cols-3">

          <button
            type="button"
            className="rounded-xl border border-slate-200 p-5 text-left transition hover:border-green-500 hover:bg-slate-50 dark:border-slate-700 dark:hover:bg-slate-800"
          >
            <h3 className="font-semibold text-slate-900 dark:text-slate-100">
              Sales Report
            </h3>

            <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
              Review sales performance and transactions.
            </p>
          </button>

          <button
            type="button"
            className="rounded-xl border border-slate-200 p-5 text-left transition hover:border-green-500 hover:bg-slate-50 dark:border-slate-700 dark:hover:bg-slate-800"
          >
            <h3 className="font-semibold text-slate-900 dark:text-slate-100">
              Inventory Report
            </h3>

            <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
              Analyze stock levels and inventory movement.
            </p>
          </button>

          <button
            type="button"
            className="rounded-xl border border-slate-200 p-5 text-left transition hover:border-green-500 hover:bg-slate-50 dark:border-slate-700 dark:hover:bg-slate-800"
          >
            <h3 className="font-semibold text-slate-900 dark:text-slate-100">
              Financial Report
            </h3>

            <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
              Review revenue, expenses, and profitability.
            </p>
          </button>

        </div>

      </div>

    </div>
  );
}

export default Reports;
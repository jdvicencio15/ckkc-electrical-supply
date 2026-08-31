function Accounting() {
  return (
    <div className="space-y-6">

      {/* Page Header */}
      <div>
        <h1 className="text-2xl font-bold text-slate-900 dark:text-slate-100">
          Accounting
        </h1>

        <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
          Monitor your financial records and accounting activities.
        </p>
      </div>

      {/* Financial Summary */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">

        <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-slate-900">
          <p className="text-sm text-slate-500 dark:text-slate-400">
            Total Revenue
          </p>

          <p className="mt-2 text-2xl font-bold text-green-600">
            ₱0.00
          </p>
        </div>

        <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-slate-900">
          <p className="text-sm text-slate-500 dark:text-slate-400">
            Total Expenses
          </p>

          <p className="mt-2 text-2xl font-bold text-red-500">
            ₱0.00
          </p>
        </div>

        <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-slate-900">
          <p className="text-sm text-slate-500 dark:text-slate-400">
            Accounts Receivable
          </p>

          <p className="mt-2 text-2xl font-bold text-blue-600">
            ₱0.00
          </p>
        </div>

        <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-slate-900">
          <p className="text-sm text-slate-500 dark:text-slate-400">
            Accounts Payable
          </p>

          <p className="mt-2 text-2xl font-bold text-amber-500">
            ₱0.00
          </p>
        </div>

      </div>

      {/* Accounting Overview */}
      <div className="grid gap-6 lg:grid-cols-2">

        {/* Recent Transactions */}
        <div className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm dark:border-slate-800 dark:bg-slate-900">

          <div className="border-b border-slate-200 px-6 py-4 dark:border-slate-800">
            <h2 className="text-sm font-semibold text-slate-900 dark:text-slate-100">
              Recent Transactions
            </h2>

            <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
              Latest financial transactions.
            </p>
          </div>

          <div className="px-6 py-12 text-center">
            <p className="text-sm text-slate-500 dark:text-slate-400">
              No transactions found.
            </p>
          </div>

        </div>

        {/* Account Balances */}
        <div className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm dark:border-slate-800 dark:bg-slate-900">

          <div className="border-b border-slate-200 px-6 py-4 dark:border-slate-800">
            <h2 className="text-sm font-semibold text-slate-900 dark:text-slate-100">
              Account Balances
            </h2>

            <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
              Current balances across your accounts.
            </p>
          </div>

          <div className="px-6 py-12 text-center">
            <p className="text-sm text-slate-500 dark:text-slate-400">
              No account balances available.
            </p>
          </div>

        </div>

      </div>

      {/* Accounting Actions */}
      <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900">

        <h2 className="text-sm font-semibold text-slate-900 dark:text-slate-100">
          Accounting Actions
        </h2>

        <div className="mt-4 flex flex-wrap gap-3">

          <button
            type="button"
            className="rounded-lg border border-slate-200 px-4 py-2.5 text-sm font-medium text-slate-700 transition hover:bg-slate-50 dark:border-slate-700 dark:text-slate-300 dark:hover:bg-slate-800"
          >
            View Ledger
          </button>

          <button
            type="button"
            className="rounded-lg border border-slate-200 px-4 py-2.5 text-sm font-medium text-slate-700 transition hover:bg-slate-50 dark:border-slate-700 dark:text-slate-300 dark:hover:bg-slate-800"
          >
            Trial Balance
          </button>

          <button
            type="button"
            className="rounded-lg border border-slate-200 px-4 py-2.5 text-sm font-medium text-slate-700 transition hover:bg-slate-50 dark:border-slate-700 dark:text-slate-300 dark:hover:bg-slate-800"
          >
            Financial Statements
          </button>

        </div>

      </div>

    </div>
  );
}

export default Accounting;
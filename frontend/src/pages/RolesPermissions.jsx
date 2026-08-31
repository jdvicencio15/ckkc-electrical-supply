function RolesPermissions() {
  return (
    <div className="space-y-6">

      {/* Page Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-slate-100">
            Roles & Permissions
          </h1>

          <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
            Manage user roles and system access permissions.
          </p>
        </div>

        <button
          type="button"
          className="rounded-lg bg-green-600 px-4 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-green-700"
        >
          + Add Role
        </button>
      </div>

      {/* Roles */}
      <div className="grid gap-6 lg:grid-cols-3">

        {/* Admin / Owner */}
        <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900">
          <div className="flex items-center justify-between">
            <h2 className="font-semibold text-slate-900 dark:text-slate-100">
              Admin / Owner
            </h2>

            <span className="rounded-full bg-green-50 px-2.5 py-1 text-xs font-medium text-green-700 dark:bg-green-950/40 dark:text-green-400">
              Full Access
            </span>
          </div>

          <p className="mt-2 text-sm text-slate-500 dark:text-slate-400">
            Complete access to all system modules and settings.
          </p>

          <div className="mt-5 border-t border-slate-200 pt-4 dark:border-slate-800">
            <p className="text-xs font-semibold uppercase text-slate-400">
              Permissions
            </p>

            <p className="mt-2 text-sm text-slate-600 dark:text-slate-300">
              All permissions enabled
            </p>
          </div>

          <button
            type="button"
            className="mt-5 w-full rounded-lg border border-slate-200 px-4 py-2 text-sm font-medium text-slate-700 transition hover:bg-slate-50 dark:border-slate-700 dark:text-slate-300 dark:hover:bg-slate-800"
          >
            Manage Role
          </button>
        </div>

        {/* Purchasing */}
        <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900">
          <div className="flex items-center justify-between">
            <h2 className="font-semibold text-slate-900 dark:text-slate-100">
              Purchasing
            </h2>

            <span className="rounded-full bg-blue-50 px-2.5 py-1 text-xs font-medium text-blue-700 dark:bg-blue-950/40 dark:text-blue-400">
              Purchasing Access
            </span>
          </div>

          <p className="mt-2 text-sm text-slate-500 dark:text-slate-400">
            Access to purchasing, inventory, products, and supplier operations.
          </p>

          <div className="mt-5 border-t border-slate-200 pt-4 dark:border-slate-800">
            <p className="text-xs font-semibold uppercase text-slate-400">
              Permissions
            </p>

            <p className="mt-2 text-sm text-slate-600 dark:text-slate-300">
              Products, Categories, Purchases, Inventory, Suppliers
            </p>
          </div>

          <button
            type="button"
            className="mt-5 w-full rounded-lg border border-slate-200 px-4 py-2 text-sm font-medium text-slate-700 transition hover:bg-slate-50 dark:border-slate-700 dark:text-slate-300 dark:hover:bg-slate-800"
          >
            Manage Role
          </button>
        </div>

        {/* Accounting */}
        <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900">
          <div className="flex items-center justify-between">
            <h2 className="font-semibold text-slate-900 dark:text-slate-100">
              Accounting
            </h2>

            <span className="rounded-full bg-purple-50 px-2.5 py-1 text-xs font-medium text-purple-700 dark:bg-purple-950/40 dark:text-purple-400">
              Accounting Access
            </span>
          </div>

          <p className="mt-2 text-sm text-slate-500 dark:text-slate-400">
            Access to financial records, invoices, payments, and reports.
          </p>

          <div className="mt-5 border-t border-slate-200 pt-4 dark:border-slate-800">
            <p className="text-xs font-semibold uppercase text-slate-400">
              Permissions
            </p>

            <p className="mt-2 text-sm text-slate-600 dark:text-slate-300">
              Sales, Purchases, Invoices, Payments, Accounting, Reports
            </p>
          </div>

          <button
            type="button"
            className="mt-5 w-full rounded-lg border border-slate-200 px-4 py-2 text-sm font-medium text-slate-700 transition hover:bg-slate-50 dark:border-slate-700 dark:text-slate-300 dark:hover:bg-slate-800"
          >
            Manage Role
          </button>
        </div>

      </div>

      {/* Permissions Overview */}
      <div className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm dark:border-slate-800 dark:bg-slate-900">

        <div className="border-b border-slate-200 px-6 py-4 dark:border-slate-800">
          <h2 className="text-sm font-semibold text-slate-900 dark:text-slate-100">
            Permission Overview
          </h2>

          <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
            Overview of available system permissions.
          </p>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">

            <thead className="bg-slate-50 text-xs uppercase text-slate-500 dark:bg-slate-800/50 dark:text-slate-400">
              <tr>
                <th className="px-6 py-3 font-semibold">
                  Module
                </th>

                <th className="px-6 py-3 font-semibold">
                  Admin / Owner
                </th>

                <th className="px-6 py-3 font-semibold">
                  Purchasing
                </th>

                <th className="px-6 py-3 font-semibold">
                  Accounting
                </th>
              </tr>
            </thead>

            <tbody>

              {/* Products */}
              <tr className="border-t border-slate-100 dark:border-slate-800">
                <td className="px-6 py-4 font-medium text-slate-700 dark:text-slate-300">
                  Products
                </td>

                <td className="px-6 py-4 text-green-600">✓</td>
                <td className="px-6 py-4 text-green-600">✓</td>
                <td className="px-6 py-4 text-slate-400">—</td>
              </tr>

              {/* Categories */}
              <tr className="border-t border-slate-100 dark:border-slate-800">
                <td className="px-6 py-4 font-medium text-slate-700 dark:text-slate-300">
                  Categories
                </td>

                <td className="px-6 py-4 text-green-600">✓</td>
                <td className="px-6 py-4 text-green-600">✓</td>
                <td className="px-6 py-4 text-slate-400">—</td>
              </tr>

              {/* Sales */}
              <tr className="border-t border-slate-100 dark:border-slate-800">
                <td className="px-6 py-4 font-medium text-slate-700 dark:text-slate-300">
                  Sales
                </td>

                <td className="px-6 py-4 text-green-600">✓</td>
                <td className="px-6 py-4 text-slate-400">—</td>
                <td className="px-6 py-4 text-green-600">✓</td>
              </tr>

              {/* Purchases */}
              <tr className="border-t border-slate-100 dark:border-slate-800">
                <td className="px-6 py-4 font-medium text-slate-700 dark:text-slate-300">
                  Purchases
                </td>

                <td className="px-6 py-4 text-green-600">✓</td>
                <td className="px-6 py-4 text-green-600">✓</td>
                <td className="px-6 py-4 text-green-600">✓</td>
              </tr>

              {/* Inventory */}
              <tr className="border-t border-slate-100 dark:border-slate-800">
                <td className="px-6 py-4 font-medium text-slate-700 dark:text-slate-300">
                  Inventory
                </td>

                <td className="px-6 py-4 text-green-600">✓</td>
                <td className="px-6 py-4 text-green-600">✓</td>
                <td className="px-6 py-4 text-slate-400">—</td>
              </tr>

              {/* Suppliers */}
              <tr className="border-t border-slate-100 dark:border-slate-800">
                <td className="px-6 py-4 font-medium text-slate-700 dark:text-slate-300">
                  Suppliers
                </td>

                <td className="px-6 py-4 text-green-600">✓</td>
                <td className="px-6 py-4 text-green-600">✓</td>
                <td className="px-6 py-4 text-slate-400">—</td>
              </tr>

              {/* Invoices */}
              <tr className="border-t border-slate-100 dark:border-slate-800">
                <td className="px-6 py-4 font-medium text-slate-700 dark:text-slate-300">
                  Invoices
                </td>

                <td className="px-6 py-4 text-green-600">✓</td>
                <td className="px-6 py-4 text-slate-400">—</td>
                <td className="px-6 py-4 text-green-600">✓</td>
              </tr>

              {/* Payments */}
              <tr className="border-t border-slate-100 dark:border-slate-800">
                <td className="px-6 py-4 font-medium text-slate-700 dark:text-slate-300">
                  Payments
                </td>

                <td className="px-6 py-4 text-green-600">✓</td>
                <td className="px-6 py-4 text-slate-400">—</td>
                <td className="px-6 py-4 text-green-600">✓</td>
              </tr>

              {/* Accounting */}
              <tr className="border-t border-slate-100 dark:border-slate-800">
                <td className="px-6 py-4 font-medium text-slate-700 dark:text-slate-300">
                  Accounting
                </td>

                <td className="px-6 py-4 text-green-600">✓</td>
                <td className="px-6 py-4 text-slate-400">—</td>
                <td className="px-6 py-4 text-green-600">✓</td>
              </tr>

              {/* Reports */}
              <tr className="border-t border-slate-100 dark:border-slate-800">
                <td className="px-6 py-4 font-medium text-slate-700 dark:text-slate-300">
                  Reports
                </td>

                <td className="px-6 py-4 text-green-600">✓</td>
                <td className="px-6 py-4 text-slate-400">—</td>
                <td className="px-6 py-4 text-green-600">✓</td>
              </tr>

              {/* Users */}
              <tr className="border-t border-slate-100 dark:border-slate-800">
                <td className="px-6 py-4 font-medium text-slate-700 dark:text-slate-300">
                  Users
                </td>

                <td className="px-6 py-4 text-green-600">✓</td>
                <td className="px-6 py-4 text-slate-400">—</td>
                <td className="px-6 py-4 text-slate-400">—</td>
              </tr>

              {/* Roles */}
              <tr className="border-t border-slate-100 dark:border-slate-800">
                <td className="px-6 py-4 font-medium text-slate-700 dark:text-slate-300">
                  Roles & Permissions
                </td>

                <td className="px-6 py-4 text-green-600">✓</td>
                <td className="px-6 py-4 text-slate-400">—</td>
                <td className="px-6 py-4 text-slate-400">—</td>
              </tr>

              {/* Settings */}
              <tr className="border-t border-slate-100 dark:border-slate-800">
                <td className="px-6 py-4 font-medium text-slate-700 dark:text-slate-300">
                  System Settings
                </td>

                <td className="px-6 py-4 text-green-600">✓</td>
                <td className="px-6 py-4 text-slate-400">—</td>
                <td className="px-6 py-4 text-slate-400">—</td>
              </tr>

            </tbody>

          </table>
        </div>

      </div>

    </div>
  );
}

export default RolesPermissions;
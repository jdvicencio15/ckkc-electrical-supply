
import { FaEdit, FaTrash } from "react-icons/fa";

function ChartOfAccountsTable({
  accounts = [],
  loading = false,
  onEdit,
  onDelete,
}) {
  return (
    <div className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm dark:border-slate-800 dark:bg-slate-900">
      <div className="overflow-x-auto">
        <table className="w-full min-w-[1000px] text-left text-sm">
          <thead className="bg-slate-50 text-xs uppercase text-slate-500 dark:bg-slate-800/50 dark:text-slate-400">
            <tr>
              <th className="px-6 py-3 font-semibold">
                Account
              </th>

              <th className="px-6 py-3 font-semibold">
                Type
              </th>

              <th className="px-6 py-3 font-semibold">
                Parent Account
              </th>

              <th className="px-6 py-3 font-semibold">
                Description
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
            {loading ? (
              <tr>
                <td
                  colSpan="6"
                  className="px-6 py-12 text-center text-sm text-slate-500 dark:text-slate-400"
                >
                  Loading accounts...
                </td>
              </tr>
            ) : accounts.length === 0 ? (
              <tr>
                <td
                  colSpan="6"
                  className="px-6 py-12 text-center text-sm text-slate-500 dark:text-slate-400"
                >
                  No accounts found.
                </td>
              </tr>
            ) : (
              accounts.map((account) => (
                <tr
                  key={account._id}
                  className="border-t border-slate-100 dark:border-slate-800"
                >
                  {/* Account */}
                  <td className="px-6 py-4">
                    <div>
                      <p className="font-medium text-slate-900 dark:text-slate-100">
                        {account.accountName}
                      </p>

                      <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
                        {account.accountCode}
                      </p>
                    </div>
                  </td>

                  {/* Account Type */}
                  <td className="px-6 py-4">
                    <span className="capitalize text-slate-700 dark:text-slate-300">
                      {account.accountType}
                    </span>
                  </td>

                  {/* Parent Account */}
                  <td className="px-6 py-4">
                    {account.parentAccount ? (
                      <div>
                        <p className="text-slate-700 dark:text-slate-300">
                          {account.parentAccount.accountName}
                        </p>

                        <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
                          {account.parentAccount.accountCode}
                        </p>
                      </div>
                    ) : (
                      <span className="text-slate-400">
                        —
                      </span>
                    )}
                  </td>

                  {/* Description */}
                  <td className="max-w-xs px-6 py-4">
                    <p className="truncate text-slate-700 dark:text-slate-300">
                      {account.description || "—"}
                    </p>
                  </td>

                  {/* Status */}
                  <td className="px-6 py-4">
                    <span
                      className={`inline-flex rounded-full px-2.5 py-1 text-xs font-medium ${
                        account.isActive
                          ? "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400"
                          : "bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-400"
                      }`}
                    >
                      {account.isActive
                        ? "Active"
                        : "Inactive"}
                    </span>
                  </td>

                  {/* Actions */}
                  <td className="px-6 py-4 text-right">
                    <div className="flex justify-end gap-2">
                      <button
                        type="button"
                        onClick={() => onEdit(account)}
                        className="flex h-8 w-8 items-center justify-center rounded-lg text-slate-500 transition hover:bg-slate-100 hover:text-slate-900 dark:text-slate-400 dark:hover:bg-slate-800 dark:hover:text-slate-100"
                        aria-label={`Edit ${account.accountName}`}
                      >
                        <FaEdit className="h-3.5 w-3.5" />
                      </button>

                      {account.isActive && (
                        <button
                          type="button"
                          onClick={() => onDelete(account)}
                          className="flex h-8 w-8 items-center justify-center rounded-lg text-red-500 transition hover:bg-red-50 hover:text-red-700 dark:text-red-400 dark:hover:bg-red-950/30"
                          aria-label={`Deactivate ${account.accountName}`}
                        >
                          <FaTrash className="h-3.5 w-3.5" />
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Footer */}
      <div className="border-t border-slate-200 px-6 py-3 dark:border-slate-800">
        <p className="text-xs text-slate-500 dark:text-slate-400">
          Showing {accounts.length}{" "}
          {accounts.length === 1 ? "account" : "accounts"}
        </p>
      </div>
    </div>
  );
}

export default ChartOfAccountsTable;


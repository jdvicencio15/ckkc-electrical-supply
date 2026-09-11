import { useEffect, useMemo, useState } from "react";
import {
  FaBalanceScale,
  FaSyncAlt,
  FaExclamationTriangle,
  FaCheckCircle,
} from "react-icons/fa";

import accountingApi from "../../api/accountingApi";
import Button from "../../components/ui/Button";
import { useSettings } from "../../context/SettingsContext";
import { formatCurrency } from "../../utils/currency";

function TrialBalance() {
  const { settings } = useSettings();

  const [accounts, setAccounts] = useState([]);

  const [totalDebit, setTotalDebit] = useState(0);
  const [totalCredit, setTotalCredit] = useState(0);
  const [isBalanced, setIsBalanced] = useState(false);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const fetchTrialBalance = async () => {
    try {
      setLoading(true);
      setError("");

      const response = await accountingApi.getTrialBalance();

      const data = response?.data || {};

      setAccounts(Array.isArray(data.accounts) ? data.accounts : []);

      setTotalDebit(Number(data.totalDebit || 0));

      setTotalCredit(Number(data.totalCredit || 0));

      setIsBalanced(Boolean(data.isBalanced));
    } catch (err) {
      console.error(err);

      setError(err.response?.data?.message || "Failed to load trial balance.");

      setAccounts([]);
      setTotalDebit(0);
      setTotalCredit(0);
      setIsBalanced(false);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTrialBalance();
  }, []);

  const difference = useMemo(() => {
    return Number(Math.abs(totalDebit - totalCredit).toFixed(2));
  }, [totalDebit, totalCredit]);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <div className="flex items-center gap-3">
            <div className="rounded-lg bg-slate-100 p-3 dark:bg-slate-800">
              <FaBalanceScale className="text-xl text-slate-700 dark:text-slate-200" />
            </div>

            <div>
              <h1 className="text-2xl font-bold text-slate-900 dark:text-white">
                Trial Balance
              </h1>

              <p className="text-sm text-slate-500 dark:text-slate-400">
                Review account balances and verify that total debits equal total
                credits.
              </p>
            </div>
          </div>
        </div>

        <Button
          type="button"
          variant="secondary"
          onClick={fetchTrialBalance}
          disabled={loading}
        >
          <FaSyncAlt className={loading ? "animate-spin" : ""} />
          Refresh
        </Button>
      </div>

      {/* Error */}
      {error && (
        <div className="flex items-start gap-3 rounded-lg border border-red-200 bg-red-50 p-4 text-red-700 dark:border-red-900/50 dark:bg-red-950/30 dark:text-red-400">
          <FaExclamationTriangle className="mt-0.5" />

          <p className="text-sm">{error}</p>
        </div>
      )}

      {/* Balance Status */}
      {!loading && !error && (
        <div
          className={`flex items-center justify-between gap-4 rounded-xl border p-5 shadow-sm ${
            isBalanced
              ? "border-emerald-200 bg-emerald-50 dark:border-emerald-900/50 dark:bg-emerald-950/30"
              : "border-red-200 bg-red-50 dark:border-red-900/50 dark:bg-red-950/30"
          }`}
        >
          <div className="flex items-center gap-3">
            {isBalanced ? (
              <FaCheckCircle className="text-xl text-emerald-600 dark:text-emerald-400" />
            ) : (
              <FaExclamationTriangle className="text-xl text-red-600 dark:text-red-400" />
            )}

            <div>
              <p
                className={`font-semibold ${
                  isBalanced
                    ? "text-emerald-800 dark:text-emerald-300"
                    : "text-red-800 dark:text-red-300"
                }`}
              >
                {isBalanced
                  ? "Trial Balance is Balanced"
                  : "Trial Balance is Out of Balance"}
              </p>

              <p
                className={`text-sm ${
                  isBalanced
                    ? "text-emerald-700 dark:text-emerald-400"
                    : "text-red-700 dark:text-red-400"
                }`}
              >
                {isBalanced
                  ? "Total debit and credit balances are equal."
                  : `Difference: ${formatCurrency(
                      difference,
                      settings?.currency,
                    )}`}
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Summary */}
      <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
        <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-700 dark:bg-slate-900">
          <p className="text-sm text-slate-500 dark:text-slate-400">Accounts</p>

          <p className="mt-1 text-2xl font-bold text-slate-900 dark:text-white">
            {accounts.length}
          </p>
        </div>

        <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-700 dark:bg-slate-900">
          <p className="text-sm text-slate-500 dark:text-slate-400">
            Total Debit
          </p>

          <p className="mt-1 text-2xl font-bold text-slate-900 dark:text-white">
            {formatCurrency(totalDebit, settings?.currency)}
          </p>
        </div>

        <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-700 dark:bg-slate-900">
          <p className="text-sm text-slate-500 dark:text-slate-400">
            Total Credit
          </p>

          <p className="mt-1 text-2xl font-bold text-slate-900 dark:text-white">
            {formatCurrency(totalCredit, settings?.currency)}
          </p>
        </div>
      </div>

      {/* Trial Balance Table */}
      <div className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm dark:border-slate-700 dark:bg-slate-900">
        <div className="border-b border-slate-200 px-5 py-4 dark:border-slate-700">
          <div>
            <h2 className="font-semibold text-slate-900 dark:text-white">
              Account Balances
            </h2>

            <p className="text-xs text-slate-500 dark:text-slate-400">
              Debit and credit balances by account
            </p>
          </div>
        </div>

        {loading ? (
          <div className="p-10 text-center text-sm text-slate-500 dark:text-slate-400">
            Loading trial balance...
          </div>
        ) : accounts.length === 0 ? (
          <div className="p-10 text-center text-sm text-slate-500 dark:text-slate-400">
            No trial balance accounts found.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[700px]">
              <thead className="bg-slate-50 dark:bg-slate-800">
                <tr>
                  <th className="px-5 py-3 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">
                    Account Code
                  </th>

                  <th className="px-5 py-3 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">
                    Account Name
                  </th>

                  <th className="px-5 py-3 text-right text-xs font-semibold uppercase tracking-wide text-slate-500">
                    Debit
                  </th>

                  <th className="px-5 py-3 text-right text-xs font-semibold uppercase tracking-wide text-slate-500">
                    Credit
                  </th>
                </tr>
              </thead>

              <tbody className="divide-y divide-slate-200 dark:divide-slate-700">
                {accounts.map((item) => (
                  <tr
                    key={item.account?._id}
                    className="hover:bg-slate-50 dark:hover:bg-slate-800/50"
                  >
                    <td className="whitespace-nowrap px-5 py-4 text-sm font-medium text-slate-700 dark:text-slate-300">
                      {item.account?.accountCode || "-"}
                    </td>

                    <td className="px-5 py-4">
                      <div className="font-medium text-slate-900 dark:text-white">
                        {item.account?.accountName || "Unknown Account"}
                      </div>

                      <div className="text-xs capitalize text-slate-500">
                        {item.account?.accountType || "-"}
                      </div>
                    </td>

                    <td className="whitespace-nowrap px-5 py-4 text-right text-sm font-medium text-slate-900 dark:text-white">
                      {Number(item.debit || 0) > 0
                        ? formatCurrency(item.debit, settings?.currency)
                        : "-"}
                    </td>

                    <td className="whitespace-nowrap px-5 py-4 text-right text-sm font-medium text-slate-900 dark:text-white">
                      {Number(item.credit || 0) > 0
                        ? formatCurrency(item.credit, settings?.currency)
                        : "-"}
                    </td>
                  </tr>
                ))}
              </tbody>

              <tfoot className="border-t border-slate-200 bg-slate-50 dark:border-slate-700 dark:bg-slate-800">
                <tr>
                  <td
                    colSpan={2}
                    className="px-5 py-4 text-right text-sm font-semibold text-slate-900 dark:text-white"
                  >
                    Total
                  </td>

                  <td className="px-5 py-4 text-right text-sm font-bold text-slate-900 dark:text-white">
                    {formatCurrency(totalDebit, settings?.currency)}
                  </td>

                  <td className="px-5 py-4 text-right text-sm font-bold text-slate-900 dark:text-white">
                    {formatCurrency(totalCredit, settings?.currency)}
                  </td>
                </tr>
              </tfoot>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}

export default TrialBalance;

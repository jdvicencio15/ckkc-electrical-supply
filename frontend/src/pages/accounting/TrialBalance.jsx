
import { useEffect, useMemo, useState } from "react";
import {
  FaBalanceScale,
  FaSyncAlt,
  FaExclamationTriangle,
  FaCheckCircle,
} from "react-icons/fa";

import accountingApi from "../../api/accountingApi";
import exportToCsv from "../../utils/exportCsv";
import Button from "../../components/ui/Button";
import { useSettings } from "../../context/SettingsContext";
import { formatCurrency } from "../../utils/currency";

const DEFAULT_SUMMARY = {
  totalDebit: 0,
  totalCredit: 0,
};

function TrialBalance() {
  const { settings } = useSettings();

  const [accounts, setAccounts] = useState([]);

  const [totalDebit, setTotalDebit] = useState(0);
  const [totalCredit, setTotalCredit] = useState(0);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const fetchTrialBalance = async () => {
    try {
      setLoading(true);
      setError("");

      const response = await accountingApi.getTrialBalance();

      const data = response?.data || {};

      const nextAccounts = Array.isArray(data.accounts)
        ? data.accounts
        : [];

      const nextTotalDebit = Number(data.totalDebit || 0);
      const nextTotalCredit = Number(data.totalCredit || 0);

      setAccounts(nextAccounts);
      setTotalDebit(nextTotalDebit);
      setTotalCredit(nextTotalCredit);
    } catch (err) {
      console.error("Failed to load trial balance:", err);

      setError(
        err.response?.data?.message || "Failed to load trial balance.",
      );

      setAccounts([]);
      setTotalDebit(0);
      setTotalCredit(0);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTrialBalance();
  }, []);

  /*
   * Trial Balance status should be derived from the actual totals
   * instead of blindly trusting a backend boolean.
   *
   * Small floating-point differences are normalized to 2 decimals
   * because the system displays monetary values to 2 decimal places.
   */
  const difference = useMemo(() => {
    return Number(Math.abs(totalDebit - totalCredit).toFixed(2));
  }, [totalDebit, totalCredit]);

  const isBalanced = useMemo(() => {
    return difference === 0;
  }, [difference]);

  const handleExportCsv = () => {
    if (accounts.length === 0) {
      return;
    }

    const headers = [
      "Account Code",
      "Account Name",
      "Account Type",
      "Debit",
      "Credit",
    ];

    const rows = accounts.map((item) => [
      item.account?.accountCode || "",
      item.account?.accountName || "Unknown Account",
      item.account?.accountType || "",
      Number(item.debit || 0),
      Number(item.credit || 0),
    ]);

    rows.push([
      "",
      "TOTAL",
      "",
      totalDebit,
      totalCredit,
    ]);

    exportToCsv("trial-balance.csv", headers, rows);
  };

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
                Review account balances and verify that total debits equal
                total credits.
              </p>
            </div>
          </div>
        </div>

        <div className="flex flex-col gap-2 sm:flex-row">
          <Button
            type="button"
            variant="secondary"
            onClick={handleExportCsv}
            disabled={loading || accounts.length === 0}
          >
            Export CSV
          </Button>

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
      </div>

      {/* Error */}
      {error && (
        <div className="flex items-start gap-3 rounded-lg border border-red-200 bg-red-50 p-4 text-red-700 dark:border-red-900/50 dark:bg-red-950/30 dark:text-red-400">
          <FaExclamationTriangle className="mt-0.5 shrink-0" />

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

          {!isBalanced && (
            <div className="hidden text-right sm:block">
              <p className="text-xs text-red-600 dark:text-red-400">
                Debit / Credit Difference
              </p>

              <p className="text-lg font-bold text-red-700 dark:text-red-300">
                {formatCurrency(difference, settings?.currency)}
              </p>
            </div>
          )}
        </div>
      )}

      {/* Summary */}
      <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
        {/* Accounts */}
        <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-700 dark:bg-slate-900">
          <p className="text-sm text-slate-500 dark:text-slate-400">
            Accounts
          </p>

          <p className="mt-1 text-2xl font-bold text-slate-900 dark:text-white">
            {accounts.length}
          </p>
        </div>

        {/* Total Debit */}
        <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-700 dark:bg-slate-900">
          <p className="text-sm text-slate-500 dark:text-slate-400">
            Total Debit
          </p>

          <p className="mt-1 text-2xl font-bold text-slate-900 dark:text-white">
            {formatCurrency(totalDebit, settings?.currency)}
          </p>
        </div>

        {/* Total Credit */}
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
              Debit and credit balances from posted journal entries.
            </p>
          </div>
        </div>

        {loading ? (
          <div className="p-10 text-center text-sm text-slate-500 dark:text-slate-400">
            Loading trial balance...
          </div>
        ) : accounts.length === 0 ? (
          <div className="p-10 text-center">
            <p className="text-sm font-medium text-slate-700 dark:text-slate-300">
              No trial balance accounts found.
            </p>

            <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
              Posted journal entries will appear here.
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[750px]">
              <thead className="bg-slate-50 dark:bg-slate-800">
                <tr>
                  <th className="px-5 py-3 text-left text-xs font-semibold uppercase tracking-wide text-slate-500 dark:text-slate-400">
                    Account Code
                  </th>

                  <th className="px-5 py-3 text-left text-xs font-semibold uppercase tracking-wide text-slate-500 dark:text-slate-400">
                    Account Name
                  </th>

                  <th className="px-5 py-3 text-left text-xs font-semibold uppercase tracking-wide text-slate-500 dark:text-slate-400">
                    Type
                  </th>

                  <th className="px-5 py-3 text-right text-xs font-semibold uppercase tracking-wide text-slate-500 dark:text-slate-400">
                    Debit
                  </th>

                  <th className="px-5 py-3 text-right text-xs font-semibold uppercase tracking-wide text-slate-500 dark:text-slate-400">
                    Credit
                  </th>
                </tr>
              </thead>

              <tbody className="divide-y divide-slate-200 dark:divide-slate-700">
                {accounts.map((item, index) => {
                  const account = item.account || {};

                  const debit = Number(item.debit || 0);
                  const credit = Number(item.credit || 0);

                  return (
                    <tr
                      key={account._id || account.accountCode || index}
                      className="hover:bg-slate-50 dark:hover:bg-slate-800/50"
                    >
                      <td className="whitespace-nowrap px-5 py-4 text-sm font-medium text-slate-700 dark:text-slate-300">
                        {account.accountCode || "-"}
                      </td>

                      <td className="px-5 py-4">
                        <div className="font-medium text-slate-900 dark:text-white">
                          {account.accountName || "Unknown Account"}
                        </div>
                      </td>

                      <td className="px-5 py-4">
                        <span className="text-xs capitalize text-slate-500 dark:text-slate-400">
                          {account.accountType || "-"}
                        </span>
                      </td>

                      <td className="whitespace-nowrap px-5 py-4 text-right text-sm font-medium text-slate-900 dark:text-white">
                        {debit > 0
                          ? formatCurrency(debit, settings?.currency)
                          : "-"}
                      </td>

                      <td className="whitespace-nowrap px-5 py-4 text-right text-sm font-medium text-slate-900 dark:text-white">
                        {credit > 0
                          ? formatCurrency(credit, settings?.currency)
                          : "-"}
                      </td>
                    </tr>
                  );
                })}
              </tbody>

              {/* Totals */}
              <tfoot className="border-t border-slate-200 bg-slate-50 dark:border-slate-700 dark:bg-slate-800">
                <tr>
                  <td
                    colSpan={3}
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

        {/* Bottom Balance Check */}
        {!loading && accounts.length > 0 && (
          <div className="border-t border-slate-200 px-5 py-3 dark:border-slate-700">
            <div className="flex flex-col gap-1 text-xs sm:flex-row sm:items-center sm:justify-between">
              <span className="text-slate-500 dark:text-slate-400">
                Balance Check
              </span>

              <span
                className={`font-semibold ${
                  isBalanced
                    ? "text-emerald-600 dark:text-emerald-400"
                    : "text-red-600 dark:text-red-400"
                }`}
              >
                {isBalanced
                  ? "Debits and credits are equal."
                  : `Difference: ${formatCurrency(
                      difference,
                      settings?.currency,
                    )}`}
              </span>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default TrialBalance;

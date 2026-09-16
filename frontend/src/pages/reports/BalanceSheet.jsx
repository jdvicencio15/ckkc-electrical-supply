import { useEffect, useState } from "react";
import { FaArrowLeft, FaBalanceScale } from "react-icons/fa";
import { Link } from "react-router-dom";

import reportsApi from "../../api/reportsApi";
import exportToCsv from "../../utils/exportCsv";

import { useSettings } from "../../context/SettingsContext";
import { formatCurrency } from "../../utils/currency";

const DEFAULT_SUMMARY = {
  totalAssets: 0,
  totalLiabilities: 0,
  totalEquity: 0,
  totalLiabilitiesAndEquity: 0,
  difference: 0,
  isBalanced: false,
};

const BalanceSheet = () => {
  const { settings } = useSettings();

  const [assets, setAssets] = useState([]);
  const [liabilities, setLiabilities] = useState([]);
  const [equity, setEquity] = useState([]);
  const [currentNetIncome, setCurrentNetIncome] = useState(0);

  const [summary, setSummary] = useState(DEFAULT_SUMMARY);

  const [asOfDate, setAsOfDate] = useState("");

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const fetchReport = async (params = {}) => {
    try {
      setLoading(true);
      setError("");

      const response = await reportsApi.getBalanceSheet(params);

      if (!response?.success) {
        throw new Error(
          response?.message || "Failed to load balance sheet.",
        );
      }

      const data = response.data || {};

      setAssets(Array.isArray(data.assets) ? data.assets : []);
      setLiabilities(
        Array.isArray(data.liabilities) ? data.liabilities : [],
      );
      setEquity(Array.isArray(data.equity) ? data.equity : []);

      setCurrentNetIncome(Number(data.currentNetIncome || 0));

      setSummary({
        totalAssets: Number(data.summary?.totalAssets || 0),
        totalLiabilities: Number(data.summary?.totalLiabilities || 0),
        totalEquity: Number(data.summary?.totalEquity || 0),
        totalLiabilitiesAndEquity: Number(
          data.summary?.totalLiabilitiesAndEquity || 0,
        ),
        difference: Number(data.summary?.difference || 0),
        isBalanced: Boolean(data.summary?.isBalanced),
      });
    } catch (err) {
      console.error("Failed to load balance sheet:", err);

      setError(
        err.response?.data?.message ||
          err.message ||
          "Failed to load balance sheet.",
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchReport();
  }, []);

  const handleGenerateReport = () => {
    const params = {};

    if (asOfDate) {
      params.asOfDate = asOfDate;
    }

    fetchReport(params);
  };

  const handleClearFilter = () => {
    setAsOfDate("");
    fetchReport();
  };

  const handleExportCsv = () => {
    if (loading) {
      return;
    }

    const headers = ["Section", "Account Code", "Account", "Amount"];

    const rows = [
      // Assets
      ...assets.map((account) => [
        "Assets",
        account.accountCode || "",
        account.accountName || "",
        Number(account.balance || 0),
      ]),

      ["Assets", "", "Total Assets", summary.totalAssets],

      // Liabilities
      ...liabilities.map((account) => [
        "Liabilities",
        account.accountCode || "",
        account.accountName || "",
        Number(account.balance || 0),
      ]),

      [
        "Liabilities",
        "",
        "Total Liabilities",
        summary.totalLiabilities,
      ],

      // Equity
      ...equity.map((account) => [
        "Equity",
        account.accountCode || "",
        account.accountName || "",
        Number(account.balance || 0),
      ]),

      ["Equity", "", "Current Net Income", currentNetIncome],

      ["Equity", "", "Total Equity", summary.totalEquity],

      // Balance Check
      [
        "Balance Check",
        "",
        "Liabilities + Equity",
        summary.totalLiabilitiesAndEquity,
      ],

      [
        "Balance Check",
        "",
        "Total Assets",
        summary.totalAssets,
      ],

      ["Balance Check", "", "Difference", summary.difference],

      [
        "Balance Check",
        "",
        "Status",
        summary.isBalanced ? "Balanced" : "Not Balanced",
      ],
    ];

    exportToCsv("balance-sheet.csv", headers, rows);
  };

  const hasReportData =
    assets.length > 0 ||
    liabilities.length > 0 ||
    equity.length > 0 ||
    summary.totalAssets !== 0 ||
    summary.totalLiabilities !== 0 ||
    summary.totalEquity !== 0;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <div className="mb-3">
            <Link
              to="/reports"
              className="inline-flex items-center gap-2 text-sm font-medium text-slate-500 transition hover:text-green-600 dark:text-slate-400 dark:hover:text-green-400"
            >
              <FaArrowLeft className="h-3 w-3" />
              Back to Reports
            </Link>
          </div>

          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-green-50 text-green-600 dark:bg-green-950/30 dark:text-green-400">
              <FaBalanceScale className="h-4 w-4" />
            </div>

            <div>
              <h1 className="text-2xl font-bold text-slate-900 dark:text-slate-100">
                Balance Sheet
              </h1>

              <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
                Review assets, liabilities, and equity.
              </p>
            </div>
          </div>
        </div>

        {/* Export */}
        <button
          type="button"
          onClick={handleExportCsv}
          disabled={loading || !hasReportData}
          className="inline-flex items-center justify-center rounded-lg border border-slate-300 bg-white px-4 py-2 text-sm font-medium text-slate-700 transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-50 dark:border-slate-600 dark:bg-slate-800 dark:text-slate-200 dark:hover:bg-slate-700"
        >
          Export CSV
        </button>
      </div>

      {/* Filter */}
      <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm dark:border-slate-800 dark:bg-slate-900">
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
          <div>
            <label
              htmlFor="balance-sheet-as-of-date"
              className="mb-1 block text-sm font-medium text-slate-700 dark:text-slate-300"
            >
              As of Date
            </label>

            <input
              id="balance-sheet-as-of-date"
              type="date"
              value={asOfDate}
              onChange={(e) => setAsOfDate(e.target.value)}
              className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 outline-none focus:border-gray-500 dark:border-slate-600 dark:bg-slate-800 dark:text-white"
            />
          </div>

          <div className="flex items-end gap-2">
            <button
              type="button"
              onClick={handleGenerateReport}
              disabled={loading}
              className="flex-1 rounded-lg bg-gray-900 px-4 py-2 text-sm font-medium text-white transition hover:bg-gray-700 disabled:cursor-not-allowed disabled:opacity-50 dark:bg-white dark:text-gray-900 dark:hover:bg-gray-200"
            >
              {loading ? "Loading..." : "Generate Report"}
            </button>

            {asOfDate && (
              <button
                type="button"
                onClick={handleClearFilter}
                disabled={loading}
                className="rounded-lg border border-slate-300 bg-white px-4 py-2 text-sm font-medium text-slate-700 transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-50 dark:border-slate-600 dark:bg-slate-800 dark:text-slate-200 dark:hover:bg-slate-700"
              >
                Clear
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Error */}
      {error && (
        <div className="rounded-lg border border-red-200 bg-red-50 p-4 text-sm text-red-700 dark:border-red-900 dark:bg-red-950/30 dark:text-red-400">
          {error}
        </div>
      )}

      {/* Summary */}
      <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
        {/* Assets */}
        <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-slate-900">
          <p className="text-sm text-slate-500 dark:text-slate-400">
            Total Assets
          </p>

          <p className="mt-2 text-2xl font-bold text-slate-900 dark:text-white">
            {formatCurrency(summary.totalAssets, settings?.currency)}
          </p>
        </div>

        {/* Liabilities */}
        <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-slate-900">
          <p className="text-sm text-slate-500 dark:text-slate-400">
            Total Liabilities
          </p>

          <p className="mt-2 text-2xl font-bold text-slate-900 dark:text-white">
            {formatCurrency(summary.totalLiabilities, settings?.currency)}
          </p>
        </div>

        {/* Equity */}
        <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-slate-900">
          <p className="text-sm text-slate-500 dark:text-slate-400">
            Total Equity
          </p>

          <p className="mt-2 text-2xl font-bold text-slate-900 dark:text-white">
            {formatCurrency(summary.totalEquity, settings?.currency)}
          </p>
        </div>
      </div>

      {/* Balance Status */}
      <div
        className={`rounded-xl border p-4 ${
          summary.isBalanced
            ? "border-green-200 bg-green-50 dark:border-green-900 dark:bg-green-950/30"
            : "border-red-200 bg-red-50 dark:border-red-900 dark:bg-red-950/30"
        }`}
      >
        <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p
              className={`font-semibold ${
                summary.isBalanced
                  ? "text-green-800 dark:text-green-300"
                  : "text-red-800 dark:text-red-300"
              }`}
            >
              {summary.isBalanced
                ? "Balance Sheet is Balanced"
                : "Balance Sheet is Not Balanced"}
            </p>

            <p
              className={`text-sm ${
                summary.isBalanced
                  ? "text-green-700 dark:text-green-400"
                  : "text-red-700 dark:text-red-400"
              }`}
            >
              Assets = Liabilities + Equity
            </p>
          </div>

          <div
            className={`text-sm font-semibold ${
              summary.isBalanced
                ? "text-green-800 dark:text-green-300"
                : "text-red-800 dark:text-red-300"
            }`}
          >
            Difference:{" "}
            {formatCurrency(summary.difference, settings?.currency)}
          </div>
        </div>
      </div>

      {/* Balance Sheet */}
      <div className="rounded-xl border border-slate-200 bg-white shadow-sm dark:border-slate-800 dark:bg-slate-900">
        <div className="border-b border-slate-200 p-5 dark:border-slate-800">
          <h2 className="font-semibold text-slate-900 dark:text-white">
            Balance Sheet
          </h2>

          <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
            Financial position based on posted journal entries.
          </p>
        </div>

        {loading ? (
          <div className="p-6 text-center text-sm text-slate-500 dark:text-slate-400">
            Loading balance sheet...
          </div>
        ) : (
          <div className="p-5">
            {/* Assets */}
            <section>
              <h3 className="mb-3 text-sm font-semibold uppercase tracking-wide text-slate-500 dark:text-slate-400">
                Assets
              </h3>

              {assets.length === 0 ? (
                <p className="py-4 text-sm text-slate-500 dark:text-slate-400">
                  No assets recorded.
                </p>
              ) : (
                <div className="space-y-3">
                  {assets.map((account) => (
                    <div
                      key={account.accountId}
                      className="flex items-center justify-between border-b border-slate-100 pb-3 dark:border-slate-800"
                    >
                      <div>
                        <p className="font-medium text-slate-900 dark:text-white">
                          {account.accountName}
                        </p>

                        <p className="text-xs text-slate-500 dark:text-slate-400">
                          {account.accountCode}
                        </p>
                      </div>

                      <p className="font-medium text-slate-900 dark:text-white">
                        {formatCurrency(
                          Number(account.balance || 0),
                          settings?.currency,
                        )}
                      </p>
                    </div>
                  ))}

                  <div className="flex justify-between pt-2 font-bold text-slate-900 dark:text-white">
                    <span>Total Assets</span>

                    <span>
                      {formatCurrency(
                        summary.totalAssets,
                        settings?.currency,
                      )}
                    </span>
                  </div>
                </div>
              )}
            </section>

            {/* Liabilities */}
            <section className="mt-8">
              <h3 className="mb-3 text-sm font-semibold uppercase tracking-wide text-slate-500 dark:text-slate-400">
                Liabilities
              </h3>

              {liabilities.length === 0 ? (
                <p className="py-4 text-sm text-slate-500 dark:text-slate-400">
                  No liabilities recorded.
                </p>
              ) : (
                <div className="space-y-3">
                  {liabilities.map((account) => (
                    <div
                      key={account.accountId}
                      className="flex items-center justify-between border-b border-slate-100 pb-3 dark:border-slate-800"
                    >
                      <div>
                        <p className="font-medium text-slate-900 dark:text-white">
                          {account.accountName}
                        </p>

                        <p className="text-xs text-slate-500 dark:text-slate-400">
                          {account.accountCode}
                        </p>
                      </div>

                      <p className="font-medium text-slate-900 dark:text-white">
                        {formatCurrency(
                          Number(account.balance || 0),
                          settings?.currency,
                        )}
                      </p>
                    </div>
                  ))}

                  <div className="flex justify-between pt-2 font-bold text-slate-900 dark:text-white">
                    <span>Total Liabilities</span>

                    <span>
                      {formatCurrency(
                        summary.totalLiabilities,
                        settings?.currency,
                      )}
                    </span>
                  </div>
                </div>
              )}
            </section>

            {/* Equity */}
            <section className="mt-8">
              <h3 className="mb-3 text-sm font-semibold uppercase tracking-wide text-slate-500 dark:text-slate-400">
                Equity
              </h3>

              {equity.length === 0 && currentNetIncome === 0 ? (
                <p className="py-4 text-sm text-slate-500 dark:text-slate-400">
                  No equity recorded.
                </p>
              ) : (
                <div className="space-y-3">
                  {equity.map((account) => (
                    <div
                      key={account.accountId}
                      className="flex items-center justify-between border-b border-slate-100 pb-3 dark:border-slate-800"
                    >
                      <div>
                        <p className="font-medium text-slate-900 dark:text-white">
                          {account.accountName}
                        </p>

                        <p className="text-xs text-slate-500 dark:text-slate-400">
                          {account.accountCode}
                        </p>
                      </div>

                      <p className="font-medium text-slate-900 dark:text-white">
                        {formatCurrency(
                          Number(account.balance || 0),
                          settings?.currency,
                        )}
                      </p>
                    </div>
                  ))}

                  {/* Current Net Income */}
                  <div className="flex items-center justify-between border-b border-slate-100 pb-3 dark:border-slate-800">
                    <div>
                      <p className="font-medium text-slate-900 dark:text-white">
                        Current Net Income
                      </p>

                      <p className="text-xs text-slate-500 dark:text-slate-400">
                        Current period earnings
                      </p>
                    </div>

                    <p className="font-medium text-slate-900 dark:text-white">
                      {formatCurrency(
                        currentNetIncome,
                        settings?.currency,
                      )}
                    </p>
                  </div>

                  {/* Total Equity */}
                  <div className="flex justify-between pt-2 font-bold text-slate-900 dark:text-white">
                    <span>Total Equity</span>

                    <span>
                      {formatCurrency(
                        summary.totalEquity,
                        settings?.currency,
                      )}
                    </span>
                  </div>
                </div>
              )}
            </section>

            {/* Final Equation */}
            <section className="mt-8 border-t-2 border-slate-200 pt-5 dark:border-slate-700">
              <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                <span className="text-lg font-bold text-slate-900 dark:text-white">
                  Liabilities + Equity
                </span>

                <span className="text-xl font-bold text-slate-900 dark:text-white">
                  {formatCurrency(
                    summary.totalLiabilitiesAndEquity,
                    settings?.currency,
                  )}
                </span>
              </div>

              <div className="mt-2 flex justify-between text-sm text-slate-500 dark:text-slate-400">
                <span>Total Assets</span>

                <span>
                  {formatCurrency(
                    summary.totalAssets,
                    settings?.currency,
                  )}
                </span>
              </div>

              <div className="mt-1 flex justify-between text-sm font-medium text-slate-600 dark:text-slate-300">
                <span>Difference</span>

                <span>
                  {formatCurrency(
                    summary.difference,
                    settings?.currency,
                  )}
                </span>
              </div>
            </section>
          </div>
        )}
      </div>
    </div>
  );
};

export default BalanceSheet;
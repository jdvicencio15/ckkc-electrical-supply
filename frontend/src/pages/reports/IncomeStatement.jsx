import { useEffect, useState } from "react";
import { FaArrowLeft, FaFileInvoiceDollar } from "react-icons/fa";
import { Link } from "react-router-dom";
import reportsApi from "../../api/reportsApi";
import exportToCsv from "../../utils/exportCsv";

const IncomeStatement = () => {
  const [revenue, setRevenue] = useState([]);
  const [expenses, setExpenses] = useState([]);

  const [summary, setSummary] = useState({
    totalRevenue: 0,
    totalExpenses: 0,
    netIncome: 0,
  });

  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const fetchReport = async (params = {}) => {
    try {
      setLoading(true);
      setError("");

      const response = await reportsApi.getIncomeStatement(params);

      if (response.success) {
        setRevenue(response.data.revenue || []);
        setExpenses(response.data.expenses || []);

        setSummary(
          response.data.summary || {
            totalRevenue: 0,
            totalExpenses: 0,
            netIncome: 0,
          }
        );
      }
    } catch (err) {
      setError(
        err.response?.data?.message ||
          "Failed to load income statement."
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

  if (startDate) {
    params.startDate = startDate;
  }

  if (endDate) {
    params.endDate = endDate;
  }

  fetchReport(params);
};

const handleExportCsv = () => {
  const headers = [
    "Section",
    "Account Code",
    "Account",
    "Amount",
  ];

  const rows = [
    // Revenue
    ...revenue.map((account) => [
      "Revenue",
      account.accountCode,
      account.accountName,
      account.total,
    ]),

    // Total Revenue
    ["Total Revenue", "", "", summary.totalRevenue],

    // Expenses
    ...expenses.map((account) => [
      "Expense",
      account.accountCode,
      account.accountName,
      account.total,
    ]),

    // Total Expenses
    ["Total Expenses", "", "", summary.totalExpenses],

    // Net Income
    ["Net Income", "", "", summary.netIncome],
  ];

  exportToCsv("income-statement.csv", headers, rows);
};

const formatCurrency = (value) =>
  Number(value || 0).toLocaleString("en-PH", {
    style: "currency",
    currency: "PHP",
  });
  return (
    <div className="space-y-6">
   {/* Header */}
<div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
  <div>
    <Link
      to="/reports"
      className="mb-3 inline-flex items-center gap-2 text-sm text-gray-500 hover:text-gray-900 dark:text-gray-400 dark:hover:text-white"
    >
      <FaArrowLeft />
      Back to Reports
    </Link>

    <div className="flex items-center gap-3">
      <div className="rounded-lg bg-gray-100 p-3 dark:bg-gray-800">
        <FaFileInvoiceDollar className="text-gray-700 dark:text-gray-200" />
      </div>

      <div>
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
          Income Statement
        </h1>

        <p className="text-sm text-gray-500 dark:text-gray-400">
          Review revenue, expenses, and net income.
        </p>
      </div>
    </div>
  </div>

  {/* Export Button */}
  <button
    onClick={handleExportCsv}
    disabled={loading}
    className="inline-flex items-center justify-center rounded-lg border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 transition hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-50 dark:border-gray-600 dark:bg-gray-800 dark:text-gray-200 dark:hover:bg-gray-700"
  >
    Export CSV
  </button>
</div>
      {/* Filters */}
      <div className="rounded-xl border border-gray-200 bg-white p-4 shadow-sm dark:border-gray-700 dark:bg-gray-900">
        <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
          <div>
            <label className="mb-1 block text-sm font-medium text-gray-700 dark:text-gray-300">
              Start Date
            </label>

            <input
              type="date"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
              className="w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm text-gray-900 outline-none focus:border-gray-500 dark:border-gray-600 dark:bg-gray-800 dark:text-white"
            />
          </div>

          <div>
            <label className="mb-1 block text-sm font-medium text-gray-700 dark:text-gray-300">
              End Date
            </label>

            <input
              type="date"
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
              className="w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm text-gray-900 outline-none focus:border-gray-500 dark:border-gray-600 dark:bg-gray-800 dark:text-white"
            />
          </div>

          <div className="flex items-end">
            <button
              onClick={handleGenerateReport}
              disabled={loading}
              className="w-full rounded-lg bg-gray-900 px-4 py-2 text-sm font-medium text-white transition hover:bg-gray-700 disabled:cursor-not-allowed disabled:opacity-50 dark:bg-white dark:text-gray-900 dark:hover:bg-gray-200"
            >
              {loading ? "Loading..." : "Generate Report"}
            </button>
          </div>
        </div>
      </div>

      {/* Error */}
      {error && (
        <div className="rounded-lg border border-red-200 bg-red-50 p-4 text-sm text-red-700 dark:border-red-900 dark:bg-red-950/30 dark:text-red-400">
          {error}
        </div>
      )}

      {/* Summary Cards */}
      <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
        <div className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm dark:border-gray-700 dark:bg-gray-900">
          <p className="text-sm text-gray-500 dark:text-gray-400">
            Total Revenue
          </p>

          <p className="mt-2 text-2xl font-bold text-gray-900 dark:text-white">
            {formatCurrency(summary.totalRevenue)}
          </p>
        </div>

        <div className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm dark:border-gray-700 dark:bg-gray-900">
          <p className="text-sm text-gray-500 dark:text-gray-400">
            Total Expenses
          </p>

          <p className="mt-2 text-2xl font-bold text-gray-900 dark:text-white">
            {formatCurrency(summary.totalExpenses)}
          </p>
        </div>

        <div className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm dark:border-gray-700 dark:bg-gray-900">
          <p className="text-sm text-gray-500 dark:text-gray-400">
            Net Income
          </p>

          <p className="mt-2 text-2xl font-bold text-gray-900 dark:text-white">
            {formatCurrency(summary.netIncome)}
          </p>
        </div>
      </div>

      {/* Income Statement */}
      <div className="rounded-xl border border-gray-200 bg-white shadow-sm dark:border-gray-700 dark:bg-gray-900">
        <div className="border-b border-gray-200 p-5 dark:border-gray-700">
          <h2 className="font-semibold text-gray-900 dark:text-white">
            Income Statement
          </h2>

          <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
            Revenue and expenses based on posted journal entries.
          </p>
        </div>

        {loading ? (
          <div className="p-6 text-center text-sm text-gray-500 dark:text-gray-400">
            Loading income statement...
          </div>
        ) : (
          <div className="p-5">
            {/* Revenue */}
            <div>
              <h3 className="mb-3 text-sm font-semibold uppercase tracking-wide text-gray-500 dark:text-gray-400">
                Revenue
              </h3>

              {revenue.length === 0 ? (
                <div className="py-4 text-sm text-gray-500 dark:text-gray-400">
                  No revenue recorded.
                </div>
              ) : (
                <div className="space-y-3">
                  {revenue.map((account) => (
                    <div
                      key={account.accountId}
                      className="flex items-center justify-between border-b border-gray-100 pb-3 dark:border-gray-800"
                    >
                      <div>
                        <p className="font-medium text-gray-900 dark:text-white">
                          {account.accountName}
                        </p>

                        <p className="text-xs text-gray-500 dark:text-gray-400">
                          {account.accountCode}
                        </p>
                      </div>

                      <p className="font-medium text-gray-900 dark:text-white">
                        {formatCurrency(account.total)}
                      </p>
                    </div>
                  ))}

                  <div className="flex justify-between pt-2 font-bold text-gray-900 dark:text-white">
                    <span>Total Revenue</span>
                    <span>{formatCurrency(summary.totalRevenue)}</span>
                  </div>
                </div>
              )}
            </div>

            {/* Expenses */}
            <div className="mt-8">
              <h3 className="mb-3 text-sm font-semibold uppercase tracking-wide text-gray-500 dark:text-gray-400">
                Expenses
              </h3>

              {expenses.length === 0 ? (
                <div className="py-4 text-sm text-gray-500 dark:text-gray-400">
                  No expenses recorded.
                </div>
              ) : (
                <div className="space-y-3">
                  {expenses.map((account) => (
                    <div
                      key={account.accountId}
                      className="flex items-center justify-between border-b border-gray-100 pb-3 dark:border-gray-800"
                    >
                      <div>
                        <p className="font-medium text-gray-900 dark:text-white">
                          {account.accountName}
                        </p>

                        <p className="text-xs text-gray-500 dark:text-gray-400">
                          {account.accountCode}
                        </p>
                      </div>

                      <p className="font-medium text-gray-900 dark:text-white">
                        {formatCurrency(account.total)}
                      </p>
                    </div>
                  ))}

                  <div className="flex justify-between pt-2 font-bold text-gray-900 dark:text-white">
                    <span>Total Expenses</span>
                    <span>{formatCurrency(summary.totalExpenses)}</span>
                  </div>
                </div>
              )}
            </div>

            {/* Net Income */}
            <div className="mt-8 border-t-2 border-gray-200 pt-5 dark:border-gray-700">
              <div className="flex items-center justify-between">
                <span className="text-lg font-bold text-gray-900 dark:text-white">
                  Net Income
                </span>

                <span className="text-xl font-bold text-gray-900 dark:text-white">
                  {formatCurrency(summary.netIncome)}
                </span>
              </div>

              <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
                Total Revenue − Total Expenses
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default IncomeStatement;
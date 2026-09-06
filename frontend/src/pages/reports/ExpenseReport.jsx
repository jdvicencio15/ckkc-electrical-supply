import { useEffect, useState } from "react";
import { FaArrowLeft, FaReceipt } from "react-icons/fa";
import { Link } from "react-router-dom";
import reportsApi from "../../api/reportsApi";

const ExpenseReport = () => {
  const [transactions, setTransactions] = useState([]);
  const [breakdown, setBreakdown] = useState([]);
  const [summary, setSummary] = useState({
    totalExpenses: 0,
    transactionCount: 0,
    accountCount: 0,
  });

  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const fetchReport = async (params = {}) => {
    try {
      setLoading(true);
      setError("");

      const response = await reportsApi.getExpenseReport(params);

      if (response.success) {
        setTransactions(response.data.transactions || []);
        setBreakdown(response.data.breakdown || []);
        setSummary(
          response.data.summary || {
            totalExpenses: 0,
            transactionCount: 0,
            accountCount: 0,
          }
        );
      }
    } catch (err) {
      setError(
        err.response?.data?.message || "Failed to load expense report."
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

  const formatCurrency = (value) =>
    Number(value || 0).toLocaleString("en-PH", {
      style: "currency",
      currency: "PHP",
    });

  const formatDate = (date) =>
    new Date(date).toLocaleDateString("en-PH", {
      month: "short",
      day: "numeric",
      year: "numeric",
    });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <Link
            to="/reports"
            className="mb-2 inline-flex items-center gap-2 text-sm text-gray-500 hover:text-gray-900 dark:text-gray-400 dark:hover:text-white"
          >
            <FaArrowLeft />
            Back to Reports
          </Link>

          <div className="flex items-center gap-3">
            <div className="rounded-lg bg-gray-100 p-3 dark:bg-gray-800">
              <FaReceipt className="text-gray-700 dark:text-gray-200" />
            </div>

            <div>
              <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
                Expense Report
              </h1>

              <p className="text-sm text-gray-500 dark:text-gray-400">
                Review expenses recorded through journal entries.
              </p>
            </div>
          </div>
        </div>
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
            Total Expenses
          </p>

          <p className="mt-2 text-2xl font-bold text-gray-900 dark:text-white">
            {formatCurrency(summary.totalExpenses)}
          </p>
        </div>

        <div className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm dark:border-gray-700 dark:bg-gray-900">
          <p className="text-sm text-gray-500 dark:text-gray-400">
            Transactions
          </p>

          <p className="mt-2 text-2xl font-bold text-gray-900 dark:text-white">
            {summary.transactionCount}
          </p>
        </div>

        <div className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm dark:border-gray-700 dark:bg-gray-900">
          <p className="text-sm text-gray-500 dark:text-gray-400">
            Expense Accounts
          </p>

          <p className="mt-2 text-2xl font-bold text-gray-900 dark:text-white">
            {summary.accountCount}
          </p>
        </div>
      </div>

      {/* Expense Breakdown */}
      <div className="rounded-xl border border-gray-200 bg-white shadow-sm dark:border-gray-700 dark:bg-gray-900">
        <div className="border-b border-gray-200 p-5 dark:border-gray-700">
          <h2 className="font-semibold text-gray-900 dark:text-white">
            Expense Breakdown
          </h2>

          <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
            Total expenses grouped by expense account.
          </p>
        </div>

        {loading ? (
          <div className="p-6 text-center text-sm text-gray-500 dark:text-gray-400">
            Loading expense breakdown...
          </div>
        ) : breakdown.length === 0 ? (
          <div className="p-6 text-center text-sm text-gray-500 dark:text-gray-400">
            No expense accounts found.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full text-sm">
              <thead className="bg-gray-50 dark:bg-gray-800">
                <tr>
                  <th className="px-5 py-3 text-left font-medium text-gray-500 dark:text-gray-400">
                    Account
                  </th>

                  <th className="px-5 py-3 text-right font-medium text-gray-500 dark:text-gray-400">
                    Total Expense
                  </th>
                </tr>
              </thead>

              <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                {breakdown.map((expense) => (
                  <tr
                    key={expense.accountId}
                    className="hover:bg-gray-50 dark:hover:bg-gray-800/50"
                  >
                    <td className="px-5 py-4">
                      <div className="font-medium text-gray-900 dark:text-white">
                        {expense.accountName}
                      </div>

                      <div className="text-xs text-gray-500 dark:text-gray-400">
                        {expense.accountCode}
                      </div>
                    </td>

                    <td className="px-5 py-4 text-right font-semibold text-gray-900 dark:text-white">
                      {formatCurrency(expense.total)}
                    </td>
                  </tr>
                ))}
              </tbody>

              <tfoot className="border-t border-gray-200 dark:border-gray-700">
                <tr>
                  <td className="px-5 py-4 font-bold text-gray-900 dark:text-white">
                    Total
                  </td>

                  <td className="px-5 py-4 text-right font-bold text-gray-900 dark:text-white">
                    {formatCurrency(summary.totalExpenses)}
                  </td>
                </tr>
              </tfoot>
            </table>
          </div>
        )}
      </div>

      {/* Transactions */}
      <div className="rounded-xl border border-gray-200 bg-white shadow-sm dark:border-gray-700 dark:bg-gray-900">
        <div className="border-b border-gray-200 p-5 dark:border-gray-700">
          <h2 className="font-semibold text-gray-900 dark:text-white">
            Expense Transactions
          </h2>

          <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
            Journal entry transactions posted to expense accounts.
          </p>
        </div>

        {loading ? (
          <div className="p-6 text-center text-sm text-gray-500 dark:text-gray-400">
            Loading expense transactions...
          </div>
        ) : transactions.length === 0 ? (
          <div className="p-6 text-center text-sm text-gray-500 dark:text-gray-400">
            No expense transactions found.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full text-sm">
              <thead className="bg-gray-50 dark:bg-gray-800">
                <tr>
                  <th className="px-5 py-3 text-left font-medium text-gray-500 dark:text-gray-400">
                    Date
                  </th>

                  <th className="px-5 py-3 text-left font-medium text-gray-500 dark:text-gray-400">
                    Reference
                  </th>

                  <th className="px-5 py-3 text-left font-medium text-gray-500 dark:text-gray-400">
                    Account
                  </th>

                  <th className="px-5 py-3 text-left font-medium text-gray-500 dark:text-gray-400">
                    Description
                  </th>

                  <th className="px-5 py-3 text-right font-medium text-gray-500 dark:text-gray-400">
                    Debit
                  </th>

                  <th className="px-5 py-3 text-right font-medium text-gray-500 dark:text-gray-400">
                    Credit
                  </th>

                  <th className="px-5 py-3 text-right font-medium text-gray-500 dark:text-gray-400">
                    Amount
                  </th>
                </tr>
              </thead>

              <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                {transactions.map((transaction) => (
                  <tr
                    key={`${transaction.journalEntryId}-${transaction.accountId}`}
                    className="hover:bg-gray-50 dark:hover:bg-gray-800/50"
                  >
                    <td className="whitespace-nowrap px-5 py-4 text-gray-700 dark:text-gray-300">
                      {formatDate(transaction.date)}
                    </td>

                    <td className="whitespace-nowrap px-5 py-4 font-medium text-gray-900 dark:text-white">
                      {transaction.reference || "—"}
                    </td>

                    <td className="px-5 py-4">
                      <div className="font-medium text-gray-900 dark:text-white">
                        {transaction.accountName}
                      </div>

                      <div className="text-xs text-gray-500 dark:text-gray-400">
                        {transaction.accountCode}
                      </div>
                    </td>

                    <td className="min-w-[220px] px-5 py-4 text-gray-700 dark:text-gray-300">
                      {transaction.description || "—"}
                    </td>

                    <td className="whitespace-nowrap px-5 py-4 text-right text-gray-700 dark:text-gray-300">
                      {formatCurrency(transaction.debit)}
                    </td>

                    <td className="whitespace-nowrap px-5 py-4 text-right text-gray-700 dark:text-gray-300">
                      {formatCurrency(transaction.credit)}
                    </td>

                    <td className="whitespace-nowrap px-5 py-4 text-right font-semibold text-gray-900 dark:text-white">
                      {formatCurrency(transaction.amount)}
                    </td>
                  </tr>
                ))}
              </tbody>

              <tfoot className="border-t border-gray-200 dark:border-gray-700">
                <tr>
                  <td
                    colSpan="6"
                    className="px-5 py-4 text-right font-bold text-gray-900 dark:text-white"
                  >
                    Total Expenses
                  </td>

                  <td className="px-5 py-4 text-right font-bold text-gray-900 dark:text-white">
                    {formatCurrency(summary.totalExpenses)}
                  </td>
                </tr>
              </tfoot>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};

export default ExpenseReport;
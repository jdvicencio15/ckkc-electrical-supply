import { useEffect, useState } from "react";
import { Link } from "react-router-dom";

import reportsApi from "../api/reportsApi";

function Reports() {
  const [summary, setSummary] = useState({
    sales: 0,
    purchases: 0,
    expenses: 0,
    revenue: 0,
    netProfit: 0,
  });

  const [period, setPeriod] = useState("thisMonth");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat("en-PH", {
      style: "currency",
      currency: "PHP",
    }).format(amount || 0);
  };

  const getDateRange = (selectedPeriod) => {
    const now = new Date();

    let startDate;
    let endDate;

    if (selectedPeriod === "thisMonth") {
      startDate = new Date(now.getFullYear(), now.getMonth(), 1);

      endDate = new Date(now.getFullYear(), now.getMonth() + 1, 0);
    }

    if (selectedPeriod === "lastMonth") {
      startDate = new Date(now.getFullYear(), now.getMonth() - 1, 1);

      endDate = new Date(now.getFullYear(), now.getMonth(), 0);
    }

    if (selectedPeriod === "thisQuarter") {
      const quarterStartMonth = Math.floor(now.getMonth() / 3) * 3;

      startDate = new Date(now.getFullYear(), quarterStartMonth, 1);

      endDate = new Date(now.getFullYear(), quarterStartMonth + 3, 0);
    }

    if (selectedPeriod === "thisYear") {
      startDate = new Date(now.getFullYear(), 0, 1);

      endDate = new Date(now.getFullYear(), 11, 31);
    }

    return {
      startDate: startDate.toISOString(),
      endDate: endDate.toISOString(),
    };
  };

  const fetchSummary = async () => {
    try {
      setLoading(true);
      setError("");

      const dates = getDateRange(period);

      const response = await reportsApi.getReportSummary(dates);

      setSummary(response.data);
    } catch (err) {
      console.error("Failed to load report summary:", err);

      setError(err.response?.data?.message || "Failed to load report summary.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSummary();
  }, []);

  const handleGenerateReport = () => {
    fetchSummary();
  };

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
          value={period}
          onChange={(e) => setPeriod(e.target.value)}
          className="rounded-lg border border-slate-200 bg-slate-50 px-4 py-2.5 text-sm text-slate-700 outline-none focus:border-green-500 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-300"
        >
          <option value="thisMonth">This Month</option>

          <option value="lastMonth">Last Month</option>

          <option value="thisQuarter">This Quarter</option>

          <option value="thisYear">This Year</option>
        </select>

        <button
          type="button"
          onClick={handleGenerateReport}
          disabled={loading}
          className="rounded-lg bg-green-600 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-green-700 disabled:cursor-not-allowed disabled:opacity-60"
        >
          {loading ? "Generating..." : "Generate Report"}
        </button>
      </div>

      {/* Error */}
      {error && (
        <div className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-600 dark:border-red-900/50 dark:bg-red-950/30 dark:text-red-400">
          {error}
        </div>
      )}

      {/* Report Cards */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {/* Sales */}
        <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-slate-900">
          <p className="text-sm text-slate-500 dark:text-slate-400">Sales</p>

          <p className="mt-2 text-2xl font-bold text-slate-900 dark:text-slate-100">
            {loading ? "Loading..." : formatCurrency(summary.sales)}
          </p>
        </div>

        {/* Purchases */}
        <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-slate-900">
          <p className="text-sm text-slate-500 dark:text-slate-400">
            Purchases
          </p>

          <p className="mt-2 text-2xl font-bold text-slate-900 dark:text-slate-100">
            {loading ? "Loading..." : formatCurrency(summary.purchases)}
          </p>
        </div>

        {/* Expenses */}
        <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-slate-900">
          <p className="text-sm text-slate-500 dark:text-slate-400">Expenses</p>

          <p className="mt-2 text-2xl font-bold text-slate-900 dark:text-slate-100">
            {loading ? "Loading..." : formatCurrency(summary.expenses)}
          </p>
        </div>

        {/* Net Profit */}
        <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-slate-900">
          <p className="text-sm text-slate-500 dark:text-slate-400">
            Net Profit
          </p>

          <p className="mt-2 text-2xl font-bold text-slate-900 dark:text-slate-100">
            {loading ? "Loading..." : formatCurrency(summary.netProfit)}
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
          {/* Sales Report */}
          <Link
            to="/reports/sales"
            className="rounded-xl border border-slate-200 p-5 text-left transition hover:border-green-500 hover:bg-slate-50 dark:border-slate-700 dark:hover:bg-slate-800"
          >
            <h3 className="font-semibold text-slate-900 dark:text-slate-100">
              Sales Report
            </h3>

            <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
              Review sales performance and transactions.
            </p>
          </Link>

          {/* Purchase Report */}
          <Link
            to="/reports/purchases"
            className="rounded-xl border border-slate-200 p-5 text-left transition hover:border-blue-500 hover:bg-slate-50 dark:border-slate-700 dark:hover:bg-slate-800"
          >
            <h3 className="font-semibold text-slate-900 dark:text-slate-100">
              Purchase Report
            </h3>

            <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
              Review purchases and supplier transactions.
            </p>
          </Link>

          {/* Inventory Report */}
          <Link
            to="/reports/inventory"
            className="rounded-xl border border-slate-200 p-5 text-left transition hover:border-green-500 hover:bg-slate-50 dark:border-slate-700 dark:hover:bg-slate-800"
          >
            <h3 className="font-semibold text-slate-900 dark:text-slate-100">
              Inventory Report
            </h3>

            <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
              Analyze stock levels and inventory movement.
            </p>
          </Link>

          {/* Expense Report */}
          <Link
            to="/reports/expenses"
            className="rounded-xl border border-slate-200 p-5 text-left transition hover:border-red-500 hover:bg-slate-50 dark:border-slate-700 dark:hover:bg-slate-800"
          >
            <h3 className="font-semibold text-slate-900 dark:text-slate-100">
              Expense Report
            </h3>

            <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
              Review expenses recorded in accounting.
            </p>
          </Link>

          {/* Income Statement */}
          <Link
            to="/reports/income-statement"
            className="rounded-xl border border-slate-200 p-5 text-left transition hover:border-green-500 hover:bg-slate-50 dark:border-slate-700 dark:hover:bg-slate-800"
          >
            <h3 className="font-semibold text-slate-900 dark:text-slate-100">
              Income Statement
            </h3>

            <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
              Review revenue, expenses, and net income.
            </p>
          </Link>

          {/* Balance Sheet */}
          <Link
            to="/reports/balance-sheet"
            className="rounded-xl border border-slate-200 p-5 text-left transition hover:border-blue-500 hover:bg-slate-50 dark:border-slate-700 dark:hover:bg-slate-800"
          >
            <h3 className="font-semibold text-slate-900 dark:text-slate-100">
              Balance Sheet
            </h3>

            <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
              Review assets, liabilities, and equity.
            </p>
          </Link>
        </div>
      </div>
    </div>
  );
}

export default Reports;

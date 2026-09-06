import { useEffect, useState } from "react";
import {
  FaArrowLeft,
  FaTruck,
} from "react-icons/fa";
import { Link } from "react-router-dom";

import reportsApi from "../../api/reportsApi";

function PurchaseReport() {
  const [purchases, setPurchases] = useState([]);

  const [summary, setSummary] = useState({
    totalPurchases: 0,
  });

  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const formatCurrency = (value) =>
    `₱${Number(value || 0).toLocaleString("en-PH", {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    })}`;

  const formatDate = (date) => {
    if (!date) {
      return "—";
    }

    return new Date(date).toLocaleDateString("en-PH", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  const loadPurchasesReport = async (params = {}) => {
    try {
      setLoading(true);
      setError("");

      const response =
        await reportsApi.getPurchasesReport(params);

      setPurchases(response.data?.purchases || []);

      setSummary(
        response.data?.summary || {
          totalPurchases: 0,
        }
      );
    } catch (err) {
      console.error(
        "Failed to load purchase report:",
        err
      );

      setError(
        err.response?.data?.message ||
          "Failed to load purchase report."
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadPurchasesReport();
  }, []);

  const handleGenerateReport = () => {
    const params = {};

    if (startDate) {
      params.startDate = startDate;
    }

    if (endDate) {
      params.endDate = endDate;
    }

    loadPurchasesReport(params);
  };

  return (
    <div className="space-y-6">

      {/* Header */}
      <div>
        <div className="mb-3">
          <Link
            to="/reports"
            className="inline-flex items-center gap-2 text-sm font-medium text-slate-500 transition hover:text-blue-600 dark:text-slate-400 dark:hover:text-blue-400"
          >
            <FaArrowLeft className="h-3 w-3" />
            Back to Reports
          </Link>
        </div>

        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-blue-50 text-blue-600 dark:bg-blue-950/30 dark:text-blue-400">
            <FaTruck className="h-4 w-4" />
          </div>

          <div>
            <h1 className="text-2xl font-bold text-slate-900 dark:text-slate-100">
              Purchase Report
            </h1>

            <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
              Review received purchases and supplier transactions.
            </p>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm dark:border-slate-800 dark:bg-slate-900">
        <div className="grid gap-3 md:grid-cols-3">

          <div>
            <label className="mb-1.5 block text-xs font-semibold text-slate-600 dark:text-slate-400">
              Start Date
            </label>

            <input
              type="date"
              value={startDate}
              onChange={(event) =>
                setStartDate(event.target.value)
              }
              className="w-full rounded-lg border border-slate-200 bg-slate-50 px-4 py-2.5 text-sm text-slate-700 outline-none focus:border-blue-500 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200"
            />
          </div>

          <div>
            <label className="mb-1.5 block text-xs font-semibold text-slate-600 dark:text-slate-400">
              End Date
            </label>

            <input
              type="date"
              value={endDate}
              onChange={(event) =>
                setEndDate(event.target.value)
              }
              className="w-full rounded-lg border border-slate-200 bg-slate-50 px-4 py-2.5 text-sm text-slate-700 outline-none focus:border-blue-500 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200"
            />
          </div>

          <div className="flex items-end">
            <button
              type="button"
              onClick={handleGenerateReport}
              disabled={loading}
              className="w-full rounded-lg bg-blue-600 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {loading
                ? "Generating..."
                : "Generate Report"}
            </button>
          </div>

        </div>
      </div>

      {/* Error */}
      {error && (
        <div className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-600 dark:border-red-900/50 dark:bg-red-950/30 dark:text-red-400">
          {error}
        </div>
      )}

      {/* Summary */}
      <div className="grid gap-4 sm:grid-cols-2">

        <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-slate-900">
          <p className="text-sm text-slate-500 dark:text-slate-400">
            Total Purchases
          </p>

          <p className="mt-2 text-2xl font-bold text-blue-600">
            {formatCurrency(
              summary.totalPurchases
            )}
          </p>
        </div>

        <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-slate-900">
          <p className="text-sm text-slate-500 dark:text-slate-400">
            Transactions
          </p>

          <p className="mt-2 text-2xl font-bold text-slate-900 dark:text-slate-100">
            {purchases.length}
          </p>
        </div>

      </div>

      {/* Purchase Table */}
      <div className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm dark:border-slate-800 dark:bg-slate-900">

        <div className="border-b border-slate-200 px-6 py-4 dark:border-slate-800">
          <h2 className="text-sm font-semibold text-slate-900 dark:text-slate-100">
            Purchase Transactions
          </h2>

          <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
            Received purchases included in this report.
          </p>
        </div>

        {loading ? (
          <div className="px-6 py-12 text-center">
            <p className="text-sm text-slate-500 dark:text-slate-400">
              Loading purchase report...
            </p>
          </div>
        ) : purchases.length === 0 ? (
          <div className="px-6 py-12 text-center">
            <p className="text-sm font-medium text-slate-700 dark:text-slate-300">
              No received purchases found.
            </p>

            <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
              Try adjusting your date range.
            </p>
          </div>
        ) : (
          <>
            <div className="overflow-x-auto">
              <table className="w-full min-w-[700px] text-left text-sm">
                <thead className="bg-slate-50 text-xs uppercase text-slate-500 dark:bg-slate-800/50 dark:text-slate-400">
                  <tr>
                    <th className="px-6 py-3 font-semibold">
                      Date
                    </th>

                    <th className="px-6 py-3 font-semibold">
                      Purchase No.
                    </th>

                    <th className="px-6 py-3 font-semibold">
                      Supplier
                    </th>

                    <th className="px-6 py-3 text-right font-semibold">
                      Amount
                    </th>
                  </tr>
                </thead>

                <tbody>
                  {purchases.map((purchase) => (
                    <tr
                      key={purchase._id}
                      className="border-t border-slate-100 dark:border-slate-800"
                    >
                      <td className="px-6 py-4 text-slate-500 dark:text-slate-400">
                        {formatDate(
                          purchase.purchaseDate
                        )}
                      </td>

                      <td className="px-6 py-4 font-medium text-slate-900 dark:text-slate-100">
                        {purchase.purchaseNumber}
                      </td>

                      <td className="px-6 py-4 text-slate-600 dark:text-slate-300">
                        {purchase.supplierId?.name ||
                          "Unknown Supplier"}
                      </td>

                      <td className="px-6 py-4 text-right font-semibold text-slate-900 dark:text-slate-100">
                        {formatCurrency(
                          purchase.totalAmount
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>

                <tfoot>
                  <tr className="border-t border-slate-200 bg-slate-50 dark:border-slate-800 dark:bg-slate-800/50">
                    <td
                      colSpan="3"
                      className="px-6 py-4 text-right text-sm font-semibold text-slate-700 dark:text-slate-300"
                    >
                      Total
                    </td>

                    <td className="px-6 py-4 text-right font-bold text-blue-600">
                      {formatCurrency(
                        summary.totalPurchases
                      )}
                    </td>
                  </tr>
                </tfoot>
              </table>
            </div>

            <div className="border-t border-slate-200 px-6 py-3 dark:border-slate-800">
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Showing {purchases.length}{" "}
                {purchases.length === 1
                  ? "purchase"
                  : "purchases"}
              </p>
            </div>
          </>
        )}

      </div>

    </div>
  );
}

export default PurchaseReport;
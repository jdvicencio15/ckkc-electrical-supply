import { useEffect, useState } from "react";
import {
  FaArrowLeft,
  FaBoxes,
} from "react-icons/fa";
import { Link } from "react-router-dom";

import reportsApi from "../../api/reportsApi";
import exportToCsv from "../../utils/exportCsv";


function InventoryReport() {
  const [products, setProducts] = useState([]);
  const [movements, setMovements] = useState([]);

  const [summary, setSummary] = useState({
    totalProducts: 0,
    totalStock: 0,
    lowStock: 0,
    outOfStock: 0,
  });

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

  const loadInventoryReport = async () => {
    try {
      setLoading(true);
      setError("");

      const response =
        await reportsApi.getInventoryReport();

      setProducts(response.data?.products || []);
      setMovements(response.data?.movements || []);

      setSummary(
        response.data?.summary || {
          totalProducts: 0,
          totalStock: 0,
          lowStock: 0,
          outOfStock: 0,
        }
      );
    } catch (err) {
      console.error(
        "Failed to load inventory report:",
        err
      );

      setError(
        err.response?.data?.message ||
          "Failed to load inventory report."
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadInventoryReport();
  }, []);

  const getStockStatus = (product) => {
    if ((product.currentStock || 0) === 0) {
      return "out";
    }

    if (
      (product.currentStock || 0) <=
      (product.minimumStock || 0)
    ) {
      return "low";
    }

    return "in";
  };

  const statusStyles = {
    in: "bg-green-50 text-green-700 dark:bg-green-950/30 dark:text-green-400",
    low: "bg-yellow-50 text-yellow-700 dark:bg-yellow-950/30 dark:text-yellow-400",
    out: "bg-red-50 text-red-700 dark:bg-red-950/30 dark:text-red-400",
  };

  const statusLabels = {
    in: "In Stock",
    low: "Low Stock",
    out: "Out of Stock",
  };

  const movementStyles = {
    IN: "bg-green-50 text-green-700 dark:bg-green-950/30 dark:text-green-400",
    OUT: "bg-red-50 text-red-700 dark:bg-red-950/30 dark:text-red-400",
    ADJUSTMENT:
      "bg-blue-50 text-blue-700 dark:bg-blue-950/30 dark:text-blue-400",
  };


  const handleExportCsv = () => {
  const headers = [
    "SKU",
    "Product",
    "Category",
    "Unit",
    "Current Stock",
    "Minimum Stock",
    "Status",
  ];

  const rows = products.map((product) => {
    const currentStock = Number(product.currentStock || 0);
    const minimumStock = Number(product.minimumStock || 0);

    let status = "In Stock";

    if (currentStock === 0) {
      status = "Out of Stock";
    } else if (currentStock <= minimumStock) {
      status = "Low Stock";
    }

    return [
      product.sku,
      product.name,
      product.categoryId?.name || "Uncategorized",
      product.unit,
      currentStock,
      minimumStock,
      status,
    ];
  });

  exportToCsv("inventory-report.csv", headers, rows);
  };


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
        <FaBoxes className="h-4 w-4" />
      </div>

      <div>
        <h1 className="text-2xl font-bold text-slate-900 dark:text-slate-100">
          Inventory Report
        </h1>

        <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
          Review current stock levels and inventory movements.
        </p>
      </div>
    </div>
  </div>

  {/* Export Button */}
  <button
    onClick={handleExportCsv}
    disabled={loading || products.length === 0}
    className="inline-flex items-center justify-center rounded-lg border border-slate-300 bg-white px-4 py-2 text-sm font-medium text-slate-700 transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-50 dark:border-slate-600 dark:bg-slate-800 dark:text-slate-200 dark:hover:bg-slate-700"
  >
    Export CSV
  </button>
</div>


      {/* Error */}
      {error && (
        <div className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-600 dark:border-red-900/50 dark:bg-red-950/30 dark:text-red-400">
          {error}
        </div>
      )}

      {/* Summary Cards */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">

        <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-slate-900">
          <p className="text-sm text-slate-500 dark:text-slate-400">
            Total Products
          </p>

          <p className="mt-2 text-2xl font-bold text-slate-900 dark:text-slate-100">
            {summary.totalProducts}
          </p>
        </div>

        <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-slate-900">
          <p className="text-sm text-slate-500 dark:text-slate-400">
            Total Stock
          </p>

          <p className="mt-2 text-2xl font-bold text-green-600">
            {summary.totalStock}
          </p>
        </div>

        <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-slate-900">
          <p className="text-sm text-slate-500 dark:text-slate-400">
            Low Stock
          </p>

          <p className="mt-2 text-2xl font-bold text-yellow-600">
            {summary.lowStock}
          </p>
        </div>

        <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-slate-900">
          <p className="text-sm text-slate-500 dark:text-slate-400">
            Out of Stock
          </p>

          <p className="mt-2 text-2xl font-bold text-red-500">
            {summary.outOfStock}
          </p>
        </div>

      </div>

      {/* Current Stock */}
      <div className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm dark:border-slate-800 dark:bg-slate-900">

        <div className="border-b border-slate-200 px-6 py-4 dark:border-slate-800">
          <h2 className="text-sm font-semibold text-slate-900 dark:text-slate-100">
            Current Stock
          </h2>

          <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
            Current inventory levels based on product stock balances.
          </p>
        </div>

        {loading ? (
          <div className="px-6 py-12 text-center">
            <p className="text-sm text-slate-500 dark:text-slate-400">
              Loading inventory report...
            </p>
          </div>
        ) : products.length === 0 ? (
          <div className="px-6 py-12 text-center">
            <p className="text-sm font-medium text-slate-700 dark:text-slate-300">
              No products found.
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[900px] text-left text-sm">
              <thead className="bg-slate-50 text-xs uppercase text-slate-500 dark:bg-slate-800/50 dark:text-slate-400">
                <tr>
                  <th className="px-6 py-3 font-semibold">
                    SKU
                  </th>

                  <th className="px-6 py-3 font-semibold">
                    Product
                  </th>

                  <th className="px-6 py-3 font-semibold">
                    Category
                  </th>

                  <th className="px-6 py-3 font-semibold">
                    Unit
                  </th>

                  <th className="px-6 py-3 text-right font-semibold">
                    Current Stock
                  </th>

                  <th className="px-6 py-3 text-right font-semibold">
                    Minimum Stock
                  </th>

                  <th className="px-6 py-3 font-semibold">
                    Status
                  </th>
                </tr>
              </thead>

              <tbody>
                {products.map((product) => {
                  const stockStatus =
                    getStockStatus(product);

                  return (
                    <tr
                      key={product._id}
                      className="border-t border-slate-100 dark:border-slate-800"
                    >
                      <td className="px-6 py-4 font-medium text-slate-900 dark:text-slate-100">
                        {product.sku}
                      </td>

                      <td className="px-6 py-4 text-slate-700 dark:text-slate-300">
                        {product.name}
                      </td>

                      <td className="px-6 py-4 text-slate-500 dark:text-slate-400">
                        {product.categoryId?.name ||
                          "Uncategorized"}
                      </td>

                      <td className="px-6 py-4 text-slate-500 dark:text-slate-400">
                        {product.unit}
                      </td>

                      <td className="px-6 py-4 text-right font-semibold text-slate-900 dark:text-slate-100">
                        {product.currentStock}
                      </td>

                      <td className="px-6 py-4 text-right text-slate-500 dark:text-slate-400">
                        {product.minimumStock}
                      </td>

                      <td className="px-6 py-4">
                        <span
                          className={`inline-flex rounded-full px-3 py-1 text-xs font-semibold ${statusStyles[stockStatus]}`}
                        >
                          {statusLabels[stockStatus]}
                        </span>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}

      </div>

      {/* Inventory Movements */}
      <div className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm dark:border-slate-800 dark:bg-slate-900">

        <div className="border-b border-slate-200 px-6 py-4 dark:border-slate-800">
          <h2 className="text-sm font-semibold text-slate-900 dark:text-slate-100">
            Inventory Movements
          </h2>

          <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
            History of inventory additions, deductions, and adjustments.
          </p>
        </div>

        {loading ? (
          <div className="px-6 py-12 text-center">
            <p className="text-sm text-slate-500 dark:text-slate-400">
              Loading movements...
            </p>
          </div>
        ) : movements.length === 0 ? (
          <div className="px-6 py-12 text-center">
            <p className="text-sm font-medium text-slate-700 dark:text-slate-300">
              No inventory movements found.
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[1000px] text-left text-sm">
              <thead className="bg-slate-50 text-xs uppercase text-slate-500 dark:bg-slate-800/50 dark:text-slate-400">
                <tr>
                  <th className="px-6 py-3 font-semibold">
                    Date
                  </th>

                  <th className="px-6 py-3 font-semibold">
                    Product
                  </th>

                  <th className="px-6 py-3 font-semibold">
                    Type
                  </th>

                  <th className="px-6 py-3 text-right font-semibold">
                    Quantity
                  </th>

                  <th className="px-6 py-3 text-right font-semibold">
                    Unit Cost
                  </th>

                  <th className="px-6 py-3 font-semibold">
                    Reference
                  </th>

                  <th className="px-6 py-3 font-semibold">
                    Notes
                  </th>
                </tr>
              </thead>

              <tbody>
                {movements.map((movement) => (
                  <tr
                    key={movement._id}
                    className="border-t border-slate-100 dark:border-slate-800"
                  >
                    <td className="px-6 py-4 text-slate-500 dark:text-slate-400">
                      {formatDate(movement.date)}
                    </td>

                    <td className="px-6 py-4">
                      <div>
                        <p className="font-medium text-slate-900 dark:text-slate-100">
                          {movement.productId?.name ||
                            "Unknown Product"}
                        </p>

                        <p className="text-xs text-slate-500 dark:text-slate-400">
                          {movement.productId?.sku ||
                            "—"}
                        </p>
                      </div>
                    </td>

                    <td className="px-6 py-4">
                      <span
                        className={`inline-flex rounded-full px-3 py-1 text-xs font-semibold ${
                          movementStyles[
                            movement.type
                          ] ||
                          "bg-slate-100 text-slate-700"
                        }`}
                      >
                        {movement.type}
                      </span>
                    </td>

                    <td className="px-6 py-4 text-right font-semibold text-slate-900 dark:text-slate-100">
                      {movement.quantity}{" "}
                      {movement.productId?.unit || ""}
                    </td>

                    <td className="px-6 py-4 text-right text-slate-600 dark:text-slate-300">
                      {formatCurrency(
                        movement.unitCost
                      )}
                    </td>

                    <td className="px-6 py-4 text-slate-600 dark:text-slate-300">
                      {movement.referenceType}
                    </td>

                    <td className="max-w-[250px] px-6 py-4 text-slate-500 dark:text-slate-400">
                      {movement.notes || "—"}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {!loading && movements.length > 0 && (
          <div className="border-t border-slate-200 px-6 py-3 dark:border-slate-800">
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Showing {movements.length}{" "}
              {movements.length === 1
                ? "movement"
                : "movements"}
            </p>
          </div>
        )}

      </div>

    </div>
  );
}

export default InventoryReport;
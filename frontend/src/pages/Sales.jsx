import { useEffect, useMemo, useState } from "react";
import {
  FaEdit,
  FaEye,
  FaPlus,
  FaRocket,
  FaTrash,
} from "react-icons/fa";

import saleService from "../services/saleService";
import productService from "../services/productService";
import customerService from "../services/customerService";
import clientPOService from "../services/clientPOService";

import SaleForm from "../components/sales/SaleForm";
import Toast from "../components/common/Toast";
import { useAuth } from "../context/AuthContext";

function Sales() {
  const { user } = useAuth();

  const [sales, setSales] = useState([]);
  const [products, setProducts] = useState([]);
  const [customers, setCustomers] = useState([]);
  const [clientPOs, setClientPOs] = useState([]);

  const [loading, setLoading] = useState(true);
  const [formLoading, setFormLoading] = useState(false);

  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCustomer, setSelectedCustomer] = useState("all");
  const [selectedStatus, setSelectedStatus] = useState("all");
  const [selectedDate, setSelectedDate] = useState("");

  const [showForm, setShowForm] = useState(false);
  const [editingSale, setEditingSale] = useState(null);

  const [toast, setToast] = useState({
    type: "success",
    message: "",
  });

  const canManageSales =
    user?.role === "owner" ||
    user?.role === "admin" ||
    user?.role === "sales";

  const loadSales = async () => {
    const response = await saleService.getSales();

    setSales(response.sales || []);
  };

  const loadProducts = async () => {
    const response = await productService.getProducts();

    setProducts(response.products || []);
  };

  const loadCustomers = async () => {
    const response = await customerService.getCustomers();

    setCustomers(response.customers || []);
  };

  const loadClientPOs = async () => {
    try {
      const response = await clientPOService.getClientPOs();

      setClientPOs(response.clientPOs || []);
    } catch {
      setClientPOs([]);
    }
  };

  useEffect(() => {
    const loadData = async () => {
      try {
        await Promise.all([
          loadSales(),
          loadProducts(),
          loadCustomers(),
          loadClientPOs(),
        ]);
      } catch (error) {
        console.error("Failed to load sales:", error);

        setToast({
          type: "error",
          message: "Failed to load sales data.",
        });
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, []);

  useEffect(() => {
    if (!toast.message) {
      return;
    }

    const timer = setTimeout(() => {
      setToast({
        type: "success",
        message: "",
      });
    }, 3000);

    return () => clearTimeout(timer);
  }, [toast]);

  const filteredSales = useMemo(() => {
    const search = searchTerm.toLowerCase();

    return sales.filter((sale) => {
      const customerName =
        sale.customerId?.name?.toLowerCase() || "";

      const salesNumber =
        sale.salesNumber?.toLowerCase() || "";

      const matchesSearch =
        salesNumber.includes(search) ||
        customerName.includes(search);

      const matchesCustomer =
        selectedCustomer === "all" ||
        sale.customerId?._id === selectedCustomer;

      const matchesStatus =
        selectedStatus === "all" ||
        sale.status === selectedStatus;

      const matchesDate =
        !selectedDate ||
        (sale.saleDate &&
          new Date(sale.saleDate)
            .toISOString()
            .split("T")[0] === selectedDate);

      return (
        matchesSearch &&
        matchesCustomer &&
        matchesStatus &&
        matchesDate
      );
    });
  }, [
    sales,
    searchTerm,
    selectedCustomer,
    selectedStatus,
    selectedDate,
  ]);

  const handleCreate = async (formData) => {
    try {
      setFormLoading(true);

      await saleService.createSale(formData);

      await loadSales();

      setShowForm(false);

      setToast({
        type: "success",
        message: "Sale created successfully.",
      });
    } catch (error) {
      console.error("Failed to create sale:", error);

      setToast({
        type: "error",
        message:
          error.response?.data?.message ||
          "Failed to create sale.",
      });
    } finally {
      setFormLoading(false);
    }
  };

  const handleUpdate = async (formData) => {
    try {
      setFormLoading(true);

      await saleService.updateSale(
        editingSale._id,
        formData,
      );

      await loadSales();

      setEditingSale(null);
      setShowForm(false);

      setToast({
        type: "success",
        message: "Sale updated successfully.",
      });
    } catch (error) {
      console.error("Failed to update sale:", error);

      setToast({
        type: "error",
        message:
          error.response?.data?.message ||
          "Failed to update sale.",
      });
    } finally {
      setFormLoading(false);
    }
  };

  const handleDelete = async (sale) => {
    const confirmed = window.confirm(
      `Delete sale "${sale.salesNumber}"?`,
    );

    if (!confirmed) {
      return;
    }

    try {
      await saleService.deleteSale(sale._id);

      await loadSales();

      setToast({
        type: "success",
        message: "Sale deleted successfully.",
      });
    } catch (error) {
      console.error("Failed to delete sale:", error);

      setToast({
        type: "error",
        message:
          error.response?.data?.message ||
          "Failed to delete sale.",
      });
    }
  };

  const handleRelease = async (sale) => {
    const confirmed = window.confirm(
      `Release sale "${sale.salesNumber}"?\n\nThis will deduct the required quantities from inventory.`,
    );

    if (!confirmed) {
      return;
    }

    try {
      await saleService.releaseSale(sale._id);

      await Promise.all([
        loadSales(),
        loadProducts(),
      ]);

      setToast({
        type: "success",
        message: "Sale released successfully.",
      });
    } catch (error) {
      console.error("Failed to release sale:", error);

      setToast({
        type: "error",
        message:
          error.response?.data?.message ||
          "Failed to release sale.",
      });
    }
  };

  const openCreateForm = () => {
    setEditingSale(null);
    setShowForm(true);
  };

  const openEditForm = (sale) => {
    if (sale.status === "released") {
      return;
    }

    setEditingSale(sale);
    setShowForm(true);
  };

  const closeForm = () => {
    if (formLoading) {
      return;
    }

    setShowForm(false);
    setEditingSale(null);
  };

  const closeToast = () => {
    setToast({
      type: "success",
      message: "",
    });
  };

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

  const statusStyles = {
    draft:
      "bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300",

    completed:
      "bg-blue-50 text-blue-700 dark:bg-blue-950/40 dark:text-blue-400",

    released:
      "bg-green-50 text-green-700 dark:bg-green-950/40 dark:text-green-400",

    cancelled:
      "bg-red-50 text-red-700 dark:bg-red-950/40 dark:text-red-400",
  };

  return (
    <>
      <Toast
        type={toast.type}
        message={toast.message}
        onClose={closeToast}
      />

      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
          <div>
            <h1 className="text-2xl font-bold text-slate-900 dark:text-slate-100">
              Sales
            </h1>

            <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
              Track and manage your sales transactions.
            </p>
          </div>

          {canManageSales && (
            <button
              type="button"
              onClick={openCreateForm}
              className="inline-flex items-center justify-center gap-2 rounded-lg bg-green-600 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-green-700"
            >
              <FaPlus className="h-3.5 w-3.5" />
              New Sale
            </button>
          )}
        </div>

        {/* Form */}
        {showForm && (
          <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900">
            <div className="mb-5">
              <h2 className="text-lg font-semibold text-slate-900 dark:text-slate-100">
                {editingSale ? "Edit Sale" : "New Sale"}
              </h2>

              <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
                {editingSale
                  ? "Update the sale information."
                  : "Create a new sales transaction."}
              </p>
            </div>

            <SaleForm
              sale={editingSale}
              products={products}
              customers={customers}
              clientPOs={clientPOs}
              onSubmit={
                editingSale
                  ? handleUpdate
                  : handleCreate
              }
              onCancel={closeForm}
              submitting={formLoading}
            />
          </div>
        )}

        {/* Filters */}
        <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm dark:border-slate-800 dark:bg-slate-900">
          <div className="grid gap-3 md:grid-cols-2 lg:grid-cols-4">
            <input
              type="search"
              value={searchTerm}
              onChange={(event) =>
                setSearchTerm(event.target.value)
              }
              placeholder="Search sales..."
              className="rounded-lg border border-slate-200 bg-slate-50 px-4 py-2.5 text-sm text-slate-900 outline-none focus:border-green-500 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-100"
            />

            <select
              value={selectedCustomer}
              onChange={(event) =>
                setSelectedCustomer(event.target.value)
              }
              className="rounded-lg border border-slate-200 bg-white px-4 py-2.5 text-sm text-slate-700 outline-none focus:border-green-500 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200"
            >
              <option value="all">
                All Customers
              </option>

              {customers.map((customer) => (
                <option
                  key={customer._id}
                  value={customer._id}
                >
                  {customer.name}
                </option>
              ))}
            </select>

            <select
              value={selectedStatus}
              onChange={(event) =>
                setSelectedStatus(event.target.value)
              }
              className="rounded-lg border border-slate-200 bg-white px-4 py-2.5 text-sm text-slate-700 outline-none focus:border-green-500 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200"
            >
              <option value="all">All Status</option>
              <option value="draft">Draft</option>
              <option value="completed">Completed</option>
              <option value="released">Released</option>
              <option value="cancelled">Cancelled</option>
            </select>

            <input
              type="date"
              value={selectedDate}
              onChange={(event) =>
                setSelectedDate(event.target.value)
              }
              className="rounded-lg border border-slate-200 bg-white px-4 py-2.5 text-sm text-slate-700 outline-none focus:border-green-500 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200"
            />
          </div>
        </div>

        {/* Table */}
        <div className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm dark:border-slate-800 dark:bg-slate-900">
          {loading ? (
            <div className="px-6 py-12 text-center">
              <p className="text-sm text-slate-500 dark:text-slate-400">
                Loading sales...
              </p>
            </div>
          ) : filteredSales.length === 0 ? (
            <div className="px-6 py-12 text-center">
              <p className="text-sm font-medium text-slate-700 dark:text-slate-300">
                No sales found.
              </p>

              <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
                Try adjusting your search or filters.
              </p>
            </div>
          ) : (
            <>
              <div className="overflow-x-auto">
                <table className="w-full min-w-[1000px] text-left text-sm">
                  <thead className="bg-slate-50 text-xs uppercase text-slate-500 dark:bg-slate-800/50 dark:text-slate-400">
                    <tr>
                      <th className="px-6 py-3 font-semibold">
                        Sale No.
                      </th>

                      <th className="px-6 py-3 font-semibold">
                        Customer
                      </th>

                      <th className="px-6 py-3 font-semibold">
                        Items
                      </th>

                      <th className="px-6 py-3 font-semibold">
                        Total
                      </th>

                      <th className="px-6 py-3 font-semibold">
                        Status
                      </th>

                      <th className="px-6 py-3 font-semibold">
                        Date
                      </th>

                      {canManageSales && (
                        <th className="px-6 py-3 text-right font-semibold">
                          Actions
                        </th>
                      )}
                    </tr>
                  </thead>

                  <tbody>
                    {filteredSales.map((sale) => (
                      <tr
                        key={sale._id}
                        className="border-t border-slate-100 dark:border-slate-800"
                      >
                        <td className="px-6 py-4 font-medium text-slate-900 dark:text-slate-100">
                          {sale.salesNumber}
                        </td>

                        <td className="px-6 py-4 text-slate-600 dark:text-slate-300">
                          {sale.customerId?.name ||
                            "Unknown Customer"}
                        </td>

                        <td className="px-6 py-4 text-slate-600 dark:text-slate-400">
                          {sale.items?.length || 0}
                        </td>

                        <td className="px-6 py-4 font-semibold text-slate-900 dark:text-slate-100">
                          {formatCurrency(
                            sale.totalAmount,
                          )}
                        </td>

                        <td className="px-6 py-4">
                          <span
                            className={`inline-flex rounded-full px-3 py-1 text-xs font-semibold ${
                              statusStyles[
                                sale.status
                              ] ||
                              "bg-slate-100 text-slate-700"
                            }`}
                          >
                            {sale.status
                              ?.charAt(0)
                              .toUpperCase() +
                              sale.status?.slice(1)}
                          </span>
                        </td>

                        <td className="px-6 py-4 text-slate-500 dark:text-slate-400">
                          {formatDate(sale.saleDate)}
                        </td>

                        {canManageSales && (
                          <td className="px-6 py-4">
                            <div className="flex justify-end gap-2">
                              {/* Edit */}
                              {sale.status !==
                                "released" && (
                                <button
                                  type="button"
                                  onClick={() =>
                                    openEditForm(
                                      sale,
                                    )
                                  }
                                  className="flex h-8 w-8 items-center justify-center rounded-lg text-slate-500 transition hover:bg-slate-100 hover:text-slate-900 dark:text-slate-400 dark:hover:bg-slate-800 dark:hover:text-slate-100"
                                  aria-label={`Edit ${sale.salesNumber}`}
                                >
                                  <FaEdit className="h-3.5 w-3.5" />
                                </button>
                              )}

                              {/* Delete */}
                              {sale.status !==
                                "released" && (
                                <button
                                  type="button"
                                  onClick={() =>
                                    handleDelete(
                                      sale,
                                    )
                                  }
                                  className="flex h-8 w-8 items-center justify-center rounded-lg text-red-500 transition hover:bg-red-50 hover:text-red-700 dark:text-red-400 dark:hover:bg-red-950/30"
                                  aria-label={`Delete ${sale.salesNumber}`}
                                >
                                  <FaTrash className="h-3.5 w-3.5" />
                                </button>
                              )}

                              {/* Release */}
                              {sale.status ===
                                "draft" && (
                                <button
                                  type="button"
                                  onClick={() =>
                                    handleRelease(
                                      sale,
                                    )
                                  }
                                  className="flex h-8 w-8 items-center justify-center rounded-lg text-green-600 transition hover:bg-green-50 hover:text-green-700 dark:text-green-400 dark:hover:bg-green-950/30"
                                  aria-label={`Release ${sale.salesNumber}`}
                                >
                                  <FaRocket className="h-3.5 w-3.5" />
                                </button>
                              )}

                              {/* View */}
                              {sale.status ===
                                "released" && (
                                <button
                                  type="button"
                                  className="flex h-8 w-8 items-center justify-center rounded-lg text-slate-500 transition hover:bg-slate-100 hover:text-slate-900 dark:text-slate-400 dark:hover:bg-slate-800 dark:hover:text-slate-100"
                                  aria-label={`View ${sale.salesNumber}`}
                                >
                                  <FaEye className="h-3.5 w-3.5" />
                                </button>
                              )}
                            </div>
                          </td>
                        )}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              <div className="border-t border-slate-200 px-6 py-3 dark:border-slate-800">
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  Showing {filteredSales.length}{" "}
                  {filteredSales.length === 1
                    ? "sale"
                    : "sales"}
                </p>
              </div>
            </>
          )}
        </div>
      </div>
    </>
  );
}

export default Sales;
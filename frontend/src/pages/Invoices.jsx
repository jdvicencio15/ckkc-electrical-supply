
import { useEffect, useMemo, useState } from "react";
import { useSearchParams } from "react-router-dom";
import {
  FaBan,
  FaCheck,
  FaEdit,
  FaEye,
  FaPlus,
  FaTrash,
} from "react-icons/fa";

import invoiceService from "../services/invoiceService";
import saleService from "../services/saleService";

import InvoiceForm from "../components/invoices/InvoiceForm";
import Toast from "../components/common/Toast";
import { useAuth } from "../context/AuthContext";
import ConfirmModal from "../components/ui/ConfirmModal";

import { useSettings } from "../context/SettingsContext";
import { formatCurrency } from "../utils/currency";


function Invoices() {
  const { user } = useAuth();
  const { settings } = useSettings();
  const [searchParams] = useSearchParams();

  const [invoices, setInvoices] = useState([]);
  const [sales, setSales] = useState([]);

  const [loading, setLoading] = useState(true);
  const [formLoading, setFormLoading] = useState(false);

const [searchTerm, setSearchTerm] = useState(
  searchParams.get("search") || ""
  );

  const [selectedCustomer, setSelectedCustomer] =
    useState("all");
  const [selectedStatus, setSelectedStatus] =
    useState("all");
  const [selectedDate, setSelectedDate] = useState("");

  const [showForm, setShowForm] = useState(false);
  const [editingInvoice, setEditingInvoice] =
    useState(null);

  const [viewingInvoice, setViewingInvoice] =
    useState(null);

  const [confirmAction, setConfirmAction] = useState(null);
const [confirmLoading, setConfirmLoading] = useState(false);

  const [toast, setToast] = useState({
    type: "success",
    message: "",
  });

  const canManageInvoices =
    user?.role === "owner" ||
    user?.role === "admin" ||
    user?.role === "sales" ||
    user?.role === "accounting";

  const loadInvoices = async () => {
    const response =
      await invoiceService.getInvoices();

    setInvoices(response.invoices || []);
  };

  const loadSales = async () => {
    const response = await saleService.getSales();

    setSales(response.sales || []);
  };

  useEffect(() => {
    const loadData = async () => {
      try {
        await Promise.all([
          loadInvoices(),
          loadSales(),
        ]);
      } catch (error) {
        console.error(
          "Failed to load invoices:",
          error,
        );

        setToast({
          type: "error",
          message: "Failed to load invoice data.",
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

  /*
   * Released sales that do not already have
   * an invoice.
   *
   * Backend also protects this with:
   * saleId.unique + existing invoice check.
   */
  const releasedSales = useMemo(() => {
    const invoicedSaleIds = new Set(
      invoices.map((invoice) => {
        return (
          invoice.saleId?._id ||
          invoice.saleId
        );
      }),
    );

    return sales.filter((sale) => {
      return (
        sale.status === "released" &&
        !invoicedSaleIds.has(sale._id)
      );
    });
  }, [sales, invoices]);

  /*
   * Customer filter options are derived from
   * the invoices already loaded from the backend.
   */
  const customers = useMemo(() => {
    const customerMap = new Map();

    invoices.forEach((invoice) => {
      const customer = invoice.customerId;

      if (customer?._id) {
        customerMap.set(customer._id, customer);
      }
    });

    return Array.from(customerMap.values()).sort(
      (a, b) =>
        (a.name || "").localeCompare(
          b.name || "",
        ),
    );
  }, [invoices]);

  const filteredInvoices = useMemo(() => {
    const search = searchTerm
      .trim()
      .toLowerCase();

    return invoices.filter((invoice) => {
      const invoiceNumber =
        invoice.invoiceNumber?.toLowerCase() ||
        "";

      const customerName =
        invoice.customerId?.name?.toLowerCase() ||
        "";

      const salesNumber =
        invoice.saleId?.salesNumber?.toLowerCase() ||
        "";

      const matchesSearch =
        invoiceNumber.includes(search) ||
        customerName.includes(search) ||
        salesNumber.includes(search);

      const matchesCustomer =
        selectedCustomer === "all" ||
        invoice.customerId?._id ===
          selectedCustomer;

      const matchesStatus =
        selectedStatus === "all" ||
        invoice.status === selectedStatus;

      const matchesDate =
        !selectedDate ||
        (invoice.invoiceDate &&
          new Date(invoice.invoiceDate)
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
    invoices,
    searchTerm,
    selectedCustomer,
    selectedStatus,
    selectedDate,
  ]);

  const handleCreate = async (formData) => {
    try {
      setFormLoading(true);

      await invoiceService.createInvoice(formData);

      await Promise.all([
        loadInvoices(),
        loadSales(),
      ]);

      setShowForm(false);

      setToast({
        type: "success",
        message:
          "Invoice created successfully.",
      });
    } catch (error) {
      console.error(
        "Failed to create invoice:",
        error,
      );

      setToast({
        type: "error",
        message:
          error.response?.data?.message ||
          "Failed to create invoice.",
      });
    } finally {
      setFormLoading(false);
    }
  };

  const handleUpdate = async (formData) => {
    try {
      setFormLoading(true);

      await invoiceService.updateInvoice(
        editingInvoice._id,
        formData,
      );

      await loadInvoices();

      setEditingInvoice(null);
      setShowForm(false);

      const updatedStatus =
        formData.status ||
        editingInvoice.status;

      let message =
        "Invoice updated successfully.";

      if (updatedStatus === "issued") {
        message =
          "Invoice issued successfully.";
      }

      if (updatedStatus === "cancelled") {
        message =
          "Invoice cancelled successfully.";
      }

      setToast({
        type: "success",
        message,
      });
    } catch (error) {
      console.error(
        "Failed to update invoice:",
        error,
      );

      setToast({
        type: "error",
        message:
          error.response?.data?.message ||
          "Failed to update invoice.",
      });
    } finally {
      setFormLoading(false);
    }
  };

const handleDelete = (invoice) => {
  setConfirmAction({
    type: "delete",
    invoice,
  });
};

const handleIssue = (invoice) => {
  setConfirmAction({
    type: "issue",
    invoice,
  });
};

const handleCancel = (invoice) => {
  setConfirmAction({
    type: "cancel",
    invoice,
  });
  };

  const handleConfirmAction = async () => {
  if (!confirmAction?.invoice) {
    return;
  }

  const { type, invoice } = confirmAction;

  try {
    setConfirmLoading(true);

    if (type === "delete") {
      await invoiceService.deleteInvoice(invoice._id);

      await Promise.all([
        loadInvoices(),
        loadSales(),
      ]);

      setToast({
        type: "success",
        message: "Invoice deleted successfully.",
      });
    }

    if (type === "issue") {
      await invoiceService.updateInvoice(
        invoice._id,
        {
          status: "issued",
        },
      );

      await loadInvoices();

      setToast({
        type: "success",
        message: "Invoice issued successfully.",
      });
    }

    if (type === "cancel") {
      await invoiceService.updateInvoice(
        invoice._id,
        {
          status: "cancelled",
        },
      );

      await loadInvoices();

      setToast({
        type: "success",
        message: "Invoice cancelled successfully.",
      });
    }

    setConfirmAction(null);
  } catch (error) {
    console.error(
      `Failed to ${type} invoice:`,
      error,
    );

    setToast({
      type: "error",
      message:
        error.response?.data?.message ||
        `Failed to ${type} invoice.`,
    });
  } finally {
    setConfirmLoading(false);
  }
};

const handleCancelConfirmation = () => {
  if (confirmLoading) {
    return;
  }

  setConfirmAction(null);
  };


  const openCreateForm = () => {
    setEditingInvoice(null);
    setShowForm(true);
  };

  const openEditForm = (invoice) => {
    if (invoice.status !== "draft") {
      return;
    }

    setEditingInvoice(invoice);
    setShowForm(true);
  };

  const openView = (invoice) => {
    setViewingInvoice(invoice);
  };

  const closeForm = () => {
    if (formLoading) {
      return;
    }

    setShowForm(false);
    setEditingInvoice(null);
  };

  const closeView = () => {
    setViewingInvoice(null);
  };

  const closeToast = () => {
    setToast({
      type: "success",
      message: "",
    });
  };



  const formatDate = (date) => {
    if (!date) {
      return "—";
    }

    return new Date(date).toLocaleDateString(
      "en-PH",
      {
        year: "numeric",
        month: "short",
        day: "numeric",
      },
    );
  };

  const statusStyles = {
    draft:
      "bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300",

    issued:
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

      <ConfirmModal
  isOpen={!!confirmAction}
  onClose={handleCancelConfirmation}
  onConfirm={handleConfirmAction}
  title={
    confirmAction?.type === "delete"
      ? "Delete Invoice"
      : confirmAction?.type === "issue"
        ? "Issue Invoice"
        : "Cancel Invoice"
  }
  message={
    confirmAction?.type === "delete"
      ? `Are you sure you want to delete "${confirmAction?.invoice?.invoiceNumber}"? This action cannot be undone.`
      : confirmAction?.type === "issue"
        ? `Are you sure you want to issue "${confirmAction?.invoice?.invoiceNumber}"? Once issued, the invoice can no longer be edited or deleted.`
        : `Are you sure you want to cancel "${confirmAction?.invoice?.invoiceNumber}"? A cancelled invoice cannot be edited or deleted.`
  }
  confirmText={
    confirmAction?.type === "delete"
      ? "Delete"
      : confirmAction?.type === "issue"
        ? "Issue Invoice"
        : "Cancel Invoice"
  }
  cancelText="Cancel"
  loading={confirmLoading}
      />


      <div className="space-y-6">

        {/* Header */}
        <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
          <div>
            <h1 className="text-2xl font-bold text-slate-900 dark:text-slate-100">
              Invoices
            </h1>

            <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
              Create, track, and manage customer invoices.
            </p>
          </div>

          {canManageInvoices && (
            <button
              type="button"
              onClick={openCreateForm}
              className="inline-flex items-center justify-center gap-2 rounded-lg bg-green-600 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-green-700"
            >
              <FaPlus className="h-3.5 w-3.5" />
              New Invoice
            </button>
          )}
        </div>

        {/* Form */}
        {showForm && (
          <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900">

            <div className="mb-5">
              <h2 className="text-lg font-semibold text-slate-900 dark:text-slate-100">
                {editingInvoice
                  ? "Edit Invoice"
                  : "New Invoice"}
              </h2>

              <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
                {editingInvoice
                  ? "Update the draft invoice information."
                  : "Create a new invoice from a released sale."}
              </p>
            </div>

            <InvoiceForm
              invoice={editingInvoice}
              releasedSales={releasedSales}
              onSubmit={
                editingInvoice
                  ? handleUpdate
                  : handleCreate
              }
              onCancel={closeForm}
              formLoading={formLoading}
            />
          </div>
        )}

        {/* Filters */}
        <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm dark:border-slate-800 dark:bg-slate-900">
          <div className="grid gap-3 md:grid-cols-2 lg:grid-cols-4">

            {/* Search */}
            <input
              type="search"
              value={searchTerm}
              onChange={(event) =>
                setSearchTerm(
                  event.target.value,
                )
              }
              placeholder="Search invoices..."
              className="rounded-lg border border-slate-200 bg-slate-50 px-4 py-2.5 text-sm text-slate-900 outline-none focus:border-green-500 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-100"
            />

            {/* Customer */}
            <select
              value={selectedCustomer}
              onChange={(event) =>
                setSelectedCustomer(
                  event.target.value,
                )
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

            {/* Status */}
            <select
              value={selectedStatus}
              onChange={(event) =>
                setSelectedStatus(
                  event.target.value,
                )
              }
              className="rounded-lg border border-slate-200 bg-white px-4 py-2.5 text-sm text-slate-700 outline-none focus:border-green-500 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200"
            >
              <option value="all">
                All Status
              </option>

              <option value="draft">
                Draft
              </option>

              <option value="issued">
                Issued
              </option>

              <option value="cancelled">
                Cancelled
              </option>
            </select>

            {/* Date */}
            <input
              type="date"
              value={selectedDate}
              onChange={(event) =>
                setSelectedDate(
                  event.target.value,
                )
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
                Loading invoices...
              </p>
            </div>
          ) : filteredInvoices.length === 0 ? (
            <div className="px-6 py-12 text-center">
              <p className="text-sm font-medium text-slate-700 dark:text-slate-300">
                No invoices found.
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
                        Invoice No.
                      </th>

                      <th className="px-6 py-3 font-semibold">
                        Customer
                      </th>

                      <th className="px-6 py-3 font-semibold">
                        Sale No.
                      </th>

                      <th className="px-6 py-3 font-semibold">
                        Total
                      </th>

                      <th className="px-6 py-3 font-semibold">
                        Status
                      </th>

                      <th className="px-6 py-3 font-semibold">
                        Due Date
                      </th>

                      {canManageInvoices && (
                        <th className="px-6 py-3 text-right font-semibold">
                          Actions
                        </th>
                      )}
                    </tr>
                  </thead>

                  <tbody>
                    {filteredInvoices.map(
                      (invoice) => (
                        <tr
                          key={invoice._id}
                          className="border-t border-slate-100 dark:border-slate-800"
                        >
                          <td className="px-6 py-4 font-medium text-slate-900 dark:text-slate-100">
                            {invoice.invoiceNumber}
                          </td>

                          <td className="px-6 py-4 text-slate-600 dark:text-slate-300">
                            {invoice.customerId
                              ?.name ||
                              "Unknown Customer"}
                          </td>

                          <td className="px-6 py-4 text-slate-600 dark:text-slate-400">
                            {invoice.saleId
                              ?.salesNumber ||
                              "—"}
                          </td>

                          <td className="px-6 py-4 font-semibold text-slate-900 dark:text-slate-100">
                            {formatCurrency(
  invoice.totalAmount,
  settings?.currency,
)}
                          </td>

                          <td className="px-6 py-4">
                            <span
                              className={`inline-flex rounded-full px-3 py-1 text-xs font-semibold ${
                                statusStyles[
                                  invoice.status
                                ] ||
                                "bg-slate-100 text-slate-700"
                              }`}
                            >
                              {invoice.status
                                ?.charAt(0)
                                .toUpperCase() +
                                invoice.status?.slice(
                                  1,
                                )}
                            </span>
                          </td>

                          <td className="px-6 py-4 text-slate-500 dark:text-slate-400">
                            {formatDate(
                              invoice.dueDate,
                            )}
                          </td>

                          {canManageInvoices && (
                            <td className="px-6 py-4">
                              <div className="flex justify-end gap-2">

                                {/* View */}
                                <button
                                  type="button"
                                  onClick={() =>
                                    openView(
                                      invoice,
                                    )
                                  }
                                  className="flex h-8 w-8 items-center justify-center rounded-lg text-slate-500 transition hover:bg-slate-100 hover:text-slate-900 dark:text-slate-400 dark:hover:bg-slate-800 dark:hover:text-slate-100"
                                  aria-label={`View ${invoice.invoiceNumber}`}
                                >
                                  <FaEye className="h-3.5 w-3.5" />
                                </button>

                                {/* Draft Actions */}
                                {invoice.status ===
                                  "draft" && (
                                  <>
                                    {/* Edit */}
                                    <button
                                      type="button"
                                      onClick={() =>
                                        openEditForm(
                                          invoice,
                                        )
                                      }
                                      disabled={
                                        formLoading
                                      }
                                      className="flex h-8 w-8 items-center justify-center rounded-lg text-slate-500 transition hover:bg-slate-100 hover:text-slate-900 disabled:cursor-not-allowed disabled:opacity-50 dark:text-slate-400 dark:hover:bg-slate-800 dark:hover:text-slate-100"
                                      aria-label={`Edit ${invoice.invoiceNumber}`}
                                    >
                                      <FaEdit className="h-3.5 w-3.5" />
                                    </button>

                                    {/* Issue */}
                                    <button
                                      type="button"
                                      onClick={() =>
                                        handleIssue(
                                          invoice,
                                        )
                                      }
                                      disabled={
                                        formLoading
                                      }
                                      className="flex h-8 w-8 items-center justify-center rounded-lg text-green-600 transition hover:bg-green-50 hover:text-green-700 disabled:cursor-not-allowed disabled:opacity-50 dark:text-green-400 dark:hover:bg-green-950/30"
                                      aria-label={`Issue ${invoice.invoiceNumber}`}
                                    >
                                      <FaCheck className="h-3.5 w-3.5" />
                                    </button>

                                    {/* Cancel */}
                                    <button
                                      type="button"
                                      onClick={() =>
                                        handleCancel(
                                          invoice,
                                        )
                                      }
                                      disabled={
                                        formLoading
                                      }
                                      className="flex h-8 w-8 items-center justify-center rounded-lg text-orange-500 transition hover:bg-orange-50 hover:text-orange-700 disabled:cursor-not-allowed disabled:opacity-50 dark:text-orange-400 dark:hover:bg-orange-950/30"
                                      aria-label={`Cancel ${invoice.invoiceNumber}`}
                                    >
                                      <FaBan className="h-3.5 w-3.5" />
                                    </button>

                                    {/* Delete */}
                                    <button
                                      type="button"
                                      onClick={() =>
                                        handleDelete(
                                          invoice,
                                        )
                                      }
                                      disabled={
                                        formLoading
                                      }
                                      className="flex h-8 w-8 items-center justify-center rounded-lg text-red-500 transition hover:bg-red-50 hover:text-red-700 disabled:cursor-not-allowed disabled:opacity-50 dark:text-red-400 dark:hover:bg-red-950/30"
                                      aria-label={`Delete ${invoice.invoiceNumber}`}
                                    >
                                      <FaTrash className="h-3.5 w-3.5" />
                                    </button>
                                  </>
                                )}
                              </div>
                            </td>
                          )}
                        </tr>
                      ),
                    )}
                  </tbody>
                </table>
              </div>

              <div className="border-t border-slate-200 px-6 py-3 dark:border-slate-800">
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  Showing{" "}
                  {filteredInvoices.length}{" "}
                  {filteredInvoices.length === 1
                    ? "invoice"
                    : "invoices"}
                </p>
              </div>
            </>
          )}
        </div>
      </div>

      {/* View Invoice Modal */}
      {viewingInvoice && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/50 p-4">
          <div className="max-h-[90vh] w-full max-w-4xl overflow-y-auto rounded-xl border border-slate-200 bg-white shadow-xl dark:border-slate-800 dark:bg-slate-900">

            {/* Modal Header */}
            <div className="flex items-start justify-between border-b border-slate-200 px-6 py-5 dark:border-slate-800">
              <div>
                <h2 className="text-lg font-semibold text-slate-900 dark:text-slate-100">
                  Invoice Details
                </h2>

                <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
                  {viewingInvoice.invoiceNumber}
                </p>
              </div>

              <button
                type="button"
                onClick={closeView}
                className="rounded-lg px-2 py-1 text-xl text-slate-400 transition hover:bg-slate-100 hover:text-slate-700 dark:hover:bg-slate-800 dark:hover:text-slate-200"
                aria-label="Close invoice details"
              >
                ×
              </button>
            </div>

            {/* Modal Body */}
            <div className="space-y-6 p-6">

              {/* Summary */}
              <div className="grid grid-cols-1 gap-4 md:grid-cols-4">

                <div>
                  <p className="text-xs text-slate-500 dark:text-slate-400">
                    Invoice Number
                  </p>

                  <p className="mt-1 text-sm font-semibold text-slate-900 dark:text-slate-100">
                    {viewingInvoice.invoiceNumber}
                  </p>
                </div>

                <div>
                  <p className="text-xs text-slate-500 dark:text-slate-400">
                    Customer
                  </p>

                  <p className="mt-1 text-sm font-semibold text-slate-900 dark:text-slate-100">
                    {viewingInvoice.customerId
                      ?.name || "—"}
                  </p>
                </div>

                <div>
                  <p className="text-xs text-slate-500 dark:text-slate-400">
                    Sale Number
                  </p>

                  <p className="mt-1 text-sm font-semibold text-slate-900 dark:text-slate-100">
                    {viewingInvoice.saleId
                      ?.salesNumber || "—"}
                  </p>
                </div>

                <div>
                  <p className="text-xs text-slate-500 dark:text-slate-400">
                    Status
                  </p>

                  <span
                    className={`mt-1 inline-flex rounded-full px-3 py-1 text-xs font-semibold ${
                      statusStyles[
                        viewingInvoice.status
                      ] ||
                      "bg-slate-100 text-slate-700"
                    }`}
                  >
                    {viewingInvoice.status
                      ?.charAt(0)
                      .toUpperCase() +
                      viewingInvoice.status?.slice(
                        1,
                      )}
                  </span>
                </div>
              </div>

              {/* Dates */}
              <div className="grid grid-cols-1 gap-4 md:grid-cols-3">

                <div>
                  <p className="text-xs text-slate-500 dark:text-slate-400">
                    Invoice Date
                  </p>

                  <p className="mt-1 text-sm text-slate-900 dark:text-slate-100">
                    {formatDate(
                      viewingInvoice.invoiceDate,
                    )}
                  </p>
                </div>

                <div>
                  <p className="text-xs text-slate-500 dark:text-slate-400">
                    Due Date
                  </p>

                  <p className="mt-1 text-sm text-slate-900 dark:text-slate-100">
                    {formatDate(
                      viewingInvoice.dueDate,
                    )}
                  </p>
                </div>

                <div>
                  <p className="text-xs text-slate-500 dark:text-slate-400">
                    Sale Date
                  </p>

                  <p className="mt-1 text-sm text-slate-900 dark:text-slate-100">
                    {formatDate(
                      viewingInvoice.saleId
                        ?.saleDate,
                    )}
                  </p>
                </div>
              </div>

              {/* Items */}
              <div>
                <h3 className="mb-3 text-sm font-semibold text-slate-900 dark:text-slate-100">
                  Invoice Items
                </h3>

                <div className="overflow-x-auto rounded-lg border border-slate-200 dark:border-slate-700">
                  <table className="w-full min-w-[700px] text-left text-sm">
                    <thead className="bg-slate-50 text-xs uppercase text-slate-500 dark:bg-slate-800/50 dark:text-slate-400">
                      <tr>
                        <th className="px-4 py-3 font-semibold">
                          Product
                        </th>

                        <th className="px-4 py-3 font-semibold">
                          Description
                        </th>

                        <th className="px-4 py-3 text-right font-semibold">
                          Qty
                        </th>

                        <th className="px-4 py-3 text-right font-semibold">
                          Unit Price
                        </th>

                        <th className="px-4 py-3 text-right font-semibold">
                          Amount
                        </th>
                      </tr>
                    </thead>

                    <tbody>
                      {viewingInvoice.items?.map(
                        (item, index) => {
                          const amount =
                            Number(
                              item.quantity || 0,
                            ) *
                            Number(
                              item.unitPrice || 0,
                            );

                          return (
                            <tr
                              key={
                                item.productId?._id ||
                                item.productId ||
                                index
                              }
                              className="border-t border-slate-100 dark:border-slate-800"
                            >
                              <td className="px-4 py-3 text-slate-900 dark:text-slate-100">
                                {item.productId
                                  ?.name || "—"}
                              </td>

                              <td className="px-4 py-3 text-slate-600 dark:text-slate-300">
                                {item.description ||
                                  "—"}
                              </td>

                              <td className="px-4 py-3 text-right text-slate-900 dark:text-slate-100">
                                {item.quantity}
                              </td>

                              <td className="px-4 py-3 text-right text-slate-900 dark:text-slate-100">
                                {formatCurrency(
                                  item.unitPrice,
                                  settings?.currency,
                                )}
                              </td>

                              <td className="px-4 py-3 text-right font-medium text-slate-900 dark:text-slate-100">
                                {formatCurrency(
                                  amount,
                                  settings?.currency,
                                )}
                              </td>
                            </tr>
                          );
                        },
                      )}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* Total */}
              <div className="flex justify-end border-t border-slate-200 pt-5 dark:border-slate-800">
                <div className="w-full max-w-xs">
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-slate-500 dark:text-slate-400">
                      Subtotal
                    </span>

                    <span className="text-sm text-slate-900 dark:text-slate-100">
                      {formatCurrency(
                        viewingInvoice.subtotal,
                         settings?.currency,
                      )}
                    </span>
                  </div>

                  <div className="mt-2 flex items-center justify-between">
                    <span className="text-base font-semibold text-slate-900 dark:text-slate-100">
                      Invoice Total
                    </span>

                    <span className="text-xl font-bold text-slate-900 dark:text-slate-100">
                      {formatCurrency(
                        viewingInvoice.totalAmount,
                        settings?.currency,
                      )}
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* Modal Footer */}
            <div className="flex justify-end border-t border-slate-200 px-6 py-4 dark:border-slate-800">
              <button
                type="button"
                onClick={closeView}
                className="rounded-lg border border-slate-200 bg-white px-4 py-2.5 text-sm font-semibold text-slate-700 transition hover:bg-slate-50 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-300 dark:hover:bg-slate-800"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}

export default Invoices;


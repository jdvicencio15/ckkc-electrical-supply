import { useEffect, useMemo, useState } from "react";
import { useSearchParams } from "react-router-dom";
import { FaEdit, FaEye, FaPlus, FaTrash } from "react-icons/fa";

import paymentService from "../services/paymentService";
import invoiceService from "../services/invoiceService";

import PaymentForm from "../components/payments/PaymentForm";
import Toast from "../components/common/Toast";
import ConfirmModal from "../components/ui/ConfirmModal";

import { useAuth } from "../context/AuthContext";

function Payments() {
  const { user } = useAuth();

  const [searchParams] = useSearchParams();

  const [payments, setPayments] = useState([]);
  const [invoices, setInvoices] = useState([]);

  const [loading, setLoading] = useState(true);
  const [formLoading, setFormLoading] = useState(false);

  const [searchTerm, setSearchTerm] = useState(
    searchParams.get("search") || "",
  );
  const [selectedCustomer, setSelectedCustomer] = useState("all");
  const [selectedMethod, setSelectedMethod] = useState("all");
  const [selectedDate, setSelectedDate] = useState("");

  const [showForm, setShowForm] = useState(false);
  const [editingPayment, setEditingPayment] = useState(null);

  const [viewingPayment, setViewingPayment] = useState(null);

  const [deletingPayment, setDeletingPayment] = useState(null);

  const [deleting, setDeleting] = useState(false);

  const [toast, setToast] = useState({
    type: "success",
    message: "",
  });

  const canManagePayments =
    user?.role === "owner" ||
    user?.role === "admin" ||
    user?.role === "accounting";

  const loadPayments = async () => {
    const response = await paymentService.getPayments();

    setPayments(response.payments || []);
  };

  const loadInvoices = async () => {
    const response = await invoiceService.getInvoices();

    setInvoices(response.invoices || []);
  };

  useEffect(() => {
    const loadData = async () => {
      try {
        await Promise.all([loadPayments(), loadInvoices()]);
      } catch (error) {
        console.error("Failed to load payments:", error);

        setToast({
          type: "error",
          message: "Failed to load payment data.",
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
   * Customer filter options are derived from
   * the invoices connected to existing payments.
   */
  const customers = useMemo(() => {
    const customerMap = new Map();

    payments.forEach((payment) => {
      const customer = payment.invoiceId?.customerId;

      if (customer?._id) {
        customerMap.set(customer._id, customer);
      }
    });

    return Array.from(customerMap.values()).sort((a, b) =>
      (a.name || "").localeCompare(b.name || ""),
    );
  }, [payments]);

  /*
   * Calculate the total paid for an invoice.
   *
   * Payment records are linked to invoices, so
   * customer payment information is derived from
   * the invoice relationship.
   */
  const getInvoiceTotalPaid = (invoiceId, excludePaymentId = null) => {
    return payments
      .filter((payment) => {
        const paymentInvoiceId = payment.invoiceId?._id || payment.invoiceId;

        if (paymentInvoiceId !== invoiceId) {
          return false;
        }

        if (excludePaymentId && payment._id === excludePaymentId) {
          return false;
        }

        return true;
      })
      .reduce((total, payment) => total + Number(payment.amount || 0), 0);
  };

  const getInvoiceBalance = (invoice) => {
    if (!invoice) {
      return 0;
    }

    const totalPaid = getInvoiceTotalPaid(invoice._id);

    return Math.max(Number(invoice.totalAmount || 0) - totalPaid, 0);
  };

  /*
   * Only issued invoices with an outstanding
   * balance can be selected when recording
   * a new payment.
   */
  const issuedInvoices = useMemo(() => {
    return invoices.filter((invoice) => {
      return invoice.status === "issued" && getInvoiceBalance(invoice) > 0;
    });
  }, [invoices, payments]);

  const filteredPayments = useMemo(() => {
    const search = searchTerm.trim().toLowerCase();

    return payments.filter((payment) => {
      const invoice = payment.invoiceId;
      const customer = invoice?.customerId;

      const invoiceNumber = invoice?.invoiceNumber?.toLowerCase() || "";

      const customerName = customer?.name?.toLowerCase() || "";

      const customerCode = customer?.customerCode?.toLowerCase() || "";

      const referenceNumber = payment.referenceNumber?.toLowerCase() || "";

      const matchesSearch =
        invoiceNumber.includes(search) ||
        customerName.includes(search) ||
        customerCode.includes(search) ||
        referenceNumber.includes(search);

      const matchesCustomer =
        selectedCustomer === "all" || customer?._id === selectedCustomer;

      const matchesMethod =
        selectedMethod === "all" || payment.paymentMethod === selectedMethod;

      const paymentDate = payment.paymentDate
        ? new Date(payment.paymentDate).toISOString().split("T")[0]
        : "";

      const matchesDate = !selectedDate || paymentDate === selectedDate;

      return matchesSearch && matchesCustomer && matchesMethod && matchesDate;
    });
  }, [payments, searchTerm, selectedCustomer, selectedMethod, selectedDate]);

  /*
   * Payment summary cards intentionally use
   * the complete payment dataset rather than
   * the filtered table results.
   */
  const totalCollected = useMemo(() => {
    return payments.reduce(
      (total, payment) => total + Number(payment.amount || 0),
      0,
    );
  }, [payments]);

  const totalPaymentCount = payments.length;

  const outstandingReceivables = useMemo(() => {
    return invoices
      .filter((invoice) => invoice.status === "issued")
      .reduce((total, invoice) => total + getInvoiceBalance(invoice), 0);
  }, [invoices, payments]);

  const collectedThisMonth = useMemo(() => {
    const now = new Date();

    return payments
      .filter((payment) => {
        if (!payment.paymentDate) {
          return false;
        }

        const paymentDate = new Date(payment.paymentDate);

        return (
          paymentDate.getMonth() === now.getMonth() &&
          paymentDate.getFullYear() === now.getFullYear()
        );
      })
      .reduce((total, payment) => total + Number(payment.amount || 0), 0);
  }, [payments]);

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

  const formatPaymentMethod = (method) => {
    const methods = {
      cash: "Cash",
      bank_transfer: "Bank Transfer",
      gcash: "GCash",
      maya: "Maya",
      check: "Check",
      other: "Other",
    };

    return methods[method] || method || "—";
  };

  const openCreateForm = () => {
    setEditingPayment(null);
    setShowForm(true);
  };

  const openEditForm = (payment) => {
    setEditingPayment(payment);
    setShowForm(true);
  };

  const openView = (payment) => {
    setViewingPayment(payment);
  };

  const closeForm = () => {
    if (formLoading) {
      return;
    }

    setShowForm(false);
    setEditingPayment(null);
  };

  const closeView = () => {
    setViewingPayment(null);
  };

  const closeToast = () => {
    setToast({
      type: "success",
      message: "",
    });
  };

  const handleCreate = async (formData) => {
    try {
      setFormLoading(true);

      await paymentService.createPayment(formData);

      await Promise.all([loadPayments(), loadInvoices()]);

      setShowForm(false);

      setToast({
        type: "success",
        message: "Payment recorded successfully.",
      });
    } catch (error) {
      console.error("Failed to create payment:", error);

      setToast({
        type: "error",
        message: error.response?.data?.message || "Failed to record payment.",
      });
    } finally {
      setFormLoading(false);
    }
  };

  const handleUpdate = async (formData) => {
    try {
      setFormLoading(true);

      await paymentService.updatePayment(editingPayment._id, formData);

      await Promise.all([loadPayments(), loadInvoices()]);

      setEditingPayment(null);
      setShowForm(false);

      setToast({
        type: "success",
        message: "Payment updated successfully.",
      });
    } catch (error) {
      console.error("Failed to update payment:", error);

      setToast({
        type: "error",
        message: error.response?.data?.message || "Failed to update payment.",
      });
    } finally {
      setFormLoading(false);
    }
  };

  const handleDelete = (payment) => {
    setDeletingPayment(payment);
  };

  const handleConfirmDelete = async () => {
    if (!deletingPayment) {
      return;
    }

    try {
      setDeleting(true);

      await paymentService.deletePayment(deletingPayment._id);

      await Promise.all([loadPayments(), loadInvoices()]);

      setDeletingPayment(null);

      setToast({
        type: "success",
        message: "Payment deleted successfully.",
      });
    } catch (error) {
      console.error("Failed to delete payment:", error);

      setToast({
        type: "error",
        message: error.response?.data?.message || "Failed to delete payment.",
      });
    } finally {
      setDeleting(false);
    }
  };

  const handleCancelDelete = () => {
    if (deleting) {
      return;
    }

    setDeletingPayment(null);
  };

  return (
    <>
      <Toast type={toast.type} message={toast.message} onClose={closeToast} />

      <ConfirmModal
        isOpen={!!deletingPayment}
        onClose={handleCancelDelete}
        onConfirm={handleConfirmDelete}
        title="Delete Payment"
        message={`Are you sure you want to delete this payment of ${formatCurrency(
          deletingPayment?.amount,
        )}? This action cannot be undone.`}
        confirmText="Delete"
        cancelText="Cancel"
        loading={deleting}
        loadingText="Deleting..."
      />

      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
          <div>
            <h1 className="text-2xl font-bold text-slate-900 dark:text-slate-100">
              Payments
            </h1>

            <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
              Track and manage customer payments.
            </p>
          </div>

          {canManagePayments && (
            <button
              type="button"
              onClick={openCreateForm}
              className="inline-flex items-center justify-center gap-2 rounded-lg bg-green-600 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-green-700"
            >
              <FaPlus className="h-3.5 w-3.5" />
              Record Payment
            </button>
          )}
        </div>

        {/* Form */}
        {showForm && (
          <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900">
            <div className="mb-5">
              <h2 className="text-lg font-semibold text-slate-900 dark:text-slate-100">
                {editingPayment ? "Edit Payment" : "Record Payment"}
              </h2>

              <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
                {editingPayment
                  ? "Update the payment information."
                  : "Record a payment against an issued invoice."}
              </p>
            </div>

            <PaymentForm
              payment={editingPayment}
              issuedInvoices={issuedInvoices}
              payments={payments}
              onSubmit={editingPayment ? handleUpdate : handleCreate}
              onCancel={closeForm}
              formLoading={formLoading}
            />
          </div>
        )}

        {/* Summary */}
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-slate-900">
            <p className="text-sm text-slate-500 dark:text-slate-400">
              Total Collected
            </p>

            <p className="mt-2 text-2xl font-bold text-slate-900 dark:text-slate-100">
              {formatCurrency(totalCollected)}
            </p>
          </div>

          <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-slate-900">
            <p className="text-sm text-slate-500 dark:text-slate-400">
              Payments Count
            </p>

            <p className="mt-2 text-2xl font-bold text-slate-900 dark:text-slate-100">
              {totalPaymentCount}
            </p>
          </div>

          <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-slate-900">
            <p className="text-sm text-slate-500 dark:text-slate-400">
              Outstanding Receivables
            </p>

            <p className="mt-2 text-2xl font-bold text-slate-900 dark:text-slate-100">
              {formatCurrency(outstandingReceivables)}
            </p>
          </div>

          <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-slate-900">
            <p className="text-sm text-slate-500 dark:text-slate-400">
              Collected This Month
            </p>

            <p className="mt-2 text-2xl font-bold text-slate-900 dark:text-slate-100">
              {formatCurrency(collectedThisMonth)}
            </p>
          </div>
        </div>

        {/* Filters */}
        <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm dark:border-slate-800 dark:bg-slate-900">
          <div className="grid gap-3 md:grid-cols-2 lg:grid-cols-4">
            <input
              type="search"
              value={searchTerm}
              onChange={(event) => setSearchTerm(event.target.value)}
              placeholder="Search payments..."
              className="rounded-lg border border-slate-200 bg-slate-50 px-4 py-2.5 text-sm text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-green-500 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-100"
            />

            <select
              value={selectedCustomer}
              onChange={(event) => setSelectedCustomer(event.target.value)}
              className="rounded-lg border border-slate-200 bg-white px-4 py-2.5 text-sm text-slate-700 outline-none focus:border-green-500 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200"
            >
              <option value="all">All Customers</option>

              {customers.map((customer) => (
                <option key={customer._id} value={customer._id}>
                  {customer.name}
                </option>
              ))}
            </select>

            <select
              value={selectedMethod}
              onChange={(event) => setSelectedMethod(event.target.value)}
              className="rounded-lg border border-slate-200 bg-white px-4 py-2.5 text-sm text-slate-700 outline-none focus:border-green-500 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200"
            >
              <option value="all">All Methods</option>

              <option value="cash">Cash</option>

              <option value="bank_transfer">Bank Transfer</option>

              <option value="gcash">GCash</option>

              <option value="maya">Maya</option>

              <option value="check">Check</option>

              <option value="other">Other</option>
            </select>

            <input
              type="date"
              value={selectedDate}
              onChange={(event) => setSelectedDate(event.target.value)}
              className="rounded-lg border border-slate-200 bg-white px-4 py-2.5 text-sm text-slate-700 outline-none focus:border-green-500 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200"
            />
          </div>
        </div>

        {/* Table */}
        <div className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm dark:border-slate-800 dark:bg-slate-900">
          {loading ? (
            <div className="px-6 py-12 text-center">
              <p className="text-sm text-slate-500 dark:text-slate-400">
                Loading payments...
              </p>
            </div>
          ) : filteredPayments.length === 0 ? (
            <div className="px-6 py-12 text-center">
              <p className="text-sm font-medium text-slate-700 dark:text-slate-300">
                No payments found.
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
                      <th className="px-6 py-3 font-semibold">Invoice No.</th>

                      <th className="px-6 py-3 font-semibold">Customer</th>

                      <th className="px-6 py-3 font-semibold">Reference</th>

                      <th className="px-6 py-3 font-semibold">Amount</th>

                      <th className="px-6 py-3 font-semibold">Method</th>

                      <th className="px-6 py-3 font-semibold">Date</th>

                      {canManagePayments && (
                        <th className="px-6 py-3 text-right font-semibold">
                          Actions
                        </th>
                      )}
                    </tr>
                  </thead>

                  <tbody>
                    {[...filteredPayments]
                      .sort(
                        (a, b) => new Date(b.createdAt) - new Date(a.createdAt),
                      )
                      .map((payment) => (
                        <tr
                          key={payment._id}
                          className="border-t border-slate-100 dark:border-slate-800"
                        >
                          <td className="px-6 py-4 font-medium text-slate-900 dark:text-slate-100">
                            {payment.invoiceId?.invoiceNumber || "—"}
                          </td>

                          <td className="px-6 py-4 text-slate-600 dark:text-slate-300">
                            {payment.invoiceId?.customerId?.name ||
                              "Unknown Customer"}
                          </td>

                          <td className="px-6 py-4 text-slate-600 dark:text-slate-400">
                            {payment.referenceNumber || "—"}
                          </td>

                          <td className="px-6 py-4 font-semibold text-slate-900 dark:text-slate-100">
                            {formatCurrency(payment.amount)}
                          </td>

                          <td className="px-6 py-4 text-slate-600 dark:text-slate-300">
                            {formatPaymentMethod(payment.paymentMethod)}
                          </td>

                          <td className="px-6 py-4 text-slate-500 dark:text-slate-400">
                            {formatDate(payment.paymentDate)}
                          </td>

                          {canManagePayments && (
                            <td className="px-6 py-4">
                              <div className="flex justify-end gap-2">
                                <button
                                  type="button"
                                  onClick={() => openView(payment)}
                                  className="flex h-8 w-8 items-center justify-center rounded-lg text-slate-500 transition hover:bg-slate-100 hover:text-slate-900 dark:text-slate-400 dark:hover:bg-slate-800 dark:hover:text-slate-100"
                                  aria-label="View payment"
                                >
                                  <FaEye className="h-3.5 w-3.5" />
                                </button>

                                <button
                                  type="button"
                                  onClick={() => openEditForm(payment)}
                                  disabled={formLoading}
                                  className="flex h-8 w-8 items-center justify-center rounded-lg text-slate-500 transition hover:bg-slate-100 hover:text-slate-900 disabled:cursor-not-allowed disabled:opacity-50 dark:text-slate-400 dark:hover:bg-slate-800 dark:hover:text-slate-100"
                                  aria-label="Edit payment"
                                >
                                  <FaEdit className="h-3.5 w-3.5" />
                                </button>

                                <button
                                  type="button"
                                  onClick={() => handleDelete(payment)}
                                  disabled={formLoading}
                                  className="flex h-8 w-8 items-center justify-center rounded-lg text-red-500 transition hover:bg-red-50 hover:text-red-700 disabled:cursor-not-allowed disabled:opacity-50 dark:text-red-400 dark:hover:bg-red-950/30"
                                  aria-label="Delete payment"
                                >
                                  <FaTrash className="h-3.5 w-3.5" />
                                </button>
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
                  Showing {filteredPayments.length}{" "}
                  {filteredPayments.length === 1 ? "payment" : "payments"}
                </p>
              </div>
            </>
          )}
        </div>

        {/* View Payment Modal */}
        {viewingPayment && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/50 p-4">
            <div className="max-h-[90vh] w-full max-w-3xl overflow-y-auto rounded-xl border border-slate-200 bg-white shadow-xl dark:border-slate-800 dark:bg-slate-900">
              {/* Modal Header */}
              <div className="flex items-start justify-between border-b border-slate-200 px-6 py-5 dark:border-slate-800">
                <div>
                  <h2 className="text-lg font-semibold text-slate-900 dark:text-slate-100">
                    Payment Details
                  </h2>

                  <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
                    {viewingPayment.invoiceId?.invoiceNumber || "Payment"}
                  </p>
                </div>

                <button
                  type="button"
                  onClick={closeView}
                  className="rounded-lg px-2 py-1 text-xl text-slate-400 transition hover:bg-slate-100 hover:text-slate-700 dark:hover:bg-slate-800 dark:hover:text-slate-200"
                  aria-label="Close payment details"
                >
                  ×
                </button>
              </div>

              {/* Modal Body */}
              <div className="space-y-6 p-6">
                {/* Payment Information */}
                <div>
                  <h3 className="mb-3 text-sm font-semibold text-slate-900 dark:text-slate-100">
                    Payment Information
                  </h3>

                  <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                    <div>
                      <p className="text-xs text-slate-500 dark:text-slate-400">
                        Invoice Number
                      </p>

                      <p className="mt-1 text-sm font-semibold text-slate-900 dark:text-slate-100">
                        {viewingPayment.invoiceId?.invoiceNumber || "—"}
                      </p>
                    </div>

                    <div>
                      <p className="text-xs text-slate-500 dark:text-slate-400">
                        Customer
                      </p>

                      <p className="mt-1 text-sm font-semibold text-slate-900 dark:text-slate-100">
                        {viewingPayment.invoiceId?.customerId?.name || "—"}
                      </p>
                    </div>

                    <div>
                      <p className="text-xs text-slate-500 dark:text-slate-400">
                        Payment Date
                      </p>

                      <p className="mt-1 text-sm text-slate-900 dark:text-slate-100">
                        {formatDate(viewingPayment.paymentDate)}
                      </p>
                    </div>

                    <div>
                      <p className="text-xs text-slate-500 dark:text-slate-400">
                        Payment Method
                      </p>

                      <p className="mt-1 text-sm font-medium text-slate-900 dark:text-slate-100">
                        {formatPaymentMethod(viewingPayment.paymentMethod)}
                      </p>
                    </div>

                    <div>
                      <p className="text-xs text-slate-500 dark:text-slate-400">
                        Reference Number
                      </p>

                      <p className="mt-1 text-sm text-slate-900 dark:text-slate-100">
                        {viewingPayment.referenceNumber || "—"}
                      </p>
                    </div>

                    <div>
                      <p className="text-xs text-slate-500 dark:text-slate-400">
                        Amount
                      </p>

                      <p className="mt-1 text-lg font-bold text-green-600">
                        {formatCurrency(viewingPayment.amount)}
                      </p>
                    </div>
                  </div>
                </div>

                {/* Invoice Balance */}
                <div>
                  <h3 className="mb-3 text-sm font-semibold text-slate-900 dark:text-slate-100">
                    Invoice Balance
                  </h3>

                  <div className="grid gap-4 md:grid-cols-3">
                    <div className="rounded-lg border border-slate-200 bg-slate-50 p-4 dark:border-slate-700 dark:bg-slate-800">
                      <p className="text-xs text-slate-500 dark:text-slate-400">
                        Invoice Total
                      </p>

                      <p className="mt-1 font-semibold text-slate-900 dark:text-slate-100">
                        {formatCurrency(viewingPayment.invoiceId?.totalAmount)}
                      </p>
                    </div>

                    <div className="rounded-lg border border-slate-200 bg-slate-50 p-4 dark:border-slate-700 dark:bg-slate-800">
                      <p className="text-xs text-slate-500 dark:text-slate-400">
                        Total Paid
                      </p>

                      <p className="mt-1 font-semibold text-green-600">
                        {formatCurrency(
                          getInvoiceTotalPaid(viewingPayment.invoiceId?._id),
                        )}
                      </p>
                    </div>

                    <div className="rounded-lg border border-slate-200 bg-slate-50 p-4 dark:border-slate-700 dark:bg-slate-800">
                      <p className="text-xs text-slate-500 dark:text-slate-400">
                        Remaining Balance
                      </p>

                      <p className="mt-1 font-semibold text-amber-500">
                        {formatCurrency(
                          getInvoiceBalance(viewingPayment.invoiceId),
                        )}
                      </p>
                    </div>
                  </div>
                </div>

                {/* Notes */}
                <div>
                  <p className="text-xs text-slate-500 dark:text-slate-400">
                    Notes
                  </p>

                  <p className="mt-1 whitespace-pre-wrap text-sm text-slate-700 dark:text-slate-300">
                    {viewingPayment.notes || "—"}
                  </p>
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
      </div>
    </>
  );
}

export default Payments;

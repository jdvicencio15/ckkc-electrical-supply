
import { useEffect, useMemo, useState } from "react";

function PaymentForm({
  payment = null,
  issuedInvoices = [],
  payments = [],
  onSubmit,
  onCancel,
  formLoading = false,
}) {
  const isEditMode = Boolean(payment);

  const [formData, setFormData] = useState({
    invoiceId: "",
    paymentDate: "",
    amount: "",
    paymentMethod: "cash",
    referenceNumber: "",
    notes: "",
  });

  const [selectedInvoice, setSelectedInvoice] = useState(null);

  useEffect(() => {
    if (payment) {
      const invoice =
        typeof payment.invoiceId === "object"
          ? payment.invoiceId
          : issuedInvoices.find(
              (item) => item._id === payment.invoiceId
            );

      setFormData({
        invoiceId:
          payment.invoiceId?._id ||
          payment.invoiceId ||
          "",
        paymentDate: payment.paymentDate
          ? payment.paymentDate.slice(0, 10)
          : "",
        amount:
          payment.amount !== undefined
            ? payment.amount
            : "",
        paymentMethod:
          payment.paymentMethod || "cash",
        referenceNumber:
          payment.referenceNumber || "",
        notes: payment.notes || "",
      });

      setSelectedInvoice(invoice || null);

      return;
    }

    setFormData({
      invoiceId: "",
      paymentDate: new Date()
        .toISOString()
        .slice(0, 10),
      amount: "",
      paymentMethod: "cash",
      referenceNumber: "",
      notes: "",
    });

    setSelectedInvoice(null);
  }, [payment, issuedInvoices]);

  const handleChange = (e) => {
    const { name, value } = e.target;

    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));

    if (name === "invoiceId") {
      const invoice = issuedInvoices.find(
        (item) => item._id === value
      );

      setSelectedInvoice(invoice || null);
    }
  };

  const invoicePayments = useMemo(() => {
    if (!selectedInvoice) {
      return [];
    }

    return payments.filter((item) => {
      const itemInvoiceId =
        item.invoiceId?._id || item.invoiceId;

      return (
        itemInvoiceId === selectedInvoice._id &&
        (!isEditMode ||
          item._id !== payment?._id)
      );
    });
  }, [
    payments,
    selectedInvoice,
    isEditMode,
    payment,
  ]);

  const totalPaid = useMemo(() => {
    return invoicePayments.reduce(
      (total, item) =>
        total + Number(item.amount || 0),
      0
    );
  }, [invoicePayments]);

  const remainingBalance = useMemo(() => {
    if (!selectedInvoice) {
      return 0;
    }

    return Math.max(
      0,
      Number(selectedInvoice.totalAmount || 0) -
        totalPaid
    );
  }, [selectedInvoice, totalPaid]);

  const enteredAmount = Number(
    formData.amount || 0
  );

  const exceedsBalance =
    enteredAmount > remainingBalance;

  const handleSubmit = (e) => {
    e.preventDefault();

    const submitData = {
      paymentDate:
        formData.paymentDate || undefined,
      amount: Number(formData.amount),
      paymentMethod: formData.paymentMethod,
      referenceNumber:
        formData.referenceNumber || undefined,
      notes: formData.notes || undefined,
    };

    if (!isEditMode) {
      submitData.invoiceId = formData.invoiceId;
    }

    onSubmit(submitData);
  };

  return (
    <form
      onSubmit={handleSubmit}
      className="space-y-6"
    >
      {/* Payment Information */}
      <div>
        <h2 className="text-lg font-semibold text-slate-900 dark:text-slate-100">
          {isEditMode
            ? "Edit Payment"
            : "Record Payment"}
        </h2>

        <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
          {isEditMode
            ? "Update the payment transaction details."
            : "Record a payment against an issued invoice."}
        </p>
      </div>

      {/* Basic Fields */}
      <div className="grid grid-cols-1 gap-4 md:grid-cols-2">

        {/* Invoice */}
        <div>
          <label className="mb-1.5 block text-sm font-medium text-slate-700 dark:text-slate-300">
            Invoice
          </label>

          {isEditMode ? (
            <input
              type="text"
              value={
                selectedInvoice?.invoiceNumber ||
                payment?.invoiceId?.invoiceNumber ||
                "—"
              }
              disabled
              className="w-full rounded-lg border border-slate-200 bg-slate-100 px-4 py-2.5 text-sm text-slate-600 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-400"
            />
          ) : (
            <select
              name="invoiceId"
              value={formData.invoiceId}
              onChange={handleChange}
              required
              disabled={formLoading}
              className="w-full rounded-lg border border-slate-200 bg-slate-50 px-4 py-2.5 text-sm text-slate-700 outline-none focus:border-green-500 disabled:cursor-not-allowed disabled:opacity-60 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-300"
            >
              <option value="">
                Select issued invoice
              </option>

              {issuedInvoices.map((invoice) => (
                <option
                  key={invoice._id}
                  value={invoice._id}
                >
                  {invoice.invoiceNumber}
                </option>
              ))}
            </select>
          )}
        </div>

        {/* Payment Date */}
        <div>
          <label className="mb-1.5 block text-sm font-medium text-slate-700 dark:text-slate-300">
            Payment Date
          </label>

          <input
            type="date"
            name="paymentDate"
            value={formData.paymentDate}
            onChange={handleChange}
            disabled={formLoading}
            className="w-full rounded-lg border border-slate-200 bg-slate-50 px-4 py-2.5 text-sm text-slate-700 outline-none focus:border-green-500 disabled:cursor-not-allowed disabled:opacity-60 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-300"
          />
        </div>

        {/* Amount */}
        <div>
          <label className="mb-1.5 block text-sm font-medium text-slate-700 dark:text-slate-300">
            Payment Amount
          </label>

          <input
            type="number"
            name="amount"
            value={formData.amount}
            onChange={handleChange}
            required
            min="0.01"
            step="0.01"
            disabled={
              formLoading ||
              !selectedInvoice
            }
            placeholder="e.g. 1000"
            className="w-full rounded-lg border border-slate-200 bg-slate-50 px-4 py-2.5 text-sm text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-green-500 disabled:cursor-not-allowed disabled:opacity-60 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-100"
          />

          {selectedInvoice &&
            exceedsBalance && (
              <p className="mt-1.5 text-xs font-medium text-red-600 dark:text-red-400">
                Payment exceeds the remaining
                balance.
              </p>
            )}
        </div>

        {/* Payment Method */}
        <div>
          <label className="mb-1.5 block text-sm font-medium text-slate-700 dark:text-slate-300">
            Payment Method
          </label>

          <select
            name="paymentMethod"
            value={formData.paymentMethod}
            onChange={handleChange}
            required
            disabled={formLoading}
            className="w-full rounded-lg border border-slate-200 bg-slate-50 px-4 py-2.5 text-sm text-slate-700 outline-none focus:border-green-500 disabled:cursor-not-allowed disabled:opacity-60 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-300"
          >
            <option value="cash">
              Cash
            </option>

            <option value="bank_transfer">
              Bank Transfer
            </option>

            <option value="gcash">
              GCash
            </option>

            <option value="maya">
              Maya
            </option>

            <option value="check">
              Check
            </option>

            <option value="other">
              Other
            </option>
          </select>
        </div>

        {/* Reference Number */}
        <div>
          <label className="mb-1.5 block text-sm font-medium text-slate-700 dark:text-slate-300">
            Reference Number
          </label>

          <input
            type="text"
            name="referenceNumber"
            value={formData.referenceNumber}
            onChange={handleChange}
            disabled={formLoading}
            placeholder="e.g. PAY-001"
            className="w-full rounded-lg border border-slate-200 bg-slate-50 px-4 py-2.5 text-sm text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-green-500 disabled:cursor-not-allowed disabled:opacity-60 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-100"
          />
        </div>

        {/* Notes */}
        <div>
          <label className="mb-1.5 block text-sm font-medium text-slate-700 dark:text-slate-300">
            Notes
          </label>

          <input
            type="text"
            name="notes"
            value={formData.notes}
            onChange={handleChange}
            disabled={formLoading}
            placeholder="Optional notes"
            className="w-full rounded-lg border border-slate-200 bg-slate-50 px-4 py-2.5 text-sm text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-green-500 disabled:cursor-not-allowed disabled:opacity-60 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-100"
          />
        </div>
      </div>

      {/* Payment Summary */}
      {selectedInvoice && (
        <div className="rounded-xl border border-slate-200 bg-slate-50 p-5 dark:border-slate-700 dark:bg-slate-800/50">

          <div className="mb-4">
            <h3 className="text-sm font-semibold text-slate-900 dark:text-slate-100">
              Payment Summary
            </h3>

            <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
              Payment balance is calculated from
              the invoice and recorded payment
              transactions.
            </p>
          </div>

          {/* Invoice Information */}
          <div className="grid grid-cols-1 gap-4 md:grid-cols-3">

            <div>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Invoice Number
              </p>

              <p className="mt-1 text-sm font-medium text-slate-900 dark:text-slate-100">
                {selectedInvoice.invoiceNumber ||
                  "—"}
              </p>
            </div>

            <div>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Customer
              </p>

              <p className="mt-1 text-sm font-medium text-slate-900 dark:text-slate-100">
                {selectedInvoice.customerId?.name ||
                  "—"}
              </p>
            </div>

            <div>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Invoice Status
              </p>

              <p className="mt-1 text-sm font-medium capitalize text-slate-900 dark:text-slate-100">
                {selectedInvoice.status ||
                  "—"}
              </p>
            </div>
          </div>

          {/* Balance Summary */}
          <div className="mt-5 grid grid-cols-1 gap-4 md:grid-cols-3">

            <div className="rounded-lg border border-slate-200 bg-white p-4 dark:border-slate-700 dark:bg-slate-900">
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Invoice Total
              </p>

              <p className="mt-1 text-lg font-bold text-slate-900 dark:text-slate-100">
                ₱
                {Number(
                  selectedInvoice.totalAmount || 0
                ).toLocaleString("en-PH", {
                  minimumFractionDigits: 2,
                })}
              </p>
            </div>

            <div className="rounded-lg border border-slate-200 bg-white p-4 dark:border-slate-700 dark:bg-slate-900">
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Paid
              </p>

              <p className="mt-1 text-lg font-bold text-slate-900 dark:text-slate-100">
                ₱
                {totalPaid.toLocaleString("en-PH", {
                  minimumFractionDigits: 2,
                })}
              </p>
            </div>

            <div className="rounded-lg border border-slate-200 bg-white p-4 dark:border-slate-900 dark:bg-slate-900">
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Remaining Balance
              </p>

              <p className="mt-1 text-lg font-bold text-slate-900 dark:text-slate-100">
                ₱
                {remainingBalance.toLocaleString(
                  "en-PH",
                  {
                    minimumFractionDigits: 2,
                  }
                )}
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Actions */}
      <div className="flex justify-end gap-3 border-t border-slate-200 pt-5 dark:border-slate-800">

        <button
          type="button"
          onClick={onCancel}
          disabled={formLoading}
          className="rounded-lg border border-slate-200 bg-white px-4 py-2.5 text-sm font-semibold text-slate-700 transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-60 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-300 dark:hover:bg-slate-800"
        >
          Cancel
        </button>

        <button
          type="submit"
          disabled={
            formLoading ||
            !formData.invoiceId ||
            !formData.amount ||
            !selectedInvoice ||
            exceedsBalance
          }
          className="rounded-lg bg-green-600 px-4 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-green-700 disabled:cursor-not-allowed disabled:opacity-60"
        >
          {formLoading
            ? "Saving..."
            : isEditMode
            ? "Update Payment"
            : "Record Payment"}
        </button>
      </div>
    </form>
  );
}

export default PaymentForm;


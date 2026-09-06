
import { useEffect, useMemo, useState } from "react";

function InvoiceForm({
  invoice = null,
  releasedSales = [],
  onSubmit,
  onCancel,
  formLoading = false,
}) {
  const isEditMode = Boolean(invoice);

  const [formData, setFormData] = useState({
    invoiceNumber: "",
    saleId: "",
    invoiceDate: "",
    dueDate: "",
    status: "draft",
  });

  const [selectedSale, setSelectedSale] = useState(null);

  useEffect(() => {
    if (invoice) {
      setFormData({
        invoiceNumber: invoice.invoiceNumber || "",
        saleId: invoice.saleId?._id || invoice.saleId || "",
        invoiceDate: invoice.invoiceDate
          ? invoice.invoiceDate.slice(0, 10)
          : "",
        dueDate: invoice.dueDate
          ? invoice.dueDate.slice(0, 10)
          : "",
        status: invoice.status || "draft",
      });

      setSelectedSale(
        typeof invoice.saleId === "object"
          ? invoice.saleId
          : null
      );

      return;
    }

    setFormData({
      invoiceNumber: "",
      saleId: "",
      invoiceDate: new Date()
        .toISOString()
        .slice(0, 10),
      dueDate: "",
      status: "draft",
    });

    setSelectedSale(null);
  }, [invoice]);

  const handleChange = (e) => {
    const { name, value } = e.target;

    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));

    if (name === "saleId") {
      const sale = releasedSales.find(
        (item) => item._id === value
      );

      setSelectedSale(sale || null);
    }
  };

  const previewItems = isEditMode
    ? invoice?.items || []
    : selectedSale?.items || [];

  const invoiceSubtotal = useMemo(() => {
    return previewItems.reduce(
      (total, item) =>
        total +
        Number(item.quantity || 0) *
          Number(item.unitPrice || 0),
      0
    );
  }, [previewItems]);

  const previewCustomer = isEditMode
    ? invoice?.customerId
    : selectedSale?.customerId;

  const previewSaleNumber = isEditMode
    ? invoice?.saleId?.salesNumber
    : selectedSale?.salesNumber;

  const previewSaleDate = isEditMode
    ? invoice?.saleId?.saleDate
    : selectedSale?.saleDate;

  const handleSubmit = (e) => {
    e.preventDefault();

    const submitData = {
      invoiceNumber: formData.invoiceNumber,
      invoiceDate:
        formData.invoiceDate || undefined,
      dueDate:
        formData.dueDate || undefined,
    };

    if (isEditMode) {
      submitData.status = formData.status;
    } else {
      submitData.saleId = formData.saleId;
    }

    onSubmit(submitData);
  };

  return (
    <form
      onSubmit={handleSubmit}
      className="space-y-6"
    >
      {/* Invoice Information */}
      <div>
        <h2 className="text-lg font-semibold text-slate-900 dark:text-slate-100">
          {isEditMode
            ? "Edit Invoice"
            : "Create Invoice"}
        </h2>

        <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
          {isEditMode
            ? "Update the draft invoice details."
            : "Create a draft invoice from a released sale."}
        </p>
      </div>

      {/* Basic Fields */}
      <div className="grid grid-cols-1 gap-4 md:grid-cols-2">

        {/* Invoice Number */}
        <div>
          <label className="mb-1.5 block text-sm font-medium text-slate-700 dark:text-slate-300">
            Invoice Number
          </label>

          <input
            type="text"
            name="invoiceNumber"
            value={formData.invoiceNumber}
            onChange={handleChange}
            required
            disabled={formLoading}
            placeholder="e.g. INV-001"
            className="w-full rounded-lg border border-slate-200 bg-slate-50 px-4 py-2.5 text-sm text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-green-500 disabled:cursor-not-allowed disabled:opacity-60 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-100"
          />
        </div>

        {/* Released Sale */}
        <div>
          <label className="mb-1.5 block text-sm font-medium text-slate-700 dark:text-slate-300">
            Released Sale
          </label>

          {isEditMode ? (
            <input
              type="text"
              value={previewSaleNumber || "—"}
              disabled
              className="w-full rounded-lg border border-slate-200 bg-slate-100 px-4 py-2.5 text-sm text-slate-600 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-400"
            />
          ) : (
            <select
              name="saleId"
              value={formData.saleId}
              onChange={handleChange}
              required
              disabled={formLoading}
              className="w-full rounded-lg border border-slate-200 bg-slate-50 px-4 py-2.5 text-sm text-slate-700 outline-none focus:border-green-500 disabled:cursor-not-allowed disabled:opacity-60 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-300"
            >
              <option value="">
                Select released sale
              </option>

              {releasedSales.map((sale) => (
                <option
                  key={sale._id}
                  value={sale._id}
                >
                  {sale.salesNumber}
                </option>
              ))}
            </select>
          )}
        </div>

        {/* Invoice Date */}
        <div>
          <label className="mb-1.5 block text-sm font-medium text-slate-700 dark:text-slate-300">
            Invoice Date
          </label>

          <input
            type="date"
            name="invoiceDate"
            value={formData.invoiceDate}
            onChange={handleChange}
            disabled={formLoading}
            className="w-full rounded-lg border border-slate-200 bg-slate-50 px-4 py-2.5 text-sm text-slate-700 outline-none focus:border-green-500 disabled:cursor-not-allowed disabled:opacity-60 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-300"
          />
        </div>

        {/* Due Date */}
        <div>
          <label className="mb-1.5 block text-sm font-medium text-slate-700 dark:text-slate-300">
            Due Date
          </label>

          <input
            type="date"
            name="dueDate"
            value={formData.dueDate}
            onChange={handleChange}
            disabled={formLoading}
            className="w-full rounded-lg border border-slate-200 bg-slate-50 px-4 py-2.5 text-sm text-slate-700 outline-none focus:border-green-500 disabled:cursor-not-allowed disabled:opacity-60 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-300"
          />
        </div>

        {/* Status */}
        <div>
          <label className="mb-1.5 block text-sm font-medium text-slate-700 dark:text-slate-300">
            Status
          </label>

          {isEditMode ? (
            <select
              name="status"
              value={formData.status}
              onChange={handleChange}
              disabled={formLoading}
              className="w-full rounded-lg border border-slate-200 bg-slate-50 px-4 py-2.5 text-sm text-slate-700 outline-none focus:border-green-500 disabled:cursor-not-allowed disabled:opacity-60 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-300"
            >
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
          ) : (
            <input
              type="text"
              value="Draft"
              disabled
              className="w-full rounded-lg border border-slate-200 bg-slate-100 px-4 py-2.5 text-sm text-slate-600 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-400"
            />
          )}
        </div>
      </div>

      {/* Billing Snapshot */}
      {(selectedSale || isEditMode) && (
        <div className="rounded-xl border border-slate-200 bg-slate-50 p-5 dark:border-slate-700 dark:bg-slate-800/50">

          <div className="mb-4">
            <h3 className="text-sm font-semibold text-slate-900 dark:text-slate-100">
              Billing Details
            </h3>

            <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
              Billing information is captured from the
              released sale and cannot be manually modified.
            </p>
          </div>

          {/* Sale Information */}
          <div className="grid grid-cols-1 gap-4 md:grid-cols-3">

            <div>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Sale Number
              </p>

              <p className="mt-1 text-sm font-medium text-slate-900 dark:text-slate-100">
                {previewSaleNumber || "—"}
              </p>
            </div>

            <div>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Customer
              </p>

              <p className="mt-1 text-sm font-medium text-slate-900 dark:text-slate-100">
                {previewCustomer?.name || "—"}
              </p>
            </div>

            <div>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Sale Date
              </p>

              <p className="mt-1 text-sm font-medium text-slate-900 dark:text-slate-100">
                {previewSaleDate
                  ? new Date(
                      previewSaleDate
                    ).toLocaleDateString("en-PH")
                  : "—"}
              </p>
            </div>
          </div>

          {/* Items */}
          {previewItems.length > 0 && (
            <div className="mt-5 overflow-x-auto">
              <table className="w-full text-left text-sm">
                <thead className="border-b border-slate-200 dark:border-slate-700">
                  <tr>
                    <th className="px-3 py-2 text-xs font-semibold uppercase text-slate-500 dark:text-slate-400">
                      Product
                    </th>

                    <th className="px-3 py-2 text-xs font-semibold uppercase text-slate-500 dark:text-slate-400">
                      Description
                    </th>

                    <th className="px-3 py-2 text-right text-xs font-semibold uppercase text-slate-500 dark:text-slate-400">
                      Qty
                    </th>

                    <th className="px-3 py-2 text-right text-xs font-semibold uppercase text-slate-500 dark:text-slate-400">
                      Unit Price
                    </th>

                    <th className="px-3 py-2 text-right text-xs font-semibold uppercase text-slate-500 dark:text-slate-400">
                      Amount
                    </th>
                  </tr>
                </thead>

                <tbody>
                  {previewItems.map(
                    (item, index) => {
                      const amount =
                        Number(item.quantity || 0) *
                        Number(item.unitPrice || 0);

                      return (
                        <tr
                          key={
                            item.productId?._id ||
                            item.productId ||
                            index
                          }
                          className="border-b border-slate-100 dark:border-slate-800"
                        >
                          <td className="px-3 py-3 text-slate-900 dark:text-slate-100">
                            {item.productId?.name ||
                              "—"}
                          </td>

                          <td className="px-3 py-3 text-slate-600 dark:text-slate-300">
                            {item.description || "—"}
                          </td>

                          <td className="px-3 py-3 text-right text-slate-900 dark:text-slate-100">
                            {item.quantity}
                          </td>

                          <td className="px-3 py-3 text-right text-slate-900 dark:text-slate-100">
                            ₱
                            {Number(
                              item.unitPrice || 0
                            ).toLocaleString(
                              "en-PH",
                              {
                                minimumFractionDigits: 2,
                              }
                            )}
                          </td>

                          <td className="px-3 py-3 text-right font-medium text-slate-900 dark:text-slate-100">
                            ₱
                            {amount.toLocaleString(
                              "en-PH",
                              {
                                minimumFractionDigits: 2,
                              }
                            )}
                          </td>
                        </tr>
                      );
                    }
                  )}
                </tbody>
              </table>
            </div>
          )}

          {/* Invoice Total */}
          <div className="mt-5 flex justify-end border-t border-slate-200 pt-4 dark:border-slate-700">
            <div className="text-right">
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Invoice Total
              </p>

              <p className="mt-1 text-xl font-bold text-slate-900 dark:text-slate-100">
                ₱
                {invoiceSubtotal.toLocaleString(
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
            (!isEditMode && !formData.saleId)
          }
          className="rounded-lg bg-green-600 px-4 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-green-700 disabled:cursor-not-allowed disabled:opacity-60"
        >
          {formLoading
            ? "Saving..."
            : isEditMode
            ? "Update Invoice"
            : "Create Invoice"}
        </button>
      </div>
    </form>
  );
}

export default InvoiceForm;


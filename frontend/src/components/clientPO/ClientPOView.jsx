
import { FaTimes } from "react-icons/fa";
import { useSettings } from "../../context/SettingsContext";
import { formatCurrency } from "../../utils/currency";

function ClientPOView({ clientPO, onClose }) {
  const { settings } = useSettings();

  if (!clientPO) {
    return null;
  }

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

    received:
      "bg-blue-50 text-blue-700 dark:bg-blue-950/40 dark:text-blue-400",

    processing:
      "bg-amber-50 text-amber-700 dark:bg-amber-950/40 dark:text-amber-400",

    fulfilled:
      "bg-green-50 text-green-700 dark:bg-green-950/40 dark:text-green-400",

    cancelled:
      "bg-red-50 text-red-700 dark:bg-red-950/40 dark:text-red-400",
  };

  const formatStatus = (status) => {
    if (!status) {
      return "—";
    }

    return status
      .replace(/_/g, " ")
      .replace(/\b\w/g, (letter) => letter.toUpperCase());
  };

  const totalAmount = Number(
    clientPO.totalAmount ?? clientPO.total ?? 0,
  );

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
      <div className="max-h-[90vh] w-full max-w-5xl overflow-y-auto rounded-xl bg-white shadow-xl dark:bg-slate-900">
        {/* HEADER */}
        <div className="flex items-start justify-between border-b border-slate-200 px-6 py-5 dark:border-slate-800">
          <div>
            <div className="flex flex-wrap items-center gap-3">
              <h2 className="text-lg font-semibold text-slate-900 dark:text-slate-100">
                Client PO Details
              </h2>

              <span
                className={`inline-flex rounded-full px-3 py-1 text-xs font-semibold ${
                  statusStyles[clientPO.status] ||
                  "bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300"
                }`}
              >
                {formatStatus(clientPO.status)}
              </span>
            </div>

            <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
              View customer purchase order details. Terminal Client POs are
              read-only.
            </p>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="flex h-8 w-8 items-center justify-center rounded-lg text-slate-400 transition hover:bg-slate-100 hover:text-slate-700 dark:hover:bg-slate-800 dark:hover:text-slate-200"
            aria-label="Close Client PO details"
          >
            <FaTimes className="h-4 w-4" />
          </button>
        </div>

        {/* BASIC INFORMATION */}
        <div className="grid gap-4 border-b border-slate-200 p-6 md:grid-cols-3 dark:border-slate-800">
          <div>
            <p className="text-xs font-medium uppercase tracking-wide text-slate-400 dark:text-slate-500">
              Client PO Number
            </p>

            <p className="mt-1 font-semibold text-slate-900 dark:text-slate-100">
              {clientPO.poNumber || "—"}
            </p>
          </div>

          <div>
            <p className="text-xs font-medium uppercase tracking-wide text-slate-400 dark:text-slate-500">
              Customer
            </p>

            <p className="mt-1 font-medium text-slate-900 dark:text-slate-100">
              {clientPO.customerId?.name || "Unknown Customer"}
            </p>

            {clientPO.customerId?.customerCode && (
              <p className="mt-0.5 text-xs text-slate-500 dark:text-slate-400">
                {clientPO.customerId.customerCode}
              </p>
            )}
          </div>

          <div>
            <p className="text-xs font-medium uppercase tracking-wide text-slate-400 dark:text-slate-500">
              PO Date
            </p>

            <p className="mt-1 font-medium text-slate-900 dark:text-slate-100">
              {formatDate(clientPO.poDate)}
            </p>
          </div>

          {clientPO.quotationId && (
            <div>
              <p className="text-xs font-medium uppercase tracking-wide text-slate-400 dark:text-slate-500">
                Source Quotation
              </p>

              <p className="mt-1 font-medium text-slate-900 dark:text-slate-100">
                {clientPO.quotationId.quotationNumber || "—"}
              </p>
            </div>
          )}

          {clientPO.createdBy && (
            <div>
              <p className="text-xs font-medium uppercase tracking-wide text-slate-400 dark:text-slate-500">
                Created By
              </p>

              <p className="mt-1 font-medium text-slate-900 dark:text-slate-100">
                {clientPO.createdBy.firstName}{" "}
                {clientPO.createdBy.lastName}
              </p>
            </div>
          )}

          {clientPO.createdAt && (
            <div>
              <p className="text-xs font-medium uppercase tracking-wide text-slate-400 dark:text-slate-500">
                Created Date
              </p>

              <p className="mt-1 font-medium text-slate-900 dark:text-slate-100">
                {formatDate(clientPO.createdAt)}
              </p>
            </div>
          )}
        </div>

        {/* ITEMS */}
        <div className="p-6">
          <div className="mb-4">
            <h3 className="text-base font-semibold text-slate-900 dark:text-slate-100">
              Client PO Items
            </h3>

            <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
              Products and customer pricing recorded in this purchase order.
            </p>
          </div>

          <div className="overflow-x-auto rounded-xl border border-slate-200 dark:border-slate-800">
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
                    Total
                  </th>
                </tr>
              </thead>

              <tbody>
                {clientPO.items?.length > 0 ? (
                  clientPO.items.map((item, index) => {
                    const quantity = Number(item.quantity || 0);
                    const agreedUnitPrice = Number(
                      item.agreedUnitPrice || 0,
                    );

                    const itemTotal =
                      quantity * agreedUnitPrice;

                    return (
                      <tr
                        key={item._id || index}
                        className="border-t border-slate-100 dark:border-slate-800"
                      >
                        <td className="px-4 py-4">
                          <p className="font-medium text-slate-900 dark:text-slate-100">
                            {item.productId?.name ||
                              "Unknown Product"}
                          </p>

                          {item.productId?.sku && (
                            <p className="mt-0.5 text-xs text-slate-500 dark:text-slate-400">
                              {item.productId.sku}
                            </p>
                          )}
                        </td>

                        <td className="px-4 py-4 text-slate-600 dark:text-slate-300">
                          {item.description || "—"}
                        </td>

                        <td className="px-4 py-4 text-right text-slate-600 dark:text-slate-300">
                          {quantity} {item.unitCode || ""}
                        </td>

                        <td className="px-4 py-4 text-right text-slate-600 dark:text-slate-300">
                          {formatCurrency(
                            agreedUnitPrice,
                            settings?.currency,
                          )}
                        </td>

                        <td className="px-4 py-4 text-right font-semibold text-slate-900 dark:text-slate-100">
                          {formatCurrency(
                            itemTotal,
                            settings?.currency,
                          )}
                        </td>
                      </tr>
                    );
                  })
                ) : (
                  <tr>
                    <td
                      colSpan="5"
                      className="px-4 py-8 text-center text-sm text-slate-500 dark:text-slate-400"
                    >
                      No Client PO items found.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* FINANCIAL SUMMARY */}
        <div className="border-t border-slate-200 bg-slate-50 p-6 dark:border-slate-800 dark:bg-slate-800/40">
          <div className="ml-auto max-w-md space-y-3">
            {clientPO.subtotal !== undefined && (
              <div className="flex justify-between text-sm">
                <span className="text-slate-500 dark:text-slate-400">
                  Subtotal
                </span>

                <span className="font-medium text-slate-900 dark:text-slate-100">
                  {formatCurrency(
                    clientPO.subtotal,
                    settings?.currency,
                  )}
                </span>
              </div>
            )}

            {clientPO.taxAmount !== undefined &&
              Number(clientPO.taxAmount || 0) > 0 && (
                <div className="flex justify-between text-sm">
                  <span className="text-slate-500 dark:text-slate-400">
                    VAT
                    {clientPO.taxRate
                      ? ` (${clientPO.taxRate}%)`
                      : ""}
                  </span>

                  <span className="font-medium text-slate-900 dark:text-slate-100">
                    {formatCurrency(
                      clientPO.taxAmount,
                      settings?.currency,
                    )}
                  </span>
                </div>
              )}

            {clientPO.netAmount !== undefined && (
              <div className="flex justify-between text-sm">
                <span className="text-slate-500 dark:text-slate-400">
                  Net Amount
                </span>

                <span className="font-medium text-slate-900 dark:text-slate-100">
                  {formatCurrency(
                    clientPO.netAmount,
                    settings?.currency,
                  )}
                </span>
              </div>
            )}

            <div className="border-t border-slate-200 pt-3 dark:border-slate-700">
              <div className="flex justify-between">
                <span className="font-semibold text-slate-900 dark:text-slate-100">
                  Total Amount
                </span>

                <span className="text-lg font-bold text-slate-900 dark:text-slate-100">
                  {formatCurrency(
                    totalAmount,
                    settings?.currency,
                  )}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* FOOTER */}
        <div className="flex justify-end border-t border-slate-200 px-6 py-4 dark:border-slate-800">
          <button
            type="button"
            onClick={onClose}
            className="rounded-lg border border-slate-200 px-4 py-2.5 text-sm font-semibold text-slate-700 transition hover:bg-slate-50 dark:border-slate-700 dark:text-slate-300 dark:hover:bg-slate-800"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
}

export default ClientPOView;


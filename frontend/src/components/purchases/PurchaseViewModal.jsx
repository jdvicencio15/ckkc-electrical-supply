import { FaTimes } from "react-icons/fa";
import { useSettings } from "../../context/SettingsContext";
import { formatCurrency } from "../../utils/currency";

function PurchaseViewModal({ purchase, onClose }) {
  const { settings } = useSettings();

  if (!purchase) {
    return null;
  }

  const status = purchase.status || "draft";

  const statusClasses =
    status === "received"
      ? "bg-green-50 text-green-700 dark:bg-green-950/40 dark:text-green-400"
      : status === "cancelled"
        ? "bg-red-50 text-red-700 dark:bg-red-950/40 dark:text-red-400"
        : "bg-yellow-50 text-yellow-700 dark:bg-yellow-950/40 dark:text-yellow-400";

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
      <div className="max-h-[90vh] w-full max-w-5xl overflow-hidden rounded-xl bg-white shadow-xl dark:bg-slate-900">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-slate-200 px-6 py-4 dark:border-slate-800">
          <div>
            <h2 className="text-lg font-semibold text-slate-900 dark:text-slate-100">
              Purchase Details
            </h2>

            <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
              {purchase.purchaseNumber || "Purchase"}
            </p>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="flex h-9 w-9 items-center justify-center rounded-lg text-slate-500 transition hover:bg-slate-100 hover:text-slate-900 dark:text-slate-400 dark:hover:bg-slate-800 dark:hover:text-slate-100"
            aria-label="Close"
          >
            <FaTimes className="h-4 w-4" />
          </button>
        </div>

        {/* Content */}
        <div className="max-h-[calc(90vh-140px)] overflow-y-auto p-6">
          {/* Purchase Information */}
          <div className="grid gap-4 md:grid-cols-3">
            <div>
              <p className="text-xs font-medium uppercase text-slate-500 dark:text-slate-400">
                Purchase No.
              </p>

              <p className="mt-1 font-semibold text-slate-900 dark:text-slate-100">
                {purchase.purchaseNumber || "—"}
              </p>
            </div>

            <div>
              <p className="text-xs font-medium uppercase text-slate-500 dark:text-slate-400">
                Supplier
              </p>

              <p className="mt-1 font-semibold text-slate-900 dark:text-slate-100">
                {purchase.supplierId?.name || "Unknown Supplier"}
              </p>

              {purchase.supplierId?.supplierCode && (
                <p className="mt-0.5 text-xs text-slate-500 dark:text-slate-400">
                  {purchase.supplierId.supplierCode}
                </p>
              )}
            </div>

            <div>
              <p className="text-xs font-medium uppercase text-slate-500 dark:text-slate-400">
                Status
              </p>

              <span
                className={`mt-1 inline-flex rounded-full px-3 py-1 text-xs font-semibold ${statusClasses}`}
              >
                {status.charAt(0).toUpperCase() + status.slice(1)}
              </span>
            </div>

            <div>
              <p className="text-xs font-medium uppercase text-slate-500 dark:text-slate-400">
                Purchase Date
              </p>

              <p className="mt-1 text-sm text-slate-700 dark:text-slate-300">
                {purchase.purchaseDate
                  ? new Date(purchase.purchaseDate).toLocaleDateString(
                      "en-PH",
                      {
                        year: "numeric",
                        month: "long",
                        day: "numeric",
                      },
                    )
                  : "—"}
              </p>
            </div>

            <div>
              <p className="text-xs font-medium uppercase text-slate-500 dark:text-slate-400">
                Supplier PO
              </p>

              <p className="mt-1 text-sm text-slate-700 dark:text-slate-300">
                {purchase.supplierPOId?.supplierPONumber ||
                  purchase.supplierPOId?.poNumber ||
                  "—"}
              </p>
            </div>

            <div>
              <p className="text-xs font-medium uppercase text-slate-500 dark:text-slate-400">
                Client PO
              </p>

              <p className="mt-1 text-sm text-slate-700 dark:text-slate-300">
                {purchase.clientPOId?.clientPONumber ||
                  purchase.clientPOId?.poNumber ||
                  "—"}
              </p>
            </div>
          </div>

       {/* Items */}
<div className="mt-8">
  <h3 className="mb-3 text-sm font-semibold text-slate-900 dark:text-slate-100">
    Purchase Items
  </h3>

  <div className="overflow-x-auto rounded-lg border border-slate-200 dark:border-slate-800">
    <table className="w-full min-w-[700px] table-fixed text-left text-sm">
      <colgroup>
        {/* Product */}
        <col />

        {/* Qty */}
        <col className="w-[80px]" />

        {/* Unit */}
        <col className="w-[80px]" />

        {/* Unit Cost */}
        <col className="w-[130px]" />

        {/* Total */}
        <col className="w-[130px]" />
      </colgroup>

      <thead className="bg-slate-50 text-xs uppercase text-slate-500 dark:bg-slate-800/50 dark:text-slate-400">
        <tr>
          <th className="px-4 py-3 font-semibold">
            Product
          </th>

          <th className="px-4 py-3 text-right font-semibold">
            Qty
          </th>

          <th className="px-4 py-3 text-center font-semibold">
            Unit
          </th>

          <th className="px-4 py-3 text-right font-semibold">
            Unit Cost
          </th>

          <th className="px-4 py-3 text-right font-semibold">
            Total
          </th>
        </tr>
      </thead>

      <tbody>
        {purchase.items?.length > 0 ? (
          purchase.items.map((item, index) => {
            const quantity = Number(item.quantity || 0);
            const enteredUnitCost = Number(
              item.enteredUnitCost ?? item.actualUnitCost ?? 0,
            );
            const totalCost = Number(item.totalCost || 0);

            return (
              <tr
                key={item._id || index}
                className="border-t border-slate-100 dark:border-slate-800"
              >
                {/* Product */}
                <td className="px-4 py-3">
                  <p className="font-medium text-slate-900 dark:text-slate-100">
                    {item.productId?.name ||
                      item.product?.name ||
                      "Unknown Product"}
                  </p>

                  {item.productId?.sku && (
                    <p className="mt-0.5 text-xs text-slate-500 dark:text-slate-400">
                      {item.productId.sku}
                    </p>
                  )}
                </td>

                {/* Qty */}
                <td className="px-4 py-3 text-right text-slate-700 dark:text-slate-300">
                  {quantity}
                </td>

                {/* Unit */}
                <td className="px-4 py-3 text-center text-slate-700 dark:text-slate-300">
                  {item.unitCode || item.unitId?.code || "—"}
                </td>

                {/* Unit Cost */}
                <td className="px-4 py-3 text-right text-slate-700 dark:text-slate-300">
                  {formatCurrency(
                    enteredUnitCost,
                    settings?.currency,
                  )}
                </td>

                {/* Total */}
                <td className="px-4 py-3 text-right font-semibold text-slate-900 dark:text-slate-100">
                  {formatCurrency(
                    totalCost,
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
              No purchase items found.
            </td>
          </tr>
        )}
      </tbody>
    </table>
  </div>
</div>

          {/* Summary */}
          <div className="mt-6 flex justify-end">
            <div className="w-full max-w-sm space-y-2">
              <div className="flex justify-between text-sm text-slate-600 dark:text-slate-400">
                <span>Subtotal</span>

                <span>
                  {formatCurrency(purchase.netAmount || 0, settings?.currency)}
                </span>
              </div>

              <div className="flex justify-between text-sm text-slate-600 dark:text-slate-400">
                <span>
                  Input VAT
                  {purchase.taxRate != null && (
                    <span className="ml-1 text-xs">({purchase.taxRate}%)</span>
                  )}
                </span>

                <span>
                  {formatCurrency(purchase.taxAmount || 0, settings?.currency)}
                </span>
              </div>

              <div className="flex justify-between border-t border-slate-200 pt-2 text-base font-bold text-slate-900 dark:border-slate-800 dark:text-slate-100">
                <span>Total</span>

                <span>
                  {formatCurrency(
                    purchase.totalAmount || 0,
                    settings?.currency,
                  )}
                </span>
              </div>
            </div>
          </div>

{/* Purchase Metadata */}
{(purchase.createdBy || purchase.createdAt) && (
  <div className="mt-8 border-t border-slate-200 pt-5 dark:border-slate-800">
    <div className="grid grid-cols-[180px_220px] gap-x-8 gap-y-4 text-xs">
      {purchase.createdBy && (
        <div>
          <p className="font-medium uppercase text-slate-500 dark:text-slate-400">
            Created By
          </p>

          <p className="mt-1 text-sm text-slate-700 dark:text-slate-300">
            {purchase.createdBy.firstName || ""}{" "}
            {purchase.createdBy.lastName || ""}
          </p>
        </div>
      )}

      {purchase.createdAt && (
        <div>
          <p className="font-medium uppercase text-slate-500 dark:text-slate-400">
            Created At
          </p>

          <p className="mt-1 text-sm text-slate-700 dark:text-slate-300">
            {new Date(purchase.createdAt).toLocaleString("en-PH")}
          </p>
        </div>
      )}
    </div>
  </div>
)}
</div>

{/* Footer */}
<div className="flex justify-end border-t border-slate-200 px-6 py-4 dark:border-slate-800">
  <button
    type="button"
    onClick={onClose}
    className="rounded-lg bg-slate-900 px-4 py-2 text-sm font-semibold text-white transition hover:bg-slate-800 dark:bg-slate-100 dark:text-slate-900 dark:hover:bg-slate-200"
  >
    Close
  </button>
</div>
</div>
</div>
);
}

export default PurchaseViewModal;
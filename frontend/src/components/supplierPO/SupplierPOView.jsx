import { FaTimes } from "react-icons/fa";

function SupplierPOView({
  supplierPO,
  onClose,
}) {
  if (!supplierPO) {
    return null;
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
      <div className="w-full max-w-4xl rounded-2xl bg-white shadow-xl dark:bg-slate-900">
        {/* HEADER */}

        <div className="flex items-center justify-between border-b border-slate-200 px-6 py-4 dark:border-slate-800">
          <div>
            <h2 className="text-xl font-bold text-slate-900 dark:text-slate-100">
              Supplier PO
            </h2>

            <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
              {supplierPO.poNumber || "—"}
            </p>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="flex h-9 w-9 items-center justify-center rounded-lg text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800"
            aria-label="Close"
          >
            <FaTimes className="h-4 w-4" />
          </button>
        </div>

        {/* CONTENT */}

        <div className="space-y-6 p-6">
          {/* SUMMARY */}

          <div className="grid gap-4 md:grid-cols-4">
            <div>
              <p className="text-xs font-medium uppercase text-slate-400">
                Supplier
              </p>

              <p className="mt-1 font-medium text-slate-900 dark:text-slate-100">
                {supplierPO.supplierId?.name || "—"}
              </p>
            </div>

            <div>
              <p className="text-xs font-medium uppercase text-slate-400">
                Client PO
              </p>

              <p className="mt-1 font-medium text-slate-900 dark:text-slate-100">
                {supplierPO.relatedClientPOId?.poNumber || "—"}
              </p>
            </div>

            <div>
              <p className="text-xs font-medium uppercase text-slate-400">
                Status
              </p>

              <p className="mt-1 font-medium capitalize text-slate-900 dark:text-slate-100">
                {supplierPO.status || "—"}
              </p>
            </div>

            <div>
              <p className="text-xs font-medium uppercase text-slate-400">
                PO Date
              </p>

              <p className="mt-1 font-medium text-slate-900 dark:text-slate-100">
                {supplierPO.supplierPODate
                  ? new Date(
                      supplierPO.supplierPODate,
                    ).toLocaleDateString("en-PH")
                  : "—"}
              </p>
            </div>
          </div>

          {/* ITEMS */}

          <div>
            <h3 className="mb-3 text-sm font-semibold text-slate-900 dark:text-slate-100">
              Items
            </h3>

            <div className="overflow-x-auto rounded-xl border border-slate-200 dark:border-slate-800">
              <table className="w-full text-left text-sm">
                <thead className="bg-slate-50 text-xs uppercase text-slate-500 dark:bg-slate-800/50 dark:text-slate-400">
                  <tr>
                    <th className="px-4 py-3">
                      Product
                    </th>

                    <th className="px-4 py-3">
                      Unit
                    </th>

                    <th className="px-4 py-3 text-right">
                      Quantity
                    </th>

                    <th className="px-4 py-3 text-right">
                      Unit Cost
                    </th>

                    <th className="px-4 py-3 text-right">
                      Total
                    </th>
                  </tr>
                </thead>

                <tbody>
                  {supplierPO.items?.length ? (
                    supplierPO.items.map((item, index) => (
                      <tr
                        key={item._id || index}
                        className="border-t border-slate-100 dark:border-slate-800"
                      >
                        <td className="px-4 py-3 text-slate-900 dark:text-slate-100">
                          {item.productId?.name ||
                            item.description ||
                            "—"}
                        </td>

                        <td className="px-4 py-3 text-slate-600 dark:text-slate-300">
                          {item.unitCode || "—"}
                        </td>

                        <td className="px-4 py-3 text-right text-slate-600 dark:text-slate-300">
                          {item.quantity ?? 0}
                        </td>

                        <td className="px-4 py-3 text-right text-slate-600 dark:text-slate-300">
                          {Number(
                            item.expectedUnitCost || 0,
                          ).toLocaleString("en-PH", {
                            minimumFractionDigits: 2,
                            maximumFractionDigits: 2,
                          })}
                        </td>

                        <td className="px-4 py-3 text-right font-medium text-slate-900 dark:text-slate-100">
                          {Number(
                            (item.quantity || 0) *
                              (item.expectedUnitCost || 0),
                          ).toLocaleString("en-PH", {
                            minimumFractionDigits: 2,
                            maximumFractionDigits: 2,
                          })}
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td
                        colSpan="5"
                        className="px-4 py-8 text-center text-sm text-slate-500"
                      >
                        No items.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>

          {/* TOTAL */}

          <div className="flex justify-end border-t border-slate-200 pt-4 dark:border-slate-800">
            <div className="text-right">
              <p className="text-xs uppercase text-slate-400">
                Total Amount
              </p>

              <p className="mt-1 text-xl font-bold text-slate-900 dark:text-slate-100">
                {Number(
                  supplierPO.totalAmount || 0,
                ).toLocaleString("en-PH", {
                  minimumFractionDigits: 2,
                  maximumFractionDigits: 2,
                })}
              </p>
            </div>
          </div>
        </div>

        {/* FOOTER */}

        <div className="flex justify-end border-t border-slate-200 px-6 py-4 dark:border-slate-800">
          <button
            type="button"
            onClick={onClose}
            className="rounded-lg bg-slate-100 px-4 py-2.5 text-sm font-medium text-slate-700 hover:bg-slate-200 dark:bg-slate-800 dark:text-slate-300 dark:hover:bg-slate-700"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
}

export default SupplierPOView;
import { useEffect, useMemo, useState } from "react";
import { FaPlus, FaTrash } from "react-icons/fa";

const createEmptyItem = () => ({
  productId: "",
  quantity: "",
  actualUnitCost: "",
});

const initialForm = {
  purchaseNumber: "",
  supplierId: "",
  supplierPOId: "",
  relatedClientPOId: "",
  purchaseDate: new Date().toISOString().split("T")[0],
  items: [createEmptyItem()],
};

function PurchaseForm({
  suppliers,
  products,
  supplierPOs = [],
  clientPOs = [],
  purchase,
  onSubmit,
  onCancel,
  submitting,
}) {
  const [formData, setFormData] = useState(initialForm);

  useEffect(() => {
    if (purchase) {
      setFormData({
        purchaseNumber: purchase.purchaseNumber || "",
        supplierId: purchase.supplierId?._id || purchase.supplierId || "",
        supplierPOId: purchase.supplierPOId?._id || purchase.supplierPOId || "",
        relatedClientPOId:
          purchase.relatedClientPOId?._id ||
          purchase.relatedClientPOId ||
          "",
        purchaseDate: purchase.purchaseDate
          ? new Date(purchase.purchaseDate).toISOString().split("T")[0]
          : new Date().toISOString().split("T")[0],
        items:
          purchase.items?.length > 0
            ? purchase.items.map((item) => ({
                productId: item.productId?._id || item.productId || "",
                quantity: item.quantity ?? "",
                actualUnitCost: item.actualUnitCost ?? "",
              }))
            : [createEmptyItem()],
      });
    } else {
      setFormData(initialForm);
    }
  }, [purchase]);

  const handleChange = (event) => {
    const { name, value } = event.target;

    setFormData((current) => ({
      ...current,
      [name]: value,
    }));
  };

  const handleItemChange = (index, field, value) => {
    setFormData((current) => ({
      ...current,
      items: current.items.map((item, itemIndex) =>
        itemIndex === index
          ? {
              ...item,
              [field]: value,
            }
          : item,
      ),
    }));
  };

  const addItem = () => {
    setFormData((current) => ({
      ...current,
      items: [...current.items, createEmptyItem()],
    }));
  };

  const removeItem = (index) => {
    if (formData.items.length === 1) {
      return;
    }

    setFormData((current) => ({
      ...current,
      items: current.items.filter(
        (_, itemIndex) => itemIndex !== index,
      ),
    }));
  };

  const totalAmount = useMemo(() => {
    return formData.items.reduce((total, item) => {
      const quantity = Number(item.quantity) || 0;
      const unitCost = Number(item.actualUnitCost) || 0;

      return total + quantity * unitCost;
    }, 0);
  }, [formData.items]);

  const handleSubmit = (event) => {
    event.preventDefault();

    const payload = {
      purchaseNumber: formData.purchaseNumber.trim(),
      supplierId: formData.supplierId,
      supplierPOId: formData.supplierPOId || undefined,
      relatedClientPOId: formData.relatedClientPOId || undefined,
      purchaseDate: formData.purchaseDate,
      items: formData.items.map((item) => ({
        productId: item.productId,
        quantity: Number(item.quantity),
        actualUnitCost: Number(item.actualUnitCost),
      })),
    };

    onSubmit(payload);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Purchase Information */}
      <div className="grid gap-4 md:grid-cols-2">
        <div>
          <label className="mb-1.5 block text-sm font-medium text-slate-700 dark:text-slate-300">
            Purchase Number
          </label>

          <input
            type="text"
            name="purchaseNumber"
            value={formData.purchaseNumber}
            onChange={handleChange}
            required
            maxLength={50}
            placeholder="e.g. PUR-2026-0001"
            className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2.5 text-sm text-slate-900 outline-none transition focus:border-green-500 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-100"
          />
        </div>

        <div>
          <label className="mb-1.5 block text-sm font-medium text-slate-700 dark:text-slate-300">
            Purchase Date
          </label>

          <input
            type="date"
            name="purchaseDate"
            value={formData.purchaseDate}
            onChange={handleChange}
            className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2.5 text-sm text-slate-900 outline-none transition focus:border-green-500 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-100"
          />
        </div>

        <div>
          <label className="mb-1.5 block text-sm font-medium text-slate-700 dark:text-slate-300">
            Supplier
          </label>

          <select
            name="supplierId"
            value={formData.supplierId}
            onChange={handleChange}
            required
            className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2.5 text-sm text-slate-700 outline-none focus:border-green-500 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200"
          >
            <option value="">Select supplier</option>

            {suppliers
              .filter((supplier) => supplier.status === "active")
              .map((supplier) => (
                <option key={supplier._id} value={supplier._id}>
                  {supplier.supplierCode} - {supplier.name}
                </option>
              ))}
          </select>
        </div>

        <div>
          <label className="mb-1.5 block text-sm font-medium text-slate-700 dark:text-slate-300">
            Supplier PO
          </label>

          <select
            name="supplierPOId"
            value={formData.supplierPOId}
            onChange={handleChange}
            className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2.5 text-sm text-slate-700 outline-none focus:border-green-500 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200"
          >
            <option value="">None</option>

            {supplierPOs.map((supplierPO) => (
              <option key={supplierPO._id} value={supplierPO._id}>
                {supplierPO.poNumber}
              </option>
            ))}
          </select>
        </div>

        <div className="md:col-span-2">
          <label className="mb-1.5 block text-sm font-medium text-slate-700 dark:text-slate-300">
            Related Client PO
          </label>

          <select
            name="relatedClientPOId"
            value={formData.relatedClientPOId}
            onChange={handleChange}
            className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2.5 text-sm text-slate-700 outline-none focus:border-green-500 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200"
          >
            <option value="">None</option>

            {clientPOs.map((clientPO) => (
              <option key={clientPO._id} value={clientPO._id}>
                {clientPO.poNumber}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Items */}
      <div>
        <div className="mb-3 flex items-center justify-between">
          <div>
            <h3 className="text-sm font-semibold text-slate-900 dark:text-slate-100">
              Purchase Items
            </h3>

            <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
              Add the products received from the supplier.
            </p>
          </div>

          <button
            type="button"
            onClick={addItem}
            className="inline-flex items-center gap-2 rounded-lg border border-slate-200 px-3 py-2 text-xs font-semibold text-slate-700 transition hover:bg-slate-50 dark:border-slate-700 dark:text-slate-300 dark:hover:bg-slate-800"
          >
            <FaPlus className="h-3 w-3" />
            Add Item
          </button>
        </div>

        <div className="space-y-3">
          {formData.items.map((item, index) => {
            const quantity = Number(item.quantity) || 0;
            const unitCost = Number(item.actualUnitCost) || 0;
            const itemTotal = quantity * unitCost;

            return (
              <div
                key={index}
                className="rounded-lg border border-slate-200 p-4 dark:border-slate-700"
              >
                <div className="grid gap-4 md:grid-cols-12">
                  <div className="md:col-span-5">
                    <label className="mb-1.5 block text-xs font-medium text-slate-600 dark:text-slate-400">
                      Product
                    </label>

                    <select
                      value={item.productId}
                      onChange={(event) =>
                        handleItemChange(
                          index,
                          "productId",
                          event.target.value,
                        )
                      }
                      required
                      className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2.5 text-sm text-slate-700 outline-none focus:border-green-500 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200"
                    >
                      <option value="">Select product</option>

                      {products.map((product) => (
                        <option key={product._id} value={product._id}>
                          {product.sku} - {product.name}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div className="md:col-span-2">
                    <label className="mb-1.5 block text-xs font-medium text-slate-600 dark:text-slate-400">
                      Quantity
                    </label>

                    <input
                      type="number"
                      min="0.01"
                      step="0.01"
                      value={item.quantity}
                      onChange={(event) =>
                        handleItemChange(
                          index,
                          "quantity",
                          event.target.value,
                        )
                      }
                      required
                      className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2.5 text-sm text-slate-900 outline-none focus:border-green-500 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-100"
                    />
                  </div>

                  <div className="md:col-span-2">
                    <label className="mb-1.5 block text-xs font-medium text-slate-600 dark:text-slate-400">
                      Actual Unit Cost
                    </label>

                    <input
                      type="number"
                      min="0"
                      step="0.01"
                      value={item.actualUnitCost}
                      onChange={(event) =>
                        handleItemChange(
                          index,
                          "actualUnitCost",
                          event.target.value,
                        )
                      }
                      required
                      className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2.5 text-sm text-slate-900 outline-none focus:border-green-500 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-100"
                    />
                  </div>

                  <div className="md:col-span-2">
                    <label className="mb-1.5 block text-xs font-medium text-slate-600 dark:text-slate-400">
                      Total Cost
                    </label>

                    <div className="flex h-[42px] items-center rounded-lg bg-slate-50 px-3 text-sm font-semibold text-slate-900 dark:bg-slate-800 dark:text-slate-100">
                      ₱
                      {itemTotal.toLocaleString("en-PH", {
                        minimumFractionDigits: 2,
                        maximumFractionDigits: 2,
                      })}
                    </div>
                  </div>

                  <div className="flex items-end justify-end md:col-span-1">
                    <button
                      type="button"
                      onClick={() => removeItem(index)}
                      disabled={formData.items.length === 1}
                      className="flex h-[42px] w-[42px] items-center justify-center rounded-lg text-red-500 transition hover:bg-red-50 hover:text-red-700 disabled:cursor-not-allowed disabled:opacity-30 dark:text-red-400 dark:hover:bg-red-950/30"
                      aria-label="Remove item"
                    >
                      <FaTrash className="h-3.5 w-3.5" />
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Total */}
      <div className="flex justify-end">
        <div className="w-full rounded-xl border border-slate-200 bg-slate-50 p-5 md:w-80 dark:border-slate-700 dark:bg-slate-800">
          <div className="flex items-center justify-between">
            <span className="text-sm text-slate-500 dark:text-slate-400">
              Total Amount
            </span>

            <span className="text-xl font-bold text-slate-900 dark:text-slate-100">
              ₱
              {totalAmount.toLocaleString("en-PH", {
                minimumFractionDigits: 2,
                maximumFractionDigits: 2,
              })}
            </span>
          </div>
        </div>
      </div>

      {/* Actions */}
      <div className="flex justify-end gap-3 border-t border-slate-200 pt-5 dark:border-slate-700">
        <button
          type="button"
          onClick={onCancel}
          disabled={submitting}
          className="rounded-lg border border-slate-200 px-4 py-2.5 text-sm font-medium text-slate-700 transition hover:bg-slate-50 disabled:opacity-50 dark:border-slate-700 dark:text-slate-300 dark:hover:bg-slate-800"
        >
          Cancel
        </button>

        <button
          type="submit"
          disabled={submitting}
          className="rounded-lg bg-green-600 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-green-700 disabled:cursor-not-allowed disabled:opacity-50"
        >
          {submitting
            ? "Saving..."
            : purchase
              ? "Update Purchase"
              : "Create Purchase"}
        </button>
      </div>
    </form>
  );
}

export default PurchaseForm;
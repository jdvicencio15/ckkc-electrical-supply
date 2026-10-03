import { useEffect, useMemo, useState } from "react";
import { FaPlus, FaTrash } from "react-icons/fa";
import { useSettings } from "../../context/SettingsContext";
import { formatCurrency } from "../../utils/currency";

const initialItem = {
  productId: "",
  description: "",
  quantity: 1,
  unitPrice: 0,
  unitCost: 0,
  unitId: "",
  unitCode: "",
};

const initialForm = {
  customerId: "",
  clientPOId: "",
  saleDate: new Date().toISOString().split("T")[0],
  status: "draft",
  items: [initialItem],
  directExpenses: 0,
  commission: 0,
};

function SaleForm({
  sale,
  products,
  customers,
  clientPOs = [],
  onSubmit,
  onCancel,
  submitting,
}) {
  const { settings } = useSettings();

  const [formData, setFormData] = useState(initialForm);

  useEffect(() => {
    if (sale) {
      setFormData({
        customerId: sale.customerId?._id || sale.customerId || "",
        clientPOId: sale.clientPOId?._id || sale.clientPOId || "",
        saleDate: sale.saleDate
          ? new Date(sale.saleDate).toISOString().split("T")[0]
          : new Date().toISOString().split("T")[0],
        status: sale.status || "draft",
        items:
          sale.items?.length > 0
            ? sale.items.map((item) => ({
                productId: item.productId?._id || item.productId || "",
                description: item.description || "",
                quantity: item.quantity || 1,
                unitPrice: item.unitPrice || 0,
                unitCost: item.unitCost || 0,

                unitId: item.unitId?._id || item.unitId || "",
                unitCode: item.unitCode || item.unitId?.code || "",
              }))
            : [initialItem],
        directExpenses: sale.directExpenses || 0,
        commission: sale.commission || 0,
      });

      return;
    }

    setFormData(initialForm);
  }, [sale]);

  const availableClientPOs = useMemo(() => {
    if (!formData.customerId) {
      return [];
    }

    return clientPOs.filter((po) => {
      const poCustomerId =
        typeof po.customerId === "object" ? po.customerId?._id : po.customerId;

      const sameCustomer = String(poCustomerId) === String(formData.customerId);

      const validStatus = ["received", "processing"].includes(po.status);

      return sameCustomer && validStatus;
    });
  }, [clientPOs, formData.customerId]);

  const hasClientPO = Boolean(formData.clientPOId);

  const isDraftSale = !sale || sale.status === "draft";

  const canEditSale = isDraftSale;

  const isDescriptionLocked = hasClientPO || !canEditSale;

  const isProductAlreadySelected = (productId, currentIndex) => {
    return formData.items.some(
      (item, index) =>
        index !== currentIndex && String(item.productId) === String(productId),
    );
  };

  const handleChange = (event) => {
    const { name, value } = event.target;

    if (name === "customerId") {
      // Customer cannot be changed while a Client PO is selected.
      if (hasClientPO) {
        return;
      }

      setFormData((current) => ({
        ...current,
        customerId: value,
        clientPOId: "",
      }));

      return;
    }

    if (name === "clientPOId") {
      const selectedClientPO = clientPOs.find(
        (po) => String(po._id) === String(value),
      );

      // Direct sale
      if (!selectedClientPO) {
        setFormData((current) => ({
          ...current,
          clientPOId: "",
          items: [{ ...initialItem }],
        }));

        return;
      }

      const customerId =
        selectedClientPO.customerId?._id || selectedClientPO.customerId || "";

      const items =
        selectedClientPO.items?.map((item) => {
          const productId = item.productId?._id || item.productId || "";

         const selectedProduct = products.find(
  (product) => String(product._id) === String(productId),
);
          return {
            productId,

            // CPO source → locked later in UI
            description: item.description || selectedProduct?.name || "",

            quantity: Number(item.quantity || 0),

            unitPrice: Number(item.agreedUnitPrice || 0),

            unitCost: Number(selectedProduct?.productCost || 0),

            unitId:
              selectedProduct?.unitId?._id || selectedProduct?.unitId || "",

            unitCode:
              selectedProduct?.unitCode || selectedProduct?.unitId?.code || "",
          };
        }) || [];

      setFormData((current) => ({
        ...current,
        clientPOId: value,
        customerId,
        items: items.length > 0 ? items : [{ ...initialItem }],
      }));

      return;
    }

    setFormData((current) => ({
      ...current,
      [name]: value,
    }));
  };

  const handleItemChange = (index, field, value) => {
    setFormData((current) => {
      const items = [...current.items];

      items[index] = {
        ...items[index],
        [field]: value,
      };

      if (field === "productId") {
        const selectedProduct = products.find(
          (product) => product._id === value,
        );

        items[index].unitCost = selectedProduct?.productCost ?? 0;

        if (selectedProduct) {
          items[index].description = selectedProduct.name;

          items[index].unitId =
            selectedProduct.unitId?._id || selectedProduct.unitId || "";

          items[index].unitCode =
            selectedProduct.unitCode || selectedProduct.unitId?.code || "";
        }
      }

      return {
        ...current,
        items,
      };
    });
  };

  const addItem = () => {
    setFormData((current) => ({
      ...current,
      items: [...current.items, { ...initialItem }],
    }));
  };

  const removeItem = (index) => {
    setFormData((current) => {
      if (current.items.length === 1) {
        return current;
      }

      return {
        ...current,
        items: current.items.filter((_, itemIndex) => itemIndex !== index),
      };
    });
  };

  const totals = useMemo(() => {
    const subtotal = formData.items.reduce(
      (total, item) =>
        total + Number(item.quantity || 0) * Number(item.unitPrice || 0),
      0,
    );

    const totalCost = formData.items.reduce(
      (total, item) =>
        total + Number(item.quantity || 0) * Number(item.unitCost || 0),
      0,
    );

    const directExpenses = Number(formData.directExpenses || 0);

    const commission = Number(formData.commission || 0);

    // VAT configuration from Settings
    const vatEnabled = settings?.accountingTax?.vatEnabled === true;

    const vatRate = vatEnabled
      ? Number(settings?.accountingTax?.vatRate || 0)
      : 0;

    const pricingMode = settings?.accountingTax?.pricingMode || "inclusive";

    // VAT calculation
    let netAmount = subtotal;
    let taxAmount = 0;

    if (vatEnabled && vatRate > 0) {
      if (pricingMode === "inclusive") {
        netAmount = subtotal / (1 + vatRate / 100);

        taxAmount = subtotal - netAmount;
      } else {
        netAmount = subtotal;

        taxAmount = subtotal * (vatRate / 100);
      }
    }

    // Total amount
    const totalAmount =
      pricingMode === "inclusive"
        ? subtotal + directExpenses + commission
        : subtotal + taxAmount + directExpenses + commission;

    // Profit uses NET sales
    const totalProfit = netAmount - totalCost - directExpenses - commission;

    return {
      subtotal,
      totalCost,
      directExpenses,
      commission,
      netAmount,
      taxAmount,
      vatRate,
      pricingMode,
      vatEnabled,
      totalAmount,
      totalProfit,
    };
  }, [formData.items, formData.directExpenses, formData.commission, settings]);

  const handleSubmit = (event) => {
    event.preventDefault();

    onSubmit({
      ...formData,
      customerId: formData.customerId,
      clientPOId: formData.clientPOId || undefined,
      saleDate: formData.saleDate,
      status: formData.status,
      items: formData.items.map((item) => ({
        productId: item.productId,
        description: item.description,
        quantity: Number(item.quantity),
        unitPrice: Number(item.unitPrice),
        unitCost: Number(item.unitCost),
        unitId: item.unitId || undefined,
        unitCode: item.unitCode || undefined,
      })),
      directExpenses: Number(formData.directExpenses || 0),
      commission: Number(formData.commission || 0),
    });
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Basic Information */}

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <div>
          <label className="mb-1.5 block text-sm font-medium text-slate-700 dark:text-slate-300">
            Sales Number
          </label>

          <input
            type="text"
            value={sale ? sale.salesNumber : "Auto-generated on save"}
            readOnly
            disabled={submitting}
            className="w-full cursor-not-allowed rounded-lg border border-slate-200 bg-slate-100 px-3 py-2.5 text-sm text-slate-600 outline-none dark:border-slate-700 dark:bg-slate-800 dark:text-slate-400"
          />

          <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
            {sale
              ? "Document number cannot be changed."
              : "The sales number will be generated automatically."}
          </p>
        </div>

        <div>
          <label className="mb-1.5 block text-sm font-medium text-slate-700 dark:text-slate-300">
            Client PO
          </label>

          <select
            name="clientPOId"
            value={formData.clientPOId}
            onChange={handleChange}
            disabled={submitting || !canEditSale || !formData.customerId}
            className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2.5 text-sm text-slate-700 outline-none focus:border-green-500 disabled:cursor-not-allowed disabled:bg-slate-100 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200"
          >
            <option value="">No Client PO — Direct Sale</option>
            {availableClientPOs.map((po) => (
              <option key={po._id} value={po._id}>
                {po.poNumber}
              </option>
            ))}
          </select>

          <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
            Optional — select an eligible Client PO to automatically populate
            the sale items.
          </p>
        </div>

        <div>
          <label className="mb-1.5 block text-sm font-medium text-slate-700 dark:text-slate-300">
            Customer
          </label>

          <select
            name="customerId"
            value={formData.customerId}
            onChange={handleChange}
            required
            disabled={submitting || !canEditSale || hasClientPO}
            className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2.5 text-sm text-slate-700 outline-none focus:border-green-500 disabled:cursor-not-allowed disabled:bg-slate-100 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200"
          >
            <option value="">Select customer</option>

            {customers.map((customer) => (
              <option key={customer._id} value={customer._id}>
                {customer.customerCode
                  ? `${customer.customerCode} — ${customer.name}`
                  : customer.name}
              </option>
            ))}
          </select>

          <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
            {hasClientPO
              ? "Customer is locked to the selected Client PO."
              : "Select the customer for this sale."}
          </p>
        </div>

        <div>
          <label className="mb-1.5 block text-sm font-medium text-slate-700 dark:text-slate-300">
            Sale Date
          </label>

          <input
            type="date"
            name="saleDate"
            value={formData.saleDate}
            onChange={handleChange}
            required
            disabled={submitting || !canEditSale}
            className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2.5 text-sm text-slate-700 outline-none focus:border-green-500 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200"
          />
        </div>
      </div>

      {/* Items */}
      <div>
        <div className="mb-4 flex items-center justify-between">
          <div>
            <h3 className="text-base font-semibold text-slate-900 dark:text-slate-100">
              Sale Items
            </h3>

            <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
              Add the products included in this sale.
            </p>
          </div>

          <button
            type="button"
            onClick={addItem}
            disabled={submitting || !canEditSale || hasClientPO}
            className="inline-flex items-center gap-2 rounded-lg border border-green-200 bg-green-50 px-3 py-2 text-xs font-semibold text-green-700 transition hover:bg-green-100 disabled:cursor-not-allowed disabled:opacity-50 dark:border-green-900/50 dark:bg-green-950/30 dark:text-green-400"
          >
            <FaPlus className="h-3 w-3" />
            Add Item
          </button>

          {hasClientPO && (
            <p className="mt-1 text-xs text-amber-600 dark:text-amber-400">
              Items are locked because this sale is based on a Client PO.
            </p>
          )}
        </div>

        <div className="space-y-4">
          {formData.items.map((item, index) => {
            const itemTotal =
              Number(item.quantity || 0) * Number(item.unitPrice || 0);

            const itemProfit =
              (Number(item.unitPrice || 0) - Number(item.unitCost || 0)) *
              Number(item.quantity || 0);

            return (
              <div
                key={index}
                className="rounded-xl border border-slate-200 p-4 dark:border-slate-700"
              >
                <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-6">
                  <div className="lg:col-span-2">
                    <label className="mb-1.5 block text-xs font-medium text-slate-600 dark:text-slate-400">
                      Product
                    </label>

                    <select
                      value={item.productId}
                      onChange={(event) =>
                        handleItemChange(index, "productId", event.target.value)
                      }
                      required
                      disabled={submitting || !canEditSale || hasClientPO}
                      className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2.5 text-sm text-slate-700 outline-none focus:border-green-500 disabled:cursor-not-allowed disabled:bg-slate-100 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200 dark:disabled:bg-slate-800"
                    >
                      <option value="">Select product</option>

                      {products.map((product) => {
                        const alreadySelected = isProductAlreadySelected(
                          product._id,
                          index,
                        );

                        return (
                          <option
                            key={product._id}
                            value={product._id}
                            disabled={alreadySelected}
                          >
                            {product.sku
                              ? `${product.sku} — ${product.name}`
                              : product.name}
                            {alreadySelected ? " — Already added" : ""}
                          </option>
                        );
                      })}
                    </select>
                  </div>

                  <div className="lg:col-span-2">
                    <label className="mb-1.5 block text-xs font-medium text-slate-600 dark:text-slate-400">
                      Description
                    </label>

                    <input
                      type="text"
                      value={item.description}
                      onChange={(event) =>
                        handleItemChange(
                          index,
                          "description",
                          event.target.value,
                        )
                      }
                      disabled={submitting || isDescriptionLocked}
                      placeholder="Item description"
                      className={`w-full min-w-[220px] rounded-lg border px-3 py-2.5 text-sm outline-none ${
                        isDescriptionLocked
                          ? "cursor-not-allowed border-slate-200 bg-slate-100 text-slate-500 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-400"
                          : "border-slate-200 bg-slate-50 text-slate-900 focus:border-green-500 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-100"
                      }`}
                    />

                    <p className="mt-1.5 text-xs text-slate-500 dark:text-slate-400">
                      {hasClientPO
                        ? "Description is locked to the selected Client PO."
                        : "You may customize the item description for this direct sale."}
                    </p>
                  </div>

                  <div>
                    <label className="mb-1.5 block text-xs font-medium text-slate-600 dark:text-slate-400">
                      Quantity
                    </label>

                    <input
                      type="number"
                      min="0.01"
                      step="0.01"
                      value={item.quantity}
                      onChange={(event) =>
                        handleItemChange(index, "quantity", event.target.value)
                      }
                      required
                      disabled={submitting || !canEditSale || hasClientPO}
                      className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2.5 text-sm text-slate-900 outline-none focus:border-green-500 disabled:cursor-not-allowed disabled:bg-slate-100 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-100"
                    />
                  </div>

                  <div>
                    <label className="mb-1.5 block text-xs font-medium text-slate-600 dark:text-slate-400">
                      Unit
                    </label>

                    <input
                      type="text"
                      value={item.unitCode || ""}
                      readOnly
                      className="w-full cursor-not-allowed rounded-lg border border-slate-200 bg-slate-100 px-3 py-2.5 text-sm text-slate-700 outline-none dark:border-slate-700 dark:bg-slate-800 dark:text-slate-400"
                    />
                  </div>

                  <div>
                    <label className="mb-1.5 block text-xs font-medium text-slate-600 dark:text-slate-400">
                      Unit Cost
                    </label>

                    <input
                      type="number"
                      value={item.unitCost}
                      readOnly
                      className="w-full cursor-not-allowed rounded-lg border border-slate-200 bg-slate-100 px-3 py-2.5 text-sm text-slate-700 outline-none dark:border-slate-700 dark:bg-slate-800 dark:text-slate-400"
                    />
                  </div>

                  <div>
                    <label className="mb-1.5 block text-xs font-medium text-slate-600 dark:text-slate-400">
                      Unit Price
                    </label>

                    <input
                      type="number"
                      min="0"
                      step="0.01"
                      value={item.unitPrice}
                      onChange={(event) =>
                        handleItemChange(index, "unitPrice", event.target.value)
                      }
                      required
                      disabled={submitting || !canEditSale || hasClientPO}
                      className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2.5 text-sm text-slate-900 outline-none focus:border-green-500 disabled:cursor-not-allowed disabled:bg-slate-100 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-100"
                    />
                  </div>
                </div>

                <div className="mt-4 flex flex-wrap items-center justify-between gap-3 border-t border-slate-100 pt-4 dark:border-slate-800">
                  <div className="flex gap-5 text-xs">
                    <span className="text-slate-500 dark:text-slate-400">
                      Item Total:{" "}
                      <strong className="text-slate-900 dark:text-slate-100">
                        {formatCurrency(itemTotal, settings?.currency)}
                      </strong>
                    </span>

                    <span className="text-slate-500 dark:text-slate-400">
                      Profit:{" "}
                      <strong className="text-green-600 dark:text-green-400">
                        {formatCurrency(itemProfit, settings?.currency)}
                      </strong>
                    </span>
                  </div>

                  {!hasClientPO && formData.items.length > 1 && (
                    <button
                      type="button"
                      onClick={() => removeItem(index)}
                      disabled={submitting || !canEditSale}
                      className="inline-flex items-center gap-2 text-xs font-semibold text-red-500 hover:text-red-700 disabled:opacity-50"
                    >
                      <FaTrash className="h-3 w-3" />
                      Remove
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Additional Charges */}
      <div className="grid gap-4 md:grid-cols-2">
        <div>
          <label className="mb-1.5 block text-sm font-medium text-slate-700 dark:text-slate-300">
            Direct Expenses
          </label>

          <input
            type="number"
            name="directExpenses"
            min="0"
            step="0.01"
            value={formData.directExpenses}
            onChange={handleChange}
            disabled={submitting || !canEditSale}
            className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2.5 text-sm text-slate-900 outline-none focus:border-green-500 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-100"
          />
        </div>

        <div>
          <label className="mb-1.5 block text-sm font-medium text-slate-700 dark:text-slate-300">
            Commission
          </label>

          <input
            type="number"
            name="commission"
            min="0"
            step="0.01"
            value={formData.commission}
            onChange={handleChange}
            disabled={submitting || !canEditSale}
            className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2.5 text-sm text-slate-900 outline-none focus:border-green-500 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-100"
          />
        </div>
      </div>

      {/* Totals */}
      <div className="rounded-xl bg-slate-50 p-5 dark:bg-slate-800/60">
        <div className="ml-auto max-w-md space-y-3">
          <div className="flex justify-between text-sm">
            <span className="text-slate-500 dark:text-slate-400">Subtotal</span>

            <span className="font-medium text-slate-900 dark:text-slate-100">
              {formatCurrency(totals.subtotal, settings?.currency)}
            </span>
          </div>

          {totals.vatEnabled && totals.vatRate > 0 && (
            <>
              <div className="flex justify-between text-sm">
                <span className="text-slate-500 dark:text-slate-400">
                  VAT ({totals.vatRate}%)
                </span>

                <span className="font-medium text-slate-900 dark:text-slate-100">
                  {formatCurrency(totals.taxAmount, settings?.currency)}
                </span>
              </div>

              <div className="flex justify-between text-sm">
                <span className="text-slate-500 dark:text-slate-400">
                  Net Sales
                </span>

                <span className="font-medium text-slate-900 dark:text-slate-100">
                  {formatCurrency(totals.netAmount, settings?.currency)}
                </span>
              </div>
            </>
          )}

          <div className="flex justify-between text-sm">
            <span className="text-slate-500 dark:text-slate-400">
              Total Cost
            </span>

            <span className="font-medium text-slate-900 dark:text-slate-100">
              {formatCurrency(totals.totalCost, settings?.currency)}
            </span>
          </div>

          <div className="flex justify-between text-sm">
            <span className="text-slate-500 dark:text-slate-400">
              Direct Expenses
            </span>

            <span className="font-medium text-slate-900 dark:text-slate-100">
              {formatCurrency(
                Number(formData.directExpenses || 0),
                settings?.currency,
              )}
            </span>
          </div>

          <div className="flex justify-between text-sm">
            <span className="text-slate-500 dark:text-slate-400">
              Commission
            </span>

            <span className="font-medium text-slate-900 dark:text-slate-100">
              {formatCurrency(
                Number(formData.commission || 0),
                settings?.currency,
              )}
            </span>
          </div>

          <div className="border-t border-slate-200 pt-3 dark:border-slate-700">
            <div className="flex justify-between">
              <span className="font-semibold text-slate-900 dark:text-slate-100">
                Total Amount
              </span>

              <span className="text-lg font-bold text-slate-900 dark:text-slate-100">
                {formatCurrency(totals.totalAmount, settings?.currency)}
              </span>
            </div>
          </div>

          <div className="flex justify-between">
            <span className="font-semibold text-slate-900 dark:text-slate-100">
              Total Profit
            </span>

            <span className="text-lg font-bold text-green-600 dark:text-green-400">
              {formatCurrency(totals.totalProfit, settings?.currency)}
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
          {submitting ? "Saving..." : sale ? "Update Sale" : "Create Sale"}
        </button>
      </div>
    </form>
  );
}

export default SaleForm;

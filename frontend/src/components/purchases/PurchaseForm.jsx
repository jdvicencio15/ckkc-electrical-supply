import { useEffect, useMemo, useState } from "react";
import { FaPlus, FaTrash } from "react-icons/fa";
import supplierPricingService from "../../services/supplierPricingService";
import { useSettings } from "../../context/SettingsContext";
import { formatCurrency } from "../../utils/currency";

const createEmptyItem = () => ({
  productId: "",
  description: "",
  quantity: "",
  unitId: "",
  unitCode: "",
  enteredUnitCost: "",
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
  const { settings } = useSettings();

  const [formData, setFormData] = useState(initialForm);
  const [supplierPricings, setSupplierPricings] = useState([]);
  const [loadingPricing, setLoadingPricing] = useState(true);

  // --------------------------------------------------
  // LOAD SUPPLIER PRICING
  // --------------------------------------------------

  useEffect(() => {
    const loadSupplierPricings = async () => {
      try {
        setLoadingPricing(true);

        const response =
          await supplierPricingService.getSupplierPricings();

        setSupplierPricings(
          response.supplierPricings || [],
        );
      } catch (error) {
        console.error(
          "Failed to load supplier pricing:",
          error,
        );
      } finally {
        setLoadingPricing(false);
      }
    };

    loadSupplierPricings();
  }, []);

  // --------------------------------------------------
  // LOAD PURCHASE
  // --------------------------------------------------

  useEffect(() => {
    if (purchase) {
      setFormData({
        purchaseNumber: purchase.purchaseNumber || "",

        supplierId:
          purchase.supplierId?._id ||
          purchase.supplierId ||
          "",

        supplierPOId:
          purchase.supplierPOId?._id ||
          purchase.supplierPOId ||
          "",

        relatedClientPOId:
          purchase.relatedClientPOId?._id ||
          purchase.relatedClientPOId ||
          "",

        purchaseDate: purchase.purchaseDate
          ? new Date(purchase.purchaseDate)
              .toISOString()
              .split("T")[0]
          : new Date().toISOString().split("T")[0],

        items:
          purchase.items?.length > 0
            ? purchase.items.map((item) => ({
                productId:
                  item.productId?._id ||
                  item.productId ||
                  "",

                description:
                  item.description ||
                  item.productId?.name ||
                  "",

                quantity: item.quantity ?? "",

                unitId:
                  item.unitId?._id ||
                  item.unitId ||
                  "",

                unitCode:
                  item.unitCode ||
                  item.unitId?.code ||
                  "",

                enteredUnitCost:
                  item.enteredUnitCost ??
                  item.actualUnitCost ??
                  "",
              }))
            : [createEmptyItem()],
      });

      return;
    }

    setFormData(initialForm);
  }, [purchase]);

  // --------------------------------------------------
  // AVAILABLE SUPPLIER POS
  // --------------------------------------------------

const availableSupplierPOs = useMemo(() => {
  return supplierPOs.filter(
    (supplierPO) => supplierPO.status === "sent",
  );
}, [supplierPOs]);

  // --------------------------------------------------
  // RESOLVE PRODUCT COST / UNIT
  // --------------------------------------------------

  const resolveProductPricing = (
    productId,
    supplierId,
  ) => {
    const selectedProduct = products.find(
      (product) => product._id === productId,
    );

    if (!selectedProduct) {
      return {
        unitId: "",
        unitCode: "",
        unitCost: 0,
      };
    }

    const selectedPricing =
      supplierPricings.find(
        (pricing) =>
          pricing.productId?._id === productId &&
          pricing.supplierId?._id === supplierId &&
          pricing.status === "active",
      );

    const unitId =
      selectedPricing?.unitId?._id ||
      selectedPricing?.unitId ||
      selectedProduct?.unitId?._id ||
      selectedProduct?.unitId ||
      "";

    const unitCode =
      selectedPricing?.unitCode ||
      selectedPricing?.unitId?.code ||
      selectedProduct?.unitCode ||
      selectedProduct?.unitId?.code ||
      "";

    const unitCost =
      selectedPricing?.unitCost ??
      selectedProduct?.productCost ??
      0;

    return {
      unitId,
      unitCode,
      unitCost: Number(unitCost),
    };
  };

  // --------------------------------------------------
  // FORM CHANGE
  // --------------------------------------------------

  const handleChange = (event) => {
    const { name, value } = event.target;

    if (name === "supplierId") {
      setFormData((current) => ({
        ...current,
        supplierId: value,
        supplierPOId: "",
        relatedClientPOId: "",
        items: current.items.map((item) => {
          if (!item.productId) {
            return {
              ...item,
              unitId: "",
              unitCode: "",
              enteredUnitCost: "",
            };
          }

          const pricing = resolveProductPricing(
            item.productId,
            value,
          );

          return {
            ...item,
            unitId: pricing.unitId,
            unitCode: pricing.unitCode,
            enteredUnitCost:
              pricing.unitCost,
          };
        }),
      }));

      return;
    }

    setFormData((current) => ({
      ...current,
      [name]: value,
    }));
  };

  // --------------------------------------------------
  // SELECT SUPPLIER PO
  // --------------------------------------------------

  const handleSupplierPOChange = (event) => {
    const supplierPOId = event.target.value;

    if (!supplierPOId) {
      setFormData((current) => ({
        ...current,
        supplierPOId: "",
        relatedClientPOId: "",
        items: [createEmptyItem()],
      }));

      return;
    }

    const selectedSupplierPO =
      supplierPOs.find(
        (supplierPO) =>
          supplierPO._id === supplierPOId,
      );

    if (!selectedSupplierPO) {
      return;
    }

    const supplierId =
      selectedSupplierPO.supplierId?._id ||
      selectedSupplierPO.supplierId ||
      "";

    const relatedClientPOId =
      selectedSupplierPO.relatedClientPOId?._id ||
      selectedSupplierPO.relatedClientPOId ||
      "";

    const items =
      selectedSupplierPO.items?.map((item) => {
        const productId =
          item.productId?._id ||
          item.productId ||
          "";

        const selectedProduct = products.find(
          (product) =>
            product._id === productId,
        );

        return {
          productId,

          description:
            item.description ||
            selectedProduct?.name ||
            "",

          quantity: Number(
            item.quantity || 0,
          ),

          unitId:
            item.unitId?._id ||
            item.unitId ||
            "",

          unitCode:
            item.unitCode ||
            item.unitId?.code ||
            "",

          enteredUnitCost: Number(
            item.expectedUnitCost || 0,
          ),
        };
      }) || [];

    setFormData((current) => ({
      ...current,

      supplierId,

      supplierPOId,

      relatedClientPOId,

      items:
        items.length > 0
          ? items
          : [createEmptyItem()],
    }));
  };

  // --------------------------------------------------
  // ITEM CHANGE
  // --------------------------------------------------

  const handleItemChange = (
    index,
    field,
    value,
  ) => {
    setFormData((current) => {
      const items = [...current.items];

      const currentItem = items[index];

      // Product changed
      if (field === "productId") {
        const pricing =
          resolveProductPricing(
            value,
            current.supplierId,
          );

        const selectedProduct =
          products.find(
            (product) =>
              product._id === value,
          );

        items[index] = {
          ...currentItem,

          productId: value,

          description:
            selectedProduct?.name || "",

          unitId: pricing.unitId,

          unitCode: pricing.unitCode,

          enteredUnitCost:
            pricing.unitCost,
        };
      } else {
        items[index] = {
          ...currentItem,
          [field]: value,
        };
      }

      return {
        ...current,
        items,
      };
    });
  };

  // --------------------------------------------------
  // ADD ITEM
  // --------------------------------------------------

  const addItem = () => {
    setFormData((current) => ({
      ...current,
      items: [
        ...current.items,
        createEmptyItem(),
      ],
    }));
  };

  // --------------------------------------------------
  // REMOVE ITEM
  // --------------------------------------------------

  const removeItem = (index) => {
    if (formData.items.length === 1) {
      return;
    }

    setFormData((current) => ({
      ...current,
      items: current.items.filter(
        (_, itemIndex) =>
          itemIndex !== index,
      ),
    }));
  };

  // --------------------------------------------------
  // TOTALS
  // --------------------------------------------------

  const totals = useMemo(() => {
    const subtotal =
      formData.items.reduce(
        (total, item) =>
          total +
          Number(item.quantity || 0) *
            Number(
              item.enteredUnitCost || 0,
            ),
        0,
      );

    const vatEnabled =
      settings?.accountingTax
        ?.vatEnabled === true;

    const vatRate = vatEnabled
      ? Number(
          settings?.accountingTax
            ?.vatRate || 0,
        )
      : 0;

    const pricingMode =
      settings?.accountingTax
        ?.pricingMode === "inclusive"
        ? "inclusive"
        : "exclusive";

    let netAmount = subtotal;
    let taxAmount = 0;
    let totalAmount = subtotal;

    if (
      vatEnabled &&
      vatRate > 0
    ) {
      if (
        pricingMode === "inclusive"
      ) {
        netAmount =
          subtotal /
          (1 + vatRate / 100);

        taxAmount =
          subtotal - netAmount;

        totalAmount = subtotal;
      } else {
        netAmount = subtotal;

        taxAmount =
          subtotal *
          (vatRate / 100);

        totalAmount =
          subtotal + taxAmount;
      }
    }

    return {
      subtotal,
      netAmount,
      taxAmount,
      totalAmount,
      vatRate,
      vatEnabled,
      pricingMode,
    };
  }, [formData.items, settings]);

  // --------------------------------------------------
  // SUBMIT
  // --------------------------------------------------

  const handleSubmit = (event) => {
    event.preventDefault();

    const payload = {
      supplierId:
        formData.supplierId,

      supplierPOId:
        formData.supplierPOId ||
        undefined,

      relatedClientPOId:
        formData.relatedClientPOId ||
        undefined,

      purchaseDate:
        formData.purchaseDate,

      items: formData.items.map(
        (item) => ({
          productId:
            item.productId,

          quantity:
            Number(item.quantity),

          enteredUnitCost:
            Number(
              item.enteredUnitCost,
            ),
        }),
      ),
    };

    onSubmit(payload);
  };

  return (
    <form
      onSubmit={handleSubmit}
      className="space-y-6"
    >
      {/* Purchase Information */}
      <div className="grid gap-4 md:grid-cols-2">
        {/* Purchase Number */}
        <div>
          <label className="mb-1.5 block text-sm font-medium text-slate-700 dark:text-slate-300">
            Purchase Number
          </label>

          <input
            type="text"
            value={
              purchase
                ? formData.purchaseNumber
                : "Auto-generated on save"
            }
            readOnly
            disabled={submitting}
            className="w-full cursor-not-allowed rounded-lg border border-slate-200 bg-slate-100 px-3 py-2.5 text-sm text-slate-600 outline-none dark:border-slate-700 dark:bg-slate-800 dark:text-slate-400"
          />

          <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
            {purchase
              ? "Document number cannot be changed."
              : "The purchase number will be generated automatically."}
          </p>
        </div>

        {/* Purchase Date */}
        <div>
          <label className="mb-1.5 block text-sm font-medium text-slate-700 dark:text-slate-300">
            Purchase Date
          </label>

          <input
            type="date"
            name="purchaseDate"
            value={
              formData.purchaseDate
            }
            onChange={handleChange}
            required
            className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2.5 text-sm text-slate-900 outline-none transition focus:border-green-500 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-100"
          />
        </div>

        {/* Supplier PO */}
<div>
  <label className="mb-1.5 block text-sm font-medium text-slate-700 dark:text-slate-300">
    Supplier PO
  </label>

  <select
    name="supplierPOId"
    value={formData.supplierPOId}
    onChange={handleSupplierPOChange}
    disabled={submitting}
    className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2.5 text-sm text-slate-700 outline-none focus:border-green-500 disabled:cursor-not-allowed disabled:bg-slate-100 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200 dark:disabled:bg-slate-800"
  >
    <option value="">No Supplier PO</option>

    {availableSupplierPOs.map((supplierPO) => (
      <option key={supplierPO._id} value={supplierPO._id}>
        {supplierPO.poNumber}
      </option>
    ))}
  </select>

  <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
    Optional. Select a Supplier PO to automatically populate the supplier and purchase items.
  </p>
</div>

        {/* Supplier */}
        <div>
          <label className="mb-1.5 block text-sm font-medium text-slate-700 dark:text-slate-300">
            Supplier
          </label>

          <select
            name="supplierId"
            value={
              formData.supplierId
            }
            onChange={handleChange}
            required
            disabled={
              !!formData.supplierPOId ||
              submitting
            }
            className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2.5 text-sm text-slate-700 outline-none focus:border-green-500 disabled:cursor-not-allowed disabled:bg-slate-100 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200 dark:disabled:bg-slate-800"
          >
            <option value="">
              Select supplier
            </option>

            {suppliers
              .filter(
                (supplier) =>
                  supplier.status ===
                  "active",
              )
              .map((supplier) => (
                <option
                  key={supplier._id}
                  value={supplier._id}
                >
                  {supplier.supplierCode} -{" "}
                  {supplier.name}
                </option>
              ))}
          </select>

          {formData.supplierPOId && (
            <p className="mt-1 text-xs text-slate-400 dark:text-slate-500">
              Supplier is determined by the selected Supplier PO.
            </p>
          )}
        </div>

        {/* Related Client PO */}
        <div className="md:col-span-2">
          <label className="mb-1.5 block text-sm font-medium text-slate-700 dark:text-slate-300">
            Related Client PO
          </label>

          <select
            name="relatedClientPOId"
            value={
              formData.relatedClientPOId
            }
            onChange={handleChange}
            disabled={
              !!formData.supplierPOId ||
              submitting
            }
            className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2.5 text-sm text-slate-700 outline-none focus:border-green-500 disabled:cursor-not-allowed disabled:bg-slate-100 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200 dark:disabled:bg-slate-800"
          >
            <option value="">
              None
            </option>

            {clientPOs.map(
              (clientPO) => (
                <option
                  key={clientPO._id}
                  value={clientPO._id}
                >
                  {clientPO.poNumber}
                </option>
              ),
            )}
          </select>

          {formData.supplierPOId && (
            <p className="mt-1 text-xs text-slate-400 dark:text-slate-500">
              Related Client PO is inherited from the Supplier PO.
            </p>
          )}
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
              {formData.supplierPOId
                ? "Items are populated from the selected Supplier PO."
                : "Add the products received from the supplier."}
            </p>
          </div>

          <button
            type="button"
            onClick={addItem}
            disabled={submitting}
            className="inline-flex items-center gap-2 rounded-lg border border-slate-200 px-3 py-2 text-xs font-semibold text-slate-700 transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-40 dark:border-slate-700 dark:text-slate-300 dark:hover:bg-slate-800"
          >
            <FaPlus className="h-3 w-3" />
            Add Item
          </button>
        </div>

        <div className="space-y-3">
          {formData.items.map(
            (item, index) => {
              const quantity =
                Number(item.quantity) ||
                0;

              const unitCost =
                Number(
                  item.enteredUnitCost,
                ) || 0;

              const itemTotal =
                quantity * unitCost;

              return (
                <div
                  key={index}
                  className="rounded-lg border border-slate-200 p-4 dark:border-slate-700"
                >
                  <div className="grid gap-4 md:grid-cols-8">

                    {/* Product */}
                    <div className="md:col-span-4">
                      <label className="mb-1.5 block text-xs font-medium text-slate-600 dark:text-slate-400">
                        Product
                      </label>

                      <select
                        value={
                          item.productId
                        }
                        onChange={(event) =>
                          handleItemChange(
                            index,
                            "productId",
                            event.target.value,
                          )
                        }
                        required
                        disabled={
                          submitting
                        }
                        className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2.5 text-sm text-slate-700 outline-none focus:border-green-500 disabled:cursor-not-allowed disabled:bg-slate-100 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200"
                      >
                        <option value="">
                          Select product
                        </option>

                        {products.map(
                          (product) => (
                            <option
                              key={
                                product._id
                              }
                              value={
                                product._id
                              }
                            >
                              {product.sku} -{" "}
                              {product.name}
                            </option>
                          ),
                        )}
                      </select>
                    </div>

                    {/* Description */}
                    <div className="md:col-span-3">
                      <label className="mb-1.5 block text-xs font-medium text-slate-600 dark:text-slate-400">
                        Description
                      </label>

                      <input
                        type="text"
                        value={
                          item.description ||
                          ""
                        }
                        onChange={(event) =>
                          handleItemChange(
                            index,
                            "description",
                            event.target.value,
                          )
                        }
                        required
                        disabled={
                          submitting
                        }
                        className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2.5 text-sm text-slate-900 outline-none focus:border-green-500 disabled:cursor-not-allowed disabled:bg-slate-100 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-100"
                      />
                    </div>

                    {/* Quantity */}
                    <div className="md:col-span-2">
                      <label className="mb-1.5 block text-xs font-medium text-slate-600 dark:text-slate-400">
                        Quantity
                      </label>

                      <input
                        type="number"
                        min="0.01"
                        step="0.01"
                        value={
                          item.quantity
                        }
                        onChange={(event) =>
                          handleItemChange(
                            index,
                            "quantity",
                            event.target.value,
                          )
                        }
                        required
                        disabled={
                          submitting
                        }
                        className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2.5 text-sm text-slate-900 outline-none focus:border-green-500 disabled:cursor-not-allowed disabled:bg-slate-100 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-100"
                      />
                    </div>

                    {/* Unit */}
                    <div className="md:col-span-1">
                      <label className="mb-1.5 block text-xs font-medium text-slate-600 dark:text-slate-400">
                        Unit
                      </label>

                      <input
                        type="text"
                        value={
                          item.unitCode ||
                          ""
                        }
                        readOnly
                        className="w-full cursor-not-allowed rounded-lg border border-slate-200 bg-slate-100 px-3 py-2.5 text-sm font-medium text-slate-600 outline-none dark:border-slate-700 dark:bg-slate-800 dark:text-slate-400"
                      />
                    </div>

                    {/* Unit Cost */}
                    <div className="md:col-span-1">
                      <label className="mb-1.5 block text-xs font-medium text-slate-600 dark:text-slate-400">
                        Unit Cost
                      </label>

                      <input
                        type="number"
                        value={
                          item.enteredUnitCost
                        }
                        readOnly
                        className="w-full cursor-not-allowed rounded-lg border border-slate-200 bg-slate-100 px-3 py-2.5 text-sm text-slate-600 outline-none dark:border-slate-700 dark:bg-slate-800 dark:text-slate-400"
                      />

                      {!loadingPricing &&
                        item.productId &&
                        formData.supplierId && (
                          <p className="mt-1 text-[11px] text-slate-400">
                            Auto-resolved
                          </p>
                        )}
                    </div>

                    {/* Total */}
                    <div className="md:col-span-2">
                      <label className="mb-1.5 block text-xs font-medium text-slate-600 dark:text-slate-400">
                        Line Total
                      </label>

                      <div className="flex h-[42px] items-center rounded-lg bg-slate-50 px-3 text-xl font-semibold text-slate-900 dark:bg-slate-800 dark:text-slate-100">
                        {formatCurrency(
                          itemTotal,
                          settings?.currency,
                        )}
                      </div>
                    </div>

                    {/* Remove */}
<div className="flex items-end justify-end md:col-span-1">
  {formData.items.length > 1 && (
    <button
      type="button"
      onClick={() => removeItem(index)}
      disabled={submitting}
      className="inline-flex items-center gap-2 text-xs font-semibold text-red-500 hover:text-red-700 disabled:opacity-50"
    >
      <FaTrash className="h-3 w-3" />
      Remove
    </button>
  )}
</div>
                  </div>
                </div>
              );
            },
          )}
        </div>
      </div>

      {/* Total */}
      <div className="flex justify-end">
        <div className="w-full space-y-3 rounded-xl border border-slate-200 bg-slate-50 p-5 md:w-96 dark:border-slate-700 dark:bg-slate-800">
          <div className="flex items-center justify-between">
            <span className="text-sm text-slate-500 dark:text-slate-400">
              Subtotal
            </span>

            <span className="text-sm font-semibold text-slate-900 dark:text-slate-100">
              {formatCurrency(
                totals.subtotal,
                settings?.currency,
              )}
            </span>
          </div>

          {totals.vatEnabled &&
            totals.vatRate > 0 && (
              <>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-slate-500 dark:text-slate-400">
                    Input VAT ({totals.vatRate}%)
                  </span>

                  <span className="text-sm font-semibold text-slate-900 dark:text-slate-100">
                    {formatCurrency(
                      totals.taxAmount,
                      settings?.currency,
                    )}
                  </span>
                </div>

                <div className="flex items-center justify-between">
                  <span className="text-sm text-slate-500 dark:text-slate-400">
                    Net Purchase
                  </span>

                  <span className="text-sm font-semibold text-slate-900 dark:text-slate-100">
                    {formatCurrency(
                      totals.netAmount,
                      settings?.currency,
                    )}
                  </span>
                </div>
              </>
            )}

          <div className="border-t border-slate-200 pt-3 dark:border-slate-700">
            <div className="flex items-center justify-between">
              <span className="text-sm font-semibold text-slate-700 dark:text-slate-300">
                Total Amount
              </span>

              <span className="text-xl font-bold text-slate-900 dark:text-slate-100">
                {formatCurrency(
                  totals.totalAmount,
                  settings?.currency,
                )}
              </span>
            </div>
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
import { useEffect, useMemo, useState } from "react";

import supplierService from "../../services/supplierService";
import productService from "../../services/productService";
import clientPOService from "../../services/clientPOService";
import unitService from "../../services/unitService";

import supplierPricingService from "../../services/supplierPricingService";

const emptyItem = {
  productId: "",
  description: "",
  quantity: "",
  unitId: "",
  unitCode: "",
  expectedUnitCost: "",
};

const initialForm = {
  supplierId: "",
  supplierPODate: new Date().toISOString().split("T")[0],
  relatedClientPOId: "",
  items: [emptyItem],
};

function SupplierPOForm({
  initialData = null,
  onSubmit,
  onClose,
  submitting = false,
}) {
  const isEdit = Boolean(initialData);

  const [form, setForm] = useState(initialForm);

  const [supplierPricings, setSupplierPricings] = useState([]);

  const [suppliers, setSuppliers] = useState([]);
  const [products, setProducts] = useState([]);
  const [clientPOs, setClientPOs] = useState([]);
  const [units, setUnits] = useState([]);

  const [loadingData, setLoadingData] = useState(true);
  const [error, setError] = useState("");

  // ==========================================
  // LOAD MASTER DATA
  // ==========================================

  useEffect(() => {
    const loadData = async () => {
      try {
        setLoadingData(true);
        setError("");

        const [
          suppliersResponse,
          productsResponse,
          clientPOsResponse,
          unitsResponse,
          supplierPricingsResponse,
        ] = await Promise.all([
          supplierService.getSuppliers(),
          productService.getProducts(),
          clientPOService.getClientPOs(),
          unitService.getUnits(),
          supplierPricingService.getSupplierPricings(),
        ]);

        setSupplierPricings(
          supplierPricingsResponse?.supplierPricings ||
            supplierPricingsResponse?.data ||
            [],
        );

        setSuppliers(
          suppliersResponse?.suppliers ||
            suppliersResponse?.data ||
            [],
        );

        setProducts(
          productsResponse?.products ||
            productsResponse?.data ||
            [],
        );

        setClientPOs(
          clientPOsResponse?.clientPOs ||
            clientPOsResponse?.data ||
            [],
        );

        setUnits(
          unitsResponse?.units ||
            unitsResponse?.data ||
            [],
        );
      } catch (err) {
        setError(
          err.response?.data?.message ||
            "Failed to load form data.",
        );
      } finally {
        setLoadingData(false);
      }
    };

    loadData();
  }, []);

  // ==========================================
  // EDIT INITIAL DATA
  // ==========================================

  useEffect(() => {
    if (!initialData) {
      setForm(initialForm);
      return;
    }

    setForm({
      supplierId:
        initialData.supplierId?._id ||
        initialData.supplierId ||
        "",

      supplierPODate: initialData.supplierPODate
        ? new Date(
            initialData.supplierPODate,
          )
            .toISOString()
            .split("T")[0]
        : "",

      relatedClientPOId:
        initialData.relatedClientPOId?._id ||
        initialData.relatedClientPOId ||
        "",

      items:
        initialData.items?.length > 0
          ? initialData.items.map((item) => ({
              productId:
                item.productId?._id ||
                item.productId ||
                "",

              description:
                item.description || "",

              quantity:
                item.quantity ?? "",

              unitId:
                item.unitId?._id ||
                item.unitId ||
                "",

              unitCode:
                item.unitCode ||
                item.unitId?.code ||
                "",

              expectedUnitCost:
                item.expectedUnitCost ?? "",
            }))
          : [emptyItem],
    });
  }, [initialData]);

  // ==========================================
  // TOTAL
  // ==========================================

  const totalAmount = useMemo(() => {
    return form.items.reduce((total, item) => {
      const quantity =
        Number(item.quantity) || 0;

      const cost =
        Number(item.expectedUnitCost) || 0;

      return total + quantity * cost;
    }, 0);
  }, [form.items]);

  // ==========================================
  // FIELD CHANGE
  // ==========================================

  const handleChange = (e) => {
    const { name, value } = e.target;

    setForm((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  // ==========================================
  // ITEM CHANGE
  // ==========================================

  const handleItemChange = (
    index,
    field,
    value,
  ) => {
    setForm((prev) => {
      const items = [...prev.items];

      items[index] = {
        ...items[index],
        [field]: value,
      };

      return {
        ...prev,
        items,
      };
    });
  };

  // ==========================================
  // RESOLVE EXPECTED UNIT COST
  // ==========================================

  const resolveExpectedUnitCost = (
    productId,
    supplierId,
  ) => {
    const product = products.find(
      (item) => item._id === productId,
    );

    if (!product) return "";

    const pricing = supplierPricings.find(
      (item) => {
        const pricingSupplierId =
          item.supplierId?._id ||
          item.supplierId;

        const pricingProductId =
          item.productId?._id ||
          item.productId;

        return (
          String(pricingSupplierId) ===
            String(supplierId) &&
          String(pricingProductId) ===
            String(productId) &&
          item.status === "active"
        );
      },
    );

    return pricing
      ? pricing.unitCost
      : (product.productCost ?? "");
  };

  // ==========================================
  // SUPPLIER CHANGE
  // ==========================================

  const handleSupplierChange = (
    supplierId,
  ) => {
    setForm((prev) => ({
      ...prev,
      supplierId,

      items: prev.items.map((item) => ({
        ...item,

        expectedUnitCost: item.productId
          ? resolveExpectedUnitCost(
              item.productId,
              supplierId,
            )
          : "",
      })),
    }));
  };

  // ==========================================
  // PRODUCT SELECT
  // ==========================================

  const handleProductChange = (
    index,
    productId,
  ) => {
    const product = products.find(
      (item) => item._id === productId,
    );

    setForm((prev) => {
      const resolvedCost =
        resolveExpectedUnitCost(
          productId,
          prev.supplierId,
        );

      const items = [...prev.items];

      items[index] = {
        ...items[index],

        productId,

        description:
          product?.name || "",

        unitId:
          product?.unitId?._id ||
          product?.unitId ||
          "",

        unitCode:
          product?.unitId?.code ||
          "",

        expectedUnitCost:
          resolvedCost,
      };

      return {
        ...prev,
        items,
      };
    });
  };

  // ==========================================
  // UNIT SELECT
  // ==========================================

  const handleUnitChange = (
    index,
    unitId,
  ) => {
    const unit = units.find(
      (item) => item._id === unitId,
    );

    setForm((prev) => {
      const items = [...prev.items];

      items[index] = {
        ...items[index],
        unitId,
        unitCode: unit?.code || "",
      };

      return {
        ...prev,
        items,
      };
    });
  };

  // ==========================================
  // ADD ITEM
  // ==========================================

  const addItem = () => {
    setForm((prev) => ({
      ...prev,

      items: [
        ...prev.items,
        {
          ...emptyItem,
        },
      ],
    }));
  };

  // ==========================================
  // REMOVE ITEM
  // ==========================================

  const removeItem = (index) => {
    if (form.items.length === 1) {
      return;
    }

    setForm((prev) => ({
      ...prev,

      items: prev.items.filter(
        (_, itemIndex) =>
          itemIndex !== index,
      ),
    }));
  };

  // ==========================================
  // VALIDATION
  // ==========================================

  const validateForm = () => {
    if (!form.supplierId) {
      return "Supplier is required.";
    }

    if (!form.supplierPODate) {
      return "Supplier PO date is required.";
    }

    if (!form.items.length) {
      return "At least one item is required.";
    }

    for (
      let index = 0;
      index < form.items.length;
      index++
    ) {
      const item = form.items[index];

      if (!item.productId) {
        return `Product is required for item ${
          index + 1
        }.`;
      }

      if (!item.description?.trim()) {
        return `Description is required for item ${
          index + 1
        }.`;
      }

      if (
        !item.quantity ||
        Number(item.quantity) <= 0
      ) {
        return `Quantity must be greater than 0 for item ${
          index + 1
        }.`;
      }

      if (!item.unitId) {
        return `Unit is required for item ${
          index + 1
        }.`;
      }

      if (
        item.expectedUnitCost === "" ||
        Number(item.expectedUnitCost) < 0
      ) {
        return `Expected unit cost is required for item ${
          index + 1
        }.`;
      }
    }

    return "";
  };

  // ==========================================
  // SUBMIT
  // ==========================================

  const handleSubmit = async (e) => {
    e.preventDefault();

    setError("");

    const validationError =
      validateForm();

    if (validationError) {
      setError(validationError);
      return;
    }

    const payload = {
      supplierId: form.supplierId,

      supplierPODate:
        form.supplierPODate,

      ...(form.relatedClientPOId
        ? {
            relatedClientPOId:
              form.relatedClientPOId,
          }
        : {}),

      items: form.items.map((item) => ({
        productId: item.productId,

        description:
          item.description.trim(),

        quantity:
          Number(item.quantity),

        unitId: item.unitId,

        unitCode:
          item.unitCode
            .trim()
            .toUpperCase(),

        expectedUnitCost:
          Number(
            item.expectedUnitCost,
          ),
      })),
    };

    await onSubmit(payload);
  };

  // ==========================================
  // FORMAT CURRENCY
  // ==========================================

  const formatCurrency = (value) => {
    return new Intl.NumberFormat(
      "en-PH",
      {
        style: "currency",
        currency: "PHP",
      },
    ).format(value);
  };

  // ==========================================
  // LOADING
  // ==========================================

  if (loadingData) {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
        <div className="w-full max-w-5xl rounded-2xl bg-white p-8 text-center shadow-xl dark:bg-slate-900">
          <p className="text-sm text-slate-500 dark:text-slate-400">
            Loading Supplier PO form...
          </p>
        </div>
      </div>
    );
  }

  // ==========================================
  // RENDER
  // ==========================================

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-black/50 p-4">
      <div className="mx-auto my-8 w-full max-w-6xl rounded-2xl bg-white shadow-xl dark:bg-slate-900">
        {/* HEADER */}

        <div className="flex items-center justify-between border-b border-slate-200 px-6 py-5 dark:border-slate-800">
          <div>
            <h2 className="text-xl font-bold text-slate-900 dark:text-slate-100">
              {isEdit
                ? "Edit Supplier PO"
                : "New Supplier PO"}
            </h2>

            <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
              Supplier Purchase Order
            </p>
          </div>

          <button
            type="button"
            onClick={onClose}
            disabled={submitting}
            className="text-2xl text-slate-400 transition hover:text-slate-700 dark:hover:text-slate-200"
          >
            ×
          </button>
        </div>

        {/* FORM */}

        <form
          onSubmit={handleSubmit}
          className="space-y-6 p-6"
        >
          {/* ERROR */}

          {error && (
            <div className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700 dark:border-red-900/50 dark:bg-red-950/30 dark:text-red-400">
              {error}
            </div>
          )}

          {/* HEADER FIELDS */}

          <div className="grid grid-cols-1 gap-5 md:grid-cols-3">
            {/* SUPPLIER */}

            <div>
              <label className="mb-1.5 block text-sm font-medium text-slate-700 dark:text-slate-300">
                Supplier
              </label>

              <select
                name="supplierId"
                value={form.supplierId}
                onChange={(e) =>
                  handleSupplierChange(
                    e.target.value,
                  )
                }
                disabled={submitting}
                className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2.5 text-sm text-slate-900 outline-none focus:border-green-500 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-100"
              >
                <option value="">
                  Select supplier
                </option>

                {suppliers.map(
                  (supplier) => (
                    <option
                      key={supplier._id}
                      value={supplier._id}
                    >
                      {supplier.supplierCode
                        ? `${supplier.supplierCode} - ${supplier.name}`
                        : supplier.name}
                    </option>
                  ),
                )}
              </select>
            </div>

            {/* DATE */}

            <div>
              <label className="mb-1.5 block text-sm font-medium text-slate-700 dark:text-slate-300">
                Supplier PO Date
              </label>

              <input
                type="date"
                name="supplierPODate"
                value={
                  form.supplierPODate
                }
                onChange={handleChange}
                disabled={submitting}
                className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2.5 text-sm text-slate-900 outline-none focus:border-green-500 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-100"
              />
            </div>

            {/* CLIENT PO */}

            <div>
              <label className="mb-1.5 block text-sm font-medium text-slate-700 dark:text-slate-300">
                Related Client PO
                <span className="ml-1 text-xs text-slate-400">
                  Optional
                </span>
              </label>

              <select
                name="relatedClientPOId"
                value={
                  form.relatedClientPOId
                }
                onChange={handleChange}
                disabled={submitting}
                className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2.5 text-sm text-slate-900 outline-none focus:border-green-500 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-100"
              >
                <option value="">
                  No Client PO
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
            </div>
          </div>

          {/* ITEMS */}

          <div className="overflow-hidden rounded-xl border border-slate-200 dark:border-slate-800">
            <div className="flex items-center justify-between border-b border-slate-200 bg-slate-50 px-5 py-4 dark:border-slate-800 dark:bg-slate-800/50">
              <div>
                <h3 className="font-semibold text-slate-900 dark:text-slate-100">
                  Order Items
                </h3>

                <p className="text-xs text-slate-500 dark:text-slate-400">
                  Add products and supplier
                  costs.
                </p>
              </div>

              <button
                type="button"
                onClick={addItem}
                disabled={submitting}
                className="rounded-lg bg-green-600 px-3 py-2 text-sm font-semibold text-white transition hover:bg-green-700 disabled:opacity-50"
              >
                + Add Item
              </button>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full min-w-[950px] text-sm">
                <thead className="bg-slate-50 dark:bg-slate-800/30">
                  <tr>
                    <th className="px-4 py-3 text-left font-semibold text-slate-600 dark:text-slate-400">
                      Product
                    </th>

                    <th className="px-4 py-3 text-left font-semibold text-slate-600 dark:text-slate-400">
                      Description
                    </th>

                    <th className="px-4 py-3 text-left font-semibold text-slate-600 dark:text-slate-400">
                      Qty
                    </th>

                    <th className="px-4 py-3 text-left font-semibold text-slate-600 dark:text-slate-400">
                      Unit
                    </th>

                    <th className="px-4 py-3 text-right font-semibold text-slate-600 dark:text-slate-400">
                      Unit Cost
                    </th>

                    <th className="px-4 py-3 text-right font-semibold text-slate-600 dark:text-slate-400">
                      Amount
                    </th>

                    <th className="px-4 py-3" />
                  </tr>
                </thead>

                <tbody>
                  {form.items.map(
                    (item, index) => {
                      const amount =
                        (Number(
                          item.quantity,
                        ) || 0) *
                        (Number(
                          item.expectedUnitCost,
                        ) || 0);

                      return (
                        <tr
                          key={index}
                          className="border-t border-slate-100 dark:border-slate-800"
                        >
                          {/* PRODUCT */}

                          <td className="px-4 py-3">
                            <select
                              value={
                                item.productId
                              }
                              onChange={(e) =>
                                handleProductChange(
                                  index,
                                  e.target
                                    .value,
                                )
                              }
                              disabled={
                                submitting
                              }
                              className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm outline-none focus:border-green-500 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-100"
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
                                    {product.sku
                                      ? `${product.sku} - ${product.name}`
                                      : product.name}
                                  </option>
                                ),
                              )}
                            </select>
                          </td>

                          {/* DESCRIPTION */}

                          <td className="px-4 py-3">
                            <input
                              type="text"
                              value={
                                item.description
                              }
                              onChange={(e) =>
                                handleItemChange(
                                  index,
                                  "description",
                                  e.target
                                    .value,
                                )
                              }
                              disabled={
                                submitting
                              }
                              placeholder="Description"
                              className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm outline-none focus:border-green-500 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-100"
                            />
                          </td>

                          {/* QUANTITY */}

                          <td className="w-28 px-4 py-3">
                            <input
                              type="number"
                              min="0.01"
                              step="0.01"
                              value={
                                item.quantity
                              }
                              onChange={(e) =>
                                handleItemChange(
                                  index,
                                  "quantity",
                                  e.target
                                    .value,
                                )
                              }
                              disabled={
                                submitting
                              }
                              className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm outline-none focus:border-green-500 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-100"
                            />
                          </td>

                          {/* UNIT */}

                          <td className="w-36 px-4 py-3">
                            <select
                              value={
                                item.unitId
                              }
                              onChange={(e) =>
                                handleUnitChange(
                                  index,
                                  e.target
                                    .value,
                                )
                              }
                              disabled={
                                submitting
                              }
                              className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm outline-none focus:border-green-500 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-100"
                            >
                              <option value="">
                                Select unit
                              </option>

                              {units.map(
                                (unit) => (
                                  <option
                                    key={
                                      unit._id
                                    }
                                    value={
                                      unit._id
                                    }
                                  >
                                    {unit.code}
                                  </option>
                                ),
                              )}
                            </select>
                          </td>

                          {/* COST */}

                          <td className="w-36 px-4 py-3">
                            <input
                              type="number"
                              value={
                                item.expectedUnitCost
                              }
                              readOnly
                              disabled={
                                submitting
                              }
                              className="w-full cursor-not-allowed rounded-lg border border-slate-200 bg-slate-100 px-3 py-2 text-right text-sm text-slate-700 outline-none dark:border-slate-700 dark:bg-slate-800 dark:text-slate-300"
                            />
                          </td>

                          {/* AMOUNT */}

                          <td className="px-4 py-3 text-right font-semibold text-slate-900 dark:text-slate-100">
                            {formatCurrency(
                              amount,
                            )}
                          </td>

                          {/* REMOVE */}

                          <td className="px-4 py-3 text-right">
                            <button
                              type="button"
                              onClick={() =>
                                removeItem(
                                  index,
                                )
                              }
                              disabled={
                                submitting ||
                                form.items
                                  .length ===
                                  1
                              }
                              className="rounded-lg px-2 py-1.5 text-sm text-red-500 transition hover:bg-red-50 hover:text-red-700 disabled:cursor-not-allowed disabled:opacity-30 dark:hover:bg-red-950/30"
                            >
                              Remove
                            </button>
                          </td>
                        </tr>
                      );
                    },
                  )}
                </tbody>
              </table>
            </div>

            {/* TOTAL */}

            <div className="flex justify-end border-t border-slate-200 bg-slate-50 px-5 py-4 dark:border-slate-800 dark:bg-slate-800/30">
              <div className="flex items-center gap-6">
                <span className="text-sm font-medium text-slate-500 dark:text-slate-400">
                  Total
                </span>

                <span className="text-xl font-bold text-slate-900 dark:text-slate-100">
                  {formatCurrency(
                    totalAmount,
                  )}
                </span>
              </div>
            </div>
          </div>

          {/* FOOTER */}

          <div className="flex justify-end gap-3 border-t border-slate-200 pt-5 dark:border-slate-800">
            <button
              type="button"
              onClick={onClose}
              disabled={submitting}
              className="rounded-lg border border-slate-200 px-4 py-2.5 text-sm font-semibold text-slate-700 transition hover:bg-slate-50 disabled:opacity-50 dark:border-slate-700 dark:text-slate-300 dark:hover:bg-slate-800"
            >
              Cancel
            </button>

            <button
              type="submit"
              disabled={
                submitting || loadingData
              }
              className="rounded-lg bg-green-600 px-5 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-green-700 disabled:cursor-not-allowed disabled:opacity-50"
            >
              {submitting
                ? isEdit
                  ? "Updating..."
                  : "Creating..."
                : isEdit
                  ? "Update Supplier PO"
                  : "Create Supplier PO"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default SupplierPOForm;
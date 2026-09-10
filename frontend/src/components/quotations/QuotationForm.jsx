import { useEffect, useState } from "react";
import customerService from "../../services/customerService";
import productService from "../../services/productService";
import supplierService from "../../services/supplierService";
import supplierPricingService from "../../services/supplierPricingService";

function QuotationForm({
  initialData = null,
  onSubmit,
  onClose,
  submitting = false,
}) {
  const [customers, setCustomers] = useState([]);
  const [products, setProducts] = useState([]);

  const [suppliers, setSuppliers] = useState([]);
  const [supplierPricings, setSupplierPricings] = useState([]);

  const [loadingReferences, setLoadingReferences] = useState(true);

  const [error, setError] = useState("");

  const isEditing = Boolean(initialData);

  // BUILD FORM DATA
  const buildFormData = (quotation = null) => {
    if (!quotation) {
      return {
        quotationNumber: "",
        customerId: "",
        quotationDate: new Date().toISOString().split("T")[0],
        status: "draft",
        items: [
          {
            productId: "",
            supplierId: "",
            description: "",
            quantity: 1,
            supplierCostAtQuotation: 0,
            quotedUnitPrice: 0,
          },
        ],
        laborCost: 0,
        otherDirectCosts: 0,
      };
    }

    return {
      quotationNumber: quotation.quotationNumber || "",

      customerId: quotation.customerId?._id || quotation.customerId || "",

      quotationDate: quotation.quotationDate
        ? new Date(quotation.quotationDate).toISOString().split("T")[0]
        : new Date().toISOString().split("T")[0],

      status: quotation.status || "draft",

      items:
        quotation.items?.length > 0
          ? quotation.items.map((item) => ({
              productId: item.productId?._id || item.productId || "",
              supplierId: item.supplierId?._id || item.supplierId || "",
              description: item.description || "",

              quantity: item.quantity ?? 1,

              supplierCostAtQuotation: item.supplierCostAtQuotation ?? 0,

              quotedUnitPrice: item.quotedUnitPrice ?? 0,
            }))
          : [
              {
                productId: "",
                supplierId: "",
                description: "",
                quantity: 1,
                supplierCostAtQuotation: 0,
                quotedUnitPrice: 0,
              },
            ],

      laborCost: quotation.laborCost ?? 0,

      otherDirectCosts: quotation.otherDirectCosts ?? 0,
    };
  };

  const [formData, setFormData] = useState(buildFormData(initialData));

  // UPDATE FORM WHEN EDITING TARGET CHANGES
  useEffect(() => {
    setFormData(buildFormData(initialData));
    setError("");
  }, [initialData]);

  // LOAD CUSTOMERS AND PRODUCTS
  useEffect(() => {
    const loadReferences = async () => {
      try {
        setLoadingReferences(true);
        setError("");

        const [
          customerResponse,
          productResponse,
          supplierResponse,
          supplierPricingResponse,
        ] = await Promise.all([
          customerService.getCustomers(),
          productService.getProducts(),
          supplierService.getSuppliers(),
          supplierPricingService.getSupplierPricings(),
        ]);

        setCustomers(customerResponse.customers || []);

        setProducts(productResponse.products || []);

        setSuppliers(
          (supplierResponse.suppliers || []).filter(
            (supplier) => supplier.status === "active",
          ),
        );

        setSupplierPricings(supplierPricingResponse.supplierPricings || []);
      } catch (error) {
        console.error("Failed to load quotation references:", error);

        setError(
          error.response?.data?.message ||
            "Failed to load customers and products.",
        );
      } finally {
        setLoadingReferences(false);
      }
    };

    loadReferences();
  }, []);

  // HANDLE BASIC FIELD CHANGE
  const handleChange = (e) => {
    const { name, value } = e.target;

    setFormData((previous) => ({
      ...previous,
      [name]: value,
    }));
  };

  // HANDLE ITEM CHANGE
  const handleItemChange = (index, field, value) => {
    setFormData((previous) => {
      const items = [...previous.items];

      items[index] = {
        ...items[index],
        [field]: value,
      };

      return {
        ...previous,
        items,
      };
    });
  };

  // ADD ITEM
  const addItem = () => {
    setFormData((previous) => ({
      ...previous,
      items: [
        ...previous.items,
        {
          productId: "",
          supplierId: "",
          description: "",
          quantity: 1,
          supplierCostAtQuotation: 0,
          quotedUnitPrice: 0,
        },
      ],
    }));
  };

  // REMOVE ITEM
  const removeItem = (index) => {
    setFormData((previous) => {
      if (previous.items.length === 1) {
        return previous;
      }

      return {
        ...previous,
        items: previous.items.filter((_, itemIndex) => itemIndex !== index),
      };
    });
  };

  // PRODUCT SELECTION
  const handleProductChange = (index, productId) => {
    const selectedProduct = products.find(
      (product) => product._id === productId,
    );

    setFormData((previous) => {
      const items = [...previous.items];

      items[index] = {
        ...items[index],
        productId,
        supplierId: "",
        supplierCostAtQuotation: 0,
        description: selectedProduct?.name || items[index].description,
      };

      return {
        ...previous,
        items,
      };
    });
  };

  const handleSupplierChange = (index, supplierId) => {
    const selectedPricing = supplierPricings.find(
      (pricing) =>
        pricing.productId?._id === formData.items[index].productId &&
        pricing.supplierId?._id === supplierId &&
        pricing.status === "active",
    );

    setFormData((previous) => {
      const items = [...previous.items];

      items[index] = {
        ...items[index],
        supplierId,
        supplierCostAtQuotation: selectedPricing?.unitCost ?? 0,
      };

      return {
        ...previous,
        items,
      };
    });
  };


  // SUBMIT
  const handleSubmit = async (e) => {
    e.preventDefault();

    setError("");

    if (!formData.customerId) {
      setError("Customer is required.");
      return;
    }

    const hasInvalidItem = formData.items.some(
      (item) =>
        !item.productId ||
        !item.description.trim() ||
        Number(item.quantity) <= 0,
    );

    if (hasInvalidItem) {
      setError("Please complete all quotation items.");
      return;
    }

    const hasInvalidPrice = formData.items.some(
      (item) =>
        Number(item.supplierCostAtQuotation) < 0 ||
        Number(item.quotedUnitPrice) < 0,
    );

    if (hasInvalidPrice) {
      setError("Supplier cost and quoted price cannot be negative.");
      return;
    }

    try {
      await onSubmit({
        customerId: formData.customerId,

        quotationDate: formData.quotationDate,

        status: formData.status,

        items: formData.items.map((item) => ({
          productId: item.productId,

          supplierId: item.supplierId || undefined,

          description: item.description.trim(),

          quantity: Number(item.quantity),

          supplierCostAtQuotation: Number(item.supplierCostAtQuotation),

          quotedUnitPrice: Number(item.quotedUnitPrice),
        })),

        laborCost: Number(formData.laborCost),

        otherDirectCosts: Number(formData.otherDirectCosts),
      });
    } catch (error) {
      console.error("Failed to submit quotation:", error);

      setError(error.response?.data?.message || "Failed to save quotation.");
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
      <div className="max-h-[90vh] w-full max-w-5xl overflow-y-auto rounded-xl bg-white shadow-xl dark:bg-slate-900">
        {/* HEADER */}
        <div className="flex items-center justify-between border-b border-slate-200 px-6 py-4 dark:border-slate-800">
          <div>
            <h2 className="text-lg font-semibold text-slate-900 dark:text-slate-100">
              {isEditing ? "Edit Quotation" : "New Quotation"}
            </h2>

            <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
              {isEditing
                ? "Update the quotation details."
                : "Create a quotation for a customer."}
            </p>
          </div>

          <button
            type="button"
            onClick={onClose}
            disabled={submitting}
            className="text-xl text-slate-400 transition hover:text-slate-700 disabled:cursor-not-allowed dark:hover:text-slate-200"
          >
            ×
          </button>
        </div>

        {/* ERROR */}
        {error && (
          <div className="mx-6 mt-4 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700 dark:border-red-900/50 dark:bg-red-950/30 dark:text-red-400">
            {error}
          </div>
        )}

        {/* FORM */}
        <form onSubmit={handleSubmit} className="space-y-6 p-6">
          {/* BASIC INFORMATION */}
          <div className="grid grid-cols-1 gap-4 md:grid-cols-4">
            {/* QUOTATION NUMBER */}
            <div>
              <label className="mb-1 block text-sm font-medium text-slate-700 dark:text-slate-300">
                Quotation Number
              </label>

              <input
                type="text"
                value={
                  isEditing
                    ? formData.quotationNumber
                    : "Auto-generated on save"
                }
                readOnly
                disabled={submitting}
                className="w-full cursor-not-allowed rounded-lg border border-slate-200 bg-slate-100 px-3 py-2.5 text-sm text-slate-600 outline-none dark:border-slate-700 dark:bg-slate-800 dark:text-slate-400"
              />

              <p className="mt-1 text-xs text-slate-400 dark:text-slate-500">
                {isEditing
                  ? "Document number cannot be changed."
                  : "The quotation number will be generated automatically."}
              </p>
            </div>

            {/* CUSTOMER */}
            <div>
              <label className="mb-1 block text-sm font-medium text-slate-700 dark:text-slate-300">
                Customer
              </label>

              <select
                name="customerId"
                value={formData.customerId}
                onChange={handleChange}
                disabled={submitting || loadingReferences}
                className="w-full rounded-lg border border-slate-200 bg-slate-50 px-3 py-2.5 text-sm text-slate-700 outline-none focus:border-green-500 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-300"
              >
                <option value="">
                  {loadingReferences
                    ? "Loading customers..."
                    : "Select customer"}
                </option>

                {customers.map((customer) => (
                  <option key={customer._id} value={customer._id}>
                    {customer.name}
                  </option>
                ))}
              </select>
            </div>

            {/* QUOTATION DATE */}
            <div>
              <label className="mb-1 block text-sm font-medium text-slate-700 dark:text-slate-300">
                Quotation Date
              </label>

              <input
                type="date"
                name="quotationDate"
                value={formData.quotationDate}
                onChange={handleChange}
                disabled={submitting}
                className="w-full rounded-lg border border-slate-200 bg-slate-50 px-3 py-2.5 text-sm text-slate-700 outline-none focus:border-green-500 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-300"
              />
            </div>

            {/* STATUS */}
            <div>
              <label className="mb-1 block text-sm font-medium text-slate-700 dark:text-slate-300">
                Status
              </label>

              <select
                name="status"
                value={formData.status}
                onChange={handleChange}
                disabled={submitting}
                className="w-full rounded-lg border border-slate-200 bg-slate-50 px-3 py-2.5 text-sm text-slate-700 outline-none focus:border-green-500 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-300"
              >
                <option value="draft">Draft</option>

                <option value="sent">Sent</option>

                <option value="accepted">Accepted</option>

                <option value="rejected">Rejected</option>

                <option value="expired">Expired</option>

                <option value="cancelled">Cancelled</option>
              </select>
            </div>
          </div>

          {/* ITEMS */}
          <div>
            <div className="mb-3 flex items-center justify-between">
              <div>
                <h3 className="text-sm font-semibold text-slate-900 dark:text-slate-100">
                  Quotation Items
                </h3>

                <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
                  Add the products and pricing for this quotation.
                </p>
              </div>

              <button
                type="button"
                onClick={addItem}
                disabled={submitting}
                className="rounded-lg border border-green-600 px-3 py-2 text-sm font-semibold text-green-600 transition hover:bg-green-50 disabled:cursor-not-allowed dark:hover:bg-green-950/20"
              >
                + Add Item
              </button>
            </div>

            <div className="overflow-x-auto rounded-lg border border-slate-200 dark:border-slate-800">
             <table className="w-full min-w-[1100px] text-left text-sm">
                <thead className="bg-slate-50 text-xs uppercase text-slate-500 dark:bg-slate-800/50 dark:text-slate-400">
                  <tr>
                    <th className="px-4 py-3">Product</th>

                    <th className="px-4 py-3">Supplier</th>

                    <th className="px-4 py-3">Description</th>

                    <th className="px-4 py-3">Qty</th>

                    <th className="px-4 py-3">Supplier Cost</th>

                    <th className="px-4 py-3">Quoted Price</th>

                    <th className="px-4 py-3 text-right">Action</th>
                  </tr>
                </thead>

                <tbody>
                  {formData.items.map((item, index) => (
                    <tr
                      key={index}
                      className="border-t border-slate-100 dark:border-slate-800"
                    >
                      {/* PRODUCT */}
                      <td className="px-4 py-3">
                        <select
                          value={item.productId}
                          onChange={(e) =>
                            handleProductChange(index, e.target.value)
                          }
                          disabled={submitting || loadingReferences}
                          className="w-full rounded-lg border border-slate-200 bg-slate-50 px-3 py-2 text-sm outline-none focus:border-green-500 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-300"
                        >
                          <option value="">
                            {loadingReferences
                              ? "Loading products..."
                              : "Select product"}
                          </option>

                          {products.map((product) => (
                            <option key={product._id} value={product._id}>
                              {product.sku} - {product.name}
                            </option>
                          ))}
                        </select>
                      </td>

                      {/* Supplier */}
                      <td className="px-4 py-3">
                        <select
                          value={item.supplierId}
                          onChange={(e) =>
                            handleSupplierChange(index, e.target.value)
                          }
                          disabled={
                            submitting || loadingReferences || !item.productId
                          }
                          className="w-full rounded-lg border border-slate-200 bg-slate-50 px-3 py-2 text-sm outline-none focus:border-green-500 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-300"
                        >
                          <option value="">
                            {!item.productId
                              ? "Select product first"
                              : "Select supplier (optional)"}
                          </option>

                          {suppliers.map((supplier) => (
                            <option key={supplier._id} value={supplier._id}>
                              {supplier.name}
                            </option>
                          ))}
                        </select>
                      </td>

                      {/* DESCRIPTION */}
                      <td className="px-4 py-3">
                        <input
                          type="text"
                          value={item.description}
                          onChange={(e) =>
                            handleItemChange(
                              index,
                              "description",
                              e.target.value,
                            )
                          }
                          disabled={submitting}
                          className="w-full rounded-lg border border-slate-200 bg-slate-50 px-3 py-2 text-sm outline-none focus:border-green-500 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-100"
                        />
                      </td>

                      {/* QUANTITY */}
                      <td className="px-4 py-3">
                        <input
                          type="number"
                          min="0.01"
                          step="0.01"
                          value={item.quantity}
                          onChange={(e) =>
                            handleItemChange(index, "quantity", e.target.value)
                          }
                          disabled={submitting}
                          className="w-24 rounded-lg border border-slate-200 bg-slate-50 px-3 py-2 text-sm outline-none focus:border-green-500 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-100"
                        />
                      </td>

                      {/* SUPPLIER COST */}
                      <td className="px-4 py-3">
                        <input
                          type="number"
                          min="0"
                          step="0.01"
                          value={item.supplierCostAtQuotation}
                          onChange={(e) =>
                            handleItemChange(
                              index,
                              "supplierCostAtQuotation",
                              e.target.value,
                            )
                          }
                          disabled={
                            submitting ||
                            supplierPricings.some(
                              (pricing) =>
                                pricing.productId?._id === item.productId &&
                                pricing.supplierId?._id === item.supplierId &&
                                pricing.status === "active",
                            )
                          }
                          className="w-32 rounded-lg border border-slate-200 bg-slate-50 px-3 py-2 text-sm outline-none focus:border-green-500 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-100"
                        />
                      </td>

                      {/* QUOTED PRICE */}
                      <td className="px-4 py-3">
                        <input
                          type="number"
                          min="0"
                          step="0.01"
                          value={item.quotedUnitPrice}
                          onChange={(e) =>
                            handleItemChange(
                              index,
                              "quotedUnitPrice",
                              e.target.value,
                            )
                          }
                          disabled={submitting}
                          className="w-32 rounded-lg border border-slate-200 bg-slate-50 px-3 py-2 text-sm outline-none focus:border-green-500 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-100"
                        />
                      </td>

                      {/* REMOVE */}
                      <td className="px-4 py-3 text-right">
                        <button
                          type="button"
                          onClick={() => removeItem(index)}
                          disabled={submitting || formData.items.length === 1}
                          className="text-sm font-medium text-red-500 transition hover:text-red-700 disabled:cursor-not-allowed disabled:opacity-40"
                        >
                          Remove
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* ADDITIONAL COSTS */}
          <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
            <div>
              <label className="mb-1 block text-sm font-medium text-slate-700 dark:text-slate-300">
                Labor Cost
              </label>

              <input
                type="number"
                min="0"
                step="0.01"
                name="laborCost"
                value={formData.laborCost}
                onChange={handleChange}
                disabled={submitting}
                className="w-full rounded-lg border border-slate-200 bg-slate-50 px-3 py-2.5 text-sm outline-none focus:border-green-500 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-100"
              />
            </div>

            <div>
              <label className="mb-1 block text-sm font-medium text-slate-700 dark:text-slate-300">
                Other Direct Costs
              </label>

              <input
                type="number"
                min="0"
                step="0.01"
                name="otherDirectCosts"
                value={formData.otherDirectCosts}
                onChange={handleChange}
                disabled={submitting}
                className="w-full rounded-lg border border-slate-200 bg-slate-50 px-3 py-2.5 text-sm outline-none focus:border-green-500 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-100"
              />
            </div>
          </div>

          {/* ACTIONS */}
          <div className="flex justify-end gap-3 border-t border-slate-200 pt-4 dark:border-slate-800">
            <button
              type="button"
              onClick={onClose}
              disabled={submitting}
              className="rounded-lg border border-slate-200 px-4 py-2.5 text-sm font-semibold text-slate-600 transition hover:bg-slate-50 disabled:cursor-not-allowed dark:border-slate-700 dark:text-slate-300 dark:hover:bg-slate-800"
            >
              Cancel
            </button>

            <button
              type="submit"
              disabled={submitting || loadingReferences}
              className="rounded-lg bg-green-600 px-4 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-green-700 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {submitting
                ? "Saving..."
                : isEditing
                  ? "Update Quotation"
                  : "Save Quotation"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default QuotationForm;

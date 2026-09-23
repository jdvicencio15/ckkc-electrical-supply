import { useEffect, useMemo, useState } from "react";
import { FaPlus, FaTrash, FaTimes } from "react-icons/fa";

import customerService from "../../services/customerService";
import productService from "../../services/productService";
import quotationService from "../../services/quotationService";

import { useSettings } from "../../context/SettingsContext";
import { formatCurrency } from "../../utils/currency";


function ClientPOForm({
  initialData = null,
  onSubmit,
  onClose,
  submitting = false,
}) {
  const { settings } = useSettings();

  const [loadingQuotation, setLoadingQuotation] = useState(false);

  const [customers, setCustomers] = useState([]);
  const [products, setProducts] = useState([]);
  const [quotations, setQuotations] = useState([]);

  const [loadingReferences, setLoadingReferences] = useState(true);
  const [error, setError] = useState("");

  const isEditing = Boolean(initialData);

  // =========================
  // BUILD FORM DATA
  // =========================
  const buildFormData = (clientPO = null) => {
    if (!clientPO) {
      return {
        customerId: "",
        quotationId: "",
        poDate: new Date().toISOString().split("T")[0],
        status: "draft",
        items: [
          {
            productId: "",
            description: "",
            quantity: 1,
            agreedUnitPrice: 0,
          },
        ],
        laborCost: 0,
        otherDirectCosts: 0,
      };
    }

    return {
      customerId: clientPO.customerId?._id || clientPO.customerId || "",

      quotationId: clientPO.quotationId?._id || clientPO.quotationId || "",

      poDate: clientPO.poDate
        ? new Date(clientPO.poDate).toISOString().split("T")[0]
        : new Date().toISOString().split("T")[0],

      status: clientPO.status || "draft",

      items:
        clientPO.items?.length > 0
          ? clientPO.items.map((item) => ({
              productId: item.productId?._id || item.productId || "",

              description: item.description || item.productId?.name || "",

              quantity: item.quantity ?? 1,

              agreedUnitPrice: item.agreedUnitPrice ?? 0,
            }))
          : [
              {
                productId: "",
                description: "",
                quantity: 1,
                agreedUnitPrice: 0,
              },
            ],

      laborCost: clientPO.laborCost ?? 0,

      otherDirectCosts: clientPO.otherDirectCosts ?? 0,
    };
  };

  const [formData, setFormData] = useState(buildFormData(initialData));

  // =========================
  // RESET WHEN EDIT TARGET CHANGES
  // =========================
  useEffect(() => {
    setFormData(buildFormData(initialData));
    setError("");
  }, [initialData]);

  // =========================
  // LOAD REFERENCES
  // =========================
  useEffect(() => {
    const loadReferences = async () => {
      try {
        setLoadingReferences(true);
        setError("");

        const [customerResponse, productResponse, quotationResponse] =
          await Promise.all([
            customerService.getCustomers(),
            productService.getProducts(),
            quotationService.getQuotations(),
          ]);

        setCustomers(
          (customerResponse.customers || []).filter(
            (customer) => customer.status === "active",
          ),
        );

        setProducts(
          (productResponse.products || []).filter(
            (product) => product.status === "active",
          ),
        );

        setQuotations(
          (quotationResponse.quotations || []).filter(
            (quotation) => quotation.status === "accepted",
          ),
        );
      } catch (error) {
        console.error("Failed to load Client PO references:", error);

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

  // =========================
  // BASIC FIELD CHANGE
  // =========================
  const handleChange = (event) => {
    const { name, value } = event.target;

    setFormData((previous) => ({
      ...previous,
      [name]: value,
      ...(name === "customerId" ? { quotationId: "" } : {}),
    }));

    if (name === "customerId") {
      setError("");
    }
  };

  const handleQuotationChange = async (quotationId) => {
    setFormData((previous) => ({
      ...previous,
      quotationId,
    }));

   if (!quotationId) {
  setFormData((previous) => ({
    ...previous,
    quotationId: "",
    items: [
      {
        productId: "",
        description: "",
        quantity: 1,
        agreedUnitPrice: 0,
      },
    ],
    laborCost: 0,
    otherDirectCosts: 0,
  }));

  return;
}

    try {
      setLoadingQuotation(true);
      setError("");

      const response = await quotationService.getQuotationById(quotationId);

      const quotation = response.quotation || response.data || response;

      const quotationItems = quotation.items || [];

      if (quotationItems.length === 0) {
        setError("Selected quotation has no items.");
        return;
      }

      setFormData((previous) => ({
        ...previous,
        quotationId,
        items: quotationItems.map((item) => ({
          productId: item.productId?._id || item.productId || "",

          description: item.description || item.productId?.name || "",

          quantity: item.quantity ?? 1,

          agreedUnitPrice: item.quotedUnitPrice ?? 0,
        })),

        laborCost: quotation.laborCost ?? 0,

        otherDirectCosts: quotation.otherDirectCosts ?? 0,
      }));
    } catch (error) {
      console.error("Failed to load quotation:", error);

      setError(
        error.response?.data?.message || "Failed to load quotation details.",
      );
    } finally {
      setLoadingQuotation(false);
    }
  };

  // =========================
  // ITEM CHANGE
  // =========================
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

  // =========================
  // PRODUCT CHANGE
  // =========================
  const handleProductChange = (index, productId) => {
    const product = products.find((item) => item._id === productId);

    setFormData((previous) => {
      const items = [...previous.items];

      items[index] = {
        ...items[index],
        productId,
        description: product?.name || items[index].description || "",
        agreedUnitPrice: items[index].agreedUnitPrice ?? 0,
      };

      return {
        ...previous,
        items,
      };
    });
  };

  // =========================
  // ADD ITEM
  // =========================
  const addItem = () => {
    setFormData((previous) => ({
      ...previous,
      items: [
        ...previous.items,
        {
          productId: "",
          description: "",
          quantity: 1,
          agreedUnitPrice: 0,
        },
      ],
    }));
  };

  // =========================
  // REMOVE ITEM
  // =========================
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

  // =========================
  // FILTER QUOTATIONS BY CUSTOMER
  // =========================
  const availableQuotations = useMemo(() => {
    if (!formData.customerId) {
      return [];
    }

    return quotations.filter(
      (quotation) => quotation.customerId?._id === formData.customerId,
    );
  }, [quotations, formData.customerId]);

  // =========================
  // ITEM TOTAL
  // =========================
  const getItemTotal = (item) => {
    return Number(item.quantity || 0) * Number(item.agreedUnitPrice || 0);
  };

  // =========================
  // SUBTOTAL
  // =========================
  const subtotal = useMemo(() => {
    return formData.items.reduce(
      (total, item) => total + getItemTotal(item),
      0,
    );
  }, [formData.items]);

  // =========================
  // COMMERCIAL TOTALS
  // =========================
  const laborCost = Number(formData.laborCost || 0);

  const otherDirectCosts = Number(formData.otherDirectCosts || 0);

  const estimatedTotal = subtotal + laborCost + otherDirectCosts;

  // =========================
  // VALIDATION
  // =========================
  const validateForm = () => {
    if (!formData.customerId) {
      return "Customer is required.";
    }

    if (!formData.poDate) {
      return "PO date is required.";
    }

    if (!formData.items || formData.items.length === 0) {
      return "Client PO must contain at least one item.";
    }

    for (let index = 0; index < formData.items.length; index += 1) {
      const item = formData.items[index];

      if (!item.productId) {
        return `Product is required for item ${index + 1}.`;
      }

      if (!item.description?.trim()) {
        return `Description is required for item ${index + 1}.`;
      }

      if (Number(item.quantity) <= 0) {
        return `Quantity must be greater than 0 for item ${index + 1}.`;
      }

      if (Number(item.agreedUnitPrice) < 0) {
        return `Unit price cannot be negative for item ${index + 1}.`;
      }
    }

    if (Number(formData.laborCost) < 0) {
      return "Labor cost cannot be negative.";
    }

    if (Number(formData.otherDirectCosts) < 0) {
      return "Other direct costs cannot be negative.";
    }

    return "";
  };

  // =========================
  // SUBMIT
  // =========================
  const handleSubmit = async (event) => {
    event.preventDefault();

    if (submitting) {
      return;
    }

    const validationError = validateForm();

    if (validationError) {
      setError(validationError);
      return;
    }

    setError("");

    const payload = {
      customerId: formData.customerId,

      ...(formData.quotationId
        ? {
            quotationId: formData.quotationId,
          }
        : {}),

      poDate: formData.poDate,

      status: formData.status,

      items: formData.items.map((item) => ({
        productId: item.productId,
        description: item.description.trim(),
        quantity: Number(item.quantity),
        agreedUnitPrice: Number(item.agreedUnitPrice),
      })),

      laborCost: Number(formData.laborCost || 0),

      otherDirectCosts: Number(formData.otherDirectCosts || 0),
    };

    await onSubmit(payload);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 backdrop-blur-sm">
      <div className="flex max-h-[95vh] w-full max-w-6xl flex-col overflow-hidden rounded-2xl bg-white shadow-2xl dark:bg-slate-900">
        {/* =========================
            HEADER
        ========================= */}
        <div className="flex items-center justify-between border-b border-slate-200 px-6 py-5 dark:border-slate-800">
          <div>
            <h2 className="text-xl font-bold text-slate-900 dark:text-slate-100">
              {isEditing
                ? "Edit Client Purchase Order"
                : "New Client Purchase Order"}
            </h2>

            <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
              {isEditing
                ? "Update the customer purchase order."
                : "Create a customer purchase order."}
            </p>
          </div>

          <button
            type="button"
            onClick={onClose}
            disabled={submitting}
            className="flex h-9 w-9 items-center justify-center rounded-lg text-slate-400 transition hover:bg-slate-100 hover:text-slate-700 disabled:cursor-not-allowed disabled:opacity-50 dark:hover:bg-slate-800 dark:hover:text-slate-200"
            aria-label="Close"
          >
            <FaTimes />
          </button>
        </div>

        {/* =========================
            BODY
        ========================= */}
        <form onSubmit={handleSubmit} className="flex min-h-0 flex-1 flex-col">
          <div className="flex-1 space-y-6 overflow-y-auto p-6">
            {/* ERROR */}
            {error && (
              <div className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700 dark:border-red-900/50 dark:bg-red-950/30 dark:text-red-400">
                {error}
              </div>
            )}

            {/* =========================
                BASIC INFORMATION
            ========================= */}
            <div className="rounded-xl border border-slate-200 bg-slate-50 p-5 dark:border-slate-800 dark:bg-slate-950/40">
              <div className="mb-4">
                <h3 className="font-semibold text-slate-900 dark:text-slate-100">
                  Purchase Order Details
                </h3>

                <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
                  Customer, PO date and order status.
                </p>
              </div>

              <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
                {/* CUSTOMER */}
                <div>
                  <label className="mb-1.5 block text-sm font-medium text-slate-700 dark:text-slate-300">
                    Customer <span className="text-red-500">*</span>
                  </label>

                  <select
                    name="customerId"
                    value={formData.customerId}
                    onChange={handleChange}
                    disabled={submitting || loadingReferences}
                    className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2.5 text-sm text-slate-900 outline-none transition focus:border-green-500 focus:ring-2 focus:ring-green-500/10 disabled:cursor-not-allowed disabled:bg-slate-100 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-100 dark:disabled:bg-slate-800"
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
                </div>

                {/* PO DATE */}
                <div>
                  <label className="mb-1.5 block text-sm font-medium text-slate-700 dark:text-slate-300">
                    PO Date <span className="text-red-500">*</span>
                  </label>

                  <input
                    type="date"
                    name="poDate"
                    value={formData.poDate}
                    onChange={handleChange}
                    disabled={submitting}
                    className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2.5 text-sm text-slate-900 outline-none transition focus:border-green-500 focus:ring-2 focus:ring-green-500/10 disabled:cursor-not-allowed disabled:bg-slate-100 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-100 dark:disabled:bg-slate-800"
                  />
                </div>

                {/* STATUS */}
                <div>
                  <label className="mb-1.5 block text-sm font-medium text-slate-700 dark:text-slate-300">
                    Status
                  </label>

                  <select
                    name="status"
                    value={formData.status}
                    onChange={handleChange}
                    disabled={submitting || !isEditing}
                    className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2.5 text-sm text-slate-900 outline-none transition focus:border-green-500 focus:ring-2 focus:ring-green-500/10 disabled:cursor-not-allowed disabled:bg-slate-100 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-100 dark:disabled:bg-slate-800"
                  >
                    <option value="draft">Draft</option>

                    <option value="received">Received</option>

                    <option value="fulfilled">Fulfilled</option>

                    <option value="cancelled">Cancelled</option>
                  </select>

                  {!isEditing && (
                    <p className="mt-1.5 text-xs text-slate-500 dark:text-slate-400">
                      New Client POs start as Draft.
                    </p>
                  )}
                </div>
              </div>

              {/* QUOTATION */}
              <div className="mt-4">
                <label className="mb-1.5 block text-sm font-medium text-slate-700 dark:text-slate-300">
                  Source Quotation{" "}
                  <span className="font-normal text-slate-400">(Optional)</span>
                </label>

                <select
                  name="quotationId"
                  value={formData.quotationId}
                  onChange={(event) =>
                    handleQuotationChange(event.target.value)
                  }
                  disabled={
                    submitting || !formData.customerId || loadingQuotation
                  }
                  className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2.5 text-sm text-slate-900 outline-none transition focus:border-green-500 focus:ring-2 focus:ring-green-500/10 disabled:cursor-not-allowed disabled:bg-slate-100 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-100 dark:disabled:bg-slate-800"
                >
                  <option value="">No quotation</option>

                  {availableQuotations.map((quotation) => (
                    <option key={quotation._id} value={quotation._id}>
                      {quotation.quotationNumber}
                      {" — "}
                      {quotation.customerId?.name || "Customer"}
                    </option>
                  ))}
                </select>

                <p className="mt-1.5 text-xs text-slate-500 dark:text-slate-400">
                  Only accepted quotations for the selected customer are
                  available.
                </p>
              </div>
            </div>

            {/* =========================
                ITEMS
            ========================= */}
            <div className="rounded-xl border border-slate-200 bg-white dark:border-slate-800 dark:bg-slate-900">
              <div className="flex flex-col gap-3 border-b border-slate-200 p-5 sm:flex-row sm:items-center sm:justify-between dark:border-slate-800">
                <div>
                  <h3 className="font-semibold text-slate-900 dark:text-slate-100">
                    Items
                  </h3>

                  <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
                    Add the products included in this Client PO.
                  </p>
                </div>

                <button
                  type="button"
                  onClick={addItem}
                  disabled={submitting || loadingReferences}
                  className="inline-flex items-center justify-center gap-2 rounded-lg bg-green-600 px-3.5 py-2 text-sm font-semibold text-white transition hover:bg-green-700 disabled:cursor-not-allowed disabled:opacity-50"
                >
                  <FaPlus className="h-3 w-3" />
                  Add Item
                </button>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full min-w-[900px] text-left text-sm">
                  <thead className="bg-slate-50 text-xs uppercase text-slate-500 dark:bg-slate-800/50 dark:text-slate-400">
                    <tr>
                      <th className="px-5 py-3 font-semibold">Product</th>

                      <th className="px-5 py-3 font-semibold">Description</th>

                      <th className="w-28 px-5 py-3 font-semibold">Qty</th>

                      <th className="w-40 px-5 py-3 text-right font-semibold">
                        Unit Price
                      </th>

                      <th className="w-40 px-5 py-3 text-right font-semibold">
                        Total
                      </th>

                      <th className="w-16 px-5 py-3 text-right font-semibold">
                        <span className="sr-only">Actions</span>
                      </th>
                    </tr>
                  </thead>

                  <tbody>
                    {formData.items.map((item, index) => {
                      const selectedProduct = products.find(
                        (product) => product._id === item.productId,
                      );

                      const unitCode =
                        selectedProduct?.unitId?.code ||
                        selectedProduct?.unit ||
                        "—";

                      return (
                        <tr
                          key={index}
                          className="border-t border-slate-100 dark:border-slate-800"
                        >
                          {/* PRODUCT */}
                          <td className="px-5 py-4 align-top">
                            <select
                              value={item.productId}
                              onChange={(event) =>
                                handleProductChange(index, event.target.value)
                              }
                              disabled={submitting || loadingReferences}
                              className="w-full min-w-[260px] rounded-lg border border-slate-200 bg-slate-50 px-3 py-2.5 text-sm text-slate-900 outline-none transition focus:border-green-500 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-100"
                            >
                              <option value="">Select product</option>

                              {products.map((product) => (
                                <option key={product._id} value={product._id}>
                                  {product.sku
                                    ? `${product.sku} — ${product.name}`
                                    : product.name}
                                </option>
                              ))}
                            </select>

                            {selectedProduct && (
                              <p className="mt-1.5 text-xs text-slate-500 dark:text-slate-400">
                                UOM:{" "}
                                <span className="font-medium">{unitCode}</span>
                              </p>
                            )}
                          </td>

                          {/* DESCRIPTION */}
                          <td className="px-5 py-4 align-top">
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
                              disabled={submitting}
                              placeholder="Item description"
                              className="w-full min-w-[220px] rounded-lg border border-slate-200 bg-slate-50 px-3 py-2.5 text-sm text-slate-900 outline-none transition focus:border-green-500 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-100"
                            />
                          </td>

                       {/* QUANTITY */}
<td className="px-5 py-4 align-top">
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
    disabled={submitting}
    className="w-full rounded-lg border border-slate-200 bg-slate-50 px-3 py-2.5 text-right text-sm text-slate-900 outline-none transition focus:border-green-500 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-100"
  />
</td>

                          {/* UNIT PRICE */}
                          <td className="px-5 py-4 align-top">
                            <input
                              type="number"
                              min="0"
                              step="0.01"
                              value={item.agreedUnitPrice}
                              onChange={(event) =>
                                handleItemChange(
                                  index,
                                  "agreedUnitPrice",
                                  event.target.value,
                                )
                              }
                              disabled={submitting}
                              className="w-full rounded-lg border border-slate-200 bg-slate-50 px-3 py-2.5 text-right text-sm text-slate-900 outline-none transition focus:border-green-500 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-100"
                            />
                          </td>

                          {/* TOTAL */}
                          <td className="px-5 py-4 text-right align-top font-semibold text-slate-900 dark:text-slate-100">
                            {formatCurrency(
                              getItemTotal(item),
                              settings?.currency,
                            )}
                          </td>

                          {/* REMOVE */}
                          <td className="px-5 py-4 text-right align-top">
                            <button
                              type="button"
                              onClick={() => removeItem(index)}
                              disabled={
                                submitting || formData.items.length === 1
                              }
                              className="flex h-8 w-8 items-center justify-center rounded-lg text-red-500 transition hover:bg-red-50 hover:text-red-700 disabled:cursor-not-allowed disabled:opacity-30 dark:text-red-400 dark:hover:bg-red-950/30"
                              aria-label={`Remove item ${index + 1}`}
                            >
                              <FaTrash className="h-3.5 w-3.5" />
                            </button>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>

            {/* =========================
                COMMERCIAL COSTS
            ========================= */}
            <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
              <div className="rounded-xl border border-slate-200 bg-slate-50 p-5 dark:border-slate-800 dark:bg-slate-950/40">
                <h3 className="font-semibold text-slate-900 dark:text-slate-100">
                  Additional Costs
                </h3>

                <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
                  Optional commercial costs included in the Client PO.
                </p>

                <div className="mt-4 space-y-4">
                  <div>
                    <label className="mb-1.5 block text-sm font-medium text-slate-700 dark:text-slate-300">
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
                      className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2.5 text-sm text-slate-900 outline-none transition focus:border-green-500 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-100"
                    />
                  </div>

                  <div>
                    <label className="mb-1.5 block text-sm font-medium text-slate-700 dark:text-slate-300">
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
                      className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2.5 text-sm text-slate-900 outline-none transition focus:border-green-500 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-100"
                    />
                  </div>
                </div>
              </div>

              {/* =========================
                  TOTALS
              ========================= */}
              <div className="rounded-xl border border-slate-200 bg-white p-5 dark:border-slate-800 dark:bg-slate-900">
                <h3 className="font-semibold text-slate-900 dark:text-slate-100">
                  Order Summary
                </h3>

                <div className="mt-4 space-y-3">
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-slate-500 dark:text-slate-400">
                      Items Subtotal
                    </span>

                    <span className="font-medium text-slate-900 dark:text-slate-100">
                      {formatCurrency(subtotal, settings?.currency)}
                    </span>
                  </div>

                  <div className="flex items-center justify-between text-sm">
                    <span className="text-slate-500 dark:text-slate-400">
                      Labor
                    </span>

                    <span className="font-medium text-slate-900 dark:text-slate-100">
                      {formatCurrency(laborCost, settings?.currency)}
                    </span>
                  </div>

                  <div className="flex items-center justify-between text-sm">
                    <span className="text-slate-500 dark:text-slate-400">
                      Other Direct Costs
                    </span>

                    <span className="font-medium text-slate-900 dark:text-slate-100">
                      {formatCurrency(otherDirectCosts, settings?.currency)}
                    </span>
                  </div>

                  <div className="my-3 border-t border-slate-200 dark:border-slate-800" />

                  <div className="flex items-center justify-between">
                    <span className="text-base font-semibold text-slate-900 dark:text-slate-100">
                      Total
                    </span>

                    <span className="text-xl font-bold text-green-600 dark:text-green-400">
                      {formatCurrency(estimatedTotal, settings?.currency)}
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* BACKEND NOTE */}
            <div className="rounded-lg border border-blue-200 bg-blue-50 px-4 py-3 text-xs text-blue-700 dark:border-blue-900/50 dark:bg-blue-950/30 dark:text-blue-300">
              Product unit information is taken from the selected product and
              finalized by the backend. Client PO totals are also recalculated
              by the backend before saving.
            </div>
          </div>

          {/* =========================
              FOOTER
          ========================= */}
          <div className="flex flex-col-reverse gap-3 border-t border-slate-200 bg-white px-6 py-4 sm:flex-row sm:items-center sm:justify-end dark:border-slate-800 dark:bg-slate-900">
            <button
              type="button"
              onClick={onClose}
              disabled={submitting}
              className="rounded-lg border border-slate-200 px-4 py-2.5 text-sm font-semibold text-slate-700 transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-50 dark:border-slate-700 dark:text-slate-300 dark:hover:bg-slate-800"
            >
              Cancel
            </button>

            <button
              type="submit"
              disabled={submitting || loadingReferences}
              className="rounded-lg bg-green-600 px-5 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-green-700 disabled:cursor-not-allowed disabled:opacity-50"
            >
              {submitting
                ? "Saving..."
                : isEditing
                  ? "Update Client PO"
                  : "Create Client PO"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default ClientPOForm;

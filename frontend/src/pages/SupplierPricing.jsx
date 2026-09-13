import { useEffect, useMemo, useState } from "react";
import { FaEdit, FaTrash } from "react-icons/fa";
import { useSearchParams } from "react-router-dom";

import supplierPricingService from "../services/supplierPricingService";
import supplierService from "../services/supplierService";
import productService from "../services/productService";

import SupplierPricingForm from "../components/supplierPricing/SupplierPricingForm";
import Toast from "../components/common/Toast";
import ConfirmModal from "../components/ui/ConfirmModal";
import Button from "../components/ui/Button";
import Spinner from "../components/ui/Spinner";

import { useSettings } from "../context/SettingsContext";
import { formatCurrency } from "../utils/currency";

function SupplierPricing() {
  const [searchParams] = useSearchParams();
  const { settings } = useSettings();

  const [supplierPricings, setSupplierPricings] = useState([]);
  const [suppliers, setSuppliers] = useState([]);
  const [products, setProducts] = useState([]);

  const [loading, setLoading] = useState(true);
  const [formLoading, setFormLoading] = useState(false);
  const [deleting, setDeleting] = useState(false);

  const [searchTerm, setSearchTerm] = useState(
    searchParams.get("search") || "",
  );

  const [selectedSupplier, setSelectedSupplier] = useState("all");
  const [selectedStatus, setSelectedStatus] = useState("all");

  const [showForm, setShowForm] = useState(false);
  const [editingSupplierPricing, setEditingSupplierPricing] =
    useState(null);

  const [deletingSupplierPricing, setDeletingSupplierPricing] =
    useState(null);

  const [toast, setToast] = useState({
    type: "success",
    message: "",
  });

  const loadData = async () => {
    const [
      pricingResponse,
      suppliersResponse,
      productsResponse,
    ] = await Promise.all([
      supplierPricingService.getSupplierPricings(),
      supplierService.getSuppliers(),
      productService.getProducts(),
    ]);

    setSupplierPricings(
      pricingResponse.supplierPricings ||
        pricingResponse.data ||
        [],
    );

    setSuppliers(
      suppliersResponse.suppliers ||
        suppliersResponse.data ||
        [],
    );

    setProducts(
      productsResponse.products ||
        productsResponse.data ||
        [],
    );
  };

  useEffect(() => {
    const initialize = async () => {
      try {
        await loadData();
      } catch (error) {
        console.error(
          "Failed to load supplier pricing:",
          error,
        );

        setToast({
          type: "error",
          message:
            error.response?.data?.message ||
            "Failed to load supplier pricing.",
        });
      } finally {
        setLoading(false);
      }
    };

    initialize();
  }, []);

  useEffect(() => {
    if (!toast.message) {
      return;
    }

    const timer = setTimeout(() => {
      setToast({
        type: "success",
        message: "",
      });
    }, 3000);

    return () => clearTimeout(timer);
  }, [toast]);

  const handleCreate = async (formData) => {
    try {
      setFormLoading(true);

      await supplierPricingService.createSupplierPricing(
        formData,
      );

      await loadData();

      setShowForm(false);

      setToast({
        type: "success",
        message: "Supplier pricing created successfully.",
      });
    } catch (error) {
      console.error(
        "Failed to create supplier pricing:",
        error,
      );

      setToast({
        type: "error",
        message:
          error.response?.data?.message ||
          "Failed to create supplier pricing.",
      });
    } finally {
      setFormLoading(false);
    }
  };

  const handleUpdate = async (formData) => {
    if (!editingSupplierPricing) {
      return;
    }

    try {
      setFormLoading(true);

      await supplierPricingService.updateSupplierPricing(
        editingSupplierPricing._id,
        formData,
      );

      await loadData();

      setEditingSupplierPricing(null);
      setShowForm(false);

      setToast({
        type: "success",
        message: "Supplier pricing updated successfully.",
      });
    } catch (error) {
      console.error(
        "Failed to update supplier pricing:",
        error,
      );

      setToast({
        type: "error",
        message:
          error.response?.data?.message ||
          "Failed to update supplier pricing.",
      });
    } finally {
      setFormLoading(false);
    }
  };

  const handleDelete = (supplierPricing) => {
    setDeletingSupplierPricing(supplierPricing);
  };

  const handleConfirmDelete = async () => {
    if (!deletingSupplierPricing) {
      return;
    }

    try {
      setDeleting(true);

      await supplierPricingService.deleteSupplierPricing(
        deletingSupplierPricing._id,
      );

      await loadData();

      setDeletingSupplierPricing(null);

      setToast({
        type: "success",
        message: "Supplier pricing deleted successfully.",
      });
    } catch (error) {
      console.error(
        "Failed to delete supplier pricing:",
        error,
      );

      setToast({
        type: "error",
        message:
          error.response?.data?.message ||
          "Failed to delete supplier pricing.",
      });
    } finally {
      setDeleting(false);
    }
  };

  const handleCancelDelete = () => {
    if (deleting) {
      return;
    }

    setDeletingSupplierPricing(null);
  };

  const openCreateForm = () => {
    setEditingSupplierPricing(null);
    setShowForm(true);
  };

  const openEditForm = (supplierPricing) => {
    setEditingSupplierPricing(supplierPricing);
    setShowForm(true);
  };

  const closeForm = () => {
    if (formLoading) {
      return;
    }

    setShowForm(false);
    setEditingSupplierPricing(null);
  };

  const closeToast = () => {
    setToast({
      type: "success",
      message: "",
    });
  };

  const supplierFilterOptions = useMemo(() => {
    return suppliers
      .map((supplier) => ({
        value: supplier._id,
        label: supplier.name,
      }))
      .sort((a, b) =>
        a.label.localeCompare(b.label),
      );
  }, [suppliers]);

  const filteredSupplierPricings = useMemo(() => {
    const search = searchTerm.toLowerCase().trim();

    return supplierPricings.filter((pricing) => {
      const supplier = pricing.supplierId;
      const product = pricing.productId;

      const supplierName =
        typeof supplier === "object"
          ? supplier?.name || ""
          : "";

      const supplierCode =
        typeof supplier === "object"
          ? supplier?.supplierCode || ""
          : "";

      const productName =
        typeof product === "object"
          ? product?.name || ""
          : "";

      const productSku =
        typeof product === "object"
          ? product?.sku || ""
          : "";

      const matchesSearch =
        supplierName.toLowerCase().includes(search) ||
        supplierCode.toLowerCase().includes(search) ||
        productName.toLowerCase().includes(search) ||
        productSku.toLowerCase().includes(search);

      const supplierId =
        typeof supplier === "object"
          ? supplier?._id
          : supplier;

      const matchesSupplier =
        selectedSupplier === "all" ||
        supplierId === selectedSupplier;

      const matchesStatus =
        selectedStatus === "all" ||
        pricing.status === selectedStatus;

      return (
        matchesSearch &&
        matchesSupplier &&
        matchesStatus
      );
    });
  }, [
    supplierPricings,
    searchTerm,
    selectedSupplier,
    selectedStatus,
  ]);

  return (
    <>
      <Toast
        type={toast.type}
        message={toast.message}
        onClose={closeToast}
      />

      <ConfirmModal
        isOpen={!!deletingSupplierPricing}
        onClose={handleCancelDelete}
        onConfirm={handleConfirmDelete}
        title="Delete Supplier Pricing"
        message={`Are you sure you want to delete this pricing for "${
          deletingSupplierPricing?.productId?.name ||
          "this product"
        }"? This action cannot be undone.`}
        confirmText="Delete"
        cancelText="Cancel"
        loading={deleting}
      />

      <div className="space-y-6">
        {/* Page Header */}
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="text-2xl font-bold text-slate-900 dark:text-slate-100">
              Supplier Pricing
            </h1>

            <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
              Manage supplier-specific product costs.
            </p>
          </div>

          <Button
            type="button"
            onClick={openCreateForm}
          >
            + Add Pricing
          </Button>
        </div>

        {/* Filters */}
        <div className="flex flex-col gap-3 rounded-xl border border-slate-200 bg-white p-4 shadow-sm dark:border-slate-800 dark:bg-slate-900 md:flex-row">
          <input
            type="search"
            placeholder="Search supplier, product, or SKU..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="min-h-11 flex-1 rounded-lg border border-slate-300 bg-white px-4 py-2.5 text-base text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-green-500 focus:ring-2 focus:ring-green-100 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-100 dark:placeholder:text-slate-500 dark:focus:ring-green-950"
          />

          <select
            value={selectedSupplier}
            onChange={(e) =>
              setSelectedSupplier(e.target.value)
            }
            className="min-h-11 rounded-lg border border-slate-300 bg-white px-4 py-2.5 text-base text-slate-700 outline-none focus:border-green-500 focus:ring-2 focus:ring-green-100 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-300 dark:focus:ring-green-950"
          >
            <option value="all">
              All Suppliers
            </option>

            {supplierFilterOptions.map((supplier) => (
              <option
                key={supplier.value}
                value={supplier.value}
              >
                {supplier.label}
              </option>
            ))}
          </select>

          <select
            value={selectedStatus}
            onChange={(e) =>
              setSelectedStatus(e.target.value)
            }
            className="min-h-11 rounded-lg border border-slate-300 bg-white px-4 py-2.5 text-base text-slate-700 outline-none focus:border-green-500 focus:ring-2 focus:ring-green-100 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-300 dark:focus:ring-green-950"
          >
            <option value="all">All Status</option>
            <option value="active">Active</option>
            <option value="inactive">Inactive</option>
          </select>
        </div>

        {/* Table */}
        <div className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm dark:border-slate-800 dark:bg-slate-900">
          <div className="overflow-x-auto">
            <table className="w-full min-w-[1000px] text-left text-sm">
              <thead className="bg-slate-50 text-xs uppercase text-slate-500 dark:bg-slate-800/50 dark:text-slate-400">
                <tr>
                  <th className="px-6 py-3 font-semibold">
                    Supplier
                  </th>

                  <th className="px-6 py-3 font-semibold">
                    Product
                  </th>

                  <th className="px-6 py-3 font-semibold">
                    SKU
                  </th>

                  <th className="px-6 py-3 font-semibold">
                    Unit Cost
                  </th>

                  <th className="px-6 py-3 font-semibold">
                    Effective From
                  </th>

                  <th className="px-6 py-3 font-semibold">
                    Status
                  </th>

                  <th className="px-6 py-3 text-right font-semibold">
                    Actions
                  </th>
                </tr>
              </thead>

              <tbody>
                {loading ? (
                  <tr>
                    <td
                      colSpan="7"
                      className="px-6 py-12"
                    >
                      <div className="flex justify-center">
                        <Spinner size="md" />
                      </div>
                    </td>
                  </tr>
                ) : filteredSupplierPricings.length === 0 ? (
                  <tr>
                    <td
                      colSpan="7"
                      className="px-6 py-12 text-center text-sm text-slate-500 dark:text-slate-400"
                    >
                      No supplier pricing found.
                    </td>
                  </tr>
                ) : (
                  [...filteredSupplierPricings]
                    .sort(
                      (a, b) =>
                        new Date(b.createdAt || 0) -
                        new Date(a.createdAt || 0),
                    )
                    .map((pricing) => {
                      const supplier =
                        pricing.supplierId;

                      const product =
                        pricing.productId;

                      return (
                        <tr
                          key={pricing._id}
                          className="border-t border-slate-100 dark:border-slate-800"
                        >
                          {/* Supplier */}
                          <td className="px-6 py-4">
                            <div>
                              <p className="font-medium text-slate-900 dark:text-slate-100">
                                {supplier?.name || "—"}
                              </p>

                              <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
                                {supplier?.supplierCode ||
                                  "—"}
                              </p>
                            </div>
                          </td>

                          {/* Product */}
                          <td className="px-6 py-4">
                            <p className="font-medium text-slate-900 dark:text-slate-100">
                              {product?.name || "—"}
                            </p>
                          </td>

                          {/* SKU */}
                          <td className="px-6 py-4 text-slate-600 dark:text-slate-400">
                            {product?.sku || "—"}
                          </td>

                          {/* Unit Cost */}
                          <td className="px-6 py-4 font-medium text-slate-900 dark:text-slate-100">
                            {formatCurrency(
                              pricing.unitCost ?? 0,
                              settings?.currency,
                            )}
                          </td>

                          {/* Effective From */}
                          <td className="px-6 py-4 text-slate-600 dark:text-slate-400">
                            {pricing.effectiveFrom
                              ? new Date(
                                  pricing.effectiveFrom,
                                ).toLocaleDateString(
                                  "en-PH",
                                  {
                                    year: "numeric",
                                    month: "short",
                                    day: "numeric",
                                  },
                                )
                              : "—"}
                          </td>

                          {/* Status */}
                          <td className="px-6 py-4">
                            <span
                              className={`inline-flex rounded-full px-2.5 py-1 text-xs font-medium ${
                                pricing.status ===
                                "active"
                                  ? "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400"
                                  : "bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-400"
                              }`}
                            >
                              {pricing.status ===
                              "active"
                                ? "Active"
                                : "Inactive"}
                            </span>
                          </td>

                          {/* Actions */}
                          <td className="px-6 py-4 text-right">
                            <div className="flex justify-end gap-2">
                              <button
                                type="button"
                                onClick={() =>
                                  openEditForm(
                                    pricing,
                                  )
                                }
                                className="flex h-8 w-8 items-center justify-center rounded-lg text-slate-500 transition hover:bg-slate-100 hover:text-slate-900 dark:text-slate-400 dark:hover:bg-slate-800 dark:hover:text-slate-100"
                                aria-label={`Edit pricing for ${
                                  product?.name ||
                                  "product"
                                }`}
                              >
                                <FaEdit className="h-3.5 w-3.5" />
                              </button>

                              <button
                                type="button"
                                onClick={() =>
                                  handleDelete(
                                    pricing,
                                  )
                                }
                                className="flex h-8 w-8 items-center justify-center rounded-lg text-red-500 transition hover:bg-red-50 hover:text-red-700 dark:text-red-400 dark:hover:bg-red-950/30"
                                aria-label={`Delete pricing for ${
                                  product?.name ||
                                  "product"
                                }`}
                              >
                                <FaTrash className="h-3.5 w-3.5" />
                              </button>
                            </div>
                          </td>
                        </tr>
                      );
                    })
                )}
              </tbody>
            </table>
          </div>

          {/* Footer */}
          <div className="border-t border-slate-200 px-6 py-3 dark:border-slate-800">
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Showing {filteredSupplierPricings.length} of{" "}
              {supplierPricings.length} supplier pricing records
            </p>
          </div>
        </div>

        {/* Form */}
        {showForm && (
          <SupplierPricingForm
            supplierPricing={editingSupplierPricing}
            suppliers={suppliers}
            products={products}
            onSubmit={
              editingSupplierPricing
                ? handleUpdate
                : handleCreate
            }
            onClose={closeForm}
            submitting={formLoading}
          />
        )}
      </div>
    </>
  );
}

export default SupplierPricing;
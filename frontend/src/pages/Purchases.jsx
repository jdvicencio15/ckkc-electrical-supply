import { useEffect, useMemo, useState } from "react";
import { FaEdit, FaEye, FaPlus, FaRocket, FaTrash } from "react-icons/fa";

import purchaseService from "../services/purchaseService";
import productService from "../services/productService";
import supplierService from "../services/supplierService";
import clientPOService from "../services/clientPOService";

import PurchaseForm from "../components/purchases/PurchaseForm";
import Toast from "../components/common/Toast";
import { useAuth } from "../context/AuthContext";

function Purchases() {
  const { user } = useAuth();

  const [purchases, setPurchases] = useState([]);
  const [products, setProducts] = useState([]);
  const [suppliers, setSuppliers] = useState([]);
  const [clientPOs, setClientPOs] = useState([]);

  const [loading, setLoading] = useState(true);
  const [formLoading, setFormLoading] = useState(false);

  const [error, setError] = useState("");

  const [searchTerm, setSearchTerm] = useState("");
  const [selectedSupplier, setSelectedSupplier] = useState("all");
  const [selectedDate, setSelectedDate] = useState("");

  const [showForm, setShowForm] = useState(false);
  const [editingPurchase, setEditingPurchase] = useState(null);

  const [toast, setToast] = useState({
    type: "success",
    message: "",
  });

  const canManagePurchases =
    user?.role === "owner" ||
    user?.role === "admin" ||
    user?.role === "purchasing";

  const loadPurchases = async () => {
    const response = await purchaseService.getPurchases();

    setPurchases(response.purchases || []);
  };

  const loadProducts = async () => {
    const response = await productService.getProducts();

    setProducts(response.products || []);
  };

  const loadSuppliers = async () => {
    const response = await supplierService.getSuppliers();

    setSuppliers(response.suppliers || []);
  };

  const loadClientPOs = async () => {
    const response = await clientPOService.getClientPOs();

    setClientPOs(response.clientPOs || []);
  };

  useEffect(() => {
    const loadData = async () => {
      try {
        setError("");

        await Promise.all([
          loadPurchases(),
          loadProducts(),
          loadSuppliers(),
          loadClientPOs(),
        ]);
      } catch (error) {
        console.error("Failed to load purchases:", error);

        setError("Failed to load purchases.");
      } finally {
        setLoading(false);
      }
    };

    loadData();
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

  const filteredPurchases = useMemo(() => {
    const search = searchTerm.toLowerCase();

    return purchases.filter((purchase) => {
      const matchesSearch =
        purchase.purchaseNumber?.toLowerCase().includes(search) ||
        purchase.supplierId?.name?.toLowerCase().includes(search) ||
        purchase.supplierId?.supplierCode?.toLowerCase().includes(search);

      const matchesSupplier =
        selectedSupplier === "all" ||
        purchase.supplierId?._id === selectedSupplier;

      const matchesDate =
        !selectedDate ||
        (purchase.purchaseDate &&
          new Date(purchase.purchaseDate).toISOString().split("T")[0] ===
            selectedDate);

      return matchesSearch && matchesSupplier && matchesDate;
    });
  }, [purchases, searchTerm, selectedSupplier, selectedDate]);

  const handleCreate = async (formData) => {
    try {
      setFormLoading(true);
      setError("");

      await purchaseService.createPurchase(formData);

      await loadPurchases();

      setShowForm(false);

      setToast({
        type: "success",
        message: "Purchase created successfully.",
      });
    } catch (error) {
      console.error("Failed to create purchase:", error);

      setToast({
        type: "error",
        message: error.response?.data?.message || "Failed to create purchase.",
      });
    } finally {
      setFormLoading(false);
    }
  };

  const handleUpdate = async (formData) => {
    try {
      setFormLoading(true);
      setError("");

      await purchaseService.updatePurchase(editingPurchase._id, formData);

      await loadPurchases();

      setEditingPurchase(null);
      setShowForm(false);

      setToast({
        type: "success",
        message: "Purchase updated successfully.",
      });
    } catch (error) {
      console.error("Failed to update purchase:", error);

      setToast({
        type: "error",
        message: error.response?.data?.message || "Failed to update purchase.",
      });
    } finally {
      setFormLoading(false);
    }
  };

  const handleDelete = async (purchase) => {
    const confirmed = window.confirm(
      `Delete purchase "${purchase.purchaseNumber}"?`,
    );

    if (!confirmed) {
      return;
    }

    try {
      setError("");

      await purchaseService.deletePurchase(purchase._id);

      await loadPurchases();

      setToast({
        type: "success",
        message: "Purchase deleted successfully.",
      });
    } catch (error) {
      console.error("Failed to delete purchase:", error);

      setToast({
        type: "error",
        message: error.response?.data?.message || "Failed to delete purchase.",
      });
    }
  };

  const handleReceive = async (purchase) => {
    const confirmed = window.confirm(
      `Receive purchase "${purchase.purchaseNumber}"? This will add the items to inventory.`,
    );

    if (!confirmed) {
      return;
    }

    try {
      await purchaseService.receivePurchase(purchase._id);

      await loadPurchases();

      setToast({
        type: "success",
        message: "Purchase received successfully.",
      });
    } catch (error) {
      console.error("Failed to receive purchase:", error);

      setToast({
        type: "error",
        message: error.response?.data?.message || "Failed to receive purchase.",
      });
    }
  };

  const openCreateForm = () => {
    setEditingPurchase(null);
    setShowForm(true);
    setError("");
  };

  const openEditForm = (purchase) => {
    setEditingPurchase(purchase);
    setShowForm(true);
    setError("");
  };

  const closeForm = () => {
    if (formLoading) {
      return;
    }

    setShowForm(false);
    setEditingPurchase(null);
  };

  const closeToast = () => {
    setToast({
      type: "success",
      message: "",
    });
  };

  return (
    <>
      <Toast type={toast.type} message={toast.message} onClose={closeToast} />

      <div className="space-y-6">
        {/* Page Header */}
        <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
          <div>
            <h1 className="text-2xl font-bold text-slate-900 dark:text-slate-100">
              Purchases
            </h1>

            <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
              Track and manage your purchase transactions.
            </p>
          </div>

          {canManagePurchases && (
            <button
              type="button"
              onClick={openCreateForm}
              className="inline-flex items-center justify-center gap-2 rounded-lg bg-green-600 px-4 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-green-700"
            >
              <FaPlus className="h-3.5 w-3.5" />
              New Purchase
            </button>
          )}
        </div>

        {/* Error */}
        {error && (
          <div className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700 dark:border-red-900/50 dark:bg-red-950/30 dark:text-red-400">
            {error}
          </div>
        )}

        {/* Purchase Form */}
        {showForm && (
          <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900">
            <div className="mb-5">
              <h2 className="text-lg font-semibold text-slate-900 dark:text-slate-100">
                {editingPurchase ? "Edit Purchase" : "New Purchase"}
              </h2>

              <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
                {editingPurchase
                  ? "Update the purchase information."
                  : "Create a new purchase transaction."}
              </p>
            </div>

            <PurchaseForm
              suppliers={suppliers}
              products={products}
              clientPOs={clientPOs}
              purchase={editingPurchase}
              onSubmit={editingPurchase ? handleUpdate : handleCreate}
              onCancel={closeForm}
              submitting={formLoading}
            />
          </div>
        )}

        {/* Filters */}
        <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm dark:border-slate-800 dark:bg-slate-900">
          <div className="grid gap-3 md:grid-cols-3">
            <input
              type="search"
              value={searchTerm}
              onChange={(event) => setSearchTerm(event.target.value)}
              placeholder="Search purchase or supplier..."
              className="rounded-lg border border-slate-200 bg-slate-50 px-4 py-2.5 text-sm text-slate-900 outline-none transition focus:border-green-500 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-100"
            />

            <select
              value={selectedSupplier}
              onChange={(event) => setSelectedSupplier(event.target.value)}
              className="rounded-lg border border-slate-200 bg-slate-50 px-4 py-2.5 text-sm text-slate-700 outline-none focus:border-green-500 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-300"
            >
              <option value="all">All Suppliers</option>

              {suppliers.map((supplier) => (
                <option key={supplier._id} value={supplier._id}>
                  {supplier.supplierCode} - {supplier.name}
                </option>
              ))}
            </select>

            <input
              type="date"
              value={selectedDate}
              onChange={(event) => setSelectedDate(event.target.value)}
              className="rounded-lg border border-slate-200 bg-slate-50 px-4 py-2.5 text-sm text-slate-700 outline-none focus:border-green-500 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-300"
            />
          </div>
        </div>

        {/* Purchases Table */}
        <div className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm dark:border-slate-800 dark:bg-slate-900">
          {loading ? (
            <div className="px-6 py-12 text-center">
              <p className="text-sm text-slate-500 dark:text-slate-400">
                Loading purchases...
              </p>
            </div>
          ) : filteredPurchases.length === 0 ? (
            <div className="px-6 py-12 text-center">
              <p className="text-sm font-medium text-slate-700 dark:text-slate-300">
                No purchases found.
              </p>

              <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
                Try adjusting your search or filters.
              </p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full min-w-[900px] text-left text-sm">
                <thead className="bg-slate-50 text-xs uppercase text-slate-500 dark:bg-slate-800/50 dark:text-slate-400">
                  <tr>
                    <th className="px-6 py-3 font-semibold">Purchase No.</th>

                    <th className="px-6 py-3 font-semibold">Supplier</th>

                    <th className="px-6 py-3 font-semibold">Items</th>

                    <th className="px-6 py-3 font-semibold">Total</th>

                    <th className="px-6 py-3 font-semibold">Status</th>

                    <th className="px-6 py-3 font-semibold">Date</th>

                    {canManagePurchases && (
                      <th className="px-6 py-3 text-right font-semibold">
                        Actions
                      </th>
                    )}
                  </tr>
                </thead>

                <tbody>
                  {filteredPurchases.map((purchase) => (
                    <tr
                      key={purchase._id}
                      className="border-b border-slate-100 last:border-0 dark:border-slate-800"
                    >
                      <td className="px-6 py-4 font-medium text-slate-900 dark:text-slate-100">
                        {purchase.purchaseNumber}
                      </td>

                      <td className="px-6 py-4">
                        <p className="font-medium text-slate-900 dark:text-slate-100">
                          {purchase.supplierId?.name || "Unknown Supplier"}
                        </p>

                        {purchase.supplierId?.supplierCode && (
                          <p className="mt-0.5 text-xs text-slate-500 dark:text-slate-400">
                            {purchase.supplierId.supplierCode}
                          </p>
                        )}
                      </td>

                      <td className="px-6 py-4 text-slate-600 dark:text-slate-400">
                        {purchase.items?.length || 0}
                      </td>

                      <td className="px-6 py-4 font-semibold text-slate-900 dark:text-slate-100">
                        ₱
                        {Number(purchase.totalAmount || 0).toLocaleString(
                          "en-PH",
                          {
                            minimumFractionDigits: 2,
                            maximumFractionDigits: 2,
                          },
                        )}
                      </td>

                      <td className="px-6 py-4">
  <span
    className={`inline-flex rounded-full px-3 py-1 text-xs font-semibold ${
      purchase.status === "received"
        ? "bg-green-50 text-green-700 dark:bg-green-950/40 dark:text-green-400"
        : purchase.status === "cancelled"
          ? "bg-red-50 text-red-700 dark:bg-red-950/40 dark:text-red-400"
          : "bg-yellow-50 text-yellow-700 dark:bg-yellow-950/40 dark:text-yellow-400"
    }`}
  >
    {purchase.status
      ? purchase.status.charAt(0).toUpperCase() +
        purchase.status.slice(1)
      : "Draft"}
  </span>
</td>

                      <td className="px-6 py-4 text-slate-500 dark:text-slate-400">
                        {purchase.purchaseDate
                          ? new Date(purchase.purchaseDate).toLocaleDateString(
                              "en-PH",
                              {
                                year: "numeric",
                                month: "short",
                                day: "numeric",
                              },
                            )
                          : "—"}
                      </td>

                      {canManagePurchases && (
                        <td className="px-6 py-4 text-right">
                          <div className="flex justify-end gap-2">
                            {/* Edit */}
                            {(purchase.status || "draft") === "draft" && (
                              <button
                                type="button"
                                onClick={() => openEditForm(purchase)}
                                className="flex h-8 w-8 items-center justify-center rounded-lg text-slate-500 transition hover:bg-slate-100 hover:text-slate-900 dark:text-slate-400 dark:hover:bg-slate-800 dark:hover:text-slate-100"
                                aria-label={`Edit ${purchase.purchaseNumber}`}
                              >
                                <FaEdit className="h-3.5 w-3.5" />
                              </button>
                            )}

                            {/* Receive */}
                            {(purchase.status || "draft") === "draft"  && (
                              <button
                                type="button"
                                onClick={() => handleReceive(purchase)}
                                className="flex h-8 w-8 items-center justify-center rounded-lg text-green-600 transition hover:bg-green-50 hover:text-green-700 dark:text-green-400 dark:hover:bg-green-950/30"
                                aria-label={`Receive ${purchase.purchaseNumber}`}
                              >
                                <FaRocket className="h-3.5 w-3.5" />
                              </button>
                            )}

                            {/* Delete */}
                            {(purchase.status || "draft") === "draft"  && (
                              <button
                                type="button"
                                onClick={() => handleDelete(purchase)}
                                className="flex h-8 w-8 items-center justify-center rounded-lg text-red-500 transition hover:bg-red-50 hover:text-red-700 dark:text-red-400 dark:hover:bg-red-950/30"
                                aria-label={`Delete ${purchase.purchaseNumber}`}
                              >
                                <FaTrash className="h-3.5 w-3.5" />
                              </button>
                            )}


                          </div>
                        </td>
                      )}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          {/* Footer */}
          <div className="border-t border-slate-200 px-6 py-3 dark:border-slate-800">
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Showing {filteredPurchases.length}{" "}
              {filteredPurchases.length === 1 ? "purchase" : "purchases"}
            </p>
          </div>
        </div>
      </div>
    </>
  );
}

export default Purchases;
